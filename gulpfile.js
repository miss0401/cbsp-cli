const gulp = require('gulp');
const sass = require('gulp-sass');
const Rename = require('gulp-rename');
const Path = require('path');
const Csso = require('gulp-csso');
const Clean = require('gulp-clean');
const GulpIf = require('gulp-if');
const ImageMin = require('gulp-imagemin');
const postcss = require('gulp-postcss');
const pxtounits = require('postcss-px2units');
// const UrlPrefixer = require('gulp-url-prefixer');
// const Qiniu = require('gulp-qiniu-utils');
// const ESLint = require('gulp-eslint');
const cssBase64 = require('gulp-css-base64');
const Alias = require('gulp-wechat-weapp-src-alisa');
// const Insert = require('gulp-insert');

// 匹配文件路径
const path = {
    scssPath: ['src/**/*.scss','src/**/*.sass', 'src/**/*.wxss', '!src/style/**', '!src/**/templates/**'],
    jsPath: ['src/**/*.js'],
    wxmlPath: ['src/**/*.wxml'],
    copy: ['src/**/*.wxml', 'src/**/*.json', 'src/**/*.wxs'],
    jsonPath: 'src/**/*.json',
    images: ['src/images/*.*'],
};

// const urlPrefix = {
//     prefix: 'https://cdn.liayal.com/dist',
//     tags: ['image'],
// };

function _join(dirname) {
    return Path.join(process.cwd(), 'src', dirname);
}

// 路径别名配置
const aliasConfig = {
    '@Libs': _join('libs'),
    '@Utils': _join('utils'),
    '@Components': _join('components'),
    '@Style': _join('style'),
    '@Images': _join('images'),
};

gulp.task('sass', () => {
  return gulp.src(path.scssPath, { base: 'src/' })
  .pipe(Alias(aliasConfig))
  .pipe(sass({
    outputStyle: 'compressed'
  }).on('error', sass.logError))
  .pipe(postcss([pxtounits()]))
  // .pipe(UrlPrefixer.css(urlPrefix))
  .pipe(GulpIf(process.env.NODE_ENV === 'production', Csso()))
  .pipe(Rename({
      extname: '.wxss',
  }))
  .pipe(cssBase64())
  .pipe(gulp.dest('dist'));
})


gulp.task('js', () => {
  return gulp.src(path.jsPath)
        .pipe(Alias(aliasConfig))
        // .pipe(ESLint())
        // .pipe(ESLint.format())
        .pipe(gulp.dest('dist'));
})

gulp.task('views', () => {
  return gulp.src(path.wxmlPath)
    .pipe(gulp.dest('dist/pages'))
})

gulp.task('imagemin', () => {
  return gulp.src(path.images)
  .pipe(ImageMin())
  .pipe(gulp.dest('dist/images'));
})

// dev JSON
gulp.task('json', () => {
  return gulp.src(path.jsonPath)
    .pipe(gulp.dest('dist'))
})




gulp.task('dev', gulp.series('json', 'js', 'sass', 'views', 'imagemin', () => {
  gulp.watch(path.scssPath, gulp.series('sass'));
  gulp.watch(path.jsPath, gulp.series('js'));
  gulp.watch(path.wxmlPath, gulp.series('views'));
  gulp.watch(path.jsonPath, gulp.series('json'));
  gulp.watch(path.images, gulp.series('imagemin'));
}))

gulp.task('clean', () => {
  gulp.src('dist/*', { read: false })
  .pipe(Clean());
})

// exports.build = series(clean, parallel(copy, wxss, js));
// exports.default = series(clean, parallel(copy, wxss, js, imagemin));