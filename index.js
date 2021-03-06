const MemoryStore = require('./memory_store');

const ONE_DAY = 1000 * 3600 * 24;

const cookieOpts = (opts = {}) => {
  const options = Object.assign({
    maxAge: 0,
    path: '/',
    httpOnly: true
  }, opts, {
    overwrite: true,
    signed: false
  });
  if (!(options.maxAge >= 0)) options.maxAge = 0;
  return options;
};

const deleteSession = (ctx, key, cookieOpts, store, sid) => {
  const tmp = Object.assign({}, cookieOpts);
  delete tmp.maxAge;
  ctx.cookies.set(key, null, tmp);
  store.destory(`${key}:${sid}`);
};

const saveSession = (ctx, key, cookieOpts, store, sid) => {
  const ttl = cookieOpts.maxAge > 0 ? cookieOpts.maxAge : ONE_DAY;
  ctx.cookies.set(key, sid, cookieOpts);
  store.set(`${key}:${sid}`, ctx.session, ttl);
};

const checkSession = (ctx) => {
  if (!ctx.session || typeof ctx.session !== 'object') ctx.session = {};
};

module.exports = function Session (options = {}) {
  const opt = options;
  const key = opt.key || 'session:middlewares';
  const cookie = cookieOpts(opt.cookie);
  const store = new MemoryStore();

  return async (ctx, next) => {
    const oldSid = ctx.cookies.get(key);
    
    let sid = oldSid;

    ctx.sessionHandler = {
      generatorId: () => {
        sid = Math.random().toString(36).substr(2);
        return sid;
      }
    }

    console.log(sid);
    if (!sid) {
      ctx.sessionHandler.generatorId();
      ctx.session = {};
    } else {
      ctx.session = store.get(`${key}:${sid}`);
      checkSession(ctx);
    }
    
    await next();

    const hasData = Object.keys(ctx.session).length > 0;

    if (sid === oldSid) {
      if (JSON.stringify(ctx.session) === JSON.stringify(store.get(`${key}:${sid}`))) return;
      if (hasData) {
        saveSession(ctx, key, cookie, store, sid);
      } else {
        deleteSession(ctx, key, cookie, store, sid);
      }
    } else {
      if (oldSid) deleteSession(ctx, key, cookie, store, sid);
      if (hasData) saveSession(ctx, key, cookie, store, sid);
    }
  }
};