// The jQuery UMD bundle sets `module.exports` to `registerJQueryPlugin`.
// Importing it also self-registers `$.fn.easyPieChart` when a global jQuery
// is present. See ./cjs.d.cts for why this file is hand-written.
type TModule = typeof import('../dist/jquery.js', {
  with: { 'resolution-mode': 'import' }
});

declare const registerJQueryPlugin: TModule['registerJQueryPlugin'];

export = registerJQueryPlugin;
