var gulp = require('gulp'),
	babel = require('gulp-babel'),
	minify = require('gulp-minify'),
	jshint = require('gulp-jshint');

gulp.task('js', function() {
	return gulp.src('src/*.js')
		.pipe(babel())
		.pipe(jshint())
		.pipe(minify())
		.pipe(gulp.dest('build'));
});

gulp.task('default', function() {
	gulp.watch('src/*.js', ['js']);
});