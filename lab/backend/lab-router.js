(function initManttoLabRouter(root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ManttoLabRouter = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createManttoLabRouterApi(root) {
  'use strict';

  const Errors = root?.ManttoLabErrors || (typeof require === 'function' ? require('./lab-errors') : null);
  if (!Errors) throw new Error('MANTTO_LAB_ERRORS_REQUIRED');

  const METHODS = Object.freeze(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']);

  function normalizePath(value) {
    let path = String(value || '/').trim() || '/';
    if (!path.startsWith('/')) path = '/' + path;
    path = path.replace(/\/+/g, '/');
    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
    return path || '/';
  }

  function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function compilePattern(pattern) {
    const clean = normalizePath(pattern);
    if (clean === '/') return { regex: /^\/?$/, names: [] };

    const names = [];
    const parts = clean.split('/').slice(1).map(segment => {
      if (segment === '*') {
        names.push('wildcard');
        return '(.*)';
      }
      if (segment.startsWith(':')) {
        const name = segment.slice(1).trim();
        if (!name) throw new Error(`LAB_ROUTE_PARAM_INVALID ${pattern}`);
        names.push(name);
        return '([^/]+)';
      }
      return escapeRegex(segment);
    });

    return { regex: new RegExp('^/' + parts.join('/') + '/?$'), names };
  }

  function decode(value) {
    try { return decodeURIComponent(value); }
    catch (_error) { return value; }
  }

  function matchCompiled(compiled, path) {
    const match = compiled.regex.exec(normalizePath(path));
    if (!match) return null;
    const params = {};
    compiled.names.forEach((name, index) => {
      params[name] = decode(match[index + 1] || '');
    });
    return params;
  }

  function flattenHandlers(items) {
    return items.flat(Infinity).filter(item => typeof item === 'function');
  }

  class LabResponse {
    constructor() {
      this.statusCode = 200;
      this.headers = Object.create(null);
      this.body = undefined;
      this.headersSent = false;
      this.finished = false;
      this.locals = Object.create(null);
    }

    status(code) {
      const value = Number(code);
      if (!Number.isInteger(value) || value < 100 || value > 599) {
        throw Errors.httpError('Código HTTP inválido en LAB.', 500, 'LAB_INVALID_STATUS');
      }
      this.statusCode = value;
      return this;
    }

    set(name, value) {
      if (name && typeof name === 'object' && !Array.isArray(name)) {
        Object.entries(name).forEach(([key, item]) => this.set(key, item));
        return this;
      }
      this.headers[String(name).toLowerCase()] = String(value);
      return this;
    }

    header(name, value) { return this.set(name, value); }

    get(name) {
      return this.headers[String(name || '').toLowerCase()];
    }

    append(name, value) {
      const key = String(name || '').toLowerCase();
      const current = this.headers[key];
      this.headers[key] = current ? `${current}, ${String(value)}` : String(value);
      return this;
    }

    json(payload) {
      this.set('content-type', 'application/json; charset=utf-8');
      this.body = payload === undefined ? null : payload;
      this.headersSent = true;
      this.finished = true;
      return this;
    }

    send(payload) {
      if (payload !== null && typeof payload === 'object' && !(payload instanceof Uint8Array)) {
        return this.json(payload);
      }
      this.body = payload === undefined ? null : payload;
      this.headersSent = true;
      this.finished = true;
      return this;
    }

    sendStatus(code) {
      return this.status(code).send(String(code));
    }

    end(payload) {
      if (payload !== undefined) this.body = payload;
      this.headersSent = true;
      this.finished = true;
      return this;
    }
  }

  async function runHandlers(handlers, req, res) {
    let cursor = -1;

    async function dispatch(index) {
      if (index <= cursor) {
        throw Errors.httpError('next() llamado múltiples veces.', 500, 'LAB_MIDDLEWARE_NEXT_REENTRY');
      }
      cursor = index;

      const handler = handlers[index];
      if (!handler || res.finished) return;

      let nextCalled = false;
      let nextPromise = null;
      const next = error => {
        if (nextCalled) {
          throw Errors.httpError(
            'next() llamado múltiples veces.',
            500,
            'LAB_MIDDLEWARE_NEXT_REENTRY'
          );
        }
        nextCalled = true;
        nextPromise = error ? Promise.reject(error) : dispatch(index + 1);
        return nextPromise;
      };

      const result = await handler(req, res, next);
      if (nextPromise) await nextPromise;
      if (result !== undefined && !res.finished && !nextCalled) res.json(result);
    }

    await dispatch(0);
  }

  class Router {
    constructor(options) {
      this.options = Object.assign({ basePath: '' }, options || {});
      this.middlewares = [];
      this.routes = [];
    }

    use(prefix, ...handlers) {
      let routePrefix = prefix;
      let stack = handlers;

      if (typeof prefix === 'function' || Array.isArray(prefix)) {
        routePrefix = '/';
        stack = [prefix].concat(handlers);
      }

      const normalized = normalizePath(routePrefix || '/');
      const flattened = flattenHandlers(stack);
      if (!flattened.length) throw new Error(`LAB_MIDDLEWARE_HANDLER_REQUIRED ${normalized}`);
      flattened.forEach(handler => {
        this.middlewares.push({ prefix: normalized, handler });
      });
      return this;
    }

    add(method, pattern, handlers, options) {
      const verb = String(method || '').toUpperCase();
      if (!METHODS.includes(verb)) throw new Error(`LAB_ROUTE_METHOD_UNSUPPORTED ${verb}`);

      const fullPattern = normalizePath((this.options.basePath || '') + normalizePath(pattern));
      const stack = flattenHandlers(Array.isArray(handlers) ? handlers : [handlers]);
      if (!stack.length) throw new Error(`LAB_ROUTE_HANDLER_REQUIRED ${verb} ${fullPattern}`);

      this.routes.push({
        method: verb,
        pattern: fullPattern,
        compiled: compilePattern(fullPattern),
        handlers: stack,
        options: Object.assign({ transaction: !['GET', 'HEAD', 'OPTIONS'].includes(verb) }, options || {})
      });
      return this;
    }

    get(pattern, ...handlers) { return this.add('GET', pattern, handlers); }
    post(pattern, ...handlers) { return this.add('POST', pattern, handlers); }
    put(pattern, ...handlers) { return this.add('PUT', pattern, handlers); }
    patch(pattern, ...handlers) { return this.add('PATCH', pattern, handlers); }
    delete(pattern, ...handlers) { return this.add('DELETE', pattern, handlers); }
    head(pattern, ...handlers) { return this.add('HEAD', pattern, handlers); }
    options(pattern, ...handlers) { return this.add('OPTIONS', pattern, handlers); }

    route(method, pattern, options, ...handlers) {
      return this.add(method, pattern, handlers, options || {});
    }

    resolve(method, path) {
      const verb = String(method || 'GET').toUpperCase();
      for (const route of this.routes) {
        if (route.method !== verb) continue;
        const params = matchCompiled(route.compiled, path);
        if (params) return { route, params };
      }
      return null;
    }

    middlewareFor(path) {
      const target = normalizePath(path);
      return this.middlewares
        .filter(item => item.prefix === '/' || target === item.prefix || target.startsWith(item.prefix + '/'))
        .map(item => item.handler);
    }

    async execute(resolved, req, res) {
      if (!resolved) return false;
      req.params = Object.assign({}, resolved.params || {});
      req.route = {
        method: resolved.route.method,
        path: resolved.route.pattern,
        options: Object.assign({}, resolved.route.options || {})
      };
      const stack = this.middlewareFor(req.path).concat(resolved.route.handlers);
      await runHandlers(stack, req, res);
      return true;
    }

    list() {
      return this.routes.map(route => ({
        method: route.method,
        path: route.pattern,
        transaction: route.options.transaction !== false,
        handlers: route.handlers.length
      }));
    }
  }

  function create(options) { return new Router(options); }

  return Object.freeze({
    METHODS,
    create,
    Router,
    LabResponse,
    normalizePath,
    compilePattern,
    matchCompiled,
    runHandlers
  });
});
