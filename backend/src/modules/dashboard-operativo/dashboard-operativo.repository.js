'use strict';

const db = require('../../config/db');
const informationRecordScope = require('../../services/information-record-scope-gnral.service');

function visibleUserIds_uni(informationAccess) {
  return informationRecordScope.visibleUserIds_gnral(informationAccess);
}

async function getSupervisoresActivosPorZona(informationAccess = null) {
  const ids = visibleUserIds_uni(informationAccess);
  const userFilter = ids === null
    ? { sql: '1 = 1', params: [] }
    : (ids.length
      ? { sql: 'u.id_SB IN (?)', params: [ids] }
      : { sql: '1 = 0', params: [] });

  const [rows] = await db.query(`
    SELECT DISTINCT
      u.id_SB AS supervisor_id,
      UPPER(TRIM(u.nombre)) AS supervisor,
      z.id_zona,
      z.zona
    FROM usuarios u
    INNER JOIN usuario_roles ur
      ON ur.id_usuario = u.id_SB
     AND ur.activo = 1
    INNER JOIN roles r
      ON r.id_rol = ur.id_rol
     AND r.estado = 1
    INNER JOIN usuario_zop uz
      ON uz.usuario_id = u.id_SB
     AND uz.estado = 1
    INNER JOIN z_op z
      ON z.id_zona = uz.zona_id
     AND z.estado = 1
    WHERE u.estado = 1
      AND ${userFilter.sql}
      AND UPPER(TRIM(r.rol)) LIKE 'SUPERVISOR MANTENIMIENTO ZONA%'
    ORDER BY supervisor ASC, z.zona ASC
  `, userFilter.params);

  return rows;
}

async function getPreventivosPorZona(mes, informationAccess = null) {
  const scope = informationRecordScope.buildPortafolioScopeSql_gnral(informationAccess, 'p');
  const [rows] = await db.query(`
    SELECT
      UPPER(REPLACE(REPLACE(TRIM(p.zona_operativa), '-', ''), ' ', '')) AS zona_clave,
      COUNT(*) AS programados,
      SUM(CASE WHEN sp.servicio_realizado = 1 THEN 1 ELSE 0 END) AS realizados
    FROM servicios_preventivos sp
    INNER JOIN portafolio p
      ON p.numero_equipo = sp.numero_equipo
    WHERE DATE_FORMAT(sp.mes_servicio, '%Y-%m') = ?
      AND sp.tipo_servicio = 'PREVENTIVO'
      AND p.estado_registro = 1
      AND (p.inactivo IS NULL OR UPPER(TRIM(p.inactivo)) NOT IN ('SI','SÍ','1','TRUE','INACTIVO'))
      AND ${scope.sql}
    GROUP BY zona_clave
  `, [mes, ...scope.params]);

  return rows;
}

module.exports = {
  getSupervisoresActivosPorZona,
  getPreventivosPorZona
};
