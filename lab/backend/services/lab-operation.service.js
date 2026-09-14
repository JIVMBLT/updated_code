(function initManttoLabOperationService(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.ManttoLabOperationService=api;
})(typeof globalThis!=='undefined'?globalThis:this,function createManttoLabOperationService(root){
  'use strict';

  function dbOr(candidate){
    const db=candidate||root?.ManttoLabDB;
    if(!db||typeof db.query!=='function'||typeof db.scalar!=='function')throw new Error('MANTTO_LAB_DB_REQUIRED');
    return db;
  }
  function assets(){
    const svc=root?.ManttoLabSharedAssetsService;
    if(!svc)throw new Error('MANTTO_LAB_SHARED_ASSETS_REQUIRED');
    return svc;
  }
  function txt(value){return String(value==null?'':value).trim();}
  function upper(value){return txt(value).toUpperCase();}
  function isoDay(value){const m=txt(value).match(/^(\d{4}-\d{2}-\d{2})/);return m?m[1]:null;}
  function dateValue(value){const day=isoDay(value);if(!day)return null;const date=new Date(day+'T12:00:00');return Number.isNaN(date.getTime())?null:date;}
  function scope(userId,candidateDb){
    const resolved=assets().unitedScope(Number(userId),dbOr(candidateDb));
    return {
      all:resolved.master===true,
      master:resolved.master===true,
      zoneIds:Array.isArray(resolved.zoneIds)?resolved.zoneIds.map(Number).filter(Number.isInteger):[],
      zones:Array.isArray(resolved.zoneCodes)?resolved.zoneCodes.map(txt).filter(Boolean):[],
      raw:resolved.raw||null
    };
  }
  function alcance(userId,candidateDb){const resolved=scope(userId,candidateDb);return{zona_ids:resolved.all?null:resolved.zoneIds,zonas:resolved.all?null:resolved.zones};}
  function visiblePortfolio(userId,candidateDb,options){
    const cfg=Object.assign({includeInactive:true,canonicalZone:true},options||{});
    return assets().visiblePortfolio(Number(userId),dbOr(candidateDb),cfg);
  }
  function portfolioCodeMap(userId,candidateDb,options){
    const map=new Map();visiblePortfolio(userId,candidateDb,options).forEach(row=>{const code=txt(row.numero_equipo);if(code)map.set(code,row);});return map;
  }
  function projectMap(rows){
    const map=new Map();
    (rows||[]).forEach(row=>{const key=upper(row.proyecto);if(key&&!map.has(key))map.set(key,row);});
    return map;
  }
  function canonicalTicket(row,equipmentMap,projects){
    const code=txt(row.codigo_equipo||row.equipo);
    const pf=(code?equipmentMap.get(code):null)||projects.get(upper(row.proyecto))||projects.get(upper(row.proyecto_padre))||null;
    return {...row,zona_oficial:pf?.zona_oficial||null,zona_id_oficial:pf?.zona_id||null,zona:pf?.zona_oficial||null};
  }
  function visibleTickets(userId,candidateDb,options){
    const db=dbOr(candidateDb),cfg=Object.assign({from:null,to:null,limit:50000},options||{});
    const portfolio=visiblePortfolio(userId,db,{includeInactive:true,canonicalZone:true});
    if(!portfolio.length)return[];
    const equipmentMap=new Map(portfolio.map(row=>[txt(row.numero_equipo),row]));
    const projects=projectMap(portfolio);
    const from=cfg.from?String(cfg.from).slice(0,10):null;
    const to=cfg.to?String(cfg.to).slice(0,10):null;
    const limit=Math.max(1,Math.min(50000,Number(cfg.limit)||50000));
    return db.query('SELECT * FROM tickets ORDER BY fecha_reporte DESC,id DESC LIMIT ?',[limit]).filter(row=>{
      const code=txt(row.codigo_equipo||row.equipo);
      const match=code?equipmentMap.get(code):(projects.get(upper(row.proyecto))||projects.get(upper(row.proyecto_padre)));
      if(!match)return false;
      const day=isoDay(row.fecha_reporte);
      if(from&&(!day||day<from))return false;
      if(to&&(!day||day>to))return false;
      return true;
    }).map(row=>canonicalTicket(row,equipmentMap,projects));
  }
  function resumenInicial(userId,candidateDb){
    const db=dbOr(candidateDb),portfolio=visiblePortfolio(userId,db,{includeInactive:true,canonicalZone:true}).map(row=>({...row,zona:row.zona_oficial||null,zona_operativa_legacy:row.zona_operativa||null,zona_operativa:row.zona_oficial||null})),tickets=visibleTickets(userId,db);
    return{ok:true,source:'lab-sqlite',data:{tickets,portafolio:portfolio},alcance:alcance(userId,db),total:{tickets:tickets.length,portafolio:portfolio.length}};
  }
  function callCenterInicial(userId,query,candidateDb){
    const db=dbOr(candidateDb),q=query||{},tickets=visibleTickets(userId,db,{from:q.from||q.desde,to:q.to||q.hasta}),portfolio=visiblePortfolio(userId,db,{includeInactive:true,canonicalZone:true}).map(row=>({...row,zona:row.zona_oficial||null,zona_operativa_legacy:row.zona_operativa||null,zona_operativa:row.zona_oficial||null}));
    const period={from:q.from||q.desde||null,to:q.to||q.hasta||null};
    return{ok:true,source:'lab-sqlite',data:{tickets,portafolio:portfolio,period},period,alcance:alcance(userId,db),total:{tickets:tickets.length,portafolio:portfolio.length}};
  }
  function monthKey(value){const raw=txt(value).replace('_','-');return /^\d{4}-\d{2}$/.test(raw)?raw:null;}
  function supervisorRows(userId,candidateDb){
    const db=dbOr(candidateDb),resolved=scope(userId,db),all=root?.ManttoLabUsersService?.supervisorsMaintenance?.(db)||[];
    if(resolved.all)return all;
    const allowed=new Set(resolved.zoneIds.map(Number));
    return all.map(item=>({...item,zonas:(item.zonas||[]).filter(zone=>allowed.has(Number(zone.id_zona)))})).filter(item=>(item.zonas||[]).length);
  }
  function preventivosPorSupervisor(userId,mes,candidateDb){
    const db=dbOr(candidateDb),month=monthKey(mes)||new Date().toISOString().slice(0,7),portfolio=visiblePortfolio(userId,db,{includeInactive:false,canonicalZone:true}),codeMap=new Map(portfolio.map(row=>[txt(row.numero_equipo),row])),supervisors=supervisorRows(userId,db),byZone=new Map();
    db.query('SELECT * FROM servicios_preventivos WHERE substr(mes_servicio,1,7)=? ORDER BY id_servicio',[month]).forEach(row=>{
      const pf=codeMap.get(txt(row.numero_equipo));if(!pf)return;const zoneId=Number(pf.zona_id||0);if(!byZone.has(zoneId))byZone.set(zoneId,{programados:0,realizados:0});const item=byZone.get(zoneId);item.programados+=1;if(Number(row.servicio_realizado||0)===1)item.realizados+=1;
    });
    return supervisors.map(supervisor=>{
      let programados=0,realizados=0;const zones=[];
      (supervisor.zonas||[]).forEach(zone=>{zones.push(zone.zona||zone.nombre);const item=byZone.get(Number(zone.id_zona))||{programados:0,realizados:0};programados+=item.programados;realizados+=item.realizados;});
      return{supervisor_id:Number(supervisor.id_SB),supervisor:supervisor.nombre,zonas:zones,programados,realizados,porcentaje:programados?Math.round(realizados/programados*100):0};
    });
  }
  function dashboardOperativo(userId,mes,candidateDb){
    const db=dbOr(candidateDb),month=monthKey(mes)||new Date().toISOString().slice(0,7),portfolio=visiblePortfolio(userId,db,{includeInactive:true,canonicalZone:true}).map(row=>({...row,zona:row.zona_oficial||null,zona_operativa_legacy:row.zona_operativa||null,zona_operativa:row.zona_oficial||null})),tickets=visibleTickets(userId,db),supervisores=supervisorRows(userId,db),preventivos=preventivosPorSupervisor(userId,month,db),access=alcance(userId,db);
    return{ok:true,source:'lab-sqlite',mes:month,data:{portafolio,tickets,supervisores,preventivos_supervisor:preventivos},alcance:access,total:{portafolio:portfolio.length,tickets:tickets.length,supervisores:supervisores.length}};
  }
  function activeInServicePortfolio(userId,candidateDb){
    return visiblePortfolio(userId,candidateDb,{includeInactive:false,canonicalZone:true}).filter(row=>!upper(row.estatus_servicio).includes('NO EN SERVICIO'));
  }

  return Object.freeze({txt,upper,isoDay,dateValue,scope,alcance,visiblePortfolio,visibleTickets,resumenInicial,callCenterInicial,preventivosPorSupervisor,dashboardOperativo,activeInServicePortfolio,canonicalTicket});
});
