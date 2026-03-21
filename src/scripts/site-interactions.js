(function ($) {
  "use strict";

  var scrollRevealSelector = ".scroll-reveal";

  document.addEventListener("DOMContentLoaded", function () {
    var revealElements = document.querySelectorAll(scrollRevealSelector);
    if (!revealElements.length) {
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealElements.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }
    if (!("IntersectionObserver" in window)) {
      revealElements.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }
    var scrollRevealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            scrollRevealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -40px 0px", threshold: 0.08 }
    );
    revealElements.forEach(function (el) {
      scrollRevealObserver.observe(el);
    });
  });

  jQuery(".counter-thumb").appear(function () {
    jQuery(".counter-number").countTo();
  });

  $(".smoothscroll").click(function () {
    var targetSelector = $(this).attr("href");
    var $targetSection = $(targetSelector);
    var navbarHeight = $(".navbar").height();

    scrollToSection($targetSection, navbarHeight);
    return false;

    function scrollToSection($section, navHeight) {
      var offset = $section.offset();
      var sectionTop = offset.top;
      var scrollDestination = sectionTop - navHeight;

      $("body,html").animate(
        {
          scrollTop: scrollDestination,
        },
        300
      );
    }
  });
})(window.jQuery);
