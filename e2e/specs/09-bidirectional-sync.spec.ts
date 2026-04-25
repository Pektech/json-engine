import { test, expect } from '@playwright/test';
import { AppPage } from '../pages/AppPage';

test.describe('Bidirectional Sync', () => {
  test('both editor and canvas panels visible in split view', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();
    await expect(app.editor).toBeVisible();
    await expect(app.canvas).toBeVisible();
  });
  
  test('sidebar has Editor/Canvas/Split navigation items', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();
    const nav = page.locator('nav[aria-label="View navigation"]');
    await expect(nav.getByText('Editor', { exact: true }).first()).toBeVisible();
    await expect(nav.getByText('Canvas', { exact: true }).first()).toBeVisible();
    await expect(nav.getByText('Split View', { exact: true }).first()).toBeVisible();
  });
});
