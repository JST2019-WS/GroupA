/* eslint-disable no-unused-vars */
const {NotFound, GeneralError, BadRequest} = require('@feathersjs/errors');
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

  async patch(id, data, params) {
    const app = require('../../app');
    const record = {'service': 'userPortfolio', 'action': 'updateSecurityKey'};
    const saveMonitoringRecord = require('../../helper/saveMonitoringRecord');

    if (data.oldKey === undefined) {
      saveMonitoringRecord.saveRecord(record, false, 'Missing oldKey field!');
      return new BadRequest('Missing oldKey field!');
    }
    if (data.oldKey !== process.env.WSO_SECURITY_KEY) {
      saveMonitoringRecord.saveRecord(record, false, 'Wrong oldKey!');
      return new BadRequest('Wrong oldKey!');
    }
    if (data.newKey === undefined) {
      saveMonitoringRecord.saveRecord(record, false, 'Missing newKey field!');
      return new BadRequest('Missing newKey field!');
    }

    let success = false;
    let fs = require('fs');
    fs.readFile('.env', 'utf8', function (err, fileData) {
      success = err;
      if (err) {
        console.log(err);
      } else {
        let result = fileData.replace('WSO_SECURITY_KEY=\'' + data.oldKey + '\'', 'WSO_SECURITY_KEY=\'' + data.newKey + '\'');
        fs.writeFile('.env', result, 'utf8', function (err) {
          process.env.WSO_SECURITY_KEY = data.newKey;
          success = err;
          if (err) return console.log(err);
        });
      }
    });

    if(success){
      saveMonitoringRecord.saveRecord(record, false, 'An Error occurred while saving the new Key!');
      return new BadRequest('An Error occurred while saving the new Key!');
    }
    else{
      saveMonitoringRecord.saveRecord(record, true, 'Updated securityKey!');
      return Promise.resolve('Updated securityKey!');
    }
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
