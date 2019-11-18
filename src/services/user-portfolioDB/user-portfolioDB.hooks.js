const hooks = require('feathers-hooks-common');
const userDBHooks = require('./hooks/userDBhooks');
module.exports = {
  before: {
    all: [],
    find: [],
    get: [hooks.disallow('external')],
    create: [hooks.disallow('external')],
    update: [hooks.disallow('external')],
    patch: [hooks.disallow('external')],
    remove: [hooks.disallow('external')]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
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
