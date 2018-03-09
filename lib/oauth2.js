const config = require('../config');

const crypto = require('crypto'),
      axios = require('axios');

let User = require('../models/User');

const apiEndpoint = 'https://student.sbhs.net.au/api';

const credentials = {
    client: config.sbhs,
    auth: {
        tokenHost: 'https://student.sbhs.net.au/',
        tokenPath: '/api/token',
        authorizePath: '/api/authorize'
    }
};

var oauth2 = require('simple-oauth2').create(credentials);

function AuthError(message) {
    this.name = 'AuthError';
    this.message = message || 'Authentication Error';
    this.stack = (new Error()).stack;
}
AuthError.prototype = Object.create(Error.prototype);
AuthError.prototype.constructor = AuthError;

function generateAuthURI(redirect) {
    let state = crypto.randomBytes(12).toString('hex');
    const uri = oauth2.authorizationCode.authorizeURL({
        redirect_uri: redirect,
        scope: 'all-ro',
        state: state
    });
    return {uri, state};
}

async function authenticate(options) {
    let tokens = await oauth2.authorizationCode.getToken(options);
    let userInfo = await axios.get(`${apiEndpoint}/details/userinfo.json`, {
        headers: {
            "Authorization": `Bearer ${tokens.access_token}`
        }
    });


    if (userInfo.data.yearGroup != '12') {
        throw new AuthError('Not Authorised');
    }
    
    await User.authenticate(userInfo.data.studentId);

    return {
        id: userInfo.data.studentId,
        name: `${userInfo.data.givenName} ${userInfo.data.surname}`
    };
}

module.exports = {
    generateAuthURI,
    authenticate,
    AuthError
};
