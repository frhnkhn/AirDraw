import { DrawingCanvas } from './DrawingCanvas';

export class Toolbar {
  private canvas: DrawingCanvas;
  
  constructor(canvas: DrawingCanvas) {
    this.canvas = canvas;
    this.initListeners();
    // Initalize default state
    this.canvas.setColor('#48DBFB');
    this.canvas.setSize(6);
    this.canvas.setGlow(60); 
  }

  private initListeners() {
    // Colors bindings
    const swatches = document.querySelectorAll('.color-swatch');
    swatches.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        this.setActiveColorSwatch(target);
        const color = target.getAttribute('data-color') || '#48DBFB';
        this.canvas.setColor(color);
      });
    });

    // Brush Size
    const brushSlider = document.getElementById('brush-size') as HTMLInputElement;
    const brushLabel = document.getElementById('brush-size-label') as HTMLElement;
    brushSlider?.addEventListener('input', (e) => {
      const size = parseInt((e.target as HTMLInputElement).value, 10);
      this.canvas.setSize(size);
      if (brushLabel) brushLabel.textContent = `${size}px`;
    });

    // Brush Glow
    const glowSlider = document.getElementById('brush-glow') as HTMLInputElement;
    const glowLabel = document.getElementById('brush-glow-label') as HTMLElement;
    glowSlider?.addEventListener('input', (e) => {
      const glow = parseInt((e.target as HTMLInputElement).value, 10);
      this.canvas.setGlow(glow);
      if (glowLabel) glowLabel.textContent = `${glow}%`;
    });

    // Actions
    document.getElementById('undo-btn')?.addEventListener('click', () => this.canvas.undo());
    document.getElementById('clear-btn')?.addEventListener('click', () => this.canvas.clear());
    document.getElementById('save-btn')?.addEventListener('click', () => this.canvas.exportImage());
    
    // Bottom pill toggle (Mock feature for showing/hiding feed or landmarks if you wanted)
    document.getElementById('webcam-toggle')?.addEventListener('click', () => {
      const overlay = document.getElementById('overlay-canvas');
      if (overlay) {
        overlay.style.opacity = overlay.style.opacity === '0' ? '1' : '0';
      }
    });
  }

  private setActiveColorSwatch(activeBtn: HTMLElement) {
    document.querySelectorAll('.color-swatch').forEach(b => b.classList.remove('active'));
    activeBtn.classList.add('active');
  }
}
