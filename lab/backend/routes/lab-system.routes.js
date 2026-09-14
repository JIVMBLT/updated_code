(function initManttoLabSystemRoutes(root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ManttoLabSystemRoutes = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createManttoLabSystemRoutes(root) {
  'use strict';

  const VERSION = 'FASE_2_LAB_DGB_SYSTEM_ROUTES_V002';

  function register(router) {
    if (!router) throw new Error('LAB_SYSTEM_ROUTER_REQUIRED');

    router.route('GET', '/api/__lab/health', { transaction: false }, (req, res) => {
      const dbStatus = root?.ManttoLabDB?.getStatus ? root.ManttoLabDB.getStatus() : null;
      return res.json({
        ok: true,
        data: {
          lab: true,
          lineage: 'LAB_DGB_V2',
          mode: 'DGB',
          backend: 'in-browser',
          backend_version: VERSION,
          external_api: false,
          database: dbStatus
        }
      });
    });

    router.route('GET', '/api/__lab/routes', { transaction: false }, (_req, res) => {
      return res.json({ ok: true, data: router.list() });
    });

    router.route('GET', '/api/__lab/data-counts', { transaction: false }, (req, res) => {
      return res.json({
        ok: true,
        data: {
          usuarios: Number(req.db.scalar('SELECT COUNT(*) FROM usuarios') || 0),
          proyectos: Number(req.db.scalar('SELECT COUNT(*) FROM cobranza_proyectos') || 0),
          equipos: Number(req.db.scalar('SELECT COUNT(*) FROM portafolio') || 0),
          tickets: Number(req.db.scalar('SELECT COUNT(*) FROM tickets') || 0),
          pendientes: Number(req.db.scalar('SELECT COUNT(*) FROM pendientes') || 0),
          tablas: Number(req.db.scalar("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'") || 0),
          sqlite_user_version: Number(req.db.scalar('PRAGMA user_version') || 0)
        }
      });
    });

    router.route('POST', '/api/__lab/echo/:id', { transaction: false }, (req, res) => {
      return res.status(200).json({
        ok: true,
        data: {
          id: req.params.id,
          query: req.query,
          body: req.body,
          request_id: req.context?.requestId || null,
          method: req.method,
          path: req.path
        }
      });
    });

    return router;
  }

  return Object.freeze({ VERSION, register });
});
