
var gulp = require('gulp'),
    argv = require('yargs').argv,
    browserSync = require('browser-sync'),
    clean = require('gulp-clean'),
    cleanCSS = require('gulp-clean-css'),
    gulpif = require('gulp-if'),
    rename = require('gulp-rename'),
    autoprefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'), // TODO May remove after adding Browserify
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    runSequence = require('run-sequence'),
    util = require('gulp-util'),
    useref = require('gulp-useref');  //TODO for injecting CSS to HTML


var paths = {
    src: {
        html: "./*.html",
        sass: "./src/styles/**/*.scss",
        app: "./src/app/**/*.js",
        css: "./src/styles/*.css",
        tests: "./src/ " //Add karma and jasmine for unit testing
    },
    dist: {
        styles: "./dist/styles",
        scripts: "./dist/scripts",
        templates: "./dist"
    }
}

/* Neat trick to turn undefined into a proper false */
var production = !!util.env.production

/* Custom Task Configurations */
var config = {
    styles: {
        build: function() {
            return gulp.src(paths.src.sass)
                .pipe(sourcemaps.init())
                .pipe(sass().on('error', sass.logError))
                .pipe(autoprefixer('last 2 versions'))
                .pipe(sourcemaps.write())
                .pipe(gulp.dest('./src/styles/'))
                .pipe(browserSync.stream())
                .pipe(gulpif(production, rename({ suffix: '.min' })))
                .pipe(gulpif(production, cleanCSS({ compatibility: 'ie8' })))
                .pipe(gulpif(production, gulp.dest(paths.dist.styles)))
        }
    },
    scripts: {
        build: function() {
            return gulp.src(paths.src.app)
                .pipe(sourcemaps.init())
                .pipe(concat('main.js'))
                .pipe(sourcemaps.write())
                .pipe(gulp.dest('./src/app/'))
                .pipe(browserSync.stream())
                .pipe(gulpif(production, rename({ suffix: '.min' })))
                .pipe(gulpif(production, uglify()))
                .pipe(gulpif(production, gulp.dest(paths.dist.scripts)))
        },
        clean: function() {
            return gulp.src('./src/app/main.js', { read: false })
                .pipe(clean());
        }
    },
    templates: {
        build: function() {
            return gulp.src(paths.src.html)
                .pipe(browserSync.stream())
                .pipe(gulpif(production, useref()))
                .pipe(gulpif('*.js', uglify()))
                .pipe(gulpif('*.css', cleanCSS()))
                .pipe(gulpif(production, gulp.dest(paths.dist.templates)))
        }
    },
    browserSync: function() {
        return browserSync.init({
            browser: ["google chrome"],
            minify: false,
            injectChanges: true,
            server: {
                baseDir: !production ? "./" : "./dist"
            },
            port: process.env.PORT || 3000
        })

    },

}

var tasks = {
    development: ['build-scripts', 'build-styles', 'build-templates', 'serve', 'watch'],
    production: ['serve']
}

gulp.task('clean-scripts', config.scripts.clean);
gulp.task('build-scripts', ['clean-scripts'], config.scripts.build);
gulp.task('build-styles', config.styles.build);
gulp.task('build-templates', production ? ['build-scripts', 'build-styles'] : [], config.templates.build);
gulp.task('serve', ['build-templates'], config.browserSync);

gulp.task('watch', function() {
    gulp.watch(paths.src.app, ['build-scripts']).on('change', browserSync.reload)
    gulp.watch(paths.src.html, ['build-templates']).on('change', browserSync.reload)
    gulp.watch(paths.src.sass, ['build-styles']).on('change', browserSync.reload)
})

gulp.task('default', production ? tasks.production : tasks.development)

/*  How to use: -

    1. gulp                 (one off development build and watches for changes)
    2. gulp --production    (creates distribution ready files for production)

*/