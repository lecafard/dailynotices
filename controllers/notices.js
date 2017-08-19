let config = require('../config');
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
    if (user.quota >= config.quota) {
        // Stop right there
        ctx.status = 403;
        return ctx.response.body = "Quota used up";
    }
    let {title, message, teacher, anonymous} = ctx.request.body;
    
    let msg = new Notice({
        title,
        message,
        teacher,
        user_id: anonymous ? 'anonymous' : ctx.session.userId
    });

    try { 
        await user.incrementQuota();
        await msg.create();
        ctx.response.body = {success: true, notice: msg};
    } catch(e) {
        ctx.status = 500;
        ctx.response.body = 'Failed';
    }
}
exports.v.new = {
    title: Joi.string().max(32).required(),
    message: Joi.string().min(3).max(200).required(),
    teacher: Joi.string().max(32).required(),
    anonymous: Joi.boolean()
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
 * Method: PUT
 * Description: Modify a daily messsage with id, only if anonymous or owned by user.
 */
exports.modify = async function(ctx) {
    let id = ctx.params.id;
    let {title, message, teacher} = ctx.request.body;

    let msg = new Notice({
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
        title: Joi.string().max(32).required(),
        message: Joi.string().min(3).max(200).required(),
        teacher: Joi.string().max(32).required()
    }
};


/*
 * Method: GET
 * Description: List user's messages (not anonymous), with id.
 */
exports.listMe = async function(ctx) {
    ctx.response.body = {status: true, notices:await Notice.getByUser(ctx.session.userId)};
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
    
    try { 
        let result = await msg.deleteByUser(id, ctx.session.userId);
        if(result.changes) {
            let user = User.get(ctx.session.userId);
            await user.decrementQuota();
            return ctx.response.body = msg;
        }
        ctx.status = 403;
        ctx.response.body = {status: false, message: 'Unauthorised.'};
    } catch(e) {
        ctx.status = 500;
        ctx.response.body = {status: false, message: 'Internal Server Error'};
    }
};
exports.v.delete = {
    params: {
        id: Joi.string().hex().length(24)
    }
};
