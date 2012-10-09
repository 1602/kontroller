var util = require('util');
var fs = require('fs');
var path = require('path');
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
 *     ctl.call('name');
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
    var ctl = this;

    this.controllerName = this.constructor.controllerName;

    // just declare context things here
    this.context = {
        req: null,
        res: null,
        actionName: null,
        next: function (err) {
            if (err) {
                ctl.context.outerNext(err);
            } else {
                ctl.context.innerNext();
            }
        }
    };

    Object.keys(this.context).forEach(function (key) {
        ctl.__defineGetter__(key, contextGetter(ctl, key));
    });

    ['params', 'session', 'body'].forEach(function (key) {
        ctl.__defineGetter__(key, contextGetter(ctl, 'req', key));
    });

    function contextGetter(ctl, key, subkey) {
        return subkey ?
            function () { return ctl.context[key][subkey]; }:
            function () { return ctl.context[key]; };
    }

    Object.keys(BaseController.extensions).forEach(function (k) {
        ctl[k] = BaseController.extensions[k];
    });

}

BaseController.extensions = {};

var cache = {};

BaseController.getInstance = function getInstance(filename, exts) {
    var controllerName = filename.split('/').pop().replace(/_controller\.(js|coffee)/g, '');
    var root = path.dirname(filename);

    var Controller = cache[filename];
    if (Controller) {
        return new Controller;
    }

    // create blank controller
    var Controller = BaseController.constructClass(controllerName);
    Controller.root = root;
    cache[filename] = Controller;

    // add controller extensions
    if (exts) {
        Object.keys(exts).forEach(function (k) {
            Controller.prototype[k] = exts[k];
        });
    }

    // instantiate
    var ctl = new Controller;
    ctl.reset();

    // and run through configurator code
    // (it happens only once to describe actions, request handling flow, etc)
    var code = fs.readFileSync(filename).toString();
    ctl.build(code);

    return ctl;
};

BaseController.constructClass = function (controllerName) {
    Controller.controllerName = controllerName;
    function Controller() {
        BaseController.call(this);
    }
    Controller.prototype.__proto__ = BaseController.prototype;
    // util.inherits(Controller, BaseController);
    return Controller;
};

BaseController.prototype.load = function (controllerName) {
    this.build(fs.readFileSync(path.join(this.constructor.root, controllerName + '_controller.js')).toString());
};

BaseController.prototype.reset = function () {
    this.constructor.actions = {};
    this.constructor.before = [];
    this.constructor.after = [];
};

BaseController.prototype.build = function (script) {
    var ctl = this;
    try {
        var f = new Function('controller', 'with (controller) {' + script + '}');
        f(this);
    } catch (e) {
        // TODO for node 0.9.3: catch line number
        throw e;
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

