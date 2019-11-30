const csv = require('csvtojson');
const path = require('path');

const myPath = path.join(__dirname, 'all-securities.csv');

// Risk percentage calculations are only based on the isin and should return a value between 0.0 and 100.0
module.exports = {
  riskPercentage : async (isin, callback) => {
    let sec = null;
    const securities = await csv().fromFile(myPath);
    for (let security of securities) {
      if (security.isin === isin) {
        sec = security;
        break;
      }
    }

    if (sec === null) return null;

    let riskClass = null;
    let type = sec.name;
    let unmatched = false;

    switch (type) {
      case 'STK':
        riskClass = 4;
        break;
      case 'FND':
        riskClass = 4;
        break;
      case 'IND':
        riskClass = -1;
        break;
      case 'ETF':
        riskClass = 4;
        break;
      case 'KNO':
        riskClass = 5;
        break;
      case 'ZER':
        riskClass = 4;
        break;
      case 'CUR':
        riskClass = -1;
        break;
      case 'ETC':
        riskClass = 1;
        break;
      case 'BND':
        riskClass = 1;
        break;
      case 'CRYP':
        riskClass = 5;
        break;
      case 'ETN':
        riskClass = 5;
        break;
      case 'FUT':
        riskClass = 5;
        break;
      case 'INT':
        riskClass = -1;
        break;
      case 'OPT':
        riskClass = 5;
        break;
      case 'RES':
        riskClass = 3;
        break;
      case 'WNT':
        riskClass = 5;
        break;
      default:
        console.log('Unmatched Security Type!');
        unmatched = true;
    }

    //return the value by invoking a callback
    //the 1st param. is error, just keep it null
    if (riskClass === -1 || unmatched === true) callback(null, null);
    else callback(null, (riskClass * 16.667 + 16.667 / 2));
  }
};

