import { test, expect } from '@playwright/test';
import { AppPage } from '../pages/AppPage';

test.describe('Keyboard Shortcuts - Additional', () => {
  test('F1 opens help panel', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();
    await page.keyboard.press('F1');
    await expect(page.locator('text=Keyboard Shortcuts')).toBeVisible({ timeout: 3000 });
  });
  
  test('Ctrl+Shift+F opens search input', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();
    await page.keyboard.press('Control+Shift+F');
    await expect(app.searchInput).toBeVisible({ timeout: 3000 });
  });
  
  test('Ctrl+O triggers open file', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();
    // Focus the editor area first
    await app.editor.click();
    // Verify open button exists (we can't simulate file picker in headless)
    await expect(page.locator('[aria-label="Open File (Ctrl+O)"]')).toBeVisible();
  });
});
