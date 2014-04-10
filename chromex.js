var Buffer = require('buffer').Buffer;
var fs = require('fs');
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');

var chromexStream = function () {
	'use strict';

	var PLUGIN_NAME = require('./package.json').name;
	var manifestFound = false;
	var pkg;
	var pkgPath;
	var stream;

	// Check for package.json file
	pkgPath = path.join(process.cwd(), 'package.json');
	if (fs.existsSync(pkgPath) === false) {
		throw new gutil.PluginError(PLUGIN_NAME, 'Please createa a your package.json file in root level of your extension.');
	}

	// Load extension's package.json file
	pkg = require(pkgPath);

	// Create stream for piping
	stream = through.obj(function (file, enc, finish) {
		var self = this;

		if (file.isNull()) {
			return finish();
		}

		// Update manifest file
		if (file.path.indexOf('manifest.json', file.path.length - 13) > 1) {
			manifestFound = true;
			updateManifest(file, function (file) {
				self.push(file);
				finish();
			});
			return;
		}

		this.push(file);

		return finish();
	}).on('finish', function () {
		// If manifest is not found, throw an error
		if (manifestFound !== true) {
			throw new gutil.PluginError(PLUGIN_NAME, 'Please include your manifest.json file in the gulp.src() blob.');
		}
	});

	function updateManifest(file, finish) {
		var manifest = JSON.parse(file.contents);

         // Update manifest.json with name, version, and description
         manifest.name = pkg.name;
         manifest.version = pkg.version;
         manifest.description = pkg.description;

         file.contents = new Buffer(JSON.stringify(manifest, undefined, 4));

         // Update actual manifest file
         fs.writeFile(file.path, file.contents, function () {
         	finish(file);
         });
	}

	return stream;
};

module.exports = chromexStream;