import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { EasyPieChart } from '../src/easypiechart.js';
import { getFakeCtx } from './setup';

const TAU = Math.PI * 2;

function createEl(attrs: Record<string, string> = {}): HTMLElement {
  const el = document.createElement('span');
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  return el;
}

/** End angle of the last arc stroked, i.e. the bar. */
const lastArcAngle = () => getFakeCtx().arc.mock.calls.at(-1)![4] as number;

describe('3.1 options', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  describe('max (#180, #76)', () => {
    it('scales the bar against max instead of 100', () => {
      const chart = new EasyPieChart(createEl(), {
        animate: false,
        max: 250,
        scaleColor: false,
        trackColor: false,
      });

      chart.update(125);

      expect(lastArcAngle()).toBeCloseTo(TAU / 2);
    });

    it('defaults to 100 so existing charts are unaffected', () => {
      const chart = new EasyPieChart(createEl(), {
        animate: false,
        scaleColor: false,
        trackColor: false,
      });

      chart.update(50);

      expect(lastArcAngle()).toBeCloseTo(TAU / 2);
    });

    it('reports the raw value, not the percentage', () => {
      const chart = new EasyPieChart(createEl(), { animate: false, max: 250 });
      chart.update(125);
      expect(chart.value).toBe(125);
    });

    it('passes the raw value to a barColor function', () => {
      const barColor = vi.fn().mockReturnValue('#000');
      const chart = new EasyPieChart(createEl(), {
        animate: false,
        max: 250,
        barColor,
      });

      chart.update(125);

      expect(barColor).toHaveBeenLastCalledWith(125);
    });

    it('clamps beyond max rather than overdrawing', () => {
      const chart = new EasyPieChart(createEl(), {
        animate: false,
        max: 50,
        scaleColor: false,
        trackColor: false,
      });

      chart.update(500);

      expect(lastArcAngle()).toBeCloseTo(TAU);
    });
  });

  describe('arcLength (#110)', () => {
    it('spans only the requested arc at full value', () => {
      const chart = new EasyPieChart(createEl(), {
        animate: false,
        arcLength: 180,
        scaleColor: false,
        trackColor: false,
      });

      chart.update(100);

      expect(lastArcAngle()).toBeCloseTo(Math.PI);
    });

    it('scales intermediate values within the arc', () => {
      const chart = new EasyPieChart(createEl(), {
        animate: false,
        arcLength: 180,
        scaleColor: false,
        trackColor: false,
      });

      chart.update(50);

      expect(lastArcAngle()).toBeCloseTo(Math.PI / 2);
    });

    it('draws a full ring by default', () => {
      const chart = new EasyPieChart(createEl(), {
        animate: false,
        scaleColor: false,
        trackColor: false,
      });

      chart.update(100);

      expect(lastArcAngle()).toBeCloseTo(TAU);
    });

    it('clamps out-of-range arc lengths', () => {
      const chart = new EasyPieChart(createEl(), {
        animate: false,
        arcLength: 720,
        scaleColor: false,
        trackColor: false,
      });

      chart.update(100);

      expect(lastArcAngle()).toBeCloseTo(TAU);
    });

    it('draws the track across the same arc', () => {
      new EasyPieChart(createEl(), {
        animate: false,
        arcLength: 180,
        scaleColor: false,
        trackColor: '#eee',
      });

      // the track is the first arc drawn, at fraction 1
      expect(getFakeCtx().arc.mock.calls[0][4]).toBeCloseTo(Math.PI);
    });
  });

  describe('fillColor (#127)', () => {
    it('fills the inner disc', () => {
      new EasyPieChart(createEl(), { animate: false, fillColor: '#eef' });
      expect(getFakeCtx().fill).toHaveBeenCalled();
    });

    it('does not fill when disabled', () => {
      new EasyPieChart(createEl(), { animate: false });
      expect(getFakeCtx().fill).not.toHaveBeenCalled();
    });

    it('fills inside the track, not over it', () => {
      new EasyPieChart(createEl(), {
        animate: false,
        fillColor: '#eef',
        trackWidth: 20,
        scaleColor: false,
      });
      const ctx = getFakeCtx();
      const fillRadius = ctx.arc.mock.calls[0][2] as number;
      const trackRadius = ctx.arc.mock.calls[1][2] as number;

      expect(fillRadius).toBeLessThan(trackRadius);
    });
  });

  describe('canvasClass (#152)', () => {
    it('defaults to easy-pie-chart-canvas', () => {
      const el = createEl();
      new EasyPieChart(el, { animate: false });
      expect(el.querySelector('canvas')!.className).toBe(
        'easy-pie-chart-canvas',
      );
    });

    it('honours a custom class', () => {
      const el = createEl();
      new EasyPieChart(el, { animate: false, canvasClass: 'c-chart-pie__canvas' });
      expect(el.querySelector('canvas')!.className).toBe('c-chart-pie__canvas');
    });

    it('can be set from a data attribute', () => {
      const el = createEl({ 'data-canvas-class': 'from-data' });
      new EasyPieChart(el, { animate: false });
      expect(el.querySelector('canvas')!.className).toBe('from-data');
    });
  });

  describe('track border (#90)', () => {
    it('strokes a hairline on both edges of the track', () => {
      new EasyPieChart(createEl(), {
        animate: false,
        scaleColor: false,
        trackColor: '#eee',
        trackBorderColor: '#333',
        trackWidth: 10,
      });
      const ctx = getFakeCtx();
      // track, then inner border, then outer border
      const [track, inner, outer] = ctx.arc.mock.calls.map((c) => c[2] as number);

      expect(inner).toBeLessThan(track);
      expect(outer).toBeGreaterThan(track);
      expect(track - inner).toBeCloseTo(outer - track);
    });

    it('is off by default', () => {
      new EasyPieChart(createEl(), {
        animate: false,
        scaleColor: false,
        trackColor: '#eee',
      });
      // just the track, no bar yet at value 0
      expect(getFakeCtx().arc).toHaveBeenCalledTimes(1);
    });
  });

  describe('animate.duration as a function (#103)', () => {
    it('derives the duration from the transition', () => {
      const duration = vi.fn((from: number, to: number) =>
        Math.abs(to - from) < 25 ? 100 : 1000,
      );
      const onStop = vi.fn();
      const chart = new EasyPieChart(createEl(), {
        animate: { duration, enabled: true },
        onStop,
      });

      chart.update(10);
      vi.advanceTimersByTime(150);

      expect(duration).toHaveBeenCalledWith(0, 10);
      expect(onStop).toHaveBeenCalledTimes(1);
    });

    it('uses the long branch for a big jump', () => {
      const duration = (from: number, to: number) =>
        Math.abs(to - from) < 25 ? 100 : 1000;
      const onStop = vi.fn();
      const chart = new EasyPieChart(createEl(), {
        animate: { duration, enabled: true },
        onStop,
      });

      chart.update(90);
      vi.advanceTimersByTime(150);
      expect(onStop).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1000);
      expect(onStop).toHaveBeenCalledTimes(1);
    });
  });

  describe('responsive (#56)', () => {
    class FakeResizeObserver {
      static instances: FakeResizeObserver[] = [];
      observed: Element[] = [];
      disconnected = false;
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

    const sizeEl = (el: HTMLElement, size: number) => {
      el.getBoundingClientRect = () =>
        ({ width: size, height: size }) as DOMRect;
    };

    it('does not observe unless enabled', () => {
      new EasyPieChart(createEl(), { animate: false });
      expect(FakeResizeObserver.instances).toHaveLength(0);
    });

    it('observes the host element when enabled', () => {
      const el = createEl();
      sizeEl(el, 110);
      new EasyPieChart(el, { animate: false, responsive: true });

      expect(FakeResizeObserver.instances).toHaveLength(1);
      expect(FakeResizeObserver.instances[0].observed).toEqual([el]);
    });

    it('resizes the canvas when the host changes size', () => {
      const el = createEl();
      sizeEl(el, 110);
      const chart = new EasyPieChart(el, { animate: false, responsive: true });

      sizeEl(el, 220);
      FakeResizeObserver.instances[0].cb();

      expect(chart.options.size).toBe(220);
      expect(el.querySelectorAll('canvas')).toHaveLength(1);
      expect(el.querySelector('canvas')!.width).toBe(220);
    });

    it('preserves the current value across a resize', () => {
      const el = createEl();
      sizeEl(el, 110);
      const chart = new EasyPieChart(el, { animate: false, responsive: true });
      chart.update(42);

      sizeEl(el, 200);
      FakeResizeObserver.instances[0].cb();

      expect(chart.value).toBe(42);
    });

    it('ignores a resize to the same size, so it cannot loop', () => {
      const el = createEl();
      sizeEl(el, 110);
      const chart = new EasyPieChart(el, { animate: false, responsive: true });
      const canvas = el.querySelector('canvas');

      FakeResizeObserver.instances[0].cb();
      FakeResizeObserver.instances[0].cb();

      // the canvas was never rebuilt
      expect(el.querySelector('canvas')).toBe(canvas);
      expect(chart.options.size).toBe(110);
    });

    it('ignores a collapsed host', () => {
      const el = createEl();
      sizeEl(el, 110);
      const chart = new EasyPieChart(el, { animate: false, responsive: true });

      sizeEl(el, 0);
      FakeResizeObserver.instances[0].cb();

      expect(chart.options.size).toBe(110);
    });

    it('disconnects on destroy', () => {
      const el = createEl();
      sizeEl(el, 110);
      const chart = new EasyPieChart(el, { animate: false, responsive: true });

      chart.destroy();

      expect(FakeResizeObserver.instances[0].disconnected).toBe(true);
    });

    it('degrades quietly where ResizeObserver is missing', () => {
      vi.stubGlobal('ResizeObserver', undefined);
      const el = createEl();
      expect(
        () => new EasyPieChart(el, { animate: false, responsive: true }),
      ).not.toThrow();
    });
  });
});
