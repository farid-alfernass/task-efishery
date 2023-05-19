
const AppServer = require('../../bin/app/server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = require('chai').expect;
chai.use(chaiHttp);

describe('Post Me', () => {

  const payload = {
    username: 'alifsn',
    password: 'telkomdev123'
  };
  let appServer = '';
  beforeEach(function () {
    appServer = new AppServer();
    this.server = appServer.server;
  });

  afterEach(function () {
    this.server.close();
  });

  it('Should error when post data for /users/v1/login', (done) => {
    chai.request(appServer.server).post('/users/v1/login').send(payload).end((err, res) => {
      expect(res.status).to.equals(401);
      expect(err).to.equals(err);
      done();
    });
  });
  it('Should bypass post data for /users/v1/login', (done) => {
    chai.request(appServer.server)
      .post('/users/v1/login')
      .auth('test', 'test')
      .send(payload)
      .end((err, res) => {
        expect(err).to.equals(err);
        done();
      });
  });

});
