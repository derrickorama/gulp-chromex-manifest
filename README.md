Note: Just whipped up this plugin for a project I'm working on. Getting it out there/saving it somewhere.

Reasons to use this plugin:

* Copies the name, version, and description from your package.json file over to your manifest.json file (keeps them up-to-date)
* Zips up and excludes common excludes

# [gulp](https://github.com/wearefractal/gulp)-chromex-manifest

> Bundle your Chrome extension for the [Chrome Web Store](https://chrome.google.com/webstore)


## Install

Install with npm from [GitHub](https://github.com/derrickorama/gulp-chromex-manifest)

```
npm install --save-dev https://github.com/derrickorama/gulp-chromex-manifest.git
```


## Example

Note: This expects your package.json to be in the same directory as your gulpfile.

```js
var gulp = require('gulp');
var chromexMan = require('chromex-manifest');

gulp.task('default', function() {
    gulp.src('manifest.json')
        .pipe(chromexMan);
});
```