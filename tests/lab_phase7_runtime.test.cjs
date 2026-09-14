#!/usr/bin/env node
'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
function createAdapter(SQL){
  const db=new SQL.Database();db.exec('PRAGMA foreign_keys=ON');
  function query(sql,params){const stmt=db.prepare(sql);try{if(params!==undefined)stmt.bind(params);const rows=[];while(stmt.step())rows.push(stmt.getAsObject());return rows;}finally{stmt.free();}}
  function scalar(sql,params){const rows=query(sql,params);if(!rows.length)return null;return rows[0][Object.keys(rows[0])[0]];}
  function run(sql,params){if(params===undefined)db.run(sql);else db.run(sql,params);return{changes:Number(scalar('SELECT changes()')||0),lastInsertRowId:Number(scalar('SELECT last_insert_rowid()')||0)};}
  return{db,query,scalar,run,exec:sql=>db.exec(sql)};
}
function user(db,id){return db.query(`SELECT u.id_SB,u.nombre,u.iniciales,u.correo,u.empresa,u.rol_id,r.rol FROM usuarios u LEFT JOIN roles r ON r.id_rol=u.rol_id WHERE u.id_SB=? LIMIT 1`,[id])[0];}
(async()=>{
  const initSqlJs=require(path.join(ROOT,'lab/vendor/sql.js/1.14.2/sql-wasm.js'));
  const SQL=await initSqlJs({locateFile:()=>path.join(ROOT,'lab/vendor/sql.js/1.14.2/sql-wasm.wasm')});
  const db=createAdapter(SQL);global.ManttoLabDB=db;
  for(const file of ['lab/database/schema.sql','lab/database/seed.sql','lab/database/migrations/004_permissions_catalog.sql','lab/database/migrations/005_shared_services.sql','lab/database/migrations/006_home_services.sql','lab/database/migrations/007_operation_portfolio.sql'])db.exec(read(file));
  require(path.join(ROOT,'lab/backend/services/lab-scope.service.js'));
  require(path.join(ROOT,'lab/backend/services/lab-users.service.js'));
  require(path.join(ROOT,'lab/backend/services/lab-shared-assets.service.js'));
  require(path.join(ROOT,'lab/backend/services/lab-interactions.service.js'));
  require(path.join(ROOT,'lab/backend/services/lab-operation.service.js'));
  require(path.join(ROOT,'lab/backend/services/lab-criticals.service.js'));
  require(path.join(ROOT,'lab/backend/services/lab-portfolio.service.js'));
  require(path.join(ROOT,'lab/backend/services/lab-movements.service.js'));
  require(path.join(ROOT,'lab/backend/services/lab-followup.service.js'));
  require(path.join(ROOT,'lab/backend/services/lab-tickets.service.js'));

  const op=global.ManttoLabOperationService,pf=global.ManttoLabPortfolioService,mov=global.ManttoLabMovementsService,crit=global.ManttoLabCriticalsService,tickets=global.ManttoLabTicketsService;
  const full=op.visiblePortfolio(910006,db,{includeInactive:true,canonicalZone:true});
  const scoped=op.visiblePortfolio(910025,db,{includeInactive:true,canonicalZone:true});
  assert.equal(full.length,15,'global programmer must see all UNITED LAB equipment');
  assert.equal(scoped.length,2,'zone scoped supervisor must only see assigned zone equipment');
  assert(scoped.every(row=>Number(row.zona_id)===1),'scoped user must stay in canonical zone_id 1');

  const resumen=op.resumenInicial(910025,db);
  assert.equal(resumen.total.portafolio,2);
  assert(resumen.data.tickets.every(row=>Number(row.zona_id_oficial)===1));
  const dash=pf.dashboardInitial(910006,{},db);
  assert.equal(dash.equipos.pagination.total,15);
  assert.equal(Number(dash.dashboard.kpis.total_activos),15);
  assert.equal(dash.dashboard.kpis.gratuito_garantia,dash.dashboard.kpis.gratuito);

  const monthly=mov.monthly(910006,{},db);
  assert(monthly.data.some(row=>row.tipo_movimiento==='DEGRADADO'));
  assert(monthly.data.some(row=>row.tipo_movimiento==='RECUPERADO'));
  assert(monthly.data.some(row=>row.tipo_movimiento==='CAMBIO'));
  const weekly=mov.weekly(910025,{anio:2026,semana:37},db);
  assert(weekly&&weekly.data.length===0,'CNB-01 scoped user must not receive movements from CNB-02/CNB-03/CNA-01');
  const weeklyFull=mov.weekly(910006,{anio:2026,semana:37},db);
  assert.equal(weeklyFull.data.length,3);
  assert(weeklyFull.data.every(row=>Number(row.zona_id_oficial)>0));

  const critical=crit.equiposCriticos(910006,{dias:35,min_fallas:3},db);
  const eq=critical.data.find(row=>row.numero_equipo==='99001-LAB-ESC-DGB'||row.codigo_equipo==='99001-LAB-ESC-DGB');
  assert(eq,'99001 must be critical in deterministic LAB fixture');
  assert(Number(eq.fallas_blt_periodo)>=3);

  const eqDetail=pf.equipmentDetail(910006,'99001-LAB-ESC-DGB',{},db);
  assert(eqDetail&&eqDetail.data.numero_equipo==='99001-LAB-ESC-DGB');
  const projectDetail=pf.projectDetail(910006,'LAB - PUNTO VALLE',{},db);
  assert(projectDetail&&projectDetail.proyecto.proyecto_codigo==='LAB - PUNTO VALLE');

  const visibleTicket=op.visibleTickets(910006,db)[0];
  assert(visibleTicket);
  const actor=user(db,910006);
  const added=await tickets.addComment(910006,visibleTicket.ticket,{comentario:'Comentario local F7'},actor,db);
  assert(added.id_comentario>0);
  const vobo=await tickets.saveVobo(910006,visibleTicket.ticket,{vobo_estado:'VALIDADO',vobo_comentario:'VoBo local F7'},actor,db);
  assert.equal(vobo.vobo_estado,'VALIDADO');
  assert(Number(db.scalar('SELECT COUNT(*) FROM ticket_comentarios WHERE id_comentario=?',[added.id_comentario]))===1);
  assert(Number(db.scalar('SELECT COUNT(*) FROM ticket_validaciones WHERE id_ticket=?',[visibleTicket.id]))>=1);
  assert(Number(db.scalar("SELECT COUNT(*) FROM usuario_interacciones WHERE id_usuario=910006 AND modulo='tickets'"))>=2);

  console.log('FASE 7 runtime services: OK');
  console.log('full_portfolio',full.length);
  console.log('scoped_portfolio_910025',scoped.length);
  console.log('monthly_movements',monthly.data.length);
  console.log('weekly_full',weeklyFull.data.length);
  console.log('critical_99001_blt',eq.fallas_blt_periodo);
})().catch(error=>{console.error(error);process.exit(1);});
