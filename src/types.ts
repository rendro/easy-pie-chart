export type TLineCap = 'butt' | 'round' | 'square';

/** Anything canvas accepts as a stroke style. */
export type TStrokeStyle = string | CanvasGradient | CanvasPattern;

/**
 * Easing function.
 * @param t elapsed time in ms
 * @param b begin value
 * @param c change in value (end - begin)
 * @param d total duration in ms
 */
export type TEasingFn = (t: number, b: number, c: number, d: number) => number;

export type TBarColorFn = (value: number) => TStrokeStyle;

/** Animation duration in ms, or a function deriving it from the transition. */
export type TDurationFn = (from: number, to: number) => number;

export type TAnimateOptions = {
  duration: number | TDurationFn;
  enabled: boolean;
};

export type TOptions = {
  /**
   * Bar color: a CSS color string, a canvas gradient/pattern, or a function
   * receiving the current value and returning one of those.
   */
  barColor: TStrokeStyle | TBarColorFn;
  /** Track color, or `false` to disable the track. */
  trackColor: string | false;
  /** Color of the thin border along both edges of the track, or `false`. */
  trackBorderColor: string | false;
  /** Width of the track border in px. */
  trackBorderWidth: number;
  /** Fill color for the disc inside the ring, or `false` to leave it clear. */
  fillColor: string | false;
  /** Scale line color, or `false` to disable the scale. */
  scaleColor: string | false;
  /** Length of the scale lines in px (reduces the radius of the chart). */
  scaleLength: number;
  /** Number of scale lines drawn around the chart. */
  scaleCount: number;
  lineCap: TLineCap;
  /** Width of the bar line in px. */
  lineWidth: number;
  /** Width of the track line in px. Defaults to `lineWidth`. */
  trackWidth: number | undefined;
  /** Size of the chart in px. Always a square. */
  size: number;
  /** Rotation of the whole chart in degrees. */
  rotate: number;
  /**
   * How much of the circle the chart spans, in degrees. 360 is a full ring;
   * 180 with `rotate: -90` gives a semi-circular gauge.
   */
  arcLength: number;
  /** The value that corresponds to a full bar. */
  max: number;
  /** Track the host element's size and redraw when it changes. */
  responsive: boolean;
  /** Class applied to the generated canvas element. */
  canvasClass: string;
  animate: TAnimateOptions;
  easing: TEasingFn;
  onStart: (from: number, to: number) => void;
  onStep: (from: number, to: number, currentValue: number) => void;
  onStop: (from: number, to: number) => void;
  renderer: TRendererCtor;
};

/**
 * Options accepted by the constructor. `animate` additionally accepts the
 * legacy shorthands: a number (duration) or `false` (disabled).
 */
export type TUserOptions = Partial<
  Omit<TOptions, 'animate'> & {
    animate: Partial<TAnimateOptions> | number | boolean;
  }
>;

export interface IRenderer {
  draw(value: number): void;
  animate(from: number, to: number): void;
  stop(): void;
  clear(): void;
  destroy(): void;
  /** Canvas-backed renderers expose these so callers can build gradients. */
  getCanvas?(): HTMLCanvasElement;
  getCtx?(): CanvasRenderingContext2D;
}

export type TRendererCtor = new (
  el: HTMLElement,
  options: TOptions,
) => IRenderer;
