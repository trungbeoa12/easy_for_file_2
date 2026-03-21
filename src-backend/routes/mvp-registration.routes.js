const express = require('express');

const { createMvpRegistration } = require('../controllers/mvp-registration.controller');

const router = express.Router();

router.post('/', createMvpRegistration);

module.exports = router;
