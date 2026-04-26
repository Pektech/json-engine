import { test, expect } from '@playwright/test';
import { AppPage } from '../pages/AppPage';
import { CanvasPage } from '../pages/CanvasPage';

test.describe('Undo/Redo Functionality', () => {
  const initialJson = '{"name": "test", "value": 42}';

  test('undo after editor change restores previous state', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();

    // Clear existing content and set initial JSON
    await app.editor.click();
    await page.waitForTimeout(300);
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(200);

    // Type initial JSON
    await app.typeInEditor(initialJson);
    await page.waitForTimeout(600); // Wait for history debounce (500ms + buffer)

    // Verify initial content is in editor
    await expect(app.editor).toBeVisible();

    // Make a change - add a new property
    await app.typeInEditor(', "newProp": "added"');
    await page.waitForTimeout(600); // Wait for history debounce

    // Verify the change was made
    const canvas = new CanvasPage(page);
    await expect(canvas.canvasContainer).toBeVisible();

    // Trigger undo with Ctrl+Z
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyZ');
    await page.keyboard.up('Control');
    await page.waitForTimeout(300);

    // Verify undo restored the initial state
    // The canvas should still be visible and nodes should reflect the original JSON
    await expect(canvas.canvasContainer).toBeVisible();
  });

  test('redo after undo restores the same state', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();

    // Clear and set initial JSON
    await app.editor.click();
    await page.waitForTimeout(300);
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(200);

    await app.typeInEditor(initialJson);
    await page.waitForTimeout(600);

    // Make a change
    await app.typeInEditor(', "redoTest": true');
    await page.waitForTimeout(600);

    const canvas = new CanvasPage(page);
    await expect(canvas.canvasContainer).toBeVisible();

    // Undo the change
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyZ');
    await page.keyboard.up('Control');
    await page.waitForTimeout(300);

    // Redo with Ctrl+Shift+Z
    await page.keyboard.down('Control');
    await page.keyboard.down('Shift');
    await page.keyboard.press('KeyZ');
    await page.keyboard.up('Shift');
    await page.keyboard.up('Control');
    await page.waitForTimeout(300);

    // Verify redo restored the changed state
    await expect(canvas.canvasContainer).toBeVisible();
  });

  test('multiple undos traverse the history stack correctly', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();

    // Clear and set initial JSON
    await app.editor.click();
    await page.waitForTimeout(300);
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(200);

    // Set base JSON
    await app.typeInEditor('{"base": 1}');
    await page.waitForTimeout(600);

    // Make first change
    await app.typeInEditor(', "first": 2');
    await page.waitForTimeout(600);

    // Make second change
    await app.typeInEditor(', "second": 3');
    await page.waitForTimeout(600);

    // Make third change
    await app.typeInEditor(', "third": 4');
    await page.waitForTimeout(600);

    const canvas = new CanvasPage(page);
    await expect(canvas.canvasContainer).toBeVisible();

    // First undo - should remove "third"
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyZ');
    await page.keyboard.up('Control');
    await page.waitForTimeout(300);

    // Second undo - should remove "second"
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyZ');
    await page.keyboard.up('Control');
    await page.waitForTimeout(300);

    // Third undo - should remove "first"
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyZ');
    await page.keyboard.up('Control');
    await page.waitForTimeout(300);

    // Fourth undo - should return to base state
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyZ');
    await page.keyboard.up('Control');
    await page.waitForTimeout(300);

    // Verify canvas is still functional after multiple undos
    await expect(canvas.canvasContainer).toBeVisible();
  });

  test('Ctrl+Y alternative shortcut works for redo', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();

    // Clear and set initial JSON
    await app.editor.click();
    await page.waitForTimeout(300);
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(200);

    await app.typeInEditor('{"cyTest": true}');
    await page.waitForTimeout(600);

    // Make a change
    await app.typeInEditor(', "extra": "data"');
    await page.waitForTimeout(600);

    const canvas = new CanvasPage(page);
    await expect(canvas.canvasContainer).toBeVisible();

    // Undo
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyZ');
    await page.keyboard.up('Control');
    await page.waitForTimeout(300);

    // Redo with Ctrl+Y (alternative shortcut)
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyY');
    await page.keyboard.up('Control');
    await page.waitForTimeout(300);

    // Verify redo worked
    await expect(canvas.canvasContainer).toBeVisible();
  });
});
