var gulp = require('gulp');
var rename = require('gulp-rename');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');

gulp.task('default', ['js']);

gulp.task('js', ['pop-under']);

gulp.task('pop-under', function(done) {
    gulp.src('./src/pop-under.js')
            .pipe(jshint())
            .pipe(jshint.reporter('jshint-stylish'))
            .pipe(jshint.reporter('fail'))
            .pipe(rename({basename: 'show-promote', extname: '.js'}))
            .pipe(gulp.dest('./dist'))
            .pipe(uglify({preserveComments: 'none', mangle:false}))
            .pipe(rename({extname: '.min.js'}))
            .pipe(gulp.dest('./dist'))
            .on('end', done);
});