module.exports = Rendering;

function Rendering() {
}

/**
 * Render html template
 * TODO: implement
 */
Rendering.prototype.render = function render(view, params) {
    params = params || {};
    if (!params.hasOwnProperty('layout')) {
        params.layout = this.constructor.hasOwnProperty('layout') ? this.constructor.layout : 'application';
        if (params.layout) {
            params.layout = 'layouts/' + params.layout + '_layout';
        }
    }
    if (typeof view !== 'string') {
        params = view;
        view = this.controllerName + '/' + this.actionName;
    }
    console.log(this);
    this.res.render(view, params);
};

Rendering.prototype.layout = function (l) {
    this.constructor.layout = l;
};

