// Risk percentage calculations are only based on the isin and should return a value between 0.0 and 100.0
module.exports = {
  riskPercentage : (isin, callback) => {
    var result = null;
    // TODO add calculations here

    //return the value by invoking a callback
    //the 1st param. is error, just keep it null
    callback(null, result);
  } 
};
