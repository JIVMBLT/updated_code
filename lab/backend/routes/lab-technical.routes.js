(function initManttoLabTechnicalRoutes(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.ManttoLabTechnicalRoutes=api;})(typeof globalThis!=='undefined'?globalThis:this,function createManttoLabTechnicalRoutes(root){
'use strict';
function services(){const s={diag:root?.ManttoLabDiagnosticsService,jobs:root?.ManttoLabJobsService,backup:root?.ManttoLabBackupService};if(Object.values(s).some(v=>!v))throw new Error('MANTTO_LAB_PHASE10_SERVICES_REQUIRED');return s;}
function actor(req){return req.actorUser||req.context?.actorUser||req.user||null;}
function effective(req){return req.contextUser||req.user||req.context?.contextUser||req.context?.user||null;}
function requireAuth(req,res,next){const fn=root?.ManttoLabAuthPermissionRoutes?.requireAuth;if(typeof fn==='function')return fn(req,res,next);if(!actor(req))return res.status(401).json({ok:false,message:'Selecciona una identidad de Laboratorio DGB.',code:'LAB_IDENTITY_REQUIRED'});return next();}
function programmerOnly(req,res,next){try{services().diag.assertProgrammer(effective(req),req.db);return next();}catch(error){return next(error);}}
function register(router){
 if(!router||typeof router.get!=='function')throw new Error('MANTTO_LAB_ROUTER_REQUIRED');
 if(router.__manttoLabPhase10V002Routes)return router;router.__manttoLabPhase10V002Routes=true;
 router.get('/api/__lab/closure',requireAuth,programmerOnly,async(req,res)=>res.json({ok:true,source:'lab-local',data:await services().diag.closure(req.db)}));
 router.get('/api/__lab/health',requireAuth,programmerOnly,async(req,res)=>res.json({ok:true,source:'lab-local',data:await services().diag.health(req.db)}));
 router.get('/api/__lab/routes',requireAuth,programmerOnly,(req,res)=>res.json({ok:true,source:'lab-local',data:services().diag.routeCoverage()}));
 router.get('/api/__lab/jobs',requireAuth,programmerOnly,(req,res)=>res.json({ok:true,source:'lab-local',data:services().jobs.status()}));
 router.route('POST','/api/__lab/jobs/:name/run',{transaction:false},requireAuth,programmerOnly,async(req,res)=>res.json({ok:true,source:'lab-local',data:await services().jobs.run(req.params.name,{db:root.ManttoLabDB,user:effective(req),blobStore:root.ManttoLabBlobStore})}));
 router.get('/api/__lab/backup/summary',requireAuth,programmerOnly,async(req,res)=>res.json({ok:true,source:'lab-local',data:await services().backup.summary({db:req.db,blobStore:root.ManttoLabBlobStore})}));
 return router;
}
return Object.freeze({register,requireAuth,programmerOnly});
});
