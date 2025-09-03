import type { Venue, Section, Row, Seat } from '../types';

/**
 * Programmatically build a venue with a configurable number of seats without
 * requiring a huge JSON payload. Defaults to 150 seats (15 × 10) for easy
 * demoing, but supports scaling up to 15,000 seats by passing higher values.
 */
export function generateVenue(rows = 15, cols = 10): Venue {
  const seatSpacing = 30; // distance between seats in both axes
  const sections: Section[] = [
    {
      id: 'A',
      label: 'Lower Bowl A',
      transform: { x: 0, y: 0, scale: 1 },
      rows: Array.from({ length: rows }, (_, r) =>
        buildRow(r, cols, rows, seatSpacing),
      ),
    },
  ];

  return {
    venueId: 'arena-150',
    name: 'Metropolis Arena',
    map: { width: cols * seatSpacing + 100, height: rows * seatSpacing + 100 },
    sections,
  };
}

function buildRow(
  index: number,
  cols: number,
  totalRows: number,
  spacing: number,
): Row {
  const seats: Seat[] = Array.from({ length: cols }, (_, c) => ({
    id: `A-${index + 1}-${String(c + 1).padStart(3, '0')}`,
    col: c + 1,
    x: c * spacing + 50,
    y: index * spacing + 40,
    // Simple pricing tiers: front third premium, middle standard, rear value
    priceTier: index < totalRows / 3 ? 1 : index < (2 * totalRows) / 3 ? 2 : 3,
    status: 'available',
  }));

  return { index: index + 1, seats };
}

