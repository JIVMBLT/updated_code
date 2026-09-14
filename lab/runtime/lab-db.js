(function initManttoLabDatabase(global) {
  'use strict';

  const IDB_NAME = 'mantto_lab_dgb_v2';
  const IDB_VERSION = 1;
  const IDB_STORE = 'sqlite';
  const IDB_KEY = 'gestor_mantto_lab_v2';

  const scriptUrl = (typeof document !== 'undefined' && document.currentScript && document.currentScript.src)
    ? new URL(document.currentScript.src)
    : null;
  const labBaseUrl = scriptUrl
    ? new URL('../', scriptUrl)
    : (global.location ? new URL('./lab/', global.location.href) : null);

  let SQL = null;
  let db = null;
  let idb = null;
  let currentVersion = null;
  let storedMetadata = null;
  let initPromise = null;

  function assertReady() {
    if (!db) throw new Error('LAB_DB_NOT_READY');
  }

  function resolveLabUrl(relativeOrAbsolute) {
    if (!labBaseUrl) throw new Error('LAB_BASE_URL_UNAVAILABLE');
    const resolved = new URL(String(relativeOrAbsolute || ''), labBaseUrl);
    if (global.location && /^https?:$/.test(global.location.protocol) && resolved.origin !== global.location.origin) {
      throw new Error(`LAB_EXTERNAL_RESOURCE_BLOCKED ${resolved.origin}`);
    }
    return resolved.href;
  }

  function resourceUrls(options) {
    const cfg = options || {};
    return {
      schema: resolveLabUrl(cfg.schemaUrl || './database/schema.sql'),
      seed: resolveLabUrl(cfg.seedUrl || './database/seed.sql'),
      version: resolveLabUrl(cfg.versionUrl || './database/version.json'),
      wasm: resolveLabUrl(cfg.wasmUrl || './vendor/sql.js/1.14.2/sql-wasm.wasm')
    };
  }

  function dispatch(name, detail) {
    if (typeof document === 'undefined' || typeof CustomEvent === 'undefined') return;
    document.dispatchEvent(new CustomEvent(name, { detail: detail || {} }));
  }

  function requestToPromise(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('INDEXEDDB_REQUEST_FAILED'));
    });
  }

  function transactionDone(transaction) {
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error('INDEXEDDB_TRANSACTION_FAILED'));
      transaction.onabort = () => reject(transaction.error || new Error('INDEXEDDB_TRANSACTION_ABORTED'));
    });
  }

  async function openIndexedDb() {
    if (idb) return idb;
    if (!global.indexedDB) throw new Error('INDEXEDDB_NOT_AVAILABLE');

    idb = await new Promise((resolve, reject) => {
      const request = global.indexedDB.open(IDB_NAME, IDB_VERSION);
      request.onupgradeneeded = () => {
        const nextDb = request.result;
        if (!nextDb.objectStoreNames.contains(IDB_STORE)) nextDb.createObjectStore(IDB_STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('INDEXEDDB_OPEN_FAILED'));
    });
    return idb;
  }

  async function idbGet(key) {
    const database = await openIndexedDb();
    const tx = database.transaction(IDB_STORE, 'readonly');
    const result = await requestToPromise(tx.objectStore(IDB_STORE).get(key));
    await transactionDone(tx);
    return result || null;
  }

  async function idbPut(key, value) {
    const database = await openIndexedDb();
    const tx = database.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(value, key);
    await transactionDone(tx);
  }

  async function idbDelete(key) {
    const database = await openIndexedDb();
    const tx = database.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).delete(key);
    await transactionDone(tx);
  }

  async function fetchText(url) {
    const response = await global.fetch(url, { cache: 'no-store', credentials: 'same-origin' });
    if (!response.ok) throw new Error(`LAB_DB_RESOURCE_FAILED ${response.status} ${url}`);
    return response.text();
  }

  async function fetchJson(url) {
    const response = await global.fetch(url, { cache: 'no-store', credentials: 'same-origin' });
    if (!response.ok) throw new Error(`LAB_DB_RESOURCE_FAILED ${response.status} ${url}`);
    return response.json();
  }

  async function loadSqlJs(wasmUrl) {
    if (SQL) return SQL;
    if (typeof global.initSqlJs !== 'function') throw new Error('SQLJS_NOT_LOADED');
    SQL = await global.initSqlJs({ locateFile: () => wasmUrl });
    return SQL;
  }


  function normalizeBytes(input) {
    if (input instanceof Uint8Array) return new Uint8Array(input);
    if (input instanceof ArrayBuffer) return new Uint8Array(input.slice(0));
    if (ArrayBuffer.isView(input)) return new Uint8Array(input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength));
    throw new TypeError('LAB_DB_IMPORT_BYTES_REQUIRED');
  }

  function hasSqliteHeader(bytes) {
    const expected = [83,81,76,105,116,101,32,102,111,114,109,97,116,32,51,0];
    return bytes.length >= expected.length && expected.every((value, index) => bytes[index] === value);
  }

  function candidateQuery(candidate, sql, params) {
    const stmt = candidate.prepare(sql);
    const rows = [];
    try {
      if (params !== undefined) stmt.bind(params);
      while (stmt.step()) rows.push(stmt.getAsObject());
      return rows;
    } finally {
      stmt.free();
    }
  }

  function candidateScalar(candidate, sql, params) {
    const rows = candidateQuery(candidate, sql, params);
    if (!rows.length) return null;
    return rows[0][Object.keys(rows[0])[0]];
  }

  async function inspectBytes(input, options) {
    const cfg = options || {};
    const urls = resourceUrls({});
    if (!currentVersion) currentVersion = await fetchJson(urls.version);
    await loadSqlJs(urls.wasm);
    const bytes = normalizeBytes(input);
    if (!hasSqliteHeader(bytes)) {
      throw Object.assign(new Error('El archivo no contiene una base SQLite válida.'), { code: 'LAB_DB_IMPORT_HEADER_INVALID' });
    }
    let candidate = null;
    try {
      candidate = new SQL.Database(bytes);
      candidate.exec('PRAGMA foreign_keys = ON;');
      const tables = Number(candidateScalar(candidate, "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'") || 0);
      const userVersion = Number(candidateScalar(candidate, 'PRAGMA user_version') || 0);
      const foreignKeyViolations = candidateQuery(candidate, 'PRAGMA foreign_key_check').length;
      const expectedTables = Number(cfg.expectedTables ?? currentVersion?.tables ?? 0);
      if (expectedTables > 0 && tables !== expectedTables) {
        throw Object.assign(new Error(`Conteo de tablas incompatible. expected=${expectedTables} actual=${tables}`), { code: 'LAB_DB_IMPORT_TABLE_COUNT_MISMATCH' });
      }
      if (cfg.expectedUserVersion !== undefined && userVersion !== Number(cfg.expectedUserVersion)) {
        throw Object.assign(new Error(`PRAGMA user_version incompatible. expected=${cfg.expectedUserVersion} actual=${userVersion}`), { code: 'LAB_DB_IMPORT_USER_VERSION_MISMATCH' });
      }
      if (cfg.minUserVersion !== undefined && userVersion < Number(cfg.minUserVersion)) {
        throw Object.assign(new Error(`PRAGMA user_version demasiado antiguo. min=${cfg.minUserVersion} actual=${userVersion}`), { code: 'LAB_DB_IMPORT_USER_VERSION_TOO_OLD' });
      }
      if (foreignKeyViolations !== 0) {
        throw Object.assign(new Error(`La base importada viola llaves foráneas. count=${foreignKeyViolations}`), { code: 'LAB_DB_IMPORT_FOREIGN_KEY_FAILED' });
      }
      const requiredTables = Array.isArray(cfg.requiredTables) && cfg.requiredTables.length
        ? cfg.requiredTables
        : ['usuarios','roles','portafolio','tickets','pendientes'];
      for (const table of requiredTables) {
        const exists = Number(candidateScalar(candidate, "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name=?", [String(table)]) || 0);
        if (!exists) throw Object.assign(new Error(`Falta tabla requerida: ${table}`), { code: 'LAB_DB_IMPORT_REQUIRED_TABLE_MISSING' });
      }
      return { valid: true, bytes: bytes.length, tables, userVersion, foreignKeyViolations };
    } catch (error) {
      if (error?.code) throw error;
      throw Object.assign(new Error(`Base SQLite LAB inválida: ${error?.message || String(error)}`), { code: 'LAB_DB_IMPORT_INVALID' });
    } finally {
      try { candidate?.close(); } catch (_error) {}
    }
  }

  function scalar(sql, params) {
    assertReady();
    const stmt = db.prepare(sql);
    try {
      if (params !== undefined) stmt.bind(params);
      return stmt.step() ? stmt.get()[0] : null;
    } finally {
      stmt.free();
    }
  }

  function query(sql, params) {
    assertReady();
    const stmt = db.prepare(sql);
    const rows = [];
    try {
      if (params !== undefined) stmt.bind(params);
      while (stmt.step()) rows.push(stmt.getAsObject());
      return rows;
    } finally {
      stmt.free();
    }
  }

  function executeNoPersist(sql, params) {
    assertReady();
    if (params === undefined) db.run(sql);
    else db.run(sql, params);
    return {
      changes: Number(scalar('SELECT changes()') || 0),
      lastInsertRowId: Number(scalar('SELECT last_insert_rowid()') || 0)
    };
  }

  async function persist(reason) {
    assertReady();
    const bytes = db.export();
    const payload = {
      bytes: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
      lineage: String(currentVersion?.lineage || ''),
      schemaVersion: Number(currentVersion?.schema_version || 0),
      seedVersion: Number(currentVersion?.seed_version || 0),
      sqliteUserVersion: Number(scalar('PRAGMA user_version') || 0),
      savedAt: new Date().toISOString(),
      reason: String(reason || 'persist')
    };
    await idbPut(IDB_KEY, payload);
    storedMetadata = payload;
    dispatch('mantto:lab-db-persisted', {
      schemaVersion: payload.schemaVersion,
      seedVersion: payload.seedVersion,
      savedAt: payload.savedAt,
      reason: payload.reason
    });
    return payload;
  }

  async function run(sql, params, options) {
    const result = executeNoPersist(sql, params);
    if (options?.persist !== false) await persist(options?.reason || 'run');
    return result;
  }

  async function exec(sql, options) {
    assertReady();
    db.exec(sql);
    if (options?.persist !== false) await persist(options?.reason || 'exec');
  }

  async function transaction(work, options) {
    assertReady();
    if (typeof work !== 'function') throw new TypeError('LAB_DB_TRANSACTION_CALLBACK_REQUIRED');
    db.run('BEGIN IMMEDIATE TRANSACTION');
    try {
      const result = await work({
        query,
        scalar,
        run: (sql, params) => executeNoPersist(sql, params),
        exec: sql => db.exec(sql)
      });
      db.run('COMMIT');
      if (options?.persist !== false) await persist(options?.reason || 'transaction');
      return result;
    } catch (error) {
      try { db.run('ROLLBACK'); } catch (_rollbackError) {}
      throw error;
    }
  }

  function databaseStatistics() {
    assertReady();
    return {
      tables: Number(scalar("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'") || 0),
      users: Number(scalar('SELECT COUNT(*) FROM usuarios') || 0),
      projects: Number(scalar('SELECT COUNT(*) FROM cobranza_proyectos') || 0),
      equipment: Number(scalar('SELECT COUNT(*) FROM portafolio') || 0),
      tickets: Number(scalar('SELECT COUNT(*) FROM tickets') || 0),
      tasks: Number(scalar('SELECT COUNT(*) FROM pendientes') || 0),
      sqliteUserVersion: Number(scalar('PRAGMA user_version') || 0),
      foreignKeyViolations: query('PRAGMA foreign_key_check').length
    };
  }

  function validateFreshDatabase() {
    const stats = databaseStatistics();
    if (stats.tables !== Number(currentVersion?.tables || 0)) {
      throw new Error(`LAB_DB_TABLE_COUNT_MISMATCH expected=${currentVersion?.tables} actual=${stats.tables}`);
    }
    if (stats.sqliteUserVersion !== Number(currentVersion?.schema_version || 0)) {
      throw new Error(`LAB_DB_USER_VERSION_MISMATCH expected=${currentVersion?.schema_version} actual=${stats.sqliteUserVersion}`);
    }
    if (stats.foreignKeyViolations !== 0) {
      throw new Error(`LAB_DB_FOREIGN_KEY_CHECK_FAILED count=${stats.foreignKeyViolations}`);
    }
    if (stats.users <= 0 || stats.projects <= 0 || stats.equipment <= 0) {
      throw new Error('LAB_DB_REQUIRED_FIXTURES_MISSING');
    }
    return stats;
  }

  async function createFreshDatabase(urls) {
    const [schema, seed] = await Promise.all([fetchText(urls.schema), fetchText(urls.seed)]);
    db = new SQL.Database();
    db.exec(schema);
    db.exec(seed);
    db.exec('PRAGMA foreign_keys = ON;');
    const validation = validateFreshDatabase();
    await persist('fresh-seed');
    return validation;
  }

  async function restoreStoredDatabase(payload) {
    if (!payload?.bytes) throw new Error('LAB_DB_STORED_BYTES_MISSING');
    if (payload.lineage && currentVersion?.lineage && payload.lineage !== currentVersion.lineage) {
      throw new Error('LAB_DB_LINEAGE_MISMATCH_RESET_REQUIRED');
    }
    db = new SQL.Database(new Uint8Array(payload.bytes));
    db.exec('PRAGMA foreign_keys = ON;');
    storedMetadata = payload;
  }

  async function init(options) {
    if (initPromise && !options?.force) return initPromise;
    initPromise = (async () => {
      const urls = resourceUrls(options);
      currentVersion = await fetchJson(urls.version);
      await loadSqlJs(urls.wasm);
      const stored = await idbGet(IDB_KEY);

      let source = 'indexeddb';
      let validation = null;
      if (!stored || options?.reset === true) {
        if (stored && options?.reset === true) await idbDelete(IDB_KEY);
        validation = await createFreshDatabase(urls);
        source = 'seed';
      } else {
        await restoreStoredDatabase(stored);
      }

      const status = getStatus();
      status.source = source;
      status.validation = validation;
      dispatch('mantto:lab-db-ready', status);
      return status;
    })();

    try {
      return await initPromise;
    } catch (error) {
      initPromise = null;
      dispatch('mantto:lab-db-error', { message: error?.message || String(error) });
      throw error;
    }
  }

  async function reset(options) {
    if (db) {
      try { db.close(); } catch (_error) {}
      db = null;
    }
    initPromise = null;
    await idbDelete(IDB_KEY);
    const result = await init(Object.assign({}, options || {}, { force: true, reset: false }));
    dispatch('mantto:lab-db-reset', result);
    return result;
  }

  async function replaceWithBytes(bytes, options) {
    const normalized = normalizeBytes(bytes);
    const inspection = await inspectBytes(normalized, options || {});
    const nextDb = new SQL.Database(normalized);
    nextDb.exec('PRAGMA foreign_keys = ON;');
    if (db) {
      try { db.close(); } catch (_error) {}
    }
    db = nextDb;
    await persist(options?.reason || 'import');
    const status = getStatus();
    status.importInspection = inspection;
    dispatch('mantto:lab-db-imported', inspection);
    return status;
  }

  function exportBytes() {
    assertReady();
    return db.export();
  }

  function getStatus() {
    const ready = Boolean(db);
    const schemaVersion = Number(currentVersion?.schema_version || 0);
    const seedVersion = Number(currentVersion?.seed_version || 0);
    const localSchemaVersion = Number(storedMetadata?.schemaVersion || (ready ? scalar('PRAGMA user_version') : 0) || 0);
    const localSeedVersion = Number(storedMetadata?.seedVersion || seedVersion || 0);
    return {
      ready,
      lineage: currentVersion?.lineage || 'LAB_DGB_V2',
      database: currentVersion?.database || 'gestor_mantto_lab',
      schemaVersion,
      seedVersion,
      localSchemaVersion,
      localSeedVersion,
      upgradeAvailable: Boolean(storedMetadata && (localSchemaVersion !== schemaVersion || localSeedVersion !== seedVersion)),
      savedAt: storedMetadata?.savedAt || null,
      expectedTables: Number(currentVersion?.tables || 0),
      persistedIn: `IndexedDB:${IDB_NAME}/${IDB_STORE}/${IDB_KEY}`,
      resources: labBaseUrl ? labBaseUrl.href : null
    };
  }

  function close() {
    if (db) db.close();
    db = null;
    initPromise = null;
  }

  global.ManttoLabDB = Object.freeze({
    init,
    reset,
    query,
    scalar,
    run,
    exec,
    transaction,
    persist,
    exportBytes,
    inspectBytes,
    replaceWithBytes,
    getStatus,
    databaseStatistics,
    close
  });
})(typeof window !== 'undefined' ? window : globalThis);
