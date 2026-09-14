(function initManttoLabPhase6Bootstrap(global) {
  'use strict';

  const TARGET_USER_VERSION = 6;
  const VERSION = 'FASE_6_LAB_DGB_HOME_COMPLETO_V002';

  function rootUrl() {
    const src = document.currentScript?.src || '';
    if (src) return new URL('../', src).toString();
    return new URL('./lab/', global.location?.href || 'https://lab.invalid/').toString();
  }

  const LAB_ROOT = rootUrl();
  const MIGRATION_URL = new URL('database/migrations/006_home_services.sql', LAB_ROOT).toString();

  async function fetchText(url) {
    const response = await global.fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`LAB_PHASE6_RESOURCE_FAILED ${response.status} ${url}`);
    return response.text();
  }

  async function applyMigration() {
    if (global.ManttoLabPhase5Ready) await global.ManttoLabPhase5Ready;
    const db = global.ManttoLabDB;
    if (!db) throw new Error('MANTTO_LAB_DB_REQUIRED');
    const before = Number(db.scalar('PRAGMA user_version') || 0);
    if (before < TARGET_USER_VERSION) {
      const sql = await fetchText(MIGRATION_URL);
      await db.exec(sql, { persist: false });
      const violations = db.query('PRAGMA foreign_key_check');
      if (violations.length) throw new Error(`LAB_PHASE6_FOREIGN_KEY_CHECK_FAILED count=${violations.length}`);
      await db.persist('phase6-home-completo-v002-migration');
    }
    return {
      userVersion: Number(db.scalar('PRAGMA user_version') || 0),
      tasks: Number(db.scalar('SELECT COUNT(*) FROM pendientes') || 0),
      comments: Number(db.scalar('SELECT COUNT(*) FROM pendientes_comentarios') || 0),
      notifications: Number(db.scalar('SELECT COUNT(*) FROM sup_notificaciones') || 0),
      interactions: Number(db.scalar('SELECT COUNT(*) FROM usuario_interacciones') || 0),
      foreignKeyViolations: db.query('PRAGMA foreign_key_check').length
    };
  }

  async function registerRoutes() {
    const backend = global.ManttoLabBackend;
    if (!backend) throw new Error('MANTTO_LAB_BACKEND_REQUIRED');
    if (!global.ManttoLabHomeRoutes) throw new Error('MANTTO_LAB_PHASE6_ROUTES_REQUIRED');
    if (!backend.__phase6V002RoutesRegistered) {
      global.ManttoLabHomeRoutes.register(backend.router);
      backend.__phase6V002RoutesRegistered = true;
    }
    return backend.listRoutes();
  }

  async function resetDatabase() {
    if (global.ManttoLabBlobStore?.clear) await global.ManttoLabBlobStore.clear();
    if (!global.ManttoLabPhase5?.resetDatabase) throw new Error('MANTTO_LAB_PHASE5_REQUIRED');
    await global.ManttoLabPhase5.resetDatabase();
    const migration = await applyMigration();
    document?.dispatchEvent?.(new CustomEvent('mantto:lab-phase6-reset', { detail: migration }));
    return migration;
  }

  const ready = (async () => {
    if (global.ManttoLabPhase5Ready) await global.ManttoLabPhase5Ready;
    const migration = await applyMigration();
    const routes = await registerRoutes();
    const status = {
      ready: true,
      version: VERSION,
      migration,
      routes: routes.length,
      blobStore: 'IndexedDB',
      maxFileBytes: global.ManttoLabBlobStore?.MAX_FILE_BYTES || 25 * 1024 * 1024,
      productionConnectionsAllowed: false
    };
    document?.dispatchEvent?.(new CustomEvent('mantto:lab-phase6-ready', { detail: status }));
    return status;
  })();

  global.ManttoLabPhase6 = Object.freeze({
    VERSION,
    ready,
    applyMigration,
    resetDatabase,
    TARGET_USER_VERSION
  });
  global.ManttoLabPhase6Ready = ready;
})(typeof window !== 'undefined' ? window : globalThis);
