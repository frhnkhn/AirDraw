// MediaPipe globals loaded from index.html script tags
declare const window: any;

export class HandTracking {
  private hands: any;
  private camera: any | null = null;
  public onResults: ((results: any) => void) | null = null;

  constructor() {
    this.hands = new window.Hands({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });

    this.hands.setOptions({
      maxNumHands: 1, // Only tracking 1 hand for drawing
      modelComplexity: 1, // 0 = fast, 1 = accurate
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7
    });

    this.hands.onResults((results: any) => {
      if (this.onResults) {
        this.onResults(results);
      }
    });
  }

  async startCamera(videoElement: HTMLVideoElement) {
    if (this.camera) {
      await this.camera.stop();
    }

    // Explicitly initialize Wasm payload to prevent Camera start crash
    await this.hands.initialize();

    // Workaround for Safari: Draw `<video>` into an intermediate `<canvas>` 
    // to strip Safari `MediaStream` flags before passing to MediaPipe
    const bufferCanvas = document.createElement('canvas');
    bufferCanvas.width = 1280;
    bufferCanvas.height = 720;
    const bufferCtx = bufferCanvas.getContext('2d')!;

    this.camera = new window.Camera(videoElement, {
      onFrame: async () => {
        // Blit the WebRTC frame to standard DOM pixel canvas
        bufferCtx.drawImage(videoElement, 0, 0, 1280, 720);
        // Inject sanitized canvas frame into tracking model
        await this.hands.send({ image: bufferCanvas });
      },
      width: 1280,
      height: 720
    });

    await this.camera.start();
  }

  async stopCamera() {
    if (this.camera) {
      await this.camera.stop();
      this.camera = null;
    }
  }

  /**
   * Directly process a single image/video frame (if not using Camera util)
   */
  async sendImage(image: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement) {
    await this.hands.send({ image });
  }
}
