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
  async (data, params) => {

  	console.log(data)
  	// console.log(params)
  	
	return null
  }

