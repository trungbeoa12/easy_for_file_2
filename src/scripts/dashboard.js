(function () {
  "use strict";

  var STORAGE_KEY = "eflLatestAssessment";

  function getStoredAssessment() {
    try {
      var rawValue = window.localStorage.getItem(STORAGE_KEY);
      return rawValue ? JSON.parse(rawValue) : null;
    } catch (error) {
      return null;
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

  document.addEventListener("DOMContentLoaded", function () {
    var record = getStoredAssessment();
    var summaryElement = document.querySelector("[data-dashboard-summary]");
    var readinessElement = document.querySelector("[data-life-readiness]");
    var chipContainer = document.querySelector("[data-dashboard-status-chips]");
    var bmiValueElement = document.querySelector("[data-dashboard-bmi-value]");
    var bmiMetaElement = document.querySelector("[data-dashboard-bmi-meta]");
    var tdeeValueElement = document.querySelector("[data-dashboard-tdee-value]");
    var tdeeMetaElement = document.querySelector("[data-dashboard-tdee-meta]");
    var sleepValueElement = document.querySelector("[data-dashboard-sleep-value]");
    var activityValueElement = document.querySelector("[data-dashboard-activity-value]");
    var breakdownContainer = document.querySelector("[data-dashboard-breakdown]");
    var benchmarkSummaryElement = document.querySelector("[data-dashboard-benchmark-summary]");
    var recommendationsContainer = document.querySelector("[data-dashboard-recommendations]");
    var profileContainer = document.querySelector("[data-dashboard-profile-list]");
    var assessment;
    var bmi;
    var tdee;

    if (!record) {
      return;
    }

    assessment = record.assessment || {};
    bmi = assessment.bmi || null;
    tdee = assessment.tdee || null;

    if (summaryElement) {
      summaryElement.textContent = assessment.summary || "Dashboard dang cho du lieu assessment gan nhat cua ban.";
    }

    if (readinessElement) {
      readinessElement.textContent = calculateLifeReadiness(record) + "/100";
    }

    if (chipContainer) {
      renderStatusChips(chipContainer, record);
    }

    if (bmiValueElement) {
      bmiValueElement.textContent = bmi && typeof bmi.value === "number" ? bmi.value : "--";
    }

    if (bmiMetaElement) {
      bmiMetaElement.textContent = bmi && bmi.category ? bmi.category : "Chua co du lieu BMI";
    }

    if (tdeeValueElement) {
      tdeeValueElement.textContent = tdee && typeof tdee.tdee === "number" ? tdee.tdee + " kcal" : "--";
    }

    if (tdeeMetaElement) {
      tdeeMetaElement.textContent = tdee && typeof tdee.bmr === "number"
        ? "BMR " + tdee.bmr + " kcal, " + tdee.formula
        : "Chua co du lieu TDEE";
    }

    if (sleepValueElement) {
      sleepValueElement.textContent = record.habits && (record.habits.sleepHours || record.habits.sleepHours === 0)
        ? record.habits.sleepHours + " gio"
        : "--";
    }

    if (activityValueElement) {
      activityValueElement.textContent = record.habits && record.habits.activityLevel
        ? formatActivityLevel(record.habits.activityLevel)
        : "--";
    }

    if (breakdownContainer) {
      renderBreakdown(breakdownContainer, record);
    }

    if (benchmarkSummaryElement) {
      benchmarkSummaryElement.textContent = assessment.summary || "Chua co benchmark summary.";
    }

    if (recommendationsContainer) {
      renderRecommendations(recommendationsContainer, Array.isArray(assessment.recommendations) ? assessment.recommendations : []);
    }

    if (profileContainer) {
      renderProfileList(profileContainer, record);
    }
  });
})();
