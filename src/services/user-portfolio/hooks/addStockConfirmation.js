/* eslint-disable no-unused-vars */
const {NotFound, GeneralError, BadRequest} = require('@feathersjs/errors');
const ObjectID = require('mongodb').ObjectID;

module.exports = (options = {}) => {
  return async context => {
    if (context.result.length == 0) {
      const generalError = new GeneralError('UserID-PortfolioID combination not in Database');
      return Promise.reject(generalError);
    }
    return context;
  };
};
