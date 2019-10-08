// Initializes the `wso` service on path `/wso`
const { Wso } = require('./wso.class');
const hooks = require('./wso.hooks');

module.exports = function (app) {
  
  const paginate = app.get('paginate');

  const options = {
    paginate,
    multi : true
  };

  // Initialize our service with any options it requires
  app.use('/wso', new Wso(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('wso');

  service.hooks(hooks);
};
