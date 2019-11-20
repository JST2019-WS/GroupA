const async = require('async');

const er = require('./risk-indicators/economic-pack/economic-ri');
const st = require('./risk-indicators/security-type-pack/security-type-ri');
const tr = require('./risk-indicators/transaction-pack/transaction-ri');
const vr = require('./risk-indicators/volatility-pack/volatility-ri');

// Risk percentage calculations are only based on the isin and should return a value between 0.0 and 100.0
module.exports = {
  aggregateRiskValue : (isin, callback) => {
    async.parallel({
        er_value: function(cb){
          er.riskPercentage(isin, cb);
        },
        st_value: function(cb){
          st.riskPercentage(isin, cb);
        },
        tr_value: function(cb){
          tr.riskPercentage(isin, cb);
        },
        vr_value: function(cb){
          vr.riskPercentage(isin, cb);
        },
    }, function(err, values){
        if(err) throw err;

        let count = 0;
        let total = 0;
        if(values.er_value != null){
          count++;
          total += values.er_value;
        }
        if(values.st_value != null){
          count++;
          total += values.st_value;
        }
        if(values.tr_value != null){
          count++;
          total += values.tr_value;
        }
        if(values.vr_value != null){
          count++;
          total += values.vr_value;
        }
        //if all the returned values are null
        if(count == 0) callback(-1);
        else{
          //return the aggregated value by invoking a callback
          let result = total/count;
          callback(result);
        }
    });
  }
};
