import { test, expect } from '@playwright/test';
import { AppPage } from '../pages/AppPage';
import { CanvasPage } from '../pages/CanvasPage';

test.describe('Canvas Node Interactions', () => {
  test('click node → selection highlight appears', async ({ page }) => {
    const app = new AppPage(page);
    const canvas = new CanvasPage(page);
    await app.goto();
    
    // Focus editor and type valid JSON
    await app.editor.click();
    await page.waitForTimeout(500);
    
    // Clear with Ctrl+A and type fresh JSON
    await page.keyboard.down('Control');
    await page.keyboard.press('a');
    await page.keyboard.up('Control');
    await page.waitForTimeout(200);
    await page.keyboard.type('{"test": "value", "num": 42}');
    await page.waitForTimeout(3000);
    
    await expect(canvas.canvasContainer.locator('.react-flow')).toBeVisible({ timeout: 10000 });
    
    const node = page.locator('.react-flow__node').filter({ hasText: 'test' }).first();
    await expect(node).toBeVisible({ timeout: 5000 });
    
    await node.click();
    await page.waitForTimeout(300);
    
    // Check for selection styling
    const nodeElement = node.locator('div').first();
    await expect(nodeElement).toHaveClass(/ring-2|border-primary/, { timeout: 3000 });
  });

  test('right-click → context menu appears with Copy/Delete', async ({ page }) => {
    const app = new AppPage(page);
    const canvas = new CanvasPage(page);
    await app.goto();
    
    await app.editor.click();
    await page.waitForTimeout(500);
    
    await page.keyboard.down('Control');
    await page.keyboard.press('a');
    await page.keyboard.up('Control');
    await page.waitForTimeout(200);
    await page.keyboard.type('{"test": "value", "num": 42}');
    await page.waitForTimeout(3000);
    
    await expect(canvas.canvasContainer.locator('.react-flow')).toBeVisible({ timeout: 10000 });
    
    const node = page.locator('.react-flow__node').first();
    await expect(node).toBeVisible({ timeout: 5000 });
    
    await node.click({ button: 'right' });
    await page.waitForTimeout(300);
    
    await expect(page.locator('text=Copy')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=Delete')).toBeVisible();
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  });

  test('add child node → graph shows new node', async ({ page }) => {
    const app = new AppPage(page);
    const canvas = new CanvasPage(page);
    await app.goto();
    
    await app.editor.click();
    await page.waitForTimeout(500);
    
    await page.keyboard.down('Control');
    await page.keyboard.press('a');
    await page.keyboard.up('Control');
    await page.waitForTimeout(200);
    await page.keyboard.type('{"parent": {"child": "value"}}');
    await page.waitForTimeout(3000);
    
    await expect(canvas.canvasContainer.locator('.react-flow')).toBeVisible({ timeout: 10000 });
    
    const parentNode = page.locator('.react-flow__node').filter({ hasText: 'parent' }).first();
    await expect(parentNode).toBeVisible({ timeout: 5000 });
    
    await parentNode.click({ button: 'right' });
    await page.waitForTimeout(300);
    
    const addButton = page.locator('text=Add Child').or(page.locator('text=Add Item')).first();
    await expect(addButton).toBeVisible({ timeout: 3000 });
    
    await addButton.hover();
    await page.waitForTimeout(300);
    
    await page.locator('text=String').first().click();
    await page.waitForTimeout(300);
    
    page.on('dialog', async dialog => {
      await dialog.accept('newField');
    });
    
    await page.waitForTimeout(1500);
    
    const newNode = page.locator('.react-flow__node').filter({ hasText: 'newField' });
    await expect(newNode).toBeVisible({ timeout: 5000 });
  });

  test('delete node → graph removes node', async ({ page }) => {
    const app = new AppPage(page);
    const canvas = new CanvasPage(page);
    await app.goto();
    
    await app.editor.click();
    await page.waitForTimeout(500);
    
    await page.keyboard.down('Control');
    await page.keyboard.press('a');
    await page.keyboard.up('Control');
    await page.waitForTimeout(200);
    await page.keyboard.type('{"keep": "this", "remove": "that"}');
    await page.waitForTimeout(3000);
    
    await expect(canvas.canvasContainer.locator('.react-flow')).toBeVisible({ timeout: 10000 });
    
    const removeNode = page.locator('.react-flow__node').filter({ hasText: 'remove' }).first();
    await expect(removeNode).toBeVisible({ timeout: 5000 });
    
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await removeNode.click({ button: 'right' });
    await page.waitForTimeout(300);
    
    await page.locator('text=Delete').first().click();
    await page.waitForTimeout(500);
    
    await page.waitForTimeout(1500);
    
    await expect(removeNode).not.toBeVisible({ timeout: 3000 });
  });
});
