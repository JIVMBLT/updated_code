const test = require('node:test');
const assert = require('node:assert/strict');

const Errors = require('../lab/backend/lab-errors');
global.ManttoLabErrors = Errors;
const Context = require('../lab/backend/lab-context');
global.ManttoLabContext = Context;
const RouterApi = require('../lab/backend/lab-router');
global.ManttoLabRouter = RouterApi;
const BackendApi = require('../lab/backend/lab-backend');
const SystemRoutes = require('../lab/backend/routes/lab-system.routes');

function fakeDb() {
  return {
    initCalls: 0,
    transactionCalls: 0,
    transactionRollbacks: 0,
    persistedReasons: [],
    init() {
      this.initCalls += 1;
      return Promise.resolve({ ready: true });
    },
    getStatus() {
      return { ready: true, database: 'gestor_mantto_lab', schemaVersion: 1 };
    },
    scalar(sql) {
      const text = String(sql);
      if (text.includes('usuarios')) return 61;
      if (text.includes('cobranza_proyectos')) return 15;
      if (text.includes('portafolio')) return 15;
      if (text.includes('tickets')) return 30;
      if (text.includes('pendientes')) return 20;
      if (text.includes('sqlite_master')) return 93;
      if (text.includes('user_version')) return 1;
      return 0;
    },
    query() { return []; },
    run() { return Promise.resolve({ changes: 1, lastInsertRowId: 1 }); },
    async transaction(work, options) {
      this.transactionCalls += 1;
      this.persistedReasons.push(options?.reason || null);
      const tx = {
        scalar: this.scalar.bind(this),
        query: this.query.bind(this),
        run: () => ({ changes: 1, lastInsertRowId: 44 }),
        exec: () => undefined
      };
      try {
        return await work(tx);
      } catch (error) {
        this.transactionRollbacks += 1;
        throw error;
      }
    }
  };
}

function makeBackend() {
  const db = fakeDb();
  const backend = BackendApi.create({
    db,
    debug: true,
    contextProvider: extra => Object.assign({
      requestId: 'LAB-TEST-001',
      user: { id_SB: 9001 },
      contextUser: { id_SB: 9001 },
      actorUser: { id_SB: 9001 },
      viewerContext: { active: false, readOnly: false }
    }, extra)
  });

  backend.use('/api', (req, _res, next) => {
    req.middlewareTouched = true;
    return next();
  });

  backend.router.get('/api/demo/:id', (req, res) => res.json({
    ok: true,
    data: {
      id: req.params.id,
      q: req.query.q,
      middleware: req.middlewareTouched,
      user: req.user.id_SB,
      ip: req.ip
    }
  }));

  backend.router.post('/api/demo', (req, res) => {
    const result = req.db.run('INSERT INTO demo VALUES (?)', [req.body.name]);
    return res.status(201).json({ ok: true, data: { name: req.body.name, insert: result } });
  });

  backend.router.post('/api/falla-transaccional', () => {
    throw Errors.httpError('Mutación rechazada', 409, 'LAB_MUTATION_REJECTED');
  });

  backend.router.get('/api/exposed-error', () => {
    throw Errors.httpError('Petición inválida', 400, 'LAB_BAD_REQUEST', { field: 'x' });
  });

  backend.router.get('/api/internal-error', () => {
    throw new Error('detalle interno sensible');
  });

  backend.router.get('/api/no-response', () => undefined);
  return { backend, db };
}

test('resuelve params, query, middleware y contexto sin HTTP', async () => {
  const { backend, db } = makeBackend();
  const response = await backend.dispatch('/api/demo/ABC%201?q=hola&q=mundo');
  assert.equal(response.status, 200);
  assert.equal(response.body.ok, true);
  assert.equal(response.body.data.id, 'ABC 1');
  assert.deepEqual(response.body.data.q, ['hola', 'mundo']);
  assert.equal(response.body.data.middleware, true);
  assert.equal(response.body.data.user, 9001);
  assert.equal(response.body.data.ip, '127.0.0.1');
  assert.equal(db.transactionCalls, 0);
});

