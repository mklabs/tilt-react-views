const fs       = require('fs');
const path     = require('path');
const debug    = require('debug')('tilt-react-views');
const React    = require('react');
const ReactDOM = require('react-dom/server');

module.exports = class ReactViews {

  constructor(options) {
    this.options = options || {};
    this.views(this.options.views || path.resolve('views'));
    this.engine(this.options.engine || 'jsx');
  }

  views(paths) {
    if (!paths) throw new Error('Missing paths');

    paths = Array.isArray(paths) ? paths : [paths];

    debug('Set views', paths);

    require('babel-register')({
      presets: [ 'react', 'es2015' ]

      // TODO: implement only regex or fn to filter everything not based on this._views
      // only: (filename) => {
      //   debug('Babel only %s filename', filename);
      //   return false;
      // }
    });

    this._views = paths;
    return this;
  }

  engine(ext) {
    if (!ext) return this._viewEngine;
    this._viewEngine = ext;
    return this;
  }

  render(req, res, next, view, options) {
    options = options || {};

    debug('Rendering view %s', view);
    res.setHeader('Content-Type', 'text/html');

    return this.view(view)
      .catch(next)
      .then((template) => {
        try {
          res.end(this.react(template, Object.assign({}, options, this.options)));
        } catch (e) {
          return next(e);
        }
      });
  }

  view(filename, locations) {
    return new Promise((r, errback) => {
      locations = locations || this._views.map(dir => path.join(dir, filename + '.jsx'));
      var file = locations.shift();

      debug('Lookup view: %s', file);
      if (!file) return errback(new Error('View ' + filename + ' not found'));

      fs.stat(file, (err, stat) => {
        if (err && err.code === 'ENOENT') {
          return this.view(filename, locations).catch(errback).then(r);
        }
        if (err) return errback(err);
        return r(file);
      });
    });
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
