// [Aster | 2026-08-19 | ASTER-MG | FASE 4: Guard General por modulo]
const express = require('express');
const router = express.Router();
const portafolioController = require('./portafolio.controller');
const { requireIntegrationAuthFor } = require('../../middleware/integration-auth.middleware');
const {
  humanInformationGuard_gnral,
  dynamicHumanInformationGuard_gnral,
  requireCompleteInformationDomain_gnral
} = require('../../middleware/information-access-gnral.middleware');
const {
  requirePortafolioEquipmentScope_gnral,
  requirePortafolioProjectScope_gnral,
  filterPortafolioEquipmentBodyScope_gnral,
  requireContextualEquipmentScope_gnral
} = require('../../services/information-record-scope-gnral.service');

const requirePortafolioIntegration = requireIntegrationAuthFor('INTEGRATION_PORTAFOLIO_ID');
const UNITED_GROUPINGS = Object.freeze(['PORTAFOLIO', 'OPERACION', 'EXPERIMENTAL']);

const PORTAFOLIO_READ_PERMISSIONS = Object.freeze([
  'PORTAFOLIO_DASHBOARD_PORTAFOLIO_TABLA_PROYECTOS_PORTAFOLIO_TABLA_PORTAFOLIO.VER',
  'PORTAFOLIO_PROYECTOS_DE_MANTENIMIENTO_ACCESO_VISUAL_MODULO.ACCESO_VISUAL',
  'PORTAFOLIO_MOVIMIENTOS_PORTAFOLIO_ACCESO_VISUAL_MODULO.ACCESO_VISUAL',
  'OPERACION_RESUMEN_DEL_DIA_TICKET_PERIODO_TICKETS_DEL_PERIODO.VER_EQUIPO',
  'OPERACION_RESUMEN_DEL_DIA_TICKET_PERIODO_TICKETS_DEL_PERIODO.VER_PROYECTO',
  'OPERACION_DASHBOARD_CALL_CENTER_TABLA_EQUIPOS_EQUIPOS_CON_MAS_LLAMADAS_DEL_PERIODO.VER_EQUIPO',
  'OPERACION_DASHBOARD_CALL_CENTER_TABLA_PROYECTOS_PROYECTOS_CON_MAS_LLAMADAS_DEL_PERIODO.VER_PROYECTO',
  'OPERACION_EQUIPOS_CRITICOS_EQUIPOS_CRITICOS_EQUIPOS_CRITICOS.VER_EQUIPO',
  'OPERACION_EQUIPOS_CRITICOS_PROYECTOS_CRITICOS_PROYECTOS_CRITICOS.VER_PROYECTO',
  'RESUMEN_DIA_EXP_ACCESO_VISUAL_MODULO.ACCESO_VISUAL',
  'EQUIPOS_CRITICOS_EXP_ACCESO_VISUAL_MODULO.ACCESO_VISUAL',
  'DASHBOARD_CALL_CENTER_EXP_ACCESO_VISUAL_MODULO.ACCESO_VISUAL',
  'PROYECTOS_CRITICOS_EXP_ACCESO_VISUAL_MODULO.ACCESO_VISUAL'
]);

const PORTAFOLIO_DETAIL_PERMISSIONS = Object.freeze([
  'PORTAFOLIO_DASHBOARD_PORTAFOLIO_TABLA_PROYECTOS_PORTAFOLIO_TABLA_PORTAFOLIO.ABRIR_DETALLE',
  'PORTAFOLIO_DASHBOARD_PORTAFOLIO_TABLA_PROYECTOS_PORTAFOLIO_TABLA_PORTAFOLIO.VER_EQUIPO',
  'PORTAFOLIO_DASHBOARD_PORTAFOLIO_TABLA_PROYECTOS_PORTAFOLIO_TABLA_PORTAFOLIO.VER_PROYECTO',
  'PORTAFOLIO_PROYECTOS_DE_MANTENIMIENTO_ACCESO_VISUAL_MODULO.ACCESO_VISUAL',
  'OPERACION_RESUMEN_DEL_DIA_TICKET_PERIODO_TICKETS_DEL_PERIODO.VER_EQUIPO',
  'OPERACION_RESUMEN_DEL_DIA_TICKET_PERIODO_TICKETS_DEL_PERIODO.VER_PROYECTO',
  'OPERACION_DASHBOARD_CALL_CENTER_TABLA_EQUIPOS_EQUIPOS_CON_MAS_LLAMADAS_DEL_PERIODO.VER_EQUIPO',
  'OPERACION_DASHBOARD_CALL_CENTER_TABLA_PROYECTOS_PROYECTOS_CON_MAS_LLAMADAS_DEL_PERIODO.VER_PROYECTO',
  'OPERACION_EQUIPOS_CRITICOS_EQUIPOS_CRITICOS_EQUIPOS_CRITICOS.VER_EQUIPO',
  'OPERACION_EQUIPOS_CRITICOS_PROYECTOS_CRITICOS_PROYECTOS_CRITICOS.VER_PROYECTO',
  'RESUMEN_DIA_EXP_ACCESO_VISUAL_MODULO.ACCESO_VISUAL',
  'EQUIPOS_CRITICOS_EXP_ACCESO_VISUAL_MODULO.ACCESO_VISUAL',
  'DASHBOARD_CALL_CENTER_EXP_ACCESO_VISUAL_MODULO.ACCESO_VISUAL',
  'PROYECTOS_CRITICOS_EXP_ACCESO_VISUAL_MODULO.ACCESO_VISUAL'
]);

