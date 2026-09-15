(function installManttoLabAuthFacade(global){
  'use strict';
  // [CLAUDE | 2026-09-14 | fix] Reparación interna del LAB — no es una integración numerada, sin MD asociado.
  // core/config.js puede resolver sus dependencias LAB de forma sincrona
  // (document.write, mientras el parser sigue "loading") o de forma
  // diferida (createElement+appendChild, sin bloquear el parser). En el
  // camino diferido este script podia ejecutarse ANTES de que
  // window.ManttoLabAuth existiera, y el throw sincrono de abajo dejaba
  // window.ManttoAuth indefinido para siempre: app.js caia a
  // initAfterAuth() sin sesion y la pantalla "Validando sesion..." nunca
  // se ocultaba (solo lo hace ManttoLabAuth.init() via showApp()).
  // Fix: esperar la promesa que core/config.js YA expone para esto
  // (window.ManttoLabCoreReady) antes de exponer window.ManttoAuth, y
  // publicar window.ManttoAuthReady para que app.js espere lo mismo.
  if(!global.MANTTO_LAB_MODE)throw new Error('MANTTO_LAB_AUTH_LOADED_OUTSIDE_LAB');
  const coreReady=global.ManttoLabCoreReady;
  if(!coreReady||typeof coreReady.then!=='function')throw new Error('MANTTO_LAB_CORE_READY_MISSING');
  // Mantiene exactamente la superficie pública consumida por el frontend real.
  global.ManttoAuthReady=coreReady.then(function attach(){
    if(!global.ManttoLabAuth)throw new Error('MANTTO_LAB_AUTH_NOT_READY');
    global.ManttoAuth=global.ManttoLabAuth;
    return global.ManttoAuth;
  });
})(typeof window!=='undefined'?window:globalThis);
