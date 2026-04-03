/**
 * Detects gestures based on MediaPipe hand landmarks.
 * Landmarks map: https://developers.google.com/mediapipe/solutions/vision/hand_landmarker
 */

export interface Vector2D {
  x: number;
  y: number;
}

export const Gesture = {
  NONE: 'NONE',
  POINTER: 'POINTER', // Index up
  PINCH: 'PINCH',     // Index + Thumb near
  OPEN_PALM: 'OPEN_PALM', // 4+ fingers up
  PEACE: 'PEACE',     // Index + Middle up
  THREE_FINGERS: 'THREE_FINGERS',
  FIST: 'FIST',       // No fingers up
  PINKY: 'PINKY'      // Only pinky up
} as const;

export type Gesture = typeof Gesture[keyof typeof Gesture];

export class GestureDetector {
  // Thresholds
  private readonly PINCH_THRESHOLD = 0.05; // Euclidean distance threshold
  private lastGesture: Gesture = Gesture.NONE;
  private continuousFrames: number = 0;
  private readonly CONFIDENCE_FRAMES = 3; // Number of frames to hold gesture to confirm

  detect(landmarks: any[]): Gesture {
    if (!landmarks || landmarks.length < 21) return Gesture.NONE;

    const isThumbUp = this.isFingerUp(landmarks, 4, 3, 2);
    const isIndexUp = this.isFingerUp(landmarks, 8, 6, 5);
    const isMiddleUp = this.isFingerUp(landmarks, 12, 10, 9);
    const isRingUp = this.isFingerUp(landmarks, 16, 14, 13);
    const isPinkyUp = this.isFingerUp(landmarks, 20, 18, 17);

    const fingersUpCount = [isThumbUp, isIndexUp, isMiddleUp, isRingUp, isPinkyUp].filter(Boolean).length;
    
    // Calculate pinch distance (Index Tip - Thumb Tip)
    const pinchDist = this.distance(landmarks[8], landmarks[4]);
    const isPinching = pinchDist < this.PINCH_THRESHOLD;

    let detected: Gesture = Gesture.NONE;

    if (isPinching && !isMiddleUp && !isRingUp && !isPinkyUp) {
      detected = Gesture.PINCH;
    } else if (fingersUpCount >= 4) {
      detected = Gesture.OPEN_PALM;
    } else if (fingersUpCount === 0 || (fingersUpCount === 1 && isThumbUp)) {
      detected = Gesture.FIST;
    } else if (isIndexUp && isMiddleUp && !isRingUp && !isPinkyUp && !isThumbUp) {
      detected = Gesture.PEACE;
    } else if (isIndexUp && isMiddleUp && isRingUp && !isPinkyUp) {
      detected = Gesture.THREE_FINGERS;
    } else if (isPinkyUp && !isIndexUp && !isMiddleUp && !isRingUp) {
      detected = Gesture.PINKY;
    } else if (isIndexUp && !isMiddleUp && !isRingUp && !isPinkyUp) {
      detected = Gesture.POINTER;
    }

    // Debounce / Smoothing
    if (detected === this.lastGesture) {
      this.continuousFrames++;
    } else {
      this.lastGesture = detected;
      this.continuousFrames = 1;
    }

    // Require CONFIDENCE_FRAMES to confirm a state change, except for fast actions like STOP
    if (this.continuousFrames >= this.CONFIDENCE_FRAMES || detected === Gesture.OPEN_PALM) {
      return detected;
    }

    return Gesture.NONE; 
  }

  getPointerPosition(landmarks: any[]): Vector2D {
    // Return index fingertip
    if (!landmarks || landmarks.length < 9) return { x: 0, y: 0 };
    return { x: landmarks[8].x, y: landmarks[8].y };
  }

  getPalmCenterPosition(landmarks: any[]): Vector2D {
    // Return average of wrist (0) and middle finger MCP (9)
    if (!landmarks || landmarks.length < 10) return { x: 0, y: 0 };
    return { 
      x: (landmarks[0].x + landmarks[9].x) / 2, 
      y: (landmarks[0].y + landmarks[9].y) / 2 
    };
  }

  private isFingerUp(landmarks: any[], tipId: number, dipId: number, pipId: number): boolean {
    // In camera coords, Y goes down. So tip.y < pip.y means finger is UP.
    // We check tip vs dip and pip to ensure it's extended.
    return landmarks[tipId].y < landmarks[pipId].y && landmarks[tipId].y < landmarks[dipId].y;
  }

  private distance(p1: Vector2D, p2: Vector2D): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
