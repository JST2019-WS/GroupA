const assert = require('assert');
const app = require('../../src/app');

describe('\'request-handler\' service', () => {
  it('registered the service', () => {
    const service = app.service('request-handler');

    assert.ok(service, 'Registered the service');
  });
});
