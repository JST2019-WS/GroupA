const monitoring = require('./monitoring/monitoring.service.js');
const userPortfolioDB = require('./user-portfolioDB/user-portfolioDB.service.js');
const userPortfolio = require('./user-portfolio/user-portfolio.service.js');
const recommend = require('./recommend/recommend.service.js');

// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(monitoring);
  app.configure(userPortfolioDB);
  app.configure(userPortfolio);
  app.configure(recommend);
};
