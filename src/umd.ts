import { CanvasRenderer } from './canvas-renderer.js';
import { EasyPieChart, defaultEasing, defaultOptions } from './easypiechart.js';

/**
 * UMD entry point. Script-tag users expect `window.EasyPieChart` to be the
 * constructor itself, so the extra exports ride along as static properties
 * rather than sitting on a namespace object.
 */
export default Object.assign(EasyPieChart, {
  EasyPieChart,
  CanvasRenderer,
  defaultEasing,
  defaultOptions,
});
