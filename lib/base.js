var util = require('util');
module.exports = BaseController;

/**
 * Base class for any controller. It describes common API for controllers.
 *
 * Each instance method could be triggered from controller context (when
 * run in new context). Basically this class describes context, which contains
 * description of controller. This looks pretty tricky, but it helps to write
 * clean and easy to read controller classes without thinking about OOP (in case
 * of running in new context). Alternatively you can use this class as parent
 * for any other class.
 *
 * Example 1. OOP-style
 *
 *     function MyController() {
 *         BaseController.call(this);
 *     }
 *     MyController.prototype.__proto__ = BaseController.prototype;
 *     var ctl = new MyController;
 *     ctl.action('index', function index() {
 *         this.locals.items = [];
 *         this.render();
 *     });
 *     ctl.perform('name');
 *
 * Example 2. Functional style
 *
 *     action(function index() {
 *         this.items = [];
 *         render();
 *     });
 *
 */
function BaseController() {
    this.controllerName = this.constructor.controllerName;

    // just declare context things here
    this.context = {
        req: null,
        res: null,
        next: null,
        actionName: null
    };

    var ctl = this;

    Object.keys(this.context).forEach(function (key) {
        if (key === 'next') return; // except next;
        ctl.__defineGetter__(key, contextGetter(ctl, key));
    });

    ['params', 'session', 'body'].forEach(function (key) {
        ctl.__defineGetter__(key, contextGetter(ctl, 'req', key));
    });

    function contextGetter(ctl, key, subkey) {
        return subkey ?
            function () {
                return ctl.context[key][subkey];
            }:
            function () {
                return ctl.context[key];
            };
    }

}

BaseController.constructClass = function (controllerName) {
    Controller.controllerName = controllerName;
    function Controller() {
        BaseController.call(this);
    }
    Controller.prototype.__proto__ = BaseController.prototype;
    // util.inherits(Controller, BaseController);
    return Controller;
};

BaseController.prototype.reset = function () {
    this.constructor.actions = {};
    this.constructor.before = [];
    this.constructor.after = [];
};

BaseController.prototype.build = function (script) {
    var ctl = this;
    exportMembers(BaseController.prototype);
    exportMembers(this.constructor.prototype);
    script.runInNewContext(this);

    function exportMembers(from) {
        Object.getOwnPropertyNames(from).forEach(function (name) {
            if (name !== 'constructor') {
                ctl[name] = from[name].bind(ctl);
            }
        });
    }
};

/**
 * @override default controller string representation
 */
BaseController.prototype.toString = function toString() {
    return 'Controller ' + this.controllerName;
};


extendWith('rendering');
extendWith('flow-control');
extendWith('helpers');
extendWith('code-sharing');

function extendWith(what) {
    var bc = require('./' + what);
    Object.keys(bc.prototype).forEach(function (meth) {
        BaseController.prototype[meth] = bc.prototype[meth];
    });
}

