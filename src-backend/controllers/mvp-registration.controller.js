const { createRegistration } = require('../services/mvp-registration.service');
const { validateMvpRegistrationPayload } = require('../validators/mvp-registration.validator');

async function createMvpRegistration(req, res, next) {
  try {
    const payload = validateMvpRegistrationPayload(req.body);
    const registration = await createRegistration(payload);

    res.status(201).json({
      success: true,
      message: 'MVP registration created successfully.',
      data: registration,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createMvpRegistration,
};
