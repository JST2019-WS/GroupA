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
  aggregateRiskValue: (isin, callback) => {
    async.parallel({
      er_value: function (cb) {
        er.riskPercentage(isin, cb);
      },
      st_value: function (cb) {
        st.riskPercentage(isin, cb);
      },
      tr_value: function (cb) {
        tr.riskPercentage(isin, cb);
      },
      vr_value: function (cb) {
        vr.riskPercentage(isin, cb);
      },
    }, function (err, values) {
      if (err) throw err;
      let er_val = values.er_value;
      let st_val = values.st_value;
      let tr_val = values.tr_value;
      let vr_val = values.vr_value;

      let not_null = [];

      if (er_val !== null) not_null.push(er_val);
      if (st_val !== null) not_null.push(st_val);
      if (tr_val !== null) not_null.push(tr_val);
      if (vr_val !== null) not_null.push(vr_val);

      let map = new Map();
      map.set(er_val, ER_FACTOR);
      map.set(st_val, ST_FACTOR);
      map.set(tr_val, TR_FACTOR);
      map.set(vr_val, VR_FACTOR);


      if (not_null.length === 0) {
        callback(-1);
      } else {
        // Sum of the indicator factors, where not null was returned.
        let fac_sum = 0.;
        for (let e of not_null) fac_sum += map.get(e);

        // Every factor gets it's percentage of the fac_sum as weight.
        let result = 0.;
        for (let e of not_null) result += (map.get(e) * e) / fac_sum;


        callback(result);
      }
    });
  }
};
