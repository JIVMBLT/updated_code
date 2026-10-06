// [Claude | 2026-10-06 | CLAUDE-MG | LAB DGB - BITACORA ENVIOS V001]
// Mismo patron que lab-phase16: aplica la migracion 017 (tabla
// instalaciones_bitacora_envios) via PRAGMA user_version.
(function initManttoLabPhase17BitacoraEnviosBootstrap(global){
'use strict';
const TARGET_USER_VERSION=17;
const VERSION='FASE_17_LAB_DGB_BITACORA_ENVIOS_V001';
function rootUrl(){const src=document.currentScript?.src||'';if(src)return new URL('../',src).toString();return new URL('./lab/',global.location?.href||'https://lab.invalid/').toString();}
const LAB_ROOT=rootUrl();
const MIGRATION_URL=new URL('database/migrations/017_instalaciones_bitacora_envios.sql',LAB_ROOT).toString();
async function fetchText(url){const response=await global.fetch(url,{cache:'no-store'});if(!response.ok)throw new Error(`LAB_PHASE17_RESOURCE_FAILED ${response.status} ${url}`);return response.text();}
async function applyMigration(){
  if(global.ManttoLabPhase16EntregasReady)await global.ManttoLabPhase16EntregasReady;
  const db=global.ManttoLabDB;
  if(!db)throw new Error('MANTTO_LAB_DB_REQUIRED');
  const before=Number(db.scalar('PRAGMA user_version')||0);
  if(before<TARGET_USER_VERSION){
    const sql=await fetchText(MIGRATION_URL);
    await db.exec(sql,{persist:false});
    const violations=db.query('PRAGMA foreign_key_check');
    if(violations.length)throw new Error(`LAB_PHASE17_FOREIGN_KEY_CHECK_FAILED count=${violations.length}`);
    await db.exec('PRAGMA user_version = '+TARGET_USER_VERSION,{persist:false});
    await db.persist('phase17-bitacora-envios-v001-migration');
  }
  const after=Number(db.scalar('PRAGMA user_version')||0);
  if(after<TARGET_USER_VERSION)throw new Error(`LAB_PHASE17_MIGRATION_INCOMPLETE user_version=${after}`);
  return{userVersion:after};
}
const ready=(async()=>{
  if(global.ManttoLabPhase16EntregasReady)await global.ManttoLabPhase16EntregasReady;
  const migration=await applyMigration();
  const status={ready:true,version:VERSION,migration};
  document?.dispatchEvent?.(new CustomEvent('mantto:lab-phase17-bitacora-envios-ready',{detail:status}));
  return status;
})();
global.ManttoLabPhase17BitacoraEnvios=Object.freeze({VERSION,ready,applyMigration,TARGET_USER_VERSION});
global.ManttoLabPhase17BitacoraEnviosReady=ready;
})(typeof window!=='undefined'?window:globalThis);
