let sqlite = require('../lib/db');
let crypto = require('crypto');

class Notice {
    constructor(opt) {
        this.id = opt.id || crypto.randomBytes(12).toString('hex');
        this.title = opt.title;
        this.message = opt.message;
        this.addressed_to = opt.addressed_to;
        this.author_name = opt.author_name;
        this.vote_id = opt.vote_id;
        this.user_id = opt.user_id;
        this.timestamp = opt.timestamp;
    }
    async create() {
        let db = await sqlite;
        return db.run('INSERT INTO notices (id,title,message,author_name,addressed_to,user_id) VALUES(?,?,?,?,?,?);',
            [this.id, this.title, this.message, this.author_name, this.addressed_to, this.user_id]);
    }

    async updateByUser(uid) {
        let db = await sqlite;
        this.timestamp = new Date();
        return db.run('UPDATE notices SET title=?, message=?, author_name=?, addressed_to=?, timestamp=? \
            WHERE id=? AND user_id=?;', 
            [this.title, this.message, this.author_name, this.addressed_to, this.timestamp, this.id, uid]);
    }

    static async deleteByUser(id, uid) {
        let db = await sqlite;
        return db.run('DELETE FROM notices WHERE id=? AND user_id=?;', [id, uid]);
    }

    static async get(id) {
        let db = await sqlite;
        return db.get('SELECT id, title, author_name, addressed_to, timestamp, message FROM notices WHERE id=? LIMIT 1;', id);
    }
    
    static async getAll() {
        let db = await sqlite;
        return db.all('SELECT id, title, author_name, addressed_to, timestamp, message FROM notices \
            ORDER BY timestamp DESC;');
    }

    static async getByUser(userId) {
        let db = await sqlite;
        return db.all('SELECT id, title, author_name, addressed_to, timestamp, message \
            FROM notices WHERE user_id=? ORDER BY timestamp DESC;', userId);
    }
}

module.exports = Notice;
