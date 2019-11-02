// Initializes the `assets` service on path `/assets`
const createService = require('feathers-mongodb');
const hooks = require('./assets.hooks');
const filters = require('./assets.filters');
const socket = require('./socket')

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');
  const mongoClient = app.get('mongoClient');
  const options = { paginate };

  // Initialize our service with any options it requires
  app.use('/assets', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('assets');

  mongoClient.then(db => {
    service.Model = db.collection('assets');
  });

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
  //netcat socket here
  const Socket = socket();
  // console.log(Socket.getClients())
};
