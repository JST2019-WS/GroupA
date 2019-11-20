const fs = require('fs');
const app = require('./app');
module.exports = setTimeout(() => fs.readFile('./Files/userportfolio.json', 'utf8', (err, jsonString) => {
  if (err) {
    console.log('File read failed:', err);
    return;
  }
  try {
    const dataArray = JSON.parse(jsonString);
    const length = dataArray.length;
    console.log(app == null);
    const header = {
      'securityKey' : process.env.WSO_SECURITY_KEY,
      'action' : 'createUser'
    };
    for (let i = 0; i < length; i++) {
      let request = {};
      Object.assign(request, header, dataArray[i]);
      app.service('/user-portfolio').create(request, null);
    }
  } catch (err) {
    console.log('Error parsing JSON string:', err);
  }
}), 1000);
