import m from 'mithril';
import store from '../../store';
import style from './style.css';

var data = {};
export default class Navbar {
    constructor() {
        this.name = 'User';
        this.id = '';
    }

    async oninit() {
        await store.getUser();
        m.redraw();
    }

    view() {
        return m('nav', {className: style.nav}, m('ul', {className: style.navMain}, 
            [
                m('li', m('a[href=/]', {oncreate: m.route.link}, 'My Notices')),
                m('li', m('a[href=/notices]', {oncreate: m.route.link}, 'All Notices')),
                m('ul', {className: style.right}, [
                    m('li', m('a[href=/logout]', 'Logout'))
                ])
            ]
        ))
    }
};
