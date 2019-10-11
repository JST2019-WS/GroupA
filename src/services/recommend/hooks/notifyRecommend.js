/*eslint-disable no-unused-vars, no-case-declarations*/
const {NotFound, GeneralError, BadRequest} = require('@feathersjs/errors');
const createMongoID = require('../../../helper/createMongoID');

module.exports =
  async (data, params) => {

    //validate
    if (!data.userId) {
      const badRequest = new BadRequest('UserId missing');
      return Promise.reject(badRequest);
    }

    if (isNaN(data.userId)) {
      const badRequest = new BadRequest('UserId is not a number');
      return Promise.reject(badRequest);
    }

    const id = createMongoID.createUserID(data.userId);

    if (!data.choice) {
      const badRequest = new BadRequest('Choice missing');
      return Promise.reject(badRequest);
    }

    const choice = data.choice;

    if (!choice.name) {
      const badRequest = new BadRequest('Choice missing');
      return Promise.reject(badRequest);
    }

    if (!choice.url) {
      const badRequest = new BadRequest('Choice url missing');
      return Promise.reject(badRequest);
    }

    if (!choice.isin) {
      const badRequest = new BadRequest('Choice isin missing');
      return Promise.reject(badRequest);
    }

    if (!choice.category) {
      const badRequest = new BadRequest('Choice category missing');
      return Promise.reject(badRequest);
    }

    if (!choice.category.name) {
      const badRequest = new BadRequest('Category name missing');
      return Promise.reject(badRequest);
    }

    if (!choice.category.url) {
      const badRequest = new BadRequest('Category url missing');
      return Promise.reject(badRequest);
    }

    if (!choice.value) {
      const badRequest = new BadRequest('Choice value missing');
      return Promise.reject(badRequest);
    }

    if (isNaN(choice.value)) {
      const badRequest = new BadRequest('Choice value is not a number');
      return Promise.reject(badRequest);
    }

    if (!choice.absolute) {
      const badRequest = new BadRequest('Choice absolute missing');
      return Promise.reject(badRequest);
    }

    if (isNaN(choice.absolute)) {
    }

    if (!choice.relative) {
      const badRequest = new BadRequest('Choice relative missing');
      return Promise.reject(badRequest);
    }

    if (isNaN(choice.relative)) {
      const badRequest = new BadRequest('Choice relative is not a number');
      return Promise.reject(badRequest);
    }

    if (!choice.updated_at) {
      const badRequest = new BadRequest('Choice update_at missing');
      return Promise.reject(badRequest);
    }

    if (!choice.currency) {
      const badRequest = new BadRequest('Choice currency missing');
      return Promise.reject(badRequest);
    }

    if (!choice.exchange) {
      const badRequest = new BadRequest('Choice exchange missing');
      return Promise.reject(badRequest);
    }

    if (!choice.volume) {
      const badRequest = new BadRequest('Choice volume missing');
      return Promise.reject(badRequest);
    }

    if (isNaN(choice.volume)) {
      const badRequest = new BadRequest('Choice volume is not a number');
      return Promise.reject(badRequest);
    }

    if (!data.offered) {
      const badRequest = new BadRequest('Offered missing');
      return Promise.reject(badRequest);
    }

    const app = require('../../../app');
    const dbService = app.service('user-portfolioDB'); //change this to portfolio service

    //replace this with a method from the portfolio services
    //if the user is found, add the choice to his list of choices, return message:
    //{user} selection ({stock.name}: {stock.id}) acknowledged
    //if user is not found, return: {user} not found
    const result = null; //TODO here
    return result;

  };
