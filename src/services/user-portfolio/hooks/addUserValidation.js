/* eslint-disable no-unused-vars */
const {NotFound, GeneralError, BadRequest} = require('@feathersjs/errors');
const ObjectID = require('mongodb').ObjectID;

module.exports = (options = {}) => {
  return async context => {
    const app = require('./../../../app');
    const id = app.get('wsoIdentification');
    const data = context.data;

    //Rejection due to bad requests
    if (context.params.query.identification != id) {
      const badRequest = new BadRequest('Wrong Identification');
      return Promise.reject(badRequest);
    }
    if (!data.user.id) {
      const badRequest = new BadRequest('UserID field is missing');
      return Promise.reject(badRequest);
    }

    //Add potentially missing fields
    if (!data.portfolios) {
      data.portfolios = [];
    }
    const portfolioLength = data.portfolios.length;
    for (let i =0; i< portfolioLength; i++) {
      if (!data.portfolios[i].assets) {
        data.portfolios[i].assets = [];
      }
    }

    //create unique identification from userID
    let userID = data.user.id;
    for (let i = userID.length; i < 12; i++) {
      userID = '0' + userID;
    }
    data._id = new ObjectID(userID);

    return context;
  };
};
