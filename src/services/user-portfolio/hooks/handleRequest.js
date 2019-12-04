/*eslint-disable no-unused-vars, no-case-declarations*/
//require statement to WSO / User portfolio service here
const {NotFound, GeneralError, BadRequest} = require('@feathersjs/errors');
const createMongoID = require('../../../helper/createMongoID');
const saveMonitoringRecord = require('../../../helper/saveMonitoringRecord');

//Helper Method
function prepBadResponse(record, msg) {
  const badRequest = new BadRequest(msg);
  saveMonitoringRecord.saveRecord(record, false, msg);
  return Promise.reject(badRequest);
}

function checkPortfolio(portfolio) {
  if (!portfolio.id)
    return false;
  if (isNaN(portfolio.id))
    return false;
  if (!portfolio.name)
    return false;
  return true;
}

function checkAsset(asset) {
  //check for correct fields
  if (!asset.isin || !asset.quantity || !asset.name || !asset.type)
    return false;

  //check if quantity is a number
  if (isNaN(asset.quantity))
    return false;

  return true;

}

//Helper: adds recommend (int[]) / resets it to a portfolio
function setRecommend(portfolio) {
  portfolio.recommend = new Array();
}

//Helper method runs query to determine if an asset is present in the asset DB
async function checkAssetDb(asset) {
  const app = require('../../../app');
  const assetDbService = app.service('assetDB');
  const query = {'isin': asset.isin, 'securityKey' : process.env.WSO_SECURITY_KEY};
  try {
    const result = await assetDbService.find({query});
    //asset found in db
  } catch (error) {
    //asset not found in db, add it
    await assetDbService.create({
      isin: asset.isin,
      price: -1,
      name: asset.name,
      type: asset.type,
      date_time: new Date()
    });
  }

  const output = Object();
  output.isin = String(asset.isin);
  output.quantity = (asset.quantity);
  return output;
}

