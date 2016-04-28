# views-react

> An Express like API to mixin `http.Response` to render React JSX Views.

This module provides a `ViewsReact` class to extend or mixin, that provides the
necessary methods to compile and render React components from an HTTP response.

Inspiration from [express-react-views](https://github.com/reactjs/express-react-views)

## Install

    npm i views-react -S

## Usage

```js
const ViewsReact = require('views-react');
const finalhandler = require('finalhandler');

const views = new ViewsReact();

// change views directory with .views()
views.views(__dirname + '/app/views');

require('http').createServer((req, res) => {
  var next = finalhandler(req, res);

  res.render = views.render.bind(views, req, res, next);
  res.render('index', { title: 'Foo' });

  // Or:
  // views.render(req, res, next, 'index', { title: 'Foo' });
}).listen(3000);
```

Or within the stack of middleware, prior to the router handlers. This adds a
`.render()` method to the response object.

```js
const views = new ViewsReact();
app.use((res, res, next) => {
  res.render = views.render.bind(views, req, res, next);
  next();
});

app.get('/', (req, res, next) => {
  // will render views/index.jsx
  res.render('index');
});
```

### Views

Views are JSX files automatically transpiled by `babel-register`, stored in the
`views` directory (as configured view `.views()` or `options.views`). The
default value is `./views` in the current working directory.

`views/index.jsx`
```js
var React = require('react');

var HelloMessage = React.createClass({
  render: function() {
    return (<div>Hello {this.props.name}</div>);
  }
});

module.exports = HelloMessage;
```

## Layouts

You can compose your views to decorate your component with a layout.

`views/index.jsx`

```js
var React  = require('react');
var Layout = require('./layout');

var HelloMessage = React.createClass({
  render: function() {
    return (
      <Layout title={this.props.title}>
        <div>Hello {this.props.name}</div>
      </Layout>
    );
  }
});

module.exports = HelloMessage;
```
`views/layout.jsx`

```js
var React = require('react');

module.exports = React.createClass({
  render: function() {
    return (
      <html>
        <head><title>{this.props.title}</title></head>
        <body>{this.props.children}</body>
      </html>
    );
  }
});
```

### new ViewsReact(options)

- `options`
  - `options.views`: Views directory to lookup from when rendering (default: 'view/')
  - `options.engine`: View extension to use (default: `jsx`)
  - `options.doctype`: Doctype to use with HTML markup (default: `<!doctype html>`)

### res.render(view, props)

```js
res.render('homepage', {
  title: 'Homepage',
  description: 'Server side react rendering'
});
```

---

> [MIT](./LICENSE) &nbsp;&middot;&nbsp;
> [mkla.bz](http://mkla.bz) &nbsp;&middot;&nbsp;
> [@mklabs](https://github.com/mklabs)
