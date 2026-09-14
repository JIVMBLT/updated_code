(function initManttoLabBlobStore(root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ManttoLabBlobStore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createManttoLabBlobStore(root) {
  'use strict';

  const DB_NAME = 'mantto_lab_dgb_blobs_v1';
  const DB_VERSION = 1;
  const STORE = 'blobs';
  const MAX_FILE_BYTES = 25 * 1024 * 1024;
  let connection = null;
  const activeUrls = new Map();

  function requestPromise(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('LAB_BLOB_IDB_REQUEST_FAILED'));
    });
  }

  function txDone(tx) {
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('LAB_BLOB_IDB_TRANSACTION_FAILED'));
      tx.onabort = () => reject(tx.error || new Error('LAB_BLOB_IDB_TRANSACTION_ABORTED'));
    });
  }

  async function open() {
    if (connection) return connection;
    if (!root?.indexedDB) throw new Error('INDEXEDDB_NOT_AVAILABLE');
    connection = await new Promise((resolve, reject) => {
      const request = root.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'key' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('LAB_BLOB_IDB_OPEN_FAILED'));
    });
    return connection;
  }

  function isFileLike(value) {
    if (!value) return false;
    if (typeof Blob !== 'undefined' && value instanceof Blob) return true;
    return typeof value === 'object' && Number.isFinite(Number(value.size)) && typeof value.arrayBuffer === 'function';
  }

  function validate(file) {
    if (!isFileLike(file)) throw Object.assign(new Error('Archivo LAB inválido.'), { status: 400, code: 'LAB_FILE_INVALID' });
    if (Number(file.size || 0) > MAX_FILE_BYTES) {
      throw Object.assign(new Error('El archivo supera el límite de 25 MB.'), { status: 413, code: 'LAB_FILE_TOO_LARGE' });
    }
    return file;
  }

  function makeKey(prefix, file) {
    const safePrefix = String(prefix || 'files').replace(/[^a-z0-9/_-]+/gi, '-').replace(/-+/g, '-');
    const name = String(file?.name || 'archivo').replace(/[^a-z0-9._-]+/gi, '-').slice(-120);
    const nonce = root?.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return `${safePrefix}/${nonce}/${name}`;
  }

  async function put(file, options) {
    validate(file);
    const cfg = options || {};
    const db = await open();
    const key = cfg.key || makeKey(cfg.prefix, file);
    const record = {
      key,
      blob: file,
      name: String(file.name || cfg.name || 'archivo'),
      type: String(file.type || cfg.type || 'application/octet-stream'),
      size: Number(file.size || 0),
      createdAt: new Date().toISOString(),
      metadata: cfg.metadata || null
    };
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(record);
    await txDone(tx);
    return { key, name: record.name, type: record.type, size: record.size };
  }

  async function get(key) {
    const clean = String(key || '').trim();
    if (!clean) return null;
    const db = await open();
    const tx = db.transaction(STORE, 'readonly');
    const result = await requestPromise(tx.objectStore(STORE).get(clean));
    await txDone(tx);
    return result || null;
  }

  function revokeUrl(key) {
    const url = activeUrls.get(key);
    if (url && root?.URL?.revokeObjectURL) {
      try { root.URL.revokeObjectURL(url); } catch (_error) {}
    }
    activeUrls.delete(key);
  }

  async function accessUrl(key) {
    const record = await get(key);
    if (!record?.blob) return null;
    revokeUrl(key);
    if (!root?.URL?.createObjectURL) throw new Error('LAB_BLOB_URL_UNAVAILABLE');
    const url = root.URL.createObjectURL(record.blob);
    activeUrls.set(key, url);
    return { access_url: url, nombre_archivo: record.name, mime_type: record.type, tamano_bytes: record.size };
  }

  async function remove(key) {
    const clean = String(key || '').trim();
    if (!clean) return false;
    revokeUrl(clean);
    const db = await open();
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(clean);
    await txDone(tx);
    return true;
  }

  async function clear() {
    for (const key of [...activeUrls.keys()]) revokeUrl(key);
    const db = await open();
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).clear();
    await txDone(tx);
    return true;
  }

  async function count() {
    const db = await open();
    const tx = db.transaction(STORE, 'readonly');
    const value = await requestPromise(tx.objectStore(STORE).count());
    await txDone(tx);
    return Number(value || 0);
  }

  async function allRecords() {
    const db = await open();
    const tx = db.transaction(STORE, 'readonly');
    const store = tx.objectStore(STORE);
    let rows;
    if (typeof store.getAll === 'function') {
      rows = await requestPromise(store.getAll());
    } else {
      rows = await new Promise((resolve, reject) => {
        const result = [];
        const request = store.openCursor();
        request.onsuccess = () => {
          const cursor = request.result;
          if (!cursor) return resolve(result);
          result.push(cursor.value);
          cursor.continue();
        };
        request.onerror = () => reject(request.error || new Error('LAB_BLOB_CURSOR_FAILED'));
      });
    }
    await txDone(tx);
    return Array.isArray(rows) ? rows : [];
  }

  async function list() {
    const rows = await allRecords();
    return rows.map(row => ({
      key: row.key,
      name: row.name,
      type: row.type,
      size: Number(row.size || row.blob?.size || 0),
      createdAt: row.createdAt || null,
      metadata: row.metadata ?? null
    }));
  }

  function bytesToBase64(input) {
    const bytes = input instanceof Uint8Array ? input : new Uint8Array(input || []);
    if (typeof root?.btoa === 'function') {
      let binary = '';
      const chunk = 0x8000;
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + chunk, bytes.length)));
      }
      return root.btoa(binary);
    }
    if (typeof Buffer !== 'undefined') return Buffer.from(bytes).toString('base64');
    throw new Error('LAB_BASE64_ENCODER_UNAVAILABLE');
  }

  function base64ToBytes(value) {
    const text = String(value || '').trim();
    if (!text) return new Uint8Array();
    if (typeof root?.atob === 'function') {
      const binary = root.atob(text);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
      return bytes;
    }
    if (typeof Buffer !== 'undefined') return new Uint8Array(Buffer.from(text, 'base64'));
    throw new Error('LAB_BASE64_DECODER_UNAVAILABLE');
  }

  async function exportAll() {
    const rows = await allRecords();
    const exported = [];
    for (const row of rows) {
      const bytes = new Uint8Array(await row.blob.arrayBuffer());
      exported.push({
        key: row.key,
        name: row.name,
        type: row.type,
        size: Number(row.size || bytes.length),
        createdAt: row.createdAt || null,
        metadata: row.metadata ?? null,
        dataBase64: bytesToBase64(bytes)
      });
    }
    return exported;
  }

  function validateImportEntries(entries) {
    if (!Array.isArray(entries)) throw Object.assign(new Error('La sección blobs del respaldo debe ser un arreglo.'), { code: 'LAB_BLOB_IMPORT_INVALID' });
    const keys = new Set();
    let totalBytes = 0;
    const normalized = entries.map((entry, index) => {
      const key = String(entry?.key || '').trim();
      if (!key) throw Object.assign(new Error(`Blob ${index + 1} sin key.`), { code: 'LAB_BLOB_IMPORT_KEY_REQUIRED' });
      if (keys.has(key)) throw Object.assign(new Error(`Blob duplicado: ${key}`), { code: 'LAB_BLOB_IMPORT_KEY_DUPLICATE' });
      keys.add(key);
      const bytes = base64ToBytes(entry?.dataBase64);
      if (bytes.length > MAX_FILE_BYTES) throw Object.assign(new Error(`Blob ${key} supera 25 MB.`), { code: 'LAB_BLOB_IMPORT_TOO_LARGE' });
      const declared = Number(entry?.size || bytes.length);
      if (declared !== bytes.length) throw Object.assign(new Error(`Tamaño inconsistente para ${key}.`), { code: 'LAB_BLOB_IMPORT_SIZE_MISMATCH' });
      totalBytes += bytes.length;
      return {
        key,
        name: String(entry?.name || 'archivo'),
        type: String(entry?.type || 'application/octet-stream'),
        size: bytes.length,
        createdAt: entry?.createdAt || new Date().toISOString(),
        metadata: entry?.metadata ?? null,
        bytes
      };
    });
    return { entries: normalized, count: normalized.length, totalBytes };
  }

  async function importAll(entries, options) {
    const validated = validateImportEntries(entries);
    const BlobCtor = root?.Blob || (typeof Blob !== 'undefined' ? Blob : null);
    if (!BlobCtor) throw new Error('LAB_BLOB_CONSTRUCTOR_UNAVAILABLE');
    const db = await open();
    for (const key of [...activeUrls.keys()]) revokeUrl(key);
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    if (options?.replace !== false) store.clear();
    for (const row of validated.entries) {
      store.put({
        key: row.key,
        blob: new BlobCtor([row.bytes], { type: row.type }),
        name: row.name,
        type: row.type,
        size: row.size,
        createdAt: row.createdAt,
        metadata: row.metadata
      });
    }
    await txDone(tx);
    return { count: validated.count, totalBytes: validated.totalBytes };
  }

  return Object.freeze({
    DB_NAME, STORE, MAX_FILE_BYTES, open, put, get, accessUrl, remove, clear, count, list,
    exportAll, importAll, validateImportEntries, validate, isFileLike
  });
});
