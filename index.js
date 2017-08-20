const config = require('./config'),
      port = process.env.PORT || 3000;

const Koa = require('koa'),
      BodyParser = require('koa-bodyparser'),
      Mount = require('koa-mount'),
      Static = require('koa-static'),
      http = require('http'),
      path = require('path'),
      fs = require('fs'),
      Session = require('koa-session');

let app = new Koa();
require('./db');
let routes = require('./routes');

app.use(BodyParser({
    formLimit: '32kb',
    jsonLimit: '32kb',
    textLimit: '32kb'
}));

app.keys = config.session.keys;
app.use(Session({
    key: 'quotednsbhs-sid',
    cookie: {
        maxAge: 7*24*60*60*1000 // 1 week
    }
}, app));

app.use(routes.routes());
app.use(routes.allowedMethods());
app.use(Mount('/static', Static(__dirname + '/static')));

var server = http.createServer(app.callback());
server.listen(port, (err) => {
    if(!parseInt(port, 10)) {
        // chmod 666
        fs.chmodSync(port, '0666');
    }
    console.log(`Application listening on port ${port}.`);
});
server.on('error', (e) => {
    if(parseInt(port, 10)) {
        throw e;
    }

    fs.unlinkSync(port);
    server.listen(port, (err) => {
        // chmod 666
        fs.chmodSync(port, '0666');
    });
});
