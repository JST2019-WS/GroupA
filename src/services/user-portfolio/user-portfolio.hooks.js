const addUserValidation = require('./hooks/addUserValidation');
const removeUserValidation = require('./hooks/removeUserValidation');
const removeUserConfirmation = require('./hooks/removeUserConfirmation');

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [addUserValidation()],
    update: [],
    patch: [],
    remove: [removeUserValidation()]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [removeUserConfirmation()]
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
