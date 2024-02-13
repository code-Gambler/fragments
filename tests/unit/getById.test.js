// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('GET by Id', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments/testid').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments/testid').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated user get fragment data associated with the given id', async () => {
    const data = Buffer.from('testing');
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(data);
    const id = postRes.headers.location.split('/').pop();
    const getRes = await request(app)
      .get(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(200);
    expect(getRes.text).toBe(data.toString());
  });

  test('Invalid id Simulation', async () => {
    const res = await request(app)
      .get('/v1/fragments/invalidid')
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
  });
});

