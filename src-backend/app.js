const path = require('path');
const express = require('express');
const cors = require('cors');

const apiRoutes = require('./routes');
const requestLogger = require('./middlewares/request-logger');
const notFoundHandler = require('./middlewares/not-found');
const errorHandler = require('./middlewares/error-handler');

function createCorsOptions() {
  const corsOrigin = process.env.CORS_ORIGIN || '*';

  if (corsOrigin === '*') {
    return { origin: '*' };
  }

  const allowedOrigins = corsOrigin
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('CORS origin is not allowed.'));
    },
  };
}

function createApp() {
  const app = express();

  app.use(cors(createCorsOptions()));
  app.use(express.json());
  app.use(requestLogger);

  app.use(express.static(path.join(__dirname, '..', 'src')));

  app.get('/', (req, res) => {
    res.redirect('/pages/index.html');
  });

  app.use('/api', apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = {
  createApp,
};
