const config = require('../config');
let sqlite = require('../lib/db');

class User {
    constructor(opt) {
        this.id = opt.id;
        this.quota = opt.quota;
    }

    static async get(id) {
        let db = await sqlite;
        let res = await db.get(`SELECT id,${config.quota}-quota AS quota FROM users where id=?;`, id);
        return res ? new this(res) : null;
    }

    async incrementQuota() {
        let db = await sqlite;
        await db.run('UPDATE users SET quota=quota+1 WHERE id=?;', this.id);
        return this.quota--;
    }
    
    async decrementQuota() {
        let db = await sqlite;
        await db.run('UPDATE users SET quota=quota-1 WHERE id=?;', this.id);
        return this.quota++;
    }

    static async authenticate(id) {
        // Create user if not exists, set quota to 0
        let db = await sqlite;
        return db.run('INSERT OR IGNORE INTO users (id) VALUES (?)', id);
    }
}

module.exports = User;
