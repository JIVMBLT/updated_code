// [Claude | 2026-09-17 | CLAUDE-MG | LAB DGB - TRASLADO INFORMES V001]
// Mismo patron que lab-phase10-bootstrap.js: aplica la migracion via
// PRAGMA user_version como puerta de idempotencia, y registra el
// modulo Informes (ya registrado dentro de lab-operation.routes.js,
// asi que aqui solo se asegura que el JS ya haya cargado).
(function initManttoLabPhase11InformesBootstrap(global){
'use strict';
const TARGET_USER_VERSION=11;
const VERSION='FASE_11_LAB_DGB_TRASLADO_INFORMES_V001';
function rootUrl(){const src=document.currentScript?.src||'';if(src)return new URL('../',src).toString();return new URL('./lab/',global.location?.href||'https://lab.invalid/').toString();}
const LAB_ROOT=rootUrl();
const MIGRATION_URL=new URL('database/migrations/011_informes_traslado.sql',LAB_ROOT).toString();
async function fetchText(url){const response=await global.fetch(url,{cache:'no-store'});if(!response.ok)throw new Error(`LAB_PHASE11_RESOURCE_FAILED ${response.status} ${url}`);return response.text();}
async function applyMigration(){
  if(global.ManttoLabPhase10Ready)await global.ManttoLabPhase10Ready;
  const db=global.ManttoLabDB;
  if(!db)throw new Error('MANTTO_LAB_DB_REQUIRED');
  const before=Number(db.scalar('PRAGMA user_version')||0);
  if(before<TARGET_USER_VERSION){
    const sql=await fetchText(MIGRATION_URL);
    await db.exec(sql,{persist:false});
    const violations=db.query('PRAGMA foreign_key_check');
    if(violations.length)throw new Error(`LAB_PHASE11_FOREIGN_KEY_CHECK_FAILED count=${violations.length}`);
    await db.exec('PRAGMA user_version = '+TARGET_USER_VERSION,{persist:false});
    await db.persist('phase11-informes-traslado-v001-migration');
  }
  const after=Number(db.scalar('PRAGMA user_version')||0);
  if(after<TARGET_USER_VERSION)throw new Error(`LAB_PHASE11_MIGRATION_INCOMPLETE user_version=${after}`);
  return{userVersion:after,permiso:'OPERACION_INFORMES_INFORMES_INFORMES.VER'};
}
function checkServiceLoaded(){
  if(!global.ManttoLabInformesService)throw new Error('MANTTO_LAB_INFORMES_SERVICE_REQUIRED');
  return true;
}
const ready=(async()=>{
  if(global.ManttoLabPhase10Ready)await global.ManttoLabPhase10Ready;
  const migration=await applyMigration();
  checkServiceLoaded();
  const status={ready:true,version:VERSION,migration,informes:true};
  document?.dispatchEvent?.(new CustomEvent('mantto:lab-phase11-informes-ready',{detail:status}));
  return status;
})();
global.ManttoLabPhase11Informes=Object.freeze({VERSION,ready,applyMigration,TARGET_USER_VERSION});
global.ManttoLabPhase11InformesReady=ready;
})(typeof window!=='undefined'?window:globalThis);
