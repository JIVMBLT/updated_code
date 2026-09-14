(function initManttoLabBootstrap(global) {
  'use strict';

  const ready = (async () => {
    if (!global.ManttoLabDB) throw new Error('MANTTO_LAB_DB_RUNTIME_MISSING');
    const status = await global.ManttoLabDB.init();
    global.__MANTTO_LAB__ = Object.freeze({
      enabled: true,
      lineage: 'LAB_DGB_V2',
      mode: 'DGB',
      syntheticDataOnly: true,
      productionConnectionsAllowed: false,
      database: status.database,
      schemaVersion: status.schemaVersion,
      seedVersion: status.seedVersion
    });
    return status;
  })();

  global.ManttoLabReady = ready;
})(typeof window !== 'undefined' ? window : globalThis);
