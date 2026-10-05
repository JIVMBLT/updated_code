// [Claude | 2026-10-05 | CLAUDE-MG | LAB DGB - ENTREGAS V001]
(function initManttoLabEntregasRoutes(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.ManttoLabEntregasRoutes=api;})(typeof globalThis!=='undefined'?globalThis:this,function createManttoLabEntregasRoutes(root){
'use strict';
const GROUPS={entregas:'ENTREGAS'};
const PERMS={
  programadasRead:['ENTREGAS_CONTROL_PROGRAMADAS_LISTADO.VER'],
  programadasCreate:['ENTREGAS_CONTROL_PROGRAMADAS_LISTADO.CREAR'],
  programadasDelete:['ENTREGAS_CONTROL_PROGRAMADAS_LISTADO.DESACTIVAR'],
  misEntregasRead:['ENTREGAS_CONTROL_MIS_ENTREGAS_LISTADO.VER'],
  misEntregasUpload:['ENTREGAS_CONTROL_MIS_ENTREGAS_LISTADO.ADJUNTAR_ARCHIVO'],
  validacionRead:['ENTREGAS_CONTROL_VALIDACION_LISTADO.VER'],
  validacionValidar:['ENTREGAS_CONTROL_VALIDACION_LISTADO.VALIDAR'],
  indicadoresRead:['ENTREGAS_CONTROL_INDICADORES_PANEL.VER']
};
function entregasService(){const s=root?.ManttoLabEntregasService;if(!s)throw new Error('MANTTO_LAB_ENTREGAS_SERVICE_REQUIRED');return s;}
function permissionsService(){const s=root?.ManttoLabPermissionsService;if(!s)throw new Error('MANTTO_LAB_PERMISSIONS_SERVICE_REQUIRED');return s;}
function scopeService(){const s=root?.ManttoLabScopeService;if(!s)throw new Error('MANTTO_LAB_SCOPE_SERVICE_REQUIRED');return s;}
function actor(req){return req.actorUser||req.context?.actorUser||req.user||null;}function effective(req){return req.contextUser||req.user||req.context?.contextUser||req.context?.user||null;}function userId(req){return Number(effective(req)?.id_SB||0);}
function requireAuth(req,res,next){const fn=root?.ManttoLabAuthPermissionRoutes?.requireAuth;if(typeof fn==='function')return fn(req,res,next);if(!actor(req))return res.status(401).json({ok:false,message:'Selecciona una identidad de Laboratorio DGB.',code:'LAB_IDENTITY_REQUIRED'});return next();}
function group(code,db){return db.query('SELECT id_agrupacion,codigo FROM perm_agrupaciones WHERE activo=1 AND UPPER(TRIM(codigo))=? LIMIT 1',[String(code).toUpperCase()])[0]||null;}
function gate(codes,groupCode){const list=Array.isArray(codes)?codes:[codes];return function(req,res,next){const uid=userId(req);if(!uid)return res.status(401).json({ok:false,message:'Selecciona una identidad de Laboratorio DGB.',code:'LAB_IDENTITY_REQUIRED'});if(!list.some(c=>permissionsService().hasEffectivePermission(uid,c,req.db)))return res.status(403).json({ok:false,message:'No tienes autorización funcional para esta sección.',code:'LAB_FUNCTIONAL_PERMISSION_DENIED'});const g=group(groupCode,req.db);if(!g||!scopeService().groupAllowed(uid,Number(g.id_agrupacion),req.db))return res.status(403).json({ok:false,message:'El alcance de información no abre esta agrupación.',code:'LAB_INFORMATION_GATE_DENIED'});return next();};}
function body(req){return req.body&&typeof req.body==='object'?req.body:{};}
function wrap(data){return{ok:true,source:'lab-sqlite',data};}
function register(router){
  if(!router||typeof router.get!=='function')throw new Error('MANTTO_LAB_ROUTER_REQUIRED');if(router.__manttoLabEntregasV001Routes)return router;router.__manttoLabEntregasV001Routes=true;

  router.get('/api/entregas/opciones',requireAuth,gate(PERMS.programadasRead,GROUPS.entregas),(req,res)=>res.json(wrap(entregasService().opciones(userId(req),req.db))));

  router.get('/api/entregas/programadas',requireAuth,gate(PERMS.programadasRead,GROUPS.entregas),(req,res)=>res.json({ok:true,source:'lab-sqlite',...entregasService().listarProgramadas(userId(req),req.query,req.db)}));
  router.get('/api/entregas/programadas/:id',requireAuth,gate(PERMS.programadasRead,GROUPS.entregas),(req,res)=>res.json({ok:true,source:'lab-sqlite',...entregasService().detalleProgramada(userId(req),req.params.id,req.db)}));
  router.post('/api/entregas/programadas',requireAuth,gate(PERMS.programadasCreate,GROUPS.entregas),(req,res)=>res.status(201).json({ok:true,source:'lab-sqlite',...entregasService().crearProgramada(userId(req),body(req),actor(req),req.db)}));
  router.delete('/api/entregas/programadas/:id',requireAuth,gate(PERMS.programadasDelete,GROUPS.entregas),(req,res)=>res.json(wrap(entregasService().desactivarProgramada(userId(req),req.params.id,actor(req),req.db))));

  router.get('/api/entregas/mis-entregas',requireAuth,gate(PERMS.misEntregasRead,GROUPS.entregas),(req,res)=>res.json({ok:true,source:'lab-sqlite',...entregasService().misEntregas(userId(req),req.query,req.db)}));
  router.post('/api/entregas/instancias/:id/archivo',requireAuth,gate(PERMS.misEntregasUpload,GROUPS.entregas),async(req,res)=>res.status(201).json(wrap(await entregasService().subirArchivo(userId(req),req.params.id,body(req),actor(req),req.db))));
  router.get('/api/entregas/instancias/:id/archivo/acceso',requireAuth,gate(PERMS.misEntregasRead,GROUPS.entregas),async(req,res)=>res.json(wrap(await entregasService().archivoAcceso(userId(req),req.params.id,req.db))));

  router.get('/api/entregas/validacion',requireAuth,gate(PERMS.validacionRead,GROUPS.entregas),(req,res)=>res.json({ok:true,source:'lab-sqlite',...entregasService().validacionPendientes(userId(req),req.query,req.db)}));
  router.post('/api/entregas/instancias/:id/validar',requireAuth,gate(PERMS.validacionValidar,GROUPS.entregas),(req,res)=>res.json(wrap(entregasService().validar(userId(req),req.params.id,body(req),actor(req),req.db))));

  router.get('/api/entregas/indicadores',requireAuth,gate(PERMS.indicadoresRead,GROUPS.entregas),(req,res)=>res.json(wrap(entregasService().indicadores(userId(req),req.query,req.db))));

  return router;
}
return Object.freeze({register,PERMS,GROUPS});
});
