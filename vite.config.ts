import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Helper to convert time "06:00 PM" into minutes from midnight
function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(' ');
  if (parts.length < 2) return 0;
  const [hoursStr, minutesStr] = parts[0].split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10) || 0;
  const modifier = parts[1].toUpperCase();

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

// Check if two time ranges [startA, endA) and [startB, endB) overlap
function checkOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  const sA = timeToMinutes(startA);
  const eA = timeToMinutes(endA);
  const sB = timeToMinutes(startB);
  const eB = timeToMinutes(endB);

  return Math.max(sA, sB) < Math.min(eA, eB);
}

function gamehubBackendPlugin() {
  const dbDir = path.resolve(__dirname, 'data');
  const dbFile = path.resolve(dbDir, 'bookings.json');

  // Ensure database directory and file exist
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, JSON.stringify([], null, 2), 'utf-8');
  }

  const readBookings = () => {
    try {
      const data = fs.readFileSync(dbFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  };

  const writeBookings = (bookings: unknown[]) => {
    fs.writeFileSync(dbFile, JSON.stringify(bookings, null, 2), 'utf-8');
  };

  return {
    name: 'gamehub-backend-api',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);

        // 1. GET /api/bookings
        if (req.method === 'GET' && url.pathname === '/api/bookings') {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          return res.end(JSON.stringify(readBookings()));
        }

        // 2. GET /api/availability?venueId=...&resourceId=...&date=...
        if (req.method === 'GET' && url.pathname === '/api/availability') {
          const venueId = url.searchParams.get('venueId');
          const resourceId = url.searchParams.get('resourceId');
          const date = url.searchParams.get('date');

          const allBookings = readBookings();
          const activeBookings = allBookings.filter(
            (b: any) =>
              b.status === 'confirmed' &&
              b.venueId === venueId &&
              b.resourceId === resourceId &&
              b.date === date
          );

          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          return res.end(JSON.stringify({ activeBookings }));
        }

        // 3. POST /api/bookings (Create booking with BACKEND DOUBLE-BOOKING VALIDATION)
        if (req.method === 'POST' && url.pathname === '/api/bookings') {
          let body = '';
          req.on('data', (chunk: any) => {
            body += chunk;
          });

          req.on('end', () => {
            try {
              const newBooking = JSON.parse(body);
              const allBookings = readBookings();

              // BACKEND DOUBLE-BOOKING VALIDATION CHECK
              const conflictingBooking = allBookings.find((b: any) => {
                if (b.status !== 'confirmed') return false;
                if (b.venueId !== newBooking.venueId) return false;
                if (b.resourceId !== newBooking.resourceId) return false;
                if (b.date !== newBooking.date) return false;

                // Check overlap between [newBooking.startTime, newBooking.endTime) and [b.startTime, b.endTime)
                return checkOverlap(newBooking.startTime, newBooking.endTime, b.startTime, b.endTime);
              });

              if (conflictingBooking) {
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 409; // HTTP 409 Conflict
                return res.end(
                  JSON.stringify({
                    success: false,
                    error: 'DOUBLE_BOOKING_PREVENTED',
                    message: `Conflict Detected: This ${newBooking.resourceType || 'court/station'} is already reserved from ${conflictingBooking.startTime} to ${conflictingBooking.endTime} on ${newBooking.date}.`,
                    conflictingBookingId: conflictingBooking.id,
                  })
                );
              }

              // No conflict -> Append and persist booking
              allBookings.unshift(newBooking);
              writeBookings(allBookings);

              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 201; // HTTP 201 Created
              return res.end(JSON.stringify({ success: true, booking: newBooking }));
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 400;
              return res.end(JSON.stringify({ success: false, message: 'Invalid booking data payload' }));
            }
          });
          return;
        }

        // 4. POST /api/bookings/cancel
        if (req.method === 'POST' && url.pathname === '/api/bookings/cancel') {
          let body = '';
          req.on('data', (chunk: any) => {
            body += chunk;
          });

          req.on('end', () => {
            try {
              const { bookingId } = JSON.parse(body);
              const allBookings = readBookings();
              const target = allBookings.find((b: any) => b.id === bookingId);

              if (!target) {
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 404;
                return res.end(JSON.stringify({ success: false, message: 'Booking not found' }));
              }

              target.status = 'cancelled';
              writeBookings(allBookings);

              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              return res.end(JSON.stringify({ success: true, booking: target }));
            } catch {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 400;
              return res.end(JSON.stringify({ success: false, message: 'Invalid payload' }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), gamehubBackendPlugin()],
  server: {
    port: 3000,
    open: false,
    host: true,
  },
});
