#!/usr/bin/env node
// INT-10 | Fotografias | CatalogoGeneralMapaEstados | v001
// Servicio del Catalogo General + migracion 020 (permisos DG y dummy) + rutas + geometria del mapa, sobre sql.js.
'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm');
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
  for(const m of fs.readdirSync(path.join(ROOT,'lab/database/migrations')).filter(f=>/^\d+_.*\.sql$/.test(f)).sort()){if(m>='004')raw.exec(read('lab/database/migrations/'+m));}
  assert.equal(query('PRAGMA foreign_key_check').length,0);
  raw.exec(read('lab/database/migrations/020_fotografias_catalogo_general_mapa.sql')); // idempotente
  for(const f of ['lab-permissions.service.js','lab-scope.service.js','lab-installations.service.js','lab-fotografias-catalogo.service.js'])require(path.join(ROOT,'lab/backend/services/'+f));
  const S=global.ManttoLabFotografiasCatalogoService,perm=global.ManttoLabPermissionsService;

  // Norma Director General: lectura del Catalogo General por codigo de rol (los 8 permisos son de lectura)
  const dg=query("SELECT id_rol FROM roles WHERE codigo='DIRECTOR_GENERAL'")[0].id_rol;
  const total=scalar("SELECT COUNT(*) FROM perm_subelemento_acciones WHERE codigo_permiso LIKE 'FOTOGRAFIAS_CATALOGO_GENERAL_%'");
  assert.equal(total,8);
  assert.equal(scalar("SELECT COUNT(*) FROM rol_permisos rp JOIN perm_subelemento_acciones a ON a.id_subelemento_accion=rp.id_subelemento_accion WHERE rp.id_rol=? AND rp.permitido=1 AND a.codigo_permiso LIKE 'FOTOGRAFIAS_CATALOGO_GENERAL_%'",[dg]),8);
  assert.equal(perm.hasEffectivePermission(910001,'FOTOGRAFIAS_CATALOGO_GENERAL_ACCESO_VISUAL_MODULO.ACCESO_VISUAL',db),true);

  // fotografias(): formas que consume el modulo
  const d=S.fotografias(910001,{limit:5000},db);
  assert(d.corellian.length>=20,'corellian con fotos ficticias');assert.equal(d.united.length,scalar('SELECT COUNT(*) FROM portafolio_proyecto_fotos WHERE activo=1'));
  const row=d.corellian.find(r=>r['ID Proyecto']==='PPNS-LAB-0115');
  assert(row&&row.Estado==='Puebla'&&row.Proyecto&&row.Cliente);assert.equal(row.foto_principal,'foto_blt_1');
  assert(/^data:image\/svg\+xml/.test(row['FOTO BLT']));assert(row['FOTO BLT 5']&&!row['FOTO BLT 6'],'5 fotos en Puebla');
  const estados=new Set(d.corellian.map(r=>r.Estado));for(const e of ['Ciudad de México','Jalisco','Nuevo León','Yucatán','Quintana Roo','Oaxaca'])assert(estados.has(e),e);
  assert(d.united[0].proyecto_united&&'foto_1' in d.united[0]&&'proyecto_corellian' in d.united[0]);

  // navegacion: DG abre todo
  assert.equal(S.navegacionCorellian(910001,{},db).length,d.corellian.length);
  assert.equal(S.navegacionUnited(910001,{},db).length,d.united.length);
  const noDg=query("SELECT u.id_SB FROM usuarios u JOIN roles r ON r.id_rol=u.rol_id WHERE r.codigo<>'DIRECTOR_GENERAL' AND u.estado=1 LIMIT 40").map(r=>r.id_SB);
  assert(noDg.some(u=>{try{return S.navegacionCorellian(u,{},db).length<d.corellian.length;}catch(_e){return true;}}),'un usuario no-DG tiene navegacion acotada');

  // rutas
  const routes=[];const store={};const router=new Proxy(store,{get:(t,m)=>(String(m).startsWith('__')?t[m]:(p)=>{routes.push(String(m).toUpperCase()+' '+p);}),set:(t,m,v)=>{t[m]=v;return true;}});
  for(const f of ['lab-sales.service.js'])try{require(path.join(ROOT,'lab/backend/services/'+f));}catch(_e){}
  const R=require(path.join(ROOT,'lab/backend/routes/lab-sales-collections.routes.js'));R.register(router);
  for(const k of ['fotografias','navegacion-corellian','navegacion-united'])assert(routes.includes('GET /api/ventas/fotos-mapa/catalogo-general/'+k),'falta ruta '+k);

  // geometria del mapa: 32 entidades, ids y trazos unicos, sin dependencias externas
  const ctx={window:{}};vm.createContext(ctx);vm.runInContext(read('modules/ventas-fotos-mapa/mexico-estados.js'),ctx);
  const M=ctx.window.ManttoMexicoEstados;assert.equal(M.estados.length,32);assert.equal(new Set(M.estados.map(e=>e.id)).size,32);
  assert(M.estados.every(e=>/^m/i.test(e.path)&&e.name));assert(M.estados.some(e=>e.name==='Ciudad de México')&&M.estados.some(e=>e.name==='Estado de México'));
  assert(/CC BY 4\.0/.test(M.creditos));
  // todo estado con fotos en el dummy se reconoce en el mapa
  const norm=v=>String(v||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const nombres=new Set(M.estados.map(e=>norm(e.name)));
  for(const e of ['Ciudad de México','Jalisco','Nuevo León','Yucatán','Quintana Roo','Baja California','Sonora','Veracruz','Puebla','Querétaro','Guanajuato','Chihuahua','Oaxaca'])assert(nombres.has(norm(e)),'estado no reconocido '+e);
  console.log('INT-10 OK: permisos DG, servicio (shapes, 13 estados dummy), navegacion, 3 rutas, mapa 32 estados');
})().catch(e=>{console.error('FALLO',e.stack||e);process.exit(1);});
