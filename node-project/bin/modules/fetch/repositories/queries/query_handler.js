
const Fetch = require('./domain');
const Mongo = require('../../../../helpers/databases/mongodb/db');
const config = require('../../../../infra/configs/global_config');
const db = new Mongo(config.get('/mongoDbUrl'));
const fetchApp = new Fetch(db);

const getFetchList = async (role) => {
  const getData = (role) => fetchApp.getFetchList(role);
  return getData(role);
};

const getFetchListConvertion = async (role) => {
  const getData = (role) => fetchApp.getFetchListConvertion(role);
  return getData(role);
};

const getFetchAgregate = async (role) => {
  const getData = (role) => fetchApp.getFetchAgregate(role);
  return getData(role);
};

module.exports = {
  getFetchList,
  getFetchListConvertion,
  getFetchAgregate
};
