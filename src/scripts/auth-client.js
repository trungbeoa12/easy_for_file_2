(function (window) {
  "use strict";

  var TOKEN_KEY = "eflAuthToken";
  var USER_KEY = "eflAuthUserJson";
  var ASSESSMENT_STORAGE_KEY = "eflLatestAssessment";
  var ASSESSMENT_FROM_ACCOUNT_KEY = "eflLatestAssessmentFromAccount";

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

  function getSessionLabel(user) {
    if (user) {
      var profile = user.profile || {};
      var label = (user.displayName || profile.fullName || user.email || "").trim();
      if (label) {
        return label;
      }
      if (user.email) {
        return user.email;
      }
    }
    return "Đã đăng nhập";
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
      if (window.localStorage.getItem(ASSESSMENT_FROM_ACCOUNT_KEY) === "1") {
        window.localStorage.removeItem(ASSESSMENT_STORAGE_KEY);
        window.localStorage.removeItem(ASSESSMENT_FROM_ACCOUNT_KEY);
      }
    } catch (e) {
      /* ignore */
    }
    updateAuthBars();
  }

  function getAuthHeaders() {
    var t = getToken();
    return t ? { Authorization: "Bearer " + t } : {};
  }

  function logout() {
    var token = getToken();

    if (!token) {
      clearSession();
      return Promise.resolve();
    }

    return fetch(buildApiUrl("/api/auth/logout"), {
      method: "POST",
      headers: Object.assign(
        {
          Accept: "application/json",
        },
        getAuthHeaders()
      ),
    })
      .catch(function () {
        return null;
      })
      .then(function () {
        clearSession();
      });
  }

  function updateAuthBars() {
    var token = getToken();
    var user = getUser();
    var loggedIn = !!token;
    var label = loggedIn ? getSessionLabel(user) : "";
    var emailTitle = user && user.email ? user.email : "";

    var slots = document.querySelectorAll("[data-auth-bar], [data-auth-navbar]");

    slots.forEach(function (el) {
      var isNav = el.hasAttribute("data-auth-navbar");

      if (!loggedIn) {
        if (isNav) {
          el.innerHTML =
            '<a class="nav-link" href="login.html">Đăng nhập</a>' +
            '<a class="nav-link" href="register.html">Đăng ký</a>';
        } else {
          el.innerHTML =
            '<a href="login.html" class="text-white text-decoration-underline">Đăng nhập</a>' +
            '<span class="text-white-50 mx-1">·</span>' +
            '<a href="register.html" class="text-white text-decoration-underline">Đăng ký</a>';
        }
        return;
      }

      if (isNav) {
        el.innerHTML =
          '<span class="nav-link small py-1 mb-0 text-truncate d-inline-block" style="max-width:10rem" title="' +
          emailTitle +
          '">' +
          label +
          '</span>' +
          '<button type="button" class="btn btn-outline-dark btn-sm ms-1" data-auth-logout>Đăng xuất</button>';
      } else {
        el.innerHTML =
          '<span class="me-2 text-truncate d-inline-block text-white" style="max-width:12rem" title="' +
          emailTitle +
          '">' +
          label +
          "</span>" +
          '<button type="button" class="btn btn-link btn-sm text-white p-0 text-decoration-underline" data-auth-logout>Đăng xuất</button>';
      }
    });

    document.querySelectorAll("[data-auth-logout]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        btn.disabled = true;
        logout().finally(function () {
          window.location.href = "login.html";
        });
      });
    });
  }

  window.EFL_AUTH = {
    getToken: getToken,
    getUser: getUser,
    setSession: setSession,
    clearSession: clearSession,
    logout: logout,
    getAuthHeaders: getAuthHeaders,
    buildApiUrl: buildApiUrl,
    updateAuthBars: updateAuthBars,
  };

  document.addEventListener("DOMContentLoaded", function () {
    updateAuthBars();
  });
})(window);
