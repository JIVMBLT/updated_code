'use strict';

const db = require('../config/db');
const {
  CORELLIAN_ENGINE,
  buildResolvedUserColumnsScopeSql_cor
} = require('./alcance/alcance-cor.service');
const {
  UNITED_ENGINE,
  buildResolvedPortafolioScopeSql_uni,
  buildResolvedTicketScopeSql_uni
} = require('./alcance/alcance-uni.service');

function informationAccessContext_gnral(source) {
  return source?.informationAccess || source || null;
}

function resolvedScope_gnral(source) {
  const context = informationAccessContext_gnral(source);
  return context?.alcance || context || null;
}

function visibleUserIds_gnral(source) {
  const context = informationAccessContext_gnral(source);
  if (!context) return [];
  const scope = resolvedScope_gnral(context);
  if (scope?.motor !== CORELLIAN_ENGINE) return [];
  if (scope.llave_maestra === true || scope.requiere_filtro_usuario === false) return null;
  return [...new Set((Array.isArray(scope.usuarios_visibles) ? scope.usuarios_visibles : [])
    .map(Number)
    .filter((id) => Number.isInteger(id) && id > 0))]
    .sort((a, b) => a - b);
}

function zoneIds_gnral(source) {
  const scope = resolvedScope_gnral(source);
  if (!scope || scope.motor !== UNITED_ENGINE) return [];
  if (scope.llave_maestra === true || scope.requiere_filtro_zona === false) return null;
  return [...new Set((Array.isArray(scope.zona_ids) ? scope.zona_ids : [])
    .map(Number)
    .filter((id) => Number.isInteger(id) && id > 0))]
    .sort((a, b) => a - b);
}

function failClosedScopeSql_gnral() {
  return { sql: '1 = 0', params: [] };
}

function unrestrictedScopeSql_gnral() {
  return { sql: '1 = 1', params: [] };
}

function safeAlias_gnral(alias, fallback) {
  const normalized = String(alias || fallback || '').trim();
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(normalized)) {
    const error = new Error(`Alias SQL invalido para alcance de registro: ${normalized || '(vacio)'}.`);
    error.status = 500;
    error.code = 'INFORMATION_RECORD_SCOPE_CONFIGURATION_ERROR';
    throw error;
  }
  return normalized;
}

function buildPortafolioScopeSql_gnral(source, alias = 'p') {
  const scope = resolvedScope_gnral(source);
  if (!scope || scope.motor !== UNITED_ENGINE) return failClosedScopeSql_gnral();
  const built = buildResolvedPortafolioScopeSql_uni(scope, alias);
  return { sql: built.sql, params: built.params || [] };
}

function buildPortafolioScopeSqlInline_gnral(source, alias = 'p') {
  const scope = resolvedScope_gnral(source);
  if (!scope || scope.motor !== UNITED_ENGINE) return failClosedScopeSql_gnral();
  if (scope.llave_maestra === true || scope.requiere_filtro_zona === false) {
    return unrestrictedScopeSql_gnral();
  }
  const ids = zoneIds_gnral(scope);
  if (!ids || !ids.length) return failClosedScopeSql_gnral();
  const a = safeAlias_gnral(alias, 'p');
  return { sql: `${a}.zona_id IN (${ids.join(', ')})`, params: [] };
}

function buildTicketScopeSql_gnral(source, alias = 't') {
  const scope = resolvedScope_gnral(source);
  if (!scope || scope.motor !== UNITED_ENGINE) return failClosedScopeSql_gnral();
  const built = buildResolvedTicketScopeSql_uni(scope, alias);
  return { sql: built.sql, params: built.params || [] };
}

function buildTicketScopeSqlInline_gnral(source, alias = 't') {
  const scope = resolvedScope_gnral(source);
  if (!scope || scope.motor !== UNITED_ENGINE) return failClosedScopeSql_gnral();
  if (scope.llave_maestra === true || scope.requiere_filtro_zona === false) {
    return unrestrictedScopeSql_gnral();
  }
  const ids = zoneIds_gnral(scope);
  if (!ids || !ids.length) return failClosedScopeSql_gnral();
  const a = safeAlias_gnral(alias, 't');
  const idList = ids.join(', ');

  return {
    sql: `EXISTS (
      SELECT 1
      FROM portafolio p_scope_uni_ticket_inline
      WHERE p_scope_uni_ticket_inline.estado_registro = 1
        AND p_scope_uni_ticket_inline.zona_id IN (${idList})
        AND (
          (NULLIF(TRIM(COALESCE(${a}.codigo_equipo, '')), '') IS NOT NULL
            AND TRIM(COALESCE(p_scope_uni_ticket_inline.numero_equipo, '')) = TRIM(COALESCE(${a}.codigo_equipo, '')))
          OR (NULLIF(TRIM(COALESCE(${a}.proyecto, '')), '') IS NOT NULL
            AND LOWER(TRIM(COALESCE(p_scope_uni_ticket_inline.proyecto, ''))) = LOWER(TRIM(COALESCE(${a}.proyecto, ''))))
          OR (NULLIF(TRIM(COALESCE(${a}.proyecto_padre, '')), '') IS NOT NULL
            AND LOWER(TRIM(COALESCE(p_scope_uni_ticket_inline.proyecto, ''))) = LOWER(TRIM(COALESCE(${a}.proyecto_padre, ''))))
        )
    )`,
    params: []
  };
}

function buildInsFlScopeSql_gnral(source, alias = 'f') {
  const scope = resolvedScope_gnral(source);
  if (!scope || scope.motor !== CORELLIAN_ENGINE) return failClosedScopeSql_gnral();
  const a = safeAlias_gnral(alias, 'f');
  const built = buildResolvedUserColumnsScopeSql_cor(
    scope,
    [`${a}.id_asesor`, `${a}.id_sup`, `${a}.id_admin`]
  );
  return { sql: built.sql, params: built.params || [] };
}

