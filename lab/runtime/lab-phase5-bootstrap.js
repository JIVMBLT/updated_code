(function initManttoLabPhase5Bootstrap(global){
  'use strict';

  const TARGET_USER_VERSION=5;
  const VERSION='FASE_5_LAB_DGB_SERVICIOS_COMPARTIDOS_V002';

  function rootUrl(){
    const src=document.currentScript?.src||'';
    if(src)return new URL('../',src).toString();
    return new URL('./lab/',global.location?.href||'https://lab.invalid/').toString();
  }
  const LAB_ROOT=rootUrl();
  const MIGRATION_URL=new URL('database/migrations/005_shared_services.sql',LAB_ROOT).toString();

  async function fetchText(url){
    const response=await global.fetch(url,{cache:'no-store'});
    if(!response.ok)throw new Error(`LAB_PHASE5_RESOURCE_FAILED ${response.status} ${url}`);
    return response.text();
  }

  async function applyMigration(){
    if(global.ManttoLabPhase4Ready)await global.ManttoLabPhase4Ready;
    const db=global.ManttoLabDB;
    if(!db)throw new Error('MANTTO_LAB_DB_REQUIRED');
    const before=Number(db.scalar('PRAGMA user_version')||0);
    if(before<TARGET_USER_VERSION){
      const sql=await fetchText(MIGRATION_URL);
      await db.exec(sql,{persist:false});
      const violations=db.query('PRAGMA foreign_key_check');
      if(violations.length)throw new Error(`LAB_PHASE5_FOREIGN_KEY_CHECK_FAILED count=${violations.length}`);
      await db.persist('phase5-v002-shared-services');
    }
    const after=Number(db.scalar('PRAGMA user_version')||0);
    if(after<TARGET_USER_VERSION)throw new Error(`LAB_PHASE5_MIGRATION_INCOMPLETE user_version=${after}`);
    return {
      userVersion:after,
      users:Number(db.scalar('SELECT COUNT(*) FROM usuarios')||0),
      roles:Number(db.scalar('SELECT COUNT(*) FROM roles')||0),
      zones:Number(db.scalar('SELECT COUNT(*) FROM z_op')||0),
      equipment:Number(db.scalar('SELECT COUNT(*) FROM portafolio')||0),
      tickets:Number(db.scalar('SELECT COUNT(*) FROM tickets')||0),
      relations:Number(db.scalar('SELECT COUNT(*) FROM usuarios_rel_admin')||0),
      foreignKeyViolations:db.query('PRAGMA foreign_key_check').length
    };
  }

  async function registerRoutes(){
    if(global.ManttoLabBackendReady)await global.ManttoLabBackendReady;
    const backend=global.ManttoLabBackend;
    if(!backend)throw new Error('MANTTO_LAB_BACKEND_REQUIRED');
    if(!global.ManttoLabSharedRoutes)throw new Error('MANTTO_LAB_PHASE5_ROUTES_REQUIRED');
    if(!backend.__phase5V002RoutesRegistered){
      global.ManttoLabSharedRoutes.register(backend.router);
      backend.__phase5V002RoutesRegistered=true;
    }
    return backend.listRoutes();
  }

  async function resetDatabase(){
    if(!global.ManttoLabPhase4)throw new Error('MANTTO_LAB_PHASE4_REQUIRED');
    await global.ManttoLabPhase4.resetDatabase();
    const migration=await applyMigration();
    document?.dispatchEvent?.(new CustomEvent('mantto:lab-phase5-reset',{detail:migration}));
    return migration;
  }

  const ready=(async()=>{
    if(global.ManttoLabPhase4Ready)await global.ManttoLabPhase4Ready;
    const migration=await applyMigration();
    const routes=await registerRoutes();
    const status={
      ready:true,
      version:VERSION,
      lineage:'LAB_DGB_V2',
      migration,
      routes:routes.length,
      sharedServices:true,
      productionConnectionsAllowed:false
    };
    document?.dispatchEvent?.(new CustomEvent('mantto:lab-phase5-ready',{detail:status}));
    return status;
  })();

  global.ManttoLabPhase5=Object.freeze({VERSION,ready,applyMigration,registerRoutes,resetDatabase,TARGET_USER_VERSION});
  global.ManttoLabPhase5Ready=ready;
})(typeof window!=='undefined'?window:globalThis);
