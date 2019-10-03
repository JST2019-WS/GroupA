// Initializes the `user-data` service on path `/user-data`
const {UserPortfolio} = require('./user-portfolio.class');
const hooks = require('./user-portfolio.hooks');

module.exports = function (app) {

  const paginate = app.get('paginate');

  const options = {
    paginate,
    multi : true
  };

  // Initialize our service with any options it requires
  app.use('/user-portfolio', new UserPortfolio(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('user-portfolio');

  service.hooks(hooks);
};
