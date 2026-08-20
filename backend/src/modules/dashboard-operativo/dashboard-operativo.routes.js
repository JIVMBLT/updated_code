'use strict';

const express = require('express');
const dashboardOperativoController = require('./dashboard-operativo.controller');
const { humanInformationGuard_gnral } = require('../../middleware/information-access-gnral.middleware');

const router = express.Router();

const preventivosSupervisorGuard_uni = humanInformationGuard_gnral({
  permissionCode: 'OPERACION_DASHBOARD_OPERATIVO_GRAFICAS_SERVICIO_PREVENTIVO_POR_SUPERVISOR.VER',
  domain: 'UNITED',
  groupingCode: 'OPERACION'
});

router.get(
  '/servicios-preventivos/resumen-supervisor',
  ...preventivosSupervisorGuard_uni,
  dashboardOperativoController.getPreventivosSupervisor
);

module.exports = router;
