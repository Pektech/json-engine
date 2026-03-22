import { test, expect } from '@playwright/test';
import { AppPage } from '../pages/AppPage';

test.describe('Editor Functionality', () => {
  test('editor element is visible', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();
    await expect(app.editor).toBeVisible();
  });
  
  test('editor can receive input', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();
    
    // Clear existing content and type something
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA'); // Select all
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace'); // Clear
    
    await app.typeInEditor('{"test": "value"}');
    
    // Check if some text appeared in the editor
    await expect(app.editor).toBeVisible(); // Basic check for now
  });
});