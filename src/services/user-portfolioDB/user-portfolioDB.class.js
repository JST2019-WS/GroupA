const {Service} = require('feathers-mongodb');

exports.UserPortfolioDB = class UserPortfolioDB extends Service {
  constructor(options, app) {
    super(options);
    app.get('mongoClient').then(db => {
      this.Model = db.collection(process.env.MONGODB_USERPORTFOLIO_COLLECTION_NAME);
    });
  }
};
