
//require statement to WSO / User portfolio service here
const {NotFound, GeneralError, BadRequest} = require('@feathersjs/errors');
module.exports = (options = {}) => {
	return async context => {
		const data = context.data

		//catch: request contains no action field
		if(!data.action){
			const badRequest = new BadRequest('No action specified')
			return Promise.reject(badRequest)
		}

		//helper methods
		function noUser(){
			const badRequest = new BadRequest('No user specified')
			return Promise.reject(badRequest)
		}
		function noId(){
			const badRequest = new BadRequest('No user id specified')
			return Promise.reject(badRequest)
		}
		function idIsNan(){
			const badRequest = new BadRequest('User id is not a number')
			return Promise.reject(badRequest)
		}
		function noPortfolio(){
			const badRequest = new BadRequest('No portfolio specified')
			return Promise.reject(badRequest)
		}
		function noPortfolioId(){
			const badRequest = new BadRequest('No portfolio id specified')
			return Promise.reject(badRequest)
		}
		function portfIdIsNan(){
			const badRequest = new BadRequest('Portfolio id is not a number')
			return Promise.reject(badRequest)
		}
		function noPortfName(){
			const badRequest = new BadRequest('Portfolio name not specified')
			return Promise.reject(badRequest)
		}
		function noAsset(){
			const badRequest = new BadRequest('Asset not specified')
			return Promise.reject(badRequest)
		}
		function assetFormat(){
			const badRequest = new BadRequest('Asset not formatted correctly')
			return Promise.reject(badRequest)
		}
		function noAssetId(){
			const badRequest = new BadRequest('Asset id not specified')
			return Promise.reject(badRequest)
		}
		function assetIdIsNan(){
			const badRequest = new BadRequest('Asset id is not a number')
			return Promise.reject(badRequest)
		}

		function checkAsset(asset){
			if(!asset.instrumentId || !asset.isin || !asset.name ||
				!asset.positionId || !asset.quantity || !asset.type)
				return false
			
			if(isNaN(asset.instrumentId) || isNaN(asset.positionId) ||
				isNaN(asset.quantity))
				return false

			return true

		}


		switch(data.action) {
			case 'createUser': 
			//check requirements
			if(!data.user)
				return noUser()
			if(!data.user.id)
				return noId()
			if(isNaN(data.user.id)) //case ignores submissions like 1e10000
				return idIsNan()
			if(!data.user.name){
				const badRequest = new BadRequest('No user name specified')
				return Promise.reject(badRequest)
			}

			//TODO
			//call create user from wso portfolio service

			break;

			case 'updateUser':
			if(!data.user)
				return noUser()
			if(!data.user.id)
				return noId()
			if(isNaN(data.user.id)) //case ignores submissions like 1e10000
				return idIsNan()

			//TODO
			//call update user from wso portfolio service

			break;

			case 'addPortfolio':
			if(!data.userId)
				return noId()
			if(isNaN(data.user.id)) //case ignores submissions like 1e10000
				return idIsNan()
			if(!data.portfolio)
				return noPortfolio()
			if(!data.portfolio.id)
				return noPortfolioId()
			if(isNan(data.portfolio.id))
				return portfIdIsNan()
			if(!data.portfolio.name)
				return noPortfName()

			//TODO
			//call add portfolio from wso portfolio service

			break;

			case 'removePortfolio':
			if(!data.userId)
				return noId()
			if(isNaN(data.userId)) //case ignores submissions like 1e10000
				return idIsNan()
			if(!data.portfolioId)
				return noPortfolioId()
			if(isNaN(data.portfolioId))
				return portfIdIsNan

			//TODO
			//call remove portfolio from wso portfolio service

			break;

			case 'addPortfolioAsset':

			if(!data.userId)
				return noId()
			if(isNaN(data.userId)) //case ignores submissions like 1e10000
				return idIsNan()
			if(!data.portfolioId)
				return noPortfolioId
			if(isNaN(data.portfolioId))
				return portfIdIsNan
			if(!data.asset)
				return noAsset()
			if(!checkAsset(data.asset))
				return assetFormat()

			//TODO
			//call add portfolio asset from wso portfolio service

			break;

			case 'removePortfolioAsset':

			if(!data.userId)
				return noId()
			if(isNaN(data.userId))
				return idIsNan()
			if(!data.portfolioId)
				return noPortfolioId()
			if(isNaN(data.portfolioId))
				return portfIdIsNan()
			if(!data.assetId)
				return noAssetId()
			if(isNaN(data.assetId))
				return assetIdIsNan()

			//TODO
			//call remove portfolio asset from wso portfolio service

			break;

			case 'generateRecommendations':

			if(!data.userId)
				return noId()
			if(isNaN(data.userId))
				return idIsNan()
			if(!data.portfolioId)
				return noPortfolioId()
			if(isNaN(data.portfolioId))
				return portfIdIsNan()

			//TODO
			//initiate the recommendation proccess here

			break;

			default:
			const badRequest = new BadRequest('Unknown action')
			return Promise.reject(badRequest)
		}

		return context
	}
}