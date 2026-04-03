export class WebcamFeed {
  private videoElement: HTMLVideoElement;
  private containerElement: HTMLElement;

  constructor(containerId: string) {
    this.containerElement = document.getElementById(containerId) as HTMLElement;
    this.videoElement = this.containerElement.querySelector('video') as HTMLVideoElement;
  }

  public getVideoElement(): HTMLVideoElement {
    return this.videoElement;
  }



  /**
   * Used to draw the actual hand wireframe over the screen
   */
  public drawSkeleton(ctx: CanvasRenderingContext2D, landmarks: any[]) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    if (!landmarks || landmarks.length === 0) return;

    // Draw lines (skeleton structure)
    const CONNECTIONS = [
      [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // Index
      [5, 9], [9, 10], [10, 11], [11, 12], // Middle
      [9, 13], [13, 14], [14, 15], [15, 16], // Ring
      [13, 17], [0, 17], [17, 18], [18, 19], [19, 20] // Pinky/Palm
    ];

    const cw = ctx.canvas.width;
    const ch = ctx.canvas.height;
    
    // Determine active theme color
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 2;

    for (const connection of CONNECTIONS) {
      const p1 = landmarks[connection[0]];
      const p2 = landmarks[connection[1]];
      
      // Mirror X
      const x1 = (1 - p1.x) * cw;
      const x2 = (1 - p2.x) * cw;
      const y1 = p1.y * ch;
      const y2 = p2.y * ch;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Draw joints
    ctx.fillStyle = isDark ? 'rgba(162, 155, 254, 0.8)' : 'rgba(100, 90, 220, 0.8)';
    for (const lm of landmarks) {
      const x = (1 - lm.x) * cw;
      const y = lm.y * ch;
      
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  public clearSkeleton(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}
