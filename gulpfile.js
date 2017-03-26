'use strict';

var gulp = require('gulp'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    cssmin = require('gulp-clean-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload,
	FtpDeploy = require('ftp-deploy'),
	ftpDeploy = new FtpDeploy();

var path = {
    build: { //Òóò ìû óêàæåì êóäà ñêëàäûâàòü ãîòîâûå ïîñëå ñáîðêè ôàéëû
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    src: { //Ïóòè îòêóäà áðàòü èñõîäíèêè
        html: 'src/*.html', //Ñèíòàêñèñ src/*.html ãîâîðèò gulp ÷òî ìû õîòèì âçÿòü âñå ôàéëû ñ ðàñøèðåíèåì .html
        js: 'src/js/main.js',//Â ñòèëÿõ è ñêðèïòàõ íàì ïîíàäîáÿòñÿ òîëüêî main ôàéëû
        style: 'src/style/main.scss',
        img: 'src/img/**/*.*', //Ñèíòàêñèñ img/**/*.* îçíà÷àåò - âçÿòü âñå ôàéëû âñåõ ðàñøèðåíèé èç ïàïêè è èç âëîæåííûõ êàòàëîãîâ
        fonts: 'src/fonts/**/*.*'
    },
    watch: { //Òóò ìû óêàæåì, çà èçìåíåíèåì êàêèõ ôàéëîâ ìû õîòèì íàáëþäàòü
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.scss',
        img: 'src/img/**/*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};

var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "Wave"
};

var deployConfig = {
    username: "",
    password: "", // optional, prompted if none given 
    host: "ftp.wave.com.ua",
    port: 21,
    localRoot: __dirname + "/build",
    remoteRoot: "/",
    exclude: ['.git', '.idea', 'tmp/*']
}

gulp.task('html:build', function () {
    gulp.src(path.src.html) //Âûáåðåì ôàéëû ïî íóæíîìó ïóòè
        .pipe(rigger()) //Ïðîãîíèì ÷åðåç rigger
        .pipe(gulp.dest(path.build.html)) //Âûïëþíåì èõ â ïàïêó build
        .pipe(reload({stream: true})); //È ïåðåçàãðóçèì íàø ñåðâåð äëÿ îáíîâëåíèé
});

gulp.task('js:build', function () {
    gulp.src(path.src.js) //Íàéäåì íàø main ôàéë
        .pipe(rigger()) //Ïðîãîíèì ÷åðåç rigger
        .pipe(sourcemaps.init()) //Èíèöèàëèçèðóåì sourcemap
        .pipe(uglify()) //Ñîæìåì íàø js
        .pipe(sourcemaps.write()) //Ïðîïèøåì êàðòû
        .pipe(gulp.dest(path.build.js)) //Âûïëþíåì ãîòîâûé ôàéë â build
        .pipe(reload({stream: true})); //È ïåðåçàãðóçèì ñåðâåð
});

gulp.task('style:build', function () {
    gulp.src(path.src.style) //Âûáåðåì íàø main.scss
        .pipe(sourcemaps.init()) //Òî æå ñàìîå ÷òî è ñ js
        .pipe(sass()) //Ñêîìïèëèðóåì
        .pipe(prefixer({
			browsers: ['last 2 versions', 'ie >= 8'],
			cascade: false
			})) //Äîáàâèì âåíäîðíûå ïðåôèêñû
        .pipe(cssmin()) //Ñîæìåì
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css)) //È â build
        .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
    gulp.src(path.src.img) //Âûáåðåì íàøè êàðòèíêè
        .pipe(imagemin({ //Ñîæìåì èõ
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img)) //È áðîñèì â build
        .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build'
]);

gulp.task('watch', function() {
    gulp.watch(path.watch.html, ['html:build']);
    gulp.watch(path.watch.style, ['style:build']);
    gulp.watch(path.watch.js, ['js:build']);
    gulp.watch(path.watch.img, ['image:build']);
    gulp.watch(path.watch.fonts, ['fonts:build']);
});

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('deploy', function () {
    ftpDeploy.deploy(deployConfig, function(err) {
    if (err) console.log(err)
    else console.log('finished');
	});
});

gulp.task('default', ['build', 'webserver', 'watch']);