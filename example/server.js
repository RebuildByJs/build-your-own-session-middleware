const Koa = require('koa');
const session = require('../index');
// const session = require('koa-session-minimal');
const app = new Koa();

app.use(session());

app.use(async (ctx, next) => {
  if (ctx.path === '/favicon.ico') return;
  if (!('count' in ctx.session)) ctx.session.count = 0;
  ctx.session.count += 1;
  ctx.body = ctx.session.count;
});

app.listen(3000, () => {
  console.log('listening on port 3000');
}); 