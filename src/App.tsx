import React, { useEffect, useMemo, useRef, useState } from 'react';
import { seatPrice } from './lib/pricing';
import { findAdjacentSeats } from './lib/adjacency';
import { applySeatUpdate } from './lib/updates';
import { generateVenue } from './lib/generateVenue';
import type { Venue, SelectionSummary, SeatUpdate } from './types';
import {
  TransformComponent,
  TransformWrapper,
  type ReactZoomPanPinchRef,
} from 'react-zoom-pan-pinch';

// Users can pick at most eight seats at once
const MAX_SELECTION = 8;

export default function App() {
  // Loaded venue information containing sections, rows and seats
  const [venue, setVenue] = useState<Venue | null>(null);
  // Persist selected seat IDs in localStorage so a refresh keeps them
  const [selectedIds, setSelectedIds] = usePersistedState<string[]>(
    'selection',
    [],
  );
  // The seat currently focused via mouse or keyboard
  const [active, setActive] = useState<SelectionSummary | null>(null);
  // When true, colour seats by tier instead of status
  const [heatMap, setHeatMap] = useState(false);
  // Light or dark theme preference, also persisted across sessions
  const [theme, setTheme] = usePersistedState<'light' | 'dark'>(
    'theme',
    'light',
  );
  // Number of seats to search for in the adjacency helper
  const [adjacentCount, setAdjacentCount] = useState(2);
  const [findError, setFindError] = useState('');
  // Reference to the zoom/pan wrapper so we can programmatically reset it
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  // Track seats that recently changed status for a flash animation
  const [updatedIds, setUpdatedIds] = useState<string[]>([]);

  // Generate a venue map on first render. Defaults to 150 seats but the
  // generator scales up to 15k without needing huge JSON payloads.
  useEffect(() => {
    setVenue(generateVenue());
  }, []);

  // Write the theme to a data attribute so CSS can react to it
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Connect to a WebSocket for live seat-status updates
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001');
    ws.onmessage = (e) => {
      try {
        const update: SeatUpdate = JSON.parse(e.data);
        setVenue((v) => (v ? applySeatUpdate(v, update) : v));
        // trigger a temporary flash animation on updated seats
        setUpdatedIds((ids) => [...ids, update.id]);
        setTimeout(
          () => setUpdatedIds((ids) => ids.filter((id) => id !== update.id)),
          1000,
        );
      } catch (err) {
        console.error('Bad seat update', err);
      }
    };
    return () => ws.close();
  }, []);

  // Flatten all seats into a single list for quick lookups later
  const seats = useMemo(() => {
    if (!venue) return [] as SelectionSummary[];
    const list: SelectionSummary[] = [];
    venue.sections.forEach((section) => {
      section.rows.forEach((row) => {
        row.seats.forEach((seat) => {
          list.push({ seat, section, row });
        });
      });
    });
    return list;
  }, [venue]);

  // Calculate the subtotal for the currently selected seats
  const total = selectedIds.reduce((sum, id) => {
    const s = seats.find((s) => s.seat.id === id);
    if (!s) return sum;
    return sum + seatPrice(s.seat.priceTier);
  }, 0);

  // Add or remove a seat from the selection respecting the limit
  const toggleSeat = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= MAX_SELECTION) return prev;
      return [...prev, id];
    });
  };

  // Common handler for click and keyboard activation
  const handleSeatEvent = (info: SelectionSummary) => {
    setActive(info);
    if (info.seat.status !== 'available') return;
    toggleSeat(info.seat.id);
  };

  // Triggered by the helper button to find N adjacent available seats
  const handleFindAdjacent = () => {
    if (!venue) return;
    const block = findAdjacentSeats(venue.sections, adjacentCount);
    if (!block) {
      setFindError(`No block of ${adjacentCount} seats found`);
      return;
    }
    setFindError('');
    setSelectedIds(block.map((b) => b.seat.id));
  };

  const handleResetView = () => {
    transformRef.current?.setTransform(0, 0, 1);
  };

  if (!venue) return <div>Loading...</div>;

  return (
    <div className="app">
      {/* Zoom and pan wrapper adds touch-friendly navigation */}
      <TransformWrapper
        ref={transformRef}
        wheel={{ step: 0.1 }}
        pinch={{ step: 0.1 }}
        doubleClick={{ disabled: true }}
      >
        <TransformComponent
          wrapperClass="map"
          wrapperStyle={{ width: '100%', height: '100%' }}
          contentStyle={{ width: '100%', height: '100%' }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${venue.map.width} ${venue.map.height}`}
          >
            {venue.sections.map((section) => (
              <g
                key={section.id}
                transform={`translate(${section.transform.x} ${section.transform.y}) scale(${section.transform.scale})`}
              >
                {section.rows.map((row) =>
                  row.seats.map((seat) => {
                    const info = { seat, section, row };
                    const isSelected = selectedIds.includes(seat.id);
                    return (
                      <circle
                        key={seat.id}
                        cx={seat.x}
                        cy={seat.y}
                        r={12}
                        className={`seat ${
                          heatMap ? `tier-${seat.priceTier}` : seat.status
                        } ${isSelected ? 'selected' : ''} ${
                          updatedIds.includes(seat.id) ? 'updated' : ''
                        }`}
                        tabIndex={0}
                        aria-label={`${section.label} row ${row.index} seat ${seat.col} ${seat.status}`}
                        onClick={() => handleSeatEvent(info)}
                        onFocus={() => setActive(info)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSeatEvent(info);
                          }
                        }}
                      />
                    );
                  }),
                )}
              </g>
            ))}
          </svg>
        </TransformComponent>
      </TransformWrapper>

      <aside className="sidebar">
        <h2>Seat Tools</h2>
        <div className="toolbar">
          {/* Toggle price-tier colouring */}
          <button onClick={() => setHeatMap((h) => !h)} className="heatmap-toggle">
            {heatMap ? 'Hide heat map' : 'Show heat map'}
          </button>
          {/* Light / dark theme switcher */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="theme-toggle"
          >
            {theme === 'light' ? 'Enable dark mode' : 'Disable dark mode'}
          </button>
          {/* Reset any zoom or pan on the map */}
          <button onClick={handleResetView} className="reset-view">
            Reset view
          </button>
        </div>
        <div className="adjacent-finder">
          <label>
            Find
            <input
              type="number"
              min={1}
              max={MAX_SELECTION}
              value={adjacentCount}
              onChange={(e) => setAdjacentCount(Number(e.target.value))}
            />
            adjacent seats
          </label>
          <button onClick={handleFindAdjacent}>Find</button>
          {findError && (
            <div role="status" className="find-error">
              {findError}
            </div>
          )}
        </div>
        <h2>Selected Seats ({selectedIds.length})</h2>
        <ul className="seat-list">
          {selectedIds.map((id) => {
            const s = seats.find((s) => s.seat.id === id);
            if (!s) return null;
            return (
              <li key={id}>
                {s.section.id} Row {s.row.index} Seat {s.seat.col} - $
                {seatPrice(s.seat.priceTier)}
              </li>
            );
          })}
        </ul>
        <div className="subtotal">Subtotal: ${total}</div>
        {active && (
          <div className="details">
            <h3>Seat details</h3>
            <div>
              Section {active.section.id} Row {active.row.index} Seat {active.seat.col}
            </div>
            <div>Status: {active.seat.status}</div>
            <div>Price: ${seatPrice(active.seat.priceTier)}</div>
          </div>
        )}
      </aside>
    </div>
  );
}

// Small helper to persist state values in localStorage
function usePersistedState<T>(
  key: string,
  initial: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore write errors (e.g. storage full or disabled)
    }
  }, [key, state]);

  return [state, setState];
}
