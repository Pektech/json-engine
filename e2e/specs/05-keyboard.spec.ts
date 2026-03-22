import { test, expect } from '@playwright/test';
import { AppPage } from '../pages/AppPage';

test.describe('Keyboard Shortcuts', () => {
  test('F1 opens keyboard shortcuts help', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();
    await page.keyboard.press('F1');
    await expect(page.locator('text=Keyboard Shortcuts')).toBeVisible();
  });
  
  test('Ctrl+Shift+F opens canvas search', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();
    await page.keyboard.press('Control+Shift+F');
    await expect(app.searchInput).toBeVisible();
  });
});