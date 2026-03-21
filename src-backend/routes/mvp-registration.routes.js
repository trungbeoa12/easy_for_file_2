const express = require('express');

const {
  createMvpRegistration,
  getMvpRegistrationById,
  getMyLatestRegistration,
} = require('../controllers/mvp-registration.controller');
const { optionalAuth, requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/me', requireAuth, getMyLatestRegistration);
router.post('/', optionalAuth, createMvpRegistration);
router.get('/:id', getMvpRegistrationById);

module.exports = router;
