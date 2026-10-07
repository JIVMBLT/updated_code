-- [Claude | 2026-10-06 | CLAUDE-MG | LAB DGB - DUMMY 2 PROYECTOS INSTALACIONES EJEMPLO V001]
-- Datos FICTICIOS para ver visualmente la ficha de proyecto de Instalaciones:
-- informacion general, avance, Bitacora de Obra (documentos de varios tipos,
-- subcarpetas y fechas), Contactos del proyecto (3 categorias) y envios previos.
-- Es migracion y no solo seed.sql porque (a) instalaciones_contactos se crea en la
-- migracion 012, posterior al seed, y (b) asi llega tambien a las bases LAB ya
-- inicializadas en el navegador. Idempotente (INSERT OR IGNORE con IDs fijos).
-- Rangos de ID: ins_fl 966101-966102, carpetas 967101-967102, proyecto_drive
-- 968101-968102, proyecto_usuarios 968601-968604, documentos 968901-968915,
-- contactos 969001-969012, envios 969501-969502.

INSERT OR IGNORE INTO `ins_fl` (`id_ins_fl`,`proyecto`,`id_proyecto`,`referencia_sitio`,`estatus`,`fecha_visita`,`comentarios_fl`,`avance_oc`,`avance_mo`,`avance_aj`,`numero_pisos`,`numero_desembarques`,`numero_puertas`,`velocidad_ms`,`capacidad_kg`,`fecha_cpvp`,`estatus_produccion`,`fecha_descarga`,`fecha_ccnr`,`subcontratista`,`fecha_inicio_montaje`,`fecha_fin_montaje_planeado`,`dias_restantes`,`estatus_inspeccion_calidad`,`pendientes_calidad`,`estado`,`supervisor_fl`,`ciudad`,`condiciones_obra`,`vendedor`,`cliente`,`id_sup`,`id_asesor`,`id_admin`,`activo`) VALUES
 (966101,'LAB - TORRE ALAMEDA','PPNS-LAB-0101','Torre Alameda - Elevador 1','02-OC','2026-10-01','Proyecto de ejemplo ficticio: torre de oficinas con 2 elevadores. Obra civil avanzada, montaje en curso.','72','45','10','22','22','22','2.5','1000','2026-07-15','EN PROCESO LAB','2026-09-12','2026-09-26','Montajes Demo LAB SA','2026-09-14','2026-11-20','45','Con Pendientes','Falta nivelacion de cabina; revisar holguras de puerta en nivel 12.','Ciudad de México','Usuario LAB Supervisor 2','Ciudad de México','Obra con acceso restringido en horario laboral; descarga solo por la noche.','Asesor LAB','Desarrolladora Alameda LAB SA de CV',910051,910039,910037,1),
 (966102,'LAB - PLAZA CENTRO SUR','PPNS-LAB-0102','Plaza Centro Sur - Escalera 3','03-PM','2026-09-29','Proyecto de ejemplo ficticio: centro comercial con 4 escaleras electricas. Montaje casi concluido.','100','86','40','3','3','4','0.5','','2026-06-10','EN PROCESO LAB','2026-08-18','2026-09-02','Instalaciones Demo LAB SA','2026-08-25','2026-10-30','24','Sin Pendientes',NULL,'Jalisco','Usuario LAB Supervisor 3','Guadalajara','Obra civil entregada y liberada.','Asesor LAB','Operadora Centro Sur LAB SA de CV',910051,910039,910037,1);

INSERT OR IGNORE INTO `instalaciones_drive_carpetas` (`id_carpeta`,`nombre_carpeta`,`carpeta_id`,`enlace`,`activo`,`fecha_sincronizacion`,`created_by`,`updated_by`) VALUES
 (967101,'LAB - TORRE ALAMEDA','DRIVE-LAB-FOLDER-0101','https://example.invalid/lab/drive/folder/0101',1,'2026-10-05 18:30:00',910037,910006),
 (967102,'LAB - PLAZA CENTRO SUR','DRIVE-LAB-FOLDER-0102','https://example.invalid/lab/drive/folder/0102',1,'2026-10-05 18:30:00',910037,910006);

INSERT OR IGNORE INTO `instalaciones_proyecto_drive` (`id_proyecto_drive`,`id_proyecto`,`nombre_proyecto`,`id_carpeta`,`activo`,`created_by`,`updated_by`) VALUES
 (968101,'PPNS-LAB-0101','LAB - TORRE ALAMEDA',967101,1,910037,910006),
 (968102,'PPNS-LAB-0102','LAB - PLAZA CENTRO SUR',967102,1,910037,910006);

