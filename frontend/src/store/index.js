import cookie from 'js-cookie';
import m from 'mithril';

function logout() {
    cookie.remove('logged_in');
    window.location.replace('/');
}

class Store {
    constructor() {
        this.fetching = {};
        this.notices = [];
        this.userNotices = [];
        this.user = {};

    }

    async getUser(cb) {
        if (!this.user.name && !this.fetching.user) {
            this.fetching.user = true;
            return await this.fetchUser();
        } else {
            return this.user;
        }
    }
    
    async fetchUser() {
        let res = await fetch('/api/me', {
            credentials: 'include'
        });
        
        let data;
        switch(res.status) {
            case 401:
                return logout();
                break;
            case 200:
                data = await res.json();
                break
            default:
                return console.log('failed');
        }
        
        this.user = data.user;
        this.fetching.user = false;
        return this.user;
        m.redraw();
    }

    async getNotices() {
        if (!this.notices.length && !this.fetching.notices) {
            this.fetching.notices = true;
            return await this.fetchNotices();
        } else {
            return this.notices;
        }
    }
    
    async fetchNotices(sort) {
        let res = await fetch(`/api/notices${sort ? '/'+sort : ''}`, {
            credentials: 'include'
        });

        let data = {};
        switch(res.status) {
            case 401:
                return logout();
                break;
            case 200:
                data = await res.json();
                break
            default:
                return console.log('failed');
        }

        this.fetching.notices = false;
        this.notices = data.notices;
        return data.notices;
        m.redraw();
    }

    async getUserNotices() {
        if (!this.userNotices.length && !this.fetching.userNotices) {
            this.fetching.userNotices = true;
            return await this.fetchUserNotices();
        } else {
            return this.userNotices;
        }

    } 
    async fetchUserNotices() {
        let res = await fetch('/api/me/notices', {
            credentials: 'include'
        });

        let data = {};
        switch(res.status) {
            case 401:
                return logout();
                break;
            case 200:
                data = await res.json();
                break
            default:
                return console.log('failed');
        }

        this.fetching.userNotices = false;
        this.userNotices = data.notices;
        this.user.quota = data.quota;
        m.redraw();
        return data.notices;
    }

    async postNotice(fd) {
        let res = await fetch('/api/notices', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(fd)
        });
        
        let data = {};
        if (res.ok) {
            data = await res.json();
            this.user.quota = data.quota_remaining;
            this.userNotices.push(data.notice);
            await this.fetchNotices();
            m.redraw();
            return {status: true};
        } else if(res.status == 401) {
            return logout();
        } else if(res.status == 400) {
            return await res.json();
        }

    }

    async deleteNotice(id) {
        let res = await fetch(`/api/notices/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        })

        if (res.ok || res.status == 403) {
            let data = await res.json();
            this.userNotices = this.userNotices.filter(n => n.id != id);
            this.notices = this.notices.filter(n => n.id != id);
            this.user.quota = data.quota_remaining || this.user.quota - 1;
            m.redraw();
        } else if (res.status == 401) {
            logout();
        } else {
            alert(`Notice delete error, server returned ${res.status}.`);
        }
    }

    async voteNotice(idx) {
        let res = await fetch(`/api/notices/${this.notices[idx].id}/vote`, {
            method: 'PUT',
            credentials: 'include'
        })

        if (res.ok) {
            this.notices[idx].voted = 1;
            this.notices[idx].votes++;
        } else if (res.status == 401) {
            logout();
        } else {
            alert(`Notice vote error, server returned ${res.status}.`);
        }
    }

    async unVoteNotice(idx) {
        let res = await fetch(`/api/notices/${this.notices[idx].id}/vote`, {
            method: 'DELETE',
            credentials: 'include'
        })

        if (res.ok) {
            this.notices[idx].voted = 0;
            this.notices[idx].votes--;
        } else if (res.status == 401) {
            logout();
        } else {
            alert(`Notice unvote error, server returned ${res.status}.`);
        }
    }
}

let store = new Store();
export default store;

