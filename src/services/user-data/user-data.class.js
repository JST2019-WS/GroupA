const { Service } = require('feathers-mongodb');

exports.UserData = class UserData extends Service {
  constructor(options, app) {
    super(options);
    
    app.get('mongoClient').then(db => {
      this.Model = db.collection('user-data');
    });
  }
};
