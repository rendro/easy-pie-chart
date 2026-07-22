import type { IRenderer, TOptions } from './types.js';

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

  private cachedBackground: ImageData | null = null;
  private rafId: number | null = null;

  constructor(el: HTMLElement, options: TOptions) {
    this.el = el;
    this.options = options;

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'easy-pie-chart-canvas';
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

    let radius = (options.size - options.lineWidth) / 2;
    if (options.scaleColor && options.scaleLength) {
      // 2 is the distance between scale and bar
      radius -= options.scaleLength + 2;
    }
    this.radius = radius;
  }

  /**
   * Draw a circle segment around the center of the canvas.
   * @param percent float between -1 and 1
   */
  private drawCircle(color: string, lineWidth: number, percent: number): void {
    const p = Math.min(Math.max(-1, percent || 0), 1);
    // a zero-length arc with `lineCap: round` renders as a dot in most browsers
    if (p === 0) {
      return;
    }

    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.radius, 0, Math.PI * 2 * p, p < 0);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.stroke();
  }

  private drawScale(): void {
    const { ctx, options } = this;
    const count = options.scaleCount;

    ctx.lineWidth = 1;
    ctx.fillStyle = options.scaleColor as string;

    ctx.save();
    for (let i = count; i > 0; --i) {
      // every fourth line is drawn full length
      const isMajor = i % Math.max(1, Math.round(count / 4)) === 0;
      const length = isMajor ? options.scaleLength : options.scaleLength * 0.6;
      const offset = options.scaleLength - length;

      ctx.fillRect(-options.size / 2 + offset, 0, length, 1);
      ctx.rotate((Math.PI * 2) / count);
    }
    ctx.restore();
  }

  private drawBackground(): void {
    const { options } = this;
    if (options.scaleColor) {
      this.drawScale();
    }
    if (options.trackColor) {
      this.drawCircle(
        options.trackColor,
        options.trackWidth ?? options.lineWidth,
        1,
      );
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
   * @param percent between -100 and 100
   */
  draw(percent: number): void {
    const { ctx, options } = this;

    if (options.scaleColor || options.trackColor) {
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
        ? options.barColor(percent)
        : options.barColor;

    this.drawCircle(color, options.lineWidth, percent / 100);
  }

  animate(from: number, to: number): void {
    this.stop();

    const { options } = this;
    const startTime = Date.now();

    options.onStart(from, to);

    const step = (): void => {
      const elapsed = Math.min(Date.now() - startTime, options.animate.duration);
      const value = options.easing(
        elapsed,
        from,
        to - from,
        options.animate.duration,
      );

      this.draw(value);
      options.onStep(from, to, value);

      if (elapsed >= options.animate.duration) {
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
