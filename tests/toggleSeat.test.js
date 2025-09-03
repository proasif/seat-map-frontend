import test from 'node:test';
import assert from 'node:assert';

// Minimal stand‑alone version of the seat toggle logic used in the UI
function toggleSeat(selected, id, limit = 8) {
  if (selected.includes(id)) return selected.filter((s) => s !== id);
  if (selected.length >= limit) return selected;
  return [...selected, id];
}

test('toggleSeat adds and removes', () => {
  // Selecting the same seat twice should add then remove it
  let sel = [];
  sel = toggleSeat(sel, 'A');
  assert.deepEqual(sel, ['A']);
  sel = toggleSeat(sel, 'A');
  assert.deepEqual(sel, []);
});

test('toggleSeat respects limit', () => {
  // Once the limit is reached, no additional seats are added
  let sel = ['1', '2', '3', '4', '5', '6', '7', '8'];
  sel = toggleSeat(sel, '9');
  assert.deepEqual(sel, ['1', '2', '3', '4', '5', '6', '7', '8']);
});
