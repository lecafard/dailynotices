let sqlite = require('../db');
let crypto = require('crypto');

class Notice {
    constructor(opt) {
        this.message = opt.message;
        this.title = opt.title;
        this.id = opt.id || crypto.randomBytes(12).toString('hex');
        this.teacher = opt.teacher;
        this.user_id = opt.user_id;
    }

    async create() {
        let db = await sqlite;
        return db.run('INSERT INTO notices (id,title,message,teacher,user_id) VALUES(?,?,?,?,?);',
            [this.id, this.title, this.message, this.teacher, this.user_id]);
    }

    async updateIfUser(uid) {
        let db = await sqlite;
        return db.run('UPDATE notices SET title=?, message=?, teacher=? \
            WHERE id=? AND user_id IN("anonymous", ?);',[this.title, this.message, this.teacher, this.id, uid]);
    }

    async deleteByUser(id, uid) {
        let db = await sqlite;
        return db.run('DELETE FROM notices WHERE id=? AND user_id=?;', [id, uid]);
    }

    static async get(id) {
        let db = await sqlite;
        return db.get('SELECT title, teacher, message FROM notices WHERE id=? LIMIT 1;', id);
    }
    
    static async getAll() {
        let db = await sqlite;
        return db.all('SELECT title, teacher, message FROM notices;');
    }

    static async getByUser(userId) {
        let db = await sqlite;
        return db.all('SELECT id, title, teacher, message FROM notices WHERE user_id=?;', userId);
    }
}

module.exports = Notice;
