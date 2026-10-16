// [Claude | 2026-10-16 | CLAUDE-MG | LAB DGB - FOTOGRAFIAS CATALOGO GENERAL MAPA V001]
// Aplica la migracion 020 (permisos de lectura del Catalogo General para DIRECTOR_GENERAL y datos ficticios)
// via PRAGMA user_version. Mismo patron que fase 19.
(function initManttoLabPhase20FotografiasCatalogoMapaBootstrap(global){
'use strict';
const TARGET_USER_VERSION=20;
const VERSION='FASE_20_LAB_DGB_FOTOGRAFIAS_CATALOGO_MAPA_V001';
function rootUrl(){const src=document.currentScript?.src||'';if(src)return new URL('../',src).toString();return new URL('./lab/',global.location?.href||'https://lab.invalid/').toString();}
const LAB_ROOT=rootUrl();
const MIGRATION_URL=new URL('database/migrations/020_fotografias_catalogo_general_mapa.sql',LAB_ROOT).toString();
async function fetchText(url){const response=await global.fetch(url,{cache:'no-store'});if(!response.ok)throw new Error(`LAB_PHASE20_RESOURCE_FAILED ${response.status} ${url}`);return response.text();}
async function applyMigration(){
  if(global.ManttoLabPhase19ProgramacionPersonalReady)await global.ManttoLabPhase19ProgramacionPersonalReady;
  const db=global.ManttoLabDB;
  if(!db)throw new Error('MANTTO_LAB_DB_REQUIRED');
  const before=Number(db.scalar('PRAGMA user_version')||0);
  if(before<TARGET_USER_VERSION){
    const sql=await fetchText(MIGRATION_URL);
    await db.exec(sql,{persist:false});
    const violations=db.query('PRAGMA foreign_key_check');
    if(violations.length)throw new Error(`LAB_PHASE20_FOREIGN_KEY_CHECK_FAILED count=${violations.length}`);
    await db.exec('PRAGMA user_version = '+TARGET_USER_VERSION,{persist:false});
    await db.persist('phase20-fotografias-catalogo-mapa-v001-migration');
  }
  const after=Number(db.scalar('PRAGMA user_version')||0);
  if(after<TARGET_USER_VERSION)throw new Error(`LAB_PHASE20_MIGRATION_INCOMPLETE user_version=${after}`);
  return{userVersion:after};
}
const ready=(async()=>{
  if(global.ManttoLabPhase19ProgramacionPersonalReady)await global.ManttoLabPhase19ProgramacionPersonalReady;
  const migration=await applyMigration();
  const status={ready:true,version:VERSION,migration};
  document?.dispatchEvent?.(new CustomEvent('mantto:lab-phase20-fotografias-catalogo-mapa-ready',{detail:status}));
  return status;
})();
global.ManttoLabPhase20FotografiasCatalogoMapa=Object.freeze({VERSION,ready,applyMigration,TARGET_USER_VERSION});
global.ManttoLabPhase20FotografiasCatalogoMapaReady=ready;
})(typeof window!=='undefined'?window:globalThis);
