const express = require('express');

const {
  createMvpRegistration,
  getMvpRegistrationById,
  getMyLatestRegistration,
} = require('../controllers/mvp-registration.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/me', requireAuth, getMyLatestRegistration);
router.post('/', requireAuth, createMvpRegistration);
router.get('/:id', requireAuth, getMvpRegistrationById);

module.exports = router;
