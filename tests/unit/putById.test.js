const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments/:id', () => {
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/randomid').expect(401));

  test('incorrect credentials are denied', () =>
    request(app)
      .get('/v1/fragments/randomid')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  test('authenticated users get a the fragment as expected', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1')
      .send('new fragment');
    const fragmentId = postRes.body.fragment.id;
    await request(app)
      .put(`/v1/fragments/${fragmentId}`)
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1')
      .send('updated fragment');
    const getRes = await request(app)
      .get(`/v1/fragments/${fragmentId}`)
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(200);
    expect(getRes.statusCode).toBe(200);
    expect(getRes.text).toBe('updated fragment');
    expect(getRes.headers['content-type']).toBe('text/plain');
  });

  test('authenticated users get error if fragment does not exist', async () => {
    const getRes = await request(app)
      .get(`/v1/fragments/invalidID`)
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(404);
  });
});
