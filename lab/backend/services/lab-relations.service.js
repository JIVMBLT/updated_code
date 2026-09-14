(function initManttoLabRelationsService(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.ManttoLabRelationsService=api;
})(typeof globalThis!=='undefined'?globalThis:this,function createManttoLabRelationsService(root){
  'use strict';

  function dbOr(candidate){
    const db=candidate||root?.ManttoLabDB;
    if(!db||typeof db.query!=='function'||typeof db.run!=='function')throw new Error('MANTTO_LAB_DB_REQUIRED');
    return db;
  }
  function positiveId(value){const n=Number(value);return Number.isInteger(n)&&n>0?n:0;}
  function error(message,status,code){const e=new Error(message);e.status=status||400;e.code=code||'LAB_REL_ADMIN_ERROR';return e;}

  function list(candidateDb){
    return dbOr(candidateDb).query(`
      SELECT ura.id_rel_admin,ura.id_asesor,
             asesor.nombre AS asesor_nombre,asesor.iniciales AS asesor_iniciales,
             ura.id_admin,admin.nombre AS admin_nombre,admin.iniciales AS admin_iniciales,
             ura.created_at,ura.updated_at
      FROM usuarios_rel_admin ura
      INNER JOIN usuarios asesor ON asesor.id_SB=ura.id_asesor
      INNER JOIN usuarios admin ON admin.id_SB=ura.id_admin
      ORDER BY asesor.nombre ASC,admin.nombre ASC
    `);
  }

  function create(body,candidateDb){
    const db=dbOr(candidateDb),idAsesor=positiveId(body?.id_asesor),idAdmin=positiveId(body?.id_admin);
    if(!idAsesor||!idAdmin)throw error('id_asesor e id_admin son obligatorios y deben ser IDs válidos.',400,'LAB_REL_ADMIN_IDS_REQUIRED');
    if(idAsesor===idAdmin)throw error('Un usuario no puede relacionarse consigo mismo como administrador.',400,'LAB_REL_ADMIN_SELF');
    const users=db.query('SELECT id_SB FROM usuarios WHERE id_SB IN (?,?)',[idAsesor,idAdmin]);
    if(users.length!==2)throw error('El asesor o el administrador no existe en usuarios.',400,'LAB_REL_ADMIN_USER_MISSING');
    if(db.query('SELECT id_rel_admin FROM usuarios_rel_admin WHERE id_asesor=? AND id_admin=? LIMIT 1',[idAsesor,idAdmin]).length){
      throw error('La relación asesor-administrador ya existe.',409,'LAB_REL_ADMIN_DUPLICATE');
    }
    const result=db.run('INSERT INTO usuarios_rel_admin (id_asesor,id_admin) VALUES (?,?)',[idAsesor,idAdmin]);
    return {id_rel_admin:Number(result.lastInsertRowId),id_asesor:idAsesor,id_admin:idAdmin};
  }

  function remove(relationId,candidateDb){
    const db=dbOr(candidateDb),id=positiveId(relationId);
    if(!id)throw error('ID inválido.',400,'LAB_REL_ADMIN_ID_INVALID');
    const result=db.run('DELETE FROM usuarios_rel_admin WHERE id_rel_admin=?',[id]);
    if(Number(result.changes)!==1)throw error('Relación no encontrada.',404,'LAB_REL_ADMIN_NOT_FOUND');
    return true;
  }

  return Object.freeze({list,create,remove});
});
