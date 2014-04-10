# [gulp](https://github.com/wearefractal/gulp)-chromex-manifest

> Updates your Chrome extension manifest with values in package.json - also works with [gulp-zip](https://github.com/sindresorhus/gulp-zip)

## What this does

* Copies the name, version, and description from your package.json file over to your manifest.json file (keeps them up-to-date)
* Will use the "title" property of your package.json for the manifest "name" property if available


## Install

Install with npm from [GitHub](https://github.com/derrickorama/gulp-chromex-manifest)

```
npm install --save-dev git+https://github.com/derrickorama/gulp-chromex-manifest.git
```


## Example usage with [gulp-zip](https://github.com/sindresorhus/gulp-zip)

This snippet will update your manifest file and then zip all of the files you included with gulp.src().

Note: You must run chromexMan() before you zip your files or your files will not include the updated manifest.

```js
var path = require('path');
var gulp = require('gulp');
var chromexMan = require('gulp-chromex-manifest');
var zip = require('gulp-zip');

gulp.task('default', function() {
    gulp.src(['**/*', '!.git/**/*', '!node_modules/**/*', '!gulpfile.js', '!package.json'])
        .pipe(chromexMan())
        .pipe(zip(path.basename(__dirname) + '.zip'))
        .pipe(gulp.dest(__dirname));
});
```