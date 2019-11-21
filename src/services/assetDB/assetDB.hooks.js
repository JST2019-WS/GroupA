const hooks = require('feathers-hooks-common');
const assetDBhooks = require('./hooks/assetDBhooks');
module.exports = {
  before: {
    all: [],
    find: [context => assetDBhooks.testSecurityKey(context)],
    get: [hooks.disallow('external')],
    create: [hooks.disallow('external')],
    update: [hooks.disallow('external')],
    patch: [hooks.disallow('external'), context => assetDBhooks.updateTimeForPrice(context)],
    remove: [hooks.disallow('external')]
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
