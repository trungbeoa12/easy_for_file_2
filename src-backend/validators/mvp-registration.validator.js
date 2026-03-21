const ALLOWED_GOALS = ['lose-weight', 'muscle', 'health', 'productivity', 'balance'];
const ALLOWED_PRIORITIES = ['form', 'dashboard', 'daily-plan', 'ecosystem'];
const ALLOWED_SOURCE_PAGES = ['landing', 'mvp-registration'];
const ALLOWED_GENDERS = ['male', 'female', 'other', ''];
const ALLOWED_ACTIVITY_LEVELS = ['sedentary', 'light', 'moderate', 'active', 'very-active', ''];

function createValidationError(message, details) {
  const error = new Error(message);
  error.statusCode = 400;
  error.details = details;
  return error;
}

function normalizeGoals(goals) {
  if (goals === undefined) {
    return [];
  }

  if (!Array.isArray(goals)) {
    throw createValidationError('Invalid registration payload.', [
      { field: 'goals', message: 'Goals must be an array.' },
    ]);
  }

  const cleanedGoals = goals
    .map((goal) => String(goal).trim())
    .filter(Boolean);

  const invalidGoal = cleanedGoals.find((goal) => !ALLOWED_GOALS.includes(goal));

  if (invalidGoal) {
    throw createValidationError('Invalid registration payload.', [
      { field: 'goals', message: `Unsupported goal: ${invalidGoal}` },
    ]);
  }

  return [...new Set(cleanedGoals)];
}

function normalizeNumber(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : NaN;
}

function validateRange(field, value, min, max, errors) {
  if (value === null) {
    return;
  }

  if (Number.isNaN(value)) {
    errors.push({ field, message: `${field} must be a valid number.` });
    return;
  }

  if (value < min || value > max) {
    errors.push({ field, message: `${field} must be between ${min} and ${max}.` });
  }
}

function validateMvpRegistrationPayload(payload) {
  const errors = [];

  const fullName = String(payload.fullName || '').trim();
  const email = String(payload.email || '').trim().toLowerCase();
  const priority = String(payload.priority || '').trim();
  const note = String(payload.note || '').trim();
  const sourcePage = String(payload.sourcePage || 'mvp-registration').trim();
  const consent = payload.consent === true;
  const profile = payload.profile || {};
  const bodyMetrics = payload.bodyMetrics || {};
  const habits = payload.habits || {};
  const age = normalizeNumber(profile.age);
  const gender = String(profile.gender || '').trim();
  const heightCm = normalizeNumber(bodyMetrics.heightCm);
  const weightKg = normalizeNumber(bodyMetrics.weightKg);
  const sleepHours = normalizeNumber(habits.sleepHours);
  const activityLevel = String(habits.activityLevel || '').trim();

  if (!fullName) {
    errors.push({ field: 'fullName', message: 'Full name is required.' });
  }

  if (!email) {
    errors.push({ field: 'email', message: 'Email is required.' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({ field: 'email', message: 'Email format is invalid.' });
  }

  if (!priority) {
    errors.push({ field: 'priority', message: 'Priority is required.' });
  } else if (!ALLOWED_PRIORITIES.includes(priority)) {
    errors.push({ field: 'priority', message: 'Priority is not supported.' });
  }

  if (!ALLOWED_SOURCE_PAGES.includes(sourcePage)) {
    errors.push({ field: 'sourcePage', message: 'Source page is not supported.' });
  }

  if (!ALLOWED_GENDERS.includes(gender)) {
    errors.push({ field: 'profile.gender', message: 'Gender is not supported.' });
  }

  if (!ALLOWED_ACTIVITY_LEVELS.includes(activityLevel)) {
    errors.push({ field: 'habits.activityLevel', message: 'Activity level is not supported.' });
  }

  if (!consent) {
    errors.push({ field: 'consent', message: 'Consent must be accepted.' });
  }

  validateRange('profile.age', age, 10, 100, errors);
  validateRange('bodyMetrics.heightCm', heightCm, 100, 250, errors);
  validateRange('bodyMetrics.weightKg', weightKg, 20, 300, errors);
  validateRange('habits.sleepHours', sleepHours, 0, 24, errors);

  if (errors.length) {
    throw createValidationError('Invalid registration payload.', errors);
  }

  return {
    fullName,
    email,
    profile: {
      age,
      gender,
    },
    bodyMetrics: {
      heightCm,
      weightKg,
    },
    habits: {
      sleepHours,
      activityLevel,
    },
    goals: normalizeGoals(payload.goals),
    priority,
    note,
    consent,
    sourcePage,
  };
}

module.exports = {
  validateMvpRegistrationPayload,
  ALLOWED_GOALS,
  ALLOWED_PRIORITIES,
  ALLOWED_SOURCE_PAGES,
};