INSERT OR IGNORE INTO `instalaciones_proyecto_usuarios` (`id_proyecto_usuario`,`id_proyecto_drive`,`id_usuario`,`tipo`,`activo`) VALUES
 (968601,968101,910051,'SUPERVISOR',1),
 (968602,968101,910039,'ASESOR',1),
 (968603,968102,910051,'SUPERVISOR',1),
 (968604,968102,910039,'ASESOR',1);

-- Bitacora de Obra: documentos de varios tipos (pdf, xlsx, docx, imagen) y subcarpetas.
INSERT OR IGNORE INTO `instalaciones_bitacora_documentos` (`id_documento`,`id_proyecto`,`carpeta_raiz_id`,`drive_file_id`,`drive_parent_folder_id`,`nombre_archivo`,`ruta_carpeta`,`mime_type`,`web_view_link`,`fecha_creacion_drive`,`fecha_modificacion_drive`,`fecha_primera_deteccion`,`fecha_ultima_deteccion`,`estatus`,`detectado_por_usuario`) VALUES
 (968901,'PPNS-LAB-0101','DRIVE-LAB-FOLDER-0101','DRIVE-LAB-FILE-0101-01','DRIVE-LAB-FOLDER-0101','CCNR ELE LAB (03-OCT-26).pdf','SUPERVISION 2026','application/pdf','https://example.invalid/lab/drive/file/0101-01','2026-10-03 09:10:00','2026-10-03 09:10:00','2026-10-03 18:00:00','2026-10-05 18:30:00','activo',910037),
 (968902,'PPNS-LAB-0101','DRIVE-LAB-FOLDER-0101','DRIVE-LAB-FILE-0101-02','DRIVE-LAB-FOLDER-0101','CCNR ELE LAB (19-SEP-26).pdf','SUPERVISION 2026','application/pdf','https://example.invalid/lab/drive/file/0101-02','2026-09-19 10:00:00','2026-09-19 10:00:00','2026-09-19 18:00:00','2026-10-05 18:30:00','activo',910037),
 (968903,'PPNS-LAB-0101','DRIVE-LAB-FOLDER-0101','DRIVE-LAB-FILE-0101-03','DRIVE-LAB-FOLDER-0101','Minuta de Obra (12-SEP-26).pdf','SUPERVISION 2026','application/pdf','https://example.invalid/lab/drive/file/0101-03','2026-09-12 16:20:00','2026-09-12 16:20:00','2026-09-13 08:00:00','2026-10-05 18:30:00','activo',910037),
 (968904,'PPNS-LAB-0101','DRIVE-LAB-FOLDER-0101','DRIVE-LAB-FILE-0101-04','DRIVE-LAB-FOLDER-0101','Acta Descarga ELE LAB (12-SEP-26).pdf','LOGISTICA','application/pdf','https://example.invalid/lab/drive/file/0101-04','2026-09-12 23:40:00','2026-09-12 23:40:00','2026-09-13 08:00:00','2026-10-05 18:30:00','activo',910037),
 (968905,'PPNS-LAB-0101','DRIVE-LAB-FOLDER-0101','DRIVE-LAB-FILE-0101-05','DRIVE-LAB-FOLDER-0101','Packing List ELE LAB (05-SEP-26).xlsx','LOGISTICA','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','https://example.invalid/lab/drive/file/0101-05','2026-09-05 11:00:00','2026-09-06 09:30:00','2026-09-06 18:00:00','2026-10-05 18:30:00','activo',910037),
 (968906,'PPNS-LAB-0101','DRIVE-LAB-FOLDER-0101','DRIVE-LAB-FILE-0101-06','DRIVE-LAB-FOLDER-0101','Condiciones de Obra Civil (20-AGO-26).docx','OBRA CIVIL','application/vnd.openxmlformats-officedocument.wordprocessingml.document','https://example.invalid/lab/drive/file/0101-06','2026-08-20 13:15:00','2026-08-21 10:00:00','2026-08-21 18:00:00','2026-10-05 18:30:00','activo',910037),
 (968907,'PPNS-LAB-0101','DRIVE-LAB-FOLDER-0101','DRIVE-LAB-FILE-0101-07','DRIVE-LAB-FOLDER-0101','Evidencia Cubo Nivel 12 (01-OCT-26).jpg','FOTOS','image/jpeg','https://example.invalid/lab/drive/file/0101-07','2026-10-01 12:05:00','2026-10-01 12:05:00','2026-10-01 18:00:00','2026-10-05 18:30:00','activo',910037),
 (968908,'PPNS-LAB-0101','DRIVE-LAB-FOLDER-0101','DRIVE-LAB-FILE-0101-08','DRIVE-LAB-FOLDER-0101','Obra Civil ELE LAB (14-JUL-26).pdf','OBRA CIVIL','application/pdf','https://example.invalid/lab/drive/file/0101-08','2026-07-14 15:00:00','2026-07-14 15:00:00','2026-07-15 08:00:00','2026-10-05 18:30:00','activo',910037),
 (968909,'PPNS-LAB-0101','DRIVE-LAB-FOLDER-0101','DRIVE-LAB-FILE-0101-09','DRIVE-LAB-FOLDER-0101','Borrador Minuta (retirado).pdf','SUPERVISION 2026','application/pdf','https://example.invalid/lab/drive/file/0101-09','2026-08-02 10:00:00','2026-08-02 10:00:00','2026-08-03 08:00:00','2026-09-20 18:30:00','eliminado',910037),
 (968910,'PPNS-LAB-0102','DRIVE-LAB-FOLDER-0102','DRIVE-LAB-FILE-0102-01','DRIVE-LAB-FOLDER-0102','CCNR ESC LAB (30-SEP-26).pdf','SUPERVISION 2026','application/pdf','https://example.invalid/lab/drive/file/0102-01','2026-09-30 09:00:00','2026-09-30 09:00:00','2026-09-30 18:00:00','2026-10-05 18:30:00','activo',910037),
 (968911,'PPNS-LAB-0102','DRIVE-LAB-FOLDER-0102','DRIVE-LAB-FILE-0102-02','DRIVE-LAB-FOLDER-0102','CCNR ESC LAB (16-SEP-26).pdf','SUPERVISION 2026','application/pdf','https://example.invalid/lab/drive/file/0102-02','2026-09-16 09:30:00','2026-09-16 09:30:00','2026-09-16 18:00:00','2026-10-05 18:30:00','activo',910037),
 (968912,'PPNS-LAB-0102','DRIVE-LAB-FOLDER-0102','DRIVE-LAB-FILE-0102-03','DRIVE-LAB-FOLDER-0102','Minuta de Ajuste (22-SEP-26).pdf','SUPERVISION 2026','application/pdf','https://example.invalid/lab/drive/file/0102-03','2026-09-22 17:45:00','2026-09-22 17:45:00','2026-09-23 08:00:00','2026-10-05 18:30:00','activo',910037),
 (968913,'PPNS-LAB-0102','DRIVE-LAB-FOLDER-0102','DRIVE-LAB-FILE-0102-04','DRIVE-LAB-FOLDER-0102','Acta Descarga ESC LAB (18-AGO-26).pdf','LOGISTICA','application/pdf','https://example.invalid/lab/drive/file/0102-04','2026-08-18 22:10:00','2026-08-18 22:10:00','2026-08-19 08:00:00','2026-10-05 18:30:00','activo',910037),
 (968914,'PPNS-LAB-0102','DRIVE-LAB-FOLDER-0102','DRIVE-LAB-FILE-0102-05','DRIVE-LAB-FOLDER-0102','Protocolo de Pruebas (28-SEP-26).docx','AJUSTE','application/vnd.openxmlformats-officedocument.wordprocessingml.document','https://example.invalid/lab/drive/file/0102-05','2026-09-28 14:00:00','2026-09-29 08:20:00','2026-09-29 18:00:00','2026-10-05 18:30:00','activo',910037),
 (968915,'PPNS-LAB-0102','DRIVE-LAB-FOLDER-0102','DRIVE-LAB-FILE-0102-06','DRIVE-LAB-FOLDER-0102','Evidencia Peldanos (24-SEP-26).jpg','FOTOS','image/jpeg','https://example.invalid/lab/drive/file/0102-06','2026-09-24 11:20:00','2026-09-24 11:20:00','2026-09-24 18:00:00','2026-10-05 18:30:00','activo',910037);

