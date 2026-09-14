#!/usr/bin/env python3
import sqlite3,pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1]; db=sqlite3.connect(':memory:')
db.executescript((ROOT/'lab/database/schema.sql').read_text())
db.executescript((ROOT/'lab/database/seed.sql').read_text())
for name in ['004_permissions_catalog.sql','005_shared_services.sql','006_home_services.sql','007_operation_portfolio.sql','008_sales_collections.sql','009_installations_logistics_warehouse.sql']: db.executescript((ROOT/'lab/database/migrations'/name).read_text())
tables=db.execute("select count(*) from sqlite_master where type='table' and name not like 'sqlite_%'").fetchone()[0]
assert tables==93,tables
assert db.execute('pragma user_version').fetchone()[0]==9
assert db.execute('select count(*) from ins_fl where activo=1').fetchone()[0]>=15
assert db.execute('select count(*) from logistica_produccion where activo=1').fetchone()[0]>=10
assert db.execute('select count(*) from almacen_fuente_excel where activo=1').fetchone()[0]>=20
assert not db.execute('pragma foreign_key_check').fetchall()
print('FASE 9 SQLite smoke: OK');print('tables',tables);print('user_version',9);print('installations',db.execute('select count(*) from ins_fl where activo=1').fetchone()[0]);print('logistics',db.execute('select count(*) from logistica_produccion where activo=1').fetchone()[0]);print('warehouse',db.execute('select count(*) from almacen_fuente_excel where activo=1').fetchone()[0]);print('fk_violations',0)
