const addUserValidation = require('./hooks/addUserValidation');
const removeUserValidation = require('./hooks/removeUserValidation');
const removeUserConfirmation = require('./hooks/removeUserConfirmation');
const addStockValidation = require('./hooks/addStockValidation');
const addStockConfirmation = require('./hooks/addStockConfirmation');

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [addUserValidation()],
    update: [],
    patch: [addStockValidation()],
    remove: [removeUserValidation()]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [addStockConfirmation()],
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
