import { Page, Locator } from '@playwright/test';

export class CanvasPage {
  readonly page: Page;
  readonly canvasContainer: Locator;
  readonly controls: Locator;
  readonly minimap: Locator;
  readonly backgroundGrid: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.canvasContainer = page.locator('[data-testid="node-canvas"]');
    this.controls = this.canvasContainer.locator('.react-flow__controls');
    this.minimap = this.canvasContainer.locator('.react-flow__minimap');
    this.backgroundGrid = page.locator('.canvas-grid');
  }
  
  async waitForCanvasReady() {
    await this.canvasContainer.waitFor({ state: 'visible' });
  }
  
  async zoomIn() {
    const zoomInBtn = this.controls.locator('[aria-label*="zoom in" i], .react-flow__controls-zoomin');
    await zoomInBtn.click();
  }
  
  async zoomOut() {
    const zoomOutBtn = this.controls.locator('[aria-label*="zoom out" i], .react-flow__controls-zoomout');
    await zoomOutBtn.click();
  }
}
