const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const SALT_ROUNDS = 10;
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

/** Only for local/dev when .env has no JWT_SECRET. Production must set JWT_SECRET. */
const DEV_FALLBACK_JWT_SECRET = 'easyforlife-local-dev-only-secret-key';

function getJwtSecret() {
  let secret = process.env.JWT_SECRET;
  const isProd = process.env.NODE_ENV === 'production';

  if (!secret || secret.length < 16) {
    if (isProd) {
      throw new Error('JWT_SECRET must be set (min 16 characters) for auth.');
    }
    secret = DEV_FALLBACK_JWT_SECRET;
    console.warn(
      '[auth] JWT_SECRET missing or too short — using dev-only default. Set JWT_SECRET in .env for stable local tokens and for production.'
    );
  }

  return secret;
}

function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), email: user.email },
    getJwtSecret(),
    { expiresIn: JWT_EXPIRES }
  );
}

function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

function mapUserToPublic(userDoc) {
  if (!userDoc) {
    return null;
  }

  return {
    id: userDoc._id.toString(),
    email: userDoc.email,
    displayName: userDoc.displayName || '',
    profile: userDoc.profile || { fullName: '', locale: 'vi' },
    preferences: userDoc.preferences || { goals: [], notifyProductUpdates: true },
    createdAt: userDoc.createdAt,
    updatedAt: userDoc.updatedAt,
  };
}

async function registerUser({ email, password, displayName, fullName }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail }).select('_id');

  if (existing) {
    const error = new Error('Email is already registered.');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    email: normalizedEmail,
    passwordHash,
    displayName: String(displayName || '').trim().slice(0, 120),
    profile: {
      fullName: String(fullName || '').trim().slice(0, 120),
      locale: 'vi',
    },
    preferences: { goals: [], notifyProductUpdates: true },
  });

  const token = signToken(user);
  return { token, user: mapUserToPublic(user) };
}

async function loginUser({ email, password }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const token = signToken(user);
  const publicUser = await User.findById(user._id);
  return { token, user: mapUserToPublic(publicUser) };
}

async function getUserById(id) {
  if (!id) {
    return null;
  }

  return User.findById(id);
}

module.exports = {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  mapUserToPublic,
  registerUser,
  loginUser,
  getUserById,
};
