import type { IRenderer, TOptions, TStrokeStyle } from './types.js';

const TAU = Math.PI * 2;

/** Resolve the animation duration, which may be derived from the transition. */
export function resolveDuration(
  options: TOptions,
  from: number,
  to: number,
): number {
  const { duration } = options.animate;
  return typeof duration === 'function' ? duration(from, to) : duration;
}

/**
 * Renders the chart onto a `<canvas>` appended to the host element.
 */
export class CanvasRenderer implements IRenderer {
  private readonly el: HTMLElement;
  private readonly options: TOptions;
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly scaleBy: number;
  private readonly radius: number;
  /** How far the ring spans, in radians. */
  private readonly arc: number;

  private cachedBackground: ImageData | null = null;
  private rafId: number | null = null;

  constructor(el: HTMLElement, options: TOptions) {
    this.el = el;
    this.options = options;

    this.canvas = document.createElement('canvas');
    this.canvas.className = options.canvasClass;
    el.appendChild(this.canvas);

    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('easy-pie-chart: unable to get a 2d canvas context');
    }
    this.ctx = ctx;

    this.scaleBy =
      typeof window !== 'undefined' && window.devicePixelRatio > 1
        ? window.devicePixelRatio
        : 1;

    this.canvas.width = this.canvas.height = options.size * this.scaleBy;
    this.canvas.style.width = this.canvas.style.height = `${options.size}px`;
    if (this.scaleBy !== 1) {
      ctx.scale(this.scaleBy, this.scaleBy);
    }

    // move 0,0 to the center, then rotate so 0% starts at 12 o'clock
    ctx.translate(options.size / 2, options.size / 2);
    ctx.rotate((-1 / 2 + options.rotate / 180) * Math.PI);

    this.arc = (Math.min(360, Math.max(0, options.arcLength)) / 360) * TAU;

    // The widest of the strokes decides how much room the ring needs: the
    // track is drawn with trackWidth, so sizing the radius off lineWidth alone
    // pushed a wider track past the canvas edge and clipped it. The extra
    // pixel keeps the antialiased outer edge inside the bitmap.
    const stroke =
      Math.max(options.lineWidth, options.trackWidth ?? options.lineWidth) +
      (options.trackBorderColor ? options.trackBorderWidth * 2 : 0);
    let radius = (options.size - stroke) / 2 - 1;
    if (options.scaleColor && options.scaleLength) {
      // 2 is the distance between scale and bar
      radius -= options.scaleLength + 2;
    }
    this.radius = Math.max(0, radius);
  }

  /**
   * Draw a segment of the ring.
   * @param fraction how much of the arc to cover, between -1 and 1
   */
  private drawArc(
    color: TStrokeStyle,
    lineWidth: number,
    fraction: number,
    radius = this.radius,
  ): void {
    const f = Math.min(Math.max(-1, fraction || 0), 1);
    // a zero-length arc with `lineCap: round` renders as a dot in most browsers
    if (f === 0) {
      return;
    }

    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, 0, this.arc * f, f < 0);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.stroke();
  }

  private drawScale(): void {
    const { ctx, options } = this;
    const count = Math.max(1, Math.round(options.scaleCount));

    ctx.lineWidth = 1;
    ctx.fillStyle = options.scaleColor as string;

    ctx.save();
    for (let i = count; i > 0; --i) {
      // every fourth line is drawn full length
      const isMajor = i % Math.max(1, Math.round(count / 4)) === 0;
      const length = isMajor ? options.scaleLength : options.scaleLength * 0.6;
      const offset = options.scaleLength - length;

      ctx.fillRect(-options.size / 2 + offset, 0, length, 1);
      ctx.rotate(this.arc / count);
    }
    ctx.restore();
  }

  private drawBackground(): void {
    const { ctx, options } = this;
    const trackWidth = options.trackWidth ?? options.lineWidth;

    if (options.fillColor) {
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(0, this.radius - trackWidth / 2), 0, TAU);
      ctx.fillStyle = options.fillColor;
      ctx.fill();
    }

    if (options.scaleColor) {
      this.drawScale();
    }

    if (options.trackColor) {
      this.drawArc(options.trackColor, trackWidth, 1);

      // a hairline along both edges of the track, so it reads as a groove
      // when the background behind it is a different color
      if (options.trackBorderColor && options.trackBorderWidth > 0) {
        const offset = trackWidth / 2 + options.trackBorderWidth / 2;
        for (const r of [this.radius - offset, this.radius + offset]) {
          this.drawArc(
            options.trackBorderColor,
            options.trackBorderWidth,
            1,
            Math.max(0, r),
          );
        }
      }
    }
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  getCtx(): CanvasRenderingContext2D {
    return this.ctx;
  }

  clear(): void {
    const { size } = this.options;
    this.ctx.clearRect(size / -2, size / -2, size, size);
  }

  /**
   * Draw the complete chart.
   * @param value between -max and max
   */
  draw(value: number): void {
    const { ctx, options } = this;

    const hasBackground =
      options.scaleColor || options.trackColor || options.fillColor;

    if (hasBackground) {
      if (this.cachedBackground) {
        ctx.putImageData(this.cachedBackground, 0, 0);
      } else {
        this.clear();
        this.drawBackground();
        // getImageData works in device pixels and ignores the ctx transform
        const size = options.size * this.scaleBy;
        this.cachedBackground = ctx.getImageData(0, 0, size, size);
      }
    } else {
      this.clear();
    }

    ctx.lineCap = options.lineCap;

    const color =
      typeof options.barColor === 'function'
        ? options.barColor(value)
        : options.barColor;

    this.drawArc(color, options.lineWidth, value / (options.max || 100));
  }

  animate(from: number, to: number): void {
    this.stop();

    const { options } = this;
    const startTime = Date.now();
    const duration = resolveDuration(options, from, to);

    options.onStart(from, to);

    const step = (): void => {
      const elapsed = Math.min(Date.now() - startTime, duration);
      const value = options.easing(elapsed, from, to - from, duration);

      this.draw(value);
      options.onStep(from, to, value);

      if (elapsed >= duration) {
        this.rafId = null;
        // guarantee we land exactly on the target value
        this.draw(to);
        options.onStop(from, to);
      } else {
        this.rafId = requestAnimationFrame(step);
      }
    };

    this.rafId = requestAnimationFrame(step);
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  destroy(): void {
    this.stop();
    this.cachedBackground = null;
    if (this.canvas.parentNode === this.el) {
      this.el.removeChild(this.canvas);
    }
  }
}
