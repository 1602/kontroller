## About

It's controller. Was born in [railwayjs](http://railwayjs.com). Now it's old
enough to leave family, and work with another guys, like exress, socket.io,
etc..

## Installation

    npm install kontroller

## Why I need it?

Obviously, every additional level of logic should be added for some reason. Let
me explain reasons of adding controller, instead of regular (in express):

    app.get('info', function (req, res, next) {
        res.render('view');
    });

Looks simple, right? But wait, let me show more real use case:

    // map user profile displaying to /my-profile
    app.get('my-profile', function (req, res, next) {
        // show it only for users who logged in
        if (req.session.userId) {
            User.find(req.session.userId, function (err, user) {
                if (err) {
                    res.send(500);
                } else if (!user) {
                    res.send(404);
                } else {
                    User.loadTimeline(function (err, timeline) {
                        res.render('profile', {user: user, timeline: timeline});
                    });
                }
            });
        }
        // show 404 for others
        else {
            res.send(404);
        }
    });

As you can see, we have chain of couple async queries, some of them, like user
loading and timeline loading may be repeated in other routes, so finally it will
look like (implementation omitted):

    app.get('my-profile', loadUser, loadTimeline, renderView('profile'));
    app.get('my-profile/edit', loadUser, renderView('edit-profile'));
    app.put('my-profile/update', loadUser, saveChanges);
    app.get('my-profile/cancel', loadUser, renderView('confirm'));
    app.del('my-profile/destroy', loadUser, destroyProfile);

Feel something wrong about it? It's time to start worrying about code structure.
First of all: why should I list `loadUser` each time? What if I need some more
complicated hooks before actions? It will become unreadable mess very soon. And
then it will be refactored somehow, which is good, but not standard. High-order
function, wrappers, callers will be less readable, than just one action.

Let's come back to our theme. As a developer I don't want to fight with code's
groving entrophy. I just want to describe what code does. Something like:

    - every action in this controller requires user before loading
    - all actions except one should quit if user is not admin, and some of them
      should require super-admin
    - every post request in whole app, should be protected from request forgery
    - ...

So, idea is simple: structurize request handling logic using some objects:
controllers. Controllers should be able to share code, define hooks, log
information about request handling process, they should look nice and work as
fast as simple express middleware chain (or even faster).

All of these points solved using Kontroller.

## Basic usage (ExpressJS example)

    // create some controller
    var Driver = require('kontroller').BaseController.constructClass();

    // define action
    Driver.actions.accelerate = function accelerate(c) {
        c.send('accelerating!');
    };

    // and another one
    Driver.actions.brake = function brake(c) {
        c.send('braking!');
    };

    // now let's create express app
    var express = require('express);
    var app = express();

    // and map routes to controller
    app.get('/speedup', Driver('accelerate'));
    app.get('/slowdown', Driver('brake'));

    // run, test
    app.listen(3000);

## Not impressed?

There are a lot of hidden features in your new controller. You can rewrite it in
railwayjs-style:

    before(think, {only: 'accelerate'});

    action('accelerate', function () {
        send('accelerating!');
    });

    action('brake', function () {
        send('braking!');
    });

    function think() {
        // think 1 second before accelerate
        setTimeout(next, 1000);
    }

And use as railwayjs does it:

    // create blank controller
    var Driver = BaseController.constructClass('Driver');

    // instantiate and configure
    var ctl = new Driver;
    ctl.build(code); // code is string, containing code of controller

    // feed to express
    app.get('/speedup', Driver('accelerate'));
    app.get('/slowdown', Driver('brake'));

