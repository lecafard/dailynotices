let config = require('../config');
let Message = require('../models/Message');
let User = require('../models/User');

/*
 * Method: POST
 * Description: Create a new fake daily message
 */
exports.new = async function(ctx) {
    let user = await User.get(ctx.session.userId);
    if (user.quota >= config.quota) {
        // Stop right there
        ctx.status = 403;
        return ctx.response.body = "Quota used up";
    }
    let {title, message, teacher, anonymous} = ctx.request.body;
    
    let msg = new Message({
        title,
        message,
        teacher,
        user_id: anonymous ? 'anonymous' : ctx.session.userId
    });

    try { 
        await user.incrementQuota();
        await msg.create();
        ctx.response.body = msg;
    } catch(e) {
        ctx.status = 500;
        ctx.response.body = 'Failed';
    }
}

/*
 * Method: GET
 * Description: Get a particular message.
 */
exports.get = async function(ctx) {
    let msg = await Message.get(ctx.params.id); 
    if (!msg) {
        ctx.status = 404;
        return ctx.response.body = "Message Not Found";
    }
    ctx.response.body = msg;
}

/* 
 * Method: PUT
 * Description: Modify a daily messsage with id, only if anonymous or owned by user.
 */
exports.modify = async function(ctx) {
    let id = ctx.params.id;
    let {title, message, teacher} = ctx.request.body;

    let msg = new Message({
        id,
        title,
        message,
        teacher
    });

    try { 
        let result = await msg.updateIfUser(ctx.session.userId);
        if(result.changes) {
            return ctx.response.body = msg;
        }
        ctx.status = 403;
        ctx.response.body ="Failed";
    } catch(e) {
        ctx.status = 500;
        ctx.response.body = 'Failed';
    }
}

/*
 * Method: GET
 * Description: List user's messages (not anonymous), with id.
 */
exports.listMe = async function(ctx) {
    ctx.response.body = await Message.getByUser(ctx.session.userId);
}

/* 
 * Method: GET
 * Description: List all messages.
 */
exports.listAll = async function(ctx) {
    ctx.response.body = await Message.getAll();
}



