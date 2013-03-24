require('should');

var BaseController = require('../').BaseController;

describe('errors', function() {

    it('should catch controller errors', function () {
        var code = [
            'before(function hook() {',
                'this.hello.world = 1602;',
            '}, {only:\'onhook\'});',
            'action(\'fail\', function() {',
            '    fail();',
            '});',
            'action(\'onhook\', function() {',
            '});',
        ].join('\n');

        // let's build basic (blank) controller class
        var K = BaseController.constructClass('MyController');
        var k = new K;
        k.reset();
        k.build(code);
        (function() {
            k.call('fail');
        }).should.throw('fail is not defined in MyController controller during "fail" action');
        (function() {
            k.call('onhook');
        }).should.throw('Cannot set property \'world\' of undefined in MyController controller during "hook" hook');
    });
});
