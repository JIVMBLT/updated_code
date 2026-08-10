const express = require('express');
const controller = require('./instalaciones-proyecto-drive.controller');
const { requireAuth } = require('../../middleware/auth.middleware');
const { requireProgrammerRole } = require('../../middleware/historical-sync.middleware');

const router = express.Router();

router.post('/proyecto-drive/sync', requireAuth, requireProgrammerRole, controller.syncProyectoDrive);
router.get('/proyecto-drive/:idProyecto', requireAuth, controller.getProyectoDrive);

module.exports = router;
