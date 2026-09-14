#!/usr/bin/env python3
from pathlib import Path
import sqlite3

ROOT=Path(__file__).resolve().parents[1]
conn=sqlite3.connect(':memory:')
conn.executescript((ROOT/'lab/database/schema.sql').read_text(encoding='utf-8'))
conn.executescript((ROOT/'lab/database/seed.sql').read_text(encoding='utf-8'))
conn.executescript((ROOT/'lab/database/migrations/004_permissions_catalog.sql').read_text(encoding='utf-8'))
expected={
    'perm_acciones':44,
    'perm_agrupaciones':14,
    'perm_modulos':64,
    'perm_elementos':129,
    'perm_subelementos':232,
    'perm_subelemento_acciones':510,
    'rol_permisos':14669,
}
for table,count in expected.items():
    actual=conn.execute(f'SELECT COUNT(*) FROM {table}').fetchone()[0]
    assert actual==count,(table,actual,count)
assert conn.execute('PRAGMA user_version').fetchone()[0]==4
assert len(conn.execute('PRAGMA foreign_key_check').fetchall())==0
print('FASE4_V002_SQLITE_OK',expected)
