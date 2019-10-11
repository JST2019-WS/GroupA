// Initializes the `user-portfolioDB` service on path `/user-portfolioDB`
const { UserPortfolioDB } = require('./user-portfolioDB.class');
const hooks = require('./user-portfolioDB.hooks');

module.exports = function (app) {
  
  const paginate = app.get('paginate');

  const options = {
    paginate,
    multi : true
  };

  // Initialize our service with any options it requires
  app.use('/user-portfolioDB', new UserPortfolioDB(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('user-portfolioDB');

  service.hooks(hooks);
};
