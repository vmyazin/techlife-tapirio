const createError = require('http-errors');
const sassMiddleware = require('node-sass-middleware');
const express = require('express');
const app = express();
const basicConfig = require('./app.config')
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

basicConfig(app);

app.use(sassMiddleware({
  src: __dirname + '/scss', //where the sass files are 
  dest: __dirname + '/public/stylesheets', //where css should go
  debug: true,
  indentedSyntax: false,
  outputStyle: 'compressed',
  prefix: '/stylesheets'
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
