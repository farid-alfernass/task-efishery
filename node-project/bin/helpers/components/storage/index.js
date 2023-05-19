const validate = require('validate.js');
const fs = require('fs');
const fileType = require('file-type');
const { Buffer } = require('buffer');
const config = require('../../../infra/configs/global_config');
const logger = require('../../utils/logger');
const wrapper = require('../../utils/wrapper');
const { BadRequestError, InternalServerError } = require('../../error');

const provider = parseInt(config.get('/storage'));
const ctx = 'helper-storage';

class Storage {

  constructor(options) {
    const storageProvider = validate.isDefined(options.storage) ? options.storage : provider;
    // Consider using module name for storage provider option
    if (storageProvider === 1) {
      this.provider = require('../minio/blob.js');
    } else {
      this.provider = require('../ali-oss/oss.js');
    }
  }

  async uploadDocument(payload) {
    const allowedExt = ['jpg', 'jpeg', 'png', 'gif', 'x-png', 'bmp', 'JPG', 'PNG', 'GIF', 'BMP'];
    const limitSize = 2097152;
    const { bucket, rawFile, name, folder } = payload;

    const fileStream = {
      stream: {},
      ext: '',
      size: 0
    };
    if (validate.isString(rawFile)) {                                     // base64 handling
      fileStream.stream = Buffer.from(rawFile, 'base64');
      fileStream.size = fileStream.stream.length;
      const { ext } = await fileType.fromBuffer(fileStream.stream);
      fileStream.ext = ext;
    } else {                                                            // formdata file handling
      fileStream.stream = fs.createReadStream(rawFile.path);
      fileStream.size = rawFile.size;
      const { ext } = await fileType.fromFile(rawFile.path);
      fileStream.ext = ext;
    }

    if (fileStream.size > limitSize) {
      logger.log(ctx, 'false file size', 'uploadDocument');
      return wrapper.error(new BadRequestError('Ukuran file terlalu besar.'));
    }
    if (!allowedExt.find(ext => ext === fileStream.ext)) {
      logger.log(ctx, 'false file format', 'uploadDocument', fileStream.ext);
      return wrapper.error(new BadRequestError('Format file tidak dapat diterima.'));
    }

    const bucketName = validate.isEmpty(bucket) ? 'default-bucket' : bucket;
    const fileUpload = await this.provider.objectUploadStream(bucketName, `${folder}/${name}.${fileStream.ext}`, fileStream.stream);
    if (fileUpload.err) {
      logger.log(ctx, 'Cannot upload file', 'uploadDocument', fileUpload.err);
      return wrapper.error(new InternalServerError('Tidak dapat mengupload dokumen'));
    }
    return fileUpload;
  }
}

module.exports = Storage;
