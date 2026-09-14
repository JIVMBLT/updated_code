(function initManttoLabHomeService(root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ManttoLabHomeService = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createManttoLabHomeService(root) {
  'use strict';

  function deps() {
    const tasks = root?.ManttoLabTasksService;
    const notifications = root?.ManttoLabNotificationsService;
    const interactions = root?.ManttoLabInteractionsService;
    if (!tasks || !notifications || !interactions) throw new Error('MANTTO_LAB_PHASE6_SERVICES_REQUIRED');
    return { tasks, notifications, interactions };
  }
  function dbOr(candidate) {
    const db = candidate || root?.ManttoLabDB;
    if (!db || typeof db.query !== 'function') throw new Error('MANTTO_LAB_DB_REQUIRED');
    return db;
  }
  function current(req) { return req?.contextUser || req?.user || {}; }
  function valid(req) {
    const user = current(req);
    return Boolean(Number(user?.id_SB || user?.id) > 0 && String(user?.correo || '').trim() && String(user?.iniciales || '').trim());
  }
  function source(data) { return { ok: true, source: 'lab-sqlite', data }; }
  function unauthorized(message) { return { status: 401, body: { ok: false, message } }; }

  function snapshot(req, candidateDb) {
    const db = dbOr(candidateDb);
    if (!valid(req)) return unauthorized('Sesion sin usuario valido para consultar Home.');
    const user = current(req);
    return {
      status: 200,
      body: source({
        pendientes: deps().tasks.list(req, db),
        actividad_reciente: deps().interactions.listForUser(user.id_SB || user.id, { limit: 20, offset: 0 }, db)
      })
    };
  }

  function bootstrap(req, candidateDb) {
    const db = dbOr(candidateDb);
    if (!valid(req)) return unauthorized('Sesion sin usuario valido para consultar Home.');
    const user = current(req);
    const catalogs = deps().tasks.catalogs({
      query: { empresa: user.empresa },
      contextUser: user,
      user
    }, db);
    const unreadReq = Object.assign({}, req, { query: { estado: 'nuevas', limit: 30 } });
    const openReq = Object.assign({}, req, { query: { estado: 'abiertas', limit: 80 } });
    return {
      status: 200,
      body: source({
        pendientes: deps().tasks.list(req, db),
        notificaciones_nuevas: deps().notifications.list(unreadReq, db),
        notificaciones_abiertas: deps().notifications.list(openReq, db),
        actividad_reciente: deps().interactions.listForUser(user.id_SB || user.id, { limit: 20, offset: 0 }, db),
        catalogos: {
          areas: catalogs.areas,
          empresas: catalogs.empresas,
          usuarios: catalogs.usuarios,
          proyectos: catalogs.proyectos,
          equipos: []
        }
      })
    };
  }

  function recent(req, candidateDb) {
    const db = dbOr(candidateDb);
    if (!valid(req)) return unauthorized('Sesion sin usuario valido para consultar actividad.');
    const user = current(req);
    const limit = Math.min(200, Math.max(1, Number.parseInt(req?.query?.limit, 10) || 100));
    const offset = Math.max(0, Number.parseInt(req?.query?.offset, 10) || 0);
    return {
      status: 200,
      body: source(deps().interactions.listForUser(user.id_SB || user.id, { limit, offset }, db))
    };
  }

  return Object.freeze({ snapshot, bootstrap, recent });
});
