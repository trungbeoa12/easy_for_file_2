const mongoose = require('mongoose');

const mvpRegistrationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 160,
    },
    goals: {
      type: [String],
      default: [],
    },
    priority: {
      type: String,
      required: true,
      enum: ['form', 'dashboard', 'daily-plan', 'ecosystem'],
    },
    note: {
      type: String,
      default: '',
      trim: true,
      maxlength: 2000,
    },
    consent: {
      type: Boolean,
      required: true,
    },
    sourcePage: {
      type: String,
      enum: ['landing', 'mvp-registration'],
      default: 'mvp-registration',
    },
    status: {
      type: String,
      enum: ['new', 'reviewed', 'contacted', 'rejected'],
      default: 'new',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.models.MvpRegistration
  ? mongoose.models.MvpRegistration
  : mongoose.model('MvpRegistration', mvpRegistrationSchema);
