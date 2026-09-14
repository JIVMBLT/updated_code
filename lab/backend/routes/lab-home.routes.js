(function initManttoLabHomeRoutes(root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ManttoLabHomeRoutes = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createManttoLabHomeRoutes(root) {
  'use strict';

  function services() {
    const tasks = root?.ManttoLabTasksService;
    const home = root?.ManttoLabHomeService;
    const notifications = root?.ManttoLabNotificationsService;
    const interactions = root?.ManttoLabInteractionsService;
    if (!tasks || !home || !notifications || !interactions) throw new Error('MANTTO_LAB_PHASE6_SERVICES_REQUIRED');
    return { tasks, home, notifications, interactions };
  }
  function auth(req, res, next) {
    const fn = root?.ManttoLabAuthPermissionRoutes?.requireAuth;
    if (!fn) return res.status(500).json({ ok: false, message: 'Auth LAB no disponible.', code: 'LAB_AUTH_SERVICE_MISSING' });
    return fn(req, res, next);
  }
  function current(req) { return req.contextUser || req.user || {}; }
  function sendOutput(res, output) { return res.status(output.status || 200).json(output.body); }
  function success(data) { return { ok: true, source: 'lab-sqlite', data }; }
  function mutation(message, extra) { return { ok: true, source: 'lab-sqlite', message, ...(extra || {}) }; }

  function register(router) {
    if (!router || typeof router.get !== 'function') throw new Error('MANTTO_LAB_ROUTER_REQUIRED');

    // Home
    router.get('/api/home/snapshot', auth, (req, res) => sendOutput(res, services().home.snapshot(req, req.db)));
    router.get('/api/home/bootstrap', auth, (req, res) => sendOutput(res, services().home.bootstrap(req, req.db)));
    router.get('/api/actividad-reciente', auth, (req, res) => sendOutput(res, services().home.recent(req, req.db)));

    // Pendientes / tareas. Rutas específicas antes de /:id.
    router.get('/api/pendientes/catalogos', auth, (req, res) => res.json(success(services().tasks.catalogs(req, req.db))));
    router.get('/api/pendientes', auth, (req, res) => res.json(success(services().tasks.list(req, req.db))));
    router.get('/api/pendientes/:id/archivos/:idArchivo/acceso', auth, async (req, res) => {
      return res.json(success(await services().tasks.directFileAccess(req, req.params.id, req.params.idArchivo, req.db)));
    });
    router.get('/api/pendientes/:id/comentarios/:idComentario/adjuntos/:idAdjunto/acceso', auth, async (req, res) => {
      return res.json(success(await services().tasks.commentFileAccess(req, req.params.id, req.params.idComentario, req.params.idAdjunto, req.db)));
    });
    router.get('/api/pendientes/:id/evidencia-legacy/:tipo/acceso', auth, async (req, res) => {
      return res.json(success(await services().tasks.legacyAccess(req, req.params.id, req.params.tipo, req.db)));
    });
    router.delete('/api/pendientes/:id/archivos/:idArchivo', auth, async (req, res) => {
      const result = await services().tasks.deleteDirectFile(req, req.params.id, req.params.idArchivo, req.db);
      return res.json(mutation(result.message || 'Evidencia LAB eliminada correctamente.'));
    });
    router.get('/api/pendientes/:id', auth, (req, res) => res.json(success(services().tasks.detail(req, req.params.id, req.db))));
    router.post('/api/pendientes', auth, async (req, res) => {
      const result = await services().tasks.create(req, req.db);
      return res.status(201).json(mutation(result.message, result));
    });
    router.put('/api/pendientes/:id', auth, async (req, res) => {
      const result = await services().tasks.update(req, req.params.id, req.db);
      return res.json(mutation(result.message, result));
    });
    router.delete('/api/pendientes/:id', auth, async (req, res) => {
      const result = await services().tasks.remove(req, req.params.id, req.db);
      return res.json(mutation(result.message, { limpieza_storage: result.limpieza_storage }));
    });
    router.patch('/api/pendientes/:id/estatus', auth, async (req, res) => {
      const result = await services().tasks.changeStatus(req, req.params.id, req.db);
      return res.json(mutation(result.message));
    });
    router.patch('/api/pendientes/:id/prioridad', auth, async (req, res) => {
      const result = await services().tasks.changePriority(req, req.params.id, req.db);
      return res.json(mutation(result.message));
    });
    router.post('/api/pendientes/:id/comentarios', auth, async (req, res) => {
      const result = await services().tasks.comment(req, req.params.id, req.db);
      return res.status(201).json(mutation(result.message, result));
    });
    router.patch('/api/pendientes/:id/subtareas/:idSubtarea', auth, async (req, res) => {
      const result = await services().tasks.changeSubtask(req, req.params.id, req.params.idSubtarea, req.db);
      return res.json(mutation(result.message));
    });

    // Notificaciones locales. No hay push externo en LAB.
    router.get('/api/notificaciones', auth, (req, res) => res.json(success(services().notifications.list(req, req.db))));
    router.get('/api/notificaciones/estado', auth, (req, res) => res.json(success(services().notifications.status(req, req.db))));
    router.patch('/api/notificaciones/:id/abrir', auth, async (req, res) => {
      const ok = await services().notifications.mark(req.params.id, current(req).id_SB, true, req.db);
      return ok
        ? res.json(mutation('Notificacion marcada como abierta.'))
        : res.status(404).json({ ok: false, message: 'Notificacion no encontrada.' });
    });
    router.patch('/api/notificaciones/:id/nuevo', auth, async (req, res) => {
      const ok = await services().notifications.mark(req.params.id, current(req).id_SB, false, req.db);
      return ok
        ? res.json(mutation('Notificacion marcada como nueva.'))
        : res.status(404).json({ ok: false, message: 'Notificacion no encontrada.' });
    });
    router.get('/api/notificaciones/preferencias', auth, (req, res) => {
      return res.json(success(services().notifications.preferences(current(req).id_SB, req.db)));
    });
    router.put('/api/notificaciones/preferencias', auth, async (req, res) => {
      const data = await services().notifications.savePreferences(current(req).id_SB, req.body || {}, req.db);
      return res.json(mutation('Preferencias de notificaciones actualizadas.', { data }));
    });

    // Interacciones. El navegador no puede fabricar acciones operativas.
    router.get('/api/interacciones', auth, (req, res) => {
      return res.json(success(services().interactions.listForUser(current(req).id_SB, {
        limit: req.query.limit,
        offset: req.query.offset
      }, req.db)));
    });
    router.post('/api/interacciones', auth, (req, res) => {
      const output = services().interactions.clientCreate(req.body || {});
      return res.status(output.status).json(output.body);
    });

    router.get('/api/__lab/home-status', auth, async (req, res) => {
      return res.json({
        ok: true,
        source: 'lab-sqlite',
        data: {
          visible_tasks: services().tasks.list(req, req.db).length,
          notifications: services().notifications.status(req, req.db),
          interactions: services().interactions.listForUser(current(req).id_SB, { limit: 200 }, req.db).length,
          blob_count: await root.ManttoLabBlobStore.count(),
          user_version: Number(req.db.scalar('PRAGMA user_version') || 0),
          production_connections_allowed: false
        }
      });
    });
    return router;
  }

  return Object.freeze({ register });
});
