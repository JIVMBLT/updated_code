(function initManttoLabCatalogsService(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.ManttoLabCatalogsService=api;
})(typeof globalThis!=='undefined'?globalThis:this,function createManttoLabCatalogsService(root){
  'use strict';

  function dbOr(candidate){
    const db=candidate||root?.ManttoLabDB;
    if(!db||typeof db.query!=='function'||typeof db.scalar!=='function')throw new Error('MANTTO_LAB_DB_REQUIRED');
    return db;
  }
  function tableExists(name,candidateDb){
    const db=dbOr(candidateDb);
    return Number(db.scalar("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name=?",[String(name||'')])||0)>0;
  }
  function normalizeCodes(value){
    const source=Array.isArray(value)?value:String(value||'').split(',');
    return [...new Set(source.map(item=>String(item||'').trim().toUpperCase()).filter(Boolean))];
  }

  // Contrato real: GET /api/catalogos/roles
  function rolesBasic(candidateDb){
    return dbOr(candidateDb).query(`
      SELECT id_rol,rol,descripcion,estado
      FROM roles
      WHERE estado=1
      ORDER BY id_rol ASC
    `);
  }

  // Contrato real montado desde data.routes: GET /api/roles
  function roles(candidateDb){
    return dbOr(candidateDb).query(`
      SELECT *
      FROM roles
      WHERE estado=1
      ORDER BY id_rol ASC
    `);
  }

  function zonesBasic(candidateDb){
    return dbOr(candidateDb).query(`
      SELECT id_zona,zona,nombre,estado
      FROM z_op
      WHERE estado=1
      ORDER BY zona ASC
    `);
  }

  function zones(candidateDb){
    return dbOr(candidateDb).query(`
      SELECT *
      FROM z_op
      WHERE estado=1
      ORDER BY zona ASC
    `);
  }

  function securityQuestions(candidateDb){
    return dbOr(candidateDb).query(`
      SELECT id_pregunta,pregunta
      FROM preguntas_seguridad
      WHERE estado=1
      ORDER BY id_pregunta ASC
    `);
  }

  function superiors(candidateDb){
    return dbOr(candidateDb).query(`
      SELECT u.id_SB,u.nombre,u.iniciales,u.puesto,u.area,u.correo,r.rol
      FROM usuarios u
      LEFT JOIN roles r ON r.id_rol=u.rol_id
      WHERE u.estado=1
      ORDER BY r.id_rol ASC,u.nombre ASC
    `);
  }

  function visualStates(query,candidateDb){
    const db=dbOr(candidateDb);
    const codes=normalizeCodes(query?.codigos??query?.codigo??'');
    const params=[];
    let where='activo=1';
    if(codes.length){
      where+=` AND UPPER(codigo) IN (${codes.map(()=>'?').join(',')})`;
      params.push(...codes);
    }
    return db.query(`
      SELECT id_estado_visual,codigo,nombre,descripcion,categoria,emoji,icono,
             color_texto,color_fondo,color_borde,prioridad,activo
      FROM estados_visuales
      WHERE ${where}
      ORDER BY prioridad ASC,nombre ASC
    `,params);
  }

  function legacyPermissions(candidateDb){
    const db=dbOr(candidateDb);
    if(!tableExists('permisos',db)){
      const error=new Error('La estructura LAB vigente no contiene la tabla legacy permisos requerida por /api/permisos.');
      error.status=501;
      error.code='LAB_LEGACY_PERMISOS_TABLE_UNAVAILABLE';
      error.details={table:'permisos',phase:'FASE_5'};
      throw error;
    }
    return db.query(`
      SELECT p.*,r.rol
      FROM permisos p
      LEFT JOIN roles r ON r.id_rol=p.rol_id
      ORDER BY p.rol_id ASC
    `);
  }

  function userZones(candidateDb){
    return dbOr(candidateDb).query(`
      SELECT uz.id_usuario_zop,uz.usuario_id,u.nombre AS usuario_nombre,
             uz.zona_id,z.zona,z.nombre AS zona_nombre,uz.estado
      FROM usuario_zop uz
      LEFT JOIN usuarios u ON u.id_SB=uz.usuario_id
      LEFT JOIN z_op z ON z.id_zona=uz.zona_id
      ORDER BY u.nombre ASC,z.zona ASC
    `);
  }

  // Servicio interno: no inventa un endpoint HTTP. Sirve para diagnósticos LAB.
  function companies(candidateDb){
    const db=dbOr(candidateDb);
    const normalize=root?.ManttoLabScopeService?.normalizeDomain||((value)=>String(value||'').trim().toUpperCase());
    const values=db.query(`
      SELECT empresa FROM roles WHERE estado=1 AND NULLIF(TRIM(COALESCE(empresa,'')),'') IS NOT NULL
      UNION
      SELECT empresa FROM usuarios WHERE estado=1 AND NULLIF(TRIM(COALESCE(empresa,'')),'') IS NOT NULL
      ORDER BY empresa
    `);
    const domains=new Map();
    values.forEach(row=>{
      const domain=normalize(row.empresa);
      if(domain&&!domains.has(domain))domains.set(domain,{dominio:domain,etiqueta:domain==='GENERAL'?'GENERAL / BLT':domain});
    });
    return [...domains.values()];
  }

  return Object.freeze({
    tableExists,
    rolesBasic,
    roles,
    zonesBasic,
    zones,
    securityQuestions,
    superiors,
    visualStates,
    legacyPermissions,
    userZones,
    companies
  });
});
