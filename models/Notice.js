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
    
    static async getAll(uid, tssort, vsort=true) {
        let db = await sqlite;
        return db.all(`SELECT id, title, (SELECT COUNT() FROM votes WHERE votes.notice_id = id) as votes, \
            author_name, addressed_to, timestamp, message \
            ${uid ? ', EXISTS(SELECT 1 FROM votes WHERE votes.user_id=? AND votes.notice_id=id LIMIT 1) as voted' : ''} \
            FROM notices ORDER BY ${vsort ? 'votes DESC,': ''} timestamp ${tssort ? tssort : 'DESC'};`, uid);
    }

    static async vote(id, uid) {
        let db = await sqlite;
        try {
            await db.run('INSERT INTO votes (notice_id, user_id) VALUES (?, ?);', [id, uid]);
            return true;
        } catch(e) {
            return false;
        }
    }

    static async unVote(id, uid) {
        let db = await sqlite;     
        let res = await db.run('DELETE FROM votes WHERE notice_id=? AND user_id=?;', [id, uid]);
        return !!res.stmt.changes;
    }

    static async getByUser(uid) {
        let db = await sqlite;
        return db.all('SELECT id, title, author_name, addressed_to, timestamp, message, \
            (SELECT COUNT() FROM votes WHERE votes.notice_id = id) as votes, \
            EXISTS(SELECT 1 FROM votes WHERE votes.user_id=? AND votes.notice_id=id LIMIT 1) as voted \
            FROM notices WHERE user_id=? ORDER BY timestamp DESC;', [uid, uid]);
    }
}

module.exports = Notice;
