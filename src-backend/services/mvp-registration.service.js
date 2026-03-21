const mongoose = require('mongoose');

const MvpRegistration = require('../models/mvp-registration.model');
const { buildBenchmarkAssessment } = require('./benchmark.service');
const { buildLifeScore } = require('./life-score.service');
const { calculateBmi } = require('../utils/health/bmi');
const { calculateTdee } = require('../utils/health/tdee');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function toUserObjectId(userId) {
  if (!userId) {
    return null;
  }

  if (userId instanceof mongoose.Types.ObjectId) {
    return userId;
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return null;
  }

  return new mongoose.Types.ObjectId(userId);
}

function roundNumber(value, decimals = 0) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }

  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function getAssessmentMeta(registration, fallbackSequence) {
  const assessmentMeta = registration.assessmentMeta || {};

  return {
    assessmentVersion: assessmentMeta.assessmentVersion || 'v1',
    sequence: assessmentMeta.sequence || fallbackSequence || null,
    submittedAt: assessmentMeta.submittedAt || registration.createdAt || null,
  };
}

function buildAssessment(payload) {
  const bmi = calculateBmi(payload.bodyMetrics.weightKg, payload.bodyMetrics.heightCm);
  const tdee = calculateTdee({
    gender: payload.profile.gender,
    age: payload.profile.age,
    heightCm: payload.bodyMetrics.heightCm,
    weightKg: payload.bodyMetrics.weightKg,
    activityLevel: payload.habits.activityLevel,
  });
  const benchmark = buildBenchmarkAssessment({
    bmi,
    tdee,
    habits: payload.habits,
    goals: payload.goals,
  });
  const lifeScore = buildLifeScore({
    bmiStatus: benchmark.statuses.bmi,
    sleepStatus: benchmark.statuses.sleep,
    activityStatus: benchmark.statuses.activity,
    bmi,
  });

  return {
    bmi,
    tdee,
    lifeScore: lifeScore.lifeScore,
    components: lifeScore.components,
    explanation: lifeScore.explanation,
    summary: benchmark.summary,
    statuses: benchmark.statuses,
    recommendations: benchmark.recommendations,
  };
}

function mapRegistrationToResponse(registration) {
  const assessment = registration.assessment || {};

  return {
    id: registration._id.toString(),
    userId: registration.userId ? registration.userId.toString() : null,
    fullName: registration.fullName,
    email: registration.email,
    profile: registration.profile,
    bodyMetrics: registration.bodyMetrics,
    habits: registration.habits,
    goals: registration.goals,
    priority: registration.priority,
    note: registration.note,
    consent: registration.consent,
    sourcePage: registration.sourcePage,
    status: registration.status,
    assessmentMeta: getAssessmentMeta(registration, null),
    lifeScore: assessment.lifeScore || 0,
    components: assessment.components || { body: 0, sleep: 0, activity: 0 },
    explanation: assessment.explanation || '',
    assessment: registration.assessment,
    createdAt: registration.createdAt,
    updatedAt: registration.updatedAt,
  };
}

function buildHistoryItem(registration, fallbackSequence) {
  const assessment = registration.assessment || {};
  const bmi = assessment.bmi || {};
  const tdee = assessment.tdee || {};
  const assessmentMeta = getAssessmentMeta(registration, fallbackSequence);

  return {
    id: registration._id.toString(),
    createdAt: registration.createdAt,
    submittedAt: assessmentMeta.submittedAt || registration.createdAt,
    sequence: assessmentMeta.sequence || null,
    lifeScore: assessment.lifeScore || 0,
    components: assessment.components || { body: 0, sleep: 0, activity: 0 },
    bmi: {
      value: typeof bmi.value === 'number' ? bmi.value : null,
      category: bmi.category || '',
    },
    tdee: {
      tdee: typeof tdee.tdee === 'number' ? tdee.tdee : null,
    },
    summary: assessment.summary || '',
  };
}

function buildDeltaMetric(label, currentValue, previousValue, decimals) {
  const current = roundNumber(currentValue, decimals);
  const previous = roundNumber(previousValue, decimals);

  if (current === null) {
    return {
      label,
      current: null,
      previous,
      delta: null,
      direction: 'flat',
    };
  }

  if (previous === null) {
    return {
      label,
      current,
      previous: null,
      delta: null,
      direction: 'new',
    };
  }

  const delta = roundNumber(current - previous, decimals);
  let direction = 'flat';

  if (delta > 0) {
    direction = 'up';
  } else if (delta < 0) {
    direction = 'down';
  }

  return {
    label,
    current,
    previous,
    delta,
    direction,
  };
}

