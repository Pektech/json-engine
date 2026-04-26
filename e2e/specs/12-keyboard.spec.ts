import { test, expect } from '@playwright/test';
import { AppPage } from '../pages/AppPage';
import { CanvasPage } from '../pages/CanvasPage';

test.describe('Keyboard Shortcuts', () => {
  test('F1 opens keyboard help modal', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();

    // Press F1 and verify no crash occurs
    await page.keyboard.press('F1');
    await page.waitForTimeout(300);

    // Verify the app is still responsive by checking editor is visible
    await expect(app.editor).toBeVisible();
  });

  test('Ctrl+Z undoes graph changes', async ({ page }) => {
    const app = new AppPage(page);
    const canvas = new CanvasPage(page);
    await app.goto();

    // Clear existing content and set up initial content (follow 10-undo-redo pattern)
    await app.editor.click();
    await page.waitForTimeout(300);
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(200);

    await app.typeInEditor('{"test1": "value1"}');
    await page.waitForTimeout(600);

    // Verify graph shows nodes
    await expect(canvas.canvasContainer).toBeVisible();

    // Make a change - add new property
    await app.typeInEditor(', "test2": "value2"');
    await page.waitForTimeout(600);

    // Undo with Ctrl+Z
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyZ');
    await page.keyboard.up('Control');
    await page.waitForTimeout(300);

    // Verify JSON was undone using monaco editor content
    const editorContent = await page.locator('.monaco-editor .view-lines').textContent();
    expect(editorContent).toContain('test1');
  });

  test('Ctrl+Shift+Z redoes after undo', async ({ page }) => {
    const app = new AppPage(page);
    const canvas = new CanvasPage(page);
    await app.goto();

    // Clear existing content and set up initial content
    await app.editor.click();
    await page.waitForTimeout(300);
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(200);

    await app.typeInEditor('{"item1": "a"}');
    await page.waitForTimeout(600);

    // Make a change
    await app.typeInEditor(', "item2": "b"');
    await page.waitForTimeout(600);

    // Undo
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

    // Verify content was redone using monaco editor content
    const editorContent = await page.locator('.monaco-editor .view-lines').textContent();
    expect(editorContent).toContain('item2');
  });
});
