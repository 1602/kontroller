var vm = require('vm');

require('../helper')(exports);

its('should construct controller class', function (test) {
    var Klass = BaseController.constructClass();
    test.ok((new Klass) instanceof BaseController, 'Constructed class should be child of BaseController');
    test.strictEqual(Klass.name, 'Controller');
    test.ok(Klass.prototype.render, 'instance method: render');
    test.ok(Klass.prototype.call, 'instance method: call');
    test.ok(Klass.prototype.action, 'instance method: action');
});

its('should register action', function (test) {
    var K1 = BaseController.constructClass();
    var k1 = new K1;
    k1.reset();
    k1.action('test1', function test1(){ return 1;});

    var K2 = BaseController.constructClass();
    var k2 = new K2;
    k2.reset();
    k2.action('test2', function test2(){ return 2;});

    test.ok(k1.constructor.actions.test1);
    test.ok(k2.constructor.actions.test2);
});

its('should build controller from script', function (test) {
    test.expect(2);
    var code = [
        'action(\'name\', function () {',
        '    demo();',
        '});',
        'demo2();'
    ].join('\n');

    // let's build basic (blank) controller class
    var K = BaseController.constructClass('MyController');
    // add some method manually
    K.prototype.demo = function () {
        test.ok(true);
    }
    // instantiate blank class and add some instance method to object directly
    var k = new K;
    k.demo2 = function () {
        test.ok(true);
    };
    // now configure controller using script (running in context of controller
    // instance)
    k.reset();
    k.build(code);

    // now we can create another instances (already configured)
    k2 = new K;
    k2.initialize({}, {}, function () {});
    k2.call('name');
});

