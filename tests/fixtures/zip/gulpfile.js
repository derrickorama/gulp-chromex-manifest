var path = require('path');
var gulp = require('gulp');
var zip = require('gulp-zip');
var chromexMan = require('../../../chromex');

gulp.task('default', function() {

    gulp.src(['*.js', '*.css', 'manifest.json', '!gulpfile.js'])
        .pipe(chromexMan())
        .pipe(zip(path.basename(__dirname) + '.zip'))
        .pipe(gulp.dest(__dirname));

});