const hooks = require('feathers-hooks-common');
const assetDBhooks = require('./hooks/assetDBhooks');
module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [context => assetDBhooks.updateTimeForPrice(context)],
    remove: []
  },

  after: {
    all: [],
    find: [context =>assetDBhooks.testAssetFound(context)],
    get: [],
    create: [],
    update: [],
    patch: [context =>assetDBhooks.testAssetPatched(context)],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
