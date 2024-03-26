// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('GET Info(Metadata) by Id', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments/testid').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments/testid').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated user get fragment Meta data associated with the given id', async () => {
    const data = Buffer.from('testing');
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(data);
    const id = postRes.headers.location.split('/').pop();
    const getRes = await request(app)
      .get(`/v1/fragments/${id}/info`)
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(200);
    expect(getRes.body).toHaveProperty('status');
    expect(getRes.body).toHaveProperty('id');
    expect(getRes.body).toHaveProperty('ownerId');
    expect(getRes.body).toHaveProperty('created');
    expect(getRes.body).toHaveProperty('updated');
    expect(getRes.body).toHaveProperty('type');
  });
});
