const er = require('./risk-indicators/economic-risk-ri');
const st = require('./risk-indicators/security-type-ri');
const tr = require('./risk-indicators/transaction-risk-ri');
const vr = require('./risk-indicators/volatility-ri');

const ER_FACTOR = 0.25;
const ST_FACTOR = 0.25;
const TR_FACTOR = 0.25;
const VR_FACTOR = 0.25;

// Risk percentage calculations are only based on the isin and should return a value between 0.0 and 100.0
module.exports = {
  aggregateRiskValue : (isin) => {
    let er_part = er.riskPercentage(isin) * ER_FACTOR;
    let st_part = st.riskPercentage(isin) * ST_FACTOR;
    let tr_part = tr.riskPercentage(isin) * TR_FACTOR;
    let vr_part = vr.riskPercentage(isin) * VR_FACTOR;
    return er_part + st_part + tr_part + vr_part;
  }
};
