(function initManttoLabSharedAssetsService(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.ManttoLabSharedAssetsService=api;
})(typeof globalThis!=='undefined'?globalThis:this,function createManttoLabSharedAssetsService(root){
  'use strict';

  function dbOr(candidate){
    const db=candidate||root?.ManttoLabDB;
    if(!db||typeof db.query!=='function'||typeof db.scalar!=='function')throw new Error('MANTTO_LAB_DB_REQUIRED');
    return db;
  }
  function scopeService(){const svc=root?.ManttoLabScopeService;if(!svc)throw new Error('MANTTO_LAB_SCOPE_SERVICE_REQUIRED');return svc;}
  function text(value){return String(value==null?'':value).trim();}
  function upper(value){return text(value).toUpperCase();}
  function uniqueText(values){return [...new Set((values||[]).map(text).filter(Boolean))];}
  function parseDate(value){
    if(!value)return null;
    const raw=String(value).trim();
    const normalized=/^\d{4}-\d{2}-\d{2}(?:\s|T)/.test(raw)?raw.replace(' ','T'):raw;
    const date=value instanceof Date?value:new Date(normalized);
    return Number.isNaN(date.getTime())?null:date;
  }
  function maxText(values){const items=uniqueText(values).sort((a,b)=>a.localeCompare(b,'es',{sensitivity:'base'}));return items.length?items[items.length-1]:null;}
  function projectName(value){
    const raw=text(value),match=raw.match(/^(\d+)-(\d{2})-(\d{2})(?:T.*)?$/);
    if(!match)return raw;
    const months={'01':'Enero','02':'Febrero','03':'Marzo','04':'Abril','05':'Mayo','06':'Junio','07':'Julio','08':'Agosto','09':'Septiembre','10':'Octubre','11':'Noviembre','12':'Diciembre'};
    return `${String(Number(match[3])||match[3])} de ${months[match[2]]||match[2]} #${String(Number(match[1])||match[1])}`;
  }

  function unitedScope(userId,candidateDb){
    const db=dbOr(candidateDb);const resolved=scopeService().resolveUnited(Number(userId),db);
    return {
      raw:resolved,
      master:resolved.llave_maestra===true,
      zoneIds:Array.isArray(resolved.zona_ids)?resolved.zona_ids.map(Number).filter(Number.isInteger):null,
      zoneCodes:Array.isArray(resolved.zona_codigos)?resolved.zona_codigos.map(text).filter(Boolean):null
    };
  }

  function visiblePortfolio(userId,candidateDb,options){
    const db=dbOr(candidateDb),scope=unitedScope(userId,db),cfg=Object.assign({includeInactive:true,canonicalZone:false},options||{});
    if(!scope.master&&(!scope.zoneIds||!scope.zoneIds.length))return[];
    const join=cfg.canonicalZone?'INNER JOIN z_op z ON z.id_zona=p.zona_id AND z.estado=1':'LEFT JOIN z_op z ON z.id_zona=p.zona_id AND z.estado=1';
    const params=[];
    let sql=`SELECT p.*,z.zona AS zona_oficial,z.nombre AS zona_nombre,pe.nombre_publico
      FROM portafolio p
      ${join}
      LEFT JOIN proyecto_equivalencias pe ON pe.activo=1 AND UPPER(TRIM(pe.proyecto_united))=UPPER(TRIM(p.proyecto))
      WHERE p.estado_registro=1`;
    if(!cfg.includeInactive)sql+=` AND (p.inactivo IS NULL OR UPPER(TRIM(p.inactivo)) NOT IN ('SI','SÍ','1','TRUE','INACTIVO'))`;
    if(!scope.master){sql+=` AND p.zona_id IN (${scope.zoneIds.map(()=>'?').join(',')})`;params.push(...scope.zoneIds);}
    sql+=' ORDER BY p.proyecto ASC,p.numero_equipo ASC';
    return db.query(sql,params);
  }

  function ticketsByEquipment(candidateDb){
    const db=dbOr(candidateDb),rows=db.query(`SELECT * FROM tickets WHERE NULLIF(TRIM(COALESCE(codigo_equipo,'')),'') IS NOT NULL ORDER BY fecha_reporte DESC,id DESC`);
    const map=new Map();
    rows.forEach(row=>{const code=text(row.codigo_equipo);if(!map.has(code))map.set(code,[]);map.get(code).push(row);});
    return map;
  }
  function latestTicket(rows){
    return (rows||[]).slice().sort((a,b)=>{
      const left=parseDate(a.fecha_reporte)?.getTime()||0,right=parseDate(b.fecha_reporte)?.getTime()||0;
      return right-left||Number(b.id||0)-Number(a.id||0);
    })[0]||null;
  }
  function equipmentType(row,ticketMap){
    return text(latestTicket(ticketMap.get(text(row.numero_equipo))||[])?.tipo_equipo)||text(row.id_equipo_ns)||'Sin tipo';
  }

  function rawPortfolio(userId,candidateDb){
    return visiblePortfolio(userId,candidateDb,{includeInactive:true,canonicalZone:false}).map(row=>{
      const copy={...row};delete copy.zona_oficial;delete copy.zona_nombre;delete copy.nombre_publico;return copy;
    });
  }

  function portfolioFilters(userId,candidateDb){
    const db=dbOr(candidateDb),rows=visiblePortfolio(userId,db,{includeInactive:true,canonicalZone:false}),ticketMap=ticketsByEquipment(db);
    return {
      zonas:uniqueText(rows.map(row=>row.zona_operativa)).sort((a,b)=>a.localeCompare(b,'es')),
      supervisores:uniqueText(rows.map(row=>row.supervisor_zona)).sort((a,b)=>a.localeCompare(b,'es')),
      tipos:uniqueText(rows.map(row=>equipmentType(row,ticketMap))).sort((a,b)=>a.localeCompare(b,'es'))
    };
  }

  function projectFilterMatch(row,query){
    const q=query||{},zone=upper(q.zona),state=upper(q.estado),supervisor=upper(q.supervisor),search=upper(q.search||q.buscar);
    if(zone&&!upper(row.zona_oficial).includes(zone))return false;
    if(state&&!upper(row.estado).includes(state))return false;
    if(supervisor&&!upper(row.supervisor_zona).includes(supervisor))return false;
    if(search){
      const hay=upper([row.proyecto,row.ciudad,row.estado,row.zona_oficial,row.supervisor_zona,row.numero_equipo].join(' '));
      if(!hay.includes(search))return false;
    }
    return true;
  }

  function projectFilters(userId,candidateDb){
    const rows=visiblePortfolio(userId,candidateDb,{includeInactive:true,canonicalZone:true});
    return {
      zonas:uniqueText(rows.map(row=>row.zona_oficial)).sort((a,b)=>a.localeCompare(b,'es')),
      estados:uniqueText(rows.map(row=>row.estado)).sort((a,b)=>a.localeCompare(b,'es')),
      supervisores:uniqueText(rows.map(row=>row.supervisor_zona)).sort((a,b)=>a.localeCompare(b,'es'))
    };
  }

  function projectList(query,userId,candidateDb){
    const db=dbOr(candidateDb),rows=visiblePortfolio(userId,db,{includeInactive:false,canonicalZone:true}).filter(row=>projectFilterMatch(row,query)),ticketMap=ticketsByEquipment(db);
    const now=new Date(),currentYear=now.getFullYear(),start35=new Date(now),start365=new Date(now);
    start35.setDate(start35.getDate()-35);start365.setDate(start365.getDate()-365);
    const projects=new Map();

    rows.forEach(row=>{
      const key=text(row.proyecto);if(!key)return;
      if(!projects.has(key))projects.set(key,{proyecto:key,names:[],cities:[],states:[],zones:new Set(),zoneIds:new Set(),supervisors:new Set(),equipment:0,stopped:0,tickets35:0,blt365:0,bltYear:0,lastBlt:null,clientYear:0,lastClient:null,mtbc:[]});
      const item=projects.get(key);item.names.push(row.nombre_publico);item.cities.push(row.ciudad);item.states.push(row.estado);if(row.zona_oficial)item.zones.add(text(row.zona_oficial));if(row.zona_id)item.zoneIds.add(Number(row.zona_id));if(text(row.supervisor_zona))item.supervisors.add(text(row.supervisor_zona));item.equipment++;
      const equipmentTickets=ticketMap.get(text(row.numero_equipo))||[];
      const latest=latestTicket(equipmentTickets);
      if(upper(latest?.estatus_equipo_final).includes('NO FUNC'))item.stopped++;
      let equipmentBlt365=0;
      equipmentTickets.forEach(ticket=>{
        const date=parseDate(ticket.fecha_reporte);if(!date)return;
        const responsibility=upper(ticket.responsabilidad);
        if(date>=start35)item.tickets35++;
        if(date>=start365&&responsibility==='BLT'){item.blt365++;equipmentBlt365++;}
        if(date.getFullYear()===currentYear&&responsibility==='BLT'){
          item.bltYear++;
          if(!item.lastBlt||date>(parseDate(item.lastBlt)||new Date(0)))item.lastBlt=ticket.fecha_reporte;
        }
        if(date.getFullYear()===currentYear&&responsibility==='CLIENTE'){
          item.clientYear++;
          if(!item.lastClient||date>(parseDate(item.lastClient)||new Date(0)))item.lastClient=ticket.fecha_reporte;
        }
      });
      item.mtbc.push(equipmentBlt365===0?365:365/equipmentBlt365);
    });

    const data=[...projects.values()].map(item=>{
      const publicName=maxText(item.names);
      return {
        proyecto:item.proyecto,
        proyecto_codigo:item.proyecto,
        proyecto_nombre:publicName||projectName(item.proyecto),
        nombre_publico:publicName,
        ciudad:maxText(item.cities),
        estado:maxText(item.states),
        zona:[...item.zones].sort((a,b)=>a.localeCompare(b,'es')).join(' / '),
        zona_oficial:[...item.zones].sort((a,b)=>a.localeCompare(b,'es')).join(' / '),
        zona_ids_oficiales:[...item.zoneIds].sort((a,b)=>a-b).join(','),
        supervisor:[...item.supervisors].sort((a,b)=>a.localeCompare(b,'es')).join(' / '),
        equipos:item.equipment,
        parados:item.stopped,
        tickets_35d:item.tickets35,
        fallas_blt_365d:item.blt365,
        llamadas_blt_anio:item.bltYear,
        ultima_llamada_blt:item.lastBlt,
        llamadas_cliente_anio:item.clientYear,
        ultima_llamada_cliente:item.lastClient,
        mtbc_365:item.mtbc.length?Math.round(item.mtbc.reduce((sum,value)=>sum+value,0)/item.mtbc.length):null
      };
    }).sort((a,b)=>Number(b.parados)-Number(a.parados)||Number(b.tickets_35d)-Number(a.tickets_35d)||String(a.proyecto).localeCompare(String(b.proyecto),'es'));

    const mtbc=data.map(row=>Number(row.mtbc_365)).filter(Number.isFinite);
    const summary={
      proyectos:data.length,
      equipos:data.reduce((sum,row)=>sum+Number(row.equipos||0),0),
      parados:data.reduce((sum,row)=>sum+Number(row.parados||0),0),
      mtbc_promedio:mtbc.length?Math.round(mtbc.reduce((sum,value)=>sum+value,0)/mtbc.length):null
    };
    return {summary,data};
  }

  function projectInitial(query,userId,candidateDb){
    const db=dbOr(candidateDb),scope=unitedScope(userId,db),result=projectList(query,userId,db);
    return {
      alcance:{zona_ids:scope.master?null:[...(scope.zoneIds||[])],zonas:scope.master?null:[...(scope.zoneCodes||[])]},
      filters:projectFilters(userId,db),
      summary:result.summary,
      data:result.data
    };
  }

  return Object.freeze({
    unitedScope,
    visiblePortfolio,
    rawPortfolio,
    portfolioFilters,
    projectFilters,
    projectList,
    projectInitial
  });
});
