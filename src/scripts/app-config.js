(function () {
  var railwayApi = "https://easyforfile2-production.up.railway.app";
  var localApi = "";

  function sanitizeUrl(value) {
    return String(value || "").trim().replace(/\/+$/, "");
  }

  function getRuntimeOverride() {
    try {
      if (window.EFL_RUNTIME_CONFIG && typeof window.EFL_RUNTIME_CONFIG.API_BASE_URL !== "undefined") {
        return sanitizeUrl(window.EFL_RUNTIME_CONFIG.API_BASE_URL);
      }
    } catch (e) {
      /* ignore */
    }

    return null;
  }

  function resolveApiBaseUrl() {
    var runtimeOverride = getRuntimeOverride();
    if (runtimeOverride !== null) {
      return runtimeOverride;
    }

    try {
      var hostname = String(window.location.hostname || "").toLowerCase();
      var origin = sanitizeUrl(window.location.origin || "");
      var railwayOrigin = sanitizeUrl(railwayApi);
      var isLoopback =
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "::1" ||
        hostname === "[::1]";
      var isVercelStatic = hostname.indexOf("vercel.app") !== -1;

      if (!hostname || isLoopback) {
        return localApi;
      }

      if (origin && railwayOrigin && origin === railwayOrigin) {
        return localApi;
      }

      if (isVercelStatic) {
        return railwayApi;
      }
    } catch (e) {
      /* ignore */
    }

    return localApi;
  }

  window.EFL_CONFIG = window.EFL_CONFIG || {
    /**
     * Local-first:
     * - "" => same origin (npm start local, or any setup where Express serves both frontend + API)
     * - Railway URL => static frontend hosted separately (e.g. Vercel production)
     * Optional runtime override:
     *   window.EFL_RUNTIME_CONFIG = { API_BASE_URL: "..." }
     */
    API_BASE_URL: resolveApiBaseUrl(),
  };
})();
