const send = require('koa-send'),
      path = require('path');
let User = require('../models/User');

/*
 * Method: GET
 * Description: Get id, user name.
 */
exports.me = async function(ctx) {
    let user = await User.get(ctx.session.userId);
    ctx.response.body = {
        status: true, 
        user: {id: ctx.session.userId, name: ctx.session.userName, quota: user.quota}
    };
};

/*
 * Method: GET
 * Description: Shows the home page, different for logged in and out.
 */
exports.index = async function(ctx) {
    await send(ctx, "html/login.html", {root: path.join(__dirname, '../static')});
}

/*
 * Method: GET
 * Description: Show app.
 */
exports.app = async function(ctx) {
    await send(ctx, "html/app.html", {root: path.join(__dirname, '../static')});
}
