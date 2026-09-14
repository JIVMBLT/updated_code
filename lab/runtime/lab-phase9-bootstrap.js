(function initManttoLabPhase9Bootstrap(global){
  'use strict';
  const TARGET_USER_VERSION=9;
  const VERSION='FASE_9_LAB_DGB_INSTALACIONES_LOGISTICA_ALMACEN_V002';
  function rootUrl(){const src=document.currentScript?.src||'';if(src)return new URL('../',src).toString();return new URL('./lab/',global.location?.href||'https://lab.invalid/').toString();}
  const LAB_ROOT=rootUrl();
  const MIGRATION_URL=new URL('database/migrations/009_installations_logistics_warehouse.sql',LAB_ROOT).toString();
  async function fetchText(url){const response=await global.fetch(url,{cache:'no-store'});if(!response.ok)throw new Error(`LAB_PHASE9_RESOURCE_FAILED ${response.status} ${url}`);return response.text();}
  async function applyMigration(){
    if(global.ManttoLabPhase8Ready)await global.ManttoLabPhase8Ready;
    const db=global.ManttoLabDB;if(!db)throw new Error('MANTTO_LAB_DB_REQUIRED');
    const before=Number(db.scalar('PRAGMA user_version')||0);
    if(before<TARGET_USER_VERSION){const sql=await fetchText(MIGRATION_URL);await db.exec(sql,{persist:false});const violations=db.query('PRAGMA foreign_key_check');if(violations.length)throw new Error(`LAB_PHASE9_FOREIGN_KEY_CHECK_FAILED count=${violations.length}`);await db.persist('phase9-installations-logistics-warehouse-v002-migration');}
    const after=Number(db.scalar('PRAGMA user_version')||0);if(after<TARGET_USER_VERSION)throw new Error(`LAB_PHASE9_MIGRATION_INCOMPLETE user_version=${after}`);
    return{userVersion:after,installations:Number(db.scalar('SELECT COUNT(*) FROM ins_fl WHERE activo=1')||0),logistics:Number(db.scalar('SELECT COUNT(*) FROM logistica_produccion WHERE activo=1')||0),warehouse:Number(db.scalar('SELECT COUNT(*) FROM almacen_fuente_excel WHERE activo=1')||0),audits:Number(db.scalar('SELECT COUNT(*) FROM almacen_auditoria')||0),foreignKeyViolations:db.query('PRAGMA foreign_key_check').length};
  }
  async function registerRoutes(){if(global.ManttoLabBackendReady)await global.ManttoLabBackendReady;const backend=global.ManttoLabBackend;if(!backend)throw new Error('MANTTO_LAB_BACKEND_REQUIRED');if(!global.ManttoLabPhase9Routes)throw new Error('MANTTO_LAB_PHASE9_ROUTES_REQUIRED');if(!backend.__phase9V002RoutesRegistered){global.ManttoLabPhase9Routes.register(backend.router);backend.__phase9V002RoutesRegistered=true;}return backend.listRoutes();}
  async function resetDatabase(){if(!global.ManttoLabPhase8?.resetDatabase)throw new Error('MANTTO_LAB_PHASE8_REQUIRED');await global.ManttoLabPhase8.resetDatabase();const migration=await applyMigration();document?.dispatchEvent?.(new CustomEvent('mantto:lab-phase9-reset',{detail:migration}));return migration;}
  const ready=(async()=>{if(global.ManttoLabPhase8Ready)await global.ManttoLabPhase8Ready;const migration=await applyMigration();const routes=await registerRoutes();const status={ready:true,version:VERSION,lineage:'LAB_DGB_V2',migration,routes:routes.length,installationsLogisticsWarehouse:true,productionConnectionsAllowed:false};document?.dispatchEvent?.(new CustomEvent('mantto:lab-phase9-ready',{detail:status}));return status;})();
  global.ManttoLabPhase9=Object.freeze({VERSION,ready,applyMigration,registerRoutes,resetDatabase,TARGET_USER_VERSION});global.ManttoLabPhase9Ready=ready;
})(typeof window!=='undefined'?window:globalThis);
