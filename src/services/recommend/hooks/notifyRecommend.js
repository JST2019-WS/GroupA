/*eslint-disable no-unused-vars, no-case-declarations*/
const {NotFound, GeneralError, BadRequest} = require('@feathersjs/errors');
const createMongoID = require('../../../helper/createMongoID');
const saveMonitoringRecord = require('../../../helper/saveMonitoringRecord');

module.exports =
  async (data, params) => {
    const monitoringRecord = {'service': 'recommend', 'action': 'notifyRecommend'};
    const app = require('../../../app');
    //validate

    const securityKey = process.env.WSO_SECURITY_KEY;
    if (!data.securityKey || data.securityKey !== securityKey) {
      const badRequest = new BadRequest('Security Key missing or wrong. Key: ' + data.securityKey);
      saveMonitoringRecord.saveRecord(monitoringRecord, false, 'Security Key missing or wrong. Key: ' + data.securityKey);
      return Promise.reject(badRequest);
    }


    if (!data.userId) {
      const badRequest = new BadRequest('UserId missing');
      saveMonitoringRecord.saveRecord(monitoringRecord, false, 'UserId missing');
      return Promise.reject(badRequest);
    }
    const id = createMongoID.createUserID(data.userId.toString());

    if(!data.assetId){
      const badRequest = new BadRequest('AssetId missing');
      saveMonitoringRecord.saveRecord(monitoringRecord, false, 'AssetId missing');
      return Promise.reject(badRequest);
    }

    //Create clickData and save it in database
    const clickType = data.clickType ? data.clickType.toString() : '0';
    const dbService = app.service('user-portfolioDB'); //change this to portfolio service
    const clickData = {
      'assetId' : data.assetId.toString(),
      'clickType' : clickType,
      'date' : new Date()
    };
    const update = { $push : {'clickedRecommendations' : clickData}};
    const result = await dbService.patch(id, update, null);
    saveMonitoringRecord.saveRecord(monitoringRecord, true, 'User ' + data.userId + ' clicked on Asset ' + data.assetId);

    return result;

  };

