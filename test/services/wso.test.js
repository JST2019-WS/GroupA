const assert = require('assert');
const app = require('../../src/app');

describe('\'user-portfolioDB\' service', () => {
  it('registered the service', () => {
    const service = app.service('wso');

    assert.ok(service, 'Registered the service');
  });
});
