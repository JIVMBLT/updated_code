(function initManttoLabMovementsService(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.ManttoLabMovementsService=api;
})(typeof globalThis!=='undefined'?globalThis:this,function createManttoLabMovementsService(root){
  'use strict';

  function dbOr(candidate){const db=candidate||root?.ManttoLabDB;if(!db||typeof db.query!=='function')throw new Error('MANTTO_LAB_DB_REQUIRED');return db;}
  function txt(value){return String(value==null?'':value).trim();}
  function norm(value){return txt(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();}
  function inService(value){const status=norm(value);return status==='EN SERVICIO'||status==='SERVICIO';}
  function classify(previous,current){const before=inService(previous),after=inService(current);if(!txt(previous)&&after)return'NUEVO_INGRESO';if(before&&!after)return'DEGRADADO';if(!before&&after)return'RECUPERADO';if(norm(previous)!==norm(current))return'CAMBIO';return null;}
  function rowFor(portfolioRow){
    const type=classify(portfolioRow.estatus_ul_mes,portfolioRow.estatus_servicio);if(!type)return null;
    return{id_portafolio:portfolioRow.id_portafolio,tipo_movimiento:type,tipo:type,numero_equipo:portfolioRow.numero_equipo,equipo:portfolioRow.numero_equipo,proyecto:portfolioRow.proyecto,proyecto_codigo:portfolioRow.proyecto,proyecto_nombre:portfolioRow.nombre_publico||portfolioRow.proyecto_cc_x_port||portfolioRow.proyecto,zona:portfolioRow.zona_oficial||portfolioRow.zona_operativa,zona_oficial:portfolioRow.zona_oficial||portfolioRow.zona_operativa,zona_id_oficial:portfolioRow.zona_id,zona_legacy:portfolioRow.zona_operativa,supervisor:portfolioRow.supervisor_zona,estatus_anterior:portfolioRow.estatus_ul_mes,estatus_actual:portfolioRow.estatus_servicio,fecha_corte:portfolioRow.estatus_ul_mes_fecha};
  }
  function parseJson(value,fallback){if(Array.isArray(value))return value;try{const parsed=JSON.parse(String(value||''));return parsed??fallback;}catch(_error){return fallback;}}
  function visibleMap(userId,candidateDb){const map=new Map();root.ManttoLabOperationService.visiblePortfolio(userId,candidateDb,{includeInactive:true,canonicalZone:true}).forEach(row=>{const code=norm(row.numero_equipo);if(code)map.set(code,row);});return map;}
  function latestWeeklySnapshotKeys(candidateDb){const db=dbOr(candidateDb),cut=db.query("SELECT snapshot_json FROM portafolio_cortes_semanales WHERE estado='CERRADO' ORDER BY anio_iso DESC,semana_iso DESC LIMIT 1")[0];if(!cut)return null;return new Set(parseJson(cut.snapshot_json,[]).map(row=>norm(row.equipo||row.numero_equipo||row.codigo_equipo)).filter(Boolean));}
  function monthly(userId,query,candidateDb){
    const db=dbOr(candidateDb),latestKeys=latestWeeklySnapshotKeys(db),q=query||{},zone=norm(q.zona),type=norm(q.tipo),search=norm(q.search||q.buscar);
    let rows=root.ManttoLabOperationService.visiblePortfolio(userId,db,{includeInactive:false,canonicalZone:true}).map(rowFor).filter(row=>row&&!(row.tipo_movimiento==='NUEVO_INGRESO'&&latestKeys instanceof Set&&latestKeys.has(norm(row.numero_equipo))));
    rows=rows.filter(row=>(!zone||norm(row.zona)===zone)&&(!type||norm(row.tipo_movimiento)===type)&&(!search||norm([row.numero_equipo,row.proyecto,row.proyecto_nombre,row.zona,row.supervisor].join(' ')).includes(search)));
    rows.sort((a,b)=>txt(a.tipo_movimiento).localeCompare(txt(b.tipo_movimiento),'es')||txt(a.zona).localeCompare(txt(b.zona),'es')||txt(a.proyecto).localeCompare(txt(b.proyecto),'es')||txt(a.numero_equipo).localeCompare(txt(b.numero_equipo),'es'));
    const kpis={total:rows.length,degradados:rows.filter(row=>row.tipo_movimiento==='DEGRADADO').length,recuperados:rows.filter(row=>row.tipo_movimiento==='RECUPERADO').length,cambios:rows.filter(row=>row.tipo_movimiento==='CAMBIO').length,ingresos:rows.filter(row=>row.tipo_movimiento==='NUEVO_INGRESO').length};
    const zones=[...new Set(root.ManttoLabOperationService.visiblePortfolio(userId,db,{includeInactive:true,canonicalZone:true}).map(row=>txt(row.zona_oficial)).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
    const cut=rows.map(row=>row.fecha_corte).filter(Boolean).sort().reverse()[0]||null;
    return{ok:true,source:'lab-sqlite',alcance:root.ManttoLabOperationService.alcance(userId,db),filters:{zonas:zones},kpis,corte:cut,data:rows.slice(0,1000)};
  }
  function detail(userId,code,candidateDb){const data=root.ManttoLabPortfolioService.equipmentDetail(userId,code,{},candidateDb);if(!data)return null;const equipment=data.data||data.mantenimiento||{};return{equipo:equipment,proyecto:{proyecto:equipment.proyecto,proyecto_codigo:equipment.proyecto,proyecto_nombre:equipment.proyecto_nombre||equipment.proyecto},tickets:data.tickets||[],movimiento:rowFor(equipment)};}
  function cuts(candidateDb){return dbOr(candidateDb).query("SELECT id_corte,anio_iso,semana_iso,fecha_inicio,fecha_fin,fecha_corte,id_corte_anterior,total_portafolio,total_movimientos,total_salidas,total_regresos,total_cambios,total_ingresos,estado,generado_por,created_at,updated_at FROM portafolio_cortes_semanales WHERE estado='CERRADO' ORDER BY anio_iso DESC,semana_iso DESC");}
  function weeklyCatalog(candidateDb){return{ok:true,source:'lab-sqlite',data:cuts(candidateDb)};}
  function canonicalizeWeeklyRow(row,allowed){
    const code=norm(row?.equipo||row?.numero_equipo||row?.codigo_equipo);if(!code)return null;const pf=allowed.get(code);if(!pf)return null;
    const historicalId=Number(row?.zona_id??row?.zona_id_oficial);if(Number.isInteger(historicalId)&&historicalId>0&&historicalId!==Number(pf.zona_id))return null;
    return{...row,equipo:txt(row?.equipo||row?.numero_equipo||pf.numero_equipo),numero_equipo:txt(row?.numero_equipo||row?.equipo||pf.numero_equipo),zona_legacy:row?.zona_legacy??row?.zona_operativa??row?.zona??null,zona_id_oficial:Number(pf.zona_id),zona_oficial:pf.zona_oficial,zona:pf.zona_oficial};
  }
  function weekly(userId,query,candidateDb){
    const db=dbOr(candidateDb),year=Number(query?.anio),week=Number(query?.semana),row=db.query("SELECT * FROM portafolio_cortes_semanales WHERE anio_iso=? AND semana_iso=? AND estado='CERRADO' LIMIT 1",[year,week])[0];if(!row)return null;
    const allowed=visibleMap(userId,db),snapshot=parseJson(row.snapshot_json,[]).map(item=>canonicalizeWeeklyRow(item,allowed)).filter(Boolean);let data=parseJson(row.movimientos_json,[]).map(item=>canonicalizeWeeklyRow(item,allowed)).filter(Boolean),type=norm(query?.tipo),search=norm(query?.search||query?.buscar);
    if(type)data=data.filter(item=>norm(item.tipo_movimiento||item.tipo)===type);if(search)data=data.filter(item=>norm([item.numero_equipo||item.equipo,item.proyecto,item.zona,item.estatus_anterior,item.estatus_actual].join(' ')).includes(search));
    const counts={total:data.length,degradados:data.filter(item=>norm(item.tipo_movimiento||item.tipo)==='DEGRADADO').length,recuperados:data.filter(item=>norm(item.tipo_movimiento||item.tipo)==='RECUPERADO').length,cambios:data.filter(item=>norm(item.tipo_movimiento||item.tipo)==='CAMBIO').length,ingresos:data.filter(item=>norm(item.tipo_movimiento||item.tipo)==='NUEVO_INGRESO').length};
    const corte={id_corte:row.id_corte,anio_iso:row.anio_iso,semana_iso:row.semana_iso,fecha_inicio:row.fecha_inicio,fecha_fin:row.fecha_fin,fecha_corte:row.fecha_corte,total_portafolio:snapshot.length,total_movimientos:counts.total,total_salidas:counts.degradados,total_regresos:counts.recuperados,total_cambios:counts.cambios,total_ingresos:counts.ingresos,estado:row.estado};
    return{ok:true,source:'lab-sqlite',alcance:root.ManttoLabOperationService.alcance(userId,db),corte,data};
  }
  function isProgrammer(actor){if(!actor)return false;const roles=[actor.rol].concat(Array.isArray(actor.roles)?actor.roles:[]).map(norm);return actor.is_programador===true||roles.includes('PROGRAMADOR')||roles.includes('PROGRAMADOR UNITED')||roles.includes('PROGRAMADOR CORELLIAN');}
  function isoWeek(date){const d=new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())),day=d.getUTCDay()||7;d.setUTCDate(d.getUTCDate()+4-day);const yearStart=new Date(Date.UTC(d.getUTCFullYear(),0,1));return{year:d.getUTCFullYear(),week:Math.ceil((((d-yearStart)/86400000)+1)/7)};}
  function isoWeekRange(year,week){const jan4=new Date(Date.UTC(year,0,4)),day=jan4.getUTCDay()||7,monday=new Date(jan4);monday.setUTCDate(jan4.getUTCDate()-day+1+(week-1)*7);const sunday=new Date(monday);sunday.setUTCDate(monday.getUTCDate()+6);const format=date=>date.toISOString().slice(0,10);return{from:format(monday),to:format(sunday)};}
  function currentSnapshot(candidateDb){return dbOr(candidateDb).query("SELECT p.id_portafolio,p.proyecto,p.numero_equipo AS equipo,p.numero_equipo,p.estatus_servicio,p.zona_id,z.zona,z.zona AS zona_oficial FROM portafolio p INNER JOIN z_op z ON z.id_zona=p.zona_id AND z.estado=1 WHERE p.estado_registro=1 ORDER BY p.id_portafolio");}
  function cutManual(actor,candidateDb){
    if(!isProgrammer(actor)){const error=new Error('Solo Programador puede generar el corte semanal LAB.');error.status=403;error.code='LAB_PROGRAMMER_REQUIRED';throw error;}
    const db=dbOr(candidateDb),iw=isoWeek(new Date()),existing=db.query("SELECT * FROM portafolio_cortes_semanales WHERE anio_iso=? AND semana_iso=? LIMIT 1",[iw.year,iw.week])[0];if(existing)return{ok:true,source:'lab-sqlite',existing:true,corte:{...existing,snapshot_json:undefined,movimientos_json:undefined}};
    const previous=db.query("SELECT * FROM portafolio_cortes_semanales WHERE estado='CERRADO' ORDER BY anio_iso DESC,semana_iso DESC LIMIT 1")[0]||null,current=currentSnapshot(db),previousRows=parseJson(previous?.snapshot_json,[]),previousMap=new Map(previousRows.map(row=>[norm(row.equipo||row.numero_equipo),row])),movements=[];
    current.forEach(row=>{const before=previousMap.get(norm(row.equipo));if(!before){movements.push({tipo_movimiento:'NUEVO_INGRESO',tipo:'NUEVO_INGRESO',numero_equipo:row.equipo,equipo:row.equipo,proyecto:row.proyecto,zona_id:row.zona_id,zona:row.zona,estatus_anterior:null,estatus_actual:row.estatus_servicio});return;}const type=classify(before.estatus_servicio,row.estatus_servicio);if(type)movements.push({tipo_movimiento:type,tipo:type,numero_equipo:row.equipo,equipo:row.equipo,proyecto:row.proyecto,zona_id:row.zona_id,zona:row.zona,estatus_anterior:before.estatus_servicio,estatus_actual:row.estatus_servicio});});
    const range=isoWeekRange(iw.year,iw.week),counts={DEGRADADO:0,RECUPERADO:0,CAMBIO:0,NUEVO_INGRESO:0};movements.forEach(item=>counts[item.tipo_movimiento]=(counts[item.tipo_movimiento]||0)+1);
    const result=db.run("INSERT INTO portafolio_cortes_semanales(anio_iso,semana_iso,fecha_inicio,fecha_fin,fecha_corte,id_corte_anterior,total_portafolio,total_movimientos,total_salidas,total_regresos,total_cambios,total_ingresos,snapshot_json,movimientos_json,estado,hash_contenido,generado_por) VALUES(?,?,?,?,CURRENT_TIMESTAMP,?,?,?,?,?,?,?,?,?,'CERRADO',?,?)",[iw.year,iw.week,range.from,range.to,previous?.id_corte||null,current.length,movements.length,counts.DEGRADADO,counts.RECUPERADO,counts.CAMBIO,counts.NUEVO_INGRESO,JSON.stringify(current),JSON.stringify(movements),'LAB-'+iw.year+'-'+iw.week,Number(actor.id_SB||actor.id)]),created=db.query('SELECT * FROM portafolio_cortes_semanales WHERE id_corte=?',[Number(result.lastInsertRowId)])[0];
    return{ok:true,source:'lab-sqlite',corte:{...created,snapshot_json:undefined,movimientos_json:undefined}};
  }

  return Object.freeze({monthly,detail,weeklyCatalog,weekly,cutManual,isProgrammer,classify});
});
