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

        var K = BaseController.constructClass('MyController');
        var k = new K;
        k.reset();
        k.build(code);
        k.context.outerNext = function (e) {
            e.message.should.equal('fail is not defined in MyController controller during "fail" action');
        };
        k.perform('fail', {}, {}, function(){});
        k.occupied.should.be.false;
        k.context.outerNext = function (e) {
            e.message.should.equal('Cannot set property \'world\' of undefined in MyController controller during "hook" hook');
            done();
        };
        k.perform('onhook', {}, {}, function() {});
    });
});
