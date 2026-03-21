const mongoose = require('mongoose');

const MvpRegistration = require('../models/mvp-registration.model');
const { buildBenchmarkAssessment } = require('./benchmark.service');
const { buildLifeScore } = require('./life-score.service');
const { calculateBmi } = require('../utils/health/bmi');
const { calculateTdee } = require('../utils/health/tdee');

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
    lifeScore: assessment.lifeScore || 0,
    components: assessment.components || { body: 0, sleep: 0, activity: 0 },
    explanation: assessment.explanation || '',
    assessment: registration.assessment,
    createdAt: registration.createdAt,
    updatedAt: registration.updatedAt,
  };
}

async function createRegistration(payload) {
  if (mongoose.connection.readyState !== 1) {
    const error = new Error('Database is not connected. Please configure MONGODB_URI before submitting registrations.');
    error.statusCode = 503;
    throw error;
  }

  const assessment = buildAssessment(payload);
  const registration = await MvpRegistration.create({
    ...payload,
    assessment,
  });

  return mapRegistrationToResponse(registration);
}

async function getRegistrationById(id) {
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

  return mapRegistrationToResponse(registration);
}

module.exports = {
  createRegistration,
  getRegistrationById,
};
