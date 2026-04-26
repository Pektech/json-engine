import { test, expect } from '@playwright/test';
import { AppPage } from '../pages/AppPage';
import { CanvasPage } from '../pages/CanvasPage';

test.describe('Canvas Node Interactions', () => {
  test('click node → selection highlight appears', async ({ page }) => {
    const app = new AppPage(page);
    const canvas = new CanvasPage(page);
    await app.goto();

    // Clear existing content and type fresh JSON (follow 10-undo-redo pattern)
    await app.editor.click();
    await page.waitForTimeout(300);
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(200);

    await app.typeInEditor('{"test": "value", "num": 42}');
    await page.waitForTimeout(800);

    await expect(canvas.canvasContainer.locator('.react-flow')).toBeVisible({ timeout: 10000 });

    // Use canvasContainer locator for node selection
    const node = canvas.canvasContainer.locator('.react-flow__node').filter({ hasText: 'test' }).first();
    await expect(node).toBeVisible({ timeout: 5000 });

    await node.click();
    await page.waitForTimeout(300);

    // Check for selection using data-selected attribute
    await expect(node).toHaveAttribute('data-selected', 'true', { timeout: 3000 });
  });

  test('right-click → context menu appears with Copy/Delete', async ({ page }) => {
    const app = new AppPage(page);
    const canvas = new CanvasPage(page);
    await app.goto();

    // Clear existing content and type fresh JSON
    await app.editor.click();
    await page.waitForTimeout(300);
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(200);

    await app.typeInEditor('{"test": "value", "num": 42}');
    await page.waitForTimeout(800);

    await expect(canvas.canvasContainer.locator('.react-flow')).toBeVisible({ timeout: 10000 });

    // Use canvasContainer locator for node selection
    const node = canvas.canvasContainer.locator('.react-flow__node').first();
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

    // Clear existing content and type fresh JSON
    await app.editor.click();
    await page.waitForTimeout(300);
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(200);

    await app.typeInEditor('{"parent": {"child": "value"}}');
    await page.waitForTimeout(800);

    await expect(canvas.canvasContainer.locator('.react-flow')).toBeVisible({ timeout: 10000 });

    // Use canvasContainer locator for node selection
    const parentNode = canvas.canvasContainer.locator('.react-flow__node').filter({ hasText: 'parent' }).first();
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

    // Use canvasContainer locator for new node
    const newNode = canvas.canvasContainer.locator('.react-flow__node').filter({ hasText: 'newField' });
    await expect(newNode).toBeVisible({ timeout: 5000 });
  });

  test('delete node → graph removes node', async ({ page }) => {
    const app = new AppPage(page);
    const canvas = new CanvasPage(page);
    await app.goto();

    // Clear existing content and type fresh JSON
    await app.editor.click();
    await page.waitForTimeout(300);
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(200);

    await app.typeInEditor('{"keep": "this", "remove": "that"}');
    await page.waitForTimeout(800);

    await expect(canvas.canvasContainer.locator('.react-flow')).toBeVisible({ timeout: 10000 });

    // Use canvasContainer locator for node selection
    const removeNode = canvas.canvasContainer.locator('.react-flow__node').filter({ hasText: 'remove' }).first();
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