const portafolioReadGuard = humanInformationGuard_gnral({
  permissionCodesAny: PORTAFOLIO_READ_PERMISSIONS,
  domain: 'UNITED',
  groupingCodesAny: UNITED_GROUPINGS
});

const portafolioDetailGuard = humanInformationGuard_gnral({
  permissionCodesAny: PORTAFOLIO_DETAIL_PERMISSIONS,
  domain: 'UNITED',
  groupingCodesAny: UNITED_GROUPINGS
});

const movimientosGuard = humanInformationGuard_gnral({
  permissionCodesAny: [
    'PORTAFOLIO_MOVIMIENTOS_PORTAFOLIO_ACCESO_VISUAL_MODULO.ACCESO_VISUAL',
    'PORTAFOLIO_DASHBOARD_PORTAFOLIO_TABLA_PROYECTOS_PORTAFOLIO_TABLA_PORTAFOLIO.VER'
  ],
  domain: 'UNITED',
  groupingCodesAny: ['PORTAFOLIO']
});

const contextualEquipmentGuard = dynamicHumanInformationGuard_gnral((req) => {
  const raw = String(req.params?.codigo || '').trim();
  if (raw.includes('|||')) {
    return {
      permissionCodesAny: [
        'INSTALACIONES_PROYECTOS_TABLA_ACTIVOS_REGISTROS.ABRIR_DETALLE',
        'INSTALACIONES_PROYECTOS_TABLA_ACTIVOS_REGISTROS.VER'
      ],
      domain: 'CORELLIAN',
      groupingCodesAny: ['INSTALACIONES']
    };
  }
  return {
    permissionCodesAny: PORTAFOLIO_DETAIL_PERMISSIONS,
    domain: 'UNITED',
    groupingCodesAny: UNITED_GROUPINGS
  };
});

router.get('/portafolio/filtros', ...portafolioReadGuard, portafolioController.getPortafolioFiltros);
router.get('/portafolio/dashboard', ...portafolioReadGuard, portafolioController.getPortafolioDashboard);
router.get('/portafolio/movimientos', ...movimientosGuard, portafolioController.getPortafolioMovimientos);

// Los cortes semanales son snapshots globales ya materializados. Para no filtrar
// parcialmente JSON historico y producir una verdad incompleta, solo se exponen
// con acceso completo UNITED.
router.get(
  '/portafolio/movimientos-semanales/catalogo',
  ...movimientosGuard,
  requireCompleteInformationDomain_gnral('UNITED'),
  portafolioController.getPortafolioSemanasDisponibles
);
router.get(
  '/portafolio/movimientos-semanales',
  ...movimientosGuard,
  requireCompleteInformationDomain_gnral('UNITED'),
  portafolioController.getPortafolioMovimientosSemanales
);
router.get(
  '/portafolio/movimientos/:codigo/detalle',
  ...movimientosGuard,
  requirePortafolioEquipmentScope_gnral,
  portafolioController.getPortafolioMovimientoDetalle
);
router.post(
  '/portafolio/equipos/tickets-lote',
  ...portafolioDetailGuard,
  filterPortafolioEquipmentBodyScope_gnral,
  portafolioController.getPortafolioEquipoTicketsLote
);
router.get(
  '/portafolio/equipos/:codigo',
  ...contextualEquipmentGuard,
  requireContextualEquipmentScope_gnral,
  portafolioController.getPortafolioEquipoDetalle
);
router.get('/portafolio/equipos', ...portafolioReadGuard, portafolioController.getPortafolioEquipos);
router.get(
  '/portafolio/proyectos/detalle/:proyecto',
  ...portafolioDetailGuard,
  requirePortafolioProjectScope_gnral,
  portafolioController.getPortafolioProyectoDetalle
);
router.get('/portafolio', ...portafolioReadGuard, portafolioController.getPortafolio);
router.post('/portafolio/sync', requirePortafolioIntegration, portafolioController.syncPortafolio);
router.get('/equipos', ...portafolioReadGuard, portafolioController.getEquipos);

module.exports = router;
