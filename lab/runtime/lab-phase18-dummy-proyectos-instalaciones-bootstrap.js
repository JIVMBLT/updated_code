// [Claude | 2026-10-06 | CLAUDE-MG | LAB DGB - DUMMY 2 PROYECTOS INSTALACIONES EJEMPLO V001]
// Aplica la migracion 018 (datos ficticios: 2 proyectos de Instalaciones con bitacora,
// contactos y envios previos) via PRAGMA user_version. Mismo patron que fase 17.
(function initManttoLabPhase18DummyProyectosInstalacionesBootstrap(global){
'use strict';
const TARGET_USER_VERSION=18;
const VERSION='FASE_18_LAB_DGB_DUMMY_PROYECTOS_INSTALACIONES_V001';
function rootUrl(){const src=document.currentScript?.src||'';if(src)return new URL('../',src).toString();return new URL('./lab/',global.location?.href||'https://lab.invalid/').toString();}
const LAB_ROOT=rootUrl();
const MIGRATION_URL=new URL('database/migrations/018_dummy_proyectos_instalaciones_ejemplo.sql',LAB_ROOT).toString();
async function fetchText(url){const response=await global.fetch(url,{cache:'no-store'});if(!response.ok)throw new Error(`LAB_PHASE18_RESOURCE_FAILED ${response.status} ${url}`);return response.text();}
async function applyMigration(){
  if(global.ManttoLabPhase17BitacoraEnviosReady)await global.ManttoLabPhase17BitacoraEnviosReady;
  const db=global.ManttoLabDB;
  if(!db)throw new Error('MANTTO_LAB_DB_REQUIRED');
  const before=Number(db.scalar('PRAGMA user_version')||0);
  if(before<TARGET_USER_VERSION){
    const sql=await fetchText(MIGRATION_URL);
    await db.exec(sql,{persist:false});
    const violations=db.query('PRAGMA foreign_key_check');
    if(violations.length)throw new Error(`LAB_PHASE18_FOREIGN_KEY_CHECK_FAILED count=${violations.length}`);
    await db.exec('PRAGMA user_version = '+TARGET_USER_VERSION,{persist:false});
    await db.persist('phase18-dummy-proyectos-instalaciones-v001-migration');
  }
  const after=Number(db.scalar('PRAGMA user_version')||0);
  if(after<TARGET_USER_VERSION)throw new Error(`LAB_PHASE18_MIGRATION_INCOMPLETE user_version=${after}`);
  return{userVersion:after};
}
const ready=(async()=>{
  if(global.ManttoLabPhase17BitacoraEnviosReady)await global.ManttoLabPhase17BitacoraEnviosReady;
  const migration=await applyMigration();
  const status={ready:true,version:VERSION,migration};
  document?.dispatchEvent?.(new CustomEvent('mantto:lab-phase18-dummy-proyectos-instalaciones-ready',{detail:status}));
  return status;
})();
global.ManttoLabPhase18DummyProyectosInstalaciones=Object.freeze({VERSION,ready,applyMigration,TARGET_USER_VERSION});
global.ManttoLabPhase18DummyProyectosInstalacionesReady=ready;
})(typeof window!=='undefined'?window:globalThis);
