/**
 * @name Server Configuration
 */

const compression = require('compression');
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDoc = require('swagger-jsdoc');
const swaggerDef = require('./public/swagger');
const bodyParser = require('body-parser');
const cors = require('cors');
const methodOverride = require('method-override');
const i18n = require('i18n');
const morgan = require('morgan');
const helmet = require('helmet');
const Connection = require('./connection');
const projectRoutes = require('./routes/projectRoutes');
const storyRoutes = require('./routes/storyRoutes');
const jiraRoutes = require('./routes/jiraRoutes');

// Global Variables
global.DB_CONNECTION = require('mongoose');
global.CONSOLE_LOGGER = require('./util/logger');
global.CONSTANTS = require('./util/constants');
global.MESSAGES = require('./locales/en.json');
global.MOMENT = require('moment');
global._ = require('lodash');

const connectionToDb = () => {
    Connection.checkConnection();
};

connectionToDb();


// Configure i18n for multilingual
i18n.configure({
    locales: ['en'],
    directory: `${__dirname}/locales`,
    extension: '.json',
    prefix: '',
    logDebugFn(msg) {
        if (process.env.LOCAL === 'true') {
            CONSOLE_LOGGER.debug(`i18n::${CONSTANTS.LOG_LEVEL}`, msg);
        }
    }
});

app.use(compression());
app.use(helmet());
app.use(i18n.init);
app.use(cookieParser());

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb', extended: true }));

app.use(cors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    exposedHeaders: ['x-auth-token']
}));

app.use(morgan('dev'));
app.use(methodOverride());

app.use(express.static('server/public'));

const spec = swaggerDoc(swaggerDef);
if (process.env.NODE_ENV !== 'production') {
    app.use('/api-docs/', swaggerUi.serve, swaggerUi.setup(spec));
}
// Landing Page
app.get('/', (req, res) => {
    res.send({
        status: 'ok',
        date: MOMENT()
    });
});
app.use('/project', projectRoutes);
app.use('/story', storyRoutes);
app.use('/jira', jiraRoutes);

module.exports = app;
