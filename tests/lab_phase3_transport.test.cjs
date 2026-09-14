'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const modulePath = path.resolve(__dirname, '../lab/runtime/lab-transport.js');

const original = {
  fetch: global.fetch,
  location: global.location,
  XMLHttpRequest: global.XMLHttpRequest,
  ManttoLabBackend: global.ManttoLabBackend,
  ManttoLabBackendReady: global.ManttoLabBackendReady,
  ManttoLabErrors: global.ManttoLabErrors
};

let nativeFetchCalls = [];

class FakeNativeXHR {
  addEventListener() {}
  open() {}
  setRequestHeader() {}
  send() {}
}

function installFixture(){
  nativeFetchCalls = [];
  Object.defineProperty(global, 'location', {
    configurable:true,
    writable:true,
    value:new URL('https://lab.example/index.html')
  });
  global.fetch = async function fakeNativeFetch(input, init){
    nativeFetchCalls.push({ input:String(input), method:String(init?.method || 'GET').toUpperCase() });
    return new Response(JSON.stringify({ static:true, input:String(input) }), {
      status:200,
      headers:{ 'content-type':'application/json' }
    });
  };
  global.XMLHttpRequest = FakeNativeXHR;
  global.ManttoLabBackend = {
    async dispatch(pathValue, options){
      if(pathValue === '/api/ok'){
        return { status:200, ok:true, headers:{ 'content-type':'application/json' }, body:{ ok:true, local:true, method:options.method } };
      }
      if(pathValue.startsWith('/api/echo')){
        return { status:200, ok:true, headers:{ 'content-type':'application/json' }, body:{ ok:true, body:options.body, headers:options.headers } };
      }
      return { status:404, ok:false, headers:{ 'content-type':'application/json' }, body:{ ok:false, message:'Ruta no encontrada' } };
    }
  };
  global.ManttoLabBackendReady = Promise.resolve();
}

installFixture();
delete require.cache[modulePath];
const transport = require(modulePath);
transport.install();

test.after(() => {
  global.fetch = original.fetch;
  if(original.location === undefined) delete global.location; else global.location = original.location;
  if(original.XMLHttpRequest === undefined) delete global.XMLHttpRequest; else global.XMLHttpRequest = original.XMLHttpRequest;
  if(original.ManttoLabBackend === undefined) delete global.ManttoLabBackend; else global.ManttoLabBackend = original.ManttoLabBackend;
  if(original.ManttoLabBackendReady === undefined) delete global.ManttoLabBackendReady; else global.ManttoLabBackendReady = original.ManttoLabBackendReady;
  if(original.ManttoLabErrors === undefined) delete global.ManttoLabErrors; else global.ManttoLabErrors = original.ManttoLabErrors;
});

test('fetch /api se resuelve localmente sin tocar fetch nativo', async () => {
  const response = await global.fetch('/api/ok');
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok:true, local:true, method:'GET' });
  assert.equal(nativeFetchCalls.length, 0);
});

test('URL Azure /api se redirige al backend LAB sin red productiva', async () => {
  const response = await global.fetch('https://mantto-gestor-api-a4hwfpgvbeb4gmgj.mexicocentral-01.azurewebsites.net/api/ok');
  assert.equal(response.status, 200);
  assert.equal((await response.json()).local, true);
  assert.equal(nativeFetchCalls.length, 0);
});

test('ruta /api desconocida falla cerrado con 501 LAB_MOCK_NOT_IMPLEMENTED', async () => {
  const response = await global.fetch('/api/no-existe');
  const payload = await response.json();
  assert.equal(response.status, 501);
  assert.equal(payload.ok, false);
  assert.equal(payload.code, 'LAB_MOCK_NOT_IMPLEMENTED');
  assert.equal(nativeFetchCalls.length, 0);
});

test('host productivo no API queda bloqueado', async () => {
  await assert.rejects(
    () => global.fetch('https://mantto-gestor-api-a4hwfpgvbeb4gmgj.mexicocentral-01.azurewebsites.net/health'),
    error => error && error.code === 'LAB_EXTERNAL_CONNECTION_BLOCKED'
  );
  assert.equal(nativeFetchCalls.length, 0);
});

test('recursos estáticos same-origin continúan por fetch nativo', async () => {
  const response = await global.fetch('/lab/database/version.json');
  assert.equal(response.status, 200);
  assert.equal(nativeFetchCalls.length, 1);
});

test('GET estático cross-origin no productivo permanece permitido', async () => {
  const response = await global.fetch('https://cdnjs.cloudflare.com/ajax/libs/example.js');
  assert.equal(response.status, 200);
  assert.equal(nativeFetchCalls.length, 2);
});

test('mutación cross-origin desconocida se bloquea por defecto', async () => {
  await assert.rejects(
    () => global.fetch('https://example.net/upload', { method:'POST', body:'x' }),
    error => error && error.code === 'LAB_EXTERNAL_CONNECTION_BLOCKED'
  );
  assert.equal(nativeFetchCalls.length, 2);
});

test('ManttoLabTransport.request usa backend local y propaga error LAB', async () => {
  assert.deepEqual(await transport.request('/api/ok'), { ok:true, local:true, method:'GET' });
  await assert.rejects(
    () => transport.request('/api/no-existe'),
    error => error && error.status === 501 && error.code === 'LAB_MOCK_NOT_IMPLEMENTED'
  );
});

test('XMLHttpRequest /api queda dentro del backend LAB', async () => {
  const xhr = new global.XMLHttpRequest();
  const done = new Promise((resolve, reject) => {
    xhr.onloadend = resolve;
    xhr.onerror = reject;
  });
  xhr.open('GET', '/api/ok');
  xhr.send();
  await done;
  assert.equal(xhr.status, 200);
  assert.equal(JSON.parse(xhr.responseText).local, true);
  assert.equal(nativeFetchCalls.length, 2);
});

test('estado declara aislamiento productivo', () => {
  const status = transport.getStatus();
  assert.equal(status.ready, true);
  assert.equal(status.productionConnectionsAllowed, false);
  assert.equal(status.apiTransport, 'ManttoLabBackend');
  assert.equal(status.guards.fetch, true);
  assert.equal(status.guards.XMLHttpRequest, true);
});
