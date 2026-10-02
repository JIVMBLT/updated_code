// [Claude | 2026-10-02 | CLAUDE-MG | LAB DGB - CUSTOMER EXPERIENCE DETALLE V001]
// Aplica la migracion 015 (concesion del permiso de la pestana Encuestas de
// CX a LAB R01). Mismo patron minimo que lab-phase13-permisos-director-
// general-bootstrap.js: solo datos, sin servicio nuevo que verificar.
(function initManttoLabPhase15CxEncuestasPermisoBootstrap(global){
'use strict';
const TARGET_USER_VERSION=15;
const VERSION='FASE_15_LAB_DGB_CX_ENCUESTAS_PERMISO_V001';
function rootUrl(){const src=document.currentScript?.src||'';if(src)return new URL('../',src).toString();return new URL('./lab/',global.location?.href||'https://lab.invalid/').toString();}
const LAB_ROOT=rootUrl();
const MIGRATION_URL=new URL('database/migrations/015_cx_encuestas_permiso.sql',LAB_ROOT).toString();
async function fetchText(url){const response=await global.fetch(url,{cache:'no-store'});if(!response.ok)throw new Error(`LAB_PHASE15_RESOURCE_FAILED ${response.status} ${url}`);return response.text();}
async function applyMigration(){
  if(global.ManttoLabPhase14CxReady)await global.ManttoLabPhase14CxReady;
  const db=global.ManttoLabDB;
  if(!db)throw new Error('MANTTO_LAB_DB_REQUIRED');
  const before=Number(db.scalar('PRAGMA user_version')||0);
  if(before<TARGET_USER_VERSION){
    const sql=await fetchText(MIGRATION_URL);
    await db.exec(sql,{persist:false});
    const violations=db.query('PRAGMA foreign_key_check');
    if(violations.length)throw new Error(`LAB_PHASE15_FOREIGN_KEY_CHECK_FAILED count=${violations.length}`);
    await db.exec('PRAGMA user_version = '+TARGET_USER_VERSION,{persist:false});
    await db.persist('phase15-cx-encuestas-permiso-v001-migration');
  }
  const after=Number(db.scalar('PRAGMA user_version')||0);
  if(after<TARGET_USER_VERSION)throw new Error(`LAB_PHASE15_MIGRATION_INCOMPLETE user_version=${after}`);
  return{userVersion:after};
}
const ready=(async()=>{
  if(global.ManttoLabPhase14CxReady)await global.ManttoLabPhase14CxReady;
  const migration=await applyMigration();
  const status={ready:true,version:VERSION,migration};
  document?.dispatchEvent?.(new CustomEvent('mantto:lab-phase15-cx-encuestas-ready',{detail:status}));
  return status;
})();
global.ManttoLabPhase15CxEncuestasPermiso=Object.freeze({VERSION,ready,applyMigration,TARGET_USER_VERSION});
global.ManttoLabPhase15CxEncuestasPermisoReady=ready;
})(typeof window!=='undefined'?window:globalThis);
