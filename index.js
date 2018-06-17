const MemoryStore = require('./memory_store');
const memoryStore = new MemoryStore();

module.exports = function Session (options = {}) {
  const opt = options;
  const key = opt.key || 'session:middlewares';

  return async (ctx, next) => {
    
  }
};