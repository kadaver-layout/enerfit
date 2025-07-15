import gulp from "gulp";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import browserSync from "browser-sync";
import nunjucksRender from "gulp-nunjucks-render";
import sass from "gulp-sass";
import * as dartSass from "sass";
import sourcemaps from "gulp-sourcemaps";
import gulpif from "gulp-if";
import autoprefixer from "gulp-autoprefixer";
import postcss from "gulp-postcss";
import sortMediaQueries from "postcss-sort-media-queries";
import webpackStream from "webpack-stream";
import webpack from "webpack";
import plumber from "gulp-plumber";
import terser from "gulp-terser";
import newer from "gulp-newer";
import webp from "gulp-webp";
import { deleteAsync } from "del";
import { readFileSync } from "fs";
import data from "gulp-data";
import concat from "gulp-concat";
import merge from "merge-stream";
import fs from "fs";

const sassCompiler = sass(dartSass);
const server = browserSync.create();
const argv = yargs(hideBin(process.argv)).argv;

const isProd = () => !!argv.prod;
const isDev = () => !argv.prod;

const path = {
  src: {
    html: "src/*.html",
    data: "src/data/**/*.{json,js}",
    scss: ["src/assets/styles/main.sass", "src/assets/styles/libs/*.*"],
    js: "src/assets/js/**/*.{js,ts}",
    image: "src/assets/img/**/*.{jpg,jpeg,png,gif,svg,ico}",
    fonts: "src/assets/fonts/**/*.{woff,woff2,ttf}",
    libsCss: "node_modules/@splidejs/splide/dist/css/*.min.css", // Добавлен источник для CSS
  },
  dist: {
    base: "dist/",
    html: "dist/",
    css: "dist/assets/css/",
    js: "dist/assets/js/",
    image: "dist/assets/img/",
    fonts: "dist/assets/fonts/",
  },
  watch: {
    html: "src/**/*.html",
    data: "src/data/**/*.{json,js}",
    scss: "src/assets/styles/**/*.{sass,scss}",
    js: "src/assets/js/**/*.{js,ts}",
    image: "src/assets/img/**/*.{jpg,jpeg,png,gif,svg}",
    fonts: "src/assets/fonts/**/*.{woff,woff2,ttf}",
    libsCss: "node_modules/@splidejs/splide/dist/css/*.min.css", // Отслеживание изменений
  },
};

function serverStart() {
  server.init({
    server: { baseDir: path.dist.base, mimeTypes: { woff: "font/woff", woff2: "font/woff2", ttf: "font/ttf" } },
    notify: false,
    online: true,
    snippetOptions: { rule: { fn: (snippet, match) => `<script async src="/browser-sync/browser-sync-client.js?v=3.0.4"></script>${match}` } },
  });
}

async function clean() {
  return await deleteAsync(path.dist.base);
}

function html() {
  return gulp
    .src(path.src.html)
    .pipe(plumber())
    .pipe(data(() => fs.existsSync("src/data/data.json") ? JSON.parse(readFileSync("src/data/data.json", "utf8")) : {}))
    .pipe(nunjucksRender({ path: ["src/html"] }))
    .pipe(gulp.dest(path.dist.html))
    .pipe(server.reload({ stream: true }));
}

function scss() {
  const libsStream = gulp
    .src(path.src.scss[1])
    .pipe(plumber())
    .pipe(gulpif(isDev(), sourcemaps.init()))
    .pipe(sassCompiler().on("error", sassCompiler.logError))
    .pipe(gulpif(isProd(), autoprefixer({ grid: true })))
    .pipe(gulpif(isProd(), postcss([sortMediaQueries()])))
    .pipe(gulpif(isDev(), sourcemaps.write()))
    .pipe(gulp.dest(path.dist.css + "libs"));

  const mainStream = gulp
    .src(path.src.scss[0])
    .pipe(plumber())
    .pipe(gulpif(isDev(), sourcemaps.init()))
    .pipe(sassCompiler().on("error", sassCompiler.logError))
    .pipe(gulpif(isProd(), autoprefixer({ grid: true })))
    .pipe(gulpif(isProd(), postcss([sortMediaQueries()])))
    .pipe(concat("main.css"))
    .pipe(gulpif(isDev(), sourcemaps.write()))
    .pipe(gulp.dest(path.dist.css));

  return merge(libsStream, mainStream).pipe(server.stream());
}

function copyLibsCss() {
  return gulp
    .src(path.src.libsCss)
    .pipe(plumber())
    .pipe(newer(path.dist.css + "libs")) // Копирует только новые или измененные файлы
    .pipe(gulp.dest(path.dist.css + "libs"))
    .pipe(server.reload({ stream: true }));
}

function js() {
  return gulp
    .src(path.src.js)
    .pipe(plumber())
    .pipe(webpackStream({
      mode: isProd() ? "production" : "development",
      module: { rules: [{ test: /\.ts$/, use: "ts-loader" }] },
      resolve: { extensions: [".ts", ".js"] },
      output: { filename: "app.js" },
    }, webpack))
    .pipe(gulpif(isProd(), terser()))
    .pipe(gulp.dest(path.dist.js))
    .pipe(server.reload({ stream: true }));
}

function image() {
  return gulp
    .src(path.src.image, { encoding: false })
    .pipe(plumber({ errorHandler: (err) => { console.log("Image error:", err.message); this.emit("end"); } }))
    .pipe(newer(path.dist.image))
    .pipe(gulp.dest(path.dist.image))
    .pipe(gulp.src(path.src.image.replace("svg", ""), { encoding: false }))
    .pipe(plumber({ errorHandler: (err) => { console.log("WebP error:", err.message); this.emit("end"); } }))
    .pipe(webp({ quality: 80 }))
    .pipe(gulp.dest(path.dist.image))
    .pipe(server.reload({ stream: true }));
}

function fonts() {
  return gulp
    .src(path.src.fonts, { encoding: false })
    .pipe(plumber({ errorHandler: (err) => { console.log("Font error:", err.message); this.emit("end"); } }))
    .pipe(newer(path.dist.fonts))
    .pipe(gulp.dest(path.dist.fonts))
    .pipe(server.reload({ stream: true }));
}

function watch() {
  gulp.watch(path.watch.html, html);
  gulp.watch(path.watch.data, html);
  gulp.watch(path.watch.scss, scss);
  gulp.watch(path.watch.js, js);
  gulp.watch(path.watch.image, image);
  gulp.watch(path.watch.fonts, fonts);
  gulp.watch(path.watch.libsCss, copyLibsCss); // Отслеживание изменений в libsCss
}

const build = gulp.series(clean, gulp.parallel(html, scss, js, image, fonts, copyLibsCss));
const dev = gulp.series(build, gulp.parallel(watch, serverStart));

export { build, dev };
export default dev;