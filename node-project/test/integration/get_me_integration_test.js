
const AppServer = require('../../bin/app/server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = require('chai').expect;
chai.use(chaiHttp);

describe('Get Me', () => {
  let appServer = '';
  beforeEach(function () {
    appServer = new AppServer();
    this.server = appServer.server;
  });

  afterEach(function () {
    this.server.close();
  });

  it('Should error when view user for /users/v1/profile', (done) => {
    chai.request(appServer.server).get('/users/v1/profile').end((err, res) => {
      expect(res.status).to.equals(403);
      expect(err).to.equals(err);
      done();
    });
  });

  it('Should error invalid token for /users/v1/profile', (done) => {
    chai.request(appServer.server).get('/users/v1/profile')
      .set({ 'Authorization': 'Bearer dGVsa29tOmRhMWMyNWQ4LTM3YzgtNDFiMS1hZmUyLTQyZGQ0ODI1YmZlYQ==' })
      .then((res) => {
        expect(res.status).to.equals(401);
        done();
      }).catch((err) => done(err));
  });

});
