const monitoring = require('./monitoring/monitoring.service.js');
const wso = require('./wso/wso.service.js');
const userData = require('./user-data/user-data.service.js');
const statistics = require('./statistics/statistics.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(monitoring);
  app.configure(wso);
  app.configure(userData);
  app.configure(statistics);
};
