import { test, expect } from '@playwright/test';
import { AppPage } from '../pages/AppPage';

test.describe('File Operations', () => {
  test('has open and save buttons', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();
    await expect(app.openButton).toBeVisible();
    await expect(app.saveButton).toBeVisible();
  });
});