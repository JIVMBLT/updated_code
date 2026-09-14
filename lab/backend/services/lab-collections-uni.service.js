(function initManttoLabCollectionsUniService(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.ManttoLabCollectionsUniService=api;
})(typeof globalThis!=='undefined'?globalThis:this,function createManttoLabCollectionsUniService(root){
  'use strict';

  function dbOr(candidate){const db=candidate||root?.ManttoLabDB;if(!db||typeof db.query!=='function')throw new Error('MANTTO_LAB_DB_REQUIRED');return db;}
  function httpError(status,message,code){const e=new Error(message);e.status=status;e.statusCode=status;e.code=code||'LAB_COLLECTIONS_UNI_ERROR';return e;}
  function id(value,field='id'){const n=Number(value);if(!Number.isInteger(n)||n<=0)throw httpError(400,`${field} debe ser un entero positivo.`,'LAB_INVALID_ID');return n;}
  function text(value){return String(value??'').trim();}
  function pageOf(query,defaultSize=30,max=100){const page=Math.max(1,parseInt(query?.page??query?.pagina??'1',10)||1);const size=Math.min(max,Math.max(1,parseInt(query?.page_size??query?.tamano_pagina??defaultSize,10)||defaultSize));return{page,size,offset:(page-1)*size};}
  function scopeFor(userId,candidateDb){const svc=root?.ManttoLabScopeService;if(!svc)throw new Error('MANTTO_LAB_SCOPE_SERVICE_REQUIRED');return svc.resolveUnited(Number(userId),dbOr(candidateDb));}
  function canonicalProjectRows(userId,candidateDb){
    const db=dbOr(candidateDb),scope=scopeFor(userId,db);
    if(scope.llave_maestra){return db.query(`SELECT DISTINCT TRIM(proyecto) AS proyecto,id_proyecto_cobranza,zona_id,zona_operativa FROM portafolio WHERE estado_registro=1 AND TRIM(COALESCE(proyecto,''))<>''`);}
    const ids=(scope.zona_ids||[]).map(Number).filter(n=>Number.isInteger(n)&&n>0);
    if(!ids.length)return[];
    return db.query(`SELECT DISTINCT TRIM(proyecto) AS proyecto,id_proyecto_cobranza,zona_id,zona_operativa FROM portafolio WHERE estado_registro=1 AND zona_id IN (${ids.map(()=>'?').join(',')}) AND TRIM(COALESCE(proyecto,''))<>''`,ids);
  }
  function accessEvidence(userId,candidateDb){
    const rows=canonicalProjectRows(userId,candidateDb);const projects=new Set(rows.map(r=>text(r.proyecto).toUpperCase()).filter(Boolean));const collectionIds=new Set(rows.map(r=>Number(r.id_proyecto_cobranza)).filter(n=>Number.isInteger(n)&&n>0));return{rows,projects,collectionIds};
  }
  function allowedRecord(record,evidence){
    if(!record)return false;const pid=Number(record.id_proyecto_cobranza);if(Number.isInteger(pid)&&pid>0&&evidence.collectionIds.has(pid))return true;const project=text(record.proyecto).toUpperCase();return Boolean(project&&evidence.projects.has(project));
  }
  function filtered(table,userId,query,candidateDb){
    const db=dbOr(candidateDb),evidence=accessEvidence(userId,db),q=text(query?.search??query?.buscar).toUpperCase();let rows=db.query(`SELECT * FROM ${table}`);rows=rows.filter(r=>allowedRecord(r,evidence));if(q)rows=rows.filter(r=>Object.values(r).some(v=>text(v).toUpperCase().includes(q)));return rows;
  }
  function paginate(rows,query){const p=pageOf(query);const total=rows.length;return{rows:rows.slice(p.offset,p.offset+p.size),pagination:{pagina:p.page,tamano_pagina:p.size,total_registros:total,total_paginas:total?Math.ceil(total/p.size):0}};}
  function listCredit(userId,query,candidateDb){const rows=filtered('gestion_credito',userId,query,candidateDb).sort((a,b)=>Number(b.id_gc)-Number(a.id_gc));const p=paginate(rows,query);const resumen={proyectos:rows.length,adeudo:rows.reduce((s,r)=>s+Number(r.adeudo||0),0),credito_disponible_venta:rows.reduce((s,r)=>s+Number(r.credito_disponible_venta||0),0),monto_mp_2026:rows.reduce((s,r)=>s+Number(r.monto_mp_2026||0),0)};return{ok:true,source:'lab-sqlite',data:p.rows,resumen,paginacion:p.pagination,alcance:scopeFor(userId,candidateDb)};}
  function creditDetail(userId,rawId,candidateDb){const db=dbOr(candidateDb),rid=id(rawId,'id_gc'),row=db.query('SELECT * FROM gestion_credito WHERE id_gc=?',[rid])[0];if(!row||!allowedRecord(row,accessEvidence(userId,db)))throw httpError(404,'Registro de gestión de crédito no encontrado o fuera de alcance.','LAB_COLLECTIONS_UNI_NOT_FOUND');const mp=db.query('SELECT * FROM detalle_mp_2026 WHERE (id_proyecto_cobranza=? AND ? IS NOT NULL) OR UPPER(TRIM(proyecto))=UPPER(TRIM(?)) ORDER BY id_dmp',[row.id_proyecto_cobranza,row.id_proyecto_cobranza,row.proyecto]);return{ok:true,source:'lab-sqlite',data:{...row,mantenimiento_preventivo:mp}};}
  function listPreventive(userId,query,candidateDb){const rows=filtered('detalle_mp_2026',userId,query,candidateDb).sort((a,b)=>Number(b.id_dmp)-Number(a.id_dmp));const p=paginate(rows,query);return{ok:true,source:'lab-sqlite',data:p.rows,paginacion:p.pagination,alcance:scopeFor(userId,candidateDb)};}
  function preventiveDetail(userId,rawId,candidateDb){const db=dbOr(candidateDb),rid=id(rawId,'id_dmp'),row=db.query('SELECT * FROM detalle_mp_2026 WHERE id_dmp=?',[rid])[0];if(!row||!allowedRecord(row,accessEvidence(userId,db)))throw httpError(404,'Detalle de mantenimiento preventivo no encontrado o fuera de alcance.','LAB_COLLECTIONS_UNI_NOT_FOUND');return{ok:true,source:'lab-sqlite',data:row};}
  function listAdditionalSales(userId,query,candidateDb){
    const source=filtered('gestion_credito',userId,query,candidateDb).filter(r=>Number(r.facturas_va||0)!==0||Number(r.monto_va||0)!==0||Number(r.credito_para_va||0)!==0||Number(r.credito_disponible_venta||0)!==0);
    const rows=source.map(r=>({id:r.id_gc,id_gc:r.id_gc,idns:r.idns,proyecto:r.proyecto,id_proyecto_cobranza:r.id_proyecto_cobranza,cliente:r.cliente,estado:r.estado,z_oper:r.z_oper,z_adm:r.z_adm,facturas_va:r.facturas_va,monto_va:r.monto_va,credito_para_va:r.credito_para_va,credito_disponible_venta:r.credito_disponible_venta,anticipo:r.anticipo,nivel_riesgo_credito:r.nivel_riesgo_credito})).sort((a,b)=>Number(b.id_gc)-Number(a.id_gc));const p=paginate(rows,query);return{ok:true,source:'lab-sqlite',data:p.rows,paginacion:p.pagination,resumen:{registros:rows.length,monto_va:rows.reduce((s,r)=>s+Number(r.monto_va||0),0)},alcance:scopeFor(userId,candidateDb)};
  }
  function additionalSaleDetail(userId,rawId,candidateDb){const detail=creditDetail(userId,rawId,candidateDb);const r=detail.data;return{ok:true,source:'lab-sqlite',data:{id:r.id_gc,id_gc:r.id_gc,idns:r.idns,proyecto:r.proyecto,id_proyecto_cobranza:r.id_proyecto_cobranza,cliente:r.cliente,estado:r.estado,z_oper:r.z_oper,z_adm:r.z_adm,facturas_va:r.facturas_va,monto_va:r.monto_va,credito_para_va:r.credito_para_va,credito_disponible_venta:r.credito_disponible_venta,anticipo:r.anticipo,nivel_riesgo_credito:r.nivel_riesgo_credito,mantenimiento_preventivo:r.mantenimiento_preventivo}};}

  return Object.freeze({scopeFor,canonicalProjectRows,listCredit,creditDetail,listPreventive,preventiveDetail,listAdditionalSales,additionalSaleDetail});
});
