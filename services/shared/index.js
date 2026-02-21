// Entry point for @dhakdhakgo/shared workspace package
module.exports = {
  authMiddleware: require('./auth-middleware'),
  firestoreConfig: require('./firebase-config'),
  httpClient: require('./http-client'),
  utils: require('./utils')
};
