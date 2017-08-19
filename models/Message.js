let sqlite = require('../db');
let crypto = require('crypto');

class Message {
    constructor(opt) {
        this.message = opt.message;
        this.title = opt.title;
        this.id = opt.id || crypto.randomBytes(12).toString('hex');
        this.teacher = opt.teacher;
        this.user_id = opt.user_id;
    }

    async create() {
        let db = await sqlite;
        return db.run('INSERT INTO messages (id,title,message,teacher,user_id) VALUES(?,?,?,?,?);',
            [this.id, this.title, this.message, this.teacher, this.user_id]);
    }

    async updateIfUser(uid) {
        let db = await sqlite;
        return db.run('UPDATE messages SET title=?, message=?, teacher=? \
            WHERE id=? AND user_id IN("anonymous", ?);',[this.title, this.message, this.teacher, this.id, uid]);
    }

    static async get(id) {
        let db = await sqlite;
        return db.get('SELECT title, teacher, message FROM messages WHERE id=? LIMIT 1;', id);
    }
    
    static async getAll() {
        let db = await sqlite;
        return db.all('SELECT title, teacher, message FROM messages;');
    }

    static async getByUser(userId) {
        let db = await sqlite;
        return db.all('SELECT id, title, teacher, message FROM messages WHERE user_id=?;', userId);
    }
}

module.exports = Message;