async function requireTicketRecordScope_gnral(req, res, next) {
  const scope = buildTicketScopeSql_gnral(req, 't');
  if (scope.sql === '1 = 1') return next();
  const ref = String(req.params?.ticket || '').trim();
  if (!ref) return res.status(400).json({ ok: false, message: 'Ticket requerido.' });

  try {
    const [rows] = await db.query(
      `SELECT t.id
       FROM tickets t
       WHERE (
         TRIM(COALESCE(t.ticket, '')) = ?
         OR CAST(t.id AS CHAR) = ?
         OR TRIM(COALESCE(t.folio, '')) = ?
         OR TRIM(COALESCE(t.id_interno, '')) = ?
       )
         AND ${scope.sql}
       ORDER BY t.id DESC
       LIMIT 1`,
      [ref, ref, ref, ref, ...scope.params]
    );
    if (!rows.length) {
      return res.status(404).json({ ok: false, message: 'Ticket no encontrado.' });
    }
    return next();
  } catch (error) {
    return next(error);
  }
}

async function requirePortafolioEquipmentScope_gnral(req, res, next) {
  const scope = buildPortafolioScopeSql_gnral(req, 'p');
  if (scope.sql === '1 = 1') return next();
  const code = String(req.params?.codigo || '').trim();
  if (!code) return res.status(400).json({ ok: false, message: 'Equipo requerido.' });

  try {
    const [rows] = await db.query(
      `SELECT p.id_portafolio
       FROM portafolio p
       WHERE (
         TRIM(COALESCE(p.numero_equipo, '')) = TRIM(?)
         OR TRIM(COALESCE(p.identificacion_sitio, '')) = TRIM(?)
       )
         AND ${scope.sql}
       LIMIT 1`,
      [code, code, ...scope.params]
    );
    if (!rows.length) {
      return res.status(404).json({ ok: false, message: 'Equipo no encontrado.' });
    }
    return next();
  } catch (error) {
    return next(error);
  }
}

async function requirePortafolioProjectScope_gnral(req, res, next) {
  const scope = buildPortafolioScopeSql_gnral(req, 'p');
  if (scope.sql === '1 = 1') return next();
  const project = String(req.params?.proyecto || req.query?.proyecto || '').trim();
  if (!project) return res.status(400).json({ ok: false, message: 'Proyecto requerido.' });

  try {
    const [rows] = await db.query(
      `SELECT p.id_portafolio
       FROM portafolio p
       WHERE LOWER(TRIM(COALESCE(p.proyecto, ''))) = LOWER(TRIM(?))
         AND ${scope.sql}
       LIMIT 1`,
      [project, ...scope.params]
    );
    if (!rows.length) {
      return res.status(404).json({ ok: false, message: 'Proyecto no encontrado.' });
    }
    return next();
  } catch (error) {
    return next(error);
  }
}

async function filterPortafolioEquipmentBodyScope_gnral(req, res, next) {
  const requested = Array.from(new Set(
    (Array.isArray(req.body?.equipos) ? req.body.equipos : [])
      .map((value) => String(value == null ? '' : value).trim())
      .filter(Boolean)
  ));
  if (!requested.length) return next();

  const scope = buildPortafolioScopeSql_gnral(req, 'p');
  if (scope.sql === '1 = 1') return next();

  try {
    const [rows] = await db.query(
      `SELECT DISTINCT p.numero_equipo
       FROM portafolio p
       WHERE p.numero_equipo IN (?)
         AND ${scope.sql}`,
      [requested, ...scope.params]
    );
    const allowed = new Set(rows.map((row) => String(row.numero_equipo || '').trim()).filter(Boolean));
    req.body = {
      ...(req.body || {}),
      equipos: requested.filter((code) => allowed.has(code))
    };
    return next();
  } catch (error) {
    return next(error);
  }
}

async function requireContextualEquipmentScope_gnral(req, res, next) {
  const raw = String(req.params?.codigo || '').trim();
  if (!raw.includes('|||')) return requirePortafolioEquipmentScope_gnral(req, res, next);

  const parts = raw.split('|||');
  const project = String(parts[0] || '').trim();
  const reference = String(parts.slice(1).join('|||') || '').trim();
  if (!project || !reference) {
    return res.status(400).json({ ok: false, message: 'La referencia de Instalaciones no es valida.' });
  }

  const scope = buildInsFlScopeSql_gnral(req, 'f');
  if (scope.sql === '1 = 1') return next();

  try {
    const [rows] = await db.query(
      `SELECT f.id_ins_fl
       FROM ins_fl f
       WHERE LOWER(TRIM(COALESCE(f.proyecto, ''))) = LOWER(TRIM(?))
         AND LOWER(TRIM(COALESCE(f.referencia_sitio, ''))) = LOWER(TRIM(?))
         AND ${scope.sql}
       LIMIT 1`,
      [project, reference, ...scope.params]
    );
    if (!rows.length) {
      return res.status(404).json({ ok: false, message: 'Equipo no encontrado.' });
    }
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  visibleUserIds_gnral,
  zoneIds_gnral,
  buildPortafolioScopeSql_gnral,
  buildPortafolioScopeSqlInline_gnral,
  buildTicketScopeSql_gnral,
  buildTicketScopeSqlInline_gnral,
  buildInsFlScopeSql_gnral,
  requireTicketRecordScope_gnral,
  requirePortafolioEquipmentScope_gnral,
  requirePortafolioProjectScope_gnral,
  filterPortafolioEquipmentBodyScope_gnral,
  requireContextualEquipmentScope_gnral
};
