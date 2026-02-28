// Entry point for @dhakdhakgo/shared workspace package
const queryUtils = require('./utils');
const authMiddleware = require('./auth-middleware');
const firestoreConfig = require('./firebase-config');
const httpClient = require('./http-client');

module.exports = {
  ...authMiddleware,
  ...firestoreConfig,
  ...httpClient,
  ...queryUtils
};
