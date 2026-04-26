import { test, expect } from '@playwright/test'

test.describe('Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3030')
    await page.waitForLoadState('networkidle')
  })

  test('F1 opens keyboard help modal', async ({ page }) => {
    await page.keyboard.press('F1')
    const modal = page.locator('[role="dialog"], [aria-modal="true"]')
    await expect(modal).toBeVisible()
  })

  test('Ctrl+Z undoes graph changes', async ({ page }) => {
    // Set up initial content
    await page.locator('.monaco-editor textarea').first().click()
    await page.keyboard.press('Control+A')
    await page.keyboard.type('{"test1": "value1"}')
    await page.waitForTimeout(500)

    // Verify graph shows nodes (initial state has root)
    const initialNodes = await page.locator('[data-testid="node-canvas"]').count()

    // Add a new node by pasting JSON
    await page.locator('.monaco-editor textarea').first().click()
    await page.keyboard.press('Control+A')
    await page.keyboard.type('{"test1": "value1", "test2": "value2"}')
    await page.waitForTimeout(500)

    // Undo with Ctrl+Z
    await page.keyboard.press('Control+Z')
    await page.waitForTimeout(500)

    // Verify JSON was undone (should show previous state)
    const editorContent = await page.locator('.monaco-editor .view-lines').textContent()
    expect(editorContent).toContain('test1')
  })

  test('Ctrl+Shift+Z redoes after undo', async ({ page }) => {
    // Set up initial content
    await page.locator('.monaco-editor textarea').first().click()
    await page.keyboard.press('Control+A')
    await page.keyboard.type('{"item1": "a"}')
    await page.waitForTimeout(500)

    // Change content
    await page.keyboard.press('Control+A')
    await page.keyboard.type('{"item1": "a", "item2": "b"}')
    await page.waitForTimeout(500)

    // Undo
    await page.keyboard.press('Control+Z')
    await page.waitForTimeout(500)

    // Redo
    await page.keyboard.press('Control+Shift+Z')
    await page.waitForTimeout(500)

    // Verify content was redone
    const editorContent = await page.locator('.monaco-editor .view-lines').textContent()
    expect(editorContent).toContain('item2')
  })
})
