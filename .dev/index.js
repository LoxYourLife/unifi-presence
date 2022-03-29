process.env.NODE_ENV = 'development';

const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const logger = require('./lib/Logger')('Express');
const path = require('path');
const fs = require('fs').promises;
const exphbs = require('express-handlebars');
const i18next = require('i18next');
const { onUpgrade, addWsToRouter } = require('./lib/webSocket');
const _ = require('lodash');

const getLanguage = async (defaultLanguage, templatePath, logger) => {
  let languages = {};
  try {
    const files = await fs.readdir(templatePath);
    languages = _.reduce(
      files,
      (acc, file) => {
        const content = require(path.resolve(templatePath, file));
        const language = file.replace('.js', '');
        acc[language] = {
          translation: content
        };
        return acc;
      },
      {}
    );
  } catch {
    logger.info('No language files available');
  }

  return i18next.init({
    lng: defaultLanguage,
    fallbackLng: Object.keys(languages),
    debug: false,
    resources: languages
  });
};
const createServer = async () => {
  const app = express();

  app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Cache-control, Accept, Authorization');
    next();
  });

  app.use(fileUpload({ createParentPath: true }));
  app.use(bodyParser.json());
  app.engine(
    '.hbs',
    exphbs({
      extname: '.hbs',
      layoutsDir: path.resolve(__dirname, 'views/layouts')
    })
  );
  app.set('view engine', '.hbs');

  app.set('views', [path.resolve(__dirname, 'views'), path.resolve(__dirname, '../templates')]);
  const translate = await getLanguage('de', path.resolve(__dirname, '../templates/lang'), logger);
  const handlbarsTranslate = (context, options) => {
    if (options && options.hash) {
      return translate(context, options.hash);
    }
    return translate(context);
  };
  const module = require(path.resolve(__dirname, '../webfrontend/htmlauth/express.js'));
  const plugin = module({
    router: addWsToRouter(express.Router()),
    static: express.static,
    logger,
    _,
    translate
  });
  app.use('/admin/plugins/unifi_presence', async (req, res, next) => {
    const originalRender = res.render;

    res.render = (view, options, fn) => {
      if (_.has(options, 'helpers')) {
        options.helpers = _.assign({ t: handlbarsTranslate }, _.get(options, 'helpers'));
      } else {
        options.helpers = { t: handlbarsTranslate };
      }
      originalRender.call(res, view, options, fn);
    };
    await plugin(req, res, next);
  });
  app.use('/admin/plugins/unifi_presence', express.static(path.resolve(__dirname, '../webfrontend/htmlauth/')));

  app.get('*', (req, res, next) => {
    if (req.ws) return next();
    logger.info(`ACCESS 404 ${req.method} ${req.url}`);
    res.status(404);
  });

  const server = app.listen(3000, '0.0.0.0', () => {
    logger.info(`LoxBerry Express Server listening at http://localhost:3000`);
  });

  server.on('upgrade', onUpgrade(app));
};

createServer();
