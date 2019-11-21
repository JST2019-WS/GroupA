/* eslint-disable no-unused-vars */
const {NotFound, GeneralError, BadRequest} = require('@feathersjs/errors');
const fetchRecommend = require('./hooks/fetchRecommend');
const notifyRecommend = require('./hooks/notifyRecommend');

class Service {
  constructor(options) {
    this.options = options || {};
  }

  async create(data, params) {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current)));
    }
    if(!data.action){
      const badRequest = new BadRequest('No action specified');
      return Promise.reject(badRequest);
    }
    if(data.action == 'notify')
      return notifyRecommend(data,params);
    if(data.action == 'fetch')
      return fetchRecommend(data,params);
    else{
      const badRequest = new BadRequest('Unkown action');
      return Promise.reject(badRequest);
    }
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
