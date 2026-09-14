#!/usr/bin/env python3
from pathlib import Path
import sqlite3
ROOT=Path(__file__).resolve().parents[1]
files=[ROOT/'lab/database/schema.sql',ROOT/'lab/database/seed.sql']+[ROOT/f'lab/database/migrations/{name}' for name in [
'004_permissions_catalog.sql','005_shared_services.sql','006_home_services.sql','007_operation_portfolio.sql','008_sales_collections.sql','009_installations_logistics_warehouse.sql','010_technical_closure.sql']]
con=sqlite3.connect(':memory:');con.execute('PRAGMA foreign_keys=ON')
for file in files: con.executescript(file.read_text(encoding='utf-8'))
tables=con.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").fetchone()[0]
version=con.execute('PRAGMA user_version').fetchone()[0]
fk=con.execute('PRAGMA foreign_key_check').fetchall()
assert tables==93,tables
assert version==10,version
assert fk==[],fk[:10]
assert con.execute('SELECT COUNT(*) FROM ins_fl WHERE activo=1').fetchone()[0]==15
assert con.execute('SELECT COUNT(*) FROM logistica_produccion WHERE activo=1').fetchone()[0]==10
assert con.execute('SELECT COUNT(*) FROM almacen_fuente_excel WHERE activo=1').fetchone()[0]==20
migration=(ROOT/'lab/database/migrations/010_technical_closure.sql').read_text(encoding='utf-8').upper()
for token in ('CREATE TABLE','ALTER TABLE','DROP TABLE','CREATE INDEX','DROP INDEX'):
    assert token not in migration,token
print('FASE 10 SQLite smoke: OK')
print('tables',tables)
print('user_version',version)
print('fk_violations',len(fk))
