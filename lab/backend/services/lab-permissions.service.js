(function initManttoLabPermissionsService(root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ManttoLabPermissionsService = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createManttoLabPermissionsService(root) {
  'use strict';

  const VIEWER_PERMISSION_CODE = 'GENERAL_VISOR_USUARIOS_OPERACION.USAR_VISOR';
  const PANEL_VISUAL_PERMISSION_CODE = 'GENERAL_PANEL_DE_CONTROL_ACCESO_VISUAL_MODULO.ACCESO_VISUAL';

  function dbOr(candidate) {
    const db = candidate || root?.ManttoLabDB;
    if (!db || typeof db.query !== 'function' || typeof db.scalar !== 'function') {
      throw new Error('MANTTO_LAB_DB_REQUIRED');
    }
    return db;
  }

  function positiveId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : 0;
  }

  function boolValue(value) {
    return value === true || value === 1 || value === '1';
  }


  function normalizeDomain(value) {
    const text = String(value || '').trim().toUpperCase();
    if (text.includes('UNITED')) return 'UNITED';
    if (text.includes('CORELLIAN')) return 'CORELLIAN';
    if (text === 'GENERAL' || text.includes('GENERAL') || text === 'BLT' || text.includes('BLT')) return 'GENERAL';
    return '';
  }

  function normalizeDomains(values) {
    if (values === null || values === undefined) return null;
    const list = Array.isArray(values) ? values : [values];
    return [...new Set(list.map(normalizeDomain).filter(Boolean))];
  }

  function domainAllowed(value, values) {
    const domains = normalizeDomains(values);
    if (domains === null) return true;
    const domain = normalizeDomain(value);
    return Boolean(domain && domains.includes(domain));
  }

  function assertUser(userId, candidateDb) {
    const db = dbOr(candidateDb);
    const id = positiveId(userId);
    if (!id || Number(db.scalar('SELECT COUNT(*) FROM usuarios WHERE id_SB=? AND estado=1', [id]) || 0) !== 1) {
      const error = new Error('Usuario LAB no existe o está inactivo.');
      error.status = 404;
      error.code = 'LAB_USER_NOT_FOUND';
      throw error;
    }
    return id;
  }

  function assertRole(roleId, candidateDb) {
    const db = dbOr(candidateDb);
    const id = positiveId(roleId);
    if (!id || Number(db.scalar('SELECT COUNT(*) FROM roles WHERE id_rol=?', [id]) || 0) !== 1) {
      const error = new Error('Rol LAB no existe.');
      error.status = 404;
      error.code = 'LAB_ROLE_NOT_FOUND';
      throw error;
    }
    return id;
  }

  function assertPermission(permissionId, candidateDb) {
    const db = dbOr(candidateDb);
    const id = positiveId(permissionId);
    if (!id || Number(db.scalar('SELECT COUNT(*) FROM perm_subelemento_acciones WHERE id_subelemento_accion=? AND activo=1', [id]) || 0) !== 1) {
      const error = new Error('Permiso atómico LAB no existe o está inactivo.');
      error.status = 400;
      error.code = 'LAB_PERMISSION_NOT_FOUND';
      throw error;
    }
    return id;
  }

  // Precedencia equivalente al backend real: roles activos -> override personal vigente -> efectivo.
  function activeRoles(userId, candidateDb) {
    const id = positiveId(userId);
    if (!id) return [];
    const db = dbOr(candidateDb);
    return db.query(`
      SELECT DISTINCT r.id_rol, r.rol, r.codigo, r.empresa, r.nivel,
             CASE WHEN u.rol_id=r.id_rol THEN 1 ELSE COALESCE(ur.principal,0) END AS principal
      FROM roles r
      LEFT JOIN usuarios u ON u.id_SB=? AND u.estado=1 AND u.rol_id=r.id_rol
      LEFT JOIN usuario_roles ur ON ur.id_usuario=? AND ur.id_rol=r.id_rol AND ur.activo=1
      WHERE r.estado=1 AND (u.id_SB IS NOT NULL OR ur.id_usuario IS NOT NULL)
      ORDER BY principal DESC, r.nivel DESC, r.rol
    `, [id, id]).map(row => ({ ...row, principal: Number(row.principal) === 1 }));
  }

  function latestUserOverride(userId, permissionId, candidateDb) {
    const db = dbOr(candidateDb);
    const rows = db.query(`
      SELECT permitido, motivo, fecha_inicio, fecha_fin, updated_at, id_usuario_permiso
      FROM usuario_permisos
      WHERE id_usuario=? AND id_subelemento_accion=? AND activo=1
        AND (fecha_inicio IS NULL OR datetime(fecha_inicio) <= datetime('now'))
        AND (fecha_fin IS NULL OR datetime(fecha_fin) >= datetime('now'))
      ORDER BY datetime(updated_at) DESC, id_usuario_permiso DESC
      LIMIT 1
    `, [Number(userId), Number(permissionId)]);
    return rows[0] || null;
  }

  function inheritedAllowed(userId, permissionId, candidateDb) {
    const db = dbOr(candidateDb);
    const roleIds = activeRoles(userId, db).map(row => Number(row.id_rol)).filter(Boolean);
    if (!roleIds.length) return false;
    const placeholders = roleIds.map(() => '?').join(',');
    return Number(db.scalar(
      `SELECT 1 FROM rol_permisos WHERE id_subelemento_accion=? AND permitido=1 AND id_rol IN (${placeholders}) LIMIT 1`,
      [Number(permissionId), ...roleIds]
    ) || 0) === 1;
  }

  function permissionById(userId, permissionId, candidateDb) {
    const id = positiveId(userId);
    const pid = positiveId(permissionId);
    if (!id || !pid) {
      return { id_subelemento_accion: pid || null, heredado:false, personalizado:null, configurado:false, efectivo:false };
    }
    const db = dbOr(candidateDb);
    const override = latestUserOverride(id, pid, db);
    const inherited = inheritedAllowed(id, pid, db);
    const personalized = override ? Number(override.permitido) === 1 : null;
    return {
      id_subelemento_accion: pid,
      heredado: inherited,
      personalizado: personalized,
      configurado: Boolean(override) || inherited,
      efectivo: personalized === null ? inherited : personalized,
      motivo: override?.motivo ?? null,
      fecha_inicio: override?.fecha_inicio ?? null,
      fecha_fin: override?.fecha_fin ?? null
    };
  }

  function permissionIdByCode(permissionCode, candidateDb) {
    const code = String(permissionCode || '').trim();
    if (!code) return 0;
    return Number(dbOr(candidateDb).scalar(
      'SELECT id_subelemento_accion FROM perm_subelemento_acciones WHERE codigo_permiso=? AND activo=1 LIMIT 1',
      [code]
    ) || 0);
  }

  function permissionByCode(userId, permissionCode, candidateDb) {
    const db = dbOr(candidateDb);
    const pid = permissionIdByCode(permissionCode, db);
    if (!pid) {
      return { codigo_permiso:String(permissionCode || ''), id_subelemento_accion:null, heredado:false, personalizado:null, configurado:false, efectivo:false };
    }
    return Object.assign({ codigo_permiso:String(permissionCode) }, permissionById(userId, pid, db));
  }

  function hasEffectivePermission(userId, permissionCode, candidateDb) {
    return permissionByCode(userId, permissionCode, candidateDb).efectivo === true;
  }

  function catalog(candidateDb, allowedDomains) {
    const rows = dbOr(candidateDb).query(`
      SELECT psa.id_subelemento_accion, psa.codigo_permiso,
             pa.id_agrupacion, pa.codigo AS agrupacion_codigo, pa.nombre AS agrupacion_nombre,
             pa.empresa AS agrupacion_empresa, pa.orden AS agrupacion_orden, pa.activo AS agrupacion_activo,
             pm.id_modulo, pm.codigo AS modulo_codigo, pm.nombre AS modulo_nombre,
             pm.ruta_frontend AS modulo_ruta_frontend, pm.orden AS modulo_orden, pm.activo AS modulo_activo,
             CASE WHEN pm.codigo LIKE '__AGRUPACION_VISUAL_%' THEN 1 ELSE 0 END AS modulo_interno_visual,
             pe.id_elemento, pe.codigo AS elemento_codigo, pe.nombre AS elemento_nombre,
             pe.tipo AS elemento_tipo, pe.orden AS elemento_orden,
             ps.id_subelemento, ps.codigo AS subelemento_codigo, ps.nombre AS subelemento_nombre,
             ps.orden AS subelemento_orden,
             pac.id_accion, pac.codigo AS accion_codigo, pac.nombre AS accion_nombre,
             pac.descripcion AS accion_descripcion, pac.requiere_auditoria
      FROM perm_agrupaciones pa
      LEFT JOIN perm_modulos pm ON pm.id_agrupacion=pa.id_agrupacion AND pm.activo=1
      LEFT JOIN perm_elementos pe ON pe.id_modulo=pm.id_modulo AND pe.activo=1
      LEFT JOIN perm_subelementos ps ON ps.id_elemento=pe.id_elemento AND ps.activo=1
      LEFT JOIN perm_subelemento_acciones psa ON psa.id_subelemento=ps.id_subelemento AND psa.activo=1
      LEFT JOIN perm_acciones pac ON pac.id_accion=psa.id_accion AND pac.activo=1
      WHERE pa.activo=1
      ORDER BY pa.orden, pm.orden, pe.orden, ps.orden, pac.nombre
    `);
    return rows.filter(row => domainAllowed(row.agrupacion_empresa, allowedDomains));
  }

  function atomicPermissionIds(candidateDb) {
    return dbOr(candidateDb).query(
      'SELECT id_subelemento_accion FROM perm_subelemento_acciones WHERE activo=1 ORDER BY id_subelemento_accion'
    ).map(row => Number(row.id_subelemento_accion)).filter(Boolean);
  }


  function permissionIdsForDomains(candidateDb, allowedDomains) {
    const domains = normalizeDomains(allowedDomains);
    if (domains === null) return atomicPermissionIds(candidateDb);
    return [...new Set(catalog(candidateDb, domains)
      .map(row => Number(row.id_subelemento_accion))
      .filter(Boolean))]
      .sort((a,b) => a-b);
  }

  function assertPermissionInDomains(permissionId, candidateDb, allowedDomains) {
    const db = dbOr(candidateDb);
    const pid = assertPermission(permissionId, db);
    const row = db.query(`
      SELECT pa.empresa
      FROM perm_subelemento_acciones psa
      JOIN perm_subelementos ps ON ps.id_subelemento=psa.id_subelemento
      JOIN perm_elementos pe ON pe.id_elemento=ps.id_elemento
      JOIN perm_modulos pm ON pm.id_modulo=pe.id_modulo
      JOIN perm_agrupaciones pa ON pa.id_agrupacion=pm.id_agrupacion
      WHERE psa.id_subelemento_accion=? AND psa.activo=1
      LIMIT 1
    `,[pid])[0];
    if (!row || !domainAllowed(row.empresa, allowedDomains)) {
      const error = new Error('El permiso no pertenece a tu alcance de administración.');
      error.status = 403;
      error.code = 'LAB_PERMISSION_OUT_OF_ADMIN_SCOPE';
      throw error;
    }
    return pid;
  }

  function sessionPermissions(userId, candidateDb) {
    const db = dbOr(candidateDb);
    return atomicPermissionIds(db).map(pid => permissionById(userId, pid, db));
  }

  function sessionPayload(userId, actorUserId, candidateDb) {
    const db = dbOr(candidateDb);
    const uid = assertUser(userId, db);
    const actorId = positiveId(actorUserId) || uid;
    return {
      usuario_id: uid,
      catalogo: catalog(db),
      permisos: sessionPermissions(uid, db),
      puede_usar_visor: hasEffectivePermission(actorId, VIEWER_PERMISSION_CODE, db)
    };
  }

  function hierarchy(candidateDb, permissionRows, mode, allowedDomains) {
    const db = dbOr(candidateDb);
    const rowById = new Map((permissionRows || []).map(row => [Number(row.id_subelemento_accion), row]));
    const atomics = db.query(`
      SELECT psa.id_subelemento_accion, pm.id_modulo, pa.id_agrupacion, pa.empresa AS agrupacion_empresa
      FROM perm_subelemento_acciones psa
      JOIN perm_subelementos ps ON ps.id_subelemento=psa.id_subelemento AND ps.activo=1
      JOIN perm_elementos pe ON pe.id_elemento=ps.id_elemento AND pe.activo=1
      JOIN perm_modulos pm ON pm.id_modulo=pe.id_modulo AND pm.activo=1
      JOIN perm_agrupaciones pa ON pa.id_agrupacion=pm.id_agrupacion AND pa.activo=1
      WHERE psa.activo=1
    `).filter(row => domainAllowed(row.agrupacion_empresa, allowedDomains));
    function state(row) {
      if (!row) return mode === 'user' ? { heredado:false, personalizado:null, efectivo:false } : false;
      return mode === 'user' ? row : Boolean(row.permitido);
    }
    function summarize(key) {
      const map = new Map();
      atomics.forEach(item => {
        const id = Number(item[key]);
        if (!id) return;
        if (!map.has(id)) map.set(id, []);
        map.get(id).push(state(rowById.get(Number(item.id_subelemento_accion))));
      });
      return [...map.entries()].map(([id, values]) => {
        if (mode !== 'user') return { [key]:id, permitido:values.length > 0 && values.every(Boolean) };
        const effective = values.map(v => Boolean(v.efectivo));
        const inherited = values.map(v => Boolean(v.heredado));
        const personals = values.map(v => v.personalizado);
        let personalized = null;
        if (personals.length && personals.every(v => v === true)) personalized = true;
        else if (personals.length && personals.every(v => v === false)) personalized = false;
        return {
          [key]:id,
          heredado:inherited.length > 0 && inherited.every(Boolean),
          personalizado:personalized,
          efectivo:effective.length > 0 && effective.every(Boolean)
        };
      });
    }
    return { agrupaciones:summarize('id_agrupacion'), modulos:summarize('id_modulo') };
  }

  function rolePermissions(roleId, candidateDb, allowedDomains) {
    const db = dbOr(candidateDb);
    const rid = assertRole(roleId, db);
    const ids = permissionIdsForDomains(db, allowedDomains);
    const permissions = ids.map(pid => {
      const row = db.query(`SELECT psa.id_subelemento_accion, psa.codigo_permiso,
             CASE WHEN rp.permitido=1 THEN 1 ELSE 0 END AS permitido
        FROM perm_subelemento_acciones psa
        LEFT JOIN rol_permisos rp ON rp.id_subelemento_accion=psa.id_subelemento_accion AND rp.id_rol=?
       WHERE psa.id_subelemento_accion=? AND psa.activo=1 LIMIT 1`, [rid,pid])[0] || {};
      return { ...row, permitido:Number(row.permitido) === 1 };
    });
    return { id_rol:rid, permisos:permissions, jerarquia:hierarchy(db, permissions, 'role', allowedDomains) };
  }

  function userPermissions(userId, candidateDb, allowedDomains) {
    const db = dbOr(candidateDb);
    const uid = assertUser(userId, db);
    const permissions = permissionIdsForDomains(db, allowedDomains).map(pid => {
      const result = permissionById(uid, pid, db);
      const meta = db.query('SELECT codigo_permiso FROM perm_subelemento_acciones WHERE id_subelemento_accion=?', [pid])[0] || {};
      return Object.assign({ codigo_permiso:meta.codigo_permiso || null }, result);
    });
    return { id_usuario:uid, roles:activeRoles(uid, db).filter(role=>domainAllowed(role.empresa,allowedDomains)), permisos:permissions, jerarquia:hierarchy(db, permissions, 'user', allowedDomains) };
  }

  function saveRolePermissions(roleId, changes, candidateDb, allowedDomains) {
    const db = dbOr(candidateDb);
    const rid = assertRole(roleId, db);
    const list = Array.isArray(changes) ? changes : [];
    let updated = 0;
    for (const change of list) {
      const pid = assertPermissionInDomains(change?.id_subelemento_accion, db, allowedDomains);
      const allowed = boolValue(change?.permitido) ? 1 : 0;
      db.run(`
        INSERT INTO rol_permisos (id_rol,id_subelemento_accion,permitido,created_by,updated_by)
        VALUES (?,?,?,NULL,NULL)
        ON CONFLICT(id_rol,id_subelemento_accion) DO UPDATE SET
          permitido=excluded.permitido, updated_at=CURRENT_TIMESTAMP, updated_by=NULL
      `, [rid, pid, allowed], { persist:false });
      updated += 1;
    }
    return { updated };
  }

  function saveUserPermissions(userId, changes, actorId, candidateDb, allowedDomains) {
    const db = dbOr(candidateDb);
    const uid = assertUser(userId, db);
    const auditId = positiveId(actorId) || null;
    const list = Array.isArray(changes) ? changes : [];
    let updated = 0;
    for (const change of list) {
      const pid = assertPermissionInDomains(change?.id_subelemento_accion, db, allowedDomains);
      const mode = String(change?.mode || '').trim().toLowerCase();
      if (!['inherit','allow','deny'].includes(mode)) {
        const error = new Error('mode debe ser inherit, allow o deny.');
        error.status = 400;
        error.code = 'LAB_PERMISSION_MODE_INVALID';
        throw error;
      }
      if (mode === 'inherit') {
        db.run(`UPDATE usuario_permisos SET activo=0, updated_at=CURRENT_TIMESTAMP, updated_by=? WHERE id_usuario=? AND id_subelemento_accion=?`, [auditId, uid, pid], { persist:false });
      } else {
        db.run(`
          INSERT INTO usuario_permisos
            (id_usuario,id_subelemento_accion,permitido,motivo,fecha_inicio,fecha_fin,activo,created_by,updated_by)
          VALUES (?,?,?,'LAB DGB',NULL,NULL,1,?,?)
          ON CONFLICT(id_usuario,id_subelemento_accion) DO UPDATE SET
            permitido=excluded.permitido, motivo='LAB DGB', fecha_inicio=NULL, fecha_fin=NULL,
            activo=1, updated_at=CURRENT_TIMESTAMP, updated_by=excluded.updated_by
        `, [uid, pid, mode === 'allow' ? 1 : 0, auditId, auditId], { persist:false });
      }
      updated += 1;
    }
    return { updated };
  }

  function setUserRoles(userId, roleIds, principalRoleId, candidateDb, allowedDomains) {
    const db = dbOr(candidateDb);
    const uid = assertUser(userId, db);
    const ids = [...new Set((Array.isArray(roleIds) ? roleIds : []).map(positiveId).filter(Boolean))];
    if (!ids.length) {
      const error = new Error('El usuario debe conservar al menos un rol.');
      error.status = 400;
      error.code = 'LAB_USER_ROLE_REQUIRED';
      throw error;
    }
    ids.forEach(id => {
      assertRole(id, db);
      const role = db.query('SELECT rol,empresa,estado FROM roles WHERE id_rol=?',[id])[0];
      if (!role || Number(role.estado)!==1 || !domainAllowed(role.empresa,allowedDomains)) {
        const error = new Error('El rol no pertenece a tu alcance de administración.');
        error.status = 403;
        error.code = 'LAB_ROLE_OUT_OF_ADMIN_SCOPE';
        throw error;
      }
    });
    const selectedNames=new Set(ids.map(id=>String(db.scalar('SELECT rol FROM roles WHERE id_rol=?',[id])||'').trim().toLowerCase()));
    if(selectedNames.has('programador')&&(selectedNames.has('programador united')||selectedNames.has('programador corellian'))){
      const error=new Error('Programador es incompatible con Programador United y Programador Corellian.');
      error.status=400;error.code='LAB_PROGRAMMER_ROLE_CONFLICT';throw error;
    }
    const principal = positiveId(principalRoleId);
    if (!principal || !ids.includes(principal)) {
      const error = new Error('principal_role_id debe formar parte de role_ids.');
      error.status = 400;
      error.code = 'LAB_PRINCIPAL_ROLE_INVALID';
      throw error;
    }
    db.run('UPDATE usuario_roles SET activo=0, principal=0, updated_at=CURRENT_TIMESTAMP WHERE id_usuario=?', [uid], { persist:false });
    for (const id of ids) {
      db.run(`
        INSERT INTO usuario_roles (id_usuario,id_rol,principal,activo)
        VALUES (?,?,?,1)
        ON CONFLICT(id_usuario,id_rol) DO UPDATE SET principal=excluded.principal, activo=1, updated_at=CURRENT_TIMESTAMP
      `, [uid, id, id === principal ? 1 : 0], { persist:false });
    }
    db.run('UPDATE usuarios SET rol_id=?, updated_at=CURRENT_TIMESTAMP WHERE id_SB=?', [principal, uid], { persist:false });
    return { id_usuario:uid, roles:activeRoles(uid, db) };
  }

  function listRoles(candidateDb, allowedDomains) {
    const db = dbOr(candidateDb);
    return db.query(`
      SELECT r.id_rol,r.rol,r.codigo,r.descripcion,r.nivel,r.es_sistema,r.empresa,r.estado,
             (SELECT COUNT(*) FROM usuario_roles ur JOIN usuarios u ON u.id_SB=ur.id_usuario AND u.estado=1 WHERE ur.id_rol=r.id_rol AND ur.activo=1) AS usuarios_activos,
             (SELECT COUNT(*) FROM rol_permisos rp WHERE rp.id_rol=r.id_rol AND rp.permitido=1) AS permisos_permitidos,
             (SELECT COUNT(*) FROM rol_permisos rp WHERE rp.id_rol=r.id_rol) AS permisos_configurados
      FROM roles r
      ORDER BY r.estado DESC,r.nivel DESC,r.rol
    `).filter(role=>domainAllowed(role.empresa,allowedDomains));
  }

  function listUsers(candidateDb, allowedDomains) {
    const db = dbOr(candidateDb);
    const users = db.query(`
      SELECT u.id_SB,u.nombre,u.iniciales,u.puesto,u.area,u.empresa,u.rol_id,u.correo,u.reporta_a,u.estado,
             r.rol,
             (SELECT COUNT(*) FROM usuario_permisos up WHERE up.id_usuario=u.id_SB AND up.activo=1) AS personalizaciones
      FROM usuarios u LEFT JOIN roles r ON r.id_rol=u.rol_id
      ORDER BY u.estado DESC,u.nombre
    `).filter(user=>domainAllowed(user.empresa,allowedDomains));
    return users.map(user => Object.assign({}, user, { roles:activeRoles(user.id_SB, db).filter(role=>domainAllowed(role.empresa,allowedDomains)) }));
  }

  function bootstrap(candidateDb, allowedDomains) {
    const db = dbOr(candidateDb);
    const roles=listRoles(db,allowedDomains);
    const users=listUsers(db,allowedDomains);
    const cat=catalog(db,allowedDomains);
    const permissionIds=[...new Set(cat.map(row=>Number(row.id_subelemento_accion)).filter(Boolean))];
    const userIds=users.map(row=>Number(row.id_SB)).filter(Boolean);
    let personalizations=0;
    if(userIds.length){
      const placeholders=userIds.map(()=>'?').join(',');
      personalizations=Number(db.scalar(`SELECT COUNT(*) FROM usuario_permisos WHERE activo=1 AND id_usuario IN (${placeholders})`,userIds)||0);
    }
    return {
      roles,
      usuarios:users,
      catalogo:cat,
      totales:{
        roles_activos:roles.filter(row=>Number(row.estado)===1).length,
        usuarios_activos:users.filter(row=>Number(row.estado)===1).length,
        permisos_disponibles:permissionIds.length,
        personalizaciones_activas:personalizations
      }
    };
  }

  function roleDetail(roleId, candidateDb) {
    const db = dbOr(candidateDb);
    const rid = assertRole(roleId, db);
    const role=db.query('SELECT id_rol,rol,codigo,descripcion,nivel,es_sistema,empresa,estado,created_at,updated_at FROM roles WHERE id_rol=?', [rid])[0];
    const users=db.query(`SELECT u.id_SB,u.nombre,u.correo,u.empresa,ur.principal
      FROM usuario_roles ur JOIN usuarios u ON u.id_SB=ur.id_usuario
      WHERE ur.id_rol=? AND ur.activo=1 AND u.estado=1
      ORDER BY ur.principal DESC,u.nombre`,[rid]).map(row=>({...row,principal:Number(row.principal)===1}));
    return Object.assign({},role,{usuarios_asignados:users.length,usuarios:users});
  }

  function normalizeRolePayload(body) {
    const source = body && typeof body === 'object' ? body : {};
    const rol = String(source.rol || '').trim();
    const codigo = String(source.codigo || '').trim();
    const empresa = String(source.empresa || 'GENERAL').trim().toUpperCase();
    const nivel = Number(source.nivel || 0);
    const estado = Number(source.estado) === 0 ? 0 : 1;
    if (!rol || !codigo) {
      const error = new Error('rol y codigo son obligatorios.');
      error.status = 400;
      error.code = 'LAB_ROLE_FIELDS_REQUIRED';
      throw error;
    }
    if (!Number.isInteger(nivel)) {
      const error = new Error('nivel debe ser entero.');
      error.status = 400;
      error.code = 'LAB_ROLE_LEVEL_INVALID';
      throw error;
    }
    return { rol, codigo, empresa, nivel, estado, descripcion:String(source.descripcion || '').trim() || null };
  }

  function createRole(body, candidateDb) {
    const db = dbOr(candidateDb);
    const value = normalizeRolePayload(body);
    if (Number(db.scalar('SELECT COUNT(*) FROM roles WHERE rol=? OR codigo=?', [value.rol, value.codigo]) || 0) > 0) {
      const error = new Error('Ya existe un rol con ese nombre o código.');
      error.status = 409;
      error.code = 'LAB_ROLE_DUPLICATE';
      throw error;
    }
    const next = Number(db.scalar('SELECT COALESCE(MAX(id_rol),0)+1 FROM roles') || 1);
    db.run(`INSERT INTO roles (id_rol,rol,codigo,descripcion,nivel,es_sistema,empresa,estado) VALUES (?,?,?,?,?,0,?,?)`, [next,value.rol,value.codigo,value.descripcion,value.nivel,value.empresa,value.estado], { persist:false });
    return roleDetail(next, db);
  }

  function updateRole(roleId, body, candidateDb) {
    const db = dbOr(candidateDb);
    const rid = assertRole(roleId, db);
    const value = normalizeRolePayload(body);
    if (Number(db.scalar('SELECT COUNT(*) FROM roles WHERE (rol=? OR codigo=?) AND id_rol<>?', [value.rol, value.codigo, rid]) || 0) > 0) {
      const error = new Error('Ya existe otro rol con ese nombre o código.');
      error.status = 409;
      error.code = 'LAB_ROLE_DUPLICATE';
      throw error;
    }
    if (value.estado===0 && Number(db.scalar('SELECT COUNT(*) FROM usuario_roles WHERE id_rol=? AND activo=1',[rid])||0)>0) {
      const error=new Error('No puedes desactivar un rol que todavía tiene usuarios activos asignados.');
      error.status=409;error.code='LAB_ROLE_IN_USE';throw error;
    }
    db.run(`UPDATE roles SET rol=?,codigo=?,descripcion=?,nivel=?,empresa=?,estado=?,updated_at=CURRENT_TIMESTAMP WHERE id_rol=?`, [value.rol,value.codigo,value.descripcion,value.nivel,value.empresa,value.estado,rid], { persist:false });
    return roleDetail(rid, db);
  }

  return Object.freeze({
    VIEWER_PERMISSION_CODE,
    PANEL_VISUAL_PERMISSION_CODE,
    normalizeDomain,
    domainAllowed,
    activeRoles,
    permissionIdByCode,
    permissionById,
    permissionByCode,
    hasEffectivePermission,
    catalog,
    permissionIdsForDomains,
    assertPermissionInDomains,
    sessionPermissions,
    sessionPayload,
    rolePermissions,
    userPermissions,
    saveRolePermissions,
    saveUserPermissions,
    setUserRoles,
    listRoles,
    listUsers,
    bootstrap,
    roleDetail,
    createRole,
    updateRole
  });
});
