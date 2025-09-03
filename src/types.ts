// Possible lifecycle states for a seat in the map
export type SeatStatus = 'available' | 'reserved' | 'sold' | 'held';

// Structure of a real-time seat-status update over WebSocket
export interface SeatUpdate {
  id: string;
  status: SeatStatus;
}

// Individual seat information from the venue file
export interface Seat {
  id: string;
  col: number;
  x: number;
  y: number;
  priceTier: number;
  status: SeatStatus;
}

// A row groups seats and is used for adjacency checks
export interface Row {
  index: number;
  seats: Seat[];
}

// Each section has a transform applied to position it within the map
export interface Section {
  id: string;
  label: string;
  transform: { x: number; y: number; scale: number };
  rows: Row[];
}

// Top-level venue information loaded from the JSON file
export interface Venue {
  venueId: string;
  name: string;
  map: { width: number; height: number };
  sections: Section[];
}

// Convenience type when iterating all seats with their context
export interface SelectionSummary {
  seat: Seat;
  section: Section;
  row: Row;
}
