const {Service} = require('feathers-mongodb');

exports.Monitoring = class Monitoring extends Service {
  constructor(options, app) {
    super(options);

    app.get('mongoClient').then(db => {
      this.Model = db.collection(process.env.MONGODB_MONITORING_COLLECTION_NAME);
    });
  }
};
