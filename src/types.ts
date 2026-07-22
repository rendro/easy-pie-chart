export type TLineCap = 'butt' | 'round' | 'square';

/**
 * Easing function.
 * @param t elapsed time in ms
 * @param b begin value
 * @param c change in value (end - begin)
 * @param d total duration in ms
 */
export type TEasingFn = (t: number, b: number, c: number, d: number) => number;

export type TBarColorFn = (percent: number) => string;

export type TAnimateOptions = {
  duration: number;
  enabled: boolean;
};

export type TOptions = {
  /** Bar color as a CSS color string, or a function receiving the current percent. */
  barColor: string | TBarColorFn;
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
}

export type TRendererCtor = new (el: HTMLElement, options: TOptions) => IRenderer;
