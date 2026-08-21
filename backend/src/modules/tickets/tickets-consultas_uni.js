'use strict';

const db = require('../../config/db');
const {
  buildTicketScopeSql_gnral
} = require('../../services/information-record-scope-gnral.service');

async function getTickets_uni(req, res) {
  const scope = buildTicketScopeSql_gnral(req, 't');

  try {
    const [rows] = await db.query(`
      SELECT t.*
      FROM tickets t
      WHERE ${scope.sql}
      ORDER BY t.id DESC
      LIMIT 50000
    `, scope.params);

    return res.json({ ok: true, source: 'tickets', data: rows });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: 'Error consultando tickets.',
      error: error.message
    });
  }
}

async function getTicketDetalle_uni(req, res) {
  const ticket = String(req.params?.ticket || '').trim();
  if (!ticket) {
    return res.status(400).json({ ok: false, message: 'Ticket requerido.' });
  }

  const scope = buildTicketScopeSql_gnral(req, 't');

  try {
    const [rows] = await db.query(`
      SELECT t.*
      FROM tickets t
      WHERE (t.ticket = ? OR t.folio = ?)
        AND ${scope.sql}
      ORDER BY t.id DESC
      LIMIT 1
    `, [ticket, ticket, ...scope.params]);

    if (!rows.length) {
      return res.status(404).json({ ok: false, message: 'Ticket no encontrado.' });
    }

    return res.json({ ok: true, source: 'tickets', data: rows[0] });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: 'Error consultando detalle de ticket.',
      error: error.message
    });
  }
}

module.exports = {
  getTickets_uni,
  getTicketDetalle_uni
};
