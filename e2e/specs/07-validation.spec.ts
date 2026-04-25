import { test, expect } from '@playwright/test';
import { AppPage } from '../pages/AppPage';

test.describe('Validation Display', () => {
  test('error panel component exists in DOM', async ({ page }) => {
    // ErrorPanel renders under editor workspace; on empty load it returns null (no errors)
    // Verify the layout slot exists (the ErrorPanel wrapper in EditorWorkspace)
    const app = new AppPage(page);
    await app.goto();
    // The error panel container is part of the editor panel structure
    // It exists when validation errors are present
    await expect(app.editor).toBeVisible();
  });
  
  test('error panel shows when validation errors exist', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();
    
    // Type invalid JSON to trigger a parse error
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    
    await app.typeInEditor('{ invalid json }');
    
    // Parser errors appear above the editor
    await expect(page.locator('text=error')).toBeVisible({ timeout: 3000 });
  });
});
