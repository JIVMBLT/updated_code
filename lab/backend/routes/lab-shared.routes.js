(function initManttoLabSharedRoutes(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.ManttoLabSharedRoutes=api;
})(typeof globalThis!=='undefined'?globalThis:this,function createManttoLabSharedRoutes(root){
  'use strict';

  const PROJECT_MAINTENANCE_PERMISSION='PORTAFOLIO_PROYECTOS_DE_MANTENIMIENTO_ACCESO_VISUAL_MODULO.ACCESO_VISUAL';
  const PROJECT_READ_PERMISSIONS=Object.freeze([
    PROJECT_MAINTENANCE_PERMISSION,
    'PORTAFOLIO_DASHBOARD_PORTAFOLIO_TABLA_PROYECTOS_PORTAFOLIO_TABLA_PORTAFOLIO.VER_PROYECTO',
    'OPERACION_RESUMEN_DEL_DIA_TICKET_PERIODO_TICKETS_DEL_PERIODO.VER_PROYECTO',
    'OPERACION_DASHBOARD_CALL_CENTER_TABLA_PROYECTOS_PROYECTOS_CON_MAS_LLAMADAS_DEL_PERIODO.VER_PROYECTO',
    'OPERACION_EQUIPOS_CRITICOS_PROYECTOS_CRITICOS_PROYECTOS_CRITICOS.VER_PROYECTO',
    'RESUMEN_DIA_EXP_ACCESO_VISUAL_MODULO.ACCESO_VISUAL',
    'PROYECTOS_CRITICOS_EXP_ACCESO_VISUAL_MODULO.ACCESO_VISUAL'
  ]);
  const PORTAFOLIO_READ_PERMISSIONS=Object.freeze([
    'PORTAFOLIO_DASHBOARD_PORTAFOLIO_TABLA_PROYECTOS_PORTAFOLIO_TABLA_PORTAFOLIO.VER',
    'PORTAFOLIO_PROYECTOS_DE_MANTENIMIENTO_ACCESO_VISUAL_MODULO.ACCESO_VISUAL',
    'PORTAFOLIO_MOVIMIENTOS_PORTAFOLIO_ACCESO_VISUAL_MODULO.ACCESO_VISUAL',
    'OPERACION_RESUMEN_DEL_DIA_TICKET_PERIODO_TICKETS_DEL_PERIODO.VER_EQUIPO',
    'OPERACION_RESUMEN_DEL_DIA_TICKET_PERIODO_TICKETS_DEL_PERIODO.VER_PROYECTO',
    'OPERACION_DASHBOARD_CALL_CENTER_TABLA_EQUIPOS_EQUIPOS_CON_MAS_LLAMADAS_DEL_PERIODO.VER_EQUIPO',
    'OPERACION_DASHBOARD_CALL_CENTER_TABLA_PROYECTOS_PROYECTOS_CON_MAS_LLAMADAS_DEL_PERIODO.VER_PROYECTO',
    'OPERACION_EQUIPOS_CRITICOS_EQUIPOS_CRITICOS_EQUIPOS_CRITICOS.VER_EQUIPO',
    'OPERACION_EQUIPOS_CRITICOS_PROYECTOS_CRITICOS_PROYECTOS_CRITICOS.VER_PROYECTO',
    'RESUMEN_DIA_EXP_ACCESO_VISUAL_MODULO.ACCESO_VISUAL',
    'EQUIPOS_CRITICOS_EXP_ACCESO_VISUAL_MODULO.ACCESO_VISUAL',
    'DASHBOARD_CALL_CENTER_EXP_ACCESO_VISUAL_MODULO.ACCESO_VISUAL',
    'PROYECTOS_CRITICOS_EXP_ACCESO_VISUAL_MODULO.ACCESO_VISUAL'
  ]);

  function services(){
    const catalogs=root?.ManttoLabCatalogsService;
    const users=root?.ManttoLabUsersService;
    const relations=root?.ManttoLabRelationsService;
    const assets=root?.ManttoLabSharedAssetsService;
    const permissions=root?.ManttoLabPermissionsService;
    const scope=root?.ManttoLabScopeService;
    if(!catalogs||!users||!relations||!assets||!permissions||!scope)throw new Error('MANTTO_LAB_PHASE5_SERVICES_REQUIRED');
    return {catalogs,users,relations,assets,permissions,scope};
  }
  function actor(req){return req.actorUser||req.context?.actorUser||req.user||null;}
  function effective(req){return req.contextUser||req.user||req.context?.contextUser||req.context?.user||null;}
  function requireAuth(req,res,next){
    const fn=root?.ManttoLabAuthPermissionRoutes?.requireAuth;
    if(typeof fn==='function')return fn(req,res,next);
    if(!actor(req))return res.status(401).json({ok:false,message:'Selecciona una identidad de Laboratorio DGB.',code:'LAB_IDENTITY_REQUIRED'});
    return next();
  }
  function okData(data){return {ok:true,source:'lab-sqlite',data};}
  function groupFor(code,db){
    const rows=db.query(`SELECT id_agrupacion,codigo,nombre,empresa FROM perm_agrupaciones WHERE activo=1 AND UPPER(TRIM(codigo))=? ORDER BY id_agrupacion`,[String(code||'').trim().toUpperCase()]);
    return rows.find(row=>services().scope.normalizeDomain(row.empresa)==='UNITED')||null;
  }
  function groupingCodeForPermission(code){
    const value=String(code||'');
    if(value.startsWith('PORTAFOLIO_'))return 'PORTAFOLIO';
    if(value.startsWith('OPERACION_'))return 'OPERACION';
    if(value.includes('_EXP_'))return 'EXPERIMENTAL';
    return '';
  }
  function guardedByPermissionPairs(codes){
    const allowed=[...(codes||[])];
    return function permissionAndInformationGate(req,res,next){
      const user=effective(req);const userId=Number(user?.id_SB);
      if(!Number.isInteger(userId)||userId<=0)return res.status(401).json({ok:false,message:'Selecciona una identidad de Laboratorio DGB.',code:'LAB_IDENTITY_REQUIRED'});
      let hasFunctional=false;
      for(const code of allowed){
        if(!services().permissions.hasEffectivePermission(userId,code,req.db))continue;
        hasFunctional=true;
        const groupCode=groupingCodeForPermission(code);
        if(!groupCode)continue;
        const group=groupFor(groupCode,req.db);
        if(group&&services().scope.groupAllowed(userId,Number(group.id_agrupacion),req.db))return next();
      }
      if(!hasFunctional)return res.status(403).json({ok:false,message:'No tienes autorización funcional para esta información.',code:'LAB_FUNCTIONAL_PERMISSION_DENIED'});
      return res.status(403).json({ok:false,message:'El permiso existe, pero el alcance de información no abre la agrupación correspondiente.',code:'LAB_INFORMATION_GATE_DENIED'});
    };
  }
  function projectMaintenanceGate(req,res,next){
    return guardedByPermissionPairs([PROJECT_MAINTENANCE_PERMISSION])(req,res,next);
  }

  function register(router){
    if(!router||typeof router.get!=='function')throw new Error('MANTTO_LAB_ROUTER_REQUIRED');
    if(router.__manttoLabPhase5SharedRoutes)return router;
    router.__manttoLabPhase5SharedRoutes=true;

    // /api/catalogos/* - contratos actuales del backend real, ejecutados en SQLite LAB.
    router.get('/api/catalogos/roles',requireAuth,(req,res)=>res.json(okData(services().catalogs.rolesBasic(req.db))));
    router.get('/api/catalogos/zonas',requireAuth,(req,res)=>res.json(okData(services().catalogs.zonesBasic(req.db))));
    router.get('/api/catalogos/preguntas-seguridad',requireAuth,(req,res)=>res.json(okData(services().catalogs.securityQuestions(req.db))));
    router.get('/api/catalogos/usuarios-superiores',requireAuth,(req,res)=>res.json(okData(services().catalogs.superiors(req.db))));

    // Catálogos montados directamente desde data.routes.js.
    router.get('/api/estados-visuales',requireAuth,(req,res)=>{
      const data=services().catalogs.visualStates(req.query,req.db);
      return res.json({ok:true,data,total:data.length});
    });
    router.get('/api/permisos',requireAuth,(req,res)=>res.json(okData(services().catalogs.legacyPermissions(req.db))));
    router.get('/api/roles',requireAuth,(req,res)=>res.json(okData(services().catalogs.roles(req.db))));
    router.get('/api/zonas',requireAuth,(req,res)=>res.json(okData(services().catalogs.zones(req.db))));
    router.get('/api/usuario-zop',requireAuth,(req,res)=>res.json(okData(services().catalogs.userZones(req.db))));

    // Usuarios compartidos.
    router.get('/api/usuarios',requireAuth,(req,res)=>res.json(okData(services().users.list(req.db))));
    router.get('/api/usuarios/me/criticos-preferencias',requireAuth,(req,res)=>{
      const data=services().users.criticalPreferences(effective(req)?.id_SB,req.db);
      return data?res.json(okData(data)):res.status(404).json({ok:false,message:'Usuario no encontrado.',code:'LAB_USER_NOT_FOUND'});
    });
    router.patch('/api/usuarios/me/criticos-preferencias',requireAuth,(req,res)=>res.json({
      ok:true,message:'Preferencias de criticidad actualizadas.',data:services().users.updateCriticalPreferences(effective(req)?.id_SB,req.body,actor(req),req.db)
    }));
    router.get('/api/usuarios/directorio',requireAuth,(req,res)=>res.json(okData(services().users.directory(req.db))));
    router.get('/api/usuarios/supervisores-mantenimiento',requireAuth,(req,res)=>res.json(okData(services().users.supervisorsMaintenance(req.db))));
    router.get('/api/usuarios/:id/detalle',requireAuth,(req,res)=>{
      const data=services().users.detail(req.params.id,req.db);
      return data?res.json(okData(data)):res.status(404).json({ok:false,message:'Usuario no encontrado.',code:'LAB_USER_NOT_FOUND'});
    });
    router.get('/api/usuarios/:id/roles',requireAuth,(req,res)=>res.json(okData(services().users.rolesForUser(req.params.id,req.db))));
    router.get('/api/usuarios/:id/zonas',requireAuth,(req,res)=>res.json(okData(services().users.zonesForUser(req.params.id,req.db))));
    router.get('/api/usuarios/:id',requireAuth,(req,res)=>{
      const data=services().users.detail(req.params.id,req.db);
      return data?res.json(okData(data)):res.status(404).json({ok:false,message:'Usuario no encontrado.',code:'LAB_USER_NOT_FOUND'});
    });
    router.post('/api/usuarios',requireAuth,(req,res)=>res.status(201).json({
      ok:true,message:'Usuario creado correctamente en LAB.',data:services().users.create(req.body,actor(req),req.db)
    }));
    router.put('/api/usuarios/:id',requireAuth,(req,res)=>res.json({
      ok:true,message:'Usuario actualizado correctamente en LAB.',data:services().users.update(req.params.id,req.body,actor(req),req.db)
    }));
    router.post('/api/usuarios/:id/reset-credentials',requireAuth,(req,res)=>res.json({
      ok:true,message:'Contexto de credenciales LAB restablecido. El laboratorio no utiliza contraseñas.',data:services().users.resetCredentials(req.params.id,actor(req),req.db)
    }));

    // Relaciones asesor -> administrativo. El backend real actual exige sesión, sin rol administrativo adicional.
    router.get('/api/usuarios-rel-admin',requireAuth,(req,res)=>res.json(okData(services().relations.list(req.db))));
    router.post('/api/usuarios-rel-admin',requireAuth,(req,res)=>res.status(201).json({
      ok:true,message:'Relación creada correctamente.',data:services().relations.create(req.body,req.db)
    }));
    router.delete('/api/usuarios-rel-admin/:id',requireAuth,(req,res)=>{
      services().relations.remove(req.params.id,req.db);
      return res.json({ok:true,message:'Relación eliminada correctamente.'});
    });

    // Proyectos base compartidos. El detalle amplio se reserva para Fase 7.
    router.get('/api/proyectos/inicial',requireAuth,projectMaintenanceGate,(req,res)=>{
      const result=services().assets.projectInitial(req.query,effective(req).id_SB,req.db);
      return res.json({ok:true,source:'lab-sqlite',module:'PORTAFOLIO_PROYECTOS_DE_MANTENIMIENTO',...result});
    });
    router.get('/api/proyectos/filtros',requireAuth,guardedByPermissionPairs(PROJECT_READ_PERMISSIONS),(req,res)=>res.json({
      ok:true,source:'lab-sqlite',filters:services().assets.projectFilters(effective(req).id_SB,req.db)
    }));
    router.get('/api/proyectos',requireAuth,guardedByPermissionPairs(PROJECT_READ_PERMISSIONS),(req,res)=>{
      if(String(req.query.detalle||'').trim()==='1'&&String(req.query.proyecto||'').trim()){
        const phase7=root?.ManttoLabPortfolioService;
        if(!phase7||typeof phase7.projectDetail!=='function'){
          return res.status(501).json({ok:false,message:'El detalle completo de Proyecto requiere la Fase 7 del LAB.',code:'LAB_PHASE7_PROJECT_DETAIL_PENDING'});
        }
        const payload=phase7.projectDetail(effective(req).id_SB,req.query.proyecto,req.query,req.db);
        return payload?res.json(payload):res.status(404).json({ok:false,message:'Proyecto no encontrado o fuera de alcance.'});
      }
      const result=services().assets.projectList(req.query,effective(req).id_SB,req.db);
      return res.json({ok:true,source:'lab-sqlite',summary:result.summary,data:result.data});
    });

    // Portafolio base. Cuando Fase 7 está cargada, los filtros se canonizan con z_op.
    router.get('/api/portafolio/filtros',requireAuth,guardedByPermissionPairs(PORTAFOLIO_READ_PERMISSIONS),(req,res)=>res.json({
      ok:true,source:'lab-sqlite',filters:(root?.ManttoLabPortfolioService?.filters
        ? root.ManttoLabPortfolioService.filters(effective(req).id_SB,req.db)
        : services().assets.portfolioFilters(effective(req).id_SB,req.db))
    }));
    router.get('/api/portafolio',requireAuth,guardedByPermissionPairs(PORTAFOLIO_READ_PERMISSIONS),(req,res)=>res.json({
      ok:true,source:'lab-sqlite',data:services().assets.rawPortfolio(effective(req).id_SB,req.db)
    }));
    router.get('/api/equipos',requireAuth,guardedByPermissionPairs(PORTAFOLIO_READ_PERMISSIONS),(req,res)=>res.json({
      ok:true,source:'lab-sqlite',data:services().assets.rawPortfolio(effective(req).id_SB,req.db)
    }));

    router.get('/api/__lab/shared-services',requireAuth,(req,res)=>{
      const user=effective(req),projectResult=services().assets.projectList({},user.id_SB,req.db);
      return res.json({ok:true,data:{
        phase:'FASE_5_LAB_DGB_SERVICIOS_COMPARTIDOS_V002',
        source:'lab-sqlite',
        companies:services().catalogs.companies(req.db),
        active_users:Number(req.db.scalar('SELECT COUNT(*) FROM usuarios WHERE estado=1')||0),
        active_zones:Number(req.db.scalar('SELECT COUNT(*) FROM z_op WHERE estado=1')||0),
        visible_projects:projectResult.summary.proyectos,
        visible_equipment:services().assets.rawPortfolio(user.id_SB,req.db).length,
        productionConnectionsAllowed:false
      }});
    });

    return router;
  }

  return Object.freeze({
    register,
    PROJECT_MAINTENANCE_PERMISSION,
    PROJECT_READ_PERMISSIONS,
    PORTAFOLIO_READ_PERMISSIONS,
    groupingCodeForPermission
  });
});
