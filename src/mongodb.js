const parse = require('mongodb-core').parseConnectionString;
const MongoClient = require('mongodb').MongoClient;
const logger = require('./logger');

module.exports = function (app) {
  const url = process.env.MONGODB_URL;
  const dbName = process.env.MONGODB_DB_NAME;
  const promise = MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }).then(client => {
    // For mongodb <= 2.2
    if(client.collection) {
      return client;
    }

    console.log('Database connected to ' + dbName);
    return client.db(dbName);
  }).catch(error => {
    logger.error(error);
  });

  app.set('mongoClient', promise);
};
