/* eslint-disable no-unused-vars */
const prepareRecommend = require('./hooks/prepareRecommend');
const notifyRecommend = require('./hooks/notifyRecommend');

class Service {
  constructor(options) {
    this.options = options || {};
  }

  async create(data, params) {
    // if (Array.isArray(data)) {
    //   return Promise.all(data.map(current => this.create(current)));
    // }

    // return Promise.resolve(data);
    return notifyRecommend(data, params);
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
