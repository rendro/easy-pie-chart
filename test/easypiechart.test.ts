import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { EasyPieChart, defaultEasing } from '../src/easypiechart.js';
import { getFakeCtx } from './setup';

function createEl(attrs: Record<string, string> = {}): HTMLElement {
  const el = document.createElement('span');
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
  document.body.appendChild(el);
  return el;
}

describe('EasyPieChart', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('appends a canvas to the host element', () => {
      const el = createEl();
      new EasyPieChart(el, { animate: false });

      const canvas = el.querySelector('canvas');
      expect(canvas).not.toBeNull();
      expect(canvas!.className).toBe('easy-pie-chart-canvas');
    });

    it('throws without an element', () => {
      expect(
        () => new EasyPieChart(undefined as unknown as HTMLElement),
      ).toThrow(/no element given/);
    });

    it('sizes the canvas from the size option', () => {
      const el = createEl();
      new EasyPieChart(el, { size: 200, animate: false });

      const canvas = el.querySelector('canvas')!;
      expect(canvas.width).toBe(200);
      expect(canvas.height).toBe(200);
      expect(canvas.style.width).toBe('200px');
    });

    it('scales the backing store on retina displays', () => {
      Object.defineProperty(window, 'devicePixelRatio', {
        value: 2,
        configurable: true,
      });
      const el = createEl();
      new EasyPieChart(el, { size: 100, animate: false });

      const canvas = el.querySelector('canvas')!;
      expect(canvas.width).toBe(200);
      expect(canvas.style.width).toBe('100px');
      expect(getFakeCtx().scale).toHaveBeenCalledWith(2, 2);
    });
  });

  describe('options from data attributes', () => {
    it('reads numeric options', () => {
      const el = createEl({ 'data-size': '400', 'data-line-width': '7' });
      const chart = new EasyPieChart(el, { animate: false });

      expect(chart.options.size).toBe(400);
      expect(chart.options.lineWidth).toBe(7);
      expect(el.querySelector('canvas')!.width).toBe(400);
    });

    it('reads string options and treats "false" as disabled', () => {
      const el = createEl({
        'data-bar-color': '#00ff00',
        'data-track-color': 'false',
      });
      const chart = new EasyPieChart(el, { animate: false });

      expect(chart.options.barColor).toBe('#00ff00');
      expect(chart.options.trackColor).toBe(false);
    });

    it('lets explicit options win over data attributes', () => {
      const el = createEl({ 'data-size': '400' });
      const chart = new EasyPieChart(el, { size: 200, animate: false });

      expect(chart.options.size).toBe(200);
    });

    it('applies data-percent as the initial value', () => {
      const el = createEl({ 'data-percent': '42' });
      const chart = new EasyPieChart(el, { animate: false });

      expect(chart.value).toBe(42);
    });
  });

  describe('animate option shorthands', () => {
    it('accepts a number as the duration', () => {
      const chart = new EasyPieChart(createEl(), { animate: 250 });
      expect(chart.options.animate).toEqual({ duration: 250, enabled: true });
    });

    it('accepts false to disable', () => {
      const chart = new EasyPieChart(createEl(), { animate: false });
      expect(chart.options.animate.enabled).toBe(false);
    });

    it('merges a partial object onto the defaults', () => {
      const chart = new EasyPieChart(createEl(), { animate: { duration: 10 } });
      expect(chart.options.animate).toEqual({ duration: 10, enabled: true });
    });
  });

  describe('update', () => {
    it('stores the new value and returns the instance', () => {
      const chart = new EasyPieChart(createEl(), { animate: false });
      expect(chart.update(60)).toBe(chart);
      expect(chart.value).toBe(60);
    });

    it('parses numeric strings', () => {
      const chart = new EasyPieChart(createEl(), { animate: false });
      chart.update('33');
      expect(chart.value).toBe(33);
    });

    it('ignores non-numeric values instead of wedging the chart', () => {
      const chart = new EasyPieChart(createEl(), { animate: false });
      chart.update(50);
      chart.update('not a number');
      expect(chart.value).toBe(50);

      chart.update(70);
      expect(chart.value).toBe(70);
    });

    it('draws the bar arc with the value as a fraction', () => {
      const chart = new EasyPieChart(createEl(), {
        animate: false,
        scaleColor: false,
        trackColor: false,
      });
      const ctx = getFakeCtx();
      ctx.arc.mockClear();

      chart.update(50);

      expect(ctx.arc).toHaveBeenCalledTimes(1);
      const [, , , , endAngle, counterClockwise] = ctx.arc.mock.calls[0];
      expect(endAngle).toBeCloseTo(Math.PI);
      expect(counterClockwise).toBe(false);
    });

    it('draws negative values counter-clockwise', () => {
      const chart = new EasyPieChart(createEl(), {
        animate: false,
        scaleColor: false,
        trackColor: false,
      });
      const ctx = getFakeCtx();
      ctx.arc.mockClear();

      chart.update(-25);

      const [, , , , endAngle, counterClockwise] = ctx.arc.mock.calls[0];
      expect(endAngle).toBeCloseTo(-Math.PI / 2);
      expect(counterClockwise).toBe(true);
    });

    it('does not stroke a bar at 0% (would render as a dot)', () => {
      const chart = new EasyPieChart(createEl(), {
        animate: false,
        scaleColor: false,
        trackColor: false,
      });
      const ctx = getFakeCtx();
      ctx.arc.mockClear();

      chart.update(0);

      expect(ctx.arc).not.toHaveBeenCalled();
    });

    it('calls barColor with the drawn percent when it is a function', () => {
      const barColor = vi.fn().mockReturnValue('#123456');
      const chart = new EasyPieChart(createEl(), { animate: false, barColor });

      chart.update(80);

      expect(barColor).toHaveBeenLastCalledWith(80);
    });
  });

  describe('animation', () => {
    it('runs the callbacks and lands exactly on the target value', () => {
      const onStart = vi.fn();
      const onStep = vi.fn();
      const onStop = vi.fn();
      const chart = new EasyPieChart(createEl(), {
        animate: { duration: 100 },
        onStart,
        onStep,
        onStop,
        scaleColor: false,
        trackColor: false,
      });
      const ctx = getFakeCtx();

      chart.update(100);
      expect(onStart).toHaveBeenCalledWith(0, 100);

      vi.advanceTimersByTime(500);

      expect(onStop).toHaveBeenCalledWith(0, 100);
      expect(onStep).toHaveBeenCalled();

      // last arc drawn is the full target value
      const [, , , , endAngle] = ctx.arc.mock.calls.at(-1)!;
      expect(endAngle).toBeCloseTo(Math.PI * 2);
    });

    it('stop() halts a running animation', () => {
      const onStop = vi.fn();
      const chart = new EasyPieChart(createEl(), {
        animate: { duration: 1000 },
        onStop,
      });

      chart.update(100);
      chart.stop();
      vi.advanceTimersByTime(2000);

      expect(onStop).not.toHaveBeenCalled();
    });

    it('a new update cancels the previous animation', () => {
      const onStart = vi.fn();
      const onStop = vi.fn();
      const chart = new EasyPieChart(createEl(), {
        animate: { duration: 1000 },
        onStart,
        onStop,
      });

      chart.update(50);
      vi.advanceTimersByTime(100);
      chart.update(80);
      vi.advanceTimersByTime(2000);

      expect(onStart).toHaveBeenCalledTimes(2);
      // only the second animation reaches completion
      expect(onStop).toHaveBeenCalledTimes(1);
      expect(onStop).toHaveBeenCalledWith(50, 80);
    });

    it('enable/disableAnimation toggle the animated path', () => {
      const onStart = vi.fn();
      const chart = new EasyPieChart(createEl(), { onStart });

      chart.disableAnimation().update(10);
      expect(onStart).not.toHaveBeenCalled();

      chart.enableAnimation().update(20);
      expect(onStart).toHaveBeenCalledTimes(1);
    });
  });

  describe('setOptions', () => {
    it('replaces the canvas and keeps the current value', () => {
      const el = createEl();
      const chart = new EasyPieChart(el, { animate: false, size: 110 });
      chart.update(40);

      chart.setOptions({ size: 220 });

      expect(el.querySelectorAll('canvas')).toHaveLength(1);
      expect(el.querySelector('canvas')!.width).toBe(220);
      expect(chart.value).toBe(40);
    });
  });

  describe('destroy', () => {
    it('removes the canvas', () => {
      const el = createEl();
      const chart = new EasyPieChart(el, { animate: false });

      chart.destroy();

      expect(el.querySelector('canvas')).toBeNull();
    });
  });

  describe('defaultEasing', () => {
    it('starts at the begin value and ends at the target', () => {
      expect(defaultEasing(0, 0, 100, 1000)).toBeCloseTo(0);
      expect(defaultEasing(1000, 0, 100, 1000)).toBeCloseTo(100);
    });

    it('is monotonically increasing', () => {
      let previous = -Infinity;
      for (let t = 0; t <= 1000; t += 50) {
        const value = defaultEasing(t, 0, 100, 1000);
        expect(value).toBeGreaterThanOrEqual(previous);
        previous = value;
      }
    });
  });
});
