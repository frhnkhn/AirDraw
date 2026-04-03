import { DrawingCanvas } from './DrawingCanvas';
import { GestureDetector, Gesture } from '../utils/gestureDetection';
import { LandmarkSmoother } from '../utils/smoothing';

export class GestureController {
  private canvas: DrawingCanvas;
  private detector: GestureDetector;
  private smoother: LandmarkSmoother;
  
  private cursor: HTMLElement;
  private statusText: HTMLElement;
  private modeBadge: HTMLElement;
  private modeLabel: HTMLElement;

  private isDrawing: boolean = false;
  private isModeActive: boolean = true; // true = Drawing/Pointer mode, false = View only


  
  // Track pointer for panning
  private lastPointerX: number = 0;
  private lastPointerY: number = 0;

  constructor(canvas: DrawingCanvas) {
    this.canvas = canvas;
    this.detector = new GestureDetector();
    this.smoother = new LandmarkSmoother(0.4); // 0.4 = decent smooth vs responsive tradeoff

    this.cursor = document.getElementById('virtual-cursor')!;
    this.statusText = document.getElementById('gesture-status')!;
    this.modeBadge = document.getElementById('mode-badge')!;
    this.modeLabel = document.getElementById('mode-label')!;
  }

  public processLandmarks(rawLandmarks: any[]) {
    if (!rawLandmarks || rawLandmarks.length === 0) {
      this.cursor.style.opacity = '0';
      this.statusText.textContent = 'Ready — show your hand to begin';
      
      if (this.isDrawing) {
        this.canvas.endStroke();
        this.isDrawing = false;
      }
      return;
    }

    this.cursor.style.opacity = '1';

    // 1. Smooth landmarks
    const landmarks = this.smoother.process(rawLandmarks);

    // 2. Detect gesture
    const gesture = this.detector.detect(landmarks);

    // 3. Update pointer position
    const pointer = gesture === Gesture.OPEN_PALM || this.cursor.classList.contains('cursor-erasing')
      ? this.detector.getPalmCenterPosition(landmarks)
      : this.detector.getPointerPosition(landmarks);
    
    // Transform coordinates (MediaPipe X is right-to-left, Y is top-to-bottom. We mirror X)
    const px = (1 - pointer.x) * window.innerWidth;
    const py = pointer.y * window.innerHeight;
    
    this.updateCursorPosition(px, py);

    // Calculate delta for panning
    let dx = 0;
    let dy = 0;
    // Only calculate if we had a valid previous position
    if (this.lastPointerX !== 0 && this.lastPointerY !== 0) {
      dx = px - this.lastPointerX;
      dy = py - this.lastPointerY;
    }

    // 4. Handle Gestures
    this.handleGesture(gesture, px, py, dx, dy);

    this.lastPointerX = px;
    this.lastPointerY = py;
  }

  private handleGesture(gesture: Gesture, x: number, y: number, dx: number, dy: number) {

    switch (gesture) {
      case Gesture.POINTER:
        if (this.isModeActive) {
          this.statusText.textContent = 'Drawing';
          this.setCursorState('drawing');
          this.canvas.setEraser(false);
          
          if (!this.isDrawing) {
            this.canvas.startStroke(x, y);
            this.isDrawing = true;
          } else {
            this.canvas.continueStroke(x, y);
          }
        }
        break;

      case Gesture.OPEN_PALM:
        if (this.isModeActive) {
          this.statusText.textContent = 'Erasing';
          this.setCursorState('erasing');
          this.canvas.setEraser(true);
          
          if (!this.isDrawing) {
            this.canvas.startStroke(x, y);
            this.isDrawing = true;
          } else {
            this.canvas.continueStroke(x, y);
          }
        }
        break;

      case Gesture.PINCH:
        this.statusText.textContent = 'Moving Canvas';
        
        // Custom visual for pan
        this.cursor.className = '';
        this.cursor.classList.add('cursor-drawing');
        this.modeBadge.className = 'mode-badge';
        this.modeLabel.textContent = 'Panning';
        
        if (this.isDrawing) {
          this.canvas.endStroke();
          this.isDrawing = false;
        }

        // Use dx, dy to pan
        if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
          this.canvas.pan(dx, dy);
        }
        break;

      case Gesture.FIST:
        this.statusText.textContent = 'Stopped';
        this.setCursorState('idle');
        
        if (this.isDrawing) {
          this.canvas.endStroke();
          this.isDrawing = false;
        }
        break;

      case Gesture.PINKY:
        // Unused in new mapping
        break;



      case Gesture.NONE:
      default:
        // Do nothing special, maintain current state
        break;
    }
  }

  private updateCursorPosition(x: number, y: number) {
    this.cursor.style.left = `${x}px`;
    this.cursor.style.top = `${y}px`;
  }

  private setCursorState(state: 'idle' | 'drawing' | 'erasing') {
    this.cursor.className = '';
    
    if (state === 'idle') {
      this.cursor.classList.add('cursor-idle');
      this.modeBadge.className = 'mode-badge';
      this.modeLabel.textContent = 'Pointer';
    } else if (state === 'drawing') {
      this.cursor.classList.add('cursor-drawing');
      this.modeBadge.className = 'mode-badge drawing';
      this.modeLabel.textContent = 'Drawing';
    } else if (state === 'erasing') {
      this.cursor.classList.add('cursor-erasing');
      this.modeBadge.className = 'mode-badge erasing';
      this.modeLabel.textContent = 'Erasing';
    }
  }


}
