(function () {
  "use strict";

  function getConfig() {
    return window.EFL_AUTH || {};
  }

  function getNextPath(defaultPath) {
    try {
      var value = new URLSearchParams(window.location.search).get("next");
      if (value && value.indexOf("http") !== 0 && value.indexOf("//") !== 0) {
        return value;
      }
    } catch (e) {
      /* ignore */
    }
    return defaultPath;
  }

  function setFeedback(feedback, className, message) {
    if (!feedback) {
      return;
    }
    feedback.textContent = message || "";
    feedback.className = className;
  }

  function setSubmitState(button, isLoading, loadingLabel, idleLabel) {
    if (!button) {
      return;
    }
    button.disabled = !!isLoading;
    button.textContent = isLoading ? loadingLabel : idleLabel;
  }

  function redirectIfAuthenticated(defaultPath) {
    var cfg = getConfig();
    var token = cfg && cfg.getToken ? cfg.getToken() : "";

    if (!token) {
      return false;
    }

    window.location.replace(getNextPath(defaultPath));
    return true;
  }

  function parseJsonResponse(response) {
    return response.json().catch(function () {
      return null;
    }).then(function (data) {
      if (!response.ok) {
        var msg = (data && data.message) || "Request failed.";
        var err = new Error(msg);
        err.status = response.status;
        throw err;
      }
      return data;
    });
  }

  function bindLoginForm() {
    var form = document.querySelector("[data-login-form]");
    if (!form) {
      return;
    }

    if (redirectIfAuthenticated("dashboard.html")) {
      return;
    }

    var feedback = form.querySelector("[data-auth-feedback]");
    var cfg = getConfig();
    var submitButton = form.querySelector("[data-auth-submit]");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = (form.querySelector('[name="email"]') || {}).value || "";
      var password = (form.querySelector('[name="password"]') || {}).value || "";

      setFeedback(feedback, "small text-muted mt-2", "Đang đăng nhập...");
      setSubmitState(submitButton, true, "Đang đăng nhập...", "Đăng nhập");

      fetch(cfg.buildApiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password }),
      })
        .then(parseJsonResponse)
        .then(function (payload) {
          var data = payload && payload.data;
          if (data && data.token) {
            cfg.setSession(data.token, data.user);
            window.location.href = getNextPath("dashboard.html");
            return;
          }
          throw new Error("Invalid response.");
        })
        .catch(function (err) {
          setFeedback(feedback, "small text-danger mt-2", err.message || "Đăng nhập thất bại.");
        })
        .finally(function () {
          setSubmitState(submitButton, false, "Đang đăng nhập...", "Đăng nhập");
        });
    });
  }

  function bindRegisterForm() {
    var form = document.querySelector("[data-register-form]");
    if (!form) {
      return;
    }

    if (redirectIfAuthenticated("mvp-registration.html")) {
      return;
    }

    var feedback = form.querySelector("[data-auth-feedback]");
    var cfg = getConfig();
    var submitButton = form.querySelector("[data-auth-submit]");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = (form.querySelector('[name="email"]') || {}).value || "";
      var password = (form.querySelector('[name="password"]') || {}).value || "";
      var displayName = (form.querySelector('[name="displayName"]') || {}).value || "";
      var fullName = (form.querySelector('[name="fullName"]') || {}).value || "";

      setFeedback(feedback, "small text-muted mt-2", "Đang tạo tài khoản...");
      setSubmitState(submitButton, true, "Đang tạo tài khoản...", "Tạo tài khoản");

      fetch(cfg.buildApiUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
          displayName: displayName.trim(),
          fullName: fullName.trim(),
        }),
      })
        .then(parseJsonResponse)
        .then(function (payload) {
          var data = payload && payload.data;
          if (data && data.token) {
            cfg.setSession(data.token, data.user);
            window.location.href = getNextPath("mvp-registration.html");
            return;
          }
          throw new Error("Invalid response.");
        })
        .catch(function (err) {
          setFeedback(feedback, "small text-danger mt-2", err.message || "Đăng ký thất bại.");
        })
        .finally(function () {
          setSubmitState(submitButton, false, "Đang tạo tài khoản...", "Tạo tài khoản");
        });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindLoginForm();
    bindRegisterForm();
  });
})();
