import { test, expect } from '@playwright/test';
import { AppPage } from '../pages/AppPage';
import { CanvasPage } from '../pages/CanvasPage';

test.describe('Canvas', () => {
  test('canvas container visible after page load', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();
    await expect(app.canvas).toBeVisible();
  });
  
  test('canvas has zoom/pan controls visible when JSON loaded', async ({ page }) => {
    const app = new AppPage(page);
    const canvas = new CanvasPage(page);
    await app.goto();
    
    await app.editor.click();
    await page.waitForTimeout(300);
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(200);
    
    await app.typeInEditor('{"name": "test", "value": 42}');
    await page.waitForTimeout(2000);
    
    await expect(canvas.canvasContainer.locator('.react-flow')).toBeVisible({ timeout: 8000 });
    await expect(canvas.controls).toBeVisible();
  });
});
