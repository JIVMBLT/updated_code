(function initManttoLabErrors(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ManttoLabErrors = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createManttoLabErrors() {
  'use strict';

  function normalizeStatus(value, fallback = 500) {
    const status = Number(value);
    return Number.isInteger(status) && status >= 100 && status <= 599 ? status : fallback;
  }

  class LabHttpError extends Error {
    constructor(message, options) {
      const cfg = options || {};
      super(String(message || 'Error de laboratorio'));
      this.name = 'LabHttpError';
      this.status = normalizeStatus(cfg.status ?? cfg.statusCode, 500);
      this.statusCode = this.status;
      this.code = cfg.code || null;
      this.details = cfg.details === undefined ? null : cfg.details;
      this.expose = cfg.expose === true || this.status < 500;
      if (cfg.cause !== undefined) this.cause = cfg.cause;
    }
  }

  class LabApiError extends Error {
    constructor(response) {
      const payload = response && response.body && typeof response.body === 'object'
        ? response.body
        : {};
      const status = normalizeStatus(response?.status, 500);
      super(String(payload.message || `HTTP ${status}`));
      this.name = 'ManttoLabApiError';
      this.status = status;
      this.statusCode = status;
      this.code = payload.code || null;
      this.details = payload.details === undefined ? null : payload.details;
      this.payload = payload;
      this.response = response || null;
    }
  }

  function httpError(message, status, code, details, options) {
    const cfg = options || {};
    const normalizedStatus = normalizeStatus(status, 500);
    return new LabHttpError(message, {
      status: normalizedStatus,
      code: code || null,
      details: details === undefined ? null : details,
      expose: cfg.expose === true || normalizedStatus < 500,
      cause: cfg.cause
    });
  }

  function normalizeError(sourceError) {
    if (sourceError instanceof LabHttpError) return sourceError;
    const source = sourceError || new Error('Error desconocido');
    return new LabHttpError(source.message || 'Error interno del laboratorio', {
      status: normalizeStatus(source.statusCode ?? source.status, 500),
      code: source.code || null,
      details: source.details,
      expose: source.expose === true,
      cause: source
    });
  }

  function errorPayload(sourceError, options) {
    const cfg = options || {};
    const error = normalizeError(sourceError);
    const status = normalizeStatus(error.status, 500);
    const exposeMessage = status < 500 || error.expose === true;
    const payload = {
      ok: false,
      message: exposeMessage ? error.message : 'Error interno del servidor'
    };

    if (error.code) payload.code = error.code;
    if (error.details !== null && error.details !== undefined && exposeMessage) {
      payload.details = error.details;
    }
    if (cfg.debug === true) payload.error = error.message;

    return { status, payload, error };
  }

  return Object.freeze({
    LabHttpError,
    LabApiError,
    httpError,
    normalizeError,
    errorPayload,
    normalizeStatus
  });
});
