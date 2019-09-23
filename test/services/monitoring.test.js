const assert = require('assert');
const app = require('../../src/app');

describe('\'monitoring\' service', () => {
  it('registered the service', () => {
    const service = app.service('monitoring');

    assert.ok(service, 'Registered the service');
  });
});
