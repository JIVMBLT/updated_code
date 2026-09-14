(function installManttoLabDataSync(global){
  'use strict';

  const VERSION='FASE_11_LAB_DGB_DATA_SYNC_COMPAT_V001';
  const MIN_REFRESH_GAP_MS=1200;
  const state={
    route:'home',
    payload:null,
    handlers:new Map(),
    dirty:new Set(),
    running:new Map(),
    lastSync:new Map()
  };

  const ROUTE_OBJECTS=Object.freeze({
    home:'ManttoHome',
    resumen:'ManttoResumenDia',
    criticos:'ManttoEquiposCriticos',
    portafolio:'ManttoPortafolio',
    proyectos:'ManttoProyectos',
    callcenter:'ManttoCallCenter',
    operativo:'ManttoDashboardOperativo',
    movimientos:'ManttoMovimientosPortafolio',
    usuarios:'ManttoUsuarios',
    'panel-control':'ManttoPanelControl',
    'ventas-dashboard':'ManttoVentasDashboard',
    'ventas-clientes':'ManttoVentasClientes',
    'ventas-cotizaciones':'ManttoVentasCotizaciones',
    'ventas-proyeccion':'ManttoVentasProyeccion',
    'ventas-perdidos':'ManttoVentasPerdidos',
    'ventas-vendidos':'ManttoVentasVendidos',
    'ventas-prospeccion':'ManttoVentasProspeccion',
    'ventas-mapa-prospeccion':'ManttoVentasMapaProspeccion',
    'ventas-asignacion-redes':'ManttoVentasAsignacionRedes',
    'almacen-dashboard':'ManttoAlmacen',
    'almacen-inventario':'ManttoAlmacen',
    'almacen-stock':'ManttoAlmacen',
    'almacen-prestamos':'ManttoAlmacen',
    'almacen-resguardos':'ManttoAlmacen',
    'almacen-auditoria':'ManttoAlmacen',
    'almacen-carga':'ManttoAlmacenCarga',
    'cobranza-uni-estados-cuenta':'ManttoCobranza_uni',
    'cobranza-uni-mp-pro':'ManttoCobranza_uni',
    'cobranza-uni-aditivas':'ManttoCobranza_uni',
    'logistica-dashboard':'ManttoDashboardLogistica',
    'logistica-reporte':'ManttoReporteLogistica',
    'instalaciones-dashboard':'ManttoInstalacionesDashboard_cor',
    'instalaciones-proyectos':'ManttoInstalacionesProyectos',
    'instalaciones-cerrados':'ManttoInstalacionesCerrados',
    'instalaciones-concentrado-cliente':'ManttoInstalacionesConcentradoCliente',
    'instalaciones-reporte':'ManttoInstalacionesReporte_cor',
    'instalaciones-ajuste':'ManttoInstalacionesAjuste_cor',
    'instalaciones-carpetas':'ManttoInstalacionesCarpetas_cor',
    'instalaciones-documentacion':'ManttoInstalacionesDocumentacion_cor',
    'soporte-solicitudes':'ManttoSoporteSolicitudes'
  });

  function unique(values){
    return Array.from(new Set((Array.isArray(values)?values:[values]).map(value=>String(value||'').trim()).filter(Boolean)));
  }

  function currentUser(){
    return global.ManttoAuth?.getUser?.()||global.ManttoAuth?.getActorUser?.()||{};
  }

  function isProgrammer(){
    const user=currentUser();
    const roles=[];
    if(user.rol)roles.push(user.rol);
    if(Array.isArray(user.roles))roles.push(...user.roles.map(role=>typeof role==='object'?(role.rol||role.nombre||role.name||''):role));
    return roles.map(value=>String(value||'').trim().toLowerCase()).some(role=>
      role==='programador'||role==='programador united'||role==='programador corellian'
    );
  }

  function applyRefreshVisibility(root){
    const scope=root?.querySelectorAll?root:global.document;
    if(!scope)return;
    const programmer=isProgrammer();
    scope.querySelectorAll('[data-programmer-only-refresh="true"],[data-technical-refresh="true"],[data-refresh-visibility="programmer"]').forEach(element=>{
      element.hidden=!programmer;
      element.setAttribute('aria-hidden',programmer?'false':'true');
      if(programmer)element.removeAttribute('tabindex');
      else element.setAttribute('tabindex','-1');
    });
  }

  function applyTechnicalVisibility(root){
    const scope=root?.querySelectorAll?root:global.document;
    if(!scope)return;
    const programmer=isProgrammer();
    scope.querySelectorAll('[data-technical],.programmer').forEach(element=>{
      if(element.classList?.contains('hdr-api-status'))return;
      if(element.dataset?.keepVisible==='true')return;
      if(element.dataset?.technical==='false')return;
      if(element.hasAttribute('data-technical'))element.hidden=!programmer;
    });
  }

  function applyRoleVisibility(root){
    applyRefreshVisibility(root);
    applyTechnicalVisibility(root);
  }

  function handlerFor(route,context){
    const registered=state.handlers.get(route);
    if(typeof registered==='function')return()=>registered(context);
    if(registered&&typeof registered.backgroundSync==='function')return()=>registered.backgroundSync(context);
    if(registered&&typeof registered.sync==='function')return()=>registered.sync(context);
    const objectName=ROUTE_OBJECTS[route];
    const target=objectName?global[objectName]:null;
    if(!target)return null;
    if(typeof target.backgroundSync==='function')return()=>target.backgroundSync(context);
    if(typeof target.syncInBackground==='function')return()=>target.syncInBackground(context);
    if(typeof target.refreshSilent==='function')return()=>target.refreshSilent(context);
    return null;
  }

  function register(route,handler){
    const key=String(route||'').trim();
    if(!key||!(typeof handler==='function'||(handler&&typeof handler==='object')))return false;
    state.handlers.set(key,handler);
    return true;
  }

  function unregister(route){return state.handlers.delete(String(route||''));}

  function markDirty(route){
    const key=String(route||state.route||'home');
    state.dirty.add(key);
    global.document?.dispatchEvent?.(new CustomEvent('mantto:data-dirty',{detail:{route:key,at:Date.now(),lab:true}}));
    return key;
  }

  function markDirtyMany(routes){unique(routes).forEach(markDirty);}

  function markSynced(route){
    const key=String(route||state.route||'home');
    state.dirty.delete(key);
    state.lastSync.set(key,Date.now());
    global.document?.dispatchEvent?.(new CustomEvent('mantto:data-synced',{detail:{route:key,at:Date.now(),lab:true}}));
    return key;
  }

  function resolveMutationRoutes(detail){
    const input=detail||{};
    const routes=[];
    if(Array.isArray(input.routes))routes.push(...input.routes);
    if(input.route)routes.push(input.route);
    if(!routes.length)routes.push(state.route||'home');
    return unique(routes);
  }

  function notifyMutation(detail){
    const routes=resolveMutationRoutes(detail);
    markDirtyMany(routes);
    if(routes.includes(state.route))global.setTimeout(()=>{void refresh(state.route,'mutacion',{force:true});},80);
    return routes;
  }

  async function refresh(route,reason,options){
    const key=String(route||state.route||'home');
    const opts=options||{};
    if(key!==state.route&&!opts.allowInactive){markDirty(key);return false;}
    if(global.document?.hidden&&!opts.force)return false;
    const last=state.lastSync.get(key)||0;
    if(!opts.force&&Date.now()-last<MIN_REFRESH_GAP_MS)return false;
    if(state.running.has(key))return state.running.get(key);
    const context={route:key,reason:reason||'lab-sync',payload:key===state.route?state.payload:null,silent:true,preserveUi:true,background:true,force:Boolean(opts.force),lab:true};
    const handler=handlerFor(key,context);
    if(!handler){state.lastSync.set(key,Date.now());return false;}
    const task=Promise.resolve().then(handler).then(result=>{if(result===false){state.lastSync.set(key,Date.now());return false;}markSynced(key);return true;}).catch(error=>{console.warn('[LAB DGB][DataSync] sincronización omitida:',error);state.lastSync.set(key,Date.now());return false;}).finally(()=>state.running.delete(key));
    state.running.set(key,task);
    return task;
  }

  function supportsBackgroundSync(route){
    const key=String(route||state.route||'home');
    return Boolean(handlerFor(key,{route:key,reason:'capability-check',silent:true,preserveUi:true,background:true,lab:true}));
  }

  function bind(){
    if(!global.document)return;
    global.document.addEventListener('mantto:navigation',event=>{
      state.route=String(event.detail?.route||'home');
      state.payload=event.detail?.payload||null;
      applyRoleVisibility(global.document);
      if(state.dirty.has(state.route))global.setTimeout(()=>{void refresh(state.route,'entrada-con-cambios',{force:true});},80);
      else state.lastSync.set(state.route,Date.now());
    });
    global.document.addEventListener('mantto:data-mutated',event=>notifyMutation(event.detail||{}));
    global.document.addEventListener('mantto:auth-ready',()=>applyRoleVisibility(global.document));
    global.document.addEventListener('mantto:view-user-changed',()=>applyRoleVisibility(global.document));
    applyRoleVisibility(global.document);
  }

  global.ManttoDataSync=Object.freeze({
    VERSION,
    register,
    unregister,
    refresh,
    notifyMutation,
    markDirty,
    markDirtyMany,
    supportsBackgroundSync,
    isProgrammer,
    applyRefreshVisibility,
    applyTechnicalVisibility,
    applyRoleVisibility,
    markSynced,
    resolveMutationRoutes,
    isDirty:route=>state.dirty.has(String(route||state.route||'home')),
    getDirtyRoutes:()=>Array.from(state.dirty),
    getCurrentRoute:()=>state.route,
    hasRefreshAdapter:()=>false,
    getRefreshAdapterRoutes:()=>[]
  });

  if(global.document){
    if(global.document.readyState==='loading')global.document.addEventListener('DOMContentLoaded',bind,{once:true});
    else bind();
  }
})(typeof window!=='undefined'?window:globalThis);
