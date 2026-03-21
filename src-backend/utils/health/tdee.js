const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  'very-active': 1.9,
};

function roundToWhole(value) {
  return Math.round(value);
}

function calculateBmr({ gender, age, heightCm, weightKg }) {
  if (!gender || !age || !heightCm || !weightKg) {
    return null;
  }

  if (gender === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  }

  if (gender === 'female') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  return null;
}

function calculateTdee({ gender, age, heightCm, weightKg, activityLevel }) {
  const bmr = calculateBmr({ gender, age, heightCm, weightKg });
  const activityMultiplier = ACTIVITY_MULTIPLIERS[activityLevel];

  if (!bmr || !activityMultiplier) {
    return null;
  }

  return {
    bmr: roundToWhole(bmr),
    tdee: roundToWhole(bmr * activityMultiplier),
    activityMultiplier,
    activityLevel,
    formula: 'Mifflin-St Jeor',
  };
}

module.exports = {
  ACTIVITY_MULTIPLIERS,
  calculateTdee,
};
