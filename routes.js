const Router = require('koa-router');
const Validate = require('koa2-validation');

let router = Router();
let AuthController = require('./controllers/auth');
let IndexController = require('./controllers/index');
let NoticesController = require('./controllers/notices');


async function checkAuth(ctx, next) {
    if(ctx.session.userId) {
        return next();
    }
    ctx.status = 401;
    ctx.response.body = "Please log in"; 
}

async function errHandler(ctx, next) {
    try {
        await next();
    } catch (err) { 
        ctx.status = err.status || err.code || 500;
        ctx.response.body = {
            success: false,
            message: (err.status == 400) ? err.message : 'Internal Server Error'
        };
    }
}


router.get('/', IndexController.home);
router.get('/login', AuthController.authenticate);
router.get('/login/callback', AuthController.authCallback);
router.get('/logout', async function(ctx) {
    ctx.session = null;
    ctx.redirect('/');
});

let apiRouter = new Router();

apiRouter.get('/me',  IndexController.me);
apiRouter.get('/me/notices', NoticesController.listMe);
apiRouter.get('/notices', NoticesController.listAll);
apiRouter.post('/notices', Validate(NoticesController.v.new), NoticesController.new);
apiRouter.get('/notices/:id', Validate(NoticesController.v.get), NoticesController.get);
apiRouter.put('/notices/:id', Validate(NoticesController.v.modify), NoticesController.modify);
apiRouter.delete('/notices/:id', Validate(NoticesController.v.delete), NoticesController.delete);

router.use('/api', checkAuth, errHandler, apiRouter.routes(), apiRouter.allowedMethods());

module.exports = router;
