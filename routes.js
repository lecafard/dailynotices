const Router = require('koa-router');
const Validate = require('koa2-validation');

let screwup = false;

let router = Router();
let AuthController = require('./controllers/auth');
let IndexController = require('./controllers/index');
let NoticesController = require('./controllers/notices');


async function screwupHandler(ctx, next) {
    ctx.screwup = screwup;
    return next();
}

async function checkAuth(ctx, next) {
    if (screwup) {
        ctx.status = 500;
        return ctx.response.body = {status: false, message: 'Internal Server Error'}
    }
    if(ctx.session.userId) {
        return next();
    }
    ctx.status = 401;
    ctx.response.body = {status: false, message: 'Please Log In'}; 
}

async function errHandler(ctx, next) {
    try {
        await next();
    } catch (err) { 
        if (err.status != 400) {
            console.error(err);
            err.status = 500;
        }

        ctx.status = err.status || err.code || 500;
        ctx.response.body = {
            success: false,
            message: (err.status == 400) ? err.message : 'Internal Server Error'
        }
    }
}

router.get('/', IndexController.index);
router.get(/^\/app(?:\/|$)/, checkAuth, IndexController.app);
router.get('/login', screwupHandler, AuthController.authenticate);
router.get('/login/callback', screwupHandler, AuthController.authCallback);
router.get('/logout', async function(ctx) {
    ctx.session = null;
    ctx.cookies.set('logged_in', null, {
        httpOnly: false, 
        signed: false,
    });
    ctx.redirect('/');
});
router.get('/letsfuckshitup', async function(ctx) {
    screwup = true;
    ctx.status = 404;
});
router.get('/wubbalubbadubdub', async function(ctx) {
    screwup = false;
    ctx.status = 404;
});

let apiRouter = new Router();

apiRouter.get('/me',  IndexController.me);
apiRouter.get('/me/notices', NoticesController.listMe);
apiRouter.get('/notices', NoticesController.listAllByVotes);
apiRouter.get('/notices/votes', NoticesController.listAllByVotes);
apiRouter.get('/notices/new', NoticesController.listAllByNew);
apiRouter.get('/notices/old', NoticesController.listAllByOld);
apiRouter.post('/notices', Validate(NoticesController.v.new), NoticesController.new);
apiRouter.get('/notices/:id', Validate(NoticesController.v.get), NoticesController.get);
apiRouter.put('/notices/:id', Validate(NoticesController.v.modify), NoticesController.modify);
apiRouter.delete('/notices/:id', Validate(NoticesController.v.delete), NoticesController.delete);
apiRouter.put('/notices/:id/vote', Validate(NoticesController.v.get), NoticesController.vote);
apiRouter.delete('/notices/:id/vote', Validate(NoticesController.v.get), NoticesController.unVote);

router.use('/api', checkAuth, errHandler, apiRouter.routes(), apiRouter.allowedMethods());

module.exports = router;
