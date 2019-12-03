const {Service} = require('feathers-mongodb');

exports.AssetDB = class AssetDB extends Service {
  constructor(options, app) {
    super(options);
    app.get('mongoClient').then(db => {
      this.Model = db.collection(process.env.MONGODB_ASSETS_COLLECTION_NAME);
    });
  }

  async updateAvg(isin, dayAvg, weekAvg, monthAvg){
    dayAvg = Number(dayAvg);
    weekAvg = Number(weekAvg);
    monthAvg = Number(monthAvg);
    if(isNaN(dayAvg))
      return Promise.reject('DayAvg is not a number');
    if(isNaN(weekAvg))
      return Promise.reject('WeekAvg is not a number');
    if(isNaN(monthAvg))
      return Promise.reject('MonthAvg is not a number');

    const params = {'query' : {'isin' : isin.toString()}};
    const update = {$set : {'dayAvg' : dayAvg, 'weekAvg' : weekAvg, 'monthAvg' : monthAvg}};

    const res = await this._patch(null, update, params);
    if(res.length == 0) {
      return Promise.reject('No Asset with Isin ' + isin + ' found!');
    }
    return Promise.resolve('Updated dayAvg to ' + dayAvg + ', weekAvg to ' + weekAvg  + ' and monthAvg to ' + monthAvg + ' of asset ' + isin);
  }

  async getAssetPrice(isin){
    const params = {'query' : {'isin' : isin.toString()}};
    const asset = await this._find(params);
    if(asset.total == 0){
      return Promise.reject('No Asset with Isin ' + isin + ' found!');
    }
    if(asset.data[0].price === undefined) {
      return Promise.reject('Asset with Isin ' + isin + ' does not have a price field!');
    }

    return Promise.resolve(asset.data[0].price);
  }

  async getRiskValue(isin){
    const params = {'query' : {'isin' : isin.toString()}};
    const asset = await this._find(params);
    if(asset.total == 0){
      return Promise.reject('No Asset with Isin ' + isin + ' found!');
    }
    if(asset.data[0].riskValue === undefined) {
      return Promise.reject('Asset with Isin ' + isin + ' does not have a riskValue field!');
    }

    return Promise.resolve(asset.data[0].riskValue);
  }

  async setRiskValue(isin, newRiskValue){
    newRiskValue = Number(newRiskValue);
    if(isNaN(newRiskValue))
      return Promise.reject('NewRiskValue is not a number');

    const params = {'query' : {'isin' : isin.toString()}};
    const update = {$set : {'riskValue' : newRiskValue}};
    const res = await this._patch(null, update, params);
    if(res.length == 0){
      return Promise.reject('No Asset with Isin ' + isin + ' found!');
    }
    return Promise.resolve('Updated riskValue of asset ' + isin + ' to ' + newRiskValue);
  }

  async getAssetsInRiskRange(minRisk, maxRisk) {

    minRisk = Number(minRisk);
    maxRisk = Number(maxRisk);
    if(isNaN(minRisk))
      return Promise.reject('MinRisk is not a number');
    if(isNaN(maxRisk))
      return Promise.reject('MaxRisk is not a number');

    const query = {riskValue: { $gte :minRisk, $lte : maxRisk}};
    const res = await this._find({query});
    if(res.total == 0){
      return Promise.reject('No Assets found in riskRange');
    }
    return Promise.resolve(res.data);
  }

};
