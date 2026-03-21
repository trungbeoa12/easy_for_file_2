const {
  createRegistration,
  getRegistrationById,
  getLatestForAuthenticatedUser,
} = require('../services/mvp-registration.service');
const { validateMvpRegistrationPayload } = require('../validators/mvp-registration.validator');

async function createMvpRegistration(req, res, next) {
  try {
    const payload = validateMvpRegistrationPayload(req.body);

    if (req.user) {
      payload.email = req.user.email;
    }

    const registration = await createRegistration(payload, {
      userId: req.user ? req.user.id : null,
    });

    res.status(201).json({
      success: true,
      message: 'MVP registration created successfully.',
      data: registration,
    });
  } catch (error) {
    next(error);
  }
}

async function getMyLatestRegistration(req, res, next) {
  try {
    const data = await getLatestForAuthenticatedUser(req.user.id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function getMvpRegistrationById(req, res, next) {
  try {
    const registration = await getRegistrationById(req.params.id);

    res.status(200).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createMvpRegistration,
  getMvpRegistrationById,
  getMyLatestRegistration,
};
