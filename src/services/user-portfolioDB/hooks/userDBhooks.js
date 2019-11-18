const {NotFound, GeneralError, BadRequest} = require('@feathersjs/errors');

module.exports = {

  testSecurityKey: (context) => {
    if(context.securityKey === null)
      return Promise.reject(new BadRequest(('No securityKey field!')));
    if(context.securityKey != process.env.WSO_SECURITY_KEY)
      return Promise.reject(new BadRequest(('Wrong securityKey!')));
  }

};