// import libraries
const path = require('path');
const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressHandlebars = require('express-handlebars');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const url = require('url');

const dbURL = process.env.MONGODB_URI || 'mongodb://localhost/ConfigExample';

mongoose.connect(dbURL, (err) => {
  if (err) {
    console.log('Could not connect to database');
    throw err;
  }
});

let redisURL = {
  hostname: 'localhost',
  port: 6379,
};
let redisPASS;

if (process.env.REDISCLOUD_URL) {
  redisURL = url.parse(process.env.REDISCLOUD_URL);
  redisPASS = redisURL.auth.split(':')[1];
}

// pull in our routes
const router = require('./router.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const app = express();
app.use('/assets', express.static(path.resolve(`${__dirname}../../client/`)));
app.use(compression());
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(session({
  store: new RedisStore({
    host: redisURL.hostname,
    port: redisURL.port,
    pass: redisPASS,
  }),
  secret: 'Secret Session Key',
  resave: true,
  saveUninitialized: true,
}));
app.engine('handlebars', expressHandlebars());
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/../views`);
app.use(favicon(path.resolve(`${__dirname}/../client/img/favicon.png`)));
app.use(cookieParser());

router(app);

app.listen(port, (err) => {
  if (err) {
    throw err;
  }
  console.log(`Listening on port ${port}`);
});
