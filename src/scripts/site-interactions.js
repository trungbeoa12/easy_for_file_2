(function ($) {
  "use strict";

  var scrollRevealSelector = ".scroll-reveal";
  var mvpFormSelector = "[data-mvp-form]";

  function setFormFeedback(feedbackElement, type, message) {
    if (!feedbackElement) {
      return;
    }

    feedbackElement.textContent = message || "";
    feedbackElement.classList.remove("is-success", "is-error", "is-loading", "is-visible");

    if (!message) {
      return;
    }

    feedbackElement.classList.add("is-visible");

    if (type) {
      feedbackElement.classList.add(type);
    }
  }

  function getCheckedValues(form, selector) {
    return Array.prototype.slice
      .call(form.querySelectorAll(selector + ":checked"))
      .map(function (input) {
        return input.value;
      });
  }

  function inferGoalsFromText(rawText) {
    var normalizedText = (rawText || "").toLowerCase();
    var inferredGoals = [];

    if (normalizedText.indexOf("giảm cân") !== -1 || normalizedText.indexOf("giam can") !== -1) {
      inferredGoals.push("lose-weight");
    }

    if (
      normalizedText.indexOf("tăng cơ") !== -1 ||
      normalizedText.indexOf("tang co") !== -1 ||
      normalizedText.indexOf("muscle") !== -1
    ) {
      inferredGoals.push("muscle");
    }

    if (
      normalizedText.indexOf("sức khỏe") !== -1 ||
      normalizedText.indexOf("suc khoe") !== -1 ||
      normalizedText.indexOf("health") !== -1
    ) {
      inferredGoals.push("health");
    }

    if (
      normalizedText.indexOf("năng suất") !== -1 ||
      normalizedText.indexOf("nang suat") !== -1 ||
      normalizedText.indexOf("productivity") !== -1
    ) {
      inferredGoals.push("productivity");
    }

    if (
      normalizedText.indexOf("cân bằng") !== -1 ||
      normalizedText.indexOf("can bang") !== -1 ||
      normalizedText.indexOf("balance") !== -1
    ) {
      inferredGoals.push("balance");
    }

    return inferredGoals.filter(function (goal, index, goals) {
      return goals.indexOf(goal) === index;
    });
  }

  function buildLandingPayload(form) {
    var subjectValue = (form.querySelector("#volunteer-subject") || {}).value || "";
    var noteValue = (form.querySelector("#volunteer-message") || {}).value || "";

    return {
      fullName: ((form.querySelector("#volunteer-name") || {}).value || "").trim(),
      email: ((form.querySelector("#volunteer-email") || {}).value || "").trim(),
      goals: inferGoalsFromText(subjectValue),
      priority: "form",
      note: [subjectValue.trim(), noteValue.trim()].filter(Boolean).join(" | "),
      consent: true,
      sourcePage: form.getAttribute("data-source-page") || "landing",
    };
  }

  function buildRegistrationPayload(form) {
    var selectedPriority = form.querySelector('input[name="mvp-priority"]:checked');
    var ageValue = ((form.querySelector("#mvp-age") || {}).value || "").trim();
    var sleepHoursValue = ((form.querySelector("#mvp-sleep-hours") || {}).value || "").trim();
    var heightValue = ((form.querySelector("#mvp-height-cm") || {}).value || "").trim();
    var weightValue = ((form.querySelector("#mvp-weight-kg") || {}).value || "").trim();

    return {
      fullName: ((form.querySelector("#mvp-name") || {}).value || "").trim(),
      email: ((form.querySelector("#mvp-email") || {}).value || "").trim(),
      profile: {
        age: ageValue ? Number(ageValue) : null,
        gender: ((form.querySelector("#mvp-gender") || {}).value || "").trim(),
      },
      bodyMetrics: {
        heightCm: heightValue ? Number(heightValue) : null,
        weightKg: weightValue ? Number(weightValue) : null,
      },
      habits: {
        sleepHours: sleepHoursValue ? Number(sleepHoursValue) : null,
        activityLevel: ((form.querySelector("#mvp-activity-level") || {}).value || "").trim(),
      },
      goals: getCheckedValues(form, 'input[name="goal"]'),
      priority: selectedPriority ? selectedPriority.value : "",
      note: ((form.querySelector("#mvp-note") || {}).value || "").trim(),
      consent: !!(form.querySelector("#mvp-consent") || {}).checked,
      sourcePage: form.getAttribute("data-source-page") || "mvp-registration",
    };
  }

  function buildPayloadForForm(form) {
    var sourcePage = form.getAttribute("data-source-page");

    if (sourcePage === "landing") {
      return buildLandingPayload(form);
    }

    return buildRegistrationPayload(form);
  }

  function mapErrorMessage(responsePayload) {
    if (!responsePayload) {
      return "Không thể gửi đăng ký lúc này. Vui lòng thử lại sau.";
    }

    if (Array.isArray(responsePayload.errors) && responsePayload.errors.length) {
      return responsePayload.errors
        .map(function (item) {
          return item.message;
        })
        .join(" ");
    }

    return responsePayload.message || "Không thể gửi đăng ký lúc này. Vui lòng thử lại sau.";
  }

  function formatGender(gender) {
    if (gender === "male") {
      return "Nam";
    }

    if (gender === "female") {
      return "Nữ";
    }

    if (gender === "other") {
      return "Khác";
    }

    return "";
  }

  function buildResultSummary(record) {
    var assessment = record.assessment || {};
    var bmi = assessment.bmi || null;
    var tdee = assessment.tdee || null;
    var summaryParts = [];

    if (bmi && typeof bmi.value === "number") {
      summaryParts.push("BMI hien tai cua ban la " + bmi.value + ", thuoc nhom " + bmi.category + ".");
    }

    if (tdee && typeof tdee.tdee === "number") {
      summaryParts.push("TDEE uoc tinh khoang " + tdee.tdee + " kcal/ngay de duy tri muc van dong hien tai.");
    }

    if (!summaryParts.length) {
      summaryParts.push("Dang ky da duoc ghi nhan. Khi ban bo sung day du chi so hon, he thong se tra ve snapshot suc khoe chi tiet hon.");
    }

    return summaryParts.join(" ");
  }

  function buildResultTags(record) {
    var tags = [];
    var profile = record.profile || {};
    var bodyMetrics = record.bodyMetrics || {};
    var habits = record.habits || {};
    var assessment = record.assessment || {};
    var tdee = assessment.tdee || null;
    var genderLabel = formatGender(profile.gender);

    if (profile.age) {
      tags.push("Tuoi: " + profile.age);
    }

    if (genderLabel) {
      tags.push("Gioi tinh: " + genderLabel);
    }

    if (bodyMetrics.heightCm) {
      tags.push("Chieu cao: " + bodyMetrics.heightCm + " cm");
    }

    if (bodyMetrics.weightKg) {
      tags.push("Can nang: " + bodyMetrics.weightKg + " kg");
    }

    if (habits.sleepHours || habits.sleepHours === 0) {
      tags.push("Ngu trung binh: " + habits.sleepHours + " gio");
    }

    if (habits.activityLevel) {
      tags.push("Van dong: " + habits.activityLevel);
    }

    if (tdee && typeof tdee.bmr === "number") {
      tags.push("BMR: " + tdee.bmr + " kcal");
    }

    return tags;
  }

  function renderResultPanel(form, record) {
    var panel = form.parentElement.querySelector("[data-result-panel]");
    var summaryElement;
    var bmiValueElement;
    var bmiCategoryElement;
    var tdeeValueElement;
    var tdeeMetaElement;
    var tagsElement;
    var tags;
    var assessment;
    var bmi;
    var tdee;

    if (!panel) {
      return;
    }

    summaryElement = panel.querySelector("[data-result-summary]");
    bmiValueElement = panel.querySelector("[data-result-bmi-value]");
    bmiCategoryElement = panel.querySelector("[data-result-bmi-category]");
    tdeeValueElement = panel.querySelector("[data-result-tdee-value]");
    tdeeMetaElement = panel.querySelector("[data-result-tdee-meta]");
    tagsElement = panel.querySelector("[data-result-tags]");
    assessment = record.assessment || {};
    bmi = assessment.bmi || null;
    tdee = assessment.tdee || null;
    tags = buildResultTags(record);

    if (summaryElement) {
      summaryElement.textContent = buildResultSummary(record);
    }

    if (bmiValueElement) {
      bmiValueElement.textContent = bmi && typeof bmi.value === "number" ? bmi.value : "--";
    }

    if (bmiCategoryElement) {
      bmiCategoryElement.textContent = bmi && bmi.category ? bmi.category : "Chua du du lieu de tinh BMI";
    }

    if (tdeeValueElement) {
      tdeeValueElement.textContent = tdee && typeof tdee.tdee === "number" ? tdee.tdee + " kcal" : "--";
    }

    if (tdeeMetaElement) {
      tdeeMetaElement.textContent = tdee && typeof tdee.bmr === "number"
        ? "BMR " + tdee.bmr + " kcal, cong thuc " + tdee.formula
        : "Chua du du lieu de tinh TDEE";
    }

    if (tagsElement) {
      tagsElement.innerHTML = "";
      tags.forEach(function (tagText) {
        var tag = document.createElement("span");
        tag.className = "mvp-result-tag";
        tag.textContent = tagText;
        tagsElement.appendChild(tag);
      });
    }

    panel.hidden = false;
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetLandingForm(form) {
    form.reset();
  }

  function resetRegistrationForm(form) {
    form.reset();
    var defaultPriority = form.querySelector("#mvp-priority-form");
    if (defaultPriority) {
      defaultPriority.checked = true;
    }
  }

  function resetMvpForm(form) {
    if ((form.getAttribute("data-source-page") || "") === "landing") {
      resetLandingForm(form);
      return;
    }

    resetRegistrationForm(form);
  }

  function bindMvpForms() {
    var forms = document.querySelectorAll(mvpFormSelector);

    if (!forms.length) {
      return;
    }

    forms.forEach(function (form) {
      var feedbackElement = form.querySelector("[data-form-feedback]");
      var submitButton = form.querySelector("[data-submit-button]");
      var initialButtonText = submitButton ? submitButton.textContent : "";

      form.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        var payload = buildPayloadForForm(form);

        setFormFeedback(feedbackElement, "is-loading", "Đang gửi thông tin đăng ký...");

        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = "Đang gửi...";
        }

        fetch("/api/mvp-registrations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
          .then(function (response) {
            return response.json().catch(function () {
              return null;
            }).then(function (data) {
              if (!response.ok) {
                var error = new Error(mapErrorMessage(data));
                error.responsePayload = data;
                throw error;
              }

              return data;
            });
          })
          .then(function (data) {
            var record = data && data.data ? data.data : null;

            if (record && (form.getAttribute("data-source-page") || "") === "mvp-registration") {
              renderResultPanel(form, record);
            }

            resetMvpForm(form);
            var assessment = record ? record.assessment : null;
            var successMessage = "Đăng ký đã được gửi thành công. Bọn mình sẽ liên hệ với bạn khi có đợt thử nghiệm phù hợp.";

            if (assessment && assessment.bmi && assessment.tdee) {
              successMessage =
                "Đăng ký đã được gửi thành công. BMI hiện tại là " +
                assessment.bmi.value +
                " (" +
                assessment.bmi.category +
                "), TDEE ước tính khoảng " +
                assessment.tdee.tdee +
                " kcal/ngày.";
            }

            setFormFeedback(feedbackElement, "is-success", successMessage);
          })
          .catch(function (error) {
            setFormFeedback(
              feedbackElement,
              "is-error",
              error.message || "Không thể gửi đăng ký lúc này. Vui lòng thử lại sau."
            );
          })
          .finally(function () {
            if (submitButton) {
              submitButton.disabled = false;
              submitButton.textContent = initialButtonText;
            }
          });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var revealElements = document.querySelectorAll(scrollRevealSelector);
    if (!revealElements.length) {
      bindMvpForms();
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealElements.forEach(function (el) {
        el.classList.add("is-visible");
      });
      bindMvpForms();
      return;
    }
    if (!("IntersectionObserver" in window)) {
      revealElements.forEach(function (el) {
        el.classList.add("is-visible");
      });
      bindMvpForms();
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

    bindMvpForms();
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
