'use strict';
// generated on 2014-11-21 using generator-gulp-webapp 0.1.0

var gulp = require('gulp'),
  fileinclude = require('gulp-file-include'),
  template = require('gulp-template'),
  spritesmith = require('gulp.spritesmith'),
  config = {
    app: 'app/',
    dist: 'dist/'
  };

// load plugins
var $ = require('gulp-load-plugins')();

gulp.task('styles', function () {
  return gulp.src('app/styles/style.scss')
    .pipe($.compass({
      css: '.tmp/styles/',
      sass: 'app/styles/',
      image: 'images/',
      generatedImages: '.tmp/images/generated',
      javascripts: '<%= config.app %>/scripts',
      fonts: '<%= config.app %>/fonts',
      importPath: '<%= config.app %>/bower_components',
      httpImagesPath: '../images',
      httpGeneratedImagesPath: '../images/generated',
      httpFontsPath: '../fonts',
      relativeAssets: false,
      assetCacheBuster: false,
      raw: 'Sass::Script::Number.precision = 10\n'
    }))
    .pipe($.autoprefixer(['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1']))
    .pipe(gulp.dest('.tmp/styles'))
    .pipe($.size());
});

gulp.task('scripts', function () {
  return gulp.src('app/scripts/**/*.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter(require('jshint-stylish')))
    .pipe($.size());
});

gulp.task('html', ['styles', 'scripts'], function () {
  var jsFilter = $.filter('**/*.js');
  var cssFilter = $.filter('**/*.css');

  return gulp.src('app/*.html')
    .pipe($.useref.assets({searchPath: '{.tmp,app}'}))
    .pipe(jsFilter)
    .pipe($.uglify())
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    .pipe($.csso())
    .pipe(cssFilter.restore())
    .pipe($.useref.restore())
    .pipe($.useref())
    .pipe(gulp.dest('dist'))
    .pipe($.size());
});

gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'))
    .pipe($.size());
});

gulp.task('fonts', function () {
  return $.bowerFiles()
    .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
    .pipe($.flatten())
    .pipe(gulp.dest('dist/fonts'))
    .pipe($.size());
});

gulp.task('extras', function () {
  return gulp.src(['app/*.*', '!app/*.html'], {dot: true})
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', function () {
  return gulp.src(['.tmp', 'dist'], {read: false}).pipe($.clean());
});

gulp.task('build', ['html', 'images', 'fonts', 'extras']);

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});

gulp.task('connect', function () {
  var connect = require('connect');
  var app = connect()
    .use(require('connect-livereload')({port: 35729}))
    .use(connect.static('app'))
    .use(connect.static('.tmp'))
    .use(connect.directory('app'));

  require('http').createServer(app)
    .listen(9000)
    .on('listening', function () {
      console.log('Started connect web server on http://localhost:9000');
    });
});

gulp.task('serve', ['connect', 'styles'], function () {
  require('opn')('http://localhost:9000');
});

// inject bower components
gulp.task('wiredep', function () {
  var wiredep = require('wiredep').stream;

  gulp.src('app/styles/*.scss')
    .pipe(wiredep({
      directory: 'app/bower_components'
    }))
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep({
      directory: 'app/bower_components'
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('watch', ['connect', 'serve'], function () {
  var server = $.livereload();

  // watch for changes

  gulp.watch([
    'app/*.html',
    '.tmp/styles/**/*.css',
    'app/scripts/**/*.js',
    'app/images/**/*'
  ]).on('change', function (file) {
    server.changed(file.path);
  });

  gulp.watch(config.app + 'templates/*.html', ['includeFiles', 'compileTemplate']);
  gulp.watch(config.app + 'templates/**/*.html', ['includeFiles', 'compileTemplate']);
  gulp.watch(config.app + 'styles/**/*.scss', ['styles']);
  gulp.watch(config.app + 'scripts/**/*.js', ['scripts']);
  gulp.watch(config.app + 'images/**/*', ['images']);
  gulp.watch(config.app + 'images/sprites/**/*.*', ['sprite']);
  gulp.watch(config.app + 'templates/sprite/**/*.mustache', ['sprite']);
  gulp.watch('bower.json', ['wiredep']);
});


gulp.task('sprite', function() {
  var
    spritePath = config.app + 'images/sprites/*.*',
    spriteRetinaPath = config.app + 'images/sprites/2x/*.*',
    destImage = config.app + 'images/',
    destStyle = config.app + 'styles/partials/',
    spriteData = gulp.src(spritePath)
      .pipe(spritesmith({
        imgName: 'sprite.png',
        cssName: '_sprite_smith.scss',
        cssTemplate: config.app + 'templates/sprite/sprite_smith.scss.mustache',
        algorithm: 'binary-tree'
      })),
    spriteRetinaData = gulp.src(spriteRetinaPath)
      .pipe(spritesmith({
        imgName: 'sprite-retina.png',
        cssName: '_sprite_smith-retina.scss',
        cssTemplate: config.app + 'templates/sprite/sprite_smith2x.scss.mustache',
        cssVarMap: function (sprite) {
          sprite.originalName = sprite.name.replace(/@2x/,'');
          if (sprite.name.indexOf('@') !== -1){
            sprite.name = sprite.name.replace(/@/,'');
          } else {
            sprite.name = sprite.name + '2x';
          }
          console.log(sprite);
        },
        algorithm: 'binary-tree'
      }));

  spriteData.img.pipe(gulp.dest(destImage));
  spriteData.css.pipe(gulp.dest(destStyle));
  spriteRetinaData.img.pipe(gulp.dest(destImage));
  spriteRetinaData.css.pipe(gulp.dest(destStyle));
});

gulp.task('compileTemplate', function () {
  gulp.src(['app/templates/*.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('.tmp/templates'))
    .on('end', function () {
      gulp.src('.tmp/templates/*.html')
        .pipe(template({name: 'Sindre'}))
        .pipe(gulp.dest('app/'));
    });
});

gulp.task('includeFiles', function () {

});
