// [Claude | 2026-10-05 | CLAUDE-MG | LAB DGB - ENTREGAS V001]
// Aplica la migracion 016 (tablas de Entregas + catalogo de permisos +
// concesion a LAB R01) y registra las rutas nuevas, mismo patron que la
// Fase 14 (Customer Experience): dominio nuevo, registerRoutes() propio.
(function initManttoLabPhase16EntregasBootstrap(global){
'use strict';
const TARGET_USER_VERSION=16;
const VERSION='FASE_16_LAB_DGB_ENTREGAS_V001';
function rootUrl(){const src=document.currentScript?.src||'';if(src)return new URL('../',src).toString();return new URL('./lab/',global.location?.href||'https://lab.invalid/').toString();}
const LAB_ROOT=rootUrl();
const MIGRATION_URL=new URL('database/migrations/016_entregas.sql',LAB_ROOT).toString();
async function fetchText(url){const response=await global.fetch(url,{cache:'no-store'});if(!response.ok)throw new Error(`LAB_PHASE16_RESOURCE_FAILED ${response.status} ${url}`);return response.text();}
async function applyMigration(){
  if(global.ManttoLabPhase15CxEncuestasPermisoReady)await global.ManttoLabPhase15CxEncuestasPermisoReady;
  const db=global.ManttoLabDB;
  if(!db)throw new Error('MANTTO_LAB_DB_REQUIRED');
  const before=Number(db.scalar('PRAGMA user_version')||0);
  if(before<TARGET_USER_VERSION){
    const sql=await fetchText(MIGRATION_URL);
    await db.exec(sql,{persist:false});
    const violations=db.query('PRAGMA foreign_key_check');
    if(violations.length)throw new Error(`LAB_PHASE16_FOREIGN_KEY_CHECK_FAILED count=${violations.length}`);
    await db.exec('PRAGMA user_version = '+TARGET_USER_VERSION,{persist:false});
    await db.persist('phase16-entregas-v001-migration');
  }
  const after=Number(db.scalar('PRAGMA user_version')||0);
  if(after<TARGET_USER_VERSION)throw new Error(`LAB_PHASE16_MIGRATION_INCOMPLETE user_version=${after}`);
  return{userVersion:after};
}
function checkServiceLoaded(){
  if(!global.ManttoLabEntregasService)throw new Error('MANTTO_LAB_ENTREGAS_SERVICE_REQUIRED');
  return true;
}
async function registerRoutes(){
  if(global.ManttoLabBackendReady)await global.ManttoLabBackendReady;
  const backend=global.ManttoLabBackend;
  if(!backend)throw new Error('MANTTO_LAB_BACKEND_REQUIRED');
  if(!global.ManttoLabEntregasRoutes)throw new Error('MANTTO_LAB_PHASE16_ROUTES_REQUIRED');
  if(!backend.__phase16V001RoutesRegistered){
    global.ManttoLabEntregasRoutes.register(backend.router);
    backend.__phase16V001RoutesRegistered=true;
  }
  return backend.listRoutes();
}
const ready=(async()=>{
  if(global.ManttoLabPhase15CxEncuestasPermisoReady)await global.ManttoLabPhase15CxEncuestasPermisoReady;
  const migration=await applyMigration();
  checkServiceLoaded();
  const routes=await registerRoutes();
  const status={ready:true,version:VERSION,migration,routes:routes.length,entregas:true};
  document?.dispatchEvent?.(new CustomEvent('mantto:lab-phase16-entregas-ready',{detail:status}));
  return status;
})();
global.ManttoLabPhase16Entregas=Object.freeze({VERSION,ready,applyMigration,registerRoutes,TARGET_USER_VERSION});
global.ManttoLabPhase16EntregasReady=ready;
})(typeof window!=='undefined'?window:globalThis);
