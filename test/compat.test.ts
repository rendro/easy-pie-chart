import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { EasyPieChart } from '../src/easypiechart.js';
import { getFakeCtx } from './setup.js';

/**
 * Compatibility with 2.x. easy-pie-chart has a large installed base on 2.1.7,
 * so anything that silently changes behaviour for a config that worked there
 * is a bug, not a design choice.
 */
function createEl(attrs: Record<string, string> = {}): HTMLElement {
  const el = document.createElement('div');
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  return el;
}

describe('2.x compatibility', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    delete (globalThis as { jQuery?: unknown }).jQuery;
  });

  describe('easing', () => {
    it('a string name does not crash the animation', () => {
      // 2.x fell back to the default for any string; 3.0/3.1 passed it
      // through and threw "options.easing is not a function" every frame
      const onStop = vi.fn();
      const chart = new EasyPieChart(createEl(), {
        animate: { duration: 50 },
        easing: 'easeOutBounce',
        onStop,
      });

      expect(() => {
        chart.update(50);
        vi.advanceTimersByTime(200);
      }).not.toThrow();
      expect(onStop).toHaveBeenCalledTimes(1);
    });

    it('resolves a name against jQuery.easing when present', () => {
      const easeOutBounce = vi.fn(
        (_x: unknown, t: number, b: number, c: number, d: number) =>
          b + c * (t / d),
      );
      (globalThis as { jQuery?: unknown }).jQuery = {
        easing: { easeOutBounce },
      };

      const chart = new EasyPieChart(createEl(), {
        animate: { duration: 50 },
        easing: 'easeOutBounce',
      });
      chart.update(50);
      vi.advanceTimersByTime(200);

      expect(easeOutBounce).toHaveBeenCalled();
    });

    it('falls back to the default for an unknown name', () => {
      const chart = new EasyPieChart(createEl(), {
        animate: { duration: 50 },
        easing: 'nopeNotReal',
      });
      expect(() => {
        chart.update(50);
        vi.advanceTimersByTime(200);
      }).not.toThrow();
    });

    it('accepts the 2.x five-argument signature', () => {
      // 2.x called easing(chart, t, b, c, d)
      const legacy = vi.fn(
        (_chart: unknown, t: number, b: number, c: number, d: number) =>
          b + c * (t / d),
      );
      const chart = new EasyPieChart(createEl(), {
        animate: { duration: 50 },
        easing: legacy,
      });
      chart.update(50);
      vi.advanceTimersByTime(200);

      expect(legacy).toHaveBeenCalled();
      const [first, t, b, c, d] = legacy.mock.calls[0];
      expect(first).toBe(chart);
      expect(typeof t).toBe('number');
      expect(b).toBe(0);
      expect(c).toBe(50);
      expect(d).toBe(50);
    });

    it('still accepts the modern four-argument signature', () => {
      const modern = vi.fn((t: number, b: number, c: number, d: number) =>
        b + c * (t / d),
      );
      const chart = new EasyPieChart(createEl(), {
        animate: { duration: 50 },
        easing: modern,
      });
      chart.update(50);
      vi.advanceTimersByTime(200);

      expect(modern).toHaveBeenCalled();
      expect(modern.mock.calls[0]).toHaveLength(4);
    });
  });

  describe('data-* precedence', () => {
    it('data attributes beat the options object, as in the 2.x jQuery plugin', () => {
      const el = createEl({ 'data-size': '200' });
      const chart = new EasyPieChart(el, { size: 110, animate: false });

      expect(chart.options.size).toBe(200);
    });

    // issue #146: shared JS options, per-element data-* overrides
    it('gives each element its own data-bar-color', () => {
      const els = ['#ff0000', '#00ff00', '#0000ff'].map((c) =>
        createEl({ 'data-bar-color': c }),
      );
      const colors = els.map(
        (el) =>
          new EasyPieChart(el, { barColor: '#ef1e25', animate: false }).options
            .barColor,
      );

      expect(new Set(colors).size).toBe(3);
      expect(colors).toEqual(['#ff0000', '#00ff00', '#0000ff']);
    });

    it('falls back to the options object where no attribute is set', () => {
      const el = createEl({ 'data-size': '200' });
      const chart = new EasyPieChart(el, {
        size: 110,
        barColor: '#123456',
        animate: false,
      });

      expect(chart.options.size).toBe(200);
      expect(chart.options.barColor).toBe('#123456');
    });
  });

  describe('the 2.x public surface still exists', () => {
    it('keeps update / enableAnimation / disableAnimation chainable', () => {
      const chart = new EasyPieChart(createEl(), { animate: false });
      expect(chart.update(10).disableAnimation().enableAnimation()).toBe(chart);
    });

    it('exposes el and options', () => {
      const el = createEl();
      const chart = new EasyPieChart(el, { animate: false });
      expect(chart.el).toBe(el);
      expect(chart.options.size).toBe(110);
    });

    it('honours animate given as a plain number', () => {
      const chart = new EasyPieChart(createEl(), { animate: 2000 });
      expect(chart.options.animate).toEqual({ duration: 2000, enabled: true });
    });
  });
});
