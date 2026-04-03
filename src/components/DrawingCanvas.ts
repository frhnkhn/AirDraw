import { DrawingEngine } from '../utils/drawingEngine';

export class DrawingCanvas {
  private engine: DrawingEngine;

  constructor(canvasId: string) {
    this.engine = new DrawingEngine(canvasId);
  }

  // --- Passthrough to engine ---
  
  public startStroke(x: number, y: number) {
    this.engine.startStroke(x, y);
  }

  public continueStroke(x: number, y: number) {
    this.engine.continueStroke(x, y);
  }

  public endStroke() {
    this.engine.endStroke();
  }

  public pan(dx: number, dy: number) {
    this.engine.pan(dx, dy);
  }

  public undo() {
    return this.engine.undo();
  }

  public clear() {
    this.engine.clear();
  }

  public setColor(color: string) {
    this.engine.color = color;
  }

  public setSize(size: number) {
    this.engine.size = size;
  }

  public setGlow(glow: number) {
    this.engine.glow = glow;
  }

  public setEraser(isErasing: boolean) {
    this.engine.isErasing = isErasing;
  }

  public exportImage() {
    const dataUrl = this.engine.exportDataUrl();
    const link = document.createElement('a');
    link.download = `air-drawing-${new Date().getTime()}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
