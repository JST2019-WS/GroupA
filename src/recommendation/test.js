const runner = require('./risk-indicator-aggregation');

var isin = 'AT00000VIE62';

runner.aggregateRiskValue(isin, function(res){
    console.log(res);
});