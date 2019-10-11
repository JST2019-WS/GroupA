const assert = require('assert');
const app = require('../../src/app');

describe('\'user-portfolio\' service', () => {
  it('registered the service', () => {
    const service = app.service('user-portfolio');

    assert.ok(service, 'Registered the service');
  });
});
