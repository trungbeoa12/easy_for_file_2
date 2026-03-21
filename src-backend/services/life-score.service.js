function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function scoreBody(bmi) {
  if (!bmi || !bmi.category) {
    return 0;
  }

  if (bmi.category === 'Normal') {
    return 84;
  }

  if (bmi.category === 'Underweight' || bmi.category === 'Overweight') {
    return 58;
  }

  return 34;
}

function scoreSleep(sleepStatus) {
  if (!sleepStatus) {
    return 0;
  }

  if (sleepStatus === 'balanced') {
    return 82;
  }

  if (sleepStatus === 'high') {
    return 61;
  }

  return 42;
}

function scoreActivity(activityStatus) {
  if (!activityStatus) {
    return 0;
  }

  if (activityStatus === 'balanced') {
    return 80;
  }

  if (activityStatus === 'high') {
    return 72;
  }

  return 44;
}

function buildExplanation(lifeScore) {
  if (lifeScore >= 80) {
    return 'Nen tang hien tai dang rat kha quan, ban co the chuyen sang toi uu hoa va duy tri on dinh.';
  }

  if (lifeScore >= 65) {
    return 'Ban da co nen tang tuong doi on, nhung van con mot vai nhom chi so can cai thien de can bang hon.';
  }

  if (lifeScore >= 45) {
    return 'Day la giai doan nen uu tien 1-2 thay doi nho nhung deu, dac biet o cac nhom diem dang thap.';
  }

  return 'Life Score hien con thap, nen uu tien xay lai cac tru cot nen tang nhu body, sleep va activity truoc.';
}

function buildLifeScore({ bmiStatus, sleepStatus, activityStatus, bmi }) {
  const components = {
    body: scoreBody(bmi),
    sleep: scoreSleep(sleepStatus),
    activity: scoreActivity(activityStatus),
  };

  const availableScores = Object.values(components).filter((value) => value > 0);
  const lifeScore = availableScores.length
    ? clampScore(components.body * 0.4 + components.sleep * 0.3 + components.activity * 0.3)
    : 0;

  return {
    lifeScore,
    components,
    explanation: buildExplanation(lifeScore),
  };
}

module.exports = {
  buildLifeScore,
};
