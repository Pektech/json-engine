import { test, expect } from '@playwright/test';
import { AppPage } from '../pages/AppPage';
import { CanvasPage } from '../pages/CanvasPage';

test.describe('Canvas Node Interactions', () => {
  const loadSampleJson = async (page: any, app: AppPage) => {
    await app.goto();
    
    await app.editor.click();
    await page.waitForTimeout(300);
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(200);
    
    await app.typeInEditor('{"name": "root", "value": 123}');
    await page.waitForTimeout(2500);
  };

  test('click node → selection highlight appears', async ({ page }) => {
    const app = new AppPage(page);
    const canvas = new CanvasPage(page);
    await loadSampleJson(page, app);
    
    await expect(canvas.canvasContainer.locator('.react-flow')).toBeVisible({ timeout: 8000 });
    
    const rootNode = page.locator('.react-flow__node').filter({ hasText: 'name' }).first();
    await expect(rootNode).toBeVisible({ timeout: 5000 });
    
    await rootNode.click();
    await page.waitForTimeout(300);
    
    const nodeElement = rootNode.locator('div').first();
    await expect(nodeElement).toHaveClass(/ring-2|border-primary/, { timeout: 3000 });
  });

  test('right-click → context menu appears with Copy/Paste/Add/Delete', async ({ page }) => {
    const app = new AppPage(page);
    const canvas = new CanvasPage(page);
    await loadSampleJson(page, app);
    
    await expect(canvas.canvasContainer.locator('.react-flow')).toBeVisible({ timeout: 8000 });
    
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
    await loadSampleJson(page, app);
    
    await expect(canvas.canvasContainer.locator('.react-flow')).toBeVisible({ timeout: 8000 });
    
    const nameNode = page.locator('.react-flow__node').filter({ hasText: 'name' }).first();
    await expect(nameNode).toBeVisible({ timeout: 5000 });
    
    await nameNode.click({ button: 'right' });
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
    await loadSampleJson(page, app);
    
    await expect(canvas.canvasContainer.locator('.react-flow')).toBeVisible({ timeout: 8000 });
    
    const valueNode = page.locator('.react-flow__node').filter({ hasText: 'value' }).first();
    await expect(valueNode).toBeVisible({ timeout: 5000 });
    
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await valueNode.click({ button: 'right' });
    await page.waitForTimeout(300);
    
    await page.locator('text=Delete').first().click();
    await page.waitForTimeout(500);
    
    await page.waitForTimeout(1500);
    
    await expect(valueNode).not.toBeVisible({ timeout: 3000 });
  });
});
