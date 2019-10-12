/*eslint-disable no-unused-vars, no-case-declarations*/

const {NotFound, GeneralError, BadRequest} = require('@feathersjs/errors');
const createMongoID = require('../../../helper/createMongoID');
const saveMonitoringRecord = require('../../../helper/saveMonitoringRecord');

module.exports =
  async (raw_id, params) => {
    //console.log(params.query.portfolio) //this is the portfolio
    // console.log(data) //data is the id

    const monitoringRecord = {'service': 'recommend', 'action': 'prepareRecommend'};
    //validate
    const id = createMongoID.createUserID(raw_id);

    // console.log(id)
    if (!params.query.portfolio) {
      const badRequest = new BadRequest('No portfolio specified');
      saveMonitoringRecord.saveRecord(monitoringRecord, false, 'No portfolio specified');
      return Promise.reject(badRequest);
    }

    const portfolio = params.query.portfolio;

    if (isNaN(portfolio)) {
      const badRequest = new BadRequest('Illegal portfolio id');
      saveMonitoringRecord.saveRecord(monitoringRecord, false, 'Illegal portfolio id');
      return Promise.reject(badRequest);
    }

    //this takes the userid and portfolioid
    const outObject = new Object;
    outObject.id = id;
    outObject.portfolio = portfolio;

    //delegate to machine learning subsystem here, using outObject
    //TODO

    //dummy return object
    const dummy = new Object;
    dummy.name = 'Commerzbank';
    dummy.url = 'https://www.wallstreet-online.de/aktien/commerzbank-aktie';
    dummy.isin = 'US0378331005';
    dummy.category = new Object;
    dummy.category.name = 'Banken';
    dummy.category.url = 'https://www.wallstreet-online.de/aktien/branche/banken-aktien';
    dummy.value = 5.249;
    dummy.absolute = -0.066;
    dummy.relative = -1.24;
    dummy.updated_at = '2019-09-27T08:00:00Z';
    dummy.currency = 'EUR';
    dummy.exchange = 'ETR';
    dummy.volume = 16182197;

    // console.log(dummy)


    saveMonitoringRecord.saveRecord(monitoringRecord, true, '');//ToDo: add description
    // return context
    return dummy;
  };

