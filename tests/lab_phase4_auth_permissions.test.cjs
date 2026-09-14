#!/usr/bin/env node
'use strict';

const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const ROOT=path.resolve(__dirname,'..');
const initSqlJs=require(path.join(ROOT,'lab/vendor/sql.js/1.14.2/sql-wasm.js'));

function read(relative){return fs.readFileSync(path.join(ROOT,relative),'utf8');}
function load(relative,context){vm.runInContext(read(relative),context,{filename:relative});}

(async()=>{
  const SQL=await initSqlJs({locateFile:file=>path.join(ROOT,'lab/vendor/sql.js/1.14.2',file)});
  const raw=new SQL.Database();
  raw.exec(read('lab/database/schema.sql'));
  raw.exec(read('lab/database/seed.sql'));
  raw.exec(read('lab/database/migrations/004_permissions_catalog.sql'));

  const scalar=(sql,params)=>{
    const stmt=raw.prepare(sql);try{if(params!==undefined)stmt.bind(params);return stmt.step()?stmt.get()[0]:null;}finally{stmt.free();}
  };
  const query=(sql,params)=>{
    const stmt=raw.prepare(sql),rows=[];try{if(params!==undefined)stmt.bind(params);while(stmt.step())rows.push(stmt.getAsObject());return rows;}finally{stmt.free();}
  };
  const run=(sql,params)=>{if(params===undefined)raw.run(sql);else raw.run(sql,params);return{changes:Number(scalar('SELECT changes()')||0),lastInsertRowId:Number(scalar('SELECT last_insert_rowid()')||0)};};
  const db={query,scalar,run,exec:sql=>raw.exec(sql),async transaction(work){raw.run('BEGIN IMMEDIATE');try{const value=await work({query,scalar,run,exec:sql=>raw.exec(sql)});raw.run('COMMIT');return value;}catch(error){try{raw.run('ROLLBACK');}catch(_e){}throw error;}}};

  const context=vm.createContext({console,globalThis:null,URL,URLSearchParams,Headers,TextEncoder,TextDecoder,setTimeout,clearTimeout});
  context.globalThis=context;
  context.ManttoLabDB=db;
  load('lab/backend/lab-errors.js',context);
  load('lab/backend/lab-context.js',context);
  load('lab/backend/lab-router.js',context);
  load('lab/backend/lab-backend.js',context);
  load('lab/backend/services/lab-permissions.service.js',context);
  load('lab/backend/services/lab-scope.service.js',context);
  load('lab/backend/routes/lab-auth-permissions.routes.js',context);

  const P=context.ManttoLabPermissionsService;
  const S=context.ManttoLabScopeService;
  const viewerCode=P.VIEWER_PERMISSION_CODE;
  const viewerPid=P.permissionIdByCode(viewerCode,db);
  assert(viewerPid>0,'viewer permission catalogued');
  assert.strictEqual(P.hasEffectivePermission(910006,viewerCode,db),true,'Programador viewer inherited');

  run(`INSERT INTO usuario_permisos (id_usuario,id_subelemento_accion,permitido,motivo,activo) VALUES (910006,?,0,'test deny',1) ON CONFLICT(id_usuario,id_subelemento_accion) DO UPDATE SET permitido=0,activo=1`,[viewerPid]);
  assert.strictEqual(P.hasEffectivePermission(910006,viewerCode,db),false,'personal deny overrides role allow');
  run('UPDATE usuario_permisos SET activo=0 WHERE id_usuario=910006 AND id_subelemento_accion=?',[viewerPid]);
  assert.strictEqual(P.hasEffectivePermission(910006,viewerCode,db),true,'inherit restored');

  const cor=S.resolveCorellian(910009,db);
  assert.strictEqual(cor.llave_maestra,false);
  [910009,910031,910032,910034,910035,910059].forEach(id=>assert(cor.usuarios_visibles.includes(id),`CORELLIAN visible ${id}`));
  assert(!cor.usuarios_visibles.includes(910020),'REPORTA_A is direct, not recursive');
  const uni=S.resolveUnited(910009,db);
  assert.strictEqual(uni.llave_maestra,false);
  assert.deepStrictEqual(Array.from(uni.zona_codigos),['NOR-01','NOR-02','NOR-03','OCC-01','OCC-02']);
  assert.strictEqual(S.resolveUnited(910006,db).llave_maestra,true,'Programador synthetic seed has UNITED master');
  assert.strictEqual(S.canAccessRecord(S.snapshot(910009,db),{},db),false,'scope fails closed without evidence');

  function user(id){
    const row=query('SELECT id_SB,nombre,iniciales,correo,puesto,area,empresa,rol_id,reporta_a,estado FROM usuarios WHERE id_SB=?',[id])[0];
    const roles=P.activeRoles(id,db);const principal=roles.find(r=>r.principal)||roles[0]||{};
    return Object.assign({},row,{rol:principal.rol||'',roles:roles.map(r=>r.rol),roles_detalle:roles});
  }
  let actor=user(910006),view=null;
  context.ManttoLabAuth={getActorUser:()=>actor,getViewUser:()=>view,getUser:()=>view||actor,isViewingAs:()=>Boolean(view)};

  const backend=context.ManttoLabBackendModule.create({db,debug:true});
  context.ManttoLabAuthPermissionRoutes.register(backend.router);
  await backend.init();

  let response=await backend.dispatch('/api/panel-control/session-permissions');
  assert.strictEqual(response.status,200);
  assert.strictEqual(response.body.data.usuario_id,910006);
  assert.strictEqual(response.body.data.permisos.length,509);
  assert.strictEqual(response.body.data.puede_usar_visor,true);
  response=await backend.dispatch('/api/panel-control/usuarios/910009/permisos',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({changes:[{id_subelemento_accion:viewerPid,mode:'deny'}]})});
  assert.strictEqual(response.status,200,'user permission mutation');
  response=await backend.dispatch('/api/panel-control/usuarios/910009/permisos');
  assert.strictEqual(response.status,200);
  const viewerOverride=response.body.data.permisos.find(row=>Number(row.id_subelemento_accion)===viewerPid);
  assert.strictEqual(viewerOverride.personalizado,false,'user permission readback confirms deny');

  actor=user(910060);view=null;
  response=await backend.dispatch('/api/panel-control/viewer-users');
  assert.strictEqual(response.status,200);
  assert(response.body.data.usuarios.length>0);
  assert(response.body.data.usuarios.every(row=>String(row.empresa||'').toUpperCase().includes('UNITED')),'Programador United viewer scope');
  response=await backend.dispatch('/api/panel-control/bootstrap');
  assert.strictEqual(response.status,200,'Programador United panel bootstrap');
  assert(response.body.data.usuarios.every(row=>['GENERAL','UNITED'].includes(P.normalizeDomain(row.empresa))),'Programador United users limited to GENERAL + UNITED');
  assert(response.body.data.roles.every(row=>['GENERAL','UNITED'].includes(P.normalizeDomain(row.empresa))),'Programador United roles limited to GENERAL + UNITED');
  assert(response.body.data.catalogo.every(row=>['GENERAL','UNITED'].includes(P.normalizeDomain(row.agrupacion_empresa))),'Programador United catalog limited to GENERAL + UNITED');
  response=await backend.dispatch('/api/panel-control/usuarios/910009/alcance-informacion');
  assert.strictEqual(response.status,403,'Scoped Programador cannot administer global information scope');
  assert.strictEqual(response.body.code,'LAB_SCOPE_ADMIN_FORBIDDEN');

  actor=user(910006);view=null;
  response=await backend.dispatch('/api/panel-control/usuarios/910009/alcance-informacion',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({dominios_completos:['UNITED'],agrupaciones:[],ver_reporta_a:true,ver_rel_admin:false,usuarios_adicionales:[]})});
  assert.strictEqual(response.status,200,'admin scope mutation');
  response=await backend.dispatch('/api/panel-control/usuarios/910009/alcance-informacion');
  assert.strictEqual(response.body.data.dominios_completos.includes('UNITED'),true);
  assert.strictEqual(response.body.data.ver_reporta_a,true);

  view=user(910009);
  response=await backend.dispatch('/api/panel-control/usuarios/910009/alcance-informacion',{method:'PUT',headers:{'content-type':'application/json'},body:'{}'});
  assert.strictEqual(response.status,403,'viewer mutation denied');
  assert.strictEqual(response.body.code,'VIEWER_READ_ONLY');

  assert.strictEqual(Number(scalar('PRAGMA user_version')),4);
  assert.strictEqual(Number(scalar('SELECT COUNT(*) FROM pragma_foreign_key_check')),0);
  assert.strictEqual(Number(scalar('SELECT COUNT(*) FROM perm_acciones')),44);
  assert.strictEqual(Number(scalar('SELECT COUNT(*) FROM perm_subelemento_acciones')),510);
  assert.strictEqual(Number(scalar('SELECT COUNT(*) FROM rol_permisos')),14669);

  console.log('FASE4_V002_AUTH_PERMISSIONS_OK');
  raw.close();
})().catch(error=>{console.error(error);process.exitCode=1;});
