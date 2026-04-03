/**
 * Exponential Moving Average (EMA) filter to smooth out hand tracking landmarks.
 * This reduces the natural jitter from webcam estimation.
 */
export class PointSmoother {
  private _x: number | null = null;
  private _y: number | null = null;
  private readonly alpha: number;

  /**
   * @param alpha Smoothing factor [0, 1]. Lower = smoother (more lag), Higher = more responsive (more jitter)
   */
  constructor(alpha: number = 0.5) {
    this.alpha = alpha;
  }

  process(x: number, y: number): { x: number; y: number } {
    if (this._x === null || this._y === null) {
      this._x = x;
      this._y = y;
      return { x, y };
    }

    this._x = this.alpha * x + (1 - this.alpha) * this._x;
    this._y = this.alpha * y + (1 - this.alpha) * this._y;

    return { x: this._x, y: this._y };
  }

  reset() {
    this._x = null;
    this._y = null;
  }
}

/**
 * Filter for an array of landmarks
 */
export class LandmarkSmoother {
  private smoothers: PointSmoother[] = [];
  private readonly alpha: number;

  constructor(alpha: number = 0.5) {
    this.alpha = alpha;
  }

  process(landmarks: any[]): any[] {
    if (this.smoothers.length !== landmarks.length) {
      this.smoothers = landmarks.map(() => new PointSmoother(this.alpha));
    }

    return landmarks.map((lm, i) => {
      const smoothed = this.smoothers[i].process(lm.x, lm.y);
      return { ...lm, x: smoothed.x, y: smoothed.y };
    });
  }

  reset() {
    this.smoothers.forEach(s => s.reset());
  }
}
