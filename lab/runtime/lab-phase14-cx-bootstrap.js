// [Claude | 2026-10-02 | CLAUDE-MG | LAB DGB - CUSTOMER EXPERIENCE V001]
// Aplica la migracion 014 (tablas de encuestas CX + concesion de permiso a
// LAB R01) y registra las rutas nuevas de Customer Experience sobre el
// mismo backend.router que ya usan el resto de fases (patron identico al
// de lab-phase4-bootstrap.js: registerRoutes() propio, no piggyback sobre
// un routes file existente, porque CX es un dominio nuevo).
(function initManttoLabPhase14CxBootstrap(global){
'use strict';
const TARGET_USER_VERSION=14;
const VERSION='FASE_14_LAB_DGB_CUSTOMER_EXPERIENCE_V001';
function rootUrl(){const src=document.currentScript?.src||'';if(src)return new URL('../',src).toString();return new URL('./lab/',global.location?.href||'https://lab.invalid/').toString();}
const LAB_ROOT=rootUrl();
const MIGRATION_URL=new URL('database/migrations/014_customer_experience_encuestas.sql',LAB_ROOT).toString();
async function fetchText(url){const response=await global.fetch(url,{cache:'no-store'});if(!response.ok)throw new Error(`LAB_PHASE14_RESOURCE_FAILED ${response.status} ${url}`);return response.text();}
async function applyMigration(){
  if(global.ManttoLabPhase13PermisosReady)await global.ManttoLabPhase13PermisosReady;
  const db=global.ManttoLabDB;
  if(!db)throw new Error('MANTTO_LAB_DB_REQUIRED');
  const before=Number(db.scalar('PRAGMA user_version')||0);
  if(before<TARGET_USER_VERSION){
    const sql=await fetchText(MIGRATION_URL);
    await db.exec(sql,{persist:false});
    const violations=db.query('PRAGMA foreign_key_check');
    if(violations.length)throw new Error(`LAB_PHASE14_FOREIGN_KEY_CHECK_FAILED count=${violations.length}`);
    await db.exec('PRAGMA user_version = '+TARGET_USER_VERSION,{persist:false});
    await db.persist('phase14-customer-experience-v001-migration');
  }
  const after=Number(db.scalar('PRAGMA user_version')||0);
  if(after<TARGET_USER_VERSION)throw new Error(`LAB_PHASE14_MIGRATION_INCOMPLETE user_version=${after}`);
  return{userVersion:after};
}
async function registerRoutes(){
  if(global.ManttoLabBackendReady)await global.ManttoLabBackendReady;
  const backend=global.ManttoLabBackend;
  if(!backend)throw new Error('MANTTO_LAB_BACKEND_REQUIRED');
  if(!global.ManttoLabCxRoutes)throw new Error('MANTTO_LAB_PHASE14_ROUTES_REQUIRED');
  if(!backend.__phase14V001RoutesRegistered){
    global.ManttoLabCxRoutes.register(backend.router);
    backend.__phase14V001RoutesRegistered=true;
  }
  return backend.listRoutes();
}
const ready=(async()=>{
  if(global.ManttoLabPhase13PermisosReady)await global.ManttoLabPhase13PermisosReady;
  const migration=await applyMigration();
  const routes=await registerRoutes();
  const status={ready:true,version:VERSION,migration,routes:routes.length,customerExperience:true};
  document?.dispatchEvent?.(new CustomEvent('mantto:lab-phase14-cx-ready',{detail:status}));
  return status;
})();
global.ManttoLabPhase14Cx=Object.freeze({VERSION,ready,applyMigration,registerRoutes,TARGET_USER_VERSION});
global.ManttoLabPhase14CxReady=ready;
})(typeof window!=='undefined'?window:globalThis);
