const path     = require('path');
const debug    = require('debug')('views-react');
const babel    = require('babel-register');
const React    = require('react');
const ReactDOM = require('react-dom/server');

module.exports = class ViewsReact {

  constructor(options) {
    this.options = options || {};
    this.views(this.options.views || path.resolve('views'));
    this.engine(this.options.engine || 'jsx');
  }

  views(path) {
    if (!path) throw new Error('Missing path');
    babel(Object.assign({only: path}, { presets: [ 'react', 'es2015', ] }));
    debug('set views', path);
    this._views = path;
    return this;
  }

  engine(ext) {
    if (!ext) return this._viewEngine;
    this._viewEngine = ext;
    return this;
  }

  render(req, res, next, view, options) {
    debug('Rendering view %s - %s', view, this._views);
    var filename = path.join(this._views, view + '.' + this._viewEngine);
    debug('Rendering view %s - %s', view, filename, this._views);

    try {
      res.end(this.react(filename, Object.assign({}, options, this.options)));
    } catch (e) {
      return next(e);
    }
  }

  react(filename, options) {
    var component = require(filename);

    // Transpiled ES6 may export components as { default: Component }
    component = component.default || component;
    var html = options.doctype || '<!doctype html>'
    var element = React.createElement(component, options);
    var method = this.options.renderToString ? 'renderToString' : 'renderToStaticMarkup';
    html += ReactDOM[method](element);
    return html;
  }
}
