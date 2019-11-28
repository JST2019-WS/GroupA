const runner = require('./risk-indicator-aggregation');
const csv = require('csvtojson');
const path = require('path');

const myPath = path.join(__dirname, 'risk-indicators/security-type-pack/all-securities.csv');

module.exports = {
  calculateRiskValues: async () => {
    const securities = await csv().fromFile(myPath);
    const app = require('../app');
    const assetDBService = app.service('assetDB');
    for (let sec of securities) {
      runner.aggregateRiskValue(sec.isin, res => {
        // Store res in db
        assetDBService.setRiskValue(sec.isin, res);
      });
    }
  }
};



