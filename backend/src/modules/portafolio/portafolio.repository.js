/**
 * Repositorio transicional del modulo Portafolio.
 *
 * FASE 2 UNITED Puertas/Cuartos:
 * las consultas humanas de Portafolio que listan, agregan o construyen filtros
 * dejan de depender del controlador legacy y consumen handlers _uni que aplican
 * req.informationAccess -> usuario_zop -> portafolio.zona_id.
 *
 * Los handlers no relacionados con el filtro territorial se conservan sin
 * cambios para minimizar riesgo durante la migracion incremental.
 */
const legacyController = require('../../controllers/data.controller');
const portafolioComercialUni = require('./portafolio-comercial_uni');
const portafolioConsultasUni = require('./portafolio-consultas_uni');

const handlers = Object.freeze({
  getPortafolioFiltros: portafolioConsultasUni.getPortafolioFiltros_uni,
  getPortafolioDashboard: portafolioComercialUni.getPortafolioDashboard_uni,
  getPortafolioMovimientos: portafolioConsultasUni.getPortafolioMovimientos_uni,
  getPortafolioSemanasDisponibles: legacyController.getPortafolioSemanasDisponibles,
  getPortafolioMovimientosSemanales: legacyController.getPortafolioMovimientosSemanales,
  getPortafolioMovimientoDetalle: portafolioConsultasUni.getPortafolioMovimientoDetalle_uni,
  getPortafolioEquipoTicketsLote: legacyController.getPortafolioEquipoTicketsLote,
  getPortafolioEquipoDetalle: portafolioConsultasUni.getPortafolioEquipoDetalle_uni,
  getPortafolioEquipos: portafolioComercialUni.getPortafolioEquipos_uni,
  getPortafolioProyectoDetalle: portafolioConsultasUni.getPortafolioProyectoDetalle_uni,
  getPortafolio: portafolioConsultasUni.getPortafolio_uni,
  syncPortafolio: legacyController.syncPortafolio,
  getEquipos: portafolioConsultasUni.getEquipos_uni
});

function getHandler(name) {
  const handler = handlers[name];
  if (typeof handler !== 'function') {
    throw new Error(`Handler de portafolio no disponible: ${name}`);
  }
  return handler;
}

module.exports = {
  getHandler
};
