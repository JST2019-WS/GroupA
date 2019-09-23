const assert = require('assert');
const app = require('../../src/app');

describe('\'wso\' service', () => {
  it('registered the service', () => {
    const service = app.service('wso');

    assert.ok(service, 'Registered the service');
  });
});
