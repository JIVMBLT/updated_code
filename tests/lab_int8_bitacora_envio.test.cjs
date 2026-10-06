#!/usr/bin/env node
// INT-8 | Instalaciones | ContactosYEnvioBitacora | v001
// Prueba de servicio + catalogo de permisos + registro de rutas, contra SQLite real (sql.js) con seed ficticio.
'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
(async()=>{
  const init=require(path.join(ROOT,'lab/vendor/sql.js/1.14.2/sql-wasm.js'));
  const SQL=await init({locateFile:()=>path.join(ROOT,'lab/vendor/sql.js/1.14.2/sql-wasm.wasm')});
  const raw=new SQL.Database();raw.exec('PRAGMA foreign_keys=ON');
  const query=(s,p)=>{const st=raw.prepare(s);try{if(p!==undefined)st.bind(p);const r=[];while(st.step())r.push(st.getAsObject());return r;}finally{st.free();}};
  const scalar=(s,p)=>{const r=query(s,p);return r.length?r[0][Object.keys(r[0])[0]]:null;};
  const db={query,scalar,run(s,p){p===undefined?raw.run(s):raw.run(s,p);return{changes:Number(scalar('SELECT changes()')||0),lastInsertRowId:Number(scalar('SELECT last_insert_rowid()')||0)};}};
  global.ManttoLabDB=db;
  raw.exec(read('lab/database/schema.sql'));raw.exec(read('lab/database/seed.sql'));
  for(const m of ['004_permissions_catalog','005_shared_services','006_home_services','007_operation_portfolio','008_sales_collections','009_installations_logistics_warehouse','010_technical_closure','011_informes_traslado','012_instalaciones_contactos','013_rol_director_general_permisos_nuevos','017_instalaciones_bitacora_envios'])raw.exec(read('lab/database/migrations/'+m+'.sql'));
  assert.equal(query('PRAGMA foreign_key_check').length,0,'migracion 017 sin violaciones de FK');
  for(const f of ['lab-permissions.service.js','lab-scope.service.js','lab-installations.service.js','lab-instalaciones-contactos.service.js'])require(path.join(ROOT,'lab/backend/services/'+f));
  const ins=global.ManttoLabInstallationsService,con=global.ManttoLabInstalacionesContactosService,perm=global.ManttoLabPermissionsService;
  const uid=910051,actor={id_SB:uid};

  // Permiso de la Bitacora: existe en catalogo y esta concedido a LAB R01 (rol 1).
  assert.equal(scalar("SELECT COUNT(*) FROM perm_subelemento_acciones WHERE codigo_permiso='INSTALACIONES_PROYECTOS_DETALLE_PROYECTO_BITACORA.VER'"),1);
  assert.equal(scalar("SELECT COUNT(*) FROM rol_permisos rp JOIN perm_subelemento_acciones a ON a.id_subelemento_accion=rp.id_subelemento_accion WHERE rp.id_rol=1 AND rp.permitido=1 AND a.codigo_permiso='INSTALACIONES_PROYECTOS_DETALLE_PROYECTO_BITACORA.VER'"),1);
  assert.equal(perm.hasEffectivePermission(910001,'INSTALACIONES_PROYECTOS_DETALLE_PROYECTO_BITACORA.VER',db),true);

  // detail(): asesor/admin iniciales, contactos y envios por documento.
  const d0=ins.detail(uid,'PPNS-LAB-0005',db);
  assert(d0.proyecto.asesor_iniciales&&d0.proyecto.admin_iniciales);assert.equal(d0.contactos.length,0);
  const doc=d0.documentos[0],cats=con.opciones(uid,db).categorias;
  // Sin categorias / sin contactos con correo -> error claro, no se registra nada.
  assert.throws(()=>ins.sendBitacoraDocument(uid,'PPNS-LAB-0005',doc.id_documento,{categorias:[]},actor,db),/al menos una categoría/);
  assert.throws(()=>ins.sendBitacoraDocument(uid,'PPNS-LAB-0005',doc.id_documento,{categorias:[cats[0]]},actor,db),/No hay contactos/);
  assert.equal(scalar('SELECT COUNT(*) FROM instalaciones_bitacora_envios'),0);
  // Contactos: 2 con correo (cats 0 y 1), 1 sin correo (cat 2).
  const idFl=d0.proyecto.id_ins_fl;
  con.crear(uid,{nombre:'Ana',correo:'ana@lab.test',categoria:cats[0],id_ins_fl:idFl},actor,db);
  con.crear(uid,{nombre:'Beto',correo:'beto@lab.test',categoria:cats[1],id_ins_fl:idFl},actor,db);
  con.crear(uid,{nombre:'Caro',correo:'',categoria:cats[2],id_ins_fl:idFl},actor,db);
  let r=ins.sendBitacoraDocument(uid,'PPNS-LAB-0005',doc.id_documento,{categorias:[cats[0]]},actor,db);assert.equal(r.total_destinatarios,1);
  r=ins.sendBitacoraDocument(uid,'PPNS-LAB-0005',doc.id_documento,{categorias:cats},actor,db);
  assert.deepEqual(r.destinatarios.map(x=>x.correo).sort(),['ana@lab.test','beto@lab.test']);
  assert.throws(()=>ins.sendBitacoraDocument(uid,'PPNS-LAB-0005',999999,{categorias:cats},actor,db),/no encontrado/);
  assert.throws(()=>ins.sendBitacoraDocument(999999,'PPNS-LAB-0005',doc.id_documento,{categorias:cats},{id_SB:999999},db),/fuera de alcance|no existe/);
  assert.equal(scalar('SELECT COUNT(*) FROM instalaciones_bitacora_envios'),2);

  // bitacora(): formato que consume el panel de core/details.js.
  const b=ins.bitacora(uid,'PPNS-LAB-0005',db);
  assert(Array.isArray(b.documentos)&&b.documentos.length>=1);assert(b.documentos[0].fecha_movimiento);
  assert.equal(b.contactos.length,3);assert.deepEqual(b.categorias_contacto,cats);assert(b.sincronizacion&&'ultima_sincronizacion' in b.sincronizacion);
  assert.equal(b.documentos.find(x=>x.id_documento===doc.id_documento).total_envios,2);

  // Rutas registradas (contrato).
  const routes=[];const store={};const router=new Proxy(store,{get:(t,m)=>(String(m).startsWith('__')?t[m]:(p)=>{routes.push(String(m).toUpperCase()+' '+p);}),set:(t,m,v)=>{t[m]=v;return true;}});
  global.ManttoLabInstalacionesContactosService=con;
  const R=require(path.join(ROOT,'lab/backend/routes/lab-installations-logistics-warehouse.routes.js'));R.register(router);
  for(const k of ['POST /api/instalaciones/proyectos/:id/documentos/:idDocumento/enviar','GET /api/instalaciones/bitacora/:id','POST /api/instalaciones/bitacora/:id/sync','GET /api/ins-fl'])assert(routes.includes(k),'falta ruta '+k);
  console.log('INT-8 OK: permiso, detail, envio (7 casos), bitacora() y 4 rutas');
})().catch(e=>{console.error('FALLO',e.stack||e);process.exit(1);});
