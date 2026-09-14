(function initManttoLabScopeService(root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ManttoLabScopeService = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createManttoLabScopeService(root) {
  'use strict';

  const DOMAINS = Object.freeze(['GENERAL','UNITED','CORELLIAN']);
  const TYPES = Object.freeze(['DOMINIO_COMPLETO','AGRUPACION','REPORTA_A','REL_ADMIN','USUARIO']);

  function dbOr(candidate) {
    const db = candidate || root?.ManttoLabDB;
    if (!db || typeof db.query !== 'function' || typeof db.scalar !== 'function') throw new Error('MANTTO_LAB_DB_REQUIRED');
    return db;
  }
  function positiveId(value) { const id=Number(value); return Number.isInteger(id)&&id>0?id:0; }
  function uniqueIds(values) { return [...new Set((values||[]).map(positiveId).filter(Boolean))].sort((a,b)=>a-b); }
  function normalizeDomain(value) {
    const text=String(value||'').trim().toUpperCase();
    if (text==='BLT'||text==='GENERAL'||text.includes('GENERAL')||text.includes('BLT')) return 'GENERAL';
    if (text.includes('UNITED')) return 'UNITED';
    if (text.includes('CORELLIAN')) return 'CORELLIAN';
    return DOMAINS.includes(text)?text:'';
  }
  function bool(value){return value===true||value===1||value==='1';}

  function assertUser(userId, candidateDb) {
    const db=dbOr(candidateDb); const id=positiveId(userId);
    if(!id||Number(db.scalar('SELECT COUNT(*) FROM usuarios WHERE id_SB=? AND estado=1',[id])||0)!==1){
      const error=new Error('Usuario LAB no existe o está inactivo.');error.status=404;error.code='LAB_SCOPE_USER_NOT_FOUND';throw error;
    }
    return id;
  }

  function scopeRows(userId,candidateDb){
    const db=dbOr(candidateDb); const id=assertUser(userId,db);
    return db.query(`SELECT id_alcance,tipo_alcance,dominio,id_agrupacion,id_usuario_visible,activo
      FROM usuarios_alcance_informacion WHERE id_usuario=? AND activo=1 ORDER BY id_alcance`,[id]);
  }

  function hasMaster(userId,domain,candidateDb){
    const db=dbOr(candidateDb); const id=positiveId(userId); const d=normalizeDomain(domain);
    if(!id||!d)return false;
    return Number(db.scalar(`SELECT 1 FROM usuarios_alcance_informacion
      WHERE id_usuario=? AND activo=1 AND tipo_alcance='DOMINIO_COMPLETO' AND UPPER(TRIM(dominio))=? LIMIT 1`,[id,d])||0)===1;
  }

  function userIdentity(userId,candidateDb){
    const db=dbOr(candidateDb);const id=assertUser(userId,db);
    return db.query('SELECT id_SB,nombre,iniciales,correo,empresa,reporta_a FROM usuarios WHERE id_SB=? AND estado=1',[id])[0];
  }

  // GENERAL actual: llave maestra o relación directa. La relación concreta la aplica cada módulo.
  function resolveGeneral(userId,candidateDb){
    const db=dbOr(candidateDb);const user=userIdentity(userId,db);const master=hasMaster(user.id_SB,'GENERAL',db);
    return {
      motor:'alcance_gnral',empresa:'GENERAL',modo:master?'LLAVE_MAESTRA':'RELACION_DIRECTA',llave_maestra:master,
      effective_user_id:Number(user.id_SB),
      identidad:{correo:String(user.correo||'').trim().toLowerCase()||null,iniciales:String(user.iniciales||'').trim().toUpperCase()||null},
      reglas:{creado_por:true,asignado_a:true,relacionado:true,reporta_a:false,rel_admin:false,zonas_operativas:false}
    };
  }

  function corellianConfig(userId,candidateDb){
    const db=dbOr(candidateDb);const id=assertUser(userId,db);const rows=scopeRows(id,db);
    return {
      ver_propio:true,
      ver_reporta_a:rows.some(r=>String(r.tipo_alcance).toUpperCase()==='REPORTA_A'),
      ver_rel_admin:rows.some(r=>String(r.tipo_alcance).toUpperCase()==='REL_ADMIN'),
      usuarios_adicionales:uniqueIds(rows.filter(r=>String(r.tipo_alcance).toUpperCase()==='USUARIO').map(r=>r.id_usuario_visible)).filter(x=>x!==id)
    };
  }

  // El backend actual CORELLIAN usa reportes DIRECTOS, no descenso recursivo.
  function directReports(userId,candidateDb){
    const db=dbOr(candidateDb);const id=assertUser(userId,db);
    return uniqueIds(db.query('SELECT id_SB FROM usuarios WHERE reporta_a=? AND estado=1 ORDER BY id_SB',[id]).map(r=>r.id_SB));
  }
  function relAdminUsers(userId,candidateDb){
    const db=dbOr(candidateDb);const id=assertUser(userId,db);
    return uniqueIds(db.query(`SELECT DISTINCT ura.id_asesor AS id_SB FROM usuarios_rel_admin ura
      JOIN usuarios u ON u.id_SB=ura.id_asesor AND u.estado=1 WHERE ura.id_admin=? ORDER BY ura.id_asesor`,[id]).map(r=>r.id_SB));
  }
  function resolveCorellian(userId,candidateDb){
    const db=dbOr(candidateDb);const id=assertUser(userId,db);const master=hasMaster(id,'CORELLIAN',db);
    if(master)return {motor:'alcance_cor',empresa:'CORELLIAN',modo:'LLAVE_MAESTRA',llave_maestra:true,effective_user_id:id,reglas:{ver_propio:true,ver_reporta_a:false,ver_rel_admin:false,usuarios_adicionales:false,zonas_operativas:false},usuarios_automaticos:null,usuarios_adicionales:null,usuarios_visibles:null,requiere_filtro_usuario:false};
    const cfg=corellianConfig(id,db);const automatic=new Set([id]);
    if(cfg.ver_reporta_a)directReports(id,db).forEach(x=>automatic.add(x));
    if(cfg.ver_rel_admin)relAdminUsers(id,db).forEach(x=>automatic.add(x));
    const auto=uniqueIds([...automatic]);const additional=uniqueIds(cfg.usuarios_adicionales);const visible=uniqueIds([...auto,...additional]);
    return {motor:'alcance_cor',empresa:'CORELLIAN',modo:'PERSONAS_VISIBLES',llave_maestra:false,effective_user_id:id,reglas:{ver_propio:true,ver_reporta_a:cfg.ver_reporta_a,ver_rel_admin:cfg.ver_rel_admin,usuarios_adicionales:true,zonas_operativas:false},usuarios_automaticos:auto,usuarios_adicionales:additional,usuarios_visibles:visible,requiere_filtro_usuario:true};
  }

  function unitedZones(userId,candidateDb){
    const db=dbOr(candidateDb);const id=assertUser(userId,db);
    return db.query(`SELECT DISTINCT uz.zona_id AS id_zona,z.zona,z.nombre FROM usuario_zop uz
      JOIN z_op z ON z.id_zona=uz.zona_id AND z.estado=1
      WHERE uz.usuario_id=? AND uz.estado=1 ORDER BY z.zona,uz.zona_id`,[id]).map(r=>({id_zona:Number(r.id_zona),zona:String(r.zona||'').trim().toUpperCase()||null,nombre:String(r.nombre||'').trim()||null}));
  }
  function resolveUnited(userId,candidateDb){
    const db=dbOr(candidateDb);const id=assertUser(userId,db);const master=hasMaster(id,'UNITED',db);
    if(master)return {motor:'alcance_uni',empresa:'UNITED',modo:'LLAVE_MAESTRA',llave_maestra:true,effective_user_id:id,reglas:{permiso_funcional_requerido:true,zonas_operativas:false,personas_visibles:false,relacion_directa:false,llave_maestra_abre_puertas:true,llave_maestra_ignora_zonas:true},zonas_operativas:null,zona_ids:null,zona_codigos:null,requiere_filtro_zona:false};
    const zones=unitedZones(id,db);
    return {motor:'alcance_uni',empresa:'UNITED',modo:'ZONAS_OPERATIVAS',llave_maestra:false,effective_user_id:id,reglas:{permiso_funcional_requerido:true,zonas_operativas:true,personas_visibles:false,relacion_directa:false,llave_maestra_abre_puertas:true,llave_maestra_ignora_zonas:false},zonas_operativas:zones,zona_ids:uniqueIds(zones.map(z=>z.id_zona)),zona_codigos:[...new Set(zones.map(z=>z.zona).filter(Boolean))].sort(),requiere_filtro_zona:true};
  }

  function groupingRows(userId,candidateDb){
    const db=dbOr(candidateDb);const id=assertUser(userId,db);
    return db.query(`SELECT pa.id_agrupacion,pa.codigo,pa.nombre,pa.empresa FROM usuarios_alcance_informacion ai
      JOIN perm_agrupaciones pa ON pa.id_agrupacion=ai.id_agrupacion AND pa.activo=1
      WHERE ai.id_usuario=? AND ai.activo=1 AND ai.tipo_alcance='AGRUPACION' ORDER BY pa.orden,pa.id_agrupacion`,[id]);
  }
  function groupAllowed(userId,groupId,candidateDb){
    const db=dbOr(candidateDb);const id=positiveId(userId);const gid=positiveId(groupId);if(!id||!gid)return false;
    const row=db.query('SELECT empresa FROM perm_agrupaciones WHERE id_agrupacion=? AND activo=1 LIMIT 1',[gid])[0];if(!row)return false;
    const domain=normalizeDomain(row.empresa);if(domain&&hasMaster(id,domain,db))return true;
    return Number(db.scalar(`SELECT 1 FROM usuarios_alcance_informacion WHERE id_usuario=? AND activo=1 AND tipo_alcance='AGRUPACION' AND id_agrupacion=? LIMIT 1`,[id,gid])||0)===1;
  }

  function snapshot(userId,candidateDb){
    const db=dbOr(candidateDb);const id=assertUser(userId,db);
    const general=resolveGeneral(id,db),corellian=resolveCorellian(id,db),united=resolveUnited(id,db),groups=groupingRows(id,db);
    return {userId:id,engines:{general,corellian,united},domains:DOMAINS.filter(d=>hasMaster(id,d,db)),groups,scopeTypes:[...new Set(scopeRows(id,db).map(r=>String(r.tipo_alcance||'').toUpperCase()))],failClosed:true};
  }

  function domainAllowed(scopeOrUser,domain,candidateDb){
    const d=normalizeDomain(domain);if(!d)return false;
    if(typeof scopeOrUser==='number'||typeof scopeOrUser==='string')return hasMaster(scopeOrUser,d,candidateDb);
    const scope=scopeOrUser||{};return Array.isArray(scope.domains)&&scope.domains.includes(d);
  }
  function zoneAllowed(scopeOrUser,zone,candidateDb){
    const target=String(zone??'').trim().toUpperCase();if(!target)return false;
    let united=scopeOrUser?.engines?.united||scopeOrUser;
    if(typeof scopeOrUser==='number'||typeof scopeOrUser==='string')united=resolveUnited(scopeOrUser,candidateDb);
    if(united?.llave_maestra)return true;
    return (united?.zonas_operativas||[]).some(z=>String(z.id_zona)===target||String(z.zona||'').toUpperCase()===target);
  }
  function userAllowed(scopeOrUser,userId,candidateDb){
    const target=positiveId(userId);if(!target)return false;
    let cor=scopeOrUser?.engines?.corellian||scopeOrUser;
    if(typeof scopeOrUser==='number'||typeof scopeOrUser==='string')cor=resolveCorellian(scopeOrUser,candidateDb);
    if(cor?.llave_maestra)return true;
    return Array.isArray(cor?.usuarios_visibles)&&cor.usuarios_visibles.includes(target);
  }

  function canAccessRecord(scope,record,candidateDb){
    if(!scope||!scope.userId)return false;const row=record||{};let evidence=0;
    if(row.domain!==undefined&&String(row.domain||'').trim()){evidence++;const d=normalizeDomain(row.domain);const engine=d==='UNITED'?scope.engines?.united:d==='CORELLIAN'?scope.engines?.corellian:scope.engines?.general;if(!engine?.llave_maestra&&d!=='GENERAL')return false;}
    if(row.groupId!==undefined&&row.groupId!==null){evidence++;if(!groupAllowed(scope.userId,row.groupId,candidateDb))return false;}
    if(row.zone!==undefined&&row.zone!==null&&String(row.zone).trim()){evidence++;if(!zoneAllowed(scope,row.zone,candidateDb))return false;}
    if(row.ownerUserId!==undefined&&row.ownerUserId!==null){evidence++;if(!userAllowed(scope,row.ownerUserId,candidateDb))return false;}
    return evidence>0;
  }

  function zoneCatalog(candidateDb){return dbOr(candidateDb).query('SELECT id_zona,zona,nombre,estado FROM z_op WHERE estado=1 ORDER BY zona,id_zona').map(r=>({...r,id_zona:Number(r.id_zona),estado:Number(r.estado)}));}
  function readPanelScope(userId,candidateDb,options){
    const db=dbOr(candidateDb);const id=assertUser(userId,db);const rows=scopeRows(id,db);const groups=groupingRows(id,db);const groupByDomain={GENERAL:[],UNITED:[],CORELLIAN:[]};
    groups.forEach(g=>{const d=normalizeDomain(g.empresa);if(groupByDomain[d])groupByDomain[d].push(Number(g.id_agrupacion));});
    const domains=DOMAINS.filter(d=>hasMaster(id,d,db));const cor=corellianConfig(id,db);const zones=unitedZones(id,db);
    const general={llave_maestra:domains.includes('GENERAL'),agrupaciones:uniqueIds(groupByDomain.GENERAL),default:true,ver_propio:true,creado_por_mi:true,asignado_a_mi:true,relacionado_conmigo:true};
    const corellian={llave_maestra:domains.includes('CORELLIAN'),agrupaciones:uniqueIds(groupByDomain.CORELLIAN),ver_propio:true,ver_reporta_a:cor.ver_reporta_a,ver_rel_admin:cor.ver_rel_admin,usuarios_adicionales:uniqueIds(cor.usuarios_adicionales)};
    const united={llave_maestra:domains.includes('UNITED'),agrupaciones:uniqueIds(groupByDomain.UNITED),zonas:uniqueIds(zones.map(z=>z.id_zona)),zonas_detalle:zones};
    const result={version_alcance:'LAB_V2_F4',id_usuario:id,alcances:{general,corellian,united},dominios_completos:domains,agrupaciones:uniqueIds(groups.map(g=>g.id_agrupacion)),ver_propio:true,ver_reporta_a:corellian.ver_reporta_a,ver_rel_admin:corellian.ver_rel_admin,usuarios_adicionales:[...corellian.usuarios_adicionales]};
    if(options?.includeCatalogs!==false)result.catalogos={zonas_operativas:zoneCatalog(db)};
    return result;
  }

  function normalizeLegacyPayload(body,candidateDb){
    const db=dbOr(candidateDb);const src=body&&typeof body==='object'?body:{};
    const domains=new Set((Array.isArray(src.dominios_completos)?src.dominios_completos:[]).map(normalizeDomain).filter(Boolean));
    const groupIds=uniqueIds(src.agrupaciones);const groups=db.query(groupIds.length?`SELECT id_agrupacion,empresa FROM perm_agrupaciones WHERE activo=1 AND id_agrupacion IN (${groupIds.map(()=>'?').join(',')})`:'SELECT id_agrupacion,empresa FROM perm_agrupaciones WHERE 0',groupIds);
    if(groups.length!==groupIds.length){const error=new Error('Una o más agrupaciones no existen o están inactivas.');error.status=400;error.code='LAB_SCOPE_GROUP_NOT_FOUND';throw error;}
    const by={GENERAL:[],UNITED:[],CORELLIAN:[]};groups.forEach(g=>{const d=normalizeDomain(g.empresa);if(!by[d]){const error=new Error('Agrupación con dominio no reconocido.');error.status=400;error.code='LAB_SCOPE_GROUP_DOMAIN_INVALID';throw error;}by[d].push(Number(g.id_agrupacion));});
    return {general:{llave_maestra:domains.has('GENERAL'),agrupaciones:uniqueIds(by.GENERAL)},corellian:{llave_maestra:domains.has('CORELLIAN'),agrupaciones:uniqueIds(by.CORELLIAN),ver_reporta_a:bool(src.ver_reporta_a),ver_rel_admin:bool(src.ver_rel_admin),usuarios_adicionales:uniqueIds(src.usuarios_adicionales)},united:{llave_maestra:domains.has('UNITED'),agrupaciones:uniqueIds(by.UNITED)}};
  }
  function normalizeNewPayload(body,candidateDb){
    const src=body?.alcances||body||{};if(!src.general&&!src.corellian&&!src.united)return normalizeLegacyPayload(body,candidateDb);
    const db=dbOr(candidateDb);const result={};
    for(const d of DOMAINS){const key=d.toLowerCase();const item=src[key]||{};const ids=uniqueIds(item.agrupaciones);if(ids.length){const rows=db.query(`SELECT id_agrupacion,empresa FROM perm_agrupaciones WHERE activo=1 AND id_agrupacion IN (${ids.map(()=>'?').join(',')})`,ids);if(rows.length!==ids.length||rows.some(r=>normalizeDomain(r.empresa)!==d)){const error=new Error(`Agrupaciones inválidas para ${d}.`);error.status=400;error.code='LAB_SCOPE_GROUP_DOMAIN_MISMATCH';throw error;}}
      result[key]={llave_maestra:bool(item.llave_maestra??item.dominio_completo),agrupaciones:ids};}
    result.corellian.ver_reporta_a=bool(src.corellian?.ver_reporta_a);result.corellian.ver_rel_admin=bool(src.corellian?.ver_rel_admin);result.corellian.usuarios_adicionales=uniqueIds(src.corellian?.usuarios_adicionales);return result;
  }
  function validateVisibleUsers(userId,ids,candidateDb){
    const db=dbOr(candidateDb),uid=positiveId(userId),list=uniqueIds(ids).filter(id=>id!==uid);if(!list.length)return[];const rows=db.query(`SELECT id_SB FROM usuarios WHERE estado=1 AND id_SB IN (${list.map(()=>'?').join(',')})`,list);if(rows.length!==list.length){const error=new Error('Uno o más usuarios adicionales no existen o están inactivos.');error.status=400;error.code='LAB_SCOPE_USERS_NOT_FOUND';throw error;}return list;
  }
  function savePanelScope(userId,body,actorId,candidateDb,options){
    const db=dbOr(candidateDb),uid=assertUser(userId,db),aid=positiveId(actorId)||null;
    const opts=options&&typeof options==='object'?options:{};
    const current=readPanelScope(uid,db,{includeCatalogs:false});
    const norm=(body?.alcances||body?.general||body?.corellian||body?.united)?normalizeNewPayload(body,db):normalizeLegacyPayload(body,db);
    if(opts.preserveAdditionalUsers===true){
      norm.corellian.usuarios_adicionales=uniqueIds(current.usuarios_adicionales);
    }else{
      norm.corellian.usuarios_adicionales=validateVisibleUsers(uid,norm.corellian.usuarios_adicionales,db);
    }
    const targetTypes=opts.preserveAdditionalUsers===true
      ? "('DOMINIO_COMPLETO','AGRUPACION','REPORTA_A','REL_ADMIN')"
      : "('DOMINIO_COMPLETO','AGRUPACION','REPORTA_A','REL_ADMIN','USUARIO')";
    db.run(`UPDATE usuarios_alcance_informacion SET activo=0,updated_by=?,updated_at=CURRENT_TIMESTAMP WHERE id_usuario=? AND activo=1 AND tipo_alcance IN ${targetTypes}`,[aid,uid],{persist:false});
    const rows=[];for(const d of DOMAINS){const item=norm[d.toLowerCase()];if(item.llave_maestra)rows.push([uid,'DOMINIO_COMPLETO',d,null,null,aid,aid]);else item.agrupaciones.forEach(g=>rows.push([uid,'AGRUPACION',null,g,null,aid,aid]));}
    if(norm.corellian.ver_reporta_a)rows.push([uid,'REPORTA_A',null,null,null,aid,aid]);if(norm.corellian.ver_rel_admin)rows.push([uid,'REL_ADMIN',null,null,null,aid,aid]);if(opts.preserveAdditionalUsers!==true)norm.corellian.usuarios_adicionales.forEach(v=>rows.push([uid,'USUARIO',null,null,v,aid,aid]));
    rows.forEach(row=>db.run(`INSERT INTO usuarios_alcance_informacion (id_usuario,tipo_alcance,dominio,id_agrupacion,id_usuario_visible,activo,created_by,updated_by) VALUES (?,?,?,?,?,1,?,?)`,row,{persist:false}));
    return readPanelScope(uid,db);
  }

  return Object.freeze({DOMAINS,TYPES,normalizeDomain,hasMaster,resolveGeneral,resolveCorellian,resolveUnited,directReports,relAdminUsers,unitedZones,groupAllowed,snapshot,domainAllowed,zoneAllowed,userAllowed,canAccessRecord,readPanelScope,savePanelScope,zoneCatalog});
});
