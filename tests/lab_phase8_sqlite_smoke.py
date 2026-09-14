#!/usr/bin/env python3
from pathlib import Path
import sqlite3
ROOT=Path(__file__).resolve().parents[1]
paths=[
 ROOT/'lab/database/schema.sql', ROOT/'lab/database/seed.sql',
 ROOT/'lab/database/migrations/004_permissions_catalog.sql',
 ROOT/'lab/database/migrations/005_shared_services.sql',
 ROOT/'lab/database/migrations/006_home_services.sql',
 ROOT/'lab/database/migrations/007_operation_portfolio.sql',
 ROOT/'lab/database/migrations/008_sales_collections.sql'
]
for path in paths:
    if not path.exists(): raise SystemExit(f'Missing cumulative prerequisite: {path}')
con=sqlite3.connect(':memory:')
con.execute('PRAGMA foreign_keys=ON')
for path in paths: con.executescript(path.read_text(encoding='utf-8'))
tables=con.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").fetchone()[0]
assert tables==93,tables
assert con.execute('PRAGMA user_version').fetchone()[0]==8
assert con.execute('PRAGMA foreign_key_check').fetchall()==[]
expected={
 'ventas_clientes':10,
 'ventas_cotizaciones_cor':10,
 'ventas_prospecciones':10,
 'ventas_redes':10,
 'gestion_credito':15,
 'detalle_mp_2026':15,
 'cobranza_indice_cor':10,
 'cobranza_fuente_cor':20,
 'cobranza_aditivas_cor':10,
}
for table,count in expected.items():
    got=con.execute(f'SELECT COUNT(*) FROM {table}').fetchone()[0]
    assert got==count,(table,got,count)
# Migration is deliberately idempotent: reapply it and ensure fixtures do not duplicate.
before=con.execute("SELECT COUNT(*) FROM usuario_permisos WHERE motivo LIKE 'LAB F8 V002%'").fetchone()[0]
con.executescript((ROOT/'lab/database/migrations/008_sales_collections.sql').read_text(encoding='utf-8'))
after=con.execute("SELECT COUNT(*) FROM usuario_permisos WHERE motivo LIKE 'LAB F8 V002%'").fetchone()[0]
assert before==after,(before,after)
assert con.execute('PRAGMA user_version').fetchone()[0]==8
assert con.execute('PRAGMA foreign_key_check').fetchall()==[]
print('FASE 8 SQLite smoke: OK')
print('tables',tables)
print('user_version',con.execute('PRAGMA user_version').fetchone()[0])
for table,count in expected.items(): print(table,count)
print('fixture_permissions',after)
print('fk_violations',0)