module.exports =
  async (data, params) => {

    const app = require('../../../app');
    const dbService = app.service('user-portfolioDB');
    const securityKey = process.env.WSO_SECURITY_KEY;
    //catch: request contains correct security key
    if (!data.securityKey || data.securityKey !== securityKey) {
      const badRequest = new BadRequest('Security Key missing or wrong. Key: ' + data.securityKey);
      saveMonitoringRecord.saveRecord({
        'service': 'userPortfolio',
        'action': (data.action ? data.action : 'none')
      }, false, 'Security Key missing or wrong. Key: ' + data.securityKey);
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
        if (!data.user.nick) {
          const badRequest = new BadRequest('No user nick specified');
          saveMonitoringRecord.saveRecord(monitoringRecord, false, 'No user nick specified');
          return Promise.reject(badRequest);
        }
        data._id = mongoUserID;
        //Run potential assets by the database
        if (data.hasOwnProperty('portfolios')) {

          for (i = 0; i < data.portfolios.length; i++) {
            const portfolio = data.portfolios[i];
            if (!checkPortfolio(portfolio))
              return prepBadResponse('Portfolio not formatted correctly');
            if (portfolio.hasOwnProperty('assets')) {
              for (j = 0; j < portfolio.assets.length; j++) {
                const asset = portfolio.assets[j];
                if (!checkAsset(asset))
                  return prepBadResponse(monitoringRecord, 'Asset not formatted correctly');
                const modified_asset = await checkAssetDb(asset);
                portfolio.assets[j] = modified_asset;
              }
            }
          }

        }
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
        if (!checkPortfolio(data.portfolio))
          return prepBadResponse(monitoringRecord, 'Portfolio not formatted correctly');

        data.portfolio.id = String(data.portfolio.id);

        //sets the recommend array for the portfolio
        setRecommend(data.portfolio);

        //set the risk value
        if(!data.portfolio.risk || isNaN(data.portfolio.risk) || data.portfolio.risk < 0 || data.portfolio.risk > 1){
          data.portfolio.risk = '-1'
        }

        const update = {$addToSet: {'portfolios': data.portfolio}};
        const validation = await Promise.resolve(dbService.get(mongoUserID, null));
        //Test for duplicate portfolioIds
        if (validation.portfolios) {
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
        //    //modify the asset to only include
        // const asset = Object();
        // asset.isin = String(data.asset.isin);
        // asset.quantity = (data.asset.quantity);
        // asset.type = String(data.asset.type);
        // asset.name = String(data.asset.name);

        //check if the asset is found in the asset DB through isin
        const asset = await checkAssetDb(asset);

        const params = {};
        params.query = {'portfolios.id': data.portfolioId};
        const update = {$addToSet: {'portfolios.$.assets': asset}};
        const validation = await Promise.resolve(dbService.get(mongoUserID, null));

        const validationPortfolio = await validation.portfolios.find(
          (portfolio) => {
            return portfolio.id == data.portfolioId;
          });

        //test for duplicate assetIDs in the portfolio
        if (validationPortfolio.assets) {
          for (let i = 0; i < validationPortfolio.assets.length; i++) {
            if (validationPortfolio.assets[i].isin == asset.isin) { //changed: instrumentId -> isin
              const badRequest = new BadRequest('Portfolio of User has already an Asset with that isin');
              badRequest.errors.userPortfolio = validation;
              const monitoringDesc = 'Tried to add asset to portfolio ' + data.portfolioId + ' of user ' + userID + ', but an asset already exists with id: ' + asset.isin;
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

        const monitoringDesc = 'Added asset to portfolio ' + data.portfolioId + ' of user ' + userID + ' with isin: ' + asset.isin;
        saveMonitoringRecord.saveRecord(monitoringRecord, true, monitoringDesc);
        return Promise.resolve(dbService.patch(mongoUserID, update, params));
      }

      case 'removePortfolioAsset': {
        if (!data.portfolioId)
          return prepBadResponse(monitoringRecord, 'No portfolio id specified');
        if (isNaN(data.portfolioId))
          return prepBadResponse(monitoringRecord, 'Portfolio id is not a number');
        data.portfolioId = String(data.portfolioId);
        if (!data.assetIsin)
          return prepBadResponse(monitoringRecord, 'Asset isin not specified');
        data.assetIsin = String(data.assetIsin);

        const params = {};
        params.query = {'portfolios.id': data.portfolioId};
        const update = {$pull: {'portfolios.$.assets': {'isin': data.assetIsin}}};
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
          const badRequest = new BadRequest('User-Portfolio did not have Asset with that isin');
          badRequest.errors.userPortfolio = result;
          const monitoringDesc = 'Tried to remove asset from portfolio ' + data.portfolioId + ' of user ' + userID + ', but no asset exists with isin: ' + data.assetIsin;
          saveMonitoringRecord.saveRecord(monitoringRecord, false, monitoringDesc);

          return Promise.reject(badRequest);
        } else {

          //reset recommend of that portfolio
          const interParams = {};
          interParams.query = {'portfolios.id': data.portfolioId};
          const interUpdate = {$set: {'portfolios.$.recommend': new Array()}};
          const resetRecommend = await Promise.resolve(dbService.patch(mongoUserID, interUpdate, interParams));

          const monitoringDesc = 'Removed asset from portfolio ' + data.portfolioId + ' of user ' + userID + ' with isin: ' + data.assetIsin;
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

      case'pushPortfolioRecommend': {

        if (!data.portfolioId)
          return prepBadResponse(monitoringRecord, 'No portfolio id specified');
        if (isNaN(data.portfolioId))
          return prepBadResponse(monitoringRecord, 'Portfolio id is not a number');
        data.portfolioId = String(data.portfolioId);
        if (!data.value)
          return prepBadResponse(monitoringRecord, 'No value specified');
        if (isNaN(data.value))
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

      case'setPortfolioRecommend': {

        if (!data.portfolioId)
          return prepBadResponse(monitoringRecord, 'No portfolio id specified');
        if (isNaN(data.portfolioId))
          return prepBadResponse(monitoringRecord, 'Portfolio id is not a number');
        data.portfolioId = String(data.portfolioId);
        if (!data.values)
          return prepBadResponse(monitoringRecord, 'No array of values specified');
        if (!Array.isArray(data.values))
          return prepBadResponse(monitoringRecord, 'Values is not an Array');
        for (var i = 0; i < data.values.length; i++) {
          if (isNaN(data.values[i]))
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


      case'setPortfolioRisk':{
        if (!data.portfolioId)
          return prepBadResponse(monitoringRecord, 'No portfolio id specified');
        if (isNaN(data.portfolioId))
          return prepBadResponse(monitoringRecord, 'Portfolio id is not a number');
        data.portfolioId = String(data.portfolioId);
        if(!data.risk)
          return prepBadResponse(monitoringRecord, 'Risk not specified');
        if(isNaN(data.risk))
          return prepBadResponse(monitoringRecord, 'Risk is not a number');
        data.risk = parseFloat(data.risk);
        if(data.risk < 0 || data.risk > 1)
          return prepBadResponse(monitoringRecord, 'Risk has an illegal value');

        const params = {};
        params.query = {'portfolios.id' : data.portfolioId};
        const update = {$set: {'portfolios.$.risk': data.risk}};

        const result = await Promise.resolve(dbService.patch(mongoUserID, update, params));

        const monitoringDesc = 'Set risk of Portfolio' + data.portfolioId + ' to ' + data.risk + ' of user ' + userID;
        saveMonitoringRecord.saveRecord(monitoringRecord, true, monitoringDesc);
        return result;
      }

      case'getPortfolioRisk':{
        if (!data.portfolioId)
          return prepBadResponse(monitoringRecord, 'No portfolio id specified');
        if (isNaN(data.portfolioId))
          return prepBadResponse(monitoringRecord, 'Portfolio id is not a number');
        data.portfolioId = String(data.portfolioId);

        const params = {};
        params.query = {'portfolios.id' : data.portfolioId};

        const result = await Promise.resolve(dbService.get(mongoUserID,null));

        const portfolios = result.portfolios;

        for(var i = 0 ; i < portfolios.length; i++){
          if(portfolios[i].id == data.portfolioId)
            if(!portfolios[i].risk)
              return prepBadResponse(monitoringRecord, 'Portfolio does not have a risk value');
            return portfolios[i].risk;
        }

        return prepBadResponse(monitoringRecord, 'User does not have the specified portfolio');
      }


      //returns user
      case 'getUser': {
        return await Promise.resolve(dbService.get(mongoUserID, null));
      }

      default:
        const badRequest = new BadRequest('Unknown action');
        saveMonitoringRecord.saveRecord(monitoringRecord, false, 'Unknown action!');
        return Promise.reject(badRequest);
    }
  };
