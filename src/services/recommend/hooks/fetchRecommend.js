	/*eslint-disable no-unused-vars, no-case-declarations*/

const {NotFound, GeneralError, BadRequest} = require('@feathersjs/errors');
const saveMonitoringRecord = require('../../../helper/saveMonitoringRecord');
const createMongoID = require('../../../helper/createMongoID');

//Helper Method
function prepBadResponse(record, msg){
  const badRequest = new BadRequest(msg);
  saveMonitoringRecord.saveRecord(record, false, msg);
  return Promise.reject(badRequest);
}

module.exports =
	async(data, params) => {

		const monitoringRecord = {'service': 'recommend'};

		const securityKey = process.env.WSO_SECURITY_KEY;
		if(!data.securityKey || data.securityKey != securityKey)
			return prepBadResponse(monitoringRecord, 'Security Key missing or wrong. Key: ' + data.securityKey)
		if(!data.userId)
			return prepBadResponse(monitoringRecord, 'No user ID specified');
		if(isNaN(data.userId))
			return prepBadResponse(monitoringRecord, 'User ID is not a number');
		if(!data.portfolioId)
			return prepBadResponse(monitoringRecord, 'No portfolio ID specified');
		if(isNaN(data.portfolioId))
			return prepBadResponse(monitoringRecord, 'Portfolio ID is not a number');
		if(isNaN(data.riskClass) || !Number.isInteger(data.riskClass) || data.riskClass < 1 || data.riskClass > 6)
		  return prepBadResponse(monitoringRecord, 'Risk class not specified properly');
		

		data.userId = String(data.userId)
		data.portfolioId = String(data.portfolioId)
		const userId = createMongoID.createUserID(data.userId)
		const app = require('../../../app')
		const userDb = app.service('user-portfolioDB')

		//check user's existenec
		// const query = {'user.id': data.userId}
		try{
			tmpresult = await userDb.get(userId)
			//user found
			if(!tmpresult.portfolios)
				return prepBadResponse(monitoringRecord, 'User has no portfolios')
			var portfolioIndex = -1;

			//get the index of the portfolio specified by the request
			for(i = 0; i < tmpresult.portfolios.length ; i++){
				portfolio = tmpresult.portfolios[i]
				if(portfolio.id == data.portfolioId){
					portfolioIndex = i
					break;
				}
			}

			if(portfolioIndex == -1)
				return prepBadResponse(monitoringRecord, 'User does not have the specified portfolio')
			
			// Get recommendations.
			rec = require('../../../recommendation/recommender');
			const result = await rec.recommend(data.riskClass);
			return result;
		}
		catch(error){
			//not found
			return prepBadResponse(monitoringRecord, 'User not found');
		}
	}
