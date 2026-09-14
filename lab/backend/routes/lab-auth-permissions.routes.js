(function initManttoLabAuthPermissionRoutes(root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ManttoLabAuthPermissionRoutes = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createManttoLabAuthPermissionRoutes(root) {
  'use strict';

  const VIEWER_CODE = 'GENERAL_VISOR_USUARIOS_OPERACION.USAR_VISOR';
  const ADMIN_ROLES = new Set(['Programador','Programador United','Programador Corellian','Director General']);
  const MUTATIONS = new Set(['POST','PUT','PATCH','DELETE']);

  function dependencies() {
    const permissions=root?.ManttoLabPermissionsService;
    const scope=root?.ManttoLabScopeService;
    if(!permissions||!scope)throw new Error('MANTTO_LAB_PHASE4_SERVICES_REQUIRED');
    return { permissions, scope };
  }
  function actor(req){return req.actorUser||req.context?.actorUser||null;}
  function effective(req){return req.contextUser||req.user||req.context?.contextUser||req.context?.user||null;}
  function roleNames(user){return new Set([user?.rol,...(user?.roles||[]).map(r=>typeof r==='string'?r:r?.rol),...(user?.roles_detalle||[]).map(r=>r?.rol)].filter(Boolean));}
  function requireAuth(req,res,next){if(!actor(req))return res.status(401).json({ok:false,message:'Selecciona una identidad de Laboratorio DGB.',code:'LAB_IDENTITY_REQUIRED'});return next();}
  function isAdminActor(user){const names=roleNames(user);return [...ADMIN_ROLES].some(name=>names.has(name));}
  function adminDomains(user){const names=roleNames(user);if(names.has('Programador')||names.has('Director General'))return null;const domains=new Set(['GENERAL']);if(names.has('Programador United'))domains.add('UNITED');if(names.has('Programador Corellian'))domains.add('CORELLIAN');return [...domains];}
  function normalizeCompany(value){return dependencies().scope.normalizeDomain(value)||String(value||'').trim().toUpperCase();}
  function assertAdmin(req){const user=actor(req);if(!user||!isAdminActor(user)){const error=new Error('Tu identidad LAB no puede administrar Panel de Control.');error.status=403;error.code='LAB_PANEL_ADMIN_FORBIDDEN';throw error;}return user;}
  function assertManageTarget(req,targetId){const a=assertAdmin(req);const id=Number(targetId);const row=req.db.query('SELECT id_SB,empresa FROM usuarios WHERE id_SB=? AND estado=1 LIMIT 1',[id])[0];if(!row){const error=new Error('Usuario objetivo no existe o está inactivo.');error.status=404;error.code='LAB_USER_NOT_FOUND';throw error;}const allowed=adminDomains(a);if(allowed!==null&&!allowed.includes(normalizeCompany(row.empresa))){const error=new Error('El usuario objetivo queda fuera del dominio administrable por tu identidad LAB.');error.status=403;error.code='LAB_PANEL_TARGET_FORBIDDEN';throw error;}return row;}
  function assertConfiguredUser(req,targetId){const id=Number(targetId);const row=req.db.query('SELECT id_SB,nombre,correo,empresa,estado FROM usuarios WHERE id_SB=? LIMIT 1',[id])[0];if(!row){const error=new Error('Usuario no encontrado.');error.status=404;error.code='LAB_USER_NOT_FOUND';throw error;}return row;}
  function assertRoleInScope(req,roleId){const a=assertAdmin(req);const id=Number(roleId);const row=req.db.query('SELECT id_rol,rol,empresa,estado FROM roles WHERE id_rol=? LIMIT 1',[id])[0];if(!row||Number(row.estado)!==1){const error=new Error('El rol no existe o está inactivo.');error.status=404;error.code='LAB_ROLE_NOT_FOUND';throw error;}const allowed=adminDomains(a);if(allowed!==null&&!allowed.includes(normalizeCompany(row.empresa))){const error=new Error('El rol no pertenece a tu alcance de administración.');error.status=403;error.code='LAB_ROLE_OUT_OF_ADMIN_SCOPE';throw error;}return row;}
  function assertRoleCompanyInScope(req,value){const a=assertAdmin(req);const domain=normalizeCompany(value||'GENERAL');const allowed=adminDomains(a);if(!domain||(allowed!==null&&!allowed.includes(domain))){const error=new Error('La empresa del rol está fuera de tu alcance.');error.status=403;error.code='LAB_ROLE_COMPANY_OUT_OF_ADMIN_SCOPE';throw error;}return domain;}
  function canManageGlobalScope(user){const names=roleNames(user);return names.has('Programador')||names.has('Director General');}
  function canManageAdditionalUsers(user){return roleNames(user).has('Programador');}
  function assertGlobalScopeManager(req){const a=actor(req);if(!a||!canManageGlobalScope(a)){const error=new Error('No tienes autorización para administrar el alcance global de información.');error.status=403;error.code='LAB_SCOPE_ADMIN_FORBIDDEN';throw error;}return a;}
  function scopeCapabilities(req){return {puede_gestionar_alcance:canManageGlobalScope(actor(req)),puede_gestionar_usuarios_adicionales:canManageAdditionalUsers(actor(req)),alcance_general_default:true,alcance_corellian_personas:true,alcance_united_zonas:true};}
  function scopeResponse(req,userId){const user=assertConfiguredUser(req,userId);const data=dependencies().scope.readPanelScope(userId,req.db);const general=data.alcances?.general||{},cor=data.alcances?.corellian||{},uni=data.alcances?.united||{};const count=Number(general.llave_maestra?1:0)+(general.agrupaciones||[]).length+Number(cor.llave_maestra?1:0)+(cor.agrupaciones||[]).length+Number(uni.llave_maestra?1:0)+(uni.agrupaciones||[]).length+Number(cor.ver_reporta_a?1:0)+Number(cor.ver_rel_admin?1:0)+(cor.usuarios_adicionales||[]).length+(uni.zonas||[]).length;return Object.assign({},data,{id_usuario:Number(user.id_SB),usuario:user.nombre,registros_activos:count,capacidades:scopeCapabilities(req)});}

  function rolesForUser(userId,db){return dependencies().permissions.activeRoles(userId,db);}
  function userDto(userId,db){
    const row=db.query(`SELECT u.id_SB,u.nombre,u.iniciales,u.correo,u.puesto,u.area,u.empresa,u.rol_id,u.reporta_a,u.estado,r.rol
      FROM usuarios u LEFT JOIN roles r ON r.id_rol=u.rol_id WHERE u.id_SB=? AND u.estado=1 LIMIT 1`,[Number(userId)])[0];
    if(!row)return null;const roles=rolesForUser(row.id_SB,db);const principal=roles.find(r=>r.principal)||roles[0]||{};
    return Object.assign({},row,{rol:principal.rol||row.rol||'Sin rol',rol_id:principal.id_rol||row.rol_id||null,roles:roles.map(r=>r.rol).filter(Boolean),roles_detalle:roles});
  }

  // La autorización del Visor es el permiso efectivo. Los roles Programador
  // solo restringen empresa en el mismo modo que el servicio real actual.
  function canViewer(user,db){return Boolean(user&&dependencies().permissions.hasEffectivePermission(user.id_SB,VIEWER_CODE,db));}
  function viewerCompanyScope(user){const names=roleNames(user);if(names.has('Programador'))return null;if(names.has('Programador United'))return ['UNITED'];if(names.has('Programador Corellian'))return ['CORELLIAN'];return null;}
  function listViewerUsers(actorUser,db){
    if(!canViewer(actorUser,db)){const error=new Error('Tu sesión no está autorizada para usar el Visor de usuarios.');error.status=403;error.code='LAB_VIEWER_FORBIDDEN';throw error;}
    const companyScope=viewerCompanyScope(actorUser);
    return db.query(`SELECT u.id_SB,u.nombre,u.iniciales,u.correo,u.puesto,u.area,u.empresa,u.rol_id,u.estado,r.rol
      FROM usuarios u LEFT JOIN roles r ON r.id_rol=u.rol_id WHERE u.estado=1 AND u.id_SB<>? ORDER BY u.nombre`,[Number(actorUser.id_SB)])
      .filter(row=>companyScope===null||companyScope.includes(normalizeCompany(row.empresa)))
      .map(row=>Object.assign({},row,{roles:rolesForUser(row.id_SB,db)}));
  }
  function validateViewerTarget(actorUser,targetId,db){const target=userDto(targetId,db);if(!target){const error=new Error('El usuario visualizado no existe o está inactivo.');error.status=404;error.code='LAB_VIEWER_USER_NOT_FOUND';throw error;}if(!listViewerUsers(actorUser,db).some(row=>Number(row.id_SB)===Number(target.id_SB))){const error=new Error('El usuario visualizado no pertenece al alcance autorizado del Visor.');error.status=403;error.code='LAB_VIEWER_TARGET_FORBIDDEN';throw error;}return target;}
  function makeViewerToken(actorId,targetId){let nonce='';try{nonce=root.crypto?.randomUUID?.()||'';}catch(_e){}if(!nonce)nonce=Date.now().toString(36)+Math.random().toString(36).slice(2);return `LAB_DGB_V2_VIEWER_${Number(actorId)}_${Number(targetId)}_${nonce}`;}

  function parseChanges(req){const changes=req.body?.changes;if(!Array.isArray(changes)){const error=new Error('changes debe ser un arreglo.');error.status=400;error.code='LAB_PERMISSION_CHANGES_REQUIRED';throw error;}return changes;}
  function parseRoleIds(req){return Array.isArray(req.body?.role_ids)?req.body.role_ids:[];}
  function parseBulkScope(req){const body=req.body||{};const ids=body.usuario_ids||body.user_ids||body.usuarios||[];if(!Array.isArray(ids)||!ids.length){const error=new Error('usuario_ids es requerido.');error.status=400;error.code='LAB_SCOPE_BULK_USERS_REQUIRED';throw error;}const payload=body.activar||body.alcance||body.payload||body.configuracion||body;return {ids,payload};}

  function register(router){
    if(!router||typeof router.get!=='function')throw new Error('MANTTO_LAB_ROUTER_REQUIRED');

    // Frontera global LAB: identidad obligatoria y Visor siempre de solo lectura.
    router.use('/api',async(req,res,next)=>{
      if(req.path.startsWith('/api/__lab/')||req.path.startsWith('/api/auth/'))return next();
      if(!actor(req))return res.status(401).json({ok:false,message:'Selecciona una identidad de Laboratorio DGB.',code:'LAB_IDENTITY_REQUIRED'});
      if(req.context?.readOnly&&MUTATIONS.has(req.method)&&req.path!=='/api/panel-control/viewer-close')return res.status(403).json({ok:false,message:'El Visor de usuarios es de solo lectura.',code:'VIEWER_READ_ONLY'});
      try{
        req.informationAccess=dependencies().scope.snapshot(Number(effective(req)?.id_SB),req.db);
        req.context.informationAccess=req.informationAccess;
      }catch(error){return next(error);}
      return next();
    });

    router.get('/api/auth/me',requireAuth,(req,res)=>{const user=effective(req);return res.json({ok:true,user,data:{user}});});
    router.post('/api/auth/refresh',requireAuth,(req,res)=>res.json({ok:true,token:`LAB_DGB_V2_TOKEN_${Number(actor(req).id_SB)}`,user:actor(req),lab:true}));
    router.post('/api/auth/logout',(req,res)=>res.json({ok:true,lab:true}));

    router.get('/api/panel-control/session-permissions',requireAuth,(req,res)=>{
      const user=effective(req),a=actor(req);return res.json({ok:true,data:dependencies().permissions.sessionPayload(user.id_SB,a.id_SB,req.db)});
    });

    router.get('/api/panel-control/viewer-users',requireAuth,(req,res)=>res.json({ok:true,data:{usuarios:listViewerUsers(actor(req),req.db)}}));
    router.post('/api/panel-control/viewer-context',requireAuth,(req,res)=>{
      const a=actor(req),targetId=Number(req.body?.id_usuario);
      if(!Number.isInteger(targetId)||targetId<=0||targetId===Number(a.id_SB))return res.status(400).json({ok:false,message:'El usuario seleccionado no es válido para el Visor de usuarios.',code:'LAB_VIEWER_TARGET_INVALID'});
      const target=validateViewerTarget(a,targetId,req.db);
      return res.json({ok:true,data:{viewer_token:makeViewerToken(a.id_SB,target.id_SB),expires_in_seconds:1800,target_user_id:Number(target.id_SB),read_only:true}});
    });
    router.get('/api/panel-control/viewer-bootstrap',requireAuth,(req,res)=>{
      const a=actor(req),u=effective(req);if(!req.context?.readOnly||!req.viewUser)return res.status(400).json({ok:false,message:'La solicitud no contiene un contexto activo del Visor de usuarios.',code:'LAB_VIEWER_CONTEXT_REQUIRED'});
      return res.json({ok:true,data:{viewer:{active:true,read_only:true,actor_user_id:Number(a.id_SB),target_user_id:Number(u.id_SB)},actor:userDto(a.id_SB,req.db),usuario:userDto(u.id_SB,req.db)}});
    });
    router.post('/api/panel-control/viewer-close',requireAuth,(req,res)=>res.json({ok:true,data:{closed:true,lab:true}}));

    router.get('/api/panel-control/bootstrap',requireAuth,(req,res,next)=>{try{const a=assertAdmin(req);return res.json({ok:true,data:dependencies().permissions.bootstrap(req.db,adminDomains(a))});}catch(error){return next(error);}});
    router.get('/api/panel-control/roles/:id/permisos',requireAuth,(req,res,next)=>{try{const role=assertRoleInScope(req,req.params.id);return res.json({ok:true,data:dependencies().permissions.rolePermissions(role.id_rol,req.db,adminDomains(actor(req)))});}catch(error){return next(error);}});
    router.put('/api/panel-control/roles/:id/permisos',requireAuth,(req,res,next)=>{try{const role=assertRoleInScope(req,req.params.id);const result=dependencies().permissions.saveRolePermissions(role.id_rol,parseChanges(req),req.db,adminDomains(actor(req)));return res.json({ok:true,data:result});}catch(error){return next(error);}});
    router.get('/api/panel-control/usuarios/:id/permisos',requireAuth,(req,res,next)=>{try{assertManageTarget(req,req.params.id);return res.json({ok:true,data:dependencies().permissions.userPermissions(req.params.id,req.db,adminDomains(actor(req)))});}catch(error){return next(error);}});
    router.put('/api/panel-control/usuarios/:id/permisos',requireAuth,(req,res,next)=>{try{assertManageTarget(req,req.params.id);const result=dependencies().permissions.saveUserPermissions(req.params.id,parseChanges(req),actor(req).id_SB,req.db,adminDomains(actor(req)));return res.json({ok:true,data:result});}catch(error){return next(error);}});
    router.put('/api/panel-control/usuarios/:id/roles',requireAuth,(req,res,next)=>{try{assertManageTarget(req,req.params.id);const result=dependencies().permissions.setUserRoles(req.params.id,parseRoleIds(req),req.body?.principal_role_id,req.db,adminDomains(actor(req)));return res.json({ok:true,data:result});}catch(error){return next(error);}});

    router.get('/api/panel-control/usuarios/:id/alcance-informacion',requireAuth,(req,res,next)=>{try{assertGlobalScopeManager(req);assertConfiguredUser(req,req.params.id);return res.json({ok:true,data:scopeResponse(req,req.params.id)});}catch(error){return next(error);}});
    router.put('/api/panel-control/usuarios/:id/alcance-informacion',requireAuth,(req,res,next)=>{try{const a=assertGlobalScopeManager(req);assertConfiguredUser(req,req.params.id);const isProgrammer=canManageAdditionalUsers(a);const current=dependencies().scope.readPanelScope(req.params.id,req.db,{includeCatalogs:false});const body=req.body||{};const isNew=Boolean(body.alcances||body.general||body.corellian||body.united);if(!isProgrammer&&!isNew&&Object.prototype.hasOwnProperty.call(body,'usuarios_adicionales')){const requested=[...new Set((body.usuarios_adicionales||[]).map(Number).filter(Number.isInteger))].sort((x,y)=>x-y);const existing=[...new Set((current.usuarios_adicionales||[]).map(Number).filter(Number.isInteger))].sort((x,y)=>x-y);if(JSON.stringify(requested)!==JSON.stringify(existing)){const error=new Error('Solo el rol Programador puede modificar Usuarios adicionales.');error.status=403;error.code='LAB_SCOPE_ADDITIONAL_USERS_FORBIDDEN';throw error;}}dependencies().scope.savePanelScope(req.params.id,body,a.id_SB,req.db,{preserveAdditionalUsers:!isProgrammer});return res.json({ok:true,message:'Alcance GENERAL / CORELLIAN / UNITED guardado correctamente.',data:scopeResponse(req,req.params.id)});}catch(error){return next(error);}});
    router.put('/api/panel-control/usuarios/alcance-informacion/masivo',requireAuth,(req,res,next)=>{try{const a=assertGlobalScopeManager(req);const parsed=parseBulkScope(req);const results=[];for(const id of parsed.ids){assertConfiguredUser(req,id);results.push(dependencies().scope.savePanelScope(id,parsed.payload,a.id_SB,req.db,{preserveAdditionalUsers:true}));}return res.json({ok:true,message:`Activación masiva aplicada a ${results.length} usuario(s).`,data:{usuarios_actualizados:results.length,usuarios:results,capacidades:scopeCapabilities(req)}});}catch(error){return next(error);}});

    router.get('/api/panel-control/admin/roles/:id',requireAuth,(req,res,next)=>{try{const role=assertRoleInScope(req,req.params.id);return res.json({ok:true,data:dependencies().permissions.roleDetail(role.id_rol,req.db)});}catch(error){return next(error);}});
    router.post('/api/panel-control/admin/roles',requireAuth,(req,res,next)=>{try{assertRoleCompanyInScope(req,req.body?.empresa||'GENERAL');const data=dependencies().permissions.createRole(req.body||{},req.db);return res.status(201).json({ok:true,message:'Rol LAB creado correctamente.',data});}catch(error){return next(error);}});
    router.put('/api/panel-control/admin/roles/:id',requireAuth,(req,res,next)=>{try{const role=assertRoleInScope(req,req.params.id);assertRoleCompanyInScope(req,req.body?.empresa||role.empresa);const data=dependencies().permissions.updateRole(role.id_rol,req.body||{},req.db);return res.json({ok:true,message:'Rol LAB actualizado correctamente.',data});}catch(error){return next(error);}});

    router.get('/api/__lab/identities',(req,res)=>{
      const rows=req.db.query(`SELECT u.id_SB,u.nombre,u.iniciales,u.correo,u.empresa,u.puesto,u.area,u.rol_id,r.rol,r.codigo AS rol_codigo,r.empresa AS rol_empresa FROM usuarios u JOIN roles r ON r.id_rol=u.rol_id WHERE u.estado=1 AND r.estado=1 ORDER BY r.id_rol,u.nombre`);
      return res.json({ok:true,data:{usuarios:rows}});
    });
    router.get('/api/__lab/scope',requireAuth,(req,res)=>res.json({ok:true,data:dependencies().scope.snapshot(effective(req).id_SB,req.db)}));
    router.get('/api/__lab/permission/:code',requireAuth,(req,res)=>res.json({ok:true,data:dependencies().permissions.permissionByCode(effective(req).id_SB,req.params.code,req.db)}));

    return router;
  }

  return Object.freeze({register,requireAuth,isAdminActor,adminDomains,viewerCompanyScope,listViewerUsers,canViewer});
});
