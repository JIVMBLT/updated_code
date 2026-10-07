// [Claude | 2026-10-07 | CLAUDE-MG | LAB DGB - INSTALACIONES PROGRAMACION DE PERSONAL V001]
// Aplica la migracion 019 (tablas de personal y asignaciones, permisos y datos ficticios)
// via PRAGMA user_version. Mismo patron que fase 18.
(function initManttoLabPhase19ProgramacionPersonalBootstrap(global){
'use strict';
const TARGET_USER_VERSION=19;
const VERSION='FASE_19_LAB_DGB_PROGRAMACION_PERSONAL_V001';
function rootUrl(){const src=document.currentScript?.src||'';if(src)return new URL('../',src).toString();return new URL('./lab/',global.location?.href||'https://lab.invalid/').toString();}
const LAB_ROOT=rootUrl();
const MIGRATION_URL=new URL('database/migrations/019_instalaciones_programacion_personal.sql',LAB_ROOT).toString();
async function fetchText(url){const response=await global.fetch(url,{cache:'no-store'});if(!response.ok)throw new Error(`LAB_PHASE19_RESOURCE_FAILED ${response.status} ${url}`);return response.text();}
async function applyMigration(){
  if(global.ManttoLabPhase18DummyProyectosInstalacionesReady)await global.ManttoLabPhase18DummyProyectosInstalacionesReady;
  const db=global.ManttoLabDB;
  if(!db)throw new Error('MANTTO_LAB_DB_REQUIRED');
  const before=Number(db.scalar('PRAGMA user_version')||0);
  if(before<TARGET_USER_VERSION){
    const sql=await fetchText(MIGRATION_URL);
    await db.exec(sql,{persist:false});
    const violations=db.query('PRAGMA foreign_key_check');
    if(violations.length)throw new Error(`LAB_PHASE19_FOREIGN_KEY_CHECK_FAILED count=${violations.length}`);
    await db.exec('PRAGMA user_version = '+TARGET_USER_VERSION,{persist:false});
    await db.persist('phase19-programacion-personal-v001-migration');
  }
  const after=Number(db.scalar('PRAGMA user_version')||0);
  if(after<TARGET_USER_VERSION)throw new Error(`LAB_PHASE19_MIGRATION_INCOMPLETE user_version=${after}`);
  return{userVersion:after};
}
const ready=(async()=>{
  if(global.ManttoLabPhase18DummyProyectosInstalacionesReady)await global.ManttoLabPhase18DummyProyectosInstalacionesReady;
  const migration=await applyMigration();
  const status={ready:true,version:VERSION,migration};
  document?.dispatchEvent?.(new CustomEvent('mantto:lab-phase19-programacion-personal-ready',{detail:status}));
  return status;
})();
global.ManttoLabPhase19ProgramacionPersonal=Object.freeze({VERSION,ready,applyMigration,TARGET_USER_VERSION});
global.ManttoLabPhase19ProgramacionPersonalReady=ready;
})(typeof window!=='undefined'?window:globalThis);
