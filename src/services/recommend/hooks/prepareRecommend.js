 /*eslint-disable no-unused-vars, no-case-declarations*/

 const ObjectID = require('mongodb').ObjectID;
 const {NotFound, GeneralError, BadRequest} = require('@feathersjs/errors');

function createUserID(userID) {
  if (userID.length >= 12)
    userID = userID.substring(0, 11);
  for (let i = userID.length; i < 12; i++) {
    userID = '0' + userID;
  }
  // return new ObjectID(userID); //for some reason this has 3s as filler
  return userID
}

module.exports = 
  async (raw_id, params) => {
  	//console.log(params.query.portfolio) //this is the portfolio
  	// console.log(data) //data is the id
  	//validate
 	const id = createUserID(raw_id)

 	// console.log(id)
	if(!params.query.portfolio){
		const badRequest = new BadRequest('No portfolio specified');
		return Promise.reject(badRequest);
	}

	const portfolio = params.query.portfolio

	if(isNaN(portfolio)){
		const badRequest = new BadRequest('Illegal portfolio id');
		return Promise.reject(badRequest);
	}

	//this takes the userid and portfolioid
	const outObject = new Object;
	outObject.id = id
	outObject.portfolio = portfolio

	//delegate to machine learning subsystem here, using outObject
	//TODO

	//dummy return object
	const dummy = new Object
	dummy.name = "Commerzbank"
	dummy.url = "https://www.wallstreet-online.de/aktien/commerzbank-aktie"
	dummy.isin = "US0378331005"
	dummy.category = new Object
	dummy.category.name = 'Banken'
	dummy.category.url = 'https://www.wallstreet-online.de/aktien/branche/banken-aktien'
	dummy.value = 5.249
	dummy. absolute = -0.066
 	dummy.relative = -1.24
 	dummy.updated_at = "2019-09-27T08:00:00Z"
 	dummy.currency = 'EUR'
 	dummy.exchange = 'ETR'
 	dummy.volume = 16182197

	// console.log(dummy)


	// return context
	return dummy
  }

