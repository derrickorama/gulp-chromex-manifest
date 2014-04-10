var Buffer = require('buffer').Buffer;
var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var gutil = require('gulp-util');
var through = require('through2');
var unzip = require('unzip');
var chromexMan = require('../chromex.js');

describe('init', function () {

    it('will reject settings if manifest.json is missing', function (done) {
        var child = spawn('gulp', [], { cwd: path.join(__dirname, 'fixtures/missing-manifest/') });
        var error = '';

        child.stderr.on('data', function (data) {
            error += data.toString();
        });

        child.on('exit', function () {
            expect(error).toContain('Please include your manifest.json file in the gulp.src() blob.');
            done();
        });
    });

    it('will reject settings if package.json is missing', function (done) {
        var child = spawn('gulp', [], { cwd: path.join(__dirname, 'fixtures/missing-package/') });
        var error = '';

        child.stderr.on('data', function (data) {
            error += data.toString();
        });

        child.on('exit', function () {
            expect(error).toContain('Please createa a your package.json file in root level of your extension.');
            done();
        });
    });

});

describe('manifest update', function () {
    var manifest;
    var originalCWD;
    var otherFile;
    var pkgPath;
    var stream;

    beforeEach(function () {
        pkgPath = path.join(__dirname, 'fixtures', 'valid-package', 'package.json');

        fs.writeFileSync(pkgPath, JSON.stringify({
            name: 'extension-name',
            version: '1.0.0',
            description: 'A description.'
        }));

        // Clear out manifest
        fs.writeFileSync(path.join(__dirname, 'fixtures', 'valid-package', 'manifest.json'), '{}');

        // Create virtual files
        manifest = new gutil.File({
            base: path.join(__dirname, './fixtures/valid-package/'),
            cwd: __dirname,
            path: path.join(__dirname, './fixtures/valid-package/manifest.json'),
            contents: new Buffer('{}')
        });
        otherFile = new gutil.File({
            base: path.join(__dirname, './fixtures/valid-package/'),
            cwd: __dirname,
            path: path.join(__dirname, './fixtures/valid-package/otherFile.json')
        });

        // Save original CWD and set new one
        originalCWD = process.cwd();
        process.chdir(path.join(__dirname, 'fixtures/valid-package'));
    });

    afterEach(function () {
        fs.writeFileSync(path.join(__dirname, 'fixtures', 'valid-package', 'manifest.json'), '{}');
        fs.writeFileSync(pkgPath, '{}');
        process.chdir(originalCWD);
    });

    function createStream() {
        // Create/write to stream
        stream = chromexMan();
        stream.write(otherFile);
        stream.write(manifest);
    }

    it('updates the name property', function (done) {
        createStream();
        stream.on('data', function (data) {
            expect(JSON.parse(data.contents).name).toBe('extension-name');
            done();
        });
        stream.end();
    });

    it('updates the version property', function (done) {
        createStream();
        stream.on('data', function (data) {
            expect(JSON.parse(data.contents).version).toBe('1.0.0');
            done();
        });
        stream.end();
    });

    it('updates the description property', function (done) {
        createStream();
        stream.on('data', function (data) {
            expect(JSON.parse(data.contents).description).toBe('A description.');
            done();
        });
        stream.end();
    });

    it('prettifies the manifest JSON', function (done) {
        createStream();
        stream.on('data', function (data) {
            expect(data.contents.toString()).toBe('{\n' + '    "name": "extension-name",\n' + '    "version": "1.0.0",\n' + '    "description": "A description."\n' + '}');
            done();
        });
        stream.end();
    });

    it('uses the "title" property for the manifest "name" if available', function (done) {
        fs.writeFileSync(pkgPath, JSON.stringify({
            name: 'extension-name',
            title: 'Extension Name',
            version: '1.0.0',
            description: 'A description.'
        }));
        createStream();
        stream.on('data', function (data) {
            expect(JSON.parse(data.contents).name).toBe('Extension Name');
            done();
        });
        stream.end();
    });

});

describe('gulp-zip compatibility', function () {
    var zipDir;

    beforeEach(function () {
        // Clear out manifest
        fs.writeFileSync(path.join(__dirname, 'fixtures', 'zip', 'manifest.json'), '{}');

        zipDir = path.join(__dirname, 'fixtures/zip/');
        zipFile = path.join(zipDir, 'zip.zip');

        if (fs.existsSync(zipFile)) {
            fs.unlinkSync(zipFile);
        }
    });

    afterEach(function () {
        if (fs.existsSync(zipFile)) {
            fs.unlinkSync(zipFile);
        }
        fs.writeFileSync(path.join(__dirname, 'fixtures', 'zip', 'manifest.json'), '{}');
    });

    it('zips files passed from gulp-chromex to to gulp-zip', function (done) {
        
        var child = spawn('gulp', [], { cwd: zipDir });
        var stdout = '';

        child.stdout.on('data', function (data) {
            stdout += data.toString();
        });

        child.on('exit', function () {
            var files = [];

            fs.createReadStream(zipFile)
                .pipe(unzip.Parse())
                .on('entry', function (entry) {
                    files.push(entry.path);
                })
                .on('close', function () {
                    expect(files).toEqual([
                        'somefile.js',
                        'somefile.css',
                        'manifest.json'
                    ]);
                    done();
                });
        });
    });

});