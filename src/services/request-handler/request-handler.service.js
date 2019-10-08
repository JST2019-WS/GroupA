// Initializes the `request-handler` service on path `/request-handler`
const createService = require('./request-handler.class.js');
const hooks = require('./request-handler.hooks');
const filters = require('./request-handler.filters');

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');

  const options = {
    name: 'request-handler',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/request-handler', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('request-handler');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
