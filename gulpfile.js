var gulp = require('gulp'),
	babel = require('gulp-babel'),
	minify = require('gulp-minify'),
	jshint = require('gulp-jshint'),
	del = require('del'),
	package = require('./package.json');

gulp.task('js', ['clean'], function() {
	var version = package.version;
	return gulp.src('src/*.js')
		.pipe(babel())
		.pipe(jshint())
		.pipe(minify({ext: {min: "-"+version+".min.js", src: "-"+version+".js"}}))
		.pipe(gulp.dest('build'));
});

gulp.task('clean', function() {
	return del(['./build'])
})

gulp.task('default', ['js'], function() {
	gulp.watch('src/*.js', ['js']);
});