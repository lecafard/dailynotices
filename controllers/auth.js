const oauth2 = require('../lib/oauth2');

/*
 * Method: GET
 * Description: Redirects user to Oauth2 Endpoint
 */
exports.authenticate = async function (ctx) {
    if (ctx.session.userId) {
        return ctx.redirect('/app');
    }

    let redirectUri = `http://${ctx.get('host')}/login/callback`;
    const {uri, state} = oauth2.generateAuthURI(redirectUri);
    
    ctx.session.oauthState = state;
    ctx.session.save();
    ctx.redirect(uri);
   
}


exports.authCallback = async function (ctx) {
    if (ctx.session.userId) {
        return ctx.redirect('/app');
    }

    let redirectUri = `http://${ctx.get('host')}/login/callback`;
    let {code, state} = ctx.query;
    let options = {
        code,
        redirect_uri: redirectUri
    };

    if (state != ctx.session.oauthState) {
        return ctx.response.body = "The state's messed up";
    }
    ctx.session.oauthState = null;
    
    try {
        let user = await oauth2.authenticate(options);

        ctx.session.userId = user.id;
        ctx.session.userName = user.name;
        ctx.cookies.set('logged_in', 1, {
            httpOnly: false, 
            signed: false,
            maxAge: 7*24*3600*1000
        });
        ctx.session.save();
        ctx.redirect('/app');
        
    } catch (e) {
        console.error(e);
        ctx.response.body = "Authentication Error";
    }
}
