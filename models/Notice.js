let sqlite = require('../db');
let crypto = require('crypto');

class Notice {
    constructor(opt) {
        this.message = opt.message;
        this.title = opt.title;
        this.id = opt.id || crypto.randomBytes(12).toString('hex');
        this.vote_id = opt.vote_id;
        this.addressed_to = opt.addressed_to;
        this.author_name = opt.author_name;
        this.user_id = opt.user_id;
    }

    async create() {
        let db = await sqlite;
        return db.run('INSERT INTO notices (id,title,message,author_name,addressed_to,user_id) VALUES(?,?,?,?,?,?);',
            [this.id, this.title, this.message, this.author_name, this.addressed_to, this.user_id]);
    }

    async updateIfUser(uid) {
        let db = await sqlite;
        return db.run('UPDATE notices SET title=?, message=?, author_name=?, addressed_to=? \
            WHERE id=? AND user_id IN("anonymous", ?);', 
            [this.title, this.message, this.author_name, this.addressed_to, this.id, uid]);
    }

    static async deleteByUser(id, uid) {
        let db = await sqlite;
        return db.run('DELETE FROM notices WHERE id=? AND user_id=?;', [id, uid]);
    }

    static async get(id) {
        let db = await sqlite;
        return db.get('SELECT title, author_name, vote_id, addressed_to, message FROM notices WHERE id=? LIMIT 1;', id);
    }
    
    static async getAll() {
        let db = await sqlite;
        return db.all('SELECT title, author_name, vote_id, addressed_to, message FROM notices;');
    }

    static async getByUser(userId) {
        let db = await sqlite;
        return db.all('SELECT id, title, author_name, vote_id, addressed_to, message FROM notices WHERE user_id=?;', userId);
    }
}

module.exports = Notice;
