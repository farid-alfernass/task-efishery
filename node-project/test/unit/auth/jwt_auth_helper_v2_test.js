const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const jwtHelper = require('../../../bin/auth/jwt_auth_helper_v2');
const wrapper = require('../../../bin/helpers/utils/wrapper');

describe('Json Web Token', () => {
  let decodedToken = {
    'username': 'alifsn',
    'userId': 'userId',
    'sub': '5bac53b45ea76b1e9bd58e1c',
    'iat': '1540469257',
    'exp': '30d',
    'aud': '97b33193-43ff-4e58-9124-b3a9b9f72c34',
    'iss': 'telkomdev'
  };

  const response = (res, type, result, message = '') => {
    return {
      message,
      type,
      result
    };
  };

  beforeEach(() => {
    sinon.stub(wrapper, 'response').callsFake(response);
  });

  afterEach(() => {
    wrapper.response.restore();
  });

  describe('generateToken', () => {
    it('should success generate token', async () => {
      sinon.stub(Buffer, 'from').resolves();
      sinon.stub(jwt, 'sign').resolves(
        { test: 'test' },
        'public.pem',
        {
          algorithm: 'RS256',
          audience: '97b33193-43ff-4e58-9124-b3a9b9f72c34',
          issuer: 'telkomdev',
          expiresIn: '30d'
        }
      );
      await jwtHelper.generateToken({ test: 'test'});
      jwt.sign.restore();
      Buffer.from.restore();
    });
  });

  describe('generateRefreshToken', () => {
    it('should success generate token', async () => {
      sinon.stub(Buffer, 'from').resolves();
      sinon.stub(jwt, 'sign').resolves(
        { test: 'test' },
        'public.pem',
        {
          algorithm: 'RS256',
          audience: '97b33193-43ff-4e58-9124-b3a9b9f72c34',
          issuer: 'telkomdev',
          expiresIn: '30d'
        }
      );
      await jwtHelper.generateRefreshToken({ test: 'test'});
      jwt.sign.restore();
      Buffer.from.restore();
    });
  });

  describe('verifyToken', () => {
    it('should return error invalid token case 1', async() => {
      const req = {
        headers: {
          authorization: 'Bearer 12345'
        }
      };
      const res = {
        send: sinon.stub()
      };
      const next = sinon.stub();
      await jwtHelper.verifyToken(req, res, next);
    });

    it('should return error invalid token case 2', async() => {
      const req = {
        headers: {
          authorization: `Bearer 12345
          test 
          test`
        }
      };
      const res = {
        send: sinon.stub()
      };
      const next = sinon.stub();
      await jwtHelper.verifyToken(req, res, next);
    });

    it('should return error invalid token case 3', async() => {
      const req = {
        headers: {}
      };
      const res = {
        send: sinon.stub()
      };
      const next = sinon.stub();
      await jwtHelper.verifyToken(req, res, next);
    });
    it('should return true', async() => {
      const req = {
        headers: {
          authorization: 'Bearer 12345'
        }
      };
      const res = {
        send: sinon.stub()
      };
      const next = sinon.stub();
      sinon.stub(jwt, 'verify').resolves(decodedToken);
      sinon.stub(jwtHelper, 'verifyAccessToken').resolves({ data : { userId : 'id', accessToken: 'token'}});
      await jwtHelper.verifyToken(req, res, next);
      jwtHelper.verifyAccessToken.restore();
      jwt.verify.restore();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should return error invalid token', async() => {
      const token = '12345';
      await jwtHelper.verifyRefreshToken(token);
    });
    it('should return error user', async() => {
      const token = '12345';
      sinon.stub(jwt, 'verify').resolves(decodedToken);
      await jwtHelper.verifyRefreshToken(token);
      jwt.verify.restore();
    });
  });
});
