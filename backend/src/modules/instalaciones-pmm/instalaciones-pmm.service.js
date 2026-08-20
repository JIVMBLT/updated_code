'use strict';

const reporteService = require('../instalaciones-reporte/instalaciones-reporte.service');

const PAGE_SIZE = 30;
const STATUS_03_PM = '03-PM';
const STATUS_04_M = '04-M';

function validationError(message, field, value) {
  const error = new Error(message);
  error.statusCode = 400;
  error.code = 'INSTALACIONES_PMM_VALIDATION';
  error.details = { field, value };
  return error;
}

function normalizePage(value) {
  if (value === undefined || value === null || value === '') return 1;
  const page = Number(value);
  if (!Number.isInteger(page) || page <= 0) {
    throw validationError('page debe ser un entero positivo.', 'page', value);
  }
  return page;
}

function pickVisualConfig(report, status) {
  const source = report && report.estados_visuales && typeof report.estados_visuales === 'object'
    ? report.estados_visuales
    : {};
  const byStatus = source.por_estatus && typeof source.por_estatus === 'object'
    ? source.por_estatus
    : {};
  const statusItems = Array.isArray(byStatus[status]) ? byStatus[status] : [];
  const allowedCodes = new Set(statusItems.map(item => String(item && item.codigo || '').trim()).filter(Boolean));
  const catalog = Array.isArray(source.catalogo)
    ? source.catalogo.filter(item => allowedCodes.has(String(item && item.codigo || '').trim()))
    : statusItems;

  return {
    catalogo: catalog,
    por_estatus: {
      [status]: statusItems
    }
  };
}

function baseRow(row) {
  return {
    id_ins_fl: row.id_ins_fl,
    id_proyecto: row.id_proyecto,
    estatus: row.estatus,
    id_sup: row.id_sup,
    supervisor_fl: row.supervisor_fl,
    proyecto: row.proyecto,
    referencia_sitio: row.referencia_sitio,
    comentarios_fl: row.comentarios_fl,
    estados_visuales_codigos: Array.isArray(row.estados_visuales_codigos)
      ? row.estados_visuales_codigos
      : []
  };
}

function map03Pm(row) {
  return {
    ...baseRow(row),
    avance_oc: row.avance_oc,
    fecha_posible_recepcion_cubo: row.fecha_posible_recepcion_cubo
  };
}

function map04M(row) {
  return {
    ...baseRow(row),
    avance_mo: row.avance_mo,
    fecha_ccr: row.fecha_ccr,
    subcontratista: row.subcontratista,
    fecha_inicio_montaje: row.fecha_inicio_montaje,
    fecha_fin_montaje_planeado: row.fecha_fin_montaje_planeado,
    fecha_fin_montaje_modificado: row.fecha_fin_montaje_modificado,
    fecha_fin_montaje_real: row.fecha_fin_montaje_real,
    dias_restantes: row.dias_restantes
  };
}

async function getStageTable(status, query, mapper, informationAccess) {
  const page = normalizePage(query && query.page);
  const offset = (page - 1) * PAGE_SIZE;

  const report = await reporteService.getReport({
    estatus: status,
    limit: PAGE_SIZE,
    offset
  }, informationAccess);

  const rows = Array.isArray(report && report.data) ? report.data : [];
  const total = Number(report && report.pagination && report.pagination.total || 0);

  return {
    module: 'instalaciones-pmm',
    tabla: status,
    generated_at: report.generated_at || new Date().toISOString(),
    fecha_reglas: report.fecha_reglas || null,
    pagination: {
      page,
      page_size: PAGE_SIZE,
      total,
      total_pages: Math.ceil(total / PAGE_SIZE),
      returned: rows.length
    },
    estados_visuales: pickVisualConfig(report, status),
    data: rows.map(mapper)
  };
}

function getTable03Pm(query = {}, informationAccess = null) {
  return getStageTable(STATUS_03_PM, query, map03Pm, informationAccess);
}

function getTable04M(query = {}, informationAccess = null) {
  return getStageTable(STATUS_04_M, query, map04M, informationAccess);
}

module.exports = {
  PAGE_SIZE,
  getTable03Pm,
  getTable04M
};
