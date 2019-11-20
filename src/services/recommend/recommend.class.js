/* eslint-disable no-unused-vars */
const fetchRecommend = require('./hooks/fetchRecommend');

class Service {
  constructor(options) {
    this.options = options || {};
  }

  async create(data, params) {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current)));
    }

    return fetchRecommend(data, params);
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
