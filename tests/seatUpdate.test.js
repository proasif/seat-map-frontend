import test from 'node:test';
import assert from 'node:assert';

// minimal seat status update logic mirroring src/lib/updates.ts
function applySeatUpdate(venue, update) {
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

test('applySeatUpdate changes the seat status', () => {
  const venue = {
    venueId: 'v',
    name: 'demo',
    map: { width: 10, height: 10 },
    sections: [
      {
        id: 'A',
        label: 'A',
        transform: { x: 0, y: 0, scale: 1 },
        rows: [
          {
            index: 1,
            seats: [
              {
                id: 's1',
                col: 1,
                x: 0,
                y: 0,
                priceTier: 1,
                status: 'available',
              },
            ],
          },
        ],
      },
    ],
  };
  const updated = applySeatUpdate(venue, { id: 's1', status: 'sold' });
  assert.equal(updated.sections[0].rows[0].seats[0].status, 'sold');
});
