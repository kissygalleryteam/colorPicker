var gulp = require('gulp');
var filter = require('gulp-filter');
var kclean = require('gulp-kclean');
var modulex = require('gulp-modulex');
var path = require('path');
var rename = require('gulp-rename');
var packageInfo = require('./package.json');
var src = path.resolve(process.cwd(), 'lib');
var build = path.resolve(process.cwd(), 'build');
var clean = require('gulp-clean');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var jscs = require('gulp-jscs');
var replace = require('gulp-replace');
var wrapper = require('gulp-wrapper');
var date = new Date();
var header = ['/*',
        'Copyright ' + date.getFullYear() + ', ' + packageInfo.name + '@' + packageInfo.version,
        packageInfo.license + ' Licensed',
        'build time: ' + (date.toGMTString()),
    '*/', ''].join('\n');
    
gulp.task('lint', function () {
    return gulp.src('./lib/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'))
        .pipe(jscs());
});

gulp.task('tag', function (done) {
    var cp = require('child_process');
    var version = packageInfo.version;
    cp.exec('git tag ' + version + ' | git push origin ' + version + ':' + version + ' | git push origin master:master', done);
});

gulp.task('clean', function () {
    return gulp.src(build, {
        read: false
    }).pipe(clean());
});

gulp.task('build', ['lint'], function () {
    var tag = 'color';
    return gulp.src('./lib/' + tag + '.js')
        .pipe(modulex({
            modulex: {
                packages: {
                    'color': {
                        base: path.resolve(src, tag)
                    }
                }
            }
        }))
        .pipe(kclean({
            files: [
                {
                    src: './lib/' + tag + '-debug.js',
                    outputModule: tag
                }
            ]
        }))
        .pipe(replace(/@VERSION@/g, packageInfo.version))
        .pipe(wrapper({
                    header: header
                }))
		.pipe(replace(/modulex\.add\("color"/, 'define("kg/color/0.0.1/index"'))
		.pipe(rename(function(path) {
			path.basename = path.basename.replace('-debug', '').replace('color', 'index');	
		 }))
        .pipe(gulp.dest(path.resolve(build)))
        .pipe(filter('index.js'))
        .pipe(replace(/@DEBUG@/g, ''))
        .pipe(uglify())
        .pipe(rename(function(path) {
			path.extname = '-min.js';	
		 }))
        .pipe(gulp.dest(path.resolve(build)));
});
gulp.task('mx', function () {
});

gulp.task('default', ['build']);
