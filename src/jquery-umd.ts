import { registerJQueryPlugin } from './jquery';

/**
 * UMD entry point for the jQuery plugin. Importing `./jquery` auto-registers
 * `$.fn.easyPieChart` when a global jQuery is present; the exported function
 * is only needed when jQuery loads after this bundle.
 */
export default registerJQueryPlugin;
