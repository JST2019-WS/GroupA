const {NotFound, GeneralError, BadRequest} = require('@feathersjs/errors');
const saveMonitoringRecord = require('../../../helper/saveMonitoringRecord');

module.exports = {

  testSecurityKey: (context) => {
    if(context.params.query.securityKey === undefined) {
      return Promise.reject(new BadRequest(('No securityKey field!')));
    }
    if(context.params.query.securityKey.toString() != process.env.WSO_SECURITY_KEY) {
      return Promise.reject(new BadRequest(('Wrong securityKey!')));
    }

    delete context.params.query.securityKey;
  },
  //updates time field when price is updated
  updateTimeForPrice: (context) => {
    if (context.data.price !== undefined) {
      context.data.date_time = new Date();
    }
  },

  //returns error when no asset with isin is found
  testAssetFound: (context) => {
    if (context.result.total == 0) {
      const badRequest = new BadRequest('Could not find Asset with Isin ' + context.params.query.isin + ' in Database');
      return Promise.reject(badRequest);
    }
  },

  //returns error when no asset with isin is found
  testAssetPatched: (context) => {
    if (context.result.length == 0) {
      const badRequest = new BadRequest('Could not Update Asset with Isin ' + context.params.query.isin + ' in Database');
      saveMonitoringRecord.saveRecord({'service': 'assetDB', 'action': 'patch'}, false, 'Could not Update Asset with Isin ' + context.params.query.isin + ' in Database');
      return Promise.reject(badRequest);
    }
    else{
      const update = context.data;
      if(update.date_time !== undefined)
        delete update.date_time;
      saveMonitoringRecord.saveRecord({'service': 'assetDB', 'action': 'patch'}, true, 'Updated asset with Isin ' + context.params.query.isin + ':\n' + JSON.stringify(context.data));
    }
  }
};