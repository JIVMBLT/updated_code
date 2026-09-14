-- [Aster | 2026-09-13 | ASTER-MG | LAB DGB FASE 7 V002]
-- Operacion + Portafolio V002. Solo datos sinteticos del laboratorio.
-- No crea tablas de produccion ni altera contratos reales.

PRAGMA foreign_keys = ON;

-- El Dashboard Portafolio real clasifica Gratuito/Garantia solo cuando
-- estatus_cobranza = 'Gratuito'. Se normalizan exclusivamente fixtures LAB.
UPDATE portafolio
SET estatus_cobranza = 'Gratuito', updated_at = CURRENT_TIMESTAMP
WHERE id_portafolio BETWEEN 930001 AND 930015
  AND (TRIM(COALESCE(estatus_cobranza,'')) = 'Garantía' OR UPPER(TRIM(COALESCE(estatus_cobranza,''))) = 'GARANTIA');

-- Los fixtures LAB previos usaban 'Funcionando' como estatus_servicio. El backend real de
-- Movimientos considera 'En Servicio'/'Servicio' para determinar altas y recuperaciones.
UPDATE portafolio
SET estatus_servicio = 'En Servicio', updated_at = CURRENT_TIMESTAMP
WHERE id_portafolio BETWEEN 930001 AND 930015
  AND UPPER(TRIM(COALESCE(estatus_servicio,''))) = 'FUNCIONANDO';

UPDATE portafolio
SET estatus_ul_mes = 'En Servicio', updated_at = CURRENT_TIMESTAMP
WHERE id_portafolio BETWEEN 930001 AND 930015
  AND UPPER(TRIM(COALESCE(estatus_ul_mes,''))) = 'FUNCIONANDO';

-- Escenarios sinteticos de movimientos mensuales.
UPDATE portafolio SET estatus_ul_mes='En Servicio', estatus_ul_mes_fecha='2026-09-01', estatus_servicio='No en Servicio', updated_at=CURRENT_TIMESTAMP WHERE id_portafolio=930002;
UPDATE portafolio SET estatus_ul_mes='No en Servicio', estatus_ul_mes_fecha='2026-09-01', estatus_servicio='En Servicio', updated_at=CURRENT_TIMESTAMP WHERE id_portafolio=930003;
UPDATE portafolio SET estatus_ul_mes='No en Servicio', estatus_ul_mes_fecha='2026-09-01', estatus_servicio='Mantenimiento', updated_at=CURRENT_TIMESTAMP WHERE id_portafolio=930004;

