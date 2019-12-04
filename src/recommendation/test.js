const runner = require('./risk-indicator-aggregation');
const rvc = require('./risk-value-calculation');

var isin = 'AT00000VIE62';
runner.aggregateRiskValue(isin, function(res){
  console.log(res);
});

rvc.calculateRiskValues();