function buildProgressSummary(currentItem, previousItem, totalAssessments) {
  if (!currentItem) {
    return 'Dashboard dang cho du lieu de theo doi tien trinh.';
  }

  if (!previousItem) {
    return totalAssessments > 1
      ? 'Day la moc du lieu som trong hanh trinh cua ban. Tiep tuc cap nhat de dashboard nhin ra xu huong ro hon.'
      : 'Day la assessment dau tien. Tu lan tiep theo, dashboard se bat dau hien su thay doi theo thoi gian.';
  }

  const lifeScoreDelta = roundNumber((currentItem.lifeScore || 0) - (previousItem.lifeScore || 0), 0) || 0;

  if (lifeScoreDelta > 0) {
    return `So voi lan truoc, Life Score da tang ${lifeScoreDelta} diem. Day la dau hieu nen tang dang cai thien theo huong tich cuc.`;
  }

  if (lifeScoreDelta < 0) {
    return `So voi lan truoc, Life Score dang giam ${Math.abs(lifeScoreDelta)} diem. Hay uu tien xem lai nhung tru cot dang bi tut nhu sleep hoac activity.`;
  }

  return 'So voi lan truoc, Life Score dang giu muc on dinh. Day la luc tot de tap trung toi uu nhung nhom thanh phan con thap.';
}

function buildProgressData(registrations, currentRegistrationId) {
  if (!registrations.length) {
    return {
      summary: 'Dashboard dang cho du lieu de theo doi tien trinh.',
      hasPrevious: false,
      comparedSequence: null,
      metrics: {},
      timeline: [],
    };
  }

  const currentIndex = registrations.findIndex(
    (registration) => String(registration._id) === String(currentRegistrationId)
  );
  const safeCurrentIndex = currentIndex >= 0 ? currentIndex : registrations.length - 1;
  const currentRegistration = registrations[safeCurrentIndex];
  const previousRegistration = safeCurrentIndex > 0 ? registrations[safeCurrentIndex - 1] : null;
  const currentAssessment = currentRegistration.assessment || {};
  const previousAssessment = previousRegistration ? (previousRegistration.assessment || {}) : {};

  return {
    summary: buildProgressSummary(
      buildHistoryItem(currentRegistration, safeCurrentIndex + 1),
      previousRegistration ? buildHistoryItem(previousRegistration, safeCurrentIndex) : null,
      registrations.length
    ),
    hasPrevious: Boolean(previousRegistration),
    comparedSequence: previousRegistration ? getAssessmentMeta(previousRegistration, safeCurrentIndex).sequence : null,
    metrics: {
      lifeScore: buildDeltaMetric('Life Score', currentAssessment.lifeScore, previousAssessment.lifeScore, 0),
      body: buildDeltaMetric('Body', (currentAssessment.components || {}).body, (previousAssessment.components || {}).body, 0),
      sleep: buildDeltaMetric('Sleep', (currentAssessment.components || {}).sleep, (previousAssessment.components || {}).sleep, 0),
      activity: buildDeltaMetric('Activity', (currentAssessment.components || {}).activity, (previousAssessment.components || {}).activity, 0),
    },
    timeline: registrations.map((registration, index) => {
      const historyItem = buildHistoryItem(registration, index + 1);

      return {
        id: historyItem.id,
        sequence: historyItem.sequence,
        createdAt: historyItem.createdAt,
        lifeScore: historyItem.lifeScore,
        components: historyItem.components,
        isCurrent: String(historyItem.id) === String(currentRegistrationId),
      };
    }),
  };
}

