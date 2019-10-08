const { Service } = require('feathers-mongodb');

exports.Wso = class Wso extends Service {
  constructor(options, app) {
    super(options);
    
    app.get('mongoClient').then(db => {
      this.Model = db.collection('user-portfolio');
    });
  }
};
