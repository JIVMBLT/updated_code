(function initManttoLabPortfolioService(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.ManttoLabPortfolioService=api;
})(typeof globalThis!=='undefined'?globalThis:this,function createManttoLabPortfolioService(root){
  'use strict';

  function dbOr(candidate){const db=candidate||root?.ManttoLabDB;if(!db||typeof db.query!=='function')throw new Error('MANTTO_LAB_DB_REQUIRED');return db;}
  function txt(value){return String(value==null?'':value).trim();}
  function upper(value){return txt(value).toUpperCase();}
  function positive(value,fallback,min,max){const n=Number.parseInt(value,10);return Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback;}
  function dateValue(value){if(!value)return null;const raw=txt(value).replace(' ','T');const date=new Date(raw);return Number.isNaN(date.getTime())?null:date;}
  function dayKey(value){const match=txt(value).match(/^(\d{4}-\d{2}-\d{2})/);return match?match[1]:null;}
  function monthKey(value){const day=dayKey(value);return day?day.slice(0,7):null;}
  function round1(value){return Math.round(Number(value||0)*10)/10;}
  function unique(values){return [...new Set((values||[]).map(txt).filter(Boolean))];}
  function officialContract(row){
    if(upper(row.estatus_servicio).includes('NO EN SERVICIO'))return'No en Servicio';
    if(upper(row.estatus_cobranza)==='EN COBRANZA')return'En Cobranza';
    if(upper(row.estatus_cobranza)==='GRATUITO')return'Gratuito/Garantía';
    return null;
  }
  function ticketMap(userId,candidateDb){
    const map=new Map();
    root.ManttoLabOperationService.visibleTickets(userId,candidateDb).forEach(ticket=>{const code=txt(ticket.codigo_equipo);if(!map.has(code))map.set(code,[]);map.get(code).push(ticket);});
    return map;
  }
  function latest(tickets){return(tickets||[]).slice().sort((a,b)=>txt(b.fecha_reporte).localeCompare(txt(a.fecha_reporte))||Number(b.id||0)-Number(a.id||0))[0]||null;}
  function typeFor(row,ticket){return txt(ticket?.tipo_equipo||row.id_equipo_ns||row.producto||'Sin tipo');}
  function decorated(userId,candidateDb){
    const db=dbOr(candidateDb),map=ticketMap(userId,db);
    return root.ManttoLabOperationService.visiblePortfolio(userId,db,{includeInactive:false,canonicalZone:true}).map(row=>{
      const lt=latest(map.get(txt(row.numero_equipo))||[]),stopped=upper(lt?.estatus_equipo_final).includes('NO FUNC')||upper(lt?.estatus_equipo_final).includes('DETEN'),reportDate=dateValue(lt?.fecha_reporte),days=stopped&&reportDate?Math.max(0,Math.floor((Date.now()-reportDate.getTime())/86400000)):null;
      return{...row,proyecto_codigo:row.proyecto,proyecto_nombre:row.nombre_publico||row.proyecto_cc_x_port||row.proyecto,zona:row.zona_oficial||row.zona_operativa,zona_oficial:row.zona_oficial||row.zona_operativa,zona_operativa_legacy:row.zona_operativa,supervisor:row.supervisor_zona,tipo_equipo:typeFor(row,lt),ultimo_ticket:lt?.ticket||null,ultimo_fecha_reporte:lt?.fecha_reporte||null,fecha_inicio_paro:lt?.fecha_reporte||null,ultimo_estado_ticket:lt?.estado_ticket||null,ultimo_estatus_equipo_final:lt?.estatus_equipo_final||null,ultima_responsabilidad:lt?.responsabilidad||null,contrato:officialContract(row),estado_operativo:stopped?'Parado':'Funcionando',dias_parado:days};
    });
  }
  function filterRows(rows,query){
    const q=query||{},zone=upper(q.zona),type=upper(q.tipo),supervisor=upper(q.supervisor),search=upper(q.search||q.buscar),oper=txt(q.operativo).toLowerCase(),contract=txt(q.contrato).toLowerCase();
    return rows.filter(row=>{
      if(zone&&!upper(row.zona).includes(zone))return false;
      if(type&&!upper(row.tipo_equipo).includes(type))return false;
      if(supervisor&&!upper(row.supervisor).includes(supervisor))return false;
      if(search&&!upper([row.numero_equipo,row.proyecto,row.proyecto_nombre,row.ciudad,row.estado,row.identificacion_sitio,row.supervisor,row.zona].join(' ')).includes(search))return false;
      if(oper==='parado'&&row.estado_operativo!=='Parado')return false;
      if(oper==='funcionando'&&row.estado_operativo!=='Funcionando')return false;
      if(contract==='no_servicio'&&row.contrato!=='No en Servicio')return false;
      if(contract==='gratuito'&&row.contrato!=='Gratuito/Garantía')return false;
      if(contract==='cobranza'&&row.contrato!=='En Cobranza')return false;
      return true;
    });
  }
  function sortRows(rows,query){
    const key=txt(query?.sort||'proyecto'),direction=txt(query?.direction).toLowerCase()==='desc'?-1:1,allowed=new Set(['numero_equipo','proyecto','ciudad','zona','tipo_equipo','supervisor','dias_parado']),sortKey=allowed.has(key)?key:'proyecto';
    return rows.slice().sort((a,b)=>{const av=a[sortKey],bv=b[sortKey];if(typeof av==='number'||typeof bv==='number')return((Number(av)||0)-(Number(bv)||0))*direction;return txt(av).localeCompare(txt(bv),'es')*direction||txt(a.proyecto).localeCompare(txt(b.proyecto),'es')||txt(a.numero_equipo).localeCompare(txt(b.numero_equipo),'es');});
  }
  function filters(userId,candidateDb){const rows=decorated(userId,candidateDb),uniq=values=>unique(values).sort((a,b)=>a.localeCompare(b,'es'));return{zonas:uniq(rows.map(row=>row.zona)),supervisores:uniq(rows.map(row=>row.supervisor)),tipos:uniq(rows.map(row=>row.tipo_equipo))};}
  function distribution(rows,selector){const map=new Map();rows.forEach(row=>{const label=selector(row)||'Sin dato';map.set(label,(map.get(label)||0)+1);});return[...map.entries()].map(([label,total])=>({label,total})).sort((a,b)=>b.total-a.total||a.label.localeCompare(b.label,'es')).slice(0,12);}
  function dashboard(userId,query,candidateDb){
    const rows=filterRows(decorated(userId,candidateDb),query),projects=new Map();
    rows.forEach(row=>{const project=txt(row.proyecto);if(!project)return;if(!projects.has(project))projects.set(project,new Set());if(row.contrato)projects.get(project).add(row.contrato);});
    const kpis={total_activos:rows.length,en_cobranza:rows.filter(row=>row.contrato==='En Cobranza').length,gratuito:rows.filter(row=>row.contrato==='Gratuito/Garantía').length,gratuito_garantia:rows.filter(row=>row.contrato==='Gratuito/Garantía').length,no_en_servicio:rows.filter(row=>row.contrato==='No en Servicio').length,funcionando:rows.filter(row=>row.estado_operativo==='Funcionando').length,parado:rows.filter(row=>row.estado_operativo==='Parado').length};
    const list=[...projects.entries()];
    const kpisProyectos={total_proyectos:list.length,en_cobranza:list.filter(([,set])=>set.has('En Cobranza')).length,gratuito:list.filter(([,set])=>set.has('Gratuito/Garantía')).length,no_en_servicio:list.filter(([,set])=>set.has('No en Servicio')).length};
    return{kpis,kpis_proyectos:kpisProyectos,distribuciones:{contrato:distribution(rows,row=>row.contrato),operativo:distribution(rows,row=>row.estado_operativo),tipo:distribution(rows,row=>row.tipo_equipo),zona:distribution(rows,row=>row.zona)}};
  }
  function equipmentResponse(userId,query,candidateDb){
    const page=positive(query?.page,1,1,100000),pageSize=positive(query?.page_size||query?.pageSize,30,5,100),rows=sortRows(filterRows(decorated(userId,candidateDb),query),query),start=(page-1)*pageSize;
    return{ok:true,source:'lab-sqlite',data:rows.slice(start,start+pageSize),pagination:{page,page_size:pageSize,total:rows.length}};
  }
  function dashboardInitial(userId,query,candidateDb){const equipment=equipmentResponse(userId,query,candidateDb);return{ok:true,source:'lab-sqlite',view:'Dashboard Portafolio',alcance:root.ManttoLabOperationService.alcance(userId,candidateDb),filters:filters(userId,candidateDb),dashboard:dashboard(userId,query,candidateDb),equipos:{data:equipment.data,pagination:equipment.pagination}};}
  function ticketsBatch(userId,body,candidateDb){
    const requested=new Set((Array.isArray(body?.equipos)?body.equipos:[]).map(txt).filter(Boolean)),year=Number(body?.anio)||new Date().getFullYear(),visible=new Set(decorated(userId,candidateDb).map(row=>txt(row.numero_equipo))),out={};
    root.ManttoLabOperationService.visibleTickets(userId,candidateDb).forEach(ticket=>{const code=txt(ticket.codigo_equipo),ticketYear=Number(String(ticket.fecha_reporte||'').slice(0,4));if(!requested.has(code)||!visible.has(code)||ticketYear!==year)return;if(!out[code])out[code]=[];out[code].push(ticket);});
    requested.forEach(code=>{if(visible.has(code)&&!out[code])out[code]=[];});return out;
  }
  function periodTickets(tickets,from,to){return(tickets||[]).filter(ticket=>{const date=dateValue(ticket.fecha_reporte);if(!date)return false;if(from&&date<from)return false;if(to&&date>to)return false;return true;});}
  function responsibility(ticket,value){return upper(ticket.responsabilidad)===value;}
  function mtbc(tickets,periodDays){const failures=(tickets||[]).filter(ticket=>responsibility(ticket,'BLT')).length;return failures?round1(periodDays/failures):null;}
  function equipmentDetail(userId,code,query,candidateDb){
    const db=dbOr(candidateDb),row=decorated(userId,db).find(item=>txt(item.numero_equipo)===txt(code));if(!row)return null;
    const allTickets=root.ManttoLabOperationService.visibleTickets(userId,db).filter(ticket=>txt(ticket.codigo_equipo)===txt(row.numero_equipo));
    const now=new Date(),currentYear=now.getFullYear(),requestedYear=Number.parseInt(query?.anio||query?.anio_tickets,10),year=Number.isInteger(requestedYear)&&requestedYear>=2000&&requestedYear<=2100?requestedYear:currentYear;
    const tickets=allTickets.filter(ticket=>dateValue(ticket.fecha_reporte)?.getFullYear()===year),years=unique(allTickets.map(ticket=>String(dateValue(ticket.fecha_reporte)?.getFullYear()||''))).map(Number).filter(Boolean).sort((a,b)=>b-a);
    const yearStart=new Date(currentYear,0,1),nextYear=new Date(currentYear+1,0,1),elapsed=Math.max(1,Math.floor((now-yearStart)/86400000)+1),u365Start=new Date(now);u365Start.setDate(u365Start.getDate()-365);
    const currentTickets=periodTickets(allTickets,yearStart,nextYear),bltYear=currentTickets.filter(ticket=>responsibility(ticket,'BLT')),blt365=periodTickets(allTickets,u365Start,now).filter(ticket=>responsibility(ticket,'BLT'));
    const duration=value=>{const n=Number(value);return Number.isFinite(n)?n:null;};
    const avg=values=>{const list=values.filter(Number.isFinite);return list.length?round1(list.reduce((sum,value)=>sum+value,0)/list.length):null;};
    const status=ticket=>upper(ticket.estado_ticket||ticket.estado),blob=ticket=>upper([ticket.descripcion,ticket.causa,ticket.causa_falla,ticket.accion_en_cierre].join(' '));
    const metrics={cerrados:currentTickets.filter(ticket=>status(ticket).includes('CERR')).length,en_curso:currentTickets.filter(ticket=>!status(ticket).includes('CERR')&&!status(ticket).includes('ABIER')).length,abiertos:currentTickets.filter(ticket=>status(ticket).includes('ABIER')).length,filtracion:currentTickets.filter(ticket=>['FILTRACION','FILTRACIÓN','AGUA','INUNDACION','INUNDACIÓN','GOTERA'].some(word=>blob(ticket).includes(word))).length,atrapados:currentTickets.filter(ticket=>['ATRAPADO','ATRAPADA','ENCERRADO','ENCERRADA','RESCATE'].some(word=>blob(ticket).includes(word))).length,voltaje:currentTickets.filter(ticket=>['VOLTAJE','FALLA ELECTRICA','FALLA ELÉCTRICA','SIN ENERGIA','SIN ENERGÍA','APAGON','APAGÓN'].some(word=>blob(ticket).includes(word))).length,en_sla:currentTickets.filter(ticket=>duration(ticket.tiempo_llegada)!==null&&duration(ticket.tiempo_solucion)!==null&&duration(ticket.tiempo_llegada)<=4&&duration(ticket.tiempo_solucion)<=24).length,promedio_llegada:avg(currentTickets.map(ticket=>duration(ticket.tiempo_llegada))),promedio_solucion:avg(currentTickets.map(ticket=>duration(ticket.tiempo_solucion))),tickets_anio:currentTickets.length,resp_blt_anio:bltYear.length,resp_cliente_anio:currentTickets.filter(ticket=>responsibility(ticket,'CLIENTE')).length,sin_responsabilidad_anio:currentTickets.filter(ticket=>!['BLT','CLIENTE'].includes(upper(ticket.responsabilidad))).length,mtbc_anio:mtbc(bltYear,elapsed),mtbc_u365:mtbc(blt365,365)};
    const monthlyCurrent=new Map(Array.from({length:12},(_,index)=>[`${currentYear}-${String(index+1).padStart(2,'0')}`,0])),monthlyU365=new Map();
    bltYear.forEach(ticket=>{const key=monthKey(ticket.fecha_reporte);if(key)monthlyCurrent.set(key,(monthlyCurrent.get(key)||0)+1);});blt365.forEach(ticket=>{const key=monthKey(ticket.fecha_reporte);if(key)monthlyU365.set(key,(monthlyU365.get(key)||0)+1);});
    return{ok:true,source:'lab-sqlite',data:row,mantenimiento:row,instalaciones:[],tickets,ticket_years:years,ticket_year_selected:year,u365_desde:u365Start.toISOString().slice(0,10),u365_hasta:now.toISOString().slice(0,10),metrics,fallas_blt_mes_anio:[...monthlyCurrent.entries()].map(([mes,total])=>({mes,total})),fallas_blt_mes_u365:[...monthlyU365.entries()].map(([mes,total])=>({mes,total}))};
  }
  function projectDetail(userId,project,query,candidateDb){
    const db=dbOr(candidateDb),needle=upper(project),equipment=decorated(userId,db).filter(row=>upper(row.proyecto)===needle||upper(row.proyecto_nombre)===needle||upper(row.nombre_publico)===needle);if(!equipment.length)return null;
    const codes=new Set(equipment.map(row=>txt(row.numero_equipo))),allTickets=root.ManttoLabOperationService.visibleTickets(userId,db).filter(ticket=>codes.has(txt(ticket.codigo_equipo))),now=new Date(),currentYear=now.getFullYear(),requestedYear=Number.parseInt(query?.anio_tickets,10),selectedYear=Number.isInteger(requestedYear)&&requestedYear>=2000&&requestedYear<=2100?requestedYear:null,tickets=selectedYear?allTickets.filter(ticket=>dateValue(ticket.fecha_reporte)?.getFullYear()===selectedYear):allTickets,years=unique(allTickets.map(ticket=>String(dateValue(ticket.fecha_reporte)?.getFullYear()||''))).map(Number).filter(Boolean).sort((a,b)=>b-a),start35=new Date(now);start35.setDate(start35.getDate()-35);const start365=new Date(now);start365.setDate(start365.getDate()-365);
    equipment.forEach(row=>{const own=allTickets.filter(ticket=>txt(ticket.codigo_equipo)===txt(row.numero_equipo)),yearTickets=own.filter(ticket=>dateValue(ticket.fecha_reporte)?.getFullYear()===currentYear),bltYear=yearTickets.filter(ticket=>responsibility(ticket,'BLT')),clientYear=yearTickets.filter(ticket=>responsibility(ticket,'CLIENTE')),blt365=periodTickets(own,start365,now).filter(ticket=>responsibility(ticket,'BLT'));row.fallas_anio=yearTickets.length;row.resp_blt_anio=bltYear.length;row.fallas_blt_anio=bltYear.length;row.ultimo_blt=bltYear.map(ticket=>ticket.fecha_reporte).filter(Boolean).sort().pop()||null;row.resp_cliente_anio=clientYear.length;row.ultimo_cliente=clientYear.map(ticket=>ticket.fecha_reporte).filter(Boolean).sort().pop()||null;row.mtbc_anio=mtbc(bltYear,Math.max(1,Math.floor((now-new Date(currentYear,0,1))/86400000)+1));row.mtbc_365=mtbc(blt365,365);row.es_critico_periodo=periodTickets(own,start35,now).filter(ticket=>responsibility(ticket,'BLT')).length>=3?1:0;});
    const first=equipment[0],projectRow={proyecto:first.proyecto,proyecto_codigo:first.proyecto,proyecto_nombre:first.proyecto_nombre||first.proyecto,nombre_publico:first.nombre_publico||first.proyecto_nombre||first.proyecto,ciudad:first.ciudad,estado:first.estado,zona:unique(equipment.map(row=>row.zona)).join(' / '),zona_operativa:unique(equipment.map(row=>row.zona)).join(' / '),supervisor:unique(equipment.map(row=>row.supervisor)).join(' / '),supervisor_zona:unique(equipment.map(row=>row.supervisor)).join(' / '),equipos:equipment.length,parados:equipment.filter(row=>row.estado_operativo==='Parado').length,tickets_35d:periodTickets(allTickets,start35,now).length,fallas_blt_365d:periodTickets(allTickets,start365,now).filter(ticket=>responsibility(ticket,'BLT')).length,mtbc_365:mtbc(periodTickets(allTickets,start365,now),365*equipment.length)};
    const byMonth=new Map();allTickets.filter(ticket=>dateValue(ticket.fecha_reporte)?.getFullYear()===currentYear).forEach(ticket=>{const key=monthKey(ticket.fecha_reporte);if(!key)return;if(!byMonth.has(key))byMonth.set(key,{mes:key,total:0,blt:0,cliente:0});const item=byMonth.get(key);item.total+=1;if(responsibility(ticket,'BLT'))item.blt+=1;if(responsibility(ticket,'CLIENTE'))item.cliente+=1;});
    const respMap=new Map();allTickets.filter(ticket=>dateValue(ticket.fecha_reporte)?.getFullYear()===currentYear).forEach(ticket=>{const key=upper(ticket.responsabilidad)||'SIN RESPONSABLE';respMap.set(key,(respMap.get(key)||0)+1);});
    const projectMetrics={equipos:equipment.length,parados:projectRow.parados,tickets_35d:projectRow.tickets_35d,fallas_blt_365d:projectRow.fallas_blt_365d,equipos_criticos_periodo:equipment.filter(row=>row.es_critico_periodo).length,mtbc_365:projectRow.mtbc_365};
    const groupByEquipment=kind=>equipment.map(row=>({label:row.identificacion_sitio||row.numero_equipo,codigo_equipo:row.numero_equipo,responsabilidad:kind,total:allTickets.filter(ticket=>txt(ticket.codigo_equipo)===txt(row.numero_equipo)&&responsibility(ticket,kind)&&dateValue(ticket.fecha_reporte)?.getFullYear()===currentYear).length})).filter(row=>row.total>0).sort((a,b)=>b.total-a.total);
    return{ok:true,source:'lab-sqlite',origen:'PORTAFOLIO',equivalencia:null,proyecto:projectRow,equipos:equipment,tickets,ticket_years:years,ticket_year_selected:selectedYear,monthly_current:[...byMonth.values()].sort((a,b)=>a.mes.localeCompare(b.mes)),monthly_previous:[],responsabilidad:[...respMap.entries()].map(([responsabilidad,total])=>({responsabilidad,total})).sort((a,b)=>b.total-a.total),project_metrics:projectMetrics,project_distributions:{total_responsabilidad:[...respMap.entries()].map(([label,total])=>({label,total})).sort((a,b)=>b.total-a.total),blt_por_equipo:groupByEquipment('BLT'),cliente_por_equipo:groupByEquipment('CLIENTE')}};
  }

  return Object.freeze({officialContract,decorated,filterRows,filters,dashboard,equipmentResponse,dashboardInitial,ticketsBatch,equipmentDetail,projectDetail});
});
