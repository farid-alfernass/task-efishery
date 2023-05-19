
const Query = require('./query');
const wrapper = require('../../../../helpers/utils/wrapper');
const { InternalServerError, UnauthorizedError } = require('../../../../helpers/error');
const service = require('../../utils/service');
const _ = require('lodash');
const moment = require('moment');
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
  
  async getFetchAgregate(roles) {
    if(!['admin'].includes(roles)){
      return wrapper.error(new UnauthorizedError('Role user not eligible to this action'));
    }
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
    const aggregatedData = _.chain(list)
    .groupBy((item) => {
      const week = moment(item.tgl_parsed).isoWeek();
      const year = moment(item.tgl_parsed).year();
      return `${year}-W${week}`;
    })
    .map((group) => {
      const areaProvinsi = group[0].area_provinsi;
      const weeklyPrice = _.map(group, (item) => parseInt(item.price));
      const weeklySize = _.map(group, (item) => parseInt(item.size));
  
      const sortedPrice = _.sortBy(weeklyPrice);
      const sortedSize = _.sortBy(weeklySize);
  
      const medianPrice = (sortedPrice[_.sortedIndex(sortedPrice, _.last(sortedPrice))] +
        sortedPrice[_.sortedLastIndex(sortedPrice, _.first(sortedPrice))]) / 2;
  
      const medianSize = (sortedSize[_.sortedIndex(sortedSize, _.last(sortedSize))] +
        sortedSize[_.sortedLastIndex(sortedSize, _.first(sortedSize))]) / 2;
  
      return {
        area_provinsi: areaProvinsi,
        week: group[0].tgl_parsed,
        minPrice: _.min(weeklyPrice),
        maxPrice: _.max(weeklyPrice),
        medianPrice: medianPrice,
        avgPrice: _.mean(weeklyPrice),
        minSize: _.min(weeklySize),
        maxSize: _.max(weeklySize),
        medianSize: medianSize,
        avgSize: _.mean(weeklySize),
      };
    })
    .value();


    return wrapper.data(aggregatedData);
  }
  
  async getFetchListConvertion() {
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
