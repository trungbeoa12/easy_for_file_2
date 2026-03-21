const ALLOWED_GOALS = ['lose-weight', 'muscle', 'health', 'productivity', 'balance'];
const ALLOWED_PRIORITIES = ['form', 'dashboard', 'daily-plan', 'ecosystem'];
const ALLOWED_SOURCE_PAGES = ['landing', 'mvp-registration'];

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

function validateMvpRegistrationPayload(payload) {
  const errors = [];

  const fullName = String(payload.fullName || '').trim();
  const email = String(payload.email || '').trim().toLowerCase();
  const priority = String(payload.priority || '').trim();
  const note = String(payload.note || '').trim();
  const sourcePage = String(payload.sourcePage || 'mvp-registration').trim();
  const consent = payload.consent === true;

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

  if (!consent) {
    errors.push({ field: 'consent', message: 'Consent must be accepted.' });
  }

  if (errors.length) {
    throw createValidationError('Invalid registration payload.', errors);
  }

  return {
    fullName,
    email,
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
