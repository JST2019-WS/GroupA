const {Service} = require('feathers-mongodb');

exports.Monitoring = class Monitoring extends Service {
  constructor(options, app) {
    super(options);

    app.get('mongoClient').then(db => {
      this.Model = db.collection('monitoring');
    });
  }
};
