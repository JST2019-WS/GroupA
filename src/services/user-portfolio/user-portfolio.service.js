// Initializes the `user-portfolio` service on path `/user-portfolio`
const createService = require('./user-portfolio.class.js');
const hooks = require('./user-portfolio.hooks');
const filters = require('./user-portfolio.filters');

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');

  const options = {
    name: 'user-portfolio',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/user-portfolio', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('user-portfolio');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
