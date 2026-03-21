function roundToTwo(value) {
  return Math.round(value * 100) / 100;
}

function getBmiCategory(bmiValue) {
  if (bmiValue < 18.5) {
    return 'Underweight';
  }

  if (bmiValue < 25) {
    return 'Normal';
  }

  if (bmiValue < 30) {
    return 'Overweight';
  }

  return 'Obesity';
}

function calculateBmi(weightKg, heightCm) {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) {
    return null;
  }

  const heightMeters = heightCm / 100;
  const bmiValue = weightKg / (heightMeters * heightMeters);

  return {
    value: roundToTwo(bmiValue),
    category: getBmiCategory(bmiValue),
    reference: 'WHO BMI classification',
  };
}

module.exports = {
  calculateBmi,
};
