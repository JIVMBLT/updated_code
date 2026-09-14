(function initManttoLabPhase7Bootstrap(global){
  'use strict';

  const TARGET_USER_VERSION=7;
  const VERSION='FASE_7_LAB_DGB_OPERACION_PORTAFOLIO_V002';

  function rootUrl(){
    const src=document.currentScript?.src||'';
    if(src)return new URL('../',src).toString();
    return new URL('./lab/',global.location?.href||'https://lab.invalid/').toString();
  }
  const LAB_ROOT=rootUrl();
  const MIGRATION_URL=new URL('database/migrations/007_operation_portfolio.sql',LAB_ROOT).toString();

  async function fetchText(url){
    const response=await global.fetch(url,{cache:'no-store'});
    if(!response.ok)throw new Error(`LAB_PHASE7_RESOURCE_FAILED ${response.status} ${url}`);
    return response.text();
  }

  async function applyMigration(){
    if(global.ManttoLabPhase6Ready)await global.ManttoLabPhase6Ready;
    const db=global.ManttoLabDB;
    if(!db)throw new Error('MANTTO_LAB_DB_REQUIRED');
    const before=Number(db.scalar('PRAGMA user_version')||0);
    if(before<TARGET_USER_VERSION){
      const sql=await fetchText(MIGRATION_URL);
      await db.exec(sql,{persist:false});
      const violations=db.query('PRAGMA foreign_key_check');
      if(violations.length)throw new Error(`LAB_PHASE7_FOREIGN_KEY_CHECK_FAILED count=${violations.length}`);
      await db.persist('phase7-operation-portfolio-v002-migration');
    }
    const after=Number(db.scalar('PRAGMA user_version')||0);
    if(after<TARGET_USER_VERSION)throw new Error(`LAB_PHASE7_MIGRATION_INCOMPLETE user_version=${after}`);
    return {
      userVersion:after,
      portfolio:Number(db.scalar('SELECT COUNT(*) FROM portafolio')||0),
      tickets:Number(db.scalar('SELECT COUNT(*) FROM tickets')||0),
      preventives:Number(db.scalar('SELECT COUNT(*) FROM servicios_preventivos')||0),
      weeklyCuts:Number(db.scalar('SELECT COUNT(*) FROM portafolio_cortes_semanales')||0),
      foreignKeyViolations:db.query('PRAGMA foreign_key_check').length
    };
  }

  async function registerRoutes(){
    if(global.ManttoLabBackendReady)await global.ManttoLabBackendReady;
    const backend=global.ManttoLabBackend;
    if(!backend)throw new Error('MANTTO_LAB_BACKEND_REQUIRED');
    if(!global.ManttoLabOperationRoutes)throw new Error('MANTTO_LAB_PHASE7_ROUTES_REQUIRED');
    if(!backend.__phase7V002RoutesRegistered){
      global.ManttoLabOperationRoutes.register(backend.router);
      backend.__phase7V002RoutesRegistered=true;
    }
    return backend.listRoutes();
  }

  async function resetDatabase(){
    if(!global.ManttoLabPhase6?.resetDatabase)throw new Error('MANTTO_LAB_PHASE6_REQUIRED');
    await global.ManttoLabPhase6.resetDatabase();
    const migration=await applyMigration();
    document?.dispatchEvent?.(new CustomEvent('mantto:lab-phase7-reset',{detail:migration}));
    return migration;
  }

  const ready=(async()=>{
    if(global.ManttoLabPhase6Ready)await global.ManttoLabPhase6Ready;
    const migration=await applyMigration();
    const routes=await registerRoutes();
    const status={
      ready:true,
      version:VERSION,
      lineage:'LAB_DGB_V2',
      migration,
      routes:routes.length,
      operationPortfolio:true,
      productionConnectionsAllowed:false
    };
    document?.dispatchEvent?.(new CustomEvent('mantto:lab-phase7-ready',{detail:status}));
    return status;
  })();

  global.ManttoLabPhase7=Object.freeze({VERSION,ready,applyMigration,registerRoutes,resetDatabase,TARGET_USER_VERSION});
  global.ManttoLabPhase7Ready=ready;
})(typeof window!=='undefined'?window:globalThis);
