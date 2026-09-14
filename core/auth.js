(function installManttoLabAuthFacade(global){
  'use strict';
  if(!global.MANTTO_LAB_MODE)throw new Error('MANTTO_LAB_AUTH_LOADED_OUTSIDE_LAB');
  if(!global.ManttoLabAuth)throw new Error('MANTTO_LAB_AUTH_NOT_READY');
  // Mantiene exactamente la superficie pública consumida por el frontend real.
  global.ManttoAuth=global.ManttoLabAuth;
})(typeof window!=='undefined'?window:globalThis);
