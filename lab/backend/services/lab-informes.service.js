// [Claude | 2026-09-17 | CLAUDE-MG | LAB DGB - TRASLADO INFORMES V001]
// Traslado del modulo Informes (Operacion > Informes) de produccion
// (ziSirrush/GestorMantto) al laboratorio JIVMBLT/updated_code.
// Misma logica y mismas formulas que backend/src/modules/informes en
// produccion (ver informes_spec.md), pero sin SQL: opera sobre los arreglos
// que ya entrega ManttoLabOperationService (portafolio y tickets ya
// reducidos al alcance del usuario), igual que lab-criticals.service.js.
(function initManttoLabInformesService(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.ManttoLabInformesService=api;
})(typeof globalThis!=='undefined'?globalThis:this,function createManttoLabInformesService(root){
  'use strict';

  function dbOr(db){ return db||root.ManttoLabDB; }
  function txt(v){ return String(v==null?'':v).trim(); }
  function upper(v){ return txt(v).toUpperCase(); }
  function day(v){ const m=txt(v).match(/^(\d{4}-\d{2}-\d{2})/); return m?m[1]:null; }
  function dateVal(v){ const d=day(v); if(!d) return null; const x=new Date(d+'T12:00:00'); return Number.isNaN(x.getTime())?null:x; }
  function now(){ return new Date(); }
  function positive(v,fallback,min,max){ const n=parseInt(v,10); return Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback; }

  // Misma regla de hora habil/inhabil que produccion (ver informes_spec.md
  // seccion 2): fecha_reporte no siempre trae la hora real; la hora de
  // atencion vive en el texto h_reporte ("8:14 AM"). Inhabil = 8pm-8am o
  // fin de semana.
  function parseHour(hStr){
    const s=upper(hStr);
    const m=s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
    if(!m) return null;
    let hh=parseInt(m[1],10);
    const ampm=m[3];
    if(ampm==='PM'&&hh!==12) hh+=12;
    if(ampm==='AM'&&hh===12) hh=0;
    return hh;
  }
  function esInhabil(ticket){
    const d=dateVal(ticket.fecha_reporte);
    const hh=parseHour(ticket.h_reporte);
    if(!d||hh===null) return null;
    const weekday=d.getDay(); // 0=domingo,6=sabado
    if(weekday===0||weekday===6) return true;
    return hh>=20||hh<8;
  }

  function blt(tickets){ return (tickets||[]).filter(t=>upper(t.responsabilidad)==='BLT'); }
  function cliente(tickets){ return (tickets||[]).filter(t=>upper(t.responsabilidad)==='CLIENTE'); }
  function esAtrapado(t){
    const blob=upper([t.descripcion,t.causa,t.accion_en_cierre].filter(Boolean).join(' '));
    return /ATRAPAD|ENCERRAD|RESCATE/.test(blob);
  }
  function avg(nums){
    const vals=(nums||[]).map(Number).filter(n=>Number.isFinite(n));
    if(!vals.length) return null;
    return Math.round((vals.reduce((s,n)=>s+n,0)/vals.length)*10)/10;
  }
  function topCounts(items,key,limit){
    const map=new Map();
    (items||[]).forEach(item=>{
      const value=txt(item[key]);
      if(!value) return;
      map.set(value,(map.get(value)||0)+1);
    });
    return [...map.entries()]
      .map(([causa,total])=>({causa,total}))
      .sort((a,b)=>b.total-a.total)
      .slice(0,limit||5);
  }
  function currentYearDays(){
    const n=now();
    const start=new Date(n.getFullYear(),0,1,12);
    return Math.max(1,Math.floor((n.getTime()-start.getTime())/86400000)+1);
  }

  // Filtros del usuario: multi-seleccion, independientes entre si (ver
  // informes_spec.md seccion 3). Vacio = "todos" dentro del alcance del
  // usuario. Ninguno depende de los demas.
  function multiParam(raw){
    if(raw===undefined||raw===null) return [];
    const arr=Array.isArray(raw)?raw:[raw];
    return [...new Set(arr.map(v=>txt(v)).filter(Boolean).map(upper))];
  }
  function filtersFromQuery(query){
    const q=query||{};
    return {
      superintendente:multiParam(q.superintendente),
      supervisor:multiParam(q.supervisor),
      estado:multiParam(q.estado),
      zona:multiParam(q.zona),
      proyecto:multiParam(q.proyecto),
      equipo:multiParam(q.equipo)
    };
  }
  function matchesFilter(values,rowValue){
    if(!values.length) return true;
    return values.includes(upper(rowValue));
  }
  function rowZona(row){ return row.zona_oficial||row.zona_operativa; }
  function filteredPortfolio(userId,filters,db,includeInactive){
    const svc=root.ManttoLabOperationService;
    const base=includeInactive
      ? svc.visiblePortfolio(userId,db,{includeInactive:true,canonicalZone:true})
      : svc.activeInServicePortfolio(userId,db);
    return base.filter(row =>
      matchesFilter(filters.superintendente,row.superintendente) &&
      matchesFilter(filters.supervisor,row.supervisor_zona) &&
      matchesFilter(filters.estado,row.estado) &&
      matchesFilter(filters.zona,rowZona(row)) &&
      matchesFilter(filters.proyecto,row.proyecto) &&
      matchesFilter(filters.equipo,row.numero_equipo)
    );
  }

  // [CLAUDE | 2026-09-19 | fix] Extraido de generarInforme para reutilizarlo
  // en detalleTickets (drill-down): mismo alcance de portafolio (activo,
  // filtros de usuario) + mismo rango de fechas que produce cada estadistica
  // de "Actividad del periodo". Nada de logica nueva, solo separado de la
  // funcion que antes lo calculaba en linea.
  function ticketsEnAlcance(userId,filters,fechaInicio,fechaFin,db){
    const portfolioActivo=filteredPortfolio(userId,filters,db,false);
    const codesActivos=new Set(portfolioActivo.map(r=>txt(r.numero_equipo)));
    const allTickets=root.ManttoLabOperationService.visibleTickets(userId,db,{from:fechaInicio,to:fechaFin});
    const ticketsAlcance=allTickets.filter(t=>codesActivos.has(txt(t.codigo_equipo||t.equipo)));
    return {portfolioActivo,codesActivos,ticketsAlcance};
  }

  // ---------------------------------------------------------------------
  // Opciones de filtro
  // ---------------------------------------------------------------------
  function getOpciones(userId,db){
    const rows=root.ManttoLabOperationService.activeInServicePortfolio(Number(userId),dbOr(db));
    const uniq=key=>[...new Set(rows.map(r=>txt(r[key])).filter(Boolean))].sort();
    return {
      ok:true,
      source:'lab-sqlite',
      opciones:{
        superintendentes:uniq('superintendente'),
        supervisores:uniq('supervisor_zona'),
        estados:uniq('estado'),
        zonas:[...new Set(rows.map(r=>txt(rowZona(r))).filter(Boolean))].sort(),
        proyectos:uniq('proyecto'),
        equipos:uniq('numero_equipo')
      }
    };
  }

  // ---------------------------------------------------------------------
  // Informe principal
  // ---------------------------------------------------------------------
  function generarInforme(userId,query,candidateDb){
    const db=dbOr(candidateDb);
    const q=query||{};
    const uid=Number(userId);
    const filters=filtersFromQuery(q);

    const defaultFin=now().toISOString().slice(0,10);
    const seisMesesAtras=new Date(now()); seisMesesAtras.setMonth(seisMesesAtras.getMonth()-6);
    const fechaInicio=/^\d{4}-\d{2}-\d{2}$/.test(txt(q.fecha_inicio))?txt(q.fecha_inicio):seisMesesAtras.toISOString().slice(0,10);
    const fechaFin=/^\d{4}-\d{2}-\d{2}$/.test(txt(q.fecha_fin))?txt(q.fecha_fin):defaultFin;
    const ventana=(upper(q.mtbc_ventana)==='365'||upper(q.mtbc_ventana)==='U365D'||upper(q.mtbc_ventana)==='U365')?'365':'anio';

    const portfolioTotal=filteredPortfolio(uid,filters,db,true);
    const {portfolioActivo,codesActivos,ticketsAlcance}=ticketsEnAlcance(uid,filters,fechaInicio,fechaFin,db);

    const resumenAlcance={
      equipos_activos:portfolioActivo.length,
      n_proyectos:new Set(portfolioActivo.map(r=>txt(r.proyecto)).filter(Boolean)).size,
      n_supervisores:new Set(portfolioActivo.map(r=>txt(r.supervisor_zona)).filter(Boolean)).size,
      n_zonas:new Set(portfolioActivo.map(r=>txt(rowZona(r))).filter(Boolean)).size,
      n_estados:new Set(portfolioActivo.map(r=>txt(r.estado)).filter(Boolean)).size
    };

    const abiertos=ticketsAlcance.filter(t=>upper(t.estado_ticket).includes('ABIER')).length;
    const cerrados=ticketsAlcance.filter(t=>upper(t.estado_ticket).includes('CERR')).length;
    const bltTickets=blt(ticketsAlcance);
    const clienteTickets=cliente(ticketsAlcance);

    const habiles=ticketsAlcance.filter(t=>esInhabil(t)===false);
    const inhabiles=ticketsAlcance.filter(t=>esInhabil(t)===true);
    const cerradosTickets=ticketsAlcance.filter(t=>upper(t.estado_ticket).includes('CERR'));

    const tickets={
      total:ticketsAlcance.length,
      abiertos,
      cerrados,
      en_curso:Math.max(0,ticketsAlcance.length-abiertos-cerrados),
      responsabilidad_blt:bltTickets.length,
      responsabilidad_cliente:clienteTickets.length,
      causas_blt:topCounts(bltTickets,'causa_falla',5),
      causas_cliente:topCounts(clienteTickets,'causa_falla',5),
      tipo_equipo:topCounts(ticketsAlcance,'tipo_equipo',8),
      tiempo_promedio_llegada:avg(ticketsAlcance.map(t=>t.tiempo_llegada)),
      tiempo_promedio_llegada_habil:avg(habiles.map(t=>t.tiempo_llegada)),
      tiempo_promedio_llegada_inhabil:avg(inhabiles.map(t=>t.tiempo_llegada)),
      tiempo_promedio_solucion:avg(cerradosTickets.map(t=>t.tiempo_solucion)),
      eventos_atrapados:ticketsAlcance.filter(esAtrapado).length
    };

    // ---- Estado actual (foto de hoy) ----
    const equiposParados=portfolioTotal.filter(r=>upper(r.estatus_servicio).includes('NO EN SERVICIO')).length;

    const prefsRow=(dbOr(db).query('SELECT criticos_fallas,criticos_periodo FROM usuarios WHERE id_SB=? LIMIT 1',[uid])||[])[0]||{};
    const diasCritico=positive(q.dias_criticos,positive(prefsRow.criticos_periodo,35,1,3650),1,3650);
    const minFallas=positive(q.min_fallas_criticos,positive(prefsRow.criticos_fallas,3,1,9999),1,9999);
    const cutCriticos=new Date(now().getTime()-diasCritico*86400000);
    const todosTicketsAlcanceSinRango=root.ManttoLabOperationService.visibleTickets(uid,db,{}).filter(t=>codesActivos.has(txt(t.codigo_equipo||t.equipo)));
    const equiposCriticosMap=new Map();
    blt(todosTicketsAlcanceSinRango).forEach(t=>{
      const d=dateVal(t.fecha_reporte);
      if(!d||d<cutCriticos) return;
      const code=txt(t.codigo_equipo||t.equipo);
      equiposCriticosMap.set(code,(equiposCriticosMap.get(code)||0)+1);
    });
    const equiposCriticos=[...equiposCriticosMap.entries()]
      .filter(([,fallas])=>fallas>=minFallas)
      .map(([equipo,fallas_blt])=>({equipo,fallas_blt}))
      .sort((a,b)=>b.fallas_blt-a.fallas_blt)
      .slice(0,25);

    // ---- MTBC general (selector Anio actual / U365D) ----
    const diasVentana=ventana==='365'?365:currentYearDays();
    const cutVentana=new Date(now().getTime()-diasVentana*86400000);
    const fallasVentana=blt(todosTicketsAlcanceSinRango).filter(t=>{const d=dateVal(t.fecha_reporte);return d&&d>=cutVentana;}).length;
    const mtbcGeneral=fallasVentana>0?Math.round((diasVentana*Math.max(1,portfolioActivo.length)/fallasVentana)*10)/10:null;

    // ---- Tendencia MTBC mes a mes (dentro del periodo elegido) ----
    const porMes=new Map();
    blt(ticketsAlcance).forEach(t=>{
      const d=day(t.fecha_reporte);
      if(!d) return;
      const mes=d.slice(0,7);
      porMes.set(mes,(porMes.get(mes)||0)+1);
    });
    const tendenciaMtbc=[...porMes.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([mes,fallas])=>({
      mes,
      mtbc:fallas>0?Math.round((30*Math.max(1,portfolioActivo.length)/fallas)*10)/10:null
    }));

    // ---- Proyectos criticos: MTBC < 100 dias, misma ventana ----
    const porProyecto=new Map();
    portfolioActivo.forEach(row=>{
      const key=txt(row.proyecto);
      if(!key) return;
      if(!porProyecto.has(key)) porProyecto.set(key,[]);
      porProyecto.get(key).push(row);
    });
    const proyectosCriticos=[...porProyecto.entries()].map(([proyecto,equipos])=>{
      const codes=new Set(equipos.map(e=>txt(e.numero_equipo)));
      const fallasProyecto=blt(todosTicketsAlcanceSinRango).filter(t=>{
        const d=dateVal(t.fecha_reporte);
        return d&&d>=cutVentana&&codes.has(txt(t.codigo_equipo||t.equipo));
      }).length;
      const mtbcProyecto=fallasProyecto>0?Math.round((diasVentana*equipos.length/fallasProyecto)*10)/10:null;
      return {proyecto,mtbc:mtbcProyecto};
    }).filter(r=>r.mtbc!==null&&r.mtbc<100).sort((a,b)=>a.mtbc-b.mtbc).slice(0,10);

    return {
      ok:true,
      source:'lab-sqlite',
      criterio:{fecha_inicio:fechaInicio,fecha_fin:fechaFin,mtbc_ventana:ventana,dias_criticos:diasCritico,min_fallas_criticos:minFallas,filtros:filters},
      resumen_alcance:resumenAlcance,
      tickets,
      estado_actual:{
        equipos_parados:equiposParados,
        equipos_criticos:equiposCriticos,
        mtbc_general:mtbcGeneral,
        mtbc_tendencia_mensual:tendenciaMtbc,
        proyectos_criticos:proyectosCriticos
      }
    };
  }

  // ---------------------------------------------------------------------
  // Detalle de tickets (drill-down): mismo alcance que generarInforme,
  // filtrado ademas por el criterio de la tarjeta en la que se hizo clic.
  // Devuelve las filas crudas de tickets (mismas columnas reales de la
  // tabla `tickets`) para que el frontend las muestre con las mismas
  // columnas que Operacion > Resumen del dia > Tickets del periodo.
  // ---------------------------------------------------------------------
  function detalleTickets(userId,query,candidateDb){
    const db=dbOr(candidateDb);
    const q=query||{};
    const uid=Number(userId);
    const filters=filtersFromQuery(q);

    const defaultFin=now().toISOString().slice(0,10);
    const seisMesesAtras=new Date(now()); seisMesesAtras.setMonth(seisMesesAtras.getMonth()-6);
    const fechaInicio=/^\d{4}-\d{2}-\d{2}$/.test(txt(q.fecha_inicio))?txt(q.fecha_inicio):seisMesesAtras.toISOString().slice(0,10);
    const fechaFin=/^\d{4}-\d{2}-\d{2}$/.test(txt(q.fecha_fin))?txt(q.fecha_fin):defaultFin;

    const {ticketsAlcance}=ticketsEnAlcance(uid,filters,fechaInicio,fechaFin,db);

    const criterio=upper(q.criterio||'total');
    const valor=txt(q.valor);
    let filas;
    switch(criterio){
      case 'ABIERTOS': filas=ticketsAlcance.filter(t=>upper(t.estado_ticket).includes('ABIER')); break;
      case 'CERRADOS': filas=ticketsAlcance.filter(t=>upper(t.estado_ticket).includes('CERR')); break;
      case 'EN_CURSO': filas=ticketsAlcance.filter(t=>!upper(t.estado_ticket).includes('ABIER')&&!upper(t.estado_ticket).includes('CERR')); break;
      case 'RESPONSABILIDAD_BLT': filas=blt(ticketsAlcance); break;
      case 'RESPONSABILIDAD_CLIENTE': filas=cliente(ticketsAlcance); break;
      case 'CAUSA_BLT': filas=blt(ticketsAlcance).filter(t=>upper(t.causa_falla)===upper(valor)); break;
      case 'CAUSA_CLIENTE': filas=cliente(ticketsAlcance).filter(t=>upper(t.causa_falla)===upper(valor)); break;
      case 'TIPO_EQUIPO': filas=ticketsAlcance.filter(t=>upper(t.tipo_equipo)===upper(valor)); break;
      case 'TIEMPO_LLEGADA': filas=ticketsAlcance.filter(t=>Number.isFinite(Number(t.tiempo_llegada))); break;
      case 'TIEMPO_LLEGADA_HABIL': filas=ticketsAlcance.filter(t=>esInhabil(t)===false&&Number.isFinite(Number(t.tiempo_llegada))); break;
      case 'TIEMPO_LLEGADA_INHABIL': filas=ticketsAlcance.filter(t=>esInhabil(t)===true&&Number.isFinite(Number(t.tiempo_llegada))); break;
      case 'TIEMPO_SOLUCION': filas=ticketsAlcance.filter(t=>upper(t.estado_ticket).includes('CERR')&&Number.isFinite(Number(t.tiempo_solucion))); break;
      case 'ATRAPADOS': filas=ticketsAlcance.filter(esAtrapado); break;
      case 'TOTAL': default: filas=ticketsAlcance; break;
    }
    filas=[...filas].sort((a,b)=>String(b.fecha_reporte||'').localeCompare(String(a.fecha_reporte||''))||String(b.h_reporte||'').localeCompare(String(a.h_reporte||'')));

    return {ok:true,source:'lab-sqlite',criterio:criterio.toLowerCase(),valor:valor||null,total:filas.length,tickets:filas};
  }

  return Object.freeze({getOpciones,generarInforme,detalleTickets});
});
