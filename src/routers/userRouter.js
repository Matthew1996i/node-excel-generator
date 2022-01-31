const { Router } = require('express');
const { userController, excelController } = require('../controllers');

const rootRouter = Router();

rootRouter.get('/', userController.index);
rootRouter.get('/fulldata', userController.sendFullData);
rootRouter.get('/exceljson', excelController.excelJson);
rootRouter.get('/stream', excelController.stream);

module.exports = rootRouter;
