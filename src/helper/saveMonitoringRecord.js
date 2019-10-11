
module.exports = {

  saveRecord : (record, success, description) =>{
    const app = require('../app');
    const monitoringService = app.service('monitoring');
    record.created_at = new Date();
    record.success = success;
    record.description = description;
    console.log(record.description);
    monitoringService.create(record, null);

  }
};