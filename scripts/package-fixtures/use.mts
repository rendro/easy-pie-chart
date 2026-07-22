// ESM consumer. Compiled against the packed tarball, not the source tree —
// this is the only way to catch declaration bugs that the in-repo build cannot
// see (wrong module format, unresolvable relative imports, missing `this`).
import EPC, {
  EasyPieChart,
  CanvasRenderer,
  defaultEasing,
  defaultOptions,
} from 'easy-pie-chart';
import { registerJQueryPlugin } from 'easy-pie-chart/jquery';
import type {
  IChartContext,
  IRenderer,
  TDurationFn,
  TOptions,
  TStrokeStyle,
  TUserOptions,
} from 'easy-pie-chart';

declare const el: HTMLElement;

// the default export is the class itself, not a namespace
const chart: EasyPieChart = new EPC(el, { size: 120 });
const named: EasyPieChart = new EasyPieChart(el, {});
const resolved: TOptions = chart.options;
const context: IChartContext = chart;
const renderer: IRenderer = new CanvasRenderer(el, defaultOptions);
const eased: number = defaultEasing(0, 0, 100, 1000);

// the gradient example exactly as documented in the Readme
new EasyPieChart(el, {
  barColor() {
    const ctx = this.renderer.getCtx();
    const { size } = this.options;
    const gradient = ctx.createLinearGradient(0, 0, size, 0);
    gradient.addColorStop(0, '#22c55e');
    gradient.addColorStop(1, '#0ea5e9');
    return gradient;
  },
});

// the other documented snippets
new EasyPieChart(el, {
  max: 250,
  onStep(from, to, value) {
    this.el.querySelector('.label')!.textContent = `${Math.round(value)} / 250`;
  },
}).update(125);
new EasyPieChart(el, { arcLength: 180, rotate: -90, lineWidth: 10 });
new EasyPieChart(el, { responsive: true });

// every animate shorthand
const durationFn: TDurationFn = (from, to) => Math.abs(to - from) * 10;
new EasyPieChart(el, { animate: false });
new EasyPieChart(el, { animate: 250 });
new EasyPieChart(el, { animate: { duration: 250 } });
new EasyPieChart(el, { animate: { duration: durationFn, enabled: true } });

// disabling features takes false
const opts: TUserOptions = { trackColor: false, scaleColor: false };
const style: TStrokeStyle = '#fff';

registerJQueryPlugin({});

// options are genuinely typed, not silently `any`
// @ts-expect-error size must be a number
new EasyPieChart(el, { size: 'big' });
// @ts-expect-error lineCap is a fixed union
new EasyPieChart(el, { lineCap: 'nope' });
// @ts-expect-error unknown options are rejected
new EasyPieChart(el, { totallyUnknown: 1 });

export { chart, named, resolved, context, renderer, eased, opts, style };
