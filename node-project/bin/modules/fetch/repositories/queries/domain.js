
const Query = require('./query');
const wrapper = require('../../../../helpers/utils/wrapper');
const { InternalServerError } = require('../../../../helpers/error');
const service = require('../../utils/service');
class FetchApp {

  constructor(db){
    this.query = new Query(db);
  }

  async getFetchList(roles) {
    const list = await service.getfetchList();
    if(list.err){
      return wrapper.error(new InternalServerError('Internal server error'));
    }
    return wrapper.data(list);
  }
  
  async getFetchListConvertion(roles) {
    const list = await service.getfetchList();
    if(list.err){
      return wrapper.error(new InternalServerError('Internal server error'));
    }
    // getcurrency
    let rate = 14880.6447;
    const currencyRate = await service.currencyConverter();
    if(!currencyRate.err){
      rate = currencyRate.conversion_result;
    }
    const result = list.map(item => {
      const usdPrice = parseFloat(item.price) * parseFloat(rate);
      return {
        ...item,
        price: {
          idr: item.price,
          usd: usdPrice.toFixed(2)
        }
      };
    });

    return wrapper.data(result);
  }

}

module.exports = FetchApp;
