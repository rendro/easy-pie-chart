export type TLineCap = 'butt' | 'round' | 'square';

/**
 * Easing function.
 * @param t elapsed time in ms
 * @param b begin value
 * @param c change in value (end - begin)
 * @param d total duration in ms
 */
export type TEasingFn = (t: number, b: number, c: number, d: number) => number;

/** Anything canvas accepts as a stroke style. */
export type TStrokeStyle = string | CanvasGradient | CanvasPattern;

export type TBarColorFn = (percent: number) => TStrokeStyle;

export type TAnimateOptions = {
  duration: number;
  enabled: boolean;
};

export type TOptions = {
  /**
   * Bar color: a CSS color string, a canvas gradient/pattern, or a function
   * receiving the current percent and returning one of those.
   */
  barColor: TStrokeStyle | TBarColorFn;
  /** Track color, or `false` to disable the track. */
  trackColor: string | false;
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
  draw(percent: number): void;
  animate(from: number, to: number): void;
  stop(): void;
  clear(): void;
  destroy(): void;
  /** Canvas-backed renderers expose these so callers can build gradients. */
  getCanvas?(): HTMLCanvasElement;
  getCtx?(): CanvasRenderingContext2D;
}

export type TRendererCtor = new (el: HTMLElement, options: TOptions) => IRenderer;
