//  app.js

let createError = require("http-errors");
let express = require("express");
const path = require("path");
let cookieParser = require("cookie-parser");
let logger = require("morgan");
let sassMiddleware = require("sass-middleware");

let indexRouter = require("./routes/index");
let usersRouter = require("./routes/users");

let app = express();

// view engine setup
app.set("views", path.join(__dirname, "pages"));
app.set("view engine", "pug");

app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

// Custom 404 handler
app.use(function (req, res, next) {
  res.status(404).render('404', {
    message: "Запрашиваемая страница не найдена",
    title: "404 - Страница не найдена",
    path: req.path || ''
  });
});
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render("error", {
    path: req.path || ''
  });
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  sassMiddleware({
    src: path.join(__dirname, "scss"), // where the sass files are
    dest: path.join(__dirname, "public/stylesheets"), // where css should go
    debug: true,
    outputStyle: "compressed",
    prefix: "/stylesheets",
  })
);

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`App listening at http://localhost:${PORT}`);
});

console.log('Application initialization complete.');

module.exports = app;
