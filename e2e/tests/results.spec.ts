import { test, expect, type Page } from '@playwright/test';

async function goToResults(page: Page) {
  await page.goto('/calculator');
  await page.getByRole('button', { name: 'Skip' }).click(); // Housing
  await page.getByRole('button', { name: 'Skip' }).click(); // Transportation
  await page.getByRole('button', { name: 'Skip' }).click(); // Flights
  await page.getByRole('button', { name: 'Calculate' }).click();
  await page.waitForURL('/results');
}

test.describe('Results page', () => {
  test('shows total emissions and unit', async ({ page }) => {
    await goToResults(page);
    await expect(page.getByRole('heading', { name: 'Your Carbon Footprint' })).toBeVisible();
    await expect(page.getByText(/tCO₂e\/year/)).toBeVisible();
  });

  test('Recalculate button navigates back to calculator', async ({ page }) => {
    await goToResults(page);
    await page.getByRole('button', { name: 'Recalculate' }).click();
    await expect(page).toHaveURL('/calculator');
  });

  test('country comparison selector accepts a new country', async ({ page }) => {
    await goToResults(page);
    const selector = page.getByRole('combobox');
    await expect(selector).toBeVisible();
    await selector.fill('Brazil');
    await page.getByRole('option', { name: 'Brazil' }).click();
    await expect(selector).toHaveValue('Brazil');
  });

  test('Download PDF button is visible', async ({ page }) => {
    await goToResults(page);
    await expect(page.getByRole('button', { name: /Download PDF/i })).toBeVisible();
  });

  test('Copy result button is visible', async ({ page }) => {
    await goToResults(page);
    await expect(page.getByRole('button', { name: /Copy result/i })).toBeVisible();
  });
});
