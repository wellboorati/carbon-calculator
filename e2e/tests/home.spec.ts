import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows the main heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Carbon Footprint Calculator' })).toBeVisible();
  });

  test('shows the four category cards', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Home Energy', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Transportation', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Flights', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Diet', exact: true })).toBeVisible();
  });

  test('Start Calculation button navigates to /calculator', async ({ page }) => {
    await page.getByRole('button', { name: 'Start Calculation' }).click();
    await expect(page).toHaveURL('/calculator');
  });
});
