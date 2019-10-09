/* eslint-disable no-unused-vars */
const prepareRecommend = require('./hooks/prepareRecommend')
const notifyRecommend = require('./hooks/notifyRecommend')

class Service {
  constructor (options) {
    this.options = options || {};
  }

  find (params) {
    return Promise.resolve([]);
  }

  async get (id, params) {
    // return Promise.resolve({
      // id, text: `A new message with ID: ${id}!`
    //   params
    // });
    return prepareRecommend(id,params)
  }

  async create (data, params) {
    // if (Array.isArray(data)) {
    //   return Promise.all(data.map(current => this.create(current)));
    // }

    // return Promise.resolve(data);
    return notifyRecommend(data,params)
  }

  update (id, data, params) {
    return Promise.resolve(data);
  }

  patch (id, data, params) {
    return Promise.resolve(data);
  }

  remove (id, params) {
    return Promise.resolve({ id });
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
