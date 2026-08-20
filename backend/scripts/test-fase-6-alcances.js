'use strict';

const assert = require('assert');

const {
  resolveInformationDoor_gnral
} = require('../src/services/alcance/alcance-resolver.service');
const {
  normalizeNewPanelPayload_gnral,
  readPanelScope_gnral
} = require('../src/services/alcance/alcance-panel.service');
const {
  buildPortafolioScopeSql_gnral,
  buildTicketScopeSql_gnral,
  buildInsFlScopeSql_gnral
} = require('../src/services/information-record-scope-gnral.service');
const {
  resolveCrossInformationBlock_gnral,
  loadCrossInformationBlock_gnral
} = require('../src/services/alcance/informacion-cruzada.service');

function fakeExecutor(handler) {
  return {
    async query(sql, params) {
      return handler(String(sql), params || []);
    }
  };
}

async function testDoors() {
  const source = { user: { id_SB: 10 } };

  const generalDoor = await resolveInformationDoor_gnral(
    fakeExecutor(() => { throw new Error('GENERAL no debe consultar puerta.'); }),
    source,
    { id_agrupacion: 1, codigo: 'HOME', nombre: 'Inicio', empresa: 'GENERAL', activo: 1 }
  );
  assert.equal(generalDoor.allowed, true);
  assert.equal(generalDoor.via, 'GENERAL_DEFAULT');

  const coreDoor = await resolveInformationDoor_gnral(
    fakeExecutor((sql) => {
      if (sql.includes("tipo_alcance = 'DOMINIO_COMPLETO'")) return [[]];
      if (sql.includes("tipo_alcance = 'AGRUPACION'")) return [[{ id_alcance: 5 }]];
      throw new Error(`SQL no esperado CORELLIAN: ${sql}`);
    }),
    source,
    { id_agrupacion: 20, codigo: 'VENTAS', nombre: 'Ventas', empresa: 'CORELLIAN', activo: 1 }
  );
  assert.equal(coreDoor.allowed, true);
  assert.equal(coreDoor.masterAccess, false);
  assert.equal(coreDoor.via, 'AGRUPACION');

  const unitedMaster = await resolveInformationDoor_gnral(
    fakeExecutor((sql) => {
      if (sql.includes("tipo_alcance = 'DOMINIO_COMPLETO'")) return [[{ id_alcance: 7 }]];
      throw new Error(`SQL no esperado UNITED master: ${sql}`);
    }),
    source,
    { id_agrupacion: 30, codigo: 'PORTAFOLIO', nombre: 'Portafolio', empresa: 'UNITED', activo: 1 }
  );
  assert.equal(unitedMaster.allowed, true);
  assert.equal(unitedMaster.masterAccess, true);
}

async function testPanelContract() {
  const payload = normalizeNewPanelPayload_gnral({
    alcances: {
      corellian: {
        llave_maestra: false,
        agrupaciones: [20],
        ver_reporta_a: true,
        ver_rel_admin: true,
        usuarios_adicionales: [11, 12]
      },
      united: {
        llave_maestra: false,
        agrupaciones: [30],
        zonas: [2, 3]
      }
    }
  });
  assert.equal(payload.general.default, true);
  assert.deepEqual(payload.corellian.usuarios_adicionales, [11, 12]);
  assert.deepEqual(payload.united.zonas, [2, 3]);

  const executor = fakeExecutor((sql) => {
    if (sql.includes('FROM usuarios_alcance_informacion')) {
      return [[
        { id_alcance: 1, tipo_alcance: 'AGRUPACION', id_agrupacion: 20 },
        { id_alcance: 2, tipo_alcance: 'AGRUPACION', id_agrupacion: 30 },
        { id_alcance: 3, tipo_alcance: 'REPORTA_A' },
        { id_alcance: 4, tipo_alcance: 'USUARIO', id_usuario_visible: 11 }
      ]];
    }
    if (sql.includes('FROM perm_agrupaciones')) {
      return [[
        { id_agrupacion: 20, codigo: 'VENTAS', nombre: 'Ventas', empresa: 'CORELLIAN', activo: 1 },
        { id_agrupacion: 30, codigo: 'PORTAFOLIO', nombre: 'Portafolio', empresa: 'UNITED', activo: 1 }
      ]];
    }
    if (sql.includes('FROM usuario_zop')) {
      return [[{ id_zona: 2, zona: 'CENTRO', nombre: 'Centro' }]];
    }
    if (sql.includes('FROM z_op')) {
      return [[{ id_zona: 2, zona: 'CENTRO', nombre: 'Centro', estado: 1 }]];
    }
    throw new Error(`SQL no esperado panel: ${sql}`);
  });
  const read = await readPanelScope_gnral(executor, 10);
  assert.deepEqual(read.alcances.corellian.agrupaciones, [20]);
  assert.equal(read.alcances.corellian.ver_reporta_a, true);
  assert.deepEqual(read.alcances.corellian.usuarios_adicionales, [11]);
  assert.deepEqual(read.alcances.united.agrupaciones, [30]);
  assert.deepEqual(read.alcances.united.zonas, [2]);
  assert.equal(read.alcances.general.default, true);
}

