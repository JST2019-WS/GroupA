/*eslint-disable no-unused-vars, no-case-declarations*/
//require statement to WSO / User portfolio service here
const {NotFound, GeneralError, BadRequest} = require('@feathersjs/errors');
const createMongoID = require('../../../helper/createMongoID');
const saveMonitoringRecord = require('../../../helper/saveMonitoringRecord');

//Helper Method
function prepBadResponse(record, msg){
  const badRequest = new BadRequest(msg);
  saveMonitoringRecord.saveRecord(record, false, msg);
  return Promise.reject(badRequest);
}



function checkAsset(asset) {
  if (!asset.instrumentId || !asset.isin || !asset.name ||
    !asset.positionId || !asset.quantity || !asset.type)
    return false;

  if (isNaN(asset.instrumentId) || isNaN(asset.positionId) ||
    isNaN(asset.quantity))
    return false;

  asset.instrumentId = String(asset.instrumentId);

  return true;

}

//Helper: adds recommend (int[]) / resets it to a portfolio
function setRecommend(portfolio){
  portfolio.recommend = new Array();
}

module.exports =
  async (data, params) => {

    const app = require('../../../app');
    const dbService = app.service('user-portfolioDB');

    //catch: request contains correct security key
    if (!data.securityKey || data.securityKey !== app.get('wsoSecurityKey')) {
      const badRequest = new BadRequest('Security Key missing or wrong. Key: ' + data.securityKey);
      saveMonitoringRecord.saveRecord({'service': 'userPortfolio', 'action': (data.action ? data.action : 'none')}, false, 'Security Key missing or wrong. Key: ' + data.securityKey);
      return Promise.reject(badRequest);
    }
    delete data.securityKey;
    //catch: request contains no action field
    if (!data.action) {
      const badRequest = new BadRequest('No action specified');
      saveMonitoringRecord.saveRecord({'service': 'userPortfolio', 'action': 'none'}, false, 'No action field!');
      return Promise.reject(badRequest);
    }


    const action = data.action;
    delete data.action; //remove data.action Field

    const monitoringRecord = {'service': 'userPortfolio', 'action': action};

    //check general requirements(for all actions) and define mongoUserID
    let mongoUserID = '';
    let userID = '';
    if (data.user) {
      if (!data.user.id)
        return prepBadResponse(monitoringRecord, 'No user ID specified');
      if (isNaN(data.user.id))//case ignores submissions like 1e10000
        return prepBadResponse(monitoringRecord, 'User id is not a number');
      userID = data.user.id = data.user.id.toString();
      mongoUserID = createMongoID.createUserID(data.user.id); //mongoDB id used to identify user
    } else {
      if (!data.userId)
        return prepBadResponse(monitoringRecord, 'No user ID specified');
      if (isNaN(data.userId))//case ignores submissions like 1e10000
        return prepBadResponse(monitoringRecord, 'User id is not a number');
      userID = data.userId = data.userId.toString();
      mongoUserID = createMongoID.createUserID(data.userId); //mongoDB id used to identify user
    }

    //handle request based on action:
    switch (action) {
    case 'createUser': {
      if (!data.user.name) {
        const badRequest = new BadRequest('No user name specified');
        saveMonitoringRecord.saveRecord(monitoringRecord, false, 'No user name specified');
        return Promise.reject(badRequest);
      }
      data._id = mongoUserID;
      //Create correct createUserRequest
      const result = await dbService.create(data, null);
      saveMonitoringRecord.saveRecord(monitoringRecord, true, 'Created user-portfolio for user ' + userID);
      return Promise.resolve(result);
    }
    case 'removeUser': {
      const result = await dbService.remove(mongoUserID, null);
      saveMonitoringRecord.saveRecord(monitoringRecord, true, 'Removed user-portfolio of user ' + userID);
      return Promise.resolve(result);
    }
    case 'updateUser': {
      delete data.user.id;
      let result = null;
      const entries = Object.entries(data.user);
      for (let [key, value] of entries) {
        const fullKey = 'user.' + [key];
        const update = {$set: {[fullKey]: value}};
        result = await Promise.resolve(dbService.patch(mongoUserID, update, null));
        saveMonitoringRecord.saveRecord(monitoringRecord, true, 'Updated ' + key + ' field of user ' + userID + ' to: ' + value);
      }
      if (result == null) {
        result = prepBadResponse(monitoringRecord, 'No user updates in data found');
      }

      return result;
    }
    case 'addPortfolio': {

      if (!data.portfolio)
        return prepBadResponse(monitoringRecord, 'No portfolio specified');
      if (!data.portfolio.id)
        return prepBadResponse(monitoringRecord, 'No portfolio id specified');
      if (isNaN(data.portfolio.id))
        return prepBadResponse(monitoringRecord, 'Portfolio id is not a number');
      data.portfolio.id = String(data.portfolio.id);
      if (!data.portfolio.name)
        return prepBadResponse(monitoringRecord, 'Portfolio name not specified');

      //sets the recommend array for the portfolio
      setRecommend(data.portfolio);

      const update = {$addToSet: {'portfolios': data.portfolio}};
      const validation = await Promise.resolve(dbService.get(mongoUserID, null));
      //Test for duplicate portfolioIds
      if(validation.portfolios) {
        for (let portfolio of validation.portfolios) {
          if (portfolio.id == data.portfolio.id) {
            const badRequest = new BadRequest('User already has portfolio with that ID');
            badRequest.errors.userPortfolio = validation;

            const monitoringDesc = 'Tried to add portfolio, but user ' + userID + 'did already have a portfolio with id:' + data.portfolio.id;
            saveMonitoringRecord.saveRecord(monitoringRecord, false, monitoringDesc);
            return Promise.reject(badRequest);
          }
        }
      }
      saveMonitoringRecord.saveRecord(monitoringRecord, true, 'Added portfolio ' + data.portfolio.id + ' to user ' + userID);
      return Promise.resolve(dbService.patch(mongoUserID, update, null));
    }
    case 'removePortfolio': {
      if (!data.portfolioId)
        return prepBadResponse(monitoringRecord, 'No portfolio id specified');
      if (isNaN(data.portfolioId))
        return prepBadResponse(monitoringRecord, 'Portfolio id is not a number');
      data.portfolioId = String(data.portfolioId);

      const update = {$pull: {'portfolios': {'id': data.portfolioId}}};
      const validation = await Promise.resolve(dbService.get(mongoUserID, null));
      const result = await Promise.resolve(dbService.patch(mongoUserID, update, null));
      //test if an entry was removed
      if (!validation.portfolios || validation.portfolios.length == result.portfolios.length) {
        const badRequest = new BadRequest('User did not have portfolio with that ID');
        badRequest.errors.userPortfolio = result;
        const monitoringDesc = 'Tried to remove portfolio, but user ' + userID + ' did not have portfolio with id: ' + data.portfolioId;
        saveMonitoringRecord.saveRecord(monitoringRecord, false, monitoringDesc);
        return Promise.reject(badRequest);
      } else {
        saveMonitoringRecord.saveRecord(monitoringRecord, true, 'Removed portfolio ' + data.portfolioId + ' from user ' + userID);
        return result;
      }
    }

    case 'addPortfolioAsset': {
      if (!data.portfolioId)
        return prepBadResponse(monitoringRecord, 'No portfolio id specified');
      if (isNaN(data.portfolioId))
        return prepBadResponse(monitoringRecord, 'Portfolio id is not a number');
      data.portfolioId = String(data.portfolioId);
      if (!data.asset)
        return prepBadResponse(monitoringRecord, 'Asset not specified');
      if (!checkAsset(data.asset))
        return prepBadResponse(monitoringRecord, 'Asset not formatted correctly');

      const params = {};
      params.query = {'portfolios.id': data.portfolioId};
      const update = {$addToSet: {'portfolios.$.assets': data.asset}};
      const validation = await Promise.resolve(dbService.get(mongoUserID, null));

      const validationPortfolio = await validation.portfolios.find(
        (portfolio) => {
          return portfolio.id == data.portfolioId;
        });

      //test for duplicate assetIDs in the portfolio
      if (validationPortfolio.assets) {
        for (let i = 0; i < validationPortfolio.assets.length; i++) {
          if (validationPortfolio.assets[i].instrumentId == data.asset.instrumentId) {
            const badRequest = new BadRequest('Portfolio of User has already an Asset with that ID');
            badRequest.errors.userPortfolio = validation;
            const monitoringDesc = 'Tried to add asset to portfolio ' + data.portfolioId + ' of user ' + userID + ', but an asset already exists with id: ' + data.asset.instrumentId;
            saveMonitoringRecord.saveRecord(monitoringRecord, false, monitoringDesc);
            return Promise.reject(badRequest);
          }
        }
      }

      //reset recommend of that portfolio
      const interParams = {};
      interParams.query = {'portfolios.id': data.portfolioId};
      const interUpdate = {$set: {'portfolios.$.recommend': new Array()}};
      const resetRecommend = await Promise.resolve(dbService.patch(mongoUserID, interUpdate, interParams));

      const monitoringDesc = 'Added asset to portfolio ' + data.portfolioId + ' of user ' + userID + ' with instrumentId: ' + data.asset.instrumentId;
      saveMonitoringRecord.saveRecord(monitoringRecord, true, monitoringDesc);
      return Promise.resolve(dbService.patch(mongoUserID, update, params));
    }

    case 'removePortfolioAsset': {
      if (!data.portfolioId)
        return prepBadResponse(monitoringRecord, 'No portfolio id specified');
      if (isNaN(data.portfolioId))
        return prepBadResponse(monitoringRecord, 'Portfolio id is not a number');
      data.portfolioId = String(data.portfolioId);
      if (!data.assetId)
        return prepBadResponse(monitoringRecord, 'Asset id not specified');
      if (isNaN(data.assetId))
        return prepBadResponse(monitoringRecord, 'Asset id is not a number');
      data.assetId = String(data.assetId);

      const params = {};
      params.query = {'portfolios.id': data.portfolioId};
      const update = {$pull: {'portfolios.$.assets': {'instrumentId': data.assetId}}};
      const validation = await Promise.resolve(dbService.get(mongoUserID, null));
      const result = await Promise.resolve(dbService.patch(mongoUserID, update, params));
      const validationPortfolio = await validation.portfolios.find(
        (portfolio) => {
          return portfolio.id == data.portfolioId;
        });

      const resultPortfolio = await result.portfolios.find(
        (portfolio) => {
          return portfolio.id == data.portfolioId;
        });

      //test if an asset was removed
      if (!validationPortfolio.assets || validationPortfolio.assets.length == resultPortfolio.assets.length) {
        const badRequest = new BadRequest('User-Portfolio did not have Asset with that ID');
        badRequest.errors.userPortfolio = result;
        const monitoringDesc = 'Tried to remove asset from portfolio ' + data.portfolioId + ' of user ' + userID + ', but no asset exists with id: ' + data.assetId;
        saveMonitoringRecord.saveRecord(monitoringRecord, false, monitoringDesc);

        return Promise.reject(badRequest);
      } else {

        //reset recommend of that portfolio
        const interParams = {};
        interParams.query = {'portfolios.id': data.portfolioId};
        const interUpdate = {$set: {'portfolios.$.recommend': new Array()}};
        const resetRecommend = await Promise.resolve(dbService.patch(mongoUserID, interUpdate, interParams));

        const monitoringDesc = 'Removed asset from portfolio ' + data.portfolioId + ' of user ' + userID + ' with instrumentId: ' + data.assetId;
        saveMonitoringRecord.saveRecord(monitoringRecord, true, monitoringDesc);
        return result;
      }
    }

    case'resetPortfolioRecommend': {
      
      if (!data.portfolioId)
        return prepBadResponse(monitoringRecord, 'No portfolio id specified');
      if (isNaN(data.portfolioId))
        return prepBadResponse(monitoringRecord, 'Portfolio id is not a number');
      data.portfolioId = String(data.portfolioId);

      
      const params = {};
      params.query = {'portfolios.id': data.portfolioId};
      const update = {$set: {'portfolios.$.recommend': new Array()}};
      
      //missing validations?
      const result = await Promise.resolve(dbService.patch(mongoUserID, update, params));

      const monitoringDesc = 'Reset recommend of Portfolio ' + data.portfolioId + ' of user ' + userID;
      saveMonitoringRecord.saveRecord(monitoringRecord, true, monitoringDesc);
      return result;

    }

    case'pushPortfolioRecommend':{

      if (!data.portfolioId)
        return prepBadResponse(monitoringRecord, 'No portfolio id specified');
      if (isNaN(data.portfolioId))
        return prepBadResponse(monitoringRecord, 'Portfolio id is not a number');
      data.portfolioId = String(data.portfolioId);
      if(!data.value)
        return prepBadResponse(monitoringRecord, 'No value specified');
      if(isNaN(data.value))
        return prepBadResponse(monitoringRecord, 'Value is not a number');


      const params = {};
      params.query = {'portfolios.id': data.portfolioId};
      const update = {$push: {'portfolios.$.recommend': data.value}};

      

      //missing validations?
      const result = await Promise.resolve(dbService.patch(mongoUserID, update, params));



      const monitoringDesc = 'Pushed ' + data.value + ' to recommend of Portfolio ' + data.portfolioId + ' of user ' + userID;
      saveMonitoringRecord.saveRecord(monitoringRecord, true, monitoringDesc);
      return result;

    }

    case'setPortfolioRecommend':{

      if (!data.portfolioId)
        return prepBadResponse(monitoringRecord, 'No portfolio id specified');
      if (isNaN(data.portfolioId))
        return prepBadResponse(monitoringRecord, 'Portfolio id is not a number');
      data.portfolioId = String(data.portfolioId);
      if(!data.values)
        return prepBadResponse(monitoringRecord, 'No array of values specified');
      if(!Array.isArray(data.values))
        return prepBadResponse(monitoringRecord, 'Values is not an Array');
      for(var i = 0; i < data.values.length; i++){
        if(isNaN(data.values[i]))
          return prepBadResponse(monitoringRecord, 'An element of values is not a number');
        else
          data.values[i] = Number(data.values[i]);
      }


      const params = {};
      params.query = {'portfolios.id': data.portfolioId};
      const update = {$set: {'portfolios.$.recommend': data.values}};

      //missing validations?
      const result = await Promise.resolve(dbService.patch(mongoUserID, update, params));

      const monitoringDesc = 'Set recommend of Portfolio ' + data.portfolioId + ' to ' + data.values + ' of user ' + userID;
      saveMonitoringRecord.saveRecord(monitoringRecord, true, monitoringDesc);
      return result;

    }

    //returns user
    case 'getUser':{
      return await Promise.resolve(dbService.get(mongoUserID,null));
    }

    default:
      const badRequest = new BadRequest('Unknown action');
      saveMonitoringRecord.saveRecord(monitoringRecord, false, 'Unknown action!');
      return Promise.reject(badRequest);
    }
  };
