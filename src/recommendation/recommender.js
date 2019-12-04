const app = require('../app');
const assetDBService = app.service('assetDB');
module.exports = {
  // Returns a promise with 5 random securities inside the risk class.
  recommend: async (risk_class) => {
    let rec = [];
    switch (risk_class) {
      case 1:
        await assetDBService.getAssetsInRiskRange(0.0, 16.6).then(res => {
          rec = res;
        });
        break;
      case 2:
        await assetDBService.getAssetsInRiskRange(16.6, 33.3).then(res => {
          rec = res;
        });
        break;
      case 3:
        await assetDBService.getAssetsInRiskRange(33.3, 50.0).then(res => {
          rec = res;
        });
        break;
      case 4:
        await assetDBService.getAssetsInRiskRange(50.0, 66.6).then(res => {
          rec = res;
        });
        break;
      case 5:
        await assetDBService.getAssetsInRiskRange(66.6, 83.3).then(res => {
          rec = res;
        });
        break;
      case 6:
        await assetDBService.getAssetsInRiskRange(83.3, 100.0).then(res => {
          rec = res;
        });
        break;
      default:
        return null;
    }

    for (let i = rec.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rec[i], rec[j]] = [rec[j], rec[i]];
    }

    return rec.slice(0, 5);
  }
};
