(function initManttoLabNotificationsService(root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ManttoLabNotificationsService = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createManttoLabNotificationsService(root) {
  'use strict';

  const TASK_ASSIGNED = 'tareas.asignada';
  const TASK_COMMENT = 'tareas.comentario.creado';

  function dbOr(candidate) {
    const db = candidate || root?.ManttoLabDB;
    if (!db || typeof db.query !== 'function' || typeof db.scalar !== 'function') {
      throw new Error('MANTTO_LAB_DB_REQUIRED');
    }
    return db;
  }

  function uid(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : 0;
  }

  function text(value, max, fallback = '') {
    const clean = value == null ? '' : String(value).trim();
    return clean ? clean.slice(0, max || clean.length) : fallback;
  }

  function normalizeState(value) {
    const state = String(value || '').trim().toLowerCase();
    if (['nuevas', 'nueva', 'unread', 'no_leidas', 'no-leidas'].includes(state)) return 0;
    if (['abiertas', 'abierta', 'read', 'leidas', 'leida'].includes(state)) return 1;
    return null;
  }

  function parseVisualCodes(value) {
    if (Array.isArray(value)) return [...new Set(value.map(String).map(v => v.trim().toUpperCase()).filter(Boolean))];
    if (value == null || value === '') return [];
    try {
      const parsed = JSON.parse(String(value));
      return Array.isArray(parsed)
        ? [...new Set(parsed.map(String).map(v => v.trim().toUpperCase()).filter(Boolean))]
        : [];
    } catch (_error) {
      return [];
    }
  }

  function eventRow(code, candidateDb) {
    const db = dbOr(candidateDb);
    const key = text(code, 150);
    if (!key) return null;
    return db.query('SELECT * FROM notificacion_eventos WHERE codigo_evento=? AND activo=1 LIMIT 1', [key])[0] || null;
  }

  function matrixRows(code, candidateDb) {
    const db = dbOr(candidateDb);
    return db.query(`SELECT ner.codigo_evento,ner.id_rol,UPPER(TRIM(ner.politica)) AS politica
      FROM notificacion_evento_roles ner
      INNER JOIN roles r ON r.id_rol=ner.id_rol AND r.estado=1
      WHERE ner.codigo_evento=? AND ner.activo=1
        AND UPPER(TRIM(ner.politica)) IN ('OBLIGATORIA','OPCIONAL')
      ORDER BY ner.id_rol`, [text(code, 150)]);
  }

  function userRoleIds(userId, candidateDb) {
    const db = dbOr(candidateDb), id = uid(userId);
    if (!id) return [];
    return db.query(`SELECT DISTINCT ur.id_rol
      FROM usuario_roles ur
      INNER JOIN roles r ON r.id_rol=ur.id_rol AND r.estado=1
      WHERE ur.id_usuario=? AND ur.activo=1
      ORDER BY ur.id_rol`, [id]).map(row => Number(row.id_rol)).filter(Number.isInteger);
  }

  function preferenceRow(userId, code, candidateDb) {
    const db = dbOr(candidateDb), id = uid(userId);
    if (!id) return null;
    return db.query('SELECT * FROM notificacion_preferencias WHERE id_usuario=? AND codigo_evento=? LIMIT 1', [id, text(code, 150)])[0] || null;
  }

  function policyDecision(userId, code, channel, candidateDb) {
    const db = dbOr(candidateDb), event = eventRow(code, db);
    if (!event) return { exists: false, allowed: false, mandatory: false, reason: 'EVENT_NOT_FOUND' };
    const matrix = matrixRows(code, db);
    if (!matrix.length) {
      // Igual que notification-policy.js real: un evento sin matriz activa se
      // conserva visible por compatibilidad legacy.
      return { exists: false, allowed: true, mandatory: Number(event.obligatoria) === 1, reason: 'LEGACY_NO_MATRIX' };
    }

    const roles = new Set(userRoleIds(userId, db));
    const applicable = matrix.filter(row => roles.has(Number(row.id_rol)));
    if (!applicable.length) return { exists: true, allowed: false, mandatory: false, reason: 'ROLE_MATRIX_DENIED' };
    if (applicable.some(row => row.politica === 'OBLIGATORIA')) {
      return { exists: true, allowed: true, mandatory: true, reason: 'ROLE_MATRIX_MANDATORY' };
    }

    const preference = preferenceRow(userId, code, db);
    const channelName = channel === 'push' ? 'push' : channel === 'correo' ? 'correo' : 'campana';
    const defaultColumn = channelName === 'push' ? 'push_default' : channelName === 'correo' ? 'correo_default' : 'campana_default';
    const fallback = channelName === 'campana' ? 1 : 0;
    const silenced = Number(preference?.silenciada || 0) === 1;
    const configured = preference && preference[channelName] !== null && preference[channelName] !== undefined
      ? Number(preference[channelName])
      : Number(event[defaultColumn] ?? fallback);
    return {
      exists: true,
      allowed: !silenced && configured === 1,
      mandatory: false,
      reason: !silenced && configured === 1 ? 'ROLE_MATRIX_OPTIONAL_ENABLED' : 'ROLE_MATRIX_OPTIONAL_DISABLED'
    };
  }

  function taskVisible(notification, currentUser, candidateDb) {
    if (String(notification?.accion_notificacion || '').trim().toUpperCase() !== 'ABRIR_TAREA' || !notification?.id_referencia) return true;
    const db = dbOr(candidateDb), taskId = Number(notification.id_referencia);
    const task = db.query('SELECT id_pendiente,tipo_pendiente,creado_por_email FROM pendientes WHERE id_pendiente=? LIMIT 1', [taskId])[0];
    if (!task) return false;
    const correo = String(currentUser?.correo || '').trim().toLowerCase();
    const initials = String(currentUser?.iniciales || '').trim().toUpperCase();
    const creator = correo && String(task.creado_por_email || '').trim().toLowerCase() === correo;
    if (String(task.tipo_pendiente || 'PERSONAL').toUpperCase() === 'PERSONAL') return Boolean(creator);
    if (creator) return true;
    if (!initials) return false;
    return Number(db.scalar(`SELECT 1 FROM pendientes_usuarios
      WHERE id_pendiente=? AND UPPER(TRIM(iniciales_usuario))=? LIMIT 1`, [taskId, initials]) || 0) === 1;
  }

  function bellVisible(notification, userId, candidateDb) {
    return policyDecision(userId, notification?.tipo_notificacion, 'campana', candidateDb).allowed;
  }

  function toInboxRow(row) {
    const copy = { ...row };
    if ('codigos_visuales_json' in copy) {
      copy.codigos_visuales = parseVisualCodes(copy.codigos_visuales_json);
      delete copy.codigos_visuales_json;
    } else if ('codigos_visuales' in copy) {
      copy.codigos_visuales = parseVisualCodes(copy.codigos_visuales);
    }
    return copy;
  }

  function list(req, candidateDb) {
    const db = dbOr(candidateDb), currentUser = req?.contextUser || req?.user || {};
    const id = uid(currentUser.id_SB || currentUser.id);
    if (!id) throw Object.assign(new Error('Sesion sin usuario valido.'), { status: 401, code: 'LAB_NOTIFICATION_USER_REQUIRED' });
    const state = normalizeState(req?.query?.estado || req?.query?.status || req?.query?.tipo_vista);
    const limit = Math.min(200, Math.max(1, Number.parseInt(req?.query?.limit, 10) || (state === 1 ? 80 : 30)));
    const params = [id];
    let sql = 'SELECT * FROM sup_notificaciones WHERE activo=1 AND id_usuario=?';
    if (state !== null) { sql += ' AND leido=?'; params.push(state); }
    sql += state === 1
      ? ' ORDER BY datetime(COALESCE(fecha_lectura,fecha_creacion)) DESC,datetime(fecha_creacion) DESC,id_notificacion DESC'
      : ' ORDER BY datetime(fecha_creacion) DESC,id_notificacion DESC';
    sql += ' LIMIT ?'; params.push(limit);
    return db.query(sql, params)
      .filter(row => taskVisible(row, currentUser, db))
      .filter(row => bellVisible(row, id, db))
      .map(toInboxRow);
  }

  function status(req, candidateDb) {
    const rows = list(Object.assign({}, req, { query: { estado: 'nuevas', limit: 200 } }), candidateDb);
    return { nuevas: rows.length, hay_nuevas: rows.length > 0 };
  }

  async function mark(notificationId, userId, opened, candidateDb) {
    const db = dbOr(candidateDb), id = uid(userId), notification = Number(notificationId);
    if (!id || !Number.isInteger(notification) || notification <= 0) return false;
    const result = opened
      ? await db.run(`UPDATE sup_notificaciones SET leido=1,fecha_lectura=CURRENT_TIMESTAMP,fecha_actualizacion=CURRENT_TIMESTAMP
          WHERE id_notificacion=? AND id_usuario=? AND activo=1`, [notification, id])
      : await db.run(`UPDATE sup_notificaciones SET leido=0,fecha_lectura=NULL,fecha_actualizacion=CURRENT_TIMESTAMP
          WHERE id_notificacion=? AND id_usuario=? AND activo=1`, [notification, id]);
    return Number(result?.changes || 0) > 0;
  }

  function preferences(userId, candidateDb) {
    const db = dbOr(candidateDb), id = uid(userId);
    if (!id) throw Object.assign(new Error('Sesion sin usuario valido.'), { status: 401 });
    return db.query(`SELECT e.codigo_evento,e.agrupacion,e.modulo,e.accion,e.nombre_evento,e.descripcion,
        e.prioridad_default,e.configurable,e.obligatoria,e.campana_default,e.push_default,e.correo_default,e.orden,
        p.id_preferencia,p.campana,p.push,p.correo,p.silenciada
      FROM notificacion_eventos e
      LEFT JOIN notificacion_preferencias p ON p.codigo_evento=e.codigo_evento AND p.id_usuario=?
      WHERE e.activo=1 ORDER BY e.orden,e.codigo_evento`, [id]).map(row => {
        const bell = policyDecision(id, row.codigo_evento, 'campana', db);
        const push = policyDecision(id, row.codigo_evento, 'push', db);
        const mail = policyDecision(id, row.codigo_evento, 'correo', db);
        return {
          ...row,
          campana: bell.mandatory ? 1 : Number(row.campana ?? row.campana_default ?? 1),
          push: push.mandatory ? 1 : Number(row.push ?? row.push_default ?? 0),
          correo: mail.mandatory ? 1 : Number(row.correo ?? row.correo_default ?? 0),
          silenciada: bell.mandatory || push.mandatory || mail.mandatory ? 0 : Number(row.silenciada || 0),
          politica_lab: bell.mandatory ? 'OBLIGATORIA' : (bell.exists ? 'OPCIONAL' : 'LEGACY')
        };
      });
  }

  async function savePreferences(userId, body, candidateDb) {
    const db = dbOr(candidateDb), id = uid(userId);
    if (!id) throw Object.assign(new Error('Sesion sin usuario valido.'), { status: 401 });
    const entries = Array.isArray(body?.preferencias) ? body.preferencias : (body?.codigo_evento ? [body] : []);
    if (!entries.length) throw Object.assign(new Error('No se recibieron preferencias.'), { status: 400, code: 'LAB_NOTIFICATION_PREFERENCES_REQUIRED' });

    for (const item of entries) {
      const code = text(item?.codigo_evento, 150);
      if (!eventRow(code, db)) throw Object.assign(new Error(`Evento de notificacion no reconocido: ${code}`), { status: 400, code: 'LAB_NOTIFICATION_EVENT_UNKNOWN' });
      const decisions = ['campana', 'push', 'correo'].map(channel => policyDecision(id, code, channel, db));
      const mandatory = decisions.some(decision => decision.mandatory);
      const values = mandatory
        ? { campana: 1, push: 1, correo: 1, silenciada: 0 }
        : {
            campana: Number(item.campana) !== 0 ? 1 : 0,
            push: Number(item.push) === 1 ? 1 : 0,
            correo: Number(item.correo) === 1 ? 1 : 0,
            silenciada: Number(item.silenciada) === 1 ? 1 : 0
          };
      await db.run(`INSERT INTO notificacion_preferencias
          (id_usuario,codigo_evento,campana,push,correo,silenciada,created_at,updated_at)
        VALUES(?,?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
        ON CONFLICT(id_usuario,codigo_evento) DO UPDATE SET
          campana=excluded.campana,push=excluded.push,correo=excluded.correo,
          silenciada=excluded.silenciada,updated_at=CURRENT_TIMESTAMP`,
        [id, code, values.campana, values.push, values.correo, values.silenciada]);
    }
    return preferences(id, db);
  }

  async function insertNotification(input, candidateDb) {
    const db = dbOr(candidateDb), data = input || {}, recipient = uid(data.id_usuario);
    if (!recipient) return { created: 0, reason: 'RECIPIENT_INVALID' };
    const event = eventRow(data.codigo_evento, db);
    if (!event) return { created: 0, reason: 'EVENT_NOT_FOUND' };
    const matrix = policyDecision(recipient, event.codigo_evento, 'campana', db);
    if (matrix.exists && matrix.reason === 'ROLE_MATRIX_DENIED') return { created: 0, reason: 'ROLE_MATRIX_DENIED' };

    const key = text(data.clave_deduplicacion, 255) || null;
    const result = await db.run(`INSERT OR IGNORE INTO sup_notificaciones
      (id_usuario,tipo_notificacion,titulo_notificacion,mensaje_notificacion,icono_notificacion,
       accion_notificacion,id_referencia,ruta_destino,clave_deduplicacion,trace_id,leido,activo,fecha_creacion,fecha_actualizacion)
      VALUES(?,?,?,?,?,?,?,?,?,?,0,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`, [
        recipient,
        event.codigo_evento,
        text(data.titulo, 255, event.titulo_default || event.nombre_evento || 'Notificacion LAB'),
        text(data.mensaje, 1000, event.mensaje_default || 'Evento de laboratorio.'),
        text(data.icono, 50, event.icono_default || 'LAB'),
        text(data.accion, 100, event.accion_destino || 'ABRIR_MODULO'),
        data.id_referencia || null,
        text(data.ruta, 500, event.ruta_default || '') || null,
        key,
        text(data.trace_id, 100) || null
      ]);
    const created = Number(result?.changes || 0);
    return { created, reason: created > 0 ? 'OK' : 'DUPLICADO_EVITADO' };
  }

  async function emitTaskAssignment(taskId, creator, recipientInitials, relationId, candidateDb) {
    const db = dbOr(candidateDb);
    const recipient = db.query(`SELECT id_SB FROM usuarios
      WHERE estado=1 AND UPPER(TRIM(iniciales))=UPPER(TRIM(?)) LIMIT 1`, [recipientInitials])[0];
    if (!recipient) return { created: 0, reason: 'RECIPIENT_NOT_FOUND' };
    return insertNotification({
      id_usuario: recipient.id_SB,
      codigo_evento: TASK_ASSIGNED,
      titulo: 'Nueva tarea asignada',
      mensaje: `${creator?.iniciales || creator?.correo || 'Usuario LAB'} te asigno una tarea LAB.`,
      icono: '🆕',
      accion: 'ABRIR_TAREA',
      id_referencia: taskId,
      ruta: `home:tarea:${taskId}`,
      clave_deduplicacion: `lab:tarea-asignacion:${taskId}:${relationId}`
    }, db);
  }

  async function emitTaskComment(task, actorUser, commentId, candidateDb) {
    const db = dbOr(candidateDb), recipients = new Set();
    const creator = db.query(`SELECT id_SB FROM usuarios
      WHERE estado=1 AND LOWER(TRIM(correo))=LOWER(TRIM(?)) LIMIT 1`, [task.creado_por_email])[0];
    if (creator?.id_SB) recipients.add(Number(creator.id_SB));
    db.query(`SELECT u.id_SB FROM pendientes_usuarios pu
      INNER JOIN usuarios u ON UPPER(TRIM(u.iniciales))=UPPER(TRIM(pu.iniciales_usuario)) AND u.estado=1
      WHERE pu.id_pendiente=?`, [task.id_pendiente]).forEach(row => recipients.add(Number(row.id_SB)));
    recipients.delete(Number(actorUser?.id_SB || actorUser?.id || 0));

    let created = 0;
    const results = [];
    for (const id of recipients) {
      const result = await insertNotification({
        id_usuario: id,
        codigo_evento: TASK_COMMENT,
        titulo: 'Nueva interaccion en tarea',
        mensaje: `${actorUser?.iniciales || actorUser?.correo || 'Usuario LAB'} comento en una tarea LAB.`,
        icono: '💬',
        accion: 'ABRIR_TAREA',
        id_referencia: task.id_pendiente,
        ruta: `home:tarea:${task.id_pendiente}`,
        clave_deduplicacion: `lab:tarea-comentario:${commentId}:${id}`
      }, db);
      created += Number(result.created || 0);
      results.push({ id_usuario: id, ...result });
    }
    return { created, results };
  }

  return Object.freeze({
    TASK_ASSIGNED,
    TASK_COMMENT,
    list,
    status,
    mark,
    preferences,
    savePreferences,
    insertNotification,
    emitTaskAssignment,
    emitTaskComment,
    taskVisible,
    bellVisible,
    policyDecision
  });
});
