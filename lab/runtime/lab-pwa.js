(function initManttoLabPwa(root){
'use strict';
const VERSION='FASE_10_LAB_DGB_PWA_V002';
const scriptUrl=(typeof document!=='undefined'&&document.currentScript?.src)?new URL(document.currentScript.src):null;
const labRoot=scriptUrl?new URL('../',scriptUrl):null;
let registration=null;let lastError=null;
function dispatch(name,detail){if(root?.document&&typeof root.CustomEvent==='function')root.document.dispatchEvent(new root.CustomEvent(name,{detail:detail||{}}));}
function supported(){return Boolean(root?.navigator?.serviceWorker&&labRoot&&/^https?:$/.test(labRoot.protocol));}
async function register(){if(!supported())return getStatus();try{registration=await root.navigator.serviceWorker.register(new URL('sw.js',labRoot).href,{scope:labRoot.href});lastError=null;dispatch('mantto:lab-pwa-ready',getStatus());return getStatus();}catch(error){lastError=error?.message||String(error);dispatch('mantto:lab-pwa-error',{message:lastError});return getStatus();}}
async function unregister(){if(!root?.navigator?.serviceWorker)return false;const regs=await root.navigator.serviceWorker.getRegistrations();let removed=false;for(const reg of regs){if(labRoot&&String(reg.scope||'').startsWith(labRoot.href)){removed=(await reg.unregister())||removed;if(registration===reg)registration=null;}}return removed;}
function getStatus(){return{version:VERSION,supported:supported(),registered:Boolean(registration),scope:registration?.scope||labRoot?.href||null,serviceWorker:labRoot?new URL('sw.js',labRoot).href:null,lastError,offlineScope:'LAB_ONLY',productionConnectionsAllowed:false};}
root.ManttoLabPwa=Object.freeze({VERSION,register,unregister,getStatus,supported});
})(typeof window!=='undefined'?window:globalThis);
