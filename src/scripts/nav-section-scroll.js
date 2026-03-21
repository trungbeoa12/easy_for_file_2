// Navbar: sync active state + smooth scroll to #section_* anchors (home page)

(function ($) {
  "use strict";

  var sectionIds = [1, 2, 3, 4, 5, 6];
  var scrollOffsetPx = 90;

  $.each(sectionIds, function (index, sectionId) {
    $(document).scroll(function () {
      var $section = $("#section_" + sectionId);
      if (!$section.length) {
        return;
      }
      var sectionTop = $section.offset().top - scrollOffsetPx;
      var scrollTop = $(document).scrollTop();
      var scrollWithEpsilon = scrollTop + 1;

      if (scrollWithEpsilon >= sectionTop) {
        $(".navbar-nav .nav-item .nav-link").removeClass("active");
        $(".navbar-nav .nav-item .nav-link:link").addClass("inactive");
        $(".navbar-nav .nav-item .nav-link").eq(index).addClass("active");
        $(".navbar-nav .nav-item .nav-link").eq(index).removeClass("inactive");
      }
    });

    $(".click-scroll").eq(index).click(function (e) {
      var $target = $("#section_" + sectionId);
      if (!$target.length) {
        return;
      }
      var offsetClick = $target.offset().top - scrollOffsetPx;
      e.preventDefault();
      $("html, body").animate(
        {
          scrollTop: offsetClick,
        },
        300
      );
    });
  });

  $(document).ready(function () {
    $(".navbar-nav .nav-item .nav-link:link").addClass("inactive");
    $(".navbar-nav .nav-item .nav-link").eq(0).addClass("active");
    $(".navbar-nav .nav-item .nav-link:link").eq(0).removeClass("inactive");
  });
})(window.jQuery);