-- Fallas adicionales 100% sinteticas para ejercitar Criticos/MTBC.
INSERT OR IGNORE INTO tickets
(id,ticket,id_interno,folio,estado_ticket,estado,ciudad,proyecto,equipo,codigo_equipo,referencia_en_zona_operativa,zona,descripcion,fecha_reporte,h_reporte,estatus_equipo_ir,fecha_llegada,h_llegada,persona_que_atiende,fecha_cierre,h_solucion,tecnico,supervisor,estatus_equipo_final,causa,accion_en_cierre,responsabilidad,causa_falla,tiempo_llegada,tiempo_solucion,tipo_equipo,prioridad,ejecutivo_call,tiempo_llegada_ii,tiempo_solucion_ii,blt_empleado,ticket_excede,zona_administrativa,zona_de_falla,mes_reporte,proyecto_padre,vobo_estado,vobo_comentario,creado_en,actualizado_en)
VALUES
(947001,'TKT-LAB-947001','LAB-947001','LAB-947001','Cerrado','Nuevo Leon','Monterrey','LAB - PUNTO VALLE','99001-LAB-ESC-DGB','99001-LAB-ESC-DGB','Acceso LAB A','CNB-01','LAB falla BLT adicional 1','2026-08-25 08:20:00','08:20','No Funcionando','2026-08-25','09:05','Recepcion LAB','2026-08-25','10:10','Tecnico LAB A','Supervisor LAB CNB','Funcionando','Sensor','Ajuste de sensor','BLT','Inherente equipo',0.75,1.08,'ESCALERA','ALTA','Call LAB',0.75,1.08,'Empleado LAB','NO','LAB ADM','LAB FALLA','2026-08','LAB - PUNTO VALLE','VALIDADO','Fixture LAB','2026-08-25 08:20:00','2026-08-25 10:10:00'),
(947002,'TKT-LAB-947002','LAB-947002','LAB-947002','Cerrado','Nuevo Leon','Monterrey','LAB - PUNTO VALLE','99001-LAB-ESC-DGB','99001-LAB-ESC-DGB','Acceso LAB A','CNB-01','LAB falla BLT adicional 2','2026-08-30 11:10:00','11:10','No Funcionando','2026-08-30','11:45','Recepcion LAB','2026-08-30','12:50','Tecnico LAB B','Supervisor LAB CNB','Funcionando','Variador','Reinicio control','BLT','Equipo',0.58,1.08,'ESCALERA','MEDIA','Call LAB',0.58,1.08,'Empleado LAB','NO','LAB ADM','LAB FALLA','2026-08','LAB - PUNTO VALLE','VALIDADO','Fixture LAB','2026-08-30 11:10:00','2026-08-30 12:50:00'),
(947003,'TKT-LAB-947003','LAB-947003','LAB-947003','Abierto','Ciudad de Mexico','CDMX','LAB - DURANGO 262','99003-LAB-ELE-DGB','99003-LAB-ELE-DGB','Lobby LAB','CNB-03','LAB falla BLT adicional 1','2026-08-26 07:40:00','07:40','No Funcionando','2026-08-26','08:20','Recepcion LAB',NULL,NULL,'Tecnico LAB C','Supervisor LAB CNB','No Funcionando','Puerta','Diagnostico','BLT','Inherente equipo',0.67,NULL,'ELEVADOR','CRITICA','Call LAB',0.67,NULL,'Empleado LAB','SI','LAB ADM','LAB FALLA','2026-08','LAB - DURANGO 262','PENDIENTE','Fixture LAB','2026-08-26 07:40:00','2026-08-26 08:20:00'),
(947004,'TKT-LAB-947004','LAB-947004','LAB-947004','Cerrado','Ciudad de Mexico','CDMX','LAB - DURANGO 262','99003-LAB-ELE-DGB','99003-LAB-ELE-DGB','Lobby LAB','CNB-03','LAB falla BLT adicional 2','2026-09-01 13:00:00','13:00','No Funcionando','2026-09-01','13:35','Recepcion LAB','2026-09-01','14:25','Tecnico LAB D','Supervisor LAB CNB','Funcionando','Operador puerta','Ajuste','BLT','BLT',0.58,0.83,'ELEVADOR','ALTA','Call LAB',0.58,0.83,'Empleado LAB','NO','LAB ADM','LAB FALLA','2026-09','LAB - DURANGO 262','VALIDADO','Fixture LAB','2026-09-01 13:00:00','2026-09-01 14:25:00'),
(947005,'TKT-LAB-947005','LAB-947005','LAB-947005','Cerrado','Baja California','Tijuana','LAB - AEROPUERTO TIJUANA','99004-LAB-MON-DGB','99004-LAB-MON-DGB','Anden LAB','CNA-01','LAB falla BLT adicional 1','2026-08-27 15:00:00','15:00','No Funcionando','2026-08-27','15:50','Recepcion LAB','2026-08-27','17:00','Tecnico LAB E','Supervisor LAB CNA','Funcionando','Contacto','Sustitucion','BLT','Equipo',0.83,1.17,'MONTACARGAS','ALTA','Call LAB',0.83,1.17,'Empleado LAB','NO','LAB ADM','LAB FALLA','2026-08','LAB - AEROPUERTO TIJUANA','VALIDADO','Fixture LAB','2026-08-27 15:00:00','2026-08-27 17:00:00'),
(947006,'TKT-LAB-947006','LAB-947006','LAB-947006','Cerrado','Baja California','Tijuana','LAB - AEROPUERTO TIJUANA','99004-LAB-MON-DGB','99004-LAB-MON-DGB','Anden LAB','CNA-01','LAB falla BLT adicional 2','2026-09-02 10:30:00','10:30','No Funcionando','2026-09-02','11:15','Recepcion LAB','2026-09-02','12:00','Tecnico LAB F','Supervisor LAB CNA','Funcionando','Encoder','Ajuste','BLT','Inherente equipo',0.75,0.75,'MONTACARGAS','MEDIA','Call LAB',0.75,0.75,'Empleado LAB','NO','LAB ADM','LAB FALLA','2026-09','LAB - AEROPUERTO TIJUANA','VALIDADO','Fixture LAB','2026-09-02 10:30:00','2026-09-02 12:00:00'),
(947007,'TKT-LAB-947007','LAB-947007','LAB-947007','Cerrado','Jalisco','Guadalajara','LAB - AEROPUERTO GUADALAJARA','99005-LAB-ELE-DGB','99005-LAB-ELE-DGB','Terminal LAB','CNA-02','LAB falla BLT adicional 1','2026-08-28 09:00:00','09:00','No Funcionando','2026-08-28','09:40','Recepcion LAB','2026-08-28','10:45','Tecnico LAB G','Supervisor LAB CNA','Funcionando','Fotocelda','Limpieza','BLT','BLT',0.67,1.08,'ELEVADOR','ALTA','Call LAB',0.67,1.08,'Empleado LAB','NO','LAB ADM','LAB FALLA','2026-08','LAB - AEROPUERTO GUADALAJARA','VALIDADO','Fixture LAB','2026-08-28 09:00:00','2026-08-28 10:45:00'),
(947008,'TKT-LAB-947008','LAB-947008','LAB-947008','Cerrado','Jalisco','Guadalajara','LAB - AEROPUERTO GUADALAJARA','99005-LAB-ELE-DGB','99005-LAB-ELE-DGB','Terminal LAB','CNA-02','LAB falla BLT adicional 2','2026-09-03 16:20:00','16:20','No Funcionando','2026-09-03','17:00','Recepcion LAB','2026-09-03','18:00','Tecnico LAB H','Supervisor LAB CNA','Funcionando','Puerta','Ajuste','BLT','Equipo',0.67,1.00,'ELEVADOR','MEDIA','Call LAB',0.67,1.00,'Empleado LAB','NO','LAB ADM','LAB FALLA','2026-09','LAB - AEROPUERTO GUADALAJARA','VALIDADO','Fixture LAB','2026-09-03 16:20:00','2026-09-03 18:00:00');

