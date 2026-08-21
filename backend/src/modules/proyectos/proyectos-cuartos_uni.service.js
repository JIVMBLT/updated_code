'use strict';

const repository = require('./proyectos.repository');
const informationRecordScope = require('../../services/information-record-scope-gnral.service');
const portafolioConsultasUni = require('../portafolio/portafolio-consultas_uni');
const db = { query: (...args) => repository.query(...args) };

const latestTicketJoin = `
  LEFT JOIN (
    SELECT *
    FROM (
      SELECT t.*, ROW_NUMBER() OVER (PARTITION BY t.codigo_equipo ORDER BY t.fecha_reporte DESC, t.id DESC) AS rn
      FROM tickets t
      WHERE t.codigo_equipo IS NOT NULL AND t.codigo_equipo <> ''
    ) ranked
    WHERE ranked.rn = 1
  ) lt ON lt.codigo_equipo = p.numero_equipo
`;

function likeParam(value) {
  const s = String(value || '').trim();
  return s ? '%' + s + '%' : null;
}

function formatProyectoNombre(value) {
  const raw = String(value || '').trim();
  const m = raw.match(/^(\d+)-(\d{2})-(\d{2})(?:T.*)?$/);
  if (!m) return raw;
  const numero = String(Number(m[1]) || m[1].replace(/^0+/, '') || m[1]);
  const meses = {'01':'Enero','02':'Febrero','03':'Marzo','04':'Abril','05':'Mayo','06':'Junio','07':'Julio','08':'Agosto','09':'Septiembre','10':'Octubre','11':'Noviembre','12':'Diciembre'};
  return `${String(Number(m[3]) || m[3])} de ${meses[m[2]] || m[2]} #${numero}`;
}

function decorateProyectoRow(row) {
  if (!row) return row;
  const codigo = row.proyecto_codigo || row.proyecto;
  const rawNombre = row.nombre_publico || row.proyecto_nombre || row.proyecto_cc_x_port || codigo;
  return { ...row, proyecto_codigo: codigo, proyecto_nombre: row.nombre_publico || formatProyectoNombre(rawNombre || codigo) };
}

function proyectosFilters(req, alias = 'p') {
  const scope = informationRecordScope.buildPortafolioScopeSql_gnral(req, alias);
  const clauses = [
    scope.sql,
    `${alias}.estado_registro = 1`,
    `(${alias}.inactivo IS NULL OR UPPER(${alias}.inactivo) NOT IN ('SI','SÍ','1','TRUE','INACTIVO'))`,
    `${alias}.proyecto IS NOT NULL`,
    `TRIM(${alias}.proyecto) <> ''`
  ];
  const params = [...scope.params];
  const zona = likeParam(req.query.zona);
  const estado = likeParam(req.query.estado);
  const supervisor = likeParam(req.query.supervisor);
  const search = likeParam(req.query.search || req.query.buscar);
  if (zona) { clauses.push(`${alias}.zona_operativa LIKE ?`); params.push(zona); }
  if (estado) { clauses.push(`${alias}.estado LIKE ?`); params.push(estado); }
  if (supervisor) { clauses.push(`${alias}.supervisor_zona LIKE ?`); params.push(supervisor); }
  if (search) {
    clauses.push(`(${alias}.proyecto LIKE ? OR ${alias}.ciudad LIKE ? OR ${alias}.estado LIKE ? OR ${alias}.zona_operativa LIKE ? OR ${alias}.supervisor_zona LIKE ?)`);
    params.push(search, search, search, search, search);
  }
  return { where: clauses.join(' AND '), params };
}

async function getProyectosFiltros_uni(req, res) {
  const scope = informationRecordScope.buildPortafolioScopeSql_gnral(req, 'p');
  try {
    const [zonas] = await db.query(`SELECT DISTINCT p.zona_operativa AS value FROM portafolio p WHERE p.estado_registro = 1 AND ${scope.sql} AND p.zona_operativa IS NOT NULL AND p.zona_operativa <> '' ORDER BY p.zona_operativa ASC`, scope.params);
    const [estados] = await db.query(`SELECT DISTINCT p.estado AS value FROM portafolio p WHERE p.estado_registro = 1 AND ${scope.sql} AND p.estado IS NOT NULL AND p.estado <> '' ORDER BY p.estado ASC`, scope.params);
    const [supervisores] = await db.query(`SELECT DISTINCT p.supervisor_zona AS value FROM portafolio p WHERE p.estado_registro = 1 AND ${scope.sql} AND p.supervisor_zona IS NOT NULL AND p.supervisor_zona <> '' ORDER BY p.supervisor_zona ASC`, scope.params);
    return res.json({ok:true,source:'aiven',filters:{zonas:zonas.map(r=>r.value).filter(Boolean),estados:estados.map(r=>r.value).filter(Boolean),supervisores:supervisores.map(r=>r.value).filter(Boolean)}});
  } catch (error) {
    return res.status(500).json({ok:false,message:'Error consultando filtros de proyectos.',error:error.message});
  }
}

