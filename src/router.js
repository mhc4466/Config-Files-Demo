// import the controller folder (automatically calls the index.js file)
const controllers = require('./controllers');

const router = (app) => {
  app.get('/', controllers.returnPage);
};

module.exports = router;
