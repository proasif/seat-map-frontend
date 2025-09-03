# Seat Map Frontend

Seat Map Frontend is a small demo app that paints an arena and lets people pick their seats. It uses React, TypeScript and Vite, loading seat coordinates from `public/venue.json` and drawing them as SVG circles. Seats can be chosen with a mouse or keyboard (up to eight at a time). A sidebar highlights the focused seat, lists chosen seats with a running total, and remembers the selection with `localStorage` so a refresh doesn’t lose your work. Focus styles and `aria-label`s keep the map usable for assistive-technology users, while a full‑width layout and seat animations make the interface easier to parse at a glance.

For scaling and mobile comfort the app keeps things light: seats are rendered directly to SVG, and `react-zoom-pan-pinch` supplies pinch‑zoom and panning on touch devices. A simple `usePersistedState` hook stores user choices, while a heat‑map toggle colours seats by price tier using values from `src/lib/pricing.ts`. Live seat‑status updates arrive via a native WebSocket connection (`ws://localhost:3001` by default); when a seat changes, it briefly flashes to draw attention. The interface is responsive and slides the sidebar over the map on narrow screens. ESLint and Prettier ensure the codebase stays tidy.

Playwright runs an end‑to‑end test that exercises seat selection, giving confidence the core flow works. Dark mode, a “find N adjacent seats” helper, live WebSocket updates and other touch‑friendly controls round out the feature set.

### Incomplete Features / TODOs

- Advanced seat suggestions or pricing rules remain unimplemented.

### Running the project

```
pnpm install
pnpm dev
```

### Running tests

```
pnpm test
pnpm test:e2e
```

### Linting and formatting

```
pnpm lint
pnpm format
```
