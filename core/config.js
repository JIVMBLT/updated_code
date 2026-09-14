(function initManttoLabConfig(global){
  'use strict';

  const locationRef=global.location||{protocol:'',origin:'',href:'',hostname:''};
  const protocol=String(locationRef.protocol||'').toLowerCase();
  const sameOriginBase=/^https?:$/.test(protocol)?String(locationRef.origin||''):'';

  global.MANTTO_LAB_MODE=true;
  global.MANTTO_API_BASE=sameOriginBase;
  global.MANTTO_SESSION_API_BASE=sameOriginBase;
  global.MANTTO_LAB_PRODUCTION_CONNECTIONS_ALLOWED=false;

  global.__MANTTO_LAB_NETWORK_POLICY__=Object.freeze({
    lineage:'LAB_DGB_V2',
    mode:'DGB',
    externalApplicationApis:false,
    productionConnectionsAllowed:false,
    apiTransport:'in-browser',
    identity:'synthetic-lab'
  });

  function normalizeLegacyLabShell(){
    if(typeof document==='undefined')return;
    document.title='Mantto Gestor | LAB DGB';
    const textBySelector={
      '.auth-brand p':'LABORATORIO DGB · DATOS FICTICIOS',
      '#login-form .auth-help':'Acceso de laboratorio con identidades ficticias.',
      '#rd-api-status span:last-child':'Cargando LAB...',
      '#view-help .help-head p':'Flujos, avisos y preguntas frecuentes del Laboratorio DGB.',
      '#view-support-request .help-head p':'La solicitud se guarda únicamente dentro del Laboratorio DGB.',
      '.panda-chat-title small':'Soporte Mantto · LAB DGB',
      '#pandaMessages .nori-msg.bot':'Hola, soy Nori. Cargando flujos de ayuda del Laboratorio DGB...'
    };
    Object.entries(textBySelector).forEach(([selector,value])=>{
      const element=document.querySelector(selector);
      if(element)element.textContent=value;
    });
    document.documentElement.setAttribute('data-mantto-environment','LAB_DGB');
  }

  normalizeLegacyLabShell();
  if(typeof document!=='undefined'&&document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',normalizeLegacyLabShell,{once:true});
  }

  const dependencies=[
    './lab/vendor/sql.js/1.14.2/sql-wasm.js',
    './lab/runtime/lab-db.js',
    './lab/runtime/lab-bootstrap.js',
    './lab/backend/lab-errors.js',
    './lab/backend/lab-context.js',
    './lab/backend/lab-router.js',
    './lab/backend/lab-backend.js',
    './lab/backend/routes/lab-system.routes.js',
    './lab/runtime/lab-backend-bootstrap.js',
    './lab/runtime/lab-transport.js',
    './lab/backend/services/lab-permissions.service.js',
    './lab/backend/services/lab-scope.service.js',
    './lab/backend/routes/lab-auth-permissions.routes.js',
    './lab/runtime/lab-phase4-bootstrap.js',
    './lab/backend/services/lab-catalogs.service.js',
    './lab/backend/services/lab-users.service.js',
    './lab/backend/services/lab-relations.service.js',
    './lab/backend/services/lab-shared-assets.service.js',
    './lab/backend/routes/lab-shared.routes.js',
    './lab/runtime/lab-phase5-bootstrap.js',
    './core/rich-text.js',
    './lab/backend/services/lab-blob-store.js',
    './lab/backend/services/lab-interactions.service.js',
    './lab/backend/services/lab-notifications.service.js',
    './lab/backend/services/lab-tasks.service.js',
    './lab/backend/services/lab-home.service.js',
    './lab/backend/routes/lab-home.routes.js',
    './lab/runtime/lab-phase6-bootstrap.js',
    './lab/backend/services/lab-operation.service.js',
    './lab/backend/services/lab-criticals.service.js',
    './lab/backend/services/lab-portfolio.service.js',
    './lab/backend/services/lab-movements.service.js',
    './lab/backend/services/lab-followup.service.js',
    './lab/backend/services/lab-tickets.service.js',
    './lab/backend/routes/lab-operation.routes.js',
    './lab/runtime/lab-phase7-bootstrap.js',
    './lab/backend/services/lab-sales.service.js',
    './lab/backend/services/lab-collections-uni.service.js',
    './lab/backend/services/lab-collections-cor.service.js',
    './lab/backend/routes/lab-sales-collections.routes.js',
    './lab/runtime/lab-phase8-bootstrap.js',
    './lab/backend/services/lab-installations.service.js',
    './lab/backend/services/lab-logistics.service.js',
    './lab/backend/services/lab-warehouse.service.js',
    './lab/backend/routes/lab-installations-logistics-warehouse.routes.js',
    './lab/runtime/lab-phase9-bootstrap.js',
    './lab/backend/services/lab-backup.service.js',
    './lab/backend/services/lab-jobs.service.js',
    './lab/runtime/lab-pwa.js',
    './lab/backend/services/lab-diagnostics.service.js',
    './lab/backend/routes/lab-technical.routes.js',
    './lab/runtime/lab-phase10-bootstrap.js',
    './lab/runtime/lab-auth.js'
  ];

  const styles=['./lab/styles/lab-phase4.css'];
  const version='20260914-fase11-lab-dgb-v001';
  const checks={
    './lab/vendor/sql.js/1.14.2/sql-wasm.js':()=>typeof global.initSqlJs==='function',
    './lab/runtime/lab-db.js':()=>Boolean(global.ManttoLabDB),
    './lab/runtime/lab-bootstrap.js':()=>Boolean(global.ManttoLabReady),
    './lab/backend/lab-errors.js':()=>Boolean(global.ManttoLabErrors),
    './lab/backend/lab-context.js':()=>Boolean(global.ManttoLabContext),
    './lab/backend/lab-router.js':()=>Boolean(global.ManttoLabRouter),
    './lab/backend/lab-backend.js':()=>Boolean(global.ManttoLabBackendModule),
    './lab/backend/routes/lab-system.routes.js':()=>Boolean(global.ManttoLabSystemRoutes),
    './lab/runtime/lab-backend-bootstrap.js':()=>Boolean(global.ManttoLabBackendReady),
    './lab/runtime/lab-transport.js':()=>Boolean(global.ManttoLabTransport),
    './lab/backend/services/lab-permissions.service.js':()=>Boolean(global.ManttoLabPermissionsService),
    './lab/backend/services/lab-scope.service.js':()=>Boolean(global.ManttoLabScopeService),
    './lab/backend/routes/lab-auth-permissions.routes.js':()=>Boolean(global.ManttoLabAuthPermissionRoutes),
    './lab/runtime/lab-phase4-bootstrap.js':()=>Boolean(global.ManttoLabPhase4Ready),
    './lab/backend/services/lab-catalogs.service.js':()=>Boolean(global.ManttoLabCatalogsService),
    './lab/backend/services/lab-users.service.js':()=>Boolean(global.ManttoLabUsersService),
    './lab/backend/services/lab-relations.service.js':()=>Boolean(global.ManttoLabRelationsService),
    './lab/backend/services/lab-shared-assets.service.js':()=>Boolean(global.ManttoLabSharedAssetsService),
    './lab/backend/routes/lab-shared.routes.js':()=>Boolean(global.ManttoLabSharedRoutes),
    './lab/runtime/lab-phase5-bootstrap.js':()=>Boolean(global.ManttoLabPhase5Ready),
    './core/rich-text.js':()=>Boolean(global.ManttoRichText),
    './lab/backend/services/lab-blob-store.js':()=>Boolean(global.ManttoLabBlobStore),
    './lab/backend/services/lab-interactions.service.js':()=>Boolean(global.ManttoLabInteractionsService),
    './lab/backend/services/lab-notifications.service.js':()=>Boolean(global.ManttoLabNotificationsService),
    './lab/backend/services/lab-tasks.service.js':()=>Boolean(global.ManttoLabTasksService),
    './lab/backend/services/lab-home.service.js':()=>Boolean(global.ManttoLabHomeService),
    './lab/backend/routes/lab-home.routes.js':()=>Boolean(global.ManttoLabHomeRoutes),
    './lab/runtime/lab-phase6-bootstrap.js':()=>Boolean(global.ManttoLabPhase6Ready),
    './lab/backend/services/lab-operation.service.js':()=>Boolean(global.ManttoLabOperationService),
    './lab/backend/services/lab-criticals.service.js':()=>Boolean(global.ManttoLabCriticalsService),
    './lab/backend/services/lab-portfolio.service.js':()=>Boolean(global.ManttoLabPortfolioService),
    './lab/backend/services/lab-movements.service.js':()=>Boolean(global.ManttoLabMovementsService),
    './lab/backend/services/lab-followup.service.js':()=>Boolean(global.ManttoLabFollowupService),
    './lab/backend/services/lab-tickets.service.js':()=>Boolean(global.ManttoLabTicketsService),
    './lab/backend/routes/lab-operation.routes.js':()=>Boolean(global.ManttoLabOperationRoutes),
    './lab/runtime/lab-phase7-bootstrap.js':()=>Boolean(global.ManttoLabPhase7Ready),
    './lab/backend/services/lab-sales.service.js':()=>Boolean(global.ManttoLabSalesService),
    './lab/backend/services/lab-collections-uni.service.js':()=>Boolean(global.ManttoLabCollectionsUniService),
    './lab/backend/services/lab-collections-cor.service.js':()=>Boolean(global.ManttoLabCollectionsCorService),
    './lab/backend/routes/lab-sales-collections.routes.js':()=>Boolean(global.ManttoLabSalesCollectionsRoutes),
    './lab/runtime/lab-phase8-bootstrap.js':()=>Boolean(global.ManttoLabPhase8Ready),
    './lab/backend/services/lab-installations.service.js':()=>Boolean(global.ManttoLabInstallationsService),
    './lab/backend/services/lab-logistics.service.js':()=>Boolean(global.ManttoLabLogisticsService),
    './lab/backend/services/lab-warehouse.service.js':()=>Boolean(global.ManttoLabWarehouseService),
    './lab/backend/routes/lab-installations-logistics-warehouse.routes.js':()=>Boolean(global.ManttoLabPhase9Routes),
    './lab/runtime/lab-phase9-bootstrap.js':()=>Boolean(global.ManttoLabPhase9Ready),
    './lab/backend/services/lab-backup.service.js':()=>Boolean(global.ManttoLabBackupService),
    './lab/backend/services/lab-jobs.service.js':()=>Boolean(global.ManttoLabJobsService),
    './lab/runtime/lab-pwa.js':()=>Boolean(global.ManttoLabPwa),
    './lab/backend/services/lab-diagnostics.service.js':()=>Boolean(global.ManttoLabDiagnosticsService),
    './lab/backend/routes/lab-technical.routes.js':()=>Boolean(global.ManttoLabTechnicalRoutes),
    './lab/runtime/lab-phase10-bootstrap.js':()=>Boolean(global.ManttoLabPhase10Ready),
    './lab/runtime/lab-auth.js':()=>Boolean(global.ManttoLabAuth)
  };

  function alreadyLoaded(src){return checks[src]?checks[src]():false;}
  function ensureParserStyles(){
    if(typeof document==='undefined'||document.readyState!=='loading')return false;
    styles.forEach(href=>{
      if(document.querySelector(`link[data-mantto-lab-style="${href}"]`))return;
      document.write('<link rel="stylesheet" data-mantto-lab-style="'+href+'" href="'+href+'?v='+version+'">');
    });
    return true;
  }
  function parserBootstrap(){
    const missing=dependencies.filter(src=>!alreadyLoaded(src));
    if(!missing.length)return true;
    if(typeof document==='undefined'||document.readyState!=='loading')return false;
    ensureParserStyles();
    missing.forEach(src=>document.write('<script src="'+src+'?v='+version+'"><\\/script>'));
    return true;
  }
  async function deferredBootstrap(){
    if(typeof document==='undefined')throw new Error('LAB_DOCUMENT_REQUIRED');
    for(const href of styles){
      if(document.querySelector(`link[data-mantto-lab-style="${href}"]`))continue;
      await new Promise((resolve,reject)=>{const link=document.createElement('link');link.rel='stylesheet';link.href=href+'?v='+version;link.dataset.manttoLabStyle=href;link.onload=resolve;link.onerror=()=>reject(new Error('LAB_STYLE_LOAD_FAILED '+href));(document.head||document.documentElement).appendChild(link);});
    }
    for(const src of dependencies){
      if(alreadyLoaded(src))continue;
      await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src+'?v='+version;script.async=false;script.onload=resolve;script.onerror=()=>reject(new Error('LAB_SCRIPT_LOAD_FAILED '+src));(document.head||document.documentElement).appendChild(script);});
    }
    if(global.ManttoLabPhase10Ready)await global.ManttoLabPhase10Ready;
    return global.ManttoLabPhase10?.ready?global.ManttoLabPhase10.ready:null;
  }

  const synchronous=parserBootstrap();
  global.ManttoLabCoreReady=synchronous
    ?Promise.resolve().then(async()=>{if(global.ManttoLabPhase10Ready)await global.ManttoLabPhase10Ready;return global.ManttoLabPhase10?.ready?global.ManttoLabPhase10.ready:null;})
    :deferredBootstrap();
})(typeof window!=='undefined'?window:globalThis);
