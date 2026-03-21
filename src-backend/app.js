const path = require('path');
const express = require('express');
const cors = require('cors');

const apiRoutes = require('./routes');
const requestLogger = require('./middlewares/request-logger');
const notFoundHandler = require('./middlewares/not-found');
const errorHandler = require('./middlewares/error-handler');

const LOCAL_PAGE_ALIASES = {
  '/': 'pages/index.html',
  '/index.html': 'pages/index.html',
  '/login.html': 'pages/login.html',
  '/register.html': 'pages/register.html',
  '/mvp-registration.html': 'pages/mvp-registration.html',
  '/dashboard.html': 'pages/dashboard.html',
  '/news.html': 'pages/news.html',
  '/news-detail.html': 'pages/news-detail.html',
};

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

  Object.entries(LOCAL_PAGE_ALIASES).forEach(([sourcePath, destinationPath]) => {
    app.get(sourcePath, (req, res) => {
      res.sendFile(path.join(__dirname, '..', 'src', destinationPath));
    });
  });

  app.use('/api', apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = {
  createApp,
};
