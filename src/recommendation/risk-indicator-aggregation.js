const async = require('async');

const er = require('./risk-indicators/economic-pack/economic-ri');
const st = require('./risk-indicators/security-type-pack/security-type-ri');
const tr = require('./risk-indicators/transaction-pack/transaction-ri');
const vr = require('./risk-indicators/volatility-pack/volatility-ri');

const ER_FACTOR = 0.25;
const ST_FACTOR = 0.25;
const TR_FACTOR = 0.25;
const VR_FACTOR = 0.25;

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
        //TODO: check if the returned value is null

        //if all the returned values != null
        let result = values.er_value * ER_FACTOR +
                     values.st_value * ST_FACTOR +
                     values.tr_value * TR_FACTOR +
                     values.vr_value * VR_FACTOR;

        //return the aggregated value by invoking a callback
        callback(result);
    });
  }
};
