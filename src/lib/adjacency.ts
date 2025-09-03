import type { Section, SelectionSummary, Seat } from '../types';

/**
 * Search each row in every section for the first block of `n` seats that are
 * side‑by‑side and available. When a block is found the seats are wrapped with
 * section/row metadata so the UI can highlight them. If no block exists the
 * function returns `null`.
 */
export function findAdjacentSeats(
  sections: Section[],
  n: number,
): SelectionSummary[] | null {
  for (const section of sections) {
    for (const row of section.rows) {
      // Ensure seats are processed left to right
      const seats = [...row.seats].sort((a, b) => a.col - b.col);
      for (let i = 0; i <= seats.length - n; i++) {
        const block: Seat[] = [];
        for (let j = 0; j < n; j++) {
          const seat = seats[i + j];
          if (seat.status !== 'available') break;
          if (j > 0 && seat.col !== seats[i + j - 1].col + 1) break;
          block.push(seat);
        }
        if (block.length === n) {
          return block.map((seat) => ({ seat, section, row }));
        }
      }
    }
  }
  return null;
}
