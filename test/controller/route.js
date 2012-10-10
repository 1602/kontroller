require('../helper')(exports);

its('should construct controller class', function (test) {
    test.expect(1);

    var Ctl = BaseController.constructClass();
    Ctl.actions.hello = function (c) {
        c.world();
    };

    Ctl.prototype.world = function () {
        test.ok(true);
    };

    var route = Ctl('hello');

    route({}, {}, function () { });
});

