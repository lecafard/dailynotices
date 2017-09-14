import m from 'mithril';
import store from '../store';
import Navbar from '../components/navbar';
import Notice from '../components/notice';
import globalStyle from '../style.css';
import style from './common.css';

function bind(v,d) {
    return function(e) {
        v[d] = e.currentTarget.value;
    }
}

class List {
    constructor() {
        this.notices = [];
        this.showVotes = true;
    }
    
    oninit() {
        store.getUser().then(() => {
            return store.getNotices();
        }).then(() => {m.redraw();});
    }

    refresh() {
        store.fetchNotices.then(m.redraw);
    }

    toggleVotes(o) {
        return function () {
            o.showVotes = !o.showVotes;
        }
    }

    sortNotices(e) {
        store.fetchNotices(e.target.value).then(m.redraw);
    }

    view() {
        return [
            m('main', [
                m(Navbar),
                m('div', {className: globalStyle.container}, [
                    m('h1', 'All Notices'),
                    m('a', {onclick: this.refresh, className: `${style.btn} ${style.btnRefresh}`}, 'Refresh'),
                    m('a', {onclick: this.toggleVotes(this), className: `${style.btn} ${style.btnToggle}`}, 'Toggle Votes'),
                    m('select', {onchange: this.sortNotices, style: 'float:right;'}, [
                        m('option', {value: 'votes'}, 'Votes'),
                        m('option', {value: 'new'}, 'New'),
                        m('option', {value: 'old'}, 'Old')
                    ]),
                    !store.fetching.notices ? m('table', {
                            className: style.notices
                        },
                        m('tbody', store.notices.map((data, idx) => {
                            return m(Notice,{data, editable: false, 
                                index: idx, showVotes: this.showVotes});
                        })
                    )) : m('p', 'Loading...')
                ])
            ])
        ];
    }
}

class Create  {
    constructor () {
        this.data = {
        };
    }

    submit() {
        var self = this;
        return async function(e) {
            e.preventDefault();
            let res = await store.postNotice(self.data);
            if(res.status) {
                m.route.set('/');
            } else {
                self.error = res.message;
                m.redraw();
            }
        }
    }

    async oninit() {
        await store.getUser();
        if (store.user.quota <= 0) {
            m.route.set('/');
        }
    }

    view() {
        let form = this.data;
        return [
            m('main', [
                m(Navbar),
                m('div', {className: globalStyle.container}, [
                    m('h1', 'New Notice'),

                    m('form',[
                        this.error ? m('p', `Error: ${this.error}`) : null,
                        m('label[for=title]', {
                            className: style.label
                        }, 'Title'),
                        m('input[type=text][name=title][maxlength=50][required]', {
                            onchange: bind(form, 'title'),
                            className: style.input
                        }),

                        m('label[for=addressed_to]', {
                            className: style.label
                        }, 'Addressed To'),
                        m('input[type=text][name=addressed_to][maxlength=40][required]', {
                            onchange: bind(form, 'addressed_to'),
                            className: style.input
                        }),

                        m('label[for=author_name]', {
                            className: style.label
                        }, 'Author Name'),
                        m('input[type=text][name=author_name][maxlength=40][required]', {
                            onchange: bind(form, 'author_name'),
                            className: style.input
                        }),

                        m('label[for=content]', {
                            className: style.label
                        }, 'Message'),
                        m('textarea[name=content][maxlength=500][required]', {
                            onchange: bind(form, 'message'),
                            className: style.textarea
                        }),

                        m('br'),
                        m('p', 'Note: Posts will be fully anonymous to anyone else.'),
                        m('br'),
                        m('a[href=/]', {
                            oncreate: m.route.link,
                            className: `${style.btn} ${style.btnCancel}`
                        }, 'Cancel'),
                        m('button[type=submit]', {
                            onclick: this.submit(),
                            className: `${style.btn} ${style.btnNew} ${style.right}`
                        }, 'Submit')
                    ])
                ])
            ])
        ];
    }
}

export {List, Create};