async function buildRegistrationTracking({ userId, currentRegistrationId }) {
  const userObjectId = toUserObjectId(userId);
  let registrations;

  if (userObjectId) {
    registrations = await MvpRegistration.find({ userId: userObjectId }).sort({ createdAt: 1 });
  } else {
    return {
      history: [],
      historyMeta: {
        totalAssessments: 0,
        currentSequence: null,
        firstSubmittedAt: null,
        latestSubmittedAt: null,
      },
      progress: buildProgressData([], currentRegistrationId),
    };
  }

  const currentRegistration = registrations.find(
    (registration) => String(registration._id) === String(currentRegistrationId)
  );
  const recentHistory = registrations
    .slice(-8)
    .reverse()
    .map((registration) => {
      const registrationIndex = registrations.findIndex(
        (currentItem) => String(currentItem._id) === String(registration._id)
      );
      const historyItem = buildHistoryItem(registration, registrationIndex + 1);

      return {
        ...historyItem,
        isCurrent: String(historyItem.id) === String(currentRegistrationId),
      };
    });

  return {
    history: recentHistory,
    historyMeta: {
      totalAssessments: registrations.length,
      currentSequence: currentRegistration
        ? getAssessmentMeta(
          currentRegistration,
          registrations.findIndex((registration) => String(registration._id) === String(currentRegistrationId)) + 1
        ).sequence
        : null,
      firstSubmittedAt: registrations[0] ? (registrations[0].assessmentMeta || {}).submittedAt || registrations[0].createdAt : null,
      latestSubmittedAt: registrations[registrations.length - 1]
        ? (registrations[registrations.length - 1].assessmentMeta || {}).submittedAt || registrations[registrations.length - 1].createdAt
        : null,
    },
    progress: buildProgressData(registrations, currentRegistrationId),
  };
}

async function assembleRegistrationResponse(registration) {
  const responseData = mapRegistrationToResponse(registration);
  const tracking = await buildRegistrationTracking({
    userId: registration.userId,
    currentRegistrationId: registration._id,
  });

  return {
    ...responseData,
    assessmentMeta: {
      ...(responseData.assessmentMeta || {}),
      sequence: tracking.historyMeta.currentSequence,
    },
    history: tracking.history,
    historyMeta: tracking.historyMeta,
    progress: tracking.progress,
  };
}

async function createRegistration(payload, options = {}) {
  if (mongoose.connection.readyState !== 1) {
    const error = new Error('Database is not connected. Please configure MONGODB_URI before submitting registrations.');
    error.statusCode = 503;
    throw error;
  }

  const assessment = buildAssessment(payload);
  const normalizedEmail = normalizeEmail(payload.email);
  const userObjectId = toUserObjectId(options.userId);

  if (!userObjectId) {
    const error = new Error('Authentication required to save MVP registration.');
    error.statusCode = 401;
    throw error;
  }

  const currentSequence = (await MvpRegistration.countDocuments({ userId: userObjectId })) + 1;

  const registration = await MvpRegistration.create({
    ...payload,
    email: normalizedEmail,
    userId: userObjectId,
    assessmentMeta: {
      assessmentVersion: 'v1',
      sequence: currentSequence,
      submittedAt: new Date(),
    },
    assessment,
  });

  return assembleRegistrationResponse(registration);
}

async function getRegistrationById(id, viewerUserId) {
  if (mongoose.connection.readyState !== 1) {
    const error = new Error('Database is not connected. Please configure MONGODB_URI before submitting registrations.');
    error.statusCode = 503;
    throw error;
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid registration id.');
    error.statusCode = 400;
    throw error;
  }

  const registration = await MvpRegistration.findById(id);

  if (!registration) {
    const error = new Error('MVP registration not found.');
    error.statusCode = 404;
    throw error;
  }

  if (viewerUserId != null && String(viewerUserId).length) {
    const expectedId = toUserObjectId(viewerUserId);
    const ownerId = registration.userId ? registration.userId.toString() : '';
    if (!expectedId || !ownerId || ownerId !== String(expectedId)) {
      const error = new Error('MVP registration not found.');
      error.statusCode = 404;
      throw error;
    }
  }

  return assembleRegistrationResponse(registration);
}

async function getLatestForAuthenticatedUser(userId) {
  const userObjectId = toUserObjectId(userId);

  if (!userObjectId) {
    const error = new Error('Invalid user.');
    error.statusCode = 400;
    throw error;
  }

  const registration = await MvpRegistration.findOne({ userId: userObjectId }).sort({ createdAt: -1 });

  if (!registration) {
    const error = new Error('No assessments found for this account.');
    error.statusCode = 404;
    throw error;
  }

  return assembleRegistrationResponse(registration);
}

module.exports = {
  createRegistration,
  getRegistrationById,
  getLatestForAuthenticatedUser,
};
