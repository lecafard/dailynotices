const send = require('koa-send'),
      path = require('path');
let User = require('../models/User');

/*
 * Method: GET
 * Description: Get id, user name.
 */
exports.me = async function(ctx) {
    let user = await User.get(ctx.session.userId);
    ctx.response.body = {id: ctx.session.userId, name: ctx.session.userName, quota: user.quota};
};

/*
 * Method: GET
 * Description: Shows the home page, different for logged in and out.
 */
exports.home = async function(ctx) {
    if (ctx.session.userId) {
        return await send(ctx, "html/app.html", {root: path.join(__dirname, '../static')}); 
    }
    await send(ctx, "html/login.html", {root: path.join(__dirname, '../static')});
}
