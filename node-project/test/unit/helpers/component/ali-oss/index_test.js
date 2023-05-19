
const assert = require('assert');
const sinon = require('sinon');
const logger = require('../../../../../bin/helpers/utils/logger');
const AliOSS = require('ali-oss');
const db = require('../../../../../bin/helpers/components/ali-oss/oss');

describe('Ali-oss', () => {
  beforeEach(() => {
    sinon.stub(logger, 'log');
  });
  afterEach(() => {
    logger.log.restore();
  });

  describe('#objectUploadStream', () => {
    const streamBuffer = new Buffer('Image');
    it('should be cover success path object upload stream', async () => {
      sinon.stub(AliOSS.prototype, 'put').returns({ err: null, data: 'test' });
      const res = await db.objectUploadStream('logee-trans', streamBuffer);
      assert.equal(res.err, null);
      AliOSS.prototype.put.restore();
    });
    it('should be cover error path object upload stream', async () => {
      await db.objectUploadStream('logee-trans', streamBuffer);
    });
  });
});
