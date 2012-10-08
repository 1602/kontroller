var $ = require('../vendor/colors').$;

require('semicov').init('lib', 'Kontroller');
process.on('exit', require('semicov').report);

process.env.NODE_ENV = 'test';

var _global = {};
_global.BaseController = require('../').BaseController;
_global.it = it;
_global.its = its;
_global.context = context;

var group_name = false, EXT_EXP;
function it(should, test_case) {
    check_external_exports();
    if (group_name) {
        EXT_EXP[group_name][should] = wrap(should, test_case);
    } else {
        EXT_EXP[should] = wrap(should, test_case);
    }
}

function its(should, testCase) {
    it(should, function (test) {
        var done = test.done;
        delete test.done;
        try {
            testCase(test);
        } catch (e) {
            done.call(test, e);
        }
        process.nextTick(function () {
            done.call(test);
        });
    });
}

function wrap(name, testCase) {
    var beginMark = $('\n➤ ').blue + $(group_name ? group_name + ' - ' : '').grey + $(name).yellow;
    return function (test) {
        $.puts(beginMark);
        testCase(test);
    };
}

function context(name, tests) {
    check_external_exports();
    EXT_EXP[name] = {
        prepare: function prepare(test) {
            test.done();
        }
    };
    group_name = name;
    tests({
        before: setUp,
        after: tearDown,
        it: it
    });
    it('batch done', function (test) {
        test.done();
    });
    group_name = false;
}

function setUp(f) {
    it('setUp', f);
}
function tearDown(f) {
    it('tearDown', f);
}

module.exports = function (external_exports, skipGlobals) {
    EXT_EXP = external_exports;
    if (external_exports.done) {
        external_exports.done();
    }
    if (!skipGlobals) {
        for (var i in _global) global[i] = _global[i];
    }
    return _global;
};

function check_external_exports() {
    if (!EXT_EXP) throw new Error(
        'Before run this, please ensure that ' +
        'require("helper")(exports); called');
}

