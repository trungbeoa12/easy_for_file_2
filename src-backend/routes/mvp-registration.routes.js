const express = require('express');

const {
  createMvpRegistration,
  getMvpRegistrationById,
} = require('../controllers/mvp-registration.controller');

const router = express.Router();

router.post('/', createMvpRegistration);
router.get('/:id', getMvpRegistrationById);

module.exports = router;
