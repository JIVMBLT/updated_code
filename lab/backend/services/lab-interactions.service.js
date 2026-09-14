(function initManttoLabInteractionsService(root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ManttoLabInteractionsService = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createManttoLabInteractionsService(root) {
  'use strict';

  function dbOr(candidate) {
    const db = candidate || root?.ManttoLabDB;
    if (!db || typeof db.query !== 'function') throw new Error('MANTTO_LAB_DB_REQUIRED');
    return db;
  }
  function id(value) { const n = Number(value); return Number.isInteger(n) && n > 0 ? n : 0; }
  function text(value, max, fallback = null) {
    const clean = value == null ? '' : String(value).trim();
    return clean ? clean.slice(0, max) : fallback;
  }
  function parseJson(value) {
    if (value == null || value === '') return null;
    if (typeof value === 'object') return value;
    try { return JSON.parse(String(value)); } catch (_error) { return null; }
  }
  function json(value) {
    if (!value || typeof value !== 'object') return null;
    try { return JSON.stringify(value); } catch (_error) { return null; }
  }
  function normalizeType(value) {
    return (text(value, 50, 'INTERACCION') || 'INTERACCION').toUpperCase().replace(/[^A-Z0-9_]/g, '_').replace(/_+/g, '_');
  }
  function publicRow(row) {
    if (!row) return row;
    const { metodo_http: _method, endpoint: _endpoint, ip_address: _ip, user_agent: _ua, ...safe } = row;
    return { ...safe, payload_json: parseJson(row.payload_json), detalle_json: parseJson(row.detalle_json) };
  }
  function listForUser(userId, options, candidateDb) {
    const uid = id(userId); if (!uid) return [];
    const db = dbOr(candidateDb), cfg = options || {};
    const limit = Math.min(200, Math.max(1, Number.parseInt(cfg.limit, 10) || 100));
    const offset = Math.max(0, Number.parseInt(cfg.offset, 10) || 0);
    return db.query(`SELECT * FROM usuario_interacciones WHERE id_usuario=? ORDER BY datetime(created_at) DESC,id_interaccion DESC LIMIT ? OFFSET ?`, [uid, limit, offset]).map(publicRow);
  }
  async function record(input, candidateDb) {
    const data = input || {}, db = dbOr(candidateDb), uid = id(data.id_usuario || data.userId);
    if (!uid) throw Object.assign(new Error('Usuario inválido para registrar interacción.'), { status: 400, code: 'LAB_INTERACTION_USER_INVALID' });
    const type = normalizeType(data.tipo_interaccion || data.tipo);
    const moduleName = text(data.modulo, 120, 'general');
    const title = text(data.titulo, 255, `${type} en ${moduleName}`);
    const result = await db.run(`
      INSERT INTO usuario_interacciones
        (id_usuario,tipo_interaccion,modulo,entidad,id_referencia,titulo,descripcion,empresa_contexto,ruta_destino,payload_json,detalle_json,metodo_http,endpoint,ip_address,user_agent)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `,[uid,type,moduleName,text(data.entidad,100),text(data.id_referencia,150),title,text(data.descripcion,500),text(data.empresa_contexto,150),text(data.ruta_destino,500),json(data.payload_json),json(data.detalle_json),text(data.metodo_http,10)?.toUpperCase()||null,text(data.endpoint,500),null,'LAB DGB Browser']);
    const row = db.query('SELECT * FROM usuario_interacciones WHERE id_interaccion=?',[Number(result.lastInsertRowId)])[0];
    return publicRow(row);
  }
  async function recordTaskAction(req, type, task, extra, candidateDb) {
    const actor = req?.actorUser || req?.user || req?.contextUser || {};
    const row = task || {};
    const idPendiente = Number(row.id_pendiente || extra?.id_pendiente || 0) || null;
    const verbs = { CREAR:'Creaste', EDITAR:'Editaste', ELIMINAR:'Eliminaste', CAMBIAR_ESTATUS:'Cambiaste el estatus de', CAMBIAR_PRIORIDAD:'Cambiaste la prioridad de', COMENTAR:'Comentaste en', ADJUNTAR:'Adjuntaste archivo en' };
    const verb = verbs[String(type || '').toUpperCase()] || 'Actualizaste';
    return record({
      id_usuario: actor.id_SB,
      tipo_interaccion: type,
      modulo: 'tareas',
      entidad: 'tarea',
      id_referencia: idPendiente,
      titulo: `${verb} Tarea${idPendiente ? ' ' + idPendiente : ''}`,
      descripcion: text(extra?.descripcion || row.pendiente, 500, null),
      empresa_contexto: row.empresa || actor.empresa || null,
      ruta_destino: 'tareas',
      payload_json: idPendiente ? { id: idPendiente } : null,
      detalle_json: { contexto: { proyecto: row.proyecto || null, equipo: row.equipo || null } },
      metodo_http: req?.method || null,
      endpoint: req?.path || null
    }, candidateDb);
  }
  function clientCreate(body) {
    const type = String(body?.tipo_interaccion || body?.tipo || '').trim().toUpperCase();
    if (type === 'NAVEGACION' || type === 'CONSULTAR') return { status: 200, body: { ok: true, skipped: true, reason: 'SOLO_ACCIONES_OPERATIVAS_BACKEND' } };
    return { status: 400, body: { ok: false, message: 'Las interacciones operativas se registran exclusivamente desde backend después de una acción exitosa.' } };
  }
  return Object.freeze({ listForUser, record, recordTaskAction, clientCreate, publicRow });
});
