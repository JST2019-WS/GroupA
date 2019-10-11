const ObjectID = require('mongodb').ObjectID;

module.exports = {
  createUserID : (userID) =>{
    if (userID.length >= 12)
      userID = userID.substring(0, 11);
    for (let i = userID.length; i < 12; i++) {
      userID = '0' + userID;
    }
    return new ObjectID(userID);
  }
};