#!/usr/bin/env python3
from pathlib import Path
import sqlite3, json
ROOT=Path(__file__).resolve().parents[1]
paths=[
 ROOT/'lab/database/schema.sql', ROOT/'lab/database/seed.sql',
 ROOT/'lab/database/migrations/004_permissions_catalog.sql',
 ROOT/'lab/database/migrations/005_shared_services.sql',
 ROOT/'lab/database/migrations/006_home_services.sql',
 ROOT/'lab/database/migrations/007_operation_portfolio.sql'
]
for path in paths:
    if not path.exists(): raise SystemExit(f'Missing cumulative prerequisite: {path}')
con=sqlite3.connect(':memory:')
con.execute('PRAGMA foreign_keys=ON')
for path in paths: con.executescript(path.read_text(encoding='utf-8'))
tables=con.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").fetchone()[0]
assert tables==93,tables
assert con.execute('PRAGMA user_version').fetchone()[0]==7
assert con.execute('PRAGMA foreign_key_check').fetchall()==[]
assert con.execute('SELECT COUNT(*) FROM portafolio').fetchone()[0]==15
assert con.execute('SELECT COUNT(*) FROM tickets').fetchone()[0]==40
assert con.execute('SELECT COUNT(*) FROM servicios_preventivos').fetchone()[0]==30
assert con.execute("SELECT estatus_cobranza FROM portafolio WHERE id_portafolio=930001").fetchone()[0]=='Gratuito'
assert con.execute("SELECT estatus_ul_mes,estatus_servicio FROM portafolio WHERE id_portafolio=930002").fetchone()==('En Servicio','No en Servicio')
assert con.execute("SELECT estatus_ul_mes,estatus_servicio FROM portafolio WHERE id_portafolio=930003").fetchone()==('No en Servicio','En Servicio')
assert con.execute("SELECT estatus_ul_mes,estatus_servicio FROM portafolio WHERE id_portafolio=930004").fetchone()==('No en Servicio','Mantenimiento')
blt=con.execute("SELECT COUNT(*) FROM tickets WHERE codigo_equipo='99001-LAB-ESC-DGB' AND UPPER(TRIM(COALESCE(responsabilidad,'')))='BLT' AND fecha_reporte>='2026-08-10'").fetchone()[0]
assert blt>=5,blt
cut=con.execute('SELECT snapshot_json,movimientos_json,total_movimientos,total_salidas,total_regresos,total_cambios FROM portafolio_cortes_semanales WHERE id_corte=978001').fetchone()
snapshot=json.loads(cut[0]); moves=json.loads(cut[1])
assert all(int(row.get('zona_id',0))>0 for row in snapshot),snapshot
assert all(int(row.get('zona_id',0))>0 for row in moves),moves
assert {row['tipo_movimiento'] for row in moves}=={'DEGRADADO','RECUPERADO','CAMBIO'}
assert cut[2:]==(3,1,1,1)
print('FASE 7 SQLite smoke: OK')
print('tables',tables)
print('user_version',con.execute('PRAGMA user_version').fetchone()[0])
print('portfolio',con.execute('SELECT COUNT(*) FROM portafolio').fetchone()[0])
print('tickets',con.execute('SELECT COUNT(*) FROM tickets').fetchone()[0])
print('preventives',con.execute('SELECT COUNT(*) FROM servicios_preventivos').fetchone()[0])
print('blt_99001',blt)
print('fk_violations',len(con.execute('PRAGMA foreign_key_check').fetchall()))
