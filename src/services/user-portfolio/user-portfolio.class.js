const { Service } = require('feathers-mongodb');

exports.UserPortfolio = class UserPortfolio extends Service {
  constructor(options, app) {
    super(options);
    app.get('mongoClient').then(db => {
      this.Model = db.collection('user-portfolio');
    });
  }
};
