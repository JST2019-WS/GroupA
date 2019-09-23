// Initializes the `monitoring` service on path `/monitoring`
const { Monitoring } = require('./monitoring.class');
const hooks = require('./monitoring.hooks');

module.exports = function (app) {
  
  const paginate = app.get('paginate');

  const options = {
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/monitoring', new Monitoring(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('monitoring');

  service.hooks(hooks);
};
