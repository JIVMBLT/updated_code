// [Claude | 2026-10-16 | CLAUDE-MG | LAB DGB - FOTOGRAFIAS CATALOGO GENERAL V001]
// Catalogo General de Fotografias (Corellian + United) sobre las tablas existentes del LAB:
//   CORELLIAN: ins_proyecto_fotos (+ ins_fl para proyecto/estado/cliente)
//   UNITED   : portafolio_proyecto_fotos (+ portafolio para estado/cliente, + proyecto_equivalencias)
// Devuelve las mismas formas que consume modules/ventas-fotos-mapa (version con Aiven).
// Como en la puerta GENERAL original, las fotografias no se filtran por alcance; solo se pide
// el permiso funcional (en la ruta). La "navegacion" indica a que proyectos puede entrar el usuario.
(function initManttoLabFotografiasCatalogoService(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.ManttoLabFotografiasCatalogoService=api;
})(typeof globalThis!=='undefined'?globalThis:this,function createManttoLabFotografiasCatalogoService(root){
  'use strict';
  const SLOTS=['FOTO BLT','FOTO BLT 2','FOTO BLT 3','FOTO BLT 4','FOTO BLT 5','FOTO BLT 6','FOTO BLT 7'];
  function dbOr(c){const db=c||root.ManttoLabDB;if(!db)throw new Error('MANTTO_LAB_DB_REQUIRED');return db;}
  function limit(q,def){const n=parseInt(q&&q.limit,10);return Number.isFinite(n)?Math.max(1,Math.min(5000,n)):def;}
  function esDirectorGeneral(uid,db){
    const perm=root.ManttoLabPermissionsService;
    if(perm&&typeof perm.activeRoles==='function')return perm.activeRoles(uid,db).some(r=>String(r.codigo||'').toUpperCase()==='DIRECTOR_GENERAL');
    return Number(db.scalar(`SELECT COUNT(*) FROM usuarios u JOIN roles r ON r.id_rol=u.rol_id WHERE u.id_SB=? AND r.codigo='DIRECTOR_GENERAL'`,[uid])||0)>0;
  }
  function corellian(q,candidateDb){
    const db=dbOr(candidateDb),max=limit(q,5000);
    const rows=db.query(`SELECT f.*,
        (SELECT l.proyecto FROM ins_fl l WHERE l.id_proyecto=f.id_ppns AND l.activo=1 ORDER BY l.id_ins_fl LIMIT 1) AS l_proyecto,
        (SELECT l.estado   FROM ins_fl l WHERE l.id_proyecto=f.id_ppns AND l.activo=1 ORDER BY l.id_ins_fl LIMIT 1) AS l_estado,
        (SELECT l.cliente  FROM ins_fl l WHERE l.id_proyecto=f.id_ppns AND l.activo=1 ORDER BY l.id_ins_fl LIMIT 1) AS l_cliente
      FROM ins_proyecto_fotos f WHERE f.activo=1 ORDER BY f.id_ppns LIMIT ?`,[max]);
    return rows.map(r=>{
      const out={'ID Proyecto':r.id_ppns,id_ppns:r.id_ppns,Proyecto:r.l_proyecto||r.id_ppns,Estado:r.l_estado||'',Cliente:r.l_cliente||'',foto_principal:r.foto_principal||null};
      SLOTS.forEach((slot,i)=>{out[slot]=r['foto_blt_'+(i+1)]||null;});
      for(let i=1;i<=7;i++)out['foto_blt_'+i]=r['foto_blt_'+i]||null;
      return out;
    });
  }
  function united(q,candidateDb){
    const db=dbOr(candidateDb),max=limit(q,5000);
    return db.query(`SELECT p.proyecto AS proyecto_united,e.proyecto_corellian,e.nombre_publico,
        (SELECT x.estado  FROM portafolio x WHERE x.proyecto=p.proyecto LIMIT 1) AS estado,
        (SELECT x.cliente FROM portafolio x WHERE x.proyecto=p.proyecto LIMIT 1) AS cliente,
        p.foto_1,p.foto_2,p.foto_3,p.foto_4,p.foto_5,p.foto_6,p.foto_7,p.foto_principal
      FROM portafolio_proyecto_fotos p LEFT JOIN proyecto_equivalencias e ON e.proyecto_united=p.proyecto AND e.activo=1
      WHERE p.activo=1 ORDER BY p.proyecto LIMIT ?`,[max]).map(r=>({...r,estado:r.estado||'',cliente:r.cliente||''}));
  }
  function fotografias(userId,query,candidateDb){const db=dbOr(candidateDb);return{corellian:corellian(query,db),united:united(query,db)};}
  // Proyectos a los que el usuario puede entrar desde el catalogo (boton "Ir a proyecto ...").
  function navegacionCorellian(userId,query,candidateDb){
    const db=dbOr(candidateDb),uid=Number(userId);
    const all=corellian(query,db);
    if(esDirectorGeneral(uid,db))return all.map(r=>({'ID Proyecto':r['ID Proyecto'],Proyecto:r.Proyecto}));
    const ins=root.ManttoLabInstallationsService;if(!ins||typeof ins.visibleProjectSql!=='function')return[];
    const sc=ins.visibleProjectSql(uid,'f',db);
    const ok=new Set(db.query(`SELECT DISTINCT f.id_proyecto AS id FROM ins_fl f WHERE f.activo=1 AND ${sc.sql}`,sc.params).map(r=>String(r.id)));
    return all.filter(r=>ok.has(String(r['ID Proyecto']))).map(r=>({'ID Proyecto':r['ID Proyecto'],Proyecto:r.Proyecto}));
  }
  function navegacionUnited(userId,query,candidateDb){
    const db=dbOr(candidateDb),uid=Number(userId);
    const all=united(query,db);
    if(esDirectorGeneral(uid,db))return all.map(r=>({proyecto_united:r.proyecto_united}));
    const op=root.ManttoLabOperationService;if(!op||typeof op.activeInServicePortfolio!=='function')return[];
    const names=new Set(op.activeInServicePortfolio(uid,db).map(r=>String(r.proyecto||'').trim().toUpperCase()).filter(Boolean));
    return all.filter(r=>names.has(String(r.proyecto_united||'').trim().toUpperCase())).map(r=>({proyecto_united:r.proyecto_united}));
  }
  return Object.freeze({fotografias,navegacionCorellian,navegacionUnited,SLOTS});
});
