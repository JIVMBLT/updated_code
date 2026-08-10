const express = require('express');
const router = express.Router();
const insFlController = require('../controllers/ins-fl.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { requireProgrammerRole } = require('../middleware/historical-sync.middleware');
router.use(requireAuth);

router.post('/sync', requireProgrammerRole, insFlController.syncInsFl);
router.get('/', insFlController.getInsFl);
router.get('/proyectos', insFlController.getInsFlProjects);
router.get('/proyectos/fotografias', insFlController.getInsFlProjectPhotos);
router.patch('/proyectos/fotografias/:id_ppns/principal', requireRole('Programador'), insFlController.updateInsFlProjectMainPhoto);
router.get('/proyectos/concentrado-clientes', insFlController.getInsFlClientConcentrate);
router.get('/:id', insFlController.getInsFlById);

module.exports = router;
