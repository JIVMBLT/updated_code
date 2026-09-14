(function initManttoLabPhase9Routes(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.ManttoLabPhase9Routes=api;})(typeof globalThis!=='undefined'?globalThis:this,function createManttoLabPhase9Routes(root){
'use strict';
const GROUPS={installations:'INSTALACIONES',logistics:'LOGISTICA',warehouse:'ALMACEN'};
const PERMS={
 installationsRead:['INSTALACIONES_PROYECTOS_TABLA_ACTIVOS_REGISTROS.VER','INSTALACIONES_DASHBOARD_ACCESO_VISUAL_MODULO.ACCESO_VISUAL'],
 installationsDetail:['INSTALACIONES_PROYECTOS_TABLA_ACTIVOS_REGISTROS.ABRIR_DETALLE','INSTALACIONES_DASHBOARD_PROYECTOS_ACTIVOS_LISTADO.ABRIR_DETALLE'],
 installationsEdit:['INSTALACIONES_DASHBOARD_REPORTE_SECCION_LISTADO.EDITAR'],
 installationsFolders:['INSTALACIONES_CARPETAS_ACCESO_VISUAL_MODULO.ACCESO_VISUAL','INSTALACIONES_CARPETAS_CARPETAS_REGISTRADAS_LISTADO.VER'],
 installationsFolderCreate:['INSTALACIONES_CARPETAS_RELACIONADOR_FORMULARIO.CREAR'],
 installationsDocs:['INSTALACIONES_DOCUMENTACION_ACCESO_VISUAL_MODULO.ACCESO_VISUAL','INSTALACIONES_DOCUMENTACION_LISTADO_EQUIPOS.VER'],
 logistics:['LOGISTICA_PRODUCCION_ACCESO_VISUAL_MODULO.ACCESO_VISUAL','LOGISTICA_DASHBOARD_PIPELINE_POR_ESTATUS_ETAPAS.VER'],
 logisticsReport:['LOGISTICA_REPORTE_DETALLE_POR_ESTATUS_DETALLE.VER','LOGISTICA_REPORTE_DETALLE_POR_ESTATUS_TABLA.VER'],
 warehouseDashboard:['ALMACEN_DASHBOARD_ACCESO_VISUAL_MODULO.ACCESO_VISUAL'],
 warehouseInventory:['ALMACEN_INVENTARIOS_ACCESO_VISUAL_MODULO.ACCESO_VISUAL'],
 warehouseMovements:['ALMACEN_MOVIMIENTOS_ACCESO_VISUAL_MODULO.ACCESO_VISUAL']
};
function services(){const s={ins:root?.ManttoLabInstallationsService,log:root?.ManttoLabLogisticsService,wh:root?.ManttoLabWarehouseService,permissions:root?.ManttoLabPermissionsService,scope:root?.ManttoLabScopeService};if(Object.values(s).some(v=>!v))throw new Error('MANTTO_LAB_PHASE9_SERVICES_REQUIRED');return s;}
function actor(req){return req.actorUser||req.context?.actorUser||req.user||null;}function effective(req){return req.contextUser||req.user||req.context?.contextUser||req.context?.user||null;}function userId(req){return Number(effective(req)?.id_SB||0);}
function requireAuth(req,res,next){const fn=root?.ManttoLabAuthPermissionRoutes?.requireAuth;if(typeof fn==='function')return fn(req,res,next);if(!actor(req))return res.status(401).json({ok:false,message:'Selecciona una identidad de Laboratorio DGB.',code:'LAB_IDENTITY_REQUIRED'});return next();}
function group(code,db){return db.query('SELECT id_agrupacion,codigo FROM perm_agrupaciones WHERE activo=1 AND UPPER(TRIM(codigo))=? LIMIT 1',[String(code).toUpperCase()])[0]||null;}
function gate(codes,groupCode){const list=Array.isArray(codes)?codes:[codes];return function(req,res,next){const uid=userId(req);if(!uid)return res.status(401).json({ok:false,message:'Selecciona una identidad de Laboratorio DGB.',code:'LAB_IDENTITY_REQUIRED'});if(!list.some(c=>services().permissions.hasEffectivePermission(uid,c,req.db)))return res.status(403).json({ok:false,message:'No tienes autorización funcional para esta sección.',code:'LAB_FUNCTIONAL_PERMISSION_DENIED'});const g=group(groupCode,req.db);if(!g||!services().scope.groupAllowed(uid,Number(g.id_agrupacion),req.db))return res.status(403).json({ok:false,message:'El alcance de información no abre esta agrupación.',code:'LAB_INFORMATION_GATE_DENIED'});return next();};}
function local501(req,res){return res.status(501).json({ok:false,code:'LAB_MOCK_NOT_IMPLEMENTED',message:'Esta integración externa está deshabilitada en Laboratorio DGB.'});}
function wrap(data){return{ok:true,source:'lab-sqlite',data};}
function body(req){return req.body&&typeof req.body==='object'?req.body:{};}
function register(router){
 if(!router||typeof router.get!=='function')throw new Error('MANTTO_LAB_ROUTER_REQUIRED');if(router.__manttoLabPhase9V002Routes)return router;router.__manttoLabPhase9V002Routes=true;
 // INSTALACIONES CORELLIAN - local SQLite/IndexedDB.
 router.get('/api/instalaciones/dashboard',requireAuth,gate(PERMS.installationsRead,GROUPS.installations),(req,res)=>res.json({ok:true,source:'lab-sqlite',...services().ins.dashboard(userId(req),req.db)}));
 router.get('/api/instalaciones/proyectos',requireAuth,gate(PERMS.installationsRead,GROUPS.installations),(req,res)=>res.json({ok:true,source:'lab-sqlite',...services().ins.listProjects(userId(req),req.query,req.db)}));
 router.get('/api/instalaciones/proyectos/:id',requireAuth,gate([...PERMS.installationsRead,...PERMS.installationsDetail],GROUPS.installations),(req,res)=>res.json(wrap(services().ins.detail(userId(req),req.params.id,req.db))));
 router.patch('/api/instalaciones/proyectos/:id',requireAuth,gate(PERMS.installationsEdit,GROUPS.installations),(req,res)=>res.json(wrap(services().ins.update(userId(req),req.params.id,body(req),actor(req),req.db))));
 router.get('/api/instalaciones/carpetas',requireAuth,gate(PERMS.installationsFolders,GROUPS.installations),(req,res)=>res.json({ok:true,source:'lab-sqlite',data:services().ins.listFolders(req.db)}));
 router.post('/api/instalaciones/proyectos/:id/carpeta',requireAuth,gate(PERMS.installationsFolderCreate,GROUPS.installations),(req,res)=>res.status(201).json(wrap(services().ins.ensureFolder(userId(req),req.params.id,body(req),actor(req),req.db))));
 router.get('/api/instalaciones/proyectos/:id/documentos',requireAuth,gate(PERMS.installationsDocs,GROUPS.installations),(req,res)=>res.json({ok:true,source:'lab-sqlite',data:services().ins.detail(userId(req),req.params.id,req.db).documentos}));
 router.post('/api/instalaciones/proyectos/:id/documentos',requireAuth,gate(PERMS.installationsDocs,GROUPS.installations),async(req,res)=>res.status(201).json(wrap(await services().ins.addDocument(userId(req),req.params.id,body(req),actor(req),req.db))));
 router.get('/api/instalaciones/proyectos/:id/documentos/:idDocumento/acceso',requireAuth,gate(PERMS.installationsDocs,GROUPS.installations),async(req,res)=>res.json(wrap(await services().ins.docAccess(userId(req),req.params.id,req.params.idDocumento,req.db))));
 router.delete('/api/instalaciones/proyectos/:id/documentos/:idDocumento',requireAuth,gate(PERMS.installationsDocs,GROUPS.installations),async(req,res)=>res.json(wrap(await services().ins.removeDocument(userId(req),req.params.id,req.params.idDocumento,actor(req),req.db))));
 router.post('/api/instalaciones/drive/sync',requireAuth,local501);router.post('/api/instalaciones/proyectos/:id/drive/sync',requireAuth,local501);
 // PRODUCCION / LOGISTICA.
 router.get('/api/logistica/config',requireAuth,gate(PERMS.logistics,GROUPS.logistics),(req,res)=>res.json({ok:true,source:'lab-sqlite',config:services().log.config(req.db)}));
 router.get('/api/logistica/config/google-sheets/columns',requireAuth,gate(PERMS.logistics,GROUPS.logistics),(req,res)=>res.json({ok:true,source:'lab-sqlite',columns:services().log.config(req.db).columns,google_sheets:false}));
 router.get('/api/logistica/entities/piezas',requireAuth,gate(PERMS.logistics,GROUPS.logistics),(req,res)=>res.json({ok:true,source:'lab-sqlite',...services().log.pieces(userId(req),req.query,req.db)}));
 router.get('/api/logistica/resumen-semanal',requireAuth,gate(PERMS.logistics,GROUPS.logistics),(req,res)=>res.json(services().log.weeklySummary(userId(req),req.query,req.db)));
 router.get('/api/logistica',requireAuth,gate(PERMS.logistics,GROUPS.logistics),(req,res)=>res.json({ok:true,source:'lab-sqlite',...services().log.list(userId(req),req.query,req.db)}));
 router.post('/api/logistica',requireAuth,gate(PERMS.logistics,GROUPS.logistics),(req,res)=>res.status(201).json(wrap(services().log.create(userId(req),body(req),actor(req),req.db))));
 router.get('/api/logistica/:id',requireAuth,gate(PERMS.logisticsReport,GROUPS.logistics),(req,res)=>res.json(wrap(services().log.detail(userId(req),req.params.id,req.db))));
 router.patch('/api/logistica/:id',requireAuth,gate(PERMS.logistics,GROUPS.logistics),(req,res)=>res.json(wrap(services().log.update(userId(req),req.params.id,body(req),actor(req),req.db))));
 router.put('/api/logistica/:id',requireAuth,gate(PERMS.logistics,GROUPS.logistics),(req,res)=>res.json(wrap(services().log.update(userId(req),req.params.id,body(req),actor(req),req.db))));
 router.delete('/api/logistica/:id',requireAuth,gate(PERMS.logistics,GROUPS.logistics),(req,res)=>res.json(wrap(services().log.remove(userId(req),req.params.id,actor(req),req.db))));
 router.post('/api/logistica/:id/archivos',requireAuth,gate(PERMS.logistics,GROUPS.logistics),async(req,res)=>res.status(201).json(wrap(await services().log.addFile(userId(req),req.params.id,body(req),actor(req),req.db))));
 router.get('/api/logistica/:id/archivos/:idArchivo/acceso',requireAuth,gate(PERMS.logisticsReport,GROUPS.logistics),async(req,res)=>res.json(wrap(await services().log.fileAccess(userId(req),req.params.id,req.params.idArchivo,req.db))));
 router.delete('/api/logistica/:id/archivos/:idArchivo',requireAuth,gate(PERMS.logistics,GROUPS.logistics),async(req,res)=>res.json(wrap(await services().log.removeFile(userId(req),req.params.id,req.params.idArchivo,actor(req),req.db))));
 router.post('/api/logistica/migrate-schema',requireAuth,local501);router.post('/api/logistica/sync',requireAuth,local501);router.post('/api/logistica/google-sheets/sync',requireAuth,local501);
 // ALMACEN.
 router.get('/api/almacen/dashboard',requireAuth,gate(PERMS.warehouseDashboard,GROUPS.warehouse),(req,res)=>res.json({ok:true,source:'lab-sqlite',...services().wh.dashboard(req.db)}));
 router.get('/api/almacen/inventario',requireAuth,gate(PERMS.warehouseInventory,GROUPS.warehouse),(req,res)=>res.json({ok:true,source:'lab-sqlite',...services().wh.inventory(req.query,req.db)}));
 router.get('/api/almacen/movimientos',requireAuth,gate(PERMS.warehouseMovements,GROUPS.warehouse),(req,res)=>res.json({ok:true,source:'lab-sqlite',...services().wh.movements(req.query,req.db)}));
 router.post('/api/almacen/stock-reabasto/excepciones',requireAuth,gate(PERMS.warehouseInventory,GROUPS.warehouse),(req,res)=>res.status(201).json(wrap(services().wh.stockException(body(req),actor(req),req.db))));
 router.get('/api/almacen/auditorias',requireAuth,gate(PERMS.warehouseInventory,GROUPS.warehouse),(req,res)=>res.json({ok:true,source:'lab-sqlite',...services().wh.audits(req.query,req.db)}));
 router.post('/api/almacen/auditorias',requireAuth,gate(PERMS.warehouseInventory,GROUPS.warehouse),(req,res)=>res.status(201).json(wrap(services().wh.createAudit(body(req),actor(req),req.db))));
 router.patch('/api/almacen/auditorias/:id',requireAuth,gate(PERMS.warehouseInventory,GROUPS.warehouse),(req,res)=>res.json(wrap(services().wh.updateAudit(req.params.id,body(req),actor(req),req.db))));
 router.post('/api/almacen/auditorias/:folio/cerrar',requireAuth,gate(PERMS.warehouseInventory,GROUPS.warehouse),(req,res)=>res.json(wrap(services().wh.closeAudit(req.params.folio,actor(req),req.db))));
 router.post('/api/almacen/importar-excel',requireAuth,local501);router.post('/api/almacen/sync',requireAuth,local501);
 router.get('/api/__lab/phase9',requireAuth,(req,res)=>res.json({ok:true,source:'lab-sqlite',data:{version:'FASE_9_LAB_DGB_INSTALACIONES_LOGISTICA_ALMACEN_V002',instalaciones:Number(req.db.scalar('SELECT COUNT(*) FROM ins_fl WHERE activo=1')||0),logistica:Number(req.db.scalar('SELECT COUNT(*) FROM logistica_produccion WHERE activo=1')||0),almacen:Number(req.db.scalar("SELECT COUNT(*) FROM almacen_fuente_excel WHERE activo=1")||0),productionConnectionsAllowed:false}}));
 return router;
}
return Object.freeze({register,PERMS,GROUPS});
});
