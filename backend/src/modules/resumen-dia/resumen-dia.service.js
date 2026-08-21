'use strict';

const repository = require('./resumen-dia.repository');

function normalizePositiveIds(values) {
  return [...new Set((Array.isArray(values) ? values : [])
    .map(Number)
    .filter((value) => Number.isInteger(value) && value > 0))]
    .sort((a, b) => a - b);
}

function normalizeCodes(values) {
  return [...new Set((Array.isArray(values) ? values : [])
    .map((value) => String(value || '').trim().toUpperCase())
    .filter(Boolean))]
    .sort();
}

async function getInitialData(req) {
  const access = req?.informationAccess || null;
  const zoneIds = normalizePositiveIds(access?.zona_ids);
  const zoneCodes = normalizeCodes(access?.zona_codigos);

  // Fail closed adicional. El Guard UNITED debe resolver siempre usuario_zop;
  // si por cualquier motivo no entrego cuartos, este modulo no consulta datos.
  if (!access || access.dominio !== 'UNITED' || access.requiere_filtro_zona !== true || !zoneIds.length) {
    return {
      ok: true,
      source: 'aiven',
      data: {
        tickets: [],
        portafolio: []
      },
      alcance: {
        zona_ids: zoneIds,
        zonas: zoneCodes
      },
      total: {
        tickets: 0,
        portafolio: 0
      }
    };
  }

  const data = await repository.getInitialData(req);

  return {
    ok: true,
    source: 'aiven',
    data: {
      tickets: data.tickets,
      portafolio: data.portafolio
    },
    alcance: {
      zona_ids: zoneIds,
      zonas: zoneCodes
    },
    total: {
      tickets: data.tickets.length,
      portafolio: data.portafolio.length
    }
  };
}

module.exports = {
  getInitialData
};
