### jQuery

```javascript
$(function() {
    // instantiate the plugin
    ...
    // update
    $('.chart').data('easyPieChart').update(40);
    ...
    // disable animation
    $('.chart').data('easyPieChart').disableAnimation();
    ...
    // enable animation
    $('.chart').data('easyPieChart').enableAnimation();
});
```

### Vanilla JS

```javascript
// instantiate the plugin
var chart = new EasyPieChart(element, options);
// update
chart.update(40);
// disable animation
chart.disableAnimation();
// enable animation
chart.enableAnimation();
```

### AngularJS

For a value binding you need to add the `percent` attribute and bind it to your controller.
