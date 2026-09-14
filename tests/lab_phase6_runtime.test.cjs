#!/usr/bin/env node
'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const ROOT=path.resolve(__dirname,'..');

function read(file){return fs.readFileSync(path.join(ROOT,file),'utf8');}
function createAdapter(SQL){
  const db=new SQL.Database();
  db.exec('PRAGMA foreign_keys=ON');
  function query(sql,params){
    const stmt=db.prepare(sql);
    try{if(params!==undefined)stmt.bind(params);const rows=[];while(stmt.step())rows.push(stmt.getAsObject());return rows;}finally{stmt.free();}
  }
  function scalar(sql,params){const rows=query(sql,params);if(!rows.length)return null;return rows[0][Object.keys(rows[0])[0]];}
  function run(sql,params){if(params===undefined)db.run(sql);else db.run(sql,params);return{changes:Number(scalar('SELECT changes()')||0),lastInsertRowId:Number(scalar('SELECT last_insert_rowid()')||0)};}
  function exec(sql){db.exec(sql);}
  return{db,query,scalar,run,exec};
}
function user(db,id){return db.query(`SELECT u.id_SB,u.nombre,u.iniciales,u.correo,u.empresa,u.rol_id,r.rol
  FROM usuarios u LEFT JOIN roles r ON r.id_rol=u.rol_id WHERE u.id_SB=? LIMIT 1`,[id])[0];}
function reqFor(db,id,body={},query={}){const u=user(db,id);return{method:'POST',path:'/api/test',body,query,user:u,contextUser:u,actorUser:u};}

