const express = require('express');
const authRoute = require('./auth.routes');
const walletRoute = require('./wallet.routes');
const birdRoute = require('./bird.routes');
const userRoute = require('./user.routes');
const birdBoxRoute = require('./birdBox.routes');
const router = express.Router();

const defaultRoutes = [
    {
        path: '/auth',
        route: authRoute,
    },
    {
        path: '/wallet',
        route: walletRoute,
    },
    {
        path: '/bird',
        route: birdRoute,
    },
    {
        path: '/user',
        route: userRoute,
    },
    {
        path: '/birdBox',
        route: birdBoxRoute,
    },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;