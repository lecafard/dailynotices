import m from 'mithril';
import store from '../../store';

import style from './style.css';

export default class Notice {
    constructor() {
    }
    
    delete(id) {
        return function(e) {
            store.deleteNotice(id);
        }
    }

    edit(id) {
        return function(e) {
            store.editNotice(id);
            m.redraw();
        }
    }

    vote(idx) {
        return function(e) {
            store.voteNotice(idx).then(m.redraw);
        }
    }

    unVote(idx) {
        return function(e) {
            store.unVoteNotice(idx).then(m.redraw);
        }
    }

    view(v) {
        let data = v.attrs.data;

        return m('tr', {className: style.notice}, [
            m('td[colspan=1]', {className: style.addressedTo}, data.addressed_to),
            m('td[colspan=6]', {className: style.noticeContent}, [
                m('h3',{className: style.title}, data.title),   
                m('div', {className: style.message}, data.message.split('\n').map((p)=> {
                    return m('p', p ? p : '\u00A0');
                })),
                m('span', {className: style.author}, data.author_name),
                v.attrs.editable ? m('a', {
                    className: style.btnDelete, 
                    onclick: this.delete(data.id)}, 'Delete') : null
            ]), (v.attrs.showVotes ? m('td[colspan=1]', [
                    m('a', {
                        onclick: (!v.attrs.data.voted ? this.vote(v.attrs.index) : this.unVote(v.attrs.index)),
                        className: `${style.btn} ${v.attrs.data.voted ? style.btnVoted : style.btnVote}`
                    }, v.attrs.data.votes)
                ]) : null)
        ]);
    }
}
