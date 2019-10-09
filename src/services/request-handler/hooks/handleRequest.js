/*eslint-disable no-unused-vars, no-case-declarations*/
//require statement to WSO / User portfolio service here
const {NotFound, GeneralError, BadRequest} = require('@feathersjs/errors');
const ObjectID = require('mongodb').ObjectID;


//Helper Methods
function noUser() {
  const badRequest = new BadRequest('No user specified');
  return Promise.reject(badRequest);
}

function noId() {
  const badRequest = new BadRequest('No user id specified');
  return Promise.reject(badRequest);
}

function noUpdates(){
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

function createUserID(userID) {
  if (userID.length >= 12)
    userID = userID.substring(0, 11);
  for (let i = userID.length; i < 12; i++) {
    userID = '0' + userID;
  }
  return new ObjectID(userID);
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
    if(data.user){
      if(!data.user.id)
        return noId();
      if (isNaN(data.user.id))//case ignores submissions like 1e10000
        return idIsNan();

      mongoUserID = createUserID(data.user.id); //mongoDB id used to identify user
    }
    else{
      if(!data.userId)
        return noId();
      if (isNaN(data.userId))//case ignores submissions like 1e10000
        return idIsNan();

      mongoUserID = createUserID(data.userId); //mongoDB id used to identify user
    }

    const action = data.action;
    delete data.action; //remove data.action Field

    const app = require('../../../app');
    const dbService = app.service('wso');// TODO: changeDBService

    switch (action) {
    case 'createUser': {
      if (!data.user.name) {
        const badRequest = new BadRequest('No user name specified');
        return Promise.reject(badRequest);
      }
      data._id = mongoUserID;
      //Create correct createUserRequest
      return Promise.resolve(dbService.create(data, null));
    }
    case 'updateUser': {

      delete data.userId;
      let result = noUpdates();
      const entries = Object.entries(data.user);

      for (let [key, value] of entries) {
        const fullKey = 'user.' + [key];
        const update = {$set: {[fullKey]: value}};
        result = await Promise.resolve(dbService.patch(mongoUserID, update, null));
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

      const update = {$addToSet: {'portfolios' : data.portfolio}};
      const validation = await Promise.resolve(dbService.get(mongoUserID, null));
      const result = await Promise.resolve(dbService.patch(mongoUserID, update, null));
      if(result.portfolios.length == validation.portfolios.length){
        const badRequest = new BadRequest('User already has portfolio with that ID');
        badRequest.errors.userPortfolio = result;
        return Promise.reject(badRequest);
      }
      else {
        return result;
      }

    }
    case 'removePortfolio':
      if (!data.portfolioId)
        return noPortfolioId();
      if (isNaN(data.portfolioId))
        return portfIdIsNan;

      const update = {$pull: {'portfolios' : { 'id' : data.portfolioId}}};
      const validation = await Promise.resolve(dbService.get(mongoUserID, null));
      const result = await Promise.resolve(dbService.patch(mongoUserID, update, null));
      if(result.portfolios.length == validation.portfolios.length){
        const badRequest = new BadRequest('User did not have portfolio with that ID');
        badRequest.errors.userPortfolio = result;
        return Promise.reject(badRequest);
      }
      else {
        return result;
      }


    case 'addPortfolioAsset':

      if (!data.portfolioId)
        return noPortfolioId;
      if (isNaN(data.portfolioId))
        return portfIdIsNan;
      if (!data.asset)
        return noAsset();
      if (!checkAsset(data.asset))
        return assetFormat();

      //TODO
      //call add portfolio asset from wso portfolio service

      break;

    case 'removePortfolioAsset':

      if (!data.portfolioId)
        return noPortfolioId();
      if (isNaN(data.portfolioId))
        return portfIdIsNan();
      if (!data.assetId)
        return noAssetId();
      if (isNaN(data.assetId))
        return assetIdIsNan();

      //TODO
      //call remove portfolio asset from wso portfolio service

      break;

    case 'generateRecommendations':

      if (!data.portfolioId)
        return noPortfolioId();
      if (isNaN(data.portfolioId))
        return portfIdIsNan();

      //TODO
      //initiate the recommendation proccess here

      break;

    default:
      const badRequest = new BadRequest('Unknown action');
      return Promise.reject(badRequest);
    }

    return context;
  };
