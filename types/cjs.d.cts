// The UMD bundle sets `module.exports` to the EasyPieChart constructor itself,
// with the other exports hanging off it as statics. That is an `export =`
// shape, which the generated ESM declarations cannot express — hence this
// hand-written declaration for the "require" condition.
//
// The types are derived from the generated ones, so they stay in sync.
// The generated declarations are ESM (the package is "type": "module"), so
// reading them from a CommonJS declaration needs an explicit resolution mode.
type TModule = typeof import('../dist/index.js', {
  with: { 'resolution-mode': 'import' }
});

declare const EasyPieChart: TModule['EasyPieChart'] & {
  EasyPieChart: TModule['EasyPieChart'];
  CanvasRenderer: TModule['CanvasRenderer'];
  defaultEasing: TModule['defaultEasing'];
  defaultOptions: TModule['defaultOptions'];
};

export = EasyPieChart;
