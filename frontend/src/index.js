import m from 'mithril';
import Store from './store';
import Index from './pages/index';
import * as Notices from './pages/notices';
import './style.css';

let root = document.body;

m.route(root, '/app', {
    '/app': Index,
    '/app/notices': Notices.List,
    '/app/notices/new': Notices.Create
});
