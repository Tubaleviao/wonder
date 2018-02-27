(function($) {
  $.fn.drags = function(opt) {
    var ardio = document.getElementById('audio');
    opt = $.extend({
      handle: "",
      cursor: "ew-resize"
    }, opt);
    var $el = this;

    return $el.css('cursor', opt.cursor).on("mousedown", function(e) {
      var $drag = $(this).addClass('draggable');
      var drg_w = $drag.width(),
        el_w = $drag.parent().parent().parent().width(),
        pos_x = $drag.offset().left - e.pageX,
        bar_init = $drag.parent().parent().parent().offset().left - drg_w,
        bar_end = bar_init + el_w,
        pro = false;
      if ($drag.parent().parent().parent().attr('id') == "progress") {
        pro = true;
        ardio.pause();
      }
      $drag.parents().on("mousemove", function(d) {
        if ($drag.hasClass("draggable")) {
          //var new_pos = d.pageX + pos_x;
          //console.log(el_w);
          if (d.pageX + pos_x < bar_init) {
            var new_width = bar_init - $drag.parent().parent().parent().offset().left + drg_w;
            if (pro) {
              $("#progress-level").width(new_width);
            } else {
              $("#audio").prop("volume", 0);
            }
          } else if (d.pageX + pos_x > bar_end) {
            var new_width = bar_end - $drag.parent().parent().parent().offset().left + drg_w;
            if (pro) {
              $("#progress-level").width(new_width);
            } else {
              $("#audio").prop("volume", 1);
            }
          } else {
            var new_width = d.pageX + pos_x - $drag.parent().parent().parent().offset().left + drg_w;
            if (pro) {
              ardio.currentTime = Math.round(new_width) / Math.round(el_w) * ardio.duration;
              $("#progress-level").width(new_width);
            } else {
              $("#audio").prop("volume", new_width / Math.round(el_w));
            }
          }
        }
      });
      e.preventDefault(); // disable selection
    });
  }
})(jQuery);