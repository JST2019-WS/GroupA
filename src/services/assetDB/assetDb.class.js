const {Service} = require('feathers-mongodb');

exports.AssetDB = class AssetDB extends Service {
  constructor(options, app) {
    super(options);
    app.get('mongoClient').then(db => {
      this.Model = db.collection(process.env.MONGODB_ASSETS_COLLECTION_NAME);
    });
  }
};
