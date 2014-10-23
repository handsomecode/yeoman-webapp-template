Yeoman Webapp + Compass Project Template
========================================

Built with Yeoman (http://yeoman.io):

  - Webapp generator https://github.com/yeoman/generator-webapp
  - Compass for SCSS and sprites: http://compass-style.org
  - Grunt Bake for templates: https://github.com/MathiasPaumgarten/grunt-bake
  - Bower http://bower.io/

Installation
--------------

Create separate repo based on this one, then edit project name in package.json.
"Autoprefixer" disabled. It cause some bugs with compass mixins. If you not
planning using them, uncomment "autoprefixer" tasks.

To start, install grunt. Go to your project folder in Terminal and run:

```sh
npm install
bower intall
```

##### To run a dev server, run:

```sh
grunt serve
```

##### To build project, run:

```sh
grunt build
```
