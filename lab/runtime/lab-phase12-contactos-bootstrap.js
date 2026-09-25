// [Claude | 2026-09-19 | CLAUDE-MG | LAB DGB - INSTALACIONES CONTACTOS V001]
// Mismo patron que lab-phase11-informes-bootstrap.js: aplica la migracion
// via PRAGMA user_version como puerta de idempotencia, y confirma que el
// servicio de contactos ya haya cargado.
(function initManttoLabPhase12ContactosBootstrap(global){
'use strict';
const TARGET_USER_VERSION=12;
const VERSION='FASE_12_LAB_DGB_INSTALACIONES_CONTACTOS_V001';
function rootUrl(){const src=document.currentScript?.src||'';if(src)return new URL('../',src).toString();return new URL('./lab/',global.location?.href||'https://lab.invalid/').toString();}
const LAB_ROOT=rootUrl();
const MIGRATION_URL=new URL('database/migrations/012_instalaciones_contactos.sql',LAB_ROOT).toString();
async function fetchText(url){const response=await global.fetch(url,{cache:'no-store'});if(!response.ok)throw new Error(`LAB_PHASE12_RESOURCE_FAILED ${response.status} ${url}`);return response.text();}
async function applyMigration(){
  if(global.ManttoLabPhase11InformesReady)await global.ManttoLabPhase11InformesReady;
  const db=global.ManttoLabDB;
  if(!db)throw new Error('MANTTO_LAB_DB_REQUIRED');
  const before=Number(db.scalar('PRAGMA user_version')||0);
  if(before<TARGET_USER_VERSION){
    const sql=await fetchText(MIGRATION_URL);
    await db.exec(sql,{persist:false});
    const violations=db.query('PRAGMA foreign_key_check');
    if(violations.length)throw new Error(`LAB_PHASE12_FOREIGN_KEY_CHECK_FAILED count=${violations.length}`);
    await db.exec('PRAGMA user_version = '+TARGET_USER_VERSION,{persist:false});
    await db.persist('phase12-instalaciones-contactos-v001-migration');
  }
  const after=Number(db.scalar('PRAGMA user_version')||0);
  if(after<TARGET_USER_VERSION)throw new Error(`LAB_PHASE12_MIGRATION_INCOMPLETE user_version=${after}`);
  return{userVersion:after,permiso:'INSTALACIONES_CONTACTOS_DIRECTORIO_LISTADO.VER'};
}
function checkServiceLoaded(){
  if(!global.ManttoLabInstalacionesContactosService)throw new Error('MANTTO_LAB_INSTALACIONES_CONTACTOS_SERVICE_REQUIRED');
  return true;
}
const ready=(async()=>{
  if(global.ManttoLabPhase11InformesReady)await global.ManttoLabPhase11InformesReady;
  const migration=await applyMigration();
  checkServiceLoaded();
  const status={ready:true,version:VERSION,migration,instalacionesContactos:true};
  document?.dispatchEvent?.(new CustomEvent('mantto:lab-phase12-contactos-ready',{detail:status}));
  return status;
})();
global.ManttoLabPhase12Contactos=Object.freeze({VERSION,ready,applyMigration,TARGET_USER_VERSION});
global.ManttoLabPhase12ContactosReady=ready;
})(typeof window!=='undefined'?window:globalThis);