INSERT OR IGNORE INTO tickets
(id,ticket,id_interno,folio,estado_ticket,estado,ciudad,proyecto,equipo,codigo_equipo,referencia_en_zona_operativa,zona,descripcion,fecha_reporte,h_reporte,estatus_equipo_ir,fecha_llegada,h_llegada,persona_que_atiende,fecha_cierre,h_solucion,tecnico,supervisor,estatus_equipo_final,causa,accion_en_cierre,responsabilidad,causa_falla,tiempo_llegada,tiempo_solucion,tipo_equipo,prioridad,ejecutivo_call,tiempo_llegada_ii,tiempo_solucion_ii,blt_empleado,ticket_excede,zona_administrativa,zona_de_falla,mes_reporte,proyecto_padre,vobo_estado,vobo_comentario,creado_en,actualizado_en)
VALUES
(947009,'TKT-LAB-947009','LAB-947009','LAB-947009','Cerrado','Nuevo Leon','Monterrey','LAB - PUNTO VALLE','99001-LAB-ESC-DGB','99001-LAB-ESC-DGB','Acceso LAB A','CNB-01','LAB falla BLT adicional 3','2026-09-01 08:00:00','08:00','No Funcionando','2026-09-01','08:35','Recepcion LAB','2026-09-01','09:20','Tecnico LAB I','Supervisor LAB CNB','Funcionando','Cadena','Ajuste','BLT','Equipo',0.58,0.75,'ESCALERA','MEDIA','Call LAB',0.58,0.75,'Empleado LAB','NO','LAB ADM','LAB FALLA','2026-09','LAB - PUNTO VALLE','VALIDADO','Fixture LAB','2026-09-01 08:00:00','2026-09-01 09:20:00'),
(947010,'TKT-LAB-947010','LAB-947010','LAB-947010','Cerrado','Nuevo Leon','Monterrey','LAB - PUNTO VALLE','99001-LAB-ESC-DGB','99001-LAB-ESC-DGB','Acceso LAB A','CNB-01','LAB falla BLT adicional 4','2026-09-02 14:00:00','14:00','No Funcionando','2026-09-02','14:40','Recepcion LAB','2026-09-02','15:30','Tecnico LAB J','Supervisor LAB CNB','Funcionando','Sensor','Ajuste','BLT','Inherente equipo',0.67,0.83,'ESCALERA','ALTA','Call LAB',0.67,0.83,'Empleado LAB','NO','LAB ADM','LAB FALLA','2026-09','LAB - PUNTO VALLE','VALIDADO','Fixture LAB','2026-09-02 14:00:00','2026-09-02 15:30:00');

