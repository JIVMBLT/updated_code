(function initManttoLabTasksService(root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ManttoLabTasksService = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createManttoLabTasksService(root) {
  'use strict';

  const MAX_FILE_BYTES = 25 * 1024 * 1024;
  const VALID_STATUS = new Set(['Pendiente', 'En proceso', 'Cerrado']);
  const VALID_PRIORITY = new Set(['BAJA', 'MEDIA', 'ALTA', 'CRITICA']);
  const COMPANY_CORELLIAN = 'CORELLIAN';
  const COMPANY_UNITED = 'UNITED';

  function deps() {
    const blobs = root?.ManttoLabBlobStore;
    const interactions = root?.ManttoLabInteractionsService;
    const notifications = root?.ManttoLabNotificationsService;
    const scope = root?.ManttoLabScopeService;
    const assets = root?.ManttoLabSharedAssetsService;
    if (!blobs || !interactions || !notifications || !scope || !assets) {
      throw new Error('MANTTO_LAB_PHASE6_SERVICES_REQUIRED');
    }
    return { blobs, interactions, notifications, scope, assets };
  }

  function dbOr(candidate) {
    const db = candidate || root?.ManttoLabDB;
    if (!db || typeof db.query !== 'function' || typeof db.scalar !== 'function') throw new Error('MANTTO_LAB_DB_REQUIRED');
    return db;
  }
  function user(req) { return req?.contextUser || req?.user || {}; }
  function actor(req) { return req?.actorUser || req?.user || req?.contextUser || {}; }
  function text(value, max) { const s = value == null ? '' : String(value).trim(); return max ? s.slice(0, max) : s; }
  function initials(value) { return text(value, 20).toUpperCase(); }
  function email(value) { return text(value, 255).toLowerCase(); }
  function bool(value) { return value === true || value === 1 || value === '1' || ['true', 'on'].includes(String(value || '').toLowerCase()); }
  function parseJson(value, fallback) {
    if (value === undefined || value === null || value === '') return fallback;
    if (typeof value === 'object' && !(typeof Blob !== 'undefined' && value instanceof Blob)) return value;
    try { return JSON.parse(String(value)); } catch (_error) { return fallback; }
  }
  function taskType(value) { return String(value || 'PERSONAL').trim().toUpperCase() === 'COLABORATIVA' ? 'COLABORATIVA' : 'PERSONAL'; }
  function status(value) { const s = String(value || 'Pendiente').trim(); return VALID_STATUS.has(s) ? s : 'Pendiente'; }
  function priority(value, fallback) {
    if (value === null || value === undefined || value === '') return fallback === undefined ? null : fallback;
    const p = String(value).trim().toUpperCase();
    return VALID_PRIORITY.has(p) ? p : (fallback === undefined ? null : fallback);
  }
  function dateOnly(value) { const s = text(value, 20); if (!s) return null; return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null; }
  function httpError(message, statusCode, code) {
    const error = new Error(message);
    error.status = statusCode || 500;
    error.code = code || null;
    error.expose = true;
    return error;
  }
  function isFile(value) { return deps().blobs.isFileLike(value); }
  function safeFile(value) { return isFile(value) && Number(value.size || 0) > 0 ? value : null; }

  function normalizeCompanyDomain(value) {
    const raw = String(value || '').trim().toUpperCase();
    if (raw.includes('CORELLIAN')) return COMPANY_CORELLIAN;
    if (raw.includes('UNITED')) return COMPANY_UNITED;
    return null;
  }

  function companyLabelsByDomain(db) {
    const rows = db.query(`SELECT DISTINCT empresa FROM usuarios
      WHERE estado=1 AND empresa IS NOT NULL AND TRIM(empresa)<>'' ORDER BY empresa`);
    const byDomain = { CORELLIAN: [], UNITED: [] };
    for (const row of rows) {
      const label = text(row.empresa, 150), domain = normalizeCompanyDomain(label);
      if (domain && !byDomain[domain].includes(label)) byDomain[domain].push(label);
    }
    return byDomain;
  }

  function companyContext(currentUser, requestedCompany, candidateDb, options) {
    const db = dbOr(candidateDb), cfg = options || {};
    const scope = deps().scope.snapshot(Number(currentUser?.id_SB), db);
    const masters = {
      corellian: scope?.engines?.corellian?.llave_maestra === true,
      united: scope?.engines?.united?.llave_maestra === true
    };
    masters.ambas = masters.corellian && masters.united;

    const defaultRaw = text(currentUser?.empresa, 150);
    const defaultDomain = normalizeCompanyDomain(defaultRaw);
    const requestedRaw = text(requestedCompany, 150);
    const requestedDomain = normalizeCompanyDomain(requestedRaw);
    const labels = companyLabelsByDomain(db);

    if (requestedRaw && !requestedDomain && (!defaultRaw || requestedRaw.toLowerCase() !== defaultRaw.toLowerCase())) {
      throw httpError(
        'La empresa seleccionada no corresponde a Corellian o United.',
        400,
        'PENDIENTE_EMPRESA_NO_SOPORTADA'
      );
    }

    if (masters.ambas) {
      const allowed = [...labels.CORELLIAN, ...labels.UNITED];
      // Las identidades generales sintéticas (BLT LAB) no representan una razón
      // social operativa. En catálogos se permite quedar sin selección para que
      // el usuario elija CORELLIAN/UNITED; al persistir sí se exige una.
      const selectedDomain = requestedDomain || defaultDomain;
      if (!selectedDomain && cfg.requireSelection) {
        throw httpError('Selecciona la empresa o razon social de la tarea.', 400, 'PENDIENTE_EMPRESA_REQUIRED');
      }
      const selected = selectedDomain
        ? (requestedDomain === selectedDomain && requestedRaw ? requestedRaw : (labels[selectedDomain]?.[0] || null))
        : null;
      return {
        scope,
        masters,
        domain: selectedDomain,
        empresaDefault: defaultDomain ? defaultRaw : null,
        empresaSeleccionada: selected,
        empresasPermitidas: allowed,
        puedeSeleccionarEmpresa: true
      };
    }

    if (defaultDomain) {
      if (requestedDomain && requestedDomain !== defaultDomain) {
        throw httpError('No tienes autorizacion para cambiar la razon social de esta tarea.', 403, 'PENDIENTE_EMPRESA_FORBIDDEN');
      }
      return {
        scope,
        masters,
        domain: defaultDomain,
        empresaDefault: defaultRaw,
        empresaSeleccionada: defaultRaw,
        empresasPermitidas: [defaultRaw],
        puedeSeleccionarEmpresa: false
      };
    }

    if (requestedRaw && defaultRaw && requestedRaw.toLowerCase() !== defaultRaw.toLowerCase()) {
      throw httpError('No tienes autorizacion para cambiar la razon social de esta tarea.', 403, 'PENDIENTE_EMPRESA_FORBIDDEN');
    }
    return {
      scope,
      masters,
      domain: null,
      empresaDefault: defaultRaw || null,
      empresaSeleccionada: defaultRaw || requestedRaw || null,
      empresasPermitidas: [defaultRaw || requestedRaw].filter(Boolean),
      puedeSeleccionarEmpresa: false
    };
  }

  function resolveCompany(currentUser, requested, existing, candidateDb) {
    const selected = text(requested, 150) || text(existing, 150) || null;
    const ctx = companyContext(currentUser, selected, candidateDb, { requireSelection: true });
    if (!ctx.empresaSeleccionada) throw httpError('Selecciona la empresa o razon social de la tarea.', 400, 'PENDIENTE_EMPRESA_REQUIRED');
    return ctx.empresaSeleccionada;
  }

  function sanitizeRichText(value) {
    const raw = String(value || '');
    if (root?.ManttoRichText?.sanitizeHtml) return root.ManttoRichText.sanitizeHtml(raw);
    // Fail-safe cuando el helper de Rich Text todavía no fue cargado: se conserva
    // el contenido como texto, nunca HTML ejecutable.
    return raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\r\n?|\n/g, '<br>');
  }

  function normalizeUsers(body) {
    const raw = parseJson(body?.usuarios_json, body?.usuarios || []);
    const list = Array.isArray(raw) ? raw : [];
    return [...new Set(list.map(value => initials(
      typeof value === 'string' ? value : (value?.iniciales_usuario || value?.iniciales || value?.value)
    )).filter(Boolean))];
  }

  function normalizeSubtasks(body) {
    const raw = parseJson(body?.subtareas_json, body?.subtareas || []);
    const list = Array.isArray(raw) ? raw : [];
    return list.map((value, index) => ({
      subtarea: text(typeof value === 'string' ? value : (value?.subtarea || value?.texto), 500),
      estatus: status(value?.estatus) === 'Cerrado' ? 'Cerrado' : 'Pendiente',
      orden: index + 1
    })).filter(row => row.subtarea);
  }

  function getTask(idTask, candidateDb) {
    return dbOr(candidateDb).query('SELECT * FROM pendientes WHERE id_pendiente=? LIMIT 1', [Number(idTask)])[0] || null;
  }

  function access(idTask, currentUser, candidateDb) {
    const db = dbOr(candidateDb), task = getTask(idTask, db);
    if (!task) return { exists: false, allowed: false, creator: false, related: false, row: null };
    const currentEmail = email(currentUser?.correo), currentInitials = initials(currentUser?.iniciales);
    const creator = Boolean(currentEmail && email(task.creado_por_email) === currentEmail);
    const related = Boolean(currentInitials && db.scalar(`SELECT 1 FROM pendientes_usuarios
      WHERE id_pendiente=? AND UPPER(TRIM(iniciales_usuario))=? LIMIT 1`, [Number(idTask), currentInitials]));
    const allowed = taskType(task.tipo_pendiente) === 'PERSONAL' ? creator : (creator || related);
    return { exists: true, allowed, creator, related, row: task, user: currentUser };
  }

  function assertAccess(ctx) {
    if (!ctx?.exists) throw httpError('Pendiente no encontrado.', 404, 'PENDIENTE_NOT_FOUND');
    if (!ctx.allowed) throw httpError('No tienes acceso a esta tarea.', 403, 'PENDIENTE_ACCESS_FORBIDDEN');
    return ctx;
  }
  function assertCreator(ctx) {
    assertAccess(ctx);
    if (!ctx.creator) throw httpError('Solo el creador puede realizar esta accion.', 403, 'PENDIENTE_CREATOR_REQUIRED');
    return ctx;
  }

  function isResponsible(idTask, currentUser, candidateDb) {
    const db = dbOr(candidateDb), currentInitials = initials(currentUser?.iniciales);
    return Boolean(currentInitials && db.scalar(`SELECT 1 FROM pendientes_usuarios
      WHERE id_pendiente=? AND UPPER(TRIM(iniciales_usuario))=?
        AND tipo_relacion='RESPONSABLE' LIMIT 1`, [Number(idTask), currentInitials]));
  }

  function visibleWhere(currentUser) {
    const currentEmail = email(currentUser?.correo), currentInitials = initials(currentUser?.iniciales);
    return {
      sql: `((p.tipo_pendiente='PERSONAL' AND LOWER(TRIM(p.creado_por_email))=?) OR
        (p.tipo_pendiente='COLABORATIVA' AND (LOWER(TRIM(p.creado_por_email))=? OR EXISTS(
          SELECT 1 FROM pendientes_usuarios pu_auth
          WHERE pu_auth.id_pendiente=p.id_pendiente AND UPPER(TRIM(pu_auth.iniciales_usuario))=?))))`,
      params: [currentEmail, currentEmail, currentInitials]
    };
  }

  function decorateListRow(row, candidateDb) {
    const db = dbOr(candidateDb), taskId = Number(row.id_pendiente);
    const relations = db.query(`SELECT iniciales_usuario,tipo_relacion FROM pendientes_usuarios
      WHERE id_pendiente=? ORDER BY iniciales_usuario,id_pendiente_usuario`, [taskId]);
    const subtasks = db.query('SELECT estatus FROM pendientes_subtareas WHERE id_pendiente=?', [taskId]);
    return {
      ...row,
      responsables: relations.filter(r => r.tipo_relacion === 'RESPONSABLE').map(r => r.iniciales_usuario).join(', '),
      seguimiento: relations.filter(r => r.tipo_relacion === 'SEGUIMIENTO').map(r => r.iniciales_usuario).join(', '),
      total_subtareas: subtasks.length,
      subtareas_cerradas: subtasks.filter(row => row.estatus === 'Cerrado').length,
      total_comentarios: Number(db.scalar('SELECT COUNT(*) FROM pendientes_comentarios WHERE id_pendiente=?', [taskId]) || 0),
      total_archivos_directos: Number(db.scalar('SELECT COUNT(*) FROM pendientes_archivos WHERE id_pendiente=? AND activo=1', [taskId]) || 0)
    };
  }

  function list(req, candidateDb) {
    const db = dbOr(candidateDb), currentUser = user(req);
    if (!email(currentUser.correo)) throw httpError('Sesion sin usuario valido.', 401, 'LAB_TASK_SESSION_REQUIRED');
    const scope = visibleWhere(currentUser);
    let sql = `SELECT p.* FROM pendientes p WHERE ${scope.sql}`;
    const params = [...scope.params];
    const type = String(req?.query?.tipo || req?.query?.tipo_pendiente || '').trim().toUpperCase();
    const taskStatus = text(req?.query?.estatus, 50);
    const search = text(req?.query?.search || req?.query?.buscar, 255).toLowerCase();
    const limit = Math.min(200, Math.max(1, Number.parseInt(req?.query?.limit, 10) || 80));
    if (type === 'PERSONAL' || type === 'COLABORATIVA') { sql += ' AND p.tipo_pendiente=?'; params.push(type); }
    if (taskStatus) { sql += ' AND p.estatus=?'; params.push(taskStatus); }
    if (search) {
      sql += ` AND (LOWER(COALESCE(p.pendiente,'')) LIKE ? OR LOWER(COALESCE(p.descripcion,'')) LIKE ? OR
        LOWER(COALESCE(p.proyecto,'')) LIKE ? OR LOWER(COALESCE(p.equipo,'')) LIKE ? OR LOWER(COALESCE(p.area,'')) LIKE ?)`;
      const like = `%${search}%`; params.push(like, like, like, like, like);
    }
    sql += ` ORDER BY
      CASE p.prioridad WHEN 'CRITICA' THEN 1 WHEN 'ALTA' THEN 2 WHEN 'MEDIA' THEN 3 WHEN 'BAJA' THEN 4 ELSE 5 END,
      CASE p.estatus WHEN 'Pendiente' THEN 1 WHEN 'En proceso' THEN 2 WHEN 'Cerrado' THEN 3 ELSE 4 END,
      CASE WHEN p.due_date IS NULL THEN 1 ELSE 0 END,p.due_date ASC,datetime(p.updated_at) DESC
      LIMIT ?`;
    params.push(limit);
    return db.query(sql, params).map(row => decorateListRow(row, db));
  }

  function usersDetail(idTask, candidateDb) {
    const db = dbOr(candidateDb);
    return db.query(`SELECT pu.id_pendiente_usuario,pu.id_pendiente,pu.iniciales_usuario,pu.tipo_relacion,
        u.id_SB,u.nombre,u.correo,u.empresa
      FROM pendientes_usuarios pu
      LEFT JOIN usuarios u ON UPPER(TRIM(u.iniciales))=UPPER(TRIM(pu.iniciales_usuario)) AND u.estado=1
      WHERE pu.id_pendiente=? ORDER BY pu.id_pendiente_usuario`, [Number(idTask)]);
  }

  function directFiles(idTask, candidateDb) {
    const db = dbOr(candidateDb), taskId = Number(idTask);
    return db.query(`SELECT id_archivo,id_pendiente,tipo_archivo,nombre_original,mime_type,tamano_bytes,
        storage_provider,storage_container,storage_blob_name,storage_url,origen_archivo,subido_por,activo,created_at
      FROM pendientes_archivos WHERE id_pendiente=? AND activo=1 ORDER BY id_archivo`, [taskId]).map(row => ({
        ...row,
        access_endpoint: `/api/pendientes/${taskId}/archivos/${Number(row.id_archivo)}/acceso`,
        access_url: null,
        archivo_url: null
      }));
  }

  function commentAttachments(commentId, idTask, candidateDb) {
    const db = dbOr(candidateDb), taskId = Number(idTask), cid = Number(commentId);
    return db.query(`SELECT id_adjunto,id_comentario,nombre_archivo,archivo_url,tipo_archivo,storage_provider,
        storage_container,storage_blob_name,tamano_bytes,subido_por,activo,fecha
      FROM pendientes_comentarios_adjuntos WHERE id_comentario=? AND activo=1 ORDER BY id_adjunto`, [cid]).map(row => ({
        ...row,
        access_endpoint: `/api/pendientes/${taskId}/comentarios/${cid}/adjuntos/${Number(row.id_adjunto)}/acceso`,
        access_url: null,
        archivo_url: null
      }));
  }

  function comments(idTask, candidateDb) {
    const db = dbOr(candidateDb), taskId = Number(idTask);
    return db.query(`SELECT c.id_comentario,c.id_pendiente,c.id_usuario,c.comentario,c.fecha,
        u.nombre,u.iniciales,u.correo
      FROM pendientes_comentarios c LEFT JOIN usuarios u ON u.id_SB=c.id_usuario
      WHERE c.id_pendiente=? ORDER BY datetime(c.fecha),c.id_comentario`, [taskId]).map(comment => ({
        ...comment,
        adjuntos: commentAttachments(comment.id_comentario, taskId, db)
      }));
  }

  function legacyEvidence(task) {
    const output = [];
    for (const [type, url] of [['FOTO', task?.photo_url], ['ADJUNTO', task?.adjunto_url]]) {
      const value = String(url || '').trim();
      if (!value || !value.startsWith('labblob://')) continue;
      output.push({
        tipo_archivo: type,
        nombre_original: type === 'FOTO' ? 'Foto legacy LAB' : 'Adjunto legacy LAB',
        storage_provider: 'LAB_INDEXEDDB',
        storage_blob_name: value.slice('labblob://'.length),
        origen_archivo: 'LEGACY',
        access_endpoint: `/api/pendientes/${Number(task.id_pendiente)}/evidencia-legacy/${type.toLowerCase()}/acceso`
      });
    }
    return output;
  }

  function detail(req, idTask, candidateDb) {
    const db = dbOr(candidateDb), currentUser = user(req), ctx = assertAccess(access(idTask, currentUser, db));
    const task = decorateListRow(ctx.row, db);
    const collaborative = taskType(task.tipo_pendiente) === 'COLABORATIVA';
    const responsible = isResponsible(idTask, currentUser, db);
    return {
      pendiente: task,
      usuarios: usersDetail(idTask, db),
      subtareas: db.query('SELECT * FROM pendientes_subtareas WHERE id_pendiente=? ORDER BY orden,id_subtarea', [Number(idTask)]),
      comentarios: comments(idTask, db),
      archivos_directos: directFiles(idTask, db),
      evidencias_legacy: legacyEvidence(task),
      permisos_contextuales: {
        puede_editar: ctx.creator,
        puede_eliminar: ctx.creator,
        puede_cambiar_estatus: ctx.creator,
        puede_cambiar_prioridad: collaborative ? responsible : ctx.creator,
        puede_comentar: ctx.allowed,
        puede_actualizar_subtareas: ctx.allowed,
        relacionado: ctx.related
      }
    };
  }

  async function replaceChildren(idTask, body, creator, candidateDb) {
    const db = dbOr(candidateDb);
    const relationType = taskType(body.tipo_pendiente) === 'COLABORATIVA' ? 'RESPONSABLE' : 'SEGUIMIENTO';
    const creatorInitials = initials(creator?.iniciales);
    const requested = normalizeUsers(body);
    const selected = requested.filter(value => value !== creatorInitials);
    const blockedSelfAssignment = Boolean(creatorInitials && requested.includes(creatorInitials));

    await db.run('DELETE FROM pendientes_usuarios WHERE id_pendiente=?', [Number(idTask)]);
    const relationIds = [];
    for (const ini of selected) {
      const result = await db.run('INSERT INTO pendientes_usuarios(id_pendiente,iniciales_usuario,tipo_relacion) VALUES(?,?,?)', [Number(idTask), ini, relationType]);
      relationIds.push({ initials: ini, id: Number(result.lastInsertRowId) });
    }

    if (body.rewrite_subtareas === undefined || bool(body.rewrite_subtareas)) {
      await db.run('DELETE FROM pendientes_subtareas WHERE id_pendiente=?', [Number(idTask)]);
      for (const subtask of normalizeSubtasks(body)) {
        await db.run(`INSERT INTO pendientes_subtareas
          (id_pendiente,subtarea,estatus,orden,created_at,updated_at)
          VALUES(?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`,
        [Number(idTask), subtask.subtarea, subtask.estatus, subtask.orden]);
      }
    }
    return { relationIds, blockedSelfAssignment };
  }

  async function storeDirectFile(idTask, file, typeLabel, currentUser, candidateDb) {
    const db = dbOr(candidateDb), blobs = deps().blobs;
    blobs.validate(file);
    const oldRows = db.query(`SELECT id_archivo,storage_provider,storage_blob_name
      FROM pendientes_archivos WHERE id_pendiente=? AND tipo_archivo=? AND activo=1 ORDER BY id_archivo`,
    [Number(idTask), typeLabel]);
    const stored = await blobs.put(file, {
      prefix: `tasks/${Number(idTask)}`,
      metadata: { id_pendiente: Number(idTask), tipo_archivo: typeLabel }
    });
    try {
      if (oldRows.length) {
        await db.run(`UPDATE pendientes_archivos SET activo=0,eliminado_por=?,eliminado_at=CURRENT_TIMESTAMP,
          motivo_baja='Sustituido en LAB',updated_at=CURRENT_TIMESTAMP
          WHERE id_pendiente=? AND tipo_archivo=? AND activo=1`,
        [Number(currentUser?.id_SB) || null, Number(idTask), typeLabel]);
      }
      const result = await db.run(`INSERT INTO pendientes_archivos
        (id_pendiente,tipo_archivo,nombre_original,mime_type,tamano_bytes,storage_provider,storage_container,
         storage_blob_name,storage_url,origen_archivo,subido_por,activo,created_at,updated_at)
        VALUES(?,?,?,?,?,'LAB_INDEXEDDB','mantto_lab_dgb_blobs_v1',?,NULL,'NUEVO',?,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`,
      [Number(idTask), typeLabel, stored.name, stored.type, stored.size, stored.key, Number(currentUser?.id_SB) || null]);
      // La limpieza física ocurre después de dejar la nueva referencia persistida.
      for (const row of oldRows) {
        if (row.storage_provider === 'LAB_INDEXEDDB' && row.storage_blob_name) {
          await blobs.remove(row.storage_blob_name).catch(() => null);
        }
      }
      return Number(result.lastInsertRowId);
    } catch (error) {
      await blobs.remove(stored.key).catch(() => null);
      throw error;
    }
  }

  function corellianRows(currentUser, candidateDb) {
    const db = dbOr(candidateDb), resolved = deps().scope.resolveCorellian(Number(currentUser?.id_SB), db);
    const visible = new Set(Array.isArray(resolved?.usuarios_visibles) ? resolved.usuarios_visibles.map(Number) : []);
    return db.query('SELECT * FROM ins_fl WHERE activo=1 ORDER BY proyecto,referencia_sitio').filter(row => (
      resolved?.llave_maestra === true || [row.id_sup, row.id_asesor, row.id_admin].some(value => visible.has(Number(value)))
    ));
  }

  function unitedRows(currentUser, candidateDb) {
    return deps().assets.visiblePortfolio(Number(currentUser?.id_SB), candidateDb, { includeInactive: true, canonicalZone: true });
  }

  function projectAndEquipmentCatalog(currentUser, context, project, search, candidateDb) {
    const db = dbOr(candidateDb), projectValue = text(project, 255), searchValue = text(search, 255).toLowerCase();
    let rows = [];
    if (context.domain === COMPANY_CORELLIAN) rows = corellianRows(currentUser, db);
    if (context.domain === COMPANY_UNITED) rows = unitedRows(currentUser, db);

    const projectMap = new Map();
    for (const row of rows) {
      const code = text(row.proyecto, 255);
      if (!code) continue;
      const haystack = `${code} ${row.id_proyecto || ''}`.toLowerCase();
      if (searchValue && !projectValue && !haystack.includes(searchValue)) continue;
      if (!projectMap.has(code)) projectMap.set(code, {
        proyecto_codigo: code,
        proyecto_nombre: code,
        proyecto: code
      });
    }

    let equipment = [];
    if (projectValue) {
      equipment = rows.filter(row => String(row.proyecto || '').trim().toLowerCase() === projectValue.toLowerCase()).map(row => {
        const code = context.domain === COMPANY_CORELLIAN ? text(row.referencia_sitio, 255) : text(row.numero_equipo, 255);
        const site = text(row.identificacion_sitio, 255) || code;
        return {
          codigo: code,
          numero_equipo: code,
          equipo: code,
          proyecto: text(row.proyecto, 255),
          identificacion_sitio: site,
          tipo_equipo: context.domain === COMPANY_UNITED ? (text(row.id_equipo_ns, 255) || null) : null,
          id_proyecto: context.domain === COMPANY_CORELLIAN ? (text(row.id_proyecto, 255) || null) : null
        };
      }).filter(row => row.codigo && (!searchValue || `${row.codigo} ${row.identificacion_sitio}`.toLowerCase().includes(searchValue)));
    }

    return {
      proyectos: [...projectMap.values()].sort((a, b) => a.proyecto_nombre.localeCompare(b.proyecto_nombre, 'es')),
      equipos: equipment.sort((a, b) => String(a.identificacion_sitio).localeCompare(String(b.identificacion_sitio), 'es'))
    };
  }

  function catalogs(req, candidateDb) {
    const db = dbOr(candidateDb), currentUser = user(req);
    const context = companyContext(currentUser, req?.query?.empresa, db, { requireSelection: false });
    const selectedCompany = context.empresaSeleccionada;
    const users = db.query(`SELECT id_SB,nombre,iniciales,correo,area,puesto,empresa,estado
      FROM usuarios WHERE estado=1 ORDER BY nombre`).filter(row => (
      !selectedCompany || String(row.empresa || '').trim().toLowerCase() === String(selectedCompany).trim().toLowerCase()
    ));
    const allAreas = db.query(`SELECT DISTINCT area AS value FROM usuarios
      WHERE estado=1 AND area IS NOT NULL AND TRIM(area)<>'' ORDER BY area`).map(row => row.value).filter(Boolean);
    const projectData = projectAndEquipmentCatalog(
      currentUser,
      context,
      req?.query?.proyecto,
      req?.query?.equipo || req?.query?.search,
      db
    );
    const scopeEngine = context.domain === COMPANY_CORELLIAN ? context.scope?.engines?.corellian
      : context.domain === COMPANY_UNITED ? context.scope?.engines?.united : null;
    return {
      areas: allAreas,
      empresas: context.empresasPermitidas,
      empresa_default: context.empresaDefault,
      empresa_seleccionada: context.empresaSeleccionada,
      puede_seleccionar_empresa: context.puedeSeleccionarEmpresa,
      usuarios: users,
      proyectos: projectData.proyectos,
      equipos: projectData.equipos,
      alcance_proyectos: scopeEngine ? {
        motor: scopeEngine.motor || null,
        empresa: scopeEngine.empresa || null,
        llave_maestra: scopeEngine.llave_maestra === true,
        requiere_filtro_usuario: scopeEngine.requiere_filtro_usuario === true,
        requiere_filtro_zona: scopeEngine.requiere_filtro_zona === true
      } : null
    };
  }

  function projectSelectionAllowed(currentUser, company, project, equipment, candidateDb) {
    const db = dbOr(candidateDb), context = companyContext(currentUser, company, db, { requireSelection: true });
    const projectValue = text(project, 255), equipmentValue = text(equipment, 255);
    if (equipmentValue && !projectValue) {
      throw httpError('Selecciona un proyecto antes de seleccionar un equipo.', 400, 'PENDIENTE_EQUIPO_REQUIERE_PROYECTO');
    }
    if (!projectValue && !equipmentValue) return context;
    if (!context.domain) {
      throw httpError('El proyecto seleccionado no pertenece al alcance de informacion autorizado.', 403, 'PENDIENTE_PROYECTO_FUERA_ALCANCE');
    }
    const rows = context.domain === COMPANY_CORELLIAN ? corellianRows(currentUser, db) : unitedRows(currentUser, db);
    const projectRows = rows.filter(row => String(row.proyecto || '').trim().toLowerCase() === projectValue.toLowerCase());
    if (!projectRows.length) {
      throw httpError('El proyecto seleccionado no pertenece al alcance de informacion autorizado.', 403, 'PENDIENTE_PROYECTO_FUERA_ALCANCE');
    }
    if (equipmentValue) {
      const matches = projectRows.some(row => {
        const code = context.domain === COMPANY_CORELLIAN ? row.referencia_sitio : row.numero_equipo;
        return String(code || '').trim().toLowerCase() === equipmentValue.toLowerCase();
      });
      if (!matches) {
        throw httpError('El equipo seleccionado no pertenece al proyecto y alcance autorizados.', 403, 'PENDIENTE_EQUIPO_FUERA_ALCANCE');
      }
    }
    return context;
  }

  function createPayload(body, currentUser, candidateDb, existing) {
    const title = text(body?.pendiente, 255);
    if (!title) throw httpError('El pendiente es obligatorio.', 400, 'PENDIENTE_TITLE_REQUIRED');
    const type = taskType(body?.tipo_pendiente || existing?.tipo_pendiente);
    const company = resolveCompany(currentUser, body?.empresa, existing?.empresa, candidateDb);
    const project = text(body?.proyecto, 255) || null;
    const equipment = text(body?.equipo, 100) || null;
    projectSelectionAllowed(currentUser, company, project, equipment, candidateDb);
    return {
      pendiente: title,
      tipo_pendiente: type,
      estatus: existing?.estatus || 'Pendiente',
      area: text(body?.area, 100) || null,
      empresa: company,
      descripcion: sanitizeRichText(body?.descripcion) || null,
      due_date: dateOnly(body?.due_date),
      proyecto: project,
      equipo: equipment,
      con_subtareas: bool(body?.con_subtareas) ? 1 : 0,
      prioridad: type === 'COLABORATIVA'
        ? priority(body?.prioridad, null)
        : priority(body?.prioridad, existing?.prioridad ?? 'MEDIA')
    };
  }

  async function create(req, candidateDb) {
    const db = dbOr(candidateDb), currentUser = user(req);
    if (!currentUser?.id_SB || !email(currentUser.correo) || !initials(currentUser.iniciales)) {
      throw httpError('Sesion sin usuario valido.', 401, 'LAB_TASK_SESSION_REQUIRED');
    }
    const body = req.body || {}, payload = createPayload(body, currentUser, db, null);
    const result = await db.run(`INSERT INTO pendientes
      (pendiente,tipo_pendiente,estatus,area,empresa,descripcion,creado_por_email,creado_por_iniciales,
       due_date,proyecto,equipo,con_subtareas,prioridad,date_created,created_at,updated_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`, [
        payload.pendiente, payload.tipo_pendiente, payload.estatus, payload.area, payload.empresa,
        payload.descripcion, email(currentUser.correo), initials(currentUser.iniciales), payload.due_date,
        payload.proyecto, payload.equipo, payload.con_subtareas, payload.prioridad
      ]);
    const taskId = Number(result.lastInsertRowId);
    const children = await replaceChildren(taskId, { ...body, tipo_pendiente: payload.tipo_pendiente }, currentUser, db);
    const photo = safeFile(body.photo_file), attachment = safeFile(body.adjunto_file);
    if (photo && attachment) throw httpError('Solo se permite un archivo de evidencia por solicitud.', 400, 'LAB_TOO_MANY_FILES');
    let fileId = null;
    if (photo) fileId = await storeDirectFile(taskId, photo, 'FOTO', currentUser, db);
    if (attachment) fileId = await storeDirectFile(taskId, attachment, 'ADJUNTO', currentUser, db);

    let notificationsCreated = 0;
    const notificationRecipients = [];
    if (payload.tipo_pendiente === 'COLABORATIVA') {
      for (const relation of children.relationIds) {
        const emitted = await deps().notifications.emitTaskAssignment(taskId, currentUser, relation.initials, relation.id, db).catch(error => ({ created: 0, reason: 'ERROR', error: error.message }));
        notificationsCreated += Number(emitted.created || 0);
        if (Number(emitted.created || 0) > 0) notificationRecipients.push(relation.initials);
      }
    }
    const task = getTask(taskId, db);
    await deps().interactions.recordTaskAction(req, 'CREAR', task, { id_pendiente: taskId }, db);
    return {
      message: 'Pendiente creado correctamente.',
      id_pendiente: taskId,
      id_archivo: fileId,
      notificaciones_creadas: notificationsCreated,
      notificaciones_destinatarios: notificationRecipients,
      autoasignacion_bloqueada: children.blockedSelfAssignment
    };
  }

  async function update(req, idTask, candidateDb) {
    const db = dbOr(candidateDb), currentUser = user(req);
    const ctx = assertCreator(access(idTask, currentUser, db)), body = req.body || {};
    const oldResponsibles = new Set(db.query(`SELECT iniciales_usuario FROM pendientes_usuarios
      WHERE id_pendiente=? AND tipo_relacion='RESPONSABLE'`, [Number(idTask)]).map(row => initials(row.iniciales_usuario)));
    const payload = createPayload(body, currentUser, db, ctx.row);
    await db.run(`UPDATE pendientes SET pendiente=?,tipo_pendiente=?,area=?,empresa=?,descripcion=?,due_date=?,
      proyecto=?,equipo=?,con_subtareas=?,prioridad=?,updated_at=CURRENT_TIMESTAMP WHERE id_pendiente=?`, [
        payload.pendiente, payload.tipo_pendiente, payload.area, payload.empresa, payload.descripcion,
        payload.due_date, payload.proyecto, payload.equipo, payload.con_subtareas, payload.prioridad, Number(idTask)
      ]);
    const children = await replaceChildren(idTask, { ...body, tipo_pendiente: payload.tipo_pendiente }, currentUser, db);
    const photo = safeFile(body.photo_file), attachment = safeFile(body.adjunto_file);
    if (photo && attachment) throw httpError('Solo se permite un archivo de evidencia por solicitud.', 400, 'LAB_TOO_MANY_FILES');
    let fileId = null;
    if (photo) fileId = await storeDirectFile(idTask, photo, 'FOTO', currentUser, db);
    if (attachment) fileId = await storeDirectFile(idTask, attachment, 'ADJUNTO', currentUser, db);

    let notificationsCreated = 0;
    const notificationRecipients = [];
    if (payload.tipo_pendiente === 'COLABORATIVA') {
      for (const relation of children.relationIds.filter(rel => !oldResponsibles.has(initials(rel.initials)))) {
        const emitted = await deps().notifications.emitTaskAssignment(Number(idTask), currentUser, relation.initials, relation.id, db).catch(error => ({ created: 0, reason: 'ERROR', error: error.message }));
        notificationsCreated += Number(emitted.created || 0);
        if (Number(emitted.created || 0) > 0) notificationRecipients.push(relation.initials);
      }
    }
    const task = getTask(idTask, db);
    await deps().interactions.recordTaskAction(req, 'EDITAR', task, null, db);
    return {
      message: 'Pendiente actualizado correctamente.',
      id_archivo: fileId,
      notificaciones_creadas: notificationsCreated,
      notificaciones_destinatarios: notificationRecipients,
      autoasignacion_bloqueada: children.blockedSelfAssignment
    };
  }

  async function remove(req, idTask, candidateDb) {
    const db = dbOr(candidateDb), currentUser = user(req);
    const ctx = assertCreator(access(idTask, currentUser, db)), task = ctx.row;
    const keys = db.query(`SELECT storage_blob_name AS key FROM pendientes_archivos
        WHERE id_pendiente=? AND storage_provider='LAB_INDEXEDDB'
      UNION ALL
      SELECT a.storage_blob_name AS key FROM pendientes_comentarios_adjuntos a
        INNER JOIN pendientes_comentarios c ON c.id_comentario=a.id_comentario
        WHERE c.id_pendiente=? AND a.storage_provider='LAB_INDEXEDDB'`, [Number(idTask), Number(idTask)])
      .map(row => row.key).filter(Boolean);
    await deps().interactions.recordTaskAction(req, 'ELIMINAR', task, null, db);
    await db.run(`DELETE FROM sup_notificaciones WHERE accion_notificacion='ABRIR_TAREA' AND id_referencia=?`, [Number(idTask)]);
    await db.run('DELETE FROM pendientes WHERE id_pendiente=?', [Number(idTask)]);
    for (const key of keys) await deps().blobs.remove(key).catch(() => null);
    return { message: 'Tarea eliminada correctamente.', limpieza_storage: { local_blobs: keys.length } };
  }

  async function changeStatus(req, idTask, candidateDb) {
    const db = dbOr(candidateDb), ctx = assertCreator(access(idTask, user(req), db));
    const next = status(req.body?.estatus);
    await db.run('UPDATE pendientes SET estatus=?,updated_at=CURRENT_TIMESTAMP WHERE id_pendiente=?', [next, Number(idTask)]);
    const task = getTask(idTask, db);
    await deps().interactions.recordTaskAction(req, 'CAMBIAR_ESTATUS', task, { descripcion: `Estatus: ${next}` }, db);
    return { message: 'Estatus actualizado correctamente.' };
  }

  async function changePriority(req, idTask, candidateDb) {
    const db = dbOr(candidateDb), currentUser = user(req), ctx = assertAccess(access(idTask, currentUser, db));
    const collaborative = taskType(ctx.row.tipo_pendiente) === 'COLABORATIVA';
    const responsible = isResponsible(idTask, currentUser, db);
    if (collaborative && !responsible) {
      throw httpError('Solo un responsable puede definir la prioridad de una tarea colaborativa.', 403, 'PENDIENTE_PRIORITY_FORBIDDEN');
    }
    if (!collaborative && !ctx.creator) {
      throw httpError('Solo el creador puede cambiar la prioridad de una tarea personal.', 403, 'PENDIENTE_PRIORITY_FORBIDDEN');
    }
    const next = priority(req.body?.prioridad, null);
    await db.run('UPDATE pendientes SET prioridad=?,updated_at=CURRENT_TIMESTAMP WHERE id_pendiente=?', [next, Number(idTask)]);
    const task = getTask(idTask, db);
    await deps().interactions.recordTaskAction(req, 'CAMBIAR_PRIORIDAD', task, { descripcion: `Prioridad: ${next || 'Sin prioridad'}` }, db);
    return { message: 'Prioridad actualizada correctamente.' };
  }

  async function changeSubtask(req, idTask, idSubtask, candidateDb) {
    const db = dbOr(candidateDb);
    assertAccess(access(idTask, user(req), db));
    const subtask = db.query('SELECT * FROM pendientes_subtareas WHERE id_subtarea=? AND id_pendiente=? LIMIT 1', [Number(idSubtask), Number(idTask)])[0];
    if (!subtask) throw httpError('Subtarea no encontrada.', 404, 'PENDIENTE_SUBTASK_NOT_FOUND');
    const next = String(req.body?.estatus || '').trim() === 'Cerrado' ? 'Cerrado' : 'Pendiente';
    await db.run('UPDATE pendientes_subtareas SET estatus=?,updated_at=CURRENT_TIMESTAMP WHERE id_subtarea=?', [next, Number(idSubtask)]);
    return { message: 'Subtarea actualizada correctamente.' };
  }

  async function comment(req, idTask, candidateDb) {
    const db = dbOr(candidateDb), currentUser = user(req), ctx = assertAccess(access(idTask, currentUser, db));
    const body = req.body || {}, message = text(body.comentario), file = safeFile(body.archivo);
    if (!message && !file) throw httpError('Escribe un comentario o selecciona un archivo.', 400, 'PENDIENTE_COMMENT_REQUIRED');
    const result = await db.run(`INSERT INTO pendientes_comentarios(id_pendiente,id_usuario,comentario,fecha)
      VALUES(?,?,?,CURRENT_TIMESTAMP)`, [Number(idTask), Number(currentUser.id_SB), message || '']);
    const commentId = Number(result.lastInsertRowId);
    let attachmentId = null, fileName = null;
    if (file) {
      deps().blobs.validate(file);
      const stored = await deps().blobs.put(file, {
        prefix: `tasks/${Number(idTask)}/comments/${commentId}`,
        metadata: { id_pendiente: Number(idTask), id_comentario: commentId }
      });
      fileName = stored.name;
      try {
        const attachment = await db.run(`INSERT INTO pendientes_comentarios_adjuntos
          (id_comentario,nombre_archivo,archivo_url,tipo_archivo,storage_provider,storage_container,
           storage_blob_name,tamano_bytes,subido_por,activo,fecha,updated_at)
          VALUES(?,?,? ,?,'LAB_INDEXEDDB','mantto_lab_dgb_blobs_v1',?,?,?,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`,
        [commentId, stored.name, `labblob://${stored.key}`, stored.type, stored.key, stored.size, Number(currentUser.id_SB)]);
        attachmentId = Number(attachment.lastInsertRowId);
      } catch (error) {
        await deps().blobs.remove(stored.key).catch(() => null);
        throw error;
      }
    }
    const notification = await deps().notifications.emitTaskComment(ctx.row, actor(req), commentId, db).catch(error => ({ created: 0, error: error.message }));
    await deps().interactions.recordTaskAction(req, 'COMENTAR', ctx.row, { descripcion: message || `Adjunto: ${fileName || 'archivo'}` }, db);
    return {
      message: file ? 'Interaccion agregada correctamente.' : 'Comentario agregado correctamente.',
      id_comentario: commentId,
      id_adjunto: attachmentId,
      notificaciones: Number(notification.created || 0),
      notificacion_error: notification.error || null
    };
  }

  async function deleteDirectFile(req, idTask, idFile, candidateDb) {
    const db = dbOr(candidateDb), currentUser = user(req);
    assertCreator(access(idTask, currentUser, db));
    const row = db.query(`SELECT * FROM pendientes_archivos
      WHERE id_archivo=? AND id_pendiente=? AND activo=1 LIMIT 1`, [Number(idFile), Number(idTask)])[0];
    if (!row) throw httpError('Archivo no encontrado.', 404, 'PENDIENTE_FILE_NOT_FOUND');
    await db.run(`UPDATE pendientes_archivos SET activo=0,eliminado_por=?,eliminado_at=CURRENT_TIMESTAMP,
      motivo_baja='Eliminado en LAB',updated_at=CURRENT_TIMESTAMP WHERE id_archivo=?`, [Number(currentUser.id_SB), Number(idFile)]);
    if (row.storage_provider === 'LAB_INDEXEDDB' && row.storage_blob_name) await deps().blobs.remove(row.storage_blob_name).catch(() => null);
    return { message: 'Evidencia LAB eliminada correctamente.' };
  }

  async function directFileAccess(req, idTask, idFile, candidateDb) {
    const db = dbOr(candidateDb);
    assertAccess(access(idTask, user(req), db));
    const row = db.query(`SELECT * FROM pendientes_archivos
      WHERE id_archivo=? AND id_pendiente=? AND activo=1 LIMIT 1`, [Number(idFile), Number(idTask)])[0];
    if (!row) throw httpError('Archivo no encontrado.', 404, 'PENDIENTE_FILE_NOT_FOUND');
    if (row.storage_provider !== 'LAB_INDEXEDDB' || !row.storage_blob_name) throw httpError('El archivo no esta disponible en el almacen local LAB.', 404, 'LAB_BLOB_NOT_FOUND');
    const data = await deps().blobs.accessUrl(row.storage_blob_name);
    if (!data) throw httpError('Archivo local LAB no encontrado.', 404, 'LAB_BLOB_NOT_FOUND');
    return data;
  }

  async function commentFileAccess(req, idTask, idComment, idAttachment, candidateDb) {
    const db = dbOr(candidateDb);
    assertAccess(access(idTask, user(req), db));
    const row = db.query(`SELECT a.* FROM pendientes_comentarios_adjuntos a
      INNER JOIN pendientes_comentarios c ON c.id_comentario=a.id_comentario
      WHERE a.id_adjunto=? AND a.id_comentario=? AND c.id_pendiente=? AND a.activo=1 LIMIT 1`,
    [Number(idAttachment), Number(idComment), Number(idTask)])[0];
    if (!row) throw httpError('Adjunto no encontrado.', 404, 'PENDIENTE_COMMENT_FILE_NOT_FOUND');
    if (row.storage_provider !== 'LAB_INDEXEDDB' || !row.storage_blob_name) throw httpError('El adjunto no esta disponible en el almacen local LAB.', 404, 'LAB_BLOB_NOT_FOUND');
    const data = await deps().blobs.accessUrl(row.storage_blob_name);
    if (!data) throw httpError('Adjunto local LAB no encontrado.', 404, 'LAB_BLOB_NOT_FOUND');
    return data;
  }

  async function legacyAccess(req, idTask, type, candidateDb) {
    const db = dbOr(candidateDb), ctx = assertAccess(access(idTask, user(req), db));
    const key = String(type || '').toLowerCase().includes('foto') ? 'photo_url' : 'adjunto_url';
    const value = String(ctx.row[key] || '').trim();
    if (!value.startsWith('labblob://')) throw httpError('La evidencia legacy no esta disponible localmente en LAB.', 404, 'LAB_LEGACY_FILE_UNAVAILABLE');
    const data = await deps().blobs.accessUrl(value.slice('labblob://'.length));
    if (!data) throw httpError('Evidencia local LAB no encontrada.', 404, 'LAB_BLOB_NOT_FOUND');
    return data;
  }

  return Object.freeze({
    MAX_FILE_BYTES,
    list,
    detail,
    create,
    update,
    remove,
    changeStatus,
    changePriority,
    changeSubtask,
    comment,
    deleteDirectFile,
    directFileAccess,
    commentFileAccess,
    legacyAccess,
    catalogs,
    access,
    assertAccess,
    assertCreator,
    visibleWhere,
    companyContext,
    projectSelectionAllowed,
    sanitizeRichText
  });
});
