#!/usr/bin/env node
'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
function createAdapter(SQL){
  const raw=new SQL.Database();raw.exec('PRAGMA foreign_keys=ON');
  function query(sql,params){const st=raw.prepare(sql);try{if(params!==undefined)st.bind(params);const rows=[];while(st.step())rows.push(st.getAsObject());return rows;}finally{st.free();}}
  function scalar(sql,params){const rows=query(sql,params);if(!rows.length)return null;return rows[0][Object.keys(rows[0])[0]];}
  function run(sql,params){if(params===undefined)raw.run(sql);else raw.run(sql,params);return{changes:Number(scalar('SELECT changes()')||0),lastInsertRowId:Number(scalar('SELECT last_insert_rowid()')||0)};}
  return{raw,query,scalar,run,exec:sql=>raw.exec(sql)};
}
function actor(db,id){return db.query('SELECT id_SB,nombre,iniciales,correo,empresa,rol_id,puesto FROM usuarios WHERE id_SB=? AND estado=1 LIMIT 1',[id])[0];}
(async()=>{
  const initSqlJs=require(path.join(ROOT,'lab/vendor/sql.js/1.14.2/sql-wasm.js'));
  const SQL=await initSqlJs({locateFile:()=>path.join(ROOT,'lab/vendor/sql.js/1.14.2/sql-wasm.wasm')});
  const db=createAdapter(SQL);global.ManttoLabDB=db;
  for(const file of ['lab/database/schema.sql','lab/database/seed.sql','lab/database/migrations/004_permissions_catalog.sql','lab/database/migrations/005_shared_services.sql','lab/database/migrations/006_home_services.sql','lab/database/migrations/007_operation_portfolio.sql','lab/database/migrations/008_sales_collections.sql'])db.exec(read(file));
  require(path.join(ROOT,'lab/backend/services/lab-scope.service.js'));
  global.ManttoLabBlobStore={
    put:async file=>({key:'phase8-test-blob',name:file?.name||'test.txt',type:file?.type||'text/plain',size:Number(file?.size||1)}),
    accessUrl:async()=>({url:'blob:phase8-test'}),
    remove:async()=>true
  };
  require(path.join(ROOT,'lab/backend/services/lab-sales.service.js'));
  require(path.join(ROOT,'lab/backend/services/lab-collections-uni.service.js'));
  require(path.join(ROOT,'lab/backend/services/lab-collections-cor.service.js'));
  const sales=global.ManttoLabSalesService,uni=global.ManttoLabCollectionsUniService,cor=global.ManttoLabCollectionsCorService;
  const full=actor(db,910006);assert(full,'LAB full-scope actor missing');

  const catalogs=sales.clientCatalogs(910006,db);
  assert(Array.isArray(catalogs.tipo_cliente));assert(Array.isArray(catalogs.estatus_cliente));assert(Array.isArray(catalogs.estado));assert(Array.isArray(catalogs.iniciales));
  const clients=sales.listClients(910006,{page:1,page_size:25},db);
  assert.equal(clients.pagination.page,1);assert.equal(clients.pagination.total,10);assert.equal(clients.clientes.length,10);
  assert(Object.prototype.hasOwnProperty.call(clients.clientes[0],'cotizaciones'));

  const quoteCatalog=sales.quoteCatalogs(910006,db);
  assert(quoteCatalog.estatus.includes('En Contrato'));assert(quoteCatalog.tipos_equipo.includes('Elevador'));
  const quotes=sales.listQuotes(910006,{page:1,page_size:25},db);assert.equal(quotes.cotizaciones.length,10);
  const created=sales.createQuote({
    nombre_proyecto:'LAB F8 QUOTE TEST',id_cliente:960001,id_contacto:961001,
    estatus_proyecto:'Contacto',equipos:[{tipo_equipo:'Elevador',cantidad:2}],fecha_solicitud:'2026-09-14'
  },full,db);
  assert(created&&created.id_cotizacion>0,'quote create failed');
  const qid=Number(created.id_cotizacion);
  const sold=sales.updateQuoteStatus(910006,qid,{estatus_proyecto:'Vendido',fecha_cierre:'2026-09-14',motivo:'QA F8'},full,db);
  assert.equal(sold.estatus_proyecto,'Vendido');
  const history=sales.listHistory(910006,qid,{},db);assert(history.historial.some(row=>row.estatus_nuevo==='Vendido'));
  const interested=await sales.setInterest(910006,qid,true,full,db);assert.equal(interested.proyecto_interes,true);assert.equal(interested.personal,true);
  assert(Number(db.scalar("SELECT COUNT(*) FROM usuario_interacciones WHERE id_usuario=910006 AND modulo='ventas-cotizaciones' AND entidad='cotizacion' AND id_referencia=?",[String(qid)]))>=1);

  const dashboardUsers=sales.dashboardUsers(910006,db).usuarios;assert(dashboardUsers.length>0);
  const advisor=dashboardUsers.find(row=>Number(row.id_usuario)===910039)||dashboardUsers[0];
  const selected=sales.dashboardTables(910006,{usuario_id:String(advisor.id_usuario),anio:2026},db);
  assert.equal(selected.modo,'USER');assert.equal(Number(selected.usuario_id),Number(advisor.id_usuario));
  assert(Object.keys(selected.tablas).sort().join(',')==='clientes,cotizaciones,perdido,prospeccion,redes,ventas');
  const allKpis=sales.dashboardKpis(910006,{usuario_id:'todos',anio:2026},db);assert(allKpis.kpis.cotizados&&allKpis.kpis.vendidos&&allKpis.kpis.perdidos);
  const operation=sales.dashboardOperation(910006,{usuario_id:String(advisor.id_usuario)},db);assert(operation.tablas&&Array.isArray(operation.tablas.tareas_asignadas));

  const prospectCatalog=sales.prospectCatalogs(910006,db);
  assert(prospectCatalog.anios.every(Number.isInteger));assert(prospectCatalog.anios.includes(2026));
  assert(prospectCatalog.estatus.every(value=>typeof value==='string'));assert(prospectCatalog.estatus.length>0);
  const captureCatalog=sales.prospectCaptureCatalogs(db);assert(Array.isArray(captureCatalog.estados));assert(Array.isArray(captureCatalog.tipos_proyecto));
  const sourceQuotes=sales.prospectSources(910006,{tipo:'COTIZADO',q:'LAB'},db);assert(sourceQuotes.length>0);assert(sourceQuotes[0].id_cotizacion);
  const sourceInstallations=sales.prospectSources(910006,{tipo:'INSTALACION',q:'LAB'},db);assert(sourceInstallations.length>0);assert(sourceInstallations[0].id_proyecto);
  const sourceContacts=sales.prospectContacts(910006,960001,db);assert(sourceContacts.length>0);assert(Object.prototype.hasOwnProperty.call(sourceContacts[0],'contacto'));
  const prospect=sales.listProspects(910006,{page:1,page_size:30,anio:2026},db);assert.equal(prospect.prospecciones.length,10);assert.equal(prospect.pagination.total,10);assert.equal(prospect.pagination.page,1);
  const prospectFiltered=sales.listProspects(910006,{q:'Prospección LAB 01'},db);assert(prospectFiltered.pagination.total>=1);
  const prospectKpis=sales.prospectKpis(910006,{anio:2026},db).kpis;for(const key of ['visitas','con_ubicacion','este_anio','estatus_activos'])assert(Object.prototype.hasOwnProperty.call(prospectKpis,key));assert.equal(prospectKpis.visitas,10);
  const mapPoints=sales.prospectMap(910006,{anio:2026},db);assert(Array.isArray(mapPoints));
  const restrictedClients=sales.listClients(910039,{page:1,page_size:30},db);assert.equal(restrictedClients.pagination.total,10);

  const networkCatalog=sales.networkCatalogs(910006,db);assert(networkCatalog.contacto_via.length>0);assert(networkCatalog.estatus.length>0);
  const network=sales.listNetworks(910006,{},db);assert.equal(network.registros.length,10);assert.equal(network.pagination.total,10);assert(Object.prototype.hasOwnProperty.call(network.registros[0],'contacto_via'));
  const restrictedNetworks=sales.listNetworks(910039,{},db);assert.equal(restrictedNetworks.pagination.total,10);

  const credit=uni.listCredit(910006,{},db);assert.equal(credit.data.length,15);assert(credit.alcance);
  const mp=uni.listPreventive(910006,{},db);assert.equal(mp.data.length,15);
  const va=uni.listAdditionalSales(910006,{},db);assert.equal(va.data.length,15);

  const states=cor.listStatements(910006,{},db);assert.equal(states.data.length,10);
  const detail=cor.statementDetail(910006,states.data[0].id_indice_cor,db);assert(detail.data&&Array.isArray(detail.data.fuentes));
  const additions=cor.listAdditions(910006,{},db);assert.equal(additions.data.length,10);
  const added=cor.createAddition(910006,{id_indice_cor:states.data[0].id_indice_cor,proyecto:'LAB F8 ADITIVA',monto_subtotal:1000,iva_pct:0.16,monto_pagado:200,moneda:'MXN'},full,db);
  assert(added.data&&added.data.id_aditiva_cor>0);
  const updated=cor.updateAddition(910006,added.data.id_aditiva_cor,{monto_pagado:500},full,db);
  assert.equal(Number(updated.data.monto_pagado),500);
  const debts=cor.contractualDebts(910006,{},db);assert(Array.isArray(debts.data));

  assert.equal(Number(db.scalar('PRAGMA user_version')),8);
  assert.equal(Number(db.scalar('SELECT COUNT(*) FROM pragma_foreign_key_check')),0);
  console.log('FASE 8 runtime services: OK');
  console.log('clients',clients.clientes.length);
  console.log('quotes_after_create',Number(db.scalar('SELECT COUNT(*) FROM ventas_cotizaciones_cor WHERE activo=1')));
  console.log('dashboard_users',dashboardUsers.length);
  console.log('cobranza_uni_credit',credit.data.length);
  console.log('cobranza_cor_states',states.data.length);
})().catch(error=>{console.error(error);process.exit(1);});
