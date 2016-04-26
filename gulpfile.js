var 
    gulp         = require('gulp'),
    runSequence  = require('run-sequence'),
    gulpif       = require('gulp-if'),
    uglify       = require('gulp-uglify'),
    csslint      = require('gulp-csslint'),
    rev          = require('gulp-rev'),
    minifyCss    = require('gulp-minify-css'),
    changed      = require('gulp-changed'),
    jshint       = require('gulp-jshint'),
    stylish      = require('jshint-stylish'),
    revCollector = require('gulp-rev-collector'),
    minifyHtml   = require('gulp-minify-html'),
    autoprefixer = require('gulp-autoprefixer'),
    del          = require('del'),
    notify       = require('gulp-notify'),
    sass         = require('gulp-sass'),
    clean        = require('gulp-clean'),
    imagemin     = require('gulp-imagemin'),
    concat       = require('gulp-concat');

var
    cssSrc    = 'src/css/*.?(s)css',
    cssDest   = 'dist/css',
    jsSrc     = 'src/js/*.js',
    jsDest    = 'dist/js',
    fontSrc   = 'src/fonts/*',
    fontDest  = 'dist/font',
    imgSrc    = 'src/img/*',
    imgDest   = 'dist/img',
    cssRev    = 'src/css/revCss',
    cssRevSrc = 'src/css/revCss/*.?(s)css',
    jsRev     = 'src/rev/js',
    htmlSrc   = 'src/*.html',
    condition = true;

/*var
    path      = require('path'),
    srcPath   = 'src',
    distPath  = 'dist',
    revPath   = path.join(srcPath, 'rev'),
    cssSrc    = path.join(srcPath, 'css/*.?(s)css'),
    cssDest   = path.join(distPath, 'css'),
    jsSrc     = path.join(srcPath, 'js/*.js'),
    jsDest    = path.join(distPath, 'js'),
    fontSrc   = path.join(srcPath, 'src/fonts/*'),
    fontDest  = path.join(distPath, 'font'),
    imgSrc    = path.join(srcPath, 'img/*'),
    imgDest   = path.join(distPath, 'img'),
    cssRev    = path.join(srcPath, 'css/revCss'),
    cssRevSrc = path.join(srcPath, 'css/revCss/*.css'),
    jsRev     = path.join(revPath, 'js'),
    htmlSrc   = path.join(srcPath, '*.html'),
    condition = true;*/

function changePath(basePath) {
    var nowCssSrc = [];
    for (var i = 0; i < cssSrcItems.length; i++) {
        nowCssSrc.push(cssRevSrc + '/' + cssSrcItems[i]);
    }
    return nowCssSrc;
}

//Fonts & Images 根据MD5获取版本号
gulp.task('revFont', function() {
    return gulp.src(fontSrc)
        .pipe(rev())
        .pipe(gulp.dest(fontDest))
        .pipe(rev.manifest())
        .pipe(gulp.dest('src/rev/font'));
});

gulp.task('revImg', function() {
    return gulp.src(imgSrc)
        .pipe(imagemin({ optimizationLevel: 7, progressive: true, interlaced: true }))
        .pipe(rev())
        .pipe(gulp.dest(imgDest))
        .pipe(rev.manifest())
        .pipe(gulp.dest('src/rev/img'))
        .pipe(notify({ message: 'Img task complete' }));
});

//检测JS
gulp.task('lintJs', function() {
    return gulp.src(jsSrc)
        //.pipe(jscs())   //检测JS风格
        .pipe(jshint({
            "undef": false,
            "unused": false
        }))
        .pipe(jshint.reporter(stylish)) //高亮提示
        .pipe(jshint.reporter('fail'));
});

//压缩JS/生成版本号
gulp.task('handleJs', function() {
    return gulp.src(jsSrc)
        .pipe(gulpif(
            condition, uglify()
        ))
        .pipe(rev())
        .pipe(gulp.dest(jsDest))
        .pipe(rev.manifest())
        .pipe(gulp.dest(jsRev))
        .pipe(notify({ message: 'Script task complete' }));
});

//CSS里更新引入文件版本号
gulp.task('revCollectorCss', function() {
    return gulp.src(['src/rev/**/*.json', cssSrc])
        .pipe(revCollector())
        .pipe(gulp.dest(cssRev));
});

//检测CSS
gulp.task('lintCss', function() {
    return gulp.src(cssSrc)
        .pipe(csslint({
            "undef": false,
            "unused": false
        }))
        .pipe(csslint.reporter())
        .pipe(csslint.failReporter());
});

//压缩/合并CSS/生成版本号
gulp.task('handleCss', function() {
    return gulp.src(cssRevSrc)
        .pipe(sass())
        .pipe(gulpif(
            condition, minifyCss({
                compatibility: 'ie7'
            })
        ))
        .pipe(rev())
        .pipe(gulpif(
            condition, changed(cssDest)
        ))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false,
            remove: false
        }))
        .pipe(gulp.dest(cssDest))
        .pipe(rev.manifest())
        .pipe(gulp.dest('src/rev/css'))
        .pipe(notify({ message: 'Style task complete' }));
});

//压缩Html/更新引入文件版本
gulp.task('handleHtml', function() {
    return gulp.src(['src/rev/**/*.json', htmlSrc])
        .pipe(revCollector())
        .pipe(gulpif(
            condition, minifyHtml({
                empty: true,
                spare: true,
                quotes: true
            })
        ))
        .pipe(gulp.dest('dist'))
        .pipe(notify({ message: 'Html task complete' }));;
});

gulp.task('delRevCss', function() {
    del([cssRevSrc]);
})

gulp.task('clean', function() {
    return gulp.src([cssDest, jsDest, imgDest], { read: false })
        .pipe(clean());
});

//开发构建
gulp.task('dev', ['clean'], function(done) {
    condition = false;
    runSequence(
        ['revFont', 'revImg'], /*['lintJs', 'lintCss'],*/ ['revCollectorCss'], ['handleCss', 'handleJs'], ['handleHtml'],
        done);
});

//正式构建
gulp.task('build', ['clean'], function(done) {
    runSequence(
        ['revFont', 'revImg'], /*['lintJs', 'lintCss'],*/ ['revCollectorCss'], ['handleCss', 'handleJs'], ['handleHtml', 'delRevCss'],
        done);
});

gulp.task('default', ['build']);
gulp.task('test', ['dev', 'watch']);

gulp.task('watch', function() {

    gulp.watch(jsSrc, ['handleHtml', 'handleJs']);

    gulp.watch(cssSrc, ['handleCss', 'handleHtml', 'delRevCss']);

});
