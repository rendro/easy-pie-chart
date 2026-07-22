/**
 * Compile-time tests. These assert the shape of the public types rather than
 * runtime behaviour — `npm run typecheck` failing is the failure signal.
 *
 * 3.1.0 shipped with callbacks bound at runtime but not typed that way, so the
 * documented gradient example did not compile for TypeScript users. Everything
 * here exists to stop that recurring.
 */
import { EasyPieChart } from '../src/easypiechart.js';
import type {
  IChartContext,
  IRenderer,
  TDurationFn,
  TOptions,
  TStrokeStyle,
  TUserOptions,
} from '../src/types.js';

declare const el: HTMLElement;

// `this` inside function options is the chart, not the options object
new EasyPieChart(el, {
  barColor() {
    const ctx = this.renderer.getCtx();
    const grad = ctx.createLinearGradient(0, 0, this.options.size, 0);
    grad.addColorStop(0, '#000');
    return grad;
  },
  onStart(from, to) {
    const a: number = from + to;
    const host: HTMLElement = this.el;
    void a;
    void host;
  },
  onStep(_from, _to, value) {
    this.el.textContent = String(Math.round(value));
    const current: number = this.value;
    void current;
  },
  onStop() {
    const r: IRenderer = this.renderer;
    void r;
  },
});

// arrow functions keep the outer `this` and must still be accepted
new EasyPieChart(el, {
  barColor: (value: number): TStrokeStyle => (value > 50 ? '#0f0' : '#f00'),
  onStep: (_f, _t, v) => void v,
});

// plain colors, gradients and patterns are all valid bar colors
declare const gradient: CanvasGradient;
declare const pattern: CanvasPattern;
new EasyPieChart(el, { barColor: '#fff' });
new EasyPieChart(el, { barColor: gradient });
new EasyPieChart(el, { barColor: pattern });

// animate accepts every documented shorthand
new EasyPieChart(el, { animate: false });
new EasyPieChart(el, { animate: 250 });
new EasyPieChart(el, { animate: { duration: 250 } });
declare const durationFn: TDurationFn;
new EasyPieChart(el, { animate: { duration: durationFn, enabled: true } });

// the 3.1 options are all typed
const opts: TUserOptions = {
  max: 250,
  arcLength: 180,
  responsive: true,
  fillColor: '#eee',
  trackBorderColor: '#333',
  trackBorderWidth: 2,
  canvasClass: 'x',
};
void opts;

// disabling features takes `false`, not just a string
new EasyPieChart(el, { trackColor: false, scaleColor: false, fillColor: false });

// public surface
const chart = new EasyPieChart(el, {});
const chained: EasyPieChart = chart.update(1).stop().enableAnimation();
const resolved: TOptions = chart.options;
const context: IChartContext = chart;
const host: HTMLElement = chart.el;
const current: number = chart.value;
void [chained, resolved, context, host, current];

// @ts-expect-error size must be a number
new EasyPieChart(el, { size: 'big' });
// @ts-expect-error lineCap is a fixed union
new EasyPieChart(el, { lineCap: 'nope' });
// @ts-expect-error max must be a number
new EasyPieChart(el, { max: 'lots' });
// @ts-expect-error unknown options are rejected
new EasyPieChart(el, { totallyUnknown: 1 });
// @ts-expect-error the element is required
new EasyPieChart();
