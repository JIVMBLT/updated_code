(function installManttoLabPushNotifications(global){
  'use strict';

  const VERSION='FASE_11_LAB_DGB_PUSH_COMPAT_V001';

  function result(){
    return {
      active:false,
      supported:false,
      permission:'lab-disabled',
      lab:true,
      version:VERSION,
      reason:'Push remoto deshabilitado en Laboratorio DGB.'
    };
  }

  function supported(){return false;}
  async function init(){return result();}
  async function enable(){return result();}
  async function disable(){return result();}

  global.ManttoPushNotifications=Object.freeze({
    VERSION,
    init,
    enable,
    ensureEnabled:enable,
    disable,
    supported,
    getStatus:result
  });

  if(global.document){
    global.document.addEventListener('mantto:auth-ready',()=>{void init();});
  }
})(typeof window!=='undefined'?window:globalThis);
