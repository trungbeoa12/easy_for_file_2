(function (window) {
  "use strict";

  var TOKEN_KEY = "eflAuthToken";
  var USER_KEY = "eflAuthUserJson";

  function getApiBaseUrl() {
    var config = window.EFL_CONFIG || {};
    return String(config.API_BASE_URL || "").replace(/\/+$/, "");
  }

  function buildApiUrl(path) {
    return getApiBaseUrl() + path;
  }

  function getToken() {
    try {
      return window.localStorage.getItem(TOKEN_KEY) || "";
    } catch (e) {
      return "";
    }
  }

  function getUser() {
    try {
      var raw = window.localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setSession(token, user) {
    try {
      if (token) {
        window.localStorage.setItem(TOKEN_KEY, token);
      }
      if (user) {
        window.localStorage.setItem(USER_KEY, JSON.stringify(user));
      }
    } catch (e) {
      /* ignore */
    }
    updateAuthBars();
  }

  function clearSession() {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
    } catch (e) {
      /* ignore */
    }
    updateAuthBars();
  }

  function getAuthHeaders() {
    var t = getToken();
    return t ? { Authorization: "Bearer " + t } : {};
  }

  function updateAuthBars() {
    var user = getUser();
    var bars = document.querySelectorAll("[data-auth-bar]");

    bars.forEach(function (bar) {
      if (!user || !getToken()) {
        bar.innerHTML =
          '<a href="login.html" class="text-white text-decoration-underline">Đăng nhập</a>' +
          '<span class="text-white-50 mx-1">·</span>' +
          '<a href="register.html" class="text-white text-decoration-underline">Đăng ký</a>';
        return;
      }

      var profile = user.profile || {};
      var label = (user.displayName || profile.fullName || user.email || "").trim() || user.email;
      bar.innerHTML =
        '<span class="me-2 text-truncate d-inline-block text-white" style="max-width:12rem" title="' +
        (user.email || "") +
        '">' +
        label +
        "</span>" +
        '<button type="button" class="btn btn-link btn-sm text-white p-0 text-decoration-underline" data-auth-logout>Đăng xuất</button>';
    });

    document.querySelectorAll("[data-auth-logout]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        clearSession();
        window.location.href = "index.html";
      });
    });
  }

  window.EFL_AUTH = {
    getToken: getToken,
    getUser: getUser,
    setSession: setSession,
    clearSession: clearSession,
    getAuthHeaders: getAuthHeaders,
    buildApiUrl: buildApiUrl,
    updateAuthBars: updateAuthBars,
  };

  document.addEventListener("DOMContentLoaded", function () {
    updateAuthBars();
  });
})(window);
