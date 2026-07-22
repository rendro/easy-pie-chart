import { CanvasRenderer } from './canvas-renderer.js';
import type {
  IRenderer,
  TAnimateOptions,
  TEasingFn,
  TLegacyEasingFn,
  TOptions,
  TUserOptions,
} from './types.js';

export const defaultEasing: TOptions['easing'] = (t, b, c, d) => {
  t = t / (d / 2);
  if (t < 1) {
    return (c / 2) * t * t + b;
  }
  t -= 1;
  return (-c / 2) * (t * (t - 2) - 1) + b;
};

const noop = (): void => undefined;

export const defaultOptions: TOptions = {
  barColor: '#ef1e25',
  trackColor: '#f9f9f9',
  trackBorderColor: false,
  trackBorderWidth: 1,
  fillColor: false,
  scaleColor: '#dfe0e0',
  scaleLength: 5,
  scaleCount: 24,
  lineCap: 'round',
  lineWidth: 3,
  trackWidth: undefined,
  size: 110,
  rotate: 0,
  arcLength: 360,
  max: 100,
  responsive: false,
  canvasClass: 'easy-pie-chart-canvas',
  animate: {
    duration: 1000,
    enabled: true,
  },
  easing: defaultEasing,
  onStart: noop,
  onStep: noop,
  onStop: noop,
  renderer: CanvasRenderer,
};

const NUMBER_KEYS = [
  'scaleLength',
  'scaleCount',
  'lineWidth',
  'trackWidth',
  'trackBorderWidth',
  'size',
  'rotate',
  'arcLength',
  'max',
] as const;

const STRING_KEYS = [
  'barColor',
  'trackColor',
  'trackBorderColor',
  'fillColor',
  'scaleColor',
  'lineCap',
  'canvasClass',
] as const;

const BOOLEAN_KEYS = ['responsive'] as const;

/**
 * Read `data-*` attributes off the host element. `data-track-color="false"`
 * and `data-scale-color="false"` disable the respective feature.
 */
function optionsFromDataset(el: HTMLElement): TUserOptions {
  const data = el.dataset;
  if (!data) {
    return {};
  }

  const options: Record<string, unknown> = {};

  for (const key of NUMBER_KEYS) {
    const raw = data[key];
    if (raw != null && raw !== '') {
      const value = parseFloat(raw);
      if (!Number.isNaN(value)) {
        options[key] = value;
      }
    }
  }

  for (const key of STRING_KEYS) {
    const raw = data[key];
    if (raw != null && raw !== '') {
      options[key] = raw === 'false' ? false : raw;
    }
  }

  for (const key of BOOLEAN_KEYS) {
    const raw = data[key];
    if (raw != null && raw !== '') {
      options[key] = raw !== 'false';
    }
  }

  if (data.animate != null && data.animate !== '') {
    const duration = parseFloat(data.animate);
    options.animate = Number.isNaN(duration)
      ? data.animate !== 'false'
      : duration;
  }

  return options as TUserOptions;
}

function normalizeAnimate(
  animate: TUserOptions['animate'],
  fallback: TAnimateOptions,
): TAnimateOptions {
  if (typeof animate === 'number') {
    return { duration: animate, enabled: true };
  }
  if (typeof animate === 'boolean') {
    return { duration: fallback.duration, enabled: animate };
  }
  if (animate && typeof animate === 'object') {
    return { ...fallback, ...animate };
  }
  return fallback;
}

function resolveOptions(base: TOptions, user: TUserOptions): TOptions {
  const { animate, ...rest } = user;
  const merged = { ...base } as TOptions;

  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined) {
      (merged as Record<string, unknown>)[key] = value;
    }
  }

  merged.animate = normalizeAnimate(animate, base.animate);
  return merged;
}

const FUNCTION_KEYS = ['barColor', 'onStart', 'onStep', 'onStop'] as const;

/**
 * Bind every function option to the chart instance, so callbacks can reach the
 * host element via `this.el` — behaviour 2.x documented and relied on.
 * Arrow functions are unaffected, as always.
 */
function bindCallbacks(options: TOptions, ctx: EasyPieChart): void {
  for (const key of FUNCTION_KEYS) {
    const fn = options[key];
    if (typeof fn === 'function') {
      (options as Record<string, unknown>)[key] = fn.bind(ctx);
    }
  }
}

