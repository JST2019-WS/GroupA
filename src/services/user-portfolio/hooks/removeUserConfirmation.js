/* eslint-disable no-unused-vars */
const {NotFound, GeneralError, BadRequest} = require('@feathersjs/errors');

module.exports = (options = {}) => {
  return async context => {

    if(context.result.length == 0){
      const generalError = new GeneralError('UserID not in Database');
      return Promise.reject(generalError);
    }
    return context;
  };
};
