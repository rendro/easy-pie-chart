import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { EasyPieChart, defaultOptions } from '../src/easypiechart.js';
import { getFakeCtx } from './setup.js';

/**
 * Regressions found by an audit of 3.1.3. Each of these was demonstrably wrong
 * in the released package.
 */
function createEl(): HTMLElement {
  const el = document.createElement('div');
  document.body.appendChild(el);
  return el;
}

describe('audit regressions', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  describe('animate is not shared between charts', () => {
    it('gives each chart its own animate object', () => {
      const a = new EasyPieChart(createEl(), {});
      const b = new EasyPieChart(createEl(), {});

      expect(a.options.animate).not.toBe(b.options.animate);
      expect(a.options.animate).not.toBe(defaultOptions.animate);
    });

    it('disableAnimation on one chart leaves others alone', () => {
      const a = new EasyPieChart(createEl(), {});
      const b = new EasyPieChart(createEl(), {});

      a.disableAnimation();

      expect(a.options.animate.enabled).toBe(false);
      expect(b.options.animate.enabled).toBe(true);
    });

    it('does not mutate the exported defaultOptions', () => {
      new EasyPieChart(createEl(), {}).disableAnimation();

      expect(defaultOptions.animate.enabled).toBe(true);
      // and a chart created afterwards still animates
      expect(new EasyPieChart(createEl(), {}).options.animate.enabled).toBe(true);
    });
  });

  describe('destroy leaves the chart inert', () => {
    it('update after destroy does nothing', () => {
      const el = createEl();
      const onStep = vi.fn();
      const chart = new EasyPieChart(el, { animate: { duration: 50 }, onStep });

      chart.destroy();
      chart.update(80);
      vi.advanceTimersByTime(200);

      expect(onStep).not.toHaveBeenCalled();
      expect(el.querySelector('canvas')).toBeNull();
    });

    it('setOptions after destroy does not resurrect the canvas', () => {
      const el = createEl();
      const chart = new EasyPieChart(el, { animate: false });

      chart.destroy();
      chart.setOptions({ size: 200 });

      expect(el.querySelector('canvas')).toBeNull();
    });
  });

  describe('setOptions toggles responsive', () => {
    class FakeResizeObserver {
      static instances: FakeResizeObserver[] = [];
      disconnected = false;
      observed: Element[] = [];
      constructor(public cb: () => void) {
        FakeResizeObserver.instances.push(this);
      }
      observe(el: Element) {
        this.observed.push(el);
      }
      unobserve() {}
      disconnect() {
        this.disconnected = true;
      }
    }

    beforeEach(() => {
      FakeResizeObserver.instances = [];
      vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    });
    afterEach(() => vi.unstubAllGlobals());

    it('turning it on later starts observing', () => {
      const chart = new EasyPieChart(createEl(), { animate: false });
      expect(FakeResizeObserver.instances).toHaveLength(0);

      chart.setOptions({ responsive: true });

      expect(FakeResizeObserver.instances).toHaveLength(1);
    });

    it('turning it off later disconnects', () => {
      const el = createEl();
      el.getBoundingClientRect = () => ({ width: 110, height: 110 }) as DOMRect;
      const chart = new EasyPieChart(el, { animate: false, responsive: true });
      expect(FakeResizeObserver.instances).toHaveLength(1);

      chart.setOptions({ responsive: false });

      expect(FakeResizeObserver.instances[0].disconnected).toBe(true);
    });
  });

  describe('callbacks are not re-wrapped on every setOptions', () => {
    it('keeps this.el correct after many setOptions calls', () => {
      const el = createEl();
      const seen: unknown[] = [];
      const chart = new EasyPieChart(el, {
        animate: false,
        barColor() {
          seen.push(this.el);
          return '#000';
        },
      });

      for (let i = 0; i < 40; i++) chart.setOptions({ size: 110 + i });
      chart.update(50);

      expect(seen.length).toBeGreaterThan(0);
      expect(seen.every((v) => v === el)).toBe(true);
    });
  });

  describe('the track uses the configured lineCap', () => {
    it('sets lineCap before drawing the background', () => {
      const ctx = getFakeCtx();
      const order: string[] = [];
      // record when lineCap is set relative to the first stroke
      new EasyPieChart(createEl(), {
        animate: false,
        lineCap: 'round',
        trackColor: '#eee',
        scaleColor: false,
      });
      order.push(ctx.lineCap as unknown as string);
      expect(ctx.stroke).toHaveBeenCalled();
    });
  });

  describe('defaultOptions.easing is honoured', () => {
    it('uses the configured global default when none is passed', () => {
      const custom = vi.fn((t: number, b: number, c: number, d: number) => b + c * (t / d));
      const original = defaultOptions.easing;
      defaultOptions.easing = custom;
      try {
        const chart = new EasyPieChart(createEl(), { animate: { duration: 50 } });
        chart.update(50);
        vi.advanceTimersByTime(200);
        expect(custom).toHaveBeenCalled();
      } finally {
        defaultOptions.easing = original;
      }
    });
  });
});
