import { Page, Locator } from '@playwright/test';

export class AppPage {
  readonly page: Page;
  readonly openButton: Locator;
  readonly saveButton: Locator;
  readonly canvas: Locator;
  readonly editor: Locator;
  readonly searchInput: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.openButton = page.locator('[aria-label="Open file"]').or(page.locator('text=Open'));
    this.saveButton = page.getByRole('button', { name: 'Save file' }).or(page.getByRole('button', { name: 'Save' }).first());
    this.canvas = page.locator('[data-testid="node-canvas"]').or(page.locator('.react-flow'));
    this.editor = page.locator('.monaco-editor');
    this.searchInput = page.locator('[placeholder*="search" i]').or(page.locator('input[type="search"]'));
  }
  
  async goto() {
    await this.page.goto('/');
    await this.waitForLoad();
  }
  
  async waitForLoad() {
    // Wait for app shell
    await this.page.waitForLoadState('networkidle');
  }
  
  async openFile() {
    await this.openButton.click();
    // Handle File System Access API dialog
    // This may need manual verification per D-34
  }
  
  async typeInEditor(text: string) {
    await this.editor.click();
    await this.page.keyboard.type(text);
  }
}