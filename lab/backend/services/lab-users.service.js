(function initManttoLabUsersService(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.ManttoLabUsersService=api;
})(typeof globalThis!=='undefined'?globalThis:this,function createManttoLabUsersService(root){
  'use strict';

  const PUBLIC_USER_SELECT=`
    u.id_SB,
    u.nombre,
    u.iniciales,
    u.puesto,
    u.area,
    u.empresa,
    u.rol_id,
    r.rol,
    r.descripcion AS rol_descripcion,
    u.correo,
    u.reporta_a,
    jefe.nombre AS reporta_a_nombre,
    u.estado,
    u.ultimo_acceso,
    u.failed_login_attempts,
    u.locked_until,
    u.must_change_password,
    u.last_login_ip,
    u.created_at,
    u.updated_at
  `;

  function dbOr(candidate){
    const db=candidate||root?.ManttoLabDB;
    if(!db||typeof db.query!=='function'||typeof db.scalar!=='function'||typeof db.run!=='function')throw new Error('MANTTO_LAB_DB_REQUIRED');
    return db;
  }
  function positiveId(value){const n=Number(value);return Number.isInteger(n)&&n>0?n:0;}
  function text(value){return value===undefined||value===null?null:String(value).trim();}
  function idList(value){
    if(value===undefined||value===null||value==='')return[];
    const source=Array.isArray(value)?value:String(value).split(',');
    return [...new Set(source.map(Number).filter(v=>Number.isInteger(v)&&v>0))];
  }
  function httpError(message,status,code,details){
    const error=new Error(message);error.status=status||400;error.code=code||'LAB_USER_ERROR';if(details)error.details=details;return error;
  }
  function tableExists(name,db){return Number(db.scalar("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name=?",[String(name)])||0)>0;}

  // Contrato /api/usuarios/:id/roles. No se agregan campos que la ruta real no entrega.
  function rolesForUser(userId,candidateDb){
    const db=dbOr(candidateDb);const uid=positiveId(userId);
    if(!uid)return[];
    return db.query(`
      SELECT ur.id_usuario_rol,r.id_rol,r.rol,r.descripcion,ur.principal,ur.activo
      FROM usuario_roles ur
      INNER JOIN roles r ON r.id_rol=ur.id_rol
      WHERE ur.id_usuario=? AND ur.activo=1 AND r.estado=1
      ORDER BY ur.principal DESC,r.id_rol ASC
    `,[uid]);
  }

  // Versión interna con código/empresa para reproducir hasGlobalProgrammerRole.
  function activeRoleDetails(userId,candidateDb){
    const db=dbOr(candidateDb);const uid=positiveId(userId);
    if(!uid)return[];
    return db.query(`
      SELECT ur.id_usuario_rol,r.id_rol,r.rol,r.codigo,r.descripcion,r.empresa,r.nivel,ur.principal,ur.activo
      FROM usuario_roles ur
      INNER JOIN roles r ON r.id_rol=ur.id_rol
      WHERE ur.id_usuario=? AND ur.activo=1 AND r.estado=1
      ORDER BY ur.principal DESC,r.id_rol ASC
    `,[uid]);
  }

  function zonesForUser(userId,candidateDb){
    const db=dbOr(candidateDb);const uid=positiveId(userId);
    if(!uid)return[];
    return db.query(`
      SELECT uz.id_usuario_zop,z.id_zona,z.zona,z.nombre
      FROM usuario_zop uz
      INNER JOIN z_op z ON z.id_zona=uz.zona_id
      WHERE uz.usuario_id=? AND uz.estado=1 AND z.estado=1
      ORDER BY z.zona ASC
    `,[uid]);
  }

  function list(candidateDb){
    return dbOr(candidateDb).query(`
      SELECT ${PUBLIC_USER_SELECT}
      FROM usuarios u
      LEFT JOIN roles r ON r.id_rol=u.rol_id
      LEFT JOIN usuarios jefe ON jefe.id_SB=u.reporta_a
      ORDER BY u.estado DESC,r.id_rol ASC,u.nombre ASC
    `);
  }

  function directory(candidateDb){
    return dbOr(candidateDb).query(`
      SELECT u.id_SB,u.nombre,u.iniciales,u.puesto,u.area,u.empresa,u.correo,u.estado,r.rol
      FROM usuarios u
      LEFT JOIN roles r ON r.id_rol=u.rol_id
      WHERE u.estado=1
      ORDER BY u.nombre ASC
    `);
  }

  function detail(userId,candidateDb){
    const db=dbOr(candidateDb);const uid=positiveId(userId);
    if(!uid)return null;
    const row=db.query(`
      SELECT ${PUBLIC_USER_SELECT},ps.pregunta AS pregunta_seguridad
      FROM usuarios u
      LEFT JOIN roles r ON r.id_rol=u.rol_id
      LEFT JOIN usuarios jefe ON jefe.id_SB=u.reporta_a
      LEFT JOIN preguntas_seguridad ps ON ps.id_pregunta=u.id_pregunta
      WHERE u.id_SB=?
      LIMIT 1
    `,[uid])[0];
    if(!row)return null;
    return {...row,roles_detalle:rolesForUser(uid,db),zonas_detalle:zonesForUser(uid,db)};
  }

  function normalizeDomain(value){
    const fn=root?.ManttoLabScopeService?.normalizeDomain;
    return fn?fn(value):String(value||'').trim().toUpperCase();
  }
  function hasGlobalProgrammerRole(user,candidateDb){
    if(!user?.id_SB)return false;
    return activeRoleDetails(user.id_SB,candidateDb).some(role=>
      Number(role.activo)===1&&String(role.codigo||'').trim().toUpperCase()==='PROGRAMADOR'&&normalizeDomain(role.empresa)==='GENERAL'
    );
  }
  function assertManager(user,candidateDb){
    if(hasGlobalProgrammerRole(user,candidateDb))return true;
    throw httpError('No tienes permisos para administrar usuarios.',403,'LAB_USER_ADMIN_FORBIDDEN');
  }

  function validateRoleIds(roleIds,db){
    if(!roleIds.length)return;
    const placeholders=roleIds.map(()=>'?').join(',');
    const found=Number(db.scalar(`SELECT COUNT(*) FROM roles WHERE id_rol IN (${placeholders}) AND estado=1`,roleIds)||0);
    if(found!==roleIds.length)throw httpError('Uno o más roles no existen o están inactivos.',400,'LAB_USER_ROLE_INVALID');
  }
  function validateZoneIds(zoneIds,db){
    if(!zoneIds.length)return;
    const placeholders=zoneIds.map(()=>'?').join(',');
    const found=Number(db.scalar(`SELECT COUNT(*) FROM z_op WHERE id_zona IN (${placeholders}) AND estado=1`,zoneIds)||0);
    if(found!==zoneIds.length)throw httpError('Una o más zonas no existen o están inactivas.',400,'LAB_USER_ZONE_INVALID');
  }
  function validateQuestion(idPregunta,db){
    if(!idPregunta)return;
    if(Number(db.scalar('SELECT COUNT(*) FROM preguntas_seguridad WHERE id_pregunta=? AND estado=1',[idPregunta])||0)!==1){
      throw httpError('La pregunta de seguridad no existe o está inactiva.',400,'LAB_USER_SECURITY_QUESTION_INVALID');
    }
  }
  function assertUnique(email,initials,userId,db){
    const params=[String(email||'').toLowerCase(),String(initials||'').toUpperCase()];
    let sql='SELECT id_SB FROM usuarios WHERE (LOWER(correo)=? OR UPPER(iniciales)=?)';
    if(userId){sql+=' AND id_SB<>?';params.push(Number(userId));}
    if(db.query(sql,params).length)throw httpError('Correo o iniciales ya existen.',409,'LAB_DUPLICATE_USER');
  }

  function normalizePayload(payload){
    const p=payload||{};
    return {
      nombre:text(p.nombre),
      iniciales:text(p.iniciales)?.toUpperCase(),
      puesto:text(p.puesto),
      area:text(p.area),
      empresa:text(p.empresa),
      correo:text(p.correo)?.toLowerCase(),
      rolId:positiveId(p.rol_id||p.id_rol),
      reportaA:positiveId(p.reporta_a)||null,
      estado:p.estado===undefined?1:(Number(p.estado)?1:0),
      idPregunta:positiveId(p.id_pregunta)||11,
      rolesAsociados:idList(p.roles_asociados||p.roles||p.role_ids),
      zonas:idList(p.zonas||p.zona_ids||p.zonas_asignadas)
    };
  }
  function validatePayload(value){
    if(!value.nombre||!value.iniciales||!value.puesto||!value.area||!value.correo||!value.rolId){
      throw httpError('Nombre, iniciales, puesto, área, correo y rol principal son obligatorios.',400,'LAB_USER_REQUIRED_FIELDS');
    }
    if(!/^[^@\s]+@lab\.invalid$/i.test(value.correo)){
      throw httpError('LAB solo admite correos sintéticos con dominio @lab.invalid.',400,'LAB_SYNTHETIC_EMAIL_REQUIRED');
    }
  }
  function actorAuditId(actor){const value=Number(actor?.id_SB);return Number.isInteger(value)&&value>0?value:null;}
  function audit(db,actor,eventType,details){
    const actorId=actorAuditId(actor);if(!actorId||!tableExists('auth_audit',db))return;
    db.run('INSERT INTO auth_audit (usuario_id,event_type,event_details,ip_address) VALUES (?,?,?,NULL)',[actorId,eventType,JSON.stringify(details||{})]);
  }
  function replaceRoles(userId,principalRoleId,roleIds,db){
    db.run('DELETE FROM usuario_roles WHERE id_usuario=?',[userId]);
    roleIds.forEach(roleId=>db.run(`INSERT INTO usuario_roles (id_usuario,id_rol,principal,activo) VALUES (?,?,?,1)`,[userId,roleId,roleId===principalRoleId?1:0]));
  }
  function replaceZones(userId,zoneIds,actor,db){
    db.run('DELETE FROM usuario_zop WHERE usuario_id=?',[userId]);
    const by=String(actor?.correo||'LAB');
    zoneIds.forEach(zoneId=>db.run(`INSERT INTO usuario_zop (usuario_id,zona_id,estado,created_by,updated_by) VALUES (?,?,1,?,?)`,[userId,zoneId,by,by]));
  }

  function create(payload,actor,candidateDb){
    const db=dbOr(candidateDb);assertManager(actor,db);
    const value=normalizePayload(payload);validatePayload(value);
    const roleIds=[...new Set([value.rolId,...value.rolesAsociados])];
    validateRoleIds(roleIds,db);validateZoneIds(value.zonas,db);validateQuestion(value.idPregunta,db);assertUnique(value.correo,value.iniciales,null,db);
    if(value.reportaA&&!db.query('SELECT id_SB FROM usuarios WHERE id_SB=? AND estado=1 LIMIT 1',[value.reportaA]).length){
      throw httpError('El superior directo no existe o está inactivo.',400,'LAB_USER_MANAGER_INVALID');
    }
    const by=String(actor?.correo||'LAB');
    const result=db.run(`
      INSERT INTO usuarios
      (nombre,iniciales,puesto,area,empresa,rol_id,correo,pass,must_change_password,reporta_a,estado,id_pregunta,created_by,updated_by)
      VALUES (?,?,?,?,?,?,?,'LAB_NO_PASSWORD',0,?,?,?,?,?)
    `,[value.nombre,value.iniciales,value.puesto,value.area,value.empresa,value.rolId,value.correo,value.reportaA,value.estado,value.idPregunta,by,by]);
    const newUserId=Number(result.lastInsertRowId);
    replaceRoles(newUserId,value.rolId,roleIds,db);
    replaceZones(newUserId,value.zonas,actor,db);
    audit(db,actor,'ADMIN_USER_CREATED',{target_user_id:newUserId,correo:value.correo,rol_id:value.rolId,roles:roleIds,zonas:value.zonas,lab_no_password:true});
    return {id_SB:newUserId,password_temporal:null,lab_no_password:true,roles_detalle:rolesForUser(newUserId,db),zonas_detalle:zonesForUser(newUserId,db)};
  }

  function update(userId,payload,actor,candidateDb){
    const db=dbOr(candidateDb);assertManager(actor,db);
    const uid=positiveId(userId);if(!uid)throw httpError('ID inválido.',400,'LAB_USER_ID_INVALID');
    if(!db.query('SELECT id_SB FROM usuarios WHERE id_SB=? LIMIT 1',[uid]).length)throw httpError('Usuario no encontrado.',404,'LAB_USER_NOT_FOUND');
    const value=normalizePayload(payload);validatePayload(value);
    if(value.reportaA===uid)throw httpError('El usuario no puede reportarse a sí mismo.',400,'LAB_USER_SELF_REPORT');
    const roleIds=[...new Set([value.rolId,...value.rolesAsociados])];
    validateRoleIds(roleIds,db);validateZoneIds(value.zonas,db);validateQuestion(value.idPregunta,db);assertUnique(value.correo,value.iniciales,uid,db);
    if(value.reportaA&&!db.query('SELECT id_SB FROM usuarios WHERE id_SB=? AND estado=1 LIMIT 1',[value.reportaA]).length){
      throw httpError('El superior directo no existe o está inactivo.',400,'LAB_USER_MANAGER_INVALID');
    }
    const by=String(actor?.correo||'LAB');
    db.run(`
      UPDATE usuarios SET nombre=?,iniciales=?,puesto=?,area=?,empresa=?,rol_id=?,correo=?,reporta_a=?,estado=?,updated_by=?,updated_at=CURRENT_TIMESTAMP
      WHERE id_SB=?
    `,[value.nombre,value.iniciales,value.puesto,value.area,value.empresa,value.rolId,value.correo,value.reportaA,value.estado,by,uid]);
    replaceRoles(uid,value.rolId,roleIds,db);
    replaceZones(uid,value.zonas,actor,db);
    audit(db,actor,'ADMIN_USER_UPDATED',{target_user_id:uid,correo:value.correo,rol_id:value.rolId,roles:roleIds,zonas:value.zonas});
    return {id_SB:uid,roles_detalle:rolesForUser(uid,db),zonas_detalle:zonesForUser(uid,db)};
  }

  function criticalPreferences(userId,candidateDb){
    const db=dbOr(candidateDb);const uid=positiveId(userId);if(!uid)return null;
    const row=db.query('SELECT criticos_fallas,criticos_periodo FROM usuarios WHERE id_SB=? LIMIT 1',[uid])[0];
    return row?{criticos_fallas:Number(row.criticos_fallas||3),criticos_periodo:Number(row.criticos_periodo||35)}:null;
  }
  function updateCriticalPreferences(userId,payload,actor,candidateDb){
    const db=dbOr(candidateDb);const uid=positiveId(userId);if(!uid)throw httpError('Sesión requerida.',401,'LAB_IDENTITY_REQUIRED');
    const fallas=Number.parseInt(payload?.criticos_fallas,10),periodo=Number.parseInt(payload?.criticos_periodo,10);
    if(!Number.isInteger(fallas)||fallas<1||fallas>9999)throw httpError('criticos_fallas debe ser un entero entre 1 y 9999.',400,'LAB_CRITICAL_FAILURES_INVALID');
    if(!Number.isInteger(periodo)||periodo<1||periodo>3650)throw httpError('criticos_periodo debe ser un entero entre 1 y 3650.',400,'LAB_CRITICAL_PERIOD_INVALID');
    if(!db.query('SELECT id_SB FROM usuarios WHERE id_SB=? LIMIT 1',[uid]).length)throw httpError('Usuario no encontrado.',404,'LAB_USER_NOT_FOUND');
    db.run(`UPDATE usuarios SET criticos_fallas=?,criticos_periodo=?,updated_by=?,updated_at=CURRENT_TIMESTAMP WHERE id_SB=?`,[fallas,periodo,actor?.correo||null,uid]);
    return {criticos_fallas:fallas,criticos_periodo:periodo};
  }

  function supervisorCompany(value){return String(value||'').trim().toUpperCase().replace(/\s+LAB$/,'');}
  function supervisorsMaintenance(candidateDb){
    const db=dbOr(candidateDb);
    const rows=db.query(`
      SELECT DISTINCT u.id_SB,u.nombre,u.iniciales,u.correo,u.empresa,r.rol,z.id_zona,z.zona,z.nombre AS zona_nombre
      FROM usuarios u
      INNER JOIN (
        SELECT id_SB AS id_usuario,rol_id AS id_rol FROM usuarios WHERE rol_id IS NOT NULL
        UNION
        SELECT id_usuario,id_rol FROM usuario_roles WHERE activo=1
      ) ux ON ux.id_usuario=u.id_SB
      INNER JOIN roles r ON r.id_rol=ux.id_rol AND r.estado=1
      LEFT JOIN usuario_zop uz ON uz.usuario_id=u.id_SB AND uz.estado=1
      LEFT JOIN z_op z ON z.id_zona=uz.zona_id AND z.estado=1
      WHERE u.estado=1
      ORDER BY u.nombre ASC,z.zona ASC
    `).filter(row=>supervisorCompany(row.empresa)==='UNITED ELEVADORES'&&String(row.rol||'').trim().toUpperCase().startsWith('SUPERVISOR MANTENIMIENTO'));
    const byUser=new Map();
    rows.forEach(row=>{
      const uid=Number(row.id_SB);
      if(!byUser.has(uid))byUser.set(uid,{id_SB:uid,nombre:row.nombre,iniciales:row.iniciales,correo:row.correo,roles:[],zonas:[]});
      const item=byUser.get(uid);
      if(row.rol&&!item.roles.includes(row.rol))item.roles.push(row.rol);
      if(row.id_zona&&!item.zonas.some(zone=>Number(zone.id_zona)===Number(row.id_zona)))item.zonas.push({id_zona:Number(row.id_zona),zona:row.zona,nombre:row.zona_nombre});
    });
    return [...byUser.values()];
  }

  function resetCredentials(userId,actor,candidateDb){
    const db=dbOr(candidateDb);assertManager(actor,db);
    const uid=positiveId(userId);if(!uid)throw httpError('ID inválido.',400,'LAB_USER_ID_INVALID');
    const user=db.query('SELECT id_SB,correo FROM usuarios WHERE id_SB=? LIMIT 1',[uid])[0];
    if(!user)throw httpError('Usuario no encontrado.',404,'LAB_USER_NOT_FOUND');
    let sessionsRevoked=0;
    if(tableExists('auth_sessions',db)){
      sessionsRevoked=Number(db.scalar('SELECT COUNT(*) FROM auth_sessions WHERE usuario_id=? AND revoked_at IS NULL',[uid])||0);
      db.run(`UPDATE auth_sessions SET revoked_at=COALESCE(revoked_at,CURRENT_TIMESTAMP) WHERE usuario_id=? AND revoked_at IS NULL`,[uid]);
    }
    db.run(`UPDATE usuarios SET pass='LAB_NO_PASSWORD',must_change_password=0,failed_login_attempts=0,locked_until=NULL,updated_by=?,updated_at=CURRENT_TIMESTAMP WHERE id_SB=?`,[actor?.correo||'LAB',uid]);
    audit(db,actor,'ADMIN_USER_CREDENTIAL_RESET',{target_user_id:uid,lab_no_password:true,sessions_revoked:sessionsRevoked});
    return {user_id:uid,user_email:user.correo,temporary_password:null,must_change_password:false,credential_verified:false,sessions_revoked:sessionsRevoked,lab_no_password:true};
  }

  return Object.freeze({
    list,
    directory,
    detail,
    rolesForUser,
    zonesForUser,
    activeRoleDetails,
    hasGlobalProgrammerRole,
    create,
    update,
    criticalPreferences,
    updateCriticalPreferences,
    supervisorsMaintenance,
    resetCredentials
  });
});
