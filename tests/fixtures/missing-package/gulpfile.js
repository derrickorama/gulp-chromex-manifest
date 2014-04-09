var gulp = require('gulp');
var chromexMan = require('../../../chromex');

gulp.task('default', function() {

    gulp.src('manifest.json')
        .pipe(chromexMan());

});