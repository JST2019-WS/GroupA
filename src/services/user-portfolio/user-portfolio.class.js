/* eslint-disable no-unused-vars */
const handleRequest = require('./hooks/handleRequest');

class Service {
  constructor(options) {
    this.options = options || {};
  }

  async create(data, params) {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current)));
    }
    return handleRequest(data, params);
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
