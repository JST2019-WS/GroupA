// Initializes the `recommend` service on path `/recommend`
const createService = require('./recommend.class.js');
const hooks = require('./recommend.hooks');
const filters = require('./recommend.filters');

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');

  const options = {
    name: 'recommend',
    paginate,
    multi: true
  };

  // Initialize our service with any options it requires
  app.use('/recommend', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('recommend');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