(async()=>{
  const initSqlJs=require(path.join(ROOT,'lab/vendor/sql.js/1.14.2/sql-wasm.js'));
  const SQL=await initSqlJs({locateFile:()=>path.join(ROOT,'lab/vendor/sql.js/1.14.2/sql-wasm.wasm')});
  const adapter=createAdapter(SQL);
  adapter.exec(read('lab/database/schema.sql'));
  adapter.exec(read('lab/database/seed.sql'));
  adapter.exec(read('lab/database/migrations/004_permissions_catalog.sql'));
  adapter.exec(read('lab/database/migrations/005_shared_services.sql'));
  adapter.exec(read('lab/database/migrations/006_home_services.sql'));

  global.ManttoLabDB=adapter;
  global.ManttoRichText={sanitizeHtml:value=>String(value||'').replace(/<script[\s\S]*?<\/script>/gi,'').trim()};
  global.ManttoLabBlobStore={
    DB_NAME:'mantto_lab_dgb_blobs_v1',MAX_FILE_BYTES:25*1024*1024,
    isFileLike:()=>false,validate:value=>value,put:async()=>{throw new Error('not used');},
    accessUrl:async()=>null,remove:async()=>true,clear:async()=>true,count:async()=>0
  };
  require(path.join(ROOT,'lab/backend/services/lab-scope.service.js'));
  require(path.join(ROOT,'lab/backend/services/lab-shared-assets.service.js'));
  require(path.join(ROOT,'lab/backend/services/lab-interactions.service.js'));
  require(path.join(ROOT,'lab/backend/services/lab-notifications.service.js'));
  require(path.join(ROOT,'lab/backend/services/lab-tasks.service.js'));
  require(path.join(ROOT,'lab/backend/services/lab-home.service.js'));

  const scope=global.ManttoLabScopeService;
  assert.equal(scope.resolveUnited(910025,adapter).llave_maestra,false);
  assert(scope.resolveUnited(910025,adapter).zona_ids.length>0);

  const tasks=global.ManttoLabTasksService;
  const unitedReq=reqFor(adapter,910025,{},{});
  const unitedCatalogs=tasks.catalogs(unitedReq,adapter);
  assert.deepEqual(unitedCatalogs.empresas,[user(adapter,910025).empresa]);
  assert(unitedCatalogs.proyectos.length>0,'zone-scoped United user must see at least one project');
  const project=unitedCatalogs.proyectos[0].proyecto_codigo;
  const equipmentCatalogs=tasks.catalogs(reqFor(adapter,910025,{}, {empresa:user(adapter,910025).empresa,proyecto:project}),adapter);
  assert(equipmentCatalogs.equipos.length>0,'selected visible project must expose local visible equipment');
  const equipment=equipmentCatalogs.equipos[0].numero_equipo;

  const createReq=reqFor(adapter,910025,{
    pendiente:'Prueba runtime F6',tipo_pendiente:'PERSONAL',empresa:user(adapter,910025).empresa,
    proyecto:project,equipo:equipment,descripcion:'Texto <script>alert(1)</script><b>seguro</b>',usuarios_json:'[]',subtareas_json:'[]'
  });
  createReq.path='/api/pendientes';
  const created=await tasks.create(createReq,adapter);
  assert(created.id_pendiente>0);
  const createdRow=adapter.query('SELECT * FROM pendientes WHERE id_pendiente=?',[created.id_pendiente])[0];
  assert.equal(createdRow.prioridad,'MEDIA','personal task default priority');
  assert(!String(createdRow.descripcion).includes('<script'));

  let denied=false;
  try{
    await tasks.create(reqFor(adapter,910025,{pendiente:'Fuera alcance',tipo_pendiente:'PERSONAL',empresa:user(adapter,910025).empresa,proyecto:'LAB-NO-AUTORIZADO',usuarios_json:'[]',subtareas_json:'[]'}),adapter);
  }catch(error){denied=error.code==='PENDIENTE_PROYECTO_FUERA_ALCANCE';}
  assert(denied,'out-of-scope project must fail closed');

  // 950002 es colaborativa; L06 queda responsable por la migración F6.
  const detail=tasks.detail(reqFor(adapter,910006),950002,adapter);
  assert.equal(detail.permisos_contextuales.puede_cambiar_prioridad,true);
  const changed=await tasks.changePriority(reqFor(adapter,910006,{prioridad:'CRITICA'}),950002,adapter);
  assert.equal(changed.message,'Prioridad actualizada correctamente.');
  assert.equal(adapter.scalar('SELECT prioridad FROM pendientes WHERE id_pendiente=950002'),'CRITICA');

  // El creador L07 puede ver/editar la tarea, pero no definir prioridad de una colaborativa.
  let creatorPriorityDenied=false;
  try{await tasks.changePriority(reqFor(adapter,910007,{prioridad:'ALTA'}),950002,adapter);}catch(error){creatorPriorityDenied=error.code==='PENDIENTE_PRIORITY_FORBIDDEN';}
  assert(creatorPriorityDenied,'collaborative creator must not bypass responsible-only priority rule');

  const notifications=global.ManttoLabNotificationsService;
  const decision=notifications.policyDecision(910006,'tareas.comentario.creado','campana',adapter);
  assert.equal(decision.exists,true);
  assert.equal(decision.allowed,true);
  assert.equal(decision.mandatory,false);
  const mandatory=notifications.policyDecision(910001,'tareas.asignada','campana',adapter);
  assert.equal(mandatory.mandatory,true);
  assert.equal(mandatory.allowed,true);

  const interactions=global.ManttoLabInteractionsService;
  assert.equal(interactions.clientCreate({tipo_interaccion:'NAVEGACION'}).body.skipped,true);
  assert.equal(interactions.clientCreate({tipo_interaccion:'CREAR'}).status,400);

  const homeReq=reqFor(adapter,910006,{},{});
  homeReq.method='GET';homeReq.path='/api/home/snapshot';
  const snapshot=global.ManttoLabHomeService.snapshot(homeReq,adapter);
  assert.equal(snapshot.status,200);
  assert(Array.isArray(snapshot.body.data.pendientes));
  assert(Array.isArray(snapshot.body.data.actividad_reciente));

  console.log('FASE 6 runtime services: OK');
  console.log('created_task',created.id_pendiente);
  console.log('visible_tasks_910006',snapshot.body.data.pendientes.length);
  console.log('united_projects_910025',unitedCatalogs.proyectos.length);
})().catch(error=>{console.error(error);process.exit(1);});
