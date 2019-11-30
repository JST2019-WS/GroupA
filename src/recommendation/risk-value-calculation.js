//const runner = require('./risk-indicator-aggregation');
const csv = require('csvtojson');
const path = require('path');

//const myPath = path.join(__dirname, 'risk-indicators/security-type-pack/all-securities.csv');
const myPath = path.join(__dirname, 'risk-values.csv');

module.exports = {
  calculateRiskValues: async () => {
    const securities = await csv().fromFile(myPath);
    const app = require('../app');
    const assetDBService = app.service('assetDB');
    for (let sec of securities) {
      // Store res in db
      assetDBService.setRiskValue(sec.isin, sec.risk_value).catch(error => console.log(error));
    }
  }
};



