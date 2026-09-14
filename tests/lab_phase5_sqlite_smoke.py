#!/usr/bin/env python3
from pathlib import Path
import sqlite3

ROOT=Path(__file__).resolve().parents[1]
conn=sqlite3.connect(':memory:')
conn.executescript((ROOT/'lab/database/schema.sql').read_text(encoding='utf-8'))
conn.executescript((ROOT/'lab/database/seed.sql').read_text(encoding='utf-8'))
conn.executescript((ROOT/'lab/database/migrations/004_permissions_catalog.sql').read_text(encoding='utf-8'))
conn.executescript((ROOT/'lab/database/migrations/005_shared_services.sql').read_text(encoding='utf-8'))

assert conn.execute('PRAGMA user_version').fetchone()[0]==5
assert len(conn.execute('PRAGMA foreign_key_check').fetchall())==0
assert conn.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='permisos'").fetchone()[0]==0

checks={
    'usuarios':61,
    'portafolio':15,
    'tickets':30,
    'perm_subelemento_acciones':510,
    'rol_permisos':14669,
}
for table,expected in checks.items():
    actual=conn.execute(f'SELECT COUNT(*) FROM {table}').fetchone()[0]
    assert actual==expected,(table,actual,expected)

assert conn.execute('SELECT COUNT(*) FROM roles WHERE estado=1').fetchone()[0]>0
assert conn.execute('SELECT COUNT(*) FROM z_op WHERE estado=1').fetchone()[0]>0
assert conn.execute('SELECT COUNT(*) FROM preguntas_seguridad WHERE estado=1').fetchone()[0]>0
assert conn.execute('SELECT COUNT(*) FROM usuarios_rel_admin').fetchone()[0]>0
assert conn.execute('SELECT COUNT(DISTINCT proyecto) FROM portafolio WHERE estado_registro=1').fetchone()[0]>0

print('FASE5_V002_SQLITE_OK',checks)
