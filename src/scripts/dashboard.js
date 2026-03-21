(function () {
  "use strict";

  var STORAGE_KEY = "eflLatestAssessment";

  function getApiBaseUrl() {
    var config = window.EFL_CONFIG || {};
    return String(config.API_BASE_URL || "").replace(/\/+$/, "");
  }

  function buildApiUrl(path) {
    return getApiBaseUrl() + path;
  }

  function getQueryParam(name) {
    try {
      return new URLSearchParams(window.location.search).get(name);
    } catch (e) {
      return null;
    }
  }

  function getStoredAssessment() {
    try {
      var rawValue = window.localStorage.getItem(STORAGE_KEY);
      return rawValue ? JSON.parse(rawValue) : null;
    } catch (error) {
      return null;
    }
  }

  function fetchAssessmentById(id) {
    return fetch(buildApiUrl("/api/mvp-registrations/" + encodeURIComponent(id)), {
      method: "GET",
      headers: { Accept: "application/json" },
    }).then(function (response) {
      return response.json().catch(function () {
        return null;
      }).then(function (data) {
        if (!response.ok) {
          var err = new Error((data && data.message) || "Không tải được assessment.");
          err.status = response.status;
          throw err;
        }
        return data;
      });
    });
  }

  function setPanelsVisible(loadingEl, emptyEl, mainEl, state) {
    if (loadingEl) {
      loadingEl.hidden = state !== "loading";
    }
    if (emptyEl) {
      emptyEl.hidden = state !== "empty";
    }
    if (mainEl) {
      mainEl.hidden = state !== "content";
    }
  }

  function formatActivityLevel(activityLevel) {
    var mapping = {
      sedentary: "It van dong",
      light: "Van dong nhe",
      moderate: "Van dong vua",
      active: "Van dong cao",
      "very-active": "Rat cao",
    };

    return mapping[activityLevel] || "Chua co du lieu";
  }

  function calculateLifeReadiness(record) {
    var score = 45;
    var assessment = record.assessment || {};
    var statuses = assessment.statuses || {};

    if (statuses.bmi === "normal") {
      score += 20;
    } else if (statuses.bmi === "overweight" || statuses.bmi === "underweight") {
      score += 10;
    }

    if (statuses.sleep === "balanced") {
      score += 15;
    } else if (statuses.sleep === "low" || statuses.sleep === "high") {
      score += 6;
    }

    if (statuses.activity === "balanced") {
      score += 15;
    } else if (statuses.activity === "high") {
      score += 12;
    } else if (statuses.activity === "low") {
      score += 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  function buildBreakdown(record) {
    var statuses = (record.assessment || {}).statuses || {};

    return [
      {
        label: "Body metrics",
        value: statuses.bmi === "normal" ? 78 : statuses.bmi ? 56 : 0,
        description: statuses.bmi === "normal" ? "BMI dang o vung can bang." : "Can tiep tuc theo doi can nang va body metrics.",
      },
      {
        label: "Sleep",
        value: statuses.sleep === "balanced" ? 74 : statuses.sleep ? 48 : 0,
        description: statuses.sleep === "balanced" ? "Giac ngu dang kha on." : "Ngu la tru cot can uu tien som.",
      },
      {
        label: "Activity",
        value: statuses.activity === "balanced" ? 76 : statuses.activity === "high" ? 82 : statuses.activity ? 44 : 0,
        description: statuses.activity === "low" ? "Van dong hien tai con thap." : "Muc van dong dang tao nen tang kha tot.",
      },
    ];
  }

  function renderStatusChips(container, record) {
    var statuses = (record.assessment || {}).statuses || {};
    var chips = [];

    if (statuses.bmi) {
      chips.push("BMI: " + statuses.bmi);
    }

    if (statuses.sleep) {
      chips.push("Sleep: " + statuses.sleep);
    }

    if (statuses.activity) {
      chips.push("Activity: " + statuses.activity);
    }

    container.innerHTML = "";

    chips.forEach(function (text) {
      var chip = document.createElement("span");
      chip.className = "dashboard-status-chip";
      chip.textContent = text;
      container.appendChild(chip);
    });
  }

  function renderBreakdown(container, record) {
    var items = buildBreakdown(record);

    container.innerHTML = "";

    items.forEach(function (item) {
      var row = document.createElement("div");
      row.className = "dashboard-breakdown-row";
      row.innerHTML =
        '<div class="dashboard-breakdown-row__top">' +
        '<strong>' + item.label + "</strong>" +
        '<span>' + item.value + "/100</span>" +
        "</div>" +
        '<div class="dashboard-breakdown-row__bar"><span style="width:' + item.value + '%"></span></div>' +
        '<p class="dashboard-breakdown-row__text">' + item.description + "</p>";
      container.appendChild(row);
    });
  }

  function renderRecommendations(container, recommendations) {
    container.innerHTML = "";

    if (!recommendations.length) {
      container.innerHTML = '<div class="dashboard-recommendation-card"><h4>Chua co goi y</h4><p>Hay thuc hien assessment de mo dashboard day du hon.</p></div>';
      return;
    }

    recommendations.forEach(function (item, index) {
      var card = document.createElement("article");
      card.className = "dashboard-recommendation-card";
      card.innerHTML =
        '<span class="dashboard-recommendation-card__step">Uu tien ' + (index + 1) + "</span>" +
        "<p>" + item + "</p>";
      container.appendChild(card);
    });
  }

  function renderProfileList(container, record) {
    var profile = record.profile || {};
    var bodyMetrics = record.bodyMetrics || {};
    var habits = record.habits || {};
    var tdee = ((record.assessment || {}).tdee) || null;
    var items = [
      ["Ho ten", record.fullName || "--"],
      ["Email", record.email || "--"],
      ["Tuoi", profile.age || "--"],
      ["Gioi tinh", profile.gender || "--"],
      ["Chieu cao", bodyMetrics.heightCm ? bodyMetrics.heightCm + " cm" : "--"],
      ["Can nang", bodyMetrics.weightKg ? bodyMetrics.weightKg + " kg" : "--"],
      ["Ngu trung binh", habits.sleepHours || habits.sleepHours === 0 ? habits.sleepHours + " gio" : "--"],
      ["Van dong", habits.activityLevel ? formatActivityLevel(habits.activityLevel) : "--"],
      ["BMR", tdee && tdee.bmr ? tdee.bmr + " kcal" : "--"],
    ];

    container.innerHTML = "";

    items.forEach(function (item) {
      var row = document.createElement("div");
      row.className = "dashboard-profile-list__item";
      row.innerHTML =
        '<span class="dashboard-profile-list__label">' + item[0] + "</span>" +
        '<strong class="dashboard-profile-list__value">' + item[1] + "</strong>";
      container.appendChild(row);
    });
  }

  function renderDashboard(record, elements) {
    var assessment = record.assessment || {};
    var bmi = assessment.bmi || null;
    var tdee = assessment.tdee || null;

    if (elements.summaryElement) {
      elements.summaryElement.textContent = assessment.summary || "Dashboard dang cho du lieu assessment gan nhat cua ban.";
    }

    if (elements.readinessElement) {
      elements.readinessElement.textContent = calculateLifeReadiness(record) + "/100";
    }

    if (elements.chipContainer) {
      renderStatusChips(elements.chipContainer, record);
    }

    if (elements.bmiValueElement) {
      elements.bmiValueElement.textContent = bmi && typeof bmi.value === "number" ? bmi.value : "--";
    }

    if (elements.bmiMetaElement) {
      elements.bmiMetaElement.textContent = bmi && bmi.category ? bmi.category : "Chua co du lieu BMI";
    }

    if (elements.tdeeValueElement) {
      elements.tdeeValueElement.textContent = tdee && typeof tdee.tdee === "number" ? tdee.tdee + " kcal" : "--";
    }

    if (elements.tdeeMetaElement) {
      elements.tdeeMetaElement.textContent = tdee && typeof tdee.bmr === "number"
        ? "BMR " + tdee.bmr + " kcal, " + tdee.formula
        : "Chua co du lieu TDEE";
    }

    if (elements.sleepValueElement) {
      elements.sleepValueElement.textContent = record.habits && (record.habits.sleepHours || record.habits.sleepHours === 0)
        ? record.habits.sleepHours + " gio"
        : "--";
    }

    if (elements.activityValueElement) {
      elements.activityValueElement.textContent = record.habits && record.habits.activityLevel
        ? formatActivityLevel(record.habits.activityLevel)
        : "--";
    }

    if (elements.breakdownContainer) {
      renderBreakdown(elements.breakdownContainer, record);
    }

    if (elements.benchmarkSummaryElement) {
      elements.benchmarkSummaryElement.textContent = assessment.summary || "Chua co benchmark summary.";
    }

    if (elements.recommendationsContainer) {
      renderRecommendations(
        elements.recommendationsContainer,
        Array.isArray(assessment.recommendations) ? assessment.recommendations : []
      );
    }

    if (elements.profileContainer) {
      renderProfileList(elements.profileContainer, record);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var idParam = getQueryParam("id");
    var loadingEl = document.querySelector("[data-dashboard-loading]");
    var emptyEl = document.querySelector("[data-dashboard-empty]");
    var mainEl = document.querySelector("[data-dashboard-main]");

    var elements = {
      summaryElement: document.querySelector("[data-dashboard-summary]"),
      readinessElement: document.querySelector("[data-life-readiness]"),
      chipContainer: document.querySelector("[data-dashboard-status-chips]"),
      bmiValueElement: document.querySelector("[data-dashboard-bmi-value]"),
      bmiMetaElement: document.querySelector("[data-dashboard-bmi-meta]"),
      tdeeValueElement: document.querySelector("[data-dashboard-tdee-value]"),
      tdeeMetaElement: document.querySelector("[data-dashboard-tdee-meta]"),
      sleepValueElement: document.querySelector("[data-dashboard-sleep-value]"),
      activityValueElement: document.querySelector("[data-dashboard-activity-value]"),
      breakdownContainer: document.querySelector("[data-dashboard-breakdown]"),
      benchmarkSummaryElement: document.querySelector("[data-dashboard-benchmark-summary]"),
      recommendationsContainer: document.querySelector("[data-dashboard-recommendations]"),
      profileContainer: document.querySelector("[data-dashboard-profile-list]"),
    };

    function showContent(record) {
      renderDashboard(record, elements);
      setPanelsVisible(loadingEl, emptyEl, mainEl, "content");
    }

    function showEmpty() {
      setPanelsVisible(loadingEl, emptyEl, mainEl, "empty");
    }

    if (idParam) {
      setPanelsVisible(loadingEl, emptyEl, mainEl, "loading");

      fetchAssessmentById(idParam.trim())
        .then(function (payload) {
          var record = payload && payload.data ? payload.data : null;
          if (record) {
            showContent(record);
            return;
          }
          var fallback = getStoredAssessment();
          if (fallback) {
            showContent(fallback);
          } else {
            showEmpty();
          }
        })
        .catch(function () {
          var fallback = getStoredAssessment();
          if (fallback) {
            showContent(fallback);
          } else {
            showEmpty();
          }
        });

      return;
    }

    var record = getStoredAssessment();
    if (!record) {
      showEmpty();
      return;
    }

    showContent(record);
  });
})();
