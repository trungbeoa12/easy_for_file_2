const mongoose = require('mongoose');

const MvpRegistration = require('../models/mvp-registration.model');

async function createRegistration(payload) {
  if (mongoose.connection.readyState !== 1) {
    const error = new Error('Database is not connected. Please configure MONGODB_URI before submitting registrations.');
    error.statusCode = 503;
    throw error;
  }

  const registration = await MvpRegistration.create(payload);

  return {
    id: registration._id.toString(),
    fullName: registration.fullName,
    email: registration.email,
    goals: registration.goals,
    priority: registration.priority,
    note: registration.note,
    consent: registration.consent,
    sourcePage: registration.sourcePage,
    status: registration.status,
    createdAt: registration.createdAt,
    updatedAt: registration.updatedAt,
  };
}

module.exports = {
  createRegistration,
};
