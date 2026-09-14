'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const initSqlJs = require(path.join(ROOT, 'lab/vendor/sql.js/1.14.2/sql-wasm.js'));
const wasmPath = path.join(ROOT, 'lab/vendor/sql.js/1.14.2/sql-wasm.wasm');
const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'lab/database/version.json'), 'utf8'));

function scalar(db, sql) {
  const result = db.exec(sql);
  return result.length && result[0].values.length ? result[0].values[0][0] : null;
}

(async () => {
  const SQL = await initSqlJs({ locateFile: () => wasmPath });
  const db = new SQL.Database();
  db.exec(fs.readFileSync(path.join(ROOT, 'lab/database/schema.sql'), 'utf8'));
  db.exec(fs.readFileSync(path.join(ROOT, 'lab/database/seed.sql'), 'utf8'));
  db.exec('PRAGMA foreign_keys=ON;');

  const tables = Number(scalar(db, "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"));
  const users = Number(scalar(db, 'SELECT COUNT(*) FROM usuarios'));
  const projects = Number(scalar(db, 'SELECT COUNT(*) FROM cobranza_proyectos'));
  const equipment = Number(scalar(db, 'SELECT COUNT(*) FROM portafolio'));
  const tickets = Number(scalar(db, 'SELECT COUNT(*) FROM tickets'));
  const tasks = Number(scalar(db, 'SELECT COUNT(*) FROM pendientes'));
  const userVersion = Number(scalar(db, 'PRAGMA user_version'));
  const fkCheck = db.exec('PRAGMA foreign_key_check');
  const fkViolations = fkCheck.length ? fkCheck[0].values.length : 0;

  if (tables !== Number(version.tables)) throw new Error(`tables ${tables} != ${version.tables}`);
  if (userVersion !== Number(version.schema_version)) throw new Error(`user_version ${userVersion} != ${version.schema_version}`);
  if (users !== 61 || projects !== 15 || equipment !== 15 || tickets !== 30 || tasks !== 20) {
    throw new Error(`fixture counts mismatch users=${users} projects=${projects} equipment=${equipment} tickets=${tickets} tasks=${tasks}`);
  }
  if (fkViolations !== 0) throw new Error(`foreign key violations=${fkViolations}`);

  const audit = db.exec('SELECT diferencia, valor_diferencia FROM almacen_auditoria WHERE id_auditoria=976001');
  const values = audit[0] && audit[0].values[0];
  if (!values || Number(values[0]) !== -2 || Number(values[1]) !== -320) {
    throw new Error(`generated columns mismatch ${JSON.stringify(values)}`);
  }

  console.log('OK LAB PHASE 1 V002 / SQL.JS WASM');
  console.log(JSON.stringify({ tables, users, projects, equipment, tickets, tasks, userVersion, fkViolations }, null, 2));
  db.close();
})().catch(error => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
