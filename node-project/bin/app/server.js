const config = require('../infra/configs/global_config');
const { apm } = require('../helpers/components/monitoring/observability');
if (parseInt(config.get('/monitoring')) !== 0) {
  apm.init();
}
const { GracefulShutdown, livenessProbe, readinessProbe } = require('../helpers/components/joshu/graceful_shutdown');
const restify = require('restify');
const corsMiddleware = require('restify-cors-middleware2');
const project = require('../../package.json');
const basicAuth = require('../auth/basic_auth_helper');
const jwtAuth = require('../auth/jwt_auth_helper');
const wrapper = require('../helpers/utils/wrapper');
const userHandler = require('../modules/user/handlers/api_handler');
const fetchAppHandler = require('../modules/fetch/handlers/api_handler');
const mongoConnectionPooling = require('../helpers/databases/mongodb/connection');
const prometheus = require('../helpers/components/prometheus/prometheus');

class AppServer {

  constructor() {

    this.server = restify.createServer({
      name: `${project.name}-server`,
      version: project.version
    });

    this.init();

    this.server.serverKey = '';
    this.server.use(restify.plugins.acceptParser(this.server.acceptable));
    this.server.use(restify.plugins.queryParser());
    this.server.use(restify.plugins.bodyParser());
    this.server.use(restify.plugins.authorizationParser());

    if (parseInt(config.get('/monitoring')) === 1) {
      this.server.use(prometheus.responseCounters);
    }

    const corsConfig = corsMiddleware({
      preflightMaxAge: 5,
      origins: ['*'],
      // ['*'] -> to expose all header, any type header will be allow to access
      // X-Requested-With,content-type,GET, POST, PUT, PATCH, DELETE, OPTIONS -> header type
      allowHeaders: ['Authorization'],
      exposeHeaders: ['Authorization']
    });
    this.server.pre(corsConfig.preflight);
    this.server.use(corsConfig.actual);

    this.server.use(basicAuth.init());

    this.server.get('/', (req, res) => {
      wrapper.response(res, 'success', wrapper.data('Index'), 'This service is running properly');
    });

    this.server.get('/users/v1/profile', jwtAuth.verifyToken, userHandler.getUser);
    this.server.get('/fetch/v1/list', jwtAuth.verifyToken, fetchAppHandler.getFetchList);
    this.server.get('/fetch/v2/list', jwtAuth.verifyToken, fetchAppHandler.getFetchListConvertion);

    if (parseInt(config.get('/monitoring')) === 1) {
      prometheus.injectMetricsRoute(this.server);
      prometheus.startCollection();
    }
  }

  async init() {
    // Initiation
    try {
      await Promise.all([mongoConnectionPooling.init()]);

      const gs = new GracefulShutdown(parseInt(config.get('/shutdownDelay')));
      gs.enable(this.server);
      this.server.get('/healthz', livenessProbe(gs));
      this.server.get('/readyz', readinessProbe(gs));
    } catch (err) {
      this.server.close();
      throw err;
    }
  }
}

module.exports = AppServer;
