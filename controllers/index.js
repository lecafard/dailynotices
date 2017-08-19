let User = require('../models/User');

/*
 * Method: GET
 * Description: Get id, user name.
 */
exports.me = async function(ctx) {
    let user = await User.get(ctx.session.userId);
    ctx.response.body = {id: ctx.session.userId, name: ctx.session.userName, quota: user.quota};
};
