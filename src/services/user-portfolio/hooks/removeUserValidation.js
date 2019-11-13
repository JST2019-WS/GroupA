/* eslint-disable no-unused-vars */
const {NotFound, GeneralError, BadRequest} = require('@feathersjs/errors');
const ObjectID = require('mongodb').ObjectID;

module.exports = (options = {}) => {
  return async context => {
    const app = require('./../../../app');
    const id = app.get('wsoIdentification');
    const query = context.params.query;

    //Rejection due to bad requests
    if (query.identification != id) {
      const badRequest = new BadRequest('Wrong Identification');
      return Promise.reject(badRequest);
    }
    if(!query.userID){
      const badRequest = new BadRequest('UserID Missing');
      return Promise.reject(badRequest);
    }

    //create unique identification from userID
    let userID = query.userID;
    for (let i = userID.length; i < 12; i++) {
      userID = '0' + userID;
    }
    context.params.query = { '_id' : new ObjectID(userID)};
    return context;
  };
};
