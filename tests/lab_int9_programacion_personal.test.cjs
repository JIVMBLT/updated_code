#!/usr/bin/env node
// INT-9 | Instalaciones | ProgramacionPersonal | v001
// Servicio + migracion 019 + permisos + rutas, contra SQLite real (sql.js) con seed y dummy ficticios.
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
  const migs=fs.readdirSync(path.join(ROOT,'lab/database/migrations')).filter(f=>/^\d+_.*\.sql$/.test(f)).sort();
  for(const m of migs){if(m<'004')continue;raw.exec(read('lab/database/migrations/'+m));}
  assert.equal(query('PRAGMA foreign_key_check').length,0,'migracion 019 sin violaciones de FK');
  // idempotencia
  raw.exec(read('lab/database/migrations/019_instalaciones_programacion_personal.sql'));
  for(const f of ['lab-permissions.service.js','lab-scope.service.js','lab-installations.service.js','lab-instalaciones-programacion.service.js'])require(path.join(ROOT,'lab/backend/services/'+f));
  const P=global.ManttoLabInstalacionesProgramacionService,perm=global.ManttoLabPermissionsService;
  const uid=910051,actor={id_SB:uid};
  const HOY='2026-10-07';
  let n=0;const ok=(m)=>{n++;};

  // --- Dummy y permisos
  assert.equal(scalar('SELECT COUNT(*) FROM instalaciones_personal_montadores'),15);
  assert.equal(scalar('SELECT COUNT(*) FROM instalaciones_personal_ajustadores'),6);
  assert.equal(scalar('SELECT COUNT(*) FROM instalaciones_programacion_asignaciones'),38);
  for(const a of ['VER','CREAR','EDITAR','DESACTIVAR']){
    assert.equal(scalar("SELECT COUNT(*) FROM perm_subelemento_acciones WHERE codigo_permiso='INSTALACIONES_PROGRAMACION_PERSONAL_CALENDARIO_PROGRAMACION."+a+"'"),1);
    assert.equal(perm.hasEffectivePermission(910001,'INSTALACIONES_PROGRAMACION_PERSONAL_CALENDARIO_PROGRAMACION.'+a,db),true,'R01 '+a);
  }
  ok();
  // --- Opciones y personal
  const op=P.opciones(uid,db);assert.deepEqual(op.puestos,['Mecánico','Ayudante']);assert(op.montadores.contratistas.length>=2);
  const mont=P.listarPersonal(uid,{tipo:'MONTADOR'},db);assert.equal(mont.total??mont.data.length,15);
  assert.equal(P.listarPersonal(uid,{tipo:'AJUSTADOR'},db).data.length,6);
  assert.throws(()=>P.crearPersonal(uid,{tipo:'MONTADOR',nombre:'X',contratista:'',puesto:'Mecánico'},actor,db),/contratista/i);
  assert.throws(()=>P.crearPersonal(uid,{tipo:'MONTADOR',nombre:'X',contratista:'C',puesto:'Soldador'},actor,db),/puesto/i);
  assert.throws(()=>P.crearPersonal(uid,{tipo:'OTRO',nombre:'X'},actor,db));
  const nuevo=P.crearPersonal(uid,{tipo:'AJUSTADOR',nombre:'Prueba Ajustador',categoria:'Senior',experiencia:'5 años'},actor,db);
  assert.equal(nuevo.nombre,'Prueba Ajustador');
  assert.throws(()=>P.crearPersonal(uid,{tipo:'AJUSTADOR',nombre:'prueba ajustador'},actor,db),/ya existe|duplic/i);
  const ed=P.editarPersonal(uid,'AJUSTADOR',nuevo.id_personal,{experiencia:'6 años'},actor,db);assert.equal(ed.experiencia,'6 años');
  ok();
  // --- Equipos y ventana de fechas
  const eqM=P.equipos(uid,{tipo:'MONTADOR'},db),eqA=P.equipos(uid,{tipo:'AJUSTADOR'},db);
  assert(eqM.equipos.length>=6,'equipos dummy visibles');
  const V=P._ventanaEquipo;
  let v=V('MONTADOR',{fecha_inicio_montaje:'2026-11-02',fecha_fin_montaje_planeado:'2026-11-06',fecha_fin_montaje_modificado:'2026-11-08',fecha_fin_montaje_real:null});
  assert.deepEqual([v.inicio,v.fin,v.dias,v.fuente_fin,v.valida],['2026-11-02','2026-11-08',7,'modificado',true]);
  v=V('MONTADOR',{fecha_inicio_montaje:'2026-11-02',fecha_fin_montaje_planeado:'2026-11-06',fecha_fin_montaje_real:'2026-11-10'});assert.equal(v.fin,'2026-11-10');assert.equal(v.fuente_fin,'real');
  v=V('MONTADOR',{fecha_inicio_montaje:'2026-11-02'});assert.equal(v.valida,false);
  v=V('AJUSTADOR',{fecha_inicio_ajuste:'2026-12-01',fecha_fin_ajuste_planeado:'2026-12-01'});assert.equal(v.dias,1);
  ok();
  // --- Asignaciones: alta, duplicada, traslape con confirmacion
  const libre=eqM.equipos.find(e=>e.valida&&e.asignados===0)||eqM.equipos.find(e=>e.valida);
  const persona=P.crearPersonal(uid,{tipo:'MONTADOR',contratista:'Contratista Prueba',nombre:'Persona Uno',puesto:'Mecánico',categoria:'A'},actor,db);
  const persona2=P.crearPersonal(uid,{tipo:'MONTADOR',contratista:'Contratista Prueba',nombre:'Persona Dos',puesto:'Ayudante',categoria:'B'},actor,db);
  let r=P.crearAsignaciones(uid,{tipo:'MONTADOR',id_ins_fl:libre.id_ins_fl,ids_personal:[persona.id_personal,persona2.id_personal]},actor,db);
  assert.equal(r.creadas.length,2);assert.equal(r.requiere_confirmacion,false);
  assert.throws(()=>P.crearAsignaciones(uid,{tipo:'MONTADOR',id_ins_fl:libre.id_ins_fl,ids_personal:[persona.id_personal]},actor,db),/Ya está asignado/);
  const otro=eqM.equipos.find(e=>e.valida&&e.id_ins_fl!==libre.id_ins_fl&&e.inicio<=libre.fin&&e.fin>=libre.inicio);
  if(otro){
    r=P.crearAsignaciones(uid,{tipo:'MONTADOR',id_ins_fl:otro.id_ins_fl,ids_personal:[persona.id_personal]},actor,db);
    assert.equal(r.requiere_confirmacion,true);assert.equal(r.creadas.length,0);assert.equal(r.conflictos[0].id_personal,persona.id_personal);
    r=P.crearAsignaciones(uid,{tipo:'MONTADOR',id_ins_fl:otro.id_ins_fl,ids_personal:[persona.id_personal],permitir_traslape:true},actor,db);
    assert.equal(r.creadas.length,1);
  }
  assert.throws(()=>P.crearAsignaciones(uid,{tipo:'MONTADOR',id_ins_fl:libre.id_ins_fl,ids_personal:[]},actor,db),/al menos una/);
  assert.throws(()=>P.crearAsignaciones(uid,{tipo:'MONTADOR',id_ins_fl:999999999,ids_personal:[persona.id_personal]},actor,db));
  assert.throws(()=>P.eliminarPersonal(uid,'MONTADOR',persona.id_personal,actor,db,{hoy:'2020-01-01'}),/asignación/i);
  ok();
  // --- Calendario, edicion, historial
  const cal=P.calendario(uid,{tipo:'MONTADOR',desde:libre.inicio,hasta:libre.fin,hoy:HOY},db);
  assert(cal.asignaciones.some(a=>a.id_personal===persona.id_personal));
  const asg=cal.asignaciones.find(a=>a.id_personal===persona.id_personal&&a.id_ins_fl===libre.id_ins_fl);
  const e2=P.editarAsignacion(uid,asg.id_asignacion,{fecha_desde:libre.inicio,fecha_hasta:libre.inicio,notas:'Relevo',permitir_traslape:true},actor,db);
  assert.equal(e2.actualizada,true);assert.equal(e2.asignacion.fin,libre.inicio);assert.equal(e2.asignacion.dias,1);
  assert.throws(()=>P.editarAsignacion(uid,asg.id_asignacion,{fecha_desde:'2026-12-31',fecha_hasta:'2026-01-01'},actor,db));
  const h=P.historial(uid,{tipo:'MONTADOR',id_personal:persona.id_personal,hoy:'2099-01-01'},db);
  assert(h.filas.length>=1,'historial con la asignacion');assert(h.resumen.total_asignaciones>=1);
  P.eliminarAsignacion(uid,asg.id_asignacion,actor,db);
  assert.throws(()=>P.eliminarAsignacion(uid,asg.id_asignacion,actor,db),/no encontrada/i);
  ok();
  // --- Disponibilidad y simulacion largas
  for(const [g,desde,hasta] of [['dia','2026-10-01','2026-12-31'],['semana','2026-10-01','2027-12-31'],['mes','2026-10-01','2030-12-31']]){
    const d=P.disponibilidad(uid,{tipo:'MONTADOR',granularidad:g,desde,hasta,hoy:HOY},db);
    assert(d.buckets.length>0);assert.equal(d.total_personal,17);
    for(const b of d.buckets)assert(b);
  }
  assert.throws(()=>P.disponibilidad(uid,{tipo:'MONTADOR',granularidad:'dia',desde:'2026-01-01',hasta:'2030-01-01'},db),/granularidad|rango|máximo|buckets|periodo/i);
  const s=P.simulacion(uid,{tipo:'MONTADOR',fecha_inicio:'2027-03-01',fecha_fin:'2027-03-10',mecanicos:2,ayudantes:2,hoy:HOY},db);
  assert.equal(s.tipo,'MONTADOR');assert('viable' in s);
  const s2=P.simulacion(uid,{tipo:'AJUSTADOR',fecha_inicio:'2027-03-01',fecha_fin:'2027-03-10',ajustadores:99,hoy:HOY},db);
  assert.equal(s2.viable,false);
  const antes=scalar('SELECT COUNT(*) FROM instalaciones_programacion_asignaciones');
  P.simulacion(uid,{tipo:'MONTADOR',fecha_inicio:'2026-10-01',fecha_fin:'2026-12-31',mecanicos:1,ayudantes:1,hoy:HOY},db);
  assert.equal(scalar('SELECT COUNT(*) FROM instalaciones_programacion_asignaciones'),antes,'simulacion no escribe');
  ok();
  // --- Alcance: usuario inexistente no ve equipos
  assert.throws(()=>P.equipos(999999,{tipo:'MONTADOR'},db),/no existe|inactivo/);
  // --- Norma Director General: lectura universal por codigo de rol, desde esta integracion
  const dg=query("SELECT id_rol FROM roles WHERE codigo='DIRECTOR_GENERAL'")[0].id_rol;
  for(const a of ['VER','CREAR','EDITAR','DESACTIVAR'])assert.equal(scalar("SELECT COUNT(*) FROM rol_permisos rp JOIN perm_subelemento_acciones x ON x.id_subelemento_accion=rp.id_subelemento_accion WHERE rp.id_rol=? AND rp.permitido=1 AND x.codigo_permiso='INSTALACIONES_PROGRAMACION_PERSONAL_CALENDARIO_PROGRAMACION.'||?",[dg,a]),1,'DG '+a);
  const totalIns=scalar('SELECT COUNT(*) FROM ins_fl WHERE activo=1');
  const todosEq=P.equipos(910001,{tipo:'MONTADOR'},db);
  assert.equal(todosEq.total,totalIns,'DG ve todos los equipos activos, sin filtro de alcance');
  // Un usuario que no es DG no recibe la lectura universal (se rige por su alcance).
  const noDg=query("SELECT u.id_SB FROM usuarios u JOIN roles r ON r.id_rol=u.rol_id WHERE r.codigo<>'DIRECTOR_GENERAL' AND u.estado=1 LIMIT 40").map(r=>r.id_SB);
  let restringido=false;for(const u of noDg){try{if(P.equipos(u,{tipo:'MONTADOR'},db).total<totalIns){restringido=true;break;}}catch(_e){restringido=true;break;}}
  assert(restringido,'existe al menos un usuario no-DG con alcance menor');
  ok();
  // --- Rutas
  const routes=[];const store={};const router=new Proxy(store,{get:(t,m)=>(String(m).startsWith('__')?t[m]:(p)=>{routes.push(String(m).toUpperCase()+' '+p);}),set:(t,m,v)=>{t[m]=v;return true;}});
  global.ManttoLabInstalacionesContactosService=global.ManttoLabInstalacionesContactosService||{};
  const R=require(path.join(ROOT,'lab/backend/routes/lab-installations-logistics-warehouse.routes.js'));R.register(router);
  const esperadas=['GET /opciones','GET /equipos','GET /personal','POST /personal','PUT /personal/:tipo/:id','DELETE /personal/:tipo/:id','GET /calendario','POST /asignaciones','PUT /asignaciones/:id','DELETE /asignaciones/:id','GET /historial','GET /disponibilidad','GET /simulacion'];
  for(const k of esperadas){const [m,p]=k.split(' ');assert(routes.includes(m+' /api/instalaciones/programacion'+p),'falta ruta '+k);}
  console.log('INT-9 OK: dummy, permisos, personal, fechas, asignaciones/conflictos, historial, disponibilidad, simulacion, alcance, 13 rutas');
})().catch(e=>{console.error('FALLO',e.stack||e);process.exit(1);});
