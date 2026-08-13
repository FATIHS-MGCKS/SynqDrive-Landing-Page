/**
 * WebKit smoke tests for mobile navigation modal behaviour (P1.4.1).
 *
 * Run: npm run qa:webkit
 * Requires: npx playwright install webkit and WebKit system libraries.
 *
 * Note: after body scroll-lock Playwright WebKit sometimes reports fixed-modal
 * controls as outside the viewport; keyboard and programmatic handlers are used
 * where needed. Real Safari tap targets remain in the modal layer.
 */
import { test, expect } from '@playwright/test';

test.describe('mobile navigation — WebKit smoke', () => {
  test('modal scroll lock, close, anchor navigation', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => consoleErrors.push(`pageerror: ${error.message}`));

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'load' });
    await page.locator('#integrations').scrollIntoViewIfNeeded();
    const scrollBefore = await page.evaluate(() => window.scrollY);
    expect(scrollBefore).toBeGreaterThan(200);

    await page.getByRole('button', { name: 'Menü öffnen' }).click();
    const panel = page.locator('[data-nav-panel]');
    await expect(panel).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-nav-scroll-lock', 'true');
    expect(await page.evaluate(() => window.scrollY)).toBe(0);

    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect
      .poll(() => page.evaluate(() => window.scrollY), { timeout: 5000 })
      .toBeGreaterThan(200);

    await page.evaluate(() => {
      document.querySelector('[data-nav-toggle]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await expect(panel).toBeVisible();
    await page.evaluate(() => {
      document
        .querySelector('[data-nav-submenu="platform"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      document
        .querySelector('.mobilenav__subrow[href="#vehicle-intelligence"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await expect(panel).toBeHidden();
    await expect(page).toHaveURL(/#vehicle-intelligence$/);

    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });

  test('landscape modal reachability', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto('/', { waitUntil: 'load' });
    await page.getByRole('button', { name: 'Menü öffnen' }).click();

    const panel = page.locator('[data-nav-panel]');
    await expect(panel).toBeVisible();

    const scrollEl = page.locator('.mobilenav__scroll');
    await scrollEl.evaluate((node) => {
      node.scrollTop = node.scrollHeight;
    });
    expect(await scrollEl.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);

    await expect(panel.getByRole('link', { name: 'Anmelden' })).toBeInViewport();
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
  });

  test('mobile hierarchy opens Platform, returns, and closes', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'load' });

    const panel = page.locator('[data-nav-panel]');
    const toggle = page.getByRole('button', { name: 'Menü öffnen' });
    await toggle.click();
    await expect(panel).toBeVisible();
    await expect(panel.locator('.mobilenav__root-list > li')).toHaveCount(7);
    await expect(panel.getByRole('link', { name: 'Vernetzte Fahrzeugintelligenz' })).toHaveCount(0);

    await panel.getByRole('button', { name: 'Plattform' }).click();
    await expect(panel.locator('[data-nav-view="platform"]')).toBeVisible();
    await expect(panel.getByRole('button', { name: 'Zurück' })).toBeFocused();
    await expect(panel.getByRole('link', { name: 'Vernetzte Fahrzeugintelligenz' })).toBeVisible();

    await panel.getByRole('button', { name: 'Zurück' }).click();
    await expect(panel.locator('[data-nav-view="root"]')).toBeVisible();
    await expect(panel.getByRole('button', { name: 'Plattform' })).toBeFocused();

    await panel.getByRole('button', { name: 'Menü schließen' }).click();
    await expect(panel).toBeHidden();
    await expect(toggle).toBeFocused();
  });
});
