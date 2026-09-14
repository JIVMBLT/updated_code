(function initManttoLabPhase8Bootstrap(global){
  'use strict';

  const TARGET_USER_VERSION=8;
  const VERSION='FASE_8_LAB_DGB_VENTAS_COBRANZA_V002';

  function rootUrl(){
    const src=document.currentScript?.src||'';
    if(src)return new URL('../',src).toString();
    return new URL('./lab/',global.location?.href||'https://lab.invalid/').toString();
  }
  const LAB_ROOT=rootUrl();
  const MIGRATION_URL=new URL('database/migrations/008_sales_collections.sql',LAB_ROOT).toString();

  async function fetchText(url){
    const response=await global.fetch(url,{cache:'no-store'});
    if(!response.ok)throw new Error(`LAB_PHASE8_RESOURCE_FAILED ${response.status} ${url}`);
    return response.text();
  }

  async function applyMigration(){
    if(global.ManttoLabPhase7Ready)await global.ManttoLabPhase7Ready;
    const db=global.ManttoLabDB;
    if(!db)throw new Error('MANTTO_LAB_DB_REQUIRED');
    const before=Number(db.scalar('PRAGMA user_version')||0);
    if(before<TARGET_USER_VERSION){
      const sql=await fetchText(MIGRATION_URL);
      await db.exec(sql,{persist:false});
      const violations=db.query('PRAGMA foreign_key_check');
      if(violations.length)throw new Error(`LAB_PHASE8_FOREIGN_KEY_CHECK_FAILED count=${violations.length}`);
      await db.persist('phase8-sales-collections-v002-migration');
    }
    const after=Number(db.scalar('PRAGMA user_version')||0);
    if(after<TARGET_USER_VERSION)throw new Error(`LAB_PHASE8_MIGRATION_INCOMPLETE user_version=${after}`);
    return {
      userVersion:after,
      salesClients:Number(db.scalar('SELECT COUNT(*) FROM ventas_clientes WHERE activo=1')||0),
      salesQuotes:Number(db.scalar('SELECT COUNT(*) FROM ventas_cotizaciones_cor WHERE activo=1')||0),
      salesProspects:Number(db.scalar('SELECT COUNT(*) FROM ventas_prospecciones WHERE activo=1')||0),
      salesNetworks:Number(db.scalar('SELECT COUNT(*) FROM ventas_redes WHERE activo=1')||0),
      collectionsCorellian:Number(db.scalar('SELECT COUNT(*) FROM cobranza_indice_cor WHERE activo=1')||0),
      collectionsUnited:Number(db.scalar('SELECT COUNT(*) FROM gestion_credito')||0),
      foreignKeyViolations:db.query('PRAGMA foreign_key_check').length
    };
  }

  async function registerRoutes(){
    if(global.ManttoLabBackendReady)await global.ManttoLabBackendReady;
    const backend=global.ManttoLabBackend;
    if(!backend)throw new Error('MANTTO_LAB_BACKEND_REQUIRED');
    if(!global.ManttoLabSalesCollectionsRoutes)throw new Error('MANTTO_LAB_PHASE8_ROUTES_REQUIRED');
    if(!backend.__phase8V002RoutesRegistered){
      global.ManttoLabSalesCollectionsRoutes.register(backend.router);
      backend.__phase8V002RoutesRegistered=true;
    }
    return backend.listRoutes();
  }

  async function resetDatabase(){
    if(!global.ManttoLabPhase7?.resetDatabase)throw new Error('MANTTO_LAB_PHASE7_REQUIRED');
    await global.ManttoLabPhase7.resetDatabase();
    const migration=await applyMigration();
    document?.dispatchEvent?.(new CustomEvent('mantto:lab-phase8-reset',{detail:migration}));
    return migration;
  }

  const ready=(async()=>{
    if(global.ManttoLabPhase7Ready)await global.ManttoLabPhase7Ready;
    const migration=await applyMigration();
    const routes=await registerRoutes();
    const status={
      ready:true,
      version:VERSION,
      lineage:'LAB_DGB_V2',
      migration,
      routes:routes.length,
      salesCollections:true,
      productionConnectionsAllowed:false
    };
    document?.dispatchEvent?.(new CustomEvent('mantto:lab-phase8-ready',{detail:status}));
    return status;
  })();

  global.ManttoLabPhase8=Object.freeze({VERSION,ready,applyMigration,registerRoutes,resetDatabase,TARGET_USER_VERSION});
  global.ManttoLabPhase8Ready=ready;
})(typeof window!=='undefined'?window:globalThis);
