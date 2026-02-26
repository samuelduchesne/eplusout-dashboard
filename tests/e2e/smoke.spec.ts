import { test, expect } from '@playwright/test';

test('dashboard shell loads', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('h1')).toContainText('EnergyPlus eplusout.sql Dashboard');
  await expect(page.locator('#btn-open')).toBeVisible();
});
