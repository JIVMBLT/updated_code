#!/usr/bin/env python3
"""Static SQL validation for LAB DGB Phase 1 V002 using Python sqlite3."""
import json
import pathlib
import re
import sqlite3

ROOT = pathlib.Path(__file__).resolve().parents[1]
SCHEMA = ROOT / 'lab/database/schema.sql'
SEED = ROOT / 'lab/database/seed.sql'
VERSION = ROOT / 'lab/database/version.json'

version = json.loads(VERSION.read_text(encoding='utf-8'))
con = sqlite3.connect(':memory:')
con.executescript(SCHEMA.read_text(encoding='utf-8'))
con.executescript(SEED.read_text(encoding='utf-8'))
con.execute('PRAGMA foreign_keys=ON')

tables = [r[0] for r in con.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")]
columns = sum(len(con.execute(f'PRAGMA table_xinfo(`{table}`)').fetchall()) for table in tables)
indexes = con.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%'").fetchone()[0]
seed_text = SEED.read_text(encoding='utf-8')
seed_tables = set(re.findall(r'INSERT INTO `([^`]+)`', seed_text))
seed_rows = sum(con.execute(f'SELECT COUNT(*) FROM `{table}`').fetchone()[0] for table in seed_tables)
fk_violations = con.execute('PRAGMA foreign_key_check').fetchall()
user_version = con.execute('PRAGMA user_version').fetchone()[0]

assert len(tables) == version['tables'], (len(tables), version['tables'])
assert columns == version['columns'], (columns, version['columns'])
assert indexes == version['indexes'], (indexes, version['indexes'])
assert len(seed_tables) == version['seeded_tables'], (len(seed_tables), version['seeded_tables'])
assert seed_rows == version['seed_rows'], (seed_rows, version['seed_rows'])
assert user_version == version['schema_version'], (user_version, version['schema_version'])
assert not fk_violations, fk_violations[:20]
assert con.execute('SELECT COUNT(*) FROM usuarios').fetchone()[0] == 61
assert con.execute('SELECT COUNT(*) FROM cobranza_proyectos').fetchone()[0] == 15
assert con.execute('SELECT COUNT(*) FROM portafolio').fetchone()[0] == 15
assert con.execute('SELECT COUNT(*) FROM tickets').fetchone()[0] == 30
assert con.execute('SELECT COUNT(*) FROM pendientes').fetchone()[0] == 20
assert con.execute('SELECT COUNT(*) FROM servicios_preventivos').fetchone()[0] == 30
for table in ('auth_audit', 'auth_sessions', 'notificaciones_push_suscripciones', 'usuarios_dispositivos', 'usuario_google_oauth'):
    assert con.execute(f'SELECT COUNT(*) FROM `{table}`').fetchone()[0] == 0, table
sample = con.execute('SELECT diferencia, valor_diferencia FROM almacen_auditoria WHERE id_auditoria=976001').fetchone()
assert sample == (-2.0, -320.0), sample

print('OK LAB PHASE 1 V002 / PYTHON SQLITE')
print(json.dumps({
    'tables': len(tables),
    'columns': columns,
    'indexes': indexes,
    'seeded_tables': len(seed_tables),
    'seed_rows': seed_rows,
    'foreign_key_violations': len(fk_violations),
    'user_version': user_version
}, indent=2))
