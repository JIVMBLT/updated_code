#!/usr/bin/env node
'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
(async()=>{
 const initSqlJs=require(path.join(ROOT,'lab/vendor/sql.js/1.14.2/sql-wasm.js'));
 const SQL=await initSqlJs({locateFile:()=>path.join(ROOT,'lab/vendor/sql.js/1.14.2/sql-wasm.wasm')});
 let raw=new SQL.Database();raw.exec('PRAGMA foreign_keys=ON');
 for(const f of ['lab/database/schema.sql','lab/database/seed.sql','lab/database/migrations/004_permissions_catalog.sql','lab/database/migrations/005_shared_services.sql','lab/database/migrations/006_home_services.sql','lab/database/migrations/007_operation_portfolio.sql','lab/database/migrations/008_sales_collections.sql','lab/database/migrations/009_installations_logistics_warehouse.sql','lab/database/migrations/010_technical_closure.sql'])raw.exec(read(f));
 function query(sql,params){const st=raw.prepare(sql);try{if(params!==undefined)st.bind(params);const rows=[];while(st.step())rows.push(st.getAsObject());return rows;}finally{st.free();}}
 function scalar(sql,params){const rows=query(sql,params);return rows.length?rows[0][Object.keys(rows[0])[0]]:null;}
 const db={
  query,scalar,
  run(sql,params){params===undefined?raw.run(sql):raw.run(sql,params);return{changes:Number(scalar('SELECT changes()')||0),lastInsertRowId:Number(scalar('SELECT last_insert_rowid()')||0)};},
  async persist(){return{savedAt:new Date().toISOString(),sqliteUserVersion:Number(scalar('PRAGMA user_version')||0)};},
  exportBytes(){return raw.export();},
  databaseStatistics(){return{tables:Number(scalar("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")||0),sqliteUserVersion:Number(scalar('PRAGMA user_version')||0),foreignKeyViolations:query('PRAGMA foreign_key_check').length};},
  getStatus(){return{ready:true,lineage:'LAB_DGB_V2'};},
  async inspectBytes(bytes,opt){const c=new SQL.Database(bytes);try{const st=c.prepare('PRAGMA user_version');st.step();const uv=Number(st.get()[0]||0);st.free();if(opt?.expectedUserVersion!==undefined&&uv!==Number(opt.expectedUserVersion))throw new Error('version mismatch');return{valid:true,userVersion:uv,tables:93,foreignKeyViolations:0,bytes:bytes.length};}finally{c.close();}},
  async replaceWithBytes(bytes,opt){await this.inspectBytes(bytes,opt||{});raw.close();raw=new SQL.Database(bytes);raw.exec('PRAGMA foreign_keys=ON');return this.getStatus();}
 };
 global.ManttoLabDB=db;
 let blobEntries=[{key:'lab/test/a.txt',name:'a.txt',type:'text/plain',size:3,createdAt:'2026-09-14T00:00:00.000Z',metadata:{lab:true},dataBase64:Buffer.from('abc').toString('base64')}];
 const blobStore={
  async list(){return blobEntries.map(({dataBase64,...x})=>x);},
  async exportAll(){return JSON.parse(JSON.stringify(blobEntries));},
  validateImportEntries(entries){let total=0;for(const e of entries){const n=Buffer.from(e.dataBase64||'','base64').length;assert.equal(n,Number(e.size));total+=n;}return{entries,count:entries.length,totalBytes:total};},
  async importAll(entries){this.validateImportEntries(entries);blobEntries=JSON.parse(JSON.stringify(entries));return{count:entries.length,totalBytes:entries.reduce((s,e)=>s+Number(e.size),0)};}
 };
 global.ManttoLabBlobStore=blobStore;
 global.ManttoLabNotificationsService={status(req){return{nuevas:Number(req.contextUser?.id_SB?2:0),hay_nuevas:true};}};
 global.ManttoLabAuth={getUser(){return{id_SB:910006,rol:'Programador'};},getActorUser(){return{id_SB:910006,rol:'Programador'};}};
 const backup=require(path.join(ROOT,'lab/backend/services/lab-backup.service.js'));
 const jobs=require(path.join(ROOT,'lab/backend/services/lab-jobs.service.js'));
 global.ManttoLabBackupService=backup;global.ManttoLabJobsService=jobs;
 const routerApi=require(path.join(ROOT,'lab/backend/lab-router.js'));const router=routerApi.create();
 for(const f of ['lab-system.routes.js','lab-auth-permissions.routes.js','lab-shared.routes.js','lab-home.routes.js','lab-operation.routes.js','lab-sales-collections.routes.js','lab-installations-logistics-warehouse.routes.js','lab-technical.routes.js'])require(path.join(ROOT,'lab/backend/routes',f)).register(router);
 global.ManttoLabBackend={listRoutes:()=>router.list(),getStatus:()=>({ready:true,routes:router.list().length})};
 global.ManttoLabTransport={getStatus:()=>({ready:true,productionConnectionsAllowed:false})};
 global.ManttoLabPwa={getStatus:()=>({supported:true,registered:false,offlineScope:'LAB_ONLY'})};
 const diag=require(path.join(ROOT,'lab/backend/services/lab-diagnostics.service.js'));global.ManttoLabDiagnosticsService=diag;
 assert.equal(diag.isProgrammer({id_SB:910006},db),true);
 assert.equal(diag.isProgrammer({id_SB:910025},db),false);
 const coverage=diag.routeCoverage();assert.equal(coverage.total,290);assert.equal(coverage.byMethod.GET,174);
 const integrity=await jobs.run('integrity-check',{db});assert.equal(integrity.result.foreignKeyViolations,0);
 const notify=await jobs.run('notifications-refresh',{db,user:{id_SB:910006}});assert.equal(notify.result.nuevas,2);
 const storage=await jobs.run('storage-summary',{db,blobStore});assert.equal(storage.result.blobCount,1);
 const envelope=await backup.exportEnvelope({db,blobStore});assert.equal(envelope.userVersion,10);assert.equal(envelope.blobs.length,1);
 const originalName=String(scalar('SELECT nombre FROM usuarios WHERE id_SB=910006'));
 db.run("UPDATE usuarios SET nombre='MUTADO LAB' WHERE id_SB=910006");blobEntries=[];
 await backup.importEnvelope(envelope,{db,blobStore});
 assert.equal(String(scalar('SELECT nombre FROM usuarios WHERE id_SB=910006')),originalName);assert.equal(blobEntries.length,1);
 const health=await diag.health(db);assert.equal(health.database.foreignKeyViolations,0);assert.equal(health.database.sqliteUserVersion,10);
 console.log('FASE 10 runtime services: OK');
 console.log('routes',coverage.total);console.log('backup_blobs',blobEntries.length);console.log('user_version',scalar('PRAGMA user_version'));console.log('fk_violations',query('PRAGMA foreign_key_check').length);
})().catch(error=>{console.error(error);process.exit(1);});
