const monitoring = require('./monitoring/monitoring.service.js');
const userPortfolio = require('./user-portfolio/user-portfolio.service');
const userData = require('./user-data/user-data.service.js');
const statistics = require('./statistics/statistics.service.js');

// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(monitoring);
  app.configure(userPortfolio);
  app.configure(userData);
  app.configure(statistics);
};
