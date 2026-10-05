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

  // ---------------------------------------------------------------------
  // Detalle: lista de encuestas individuales (sin agregar), para la
  // pestaña de Encuestas (una fila por encuesta, con todos sus campos).
  // Mismos filtros que el dashboard de cada area.
  // ---------------------------------------------------------------------
  function listarVentaInstalacion(userId,query,candidateDb){
    const db=dbOr(candidateDb);
    const q=query||{};
    const filtros={tipo_encuesta:text(q.tipo_encuesta),vendedor:text(q.vendedor),supervisor:text(q.supervisor)};
    let rows=db.query('SELECT * FROM cx_venta_instalacion_encuestas ORDER BY id DESC');
    rows=rows.filter(r=>matches(filtros.tipo_encuesta,r.tipo_encuesta)&&matches(filtros.vendedor,r.vendedor)&&matches(filtros.supervisor,r.supervisor));
    return{total:rows.length,encuestas:rows};
  }
  function mantenimientoFiltrosFromQuery(q){
    return{estado:text(q.estado),z_general:text(q.z_general),z_operativa:text(q.z_operativa),z_administrativa:text(q.z_administrativa),superintendente:text(q.superintendente),supervisor_operativo:text(q.supervisor_operativo),categoria:text(q.categoria),prioridad:text(q.prioridad)};
  }
  function mantenimientoRowsFiltradas(filtros,db){
    let rows=db.query('SELECT * FROM cx_mantenimiento_encuestas ORDER BY id DESC');
    return rows.filter(r=>
      matches(filtros.estado,r.estado)&&matches(filtros.z_general,r.z_general)&&matches(filtros.z_operativa,r.z_operativa)&&
      matches(filtros.z_administrativa,r.z_administrativa)&&matches(filtros.superintendente,r.superintendente)&&
      matches(filtros.supervisor_operativo,r.supervisor_operativo)&&matches(filtros.categoria,r.categoria)&&matches(filtros.prioridad,r.prioridad)
    );
  }
  function listarMantenimiento(userId,query,candidateDb){
    const db=dbOr(candidateDb);
    const rows=mantenimientoRowsFiltradas(mantenimientoFiltrosFromQuery(query||{}),db);
    return{total:rows.length,encuestas:rows};
  }

  // ---------------------------------------------------------------------
  // Preguntas cerradas (Respuestas de formulario 1, Mantenimiento): un
  // conjunto fijo de valores posibles por pregunta, confirmado contra los
  // datos reales de origen (no un supuesto): NPS crudo, los 6 CSAT, los 6
  // checklists de "oportunidad de mejora" (seleccion multiple, separados
  // por coma en la celda) y las 3 preguntas de confianza/valor/riesgo.
  // ---------------------------------------------------------------------
  const PREGUNTAS_CERRADAS = [
    {campo:'1_en_una_escala_del_1_al_10_que_tan_prob',etiqueta:'NPS — ¿Qué tan probable es que recomiendes los servicios de BLT?',multi:false},
    {campo:'csat_mantenimiento',etiqueta:'CSAT — Mantenimiento preventivo',multi:false},
    {campo:'csat_atencion_de_fallas',etiqueta:'CSAT — Atención de fallas',multi:false},
    {campo:'csat_seguimiento_de_supervisor',etiqueta:'CSAT — Seguimiento de supervisor',multi:false},
    {campo:'csat_cotizaciones_suministros_y_reparaci',etiqueta:'CSAT — Cotizaciones, suministros y reparaciones',multi:false},
    {campo:'csat_facturacion',etiqueta:'CSAT — Facturación',multi:false},
    {campo:'csat_atencion_al_cliente',etiqueta:'CSAT — Atención al cliente',multi:false},
    {campo:'3_1_mantenimiento_preventivo_oportunidad',etiqueta:'3.1 Mantenimiento preventivo — Oportunidad de mejora',multi:true},
    {campo:'3_2_atencion_de_fallas_oportunidad_de_me',etiqueta:'3.2 Atención de fallas — Oportunidad de mejora',multi:true},
    {campo:'3_3_seguimiento_de_supervisor_oportunida',etiqueta:'3.3 Seguimiento de supervisor — Oportunidad de mejora',multi:true},
    {campo:'3_4_cotizaciones_suministros_y_reparacio',etiqueta:'3.4 Cotizaciones, suministros y reparaciones — Oportunidad de mejora',multi:true},
    {campo:'3_5_facturacion_oportunidad_de_mejora',etiqueta:'3.5 Facturación — Oportunidad de mejora',multi:true},
    {campo:'3_6_atencion_al_cliente_oportunidad_de_m',etiqueta:'3.6 Atención al cliente — Oportunidad de mejora',multi:true},
    {campo:'4_tengo_confianza_en_blt_para_la_operaci',etiqueta:'4. Tengo confianza en BLT para la operación de los equipos',multi:false},
    {campo:'5_el_servicio_recibido_justifica_el_cost',etiqueta:'5. El servicio recibido justifica el costo del mantenimiento',multi:false},
    {campo:'6_pensando_en_el_futuro_que_tan_probable',etiqueta:'6. ¿Qué tan probable sería considerar un cambio de proveedor?',multi:false}
  ];

  function opcionesMultiSelect(valor){
    return text(valor,2000)?String(valor).split(',').map(s=>s.trim()).filter(Boolean):[];
  }
  function analisisPreguntaCerrada(def,rows){
    const conteo={};
    let totalRespuestas=0;
    rows.forEach(r=>{
      const crudo=r[def.campo];
      if(crudo==null||String(crudo).trim()==='')return;
      totalRespuestas++;
      const valores=def.multi?opcionesMultiSelect(crudo):[text(crudo)];
      valores.forEach(v=>{ if(v)conteo[v]=(conteo[v]||0)+1; });
    });
    const opciones=Object.entries(conteo)
      .map(([valor,cantidad])=>({valor,cantidad,porcentaje:totalRespuestas?Math.round(100*cantidad/totalRespuestas):0}))
      .sort((a,b)=>b.cantidad-a.cantidad);
    return{campo:def.campo,etiqueta:def.etiqueta,multi:def.multi,total_respuestas:totalRespuestas,opciones};
  }
  function analisisPreguntasCerradas(userId,query,candidateDb){
    const db=dbOr(candidateDb);
    const filtros=mantenimientoFiltrosFromQuery(query||{});
    const rows=mantenimientoRowsFiltradas(filtros,db);
    return{total_encuestas:rows.length,preguntas:PREGUNTAS_CERRADAS.map(def=>analisisPreguntaCerrada(def,rows))};
  }
  function detallePreguntaCerrada(userId,query,candidateDb){
    const db=dbOr(candidateDb);
    const q=query||{};
    const def=PREGUNTAS_CERRADAS.find(p=>p.campo===text(q.campo));
    if(!def) throw Object.assign(new Error('Pregunta cerrada no reconocida.'),{status:400,code:'LAB_CX_CAMPO_INVALIDO'});
    const valor=text(q.valor);
    if(!valor) throw Object.assign(new Error('Falta el valor a buscar.'),{status:400,code:'LAB_CX_VALOR_REQUERIDO'});
    const filtros=mantenimientoFiltrosFromQuery(q);
    let rows=mantenimientoRowsFiltradas(filtros,db);
    rows=rows.filter(r=>{
      const crudo=r[def.campo];
      if(crudo==null)return false;
      return def.multi?opcionesMultiSelect(crudo).includes(valor):text(crudo)===valor;
    });
    return{campo:def.campo,etiqueta:def.etiqueta,valor,total:rows.length,encuestas:rows};
  }

  // ---------------------------------------------------------------------
  // Campos de texto abierto (narrativos, llenados por el encuestador):
  // analisis de palabras/temas recurrentes por frecuencia, con el detalle
  // de que encuestas mencionan cada una. Deliberadamente simple y
  // transparente (frecuencia de palabras, sin inferencia de IA): cada
  // conteo es exactamente verificable contra el texto real.
  // ---------------------------------------------------------------------
  const CAMPOS_TEMA = [
    {campo:'aspectos_destacables',etiqueta:'Aspectos destacables'},
    {campo:'areas_de_oportunidad',etiqueta:'Áreas de oportunidad'},
    {campo:'temas_operativos',etiqueta:'Temas Operativos'},
    {campo:'temas_administrativos',etiqueta:'Temas Administrativos'},
    {campo:'valor_agregado',etiqueta:'Valor Agregado'}
  ];
  const STOPWORDS = new Set(['para','esto','esta','este','estos','estas','como','pero','mas','más','con','los','las','del','por','que','una','uno','unos','unas','sus','sin','son','fue','ser','hay','muy','poco','mucho','cuando','donde','tiene','tienen','tener','hace','hacen','entre','desde','sobre','cada','todo','toda','todos','todas','otro','otra','otros','otras','algo','algún','alguna','algunos','algunas','nos','les','etc','tiempo'].map(w=>w.normalize('NFC')));
  function normalizarPalabra(w){
    return w.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
  }
  function analisisTemaCampo(def,rows,topN){
    const conteo={}; // palabra normalizada -> {original, cantidadComentarios:Set(ids)}
    let totalComentarios=0;
    rows.forEach(r=>{
      const texto=r[def.campo];
      if(texto==null||String(texto).trim()==='')return;
      totalComentarios++;
      const vistoEnEsteComentario=new Set();
      String(texto).split(/[^a-zA-ZÁÉÍÓÚÑáéíóúñ0-9]+/).forEach(palabraOriginal=>{
        const norm=normalizarPalabra(palabraOriginal);
        if(norm.length<5||STOPWORDS.has(norm)||/^\d+$/.test(norm))return;
        if(vistoEnEsteComentario.has(norm))return; // cuenta 1 vez por encuesta, no por repeticion dentro del mismo comentario
        vistoEnEsteComentario.add(norm);
        if(!conteo[norm])conteo[norm]={original:palabraOriginal.toLowerCase(),ids:new Set()};
        conteo[norm].ids.add(r.id);
      });
    });
    const palabras=Object.values(conteo)
      .map(x=>({palabra:x.original,menciones:x.ids.size,porcentaje:totalComentarios?Math.round(100*x.ids.size/totalComentarios):0,ids:[...x.ids]}))
      .filter(x=>x.menciones>=2) // ignora palabras que solo aparecen en 1 encuesta (ruido)
      .sort((a,b)=>b.menciones-a.menciones)
      .slice(0,topN||15)
      .map(({ids,...rest})=>rest); // no mandamos los ids en el listado general, solo en el drill-down
    return{campo:def.campo,etiqueta:def.etiqueta,total_comentarios:totalComentarios,palabras};
  }
  function analisisTemas(userId,query,candidateDb){
    const db=dbOr(candidateDb);
    const filtros=mantenimientoFiltrosFromQuery(query||{});
    const rows=mantenimientoRowsFiltradas(filtros,db);
    return{total_encuestas:rows.length,campos:CAMPOS_TEMA.map(def=>analisisTemaCampo(def,rows,15))};
  }
  function detalleTema(userId,query,candidateDb){
    const db=dbOr(candidateDb);
    const q=query||{};
    const def=CAMPOS_TEMA.find(c=>c.campo===text(q.campo));
    if(!def) throw Object.assign(new Error('Campo de tema no reconocido.'),{status:400,code:'LAB_CX_CAMPO_INVALIDO'});
    const palabra=normalizarPalabra(text(q.palabra)||'');
    if(!palabra) throw Object.assign(new Error('Falta la palabra a buscar.'),{status:400,code:'LAB_CX_VALOR_REQUERIDO'});
    const filtros=mantenimientoFiltrosFromQuery(q);
    let rows=mantenimientoRowsFiltradas(filtros,db);
    rows=rows.filter(r=>{
      const texto=r[def.campo];
      if(texto==null)return false;
      return String(texto).split(/[^a-zA-ZÁÉÍÓÚÑáéíóúñ0-9]+/).some(w=>normalizarPalabra(w)===palabra);
    });
    return{campo:def.campo,etiqueta:def.etiqueta,palabra:text(q.palabra),total:rows.length,encuestas:rows};
  }

  return Object.freeze({opciones,dashboard,listarVentaInstalacion,listarMantenimiento,analisisPreguntasCerradas,detallePreguntaCerrada,analisisTemas,detalleTema});
});
