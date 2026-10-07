// [Claude | 2026-10-07 | CLAUDE-MG | LAB DGB - INSTALACIONES PROGRAMACION DE PERSONAL V001]
// Programacion de personal de Instalaciones (Montadores y Ajustadores).
//
// Regla de fechas (acordada con el usuario): los dias de trabajo NO se capturan,
// salen del reporte de Instalaciones (ins_fl) del equipo asignado:
//   MONTADOR : INICIO DE MONTAJE  -> FIN DE MONTAJE (real, si no modificado, si no planeado)
//   AJUSTADOR: INICIO DE AJUSTE   -> FIN DE AJUSTE  (real, si no modificado, si no planeado)
// fecha_desde / fecha_hasta de la asignacion son opcionales y solo acotan los dias
// de una persona (relevos) o suplen un reporte sin fechas.
// Duracion = dias naturales, inclusive.
//
// Alcance: el catalogo de personal es global. Las asignaciones solo se detallan
// para equipos visibles al usuario (misma regla que Instalaciones); las de equipos
// fuera de alcance cuentan para ocupacion/conflictos pero se devuelven sin detalle.
(function initManttoLabInstalacionesProgramacionService(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.ManttoLabInstalacionesProgramacionService=api;
})(typeof globalThis!=='undefined'?globalThis:this,function createManttoLabInstalacionesProgramacionService(root){
  'use strict';

  const TIPOS={
    MONTADOR:{tabla:'instalaciones_personal_montadores',pk:'id_montador',fase:'montaje',etiqueta:'Montador'},
    AJUSTADOR:{tabla:'instalaciones_personal_ajustadores',pk:'id_ajustador',fase:'ajuste',etiqueta:'Ajustador'}
  };
  const PUESTOS=['Mecánico','Ayudante'];
  const MAX_PERSONAL_POR_ALTA=60;
  const LIMITE={dia:186,semana:160,mes:60};

  // ---------------------------------------------------------------- utilidades
  function dbOr(candidate){const db=candidate||root.ManttoLabDB;if(!db)throw new Error('MANTTO_LAB_DB_REQUIRED');return db;}
  function httpError(status,message,code,details){const e=new Error(message);e.status=status;e.statusCode=status;e.code=code||'LAB_PROGRAMACION_ERROR';if(details!==undefined)e.details=details;return e;}
  function id(value,field='id'){const n=Number(value);if(!Number.isInteger(n)||n<=0)throw httpError(400,`${field} debe ser un entero positivo.`,'LAB_INVALID_ID');return n;}
  function maybeId(value){const n=Number(value);return Number.isInteger(n)&&n>0?n:null;}
  function text(value,max=300,fallback=null){const v=value==null?'':String(value).trim();return v?v.slice(0,max):fallback;}
  function actorId(actor){return id(actor?.id_SB||actor?.id||actor?.user_id,'usuario autenticado');}
  function values(body){return body&&typeof body==='object'?body:{};}
  function flag(v){return v===true||v==='1'||v==='true'||v===1;}
  function cmp(a,b){return String(a||'').localeCompare(String(b||''),'es',{sensitivity:'base'});}

  function tipoCfg(tipo){
    const key=String(tipo||'').trim().toUpperCase().replace(/ES$/,'').replace(/S$/,'');
    const cfg=TIPOS[key];
    if(!cfg)throw httpError(400,'tipo debe ser MONTADOR o AJUSTADOR.','LAB_PROGRAMACION_TIPO_INVALID');
    return{key,...cfg};
  }

  // ---------------------------------------------------------------- fechas
  function pad(n){return String(n).padStart(2,'0');}
  function isoDate(v){
    if(v==null)return null;
    const s=String(v).trim();
    let y,m,d,x;
    if((x=/^(\d{4})-(\d{2})-(\d{2})/.exec(s))){y=+x[1];m=+x[2];d=+x[3];}
    else if((x=/^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(s))){d=+x[1];m=+x[2];y=+x[3];}
    else return null;
    const t=new Date(Date.UTC(y,m-1,d));
    if(t.getUTCFullYear()!==y||t.getUTCMonth()!==m-1||t.getUTCDate()!==d)return null;
    return `${y}-${pad(m)}-${pad(d)}`;
  }
  function dayNum(iso){const[y,m,d]=iso.split('-').map(Number);return Math.floor(Date.UTC(y,m-1,d)/86400000);}
  function fromDayNum(n){const t=new Date(n*86400000);return `${t.getUTCFullYear()}-${pad(t.getUTCMonth()+1)}-${pad(t.getUTCDate())}`;}
  function addDays(iso,n){return fromDayNum(dayNum(iso)+n);}
  function diasInclusive(a,b){return dayNum(b)-dayNum(a)+1;}
  function hoyISO(opts){
    const h=isoDate(opts&&opts.hoy);if(h)return h;
    const d=new Date();return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  }
  function inputDate(v,campo){
    if(v==null||String(v).trim()==='')return null;
    const d=isoDate(v);
    if(!d)throw httpError(400,`${campo} debe ser una fecha válida (AAAA-MM-DD).`,'LAB_PROGRAMACION_FECHA_INVALID');
    return d;
  }
  function solapa(aIni,aFin,bIni,bFin){return aIni<=bFin&&aFin>=bIni;}

  // Ventana del equipo segun el reporte de Instalaciones.
  function ventanaEquipo(tipoKey,row){
    let inicio,candidatos;
    if(tipoKey==='MONTADOR'){
      inicio=isoDate(row.fecha_inicio_montaje);
      candidatos=[['real',row.fecha_fin_montaje_real],['modificado',row.fecha_fin_montaje_modificado],['planeado',row.fecha_fin_montaje_planeado]];
    }else{
      inicio=isoDate(row.fecha_inicio_ajuste);
      candidatos=[['real',row.fecha_fin_ajuste_real],['modificado',row.fecha_fin_ajuste_modificado],['planeado',row.fecha_fin_ajuste_planeado]];
    }
    let fin=null,fuente=null;
    for(const[f,v]of candidatos){const d=isoDate(v);if(d){fin=d;fuente=f;break;}}
    const valida=Boolean(inicio&&fin&&fin>=inicio);
    return{inicio,fin,fuente_fin:fuente,dias:valida?diasInclusive(inicio,fin):null,valida};
  }
  // Ventana efectiva de una asignacion: reporte, con acotacion manual opcional.
  function ventanaAsignacion(tipoKey,equipoRow,a){
    const v=ventanaEquipo(tipoKey,equipoRow);
    const desde=isoDate(a.fecha_desde),hasta=isoDate(a.fecha_hasta);
    const inicio=desde||v.inicio,fin=hasta||v.fin;
    const valida=Boolean(inicio&&fin&&fin>=inicio);
    return{inicio,fin,dias:valida?diasInclusive(inicio,fin):null,valida,
      fuente_fin:hasta?'manual':v.fuente_fin,inicio_manual:Boolean(desde),fin_manual:Boolean(hasta)};
  }

  // ---------------------------------------------------------------- alcance
  // Norma: DIRECTOR_GENERAL (codigo canonico) tiene lectura universal; no depende de alcance.
  function esDirectorGeneral(uid,db){
    const perm=root.ManttoLabPermissionsService;
    if(perm&&typeof perm.activeRoles==='function')return perm.activeRoles(uid,db).some(r=>String(r.codigo||'').toUpperCase()==='DIRECTOR_GENERAL');
    return Number(db.scalar(`SELECT COUNT(*) FROM usuarios u JOIN roles r ON r.id_rol=u.rol_id WHERE u.id_SB=? AND r.codigo='DIRECTOR_GENERAL'`,[uid])||0)>0;
  }
  function visibleSet(userId,db){
    const uidN=id(userId,'usuario');
    if(esDirectorGeneral(uidN,db))return new Set(db.query('SELECT id_ins_fl FROM ins_fl WHERE activo=1').map(r=>Number(r.id_ins_fl)));
    const ins=root.ManttoLabInstallationsService;
    if(!ins||typeof ins.visibleProjectSql!=='function')throw new Error('MANTTO_LAB_INSTALLATIONS_SERVICE_REQUIRED');
    const scope=ins.visibleProjectSql(id(userId,'usuario'),'f',db);
    const rows=db.query(`SELECT f.id_ins_fl FROM ins_fl f WHERE f.activo=1 AND ${scope.sql}`,scope.params);
    return new Set(rows.map(r=>Number(r.id_ins_fl)));
  }
  function equipoVisible(userId,idInsFl,db){
    const set=visibleSet(userId,db);
    if(!set.has(Number(idInsFl)))throw httpError(404,'Equipo de Instalaciones no encontrado o fuera de alcance.','LAB_PROGRAMACION_EQUIPO_NOT_FOUND');
    return db.query('SELECT * FROM ins_fl WHERE id_ins_fl=? AND activo=1',[Number(idInsFl)])[0];
  }

  // ---------------------------------------------------------------- personal
  function grupoDe(tipoKey,p){return tipoKey==='MONTADOR'?(p.puesto||'Sin puesto'):(p.categoria||'Sin categoría');}
  function normPersonal(tipoKey,r){
    const cfg=TIPOS[tipoKey];
    const base={tipo:tipoKey,id_personal:Number(r[cfg.pk]),nombre:r.nombre,categoria:r.categoria||null,activo:Number(r.activo)===1};
    if(tipoKey==='MONTADOR')Object.assign(base,{id_montador:base.id_personal,contratista:r.contratista,puesto:r.puesto});
    else Object.assign(base,{id_ajustador:base.id_personal,experiencia:r.experiencia||null});
    base.grupo=grupoDe(tipoKey,base);
    return base;
  }
  function cargarPersonal(tipoKey,db,{soloActivos=true}={}){
    const cfg=TIPOS[tipoKey];
    const rows=db.query(`SELECT * FROM ${cfg.tabla}${soloActivos?' WHERE activo=1':''}`);
    return rows.map(r=>normPersonal(tipoKey,r)).sort((a,b)=>cmp(a.contratista,b.contratista)||cmp(a.nombre,b.nombre));
  }
  function filtrarPersonal(lista,q){
    const query=values(q);
    const txt=text(query.q??query.search??query.buscar,120);
    const puesto=text(query.puesto,50),categoria=text(query.categoria,120),contratista=text(query.contratista,160);
    return lista.filter(p=>{
      if(puesto&&p.puesto!==puesto)return false;
      if(categoria&&p.categoria!==categoria)return false;
      if(contratista&&p.contratista!==contratista)return false;
      if(txt){const hay=[p.nombre,p.contratista,p.puesto,p.categoria,p.experiencia].filter(Boolean).join(' ').toLowerCase();if(!hay.includes(txt.toLowerCase()))return false;}
      return true;
    });
  }
  function getPersonal(tipoKey,idPersonal,db){
    const cfg=TIPOS[tipoKey];
    const r=db.query(`SELECT * FROM ${cfg.tabla} WHERE ${cfg.pk}=?`,[id(idPersonal,'id_personal')])[0];
    if(!r)throw httpError(404,`${cfg.etiqueta} no encontrado.`,'LAB_PROGRAMACION_PERSONAL_NOT_FOUND');
    return r;
  }

  // ---------------------------------------------------------------- asignaciones
  const COLS_EQUIPO='f.proyecto,f.id_proyecto,f.referencia_sitio,f.estatus,f.fecha_inicio_montaje,f.fecha_fin_montaje_planeado,f.fecha_fin_montaje_modificado,f.fecha_fin_montaje_real,f.fecha_inicio_ajuste,f.fecha_fin_ajuste_planeado,f.fecha_fin_ajuste_modificado,f.fecha_fin_ajuste_real';
  function cargarAsignaciones(tipoKey,db,{soloPersonal=null}={}){
    const cfg=TIPOS[tipoKey];
    const rows=db.query(`SELECT a.id_asignacion,a.${cfg.pk} AS id_personal,a.id_ins_fl,a.fecha_desde,a.fecha_hasta,a.notas,${COLS_EQUIPO}
      FROM instalaciones_programacion_asignaciones a JOIN ins_fl f ON f.id_ins_fl=a.id_ins_fl AND f.activo=1
      WHERE a.activo=1 AND a.tipo_personal=?${soloPersonal?` AND a.${cfg.pk}=?`:''}`,soloPersonal?[tipoKey,soloPersonal]:[tipoKey]);
    return rows.map(r=>({
      id_asignacion:Number(r.id_asignacion),id_personal:Number(r.id_personal),id_ins_fl:Number(r.id_ins_fl),
      proyecto:r.proyecto||r.id_proyecto,id_proyecto:r.id_proyecto,equipo:r.referencia_sitio,estatus:r.estatus,
      notas:r.notas||null,fecha_desde:r.fecha_desde||null,fecha_hasta:r.fecha_hasta||null,
      ...ventanaAsignacion(tipoKey,r,r)
    }));
  }
  // Redaccion por alcance: se conserva lo necesario para ocupacion, se oculta el detalle.
  function paraUsuario(a,vis){
    if(vis.has(a.id_ins_fl))return{...a,visible:true};
    return{id_asignacion:null,id_personal:a.id_personal,id_ins_fl:null,proyecto:null,id_proyecto:null,equipo:null,estatus:null,notas:null,
      fecha_desde:null,fecha_hasta:null,inicio:a.inicio,fin:a.fin,dias:a.dias,valida:a.valida,fuente_fin:null,inicio_manual:false,fin_manual:false,visible:false};
  }
  function conflictos(asignaciones,idPersonal,inicio,fin,{excluirAsignacion=null,excluirEquipo=null}={}){
    return asignaciones.filter(a=>a.id_personal===idPersonal&&a.valida&&a.id_asignacion!==excluirAsignacion&&a.id_ins_fl!==excluirEquipo&&solapa(a.inicio,a.fin,inicio,fin));
  }
  function resumenConflicto(a,vis){const x=paraUsuario(a,vis);return{id_asignacion:x.id_asignacion,proyecto:x.proyecto,equipo:x.equipo,inicio:x.inicio,fin:x.fin,visible:x.visible};}

  // ---------------------------------------------------------------- opciones / equipos
  function opciones(userId,candidateDb){
    const db=dbOr(candidateDb);
    const distinct=(tabla,col)=>db.query(`SELECT DISTINCT ${col} AS v FROM ${tabla} WHERE activo=1 AND ${col} IS NOT NULL AND TRIM(${col})<>'' ORDER BY ${col}`).map(r=>r.v);
    return{
      tipos:Object.keys(TIPOS),puestos:[...PUESTOS],
      montadores:{contratistas:distinct('instalaciones_personal_montadores','contratista'),categorias:distinct('instalaciones_personal_montadores','categoria')},
      ajustadores:{categorias:distinct('instalaciones_personal_ajustadores','categoria')}
    };
  }

  function equipos(userId,query,candidateDb){
    const db=dbOr(candidateDb),q=values(query),t=tipoCfg(q.tipo);
    const vis=visibleSet(userId,db);
    const asign=cargarAsignaciones(t.key,db).filter(a=>vis.has(a.id_ins_fl));
    const porEquipo=new Map();for(const a of asign)porEquipo.set(a.id_ins_fl,(porEquipo.get(a.id_ins_fl)||0)+1);
    const txt=text(q.q??q.search,120),soloSin=flag(q.solo_sin_personal);
    const desde=inputDate(q.desde,'desde'),hasta=inputDate(q.hasta,'hasta');
    const rows=db.query('SELECT * FROM ins_fl WHERE activo=1 ORDER BY proyecto,referencia_sitio,id_ins_fl').filter(r=>vis.has(Number(r.id_ins_fl)));
    const out=[];
    for(const r of rows){
      if(txt&&![r.proyecto,r.id_proyecto,r.referencia_sitio].filter(Boolean).join(' ').toLowerCase().includes(txt.toLowerCase()))continue;
      const v=ventanaEquipo(t.key,r),n=porEquipo.get(Number(r.id_ins_fl))||0;
      if(soloSin&&n>0)continue;
      if((desde||hasta)&&!(v.valida&&solapa(v.inicio,v.fin,desde||'0000-01-01',hasta||'9999-12-31')))continue;
      out.push({id_ins_fl:Number(r.id_ins_fl),proyecto:r.proyecto||r.id_proyecto,id_proyecto:r.id_proyecto,equipo:r.referencia_sitio,estatus:r.estatus,
        inicio:v.inicio,fin:v.fin,fuente_fin:v.fuente_fin,dias:v.dias,valida:v.valida,asignados:n});
    }
    out.sort((a,b)=>(a.valida===b.valida?0:a.valida?-1:1)||cmp(a.inicio,b.inicio)||cmp(a.proyecto,b.proyecto));
    return{tipo:t.key,fase:t.fase,equipos:out,data:out,total:out.length};
  }

  // ---------------------------------------------------------------- CRUD personal
  function listarPersonal(userId,query,candidateDb){
    const db=dbOr(candidateDb),q=values(query),t=tipoCfg(q.tipo),hoy=hoyISO(q);
    const vis=visibleSet(userId,db);
    const todas=cargarAsignaciones(t.key,db);
    const porPersona=new Map();for(const a of todas){if(!porPersona.has(a.id_personal))porPersona.set(a.id_personal,[]);porPersona.get(a.id_personal).push(a);}
    const lista=filtrarPersonal(cargarPersonal(t.key,db),q).map(p=>{
      const mias=porPersona.get(p.id_personal)||[];
      const actual=mias.find(a=>a.valida&&a.inicio<=hoy&&a.fin>=hoy)||null;
      const proxima=mias.filter(a=>a.valida&&a.inicio>hoy).sort((a,b)=>cmp(a.inicio,b.inicio))[0]||null;
      return{...p,total_asignaciones:mias.length,
        asignacion_actual:actual?resumenConflicto(actual,vis):null,
        proxima_asignacion:proxima?resumenConflicto(proxima,vis):null};
    });
    return{tipo:t.key,personal:lista,data:lista,total:lista.length,hoy};
  }

  function validarPersonal(tipoKey,b,db,excluirId){
    const cfg=TIPOS[tipoKey];
    const nombre=text(b.nombre,180);
    if(!nombre)throw httpError(400,'nombre es obligatorio.','LAB_PROGRAMACION_NOMBRE_REQUIRED');
    const datos={nombre,categoria:text(b.categoria,120)};
    if(tipoKey==='MONTADOR'){
      datos.contratista=text(b.contratista,160);
      if(!datos.contratista)throw httpError(400,'contratista es obligatorio.','LAB_PROGRAMACION_CONTRATISTA_REQUIRED');
      datos.puesto=text(b.puesto,50);
      if(!PUESTOS.includes(datos.puesto))throw httpError(400,'puesto debe ser Mecánico o Ayudante.','LAB_PROGRAMACION_PUESTO_INVALID');
    }else{
      datos.experiencia=text(b.experiencia,120);
    }
    const dup=db.query(`SELECT ${cfg.pk} AS pid FROM ${cfg.tabla} WHERE activo=1 AND LOWER(TRIM(nombre))=LOWER(?)${tipoKey==='MONTADOR'?' AND LOWER(TRIM(contratista))=LOWER(?)':''}`,
      tipoKey==='MONTADOR'?[nombre,datos.contratista]:[nombre]).find(r=>Number(r.pid)!==excluirId);
    if(dup)throw httpError(409,`Ya existe ${cfg.etiqueta.toLowerCase()} activo con ese nombre${tipoKey==='MONTADOR'?' en ese contratista':''}.`,'LAB_PROGRAMACION_PERSONAL_DUPLICADO');
    return datos;
  }
  function crearPersonal(userId,body,actor,candidateDb){
    const db=dbOr(candidateDb),uid=actorId(actor),b=values(body),t=tipoCfg(b.tipo),cfg=TIPOS[t.key];
    const d=validarPersonal(t.key,b,db,null);
    const r=t.key==='MONTADOR'
      ?db.run(`INSERT INTO ${cfg.tabla}(contratista,nombre,puesto,categoria,activo,created_by,updated_by) VALUES(?,?,?,?,1,?,?)`,[d.contratista,d.nombre,d.puesto,d.categoria,uid,uid])
      :db.run(`INSERT INTO ${cfg.tabla}(nombre,categoria,experiencia,activo,created_by,updated_by) VALUES(?,?,?,1,?,?)`,[d.nombre,d.categoria,d.experiencia,uid,uid]);
    return normPersonal(t.key,getPersonal(t.key,r.lastInsertRowId,db));
  }
  function editarPersonal(userId,tipo,idPersonal,body,actor,candidateDb){
    const db=dbOr(candidateDb),uid=actorId(actor),t=tipoCfg(tipo),cfg=TIPOS[t.key],pid=id(idPersonal,'id_personal');
    const old=getPersonal(t.key,pid,db);
    if(Number(old.activo)!==1)throw httpError(404,`${cfg.etiqueta} no encontrado.`,'LAB_PROGRAMACION_PERSONAL_NOT_FOUND');
    const d=validarPersonal(t.key,{...old,...values(body)},db,pid);
    if(t.key==='MONTADOR')db.run(`UPDATE ${cfg.tabla} SET contratista=?,nombre=?,puesto=?,categoria=?,updated_at=CURRENT_TIMESTAMP,updated_by=? WHERE ${cfg.pk}=?`,[d.contratista,d.nombre,d.puesto,d.categoria,uid,pid]);
    else db.run(`UPDATE ${cfg.tabla} SET nombre=?,categoria=?,experiencia=?,updated_at=CURRENT_TIMESTAMP,updated_by=? WHERE ${cfg.pk}=?`,[d.nombre,d.categoria,d.experiencia,uid,pid]);
    return normPersonal(t.key,getPersonal(t.key,pid,db));
  }
  function eliminarPersonal(userId,tipo,idPersonal,actor,candidateDb,opts){
    const db=dbOr(candidateDb),uid=actorId(actor),t=tipoCfg(tipo),cfg=TIPOS[t.key],pid=id(idPersonal,'id_personal'),hoy=hoyISO(opts);
    const row=getPersonal(t.key,pid,db);
    if(Number(row.activo)!==1)throw httpError(404,`${cfg.etiqueta} no encontrado.`,'LAB_PROGRAMACION_PERSONAL_NOT_FOUND');
    const vigentes=cargarAsignaciones(t.key,db,{soloPersonal:pid}).filter(a=>!a.valida||a.fin>=hoy);
    if(vigentes.length)throw httpError(409,`${row.nombre} tiene ${vigentes.length} asignación(es) vigente(s) o futura(s). Quítalas del calendario antes de darlo de baja.`,'LAB_PROGRAMACION_PERSONAL_CON_ASIGNACIONES');
    db.run(`UPDATE ${cfg.tabla} SET activo=0,updated_at=CURRENT_TIMESTAMP,updated_by=? WHERE ${cfg.pk}=?`,[uid,pid]);
    return{tipo:t.key,id_personal:pid,activo:false};
  }

  // ---------------------------------------------------------------- calendario
  function rangoConsulta(q,{max=1830,obligatorio=true}={}){
    const desde=inputDate(q.desde,'desde'),hasta=inputDate(q.hasta,'hasta');
    if(obligatorio&&(!desde||!hasta))throw httpError(400,'desde y hasta son obligatorios.','LAB_PROGRAMACION_RANGO_REQUIRED');
    if(desde&&hasta){
      if(hasta<desde)throw httpError(400,'hasta no puede ser anterior a desde.','LAB_PROGRAMACION_RANGO_INVALID');
      if(diasInclusive(desde,hasta)>max)throw httpError(400,`El rango no puede exceder ${max} días.`,'LAB_PROGRAMACION_RANGO_LARGO');
    }
    return{desde,hasta};
  }
  function calendario(userId,query,candidateDb){
    const db=dbOr(candidateDb),q=values(query),t=tipoCfg(q.tipo),hoy=hoyISO(q);
    const{desde,hasta}=rangoConsulta(q);
    const vis=visibleSet(userId,db);
    const personal=filtrarPersonal(cargarPersonal(t.key,db),q);
    const ids=new Set(personal.map(p=>p.id_personal));
    const todas=cargarAsignaciones(t.key,db).filter(a=>ids.has(a.id_personal));
    const enRango=todas.filter(a=>a.valida&&solapa(a.inicio,a.fin,desde,hasta)).map(a=>paraUsuario(a,vis));
    const sinFechas=todas.filter(a=>!a.valida&&vis.has(a.id_ins_fl)).map(a=>paraUsuario(a,vis));
    return{tipo:t.key,fase:t.fase,desde,hasta,hoy,personal,asignaciones:enRango,sin_fechas:sinFechas};
  }

  // ---------------------------------------------------------------- escritura de asignaciones
  function getAsignacionRow(tipoKey,idAsignacion,db){
    const aid=id(idAsignacion,'id_asignacion');
    const row=db.query('SELECT * FROM instalaciones_programacion_asignaciones WHERE id_asignacion=? AND activo=1',[aid])[0];
    if(!row)throw httpError(404,'Asignación no encontrada.','LAB_PROGRAMACION_ASIGNACION_NOT_FOUND');
    return row;
  }
  function normAsignacion(tipoKey,idAsignacion,db){
    return cargarAsignaciones(tipoKey,db).find(a=>a.id_asignacion===Number(idAsignacion))||null;
  }

  function crearAsignaciones(userId,body,actor,candidateDb){
    const db=dbOr(candidateDb),uid=actorId(actor),b=values(body),t=tipoCfg(b.tipo),cfg=TIPOS[t.key];
    const equipo=equipoVisible(userId,id(b.id_ins_fl,'id_ins_fl'),db);
    const lista=Array.isArray(b.ids_personal)?b.ids_personal:(b.id_personal!=null?[b.id_personal]:[]);
    const ids=[...new Set(lista.map(x=>id(x,'id_personal')))];
    if(!ids.length)throw httpError(400,'Selecciona al menos una persona.','LAB_PROGRAMACION_PERSONAL_REQUIRED');
    if(ids.length>MAX_PERSONAL_POR_ALTA)throw httpError(400,`Máximo ${MAX_PERSONAL_POR_ALTA} personas por asignación.`,'LAB_PROGRAMACION_DEMASIADOS');
    const desde=inputDate(b.fecha_desde,'fecha_desde'),hasta=inputDate(b.fecha_hasta,'fecha_hasta');
    if(desde&&hasta&&hasta<desde)throw httpError(400,'fecha_hasta no puede ser anterior a fecha_desde.','LAB_PROGRAMACION_RANGO_INVALID');
    const ven=ventanaAsignacion(t.key,equipo,{fecha_desde:desde,fecha_hasta:hasta});
    if(!ven.valida)throw httpError(400,`El equipo no tiene fechas de ${t.fase} válidas en el reporte de Instalaciones. Captura "desde" y "hasta" manualmente.`,'LAB_PROGRAMACION_SIN_FECHAS');
    const personas=ids.map(pid=>{const r=getPersonal(t.key,pid,db);if(Number(r.activo)!==1)throw httpError(404,`${cfg.etiqueta} no encontrado.`,'LAB_PROGRAMACION_PERSONAL_NOT_FOUND');return normPersonal(t.key,r);});
    const vis=visibleSet(userId,db);
    const todas=cargarAsignaciones(t.key,db);

    const duplicadas=personas.filter(p=>todas.some(a=>a.id_personal===p.id_personal&&a.id_ins_fl===equipo.id_ins_fl));
    if(duplicadas.length)throw httpError(409,`Ya está asignado a este equipo: ${duplicadas.map(p=>p.nombre).join(', ')}.`,'LAB_PROGRAMACION_DUPLICADA');

    const traslapes=personas.map(p=>({p,con:conflictos(todas,p.id_personal,ven.inicio,ven.fin)})).filter(x=>x.con.length);
    const listaConflictos=traslapes.map(x=>({id_personal:x.p.id_personal,nombre:x.p.nombre,con:x.con.map(a=>resumenConflicto(a,vis))}));
    if(listaConflictos.length&&!flag(b.permitir_traslape))
      return{creadas:[],conflictos:listaConflictos,requiere_confirmacion:true,ventana:{inicio:ven.inicio,fin:ven.fin,dias:ven.dias}};

    const notas=text(b.notas,1000);
    const nuevas=[];
    for(const p of personas){
      const r=db.run(`INSERT INTO instalaciones_programacion_asignaciones(tipo_personal,${cfg.pk},id_ins_fl,fecha_desde,fecha_hasta,notas,activo,created_by,updated_by) VALUES(?,?,?,?,?,?,1,?,?)`,
        [t.key,p.id_personal,equipo.id_ins_fl,desde,hasta,notas,uid,uid]);
      nuevas.push(Number(r.lastInsertRowId));
    }
    const todasDespues=cargarAsignaciones(t.key,db);
    return{creadas:nuevas.map(n=>paraUsuario(todasDespues.find(a=>a.id_asignacion===n),vis)),conflictos:listaConflictos,requiere_confirmacion:false,ventana:{inicio:ven.inicio,fin:ven.fin,dias:ven.dias}};
  }

  function editarAsignacion(userId,idAsignacion,body,actor,candidateDb){
    const db=dbOr(candidateDb),uid=actorId(actor),b=values(body);
    const row=getAsignacionRow(null,idAsignacion,db),t=tipoCfg(row.tipo_personal);
    const equipo=equipoVisible(userId,row.id_ins_fl,db);
    const desde=Object.prototype.hasOwnProperty.call(b,'fecha_desde')?inputDate(b.fecha_desde,'fecha_desde'):isoDate(row.fecha_desde);
    const hasta=Object.prototype.hasOwnProperty.call(b,'fecha_hasta')?inputDate(b.fecha_hasta,'fecha_hasta'):isoDate(row.fecha_hasta);
    if(desde&&hasta&&hasta<desde)throw httpError(400,'fecha_hasta no puede ser anterior a fecha_desde.','LAB_PROGRAMACION_RANGO_INVALID');
    const ven=ventanaAsignacion(t.key,equipo,{fecha_desde:desde,fecha_hasta:hasta});
    if(!ven.valida)throw httpError(400,`Sin fechas de ${t.fase} válidas: captura "desde" y "hasta".`,'LAB_PROGRAMACION_SIN_FECHAS');
    const pid=Number(row[TIPOS[t.key].pk]);
    const vis=visibleSet(userId,db);
    const con=conflictos(cargarAsignaciones(t.key,db),pid,ven.inicio,ven.fin,{excluirAsignacion:Number(row.id_asignacion)});
    if(con.length&&!flag(b.permitir_traslape))
      return{actualizada:false,asignacion:null,conflictos:[{id_personal:pid,nombre:getPersonal(t.key,pid,db).nombre,con:con.map(a=>resumenConflicto(a,vis))}],requiere_confirmacion:true};
    const notas=Object.prototype.hasOwnProperty.call(b,'notas')?text(b.notas,1000):(row.notas||null);
    db.run('UPDATE instalaciones_programacion_asignaciones SET fecha_desde=?,fecha_hasta=?,notas=?,updated_at=CURRENT_TIMESTAMP,updated_by=? WHERE id_asignacion=?',[desde,hasta,notas,uid,Number(row.id_asignacion)]);
    return{actualizada:true,asignacion:paraUsuario(normAsignacion(t.key,row.id_asignacion,db),vis),conflictos:[],requiere_confirmacion:false};
  }

  function eliminarAsignacion(userId,idAsignacion,actor,candidateDb){
    const db=dbOr(candidateDb),uid=actorId(actor);
    const row=getAsignacionRow(null,idAsignacion,db);
    equipoVisible(userId,row.id_ins_fl,db);
    db.run('UPDATE instalaciones_programacion_asignaciones SET activo=0,updated_at=CURRENT_TIMESTAMP,updated_by=? WHERE id_asignacion=?',[uid,Number(row.id_asignacion)]);
    return{id_asignacion:Number(row.id_asignacion),activo:false};
  }

  // ---------------------------------------------------------------- historial
  function historial(userId,query,candidateDb){
    const db=dbOr(candidateDb),q=values(query),t=tipoCfg(q.tipo),hoy=hoyISO(q);
    const{desde,hasta}=rangoConsulta(q,{obligatorio:false,max:20000});
    const pid=maybeId(q.id_personal);
    const vis=visibleSet(userId,db);
    const personal=new Map(cargarPersonal(t.key,db,{soloActivos:false}).map(p=>[p.id_personal,p]));
    let todas=cargarAsignaciones(t.key,db,pid?{soloPersonal:pid}:{});
    const txt=text(q.q??q.search,120);
    const ocultas=todas.filter(a=>!vis.has(a.id_ins_fl)).length;
    todas=todas.filter(a=>vis.has(a.id_ins_fl));
    const filas=[];
    for(const a of todas){
      const p=personal.get(a.id_personal);if(!p)continue;
      if(txt&&![p.nombre,p.contratista,a.proyecto,a.equipo].filter(Boolean).join(' ').toLowerCase().includes(txt.toLowerCase()))continue;
      if((desde||hasta)&&!(a.valida&&solapa(a.inicio,a.fin,desde||'0000-01-01',hasta||'9999-12-31')))continue;
      let estado='Sin fechas',trabajados=0,programados=0;
      if(a.valida){
        estado=a.fin<hoy?'Pasada':(a.inicio>hoy?'Futura':'En curso');
        const ini=desde&&desde>a.inicio?desde:a.inicio,fin=hasta&&hasta<a.fin?hasta:a.fin;
        if(fin>=ini){
          const topeTrab=fin<hoy?fin:hoy;
          trabajados=topeTrab>=ini?diasInclusive(ini,topeTrab):0;
          const iniFut=ini>hoy?ini:addDays(hoy,1);
          programados=fin>=iniFut?diasInclusive(iniFut,fin):0;
        }
      }
      filas.push({id_asignacion:a.id_asignacion,id_personal:a.id_personal,nombre:p.nombre,contratista:p.contratista||null,puesto:p.puesto||null,categoria:p.categoria,
        id_ins_fl:a.id_ins_fl,proyecto:a.proyecto,equipo:a.equipo,inicio:a.inicio,fin:a.fin,dias:a.dias,dias_trabajados:trabajados,dias_programados:programados,
        estado,fuente_fin:a.fuente_fin,inicio_manual:a.inicio_manual,fin_manual:a.fin_manual,notas:a.notas});
    }
    filas.sort((x,y)=>cmp(y.inicio,x.inicio)||cmp(x.nombre,y.nombre));
    const resumen={total_asignaciones:filas.length,proyectos_distintos:new Set(filas.map(f=>f.proyecto)).size,
      dias_trabajados:filas.reduce((s,f)=>s+f.dias_trabajados,0),dias_programados:filas.reduce((s,f)=>s+f.dias_programados,0)};
    return{tipo:t.key,hoy,desde,hasta,id_personal:pid,filas,data:filas,total:filas.length,resumen,ocultas};
  }

  // ---------------------------------------------------------------- disponibilidad
  function generarBuckets(desde,hasta,gran){
    const out=[];
    if(gran==='dia'){for(let d=dayNum(desde);d<=dayNum(hasta);d++){const i=fromDayNum(d);out.push({desde:i,hasta:i});}}
    else if(gran==='semana'){
      let d=dayNum(desde);d-=((d+3)%7+7)%7;                       // lunes de la semana de "desde"
      const fin=dayNum(hasta);
      for(;d<=fin;d+=7)out.push({desde:fromDayNum(d),hasta:fromDayNum(d+6)});
    }else{
      const[y0,m0]=desde.split('-').map(Number),[y1,m1]=hasta.split('-').map(Number);
      for(let y=y0,m=m0;y<y1||(y===y1&&m<=m1);m===12?(y++,m=1):m++){
        const last=new Date(Date.UTC(y,m,0)).getUTCDate();
        out.push({desde:`${y}-${pad(m)}-01`,hasta:`${y}-${pad(m)}-${pad(last)}`});
      }
    }
    return out;
  }
  function disponibilidad(userId,query,candidateDb){
    const db=dbOr(candidateDb),q=values(query),t=tipoCfg(q.tipo),hoy=hoyISO(q);
    const gran=['dia','semana','mes'].includes(String(q.granularidad||'').toLowerCase())?String(q.granularidad).toLowerCase():'semana';
    const{desde,hasta}=rangoConsulta(q,{max:3700});
    const buckets=generarBuckets(desde,hasta,gran);
    if(buckets.length>LIMITE[gran])throw httpError(400,`Demasiados periodos (${buckets.length}) para granularidad ${gran}; máximo ${LIMITE[gran]}.`,'LAB_PROGRAMACION_RANGO_LARGO');
    const personal=filtrarPersonal(cargarPersonal(t.key,db),q);
    const porPersona=new Map();
    for(const a of cargarAsignaciones(t.key,db)){if(!a.valida)continue;if(!porPersona.has(a.id_personal))porPersona.set(a.id_personal,[]);porPersona.get(a.id_personal).push(a);}
    const grupos=[...new Set(personal.map(p=>p.grupo))].sort(cmp);
    const salida=buckets.map(bk=>{
      const g={};for(const nombre of grupos)g[nombre]={total:0,ocupados:0,libres:0};
      let ocupados=0;
      for(const p of personal){
        const ocu=(porPersona.get(p.id_personal)||[]).some(a=>solapa(a.inicio,a.fin,bk.desde,bk.hasta));
        g[p.grupo].total++;if(ocu){g[p.grupo].ocupados++;ocupados++;}
      }
      for(const nombre of grupos)g[nombre].libres=g[nombre].total-g[nombre].ocupados;
      return{desde:bk.desde,hasta:bk.hasta,total:personal.length,ocupados,libres:personal.length-ocupados,grupos:g};
    });
    return{tipo:t.key,granularidad:gran,desde,hasta,hoy,total_personal:personal.length,grupos,agrupado_por:t.key==='MONTADOR'?'puesto':'categoria',buckets:salida};
  }

  // ---------------------------------------------------------------- simulacion (no escribe)
  function simulacion(userId,query,candidateDb){
    const db=dbOr(candidateDb),q=values(query),t=tipoCfg(q.tipo);
    const idEquipo=maybeId(q.id_ins_fl);
    const equipo=idEquipo?equipoVisible(userId,idEquipo,db):null;
    const vEquipo=equipo?ventanaEquipo(t.key,equipo):null;
    const desdeManual=inputDate(q.fecha_inicio,'fecha_inicio'),hastaManual=inputDate(q.fecha_fin,'fecha_fin');
    const inicio=desdeManual||vEquipo?.inicio||null,fin=hastaManual||vEquipo?.fin||null;
    if(!inicio||!fin)throw httpError(400,equipo?`El equipo no tiene fechas de ${t.fase} en el reporte: indica fecha_inicio y fecha_fin.`:'Indica fecha_inicio y fecha_fin (o un equipo con fechas).','LAB_PROGRAMACION_SIN_FECHAS');
    if(fin<inicio)throw httpError(400,'fecha_fin no puede ser anterior a fecha_inicio.','LAB_PROGRAMACION_RANGO_INVALID');
    if(diasInclusive(inicio,fin)>3700)throw httpError(400,'La ventana no puede exceder 3700 días.','LAB_PROGRAMACION_RANGO_LARGO');
    const vis=visibleSet(userId,db);
    const todas=cargarAsignaciones(t.key,db);
    const personal=filtrarPersonal(cargarPersonal(t.key,db),q);
    const libres=[],ocupados=[];
    for(const p of personal){
      const yaEnEquipo=equipo?todas.some(a=>a.id_personal===p.id_personal&&a.id_ins_fl===equipo.id_ins_fl):false;
      const con=conflictos(todas,p.id_personal,inicio,fin,{excluirEquipo:equipo?Number(equipo.id_ins_fl):null});
      if(con.length){
        const ocupadoHasta=con.reduce((m,a)=>a.fin>m?a.fin:m,'0000-00-00');
        ocupados.push({...p,ya_asignado:yaEnEquipo,ocupado_hasta:ocupadoHasta,libre_desde:addDays(ocupadoHasta,1),ocupado_en:con.map(a=>resumenConflicto(a,vis))});
      }else libres.push({...p,ya_asignado:yaEnEquipo});
    }
    const requeridos={};
    if(t.key==='MONTADOR'){
      const m=Number(q.mecanicos),a=Number(q.ayudantes);
      if(Number.isInteger(m)&&m>0)requeridos['Mecánico']=m;
      if(Number.isInteger(a)&&a>0)requeridos['Ayudante']=a;
    }else{
      const n=Number(q.ajustadores);if(Number.isInteger(n)&&n>0)requeridos['Ajustador']=n;
    }
    const resumen=Object.entries(requeridos).map(([grupo,req])=>{
      const disp=libres.filter(p=>!p.ya_asignado&&(t.key==='MONTADOR'?p.puesto===grupo:true)).length;
      return{grupo,requeridos:req,libres:disp,faltantes:Math.max(0,req-disp)};
    });
    return{tipo:t.key,fase:t.fase,
      ventana:{inicio,fin,dias:diasInclusive(inicio,fin),desde_reporte:Boolean(vEquipo&&inicio===vEquipo.inicio&&fin===vEquipo.fin),fuente_fin:vEquipo?vEquipo.fuente_fin:null},
      equipo:equipo?{id_ins_fl:Number(equipo.id_ins_fl),proyecto:equipo.proyecto||equipo.id_proyecto,equipo:equipo.referencia_sitio,inicio:vEquipo.inicio,fin:vEquipo.fin}:null,
      libres,ocupados,requeridos,resumen,viable:resumen.every(r=>r.faltantes===0)};
  }

  return Object.freeze({
    TIPOS:Object.keys(TIPOS),PUESTOS:[...PUESTOS],
    opciones,equipos,listarPersonal,crearPersonal,editarPersonal,eliminarPersonal,
    calendario,crearAsignaciones,editarAsignacion,eliminarAsignacion,historial,disponibilidad,simulacion,
    // expuestos para pruebas
    _ventanaEquipo:ventanaEquipo,_isoDate:isoDate,_generarBuckets:generarBuckets
  });
});
