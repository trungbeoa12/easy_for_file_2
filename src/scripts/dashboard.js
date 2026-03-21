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

  function saveLatestAssessment(record) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch (error) {
      /* ignore */
    }
  }

  function formatUpdatedAt(value) {
    if (!value) {
      return "Cap nhat gan nhat";
    }

    try {
      return "Cap nhat " + new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(value));
    } catch (error) {
      return "Cap nhat gan nhat";
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

  function formatGender(gender) {
    if (gender === "male") {
      return "Nam";
    }
    if (gender === "female") {
      return "Nu";
    }
    if (gender === "other") {
      return "Khac";
    }
    return "";
  }

  function buildBreakdown(record) {
    var components = (record.assessment || {}).components || {};

    return [
      {
        key: "body",
        label: "Body",
        value: Number(components.body || 0),
        description: "Nhom nay phan anh tinh trang body metrics va benchmark BMI hien tai.",
      },
      {
        key: "sleep",
        label: "Sleep",
        value: Number(components.sleep || 0),
        description: "Nhom nay uu tien chat luong phuc hoi va thoi luong ngu trung binh.",
      },
      {
        key: "activity",
        label: "Activity",
        value: Number(components.activity || 0),
        description: "Nhom nay cho thay muc van dong hien tai dang ho tro co the den muc nao.",
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

  function renderChart(container, record) {
    var items = buildBreakdown(record);

    container.innerHTML = "";

    items.forEach(function (item) {
      var chartItem = document.createElement("div");
      chartItem.className = "dashboard-chart__item";
      chartItem.innerHTML =
        '<span class="dashboard-chart__label">' + item.label + "</span>" +
        '<div class="dashboard-chart__track"><span style="height:' + item.value + '%"></span></div>' +
        '<strong class="dashboard-chart__value">' + item.value + "</strong>";
      container.appendChild(chartItem);
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
      ["Gioi tinh", formatGender(profile.gender) || "--"],
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

  function renderContext(elements, record, viewState) {
    var contextBlock = elements.contextBlock;
    var contextSource = elements.contextSourceElement;
    var contextUpdated = elements.contextUpdatedElement;
    var contextMessage = elements.contextMessageElement;
    var historyMeta = record.historyMeta || {};
    var assessmentMeta = record.assessmentMeta || {};
    var sourceLabel = "Tu local";
    var message = "Dashboard dang hien assessment gan nhat cua ban.";

    if (!contextBlock || !contextSource || !contextUpdated || !contextMessage) {
      return;
    }

    if (viewState === "api") {
      sourceLabel = "Tu API";
      message = "Ban dang xem ban ghi tu production backend. Link nay co the chia se lai de mo dung assessment nay.";
    } else if (viewState === "account") {
      sourceLabel = "Tai khoan";
      message = "Du lieu theo tai khoan da dang nhap — ban assessment gan nhat cua ban tren server.";
    } else if (viewState === "fallback") {
      sourceLabel = "Local fallback";
      message = "Khong tai duoc ban ghi theo id, nen dashboard tam hien du lieu gan nhat da luu tren trinh duyet nay.";
    }

    if (historyMeta.totalAssessments && assessmentMeta.sequence) {
      message += " Hien tai day la lan assessment thu " + assessmentMeta.sequence + " tren tong " + historyMeta.totalAssessments + " lan da luu.";
    }

    contextSource.textContent = sourceLabel;
    contextUpdated.textContent = formatUpdatedAt(record.updatedAt || record.createdAt);
    contextMessage.textContent = message;
    contextBlock.hidden = false;
  }

  function formatHistoryDate(value) {
    if (!value) {
      return "Moi cap nhat";
    }

    try {
      return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(value));
    } catch (error) {
      return "Moi cap nhat";
    }
  }

  function renderHistory(container, record) {
    var history = Array.isArray(record.history) ? record.history : [];

    container.innerHTML = "";

    if (!history.length) {
      container.innerHTML =
        '<div class="dashboard-history-empty">' +
        "<strong>Day la assessment dau tien cua ban.</strong>" +
        "<p>Khi ban cap nhat them lan nua, dashboard se hien duoc lich su va xu huong tien bo ngay tai day.</p>" +
        "</div>";
      return;
    }

    history.forEach(function (item) {
      var article = document.createElement("article");
      article.className = "dashboard-history-card";

      var metaBits = [];
      if (typeof item.lifeScore === "number") {
        metaBits.push("Life Score " + item.lifeScore);
      }
      if (item.bmi && typeof item.bmi.value === "number") {
        metaBits.push("BMI " + item.bmi.value);
      }
      if (item.tdee && typeof item.tdee.tdee === "number") {
        metaBits.push("TDEE " + item.tdee.tdee + " kcal");
      }

      article.innerHTML =
        '<div class="dashboard-history-card__top">' +
        '<div class="dashboard-history-card__date">Lan #' + (item.sequence || "--") + " • " + formatHistoryDate(item.createdAt) + "</div>" +
        (item.isCurrent ? '<span class="dashboard-history-card__badge">Ban ghi hien tai</span>' : "") +
        "</div>" +
        '<p class="dashboard-history-card__meta">' + (metaBits.join(" • ") || "Assessment da duoc luu") + "</p>" +
        '<p class="dashboard-history-card__summary">' +
        (item.summary || "Ban ghi nay da duoc luu va san sang de so sanh trong dashboard.") +
        "</p>" +
        '<a class="dashboard-inline-link" href="dashboard.html?id=' + encodeURIComponent(item.id) + '">Mo ban ghi nay</a>';

      container.appendChild(article);
    });
  }

  function formatDelta(delta) {
    if (typeof delta !== "number" || Number.isNaN(delta)) {
      return "Moi";
    }

    if (delta > 0) {
      return "+" + delta;
    }

    if (delta < 0) {
      return String(delta);
    }

    return "0";
  }

  function renderProgressCards(container, progress) {
    var metrics = progress && progress.metrics ? progress.metrics : {};
    var keys = ["lifeScore", "body", "sleep", "activity"];
    var comparedLabel = progress && progress.comparedSequence
      ? "vs lan #" + progress.comparedSequence
      : "vs lan truoc";

    container.innerHTML = "";

    keys.forEach(function (key) {
      var metric = metrics[key];
      var article = document.createElement("article");
      var deltaClass = "is-flat";
      var deltaLabel = "Moi";

      if (metric && metric.direction === "up") {
        deltaClass = "is-up";
      } else if (metric && metric.direction === "down") {
        deltaClass = "is-down";
      } else if (metric && metric.direction === "new") {
        deltaClass = "is-new";
      }

      if (metric) {
        deltaLabel = formatDelta(metric.delta);
      }

      var currentValue = (metric && typeof metric.current === "number")
        ? metric.current + "/100"
        : "--";

      article.className = "dashboard-progress-card";
      article.innerHTML =
        '<span class="dashboard-progress-card__label">' + ((metric && metric.label) || key) + "</span>" +
        '<strong class="dashboard-progress-card__value">' + currentValue + "</strong>" +
        '<span class="dashboard-progress-card__delta ' + deltaClass + '">' + deltaLabel + " " + comparedLabel + "</span>";
      container.appendChild(article);
    });
  }

  function renderProgressMeta(container, historyMeta, progress) {
    if (!container) {
      return;
    }

    var bits = [];
    var currentSequence = historyMeta && historyMeta.currentSequence;
    var totalAssessments = historyMeta && historyMeta.totalAssessments;
    var comparedSequence = progress && progress.comparedSequence;

    if (currentSequence) {
      bits.push("Dang xem lan #" + currentSequence);
    }

    if (totalAssessments) {
      bits.push("Tong " + totalAssessments + " lan assessment");
    }

    if (comparedSequence) {
      bits.push("So sanh truc tiep voi lan #" + comparedSequence);
    }

    if (!bits.length) {
      container.hidden = true;
      container.textContent = "";
      return;
    }

    container.textContent = bits.join(" • ");
    container.hidden = false;
  }

  function renderProgressTimeline(container, progress, historyMeta) {
    var timeline = progress && Array.isArray(progress.timeline) ? progress.timeline : [];

    container.innerHTML = "";

    if (!timeline.length) {
      container.innerHTML = '<p class="dashboard-timeline__empty">Chua co timeline assessment.</p>';
      return;
    }

    if (historyMeta && historyMeta.totalAssessments) {
      var intro = document.createElement("p");
      intro.className = "dashboard-timeline__intro";
      intro.textContent = "Tong cong " + historyMeta.totalAssessments + " lan assessment da duoc luu cho email nay.";
      container.appendChild(intro);
    }

    timeline.forEach(function (item) {
      var article = document.createElement("article");
      article.className = "dashboard-timeline__item";
      article.innerHTML =
        '<div class="dashboard-timeline__top">' +
        '<strong>Lan #' + (item.sequence || "--") + "</strong>" +
        '<span>' + formatHistoryDate(item.createdAt) + "</span>" +
        "</div>" +
        '<div class="dashboard-timeline__life-score">' +
        '<span>Life Score</span>' +
        '<strong>' + (typeof item.lifeScore === "number" ? item.lifeScore : "--") + "/100</strong>" +
        "</div>" +
        '<div class="dashboard-timeline__bars">' +
        '<span style="width:' + Number((item.components || {}).body || 0) + '%">Body</span>' +
        '<span style="width:' + Number((item.components || {}).sleep || 0) + '%">Sleep</span>' +
        '<span style="width:' + Number((item.components || {}).activity || 0) + '%">Activity</span>' +
        "</div>" +
        '<a class="dashboard-inline-link" href="dashboard.html?id=' + encodeURIComponent(item.id) + '">' +
        (item.isCurrent ? "Ban ghi hien tai" : "Mo assessment nay") +
        "</a>";

      if (item.isCurrent) {
        article.classList.add("is-current");
      }

      container.appendChild(article);
    });
  }

  function renderDashboard(record, elements, viewState) {
    var assessment = record.assessment || {};
    var bmi = assessment.bmi || null;
    var tdee = assessment.tdee || null;
    var progress = record.progress || {};
    var historyMeta = record.historyMeta || {};

    if (elements.summaryElement) {
      elements.summaryElement.textContent = assessment.summary || "Dashboard dang cho du lieu assessment gan nhat cua ban.";
    }

    if (elements.readinessElement) {
      elements.readinessElement.textContent = (assessment.lifeScore || 0) + "/100";
    }

    if (elements.lifeScoreExplanationElement) {
      elements.lifeScoreExplanationElement.textContent = assessment.explanation || "Life Score se duoc cap nhat khi assessment co du du lieu.";
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

    if (elements.chartContainer) {
      renderChart(elements.chartContainer, record);
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

    if (elements.historyContainer) {
      renderHistory(elements.historyContainer, record);
    }

    if (elements.progressSummaryElement) {
      elements.progressSummaryElement.textContent = progress.summary
        || "Dashboard se bat dau so sanh thay doi khi ban co tu 2 lan assessment tro len.";
    }

    if (elements.progressMetaElement) {
      renderProgressMeta(elements.progressMetaElement, historyMeta, progress);
    }

    if (elements.progressCardsContainer) {
      renderProgressCards(elements.progressCardsContainer, progress);
    }

    if (elements.progressTimelineContainer) {
      renderProgressTimeline(elements.progressTimelineContainer, progress, historyMeta);
    }

    renderContext(elements, record, viewState);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var idParam = getQueryParam("id");
    var loadingEl = document.querySelector("[data-dashboard-loading]");
    var emptyEl = document.querySelector("[data-dashboard-empty]");
    var mainEl = document.querySelector("[data-dashboard-main]");
    var emptyCopyEl = document.querySelector("[data-dashboard-empty-copy]");
    var emptyPrimaryAction = document.querySelector("[data-dashboard-empty-primary]");
    var emptySecondaryAction = document.querySelector("[data-dashboard-empty-secondary]");

    var elements = {
      summaryElement: document.querySelector("[data-dashboard-summary]"),
      readinessElement: document.querySelector("[data-life-score]"),
      lifeScoreExplanationElement: document.querySelector("[data-life-score-explanation]"),
      chipContainer: document.querySelector("[data-dashboard-status-chips]"),
      bmiValueElement: document.querySelector("[data-dashboard-bmi-value]"),
      bmiMetaElement: document.querySelector("[data-dashboard-bmi-meta]"),
      tdeeValueElement: document.querySelector("[data-dashboard-tdee-value]"),
      tdeeMetaElement: document.querySelector("[data-dashboard-tdee-meta]"),
      sleepValueElement: document.querySelector("[data-dashboard-sleep-value]"),
      activityValueElement: document.querySelector("[data-dashboard-activity-value]"),
      breakdownContainer: document.querySelector("[data-dashboard-breakdown]"),
      chartContainer: document.querySelector("[data-dashboard-chart]"),
      benchmarkSummaryElement: document.querySelector("[data-dashboard-benchmark-summary]"),
      recommendationsContainer: document.querySelector("[data-dashboard-recommendations]"),
      profileContainer: document.querySelector("[data-dashboard-profile-list]"),
      historyContainer: document.querySelector("[data-dashboard-history]"),
      progressSummaryElement: document.querySelector("[data-dashboard-progress-summary]"),
      progressMetaElement: document.querySelector("[data-dashboard-progress-meta]"),
      progressCardsContainer: document.querySelector("[data-dashboard-progress-cards]"),
      progressTimelineContainer: document.querySelector("[data-dashboard-progress-timeline]"),
      contextBlock: document.querySelector("[data-dashboard-context]"),
      contextSourceElement: document.querySelector("[data-dashboard-context-source]"),
      contextUpdatedElement: document.querySelector("[data-dashboard-context-updated]"),
      contextMessageElement: document.querySelector("[data-dashboard-context-message]"),
    };

    function showContent(record, viewState) {
      try {
        renderDashboard(record, elements, viewState || "local");
      } catch (err) {
        console.error("Dashboard render error:", err);
      }
      setPanelsVisible(loadingEl, emptyEl, mainEl, "content");
    }

    function showEmpty(mode) {
      if (emptyCopyEl) {
        if (mode === "account-empty") {
          emptyCopyEl.textContent = "Tai khoan nay chua co assessment nao. Hay hoan thanh assessment dau tien de dashboard bat dau luu lich su, diem so va tien trinh cho ban.";
        } else if (mode === "guest-empty") {
          emptyCopyEl.innerHTML = 'Dashboard can mot ban assessment. Hay hoan thanh form dang ky MVP de xem BMI, TDEE va goi y ca nhan, hoac dang nhap de mo dashboard theo tai khoan.';
        } else {
          emptyCopyEl.innerHTML = 'Dashboard can mot ban assessment. Hay hoan thanh form dang ky MVP de xem BMI, TDEE va goi y ca nhan — hoac mo link co ma <code>id</code> hop le tu email/thong bao sau khi gui form.';
        }
      }

      if (emptyPrimaryAction) {
        emptyPrimaryAction.textContent = mode === "account-empty" ? "Lam assessment dau tien" : "Quay lai lam assessment";
      }

      if (emptySecondaryAction) {
        emptySecondaryAction.hidden = mode === "account-empty";
      }

      setPanelsVisible(loadingEl, emptyEl, mainEl, "empty");
    }

    if (idParam) {
      setPanelsVisible(loadingEl, emptyEl, mainEl, "loading");

      fetchAssessmentById(idParam.trim())
        .then(function (payload) {
          var record = payload && payload.data ? payload.data : null;
          if (record) {
            showContent(record, "api");
            return;
          }
          var fallback = getStoredAssessment();
          if (fallback) {
            showContent(fallback, "fallback");
          } else {
            showEmpty();
          }
        })
        .catch(function () {
          var fallback = getStoredAssessment();
          if (fallback) {
            showContent(fallback, "fallback");
          } else {
            showEmpty();
          }
        });

      return;
    }

    var auth = window.EFL_AUTH;
    var authToken = auth && auth.getToken ? auth.getToken() : "";

    if (authToken) {
      setPanelsVisible(loadingEl, emptyEl, mainEl, "loading");

      fetch(buildApiUrl("/api/mvp-registrations/me"), {
        method: "GET",
        headers: Object.assign({ Accept: "application/json" }, auth.getAuthHeaders()),
      })
        .then(function (response) {
          return response.json().catch(function () {
            return null;
          }).then(function (data) {
            if (!response.ok) {
              var err = new Error((data && data.message) || "Không tải được dashboard.");
              err.status = response.status;
              throw err;
            }
            return data;
          });
        })
        .then(function (payload) {
          var record = payload && payload.data ? payload.data : null;
          if (record) {
            saveLatestAssessment(record);
            showContent(record, "account");
            return;
          }
          showEmpty("account-empty");
        })
        .catch(function (err) {
          var status = err && err.status;
          if (status === 401 || status === 403) {
            if (auth && typeof auth.clearSession === "function") {
              auth.clearSession();
            }
          }
          if (status === 404) {
            showEmpty("account-empty");
            return;
          }
          var fallback = getStoredAssessment();
          if (fallback) {
            showContent(fallback, "fallback");
          } else {
            showEmpty("guest-empty");
          }
        });

      return;
    }

    var record = getStoredAssessment();
    if (!record) {
      showEmpty("guest-empty");
      return;
    }

    showContent(record, "local");
  });
})();
