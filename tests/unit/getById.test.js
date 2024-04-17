const request = require('supertest');
const fs = require('fs');
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
    const getRes = await request(app)
      .get(`/v1/fragments/${fragmentId}`)
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(200);
    expect(getRes.text).toBe('new fragment');
    expect(getRes.headers['content-type']).toBe('text/plain');
  });

  test('authenticated users get error if fragment does not exist', async () => {
    const getRes = await request(app)
      .get(`/v1/fragments/invalidID`)
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(404);
  });

  test('authenticated users convert a fragment from md to html as expected', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/markdown')
      .auth('user1@email.com', 'password1')
      .send('*heading*');
    const fragmentId = postRes.body.fragment.id;
    const getRes = await request(app)
      .get(`/v1/fragments/${fragmentId}.html`)
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(200);
    expect(getRes.text).toContain('<p><em>heading</em></p>');
    expect(getRes.headers['content-type']).toBe('text/html');
  });

  test('GET by ID existing image file', async () => {
    const req = await request(app)
      .post('/v1/fragments/')
      .auth('user1@email.com', 'password1')
      .set('Content-type', 'image/png')
      .send(fs.readFileSync(`${__dirname}/test-files/ss.png`));
    expect(req.status).toBe(201);

    const res = await request(app)
      .get(`/v1/fragments/${req.body.fragment.id}`)
      .auth('user1@email.com', 'password1');
    expect(res.type).toBe('image/png');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(Buffer.from(fs.readFileSync(`${__dirname}/test-files/ss.png`)));
  });
});
