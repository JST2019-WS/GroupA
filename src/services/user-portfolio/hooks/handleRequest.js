/*eslint-disable no-unused-vars, no-case-declarations*/
//require statement to WSO / User portfolio service here
const {NotFound, GeneralError, BadRequest} = require('@feathersjs/errors');
const createMongoID = require('../../../helper/createMongoID');
const saveMonitoringRecord = require('../../../helper/saveMonitoringRecord');

//Helper Methods
function noUser() {
  const badRequest = new BadRequest('No user specified');
  return Promise.reject(badRequest);
}

function noId() {
  const badRequest = new BadRequest('No user id specified');
  return Promise.reject(badRequest);
}

function noUpdates() {
  const badRequest = new BadRequest('No user updates in data found');
  return Promise.reject(badRequest);
}

function idIsNan() {
  const badRequest = new BadRequest('User id is not a number');
  return Promise.reject(badRequest);
}

function noPortfolio() {
  const badRequest = new BadRequest('No portfolio specified');
  return Promise.reject(badRequest);
}

function noPortfolioId() {
  const badRequest = new BadRequest('No portfolio id specified');
  return Promise.reject(badRequest);
}

function portfIdIsNan() {
  const badRequest = new BadRequest('Portfolio id is not a number');
  return Promise.reject(badRequest);
}

function noPortfName() {
  const badRequest = new BadRequest('Portfolio name not specified');
  return Promise.reject(badRequest);
}

function noAsset() {
  const badRequest = new BadRequest('Asset not specified');
  return Promise.reject(badRequest);
}

function assetFormat() {
  const badRequest = new BadRequest('Asset not formatted correctly');
  return Promise.reject(badRequest);
}

function noAssetId() {
  const badRequest = new BadRequest('Asset id not specified');
  return Promise.reject(badRequest);
}

function assetIdIsNan() {
  const badRequest = new BadRequest('Asset id is not a number');
  return Promise.reject(badRequest);
}

function checkAsset(asset) {
  if (!asset.instrumentId || !asset.isin || !asset.name ||
    !asset.positionId || !asset.quantity || !asset.type)
    return false;

  if (isNaN(asset.instrumentId) || isNaN(asset.positionId) ||
    isNaN(asset.quantity))
    return false;

  return true;

}

module.exports =
  async (data, params) => {

    //catch: request contains no action field
    if (!data.action) {
      const badRequest = new BadRequest('No action specified');
      return Promise.reject(badRequest);
    }


    //check general requirements(for all actions) and define mongoUserID
    let mongoUserID = '';
    let userID = '';
    if (data.user) {
      if (!data.user.id)
        return noId();
      if (isNaN(data.user.id))//case ignores submissions like 1e10000
        return idIsNan();
      userID = data.user.id;
      mongoUserID = createMongoID.createUserID(data.user.id); //mongoDB id used to identify user
    } else {
      if (!data.userId)
        return noId();
      if (isNaN(data.userId))//case ignores submissions like 1e10000
        return idIsNan();
      userID = data.userId;
      mongoUserID = createMongoID.createUserID(data.userId); //mongoDB id used to identify user
    }

    const app = require('../../../app');
    const dbService = app.service('user-portfolioDB');

    const action = data.action;
    delete data.action; //remove data.action Field

    const monitoringRecord = {'service': 'userPortfolio', 'action': action};
    switch (action) {
    case 'createUser': {
      if (!data.user.name) {
        const badRequest = new BadRequest('No user name specified');
        return Promise.reject(badRequest);
      }
      data._id = mongoUserID;
      //Create correct createUserRequest
      const result = await dbService.create(data, null);
      saveMonitoringRecord.saveRecord(monitoringRecord, true, 'Created user-portfolio for user ' + userID);
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
        result = noUpdates();
      }

      return result;
    }
    case 'addPortfolio': {

      if (!data.portfolio)
        return noPortfolio();
      if (!data.portfolio.id)
        return noPortfolioId();
      if (isNaN(data.portfolio.id))
        return portfIdIsNan();
      if (!data.portfolio.name)
        return noPortfName();

      const update = {$addToSet: {'portfolios': data.portfolio}};
      const validation = await Promise.resolve(dbService.get(mongoUserID, null));
      //Test for duplicate portfolioIds
      for (let portfolio of validation.portfolios) {
        if (portfolio.id == data.portfolio.id) {
          const badRequest = new BadRequest('User already has portfolio with that ID');
          badRequest.errors.userPortfolio = validation;

          const monitoringDesc = 'Tried to add portfolio, but user ' + userID + 'did already have a portfolio with id:' + data.portfolio.id;
          saveMonitoringRecord.saveRecord(monitoringRecord, false, monitoringDesc);
          return Promise.reject(badRequest);
        }
      }
      saveMonitoringRecord.saveRecord(monitoringRecord, true, 'Added portfolio ' + data.portfolio.id + ' to user ' + userID);
      return Promise.resolve(dbService.patch(mongoUserID, update, null));
    }
    case 'removePortfolio': {
      if (!data.portfolioId)
        return noPortfolioId();
      if (isNaN(data.portfolioId))
        return portfIdIsNan;

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
        return noPortfolioId();
      if (isNaN(data.portfolioId))
        return portfIdIsNan();
      if (!data.asset)
        return noAsset();
      if (!checkAsset(data.asset))
        return assetFormat();

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
      const monitoringDesc = 'Added asset to portfolio ' + data.portfolioId + ' of user ' + userID + ' with instrumentId: ' + data.asset.instrumentId;
      saveMonitoringRecord.saveRecord(monitoringRecord, true, monitoringDesc);
      return Promise.resolve(dbService.patch(mongoUserID, update, params));
    }
    case 'removePortfolioAsset': {
      if (!data.portfolioId)
        return noPortfolioId();
      if (isNaN(data.portfolioId))
        return portfIdIsNan();
      if (!data.assetId)
        return noAssetId();
      if (isNaN(data.assetId))
        return assetIdIsNan();

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
        const monitoringDesc = 'Removed asset from portfolio ' + data.portfolioId + ' of user ' + userID + ' with instrumentId: ' + data.assetId;
        saveMonitoringRecord.saveRecord(monitoringRecord, true, monitoringDesc);
        return result;
      }
    }

    default:
      const badRequest = new BadRequest('Unknown action');
      return Promise.reject(badRequest);
    }
  };
