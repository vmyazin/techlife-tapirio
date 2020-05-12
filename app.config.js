const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const path = require('path');

function basicConfig(app, options = {}) {
    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    // view engine setup
    app.set('views', path.join(__dirname, 'pages'));
    app.set('view engine', 'pug');
    app.use(express.static(path.join(__dirname, options.public ? options.public : 'public')));
}

module.exports = basicConfig;
