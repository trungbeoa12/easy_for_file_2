(function () {
  "use strict";

  function getConfig() {
    return window.EFL_AUTH || {};
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

    var feedback = form.querySelector("[data-auth-feedback]");
    var cfg = getConfig();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = (form.querySelector('[name="email"]') || {}).value || "";
      var password = (form.querySelector('[name="password"]') || {}).value || "";

      if (feedback) {
        feedback.textContent = "Đang đăng nhập...";
        feedback.className = "small text-muted mt-2";
      }

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
            window.location.href = "dashboard.html";
            return;
          }
          throw new Error("Invalid response.");
        })
        .catch(function (err) {
          if (feedback) {
            feedback.textContent = err.message || "Đăng nhập thất bại.";
            feedback.className = "small text-danger mt-2";
          }
        });
    });
  }

  function bindRegisterForm() {
    var form = document.querySelector("[data-register-form]");
    if (!form) {
      return;
    }

    var feedback = form.querySelector("[data-auth-feedback]");
    var cfg = getConfig();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = (form.querySelector('[name="email"]') || {}).value || "";
      var password = (form.querySelector('[name="password"]') || {}).value || "";
      var displayName = (form.querySelector('[name="displayName"]') || {}).value || "";
      var fullName = (form.querySelector('[name="fullName"]') || {}).value || "";

      if (feedback) {
        feedback.textContent = "Đang tạo tài khoản...";
        feedback.className = "small text-muted mt-2";
      }

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
            window.location.href = "mvp-registration.html";
            return;
          }
          throw new Error("Invalid response.");
        })
        .catch(function (err) {
          if (feedback) {
            feedback.textContent = err.message || "Đăng ký thất bại.";
            feedback.className = "small text-danger mt-2";
          }
        });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindLoginForm();
    bindRegisterForm();
  });
})();
