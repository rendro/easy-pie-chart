import { describe, it, expect, beforeEach } from 'vitest';

import { registerJQueryPlugin } from '../src/jquery.js';
import type { EasyPieChart } from '../src/easypiechart.js';

/** Minimal stand-in for the slice of the jQuery API the plugin uses. */
function createFakeJQuery() {
  const store = new WeakMap<object, Record<string, unknown>>();

  const jq = {
    fn: {} as Record<string, unknown>,
    data(el: object, key: string, value?: unknown) {
      const bag = store.get(el) ?? {};
      if (value === undefined) {
        return bag[key];
      }
      bag[key] = value;
      store.set(el, bag);
      return value;
    },
    removeData(el: object, key: string) {
      delete store.get(el)?.[key];
    },
  };

  const select = (els: HTMLElement[]) =>
    Object.assign(Object.create(jq.fn), els, { length: els.length });

  return { jq, select };
}

describe('jQuery plugin', () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    el = document.createElement('span');
    document.body.appendChild(el);
  });

  it('throws when jQuery cannot be found', () => {
    expect(() => registerJQueryPlugin({})).toThrow(/jQuery not found/);
  });

  it('registers $.fn.easyPieChart', () => {
    const { jq } = createFakeJQuery();
    registerJQueryPlugin(jq);
    expect(typeof jq.fn.easyPieChart).toBe('function');
  });

  it('creates one chart per element and is chainable', () => {
    const { jq, select } = createFakeJQuery();
    registerJQueryPlugin(jq);

    const second = document.createElement('span');
    document.body.appendChild(second);
    const $els = select([el, second]);

    expect($els.easyPieChart({ animate: false })).toBe($els);
    expect(el.querySelector('canvas')).not.toBeNull();
    expect(second.querySelector('canvas')).not.toBeNull();
  });

  it('does not create a second chart on re-invocation', () => {
    const { jq, select } = createFakeJQuery();
    registerJQueryPlugin(jq);
    const $el = select([el]);

    $el.easyPieChart({ animate: false, size: 110 });
    $el.easyPieChart({ animate: false, size: 220 });

    expect(el.querySelectorAll('canvas')).toHaveLength(1);
    // the second call applies the new options to the existing instance
    expect(el.querySelector('canvas')!.width).toBe(220);
  });

  it('exposes the instance through $.data', () => {
    const { jq, select } = createFakeJQuery();
    registerJQueryPlugin(jq);
    select([el]).easyPieChart({ animate: false });

    const chart = jq.data(el, 'easyPieChart') as EasyPieChart;
    chart.update(75);
    expect(chart.value).toBe(75);
  });

  it("removes the chart on 'destroy'", () => {
    const { jq, select } = createFakeJQuery();
    registerJQueryPlugin(jq);
    const $el = select([el]);

    $el.easyPieChart({ animate: false });
    $el.easyPieChart('destroy');

    expect(el.querySelector('canvas')).toBeNull();
    expect(jq.data(el, 'easyPieChart')).toBeUndefined();
  });
});
