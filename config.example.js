const path = require('path');

module.exports = {
    db: path.join(__dirname, 'app.db'),
    sbhs: {
        id: 'client_id',
        secret: 'client_secret'
    },
    session: {
        keys: ['keyboard cat test pussy']
    },
    quota: 3
};