-- Contactos: proyecto 0101 con las 3 categorias; proyecto 0102 solo con 2
-- (la tercera queda sin contactos para ver el estado deshabilitado del envio).
-- Categorias exactas del CHECK de instalaciones_contactos.
INSERT OR IGNORE INTO `instalaciones_contactos` (`id_contacto`,`nombre`,`puesto`,`correo`,`telefono`,`categoria`,`id_ins_fl`,`activo`,`created_by`,`updated_by`) VALUES
 (969001,'Laura Mendoza Rivas','Gerente de Administración','laura.mendoza@alameda-lab.invalid','55 5555 0101','Administración y Cobranza',966101,1,910037,910037),
 (969002,'Jorge Salinas Ortega','Cuentas por Pagar','jorge.salinas@alameda-lab.invalid','55 5555 0102','Administración y Cobranza',966101,1,910037,910037),
 (969003,'Patricia Vega Luna','Residente de Obra','patricia.vega@alameda-lab.invalid','55 5555 0103','Notificaciones de Avance de Materiales, Obra y/o Instalaciones',966101,1,910037,910037),
 (969004,'Ricardo Téllez Cruz','Superintendente','ricardo.tellez@alameda-lab.invalid','55 5555 0104','Notificaciones de Avance de Materiales, Obra y/o Instalaciones',966101,1,910037,910037),
 (969005,'Mariana Soto Pineda','Coordinadora de Proyecto','mariana.soto@alameda-lab.invalid','55 5555 0105','Notificaciones de Avance de Materiales, Obra y/o Instalaciones',966101,1,910037,910037),
 (969006,'Ing. Héctor Ramírez Beltrán','Director de Proyecto','hector.ramirez@alameda-lab.invalid','55 5555 0106','Comunicados Críticos',966101,1,910037,910037),
 (969007,'Sofía Ibarra Nava','Asistente de Dirección',NULL,'55 5555 0107','Comunicados Críticos',966101,1,910037,910037),
 (969008,'Alberto Franco Díaz','Administrador General','alberto.franco@centrosur-lab.invalid','33 3333 0201','Administración y Cobranza',966102,1,910037,910037),
 (969009,'Gabriela Reyes Montes','Contabilidad','gabriela.reyes@centrosur-lab.invalid','33 3333 0202','Administración y Cobranza',966102,1,910037,910037),
 (969010,'Daniel Cárdenas Pérez','Jefe de Mantenimiento','daniel.cardenas@centrosur-lab.invalid','33 3333 0203','Notificaciones de Avance de Materiales, Obra y/o Instalaciones',966102,1,910037,910037),
 (969011,'Lucía Herrera Ponce','Supervisora de Obra','lucia.herrera@centrosur-lab.invalid','33 3333 0204','Notificaciones de Avance de Materiales, Obra y/o Instalaciones',966102,1,910037,910037),
 (969012,'Tomás Aguirre Solís','Coordinador de Seguridad',NULL,'33 3333 0205','Notificaciones de Avance de Materiales, Obra y/o Instalaciones',966102,1,910037,910037);

