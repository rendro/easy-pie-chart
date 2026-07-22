import { EasyPieChart } from './easypiechart.js';
import type { TUserOptions } from './types.js';

const DATA_KEY = 'easyPieChart';

type TJQueryLike = {
  fn: Record<string, unknown>;
  data(el: unknown, key: string, value?: unknown): unknown;
  removeData(el: unknown, key: string): unknown;
};

/**
 * Register `$.fn.easyPieChart` on a jQuery instance.
 *
 * Called automatically on import when a global `jQuery` is present; call it
 * yourself when jQuery is loaded after this bundle or lives in a module scope.
 */
export function registerJQueryPlugin($?: unknown): void {
  const jq = ($ ??
    (globalThis as { jQuery?: unknown }).jQuery) as TJQueryLike | undefined;

  if (!jq || !jq.fn) {
    throw new Error(
      'easy-pie-chart: jQuery not found — pass it to registerJQueryPlugin($)',
    );
  }

  jq.fn[DATA_KEY] = function easyPieChart(
    this: ArrayLike<HTMLElement>,
    options?: TUserOptions | 'destroy',
  ) {
    for (let i = 0; i < this.length; i++) {
      const el = this[i];
      const existing = jq.data(el, DATA_KEY) as EasyPieChart | undefined;

      if (options === 'destroy') {
        existing?.destroy();
        jq.removeData(el, DATA_KEY);
        continue;
      }

      if (existing) {
        // re-invoking on an initialized element applies the new options
        if (options) {
          existing.setOptions(options);
        }
        continue;
      }

      jq.data(el, DATA_KEY, new EasyPieChart(el, options));
    }
    return this;
  };
}

if ((globalThis as { jQuery?: unknown }).jQuery) {
  registerJQueryPlugin();
}

export { EasyPieChart };
export default registerJQueryPlugin;
