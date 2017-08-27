import m from 'mithril';
import Store from './store';
import Index from './pages/index';
import * as Notices from './pages/notices';
import './style.css';

let root = document.body;

m.route.prefix("/app");

m.route(root, '/', {
    '/': Index,
    '/notices': Notices.List,
    '/notices/new': Notices.Create
});
