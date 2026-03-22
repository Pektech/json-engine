import { test, expect } from '@playwright/test';
import { AppPage } from '../pages/AppPage';

test.describe('Smoke Tests', () => {
  test('app loads successfully', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();
    await expect(app.canvas).toBeVisible();
    await expect(app.editor).toBeVisible();
  });
  
  test('displays app title', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();
    await expect(page).toHaveTitle(/JSON.engine|OpenClaw/i);
  });
});