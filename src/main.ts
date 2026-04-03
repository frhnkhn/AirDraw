import { HandTracking } from './utils/handTracking';
import { WebcamFeed } from './components/WebcamFeed';
import { DrawingCanvas } from './components/DrawingCanvas';
import { Toolbar } from './components/Toolbar';
import { GestureController } from './components/GestureController';

class App {
  private handTracking: HandTracking;
  private webcam: WebcamFeed;
  private canvas: DrawingCanvas;

  private controller: GestureController;

  private overlayCtx: CanvasRenderingContext2D;

  constructor() {
    // 1. Initialize UI Elements
    this.webcam = new WebcamFeed('webcam-container');
    this.canvas = new DrawingCanvas('drawing-canvas');
    
    new Toolbar(this.canvas);
    this.controller = new GestureController(this.canvas);

    // Setup overlay canvas for skeleton drawing
    const overlay = document.getElementById('overlay-canvas') as HTMLCanvasElement;
    overlay.width = window.innerWidth;
    overlay.height = window.innerHeight;
    window.addEventListener('resize', () => {
      overlay.width = window.innerWidth;
      overlay.height = window.innerHeight;
    });
    this.overlayCtx = overlay.getContext('2d')!;

    // 2. Initialize MediaPipe
    this.handTracking = new HandTracking();
    
    this.handTracking.onResults = (results) => {
      // Clear previous skeleton
      this.webcam.clearSkeleton(this.overlayCtx);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        // We only use the first hand detected (index 0)
        const landmarks = results.multiHandLandmarks[0];
        
        // Draw Skeleton overlay
        this.webcam.drawSkeleton(this.overlayCtx, landmarks);
        
        // Process gestures
        this.controller.processLandmarks(landmarks);
      } else {
        // No hands
        this.controller.processLandmarks([]);
      }
    };
  }

  public async start() {
    try {
      const label = document.getElementById('progress-label')!;
      const fill = document.getElementById('progress-fill')!;
      
      label.textContent = 'Requesting camera access...';
      fill.style.width = '30%';

      await this.handTracking.startCamera(this.webcam.getVideoElement());
      
      label.textContent = 'Initializing AI model...';
      fill.style.width = '80%';

      // We need to wait for the first frame to be processed to ensure model is loaded
      // Since it's async, we'll listen for a short bit, then assume loaded.
      setTimeout(() => {
        fill.style.width = '100%';
        label.textContent = 'Ready!';
        
        setTimeout(() => {
          const loadingScreen = document.getElementById('loading-screen');
          loadingScreen?.classList.add('fade-out');
          document.getElementById('app')?.classList.remove('hidden');
          
          setTimeout(() => {
            if (loadingScreen) loadingScreen.style.display = 'none';
          }, 500);
        }, 500);
      }, 2000);

    } catch (e: any) {
      console.error(e);
      document.getElementById('progress-label')!.textContent = `Error: ${e.message}. Please allow camera access.`;
      document.getElementById('progress-fill')!.style.background = 'var(--danger)';
    }
  }
}

// Start app when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  try {
    const app = new App();
    app.start();
  } catch (err: any) {
    console.error("Initialization Error: ", err);
    const label = document.getElementById('progress-label');
    if (label) label.textContent = `Crash: ${err.message}`;
  }
});
