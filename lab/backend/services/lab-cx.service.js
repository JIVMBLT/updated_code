// [Claude | 2026-10-02 | CLAUDE-MG | LAB DGB - CUSTOMER EXPERIENCE V001]
// Customer Experience: dashboard combinado de las 2 areas (Venta/Instalaciones
// y Mantenimiento), cada una con sus propios filtros en cascada. Datos de
// origen: migracion 014 (CUSTOMER_EX_2026_PRO.xlsx + ENCUESTA_BLT...xlsx,
// con (PRUEBA) en nombres y PII de contacto ficticia).
(function initManttoLabCxService(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.ManttoLabCxService=api;
})(typeof globalThis!=='undefined'?globalThis:this,function createManttoLabCxService(root){
  'use strict';

  function dbOr(candidateDb){ return candidateDb||root.ManttoLabDB; }
  function text(v,max=300){ const s=v==null?'':String(v).trim(); return s?s.slice(0,max):null; }
  function num(v){ const n=Number(v); return Number.isFinite(n)?n:null; }
  function round1(v){ return v==null?null:Math.round(v*10)/10; }
  function avg(rows,field){
    const vals=rows.map(r=>num(r[field])).filter(v=>v!==null);
    if(!vals.length) return null;
    return round1(vals.reduce((a,b)=>a+b,0)/vals.length);
  }
  function distinctSorted(rows,field){
    return [...new Set(rows.map(r=>text(r[field])).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
  }
  function matches(filterVal,rowVal){
    if(!filterVal) return true;
    return text(rowVal)===filterVal;
  }

  // ---------------------------------------------------------------------
  // Opciones de filtro: catalogos por area, para construir los selectores
  // en cascada (Area -> sub-filtros propios de esa area).
  // ---------------------------------------------------------------------
  function opciones(userId,candidateDb){
    const db=dbOr(candidateDb);
    const vi=db.query('SELECT tipo_encuesta,vendedor,supervisor FROM cx_venta_instalacion_encuestas');
    const mt=db.query('SELECT estado,z_general,z_operativa,z_administrativa,superintendente,supervisor_operativo,categoria,prioridad FROM cx_mantenimiento_encuestas');
    return {
      venta_instalacion:{
        tipos_encuesta:distinctSorted(vi,'tipo_encuesta'),
        vendedores:distinctSorted(vi,'vendedor'),
        supervisores:distinctSorted(vi,'supervisor')
      },
      mantenimiento:{
        estados:distinctSorted(mt,'estado'),
        zonas_generales:distinctSorted(mt,'z_general'),
        zonas_operativas:distinctSorted(mt,'z_operativa'),
        zonas_administrativas:distinctSorted(mt,'z_administrativa'),
        superintendentes:distinctSorted(mt,'superintendente'),
        supervisores_operativos:distinctSorted(mt,'supervisor_operativo'),
        categorias:distinctSorted(mt,'categoria'),
        prioridades:distinctSorted(mt,'prioridad')
      }
    };
  }

  function npsClasificacion(rows,field){
    const counts={PROMOTOR:0,PASIVO:0,DETRACTOR:0};
    rows.forEach(r=>{
      const v=text(r[field]);
      const n=num(r[field]);
      let cls=null;
      if(v&&/PROMOTOR/i.test(v))cls='PROMOTOR';
      else if(v&&/PASIVO/i.test(v))cls='PASIVO';
      else if(v&&/DETRACTOR/i.test(v))cls='DETRACTOR';
      else if(n!=null){ cls=n>=9?'PROMOTOR':(n>=7?'PASIVO':'DETRACTOR'); }
      if(cls)counts[cls]++;
    });
    return counts;
  }

  // ---------------------------------------------------------------------
  // Venta / Instalaciones: filtra por tipo_encuesta, vendedor, supervisor.
  // ---------------------------------------------------------------------
  function ventaInstalacionDashboard(filtros,db){
    let rows=db.query('SELECT * FROM cx_venta_instalacion_encuestas');
    rows=rows.filter(r=>matches(filtros.tipo_encuesta,r.tipo_encuesta)&&matches(filtros.vendedor,r.vendedor)&&matches(filtros.supervisor,r.supervisor));
    const porTipo=[...new Set(rows.map(r=>text(r.tipo_encuesta)).filter(Boolean))].map(tipo=>{
      const subset=rows.filter(r=>text(r.tipo_encuesta)===tipo);
      return {tipo_encuesta:tipo,total:subset.length,nps_promedio:avg(subset,'nps')};
    }).sort((a,b)=>b.total-a.total);
    const porVendedor=[...new Set(rows.map(r=>text(r.vendedor)).filter(Boolean))].map(v=>{
      const subset=rows.filter(r=>text(r.vendedor)===v);
      return {vendedor:v,total:subset.length,nps_promedio:avg(subset,'nps')};
    }).sort((a,b)=>b.total-a.total);
    return{
      total:rows.length,
      nps_promedio:avg(rows,'nps'),
      clasificacion:npsClasificacion(rows,'calificacion_nps'),
      por_tipo_encuesta:porTipo,
      por_vendedor:porVendedor.slice(0,15)
    };
  }

  // ---------------------------------------------------------------------
  // Mantenimiento: filtra por estado, zona (cualquiera de las 3), super-
  // intendente, supervisor operativo, categoria, prioridad.
  // ---------------------------------------------------------------------
  function mantenimientoDashboard(filtros,db){
    let rows=db.query('SELECT * FROM cx_mantenimiento_encuestas');
    rows=rows.filter(r=>
      matches(filtros.estado,r.estado)&&
      matches(filtros.z_general,r.z_general)&&
      matches(filtros.z_operativa,r.z_operativa)&&
      matches(filtros.z_administrativa,r.z_administrativa)&&
      matches(filtros.superintendente,r.superintendente)&&
      matches(filtros.supervisor_operativo,r.supervisor_operativo)&&
      matches(filtros.categoria,r.categoria)&&
      matches(filtros.prioridad,r.prioridad)
    );
    const csat={
      mantenimiento:avg(rows,'csat_mantenimiento'),
      atencion_fallas:avg(rows,'csat_atencion_de_fallas'),
      seguimiento_supervisor:avg(rows,'csat_seguimiento_de_supervisor'),
      cotizaciones:avg(rows,'csat_cotizaciones_suministros_y_reparaci'),
      facturacion:avg(rows,'csat_facturacion'),
      atencion_cliente:avg(rows,'csat_atencion_al_cliente'),
      general:avg(rows,'csat_general')
    };
    const porEstado=[...new Set(rows.map(r=>text(r.estado)).filter(Boolean))].map(e=>{
      const subset=rows.filter(r=>text(r.estado)===e);
      return {estado:e,total:subset.length,nps_promedio:avg(subset,'indice_de_recomendacion')};
    }).sort((a,b)=>b.total-a.total);
    const porSuperintendente=[...new Set(rows.map(r=>text(r.superintendente)).filter(Boolean))].map(s=>{
      const subset=rows.filter(r=>text(r.superintendente)===s);
      return {superintendente:s,total:subset.length,nps_promedio:avg(subset,'indice_de_recomendacion')};
    }).sort((a,b)=>b.total-a.total);
    return{
      total:rows.length,
      nps_promedio:avg(rows,'indice_de_recomendacion'),
      clasificacion:npsClasificacion(rows,'tipo_de_cliente'),
      indice_confianza:avg(rows,'indice_de_confianza'),
      percepcion_valor:avg(rows,'percepcion_de_valor'),
      indice_riesgo_churn:avg(rows,'indice_de_riesgo_churn'),
      csat,
      por_estado:porEstado.slice(0,15),
      por_superintendente:porSuperintendente.slice(0,15)
    };
  }

  function dashboard(userId,query,candidateDb){
    const db=dbOr(candidateDb);
    const q=query||{};
    const area=text(q.area)||'ambas';
    const filtrosVi={tipo_encuesta:text(q.tipo_encuesta),vendedor:text(q.vendedor),supervisor:text(q.supervisor)};
    const filtrosMt={estado:text(q.estado),z_general:text(q.z_general),z_operativa:text(q.z_operativa),z_administrativa:text(q.z_administrativa),superintendente:text(q.superintendente),supervisor_operativo:text(q.supervisor_operativo),categoria:text(q.categoria),prioridad:text(q.prioridad)};
    const result={area,criterio:{...filtrosVi,...filtrosMt}};
    if(area==='ambas'||area==='venta_instalacion') result.venta_instalacion=ventaInstalacionDashboard(filtrosVi,db);
    if(area==='ambas'||area==='mantenimiento') result.mantenimiento=mantenimientoDashboard(filtrosMt,db);
    return result;
  }

  return Object.freeze({opciones,dashboard});
});