/**
 * Normalise whatever was passed as `easing` into the four-argument form the
 * renderer calls.
 *
 * Three shapes are accepted, all of which 2.x supported:
 *   - a `(t, b, c, d)` function — the modern signature
 *   - a `(chart, t, b, c, d)` function — 2.x's own signature, and jQuery UI's
 *   - the name of a jQuery easing, resolved against `jQuery.easing`
 *
 * Anything else, including an unresolvable name, falls back to the default.
 * 2.x did the same; 3.0 dropped it and any string reached the renderer as a
 * non-callable, throwing on every animation frame.
 */
function resolveEasing(raw: unknown, ctx: EasyPieChart): TEasingFn {
  if (typeof raw === 'function') {
    // arity 5 means the legacy signature, whose first argument is the chart
    if (raw.length >= 5) {
      const legacy = raw as TLegacyEasingFn;
      return (t, b, c, d) => legacy.call(ctx, ctx, t, b, c, d);
    }
    return (raw as TEasingFn).bind(ctx);
  }

  if (typeof raw === 'string') {
    const named = (globalThis as { jQuery?: { easing?: Record<string, unknown> } })
      .jQuery?.easing?.[raw];
    if (typeof named === 'function') {
      // jQuery easings take (x, t, b, c, d) and ignore x
      const legacy = named as TLegacyEasingFn;
      return (t, b, c, d) => legacy.call(ctx, ctx, t, b, c, d);
    }
  }

  return defaultEasing;
}

export class EasyPieChart {
  readonly el: HTMLElement;

  options: TOptions;

  /** Public so callers can reach `getCtx()`/`getCanvas()` to build gradients. */
  renderer: IRenderer;

  private currentValue = 0;
  private resizeObserver: ResizeObserver | null = null;

  constructor(el: HTMLElement, userOptions: TUserOptions = {}) {
    if (!el) {
      throw new Error('easy-pie-chart: no element given');
    }
    this.el = el;

    // data-* attributes win over the options object, matching the 2.x jQuery
    // plugin ($.extend({}, options, $(this).data())). That ordering is what
    // makes "shared JS defaults, per-element data-* overrides" work.
    this.options = resolveOptions(
      resolveOptions(defaultOptions, userOptions),
      optionsFromDataset(el),
    );
    bindCallbacks(this.options, this);
    this.options.easing = resolveEasing(userOptions.easing, this);

    this.renderer = new this.options.renderer(el, this.options);
    this.renderer.draw(this.currentValue);

    const percent = el.dataset?.percent;
    if (percent != null && percent !== '') {
      this.update(parseFloat(percent));
    }

    if (this.options.responsive) {
      this.observeResize();
    }
  }

  /**
   * Track the host element and resize the chart to fit. The host must get its
   * size from CSS (or a parent) rather than from the canvas, otherwise the two
   * would size each other.
   */
  private observeResize(): void {
    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => {
      const { width, height } = this.el.getBoundingClientRect();
      const size = Math.floor(Math.min(width, height || width));

      // ignore no-op and degenerate resizes; equality also stops the canvas
      // and the host from resizing each other in a loop
      if (size > 0 && size !== this.options.size) {
        this.setOptions({ size });
      }
    });
    this.resizeObserver.observe(this.el);
  }

  /** Current value of the chart. */
  get value(): number {
    return this.currentValue;
  }

  /**
   * Update the value of the chart. Non-numeric values are ignored so a bad
   * update cannot wedge the chart for all future ones.
   */
  update(newValue: number | string): this {
    const value = typeof newValue === 'number' ? newValue : parseFloat(newValue);
    if (Number.isNaN(value)) {
      return this;
    }

    if (this.options.animate.enabled) {
      this.renderer.animate(this.currentValue, value);
    } else {
      this.renderer.stop();
      this.renderer.draw(value);
    }
    this.currentValue = value;
    return this;
  }

  /**
   * Replace options and rebuild the renderer. The current value is redrawn
   * without animation.
   */
  setOptions(userOptions: TUserOptions): this {
    this.renderer.destroy();
    this.options = resolveOptions(this.options, userOptions);
    bindCallbacks(this.options, this);
    if (userOptions.easing !== undefined) {
      this.options.easing = resolveEasing(userOptions.easing, this);
    }
    this.renderer = new this.options.renderer(this.el, this.options);
    this.renderer.draw(this.currentValue);
    return this;
  }

  /** Stop a running animation, leaving the chart at the last drawn frame. */
  stop(): this {
    this.renderer.stop();
    return this;
  }

  disableAnimation(): this {
    this.options.animate.enabled = false;
    return this;
  }

  enableAnimation(): this {
    this.options.animate.enabled = true;
    return this;
  }

  /** Remove the canvas, stop observing resizes, cancel any running animation. */
  destroy(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.renderer.destroy();
  }
}