async function getProyectos_uni(req, res) {
  if (String(req.query.detalle || '').trim() === '1' && String(req.query.proyecto || '').trim()) {
    return getProyectoDetalle_uni(req, res);
  }
  const filters = proyectosFilters(req, 'p');
  try {
    const [rows] = await db.query(`
      SELECT
        p.proyecto,
        MAX(pe.nombre_publico) AS nombre_publico,
        MAX(p.ciudad) AS ciudad,
        MAX(p.estado) AS estado,
        MAX(p.zona_operativa) AS zona,
        MAX(p.supervisor_zona) AS supervisor,
        COUNT(*) AS equipos,
        SUM(CASE WHEN UPPER(COALESCE(lt.estatus_equipo_final,'')) LIKE '%NO FUNC%' THEN 1 ELSE 0 END) AS parados,
        SUM(COALESCE(t35.tickets_35d, 0)) AS tickets_35d,
        SUM(COALESCE(blt.blt_365d, 0)) AS fallas_blt_365d,
        SUM(COALESCE(resp_anio.llamadas_blt_anio, 0)) AS llamadas_blt_anio,
        MAX(resp_anio.ultima_llamada_blt) AS ultima_llamada_blt,
        SUM(COALESCE(resp_anio.llamadas_cliente_anio, 0)) AS llamadas_cliente_anio,
        MAX(resp_anio.ultima_llamada_cliente) AS ultima_llamada_cliente,
        CASE WHEN COUNT(*) > 0 THEN ROUND(AVG(CASE WHEN COALESCE(blt.blt_365d,0)=0 THEN 365 ELSE 365/COALESCE(blt.blt_365d,1) END),0) ELSE NULL END AS mtbc_365
      FROM portafolio p
      LEFT JOIN proyecto_equivalencias pe ON pe.activo = 1 AND UPPER(TRIM(pe.proyecto_united)) = UPPER(TRIM(p.proyecto))
      ${latestTicketJoin}
      LEFT JOIN (SELECT codigo_equipo,COUNT(*) AS tickets_35d FROM tickets WHERE fecha_reporte >= DATE_SUB(CURDATE(),INTERVAL 35 DAY) AND codigo_equipo IS NOT NULL AND codigo_equipo <> '' GROUP BY codigo_equipo) t35 ON t35.codigo_equipo = p.numero_equipo
      LEFT JOIN (SELECT codigo_equipo,COUNT(*) AS blt_365d FROM tickets WHERE fecha_reporte >= DATE_SUB(CURDATE(),INTERVAL 365 DAY) AND codigo_equipo IS NOT NULL AND codigo_equipo <> '' AND UPPER(COALESCE(responsabilidad,'')) = 'BLT' GROUP BY codigo_equipo) blt ON blt.codigo_equipo = p.numero_equipo
      LEFT JOIN (
        SELECT codigo_equipo,
          SUM(CASE WHEN UPPER(TRIM(COALESCE(responsabilidad,'')))='BLT' THEN 1 ELSE 0 END) AS llamadas_blt_anio,
          MAX(CASE WHEN UPPER(TRIM(COALESCE(responsabilidad,'')))='BLT' THEN fecha_reporte END) AS ultima_llamada_blt,
          SUM(CASE WHEN UPPER(TRIM(COALESCE(responsabilidad,'')))='CLIENTE' THEN 1 ELSE 0 END) AS llamadas_cliente_anio,
          MAX(CASE WHEN UPPER(TRIM(COALESCE(responsabilidad,'')))='CLIENTE' THEN fecha_reporte END) AS ultima_llamada_cliente
        FROM tickets
        WHERE fecha_reporte >= MAKEDATE(YEAR(CURDATE()),1) AND fecha_reporte < MAKEDATE(YEAR(CURDATE())+1,1) AND codigo_equipo IS NOT NULL AND TRIM(codigo_equipo) <> ''
        GROUP BY codigo_equipo
      ) resp_anio ON resp_anio.codigo_equipo = p.numero_equipo
      WHERE ${filters.where}
      GROUP BY p.proyecto
      ORDER BY parados DESC, tickets_35d DESC, p.proyecto ASC
    `, filters.params);

    const summary = rows.reduce((acc,row)=>{acc.proyectos+=1;acc.equipos+=Number(row.equipos||0);acc.parados+=Number(row.parados||0);if(row.mtbc_365!==null&&row.mtbc_365!==undefined){acc.mtbc_sum+=Number(row.mtbc_365||0);acc.mtbc_count+=1;}return acc;},{proyectos:0,equipos:0,parados:0,mtbc_sum:0,mtbc_count:0});
    summary.mtbc_promedio = summary.mtbc_count ? Math.round(summary.mtbc_sum / summary.mtbc_count) : null;
    delete summary.mtbc_sum; delete summary.mtbc_count;
    return res.json({ok:true,source:'aiven',summary,data:rows.map(decorateProyectoRow)});
  } catch (error) {
    return res.status(500).json({ok:false,message:'Error consultando proyectos desde Aiven.',error:error.message});
  }
}

async function getProyectoDetalle_uni(req, res) {
  // El detalle Portafolio de FASE 2 ya filtra equipos, tickets, métricas y
  // bloques asociados por los cuartos del usuario.
  return portafolioConsultasUni.getPortafolioProyectoDetalle_uni(req, res);
}

module.exports = { getProyectosFiltros_uni, getProyectos_uni, getProyectoDetalle_uni };