test('mutaciones usan transacción de ManttoLabDB y conservan body JSON', async () => {
  const { backend, db } = makeBackend();
  const body = await backend.request('/api/demo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Registro LAB' })
  });
  assert.equal(body.ok, true);
  assert.equal(body.data.name, 'Registro LAB');
  assert.equal(body.data.insert.lastInsertRowId, 44);
  assert.equal(db.transactionCalls, 1);
  assert.equal(db.persistedReasons[0], 'lab-backend:POST:/api/demo');
});

test('error dentro de mutación propaga rollback transaccional', async () => {
  const { backend, db } = makeBackend();
  const response = await backend.dispatch('/api/falla-transaccional', { method: 'POST' });
  assert.equal(response.status, 409);
  assert.equal(response.body.code, 'LAB_MUTATION_REJECTED');
  assert.equal(db.transactionCalls, 1);
  assert.equal(db.transactionRollbacks, 1);
});

test('404 conserva contrato del backend real', async () => {
  const { backend } = makeBackend();
  const response = await backend.dispatch('/api/no-existe');
  assert.deepEqual(response.body, {
    ok: false,
    message: 'Ruta no encontrada',
    method: 'GET',
    path: '/api/no-existe'
  });
  assert.equal(response.status, 404);
});

test('errores expuestos conservan status, code y details', async () => {
  const { backend } = makeBackend();
  const response = await backend.dispatch('/api/exposed-error');
  assert.equal(response.status, 400);
  assert.equal(response.body.message, 'Petición inválida');
  assert.equal(response.body.code, 'LAB_BAD_REQUEST');
  assert.deepEqual(response.body.details, { field: 'x' });
});

test('errores 500 ocultan mensaje público y conservan diagnóstico LAB', async () => {
  const { backend } = makeBackend();
  const response = await backend.dispatch('/api/internal-error');
  assert.equal(response.status, 500);
  assert.equal(response.body.message, 'Error interno del servidor');
  assert.equal(response.body.error, 'detalle interno sensible');
});

test('ruta que termina sin respuesta falla cerrado', async () => {
  const { backend } = makeBackend();
  const response = await backend.dispatch('/api/no-response');
  assert.equal(response.status, 500);
  assert.equal(response.body.code, 'LAB_HANDLER_NO_RESPONSE');
});

test('request() lanza ManttoLabApiError en respuestas no exitosas', async () => {
  const { backend } = makeBackend();
  await assert.rejects(
    () => backend.request('/api/no-existe'),
    error => error.name === 'ManttoLabApiError' && error.status === 404
  );
});

test('JSON inválido falla cerrado con 400', async () => {
  const { backend } = makeBackend();
  const response = await backend.dispatch('/api/demo', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{mal json'
  });
  assert.equal(response.status, 400);
  assert.equal(response.body.code, 'LAB_INVALID_JSON');
});

test('rutas de sistema leen contadores desde req.db', async () => {
  const db = fakeDb();
  const backend = BackendApi.create({ db, debug: true });
  SystemRoutes.register(backend.router);
  const body = await backend.request('/api/__lab/data-counts');
  assert.equal(body.ok, true);
  assert.equal(body.data.usuarios, 61);
  assert.equal(body.data.proyectos, 15);
  assert.equal(body.data.equipos, 15);
  assert.equal(body.data.tickets, 30);
  assert.equal(body.data.pendientes, 20);
  assert.equal(body.data.tablas, 93);
  assert.equal(body.data.sqlite_user_version, 1);
});

test('Backend Engine no invoca fetch para ejecutar una ruta local', async () => {
  const previousFetch = global.fetch;
  global.fetch = () => { throw new Error('NETWORK_MUST_NOT_BE_USED'); };
  try {
    const { backend } = makeBackend();
    const response = await backend.dispatch('/api/demo/LOCAL?q=ok');
    assert.equal(response.status, 200);
    assert.equal(response.body.data.id, 'LOCAL');
  } finally {
    global.fetch = previousFetch;
  }
});
