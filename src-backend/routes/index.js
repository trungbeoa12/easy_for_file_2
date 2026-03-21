const express = require('express');

const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const mvpRegistrationRoutes = require('./mvp-registration.routes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/mvp-registrations', mvpRegistrationRoutes);

module.exports = router;
