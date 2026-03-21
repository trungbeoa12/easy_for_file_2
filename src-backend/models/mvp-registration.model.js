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
    profile: {
      age: {
        type: Number,
        min: 10,
        max: 100,
        default: null,
      },
      gender: {
        type: String,
        enum: ['male', 'female', 'other', ''],
        default: '',
      },
    },
    bodyMetrics: {
      heightCm: {
        type: Number,
        min: 100,
        max: 250,
        default: null,
      },
      weightKg: {
        type: Number,
        min: 20,
        max: 300,
        default: null,
      },
    },
    habits: {
      sleepHours: {
        type: Number,
        min: 0,
        max: 24,
        default: null,
      },
      activityLevel: {
        type: String,
        enum: ['sedentary', 'light', 'moderate', 'active', 'very-active', ''],
        default: '',
      },
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
    assessment: {
      bmi: {
        value: { type: Number, default: null },
        category: { type: String, default: '' },
        reference: { type: String, default: '' },
      },
      tdee: {
        bmr: { type: Number, default: null },
        tdee: { type: Number, default: null },
        activityMultiplier: { type: Number, default: null },
        activityLevel: { type: String, default: '' },
        formula: { type: String, default: '' },
      },
      lifeScore: {
        type: Number,
        default: 0,
      },
      components: {
        body: { type: Number, default: 0 },
        sleep: { type: Number, default: 0 },
        activity: { type: Number, default: 0 },
      },
      explanation: {
        type: String,
        default: '',
      },
      summary: {
        type: String,
        default: '',
      },
      statuses: {
        sleep: { type: String, default: '' },
        activity: { type: String, default: '' },
        bmi: { type: String, default: '' },
      },
      recommendations: {
        type: [String],
        default: [],
      },
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
