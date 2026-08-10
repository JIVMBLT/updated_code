const express = require('express');
const controller = require('./instalaciones-drive.controller');
const { requireAuth } = require('../../middleware/auth.middleware');
const { requireProgrammerRole } = require('../../middleware/historical-sync.middleware');

const router = express.Router();

router.post('/drive/carpetas/sync', requireAuth, requireProgrammerRole, controller.syncCarpetas);

module.exports = router;
