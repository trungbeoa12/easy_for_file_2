(function () {
  var railwayApi = "https://easyforfile2-production.up.railway.app";
  var useSameOrigin = false;

  try {
    var hostname = window.location.hostname;
    var port = String(window.location.port);
    if (hostname === "localhost" && port === "3000") {
      useSameOrigin = true;
    } else {
      var origin = (window.location.origin || "").replace(/\/+$/, "");
      var apiRoot = railwayApi.replace(/\/+$/, "");
      if (origin && apiRoot && origin === apiRoot) {
        useSameOrigin = true;
      }
    }
  } catch (e) {
    /* ignore */
  }

  window.EFL_CONFIG = window.EFL_CONFIG || {
    /** Empty string = same origin (Express + static on one host). Full URL when frontend is on another domain (e.g. Vercel). */
    API_BASE_URL: useSameOrigin ? "" : railwayApi,
  };
})();
