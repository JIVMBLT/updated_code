// [Claude | 2026-10-05 | CLAUDE-MG | LAB DGB - ENTREGAS V001]
// Entregas: control de entregas recurrentes de colaboradores, con carga de
// documento directo en el registro (sin depender de correo/fechas externas)
// y validacion por el responsable que la creo, para evitar cumplimiento
// falso. El archivo se guarda en ManttoLabBlobStore (IndexedDB), mismo
// patron ya establecido en el LAB (ver lab-tasks.service.js /
// lab-logistics.service.js), no se inventa un mecanismo nuevo.
(function initManttoLabEntregasService(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.ManttoLabEntregasService=api;
})(typeof globalThis!=='undefined'?globalThis:this,function createManttoLabEntregasService(root){
  'use strict';

  const TIPOS_RECURRENCIA=['UNICA','SEMANAL','QUINCENAL','MENSUAL'];
  const HORIZONTE_OCURRENCIAS=12; // cuantas instancias se generan por adelantado para recurrentes

  function dbOr(candidateDb){ return candidateDb||root.ManttoLabDB; }
  function httpError(status,message,code){ const e=new Error(message); e.status=status; e.statusCode=status; e.code=code||'LAB_ENTREGAS_ERROR'; return e; }
  function id(value,field='id'){ const n=Number(value); if(!Number.isInteger(n)||n<=0) throw httpError(400,`${field} debe ser un entero positivo.`,'LAB_INVALID_ID'); return n; }
  function maybeId(value){ const n=Number(value); return Number.isInteger(n)&&n>0?n:null; }
  function text(value,max=2000,fallback=null){ const v=value==null?'':String(value).trim(); return v?v.slice(0,max):fallback; }
  function actorId(actor){ return id(actor?.id_SB||actor?.id||actor?.user_id,'usuario autenticado'); }
  function isoDate(value){ const s=text(value,10); if(!s||!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null; return s; }
  function hoy(){ return new Date().toISOString().slice(0,10); }

  function addDays(dateStr,days){
    const d=new Date(dateStr+'T00:00:00Z');
    d.setUTCDate(d.getUTCDate()+days);
    return d.toISOString().slice(0,10);
  }
  function addMonths(dateStr,months){
    const [y,m,d]=dateStr.split('-').map(Number);
    const target=new Date(Date.UTC(y,(m-1)+months,1));
    const daysInTarget=new Date(Date.UTC(target.getUTCFullYear(),target.getUTCMonth()+1,0)).getUTCDate();
    target.setUTCDate(Math.min(d,daysInTarget));
    return target.toISOString().slice(0,10);
  }
  function siguienteFecha(tipo,fechaBase,ocurrencia){
    // ocurrencia 1 = fechaBase tal cual; 2,3,... se desplazan desde la base.
    if(ocurrencia<=1) return fechaBase;
    const pasos=ocurrencia-1;
    if(tipo==='SEMANAL') return addDays(fechaBase,7*pasos);
    if(tipo==='QUINCENAL') return addDays(fechaBase,15*pasos);
    if(tipo==='MENSUAL') return addMonths(fechaBase,pasos);
    return fechaBase; // UNICA
  }

  function usuarioRow(userId,db){
    const row=db.query('SELECT id_SB,nombre,iniciales,puesto,correo FROM usuarios WHERE id_SB=? AND estado=1',[id(userId,'usuario')])[0];
    if(!row) throw httpError(404,'Usuario no encontrado o inactivo.','LAB_ENTREGAS_USUARIO_NOT_FOUND');
    return row;
  }

  // ---------------------------------------------------------------------
  // Opciones: catalogo de usuarios activos (para elegir colaborador) y los
  // 4 tipos de recurrencia fijos.
  // ---------------------------------------------------------------------
  function opciones(userId,candidateDb){
    const db=dbOr(candidateDb);
    const usuarios=db.query('SELECT id_SB,nombre,iniciales,puesto FROM usuarios WHERE estado=1 ORDER BY nombre');
    return{usuarios,tipos_recurrencia:[...TIPOS_RECURRENCIA]};
  }

  // ---------------------------------------------------------------------
  // Estado calculado de una instancia (nunca se guarda, siempre se calcula
  // contra la fecha de hoy, para que "No entregado" refleje el momento
  // real en que se consulta, no el momento en que se genero la fila).
  // ---------------------------------------------------------------------
  function estadoInstancia(inst,fechaHoy){
    if(inst.fecha_entrega){
      const fechaEntregaDia=String(inst.fecha_entrega).slice(0,10);
      return fechaEntregaDia<=inst.fecha_limite?'A_TIEMPO':'TARDE';
    }
    return inst.fecha_limite<fechaHoy?'NO_ENTREGADO':'PENDIENTE';
  }
  function estadoValidacion(inst){
    if(inst.validado===1||inst.validado==='1') return 'VALIDO';
    if(inst.validado===0||inst.validado==='0') return 'RECHAZADO';
    return inst.fecha_entrega?'SIN_REVISAR':'NO_APLICA';
  }
  function enriquecerInstancia(inst){
    const fh=hoy();
    return{...inst,estado_entrega:estadoInstancia(inst,fh),estado_validacion:estadoValidacion(inst)};
  }

  // ---------------------------------------------------------------------
  // Crear entrega programada + generar sus instancias (UNICA: 1; las
  // recurrentes: 12 ocurrencias por adelantado, sin depender de un job en
  // segundo plano que este LAB no tiene).
  // ---------------------------------------------------------------------
  function crearProgramada(userId,body,actor,candidateDb){
    const db=dbOr(candidateDb),uid=actorId(actor);
    const b=body||{};
    const titulo=text(b.titulo,200);
    if(!titulo) throw httpError(400,'El título (qué reporte o información debe entregar) es obligatorio.','LAB_ENTREGAS_TITULO_REQUIRED');
    const idColaborador=id(b.id_colaborador,'colaborador');
    usuarioRow(idColaborador,db);
    const tipo=text(b.tipo_recurrencia,20);
    if(!TIPOS_RECURRENCIA.includes(tipo)) throw httpError(400,'tipo_recurrencia debe ser UNICA, SEMANAL, QUINCENAL o MENSUAL.','LAB_ENTREGAS_TIPO_INVALIDO');
    const fechaInicio=isoDate(b.fecha_inicio);
    if(!fechaInicio) throw httpError(400,'La fecha de inicio es obligatoria (formato AAAA-MM-DD).','LAB_ENTREGAS_FECHA_REQUIRED');
    const descripcion=text(b.descripcion,2000);

    const r=db.run(
      'INSERT INTO entregas_programadas(id_responsable,id_colaborador,titulo,descripcion,tipo_recurrencia,fecha_inicio,activo,created_by) VALUES(?,?,?,?,?,?,1,?)',
      [uid,idColaborador,titulo,descripcion,tipo,fechaInicio,uid]
    );
    const idProgramada=r.lastInsertRowId;
    const totalOcurrencias=tipo==='UNICA'?1:HORIZONTE_OCURRENCIAS;
    for(let n=1;n<=totalOcurrencias;n++){
      const fechaLimite=siguienteFecha(tipo,fechaInicio,n);
      db.run('INSERT INTO entregas_instancias(id_entrega_programada,numero_ocurrencia,fecha_limite) VALUES(?,?,?)',[idProgramada,n,fechaLimite]);
    }
    return detalleProgramada(userId,idProgramada,db);
  }

  function programadaRow(idProgramada,db){
    const row=db.query('SELECT p.*, r.nombre AS responsable_nombre, c.nombre AS colaborador_nombre, c.iniciales AS colaborador_iniciales FROM entregas_programadas p JOIN usuarios r ON r.id_SB=p.id_responsable JOIN usuarios c ON c.id_SB=p.id_colaborador WHERE p.id_entrega_programada=?',[id(idProgramada,'id_entrega_programada')])[0];
    if(!row) throw httpError(404,'Entrega programada no encontrada.','LAB_ENTREGAS_PROGRAMADA_NOT_FOUND');
    return row;
  }

  function resumenInstancias(instancias){
    const fh=hoy();
    const enriquecidas=instancias.map(enriquecerInstancia);
    const total=enriquecidas.length;
    const conteo={A_TIEMPO:0,TARDE:0,NO_ENTREGADO:0,PENDIENTE:0};
    enriquecidas.forEach(i=>{ conteo[i.estado_entrega]=(conteo[i.estado_entrega]||0)+1; });
    const vencidas=conteo.A_TIEMPO+conteo.TARDE+conteo.NO_ENTREGADO; // las que ya debian haberse entregado
    return{
      instancias:enriquecidas,
      total,
      pct_a_tiempo:vencidas?Math.round(100*conteo.A_TIEMPO/vencidas):null,
      pct_general:vencidas?Math.round(100*(conteo.A_TIEMPO+conteo.TARDE)/vencidas):null,
      pct_no_entregado:vencidas?Math.round(100*conteo.NO_ENTREGADO/vencidas):null,
      conteo
    };
  }

  function detalleProgramada(userId,idProgramada,candidateDb){
    const db=dbOr(candidateDb);
    const programada=programadaRow(idProgramada,db);
    const instancias=db.query('SELECT * FROM entregas_instancias WHERE id_entrega_programada=? ORDER BY numero_ocurrencia',[programada.id_entrega_programada]);
    return{programada,...resumenInstancias(instancias)};
  }

  // ---------------------------------------------------------------------
  // Listado de entregas programadas POR el usuario (como responsable),
  // cada una con su resumen de cumplimiento.
  // ---------------------------------------------------------------------
  function listarProgramadas(userId,query,candidateDb){
    const db=dbOr(candidateDb),uid=id(userId,'usuario');
    const q=query||{};
    const soloActivas=q.incluir_inactivas!=='1';
    let rows=db.query('SELECT p.*, c.nombre AS colaborador_nombre, c.iniciales AS colaborador_iniciales FROM entregas_programadas p JOIN usuarios c ON c.id_SB=p.id_colaborador WHERE p.id_responsable=?'+(soloActivas?' AND p.activo=1':'')+' ORDER BY p.created_at DESC',[uid]);
    const idColaboradorFiltro=maybeId(q.id_colaborador);
    if(idColaboradorFiltro) rows=rows.filter(r=>Number(r.id_colaborador)===idColaboradorFiltro);
    const conResumen=rows.map(p=>{
      const instancias=db.query('SELECT * FROM entregas_instancias WHERE id_entrega_programada=?',[p.id_entrega_programada]);
      const r=resumenInstancias(instancias);
      return{...p,total_instancias:r.total,pct_a_tiempo:r.pct_a_tiempo,pct_general:r.pct_general,pct_no_entregado:r.pct_no_entregado,conteo:r.conteo};
    });
    return{total:conResumen.length,programadas:conResumen};
  }

  function desactivarProgramada(userId,idProgramada,actor,candidateDb){
    const db=dbOr(candidateDb),uid=actorId(actor);
    const programada=programadaRow(idProgramada,db);
    if(Number(programada.id_responsable)!==uid) throw httpError(403,'Solo quien creó la entrega programada puede desactivarla.','LAB_ENTREGAS_NO_AUTORIZADO');
    db.run('UPDATE entregas_programadas SET activo=0,updated_at=CURRENT_TIMESTAMP WHERE id_entrega_programada=?',[programada.id_entrega_programada]);
    return{id_entrega_programada:Number(programada.id_entrega_programada),activo:false};
  }

  // ---------------------------------------------------------------------
  // Mis entregas: instancias donde el usuario autenticado es el
  // colaborador que debe entregar.
  // ---------------------------------------------------------------------
  function misEntregas(userId,query,candidateDb){
    const db=dbOr(candidateDb),uid=id(userId,'usuario');
    const q=query||{};
    let rows=db.query(
      `SELECT i.*, p.titulo, p.descripcion, p.tipo_recurrencia, p.id_responsable, r.nombre AS responsable_nombre
       FROM entregas_instancias i
       JOIN entregas_programadas p ON p.id_entrega_programada=i.id_entrega_programada
       JOIN usuarios r ON r.id_SB=p.id_responsable
       WHERE p.id_colaborador=? AND p.activo=1
       ORDER BY i.fecha_limite`,[uid]
    );
    let enriquecidas=rows.map(enriquecerInstancia);
    const estadoFiltro=text(q.estado_entrega);
    if(estadoFiltro) enriquecidas=enriquecidas.filter(r=>r.estado_entrega===estadoFiltro);
    return{total:enriquecidas.length,instancias:enriquecidas};
  }

  function instanciaRow(idInstancia,db){
    const row=db.query(
      `SELECT i.*, p.id_responsable, p.id_colaborador, p.titulo
       FROM entregas_instancias i JOIN entregas_programadas p ON p.id_entrega_programada=i.id_entrega_programada
       WHERE i.id_instancia=?`,[id(idInstancia,'id_instancia')]
    )[0];
    if(!row) throw httpError(404,'Entrega no encontrada.','LAB_ENTREGAS_INSTANCIA_NOT_FOUND');
    return row;
  }

  // ---------------------------------------------------------------------
  // Subir archivo: solo el colaborador de esa entrega puede cargarlo. Se
  // guarda en ManttoLabBlobStore (mismo patron que el resto del LAB) y se
  // marca fecha_entrega = ahora, lo que determina a_tiempo/tarde. Si ya
  // habia sido rechazada, un nuevo archivo reinicia la validacion a
  // "sin revisar" (vuelve a quedar pendiente de que el responsable la
  // revise), en vez de quedar marcada como valida automaticamente.
  // ---------------------------------------------------------------------
  async function subirArchivo(userId,idInstancia,body,actor,candidateDb){
    const db=dbOr(candidateDb),uid=actorId(actor);
    const inst=instanciaRow(idInstancia,db);
    if(Number(inst.id_colaborador)!==uid) throw httpError(403,'Solo el colaborador asignado a esta entrega puede cargar el archivo.','LAB_ENTREGAS_NO_AUTORIZADO');
    const blob=root?.ManttoLabBlobStore;
    if(!blob) throw new Error('MANTTO_LAB_BLOB_STORE_REQUIRED');
    const file=body?.file||body?.archivo;
    if(!blob.isFileLike(file)) throw httpError(400,'Selecciona un archivo válido.','LAB_FILE_REQUIRED');
    if(inst.storage_blob_name) await blob.remove(inst.storage_blob_name).catch(()=>null);
    const stored=await blob.put(file,{prefix:`entregas/${inst.id_entrega_programada}/${inst.id_instancia}`});
    db.run(
      `UPDATE entregas_instancias SET fecha_entrega=CURRENT_TIMESTAMP,nombre_archivo=?,mime_type=?,tamano_bytes=?,
       storage_provider='LAB_INDEXEDDB',storage_blob_name=?,entregado_por=?,validado=NULL,validado_por=NULL,
       fecha_validacion=NULL,comentario_validacion=NULL,updated_at=CURRENT_TIMESTAMP WHERE id_instancia=?`,
      [stored.name,stored.type,stored.size,stored.key,uid,inst.id_instancia]
    );
    return enriquecerInstancia(db.query('SELECT * FROM entregas_instancias WHERE id_instancia=?',[inst.id_instancia])[0]);
  }

  async function archivoAcceso(userId,idInstancia,candidateDb){
    const db=dbOr(candidateDb),inst=instanciaRow(idInstancia,db);
    if(!inst.storage_blob_name) throw httpError(404,'Esta entrega todavía no tiene archivo cargado.','LAB_ENTREGAS_SIN_ARCHIVO');
    const data=await root.ManttoLabBlobStore.accessUrl(inst.storage_blob_name);
    if(!data) throw httpError(404,'Contenido local no encontrado.','LAB_LOCAL_BLOB_NOT_FOUND');
    return{...data,id_instancia:Number(inst.id_instancia)};
  }

  // ---------------------------------------------------------------------
  // Validacion: solo el responsable que creo la entrega programada puede
  // validar. Esto es justo lo que evita que el colaborador "autocalifique"
  // su propio cumplimiento subiendo cualquier archivo.
  // ---------------------------------------------------------------------
  function validacionPendientes(userId,query,candidateDb){
    const db=dbOr(candidateDb),uid=id(userId,'usuario');
    const rows=db.query(
      `SELECT i.*, p.titulo, p.id_responsable, p.id_colaborador, c.nombre AS colaborador_nombre
       FROM entregas_instancias i
       JOIN entregas_programadas p ON p.id_entrega_programada=i.id_entrega_programada
       JOIN usuarios c ON c.id_SB=p.id_colaborador
       WHERE p.id_responsable=? AND i.fecha_entrega IS NOT NULL AND i.validado IS NULL
       ORDER BY i.fecha_entrega`,[uid]
    );
    return{total:rows.length,instancias:rows.map(enriquecerInstancia)};
  }

  function validar(userId,idInstancia,body,actor,candidateDb){
    const db=dbOr(candidateDb),uid=actorId(actor);
    const inst=instanciaRow(idInstancia,db);
    if(Number(inst.id_responsable)!==uid) throw httpError(403,'Solo quien creó esta entrega programada puede validarla.','LAB_ENTREGAS_NO_AUTORIZADO');
    if(!inst.fecha_entrega) throw httpError(409,'Esta entrega todavía no tiene archivo cargado para validar.','LAB_ENTREGAS_SIN_ARCHIVO');
    const b=body||{};
    const esValido=b.valido===true||b.valido==='true'||b.valido===1||b.valido==='1';
    const comentario=text(b.comentario,1000);
    db.run(
      'UPDATE entregas_instancias SET validado=?,validado_por=?,fecha_validacion=CURRENT_TIMESTAMP,comentario_validacion=?,updated_at=CURRENT_TIMESTAMP WHERE id_instancia=?',
      [esValido?1:0,uid,comentario,inst.id_instancia]
    );
    return enriquecerInstancia(db.query('SELECT * FROM entregas_instancias WHERE id_instancia=?',[inst.id_instancia])[0]);
  }

  // ---------------------------------------------------------------------
  // Indicadores: porcentajes de cumplimiento de las entregas programadas
  // POR el usuario (como responsable). Incluye desglose por colaborador.
  // ---------------------------------------------------------------------
  function indicadores(userId,query,candidateDb){
    const db=dbOr(candidateDb),uid=id(userId,'usuario');
    const rows=db.query(
      `SELECT i.*, p.id_colaborador, c.nombre AS colaborador_nombre
       FROM entregas_instancias i
       JOIN entregas_programadas p ON p.id_entrega_programada=i.id_entrega_programada
       JOIN usuarios c ON c.id_SB=p.id_colaborador
       WHERE p.id_responsable=? AND p.activo=1`,[uid]
    );
    const general=resumenInstancias(rows);
    const porColaborador={};
    rows.forEach(r=>{
      const key=r.id_colaborador;
      if(!porColaborador[key]) porColaborador[key]={id_colaborador:Number(key),nombre:r.colaborador_nombre,instancias:[]};
      porColaborador[key].instancias.push(r);
    });
    const desglose=Object.values(porColaborador).map(c=>{
      const r=resumenInstancias(c.instancias);
      return{id_colaborador:c.id_colaborador,nombre:c.nombre,total:r.total,pct_a_tiempo:r.pct_a_tiempo,pct_general:r.pct_general,pct_no_entregado:r.pct_no_entregado,conteo:r.conteo};
    }).sort((a,b)=>(a.nombre||'').localeCompare(b.nombre||''));
    return{
      total:general.total,
      pct_a_tiempo:general.pct_a_tiempo,
      pct_general:general.pct_general,
      pct_no_entregado:general.pct_no_entregado,
      conteo:general.conteo,
      por_colaborador:desglose
    };
  }

  return Object.freeze({
    opciones,crearProgramada,listarProgramadas,detalleProgramada,desactivarProgramada,
    misEntregas,subirArchivo,archivoAcceso,validacionPendientes,validar,indicadores
  });
});
