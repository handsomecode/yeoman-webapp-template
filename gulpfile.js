/* jshint node:true */
'use strict';
// generated on 2015-01-12 using generator-gulp-webapp 0.2.0
var gulp = require('gulp'),
  fileinclude = require('gulp-file-include'),
  template = require('gulp-template'),
  data = require('gulp-data'),
  fm = require('front-matter'),
  templateData = require('./app/content.json'),
  spritesmith = require('gulp.spritesmith'),
  config = {
    app: 'app',
    dist: 'dist'
  },
  $ = require('gulp-load-plugins')();

gulp.task('styles', function () {
  return gulp.src('app/styles/main.scss')
    .pipe($.plumber())
    .pipe($.rubySass({
      style: 'expanded',
      precision: 10
    }))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1']}))
    .pipe(gulp.dest('.tmp/styles'));
});

gulp.task('jshint', function () {
  return gulp.src('app/scripts/**/*.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'));
});

gulp.task('html', ['styles'], function () {
  var assets = $.useref.assets({searchPath: '{.tmp,app}'});

  return gulp.src('app/*.html')
    .pipe(assets)
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.csso()))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', function () {
  return gulp.src(require('main-bower-files')().concat('app/fonts/**/*'))
    .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
    .pipe($.flatten())
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', function () {
  return gulp.src([
    'app/*.*',
    '!app/*.html',
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', require('del').bind(null, ['.tmp', 'dist']));

gulp.task('connect', ['styles'], function () {
  var serveStatic = require('serve-static');
  var serveIndex = require('serve-index');
  var app = require('connect')()
    .use(require('connect-livereload')({port: 35729}))
    .use(serveStatic('.tmp'))
    .use(serveStatic('app'))
    // paths to bower_components should be relative to the current file
    // e.g. in app/index.html you should use ../bower_components
    .use('/bower_components', serveStatic('bower_components'))
    .use(serveIndex('app'));

  require('http').createServer(app)
    .listen(9000)
    .on('listening', function () {
      console.log('Started connect web server on http://localhost:9000');
    });
});

gulp.task('serve', ['connect', 'watch'], function () {
  require('opn')('http://localhost:9000');
});

// inject bower components
gulp.task('wiredep', function () {
  var wiredep = require('wiredep').stream;

  gulp.src('app/styles/*.scss')
    .pipe(wiredep())
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep())
    .pipe(gulp.dest('app'));
});

gulp.task('watch', ['connect'], function () {
  $.livereload.listen();

  // watch for changes
  gulp.watch([
    'app/*.html',
    '.tmp/styles/**/*.css',
    'app/scripts/**/*.js',
    'app/images/**/*'
  ]).on('change', $.livereload.changed);

  gulp.watch(config.app + '/templates/*.html', ['compileTemplate']);
  gulp.watch(config.app + '/templates/**/*.html', ['compileTemplate']);
  gulp.watch(config.app + '/content.json', ['loadData', 'compileTemplate']);
  gulp.watch(config.app + '/scripts/**/*.js', ['scripts']);
  gulp.watch(config.app + '/images/sprites/**/*.*', ['sprite']);
  gulp.watch(config.app + '/templates/sprite/**/*.mustache', ['sprite']);

  gulp.watch('app/styles/**/*.scss', ['styles']);
  gulp.watch('bower.json', ['wiredep']);
});

gulp.task('build', ['jshint', 'html', 'images', 'fonts', 'extras'], function () {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});

gulp.task('sprite', function() {
  var
    spritePath = config.app + '/images/sprites/*.*',
    spriteRetinaPath = config.app + '/images/sprites/2x/*.*',
    destImage = config.app + '/images/',
    destStyle = config.app + '/styles/partials/',
    spriteData = gulp.src(spritePath)
      .pipe(spritesmith({
        imgName: 'sprite.png',
        cssName: '_sprite_smith.scss',
        cssTemplate: config.app + '/templates/sprite/sprite_smith.scss.mustache',
        algorithm: 'binary-tree'
      })),
    spriteRetinaData = gulp.src(spriteRetinaPath)
      .pipe(spritesmith({
        imgName: 'sprite-retina.png',
        cssName: '_sprite_smith-retina.scss',
        cssTemplate: config.app + '/templates/sprite/sprite_smith2x.scss.mustache',
        cssVarMap: function (sprite) {
          sprite.originalName = sprite.name.replace(/@2x/,'');
          if (sprite.name.indexOf('@') !== -1){
            sprite.name = sprite.name.replace(/@/,'');
          } else {
            sprite.name = sprite.name + '2x';
          }
        },
        algorithm: 'binary-tree'
      }));

  spriteData.img.pipe(gulp.dest(destImage));
  spriteData.css.pipe(gulp.dest(destStyle));
  spriteRetinaData.img.pipe(gulp.dest(destImage));
  spriteRetinaData.css.pipe(gulp.dest(destStyle));
});

gulp.task('loadData',function (){
	 return gulp.src('./app/content.json')
     .pipe(data(function (file){
       templateData = JSON.parse(file.contents);
       console.log('----LOAD DATA----');
       console.log(templateData);
       return templateData;
     }));
});

gulp.task('compileTemplate', function () {
  console.log('----COMPILE TEMPLATE----');
  console.log(templateData);
  gulp.src(['app/templates/*.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('.tmp/templates'))
    .on('end', function () {
      gulp.src('.tmp/templates/*.html')
        .pipe(template(templateData))
        .pipe(gulp.dest('app/'));
    });
});