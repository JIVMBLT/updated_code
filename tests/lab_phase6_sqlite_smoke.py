#!/usr/bin/env python3
from pathlib import Path
import sqlite3

ROOT=Path(__file__).resolve().parents[1]
SCHEMA=ROOT/'lab/database/schema.sql'
SEED=ROOT/'lab/database/seed.sql'
M4=ROOT/'lab/database/migrations/004_permissions_catalog.sql'
M5=ROOT/'lab/database/migrations/005_shared_services.sql'
M6=ROOT/'lab/database/migrations/006_home_services.sql'
for path in (SCHEMA,SEED,M4,M5,M6):
    if not path.exists():
        raise SystemExit(f'Missing cumulative prerequisite: {path}')

con=sqlite3.connect(':memory:')
con.execute('PRAGMA foreign_keys=ON')
con.executescript(SCHEMA.read_text(encoding='utf-8'))
con.executescript(SEED.read_text(encoding='utf-8'))
before_tables=con.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").fetchone()[0]
con.executescript(M4.read_text(encoding='utf-8'))
con.executescript(M5.read_text(encoding='utf-8'))
con.executescript(M6.read_text(encoding='utf-8'))
after_tables=con.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").fetchone()[0]
assert before_tables==after_tables==93,(before_tables,after_tables)
assert con.execute('PRAGMA user_version').fetchone()[0]==6
assert con.execute('PRAGMA foreign_key_check').fetchall()==[]
assert con.execute("SELECT COUNT(*) FROM pendientes WHERE id_pendiente=950002 AND tipo_pendiente='COLABORATIVA'").fetchone()[0]==1
assert con.execute("SELECT COUNT(*) FROM pendientes_usuarios WHERE id_pendiente=950002 AND iniciales_usuario='L06' AND tipo_relacion='RESPONSABLE'").fetchone()[0]>=1
assert con.execute("SELECT COUNT(*) FROM sup_notificaciones WHERE id_usuario=910006 AND clave_deduplicacion='LAB_PHASE6_V002_TASK_COMMENT_910006_950002'").fetchone()[0]==1
# El evento de comentario tiene una relación de matriz sintética para el rol Programador (6).
assert con.execute("SELECT COUNT(*) FROM notificacion_evento_roles WHERE codigo_evento='tareas.comentario.creado' AND id_rol=6 AND activo=1").fetchone()[0]>=1
# La identidad 910006 conserva el rol 6 activo.
assert con.execute("SELECT COUNT(*) FROM usuario_roles WHERE id_usuario=910006 AND id_rol=6 AND activo=1").fetchone()[0]>=1
print('FASE 6 SQLite smoke: OK')
print('tables',after_tables)
print('user_version',con.execute('PRAGMA user_version').fetchone()[0])
print('tasks',con.execute('SELECT COUNT(*) FROM pendientes').fetchone()[0])
print('notifications',con.execute('SELECT COUNT(*) FROM sup_notificaciones').fetchone()[0])
print('fk_violations',len(con.execute('PRAGMA foreign_key_check').fetchall()))
