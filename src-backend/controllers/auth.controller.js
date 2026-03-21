const {
  registerUser,
  loginUser,
  getUserById,
  mapUserToPublic,
} = require('../services/auth.service');

function validateRegisterBody(body) {
  const email = String(body?.email || '').trim().toLowerCase();
  const password = String(body?.password || '');
  const displayName = body?.displayName;
  const fullName = body?.fullName ?? body?.profile?.fullName;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const error = new Error('Valid email is required.');
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 8) {
    const error = new Error('Password must be at least 8 characters.');
    error.statusCode = 400;
    throw error;
  }

  return { email, password, displayName, fullName };
}

function validateLoginBody(body) {
  const email = String(body?.email || '').trim().toLowerCase();
  const password = String(body?.password || '');

  if (!email || !password) {
    const error = new Error('Email and password are required.');
    error.statusCode = 400;
    throw error;
  }

  return { email, password };
}

async function register(req, res, next) {
  try {
    const payload = validateRegisterBody(req.body);
    const { token, user } = await registerUser(payload);

    res.status(201).json({
      success: true,
      message: 'Account created.',
      data: { token, user },
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const payload = validateLoginBody(req.body);
    const { token, user } = await loginUser(payload);

    res.status(200).json({
      success: true,
      message: 'Signed in.',
      data: { token, user },
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res) {
  res.status(200).json({
    success: true,
    message: `Signed out for ${req.user.email}. Clear the stored token on client.`,
  });
}

async function me(req, res, next) {
  try {
    const user = await getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: mapUserToPublic(user),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  logout,
  me,
};
