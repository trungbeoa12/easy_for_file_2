const express = require('express');

const healthRoutes = require('./health.routes');
const mvpRegistrationRoutes = require('./mvp-registration.routes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/mvp-registrations', mvpRegistrationRoutes);

module.exports = router;
