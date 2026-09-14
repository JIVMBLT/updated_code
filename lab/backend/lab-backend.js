(function initManttoLabBackendModule(root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ManttoLabBackendModule = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createManttoLabBackendModule(root) {
  'use strict';

  const Errors = root?.ManttoLabErrors || (typeof require === 'function' ? require('./lab-errors') : null);
  const RouterApi = root?.ManttoLabRouter || (typeof require === 'function' ? require('./lab-router') : null);
  const ContextApi = root?.ManttoLabContext || (typeof require === 'function' ? require('./lab-context') : null);
  if (!Errors || !RouterApi || !ContextApi) throw new Error('MANTTO_LAB_BACKEND_DEPENDENCY_MISSING');

  const VERSION = 'FASE_2_LAB_DGB_BACKEND_ENGINE_V002';

  function parseQuery(searchParams) {
    const query = Object.create(null);
    for (const [key, value] of searchParams.entries()) {
      if (query[key] === undefined) query[key] = value;
      else if (Array.isArray(query[key])) query[key].push(value);
      else query[key] = [query[key], value];
    }
    return query;
  }

  function normalizeHeaders(source) {
    const headers = Object.create(null);
    if (!source) return headers;

    if (typeof Headers !== 'undefined' && source instanceof Headers) {
      source.forEach((value, key) => {
        headers[String(key).toLowerCase()] = String(value);
      });
      return headers;
    }

    if (Array.isArray(source)) {
      source.forEach(item => {
        if (Array.isArray(item) && item.length >= 2) {
          headers[String(item[0]).toLowerCase()] = String(item[1]);
        }
      });
      return headers;
    }

    Object.keys(source).forEach(key => {
      headers[String(key).toLowerCase()] = String(source[key]);
    });
    return headers;
  }

  function headerValue(headers, name) {
    return headers[String(name || '').toLowerCase()] || '';
  }

  function formDataToObject(body) {
    const output = Object.create(null);
    for (const [key, value] of body.entries()) {
      if (output[key] === undefined) output[key] = value;
      else if (Array.isArray(output[key])) output[key].push(value);
      else output[key] = [output[key], value];
    }
    return output;
  }

  function searchParamsToObject(body) {
    const output = Object.create(null);
    for (const [key, value] of body.entries()) {
      if (output[key] === undefined) output[key] = value;
      else if (Array.isArray(output[key])) output[key].push(value);
      else output[key] = [output[key], value];
    }
    return output;
  }

  function parseBody(body, headers) {
    if (body === undefined || body === null || body === '') return null;
    if (typeof FormData !== 'undefined' && body instanceof FormData) return formDataToObject(body);
    if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) return searchParamsToObject(body);
    if (typeof body !== 'string') return body;

    const contentType = headerValue(headers, 'content-type').toLowerCase();
    if (contentType.includes('application/json') || /^[\[{]/.test(body.trim())) {
      try {
        return JSON.parse(body);
      } catch (_error) {
        throw Errors.httpError('JSON inválido en solicitud LAB.', 400, 'LAB_INVALID_JSON');
      }
    }

    if (contentType.includes('application/x-www-form-urlencoded')) {
      return searchParamsToObject(new URLSearchParams(body));
    }

    return body;
  }

  function toUrl(input) {
    const value = String(input || '/');
    try {
      return new URL(value, 'https://lab.invalid');
    } catch (_error) {
      throw Errors.httpError('Ruta inválida en solicitud LAB.', 400, 'LAB_INVALID_PATH');
    }
  }

  function dispatchEvent(name, detail) {
    if (!root?.document || typeof root.CustomEvent !== 'function') return;
    root.document.dispatchEvent(new root.CustomEvent(name, { detail: detail || {} }));
  }

  function responseSnapshot(res) {
    const status = Number(res.statusCode || 200);
    return {
      status,
      ok: status >= 200 && status < 300,
      headers: Object.assign({}, res.headers || {}),
      body: res.body === undefined ? null : res.body
    };
  }

  class Backend {
    constructor(options) {
      const cfg = options || {};
      this.db = cfg.db || root?.ManttoLabDB || null;
      this.router = cfg.router || RouterApi.create();
      this.contextProvider = cfg.contextProvider || (extra => ContextApi.create(extra));
      this.debug = cfg.debug === true;
      this.ready = false;
    }

    async init() {
      if (!this.db) throw new Error('MANTTO_LAB_DB_REQUIRED');

      if (root?.ManttoLabReady && typeof root.ManttoLabReady.then === 'function') {
        await root.ManttoLabReady;
      } else if (typeof this.db.init === 'function') {
        await this.db.init();
      }

      this.ready = true;
      const status = this.getStatus();
      dispatchEvent('mantto:lab-backend-ready', status);
      return status;
    }

    getStatus() {
      return {
        ready: this.ready,
        version: VERSION,
        lineage: 'LAB_DGB_V2',
        routes: this.router.list().length,
        externalApi: false,
        transport: 'in-browser',
        database: this.db?.getStatus ? this.db.getStatus() : null
      };
    }

    register(method, path, handlers, options) {
      this.router.add(method, path, handlers, options);
      return this;
    }

    use(prefix, ...handlers) {
      this.router.use(prefix, ...handlers);
      return this;
    }

    listRoutes() {
      return this.router.list();
    }

    async _executeResolved(resolved, req, res) {
      const transactional = Boolean(resolved?.route?.options?.transaction);
      const hasTransaction = this.db && typeof this.db.transaction === 'function';

      if (!transactional || !hasTransaction) {
        req.db = this.db;
        await this.router.execute(resolved, req, res);
        return;
      }

      await this.db.transaction(async tx => {
        req.db = tx;
        await this.router.execute(resolved, req, res);
      }, { reason: `lab-backend:${req.method}:${req.path}` });
    }

    async dispatch(path, options) {
      if (!this.ready) await this.init();

      const cfg = options || {};
      const startedAt = Date.now();
      const method = String(cfg.method || 'GET').toUpperCase();
      let req = null;
      let context = null;
      let eventPath = String(path || '/');
      let response;

      try {
        const url = toUrl(path);
        eventPath = RouterApi.normalizePath(url.pathname);
        const headers = normalizeHeaders(cfg.headers);

        context = await Promise.resolve(this.contextProvider({
          method,
          path: url.pathname,
          originalUrl: url.pathname + url.search
        }));

        req = {
          method,
          path: RouterApi.normalizePath(url.pathname),
          originalUrl: url.pathname + url.search,
          baseUrl: '',
          protocol: 'lab',
          hostname: 'lab.local',
          ip: '127.0.0.1',
          socket: { remoteAddress: '127.0.0.1' },
          query: parseQuery(url.searchParams),
          params: {},
          headers,
          body: parseBody(cfg.body, headers),
          context: context || {},
          contextUser: context?.contextUser || context?.user || null,
          informationAccess: context?.informationAccess || null,
          viewerContext: context?.viewerContext || null,
          user: context?.user || null,
          actorUser: context?.actorUser || null,
          viewUser: context?.viewUser || null,
          lab: true,
          get(name) { return headerValue(headers, name); },
          header(name) { return headerValue(headers, name); }
        };

        const res = new RouterApi.LabResponse();
        const resolved = this.router.resolve(method, req.path);

        if (!resolved) {
          res.status(404).json({
            ok: false,
            message: 'Ruta no encontrada',
            method,
            path: req.originalUrl
          });
        } else {
          await this._executeResolved(resolved, req, res);
          if (!res.finished) {
            throw Errors.httpError(
              'La ruta LAB terminó sin producir una respuesta.',
              500,
              'LAB_HANDLER_NO_RESPONSE'
            );
          }
        }

        response = responseSnapshot(res);
      } catch (sourceError) {
        const normalized = Errors.errorPayload(sourceError, { debug: this.debug });
        response = {
          status: normalized.status,
          ok: false,
          headers: { 'content-type': 'application/json; charset=utf-8' },
          body: normalized.payload
        };
      }

      const requestId = context?.requestId || null;
      dispatchEvent('mantto:lab-backend-request', {
        requestId,
        method,
        path: req?.path || eventPath,
        status: response.status,
        ok: response.ok,
        durationMs: Date.now() - startedAt
      });

      return response;
    }

    async request(path, options) {
      const response = await this.dispatch(path, options);
      if (!response.ok) throw new Errors.LabApiError(response);
      return response.body;
    }
  }

  function create(options) {
    return new Backend(options);
  }

  return Object.freeze({
    create,
    Backend,
    VERSION,
    parseQuery,
    normalizeHeaders,
    parseBody,
    responseSnapshot
  });
});
