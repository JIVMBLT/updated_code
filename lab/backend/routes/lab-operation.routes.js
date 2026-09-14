(function initManttoLabOperationRoutes(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.ManttoLabOperationRoutes=api;
})(typeof globalThis!=='undefined'?globalThis:this,function createManttoLabOperationRoutes(root){
  'use strict';

  const RESUMEN=Object.freeze([
    'OPERACION_RESUMEN_DEL_DIA_GRAFICAS_CAUSA_FALLA_BLT.VER','OPERACION_RESUMEN_DEL_DIA_GRAFICAS_CAUSA_FALLA_CLIENTE.VER','OPERACION_RESUMEN_DEL_DIA_GRAFICAS_ESTADO_TICKETS.VER','OPERACION_RESUMEN_DEL_DIA_GRAFICAS_FALLAS_POR_ESTADO_DE_LA_REPUBLICA.VER','OPERACION_RESUMEN_DEL_DIA_GRAFICAS_POR_TIPO_DE_EQUIPO.VER','OPERACION_RESUMEN_DEL_DIA_GRAFICAS_RESPONSABILIDAD.VER','OPERACION_RESUMEN_DEL_DIA_GRAFICAS_TICKETS_POR_ZONA_OPERATIVA.VER','OPERACION_RESUMEN_DEL_DIA_KPI_ATRAPADOS.VER','OPERACION_RESUMEN_DEL_DIA_KPI_CERRADOS.VER','OPERACION_RESUMEN_DEL_DIA_KPI_EN_CRITICOS.VER','OPERACION_RESUMEN_DEL_DIA_KPI_EN_CURSO.VER','OPERACION_RESUMEN_DEL_DIA_KPI_FILTRACIONES.VER','OPERACION_RESUMEN_DEL_DIA_KPI_FUERA_DE_SLA.VER','OPERACION_RESUMEN_DEL_DIA_KPI_NO_FUNCIONANDO.VER','OPERACION_RESUMEN_DEL_DIA_KPI_PROM_CIERRE.VER','OPERACION_RESUMEN_DEL_DIA_KPI_PROM_LLEGADA.VER','OPERACION_RESUMEN_DEL_DIA_KPI_RESP_BLT.VER','OPERACION_RESUMEN_DEL_DIA_KPI_RESP_CLIENTE.VER','OPERACION_RESUMEN_DEL_DIA_KPI_TICKETS.VER','OPERACION_RESUMEN_DEL_DIA_KPI_VOLTAJE.VER','OPERACION_RESUMEN_DEL_DIA_TICKET_PERIODO_TICKETS_DEL_PERIODO.VER'
  ]);
  const CALL=Object.freeze([
    'OPERACION_DASHBOARD_CALL_CENTER_GRAFICAS_CAUSA_FALLA_BLT.VER','OPERACION_DASHBOARD_CALL_CENTER_GRAFICAS_CAUSA_FALLA_CLIENTE.VER','OPERACION_DASHBOARD_CALL_CENTER_GRAFICAS_ESTADO_TICKETS.VER','OPERACION_DASHBOARD_CALL_CENTER_GRAFICAS_POR_ESTADO_DE_LA_REPUBLICA.VER','OPERACION_DASHBOARD_CALL_CENTER_GRAFICAS_POR_TIPO_DE_EQUIPO.VER','OPERACION_DASHBOARD_CALL_CENTER_GRAFICAS_RESPONSABILIDAD.VER','OPERACION_DASHBOARD_CALL_CENTER_GRAFICAS_TICKETS_POR_ZONA_OPERATIVA.VER','OPERACION_DASHBOARD_CALL_CENTER_KPI_ABIERTOS.VER','OPERACION_DASHBOARD_CALL_CENTER_KPI_ATRAPADOS.VER','OPERACION_DASHBOARD_CALL_CENTER_KPI_CERRADOS.VER','OPERACION_DASHBOARD_CALL_CENTER_KPI_EN_CRITICOS.VER','OPERACION_DASHBOARD_CALL_CENTER_KPI_EN_CURSO.VER','OPERACION_DASHBOARD_CALL_CENTER_KPI_FILTRACIONES.VER','OPERACION_DASHBOARD_CALL_CENTER_KPI_FUERA_DE_SLA.VER','OPERACION_DASHBOARD_CALL_CENTER_KPI_NO_FUNCIONANDO.VER','OPERACION_DASHBOARD_CALL_CENTER_KPI_PROM_CIERRE.VER','OPERACION_DASHBOARD_CALL_CENTER_KPI_PROM_LLEGADA.VER','OPERACION_DASHBOARD_CALL_CENTER_KPI_PROM_MTBC_ANO_ACTUAL.VER','OPERACION_DASHBOARD_CALL_CENTER_KPI_PROM_MTBC_U365.VER','OPERACION_DASHBOARD_CALL_CENTER_KPI_RESP_BLT.VER','OPERACION_DASHBOARD_CALL_CENTER_KPI_RESP_CLIENTE.VER','OPERACION_DASHBOARD_CALL_CENTER_KPI_TICEKTS_CERRADOS_SIN_RESPONSABLE.VER','OPERACION_DASHBOARD_CALL_CENTER_KPI_TICEKTS_SIN_RESPONSABLE.VER','OPERACION_DASHBOARD_CALL_CENTER_KPI_TICKETS.VER','OPERACION_DASHBOARD_CALL_CENTER_KPI_VOLTAJE.VER','OPERACION_DASHBOARD_CALL_CENTER_TABLA_EQUIPOS_EQUIPOS_CON_MAS_LLAMADAS_DEL_PERIODO.VER','OPERACION_DASHBOARD_CALL_CENTER_TABLA_PROYECTOS_PROYECTOS_CON_MAS_LLAMADAS_DEL_PERIODO.VER','OPERACION_DASHBOARD_CALL_CENTER_TABLA_TICKETS_TICKETS_DEL_PERIODO.VER','OPERACION_DASHBOARD_CALL_CENTER_U365D_LLAMADAS_U365D_EQUIPO.VER','OPERACION_DASHBOARD_CALL_CENTER_U365D_LLAMADAS_U365D_PROYECTO.VER'
  ]);
  const OPER=Object.freeze(['OPERACION_DASHBOARD_OPERATIVO_KPI_TOTAL_DE_EQUIPOS.VER','OPERACION_DASHBOARD_OPERATIVO_KPI_CON_SERVICIO.VER','OPERACION_DASHBOARD_OPERATIVO_KPI_PENDIENTES.VER','OPERACION_DASHBOARD_OPERATIVO_KPI_TOTAL_DE_TICKETS.VER','OPERACION_DASHBOARD_OPERATIVO_KPI_VALIDADOS.VER','OPERACION_DASHBOARD_OPERATIVO_KPI_PEND_VALIDAR.VER','OPERACION_DASHBOARD_OPERATIVO_GRAFICAS_SERVICIO_PREVENTIVO_POR_ZONA.VER','OPERACION_DASHBOARD_OPERATIVO_GRAFICAS_SERVICIO_PREVENTIVO_POR_SUPERVISOR.VER','OPERACION_DASHBOARD_OPERATIVO_GRAFICAS_VO_BO_VALIDADOS_POR_ZONA.VER','OPERACION_DASHBOARD_OPERATIVO_GRAFICAS_VO_BO_VALIDADOS_POR_SUPERVISOR.VER']);
  const CRIT_EQ=Object.freeze(['OPERACION_EQUIPOS_CRITICOS_EQUIPOS_CRITICOS_EQUIPOS_CRITICOS.VER']);
  const CRIT_EQ_TICKETS=Object.freeze(['OPERACION_EQUIPOS_CRITICOS_EQUIPOS_CRITICOS_EQUIPOS_CRITICOS.VER_TICKETS']);
  const CRIT_PRO=Object.freeze(['OPERACION_EQUIPOS_CRITICOS_PROYECTOS_CRITICOS_PROYECTOS_CRITICOS.VER']);
  const CRIT_PRO_TICKETS=Object.freeze(['OPERACION_EQUIPOS_CRITICOS_PROYECTOS_CRITICOS_PROYECTOS_CRITICOS.VER_TICKETS']);
  const PORT_DASH=Object.freeze(['PORTAFOLIO_DASHBOARD_PORTAFOLIO_TABLA_PROYECTOS_PORTAFOLIO_TABLA_PORTAFOLIO.VER']);
  const PORT_DETAIL=Object.freeze(['PORTAFOLIO_DASHBOARD_PORTAFOLIO_TABLA_PROYECTOS_PORTAFOLIO_TABLA_PORTAFOLIO.ABRIR_DETALLE','PORTAFOLIO_DASHBOARD_PORTAFOLIO_TABLA_PROYECTOS_PORTAFOLIO_TABLA_PORTAFOLIO.VER_EQUIPO','PORTAFOLIO_DASHBOARD_PORTAFOLIO_TABLA_PROYECTOS_PORTAFOLIO_TABLA_PORTAFOLIO.VER_PROYECTO','PORTAFOLIO_PROYECTOS_DE_MANTENIMIENTO_ACCESO_VISUAL_MODULO.ACCESO_VISUAL','OPERACION_RESUMEN_DEL_DIA_TICKET_PERIODO_TICKETS_DEL_PERIODO.VER_EQUIPO','OPERACION_RESUMEN_DEL_DIA_TICKET_PERIODO_TICKETS_DEL_PERIODO.VER_PROYECTO','OPERACION_DASHBOARD_CALL_CENTER_TABLA_EQUIPOS_EQUIPOS_CON_MAS_LLAMADAS_DEL_PERIODO.VER_EQUIPO','OPERACION_DASHBOARD_CALL_CENTER_TABLA_PROYECTOS_PROYECTOS_CON_MAS_LLAMADAS_DEL_PERIODO.VER_PROYECTO','OPERACION_EQUIPOS_CRITICOS_EQUIPOS_CRITICOS_EQUIPOS_CRITICOS.VER_EQUIPO','OPERACION_EQUIPOS_CRITICOS_PROYECTOS_CRITICOS_PROYECTOS_CRITICOS.VER_PROYECTO','RESUMEN_DIA_EXP_ACCESO_VISUAL_MODULO.ACCESO_VISUAL','EQUIPOS_CRITICOS_EXP_ACCESO_VISUAL_MODULO.ACCESO_VISUAL','DASHBOARD_CALL_CENTER_EXP_ACCESO_VISUAL_MODULO.ACCESO_VISUAL','PROYECTOS_CRITICOS_EXP_ACCESO_VISUAL_MODULO.ACCESO_VISUAL']);
  const PROJECT_READ=Object.freeze(['PORTAFOLIO_PROYECTOS_DE_MANTENIMIENTO_ACCESO_VISUAL_MODULO.ACCESO_VISUAL','PORTAFOLIO_DASHBOARD_PORTAFOLIO_TABLA_PROYECTOS_PORTAFOLIO_TABLA_PORTAFOLIO.VER_PROYECTO','OPERACION_RESUMEN_DEL_DIA_TICKET_PERIODO_TICKETS_DEL_PERIODO.VER_PROYECTO','OPERACION_DASHBOARD_CALL_CENTER_TABLA_PROYECTOS_PROYECTOS_CON_MAS_LLAMADAS_DEL_PERIODO.VER_PROYECTO','OPERACION_EQUIPOS_CRITICOS_PROYECTOS_CRITICOS_PROYECTOS_CRITICOS.VER_PROYECTO','RESUMEN_DIA_EXP_ACCESO_VISUAL_MODULO.ACCESO_VISUAL','PROYECTOS_CRITICOS_EXP_ACCESO_VISUAL_MODULO.ACCESO_VISUAL']);
  const MOV=Object.freeze(['PORTAFOLIO_MOVIMIENTOS_PORTAFOLIO_ACCESO_VISUAL_MODULO.ACCESO_VISUAL']);
  const FOLLOW_READ=Object.freeze(['PORTAFOLIO_SEGUIMIENTO_ESPECIAL_ACCESO_VISUAL_MODULO.ACCESO_VISUAL','PORTAFOLIO_SEGUIMIENTO_ESPECIAL_SEGUIMIENTO_PROYECTO_EQUIPO.GESTIONAR_SEGUIMIENTO']);
  const FOLLOW_WRITE=Object.freeze(['PORTAFOLIO_SEGUIMIENTO_ESPECIAL_SEGUIMIENTO_PROYECTO_EQUIPO.GESTIONAR_SEGUIMIENTO']);
  const TICKET_LIST=Object.freeze(['OPERACION_RESUMEN_DEL_DIA_TICKET_PERIODO_TICKETS_DEL_PERIODO.VER','OPERACION_DASHBOARD_CALL_CENTER_TABLA_TICKETS_TICKETS_DEL_PERIODO.VER','OPERACION_DASHBOARD_OPERATIVO_KPI_TOTAL_DE_TICKETS.VER','OPERACION_DASHBOARD_OPERATIVO_KPI_PEND_VALIDAR.VER','OPERACION_DASHBOARD_OPERATIVO_KPI_VALIDADOS.VER','OPERACION_EQUIPOS_CRITICOS_EQUIPOS_CRITICOS_EQUIPOS_CRITICOS.VER_TICKETS','OPERACION_EQUIPOS_CRITICOS_PROYECTOS_CRITICOS_PROYECTOS_CRITICOS.VER_TICKETS','PORTAFOLIO_DASHBOARD_PORTAFOLIO_TABLA_PROYECTOS_PORTAFOLIO_TABLA_PORTAFOLIO.VER_TICKETS']);
  const TICKET_DETAIL=Object.freeze(['OPERACION_RESUMEN_DEL_DIA_TICKET_PERIODO_TICKETS_DEL_PERIODO.ABRIR_DETALLE','OPERACION_RESUMEN_DEL_DIA_TICKET_PERIODO_TICKETS_DEL_PERIODO.VER_TICKET','OPERACION_DASHBOARD_CALL_CENTER_TABLA_TICKETS_TICKETS_DEL_PERIODO.ABRIR_DETALLE','OPERACION_DASHBOARD_CALL_CENTER_TABLA_TICKETS_TICKETS_DEL_PERIODO.VER_TICKET','OPERACION_DASHBOARD_OPERATIVO_KPI_TOTAL_DE_TICKETS.ABRIR_DETALLE','OPERACION_DASHBOARD_OPERATIVO_KPI_PEND_VALIDAR.ABRIR_DETALLE','OPERACION_DASHBOARD_OPERATIVO_KPI_VALIDADOS.ABRIR_DETALLE','OPERACION_EQUIPOS_CRITICOS_EQUIPOS_CRITICOS_EQUIPOS_CRITICOS.VER_TICKETS','OPERACION_EQUIPOS_CRITICOS_PROYECTOS_CRITICOS_PROYECTOS_CRITICOS.VER_TICKETS','PORTAFOLIO_DASHBOARD_PORTAFOLIO_TABLA_PROYECTOS_PORTAFOLIO_TABLA_PORTAFOLIO.VER_TICKETS']);
  const VALIDATE='OPERACION_DASHBOARD_OPERATIVO_KPI_PEND_VALIDAR.VALIDAR_VO_BO';
  const REVERT='OPERACION_DASHBOARD_OPERATIVO_KPI_VALIDADOS.REVERTIR_VO_BO';

  function services(){
    const result={op:root?.ManttoLabOperationService,crit:root?.ManttoLabCriticalsService,pf:root?.ManttoLabPortfolioService,mov:root?.ManttoLabMovementsService,tickets:root?.ManttoLabTicketsService,follow:root?.ManttoLabFollowupService,permissions:root?.ManttoLabPermissionsService,scope:root?.ManttoLabScopeService};
    if(Object.values(result).some(value=>!value))throw new Error('MANTTO_LAB_PHASE7_SERVICES_REQUIRED');return result;
  }
  function actor(req){return req.actorUser||req.context?.actorUser||req.user||null;}
  function effective(req){return req.contextUser||req.user||req.context?.contextUser||req.context?.user||null;}
  function requireAuth(req,res,next){const fn=root?.ManttoLabAuthPermissionRoutes?.requireAuth;if(typeof fn==='function')return fn(req,res,next);if(!actor(req))return res.status(401).json({ok:false,message:'Selecciona una identidad de Laboratorio DGB.',code:'LAB_IDENTITY_REQUIRED'});return next();}
  function groupingCodeForPermission(code){const value=String(code||'');if(value.startsWith('PORTAFOLIO_'))return'PORTAFOLIO';if(value.startsWith('OPERACION_'))return'OPERACION';if(value.includes('_EXP_'))return'EXPERIMENTAL';return'';}
  function groupFor(code,db){const rows=db.query('SELECT id_agrupacion,codigo,nombre,empresa FROM perm_agrupaciones WHERE activo=1 AND UPPER(TRIM(codigo))=? ORDER BY id_agrupacion',[String(code||'').trim().toUpperCase()]);return rows.find(row=>services().scope.normalizeDomain(row.empresa)==='UNITED')||null;}
  function gate(codes){
    const allowed=[...(codes||[])];
    return function phase7PermissionGate(req,res,next){
      const user=effective(req),userId=Number(user?.id_SB);if(!Number.isInteger(userId)||userId<=0)return res.status(401).json({ok:false,message:'Selecciona una identidad de Laboratorio DGB.',code:'LAB_IDENTITY_REQUIRED'});
      let hasFunctional=false;
      for(const code of allowed){
        if(!services().permissions.hasEffectivePermission(userId,code,req.db))continue;
        hasFunctional=true;
        const groupCode=groupingCodeForPermission(code);if(!groupCode)continue;
        const group=groupFor(groupCode,req.db);if(group&&services().scope.groupAllowed(userId,Number(group.id_agrupacion),req.db))return next();
      }
      if(!hasFunctional)return res.status(403).json({ok:false,message:'No tienes autorización funcional para esta información.',code:'LAB_FUNCTIONAL_PERMISSION_DENIED'});
      return res.status(403).json({ok:false,message:'El permiso existe, pero el alcance de información no abre la agrupación correspondiente.',code:'LAB_INFORMATION_GATE_DENIED'});
    };
  }
  function voboGate(req,res,next){const target=String(req.body?.vobo_estado||'Pendiente').trim();return gate([target==='Pendiente'?REVERT:VALIDATE])(req,res,next);}
  function sendMaybe(res,payload,message){return payload?res.json(payload):res.status(404).json({ok:false,message:message||'Registro no encontrado o fuera de alcance.'});}

  function register(router){
    if(!router||typeof router.get!=='function')throw new Error('MANTTO_LAB_ROUTER_REQUIRED');
    if(router.__manttoLabPhase7V002Routes)return router;
    router.__manttoLabPhase7V002Routes=true;

    router.get('/api/operacion/resumen-dia/inicial',requireAuth,gate(RESUMEN),(req,res)=>res.json(services().op.resumenInicial(effective(req).id_SB,req.db)));
    router.get('/api/operacion/dashboard-call-center/inicial',requireAuth,gate(CALL),(req,res)=>res.json(services().op.callCenterInicial(effective(req).id_SB,req.query,req.db)));
    router.get('/api/operacion/dashboard-operativo/inicial',requireAuth,gate(OPER),(req,res)=>res.json(services().op.dashboardOperativo(effective(req).id_SB,req.query.mes,req.db)));
    router.get('/api/servicios-preventivos/resumen-supervisor',requireAuth,gate(['OPERACION_DASHBOARD_OPERATIVO_GRAFICAS_SERVICIO_PREVENTIVO_POR_SUPERVISOR.VER']),(req,res)=>{const mes=String(req.query.mes||'').trim();if(!/^\d{4}-\d{2}$/.test(mes))return res.status(400).json({ok:false,message:'El parametro mes debe usar el formato YYYY-MM.'});return res.json({ok:true,source:'lab-sqlite',mes,data:services().op.preventivosPorSupervisor(effective(req).id_SB,mes,req.db)});});

    router.get('/api/equipos-criticos',requireAuth,gate(CRIT_EQ),(req,res)=>res.json(services().crit.equiposCriticos(effective(req).id_SB,req.query,req.db)));
    router.get('/api/equipos-criticos/:codigo/tickets',requireAuth,gate(CRIT_EQ_TICKETS),(req,res)=>{const data=services().crit.equipoTickets(effective(req).id_SB,req.params.codigo,req.query,req.db);return data?res.json({ok:true,source:'lab-sqlite',data}):res.status(404).json({ok:false,message:'Equipo no encontrado o fuera de alcance.'});});
    router.get('/api/proyectos-criticos',requireAuth,gate(CRIT_PRO),(req,res)=>res.json(services().crit.proyectosCriticos(effective(req).id_SB,req.query,req.db)));
    router.get('/api/proyectos-criticos/:proyecto/tickets',requireAuth,gate(CRIT_PRO_TICKETS),(req,res)=>{const data=services().crit.proyectoTickets(effective(req).id_SB,req.params.proyecto,req.query,req.db);return data?res.json({ok:true,source:'lab-sqlite',data}):res.status(404).json({ok:false,message:'Proyecto no encontrado o fuera de alcance.'});});
    router.get('/api/indicadores/mtbc/equipos',requireAuth,gate([...CRIT_EQ,'OPERACION_DASHBOARD_CALL_CENTER_KPI_PROM_MTBC_ANO_ACTUAL.VER','OPERACION_DASHBOARD_CALL_CENTER_KPI_PROM_MTBC_U365.VER']),(req,res)=>res.json(services().crit.mtbcEquipos(effective(req).id_SB,req.query,req.db)));
    router.get('/api/indicadores/mtbc/proyectos',requireAuth,gate([...CRIT_PRO,'OPERACION_DASHBOARD_CALL_CENTER_KPI_PROM_MTBC_ANO_ACTUAL.VER','OPERACION_DASHBOARD_CALL_CENTER_KPI_PROM_MTBC_U365.VER']),(req,res)=>res.json(services().crit.mtbcProyectos(effective(req).id_SB,req.query,req.db)));
    router.get('/api/callcenter/u365/equipos',requireAuth,gate(['OPERACION_DASHBOARD_CALL_CENTER_U365D_LLAMADAS_U365D_EQUIPO.VER']),(req,res)=>res.json(services().crit.u365Equipos(effective(req).id_SB,req.query,req.db)));
    router.get('/api/callcenter/u365/proyectos',requireAuth,gate(['OPERACION_DASHBOARD_CALL_CENTER_U365D_LLAMADAS_U365D_PROYECTO.VER']),(req,res)=>res.json(services().crit.u365Proyectos(effective(req).id_SB,req.query,req.db)));
    router.get('/api/criticidad-corporativa',requireAuth,gate([...CRIT_EQ,...CRIT_PRO]),(req,res)=>res.json(services().crit.criticidadCorporativa(effective(req).id_SB,req.db)));

    router.get('/api/portafolio/dashboard/inicial',requireAuth,gate(PORT_DASH),(req,res)=>res.json(services().pf.dashboardInitial(effective(req).id_SB,req.query,req.db)));
    router.get('/api/portafolio/dashboard',requireAuth,gate(PORT_DASH),(req,res)=>res.json({ok:true,source:'lab-sqlite',...services().pf.dashboard(effective(req).id_SB,req.query,req.db)}));
    router.get('/api/portafolio/dashboard/equipos',requireAuth,gate(PORT_DASH),(req,res)=>res.json(services().pf.equipmentResponse(effective(req).id_SB,req.query,req.db)));
    router.get('/api/portafolio/equipos',requireAuth,gate(PORT_DETAIL),(req,res)=>res.json(services().pf.equipmentResponse(effective(req).id_SB,req.query,req.db)));
    router.get('/api/portafolio/equipos/:codigo',requireAuth,gate(PORT_DETAIL),(req,res)=>sendMaybe(res,services().pf.equipmentDetail(effective(req).id_SB,req.params.codigo,req.query,req.db),'Equipo no encontrado o fuera de alcance.'));
    router.post('/api/portafolio/equipos/tickets-lote',requireAuth,gate(TICKET_LIST),(req,res)=>res.json({ok:true,source:'lab-sqlite',data:services().pf.ticketsBatch(effective(req).id_SB,req.body||{},req.db)}));
    router.get('/api/portafolio/proyectos/detalle/:proyecto',requireAuth,gate(PORT_DETAIL),(req,res)=>sendMaybe(res,services().pf.projectDetail(effective(req).id_SB,req.params.proyecto,req.query,req.db),'Proyecto no encontrado o fuera de alcance.'));
    router.get('/api/proyectos/detalle',requireAuth,gate(PROJECT_READ),(req,res)=>sendMaybe(res,services().pf.projectDetail(effective(req).id_SB,req.query.proyecto,req.query,req.db),'Proyecto no encontrado o fuera de alcance.'));
    router.get('/api/proyectos/detalle/:proyecto',requireAuth,gate(PROJECT_READ),(req,res)=>sendMaybe(res,services().pf.projectDetail(effective(req).id_SB,req.params.proyecto,req.query,req.db),'Proyecto no encontrado o fuera de alcance.'));
    router.get('/api/proyectos/:proyecto',requireAuth,gate(PROJECT_READ),(req,res)=>sendMaybe(res,services().pf.projectDetail(effective(req).id_SB,req.params.proyecto,req.query,req.db),'Proyecto no encontrado o fuera de alcance.'));

    router.get('/api/portafolio/movimientos/inicial',requireAuth,gate(MOV),(req,res)=>res.json(services().mov.monthly(effective(req).id_SB,req.query,req.db)));
    router.get('/api/portafolio/movimientos',requireAuth,gate(MOV),(req,res)=>res.json(services().mov.monthly(effective(req).id_SB,req.query,req.db)));
    router.get('/api/portafolio/movimientos/:codigo/detalle',requireAuth,gate(MOV),(req,res)=>{const data=services().mov.detail(effective(req).id_SB,req.params.codigo,req.db);return data?res.json({ok:true,source:'lab-sqlite',data}):res.status(404).json({ok:false,message:'Movimiento/equipo no encontrado o fuera de alcance.'});});
    router.get('/api/portafolio/movimientos-semanales/catalogo',requireAuth,gate(MOV),(req,res)=>res.json(services().mov.weeklyCatalog(req.db)));
    router.get('/api/portafolio/movimientos-semanales',requireAuth,gate(MOV),(req,res)=>{const output=services().mov.weekly(effective(req).id_SB,req.query,req.db);return output?res.json(output):res.status(404).json({ok:false,message:'Corte semanal LAB no encontrado.'});});
    router.post('/api/portafolio/movimientos-semanales/corte',requireAuth,gate(MOV),(req,res)=>res.json(services().mov.cutManual(actor(req),req.db)));

    router.get('/api/portafolio/seguimiento-especial',requireAuth,gate(FOLLOW_READ),(req,res)=>res.json({ok:true,source:'lab-sqlite',data:services().follow.list(effective(req).id_SB,req.db)}));
    router.get('/api/proyectos/:proyecto/seguimiento-especial',requireAuth,gate(FOLLOW_READ),(req,res)=>{const data=services().follow.project(effective(req).id_SB,req.params.proyecto,req.db);return data?res.json({ok:true,source:'lab-sqlite',data}):res.status(404).json({ok:false,message:'Proyecto no encontrado o fuera de alcance.'});});
    router.put('/api/proyectos/:proyecto/seguimiento-especial',requireAuth,gate(FOLLOW_WRITE),(req,res)=>{const data=services().follow.setProject(effective(req).id_SB,req.params.proyecto,req.body||{},req.db);return data?res.json({ok:true,source:'lab-sqlite',data}):res.status(404).json({ok:false,message:'Proyecto no encontrado o fuera de alcance.'});});
    router.get('/api/equipos/:codigo/seguimiento-especial',requireAuth,gate(FOLLOW_READ),(req,res)=>{const data=services().follow.equipment(effective(req).id_SB,req.params.codigo,req.db);return data?res.json({ok:true,source:'lab-sqlite',data}):res.status(404).json({ok:false,message:'Equipo no encontrado o fuera de alcance.'});});
    router.put('/api/equipos/:codigo/seguimiento-especial',requireAuth,gate(FOLLOW_WRITE),(req,res)=>{const data=services().follow.setEquipment(effective(req).id_SB,req.params.codigo,req.body||{},req.db);return data?res.json({ok:true,source:'lab-sqlite',data}):res.status(404).json({ok:false,message:'Equipo no encontrado o fuera de alcance.'});});

    router.get('/api/tickets',requireAuth,gate(TICKET_LIST),(req,res)=>res.json(services().tickets.list(effective(req).id_SB,req.query,req.db)));
    router.get('/api/tickets/:ticket/interacciones',requireAuth,gate(TICKET_DETAIL),(req,res)=>{const detail=services().tickets.detail(effective(req).id_SB,req.params.ticket,req.db);return detail?res.json({ok:true,source:'lab-sqlite',data:detail.interacciones}):res.status(404).json({ok:false,message:'Ticket no encontrado o fuera de alcance.'});});
    router.post('/api/tickets/:ticket/comentarios',requireAuth,gate(TICKET_DETAIL),async(req,res)=>res.status(201).json({ok:true,source:'lab-sqlite',data:await services().tickets.addComment(effective(req).id_SB,req.params.ticket,req.body||{},actor(req),req.db)}));
    router.post('/api/tickets/:ticket/validacion',requireAuth,voboGate,async(req,res)=>res.json({ok:true,source:'lab-sqlite',data:await services().tickets.saveVobo(effective(req).id_SB,req.params.ticket,req.body||{},actor(req),req.db)}));
    router.get('/api/tickets/:ticket',requireAuth,gate(TICKET_DETAIL),(req,res)=>{const detail=services().tickets.detail(effective(req).id_SB,req.params.ticket,req.db);return detail?res.json({ok:true,source:'lab-sqlite',data:detail}):res.status(404).json({ok:false,message:'Ticket no encontrado o fuera de alcance.'});});
    router.post('/api/tickets/:ticket/vobo',requireAuth,voboGate,async(req,res)=>res.json({ok:true,source:'lab-sqlite',data:await services().tickets.saveVobo(effective(req).id_SB,req.params.ticket,req.body||{},actor(req),req.db)}));
    router.post('/api/tickets/sync',requireAuth,(req,res)=>res.status(501).json({ok:false,message:'Sincronización productiva deshabilitada en LAB.',code:'LAB_MOCK_NOT_IMPLEMENTED'}));
    router.post('/api/tickets/sync-fechas-cdmx',requireAuth,(req,res)=>res.status(501).json({ok:false,message:'Sincronización productiva deshabilitada en LAB.',code:'LAB_MOCK_NOT_IMPLEMENTED'}));

    router.get('/api/__lab/phase7',requireAuth,(req,res)=>res.json({ok:true,source:'lab-sqlite',data:{version:'FASE_7_LAB_DGB_OPERACION_PORTAFOLIO_V002',portafolio:Number(req.db.scalar('SELECT COUNT(*) FROM portafolio')||0),tickets:Number(req.db.scalar('SELECT COUNT(*) FROM tickets')||0),preventivos:Number(req.db.scalar('SELECT COUNT(*) FROM servicios_preventivos')||0),cortes:Number(req.db.scalar('SELECT COUNT(*) FROM portafolio_cortes_semanales')||0),productionConnectionsAllowed:false}}));
    return router;
  }

  return Object.freeze({register,RESUMEN,CALL,OPER,CRIT_EQ,CRIT_PRO,PORT_DASH,PORT_DETAIL,PROJECT_READ,MOV,TICKET_LIST,TICKET_DETAIL});
});
