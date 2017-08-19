const Router = require('koa-router');

let router = Router();
let AuthController = require('./controllers/auth');
let IndexController = require('./controllers/index');
let MessageController = require('./controllers/message');

async function checkAuth(ctx, next) {
    if(ctx.session.userId) {
        return next();
    }
    ctx.status = 401;
    ctx.response.body = "Please log in"; 
}

router.get('/login', AuthController.authenticate);
router.get('/login/callback', AuthController.authCallback);
router.get('/logout', async function(ctx) {
    ctx.session = null;
    ctx.redirect('/');
});

router.get('/api/me', checkAuth, IndexController.me);
router.get('/api/me/messages', checkAuth, MessageController.listMe);
router.get('/api/messages', checkAuth, MessageController.listAll);
router.post('/api/messages', checkAuth, MessageController.new);
router.get('/api/messages/:id', checkAuth, MessageController.get);
router.put('/api/messages/:id', checkAuth, MessageController.modify);

module.exports = router;


