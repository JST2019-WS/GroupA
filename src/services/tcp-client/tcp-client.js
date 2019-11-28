const net = require('net');
const csv = require('csvtojson');
const iconvLite = require('iconv-lite');

const WSO_STOCK_PRICE_TCP_HOST = process.env.WSO_STOCK_PRICE_TCP_HOST;
const WSO_STOCK_PRICE_TCP_PORT = process.env.WSO_STOCK_PRICE_TCP_PORT;

const MONGODB_URL = process.env.MONGODB_URL;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;
const MONGODB_COLLECTION_NAME = process.env.MONGODB_ASSETS_COLLECTION_NAME;

// https://stackoverflow.com/a/39957896
module.exports = function connectTcpServer() {
  var tcp_client = new net.Socket();

  tcp_client.connect(
    WSO_STOCK_PRICE_TCP_PORT,
    WSO_STOCK_PRICE_TCP_HOST,
    function() {
      console.log(
        'SOCKET CONNECTED TO: ' +
          WSO_STOCK_PRICE_TCP_HOST +
          ':' +
          WSO_STOCK_PRICE_TCP_PORT
      );
      // client.write('Hello World!');
    }
  );

  tcp_client.on('error', function() {}); // need this line so it wont throw exception

  tcp_client.on('data', data => {
    const plainText = iconvLite.decode(data, 'utf8');

    csv({
      // https://www.npmjs.com/package/csvtojson#parameters
      delimiter: [';'],
      trim: true,
      ignoreEmpty: true,
      noheader: true,
      headers: [
        'isin',
        'quantity',
        'price',
        'side', // Market buy (B) / sell (S) / H for each heartbeat
        'date',
        'time',
        'trade_id', //The TRADE-ID is unique, not sorted and not gapless
        'empty_field'
      ],
      // https://www.npmjs.com/package/csvtojson#built-in-parsers
      checkType: true,
      colParser: {
        isin: 'string',
        quantity: 'number',
        price: 'number',
        side: 'string',
        date: 'string',
        time: 'string',
        trade_id: 'string'
      },
      includeColumns: /(isin|price|date|time)/
    })
      .fromString(plainText)
      .then(jsonObj => {
        var MongoClient = require('mongodb').MongoClient;

        MongoClient.connect(
          MONGODB_URL,
          {
            useNewUrlParser: true,
            useUnifiedTopology: true
          },
          async (err, mongo_db) => {
            if (err) throw err;
            var db = mongo_db.db(MONGODB_DB_NAME);

            console.log('TCP-client connected to the mongoDB');

            for (const item of jsonObj) {
              let date_time = new Date(item.date + ' ' + item.time);
              item['date_time'] = date_time;
              delete item['date'];
              delete item['time'];

              let new_update_item = {
                $set: item
              };

              let db_collection = db.collection(MONGODB_COLLECTION_NAME);

              let filter_isin = {
                isin: item.isin
              };

              let filter_old_isin = {
                isin: item.isin,
                date_time: { $lte: date_time }
              };

              db_collection
                .countDocuments(filter_isin)
                .then(count => {
                  let has_same_isin = count > 0 ? true : false;

                  // make sure, there's no duplicate and don't replace the newer
                  // data by older date
                  if (!has_same_isin) {
                    // DONE NO INSERT JUST UPDATE
                    let just_update_not_insert = false;

                    if (just_update_not_insert) {
                      console.log('ISIN not exist: ' + item.isin);
                    } else {
                      db_collection
                        .insertOne(item)
                        .then(() => console.log('inserted ISIN: ' + item.isin))
                        .catch(err => console.log('insert error: ' + err));
                    }
                  } else {
                    db_collection
                      .countDocuments(filter_old_isin)
                      .then(count => {
                        let has_old_same_isin = count > 0 ? true : false;

                        if (has_old_same_isin) {
                          db_collection
                            .updateOne(filter_isin, new_update_item)
                            .then(() =>
                              console.log('upserted ISIN: ' + item.isin)
                            )
                            .catch(err => console.log('update error: ' + err));
                        } else {
                          // (has_same_isin && !has_old_same_isin)
                          console.log('newer item already in database');
                        }
                      });
                  }
                })
                .catch(err => console.log(err));
            }
          }
        );
      })
      .catch(err => console.log(err));
  });

  // recursive call to make sure continuously try to connect to the tcp server
  tcp_client.on('close', function() {
    console.log('tcp-channel closed');
    setTimeout(() => {
      connectTcpServer();
    }, 1e3);
  });
};
