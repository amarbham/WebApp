
var gulp = require('gulp'),
    browserSync = require('browser-sync'),
    rename = require('gulp-rename'),
    autoprefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'), // TODO Remove after adding Browserify
    uglify = require('gulp-uglify'),
    cleanCSS = require('gulp-clean-css');
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    util = require('gulp-util'),
    useref = require('gulp-useref');  //TODO for injecting CSS to HTML


var paths = {
    src: {
        html: "./*.html",
        sass: "./src/styles/**/*.scss",
        app: "./src/app/",
        css: "./src/styles/*.css",
        tests: "./src/ " //Add karma and jasmine for unit testing
    },
    dist: {
        styles: "./dist/styles",
        scripts: "./dist/scripts",
        templates: "./dist"
    }
}

/* Custom Task Methods */
var tasks = {
    styles: function() {
        return gulp.src([paths.src.sass])
            .pipe(sourcemaps.init())
            .pipe(sass().on('error', sass.logError))
            .pipe(autoprefixer('last 2 versions'))
            .pipe(gulp.dest('./src/styles/'))
            .pipe(browserSync.stream());

    },
    scripts: function() {
        return gulp.src([paths.src.app + '/app.module.js', paths.src.app + '/**/*.js'])
            .pipe(sourcemaps.init())
            .pipe(concat('main.js'))
            .pipe(gulp.dest(paths.dist.scripts))
            .pipe(rename({ suffix: '.min' }))
            .pipe(uglify())
            .pipe(gulp.dest(paths.dist.scripts))
            .pipe(browserSync.stream());
    },
    templates: function() {
        return gulp.src(paths.src.html)
            // .pipe(useref())
            .pipe(gulp.dest(paths.dist.templates))
            .pipe(browserSync.stream());
    },
    minifyCSS: function() {
        return gulp.src(paths.src.styles + '**/*.css')
            .pipe(sourcemaps.init())
            .pipe(cleanCSS())
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(paths.dist.styles));
    }
}

gulp.task('reload-styles', tasks.styles);
gulp.task('reload-scripts', tasks.scripts);
gulp.task('reload-templates', tasks.templates);

gulp.task('serve', ['reload-templates'], function() {
    browserSync.init({
        browser: ["google chrome"],
        minify: false, /*** TODO Check if Dev build or production build and change accordingly */
        injectChanges: true,
        server: {
            baseDir: "./dist"
        },
        port: process.env.PORT || 3000
    });
});


gulp.task('watch', function() {
    gulp.watch(paths.src.html, ['reload-templates']).on('change', browserSync.reload)
    gulp.watch(paths.src.sass, ['reload-styles']).on('change', browserSync.reload)
    gulp.watch(paths.src.app, ['reload-scripts']).on('change', browserSync.reload)
    util.log(util.colors.bgBlue('Watching for changes...'));
});


gulp.task('default', [
    'reload-templates',
    'reload-styles',
    'reload-scripts',
    'serve',
    'watch'
]);

/*TODO Add dev, dev build and production build**/