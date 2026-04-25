import { test, expect } from '@playwright/test';
import { AppPage } from '../pages/AppPage';

test.describe('File Workflow', () => {
  test('open button exists', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();
    await expect(page.locator('[aria-label="Open File (Ctrl+O)"]')).toBeVisible();
  });
  
  test('format button exists', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();
    await expect(page.locator('[aria-label="Format Document (Ctrl+Shift+I)"]')).toBeVisible();
  });
});
