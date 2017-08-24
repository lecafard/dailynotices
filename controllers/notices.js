let Notice = require('../models/Notice');
let User = require('../models/User');
let Joi = require('joi');

// Validation
exports.v = {};

/*
 * Method: POST
 * Description: Create a new fake daily message
 */
exports.new = async function(ctx) {
    let user = await User.get(ctx.session.userId);
    if (user.quota <= 0) {
        // Stop right there
        ctx.status = 403;
        return ctx.response.body = {status: false, message: "Quota used up"};
    }
    let {title, message, addressed_to, author_name, anonymous} = ctx.request.body;
    
    let msg = new Notice({
        title,
        message,
        addressed_to,
        author_name,
        user_id: ctx.session.userId
    });
    
    await user.incrementQuota();
    await msg.create();
    ctx.status = 201; 
    ctx.response.body = {success: true, notice: msg, quota_remaining: user.quota};
}
exports.v.new = {
    body: {
        anonymous: Joi.boolean(),
        title: Joi.string().max(50).required(),
        message: Joi.string().min(4).max(500).required(),
        addressed_to: Joi.string().max(40).required(),
        author_name: Joi.string().max(40).required()
    }
};

/* 
 * Method: PUT
 * Description: Modify a daily messsage with id, only if anonymous or owned by user.
 */
exports.modify = async function(ctx) {
    let id = ctx.params.id;
    let {title, message, addressed_to, author_name} = ctx.request.body;

    let msg = new Notice({
        id,
        title,
        message,
        addressed_to,
        author_name
    });

    try { 
        let result = await msg.updateByUser(ctx.session.userId);
        if(result.changes) {
            return ctx.response.body = msg;
        }
        ctx.status = 403;
        ctx.response.body = {status: false, message: 'Unauthorised'};
    } catch(e) {
        ctx.status = 500;
        ctx.response.body = {status: false, message: 'Internal Server Error'};
    }
};
exports.v.modify = {
    params: {
        id: Joi.string().hex().length(24)
    },
    body: {
        title: Joi.string().max(50).required(),
        message: Joi.string().min(4).max(500).required(),
        addressed_to: Joi.string().max(40).required(),
        author_name: Joi.string().max(40).required()
    }
};

/*
 * Method: GET
 * Description: Get a particular message.
 */
exports.get = async function(ctx) {
    let msg = await Notice.get(ctx.params.id); 
    if (!msg) {
        ctx.status = 404;
        return ctx.response.body = {status: false, message: 'Notice Not Found'};
    }
    ctx.response.body = {status: true, notice: msg};
}
exports.v.get = {
    params: {
        id: Joi.string().hex().length(24)
    }
};

/*
 * Method: GET
 * Description: List user's messages (not anonymous), with id.
 */
exports.listMe = async function(ctx) {
    let user = await User.get(ctx.session.userId);
    ctx.response.body = {
        status: true, 
        notices:await Notice.getByUser(ctx.session.userId),
        quota: user.quota
    };
};

/* 
 * Method: GET
 * Description: List all messages.
 */
exports.listAll = async function(ctx) {
    ctx.response.body = {status: true, notices: await Notice.getAll()};
};

/*
 * Method: DELETE
 * Description: Delete your own
 */
exports.delete = async function(ctx) {
    var id = ctx.params.id;
    
    let result = await Notice.deleteByUser(id, ctx.session.userId);
    if(result.changes) {
        let user = await User.get(ctx.session.userId);
        await user.decrementQuota();
        return ctx.response.body = {success: true, quota_remaining: user.quota};
    }
    ctx.status = 403;
    ctx.response.body = {status: false, message: 'Unauthorised.'};
};
exports.v.delete = {
    params: {
        id: Joi.string().hex().length(24)
    }
};
