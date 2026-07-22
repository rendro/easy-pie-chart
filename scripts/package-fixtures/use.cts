// CommonJS consumer. The UMD bundle sets module.exports to the constructor
// itself, so `import x = require()` must yield the class with the other
// exports hanging off it as statics.
import EasyPieChart = require('easy-pie-chart');
import registerJQueryPlugin = require('easy-pie-chart/jquery');

declare const el: HTMLElement;

const chart = new EasyPieChart(el, { size: 120, animate: false });
const value: number = chart.update(42).stop().value;
const host: HTMLElement = chart.el;

const { CanvasRenderer, defaultOptions, defaultEasing } = EasyPieChart;
const renderer = new CanvasRenderer(el, defaultOptions);
renderer.draw(10);
const eased: number = defaultEasing(0, 0, 100, 1000);

new EasyPieChart(el, { max: 250, arcLength: 180, responsive: true });
new EasyPieChart(el, {
  onStep(_from, _to, v) {
    this.el.textContent = String(v);
  },
});

registerJQueryPlugin({});

// @ts-expect-error size must be a number
new EasyPieChart(el, { size: 'big' });
// @ts-expect-error max must be a number
new EasyPieChart(el, { max: 'lots' });

export { chart, value, host, renderer, eased };
