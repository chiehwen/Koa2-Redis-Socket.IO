/**
 * Routes configuration
 * 
 * Declare all routes here
 *
 */

// Middleware for routing.
import Router from 'koa-router';
import compose from 'koa-compose';

import Chat from './ChatRouter';

import Configs from '../configs';

export default function routes() {

    // Initialize router
    const router = new Router();

    // Object.keys(routes).forEach(name => routes[name](router));

    router
        // routing to '/v1/'
        .use('/chat', Chat.routes(), Chat.allowedMethods())

    return compose([
        // Assigns routes.
        router.routes(),
        router.allowedMethods(),
    ])
}