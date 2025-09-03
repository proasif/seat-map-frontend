import type { Venue, SeatUpdate } from '../types';

// Apply a seat-status update to the venue structure immutably
export function applySeatUpdate(venue: Venue, update: SeatUpdate): Venue {
  return {
    ...venue,
    sections: venue.sections.map((section) => ({
      ...section,
      rows: section.rows.map((row) => ({
        ...row,
        seats: row.seats.map((seat) =>
          seat.id === update.id ? { ...seat, status: update.status } : seat,
        ),
      })),
    })),
  };
}
