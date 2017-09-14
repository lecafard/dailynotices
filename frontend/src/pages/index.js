import m from 'mithril';
import Navbar from '../components/navbar';
import store from '../store';
import Notice from '../components/notice';
import globalStyle from '../style.css';
import style from './common.css';

export default class IndexPage {
	constructor() {
		this.notices = [];
        this.showVotes = true;
	}

	async oninit() {
        await store.getUser();
        await store.getUserNotices();
        m.redraw();
	}

    async refresh() {
        await store.fetchUserNotices();
        m.redraw();
    }
    
    toggleVotes(o) {
        return function () {
            o.showVotes = !o.showVotes;
        }
    }

    view() {
        return [
            m('main', [
                m(Navbar),
                m('div', {className: globalStyle.container}, [
	                m('h1', 'My Notices'),
	                m('span', {className: style.quota}, `Quota Left: ${store.user.quota}`),
	                m('a', {onclick: this.refresh, className: `${style.btn} ${style.btnRefresh}`}, 'Refresh'),
                    m('a', {onclick: this.toggleVotes(this), className: `${style.btn} ${style.btnToggle}`}, 'Toggle Votes'),
	                store.user.quota > 0 ? m('a[href=/notices/new]', {
	                	oncreate: m.route.link,
	                	className: `${style.btn} ${style.btnNew}`
	                }, 'New Notice') : null,
                    !store.fetching.userNotices ? m('table', {
                    		className: style.notices
                        },
                        m('tbody', store.userNotices.map((data) => {
                            return m(Notice,{data, editable: true, showVotes: this.showVotes});
                        })
                    )) : m('p', 'Loading...')
                ])

            ])
        ];
    }
};
