const express = require('express');
const router = express.Router();
const logisticaController = require('../controllers/logistica.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireProgrammerRole } = require('../middleware/historical-sync.middleware');
router.use(requireAuth);

router.post('/sync', requireProgrammerRole, logisticaController.syncLogOps);
router.get('/', logisticaController.getLogOps);
router.get('/:id', logisticaController.getLogOpsById);

module.exports = router;
