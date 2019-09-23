// Initializes the `user-data` service on path `/user-data`
const { UserData } = require('./user-data.class');
const hooks = require('./user-data.hooks');

module.exports = function (app) {
  
  const paginate = app.get('paginate');

  const options = {
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/user-data', new UserData(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('user-data');

  service.hooks(hooks);
};