-- Corte semanal LAB coherente con sus contadores y con zona_id canonica.
UPDATE portafolio_cortes_semanales
SET snapshot_json = '[{"id_portafolio":930001,"proyecto":"LAB - PUNTO VALLE","equipo":"99001-LAB-ESC-DGB","estatus_servicio":"En Servicio","zona_id":1,"zona":"CNB-01"},{"id_portafolio":930002,"proyecto":"LAB - MISTIQ TEMPLE II","equipo":"99002-LAB-RAM-DGB","estatus_servicio":"No en Servicio","zona_id":2,"zona":"CNB-02"},{"id_portafolio":930003,"proyecto":"LAB - DURANGO 262","equipo":"99003-LAB-ELE-DGB","estatus_servicio":"En Servicio","zona_id":3,"zona":"CNB-03"}]',
    movimientos_json = '[{"lab":true,"tipo_movimiento":"DEGRADADO","tipo":"DEGRADADO","numero_equipo":"99002-LAB-RAM-DGB","equipo":"99002-LAB-RAM-DGB","proyecto":"LAB - MISTIQ TEMPLE II","zona_id":2,"zona":"CNB-02","estatus_anterior":"En Servicio","estatus_actual":"No en Servicio","fecha_corte":"2026-09-13"},{"lab":true,"tipo_movimiento":"RECUPERADO","tipo":"RECUPERADO","numero_equipo":"99003-LAB-ELE-DGB","equipo":"99003-LAB-ELE-DGB","proyecto":"LAB - DURANGO 262","zona_id":3,"zona":"CNB-03","estatus_anterior":"No en Servicio","estatus_actual":"En Servicio","fecha_corte":"2026-09-13"},{"lab":true,"tipo_movimiento":"CAMBIO","tipo":"CAMBIO","numero_equipo":"99004-LAB-MON-DGB","equipo":"99004-LAB-MON-DGB","proyecto":"LAB - AEROPUERTO TIJUANA","zona_id":4,"zona":"CNA-01","estatus_anterior":"No en Servicio","estatus_actual":"Mantenimiento","fecha_corte":"2026-09-13"}]',
    total_portafolio = 15,
    total_movimientos = 3,
    total_salidas = 1,
    total_regresos = 1,
    total_cambios = 1,
    total_ingresos = 0,
    updated_at = CURRENT_TIMESTAMP
WHERE id_corte = 978001;

PRAGMA user_version = 7;
