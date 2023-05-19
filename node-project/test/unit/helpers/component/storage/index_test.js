const assert = require('assert');
const sinon = require('sinon');
const fileType = require('file-type');
const fs = require('fs');
const oss = require('../../../../../bin/helpers/components/minio/blob');
const Storage = require('../../../../../bin/helpers/components/storage/index');

describe('Storage', () => {
  let filePayload;
  beforeEach(() => {
    filePayload = {
      rawFile: { size: 3000000, path: '/tmp/file.jpg' },
      name: 'file.jpg',
      folder: 'bucket/me'
    };
  });

  const storage = new Storage({});

  describe('Upload Document', () => {
    it('Should be error if file size limit exceeded', async () => {
      sinon.stub(fileType, 'fromFile').resolves({ ext: 'jpg' });
      sinon.stub(fs, 'createReadStream').returns({});
      const result = await storage.uploadDocument(filePayload);
      assert.equal(result.err.message, 'Ukuran file terlalu besar.');
      fileType.fromFile.restore();
      fs.createReadStream.restore();
    });
    it('Should be error if file type not allowed', async () => {
      filePayload.rawFile.size = 250000;
      sinon.stub(fileType, 'fromFile').resolves({ ext: 'gzip' });
      sinon.stub(fs, 'createReadStream').returns({});
      const result = await storage.uploadDocument(filePayload);
      assert.equal(result.err.message, 'Format file tidak dapat diterima.');
      fileType.fromFile.restore();
      fs.createReadStream.restore();
    });
    it('Should be error if file type not allowed (base64 handling)', async () => {
      filePayload.rawFile = 'dGVz';
      sinon.stub(fileType, 'fromBuffer').resolves({ ext: 'gzip' });
      const result = await storage.uploadDocument(filePayload);
      assert.equal(result.err.message, 'Format file tidak dapat diterima.');
      fileType.fromBuffer.restore();
    });
    it('Should be error if minio fail to upload', async () => {
      filePayload.rawFile.size = 250000;
      sinon.stub(fs, 'createReadStream');
      sinon.stub(fileType, 'fromFile').resolves({ ext: 'jpg' });
      sinon.stub(oss, 'objectUploadStream').resolves({ err: true });
      const result = await storage.uploadDocument(filePayload);
      assert.equal(result.err.message, 'Tidak dapat mengupload dokumen');
      fs.createReadStream.restore();
      oss.objectUploadStream.restore();
      fileType.fromFile.restore();
    });
    it('Should success uploading file', async () => {
      filePayload.rawFile.size = 250000;
      sinon.stub(fs, 'createReadStream');
      sinon.stub(fileType, 'fromFile').resolves({ ext: 'jpg' });
      sinon.stub(oss, 'objectUploadStream').resolves({
        err: null,
        data: { uri: 'minio/url/path/to/file' }
      });
      const result = await storage.uploadDocument(filePayload);
      assert.equal(result.data.uri, 'minio/url/path/to/file');
      fs.createReadStream.restore();
      oss.objectUploadStream.restore();
      fileType.fromFile.restore();
    });
  });
});
