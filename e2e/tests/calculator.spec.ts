import { test, expect } from '@playwright/test';

test.describe('Calculator flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculator');
  });

  test('Back button is disabled on step 1 and enabled after advancing', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Back' })).toBeDisabled();
    await page.getByRole('button', { name: 'Skip' }).click();
    await expect(page.getByRole('button', { name: 'Back' })).toBeEnabled();
  });

  test('skipping all steps including diet shows validation error', async ({ page }) => {
    for (let i = 0; i < 4; i++) {
      await page.getByRole('button', { name: 'Skip' }).click();
    }
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page).not.toHaveURL('/results');
  });

  test('housing input is sent to backend and appears in breakdown', async ({ page }) => {
    // Fill in 500 kWh/month electricity — expected: 500*12*0.386/1000 = 2.316 tCO₂e/yr
    await page.getByLabel('Monthly Consumption').fill('500');
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Skip' }).click(); // Transportation
    await page.getByRole('button', { name: 'Skip' }).click(); // Flights
    await page.getByRole('button', { name: 'Calculate' }).click();

    await expect(page).toHaveURL('/results');

    // Housing accordion shows ~2.32 tCO₂e/yr
    await expect(page.getByRole('button', { name: /Housing.*tCO₂e\/yr/ })).toBeVisible();
    // Diet accordion (plant baseline) also present
    await expect(page.getByRole('button', { name: /Diet.*tCO₂e\/yr/ })).toBeVisible();
  });

  test('housing breakdown accordion expands and shows entered consumption', async ({ page }) => {
    await page.getByLabel('Monthly Consumption').fill('500');
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Skip' }).click();
    await page.getByRole('button', { name: 'Skip' }).click();
    await page.getByRole('button', { name: 'Calculate' }).click();

    await expect(page).toHaveURL('/results');

    // Click the Housing accordion button to expand it
    await page.getByRole('button', { name: /Housing.*tCO₂e\/yr/ }).click();
    // Consumption detail should now be visible
    await expect(page.getByText('500 kWh')).toBeVisible();
  });

  test('skipping housing produces no Housing row in breakdown', async ({ page }) => {
    await page.getByRole('button', { name: 'Skip' }).click(); // Housing
    await page.getByRole('button', { name: 'Skip' }).click(); // Transportation
    await page.getByRole('button', { name: 'Skip' }).click(); // Flights
    await page.getByRole('button', { name: 'Calculate' }).click();

    await expect(page).toHaveURL('/results');

    // Diet baseline present, Housing absent from breakdown
    await expect(page.getByRole('button', { name: /Diet.*tCO₂e\/yr/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Housing.*tCO₂e\/yr/ })).not.toBeVisible();
  });

  test('diet slider affects the calculated result', async ({ page }) => {
    await page.getByRole('button', { name: 'Skip' }).click(); // Housing
    await page.getByRole('button', { name: 'Skip' }).click(); // Transportation
    await page.getByRole('button', { name: 'Skip' }).click(); // Flights

    // Beef/Lamb slider: press ArrowRight twice to set 2 servings/week
    const beefSlider = page.getByRole('slider').first();
    await beefSlider.focus();
    await beefSlider.press('ArrowRight');
    await beefSlider.press('ArrowRight');

    await page.getByRole('button', { name: 'Calculate' }).click();

    await expect(page).toHaveURL('/results');

    // 2 beef servings: 0.5 (baseline) + 2*0.2106 = 0.921 tCO₂e/yr — value should be > 0.5
    await expect(page.getByRole('button', { name: /Diet.*0\.[6-9]\d tCO₂e\/yr|Diet.*0\.9\d tCO₂e\/yr/ })).toBeVisible();
  });

  test('results page shows "No results yet" when accessed directly', async ({ page }) => {
    await page.goto('/results');
    await expect(page.getByText('No results yet')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start Calculation' })).toBeVisible();
  });
});
