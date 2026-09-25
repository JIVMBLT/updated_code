// [Claude | 2026-09-25 | CLAUDE-MG | LAB DGB - CONCESION PERMISOS ROL DIRECTOR GENERAL V001]
// Mismo patron que lab-phase12-contactos-bootstrap.js: aplica la migracion
// 013 (concesion de los 5 permisos de Informes + Instalaciones Contactos al
// rol Director General / usuario LAB R01) via PRAGMA user_version.
(function initManttoLabPhase13PermisosBootstrap(global){
'use strict';
const TARGET_USER_VERSION=13;
const VERSION='FASE_13_LAB_DGB_PERMISOS_DIRECTOR_GENERAL_V001';
function rootUrl(){const src=document.currentScript?.src||'';if(src)return new URL('../',src).toString();return new URL('./lab/',global.location?.href||'https://lab.invalid/').toString();}
const LAB_ROOT=rootUrl();
const MIGRATION_URL=new URL('database/migrations/013_rol_director_general_permisos_nuevos.sql',LAB_ROOT).toString();
async function fetchText(url){const response=await global.fetch(url,{cache:'no-store'});if(!response.ok)throw new Error(`LAB_PHASE13_RESOURCE_FAILED ${response.status} ${url}`);return response.text();}
async function applyMigration(){
  if(global.ManttoLabPhase12ContactosReady)await global.ManttoLabPhase12ContactosReady;
  const db=global.ManttoLabDB;
  if(!db)throw new Error('MANTTO_LAB_DB_REQUIRED');
  const before=Number(db.scalar('PRAGMA user_version')||0);
  if(before<TARGET_USER_VERSION){
    const sql=await fetchText(MIGRATION_URL);
    await db.exec(sql,{persist:false});
    const violations=db.query('PRAGMA foreign_key_check');
    if(violations.length)throw new Error(`LAB_PHASE13_FOREIGN_KEY_CHECK_FAILED count=${violations.length}`);
    await db.exec('PRAGMA user_version = '+TARGET_USER_VERSION,{persist:false});
    await db.persist('phase13-permisos-director-general-v001-migration');
  }
  const after=Number(db.scalar('PRAGMA user_version')||0);
  if(after<TARGET_USER_VERSION)throw new Error(`LAB_PHASE13_MIGRATION_INCOMPLETE user_version=${after}`);
  return{userVersion:after};
}
const ready=(async()=>{
  if(global.ManttoLabPhase12ContactosReady)await global.ManttoLabPhase12ContactosReady;
  const migration=await applyMigration();
  const status={ready:true,version:VERSION,migration};
  document?.dispatchEvent?.(new CustomEvent('mantto:lab-phase13-permisos-ready',{detail:status}));
  return status;
})();
global.ManttoLabPhase13Permisos=Object.freeze({VERSION,ready,applyMigration,TARGET_USER_VERSION});
global.ManttoLabPhase13PermisosReady=ready;
})(typeof window!=='undefined'?window:globalThis);
