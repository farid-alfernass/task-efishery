const config = require('../../../infra/configs/global_config');

let apm;
if (parseInt(config.get('/monitoring')) === 1) {
  apm = require('../elastic-apm/apm');
} else if (parseInt(config.get('/monitoring')) === 2) {
  apm = require('../dd-trace/apm');
} else {
  apm = null;
}

let metric;
if (parseInt(config.get('/monitoring')) === 1) {
  metric = require('../prometheus/custom_metric');
} else if (parseInt(config.get('/monitoring')) === 2) {
  metric = require('../dd-trace/custom_metric');
} else {
  metric = null;
}

module.exports = {
  apm,
  metric,
};
