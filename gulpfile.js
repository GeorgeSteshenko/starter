const gulp = require("gulp"),
  browserSync = require("browser-sync").create(),
  sass = require("gulp-sass"),
  autoprefixer = require("autoprefixer"),
  concat = require("gulp-concat"),
  cssnano = require("cssnano"),
  postcss = require("gulp-postcss"),
  uglify = require("gulp-uglify"),
  imagemin = require("gulp-imagemin"),
  cache = require("gulp-cache"),
  del = require("del"),
  rename = require("gulp-rename");

function _browserSync() {
  browserSync.init({
    server: "./dist/",
  });
}

function reload(done) {
  browserSync.reload();
  done();
}

function _watchFiles() {
  gulp.watch("app/css/**/*.css", gulp.series(_css, reload));
  gulp.watch("app/scss/**/*.scss", gulp.series(_sass, reload));
  gulp.watch("app/*.html", gulp.series(_html, reload));
  // gulp.watch("app/js/**/*.js", gulp.series(_scripts, reload));
  gulp.watch("app/images/**/*.*", gulp.series(_images, reload));
  gulp.watch("app/fonts/**/*.*", gulp.series(_fonts, reload));
}

// Compile Sass into CSS & inject into browsers
function _sass() {
  return gulp
    .src("app/scss/**/*.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(gulp.dest("dist/css"))
    .pipe(browserSync.stream());
}

// Concatenate & minify JS
function _scripts() {
  return gulp
    .src("app/js/*.js")
    .pipe(concat("main.js"))
    .pipe(rename({ suffix: ".min" }))
    .pipe(uglify())
    .pipe(gulp.dest("dist/js"));
}

// Auto prefix & minify CSS
function _css() {
  const plugins = [
    autoprefixer({ overrideBrowserslist: ["last 2 versions"] }),
    cssnano(),
  ];
  return gulp
    .src("./dist/css/*.css")
    .pipe(postcss(plugins))
    .pipe(gulp.dest("./dist/css"));
}

// Optimize images
function _images() {
  return gulp
    .src("app/images/**/*.+(png|jpg|jpeg|gif|svg)")
    .pipe(cache(imagemin()))
    .pipe(gulp.dest("dist/images"));
}

// Move HTML files to dist
function _html() {
  return gulp.src("app/**/*.html").pipe(gulp.dest("dist"));
}

// Move font files to dist
function _fonts() {
  return gulp.src("app/fonts/*.*").pipe(gulp.dest("dist/fonts"));
}

// Clean up the dist folder
function _cleanDist(done) {
  del.sync("dist");
  done();
}

gulp.task("sass", _sass);
// gulp.task("scripts", _scripts);
gulp.task("images", _images);
gulp.task("fonts", _fonts);
gulp.task("html", _html);
gulp.task("css", _css);
gulp.task("clean:dist", _cleanDist);

gulp.task(
  "default",
  gulp.series(_sass, /*_scripts,*/ _images, _fonts, _html, _css)
);

gulp.task(
  "build",
  gulp.series(_cleanDist, _sass, /*_scripts,*/ _images, _fonts, _html, _css)
);

gulp.task("watch", gulp.parallel(_browserSync, _watchFiles));
