const rp = require('request-promise');
const { InternalServerError } = require('../../../helpers/error');
const logger = require('../../../helpers/utils/logger');
const wrapper = require('../../../helpers/utils/wrapper');
const config = require('../../../infra/configs/global_config');
const validate = require('validate.js');
const Redis = require('../../../helpers/databases/redis/redis');
const redisClient = new Redis(config.get('/redis'));

const getfetchList = async () => {
  const ctx = 'getfetchList';
  const options = {
    uri: 'https://stein.efishery.com/v1/storages/5e1edf521073e315924ceab4/list',
    headers: {
      'Content-Type': 'application/json',
    },
    json: true
  };
  try {
    const result = await rp.get(options);
    return result;
  } catch (error) {
    logger.error(ctx, 'error','Internal server error', error);
    return wrapper.error(new InternalServerError('Internal server error'));
  }
};

const currencyConverter = async () => {
  const ctx = 'currencyConverter';
  const apiKey = 'fb59f316d37597acf927e8b1';
  const curency = await redisClient.getData('currency:IDR:USD');
  if (validate.isEmpty(curency.data)) {
    const options = {
      uri: `https://v6.exchangerate-api.com/v6/${apiKey}/pair/IDR/USD/1`,
      headers: {
        'Content-Type': 'application/json',
      },
      json: true
    };
    try {
      const result = await rp.get(options);
      if(result.result ==='success'){
        await redisClient.setDataEx('currency:IDR:USD', result, 60 * 60 * 24);
      }
      return result;
    } catch (error) {
      logger.error(ctx, 'error','Internal server error', error);
      return wrapper.error(new InternalServerError('Internal server error'));
    }
  }else{
    const temp = JSON.parse(curency.data);
    return temp.data;
  }
  
  
};

module.exports = {
  getfetchList,
  currencyConverter
};
