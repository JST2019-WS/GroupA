require('fs').readFile('./Files/securityKey.txt', 'utf8', function (err, securityKey) { if(err){console.log(err);} process.env.WSO_SECURITY_KEY = securityKey;});
const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const logger = require('./logger');

const feathers = require('@feathersjs/feathers');
const configuration = require('@feathersjs/configuration');
const express = require('@feathersjs/express');


const middleware = require('./middleware');
const services = require('./services');
const appHooks = require('./app.hooks');
const channels = require('./channels');

require('dotenv').config();
const tcp_client = require('./services/tcp-client/tcp-client');

const mongodb = require('./mongodb');

const app = express(feathers());

// Load app configuration
app.configure(configuration());
// Enable security, CORS, compression, favicon and body parsing
app.use(helmet());
app.use(cors());
app.use(compress());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Do not host the public folder - pure REST API
// app.use('/', express.static(app.get('public')));

// Set up Plugins and providers
app.configure(express.rest());


app.configure(mongodb);


// Configure other middleware (see `middleware/index.js`)
app.configure(middleware);
// Set up our services (see `services/index.js`)
app.configure(services);

// Set up event channels (see channels.js)
app.configure(channels);

// Configure a middleware for 404s and the error handler
app.use(express.notFound());
app.use(express.errorHandler({logger}));

app.hooks(appHooks);

tcp_client();

module.exports = app;

//require('./readFile');
