

export interface StrokePoint {
  x: number;
  y: number;
  size: number;
  color: string;
  glow: number;
}

export class DrawingEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private currentStroke: StrokePoint[] = [];
  private history: StrokePoint[][] = [];
  private readonly MAX_HISTORY = 50;
  
  // State
  public color: string = '#FFFFFF';
  public size: number = 6;
  public glow: number = 60;
  public isErasing: boolean = false;
  
  // Panning state
  public offsetX: number = 0;
  public offsetY: number = 0;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!this.canvas) throw new Error(`Canvas with id ${canvasId} not found`);
    
    this.ctx = this.canvas.getContext('2d', { alpha: true })!;
    if (!this.ctx) throw new Error('Could not get 2D context');

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  private resize() {
    // Save current content
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.drawImage(this.canvas, 0, 0);

    // Resize
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // Restore
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.drawImage(tempCanvas, 0, 0);
  }

  private addPoint(x: number, y: number) {
    this.currentStroke.push({ 
      x: x - this.offsetX, 
      y: y - this.offsetY, 
      size: this.isErasing ? this.size * 5 : this.size, 
      color: this.isErasing ? 'erase' : this.color,
      glow: this.isErasing ? 0 : this.glow
    });
  }

  private renderCurrentSegment(currWorldX: number, currWorldY: number) {
    this.ctx.save();
    this.ctx.translate(this.offsetX, this.offsetY);
    this.ctx.beginPath();
    
    // lastX / lastY are already in world space from start/continueStroke translating them
    this.ctx.moveTo(this.lastWorldX, this.lastWorldY);

    const midX = (this.lastWorldX + currWorldX) / 2;
    const midY = (this.lastWorldY + currWorldY) / 2;
    
    this.ctx.quadraticCurveTo(this.lastWorldX, this.lastWorldY, midX, midY);

    if (this.isErasing) {
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.lineWidth = this.size * 5;
      this.ctx.shadowBlur = 0;
    } else {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.lineWidth = this.size;
      this.ctx.strokeStyle = this.color;
      this.ctx.shadowBlur = this.glow;
      this.ctx.shadowColor = this.color;
    }

    this.ctx.stroke();
    this.ctx.restore();

    this.lastWorldX = currWorldX;
    this.lastWorldY = currWorldY;
  }

  // Adjusted smoothing internal vars
  private lastWorldX: number = 0;
  private lastWorldY: number = 0;

  startStroke(x: number, y: number) {
    this.currentStroke = [];
    this.lastWorldX = x - this.offsetX;
    this.lastWorldY = y - this.offsetY;
    this.addPoint(x, y);
  }

  continueStroke(x: number, y: number) {
    this.addPoint(x, y);
    this.renderCurrentSegment(x - this.offsetX, y - this.offsetY);
  }

  endStroke() {
    if (this.currentStroke.length > 0) {
      this.history.push([...this.currentStroke]);
      if (this.history.length > this.MAX_HISTORY) {
        this.history.shift();
      }
      this.currentStroke = [];
    }
  }

  pan(dx: number, dy: number) {
    this.offsetX += dx;
    this.offsetY += dy;
    this.redrawAll();
  }

  undo() {
    if (this.history.length === 0) return false;
    
    this.history.pop();
    this.redrawAll();
    return true;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.history = [];
    this.currentStroke = [];
  }

  private redrawAll() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.translate(this.offsetX, this.offsetY);
    
    for (const stroke of this.history) {
      if (stroke.length === 0) continue;
      
      this.ctx.beginPath();
      this.ctx.moveTo(stroke[0].x, stroke[0].y);
      
      const isErase = stroke[0].color === 'erase';
      this.ctx.globalCompositeOperation = isErase ? 'destination-out' : 'source-over';
      this.ctx.lineWidth = stroke[0].size;
      this.ctx.strokeStyle = isErase ? 'black' : stroke[0].color;
      
      if (isErase) {
        this.ctx.shadowBlur = 0;
      } else {
        this.ctx.shadowBlur = stroke[0].glow !== undefined ? stroke[0].glow : 0;
        this.ctx.shadowColor = stroke[0].color;
      }

      if (stroke.length === 1) {
        this.ctx.lineTo(stroke[0].x + 0.1, stroke[0].y);
        this.ctx.stroke();
        continue;
      }

      for (let i = 1; i < stroke.length - 1; i++) {
        const xc = (stroke[i].x + stroke[i+1].x) / 2;
        const yc = (stroke[i].y + stroke[i+1].y) / 2;
        this.ctx.quadraticCurveTo(stroke[i].x, stroke[i].y, xc, yc);
      }
      
      // Last point
      const last = stroke[stroke.length - 1];
      this.ctx.lineTo(last.x, last.y);
      this.ctx.stroke();
    }
    
    // Reset to normal
    this.ctx.restore();
    this.ctx.globalCompositeOperation = 'source-over';
  }

  exportDataUrl(): string {
    // To export nicely, we need to create a canvas with the background color or video feed
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = this.canvas.width;
    exportCanvas.height = this.canvas.height;
    const eCtx = exportCanvas.getContext('2d')!;
    
    const video = document.getElementById('webcam-video') as HTMLVideoElement;
    if (video && video.videoWidth > 0) {
      eCtx.save();
      // Mirror the video drawing just like the CSS does
      eCtx.translate(exportCanvas.width, 0);
      eCtx.scale(-1, 1);

      // Simulate object-fit: cover
      const vRatio = video.videoWidth / video.videoHeight;
      const cRatio = exportCanvas.width / exportCanvas.height;
      let drawWidth = exportCanvas.width;
      let drawHeight = exportCanvas.height;
      let dx = 0;
      let dy = 0;

      if (vRatio > cRatio) {
        drawWidth = exportCanvas.height * vRatio;
        dx = (exportCanvas.width - drawWidth) / 2;
      } else {
        drawHeight = exportCanvas.width / vRatio;
        dy = (exportCanvas.height - drawHeight) / 2;
      }

      eCtx.drawImage(video, dx, dy, drawWidth, drawHeight);
      eCtx.restore();

      // Apply the 0.3 dark overlay that we have in CSS to match what the user sees
      eCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      eCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    } else {
      // Fallback
      eCtx.fillStyle = '#000000';
      eCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    }

    // Draw the drawing canvas over it
    eCtx.drawImage(this.canvas, 0, 0);

    return exportCanvas.toDataURL('image/png');
  }
}
