
const saveMonitoringRecord = require('../../helper/saveMonitoringRecord');
module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [
      context => {
        const monitoringRecord = {'service': 'recommend', 'action': 'notifyRecommend'};
        saveMonitoringRecord.saveRecord(monitoringRecord, false, context.error.message);
      }
    ],
    update: [],
    patch: [],
    remove: []
  }
};
