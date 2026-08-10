const express = require('express');
const router = express.Router();
const ticketsController = require('./tickets.controller');
const { requireAuth } = require('../../middleware/auth.middleware');
const { requireProgrammerRole } = require('../../middleware/historical-sync.middleware');
router.use(requireAuth);

router.get('/tickets', ticketsController.getTickets);
router.get('/tickets/:ticket/interacciones', ticketsController.getTicketInteracciones);
router.post('/tickets/:ticket/comentarios', ticketsController.createTicketComentario);
router.post('/tickets/:ticket/validacion', ticketsController.saveTicketValidacion);
router.get('/tickets/:ticket', ticketsController.getTicketDetalle);
router.post('/tickets/:ticket/vobo', ticketsController.saveTicketVobo);
router.post('/tickets/sync', requireProgrammerRole, ticketsController.syncTickets);
router.post('/tickets/sync-fechas-cdmx', requireProgrammerRole, ticketsController.syncTicketDatesCdmx);

module.exports = router;
