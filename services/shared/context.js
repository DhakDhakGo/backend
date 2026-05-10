const { AsyncLocalStorage } = require('node:async_hooks');

class AsyncLocalStorageHandler {
  constructor(options) {
    this.storage = new AsyncLocalStorage(options);
  }
  setToStore(obj) {
    const store = this.storage.getStore();
    Object.entries(obj).forEach(([key, value]) => {
      store[key] = value;
    })
  }
  getFromStore(key) {
    const store = this.storage.getStore();
    return store[key];
  }
  asyncLocalStorageRunMiddleware() {
    return (req, res, next) => {
      const store = {};
      this.storage.run(store, next);
    }
  }
}

class ContextHolder {
  static initialize(options) {
    this.context = new AsyncLocalStorageHandler(options);
  }
  static contextMiddleware() {
    return this.context.asyncLocalStorageRunMiddleware();
  }
  static setToContext(obj) {
    this.context.setToStore(obj);
  }
  static getInfoForKey(key) {
    return this.context.getFromStore(key);
  }
}

module.exports = {
  ContextHolder
};