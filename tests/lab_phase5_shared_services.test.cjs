#!/usr/bin/env node
'use strict';

const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const ROOT=path.resolve(__dirname,'..');
const initSqlJs=require(path.join(ROOT,'lab/vendor/sql.js/1.14.2/sql-wasm.js'));
const read=relative=>fs.readFileSync(path.join(ROOT,relative),'utf8');
const load=(relative,context)=>vm.runInContext(read(relative),context,{filename:relative});

(async()=>{
  const SQL=await initSqlJs({locateFile:file=>path.join(ROOT,'lab/vendor/sql.js/1.14.2',file)});
  const raw=new SQL.Database();
  raw.exec(read('lab/database/schema.sql'));
  raw.exec(read('lab/database/seed.sql'));
  raw.exec(read('lab/database/migrations/004_permissions_catalog.sql'));
  raw.exec(read('lab/database/migrations/005_shared_services.sql'));

  const scalar=(sql,params)=>{const stmt=raw.prepare(sql);try{if(params!==undefined)stmt.bind(params);return stmt.step()?stmt.get()[0]:null;}finally{stmt.free();}};
  const query=(sql,params)=>{const stmt=raw.prepare(sql),rows=[];try{if(params!==undefined)stmt.bind(params);while(stmt.step())rows.push(stmt.getAsObject());return rows;}finally{stmt.free();}};
  const run=(sql,params)=>{if(params===undefined)raw.run(sql);else raw.run(sql,params);return{changes:Number(scalar('SELECT changes()')||0),lastInsertRowId:Number(scalar('SELECT last_insert_rowid()')||0)};};
  const db={query,scalar,run,exec:sql=>raw.exec(sql),async transaction(work){raw.run('BEGIN IMMEDIATE');try{const value=await work({query,scalar,run,exec:sql=>raw.exec(sql)});raw.run('COMMIT');return value;}catch(error){try{raw.run('ROLLBACK');}catch(_e){}throw error;}}};

  const context=vm.createContext({console,globalThis:null,URL,URLSearchParams,Headers,TextEncoder,TextDecoder,setTimeout,clearTimeout,Date,Math});
  context.globalThis=context;
  context.ManttoLabDB=db;
  [
    'lab/backend/lab-errors.js','lab/backend/lab-context.js','lab/backend/lab-router.js','lab/backend/lab-backend.js',
    'lab/backend/services/lab-permissions.service.js','lab/backend/services/lab-scope.service.js','lab/backend/routes/lab-auth-permissions.routes.js',
    'lab/backend/services/lab-catalogs.service.js','lab/backend/services/lab-users.service.js','lab/backend/services/lab-relations.service.js',
    'lab/backend/services/lab-shared-assets.service.js','lab/backend/routes/lab-shared.routes.js'
  ].forEach(file=>load(file,context));

  const P=context.ManttoLabPermissionsService;
  function user(id){
    const row=query('SELECT id_SB,nombre,iniciales,correo,puesto,area,empresa,rol_id,reporta_a,estado FROM usuarios WHERE id_SB=?',[id])[0];
    const roles=P.activeRoles(id,db);const principal=roles.find(role=>role.principal)||roles[0]||{};
    return Object.assign({},row,{rol:principal.rol||'',roles:roles.map(role=>role.rol),roles_detalle:roles});
  }
  let actor=user(910006),view=null;
  context.ManttoLabAuth={getActorUser:()=>actor,getViewUser:()=>view,getUser:()=>view||actor,isViewingAs:()=>Boolean(view)};

  const backend=context.ManttoLabBackendModule.create({db,debug:true});
  context.ManttoLabAuthPermissionRoutes.register(backend.router);
  context.ManttoLabSharedRoutes.register(backend.router);
  await backend.init();

  let response=await backend.dispatch('/api/catalogos/roles');
  assert.strictEqual(response.status,200,'catalog roles');
  assert.strictEqual(response.body.source,'lab-sqlite');
  assert(response.body.data.length>0);
  assert.deepStrictEqual(Object.keys(response.body.data[0]).sort(),['descripcion','estado','id_rol','rol'].sort());

  response=await backend.dispatch('/api/catalogos/zonas');
  assert.strictEqual(response.status,200,'catalog zones');
  assert(response.body.data.length>0);

  response=await backend.dispatch('/api/estados-visuales?codigos=ACTIVO,CRITICO');
  assert.strictEqual(response.status,200,'visual states');
  assert.strictEqual(response.body.total,response.body.data.length);

  response=await backend.dispatch('/api/permisos');
  assert.strictEqual(response.status,501,'legacy permisos fails explicitly when source table is absent');
  assert.strictEqual(response.body.code,'LAB_LEGACY_PERMISOS_TABLE_UNAVAILABLE');

  response=await backend.dispatch('/api/usuarios/directorio');
  assert.strictEqual(response.status,200,'directory');
  assert(response.body.data.length>0);

  response=await backend.dispatch('/api/usuarios/910009/detalle');
  assert.strictEqual(response.status,200,'user detail');
  assert(Array.isArray(response.body.data.roles_detalle));
  assert(Array.isArray(response.body.data.zonas_detalle));

  response=await backend.dispatch('/api/usuarios/me/criticos-preferencias');
  assert.strictEqual(response.status,200,'critical preferences');
  const previous={...response.body.data};
  response=await backend.dispatch('/api/usuarios/me/criticos-preferencias',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({criticos_fallas:7,criticos_periodo:42})});
  assert.strictEqual(response.status,200,'critical preferences update');
  assert.strictEqual(Number(response.body.data.criticos_fallas),7);
  assert.strictEqual(Number(response.body.data.criticos_periodo),42);
  run('UPDATE usuarios SET criticos_fallas=?,criticos_periodo=? WHERE id_SB=910006',[previous.criticos_fallas,previous.criticos_periodo]);

  response=await backend.dispatch('/api/usuarios-rel-admin');
  assert.strictEqual(response.status,200,'admin relations');

  response=await backend.dispatch('/api/usuarios',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({
    nombre:'Usuario LAB Fase 5',iniciales:'F5X',puesto:'Pruebas LAB',area:'Sistemas LAB',empresa:'BLT LAB',
    correo:'fase5x@lab.invalid',rol_id:6,reporta_a:910001,estado:1,id_pregunta:11,role_ids:[6],zona_ids:[1]
  })});
  assert.strictEqual(response.status,201,'synthetic LAB user creation');
  const createdUserId=Number(response.body.data.id_SB);
  assert(createdUserId>0);
  assert.strictEqual(response.body.data.password_temporal,null);
  assert.strictEqual(response.body.data.lab_no_password,true);
  assert.strictEqual(query('SELECT pass FROM usuarios WHERE id_SB=?',[createdUserId])[0].pass,'LAB_NO_PASSWORD');

  response=await backend.dispatch('/api/usuarios',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({
    nombre:'No permitido',iniciales:'RXX',puesto:'Pruebas',area:'Pruebas',empresa:'BLT LAB',correo:'persona@example.com',rol_id:6
  })});
  assert.strictEqual(response.status,400,'non-synthetic email rejected');
  assert.strictEqual(response.body.code,'LAB_SYNTHETIC_EMAIL_REQUIRED');

  response=await backend.dispatch(`/api/usuarios/${createdUserId}`,{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({
    nombre:'Usuario LAB Fase 5 Editado',iniciales:'F5X',puesto:'Pruebas LAB',area:'QA LAB',empresa:'BLT LAB',
    correo:'fase5x@lab.invalid',rol_id:6,reporta_a:910001,estado:1,role_ids:[6],zona_ids:[1]
  })});
  assert.strictEqual(response.status,200,'synthetic LAB user update');
  assert.strictEqual(query('SELECT area FROM usuarios WHERE id_SB=?',[createdUserId])[0].area,'QA LAB');

  response=await backend.dispatch(`/api/usuarios/${createdUserId}/reset-credentials`,{method:'POST',headers:{'content-type':'application/json'},body:'{}'});
  assert.strictEqual(response.status,200,'LAB credential reset');
  assert.strictEqual(response.body.data.temporary_password,null);
  assert.strictEqual(response.body.data.lab_no_password,true);

  response=await backend.dispatch('/api/usuarios-rel-admin',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id_asesor:createdUserId,id_admin:910006})});
  assert.strictEqual(response.status,201,'relation create');
  const relationId=Number(response.body.data.id_rel_admin);
  assert(relationId>0);
  response=await backend.dispatch(`/api/usuarios-rel-admin/${relationId}`,{method:'DELETE'});
  assert.strictEqual(response.status,200,'relation delete');

  response=await backend.dispatch('/api/proyectos');
  assert.strictEqual(response.status,200,'project shared list');
  assert.strictEqual(response.body.source,'lab-sqlite');
  assert(response.body.summary.proyectos>0,'projects visible for global programmer');
  assert(response.body.data.every(row=>row.proyecto&&Number(row.equipos)>0));

  response=await backend.dispatch('/api/proyectos/inicial');
  assert.strictEqual(response.status,403,'project initial requires its dedicated functional permission');
  assert.strictEqual(response.body.code,'LAB_FUNCTIONAL_PERMISSION_DENIED');
  const maintenanceCode=context.ManttoLabSharedRoutes.PROJECT_MAINTENANCE_PERMISSION;
  const maintenancePid=P.permissionIdByCode(maintenanceCode,db);
  const programmerRole=P.activeRoles(910006,db)[0];
  run(`INSERT INTO rol_permisos (id_rol,id_subelemento_accion,permitido) VALUES (?,?,1)
       ON CONFLICT(id_rol,id_subelemento_accion) DO UPDATE SET permitido=1`,[Number(programmerRole.id_rol),maintenancePid]);
  response=await backend.dispatch('/api/proyectos/inicial');
  assert.strictEqual(response.status,200,'project initial after explicit dedicated permission');
  assert.strictEqual(response.body.module,'PORTAFOLIO_PROYECTOS_DE_MANTENIMIENTO');
  assert.strictEqual(response.body.alcance.zona_ids,null,'UNITED master does not require zone filter');

  response=await backend.dispatch('/api/proyectos?detalle=1&proyecto=LAB');
  assert.strictEqual(response.status,501,'full project detail deferred to phase 7');
  assert.strictEqual(response.body.code,'LAB_PHASE7_PROJECT_DETAIL_PENDING');

  response=await backend.dispatch('/api/portafolio/filtros');
  assert.strictEqual(response.status,200,'portfolio filters');
  assert(Array.isArray(response.body.filters.zonas));

  response=await backend.dispatch('/api/portafolio');
  assert.strictEqual(response.status,200,'raw portfolio');
  assert(response.body.data.length>0);
  const portfolioCount=response.body.data.length;
  response=await backend.dispatch('/api/equipos');
  assert.strictEqual(response.status,200,'equipment alias');
  assert.strictEqual(response.body.data.length,portfolioCount);

  response=await backend.dispatch('/api/__lab/shared-services');
  assert.strictEqual(response.status,200,'shared diagnostic');
  assert.strictEqual(response.body.data.productionConnectionsAllowed,false);

  const nonMasterScope=context.ManttoLabSharedAssetsService.unitedScope(910009,db);
  assert.strictEqual(nonMasterScope.master,false);
  assert(nonMasterScope.zoneIds.length>0,'non-master has assigned zones');
  const nonMasterPortfolio=context.ManttoLabSharedAssetsService.rawPortfolio(910009,db);
  assert(nonMasterPortfolio.length>0,'non-master sees assigned portfolio');
  assert(nonMasterPortfolio.every(row=>nonMasterScope.zoneIds.includes(Number(row.zona_id))),'non-master portfolio is zone-scoped');

  assert.strictEqual(Number(scalar('PRAGMA user_version')),5);
  assert.strictEqual(query('PRAGMA foreign_key_check').length,0);

  const routePatterns=backend.listRoutes().map(route=>`${route.method} ${route.path}`);
  ['GET /api/catalogos/roles','GET /api/usuarios','GET /api/proyectos','GET /api/portafolio','GET /api/equipos'].forEach(route=>assert(routePatterns.includes(route),route));
  assert(!routePatterns.includes('GET /api/proyectos/:proyecto'),'Phase 5 must not shadow the future Phase 7 detail route');
  assert(!routePatterns.includes('GET /api/portafolio/equipos/:codigo'),'Phase 5 must not shadow the future Phase 7 equipment detail route');

  console.log('FASE5_V002_SHARED_SERVICES_OK');
  raw.close();
})().catch(error=>{console.error(error);process.exitCode=1;});
