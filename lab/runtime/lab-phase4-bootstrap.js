(function initManttoLabPhase4Bootstrap(global){
  'use strict';

  const TARGET_USER_VERSION=4;
  const VERSION='FASE_4_LAB_DGB_IDENTIDAD_PERMISOS_V002';

  function rootUrl(){
    const src=document.currentScript?.src||'';
    if(src)return new URL('../',src).toString();
    return new URL('./lab/',global.location?.href||'https://lab.invalid/').toString();
  }
  const LAB_ROOT=rootUrl();
  const MIGRATION_URL=new URL('database/migrations/004_permissions_catalog.sql',LAB_ROOT).toString();

  async function fetchText(url){
    const response=await global.fetch(url,{cache:'no-store'});
    if(!response.ok)throw new Error(`LAB_PHASE4_RESOURCE_FAILED ${response.status} ${url}`);
    return response.text();
  }

  async function applyMigration(){
    if(global.ManttoLabReady)await global.ManttoLabReady;
    const db=global.ManttoLabDB;
    if(!db)throw new Error('MANTTO_LAB_DB_REQUIRED');
    const before=Number(db.scalar('PRAGMA user_version')||0);
    if(before<TARGET_USER_VERSION){
      const sql=await fetchText(MIGRATION_URL);
      await db.exec(sql,{persist:false});
      const violations=db.query('PRAGMA foreign_key_check');
      if(violations.length)throw new Error(`LAB_PHASE4_FOREIGN_KEY_CHECK_FAILED count=${violations.length}`);
      await db.persist('phase4-v002-permissions-catalog');
    }
    const after=Number(db.scalar('PRAGMA user_version')||0);
    if(after<TARGET_USER_VERSION)throw new Error(`LAB_PHASE4_MIGRATION_INCOMPLETE user_version=${after}`);
    return {
      userVersion:after,
      actions:Number(db.scalar('SELECT COUNT(*) FROM perm_acciones')||0),
      groupings:Number(db.scalar('SELECT COUNT(*) FROM perm_agrupaciones')||0),
      modules:Number(db.scalar('SELECT COUNT(*) FROM perm_modulos')||0),
      elements:Number(db.scalar('SELECT COUNT(*) FROM perm_elementos')||0),
      subelements:Number(db.scalar('SELECT COUNT(*) FROM perm_subelementos')||0),
      permissions:Number(db.scalar('SELECT COUNT(*) FROM perm_subelemento_acciones')||0),
      rolePermissions:Number(db.scalar('SELECT COUNT(*) FROM rol_permisos')||0),
      userOverrides:Number(db.scalar('SELECT COUNT(*) FROM usuario_permisos WHERE activo=1')||0)
    };
  }

  async function registerRoutes(){
    if(global.ManttoLabBackendReady)await global.ManttoLabBackendReady;
    const backend=global.ManttoLabBackend;
    if(!backend)throw new Error('MANTTO_LAB_BACKEND_REQUIRED');
    if(!global.ManttoLabAuthPermissionRoutes)throw new Error('MANTTO_LAB_PHASE4_ROUTES_REQUIRED');
    if(!backend.__phase4V002RoutesRegistered){
      global.ManttoLabAuthPermissionRoutes.register(backend.router);
      backend.__phase4V002RoutesRegistered=true;
    }
    return backend.listRoutes();
  }

  async function resetDatabase(){
    if(!global.ManttoLabDB)throw new Error('MANTTO_LAB_DB_REQUIRED');
    await global.ManttoLabDB.reset();
    const migration=await applyMigration();
    document?.dispatchEvent?.(new CustomEvent('mantto:lab-phase4-reset',{detail:migration}));
    return migration;
  }

  const ready=(async()=>{
    if(global.ManttoLabTransportReady)await global.ManttoLabTransportReady;
    const migration=await applyMigration();
    const routes=await registerRoutes();
    const status={ready:true,version:VERSION,lineage:'LAB_DGB_V2',migration,routes:routes.length,productionConnectionsAllowed:false};
    document?.dispatchEvent?.(new CustomEvent('mantto:lab-phase4-ready',{detail:status}));
    return status;
  })();

  global.ManttoLabPhase4=Object.freeze({VERSION,ready,applyMigration,registerRoutes,resetDatabase,TARGET_USER_VERSION});
  global.ManttoLabPhase4Ready=ready;
})(typeof window!=='undefined'?window:globalThis);
