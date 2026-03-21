const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 160,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    displayName: {
      type: String,
      default: '',
      trim: true,
      maxlength: 120,
    },
    profile: {
      fullName: { type: String, default: '', trim: true, maxlength: 120 },
      locale: { type: String, default: 'vi', trim: true, maxlength: 10 },
    },
    preferences: {
      goals: { type: [String], default: [] },
      notifyProductUpdates: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.models.User ? mongoose.models.User : mongoose.model('User', userSchema);
