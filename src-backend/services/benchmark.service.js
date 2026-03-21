function getSleepStatus(sleepHours) {
  if (sleepHours === null || sleepHours === undefined) {
    return null;
  }

  if (sleepHours < 7) {
    return 'low';
  }

  if (sleepHours <= 9) {
    return 'balanced';
  }

  return 'high';
}

function getActivityStatus(activityLevel) {
  if (!activityLevel) {
    return null;
  }

  if (activityLevel === 'sedentary' || activityLevel === 'light') {
    return 'low';
  }

  if (activityLevel === 'moderate') {
    return 'balanced';
  }

  return 'high';
}

function buildSummary({ bmi, tdee, sleepHours, activityLevel }) {
  const summaryParts = [];
  const sleepStatus = getSleepStatus(sleepHours);
  const activityStatus = getActivityStatus(activityLevel);

  if (bmi && bmi.category) {
    if (bmi.category === 'Underweight') {
      summaryParts.push('Chi so BMI hien dang thap hon vung can bang.');
    } else if (bmi.category === 'Normal') {
      summaryParts.push('Chi so BMI dang nam trong nhom can bang.');
    } else if (bmi.category === 'Overweight') {
      summaryParts.push('Chi so BMI dang cao hon vung can bang va can theo doi them.');
    } else if (bmi.category === 'Obesity') {
      summaryParts.push('Chi so BMI dang o muc cao va nen uu tien dieu chinh som.');
    }
  }

  if (tdee && typeof tdee.tdee === 'number') {
    summaryParts.push(`Muc nang luong duy tri uoc tinh cua ban la ${tdee.tdee} kcal/ngay.`);
  }

  if (sleepStatus === 'low') {
    summaryParts.push('Thoi luong ngu hien tai co dau hieu chua dat muc phuc hoi tot.');
  } else if (sleepStatus === 'balanced') {
    summaryParts.push('Giac ngu hien tai dang o muc kha on cho phuc hoi co ban.');
  } else if (sleepStatus === 'high') {
    summaryParts.push('Thoi luong ngu cua ban dang cao, nen doi chieu them voi muc nang luong va lich sinh hoat.');
  }

  if (activityStatus === 'low') {
    summaryParts.push('Muc van dong hien tai con thap so voi muc nen co cho suc khoe tong quat.');
  } else if (activityStatus === 'balanced') {
    summaryParts.push('Muc van dong hien tai dang o nguong kha can bang.');
  } else if (activityStatus === 'high') {
    summaryParts.push('Muc van dong cua ban dang cao, can de y them phuc hoi va dinh duong.');
  }

  if (!summaryParts.length) {
    return 'Dang ky da duoc ghi nhan. Khi bo sung them du lieu, he thong se tra ve danh gia chi tiet hon.';
  }

  return summaryParts.join(' ');
}

function buildRecommendations({ bmi, sleepHours, activityLevel, goals }) {
  const recommendations = [];
  const sleepStatus = getSleepStatus(sleepHours);
  const activityStatus = getActivityStatus(activityLevel);
  const safeGoals = Array.isArray(goals) ? goals : [];

  if (bmi && bmi.category === 'Underweight') {
    recommendations.push('Uu tien theo doi bua an va nang luong nap vao de tang can mot cach on dinh.');
  }

  if (bmi && (bmi.category === 'Overweight' || bmi.category === 'Obesity')) {
    recommendations.push('Bat dau bang viec theo doi khau phan va tang muc van dong deu trong tuan.');
  }

  if (sleepStatus === 'low') {
    recommendations.push('Thu dua gio ngu ve on dinh hon va tang dan muc tieu len it nhat 7 gio moi dem.');
  }

  if (activityStatus === 'low') {
    recommendations.push('Them 20-30 phut di bo nhanh hoac van dong nhe vao lich hang ngay.');
  }

  if (safeGoals.includes('productivity')) {
    recommendations.push('Neu uu tien nang suat, hay bat dau bang khung gio ngu va gio bat dau lam viec co dinh.');
  }

  if (safeGoals.includes('balance')) {
    recommendations.push('Neu uu tien can bang, nen dat truoc cac khoang nghi ngan giua cac block cong viec.');
  }

  if (safeGoals.includes('muscle')) {
    recommendations.push('Neu muc tieu la tang co, can ket hop muc van dong phu hop voi nang luong va protein nap vao.');
  }

  if (!recommendations.length) {
    recommendations.push('Tiep tuc bo sung du lieu thoi quen de nhan duoc goi y ca nhan hoa sat hon.');
  }

  return recommendations.slice(0, 5);
}

function buildBenchmarkAssessment({ bmi, tdee, habits, goals }) {
  return {
    summary: buildSummary({
      bmi,
      tdee,
      sleepHours: habits.sleepHours,
      activityLevel: habits.activityLevel,
    }),
    statuses: {
      sleep: getSleepStatus(habits.sleepHours),
      activity: getActivityStatus(habits.activityLevel),
      bmi: bmi ? bmi.category.toLowerCase() : null,
    },
    recommendations: buildRecommendations({
      bmi,
      sleepHours: habits.sleepHours,
      activityLevel: habits.activityLevel,
      goals,
    }),
  };
}

module.exports = {
  buildBenchmarkAssessment,
  getSleepStatus,
  getActivityStatus,
};
