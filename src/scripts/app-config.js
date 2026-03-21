(function () {
  var railwayApi = "https://easyforfile2-production.up.railway.app";
  var useSameOrigin = false;

  try {
    if (window.location.hostname === "localhost" && String(window.location.port) === "3000") {
      useSameOrigin = true;
    }
  } catch (e) {
    /* ignore */
  }

  window.EFL_CONFIG = window.EFL_CONFIG || {
    /** Empty string = same origin (local Express on :3000). Set full URL when frontend is static-only (e.g. Vercel) and API is on Railway. */
    API_BASE_URL: useSameOrigin ? "" : railwayApi,
  };
})();
