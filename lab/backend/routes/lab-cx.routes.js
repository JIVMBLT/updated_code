// [Claude | 2026-10-02 | CLAUDE-MG | LAB DGB - CUSTOMER EXPERIENCE V001]
(function initManttoLabCxRoutes(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.ManttoLabCxRoutes=api;})(typeof globalThis!=='undefined'?globalThis:this,function createManttoLabCxRoutes(root){
'use strict';
const GROUPS={cx:'CUSTOMER_EXPERIENCE'};
const PERMS={dashboardRead:['CUSTOMER_EXPERIENCE_DASHBOARD_ACCESO_VISUAL_MODULO.ACCESO_VISUAL'],encuestasRead:['CUSTOMER_EXPERIENCE_ENCUESTAS_ACCESO_VISUAL_MODULO.ACCESO_VISUAL']};
function cxService(){const s=root?.ManttoLabCxService;if(!s)throw new Error('MANTTO_LAB_CX_SERVICE_REQUIRED');return s;}
function permissionsService(){const s=root?.ManttoLabPermissionsService;if(!s)throw new Error('MANTTO_LAB_PERMISSIONS_SERVICE_REQUIRED');return s;}
function scopeService(){const s=root?.ManttoLabScopeService;if(!s)throw new Error('MANTTO_LAB_SCOPE_SERVICE_REQUIRED');return s;}
function actor(req){return req.actorUser||req.context?.actorUser||req.user||null;}function effective(req){return req.contextUser||req.user||req.context?.contextUser||req.context?.user||null;}function userId(req){return Number(effective(req)?.id_SB||0);}
function requireAuth(req,res,next){const fn=root?.ManttoLabAuthPermissionRoutes?.requireAuth;if(typeof fn==='function')return fn(req,res,next);if(!actor(req))return res.status(401).json({ok:false,message:'Selecciona una identidad de Laboratorio DGB.',code:'LAB_IDENTITY_REQUIRED'});return next();}
function group(code,db){return db.query('SELECT id_agrupacion,codigo FROM perm_agrupaciones WHERE activo=1 AND UPPER(TRIM(codigo))=? LIMIT 1',[String(code).toUpperCase()])[0]||null;}
function gate(codes,groupCode){const list=Array.isArray(codes)?codes:[codes];return function(req,res,next){const uid=userId(req);if(!uid)return res.status(401).json({ok:false,message:'Selecciona una identidad de Laboratorio DGB.',code:'LAB_IDENTITY_REQUIRED'});if(!list.some(c=>permissionsService().hasEffectivePermission(uid,c,req.db)))return res.status(403).json({ok:false,message:'No tienes autorización funcional para esta sección.',code:'LAB_FUNCTIONAL_PERMISSION_DENIED'});const g=group(groupCode,req.db);if(!g||!scopeService().groupAllowed(uid,Number(g.id_agrupacion),req.db))return res.status(403).json({ok:false,message:'El alcance de información no abre esta agrupación.',code:'LAB_INFORMATION_GATE_DENIED'});return next();};}
function wrap(data){return{ok:true,source:'lab-sqlite',data};}
function register(router){
  if(!router||typeof router.get!=='function')throw new Error('MANTTO_LAB_ROUTER_REQUIRED');if(router.__manttoLabCxV001Routes)return router;router.__manttoLabCxV001Routes=true;
  router.get('/api/customer-experience/opciones',requireAuth,gate(PERMS.dashboardRead,GROUPS.cx),(req,res)=>res.json(wrap(cxService().opciones(userId(req),req.db))));
  router.get('/api/customer-experience/dashboard',requireAuth,gate(PERMS.dashboardRead,GROUPS.cx),(req,res)=>res.json({ok:true,source:'lab-sqlite',...cxService().dashboard(userId(req),req.query,req.db)}));
  router.get('/api/customer-experience/venta-instalacion/encuestas',requireAuth,gate(PERMS.encuestasRead,GROUPS.cx),(req,res)=>res.json({ok:true,source:'lab-sqlite',...cxService().listarVentaInstalacion(userId(req),req.query,req.db)}));
  router.get('/api/customer-experience/mantenimiento/encuestas',requireAuth,gate(PERMS.encuestasRead,GROUPS.cx),(req,res)=>res.json({ok:true,source:'lab-sqlite',...cxService().listarMantenimiento(userId(req),req.query,req.db)}));
  return router;
}
return Object.freeze({register,PERMS,GROUPS});
});
