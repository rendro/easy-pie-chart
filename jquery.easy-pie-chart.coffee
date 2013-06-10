###
Easy pie chart is a jquery plugin to display simple animated pie charts for only one value

Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.

Built on top of the jQuery library (http://jquery.com)

@source: http://github.com/rendro/easy-pie-chart/
@autor: Robert Fleischmann
@version: 1.1.0

Inspired by: http://dribbble.com/shots/631074-Simple-Pie-Charts-II?list=popular&offset=210
Thanks to Philip Thrasher for the jquery plugin boilerplate for coffee script
###

(($) ->
  $.easyPieChart = (el, options) ->

    @el = el
    @$el = $ el
    @$el.data "easyPieChart", @

    @init = =>
      @options = $.extend {}, $.easyPieChart.defaultOptions, options

      #get relevant data
      percent = parseInt @$el.data('percent'), 10
      @percentage = 0

      #create canvas element and set the origin to the center
      @canvas = $("<canvas width='#{@options.size}' height='#{@options.size}'></canvas>").get(0)
      @$el.append @canvas
      G_vmlCanvasManager.initElement @canvas if G_vmlCanvasManager?
      @ctx = @canvas.getContext '2d'

      if window.devicePixelRatio > 1
        scaleBy = window.devicePixelRatio
        $(@canvas).css({
          width: @options.size
          height: @options.size
        })
        @canvas.width *= scaleBy
        @canvas.height *= scaleBy
        @ctx.scale scaleBy, scaleBy

      @ctx.translate @options.size/2, @options.size/2
      @$el.addClass 'easyPieChart'
      @$el.css {
        width: @options.size
        height: @options.size
        lineHeight: "#{@options.size}px"
      }

      @update percent
      @

    @update = (percent) =>
      percent = parseFloat(percent) or 0
      if @options.animate == false
        drawLine percent
      else
        animateLine @percentage, percent
      @

    renderScale = =>
      @ctx.fillStyle = @options.scaleColor
      @ctx.lineWidth = 1
      addScaleLine i for i in [0..24]

    addScaleLine = (i) =>
      offset = if i%6==0 then 0 else @options.size*0.017
      @ctx.save()
      @ctx.rotate i * Math.PI / 12
      @ctx.fillRect @options.size/2-offset, 0, -@options.size*0.05+offset, 1
      @ctx.restore()
      return

    renderTrack = =>
      offset = @options.size/2-@options.lineWidth/2
      offset -= @options.size*0.08 if @options.scaleColor != false

      @ctx.beginPath()
      @ctx.arc 0, 0, offset, 0, Math.PI * 2, true
      @ctx.closePath()
      @ctx.strokeStyle = @options.trackColor
      @ctx.lineWidth = @options.lineWidth
      @ctx.stroke()
      return

    renderBackground = =>
      do renderScale if @options.scaleColor != false
      do renderTrack if @options.trackColor != false
      return

    drawLine = (percent) =>
      do renderBackground

      @ctx.strokeStyle = if $.isFunction @options.barColor  then @options.barColor percent else @options.barColor
      @ctx.lineCap = @options.lineCap
      @ctx.lineWidth = @options.lineWidth

      offset = @options.size/2-@options.lineWidth/2
      offset -= @options.size*0.08 if @options.scaleColor != false

      @ctx.save()
      @ctx.rotate -Math.PI/2
      @ctx.beginPath()
      @ctx.arc 0, 0, offset, 0, Math.PI * 2 * percent/100, false
      @ctx.stroke()
      @ctx.restore()
      return

    rAF = do () -> window.requestAnimationFrame or window.webkitRequestAnimationFrame or window.mozRequestAnimationFrame or (callback) -> window.setTimeout callback, 1000 / 60

    animateLine = (from, to) =>
      @options.onStart.call @
      @percentage = to
      startTime = Date.now()
      anim = () =>
        process = Date.now() - startTime
        rAF anim if process < @options.animate
        @ctx.clearRect -@options.size/2, -@options.size/2, @options.size, @options.size
        renderBackground.call @
        currentValue = [easeInOutQuad process, from, to-from, @options.animate]
        @options.onStep.call @, currentValue
        drawLine.call @, currentValue
        @options.onStop.call @ if process >= @options.animate
      rAF anim
      return

    #t=time;b=beginning value;c=change in value;d=duration
    easeInOutQuad = (t, b, c, d) ->

      easeIn = (t) ->
        return Math.pow(t, 2) # Quad
      easing = (t) ->
        if (t < 1)
          return easeIn(t)
        else
          return 2 - easeIn( (t/2) * -2 + 2 )

      t /= d / 2
      return c / 2 * easing(t) + b

    @init()

  $.easyPieChart.defaultOptions =
    barColor:   '#ef1e25'
    trackColor: '#f2f2f2'
    scaleColor: '#dfe0e0'
    lineCap:    'round'
    size:       110
    lineWidth:  3
    animate:    false
    onStart:    $.noop
    onStop:     $.noop
    onStep:     $.noop

  $.fn.easyPieChart = (options) ->
    $.each @, (i, el) ->
      $el = ($ el)

      unless $el.data 'easyPieChart'
        $el.data 'easyPieChart', new $.easyPieChart el, options

  undefined
)(jQuery)
