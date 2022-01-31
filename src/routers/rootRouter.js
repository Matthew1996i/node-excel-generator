const { Router } = require('express');
const { rootController } = require('../controllers');

const rootRouter = Router();

rootRouter.get('/', rootController.index);

module.exports = rootRouter;
