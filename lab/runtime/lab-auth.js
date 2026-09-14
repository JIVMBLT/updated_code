(function initManttoLabAuth(global){
  'use strict';

  const IDENTITY_KEY='mantto_lab_identity_id_v2';
  const VIEW_USER_KEY='mantto_lab_view_user_v2';
  const VIEWER_TOKEN_KEY='mantto_lab_viewer_token_v2';
  const VIEWER_LAUNCH_PREFIX='mantto:lab:v2:viewer:launch:';
  const VIEWER_LAUNCH_PARAM='viewer_launch';
  const VIEWER_LAUNCH_TTL_MS=60000;
  const PRODUCTION_AUTH_KEYS=['mantto_token','mantto_user','mantto_session','mantto_session_csrf','mantto_view_user','mantto_viewer_token'];
  const state={actor:null,viewUser:null,initialized:false,selectorVisible:false};

  function $(id){return document.getElementById(id);}
  function esc(value){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
  function dispatch(name,detail){document?.dispatchEvent?.(new CustomEvent(name,{detail:detail||{}}));}
  function clearProductionAuthState(){PRODUCTION_AUTH_KEYS.forEach(key=>{try{localStorage.removeItem(key);}catch(_e){}try{sessionStorage.removeItem(key);}catch(_e){}});}
  function getToken(){return state.actor?`LAB_DGB_V2_TOKEN_${Number(state.actor.id_SB)}`:'';}
  function getActorUser(){return state.actor;}
  function getViewUser(){return state.viewUser;}
  function getUser(){return state.viewUser||state.actor;}
  function isViewingAs(){return Boolean(state.actor&&state.viewUser&&Number(state.actor.id_SB)!==Number(state.viewUser.id_SB));}
  function rolesForUser(userId){return global.ManttoLabPermissionsService?.activeRoles?.(userId,global.ManttoLabDB)||[];}
  function hydrate(row){if(!row)return null;const details=rolesForUser(row.id_SB);const principal=details.find(role=>role.principal)||details[0]||{};return Object.assign({},row,{rol:principal.rol||row.rol||'Sin rol',rol_id:principal.id_rol||row.rol_id||null,roles:details.map(role=>role.rol).filter(Boolean),roles_detalle:details});}
  function loadUser(userId){const id=Number(userId);if(!Number.isInteger(id)||id<=0)return null;const row=global.ManttoLabDB.query(`SELECT u.id_SB,u.nombre,u.iniciales,u.correo,u.puesto,u.area,u.empresa,u.rol_id,u.reporta_a,u.estado,r.rol FROM usuarios u LEFT JOIN roles r ON r.id_rol=u.rol_id WHERE u.id_SB=? AND u.estado=1 LIMIT 1`,[id])[0];return hydrate(row);}
  function listLabIdentities(){return global.ManttoLabDB.query(`SELECT u.id_SB,u.nombre,u.iniciales,u.correo,u.empresa,u.puesto,u.area,u.rol_id,r.rol,r.codigo AS rol_codigo,r.empresa AS rol_empresa FROM usuarios u JOIN roles r ON r.id_rol=u.rol_id WHERE u.estado=1 AND r.estado=1 ORDER BY r.id_rol,u.nombre`).map(hydrate);}

  function applyUserToHeader(user){const current=user||getUser();if(!current)return;const map={'hdr-user-name':current.nombre||current.correo||'Usuario LAB','hdr-user-initials':current.iniciales||'LB','hdr-user-company':current.empresa||'LAB','hdr-user-role':current.rol||'Sin rol'};Object.entries(map).forEach(([id,value])=>{const element=$(id);if(element)element.textContent=value;});}
  function showApp(){const boot=$('auth-bootstrap-screen'),auth=$('auth-screen'),app=$('app');if(boot)boot.classList.add('hidden');if(auth)auth.classList.add('hidden');if(app)app.classList.remove('auth-hidden');}
  function hideApp(){const app=$('app'),boot=$('auth-bootstrap-screen'),auth=$('auth-screen');if(app)app.classList.add('auth-hidden');if(boot)boot.classList.add('hidden');if(auth)auth.classList.add('hidden');}

  function ensureLabBadge(){
    if($('lab-dgb-banner'))return;
    const element=document.createElement('div');element.id='lab-dgb-banner';element.className='lab-dgb-banner';
    element.innerHTML='<div class="lab-dgb-banner-title">LABORATORIO DGB</div><div class="lab-dgb-banner-status"><b>DATOS FICTICIOS</b><span>·</span><b>SIN CONEXIÓN A PRODUCCIÓN</b></div><div class="lab-dgb-banner-user" id="lab-dgb-banner-user">Sin identidad</div><button type="button" id="lab-dgb-change-user">Cambiar usuario LAB</button><button type="button" id="lab-dgb-reset">Reset LAB</button>';
    document.body.appendChild(element);
    $('lab-dgb-change-user')?.addEventListener('click',()=>showIdentitySelector({changing:true}));
    $('lab-dgb-reset')?.addEventListener('click',async()=>{if(!global.confirm||global.confirm('¿Restablecer todos los datos ficticios del Laboratorio DGB?')){await (global.ManttoLabPhase10?.resetDatabase ? global.ManttoLabPhase10.resetDatabase() : (global.ManttoLabPhase9?.resetDatabase ? global.ManttoLabPhase9.resetDatabase() : (global.ManttoLabPhase8?.resetDatabase ? global.ManttoLabPhase8.resetDatabase() : (global.ManttoLabPhase7?.resetDatabase ? global.ManttoLabPhase7.resetDatabase() : (global.ManttoLabPhase6?.resetDatabase ? global.ManttoLabPhase6.resetDatabase() : (global.ManttoLabPhase5?.resetDatabase ? global.ManttoLabPhase5.resetDatabase() : global.ManttoLabPhase4.resetDatabase()))))));localStorage.removeItem(IDENTITY_KEY);sessionStorage.removeItem(VIEW_USER_KEY);sessionStorage.removeItem(VIEWER_TOKEN_KEY);global.location.reload();}});
  }
  function updateBadge(){ensureLabBadge();const element=$('lab-dgb-banner-user'),user=getUser();if(element)element.textContent=user?`${user.nombre} · ${user.rol} · ${user.empresa||'LAB'}`:'Sin identidad LAB';document.body.classList.toggle('lab-viewer-active',isViewingAs());}

  function ensureSelector(){
    let overlay=$('lab-identity-overlay');if(overlay)return overlay;
    overlay=document.createElement('section');overlay.id='lab-identity-overlay';overlay.className='lab-identity-overlay';
    overlay.innerHTML='<div class="lab-identity-card"><div class="lab-identity-kicker">LABORATORIO DGB</div><h1>Seleccionar identidad de laboratorio</h1><p>Todos los usuarios y datos mostrados en este laboratorio son ficticios.</p><div class="lab-identity-warning">DATOS FICTICIOS · SIN CONEXIÓN A PRODUCCIÓN</div><input id="lab-identity-search" type="search" autocomplete="off" placeholder="Buscar rol, empresa o usuario LAB..."><div id="lab-identity-list" class="lab-identity-list"></div><button type="button" id="lab-identity-cancel" class="lab-identity-cancel">Cancelar</button></div>';
    document.body.appendChild(overlay);
    $('lab-identity-search')?.addEventListener('input',renderIdentityList);
    $('lab-identity-cancel')?.addEventListener('click',()=>{if(state.actor){overlay.hidden=true;state.selectorVisible=false;showApp();}});
    return overlay;
  }
  function identityLabel(user){return [user.rol,user.empresa,user.correo].filter(Boolean).join(' · ');}
  function renderIdentityList(){const list=$('lab-identity-list');if(!list)return;const query=String($('lab-identity-search')?.value||'').trim().toLowerCase();const rows=listLabIdentities().filter(user=>!query||`${user.nombre} ${user.rol} ${user.empresa} ${user.correo}`.toLowerCase().includes(query));list.innerHTML=rows.length?rows.map(user=>`<button type="button" class="lab-identity-option" data-lab-user="${Number(user.id_SB)}"><span><b>${esc(user.nombre)}</b><small>${esc(identityLabel(user))}</small></span><strong>#${Number(user.id_SB)}</strong></button>`).join(''):'<div class="lab-identity-empty">No se encontraron identidades.</div>';list.querySelectorAll('[data-lab-user]').forEach(button=>button.addEventListener('click',()=>selectLabIdentity(Number(button.dataset.labUser))));}
  function showIdentitySelector(){ensureLabBadge();const overlay=ensureSelector();state.selectorVisible=true;overlay.hidden=false;hideApp();renderIdentityList();const cancel=$('lab-identity-cancel');if(cancel)cancel.hidden=!state.actor;setTimeout(()=>$('lab-identity-search')?.focus(),0);return true;}

  async function selectLabIdentity(userId){await (global.ManttoLabPhase10Ready||global.ManttoLabPhase9Ready||global.ManttoLabPhase8Ready||global.ManttoLabPhase7Ready||global.ManttoLabPhase6Ready||global.ManttoLabPhase5Ready||global.ManttoLabPhase4Ready);const user=loadUser(userId);if(!user)throw new Error('Identidad LAB no encontrada o inactiva.');const changed=state.actor&&Number(state.actor.id_SB)!==Number(user.id_SB);state.actor=user;state.viewUser=null;localStorage.setItem(IDENTITY_KEY,String(user.id_SB));sessionStorage.removeItem(VIEW_USER_KEY);sessionStorage.removeItem(VIEWER_TOKEN_KEY);applyUserToHeader(user);updateBadge();const overlay=$('lab-identity-overlay');if(overlay)overlay.hidden=true;state.selectorVisible=false;showApp();if(changed&&state.initialized){dispatch('mantto:lab-identity-changed',{user});global.location.reload();return user;}if(!state.initialized){state.initialized=true;dispatch('mantto:auth-ready',{user,actor:user,lab:true});}return user;}

  function setViewUser(user){state.viewUser=user?hydrate(user):null;if(state.viewUser)sessionStorage.setItem(VIEW_USER_KEY,JSON.stringify(state.viewUser));else{sessionStorage.removeItem(VIEW_USER_KEY);sessionStorage.removeItem(VIEWER_TOKEN_KEY);}applyUserToHeader(getUser());updateBadge();dispatch('mantto:view-user-changed',{user:state.viewUser,lab:true});return state.viewUser;}
  function clearViewUser(){return setViewUser(null);}
  function hydrateViewerUser(user){return setViewUser(user);}
  function cleanupViewerLaunches(){const now=Date.now();for(let index=localStorage.length-1;index>=0;index-=1){const key=localStorage.key(index);if(!key||!key.startsWith(VIEWER_LAUNCH_PREFIX))continue;try{const value=JSON.parse(localStorage.getItem(key)||'null');if(!value||Number(value.expires_at||0)<now)localStorage.removeItem(key);}catch(_e){localStorage.removeItem(key);}}}
  function createViewerLaunch(context){const user=context?.user,token=String(context?.viewer_token||'').trim();if(!user?.id_SB||!token)throw new Error('Contexto LAB inválido para abrir el visor.');cleanupViewerLaunches();const launchId=global.crypto?.randomUUID?.()||`viewer-${Date.now()}-${Math.random().toString(16).slice(2)}`;localStorage.setItem(VIEWER_LAUNCH_PREFIX+launchId,JSON.stringify({user,viewer_token:token,read_only:true,expires_at:Date.now()+VIEWER_LAUNCH_TTL_MS}));const url=new URL(global.location.href);url.searchParams.set(VIEWER_LAUNCH_PARAM,launchId);url.hash='#/home';return url.toString();}
  function consumeViewerLaunch(){const url=new URL(global.location.href);const launchId=url.searchParams.get(VIEWER_LAUNCH_PARAM);if(!launchId)return null;const key=VIEWER_LAUNCH_PREFIX+launchId;let launch=null;try{launch=JSON.parse(localStorage.getItem(key)||'null');}catch(_e){}localStorage.removeItem(key);url.searchParams.delete(VIEWER_LAUNCH_PARAM);global.history?.replaceState?.(global.history.state,document.title,url.pathname+(url.searchParams.toString()?'?'+url.searchParams.toString():'')+url.hash);if(!launch||Number(launch.expires_at||0)<Date.now()||!launch.user?.id_SB||!launch.viewer_token)return null;sessionStorage.setItem(VIEWER_TOKEN_KEY,String(launch.viewer_token));return launch.user;}

  async function api(path,options){await (global.ManttoLabPhase10Ready||global.ManttoLabPhase9Ready||global.ManttoLabPhase8Ready||global.ManttoLabPhase7Ready||global.ManttoLabPhase6Ready||global.ManttoLabPhase5Ready||global.ManttoLabPhase4Ready);if(!global.ManttoLabTransport)throw new Error('Transporte LAB no disponible.');return global.ManttoLabTransport.request(path,options||{});}
  function apiGet(path,options){return api(path,Object.assign({},options||{},{method:'GET'}));}
  function apiPost(path,body,options){const cfg=Object.assign({},options||{},{method:'POST'});if(body!==undefined)cfg.body=typeof body==='string'?body:JSON.stringify(body);cfg.headers=Object.assign({'Content-Type':'application/json'},cfg.headers||{});return api(path,cfg);}
  function authHeaders(){const headers={};if(state.actor){headers.Authorization=`Bearer ${getToken()}`;headers['X-Lab-Actor-ID']=String(state.actor.id_SB);}if(state.viewUser)headers['X-View-User-ID']=String(state.viewUser.id_SB);const viewerToken=sessionStorage.getItem(VIEWER_TOKEN_KEY);if(viewerToken)headers['X-Viewer-Token']=viewerToken;return headers;}

  async function logout(){localStorage.removeItem(IDENTITY_KEY);sessionStorage.removeItem(VIEW_USER_KEY);sessionStorage.removeItem(VIEWER_TOKEN_KEY);state.actor=null;state.viewUser=null;state.initialized=false;updateBadge();showIdentitySelector();}
  async function init(){await (global.ManttoLabPhase10Ready||global.ManttoLabPhase9Ready||global.ManttoLabPhase8Ready||global.ManttoLabPhase7Ready||global.ManttoLabPhase6Ready||global.ManttoLabPhase5Ready||global.ManttoLabPhase4Ready);clearProductionAuthState();ensureLabBadge();const saved=Number(localStorage.getItem(IDENTITY_KEY)||0);state.actor=loadUser(saved);const launched=consumeViewerLaunch();if(launched&&state.actor)setViewUser(launched);else{try{const stored=JSON.parse(sessionStorage.getItem(VIEW_USER_KEY)||'null');if(stored&&state.actor)state.viewUser=hydrate(stored);}catch(_e){state.viewUser=null;}}if(!state.actor){showIdentitySelector();return false;}applyUserToHeader(getUser());updateBadge();showApp();state.initialized=true;dispatch('mantto:auth-ready',{user:getUser(),actor:state.actor,lab:true});return true;}

  global.ManttoLabAuth=Object.freeze({init,logout,getToken,getUser,getActorUser,getViewUser,setViewUser,clearViewUser,isViewingAs,createViewerLaunch,hydrateViewerUser,applyUserToHeader,api,apiGet,apiPost,authHeaders,selectLabIdentity,listLabIdentities,showIdentitySelector});
})(typeof window!=='undefined'?window:globalThis);
