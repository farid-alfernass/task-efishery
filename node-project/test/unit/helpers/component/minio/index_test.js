
const assert = require('assert');
const sinon = require('sinon');
const logger = require('../../../../../bin/helpers/utils/logger');
const Minio = require('minio');
const db = require('../../../../../bin/helpers/components/minio/blob');

describe('Minio', () => {
  beforeEach(() => {
    sinon.stub(logger, 'log');
  });
  afterEach(() => {
    logger.log.restore();
  });

  describe('#objectUploadStream', () => {
    const streamBuffer = new Buffer('Image');
    const argObjectName = 'imageName';
    it('should be cover success path object upload stream', async () => {
      sinon.stub(Minio.Client.prototype, 'putObject').returns({ err: null });
      const res = await db.objectUploadStream('logee-trans', argObjectName, streamBuffer);
      assert.equal(res.err, null);
      Minio.Client.prototype.putObject.restore();
    });
    it('should be cover error path object upload stream', async () => {
      await db.objectUploadStream('logee-trans', argObjectName, streamBuffer);
    });
  });
});