function testRecordBridge() {
  const unitedReq = {
    informationAccess: {
      motor: 'alcance_uni',
      alcance: {
        motor: 'alcance_uni',
        empresa: 'UNITED',
        llave_maestra: false,
        requiere_filtro_zona: true,
        zona_ids: [2, 3]
      }
    }
  };
  const p = buildPortafolioScopeSql_gnral(unitedReq, 'p');
  assert.ok(p.sql.includes('p.zona_id IN'));
  assert.deepEqual(p.params, [2, 3]);
  const t = buildTicketScopeSql_gnral(unitedReq, 't');
  assert.ok(t.sql.includes('p_scope_uni_ticket.zona_id IN'));
  assert.deepEqual(t.params, [2, 3]);

  const corReq = {
    informationAccess: {
      motor: 'alcance_cor',
      alcance: {
        motor: 'alcance_cor',
        empresa: 'CORELLIAN',
        llave_maestra: false,
        requiere_filtro_usuario: true,
        usuarios_visibles: [10, 11]
      }
    }
  };
  const f = buildInsFlScopeSql_gnral(corReq, 'f');
  assert.ok(f.sql.includes('f.id_asesor IN'));
  assert.ok(f.sql.includes('f.id_sup IN'));
  assert.ok(f.sql.includes('f.id_admin IN'));
  assert.deepEqual(f.params, [10, 11, 10, 11, 10, 11]);
}

async function testCrossLayer() {
  const executor = fakeExecutor(() => [[]]);
  const source = { user: { id_SB: 10 } };
  let recordCalls = 0;
  let loadCalls = 0;
  const definition = {
    codigo: 'TICKETS',
    payloadKey: 'tickets',
    permissionCodesAny: ['TICKETS.VER'],
    groupingRef: { id_agrupacion: 30, codigo: 'OPERACION', nombre: 'Operacion', empresa: 'UNITED', activo: 1 },
    recordScopeCheck: async () => { recordCalls += 1; return true; },
    load: async () => { loadCalls += 1; return ['ok']; }
  };

  const functionalDenied = await resolveCrossInformationBlock_gnral(executor, source, definition, {
    permissionResolver: async () => false,
    doorResolver: async () => { throw new Error('No debe resolver puerta sin permiso.'); },
    scopeResolver: async () => { throw new Error('No debe resolver alcance sin permiso.'); }
  });
  assert.equal(functionalDenied.motivo, 'FUNCTIONAL_PERMISSION_DENIED');

  const doorDenied = await resolveCrossInformationBlock_gnral(executor, source, definition, {
    permissionResolver: async () => true,
    doorResolver: async () => ({ allowed: false }),
    scopeResolver: async () => { throw new Error('No debe resolver alcance con puerta cerrada.'); }
  });
  assert.equal(doorDenied.motivo, 'INFORMATION_DOOR_DENIED');
  assert.equal(recordCalls, 0);

  const loaded = await loadCrossInformationBlock_gnral(executor, source, definition, {
    permissionResolver: async () => true,
    doorResolver: async () => ({ allowed: true, masterAccess: false, grouping: definition.groupingRef, via: 'AGRUPACION' }),
    scopeResolver: async () => ({ motor: 'alcance_uni', empresa: 'UNITED', llave_maestra: false, agrupacion: definition.groupingRef })
  });
  assert.equal(loaded.incluido, true);
  assert.deepEqual(loaded.data, ['ok']);
  assert.equal(recordCalls, 1);
  assert.equal(loadCalls, 1);

  const masterDefinition = { ...definition, recordScopeCheck: async () => { throw new Error('Master no debe ejecutar recordScopeCheck.'); } };
  const master = await resolveCrossInformationBlock_gnral(executor, source, masterDefinition, {
    permissionResolver: async () => true,
    doorResolver: async () => ({ allowed: true, masterAccess: true, grouping: definition.groupingRef, via: 'DOMINIO_COMPLETO' }),
    scopeResolver: async () => ({ motor: 'alcance_uni', empresa: 'UNITED', llave_maestra: true, agrupacion: definition.groupingRef })
  });
  assert.equal(master.visible, true);
  assert.equal(master.llave_maestra, true);
}

(async () => {
  await testDoors();
  await testPanelContract();
  testRecordBridge();
  await testCrossLayer();
  console.log('FASE_6_ALCANCES_GLOBALES_V001: OK');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
