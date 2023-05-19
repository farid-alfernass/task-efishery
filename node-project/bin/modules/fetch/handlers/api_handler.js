
const wrapper = require('../../../helpers/utils/wrapper');
const queryHandler = require('../repositories/queries/query_handler');
const { ERROR:httpError, SUCCESS:http } = require('../../../helpers/http-status/status_code');

const getFetchList = async (req, res) => {
  const { roles } = req;
  const getData = async () => queryHandler.getFetchList(roles);
  const sendResponse = async (result) => {
    (result.err)
      ? wrapper.response(res, 'fail', result, 'Get Fetch List', httpError.NOT_FOUND)
      : wrapper.response(res, 'success', result, 'Get Fetch List', http.OK);
  };
  sendResponse(await getData());
};

const getFetchListConvertion = async (req, res) => {
  const { roles } = req;
  const getData = async () => queryHandler.getFetchListConvertion(roles);
  const sendResponse = async (result) => {
    (result.err)
      ? wrapper.response(res, 'fail', result, 'Get Fetch List', httpError.NOT_FOUND)
      : wrapper.response(res, 'success', result, 'Get Fetch List', http.OK);
  };
  sendResponse(await getData());
};

const getFetchAgregate = async (req, res) => {
  const { roles } = req;
  const getData = async () => queryHandler.getFetchAgregate(roles);
  const sendResponse = async (result) => {
    (result.err)
      ? wrapper.response(res, 'fail', result, 'Get Fetch Agregate', httpError.NOT_FOUND)
      : wrapper.response(res, 'success', result, 'Get Fetch Agregate', http.OK);
  };
  sendResponse(await getData());
};

module.exports = {
  getFetchList,
  getFetchListConvertion,
  getFetchAgregate
};
