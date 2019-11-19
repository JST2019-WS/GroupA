// Initializes the `user-portfolioDB` service on path `/user-portfolioDB`
const { AssetDB } = require('./assetDb.class');
const hooks = require('./assetDB.hooks');

module.exports = function (app) {

  const paginate = app.get('paginate');

  const options = {
    paginate,
    multi : true
  };

  // Initialize our service with any options it requires
  app.use('/assetDB', new AssetDB(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('assetDB');

  service.hooks(hooks);
};
