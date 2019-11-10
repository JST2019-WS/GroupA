const { exec } = require('child_process');

// Risk percentage calculations are only based on the isin and should return a value between 0.0 and 100.0
module.exports = {
    riskPercentage(isin, callback) {
      var result = null;
      exec('python betaExtractor.py '+isin, function(err, stdout, stderr){
          if(err){
              console.log(err.stack);
          }
          var beta = parseFloat(stdout);
          if(beta != -100){
            if(Math.abs(beta) >= 2) result = 100.0;
            else result = Math.abs(beta) * 50.0;
          }
          //return the value by invoking a callback
          //the 1st param. is error, just keep it null
          callback(null, result);
      });
    }
};