-- Envios previos (simulados) para ver "Ultimo envio" en la Bitacora.
INSERT OR IGNORE INTO `instalaciones_bitacora_envios` (`id_envio`,`id_documento`,`id_proyecto`,`categorias`,`destinatarios`,`total_destinatarios`,`enviado_por`,`fecha_envio`) VALUES
 (969501,968902,'PPNS-LAB-0101','["Administración y Cobranza"]','[{"id_contacto":969001,"nombre":"Laura Mendoza Rivas","correo":"laura.mendoza@alameda-lab.invalid","categoria":"Administración y Cobranza"},{"id_contacto":969002,"nombre":"Jorge Salinas Ortega","correo":"jorge.salinas@alameda-lab.invalid","categoria":"Administración y Cobranza"}]',2,910037,'2026-09-20 10:15:00'),
 (969502,968901,'PPNS-LAB-0101','["Notificaciones de Avance de Materiales, Obra y/o Instalaciones","Comunicados Críticos"]','[{"id_contacto":969003,"nombre":"Patricia Vega Luna","correo":"patricia.vega@alameda-lab.invalid","categoria":"Notificaciones de Avance de Materiales, Obra y/o Instalaciones"},{"id_contacto":969004,"nombre":"Ricardo Téllez Cruz","correo":"ricardo.tellez@alameda-lab.invalid","categoria":"Notificaciones de Avance de Materiales, Obra y/o Instalaciones"},{"id_contacto":969005,"nombre":"Mariana Soto Pineda","correo":"mariana.soto@alameda-lab.invalid","categoria":"Notificaciones de Avance de Materiales, Obra y/o Instalaciones"},{"id_contacto":969006,"nombre":"Ing. Héctor Ramírez Beltrán","correo":"hector.ramirez@alameda-lab.invalid","categoria":"Comunicados Críticos"}]',4,910037,'2026-10-04 08:40:00');
