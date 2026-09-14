(function initManttoLabTransport(root, factory){
  const api = factory(root);
  if(typeof module === 'object' && module.exports) module.exports = api;
  if(root) root.ManttoLabTransport = api;

  if(root && typeof root.document !== 'undefined'){
    const ready = Promise.resolve().then(() => api.install());
    root.ManttoLabTransportReady = ready;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function createManttoLabTransport(root){
  'use strict';

  const VERSION = 'FASE_3_LAB_DGB_TRANSPORTE_AISLAMIENTO_V002';
  const BLOCKED_HOST_PATTERNS = Object.freeze([
    /(^|\.)azurewebsites\.net$/i,
    /(^|\.)aivencloud\.com$/i,
    /(^|\.)supabase\.co$/i,
    /(^|\.)railway\.app$/i,
    /(^|\.)up\.railway\.app$/i,
    /(^|\.)script\.google\.com$/i,
    /(^|\.)script\.googleusercontent\.com$/i
  ]);
  const MUTATING_METHODS = new Set(['POST','PUT','PATCH','DELETE']);

  const native = {
    fetch: typeof root?.fetch === 'function' ? root.fetch.bind(root) : null,
    XMLHttpRequest: root?.XMLHttpRequest || null,
    sendBeacon: root?.navigator && typeof root.navigator.sendBeacon === 'function'
      ? root.navigator.sendBeacon.bind(root.navigator)
      : null,
    WebSocket: root?.WebSocket || null,
    EventSource: root?.EventSource || null
  };

  let installed = false;

  function locationHref(){
    return root?.location?.href || 'https://lab.invalid/';
  }

  function locationOrigin(){
    try { return new URL(locationHref()).origin; }
    catch(_error){ return 'https://lab.invalid'; }
  }

  function toUrl(input){
    const raw = typeof input === 'string' || input instanceof URL
      ? String(input)
      : (input && typeof input.url === 'string' ? input.url : '');
    if(!raw) throw makeError('URL inválida en transporte LAB.', 'LAB_INVALID_URL');
    try { return new URL(raw, locationHref()); }
    catch(_error){ throw makeError('URL inválida en transporte LAB.', 'LAB_INVALID_URL'); }
  }

  function isApiPath(pathname){
    const value = String(pathname || '');
    return value === '/api' || value.startsWith('/api/');
  }

  function isBlockedHost(hostname){
    const host = String(hostname || '').toLowerCase();
    return BLOCKED_HOST_PATTERNS.some(pattern => pattern.test(host));
  }

  function isCrossOrigin(url){
    return Boolean(url && url.origin !== locationOrigin());
  }

  function makeError(message, code, details){
    const error = new Error(message);
    error.name = 'ManttoLabTransportError';
    error.status = 503;
    error.code = code || 'LAB_TRANSPORT_ERROR';
    if(details) error.details = details;
    return error;
  }

  function blockedReason(url, method){
    if(isBlockedHost(url.hostname)) return 'production-host';
    if(isCrossOrigin(url) && MUTATING_METHODS.has(String(method || 'GET').toUpperCase())) return 'cross-origin-mutation';
    return null;
  }

  function logBlocked(url, method, reason){
    if(root?.console && typeof root.console.warn === 'function'){
      root.console.warn('[LAB DGB] BLOQUEADA PETICION PRODUCTIVA', {
        method: String(method || 'GET').toUpperCase(),
        url: url?.href || String(url || ''),
        reason: reason || 'blocked'
      });
    }
  }

  async function backendReady(){
    if(root?.ManttoLabBackendReady) await root.ManttoLabBackendReady;
    if(!root?.ManttoLabBackend) throw makeError('Backend LAB no disponible.', 'LAB_BACKEND_NOT_READY');
    return root.ManttoLabBackend;
  }

  function normalizeHeaders(source){
    if(!source) return {};
    if(typeof Headers !== 'undefined' && source instanceof Headers){
      const output = {};
      source.forEach((value, key) => { output[key] = value; });
      return output;
    }
    if(Array.isArray(source)) return Object.fromEntries(source);
    return Object.assign({}, source);
  }

  async function requestBody(input, init, method){
    if(['GET','HEAD'].includes(method)) return null;
    if(init && Object.prototype.hasOwnProperty.call(init, 'body')) return init.body;
    if(typeof Request !== 'undefined' && input instanceof Request){
      const clone = input.clone();
      const type = String(clone.headers.get('content-type') || '').toLowerCase();
      if(type.includes('multipart/form-data') && typeof clone.formData === 'function') return clone.formData();
      return clone.text();
    }
    return null;
  }

  function unimplementedResponse(snapshot, method, path){
    if(Number(snapshot?.status) !== 404) return snapshot;
    return {
      status: 501,
      ok: false,
      headers: { 'content-type':'application/json; charset=utf-8' },
      body: {
        ok: false,
        message: 'Funcionalidad no implementada en LAB.',
        code: 'LAB_MOCK_NOT_IMPLEMENTED',
        method,
        path
      }
    };
  }

  async function dispatch(path, options){
    const cfg = options || {};
    const method = String(cfg.method || 'GET').toUpperCase();
    const url = toUrl(path);
    const backend = await backendReady();
    const result = await backend.dispatch(url.pathname + url.search, {
      method,
      headers: normalizeHeaders(cfg.headers),
      body: cfg.body
    });
    return isApiPath(url.pathname)
      ? unimplementedResponse(result, method, url.pathname + url.search)
      : result;
  }

  function apiError(snapshot){
    const payload = snapshot?.body && typeof snapshot.body === 'object' ? snapshot.body : {};
    const Errors = root?.ManttoLabErrors;
    if(Errors?.LabApiError) return new Errors.LabApiError(snapshot);
    const error = new Error(payload.message || `HTTP ${snapshot?.status || 500}`);
    error.name = 'ManttoLabApiError';
    error.status = Number(snapshot?.status || 500);
    error.code = payload.code || null;
    error.payload = payload;
    return error;
  }

  async function request(path, options){
    const snapshot = await dispatch(path, options);
    if(!snapshot.ok) throw apiError(snapshot);
    return snapshot.body;
  }

  function responseFromSnapshot(snapshot, method){
    const headers = new Headers(snapshot.headers || {});
    let body = snapshot.body;
    if(method === 'HEAD' || [204,205,304].includes(Number(snapshot.status))) body = null;
    else if(body !== null && body !== undefined && typeof body === 'object' && !(body instanceof Blob) && !(body instanceof ArrayBuffer) && !ArrayBuffer.isView(body)){
      if(!headers.has('content-type')) headers.set('content-type','application/json; charset=utf-8');
      body = JSON.stringify(body);
    }else if(body === undefined){
      body = null;
    }
    return new Response(body, { status:Number(snapshot.status || 200), headers });
  }

  async function guardedFetch(input, init){
    const method = String((init && init.method) || (input && input.method) || 'GET').toUpperCase();
    const url = toUrl(input);

    if(isApiPath(url.pathname)){
      if(isBlockedHost(url.hostname)) logBlocked(url, method, 'production-api-rerouted-local');
      const headers = normalizeHeaders((init && init.headers) || (input && input.headers));
      const body = await requestBody(input, init, method);
      const snapshot = await dispatch(url.pathname + url.search, { method, headers, body });
      return responseFromSnapshot(snapshot, method);
    }

    const reason = blockedReason(url, method);
    if(reason){
      logBlocked(url, method, reason);
      throw makeError('Conexión externa bloqueada por el Laboratorio DGB.', 'LAB_EXTERNAL_CONNECTION_BLOCKED', {
        method,
        url:url.href,
        reason
      });
    }

    if(!native.fetch) throw makeError('fetch nativo no disponible.', 'LAB_NATIVE_FETCH_UNAVAILABLE');
    return native.fetch(input, init);
  }

  function installFetch(){
    if(!native.fetch || !root) return;
    root.fetch = guardedFetch;
  }

  function installBeacon(){
    if(!root?.navigator || !native.sendBeacon) return;
    try{
      root.navigator.sendBeacon = function(urlValue, data){
        const url = toUrl(urlValue);
        if(isApiPath(url.pathname)){
          if(isBlockedHost(url.hostname)) logBlocked(url, 'POST', 'production-api-rerouted-local');
          Promise.resolve(dispatch(url.pathname + url.search, {
            method:'POST',
            headers:{ 'content-type':'text/plain;charset=UTF-8' },
            body:data
          })).catch(error => root.console?.warn?.('[LAB DGB] sendBeacon local falló', error));
          return true;
        }
        const reason = blockedReason(url, 'POST');
        if(reason){ logBlocked(url, 'POST', reason); return false; }
        return native.sendBeacon(urlValue, data);
      };
    }catch(_error){}
  }

  function installXhr(){
    if(!native.XMLHttpRequest || !root) return;
    const NativeXHR = native.XMLHttpRequest;

    class LabXMLHttpRequest {
      constructor(){
        this._native = null;
        this._headers = {};
        this._listeners = new Map();
        this._method = 'GET';
        this._url = null;
        this.readyState = 0;
        this.status = 0;
        this.statusText = '';
        this.responseType = '';
        this.response = null;
        this.responseText = '';
        this.responseURL = '';
        this.timeout = 0;
        this.withCredentials = false;
        this.onreadystatechange = null;
        this.onload = null;
        this.onerror = null;
        this.onloadend = null;
      }

      open(method, urlValue, async = true, user, password){
        this._method = String(method || 'GET').toUpperCase();
        this._url = toUrl(urlValue);
        this._async = async !== false;
        if(!this._async && (isApiPath(this._url.pathname) || blockedReason(this._url, this._method))){
          throw makeError('XHR síncrono no permitido para rutas LAB.', 'LAB_SYNC_XHR_BLOCKED');
        }
        if(!isApiPath(this._url.pathname) && !blockedReason(this._url, this._method)){
          this._native = new NativeXHR();
          this._mirrorNative();
          this._native.open(method, urlValue, async, user, password);
        }
        this.readyState = 1;
        this._emit('readystatechange');
      }

      _mirrorNative(){
        const xhr = this._native;
        ['readystatechange','load','error','loadend','abort','timeout','progress'].forEach(type => {
          xhr.addEventListener(type, event => {
            this.readyState = xhr.readyState;
            this.status = xhr.status;
            this.statusText = xhr.statusText;
            this.response = xhr.response;
            try { this.responseText = xhr.responseText; } catch(_error){}
            this.responseURL = xhr.responseURL;
            this._emit(type, event);
          });
        });
      }

      setRequestHeader(name, value){
        if(this._native) return this._native.setRequestHeader(name, value);
        this._headers[name] = value;
      }

      getResponseHeader(name){
        return this._native ? this._native.getResponseHeader(name) : (this._responseHeaders?.get(String(name).toLowerCase()) || null);
      }

      getAllResponseHeaders(){
        if(this._native) return this._native.getAllResponseHeaders();
        if(!this._responseHeaders) return '';
        return [...this._responseHeaders.entries()].map(([k,v]) => `${k}: ${v}`).join('\r\n');
      }

      overrideMimeType(type){ if(this._native?.overrideMimeType) this._native.overrideMimeType(type); }
      abort(){ if(this._native) this._native.abort(); }

      addEventListener(type, listener){
        if(!this._listeners.has(type)) this._listeners.set(type, new Set());
        this._listeners.get(type).add(listener);
      }
      removeEventListener(type, listener){ this._listeners.get(type)?.delete(listener); }

      _emit(type, originalEvent){
        const event = originalEvent || { type, target:this, currentTarget:this };
        const handler = this['on' + type];
        if(typeof handler === 'function') handler.call(this, event);
        for(const listener of this._listeners.get(type) || []) listener.call(this, event);
      }

      async send(body){
        if(this._native){
          this._native.responseType = this.responseType;
          this._native.timeout = this.timeout;
          this._native.withCredentials = this.withCredentials;
          return this._native.send(body);
        }

        const reason = blockedReason(this._url, this._method);
        if(reason && !isApiPath(this._url.pathname)){
          logBlocked(this._url, this._method, reason);
          this.status = 0;
          this.readyState = 4;
          this._emit('readystatechange');
          this._emit('error');
          this._emit('loadend');
          return;
        }

        try{
          const snapshot = await dispatch(this._url.pathname + this._url.search, {
            method:this._method,
            headers:this._headers,
            body
          });
          this.status = snapshot.status;
          this.statusText = snapshot.ok ? 'OK' : 'ERROR';
          this.responseURL = this._url.href;
          this._responseHeaders = new Map(Object.entries(snapshot.headers || {}).map(([k,v]) => [String(k).toLowerCase(), String(v)]));
          const objectBody = snapshot.body !== null && typeof snapshot.body === 'object';
          this.responseText = objectBody ? JSON.stringify(snapshot.body) : String(snapshot.body ?? '');
          this.response = this.responseType === 'json'
            ? (objectBody ? snapshot.body : JSON.parse(this.responseText || 'null'))
            : this.responseText;
          this.readyState = 4;
          this._emit('readystatechange');
          this._emit('load');
          this._emit('loadend');
        }catch(error){
          this.status = 0;
          this.readyState = 4;
          this._emit('readystatechange');
          this._emit('error', { type:'error', target:this, error });
          this._emit('loadend');
        }
      }
    }

    ['UNSENT','OPENED','HEADERS_RECEIVED','LOADING','DONE'].forEach((name, index) => {
      Object.defineProperty(LabXMLHttpRequest, name, { value:index });
      Object.defineProperty(LabXMLHttpRequest.prototype, name, { value:index });
    });
    root.XMLHttpRequest = LabXMLHttpRequest;
  }

  function guardConstructor(name, NativeCtor){
    if(!NativeCtor || !root) return;
    function Guarded(urlValue, ...args){
      const url = toUrl(urlValue);
      const reason = isApiPath(url.pathname) ? 'api-stream-not-supported' : blockedReason(url, 'GET');
      if(reason){
        logBlocked(url, 'GET', reason);
        throw makeError(`${name} bloqueado en LAB.`, 'LAB_EXTERNAL_CONNECTION_BLOCKED', { url:url.href, reason });
      }
      return new NativeCtor(urlValue, ...args);
    }
    Guarded.prototype = NativeCtor.prototype;
    Object.setPrototypeOf(Guarded, NativeCtor);
    root[name] = Guarded;
  }

  function install(){
    if(installed) return getStatus();
    installFetch();
    installXhr();
    installBeacon();
    guardConstructor('WebSocket', native.WebSocket);
    guardConstructor('EventSource', native.EventSource);
    installed = true;
    return getStatus();
  }

  function getStatus(){
    return {
      ready: installed,
      version: VERSION,
      lineage: 'LAB_DGB_V2',
      apiTransport: 'ManttoLabBackend',
      productionConnectionsAllowed:false,
      guards:{
        fetch:Boolean(native.fetch),
        XMLHttpRequest:Boolean(native.XMLHttpRequest),
        sendBeacon:Boolean(native.sendBeacon),
        WebSocket:Boolean(native.WebSocket),
        EventSource:Boolean(native.EventSource)
      }
    };
  }

  return Object.freeze({
    VERSION,
    install,
    getStatus,
    dispatch,
    request,
    fetch:guardedFetch,
    isApiPath,
    isBlockedHost,
    toUrl,
    _native:native
  });
});
