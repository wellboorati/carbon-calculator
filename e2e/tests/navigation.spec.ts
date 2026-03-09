import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('Tips page loads with correct heading', async ({ page }) => {
    await page.goto('/tips');
    await expect(page.getByRole('heading', { name: 'How to Reduce Your Carbon Footprint' })).toBeVisible();
  });

  test('Tips page includes a Diet section', async ({ page }) => {
    await page.goto('/tips');
    await expect(page.getByRole('heading', { name: 'Diet', exact: true })).toBeVisible();
  });

  test('FAQ page loads with correct heading', async ({ page }) => {
    await page.goto('/faq');
    await expect(page.getByRole('heading', { name: 'Frequently Asked Questions' })).toBeVisible();
  });
});
