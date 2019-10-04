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
    if (!query.userID) {
      const badRequest = new BadRequest('UserID Missing');
      return Promise.reject(badRequest);
    }
    if (!query.portfolioID) {
      const badRequest = new BadRequest('PortfolioID Missing');
      return Promise.reject(badRequest);
    }

    //Set correct query
    let userID = query.userID;
    for (let i = userID.length; i < 12; i++) {
      userID = '0' + userID;
    }

    const portfolioID = context.params.query.portfolioID;
    context.params.query = {
      '_id': new ObjectID(userID),
      'portfolios.id': portfolioID
    };

    //Set correct update method
    if (Array.isArray(context.data)) {
      const assetsLength = context.data.length;
      for (let i = 0; i < assetsLength; i++) {
        context.data[i].created_at = new Date();
      }
      context.data = {$push: {'portfolios.$.assets': {$each: context.data}}};
    } else {
      context.data.created_at = new Date();
      context.data = {$push: {'portfolios.$.assets': context.data}};
    }
    return context;
  };
};
