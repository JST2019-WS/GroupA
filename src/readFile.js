const fs = require('fs');
const app = require('./app');
module.exports = setTimeout(() => fs.readFile('./Files/userportfolio30d.json', 'utf8', (err, jsonString) => {
  if (err) {
    console.log('File read failed:', err);
    return;
  }
  try {
    const dataArray = JSON.parse(jsonString);
    const length = dataArray.length;
    console.log(length);
    const params = {query: {'identification': app.get('wsoIdentification')}};
    for (let i = 0; i < length; i++) {
      app.service('/user-portfolio').create(dataArray[i], params);
      console.log('create UserPortfolio ' + i);
    }
  } catch (err) {
    console.log('Error parsing JSON string:', err);
  }
}), 1000);
