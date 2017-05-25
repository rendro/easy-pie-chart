# V3 roadmap
## Features extracted from issues and PR
* [ ] Responsive
* [ ] min, max, value (auto-scaling)
* [ ] custom prefix and suffix (value rendered on canvas)
* [ ] cancel / pause animation
* [ ] start animation on click / no auto animation
	* from - to: allows for reverse animations
* [ ] custom color ranges [[0-10], 'red'], [10-20], 'green'], ...
* [ ] no css required
* [ ] change starting point (rotate everything)
* [ ] not 2 PI but only partial circle
* [ ] multiple values in one chart
* [ ] circle background color
* [ ] single LICENSE
* [ ] update any option should re-render the chart
* [ ] number of scale sections

## Published to
* [ ] npm
* [ ] meteor
* [ ] bower


## Config

Q: how handle different visual styles that require different data configuration?

* classic
	* 1 value (min, max)
* multiple
	* n values (min, max)
* multiple[auto fill]
	* n values (always 360 deg)
* real pie (actually looks like a pie chart, no track, auto fill)
	* n values (always 360 deg)

### Appearance

* BAR / TRACK
	* color: string
	* width: number
	* lineCap: butt | round | square
* SCALE
	* color: string
	* length: number
	* segments: number
* CHART
	* rotation: number
	* size: number
	* arc: number
* LABEL
	* prefix
	* suffix
	* font (css shorthand)

### Animation

* easing
* from [datapoints]
* to [datapoints]
* duration
