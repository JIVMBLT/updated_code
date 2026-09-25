// [Claude | 2026-09-19 | CLAUDE-MG | LAB DGB - INSTALACIONES CONTACTOS V001]
// Base de Datos - Formato de Contactos (Operacion > Instalaciones).
// Mismo patron de helpers y CRUD que lab-sales.service.js (ver
// createContact/updateContact/removeContact de ventas_clientes_contactos),
// adaptado a instalaciones_contactos: Nombre, Puesto, Correo, Telefono,
// Categoria (3 valores fijos) y Proyecto (FK real a ins_fl.id_ins_fl, un
// proyecto por contacto).
(function initManttoLabInstalacionesContactosService(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.ManttoLabInstalacionesContactosService=api;
})(typeof globalThis!=='undefined'?globalThis:this,function createManttoLabInstalacionesContactosService(root){
  'use strict';

  const CATEGORIAS=[
    'Administración y Cobranza',
    'Notificaciones de Avance de Materiales, Obra y/o Instalaciones',
    'Comunicados Críticos'
  ];

  function dbOr(candidate){ return candidate||root.ManttoLabDB; }
  function httpError(status,message,code){ const e=new Error(message); e.status=status; e.statusCode=status; e.code=code||'LAB_INSTALACIONES_CONTACTOS_ERROR'; return e; }
  function id(value,field='id'){ const n=Number(value); if(!Number.isInteger(n)||n<=0) throw httpError(400,`${field} debe ser un entero positivo.`,'LAB_INVALID_ID'); return n; }
  function maybeId(value){ const n=Number(value); return Number.isInteger(n)&&n>0?n:null; }
  function text(value,max=500,fallback=null){ const v=value==null?'':String(value).trim(); return v?v.slice(0,max):fallback; }
  function actorId(actor){ return id(actor?.id_SB||actor?.id||actor?.user_id,'usuario autenticado'); }
  function values(body){ return body&&typeof body==='object'?body:{}; }

  const SELECT_BASE=`SELECT c.*, f.proyecto AS proyecto_nombre, f.id_proyecto AS proyecto_codigo
    FROM instalaciones_contactos c
    LEFT JOIN ins_fl f ON f.id_ins_fl=c.id_ins_fl`;

  function proyectoExiste(idInsFl,db){ return Boolean(db.scalar('SELECT 1 FROM ins_fl WHERE id_ins_fl=?',[idInsFl])); }
  function getOne(contactId,candidateDb){
    const db=dbOr(candidateDb);
    return db.query(`${SELECT_BASE} WHERE c.id_contacto=?`,[contactId])[0]||null;
  }
  function assertContact(contactId,candidateDb){
    const db=dbOr(candidateDb), cid=id(contactId,'id_contacto');
    const row=db.query('SELECT 1 FROM instalaciones_contactos WHERE id_contacto=? AND activo=1',[cid])[0];
    if(!row) throw httpError(404,'Contacto no encontrado.','LAB_INSTALACIONES_CONTACTOS_NOT_FOUND');
    return cid;
  }

  // ---------------------------------------------------------------------
  // Opciones para el formulario: las 3 categorias fijas + catalogo de
  // proyectos de Instalaciones (ins_fl) para el selector de "Proyecto".
  // ---------------------------------------------------------------------
  function opciones(userId,candidateDb){
    const db=dbOr(candidateDb);
    const rows=db.query('SELECT id_ins_fl,proyecto,id_proyecto FROM ins_fl ORDER BY proyecto');
    const proyectos=rows.map(r=>({
      id_ins_fl:r.id_ins_fl,
      proyecto:r.proyecto||r.id_proyecto||('Proyecto #'+r.id_ins_fl),
      id_proyecto:r.id_proyecto||null
    }));
    return {categorias:[...CATEGORIAS],proyectos};
  }

  // ---------------------------------------------------------------------
  // Listado con filtros: categoria, proyecto (id_ins_fl), y busqueda de
  // texto libre sobre nombre/puesto/correo/telefono/proyecto.
  // ---------------------------------------------------------------------
  function listar(userId,query,candidateDb){
    const db=dbOr(candidateDb);
    const q=query||{};
    const clauses=['c.activo=1'];
    const params=[];
    const categoria=text(q.categoria,300);
    if(categoria){
      if(!CATEGORIAS.includes(categoria)) throw httpError(400,'categoria inválida.','LAB_INSTALACIONES_CONTACTOS_CATEGORIA_INVALID');
      clauses.push('c.categoria=?'); params.push(categoria);
    }
    const idInsFl=maybeId(q.id_ins_fl);
    if(idInsFl){ clauses.push('c.id_ins_fl=?'); params.push(idInsFl); }
    const search=text(q.search??q.buscar,120);
    if(search){
      clauses.push('(c.nombre LIKE ? OR c.puesto LIKE ? OR c.correo LIKE ? OR c.telefono LIKE ? OR f.proyecto LIKE ?)');
      params.push(...Array(5).fill('%'+search+'%'));
    }
    const sql=`${SELECT_BASE} WHERE ${clauses.join(' AND ')} ORDER BY c.nombre`;
    const rows=db.query(sql,params);
    return {contactos:rows,data:rows,total:rows.length,categorias:[...CATEGORIAS]};
  }

  // ---------------------------------------------------------------------
  // CRUD
  // ---------------------------------------------------------------------
  function crear(userId,body,actor,candidateDb){
    const db=dbOr(candidateDb), uid=actorId(actor);
    const b=values(body);
    const nombre=text(b.nombre,180);
    if(!nombre) throw httpError(400,'nombre es obligatorio.','LAB_INSTALACIONES_CONTACTOS_NOMBRE_REQUIRED');
    const categoria=text(b.categoria,300);
    if(!CATEGORIAS.includes(categoria)) throw httpError(400,'categoria inválida. Debe ser una de las 3 categorías definidas.','LAB_INSTALACIONES_CONTACTOS_CATEGORIA_INVALID');
    const idInsFl=id(b.id_ins_fl,'proyecto');
    if(!proyectoExiste(idInsFl,db)) throw httpError(404,'Proyecto de Instalaciones no encontrado.','LAB_INSTALACIONES_CONTACTOS_PROYECTO_NOT_FOUND');
    const r=db.run(
      'INSERT INTO instalaciones_contactos(nombre,puesto,correo,telefono,categoria,id_ins_fl,activo,created_by,updated_by) VALUES(?,?,?,?,?,?,1,?,?)',
      [nombre,text(b.puesto,150),text(b.correo,200),text(b.telefono,80),categoria,idInsFl,uid,uid]
    );
    return getOne(r.lastInsertRowId,db);
  }

  function editar(userId,contactId,body,actor,candidateDb){
    const db=dbOr(candidateDb), uid=actorId(actor), cid=assertContact(contactId,db);
    const old=db.query('SELECT * FROM instalaciones_contactos WHERE id_contacto=?',[cid])[0];
    const b={...old,...values(body)};
    const nombre=text(b.nombre,180);
    if(!nombre) throw httpError(400,'nombre es obligatorio.','LAB_INSTALACIONES_CONTACTOS_NOMBRE_REQUIRED');
    const categoria=text(b.categoria,300);
    if(!CATEGORIAS.includes(categoria)) throw httpError(400,'categoria inválida. Debe ser una de las 3 categorías definidas.','LAB_INSTALACIONES_CONTACTOS_CATEGORIA_INVALID');
    const idInsFl=id(b.id_ins_fl,'proyecto');
    if(!proyectoExiste(idInsFl,db)) throw httpError(404,'Proyecto de Instalaciones no encontrado.','LAB_INSTALACIONES_CONTACTOS_PROYECTO_NOT_FOUND');
    db.run(
      'UPDATE instalaciones_contactos SET nombre=?,puesto=?,correo=?,telefono=?,categoria=?,id_ins_fl=?,updated_at=CURRENT_TIMESTAMP,updated_by=? WHERE id_contacto=?',
      [nombre,text(b.puesto,150),text(b.correo,200),text(b.telefono,80),categoria,idInsFl,uid,cid]
    );
    return getOne(cid,db);
  }

  function eliminar(userId,contactId,actor,candidateDb){
    const db=dbOr(candidateDb), uid=actorId(actor), cid=assertContact(contactId,db);
    db.run('UPDATE instalaciones_contactos SET activo=0,updated_at=CURRENT_TIMESTAMP,updated_by=? WHERE id_contacto=?',[uid,cid]);
    return {id_contacto:cid,activo:false};
  }

  return Object.freeze({opciones,listar,crear,editar,eliminar,CATEGORIAS:[...CATEGORIAS]});
});
