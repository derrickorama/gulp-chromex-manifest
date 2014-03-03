var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var through = require('through2');
var zip = require('gulp-zip');

var chromexStream = through.obj(function (manifestFile, enc, finished) {
	var manifestJSON = JSON.parse(manifestFile.contents.toString());

	if (!manifestFile.isBuffer()) {
		this.push(manifestFile);
		return callback();
	}

	// Load package.json
	gulp.src('package.json')
		.pipe(through.obj(function (packageFile, enc, callback) {
			var packageJSON = JSON.parse(packageFile.contents.toString());
			
			// Update manifest.json with name, version, and description
			manifestJSON.name = packageJSON.name;
			manifestJSON.version = packageJSON.version;
			manifestJSON.description = packageJSON.description;

			this.push(JSON.stringify(manifestJSON, null, 2));

			callback();
		}))
		.pipe(through.obj(function (manifestContents, enc, callback) {
			var stream = fs.createWriteStream(manifestFile.path);
			stream.end(manifestContents);
			stream.on('finish', function () {
				var root = path.dirname(manifestFile.path);
				var dirBaseName = path.basename(root);

				gulp.src(['**/**', '!' + dirBaseName + '.zip', '!node_modules/**/**', '!.git*', '!gulpfile.js', '!package.json'])
					.pipe(zip(dirBaseName + '.zip'))
					.pipe(gulp.dest(root));
			});
		}));
});

module.exports = chromexStream;