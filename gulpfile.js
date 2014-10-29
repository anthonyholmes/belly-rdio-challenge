var gulp = require('gulp');
var sass = require('gulp-sass');
var minifyCSS = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require("gulp-rename");
var livereload = require('gulp-livereload');

var public_path = "public";

gulp.task('default', function(){
    // Default Task
});

gulp.task('sass', function(){
    return gulp.src('scss/main.scss')
        .pipe(sass({
            errLogToConsole: true,
        }))
        .pipe(minifyCSS())
        .pipe(gulp.dest(public_path + '/css'))
});

gulp.task('js', function(){
  gulp.src([
        'bower_components/jquery/dist/jquery.min.js',
        'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap.js',
        'bower_components/jquery.rdio/jquery.rdio.min.js',
        'js/app.js'
    ])
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(gulp.dest(public_path + '/js'))
});

gulp.task('move-assets', function(){
    // Any JS that might be used publicly
    // gulp.src([
    //     'bower_components/jquery/dist/jquery.min.js',
    //     'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap.js'
    // ]).pipe(gulp.dest(public_path + '/js'));
});


gulp.task('watch', function(){
    var server = livereload();

    livereload.listen();

    // Compile and Minify SCSS Files
    gulp.watch('scss/**/*.scss', ['sass']);

    // Compile and Minify JS
    gulp.watch('js/**/*.js', ['js']);

    // Reloads
    gulp.watch(public_path + '/css/**/*.css').on('change', livereload.changed);
    gulp.watch(public_path + '/js/**/*.js').on('change', livereload.changed);
    gulp.watch(public_path + '/index.html').on('change', livereload.changed);
});
