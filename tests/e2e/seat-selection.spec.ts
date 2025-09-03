import { test, expect } from '@playwright/test';

// Basic smoke test to ensure a seat can be selected and reflected in the UI
test('selecting a seat updates summary', async ({ page }) => {
  await page.goto('/');
  const seat = page.locator('circle.seat.available').first();
  await seat.click();
  await expect(page.locator('.sidebar li')).toHaveCount(1);
  await expect(page.locator('.subtotal')).toContainText('$');
});
