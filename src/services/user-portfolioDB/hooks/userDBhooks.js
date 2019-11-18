const {NotFound, GeneralError, BadRequest} = require('@feathersjs/errors');

module.exports = {

  testSecurityKey: (context) => {
    if(context.params.query.securityKey === undefined) {
      return Promise.reject(new BadRequest(('No securityKey field!')));
    }
    if(context.params.query.securityKey.toString() != process.env.WSO_SECURITY_KEY) {
      return Promise.reject(new BadRequest(('Wrong securityKey!')));
    }
    delete context.params.query.securityKey;
  }

};