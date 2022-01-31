const express = require('express');

const routes = require('./routes');
require('./database');

const app = express();

app.disable('x-powered-by');
app.disable('server');
app.use(routes);

app.listen(process.env.PORT || 3000);
