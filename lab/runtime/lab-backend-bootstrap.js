(function initManttoLabBackendBootstrap(global) {
  'use strict';

  const ready = (async () => {
    if (global.ManttoLabReady) await global.ManttoLabReady;
    if (!global.ManttoLabBackendModule) throw new Error('MANTTO_LAB_BACKEND_MODULE_MISSING');
    if (!global.ManttoLabSystemRoutes) throw new Error('MANTTO_LAB_SYSTEM_ROUTES_MISSING');

    const backend = global.ManttoLabBackendModule.create({
      db: global.ManttoLabDB,
      debug: true
    });

    global.ManttoLabSystemRoutes.register(backend.router);
    await backend.init();

    global.ManttoLabBackend = backend;
    return backend.getStatus();
  })();

  global.ManttoLabBackendReady = ready;
})(typeof window !== 'undefined' ? window : globalThis);
