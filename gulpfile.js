
var gulp = require('gulp'),
    clean = require('gulp-clean'),
    cleanCSS = require('gulp-clean-css'),
    browserSync = require('browser-sync'),
    rename = require('gulp-rename'),
    autoprefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'), // TODO May remove after adding Browserify
    uglify = require('gulp-uglify'),
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

/* Custom Task Configurations */
var tasks = {
    styles: function() {
        return gulp.src([paths.src.sass])
            .pipe(sourcemaps.init())
            .pipe(sass().on('error', sass.logError))
            .pipe(autoprefixer('last 2 versions'))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('./src/styles/'))
            .pipe(cleanCSS({ compatibility: 'ie8' }))
            .pipe(rename({ suffix: '.min' }))
            .pipe(gulp.dest(paths.dist.styles))
            .pipe(browserSync.stream());
    },
    scripts: function() {
        return gulp.src([paths.src.app + '/app.module.js', paths.src.app + '/**/*.js'])
            .pipe(sourcemaps.init())
            .pipe(concat('main.js'))
            .pipe(gulp.dest('./src/app/'))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('./src/app/'))
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
    clean: {
        scripts: function() {
            return gulp.src('./src/app/main.js', { read: false })
                .pipe(clean());
        }
    },
    browserSync: function() {
        return browserSync.init({
            browser: ["google chrome"],
            minify: false, /*** TODO Check if Dev build or production build and change accordingly */
            injectChanges: true,
            server: {
                baseDir: "./"
            },
            port: process.env.PORT || 3000
        })
    }
}

/*Custom Gulp Task declarations*/

// Cleans javascript output main.js file
gulp.task('clean-scripts', tasks.clean.scripts);

// Transpiles SASS to CSS
gulp.task('reload-styles', tasks.styles);

// Cleans any previous main.js output file first and then rebuilds all app scripts
gulp.task('reload-scripts', ['clean-scripts'], tasks.scripts);

// Rebuilds html templates
gulp.task('reload-templates', tasks.templates);

// Builds html templates first and then fires up a local web server
gulp.task('serve', ['reload-templates'], tasks.browserSync);


//Watches changes in source files and reloads the browser on change
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