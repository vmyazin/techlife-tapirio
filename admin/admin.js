const routes = require('./routes');
const path = require('path');
const express = require('express');
const app = express();
const basicConfig = require('./../app.config')

basicConfig(app);

app.use('/', routes);
app.set('views', path.join(__dirname, 'pages'));


module.exports = app;
