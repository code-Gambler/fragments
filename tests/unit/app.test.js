// tests/unit/app.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('404 Handler Check', () => {
  // Using a valid username/password pair  for a route that is not defined should give a 404 error
  test('authenticated user accessing a undefined route gets error 404', async () => {
    const res = await request(app).get('/v1/notdefined').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(405);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toBe('not found');
    expect(res.body.error.code).toBe(404);
  });
});
