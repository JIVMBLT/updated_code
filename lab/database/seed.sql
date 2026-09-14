-- [Aster | 2026-09-13 | ASTER-MG | LAB DGB DUMMY DATA V002 - RESTART VALIDATED]
-- DATASET SINTETICO PARA JIVMBLT/updated_code
-- Basado en la estructura de Estructura Claude.sql y en la taxonomia funcional de SABANA270826.sql.
-- REGLA DE PRIVACIDAD: no se reutilizan personas, correos, telefonos, direcciones, clientes, importes, equipos, tickets ni IDs productivos.
-- EXCEPCION AUTORIZADA: los nombres de proyectos pueden hacer referencia a proyectos conocidos, SIEMPRE prefijados con "LAB -".
-- Los nombres/codigos de roles y zonas se conservan como catalogo funcional porque forman parte de las reglas del sistema, no de identidad personal.
--
-- Este archivo contiene SOLO INSERTS con sintaxis deliberadamente simple para facilitar su uso posterior en SQLite WASM.
-- El DDL MySQL de Estructura Claude.sql debe convertirse a SQLite por separado.
--
-- No ejecutar contra Aiven ni contra ninguna base productiva.


-- preguntas_seguridad: 1 registros
INSERT INTO `preguntas_seguridad` (`id_pregunta`, `pregunta`, `estado`, `created_by`, `updated_by`) VALUES
  (11, 'Ninguna - Laboratorio', 1, 'LAB', 'LAB');

-- roles: 61 registros
INSERT INTO `roles` (`id_rol`, `rol`, `codigo`, `descripcion`, `nivel`, `es_sistema`, `empresa`, `estado`, `created_by`, `updated_by`) VALUES
  (1, 'Director General', 'DIRECTOR_GENERAL', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (2, 'Director Mantenimiento', 'DIRECTOR_MANTENIMIENTO', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (3, 'Director Finanzas', 'DIRECTOR_FINANZAS', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (4, 'Director Instalaciones', 'DIRECTOR_INSTALACIONES', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (5, 'Director Ventas', 'DIRECTOR_VENTAS', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (6, 'Programador', 'PROGRAMADOR', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (7, 'Auxiliar Dirección', 'AUXILIAR_DIRECCION', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (8, 'Jefe de Calidad', 'JEFE_CALIDAD', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (9, 'Superintendente Mantenimiento Zonas OCC01-02 y NOR01-03', 'SUPERINTENDENTE_MANTTO_OCC01_02_NOR01_03', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (10, 'Superintendente Mantenimiento Zonas CNA01-04', 'SUPERINTENDENTE_MANTTO_CNA01_04', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (11, 'Superintendente Mantenimiento Zonas CNB01-03', 'SUPERINTENDENTE_MANTTO_CNB01_03', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (12, 'Jefe Jurídico', 'JEFE_JURIDICO', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (13, 'Auxiliar Legal', 'AUXILIAR_LEGAL', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (14, 'Especialista IMSS', 'ESPECIALISTA_IMSS', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (15, 'Recursos Humanos', 'RECURSOS_HUMANOS', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (17, 'Jefe de Contratos', 'JEFE_CONTRATOS', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (18, 'Jefa de Atención a Cliente', 'JEFA_ATENCION_CLIENTE', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (19, 'Coordinador de Soporte', 'COORDINADOR_SOPORTE', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (20, 'Sistemas Digitales Soporte', 'SISTEMAS_DIGITALES_SOPORTE', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (21, 'Almacén y Cobranza Proyectos', 'ALMACEN_COBRANZA_PROYECTOS', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (22, 'Costumer Experience (CX)', 'COSTUMER_EXPERIENCE_CX', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (23, 'Whatsapp Página', 'WHATSAPP_PAGINA', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (24, 'Supervisor Mantenimiento Zona CNA04', 'SUPERVISOR_MANTTO_CNA04', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (25, 'Supervisor Mantenimiento Zona CNB01', 'SUPERVISOR_MANTTO_CNB01', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (26, 'Supervisor Mantenimiento Zona CNB02', 'SUPERVISOR_MANTTO_CNB02', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (27, 'Supervisor Mantenimiento Zona CNB03', 'SUPERVISOR_MANTTO_CNB03', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (28, 'Supervisor Mantenimiento Zona CNA01', 'SUPERVISOR_MANTTO_CNA01', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (29, 'Supervisor Mantenimiento Zona CNA02', 'SUPERVISOR_MANTTO_CNA02', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (30, 'Supervisor Mantenimiento Zona CNA03', 'SUPERVISOR_MANTTO_CNA03', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (31, 'Supervisor Mantenimiento Zona NOR01 y NOR02', 'SUPERVISOR_MANTTO_NOR01_NOR02', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (32, 'Supervisor Mantenimiento Zona NOR03', 'SUPERVISOR_MANTTO_NOR03', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (33, 'Supervisor de Soporte', 'SUPERVISOR_SOPORTE', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (34, 'Supervisora Administrativa de Mantenimiento', 'SUPERVISORA_ADMIN_MANTENIMIENTO', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (35, 'Supervisor Mantenimiento Zona OCC01 y OCC02', 'SUPERVISOR_MANTTO_OCC01_OCC02', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (36, 'Auxiliar Administrativo Cuentas Corporativas', 'AUXILIAR_ADMIN_CUENTAS_CORPORATIVAS', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (37, 'Admin Instalaciones', 'ADMIN_INSTALACIONES', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (38, 'Analista Administrativo Logística', 'ANALISTA_ADMIN_LOGISTICA', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (39, 'Asesor Comercial', 'ASESOR_COMERCIAL', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (40, 'Auxiliar Administrativo', 'AUXILIAR_ADMINISTRATIVO', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (41, 'Auxiliar Administrativo / Almacén MTY', 'AUXILIAR_ADMIN_ALMACEN_MTY', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (42, 'Auxiliar Administrativo Cobranza', 'AUXILIAR_ADMIN_COBRANZA', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (43, 'Control Montaje', 'CONTROL_MONTAJE', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (44, 'Encargada de Seguridad', 'ENCARGADA_SEGURIDAD', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (45, 'Jefe Proyectos, Producción y Logística', 'JEFE_PROYECTOS_PRODUCCION_LOGISTICA', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (46, 'Jefe Ajuste', 'JEFE_AJUSTE', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (47, 'Jefa Administración Ventas', 'JEFA_ADMINISTRACION_VENTAS', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (48, 'Gerente de Cuentas Corporativas', 'GERENTE_CUENTAS_CORPORATIVAS', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (49, 'Superintendente Instalaciones Occidente', 'SUPERINTENDENTE_INSTALACIONES_OCCIDENTE', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (50, 'Gerente Comercial Baja California y Sureste', 'GERENTE_COMERCIAL_BC_SURESTE', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (51, 'Supervisor de Instalaciones', 'SUPERVISOR_INSTALACIONES', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (52, 'Superintendente Instalaciones Zona Norte', 'SUPERINTENDENTE_INSTALACIONES_NORTE', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (53, 'Superintendente Instalaciones', 'SUPERINTENDENTE_INSTALACIONES', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (54, 'Gerente Comercial Zona Norte', 'GERENTE_COMERCIAL_NORTE', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (55, 'Ingeniería de Ventas', 'INGENIERIA_VENTAS', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (56, 'Jefatura de Logística', 'JEFATURA_LOGISTICA', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (57, 'Ingeniería de TI', 'INGENIERIA_TI', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (59, 'Supervisor Mantenimiento Zona OCC01', 'SUPERVISOR_MANTTO_OCC01', 'Rol funcional de laboratorio.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (60, 'Programador United', 'PROGRAMADOR_UNITED', 'Programador con acceso únicamente a General y United Elevadores.', 0, 0, 'UNITED', 1, 'LAB', 'LAB'),
  (61, 'Programador Corellian', 'PROGRAMADOR_CORELLIAN', 'Programador con acceso únicamente a General y Corellian SA de CV.', 0, 0, 'CORELLIAN', 1, 'LAB', 'LAB'),
  (62, 'Soporte', 'SOPORTE', 'Atención y gestión de solicitudes de soporte generadas por los usuarios del sistema.', 50, 0, 'GENERAL', 1, 'LAB', 'LAB'),
  (63, 'Gestor de Fotografías', 'GESTOR_FOTOGRAFIAS', 'Rol autorizado para cargar fotografías y seleccionar la fotografía principal de proyectos Corellian y United.', 0, 0, 'GENERAL', 1, 'LAB', 'LAB');

-- z_op: 12 registros
INSERT INTO `z_op` (`id_zona`, `zona`, `nombre`, `estado`, `created_by`, `updated_by`) VALUES
  (1, 'CNB-01', 'Centro Norte B 01', 1, 'LAB', 'LAB'),
  (2, 'CNB-02', 'Centro Norte B 02', 1, 'LAB', 'LAB'),
  (3, 'CNB-03', 'Centro Norte B 03', 1, 'LAB', 'LAB'),
  (4, 'CNA-01', 'Centro Norte A 01', 1, 'LAB', 'LAB'),
  (5, 'CNA-02', 'Centro Norte A 02', 1, 'LAB', 'LAB'),
  (6, 'CNA-03', 'Centro Norte A 03', 1, 'LAB', 'LAB'),
  (7, 'CNA-04', 'Centro Norte A 04', 1, 'LAB', 'LAB'),
  (8, 'OCC-01', 'Occidente 01', 1, 'LAB', 'LAB'),
  (9, 'OCC-02', 'Occidente 02', 1, 'LAB', 'LAB'),
  (10, 'NOR-01', 'Norte 01', 1, 'LAB', 'LAB'),
  (11, 'NOR-02', 'Norte 02', 1, 'LAB', 'LAB'),
  (12, 'NOR-03', 'Norte 03', 1, 'LAB', 'LAB');

-- perm_agrupaciones: 14 registros
INSERT INTO `perm_agrupaciones` (`id_agrupacion`, `codigo`, `nombre`, `empresa`, `orden`, `activo`) VALUES
  (1, 'GENERAL', 'general', 'BLT LAB', 1, 1),
  (2, 'OPERACION', 'operación', 'United Elevadores LAB', 2, 1),
  (3, 'PORTAFOLIO', 'portafolio', 'United Elevadores LAB', 3, 1),
  (4, 'VENTAS', 'ventas', 'Corellian LAB', 4, 1),
  (5, 'LOGISTICA', 'logística', 'Corellian LAB', 5, 1),
  (6, 'INSTALACIONES', 'instalaciones', 'Corellian LAB', 6, 1),
  (7, 'COBRANZA', 'cobranza', 'Corellian LAB', 7, 1),
  (8, 'ALMACEN', 'almacén', 'Corellian LAB', 8, 1),
  (9, 'CUSTOMER_EXPERIENCE', 'Customer Experience', 'Corellian LAB', 9, 1),
  (10, 'LEGAL', 'Legal', 'BLT LAB', 10, 1),
  (11, 'SOPORTE', 'Soporte', 'BLT LAB', 11, 1),
  (12, 'EXPERIMENTAL', 'Experimental', 'United Elevadores LAB', 12, 1),
  (14, 'COBRANZA_UNI', 'Cobranza United', 'United Elevadores LAB', 14, 1),
  (17, 'FOTOGRAFIAS', 'Fotografías', 'BLT LAB', 17, 1);

-- usuarios: 61 registros
INSERT INTO `usuarios` (`id_SB`, `nombre`, `iniciales`, `puesto`, `area`, `empresa`, `rol_id`, `correo`, `pass`, `must_change_password`, `reporta_a`, `estado`, `id_pregunta`, `respuesta_recuperacion`, `failed_login_attempts`, `two_factor_enabled`, `created_by`, `updated_by`, `criticos_fallas`, `criticos_periodo`, `recovery_failed_attempts`) VALUES
  (910001, 'Usuario LAB R01', 'L01', 'Director General', 'Dirección / Administración LAB', 'BLT LAB', 1, 'rol01@lab.invalid', 'LAB_NO_LOGIN', 0, NULL, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910002, 'Usuario LAB R02', 'L02', 'Director Mantenimiento', 'Mantenimiento LAB', 'United Elevadores LAB', 2, 'rol02@lab.invalid', 'LAB_NO_LOGIN', 0, 910001, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910003, 'Usuario LAB R03', 'L03', 'Director Finanzas', 'Finanzas LAB', 'BLT LAB', 3, 'rol03@lab.invalid', 'LAB_NO_LOGIN', 0, 910001, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910004, 'Usuario LAB R04', 'L04', 'Director Instalaciones', 'Instalaciones LAB', 'Corellian LAB', 4, 'rol04@lab.invalid', 'LAB_NO_LOGIN', 0, 910004, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910005, 'Usuario LAB R05', 'L05', 'Director Ventas', 'Ventas LAB', 'Corellian LAB', 5, 'rol05@lab.invalid', 'LAB_NO_LOGIN', 0, 910001, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910006, 'Usuario LAB R06', 'L06', 'Programador', 'Sistemas LAB', 'BLT LAB', 6, 'rol06@lab.invalid', 'LAB_NO_LOGIN', 0, 910001, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910007, 'Usuario LAB R07', 'L07', 'Auxiliar Dirección', 'Dirección / Administración LAB', 'BLT LAB', 7, 'rol07@lab.invalid', 'LAB_NO_LOGIN', 0, 910001, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910008, 'Usuario LAB R08', 'L08', 'Jefe de Calidad', 'Calidad LAB', 'BLT LAB', 8, 'rol08@lab.invalid', 'LAB_NO_LOGIN', 0, 910001, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910009, 'Usuario LAB R09', 'L09', 'Superintendente Mantenimiento Zonas OCC01-02 y NOR01-03', 'Mantenimiento LAB', 'United Elevadores LAB', 9, 'rol09@lab.invalid', 'LAB_NO_LOGIN', 0, 910002, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910010, 'Usuario LAB R10', 'L10', 'Superintendente Mantenimiento Zonas CNA01-04', 'Mantenimiento LAB', 'United Elevadores LAB', 10, 'rol10@lab.invalid', 'LAB_NO_LOGIN', 0, 910002, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910011, 'Usuario LAB R11', 'L11', 'Superintendente Mantenimiento Zonas CNB01-03', 'Mantenimiento LAB', 'United Elevadores LAB', 11, 'rol11@lab.invalid', 'LAB_NO_LOGIN', 0, 910002, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910012, 'Usuario LAB R12', 'L12', 'Jefe Jurídico', 'Legal LAB', 'BLT LAB', 12, 'rol12@lab.invalid', 'LAB_NO_LOGIN', 0, 910001, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910013, 'Usuario LAB R13', 'L13', 'Auxiliar Legal', 'Legal LAB', 'BLT LAB', 13, 'rol13@lab.invalid', 'LAB_NO_LOGIN', 0, 910012, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910014, 'Usuario LAB R14', 'L14', 'Especialista IMSS', 'Dirección / Administración LAB', 'BLT LAB', 14, 'rol14@lab.invalid', 'LAB_NO_LOGIN', 0, 910001, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910015, 'Usuario LAB R15', 'L15', 'Recursos Humanos', 'Dirección / Administración LAB', 'BLT LAB', 15, 'rol15@lab.invalid', 'LAB_NO_LOGIN', 0, 910001, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910017, 'Usuario LAB R17', 'L17', 'Jefe de Contratos', 'Legal LAB', 'BLT LAB', 17, 'rol17@lab.invalid', 'LAB_NO_LOGIN', 0, 910001, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910018, 'Usuario LAB R18', 'L18', 'Jefa de Atención a Cliente', 'Dirección / Administración LAB', 'BLT LAB', 18, 'rol18@lab.invalid', 'LAB_NO_LOGIN', 0, 910001, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910019, 'Usuario LAB R19', 'L19', 'Coordinador de Soporte', 'Sistemas LAB', 'BLT LAB', 19, 'rol19@lab.invalid', 'LAB_NO_LOGIN', 0, 910001, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910020, 'Usuario LAB R20', 'L20', 'Sistemas Digitales Soporte', 'Sistemas LAB', 'BLT LAB', 20, 'rol20@lab.invalid', 'LAB_NO_LOGIN', 0, 910019, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910021, 'Usuario LAB R21', 'L21', 'Almacén y Cobranza Proyectos', 'Almacén LAB', 'Corellian LAB', 21, 'rol21@lab.invalid', 'LAB_NO_LOGIN', 0, 910001, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910022, 'Usuario LAB R22', 'L22', 'Costumer Experience (CX)', 'Dirección / Administración LAB', 'BLT LAB', 22, 'rol22@lab.invalid', 'LAB_NO_LOGIN', 0, 910001, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910023, 'Usuario LAB R23', 'L23', 'Whatsapp Página', 'Dirección / Administración LAB', 'BLT LAB', 23, 'rol23@lab.invalid', 'LAB_NO_LOGIN', 0, 910001, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910024, 'Usuario LAB R24', 'L24', 'Supervisor Mantenimiento Zona CNA04', 'Mantenimiento LAB', 'United Elevadores LAB', 24, 'rol24@lab.invalid', 'LAB_NO_LOGIN', 0, 910010, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910025, 'Usuario LAB R25', 'L25', 'Supervisor Mantenimiento Zona CNB01', 'Mantenimiento LAB', 'United Elevadores LAB', 25, 'rol25@lab.invalid', 'LAB_NO_LOGIN', 0, 910011, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910026, 'Usuario LAB R26', 'L26', 'Supervisor Mantenimiento Zona CNB02', 'Mantenimiento LAB', 'United Elevadores LAB', 26, 'rol26@lab.invalid', 'LAB_NO_LOGIN', 0, 910011, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910027, 'Usuario LAB R27', 'L27', 'Supervisor Mantenimiento Zona CNB03', 'Mantenimiento LAB', 'United Elevadores LAB', 27, 'rol27@lab.invalid', 'LAB_NO_LOGIN', 0, 910011, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910028, 'Usuario LAB R28', 'L28', 'Supervisor Mantenimiento Zona CNA01', 'Mantenimiento LAB', 'United Elevadores LAB', 28, 'rol28@lab.invalid', 'LAB_NO_LOGIN', 0, 910010, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910029, 'Usuario LAB R29', 'L29', 'Supervisor Mantenimiento Zona CNA02', 'Mantenimiento LAB', 'United Elevadores LAB', 29, 'rol29@lab.invalid', 'LAB_NO_LOGIN', 0, 910010, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910030, 'Usuario LAB R30', 'L30', 'Supervisor Mantenimiento Zona CNA03', 'Mantenimiento LAB', 'United Elevadores LAB', 30, 'rol30@lab.invalid', 'LAB_NO_LOGIN', 0, 910010, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910031, 'Usuario LAB R31', 'L31', 'Supervisor Mantenimiento Zona NOR01 y NOR02', 'Mantenimiento LAB', 'United Elevadores LAB', 31, 'rol31@lab.invalid', 'LAB_NO_LOGIN', 0, 910009, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910032, 'Usuario LAB R32', 'L32', 'Supervisor Mantenimiento Zona NOR03', 'Mantenimiento LAB', 'United Elevadores LAB', 32, 'rol32@lab.invalid', 'LAB_NO_LOGIN', 0, 910009, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910033, 'Usuario LAB R33', 'L33', 'Supervisor de Soporte', 'Sistemas LAB', 'BLT LAB', 33, 'rol33@lab.invalid', 'LAB_NO_LOGIN', 0, 910019, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910034, 'Usuario LAB R34', 'L34', 'Supervisora Administrativa de Mantenimiento', 'Mantenimiento LAB', 'United Elevadores LAB', 34, 'rol34@lab.invalid', 'LAB_NO_LOGIN', 0, 910009, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910035, 'Usuario LAB R35', 'L35', 'Supervisor Mantenimiento Zona OCC01 y OCC02', 'Mantenimiento LAB', 'United Elevadores LAB', 35, 'rol35@lab.invalid', 'LAB_NO_LOGIN', 0, 910009, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910036, 'Usuario LAB R36', 'L36', 'Auxiliar Administrativo Cuentas Corporativas', 'Sistemas LAB', 'BLT LAB', 36, 'rol36@lab.invalid', 'LAB_NO_LOGIN', 0, 910001, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910037, 'Usuario LAB R37', 'L37', 'Admin Instalaciones', 'Instalaciones LAB', 'Corellian LAB', 37, 'rol37@lab.invalid', 'LAB_NO_LOGIN', 0, 910004, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910038, 'Usuario LAB R38', 'L38', 'Analista Administrativo Logística', 'Logística LAB', 'Corellian LAB', 38, 'rol38@lab.invalid', 'LAB_NO_LOGIN', 0, 910045, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910039, 'Usuario LAB R39', 'L39', 'Asesor Comercial', 'Ventas LAB', 'Corellian LAB', 39, 'rol39@lab.invalid', 'LAB_NO_LOGIN', 0, 910005, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910040, 'Usuario LAB R40', 'L40', 'Auxiliar Administrativo', 'Sistemas LAB', 'BLT LAB', 40, 'rol40@lab.invalid', 'LAB_NO_LOGIN', 0, 910047, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910041, 'Usuario LAB R41', 'L41', 'Auxiliar Administrativo / Almacén MTY', 'Almacén LAB', 'Corellian LAB', 41, 'rol41@lab.invalid', 'LAB_NO_LOGIN', 0, 910001, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910042, 'Usuario LAB R42', 'L42', 'Auxiliar Administrativo Cobranza', 'Finanzas LAB', 'BLT LAB', 42, 'rol42@lab.invalid', 'LAB_NO_LOGIN', 0, 910003, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910043, 'Usuario LAB R43', 'L43', 'Control Montaje', 'Instalaciones LAB', 'Corellian LAB', 43, 'rol43@lab.invalid', 'LAB_NO_LOGIN', 0, 910004, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910044, 'Usuario LAB R44', 'L44', 'Encargada de Seguridad', 'Dirección / Administración LAB', 'BLT LAB', 44, 'rol44@lab.invalid', 'LAB_NO_LOGIN', 0, 910004, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910045, 'Usuario LAB R45', 'L45', 'Jefe Proyectos, Producción y Logística', 'Logística LAB', 'Corellian LAB', 45, 'rol45@lab.invalid', 'LAB_NO_LOGIN', 0, 910001, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910046, 'Usuario LAB R46', 'L46', 'Jefe Ajuste', 'Instalaciones LAB', 'Corellian LAB', 46, 'rol46@lab.invalid', 'LAB_NO_LOGIN', 0, 910004, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910047, 'Usuario LAB R47', 'L47', 'Jefa Administración Ventas', 'Ventas LAB', 'Corellian LAB', 47, 'rol47@lab.invalid', 'LAB_NO_LOGIN', 0, 910005, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910048, 'Usuario LAB R48', 'L48', 'Gerente de Cuentas Corporativas', 'Sistemas LAB', 'BLT LAB', 48, 'rol48@lab.invalid', 'LAB_NO_LOGIN', 0, 910001, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910049, 'Usuario LAB R49', 'L49', 'Superintendente Instalaciones Occidente', 'Instalaciones LAB', 'Corellian LAB', 49, 'rol49@lab.invalid', 'LAB_NO_LOGIN', 0, 910004, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910050, 'Usuario LAB R50', 'L50', 'Gerente Comercial Baja California y Sureste', 'Ventas LAB', 'Corellian LAB', 50, 'rol50@lab.invalid', 'LAB_NO_LOGIN', 0, 910005, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910051, 'Usuario LAB R51', 'L51', 'Supervisor de Instalaciones', 'Instalaciones LAB', 'Corellian LAB', 51, 'rol51@lab.invalid', 'LAB_NO_LOGIN', 0, 910004, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910052, 'Usuario LAB R52', 'L52', 'Superintendente Instalaciones Zona Norte', 'Instalaciones LAB', 'Corellian LAB', 52, 'rol52@lab.invalid', 'LAB_NO_LOGIN', 0, 910004, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910053, 'Usuario LAB R53', 'L53', 'Superintendente Instalaciones', 'Instalaciones LAB', 'Corellian LAB', 53, 'rol53@lab.invalid', 'LAB_NO_LOGIN', 0, 910004, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910054, 'Usuario LAB R54', 'L54', 'Gerente Comercial Zona Norte', 'Ventas LAB', 'Corellian LAB', 54, 'rol54@lab.invalid', 'LAB_NO_LOGIN', 0, 910005, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910055, 'Usuario LAB R55', 'L55', 'Ingeniería de Ventas', 'Ventas LAB', 'Corellian LAB', 55, 'rol55@lab.invalid', 'LAB_NO_LOGIN', 0, 910005, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910056, 'Usuario LAB R56', 'L56', 'Jefatura de Logística', 'Logística LAB', 'Corellian LAB', 56, 'rol56@lab.invalid', 'LAB_NO_LOGIN', 0, 910045, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910057, 'Usuario LAB R57', 'L57', 'Ingeniería de TI', 'Sistemas LAB', 'BLT LAB', 57, 'rol57@lab.invalid', 'LAB_NO_LOGIN', 0, 910006, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910059, 'Usuario LAB R59', 'L59', 'Supervisor Mantenimiento Zona OCC01', 'Mantenimiento LAB', 'United Elevadores LAB', 59, 'rol59@lab.invalid', 'LAB_NO_LOGIN', 0, 910009, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910060, 'Usuario LAB R60', 'L60', 'Programador United', 'Sistemas LAB', 'United Elevadores LAB', 60, 'rol60@lab.invalid', 'LAB_NO_LOGIN', 0, 910006, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910061, 'Usuario LAB R61', 'L61', 'Programador Corellian', 'Sistemas LAB', 'Corellian LAB', 61, 'rol61@lab.invalid', 'LAB_NO_LOGIN', 0, 910006, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910062, 'Usuario LAB R62', 'L62', 'Soporte', 'Sistemas LAB', 'BLT LAB', 62, 'rol62@lab.invalid', 'LAB_NO_LOGIN', 0, 910019, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0),
  (910063, 'Usuario LAB R63', 'L63', 'Gestor de Fotografías', 'Dirección / Administración LAB', 'BLT LAB', 63, 'rol63@lab.invalid', 'LAB_NO_LOGIN', 0, 910001, 1, 11, 'LAB', 0, 0, 'LAB', 'LAB', 3, 35, 0);

-- usuario_roles: 61 registros
INSERT INTO `usuario_roles` (`id_usuario_rol`, `id_usuario`, `id_rol`, `principal`, `activo`) VALUES
  (911001, 910001, 1, 1, 1),
  (911002, 910002, 2, 1, 1),
  (911003, 910003, 3, 1, 1),
  (911004, 910004, 4, 1, 1),
  (911005, 910005, 5, 1, 1),
  (911006, 910006, 6, 1, 1),
  (911007, 910007, 7, 1, 1),
  (911008, 910008, 8, 1, 1),
  (911009, 910009, 9, 1, 1),
  (911010, 910010, 10, 1, 1),
  (911011, 910011, 11, 1, 1),
  (911012, 910012, 12, 1, 1),
  (911013, 910013, 13, 1, 1),
  (911014, 910014, 14, 1, 1),
  (911015, 910015, 15, 1, 1),
  (911017, 910017, 17, 1, 1),
  (911018, 910018, 18, 1, 1),
  (911019, 910019, 19, 1, 1),
  (911020, 910020, 20, 1, 1),
  (911021, 910021, 21, 1, 1),
  (911022, 910022, 22, 1, 1),
  (911023, 910023, 23, 1, 1),
  (911024, 910024, 24, 1, 1),
  (911025, 910025, 25, 1, 1),
  (911026, 910026, 26, 1, 1),
  (911027, 910027, 27, 1, 1),
  (911028, 910028, 28, 1, 1),
  (911029, 910029, 29, 1, 1),
  (911030, 910030, 30, 1, 1),
  (911031, 910031, 31, 1, 1),
  (911032, 910032, 32, 1, 1),
  (911033, 910033, 33, 1, 1),
  (911034, 910034, 34, 1, 1),
  (911035, 910035, 35, 1, 1),
  (911036, 910036, 36, 1, 1),
  (911037, 910037, 37, 1, 1),
  (911038, 910038, 38, 1, 1),
  (911039, 910039, 39, 1, 1),
  (911040, 910040, 40, 1, 1),
  (911041, 910041, 41, 1, 1),
  (911042, 910042, 42, 1, 1),
  (911043, 910043, 43, 1, 1),
  (911044, 910044, 44, 1, 1),
  (911045, 910045, 45, 1, 1),
  (911046, 910046, 46, 1, 1),
  (911047, 910047, 47, 1, 1),
  (911048, 910048, 48, 1, 1),
  (911049, 910049, 49, 1, 1),
  (911050, 910050, 50, 1, 1),
  (911051, 910051, 51, 1, 1),
  (911052, 910052, 52, 1, 1),
  (911053, 910053, 53, 1, 1),
  (911054, 910054, 54, 1, 1),
  (911055, 910055, 55, 1, 1),
  (911056, 910056, 56, 1, 1),
  (911057, 910057, 57, 1, 1),
  (911059, 910059, 59, 1, 1),
  (911060, 910060, 60, 1, 1),
  (911061, 910061, 61, 1, 1),
  (911062, 910062, 62, 1, 1),
  (911063, 910063, 63, 1, 1);

-- usuario_zop: 25 registros
INSERT INTO `usuario_zop` (`id_usuario_zop`, `usuario_id`, `zona_id`, `estado`, `created_by`, `updated_by`) VALUES
  (912001, 910009, 8, 1, 'LAB', 'LAB'),
  (912002, 910009, 9, 1, 'LAB', 'LAB'),
  (912003, 910009, 10, 1, 'LAB', 'LAB'),
  (912004, 910009, 11, 1, 'LAB', 'LAB'),
  (912005, 910009, 12, 1, 'LAB', 'LAB'),
  (912006, 910010, 4, 1, 'LAB', 'LAB'),
  (912007, 910010, 5, 1, 'LAB', 'LAB'),
  (912008, 910010, 6, 1, 'LAB', 'LAB'),
  (912009, 910010, 7, 1, 'LAB', 'LAB'),
  (912010, 910011, 1, 1, 'LAB', 'LAB'),
  (912011, 910011, 2, 1, 'LAB', 'LAB'),
  (912012, 910011, 3, 1, 'LAB', 'LAB'),
  (912013, 910024, 7, 1, 'LAB', 'LAB'),
  (912014, 910025, 1, 1, 'LAB', 'LAB'),
  (912015, 910026, 2, 1, 'LAB', 'LAB'),
  (912016, 910027, 3, 1, 'LAB', 'LAB'),
  (912017, 910028, 4, 1, 'LAB', 'LAB'),
  (912018, 910029, 5, 1, 'LAB', 'LAB'),
  (912019, 910030, 6, 1, 'LAB', 'LAB'),
  (912020, 910031, 10, 1, 'LAB', 'LAB'),
  (912021, 910031, 11, 1, 'LAB', 'LAB'),
  (912022, 910032, 12, 1, 'LAB', 'LAB'),
  (912023, 910035, 8, 1, 'LAB', 'LAB'),
  (912024, 910035, 9, 1, 'LAB', 'LAB'),
  (912025, 910059, 8, 1, 'LAB', 'LAB');

-- usuarios_alcance_informacion: 22 registros
INSERT INTO `usuarios_alcance_informacion` (`id_alcance`, `id_usuario`, `tipo_alcance`, `dominio`, `id_agrupacion`, `id_usuario_visible`, `activo`, `created_by`, `updated_by`) VALUES
  (913001, 910001, 'DOMINIO_COMPLETO', 'GENERAL', NULL, NULL, 1, 910006, 910006),
  (913002, 910001, 'DOMINIO_COMPLETO', 'UNITED', NULL, NULL, 1, 910006, 910006),
  (913003, 910001, 'DOMINIO_COMPLETO', 'CORELLIAN', NULL, NULL, 1, 910006, 910006),
  (913004, 910006, 'DOMINIO_COMPLETO', 'GENERAL', NULL, NULL, 1, 910006, 910006),
  (913005, 910006, 'DOMINIO_COMPLETO', 'UNITED', NULL, NULL, 1, 910006, 910006),
  (913006, 910006, 'DOMINIO_COMPLETO', 'CORELLIAN', NULL, NULL, 1, 910006, 910006),
  (913007, 910060, 'DOMINIO_COMPLETO', 'GENERAL', NULL, NULL, 1, 910006, 910006),
  (913008, 910060, 'DOMINIO_COMPLETO', 'UNITED', NULL, NULL, 1, 910006, 910006),
  (913009, 910061, 'DOMINIO_COMPLETO', 'GENERAL', NULL, NULL, 1, 910006, 910006),
  (913010, 910061, 'DOMINIO_COMPLETO', 'CORELLIAN', NULL, NULL, 1, 910006, 910006),
  (913011, 910002, 'DOMINIO_COMPLETO', 'UNITED', NULL, NULL, 1, 910006, 910006),
  (913012, 910005, 'DOMINIO_COMPLETO', 'CORELLIAN', NULL, NULL, 1, 910006, 910006),
  (913013, 910004, 'DOMINIO_COMPLETO', 'CORELLIAN', NULL, NULL, 1, 910006, 910006),
  (913014, 910009, 'REPORTA_A', NULL, NULL, NULL, 1, 910006, 910006),
  (913015, 910010, 'REPORTA_A', NULL, NULL, NULL, 1, 910006, 910006),
  (913016, 910011, 'REPORTA_A', NULL, NULL, NULL, 1, 910006, 910006),
  (913017, 910054, 'REPORTA_A', NULL, NULL, NULL, 1, 910006, 910006),
  (913018, 910050, 'REPORTA_A', NULL, NULL, NULL, 1, 910006, 910006),
  (913019, 910047, 'REL_ADMIN', NULL, NULL, NULL, 1, 910006, 910006),
  (913020, 910062, 'AGRUPACION', NULL, 11, NULL, 1, 910006, 910006),
  (913021, 910063, 'AGRUPACION', NULL, 17, NULL, 1, 910006, 910006),
  (913022, 910008, 'USUARIO', NULL, NULL, 910028, 1, 910006, 910006);

-- usuarios_rel_admin: 2 registros
INSERT INTO `usuarios_rel_admin` (`id_rel_admin`, `id_asesor`, `id_admin`) VALUES
  (914001, 910039, 910047),
  (914002, 910039, 910040);

-- catalogo_general: 9 registros
INSERT INTO `catalogo_general` (`id_catalogo`, `area`, `elemento`, `articulo`, `descripcion`, `orden`, `activo`, `created_by`, `updated_by`) VALUES
  (980001, 'LOGISTICA_PRODUCCION', 'ESTATUS', 'En diseño LAB', 'Catálogo sintético de laboratorio.', 1, 1, 910006, 910006),
  (980002, 'LOGISTICA_PRODUCCION', 'ESTATUS', 'En producción LAB', 'Catálogo sintético de laboratorio.', 2, 1, 910006, 910006),
  (980003, 'LOGISTICA_PRODUCCION', 'ESTATUS', 'Liberado LAB', 'Catálogo sintético de laboratorio.', 3, 1, 910006, 910006),
  (980010, 'REDES', 'VIA_CONTACTO', 'Formulario LAB', 'Catálogo sintético de laboratorio.', 10, 1, 910006, 910006),
  (980011, 'REDES', 'VIA_CONTACTO', 'Red social LAB', 'Catálogo sintético de laboratorio.', 11, 1, 910006, 910006),
  (980012, 'REDES', 'ESTADO', 'Nuevo LAB', 'Catálogo sintético de laboratorio.', 12, 1, 910006, 910006),
  (980013, 'REDES', 'ESTADO', 'En seguimiento LAB', 'Catálogo sintético de laboratorio.', 13, 1, 910006, 910006),
  (980014, 'REDES', 'SOLICITUD', 'Cotización LAB', 'Catálogo sintético de laboratorio.', 14, 1, 910006, 910006),
  (980015, 'REDES', 'ESTATUS', 'Asignado LAB', 'Catálogo sintético de laboratorio.', 15, 1, 910006, 910006);

-- notificacion_eventos: 8 registros
INSERT INTO `notificacion_eventos` (`codigo_evento`, `agrupacion`, `modulo`, `accion`, `nombre_evento`, `descripcion`, `prioridad_default`, `configurable`, `obligatoria`, `campana_default`, `push_default`, `correo_default`, `titulo_default`, `mensaje_default`, `icono_default`, `accion_destino`, `ruta_default`, `orden`, `activo`) VALUES
  ('COMENTARIO', 'General', 'Interacciones', 'COMENTAR', 'Comentario LAB', 'Evento de comentario simulado.', 'MEDIA', 1, 0, 1, 0, 0, 'Comentario LAB', 'Evento de comentario simulado.', 'LAB', 'ABRIR_MODULO', 'home', 10, 1),
  ('FALLA_EQUIPO_CRITICO', 'Operacion', 'Tickets', 'NUEVA_FALLA_CRITICO', 'Falla crítica LAB', 'Falla crítica simulada.', 'CRITICA', 1, 0, 1, 0, 0, 'Falla crítica LAB', 'Falla crítica simulada.', 'LAB', 'ABRIR_TICKET', 'detalle/ticket', 20, 1),
  ('PERSONA_ATRAPADA', 'Operacion', 'Tickets', 'PERSONA_ATRAPADA', 'Persona atrapada LAB', 'Evento crítico simulado.', 'CRITICA', 1, 0, 1, 0, 0, 'Persona atrapada LAB', 'Evento crítico simulado.', 'LAB', 'ABRIR_TICKET', 'detalle/ticket', 30, 1),
  ('tareas.asignada', 'General', 'Tareas', 'ASIGNACION', 'Nueva tarea LAB', 'Asignación simulada.', 'ALTA', 0, 1, 1, 0, 0, 'Nueva tarea LAB', 'Asignación simulada.', 'LAB', 'ABRIR_TAREA', 'home', 40, 1),
  ('tareas.comentario.creado', 'General', 'Tareas', 'COMENTARIO', 'Comentario tarea LAB', 'Comentario simulado.', 'MEDIA', 1, 0, 1, 0, 0, 'Comentario tarea LAB', 'Comentario simulado.', 'LAB', 'ABRIR_TAREA', 'home', 50, 1),
  ('tickets.comentario.creado', 'Operacion', 'Tickets', 'COMENTARIO', 'Comentario Ticket LAB', 'Comentario simulado.', 'MEDIA', 1, 0, 1, 0, 0, 'Comentario Ticket LAB', 'Comentario simulado.', 'LAB', 'ABRIR_TICKET', 'detalle/ticket', 60, 1),
  ('tickets.vobo.actualizado', 'Operacion', 'Tickets', 'VOBO', 'Vo.Bo. Ticket LAB', 'Validación simulada.', 'ALTA', 0, 1, 1, 0, 0, 'Vo.Bo. Ticket LAB', 'Validación simulada.', 'LAB', 'ABRIR_TICKET', 'detalle/ticket', 70, 1),
  ('ventas.cotizacion.estatus', 'Ventas', 'Cotizaciones', 'ESTATUS', 'Cotización LAB actualizada', 'Cambio de estatus simulado.', 'ALTA', 1, 0, 1, 0, 0, 'Cotización LAB actualizada', 'Cambio de estatus simulado.', 'LAB', 'ABRIR_COTIZACION', 'ventas-cotizaciones', 80, 1);

-- notificacion_evento_roles: 8 registros
INSERT INTO `notificacion_evento_roles` (`id_evento_rol`, `codigo_evento`, `id_rol`, `politica`, `activo`) VALUES
  (955001, 'COMENTARIO', 6, 'OPCIONAL', 1),
  (955002, 'FALLA_EQUIPO_CRITICO', 6, 'OPCIONAL', 1),
  (955003, 'PERSONA_ATRAPADA', 6, 'OPCIONAL', 1),
  (955004, 'tareas.asignada', 1, 'OBLIGATORIA', 1),
  (955005, 'tareas.comentario.creado', 6, 'OPCIONAL', 1),
  (955006, 'tickets.comentario.creado', 6, 'OPCIONAL', 1),
  (955007, 'tickets.vobo.actualizado', 1, 'OBLIGATORIA', 1),
  (955008, 'ventas.cotizacion.estatus', 6, 'OPCIONAL', 1);

-- notificacion_preferencias: 8 registros
INSERT INTO `notificacion_preferencias` (`id_preferencia`, `id_usuario`, `codigo_evento`, `campana`, `push`, `correo`, `silenciada`) VALUES
  (956001, 910006, 'COMENTARIO', 1, 0, 0, 0),
  (956002, 910006, 'FALLA_EQUIPO_CRITICO', 1, 0, 0, 0),
  (956003, 910006, 'PERSONA_ATRAPADA', 1, 0, 0, 0),
  (956004, 910001, 'tareas.asignada', 1, 0, 0, 0),
  (956005, 910006, 'tareas.comentario.creado', 1, 0, 0, 0),
  (956006, 910006, 'tickets.comentario.creado', 1, 0, 0, 0),
  (956007, 910001, 'tickets.vobo.actualizado', 1, 0, 0, 0),
  (956008, 910006, 'ventas.cotizacion.estatus', 1, 0, 0, 0);

-- cobranza_proyectos: 15 registros
INSERT INTO `cobranza_proyectos` (`id_proyecto_cobranza`, `proyecto`) VALUES
  (920001, 'LAB - PUNTO VALLE'),
  (920002, 'LAB - MISTIQ TEMPLE II'),
  (920003, 'LAB - DURANGO 262'),
  (920004, 'LAB - AEROPUERTO TIJUANA'),
  (920005, 'LAB - AEROPUERTO GUADALAJARA'),
  (920006, 'LAB - AEROPUERTO LOS CABOS'),
  (920007, 'LAB - AEROPUERTO PUERTO VALLARTA'),
  (920008, 'LAB - WALMART SC SAN JOSE DEL CABO'),
  (920009, 'LAB - AKOYA SKY LIVING'),
  (920010, 'LAB - TORRE 22-22'),
  (920011, 'LAB - PABELLON METEPEC'),
  (920012, 'LAB - HOSPITAL SAN ANGEL INN PATRIOTISMO'),
  (920013, 'LAB - ALBOR UNIVERSIDAD'),
  (920014, 'LAB - PLAZA CITADEL'),
  (920015, 'LAB - CENTRO COMERCIAL PUNTA LAGUNA');

-- portafolio: 15 registros
INSERT INTO `portafolio` (`id_portafolio`, `proyecto`, `id_proyecto_cobranza`, `ciudad`, `estado`, `numero_equipo`, `id_equipo_ns`, `identificacion_sitio`, `inactivo`, `estatus_servicio`, `causa_no_servicio`, `detalle_no_servicio`, `zona_id`, `zona_operativa`, `direccion`, `fecha_instalacion`, `fecha_entrega`, `termino_garantia`, `fecha_recepcion_mantenimiento`, `fecha_ingreso_portafolio`, `superintendente`, `supervisor_zona`, `proyecto_cc_x_port`, `cliente`, `subsidiaria`, `region`, `zona_administrativa`, `categoria`, `prioridad`, `frecuencia`, `estatus_cobranza`, `precio_unitario`, `tipo_poliza`, `tipo_facturacion`, `numero_contrato_fabricante`, `producto`, `marca`, `modelo`, `no_paradas`, `velocidad_ms`, `capacidad_kg`, `tiempo_mp_hrs`, `no_gratuitos`, `no_garantia`, `estatus_ul_mes`, `estatus_ul_mes_fecha`, `estado_registro`, `created_by`, `updated_by`) VALUES
  (930001, 'LAB - PUNTO VALLE', 920001, 'Ciudad LAB 01', 'Estado LAB 01', '99001-LAB-ESC-DGB', 'NS-LAB-001', 'Equipo simulado 01', '0', 'Funcionando', NULL, NULL, 1, 'CNB-01', 'Sitio simulado 01, Sector LAB', '2024-01-15', '2024-02-10', '2027-02-10', '2025-03-01', '2025-04-01', 'Superintendente LAB', 'Supervisor LAB Z01', 'LAB - PUNTO VALLE', 'Cliente LAB 01 SA de CV', 'United Elevadores LAB', 'REGION LAB', 'ZA-LAB-1', 'Garantía', 'MEDIA', 'MENSUAL', 'Garantía', '2625', 'Póliza LAB', 'Mensual LAB', 'CTR-LAB-0001', 'ESCALERA', 'MARCA LAB', 'MODELO-LAB-01', '4', '1.25', '600', '2', '2', '12', 'Funcionando', '2026-09-01', 1, 'LAB', 'LAB'),
  (930002, 'LAB - MISTIQ TEMPLE II', 920002, 'Ciudad LAB 02', 'Estado LAB 02', '99002-LAB-RAM-DGB', 'NS-LAB-002', 'Equipo simulado 02', '0', 'No en Servicio', 'Prueba controlada', 'Caso sintético de equipo detenido', 2, 'CNB-02', 'Sitio simulado 02, Sector LAB', '2024-02-15', '2024-03-10', '2027-03-10', '2025-04-01', '2025-05-01', 'Superintendente LAB', 'Supervisor LAB Z02', 'LAB - MISTIQ TEMPLE II', 'Cliente LAB 02 SA de CV', 'United Elevadores LAB', 'REGION LAB', 'ZA-LAB-2', 'Gratuito', 'ALTA', 'MENSUAL', 'Gratuito', '2750', 'Póliza LAB', 'Mensual LAB', 'CTR-LAB-0002', 'RAMPA', 'MARCA LAB', 'MODELO-LAB-02', '5', '1.5', '750', '3', '2', '12', 'No en Servicio', '2026-09-01', 1, 'LAB', 'LAB'),
  (930003, 'LAB - DURANGO 262', 920003, 'Ciudad LAB 03', 'Estado LAB 03', '99003-LAB-ELE-DGB', 'NS-LAB-003', 'Equipo simulado 03', '0', 'Funcionando', NULL, NULL, 3, 'CNB-03', 'Sitio simulado 03, Sector LAB', '2024-03-15', '2024-04-10', '2027-04-10', '2025-05-01', '2025-06-01', 'Superintendente LAB', 'Supervisor LAB Z03', 'LAB - DURANGO 262', 'Cliente LAB 03 SA de CV', 'United Elevadores LAB', 'REGION LAB', 'ZA-LAB-3', 'En Cobranza', 'CRITICA', 'MENSUAL', 'En Cobranza', '2875', 'Póliza LAB', 'Mensual LAB', 'CTR-LAB-0003', 'ELEVADOR', 'MARCA LAB', 'MODELO-LAB-03', '6', '1.75', '900', '1', '2', '12', 'Funcionando', '2026-09-01', 1, 'LAB', 'LAB'),
  (930004, 'LAB - AEROPUERTO TIJUANA', 920004, 'Ciudad LAB 04', 'Estado LAB 04', '99004-LAB-MON-DGB', 'NS-LAB-004', 'Equipo simulado 04', '0', 'Funcionando', NULL, NULL, 4, 'CNA-01', 'Sitio simulado 04, Sector LAB', '2024-04-15', '2024-05-10', '2027-05-10', '2025-06-01', '2025-07-01', 'Superintendente LAB', 'Supervisor LAB Z04', 'LAB - AEROPUERTO TIJUANA', 'Cliente LAB 04 SA de CV', 'United Elevadores LAB', 'REGION LAB', 'ZA-LAB-4', 'En Cobranza', 'BAJA', 'MENSUAL', 'En Cobranza', '3000', 'Póliza LAB', 'Mensual LAB', 'CTR-LAB-0004', 'MONTACARGAS', 'MARCA LAB', 'MODELO-LAB-04', '7', '1.0', '1050', '2', '2', '12', 'Funcionando', '2026-09-01', 1, 'LAB', 'LAB'),
  (930005, 'LAB - AEROPUERTO GUADALAJARA', 920005, 'Ciudad LAB 05', 'Estado LAB 05', '99005-LAB-ELE-DGB', 'NS-LAB-005', 'Equipo simulado 05', '0', 'Funcionando', NULL, NULL, 5, 'CNA-02', 'Sitio simulado 05, Sector LAB', '2024-05-15', '2024-06-10', '2027-06-10', '2025-07-01', '2025-08-01', 'Superintendente LAB', 'Supervisor LAB Z05', 'LAB - AEROPUERTO GUADALAJARA', 'Cliente LAB 05 SA de CV', 'United Elevadores LAB', 'REGION LAB', 'ZA-LAB-1', 'En Cobranza', 'MEDIA', 'MENSUAL', 'En Cobranza', '3125', 'Póliza LAB', 'Mensual LAB', 'CTR-LAB-0005', 'ELEVADOR', 'MARCA LAB', 'MODELO-LAB-05', '8', '1.25', '450', '3', '2', '12', 'Funcionando', '2026-09-01', 1, 'LAB', 'LAB'),
  (930006, 'LAB - AEROPUERTO LOS CABOS', 920006, 'Ciudad LAB 06', 'Estado LAB 01', '99006-LAB-ESC-DGB', 'NS-LAB-006', 'Equipo simulado 06', '0', 'Funcionando', NULL, NULL, 6, 'CNA-03', 'Sitio simulado 06, Sector LAB', '2024-06-15', '2024-07-10', '2027-07-10', '2025-08-01', '2025-09-01', 'Superintendente LAB', 'Supervisor LAB Z06', 'LAB - AEROPUERTO LOS CABOS', 'Cliente LAB 06 SA de CV', 'United Elevadores LAB', 'REGION LAB', 'ZA-LAB-2', 'Garantía', 'ALTA', 'MENSUAL', 'Garantía', '3250', 'Póliza LAB', 'Mensual LAB', 'CTR-LAB-0006', 'ESCALERA', 'MARCA LAB', 'MODELO-LAB-06', '9', '1.5', '600', '1', '2', '12', 'Funcionando', '2026-09-01', 1, 'LAB', 'LAB'),
  (930007, 'LAB - AEROPUERTO PUERTO VALLARTA', 920007, 'Ciudad LAB 07', 'Estado LAB 02', '99007-LAB-RAM-DGB', 'NS-LAB-007', 'Equipo simulado 07', '0', 'No en Servicio', 'Prueba controlada', 'Caso sintético de equipo detenido', 7, 'CNA-04', 'Sitio simulado 07, Sector LAB', '2024-07-15', '2024-08-10', '2027-08-10', '2025-09-01', '2025-10-01', 'Superintendente LAB', 'Supervisor LAB Z07', 'LAB - AEROPUERTO PUERTO VALLARTA', 'Cliente LAB 07 SA de CV', 'United Elevadores LAB', 'REGION LAB', 'ZA-LAB-3', 'Gratuito', 'CRITICA', 'MENSUAL', 'Gratuito', '3375', 'Póliza LAB', 'Mensual LAB', 'CTR-LAB-0007', 'RAMPA', 'MARCA LAB', 'MODELO-LAB-07', '10', '1.75', '750', '2', '2', '12', 'No en Servicio', '2026-09-01', 1, 'LAB', 'LAB'),
  (930008, 'LAB - WALMART SC SAN JOSE DEL CABO', 920008, 'Ciudad LAB 08', 'Estado LAB 03', '99008-LAB-ELE-DGB', 'NS-LAB-008', 'Equipo simulado 08', '0', 'Funcionando', NULL, NULL, 8, 'OCC-01', 'Sitio simulado 08, Sector LAB', '2024-08-15', '2024-09-10', '2027-09-10', '2025-10-01', '2025-11-01', 'Superintendente LAB', 'Supervisor LAB Z08', 'LAB - WALMART SC SAN JOSE DEL CABO', 'Cliente LAB 08 SA de CV', 'United Elevadores LAB', 'REGION LAB', 'ZA-LAB-4', 'En Cobranza', 'BAJA', 'MENSUAL', 'En Cobranza', '3500', 'Póliza LAB', 'Mensual LAB', 'CTR-LAB-0008', 'ELEVADOR', 'MARCA LAB', 'MODELO-LAB-08', '11', '1.0', '900', '3', '2', '12', 'Funcionando', '2026-09-01', 1, 'LAB', 'LAB'),
  (930009, 'LAB - AKOYA SKY LIVING', 920009, 'Ciudad LAB 09', 'Estado LAB 04', '99009-LAB-MON-DGB', 'NS-LAB-009', 'Equipo simulado 09', '0', 'Funcionando', NULL, NULL, 9, 'OCC-02', 'Sitio simulado 09, Sector LAB', '2024-09-15', '2024-10-10', '2027-10-10', '2025-11-01', '2025-12-01', 'Superintendente LAB', 'Supervisor LAB Z09', 'LAB - AKOYA SKY LIVING', 'Cliente LAB 09 SA de CV', 'United Elevadores LAB', 'REGION LAB', 'ZA-LAB-1', 'En Cobranza', 'MEDIA', 'MENSUAL', 'En Cobranza', '3625', 'Póliza LAB', 'Mensual LAB', 'CTR-LAB-0009', 'MONTACARGAS', 'MARCA LAB', 'MODELO-LAB-09', '12', '1.25', '1050', '1', '2', '12', 'Funcionando', '2026-09-01', 1, 'LAB', 'LAB'),
  (930010, 'LAB - TORRE 22-22', 920010, 'Ciudad LAB 10', 'Estado LAB 05', '99010-LAB-ELE-DGB', 'NS-LAB-010', 'Equipo simulado 10', '0', 'Funcionando', NULL, NULL, 10, 'NOR-01', 'Sitio simulado 10, Sector LAB', '2024-10-15', '2024-11-10', '2027-11-10', '2025-12-01', '2025-01-01', 'Superintendente LAB', 'Supervisor LAB Z10', 'LAB - TORRE 22-22', 'Cliente LAB 10 SA de CV', 'United Elevadores LAB', 'REGION LAB', 'ZA-LAB-2', 'En Cobranza', 'ALTA', 'MENSUAL', 'En Cobranza', '3750', 'Póliza LAB', 'Mensual LAB', 'CTR-LAB-0010', 'ELEVADOR', 'MARCA LAB', 'MODELO-LAB-10', '13', '1.5', '450', '2', '2', '12', 'Funcionando', '2026-09-01', 1, 'LAB', 'LAB'),
  (930011, 'LAB - PABELLON METEPEC', 920011, 'Ciudad LAB 11', 'Estado LAB 01', '99011-LAB-ESC-DGB', 'NS-LAB-011', 'Equipo simulado 11', '0', 'Funcionando', NULL, NULL, 11, 'NOR-02', 'Sitio simulado 11, Sector LAB', '2024-11-15', '2024-12-10', '2027-12-10', '2025-01-01', '2025-02-01', 'Superintendente LAB', 'Supervisor LAB Z11', 'LAB - PABELLON METEPEC', 'Cliente LAB 11 SA de CV', 'United Elevadores LAB', 'REGION LAB', 'ZA-LAB-3', 'Garantía', 'CRITICA', 'MENSUAL', 'Garantía', '3875', 'Póliza LAB', 'Mensual LAB', 'CTR-LAB-0011', 'ESCALERA', 'MARCA LAB', 'MODELO-LAB-11', '14', '1.75', '600', '3', '2', '12', 'Funcionando', '2026-09-01', 1, 'LAB', 'LAB'),
  (930012, 'LAB - HOSPITAL SAN ANGEL INN PATRIOTISMO', 920012, 'Ciudad LAB 12', 'Estado LAB 02', '99012-LAB-RAM-DGB', 'NS-LAB-012', 'Equipo simulado 12', '0', 'No en Servicio', 'Prueba controlada', 'Caso sintético de equipo detenido', 12, 'NOR-03', 'Sitio simulado 12, Sector LAB', '2024-12-15', '2024-01-10', '2027-01-10', '2025-02-01', '2025-03-01', 'Superintendente LAB', 'Supervisor LAB Z12', 'LAB - HOSPITAL SAN ANGEL INN PATRIOTISMO', 'Cliente LAB 12 SA de CV', 'United Elevadores LAB', 'REGION LAB', 'ZA-LAB-4', 'Gratuito', 'BAJA', 'MENSUAL', 'Gratuito', '4000', 'Póliza LAB', 'Mensual LAB', 'CTR-LAB-0012', 'RAMPA', 'MARCA LAB', 'MODELO-LAB-12', '3', '1.0', '750', '1', '2', '12', 'No en Servicio', '2026-09-01', 1, 'LAB', 'LAB'),
  (930013, 'LAB - ALBOR UNIVERSIDAD', 920013, 'Ciudad LAB 13', 'Estado LAB 03', '99013-LAB-ELE-DGB', 'NS-LAB-013', 'Equipo simulado 13', '0', 'Funcionando', NULL, NULL, 1, 'CNB-01', 'Sitio simulado 13, Sector LAB', '2024-01-15', '2024-02-10', '2027-02-10', '2025-03-01', '2025-04-01', 'Superintendente LAB', 'Supervisor LAB Z01', 'LAB - ALBOR UNIVERSIDAD', 'Cliente LAB 13 SA de CV', 'United Elevadores LAB', 'REGION LAB', 'ZA-LAB-1', 'En Cobranza', 'MEDIA', 'MENSUAL', 'En Cobranza', '4125', 'Póliza LAB', 'Mensual LAB', 'CTR-LAB-0013', 'ELEVADOR', 'MARCA LAB', 'MODELO-LAB-13', '4', '1.25', '900', '2', '2', '12', 'Funcionando', '2026-09-01', 1, 'LAB', 'LAB'),
  (930014, 'LAB - PLAZA CITADEL', 920014, 'Ciudad LAB 14', 'Estado LAB 04', '99014-LAB-MON-DGB', 'NS-LAB-014', 'Equipo simulado 14', '0', 'Funcionando', NULL, NULL, 2, 'CNB-02', 'Sitio simulado 14, Sector LAB', '2024-02-15', '2024-03-10', '2027-03-10', '2025-04-01', '2025-05-01', 'Superintendente LAB', 'Supervisor LAB Z02', 'LAB - PLAZA CITADEL', 'Cliente LAB 14 SA de CV', 'United Elevadores LAB', 'REGION LAB', 'ZA-LAB-2', 'En Cobranza', 'ALTA', 'MENSUAL', 'En Cobranza', '4250', 'Póliza LAB', 'Mensual LAB', 'CTR-LAB-0014', 'MONTACARGAS', 'MARCA LAB', 'MODELO-LAB-14', '5', '1.5', '1050', '3', '2', '12', 'Funcionando', '2026-09-01', 1, 'LAB', 'LAB'),
  (930015, 'LAB - CENTRO COMERCIAL PUNTA LAGUNA', 920015, 'Ciudad LAB 15', 'Estado LAB 05', '99015-LAB-ELE-DGB', 'NS-LAB-015', 'Equipo simulado 15', '0', 'Funcionando', NULL, NULL, 3, 'CNB-03', 'Sitio simulado 15, Sector LAB', '2024-03-15', '2024-04-10', '2027-04-10', '2025-05-01', '2025-06-01', 'Superintendente LAB', 'Supervisor LAB Z03', 'LAB - CENTRO COMERCIAL PUNTA LAGUNA', 'Cliente LAB 15 SA de CV', 'United Elevadores LAB', 'REGION LAB', 'ZA-LAB-3', 'En Cobranza', 'CRITICA', 'MENSUAL', 'En Cobranza', '4375', 'Póliza LAB', 'Mensual LAB', 'CTR-LAB-0015', 'ELEVADOR', 'MARCA LAB', 'MODELO-LAB-15', '6', '1.75', '450', '1', '2', '12', 'Funcionando', '2026-09-01', 1, 'LAB', 'LAB');

-- proyecto_equivalencias: 5 registros
INSERT INTO `proyecto_equivalencias` (`id_equivalencia`, `proyecto_corellian`, `proyecto_united`, `nombre_publico`, `activo`) VALUES
  (915001, 'LAB - PUNTO VALLE COR', 'LAB - PUNTO VALLE UNI', 'LAB - PUNTO VALLE', 1),
  (915002, 'LAB - MISTIQ TEMPLE II COR', 'LAB - MISTIQ TEMPLE II UNI', 'LAB - MISTIQ TEMPLE II', 1),
  (915003, 'LAB - DURANGO 262 COR', 'LAB - DURANGO 262 UNI', 'LAB - DURANGO 262', 1),
  (915004, 'LAB - AEROPUERTO TIJUANA COR', 'LAB - AEROPUERTO TIJUANA UNI', 'LAB - AEROPUERTO TIJUANA', 1),
  (915005, 'LAB - AEROPUERTO GUADALAJARA COR', 'LAB - AEROPUERTO GUADALAJARA UNI', 'LAB - AEROPUERTO GUADALAJARA', 1);

-- portafolio_proyecto_fotos: 8 registros
INSERT INTO `portafolio_proyecto_fotos` (`id_photo`, `proyecto`, `foto_1`, `foto_2`, `foto_principal`, `activo`, `created_by`, `updated_by`) VALUES
  (931001, 'LAB - PUNTO VALLE', 'https://example.invalid/lab/fotos/portafolio/01-1.jpg', 'https://example.invalid/lab/fotos/portafolio/01-2.jpg', 'foto_1', 1, 910063, 910006),
  (931002, 'LAB - MISTIQ TEMPLE II', 'https://example.invalid/lab/fotos/portafolio/02-1.jpg', 'https://example.invalid/lab/fotos/portafolio/02-2.jpg', 'foto_1', 1, 910063, 910006),
  (931003, 'LAB - DURANGO 262', 'https://example.invalid/lab/fotos/portafolio/03-1.jpg', 'https://example.invalid/lab/fotos/portafolio/03-2.jpg', 'foto_1', 1, 910063, 910006),
  (931004, 'LAB - AEROPUERTO TIJUANA', 'https://example.invalid/lab/fotos/portafolio/04-1.jpg', 'https://example.invalid/lab/fotos/portafolio/04-2.jpg', 'foto_1', 1, 910063, 910006),
  (931005, 'LAB - AEROPUERTO GUADALAJARA', 'https://example.invalid/lab/fotos/portafolio/05-1.jpg', 'https://example.invalid/lab/fotos/portafolio/05-2.jpg', 'foto_1', 1, 910063, 910006),
  (931006, 'LAB - AEROPUERTO LOS CABOS', 'https://example.invalid/lab/fotos/portafolio/06-1.jpg', 'https://example.invalid/lab/fotos/portafolio/06-2.jpg', 'foto_1', 1, 910063, 910006),
  (931007, 'LAB - AEROPUERTO PUERTO VALLARTA', 'https://example.invalid/lab/fotos/portafolio/07-1.jpg', 'https://example.invalid/lab/fotos/portafolio/07-2.jpg', 'foto_1', 1, 910063, 910006),
  (931008, 'LAB - WALMART SC SAN JOSE DEL CABO', 'https://example.invalid/lab/fotos/portafolio/08-1.jpg', 'https://example.invalid/lab/fotos/portafolio/08-2.jpg', 'foto_1', 1, 910063, 910006);

-- portafolio_interes: 8 registros
INSERT INTO `portafolio_interes` (`id_interes`, `id_usuario`, `id_portafolio`, `origen`, `activo`) VALUES
  (932001, 910002, 930001, 'PROYECTO', 1),
  (932002, 910002, 930002, 'EQUIPO', 1),
  (932003, 910002, 930003, 'PROYECTO', 1),
  (932004, 910002, 930004, 'EQUIPO', 1),
  (932005, 910002, 930005, 'PROYECTO', 1),
  (932006, 910002, 930006, 'EQUIPO', 1),
  (932007, 910002, 930007, 'PROYECTO', 1),
  (932008, 910002, 930008, 'EQUIPO', 1);

-- servicios_preventivos: 30 registros
INSERT INTO `servicios_preventivos` (`id_servicio`, `numero_equipo`, `mes_servicio`, `tipo_servicio`, `servicio_realizado`, `programado_para`, `fecha_servicio`, `realizado_por`, `duracion_minutos`, `resultado`, `confirmado_por_id`, `confirmado_por_iniciales`, `evidencia_url`, `observaciones`, `fuente`) VALUES
  (933001, '99001-LAB-ESC-DGB', '2026-08-01', 'PREVENTIVO', 0, '2026-08-11', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pendiente programado para prueba.', 'LAB'),
  (933002, '99001-LAB-ESC-DGB', '2026-09-01', 'PREVENTIVO', 1, '2026-09-11', '2026-09-12', 'Técnico LAB 01', 93, 'CON_OBSERVACIONES', 910028, 'L28', 'https://example.invalid/lab/evidencia/mp/933002.jpg', 'Servicio preventivo sintético.', 'LAB'),
  (933003, '99002-LAB-RAM-DGB', '2026-08-01', 'PREVENTIVO', 1, '2026-08-12', '2026-08-13', 'Técnico LAB 02', 96, 'CORRECTO', 910028, 'L28', 'https://example.invalid/lab/evidencia/mp/933003.jpg', 'Servicio preventivo sintético.', 'LAB'),
  (933004, '99002-LAB-RAM-DGB', '2026-09-01', 'PREVENTIVO', 1, '2026-09-12', '2026-09-13', 'Técnico LAB 02', 96, 'CORRECTO', 910028, 'L28', 'https://example.invalid/lab/evidencia/mp/933004.jpg', 'Servicio preventivo sintético.', 'LAB'),
  (933005, '99003-LAB-ELE-DGB', '2026-08-01', 'PREVENTIVO', 1, '2026-08-13', '2026-08-14', 'Técnico LAB 03', 99, 'CON_OBSERVACIONES', 910028, 'L28', 'https://example.invalid/lab/evidencia/mp/933005.jpg', 'Servicio preventivo sintético.', 'LAB'),
  (933006, '99003-LAB-ELE-DGB', '2026-09-01', 'PREVENTIVO', 0, '2026-09-13', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pendiente programado para prueba.', 'LAB'),
  (933007, '99004-LAB-MON-DGB', '2026-08-01', 'PREVENTIVO', 0, '2026-08-14', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pendiente programado para prueba.', 'LAB'),
  (933008, '99004-LAB-MON-DGB', '2026-09-01', 'PREVENTIVO', 1, '2026-09-14', '2026-09-15', 'Técnico LAB 04', 102, 'CORRECTO', 910028, 'L28', 'https://example.invalid/lab/evidencia/mp/933008.jpg', 'Servicio preventivo sintético.', 'LAB'),
  (933009, '99005-LAB-ELE-DGB', '2026-08-01', 'PREVENTIVO', 1, '2026-08-15', '2026-08-16', 'Técnico LAB 05', 105, 'CON_OBSERVACIONES', 910028, 'L28', 'https://example.invalid/lab/evidencia/mp/933009.jpg', 'Servicio preventivo sintético.', 'LAB'),
  (933010, '99005-LAB-ELE-DGB', '2026-09-01', 'PREVENTIVO', 1, '2026-09-15', '2026-09-16', 'Técnico LAB 05', 105, 'CON_OBSERVACIONES', 910028, 'L28', 'https://example.invalid/lab/evidencia/mp/933010.jpg', 'Servicio preventivo sintético.', 'LAB'),
  (933011, '99006-LAB-ESC-DGB', '2026-08-01', 'PREVENTIVO', 1, '2026-08-16', '2026-08-17', 'Técnico LAB 01', 108, 'CORRECTO', 910028, 'L28', 'https://example.invalid/lab/evidencia/mp/933011.jpg', 'Servicio preventivo sintético.', 'LAB'),
  (933012, '99006-LAB-ESC-DGB', '2026-09-01', 'PREVENTIVO', 0, '2026-09-16', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pendiente programado para prueba.', 'LAB'),
  (933013, '99007-LAB-RAM-DGB', '2026-08-01', 'PREVENTIVO', 0, '2026-08-17', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pendiente programado para prueba.', 'LAB'),
  (933014, '99007-LAB-RAM-DGB', '2026-09-01', 'PREVENTIVO', 1, '2026-09-17', '2026-09-18', 'Técnico LAB 02', 111, 'CON_OBSERVACIONES', 910028, 'L28', 'https://example.invalid/lab/evidencia/mp/933014.jpg', 'Servicio preventivo sintético.', 'LAB'),
  (933015, '99008-LAB-ELE-DGB', '2026-08-01', 'PREVENTIVO', 1, '2026-08-18', '2026-08-19', 'Técnico LAB 03', 114, 'CORRECTO', 910028, 'L28', 'https://example.invalid/lab/evidencia/mp/933015.jpg', 'Servicio preventivo sintético.', 'LAB'),
  (933016, '99008-LAB-ELE-DGB', '2026-09-01', 'PREVENTIVO', 1, '2026-09-18', '2026-09-19', 'Técnico LAB 03', 114, 'CORRECTO', 910028, 'L28', 'https://example.invalid/lab/evidencia/mp/933016.jpg', 'Servicio preventivo sintético.', 'LAB'),
  (933017, '99009-LAB-MON-DGB', '2026-08-01', 'PREVENTIVO', 1, '2026-08-19', '2026-08-20', 'Técnico LAB 04', 117, 'CON_OBSERVACIONES', 910028, 'L28', 'https://example.invalid/lab/evidencia/mp/933017.jpg', 'Servicio preventivo sintético.', 'LAB'),
  (933018, '99009-LAB-MON-DGB', '2026-09-01', 'PREVENTIVO', 0, '2026-09-19', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pendiente programado para prueba.', 'LAB'),
  (933019, '99010-LAB-ELE-DGB', '2026-08-01', 'PREVENTIVO', 0, '2026-08-10', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pendiente programado para prueba.', 'LAB'),
  (933020, '99010-LAB-ELE-DGB', '2026-09-01', 'PREVENTIVO', 1, '2026-09-10', '2026-09-11', 'Técnico LAB 05', 120, 'CORRECTO', 910028, 'L28', 'https://example.invalid/lab/evidencia/mp/933020.jpg', 'Servicio preventivo sintético.', 'LAB'),
  (933021, '99011-LAB-ESC-DGB', '2026-08-01', 'PREVENTIVO', 1, '2026-08-11', '2026-08-12', 'Técnico LAB 01', 123, 'CON_OBSERVACIONES', 910028, 'L28', 'https://example.invalid/lab/evidencia/mp/933021.jpg', 'Servicio preventivo sintético.', 'LAB'),
  (933022, '99011-LAB-ESC-DGB', '2026-09-01', 'PREVENTIVO', 1, '2026-09-11', '2026-09-12', 'Técnico LAB 01', 123, 'CON_OBSERVACIONES', 910028, 'L28', 'https://example.invalid/lab/evidencia/mp/933022.jpg', 'Servicio preventivo sintético.', 'LAB'),
  (933023, '99012-LAB-RAM-DGB', '2026-08-01', 'PREVENTIVO', 1, '2026-08-12', '2026-08-13', 'Técnico LAB 02', 126, 'CORRECTO', 910028, 'L28', 'https://example.invalid/lab/evidencia/mp/933023.jpg', 'Servicio preventivo sintético.', 'LAB'),
  (933024, '99012-LAB-RAM-DGB', '2026-09-01', 'PREVENTIVO', 0, '2026-09-12', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pendiente programado para prueba.', 'LAB'),
  (933025, '99013-LAB-ELE-DGB', '2026-08-01', 'PREVENTIVO', 0, '2026-08-13', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pendiente programado para prueba.', 'LAB'),
  (933026, '99013-LAB-ELE-DGB', '2026-09-01', 'PREVENTIVO', 1, '2026-09-13', '2026-09-14', 'Técnico LAB 03', 129, 'CON_OBSERVACIONES', 910028, 'L28', 'https://example.invalid/lab/evidencia/mp/933026.jpg', 'Servicio preventivo sintético.', 'LAB'),
  (933027, '99014-LAB-MON-DGB', '2026-08-01', 'PREVENTIVO', 1, '2026-08-14', '2026-08-15', 'Técnico LAB 04', 132, 'CORRECTO', 910028, 'L28', 'https://example.invalid/lab/evidencia/mp/933027.jpg', 'Servicio preventivo sintético.', 'LAB'),
  (933028, '99014-LAB-MON-DGB', '2026-09-01', 'PREVENTIVO', 1, '2026-09-14', '2026-09-15', 'Técnico LAB 04', 132, 'CORRECTO', 910028, 'L28', 'https://example.invalid/lab/evidencia/mp/933028.jpg', 'Servicio preventivo sintético.', 'LAB'),
  (933029, '99015-LAB-ELE-DGB', '2026-08-01', 'PREVENTIVO', 1, '2026-08-15', '2026-08-16', 'Técnico LAB 05', 135, 'CON_OBSERVACIONES', 910028, 'L28', 'https://example.invalid/lab/evidencia/mp/933029.jpg', 'Servicio preventivo sintético.', 'LAB'),
  (933030, '99015-LAB-ELE-DGB', '2026-09-01', 'PREVENTIVO', 0, '2026-09-15', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pendiente programado para prueba.', 'LAB');

-- tickets: 30 registros
INSERT INTO `tickets` (`id`, `ticket`, `id_interno`, `folio`, `estado_ticket`, `estado`, `ciudad`, `proyecto`, `equipo`, `codigo_equipo`, `referencia_en_zona_operativa`, `zona`, `descripcion`, `fecha_reporte`, `h_reporte`, `estatus_equipo_ir`, `fecha_llegada`, `h_llegada`, `persona_que_atiende`, `fecha_cierre`, `h_solucion`, `tecnico`, `supervisor`, `estatus_equipo_final`, `causa`, `accion_en_cierre`, `responsabilidad`, `causa_falla`, `tiempo_llegada`, `tiempo_solucion`, `tipo_equipo`, `prioridad`, `ejecutivo_call`, `blt_empleado`, `ticket_excede`, `zona_administrativa`, `zona_de_falla`, `mes_reporte`, `proyecto_padre`, `vobo_estado`, `vobo_comentario`, `vobo_por_id`, `vobo_por_nombre`, `vobo_en`) VALUES
  (940001, 'TKT-LAB-940001', 'LAB-940001', 'F-LAB-940001', 'Abierto', 'LAB', 'Ciudad LAB 01', 'LAB - PUNTO VALLE', '99001-LAB-ESC-DGB', '99001-LAB-ESC-DGB', 'REF-LAB-01', 'CNB-01', 'Falla sintética 1 del equipo 01', '2026-09-03 09:15:00', '09:15', 'Detenido', '2026-09-03 10:00:00', '10:00', 'Contacto LAB', NULL, NULL, 'Técnico LAB 03', 'Supervisor LAB Z01', 'Detenido', 'Prueba de sensor', NULL, 'BLT', 'SENSOR', 50, NULL, 'Elevador', 'MEDIA', 'Call LAB 1', 'Personal LAB', 'NO', 'ZA-LAB-1', 'CNB-01', 'Septiembre', 'LAB - PUNTO VALLE', 'PENDIENTE', NULL, NULL, NULL, NULL),
  (940002, 'TKT-LAB-940002', 'LAB-940002', 'F-LAB-940002', 'Cerrado', 'LAB', 'Ciudad LAB 01', 'LAB - PUNTO VALLE', '99001-LAB-ESC-DGB', '99001-LAB-ESC-DGB', 'REF-LAB-01', 'CNB-01', 'Falla sintética 2 del equipo 01', '2026-09-03 10:15:00', '10:15', 'Detenido', '2026-09-03 11:00:00', '11:00', 'Contacto LAB', '2026-09-03 13:30:00', '13:30', 'Técnico LAB 04', 'Supervisor LAB Z01', 'Funcionando', 'Ajuste de puerta', 'Corrección sintética aplicada.', 'CLIENTE', 'PUERTA', 55, 115, 'Elevador', 'ALTA', 'Call LAB 2', 'Personal LAB', 'NO', 'ZA-LAB-1', 'CNB-01', 'Septiembre', 'LAB - PUNTO VALLE', 'VALIDADO', 'Validación de laboratorio.', 910002, 'Usuario LAB Director Mantenimiento', '2026-09-03 13:00:00'),
  (940003, 'TKT-LAB-940003', 'LAB-940003', 'F-LAB-940003', 'Cerrado', 'LAB', 'Ciudad LAB 02', 'LAB - MISTIQ TEMPLE II', '99002-LAB-RAM-DGB', '99002-LAB-RAM-DGB', 'REF-LAB-02', 'CNB-02', 'Falla sintética 1 del equipo 02', '2026-09-04 09:15:00', '09:15', 'Detenido', '2026-09-04 10:00:00', '10:00', 'Contacto LAB', '2026-09-04 12:30:00', '12:30', 'Técnico LAB 04', 'Supervisor LAB Z02', 'Funcionando', 'Prueba de sensor', 'Corrección sintética aplicada.', 'BLT', 'SENSOR', 50, 105, 'Elevador', 'MEDIA', 'Call LAB 1', 'Personal LAB', 'NO', 'ZA-LAB-2', 'CNB-02', 'Septiembre', 'LAB - MISTIQ TEMPLE II', 'VALIDADO', 'Validación de laboratorio.', 910002, 'Usuario LAB Director Mantenimiento', '2026-09-04 13:00:00'),
  (940004, 'TKT-LAB-940004', 'LAB-940004', 'F-LAB-940004', 'Abierto', 'LAB', 'Ciudad LAB 02', 'LAB - MISTIQ TEMPLE II', '99002-LAB-RAM-DGB', '99002-LAB-RAM-DGB', 'REF-LAB-02', 'CNB-02', 'Falla sintética 2 del equipo 02', '2026-09-04 10:15:00', '10:15', 'Detenido', '2026-09-04 11:00:00', '11:00', 'Contacto LAB', NULL, NULL, 'Técnico LAB 05', 'Supervisor LAB Z02', 'Detenido', 'Ajuste de puerta', NULL, 'CLIENTE', 'PUERTA', 55, NULL, 'Elevador', 'ALTA', 'Call LAB 2', 'Personal LAB', 'NO', 'ZA-LAB-2', 'CNB-02', 'Septiembre', 'LAB - MISTIQ TEMPLE II', 'PENDIENTE', NULL, NULL, NULL, NULL),
  (940005, 'TKT-LAB-940005', 'LAB-940005', 'F-LAB-940005', 'Abierto', 'LAB', 'Ciudad LAB 03', 'LAB - DURANGO 262', '99003-LAB-ELE-DGB', '99003-LAB-ELE-DGB', 'REF-LAB-03', 'CNB-03', 'Falla sintética 1 del equipo 03', '2026-09-05 09:15:00', '09:15', 'Detenido', '2026-09-05 10:00:00', '10:00', 'Contacto LAB', NULL, NULL, 'Técnico LAB 05', 'Supervisor LAB Z03', 'Detenido', 'Prueba de sensor', NULL, 'BLT', 'SENSOR', 50, NULL, 'Elevador', 'MEDIA', 'Call LAB 1', 'Personal LAB', 'NO', 'ZA-LAB-3', 'CNB-03', 'Septiembre', 'LAB - DURANGO 262', 'PENDIENTE', NULL, NULL, NULL, NULL),
  (940006, 'TKT-LAB-940006', 'LAB-940006', 'F-LAB-940006', 'Abierto', 'LAB', 'Ciudad LAB 03', 'LAB - DURANGO 262', '99003-LAB-ELE-DGB', '99003-LAB-ELE-DGB', 'REF-LAB-03', 'CNB-03', 'Falla sintética 2 del equipo 03', '2026-09-05 10:15:00', '10:15', 'Detenido', '2026-09-05 11:00:00', '11:00', 'Contacto LAB', NULL, NULL, 'Técnico LAB 01', 'Supervisor LAB Z03', 'Detenido', 'Ajuste de puerta', NULL, 'CLIENTE', 'PUERTA', 55, NULL, 'Elevador', 'ALTA', 'Call LAB 2', 'Personal LAB', 'NO', 'ZA-LAB-3', 'CNB-03', 'Septiembre', 'LAB - DURANGO 262', 'PENDIENTE', NULL, NULL, NULL, NULL),
  (940007, 'TKT-LAB-940007', 'LAB-940007', 'F-LAB-940007', 'Abierto', 'LAB', 'Ciudad LAB 04', 'LAB - AEROPUERTO TIJUANA', '99004-LAB-MON-DGB', '99004-LAB-MON-DGB', 'REF-LAB-04', 'CNA-01', 'Persona atrapada - simulación de laboratorio', '2026-09-06 09:15:00', '09:15', 'Detenido', '2026-09-06 10:00:00', '10:00', 'Contacto LAB', NULL, NULL, 'Técnico LAB 01', 'Supervisor LAB Z04', 'Detenido', 'Prueba de sensor', NULL, 'BLT', 'PERSONA ATRAPADA', 50, NULL, 'Elevador', 'CRITICA', 'Call LAB 1', 'Personal LAB', 'NO', 'ZA-LAB-4', 'CNA-01', 'Septiembre', 'LAB - AEROPUERTO TIJUANA', 'PENDIENTE', NULL, NULL, NULL, NULL),
  (940008, 'TKT-LAB-940008', 'LAB-940008', 'F-LAB-940008', 'Cerrado', 'LAB', 'Ciudad LAB 04', 'LAB - AEROPUERTO TIJUANA', '99004-LAB-MON-DGB', '99004-LAB-MON-DGB', 'REF-LAB-04', 'CNA-01', 'Falla sintética 2 del equipo 04', '2026-09-06 10:15:00', '10:15', 'Detenido', '2026-09-06 11:00:00', '11:00', 'Contacto LAB', '2026-09-06 13:30:00', '13:30', 'Técnico LAB 02', 'Supervisor LAB Z04', 'Funcionando', 'Ajuste de puerta', 'Corrección sintética aplicada.', 'CLIENTE', 'PUERTA', 55, 115, 'Elevador', 'ALTA', 'Call LAB 2', 'Personal LAB', 'NO', 'ZA-LAB-4', 'CNA-01', 'Septiembre', 'LAB - AEROPUERTO TIJUANA', 'VALIDADO', 'Validación de laboratorio.', 910002, 'Usuario LAB Director Mantenimiento', '2026-09-06 13:00:00'),
  (940009, 'TKT-LAB-940009', 'LAB-940009', 'F-LAB-940009', 'Cerrado', 'LAB', 'Ciudad LAB 05', 'LAB - AEROPUERTO GUADALAJARA', '99005-LAB-ELE-DGB', '99005-LAB-ELE-DGB', 'REF-LAB-05', 'CNA-02', 'Falla sintética 1 del equipo 05', '2026-09-07 09:15:00', '09:15', 'Detenido', '2026-09-07 10:00:00', '10:00', 'Contacto LAB', '2026-09-07 12:30:00', '12:30', 'Técnico LAB 02', 'Supervisor LAB Z05', 'Funcionando', 'Prueba de sensor', 'Corrección sintética aplicada.', 'BLT', 'SENSOR', 50, 105, 'Elevador', 'MEDIA', 'Call LAB 1', 'Personal LAB', 'SI', 'ZA-LAB-1', 'CNA-02', 'Septiembre', 'LAB - AEROPUERTO GUADALAJARA', 'VALIDADO', 'Validación de laboratorio.', 910002, 'Usuario LAB Director Mantenimiento', '2026-09-07 13:00:00'),
  (940010, 'TKT-LAB-940010', 'LAB-940010', 'F-LAB-940010', 'Abierto', 'LAB', 'Ciudad LAB 05', 'LAB - AEROPUERTO GUADALAJARA', '99005-LAB-ELE-DGB', '99005-LAB-ELE-DGB', 'REF-LAB-05', 'CNA-02', 'Falla sintética 2 del equipo 05', '2026-09-07 10:15:00', '10:15', 'Detenido', '2026-09-07 11:00:00', '11:00', 'Contacto LAB', NULL, NULL, 'Técnico LAB 03', 'Supervisor LAB Z05', 'Detenido', 'Ajuste de puerta', NULL, 'CLIENTE', 'PUERTA', 55, NULL, 'Elevador', 'ALTA', 'Call LAB 2', 'Personal LAB', 'SI', 'ZA-LAB-1', 'CNA-02', 'Septiembre', 'LAB - AEROPUERTO GUADALAJARA', 'PENDIENTE', NULL, NULL, NULL, NULL),
  (940011, 'TKT-LAB-940011', 'LAB-940011', 'F-LAB-940011', 'Abierto', 'LAB', 'Ciudad LAB 06', 'LAB - AEROPUERTO LOS CABOS', '99006-LAB-ESC-DGB', '99006-LAB-ESC-DGB', 'REF-LAB-06', 'CNA-03', 'Falla sintética 1 del equipo 06', '2026-09-08 09:15:00', '09:15', 'Detenido', '2026-09-08 10:00:00', '10:00', 'Contacto LAB', NULL, NULL, 'Técnico LAB 03', 'Supervisor LAB Z06', 'Detenido', 'Prueba de sensor', NULL, 'BLT', 'SENSOR', 50, NULL, 'Elevador', 'MEDIA', 'Call LAB 1', 'Personal LAB', 'NO', 'ZA-LAB-2', 'CNA-03', 'Septiembre', 'LAB - AEROPUERTO LOS CABOS', 'PENDIENTE', NULL, NULL, NULL, NULL),
  (940012, 'TKT-LAB-940012', 'LAB-940012', 'F-LAB-940012', 'Abierto', 'LAB', 'Ciudad LAB 06', 'LAB - AEROPUERTO LOS CABOS', '99006-LAB-ESC-DGB', '99006-LAB-ESC-DGB', 'REF-LAB-06', 'CNA-03', 'Falla sintética 2 del equipo 06', '2026-09-08 10:15:00', '10:15', 'Detenido', '2026-09-08 11:00:00', '11:00', 'Contacto LAB', NULL, NULL, 'Técnico LAB 04', 'Supervisor LAB Z06', 'Detenido', 'Ajuste de puerta', NULL, 'CLIENTE', 'PUERTA', 55, NULL, 'Elevador', 'ALTA', 'Call LAB 2', 'Personal LAB', 'NO', 'ZA-LAB-2', 'CNA-03', 'Septiembre', 'LAB - AEROPUERTO LOS CABOS', 'PENDIENTE', NULL, NULL, NULL, NULL),
  (940013, 'TKT-LAB-940013', 'LAB-940013', 'F-LAB-940013', 'Abierto', 'LAB', 'Ciudad LAB 07', 'LAB - AEROPUERTO PUERTO VALLARTA', '99007-LAB-RAM-DGB', '99007-LAB-RAM-DGB', 'REF-LAB-07', 'CNA-04', 'Falla sintética 1 del equipo 07', '2026-09-09 09:15:00', '09:15', 'Detenido', '2026-09-09 10:00:00', '10:00', 'Contacto LAB', NULL, NULL, 'Técnico LAB 04', 'Supervisor LAB Z07', 'Detenido', 'Prueba de sensor', NULL, 'BLT', 'SENSOR', 50, NULL, 'Elevador', 'MEDIA', 'Call LAB 1', 'Personal LAB', 'NO', 'ZA-LAB-3', 'CNA-04', 'Septiembre', 'LAB - AEROPUERTO PUERTO VALLARTA', 'PENDIENTE', NULL, NULL, NULL, NULL),
  (940014, 'TKT-LAB-940014', 'LAB-940014', 'F-LAB-940014', 'Cerrado', 'LAB', 'Ciudad LAB 07', 'LAB - AEROPUERTO PUERTO VALLARTA', '99007-LAB-RAM-DGB', '99007-LAB-RAM-DGB', 'REF-LAB-07', 'CNA-04', 'Falla sintética 2 del equipo 07', '2026-09-09 10:15:00', '10:15', 'Detenido', '2026-09-09 11:00:00', '11:00', 'Contacto LAB', '2026-09-09 13:30:00', '13:30', 'Técnico LAB 05', 'Supervisor LAB Z07', 'Funcionando', 'Ajuste de puerta', 'Corrección sintética aplicada.', 'CLIENTE', 'PUERTA', 55, 115, 'Elevador', 'ALTA', 'Call LAB 2', 'Personal LAB', 'NO', 'ZA-LAB-3', 'CNA-04', 'Septiembre', 'LAB - AEROPUERTO PUERTO VALLARTA', 'VALIDADO', 'Validación de laboratorio.', 910002, 'Usuario LAB Director Mantenimiento', '2026-09-09 13:00:00'),
  (940015, 'TKT-LAB-940015', 'LAB-940015', 'F-LAB-940015', 'Cerrado', 'LAB', 'Ciudad LAB 08', 'LAB - WALMART SC SAN JOSE DEL CABO', '99008-LAB-ELE-DGB', '99008-LAB-ELE-DGB', 'REF-LAB-08', 'OCC-01', 'Falla sintética 1 del equipo 08', '2026-09-10 09:15:00', '09:15', 'Detenido', '2026-09-10 10:00:00', '10:00', 'Contacto LAB', '2026-09-10 12:30:00', '12:30', 'Técnico LAB 05', 'Supervisor LAB Z08', 'Funcionando', 'Prueba de sensor', 'Corrección sintética aplicada.', 'BLT', 'SENSOR', 50, 105, 'Elevador', 'MEDIA', 'Call LAB 1', 'Personal LAB', 'NO', 'ZA-LAB-4', 'OCC-01', 'Septiembre', 'LAB - WALMART SC SAN JOSE DEL CABO', 'VALIDADO', 'Validación de laboratorio.', 910002, 'Usuario LAB Director Mantenimiento', '2026-09-10 13:00:00'),
  (940016, 'TKT-LAB-940016', 'LAB-940016', 'F-LAB-940016', 'Abierto', 'LAB', 'Ciudad LAB 08', 'LAB - WALMART SC SAN JOSE DEL CABO', '99008-LAB-ELE-DGB', '99008-LAB-ELE-DGB', 'REF-LAB-08', 'OCC-01', 'Falla sintética 2 del equipo 08', '2026-09-10 10:15:00', '10:15', 'Detenido', '2026-09-10 11:00:00', '11:00', 'Contacto LAB', NULL, NULL, 'Técnico LAB 01', 'Supervisor LAB Z08', 'Detenido', 'Ajuste de puerta', NULL, 'CLIENTE', 'PUERTA', 55, NULL, 'Elevador', 'ALTA', 'Call LAB 2', 'Personal LAB', 'NO', 'ZA-LAB-4', 'OCC-01', 'Septiembre', 'LAB - WALMART SC SAN JOSE DEL CABO', 'PENDIENTE', NULL, NULL, NULL, NULL),
  (940017, 'TKT-LAB-940017', 'LAB-940017', 'F-LAB-940017', 'Abierto', 'LAB', 'Ciudad LAB 09', 'LAB - AKOYA SKY LIVING', '99009-LAB-MON-DGB', '99009-LAB-MON-DGB', 'REF-LAB-09', 'OCC-02', 'Falla sintética 1 del equipo 09', '2026-09-11 09:15:00', '09:15', 'Detenido', '2026-09-11 10:00:00', '10:00', 'Contacto LAB', NULL, NULL, 'Técnico LAB 01', 'Supervisor LAB Z09', 'Detenido', 'Prueba de sensor', NULL, 'BLT', 'SENSOR', 50, NULL, 'Elevador', 'MEDIA', 'Call LAB 1', 'Personal LAB', 'NO', 'ZA-LAB-1', 'OCC-02', 'Septiembre', 'LAB - AKOYA SKY LIVING', 'PENDIENTE', NULL, NULL, NULL, NULL),
  (940018, 'TKT-LAB-940018', 'LAB-940018', 'F-LAB-940018', 'Abierto', 'LAB', 'Ciudad LAB 09', 'LAB - AKOYA SKY LIVING', '99009-LAB-MON-DGB', '99009-LAB-MON-DGB', 'REF-LAB-09', 'OCC-02', 'Falla sintética 2 del equipo 09', '2026-09-11 10:15:00', '10:15', 'Detenido', '2026-09-11 11:00:00', '11:00', 'Contacto LAB', NULL, NULL, 'Técnico LAB 02', 'Supervisor LAB Z09', 'Detenido', 'Ajuste de puerta', NULL, 'CLIENTE', 'PUERTA', 55, NULL, 'Elevador', 'ALTA', 'Call LAB 2', 'Personal LAB', 'NO', 'ZA-LAB-1', 'OCC-02', 'Septiembre', 'LAB - AKOYA SKY LIVING', 'PENDIENTE', NULL, NULL, NULL, NULL),
  (940019, 'TKT-LAB-940019', 'LAB-940019', 'F-LAB-940019', 'Abierto', 'LAB', 'Ciudad LAB 10', 'LAB - TORRE 22-22', '99010-LAB-ELE-DGB', '99010-LAB-ELE-DGB', 'REF-LAB-10', 'NOR-01', 'Falla sintética 1 del equipo 10', '2026-09-12 09:15:00', '09:15', 'Detenido', '2026-09-12 10:00:00', '10:00', 'Contacto LAB', NULL, NULL, 'Técnico LAB 02', 'Supervisor LAB Z10', 'Detenido', 'Prueba de sensor', NULL, 'BLT', 'SENSOR', 50, NULL, 'Elevador', 'MEDIA', 'Call LAB 1', 'Personal LAB', 'SI', 'ZA-LAB-2', 'NOR-01', 'Septiembre', 'LAB - TORRE 22-22', 'PENDIENTE', NULL, NULL, NULL, NULL),
  (940020, 'TKT-LAB-940020', 'LAB-940020', 'F-LAB-940020', 'Cerrado', 'LAB', 'Ciudad LAB 10', 'LAB - TORRE 22-22', '99010-LAB-ELE-DGB', '99010-LAB-ELE-DGB', 'REF-LAB-10', 'NOR-01', 'Falla sintética 2 del equipo 10', '2026-09-12 10:15:00', '10:15', 'Detenido', '2026-09-12 11:00:00', '11:00', 'Contacto LAB', '2026-09-12 13:30:00', '13:30', 'Técnico LAB 03', 'Supervisor LAB Z10', 'Funcionando', 'Ajuste de puerta', 'Corrección sintética aplicada.', 'CLIENTE', 'PUERTA', 55, 115, 'Elevador', 'ALTA', 'Call LAB 2', 'Personal LAB', 'SI', 'ZA-LAB-2', 'NOR-01', 'Septiembre', 'LAB - TORRE 22-22', 'VALIDADO', 'Validación de laboratorio.', 910002, 'Usuario LAB Director Mantenimiento', '2026-09-12 13:00:00'),
  (940021, 'TKT-LAB-940021', 'LAB-940021', 'F-LAB-940021', 'Cerrado', 'LAB', 'Ciudad LAB 11', 'LAB - PABELLON METEPEC', '99011-LAB-ESC-DGB', '99011-LAB-ESC-DGB', 'REF-LAB-11', 'NOR-02', 'Falla sintética 1 del equipo 11', '2026-09-13 09:15:00', '09:15', 'Detenido', '2026-09-13 10:00:00', '10:00', 'Contacto LAB', '2026-09-13 12:30:00', '12:30', 'Técnico LAB 03', 'Supervisor LAB Z11', 'Funcionando', 'Prueba de sensor', 'Corrección sintética aplicada.', 'BLT', 'SENSOR', 50, 105, 'Elevador', 'MEDIA', 'Call LAB 1', 'Personal LAB', 'NO', 'ZA-LAB-3', 'NOR-02', 'Septiembre', 'LAB - PABELLON METEPEC', 'VALIDADO', 'Validación de laboratorio.', 910002, 'Usuario LAB Director Mantenimiento', '2026-09-13 13:00:00'),
  (940022, 'TKT-LAB-940022', 'LAB-940022', 'F-LAB-940022', 'Abierto', 'LAB', 'Ciudad LAB 11', 'LAB - PABELLON METEPEC', '99011-LAB-ESC-DGB', '99011-LAB-ESC-DGB', 'REF-LAB-11', 'NOR-02', 'Falla sintética 2 del equipo 11', '2026-09-13 10:15:00', '10:15', 'Detenido', '2026-09-13 11:00:00', '11:00', 'Contacto LAB', NULL, NULL, 'Técnico LAB 04', 'Supervisor LAB Z11', 'Detenido', 'Ajuste de puerta', NULL, 'CLIENTE', 'PUERTA', 55, NULL, 'Elevador', 'ALTA', 'Call LAB 2', 'Personal LAB', 'NO', 'ZA-LAB-3', 'NOR-02', 'Septiembre', 'LAB - PABELLON METEPEC', 'PENDIENTE', NULL, NULL, NULL, NULL),
  (940023, 'TKT-LAB-940023', 'LAB-940023', 'F-LAB-940023', 'Abierto', 'LAB', 'Ciudad LAB 12', 'LAB - HOSPITAL SAN ANGEL INN PATRIOTISMO', '99012-LAB-RAM-DGB', '99012-LAB-RAM-DGB', 'REF-LAB-12', 'NOR-03', 'Falla sintética 1 del equipo 12', '2026-09-14 09:15:00', '09:15', 'Detenido', '2026-09-14 10:00:00', '10:00', 'Contacto LAB', NULL, NULL, 'Técnico LAB 04', 'Supervisor LAB Z12', 'Detenido', 'Prueba de sensor', NULL, 'BLT', 'SENSOR', 50, NULL, 'Elevador', 'MEDIA', 'Call LAB 1', 'Personal LAB', 'NO', 'ZA-LAB-4', 'NOR-03', 'Septiembre', 'LAB - HOSPITAL SAN ANGEL INN PATRIOTISMO', 'PENDIENTE', NULL, NULL, NULL, NULL),
  (940024, 'TKT-LAB-940024', 'LAB-940024', 'F-LAB-940024', 'Abierto', 'LAB', 'Ciudad LAB 12', 'LAB - HOSPITAL SAN ANGEL INN PATRIOTISMO', '99012-LAB-RAM-DGB', '99012-LAB-RAM-DGB', 'REF-LAB-12', 'NOR-03', 'Falla sintética 2 del equipo 12', '2026-09-14 10:15:00', '10:15', 'Detenido', '2026-09-14 11:00:00', '11:00', 'Contacto LAB', NULL, NULL, 'Técnico LAB 05', 'Supervisor LAB Z12', 'Detenido', 'Ajuste de puerta', NULL, 'CLIENTE', 'PUERTA', 55, NULL, 'Elevador', 'ALTA', 'Call LAB 2', 'Personal LAB', 'NO', 'ZA-LAB-4', 'NOR-03', 'Septiembre', 'LAB - HOSPITAL SAN ANGEL INN PATRIOTISMO', 'PENDIENTE', NULL, NULL, NULL, NULL),
  (940025, 'TKT-LAB-940025', 'LAB-940025', 'F-LAB-940025', 'Abierto', 'LAB', 'Ciudad LAB 13', 'LAB - ALBOR UNIVERSIDAD', '99013-LAB-ELE-DGB', '99013-LAB-ELE-DGB', 'REF-LAB-13', 'CNB-01', 'Falla sintética 1 del equipo 13', '2026-09-15 09:15:00', '09:15', 'Detenido', '2026-09-15 10:00:00', '10:00', 'Contacto LAB', NULL, NULL, 'Técnico LAB 05', 'Supervisor LAB Z01', 'Detenido', 'Prueba de sensor', NULL, 'BLT', 'SENSOR', 50, NULL, 'Elevador', 'MEDIA', 'Call LAB 1', 'Personal LAB', 'NO', 'ZA-LAB-1', 'CNB-01', 'Septiembre', 'LAB - ALBOR UNIVERSIDAD', 'PENDIENTE', NULL, NULL, NULL, NULL),
  (940026, 'TKT-LAB-940026', 'LAB-940026', 'F-LAB-940026', 'Cerrado', 'LAB', 'Ciudad LAB 13', 'LAB - ALBOR UNIVERSIDAD', '99013-LAB-ELE-DGB', '99013-LAB-ELE-DGB', 'REF-LAB-13', 'CNB-01', 'Falla sintética 2 del equipo 13', '2026-09-15 10:15:00', '10:15', 'Detenido', '2026-09-15 11:00:00', '11:00', 'Contacto LAB', '2026-09-15 13:30:00', '13:30', 'Técnico LAB 01', 'Supervisor LAB Z01', 'Funcionando', 'Ajuste de puerta', 'Corrección sintética aplicada.', 'CLIENTE', 'PUERTA', 55, 115, 'Elevador', 'ALTA', 'Call LAB 2', 'Personal LAB', 'NO', 'ZA-LAB-1', 'CNB-01', 'Septiembre', 'LAB - ALBOR UNIVERSIDAD', 'VALIDADO', 'Validación de laboratorio.', 910002, 'Usuario LAB Director Mantenimiento', '2026-09-15 13:00:00'),
  (940027, 'TKT-LAB-940027', 'LAB-940027', 'F-LAB-940027', 'Cerrado', 'LAB', 'Ciudad LAB 14', 'LAB - PLAZA CITADEL', '99014-LAB-MON-DGB', '99014-LAB-MON-DGB', 'REF-LAB-14', 'CNB-02', 'Falla sintética 1 del equipo 14', '2026-09-16 09:15:00', '09:15', 'Detenido', '2026-09-16 10:00:00', '10:00', 'Contacto LAB', '2026-09-16 12:30:00', '12:30', 'Técnico LAB 01', 'Supervisor LAB Z02', 'Funcionando', 'Prueba de sensor', 'Corrección sintética aplicada.', 'BLT', 'SENSOR', 50, 105, 'Elevador', 'MEDIA', 'Call LAB 1', 'Personal LAB', 'NO', 'ZA-LAB-2', 'CNB-02', 'Septiembre', 'LAB - PLAZA CITADEL', 'VALIDADO', 'Validación de laboratorio.', 910002, 'Usuario LAB Director Mantenimiento', '2026-09-16 13:00:00'),
  (940028, 'TKT-LAB-940028', 'LAB-940028', 'F-LAB-940028', 'Abierto', 'LAB', 'Ciudad LAB 14', 'LAB - PLAZA CITADEL', '99014-LAB-MON-DGB', '99014-LAB-MON-DGB', 'REF-LAB-14', 'CNB-02', 'Falla sintética 2 del equipo 14', '2026-09-16 10:15:00', '10:15', 'Detenido', '2026-09-16 11:00:00', '11:00', 'Contacto LAB', NULL, NULL, 'Técnico LAB 02', 'Supervisor LAB Z02', 'Detenido', 'Ajuste de puerta', NULL, 'CLIENTE', 'PUERTA', 55, NULL, 'Elevador', 'ALTA', 'Call LAB 2', 'Personal LAB', 'NO', 'ZA-LAB-2', 'CNB-02', 'Septiembre', 'LAB - PLAZA CITADEL', 'PENDIENTE', NULL, NULL, NULL, NULL),
  (940029, 'TKT-LAB-940029', 'LAB-940029', 'F-LAB-940029', 'Abierto', 'LAB', 'Ciudad LAB 15', 'LAB - CENTRO COMERCIAL PUNTA LAGUNA', '99015-LAB-ELE-DGB', '99015-LAB-ELE-DGB', 'REF-LAB-15', 'CNB-03', 'Falla sintética 1 del equipo 15', '2026-09-17 09:15:00', '09:15', 'Detenido', '2026-09-17 10:00:00', '10:00', 'Contacto LAB', NULL, NULL, 'Técnico LAB 02', 'Supervisor LAB Z03', 'Detenido', 'Prueba de sensor', NULL, 'BLT', 'SENSOR', 50, NULL, 'Elevador', 'MEDIA', 'Call LAB 1', 'Personal LAB', 'SI', 'ZA-LAB-3', 'CNB-03', 'Septiembre', 'LAB - CENTRO COMERCIAL PUNTA LAGUNA', 'PENDIENTE', NULL, NULL, NULL, NULL),
  (940030, 'TKT-LAB-940030', 'LAB-940030', 'F-LAB-940030', 'Abierto', 'LAB', 'Ciudad LAB 15', 'LAB - CENTRO COMERCIAL PUNTA LAGUNA', '99015-LAB-ELE-DGB', '99015-LAB-ELE-DGB', 'REF-LAB-15', 'CNB-03', 'Falla sintética 2 del equipo 15', '2026-09-17 10:15:00', '10:15', 'Detenido', '2026-09-17 11:00:00', '11:00', 'Contacto LAB', NULL, NULL, 'Técnico LAB 03', 'Supervisor LAB Z03', 'Detenido', 'Ajuste de puerta', NULL, 'CLIENTE', 'PUERTA', 55, NULL, 'Elevador', 'ALTA', 'Call LAB 2', 'Personal LAB', 'SI', 'ZA-LAB-3', 'CNB-03', 'Septiembre', 'LAB - CENTRO COMERCIAL PUNTA LAGUNA', 'PENDIENTE', NULL, NULL, NULL, NULL);

-- ticket_comentarios: 30 registros
INSERT INTO `ticket_comentarios` (`id_comentario`, `id_ticket`, `id_usuario`, `comentario`, `activo`, `fecha_creacion`) VALUES
  (941001, 940001, 910028, 'Comentario sintético del ticket 940001.', 1, '2026-09-03 10:11:00'),
  (941002, 940002, 910028, 'Comentario sintético del ticket 940002.', 1, '2026-09-03 10:12:00'),
  (941003, 940003, 910028, 'Comentario sintético del ticket 940003.', 1, '2026-09-04 10:11:00'),
  (941004, 940004, 910028, 'Comentario sintético del ticket 940004.', 1, '2026-09-04 10:12:00'),
  (941005, 940005, 910028, 'Comentario sintético del ticket 940005.', 1, '2026-09-05 10:11:00'),
  (941006, 940006, 910028, 'Comentario sintético del ticket 940006.', 1, '2026-09-05 10:12:00'),
  (941007, 940007, 910028, 'Comentario sintético del ticket 940007.', 1, '2026-09-06 10:11:00'),
  (941008, 940008, 910028, 'Comentario sintético del ticket 940008.', 1, '2026-09-06 10:12:00'),
  (941009, 940009, 910028, 'Comentario sintético del ticket 940009.', 1, '2026-09-07 10:11:00'),
  (941010, 940010, 910028, 'Comentario sintético del ticket 940010.', 1, '2026-09-07 10:12:00'),
  (941011, 940011, 910028, 'Comentario sintético del ticket 940011.', 1, '2026-09-08 10:11:00'),
  (941012, 940012, 910028, 'Comentario sintético del ticket 940012.', 1, '2026-09-08 10:12:00'),
  (941013, 940013, 910028, 'Comentario sintético del ticket 940013.', 1, '2026-09-09 10:11:00'),
  (941014, 940014, 910028, 'Comentario sintético del ticket 940014.', 1, '2026-09-09 10:12:00'),
  (941015, 940015, 910028, 'Comentario sintético del ticket 940015.', 1, '2026-09-10 10:11:00'),
  (941016, 940016, 910028, 'Comentario sintético del ticket 940016.', 1, '2026-09-10 10:12:00'),
  (941017, 940017, 910028, 'Comentario sintético del ticket 940017.', 1, '2026-09-11 10:11:00'),
  (941018, 940018, 910028, 'Comentario sintético del ticket 940018.', 1, '2026-09-11 10:12:00'),
  (941019, 940019, 910028, 'Comentario sintético del ticket 940019.', 1, '2026-09-12 10:11:00'),
  (941020, 940020, 910028, 'Comentario sintético del ticket 940020.', 1, '2026-09-12 10:12:00'),
  (941021, 940021, 910028, 'Comentario sintético del ticket 940021.', 1, '2026-09-13 10:11:00'),
  (941022, 940022, 910028, 'Comentario sintético del ticket 940022.', 1, '2026-09-13 10:12:00'),
  (941023, 940023, 910028, 'Comentario sintético del ticket 940023.', 1, '2026-09-14 10:11:00'),
  (941024, 940024, 910028, 'Comentario sintético del ticket 940024.', 1, '2026-09-14 10:12:00'),
  (941025, 940025, 910028, 'Comentario sintético del ticket 940025.', 1, '2026-09-15 10:11:00'),
  (941026, 940026, 910028, 'Comentario sintético del ticket 940026.', 1, '2026-09-15 10:12:00'),
  (941027, 940027, 910028, 'Comentario sintético del ticket 940027.', 1, '2026-09-16 10:11:00'),
  (941028, 940028, 910028, 'Comentario sintético del ticket 940028.', 1, '2026-09-16 10:12:00'),
  (941029, 940029, 910028, 'Comentario sintético del ticket 940029.', 1, '2026-09-17 10:11:00'),
  (941030, 940030, 910028, 'Comentario sintético del ticket 940030.', 1, '2026-09-17 10:12:00');

-- ticket_validaciones: 10 registros
INSERT INTO `ticket_validaciones` (`id_validacion`, `id_ticket`, `id_usuario`, `estado_anterior`, `estado_nuevo`, `comentario`, `ip_origen`, `fecha_creacion`) VALUES
  (942002, 940002, 910002, 'PENDIENTE', 'VALIDADO', 'Vo.Bo. sintético para pruebas.', '192.0.2.10', '2026-09-03 13:05:00'),
  (942003, 940003, 910002, 'PENDIENTE', 'VALIDADO', 'Vo.Bo. sintético para pruebas.', '192.0.2.10', '2026-09-04 13:05:00'),
  (942008, 940008, 910002, 'PENDIENTE', 'VALIDADO', 'Vo.Bo. sintético para pruebas.', '192.0.2.10', '2026-09-06 13:05:00'),
  (942009, 940009, 910002, 'PENDIENTE', 'VALIDADO', 'Vo.Bo. sintético para pruebas.', '192.0.2.10', '2026-09-07 13:05:00'),
  (942014, 940014, 910002, 'PENDIENTE', 'VALIDADO', 'Vo.Bo. sintético para pruebas.', '192.0.2.10', '2026-09-09 13:05:00'),
  (942015, 940015, 910002, 'PENDIENTE', 'VALIDADO', 'Vo.Bo. sintético para pruebas.', '192.0.2.10', '2026-09-10 13:05:00'),
  (942020, 940020, 910002, 'PENDIENTE', 'VALIDADO', 'Vo.Bo. sintético para pruebas.', '192.0.2.10', '2026-09-12 13:05:00'),
  (942021, 940021, 910002, 'PENDIENTE', 'VALIDADO', 'Vo.Bo. sintético para pruebas.', '192.0.2.10', '2026-09-13 13:05:00'),
  (942026, 940026, 910002, 'PENDIENTE', 'VALIDADO', 'Vo.Bo. sintético para pruebas.', '192.0.2.10', '2026-09-15 13:05:00'),
  (942027, 940027, 910002, 'PENDIENTE', 'VALIDADO', 'Vo.Bo. sintético para pruebas.', '192.0.2.10', '2026-09-16 13:05:00');

-- pendientes: 20 registros
INSERT INTO `pendientes` (`id_pendiente`, `pendiente`, `tipo_pendiente`, `estatus`, `area`, `empresa`, `descripcion`, `date_created`, `creado_por_email`, `creado_por_iniciales`, `due_date`, `proyecto`, `equipo`, `con_subtareas`, `prioridad`) VALUES
  (950001, 'Tarea LAB 01', 'PERSONAL', 'En proceso', 'Laboratorio', 'United Elevadores LAB', '<p><strong>Descripción sintética</strong> de la tarea LAB 01. No contiene datos productivos.</p>', '2026-09-02 09:00:00', 'rol07@lab.invalid', 'L07', '2026-09-15', 'LAB - PUNTO VALLE', '99001-LAB-ESC-DGB', 0, 'MEDIA'),
  (950002, 'Tarea LAB 02', 'COLABORATIVA', 'Cerrado', 'Laboratorio', 'Corellian LAB', '<p><strong>Descripción sintética</strong> de la tarea LAB 02. No contiene datos productivos.</p>', '2026-09-03 09:00:00', 'rol07@lab.invalid', 'L07', '2026-09-16', 'LAB - MISTIQ TEMPLE II', '99002-LAB-RAM-DGB', 0, 'ALTA'),
  (950003, 'Tarea LAB 03', 'PERSONAL', 'Pendiente', 'Laboratorio', 'United Elevadores LAB', '<p><strong>Descripción sintética</strong> de la tarea LAB 03. No contiene datos productivos.</p>', '2026-09-04 09:00:00', 'rol07@lab.invalid', 'L07', '2026-09-17', 'LAB - DURANGO 262', '99003-LAB-ELE-DGB', 1, 'CRITICA'),
  (950004, 'Tarea LAB 04', 'COLABORATIVA', 'En proceso', 'Laboratorio', 'Corellian LAB', '<p><strong>Descripción sintética</strong> de la tarea LAB 04. No contiene datos productivos.</p>', '2026-09-05 09:00:00', 'rol07@lab.invalid', 'L07', '2026-09-18', 'LAB - AEROPUERTO TIJUANA', '99004-LAB-MON-DGB', 0, 'BAJA'),
  (950005, 'Tarea LAB 05', 'PERSONAL', 'Cerrado', 'Laboratorio', 'United Elevadores LAB', '<p><strong>Descripción sintética</strong> de la tarea LAB 05. No contiene datos productivos.</p>', '2026-09-06 09:00:00', 'rol06@lab.invalid', 'L06', '2026-09-19', 'LAB - AEROPUERTO GUADALAJARA', '99005-LAB-ELE-DGB', 0, 'MEDIA'),
  (950006, 'Tarea LAB 06', 'COLABORATIVA', 'Pendiente', 'Laboratorio', 'Corellian LAB', '<p><strong>Descripción sintética</strong> de la tarea LAB 06. No contiene datos productivos.</p>', '2026-09-07 09:00:00', 'rol07@lab.invalid', 'L07', '2026-09-20', 'LAB - AEROPUERTO LOS CABOS', '99006-LAB-ESC-DGB', 1, 'ALTA'),
  (950007, 'Tarea LAB 07', 'PERSONAL', 'En proceso', 'Laboratorio', 'United Elevadores LAB', '<p><strong>Descripción sintética</strong> de la tarea LAB 07. No contiene datos productivos.</p>', '2026-09-08 09:00:00', 'rol07@lab.invalid', 'L07', '2026-09-21', 'LAB - AEROPUERTO PUERTO VALLARTA', '99007-LAB-RAM-DGB', 0, 'CRITICA'),
  (950008, 'Tarea LAB 08', 'COLABORATIVA', 'Cerrado', 'Laboratorio', 'Corellian LAB', '<p><strong>Descripción sintética</strong> de la tarea LAB 08. No contiene datos productivos.</p>', '2026-09-09 09:00:00', 'rol07@lab.invalid', 'L07', '2026-09-22', 'LAB - WALMART SC SAN JOSE DEL CABO', '99008-LAB-ELE-DGB', 0, 'BAJA'),
  (950009, 'Tarea LAB 09', 'PERSONAL', 'Pendiente', 'Laboratorio', 'United Elevadores LAB', '<p><strong>Descripción sintética</strong> de la tarea LAB 09. No contiene datos productivos.</p>', '2026-09-10 09:00:00', 'rol07@lab.invalid', 'L07', '2026-09-23', 'LAB - AKOYA SKY LIVING', '99009-LAB-MON-DGB', 1, 'MEDIA'),
  (950010, 'Tarea LAB 10', 'COLABORATIVA', 'En proceso', 'Laboratorio', 'Corellian LAB', '<p><strong>Descripción sintética</strong> de la tarea LAB 10. No contiene datos productivos.</p>', '2026-09-11 09:00:00', 'rol06@lab.invalid', 'L06', '2026-09-14', 'LAB - TORRE 22-22', '99010-LAB-ELE-DGB', 0, 'ALTA'),
  (950011, 'Tarea LAB 11', 'PERSONAL', 'Cerrado', 'Laboratorio', 'United Elevadores LAB', '<p><strong>Descripción sintética</strong> de la tarea LAB 11. No contiene datos productivos.</p>', '2026-09-12 09:00:00', 'rol07@lab.invalid', 'L07', '2026-09-15', 'LAB - PABELLON METEPEC', '99011-LAB-ESC-DGB', 0, 'CRITICA'),
  (950012, 'Tarea LAB 12', 'COLABORATIVA', 'Pendiente', 'Laboratorio', 'Corellian LAB', '<p><strong>Descripción sintética</strong> de la tarea LAB 12. No contiene datos productivos.</p>', '2026-09-01 09:00:00', 'rol07@lab.invalid', 'L07', '2026-09-16', 'LAB - HOSPITAL SAN ANGEL INN PATRIOTISMO', '99012-LAB-RAM-DGB', 1, 'BAJA'),
  (950013, 'Tarea LAB 13', 'PERSONAL', 'En proceso', 'Laboratorio', 'United Elevadores LAB', '<p><strong>Descripción sintética</strong> de la tarea LAB 13. No contiene datos productivos.</p>', '2026-09-02 09:00:00', 'rol07@lab.invalid', 'L07', '2026-09-17', 'LAB - ALBOR UNIVERSIDAD', '99013-LAB-ELE-DGB', 0, 'MEDIA'),
  (950014, 'Tarea LAB 14', 'COLABORATIVA', 'Cerrado', 'Laboratorio', 'Corellian LAB', '<p><strong>Descripción sintética</strong> de la tarea LAB 14. No contiene datos productivos.</p>', '2026-09-03 09:00:00', 'rol07@lab.invalid', 'L07', '2026-09-18', 'LAB - PLAZA CITADEL', '99014-LAB-MON-DGB', 0, 'ALTA'),
  (950015, 'Tarea LAB 15', 'PERSONAL', 'Pendiente', 'Laboratorio', 'United Elevadores LAB', '<p><strong>Descripción sintética</strong> de la tarea LAB 15. No contiene datos productivos.</p>', '2026-09-04 09:00:00', 'rol06@lab.invalid', 'L06', '2026-09-19', 'LAB - CENTRO COMERCIAL PUNTA LAGUNA', '99015-LAB-ELE-DGB', 1, 'CRITICA'),
  (950016, 'Tarea LAB 16', 'COLABORATIVA', 'En proceso', 'Laboratorio', 'Corellian LAB', '<p><strong>Descripción sintética</strong> de la tarea LAB 16. No contiene datos productivos.</p>', '2026-09-05 09:00:00', 'rol07@lab.invalid', 'L07', '2026-09-20', 'LAB - PUNTO VALLE', '99001-LAB-ESC-DGB', 0, 'BAJA'),
  (950017, 'Tarea LAB 17', 'PERSONAL', 'Cerrado', 'Laboratorio', 'United Elevadores LAB', '<p><strong>Descripción sintética</strong> de la tarea LAB 17. No contiene datos productivos.</p>', '2026-09-06 09:00:00', 'rol07@lab.invalid', 'L07', '2026-09-21', 'LAB - MISTIQ TEMPLE II', '99002-LAB-RAM-DGB', 0, 'MEDIA'),
  (950018, 'Tarea LAB 18', 'COLABORATIVA', 'Pendiente', 'Laboratorio', 'Corellian LAB', '<p><strong>Descripción sintética</strong> de la tarea LAB 18. No contiene datos productivos.</p>', '2026-09-07 09:00:00', 'rol07@lab.invalid', 'L07', '2026-09-22', 'LAB - DURANGO 262', '99003-LAB-ELE-DGB', 1, 'ALTA'),
  (950019, 'Tarea LAB 19', 'PERSONAL', 'En proceso', 'Laboratorio', 'United Elevadores LAB', '<p><strong>Descripción sintética</strong> de la tarea LAB 19. No contiene datos productivos.</p>', '2026-09-08 09:00:00', 'rol07@lab.invalid', 'L07', '2026-09-23', 'LAB - AEROPUERTO TIJUANA', '99004-LAB-MON-DGB', 0, 'CRITICA'),
  (950020, 'Tarea LAB 20', 'COLABORATIVA', 'Cerrado', 'Laboratorio', 'Corellian LAB', '<p><strong>Descripción sintética</strong> de la tarea LAB 20. No contiene datos productivos.</p>', '2026-09-09 09:00:00', 'rol06@lab.invalid', 'L06', '2026-09-14', 'LAB - AEROPUERTO GUADALAJARA', '99005-LAB-ELE-DGB', 0, 'BAJA');

-- pendientes_usuarios: 10 registros
INSERT INTO `pendientes_usuarios` (`id_pendiente_usuario`, `id_pendiente`, `iniciales_usuario`, `tipo_relacion`) VALUES
  (951002, 950002, 'L39', 'RESPONSABLE'),
  (951004, 950004, 'L39', 'RESPONSABLE'),
  (951006, 950006, 'L39', 'RESPONSABLE'),
  (951008, 950008, 'L39', 'RESPONSABLE'),
  (951010, 950010, 'L39', 'RESPONSABLE'),
  (951012, 950012, 'L39', 'RESPONSABLE'),
  (951014, 950014, 'L39', 'RESPONSABLE'),
  (951016, 950016, 'L39', 'RESPONSABLE'),
  (951018, 950018, 'L39', 'RESPONSABLE'),
  (951020, 950020, 'L39', 'RESPONSABLE');

-- pendientes_subtareas: 12 registros
INSERT INTO `pendientes_subtareas` (`id_subtarea`, `id_pendiente`, `subtarea`, `estatus`, `orden`) VALUES
  (952005, 950003, 'Validar información ficticia', 'Pendiente', 1),
  (952006, 950003, 'Registrar resultado LAB', 'Pendiente', 2),
  (952011, 950006, 'Validar información ficticia', 'Cerrado', 1),
  (952012, 950006, 'Registrar resultado LAB', 'Pendiente', 2),
  (952017, 950009, 'Validar información ficticia', 'Pendiente', 1),
  (952018, 950009, 'Registrar resultado LAB', 'Pendiente', 2),
  (952023, 950012, 'Validar información ficticia', 'Cerrado', 1),
  (952024, 950012, 'Registrar resultado LAB', 'Pendiente', 2),
  (952029, 950015, 'Validar información ficticia', 'Pendiente', 1),
  (952030, 950015, 'Registrar resultado LAB', 'Pendiente', 2),
  (952035, 950018, 'Validar información ficticia', 'Cerrado', 1),
  (952036, 950018, 'Registrar resultado LAB', 'Pendiente', 2);

-- pendientes_comentarios: 20 registros
INSERT INTO `pendientes_comentarios` (`id_comentario`, `id_pendiente`, `id_usuario`, `comentario`, `fecha`) VALUES
  (953001, 950001, 910007, 'Comentario sintético de tarea 01.', '2026-09-03 11:00:00'),
  (953002, 950002, 910007, 'Comentario sintético de tarea 02.', '2026-09-04 11:00:00'),
  (953003, 950003, 910007, 'Comentario sintético de tarea 03.', '2026-09-05 11:00:00'),
  (953004, 950004, 910007, 'Comentario sintético de tarea 04.', '2026-09-06 11:00:00'),
  (953005, 950005, 910006, 'Comentario sintético de tarea 05.', '2026-09-07 11:00:00'),
  (953006, 950006, 910007, 'Comentario sintético de tarea 06.', '2026-09-08 11:00:00'),
  (953007, 950007, 910007, 'Comentario sintético de tarea 07.', '2026-09-09 11:00:00'),
  (953008, 950008, 910007, 'Comentario sintético de tarea 08.', '2026-09-10 11:00:00'),
  (953009, 950009, 910007, 'Comentario sintético de tarea 09.', '2026-09-11 11:00:00'),
  (953010, 950010, 910006, 'Comentario sintético de tarea 10.', '2026-09-12 11:00:00'),
  (953011, 950011, 910007, 'Comentario sintético de tarea 11.', '2026-09-13 11:00:00'),
  (953012, 950012, 910007, 'Comentario sintético de tarea 12.', '2026-09-02 11:00:00'),
  (953013, 950013, 910007, 'Comentario sintético de tarea 13.', '2026-09-03 11:00:00'),
  (953014, 950014, 910007, 'Comentario sintético de tarea 14.', '2026-09-04 11:00:00'),
  (953015, 950015, 910006, 'Comentario sintético de tarea 15.', '2026-09-05 11:00:00'),
  (953016, 950016, 910007, 'Comentario sintético de tarea 16.', '2026-09-06 11:00:00'),
  (953017, 950017, 910007, 'Comentario sintético de tarea 17.', '2026-09-07 11:00:00'),
  (953018, 950018, 910007, 'Comentario sintético de tarea 18.', '2026-09-08 11:00:00'),
  (953019, 950019, 910007, 'Comentario sintético de tarea 19.', '2026-09-09 11:00:00'),
  (953020, 950020, 910006, 'Comentario sintético de tarea 20.', '2026-09-10 11:00:00');

-- usuario_interacciones: 25 registros
INSERT INTO `usuario_interacciones` (`id_interaccion`, `id_usuario`, `tipo_interaccion`, `modulo`, `entidad`, `id_referencia`, `titulo`, `descripcion`, `empresa_contexto`, `ruta_destino`, `payload_json`, `detalle_json`, `metodo_http`, `endpoint`, `ip_address`, `user_agent`) VALUES
  (954001, 910007, 'EDITAR', 'Tickets', 'TICKET', '940001', 'Interacción LAB 01', 'Evento sintético para historial.', 'United Elevadores LAB', 'home', '{"lab": true, "seq": 1}', '{"source": "LAB"}', 'PATCH', '/api/lab/simulado', '192.0.2.20', 'LAB-BROWSER'),
  (954002, 910007, 'COMENTAR', 'Portafolio', 'EQUIPO', '930002', 'Interacción LAB 02', 'Evento sintético para historial.', 'Corellian LAB', 'home', '{"lab": true, "seq": 2}', '{"source": "LAB"}', 'POST', '/api/lab/simulado', '192.0.2.20', 'LAB-BROWSER'),
  (954003, 910007, 'VALIDAR', 'Ventas', 'PROYECTO', '920003', 'Interacción LAB 03', 'Evento sintético para historial.', 'United Elevadores LAB', 'home', '{"lab": true, "seq": 3}', '{"source": "LAB"}', 'GET', '/api/lab/simulado', '192.0.2.20', 'LAB-BROWSER'),
  (954004, 910006, 'VER', 'Home', 'TAREA', '950001', 'Interacción LAB 04', 'Evento sintético para historial.', 'Corellian LAB', 'home', '{"lab": true, "seq": 4}', '{"source": "LAB"}', 'GET', '/api/lab/simulado', '192.0.2.20', 'LAB-BROWSER'),
  (954005, 910007, 'EDITAR', 'Tickets', 'TICKET', '940001', 'Interacción LAB 05', 'Evento sintético para historial.', 'United Elevadores LAB', 'home', '{"lab": true, "seq": 5}', '{"source": "LAB"}', 'PATCH', '/api/lab/simulado', '192.0.2.20', 'LAB-BROWSER'),
  (954006, 910007, 'COMENTAR', 'Portafolio', 'EQUIPO', '930006', 'Interacción LAB 06', 'Evento sintético para historial.', 'Corellian LAB', 'home', '{"lab": true, "seq": 6}', '{"source": "LAB"}', 'POST', '/api/lab/simulado', '192.0.2.20', 'LAB-BROWSER'),
  (954007, 910007, 'VALIDAR', 'Ventas', 'PROYECTO', '920007', 'Interacción LAB 07', 'Evento sintético para historial.', 'United Elevadores LAB', 'home', '{"lab": true, "seq": 7}', '{"source": "LAB"}', 'GET', '/api/lab/simulado', '192.0.2.20', 'LAB-BROWSER'),
  (954008, 910006, 'VER', 'Home', 'TAREA', '950001', 'Interacción LAB 08', 'Evento sintético para historial.', 'Corellian LAB', 'home', '{"lab": true, "seq": 8}', '{"source": "LAB"}', 'GET', '/api/lab/simulado', '192.0.2.20', 'LAB-BROWSER'),
  (954009, 910007, 'EDITAR', 'Tickets', 'TICKET', '940001', 'Interacción LAB 09', 'Evento sintético para historial.', 'United Elevadores LAB', 'home', '{"lab": true, "seq": 9}', '{"source": "LAB"}', 'PATCH', '/api/lab/simulado', '192.0.2.20', 'LAB-BROWSER'),
  (954010, 910007, 'COMENTAR', 'Portafolio', 'EQUIPO', '930010', 'Interacción LAB 10', 'Evento sintético para historial.', 'Corellian LAB', 'home', '{"lab": true, "seq": 10}', '{"source": "LAB"}', 'POST', '/api/lab/simulado', '192.0.2.20', 'LAB-BROWSER'),
  (954011, 910007, 'VALIDAR', 'Ventas', 'PROYECTO', '920011', 'Interacción LAB 11', 'Evento sintético para historial.', 'United Elevadores LAB', 'home', '{"lab": true, "seq": 11}', '{"source": "LAB"}', 'GET', '/api/lab/simulado', '192.0.2.20', 'LAB-BROWSER'),
  (954012, 910006, 'VER', 'Home', 'TAREA', '950001', 'Interacción LAB 12', 'Evento sintético para historial.', 'Corellian LAB', 'home', '{"lab": true, "seq": 12}', '{"source": "LAB"}', 'GET', '/api/lab/simulado', '192.0.2.20', 'LAB-BROWSER'),
  (954013, 910007, 'EDITAR', 'Tickets', 'TICKET', '940001', 'Interacción LAB 13', 'Evento sintético para historial.', 'United Elevadores LAB', 'home', '{"lab": true, "seq": 13}', '{"source": "LAB"}', 'PATCH', '/api/lab/simulado', '192.0.2.20', 'LAB-BROWSER'),
  (954014, 910007, 'COMENTAR', 'Portafolio', 'EQUIPO', '930014', 'Interacción LAB 14', 'Evento sintético para historial.', 'Corellian LAB', 'home', '{"lab": true, "seq": 14}', '{"source": "LAB"}', 'POST', '/api/lab/simulado', '192.0.2.20', 'LAB-BROWSER'),
  (954015, 910007, 'VALIDAR', 'Ventas', 'PROYECTO', '920015', 'Interacción LAB 15', 'Evento sintético para historial.', 'United Elevadores LAB', 'home', '{"lab": true, "seq": 15}', '{"source": "LAB"}', 'GET', '/api/lab/simulado', '192.0.2.20', 'LAB-BROWSER'),
  (954016, 910006, 'VER', 'Home', 'TAREA', '950001', 'Interacción LAB 16', 'Evento sintético para historial.', 'Corellian LAB', 'home', '{"lab": true, "seq": 16}', '{"source": "LAB"}', 'GET', '/api/lab/simulado', '192.0.2.20', 'LAB-BROWSER'),
  (954017, 910007, 'EDITAR', 'Tickets', 'TICKET', '940001', 'Interacción LAB 17', 'Evento sintético para historial.', 'United Elevadores LAB', 'home', '{"lab": true, "seq": 17}', '{"source": "LAB"}', 'PATCH', '/api/lab/simulado', '192.0.2.20', 'LAB-BROWSER'),
  (954018, 910007, 'COMENTAR', 'Portafolio', 'EQUIPO', '930003', 'Interacción LAB 18', 'Evento sintético para historial.', 'Corellian LAB', 'home', '{"lab": true, "seq": 18}', '{"source": "LAB"}', 'POST', '/api/lab/simulado', '192.0.2.20', 'LAB-BROWSER'),
  (954019, 910007, 'VALIDAR', 'Ventas', 'PROYECTO', '920004', 'Interacción LAB 19', 'Evento sintético para historial.', 'United Elevadores LAB', 'home', '{"lab": true, "seq": 19}', '{"source": "LAB"}', 'GET', '/api/lab/simulado', '192.0.2.20', 'LAB-BROWSER'),
  (954020, 910006, 'VER', 'Home', 'TAREA', '950001', 'Interacción LAB 20', 'Evento sintético para historial.', 'Corellian LAB', 'home', '{"lab": true, "seq": 20}', '{"source": "LAB"}', 'GET', '/api/lab/simulado', '192.0.2.20', 'LAB-BROWSER'),
  (954021, 910007, 'EDITAR', 'Tickets', 'TICKET', '940001', 'Interacción LAB 21', 'Evento sintético para historial.', 'United Elevadores LAB', 'home', '{"lab": true, "seq": 21}', '{"source": "LAB"}', 'PATCH', '/api/lab/simulado', '192.0.2.20', 'LAB-BROWSER'),
  (954022, 910007, 'COMENTAR', 'Portafolio', 'EQUIPO', '930007', 'Interacción LAB 22', 'Evento sintético para historial.', 'Corellian LAB', 'home', '{"lab": true, "seq": 22}', '{"source": "LAB"}', 'POST', '/api/lab/simulado', '192.0.2.20', 'LAB-BROWSER'),
  (954023, 910007, 'VALIDAR', 'Ventas', 'PROYECTO', '920008', 'Interacción LAB 23', 'Evento sintético para historial.', 'United Elevadores LAB', 'home', '{"lab": true, "seq": 23}', '{"source": "LAB"}', 'GET', '/api/lab/simulado', '192.0.2.20', 'LAB-BROWSER'),
  (954024, 910006, 'VER', 'Home', 'TAREA', '950001', 'Interacción LAB 24', 'Evento sintético para historial.', 'Corellian LAB', 'home', '{"lab": true, "seq": 24}', '{"source": "LAB"}', 'GET', '/api/lab/simulado', '192.0.2.20', 'LAB-BROWSER'),
  (954025, 910007, 'EDITAR', 'Tickets', 'TICKET', '940001', 'Interacción LAB 25', 'Evento sintético para historial.', 'United Elevadores LAB', 'home', '{"lab": true, "seq": 25}', '{"source": "LAB"}', 'PATCH', '/api/lab/simulado', '192.0.2.20', 'LAB-BROWSER');

-- detalle_mp_2026: 15 registros
INSERT INTO `detalle_mp_2026` (`id_dmp`, `zona_adm`, `proyecto`, `id_proyecto_cobranza`, `idns`, `cliente`, `periodicidad`, `momento_facturacion`, `estado`, `z_oper`, `forma_pago`, `iguala`, `condiciones_pago`, `monto_anual`, `pendiente_corriente`, `pendiente_vencido`, `pendiente`, `facturas_pendientes`, `estatus_cartera`) VALUES
  (970001, 'ZA-LAB-1', 'LAB - PUNTO VALLE', 920001, '99001-LAB-ESC-DGB', 'Cliente LAB 01 SA de CV', 'MENSUAL', 'INICIO DE MES', 'Estado LAB 01', 'CNB-01', 'TRANSFERENCIA LAB', 2145.8333333333335, '30 DÍAS LAB', 25750, 625.0, 625.0, 1250, 1, 'PREVENTIVA'),
  (970002, 'ZA-LAB-2', 'LAB - MISTIQ TEMPLE II', 920002, '99002-LAB-RAM-DGB', 'Cliente LAB 02 SA de CV', 'MENSUAL', 'INICIO DE MES', 'Estado LAB 02', 'CNB-02', 'TRANSFERENCIA LAB', 2291.6666666666665, '30 DÍAS LAB', 27500, 1250.0, 1250.0, 2500, 2, 'VENCIDA'),
  (970003, 'ZA-LAB-3', 'LAB - DURANGO 262', 920003, '99003-LAB-ELE-DGB', 'Cliente LAB 03 SA de CV', 'MENSUAL', 'INICIO DE MES', 'Estado LAB 03', 'CNB-03', 'TRANSFERENCIA LAB', 2437.5, '30 DÍAS LAB', 29250, 1875.0, 1875.0, 3750, 3, 'AL CORRIENTE'),
  (970004, 'ZA-LAB-4', 'LAB - AEROPUERTO TIJUANA', 920004, '99004-LAB-MON-DGB', 'Cliente LAB 04 SA de CV', 'MENSUAL', 'INICIO DE MES', 'Estado LAB 04', 'CNA-01', 'TRANSFERENCIA LAB', 2583.3333333333335, '30 DÍAS LAB', 31000, 0.0, 0.0, 0, 0, 'PREVENTIVA'),
  (970005, 'ZA-LAB-1', 'LAB - AEROPUERTO GUADALAJARA', 920005, '99005-LAB-ELE-DGB', 'Cliente LAB 05 SA de CV', 'MENSUAL', 'INICIO DE MES', 'Estado LAB 05', 'CNA-02', 'TRANSFERENCIA LAB', 2729.1666666666665, '30 DÍAS LAB', 32750, 625.0, 625.0, 1250, 1, 'VENCIDA'),
  (970006, 'ZA-LAB-2', 'LAB - AEROPUERTO LOS CABOS', 920006, '99006-LAB-ESC-DGB', 'Cliente LAB 06 SA de CV', 'MENSUAL', 'INICIO DE MES', 'Estado LAB 01', 'CNA-03', 'TRANSFERENCIA LAB', 2875.0, '30 DÍAS LAB', 34500, 1250.0, 1250.0, 2500, 2, 'AL CORRIENTE'),
  (970007, 'ZA-LAB-3', 'LAB - AEROPUERTO PUERTO VALLARTA', 920007, '99007-LAB-RAM-DGB', 'Cliente LAB 07 SA de CV', 'MENSUAL', 'INICIO DE MES', 'Estado LAB 02', 'CNA-04', 'TRANSFERENCIA LAB', 3020.8333333333335, '30 DÍAS LAB', 36250, 1875.0, 1875.0, 3750, 3, 'PREVENTIVA'),
  (970008, 'ZA-LAB-4', 'LAB - WALMART SC SAN JOSE DEL CABO', 920008, '99008-LAB-ELE-DGB', 'Cliente LAB 08 SA de CV', 'MENSUAL', 'INICIO DE MES', 'Estado LAB 03', 'OCC-01', 'TRANSFERENCIA LAB', 3166.6666666666665, '30 DÍAS LAB', 38000, 0.0, 0.0, 0, 0, 'VENCIDA'),
  (970009, 'ZA-LAB-1', 'LAB - AKOYA SKY LIVING', 920009, '99009-LAB-MON-DGB', 'Cliente LAB 09 SA de CV', 'MENSUAL', 'INICIO DE MES', 'Estado LAB 04', 'OCC-02', 'TRANSFERENCIA LAB', 3312.5, '30 DÍAS LAB', 39750, 625.0, 625.0, 1250, 1, 'AL CORRIENTE'),
  (970010, 'ZA-LAB-2', 'LAB - TORRE 22-22', 920010, '99010-LAB-ELE-DGB', 'Cliente LAB 10 SA de CV', 'MENSUAL', 'INICIO DE MES', 'Estado LAB 05', 'NOR-01', 'TRANSFERENCIA LAB', 3458.3333333333335, '30 DÍAS LAB', 41500, 1250.0, 1250.0, 2500, 2, 'PREVENTIVA'),
  (970011, 'ZA-LAB-3', 'LAB - PABELLON METEPEC', 920011, '99011-LAB-ESC-DGB', 'Cliente LAB 11 SA de CV', 'MENSUAL', 'INICIO DE MES', 'Estado LAB 01', 'NOR-02', 'TRANSFERENCIA LAB', 3604.1666666666665, '30 DÍAS LAB', 43250, 1875.0, 1875.0, 3750, 3, 'VENCIDA'),
  (970012, 'ZA-LAB-4', 'LAB - HOSPITAL SAN ANGEL INN PATRIOTISMO', 920012, '99012-LAB-RAM-DGB', 'Cliente LAB 12 SA de CV', 'MENSUAL', 'INICIO DE MES', 'Estado LAB 02', 'NOR-03', 'TRANSFERENCIA LAB', 3750.0, '30 DÍAS LAB', 45000, 0.0, 0.0, 0, 0, 'AL CORRIENTE'),
  (970013, 'ZA-LAB-1', 'LAB - ALBOR UNIVERSIDAD', 920013, '99013-LAB-ELE-DGB', 'Cliente LAB 13 SA de CV', 'MENSUAL', 'INICIO DE MES', 'Estado LAB 03', 'CNB-01', 'TRANSFERENCIA LAB', 3895.8333333333335, '30 DÍAS LAB', 46750, 625.0, 625.0, 1250, 1, 'PREVENTIVA'),
  (970014, 'ZA-LAB-2', 'LAB - PLAZA CITADEL', 920014, '99014-LAB-MON-DGB', 'Cliente LAB 14 SA de CV', 'MENSUAL', 'INICIO DE MES', 'Estado LAB 04', 'CNB-02', 'TRANSFERENCIA LAB', 4041.6666666666665, '30 DÍAS LAB', 48500, 1250.0, 1250.0, 2500, 2, 'VENCIDA'),
  (970015, 'ZA-LAB-3', 'LAB - CENTRO COMERCIAL PUNTA LAGUNA', 920015, '99015-LAB-ELE-DGB', 'Cliente LAB 15 SA de CV', 'MENSUAL', 'INICIO DE MES', 'Estado LAB 05', 'CNB-03', 'TRANSFERENCIA LAB', 4187.5, '30 DÍAS LAB', 50250, 1875.0, 1875.0, 3750, 3, 'AL CORRIENTE');

-- gestion_credito: 15 registros
INSERT INTO `gestion_credito` (`id_gc`, `idns`, `proyecto`, `id_proyecto_cobranza`, `cliente`, `subsidiaria`, `region`, `estado`, `z_oper`, `z_adm`, `categoria`, `prioridad`, `suma_valor_unitario`, `recuento_no_equipos`, `mp_2025`, `monto_mp_2025`, `mp_2026`, `monto_mp_2026`, `facturas_mp`, `montp_mp`, `facturas_va`, `monto_va`, `adeudo`, `facts_adeudadas`, `suministro`, `nivel_riesgo_credito`, `credito_para_va`, `credito_disponible_venta`, `anticipo`) VALUES
  (971001, '99001-LAB-ESC-DGB', 'LAB - PUNTO VALLE', 920001, 'Cliente LAB 01 SA de CV', 'United Elevadores LAB', 'REGION LAB', 'Estado LAB 01', 'CNB-01', 'ZA-LAB-1', 'MANTENIMIENTO LAB', 'MEDIA', 2145.8333333333335, 1, 12, 23690.0, 9, 19312.5, 1, 1250, 1, 1500, 1750, 1, 'ACTIVO', 'MEDIO', 10500, 8350, 'NO'),
  (971002, '99002-LAB-RAM-DGB', 'LAB - MISTIQ TEMPLE II', 920002, 'Cliente LAB 02 SA de CV', 'United Elevadores LAB', 'REGION LAB', 'Estado LAB 02', 'CNB-02', 'ZA-LAB-2', 'MANTENIMIENTO LAB', 'ALTA', 2291.6666666666665, 1, 12, 25300.0, 9, 20625.0, 2, 2500, 2, 3000, 3500, 2, 'ACTIVO', 'ALTO', 11000, 8700, 'NO'),
  (971003, '99003-LAB-ELE-DGB', 'LAB - DURANGO 262', 920003, 'Cliente LAB 03 SA de CV', 'United Elevadores LAB', 'REGION LAB', 'Estado LAB 03', 'CNB-03', 'ZA-LAB-3', 'MANTENIMIENTO LAB', 'BAJA', 2437.5, 1, 12, 26910.0, 9, 21937.5, 3, 3750, 0, 4500, 5250, 3, 'ACTIVO', 'BAJO', 11500, 9050, 'NO'),
  (971004, '99004-LAB-MON-DGB', 'LAB - AEROPUERTO TIJUANA', 920004, 'Cliente LAB 04 SA de CV', 'United Elevadores LAB', 'REGION LAB', 'Estado LAB 04', 'CNA-01', 'ZA-LAB-4', 'MANTENIMIENTO LAB', 'MEDIA', 2583.3333333333335, 1, 12, 28520.0, 9, 23250.0, 0, 0, 1, 6000, 2000, 4, 'ACTIVO', 'MEDIO', 12000, 9400, 'NO'),
  (971005, '99005-LAB-ELE-DGB', 'LAB - AEROPUERTO GUADALAJARA', 920005, 'Cliente LAB 05 SA de CV', 'United Elevadores LAB', 'REGION LAB', 'Estado LAB 05', 'CNA-02', 'ZA-LAB-1', 'MANTENIMIENTO LAB', 'ALTA', 2729.1666666666665, 1, 12, 30130.0, 9, 24562.5, 1, 1250, 2, 7500, 3750, 0, 'ACTIVO', 'ALTO', 12500, 9750, 'NO'),
  (971006, '99006-LAB-ESC-DGB', 'LAB - AEROPUERTO LOS CABOS', 920006, 'Cliente LAB 06 SA de CV', 'United Elevadores LAB', 'REGION LAB', 'Estado LAB 01', 'CNA-03', 'ZA-LAB-2', 'MANTENIMIENTO LAB', 'BAJA', 2875.0, 1, 12, 31740.0, 9, 25875.0, 2, 2500, 0, 9000, 5500, 1, 'ACTIVO', 'BAJO', 13000, 10100, 'NO'),
  (971007, '99007-LAB-RAM-DGB', 'LAB - AEROPUERTO PUERTO VALLARTA', 920007, 'Cliente LAB 07 SA de CV', 'United Elevadores LAB', 'REGION LAB', 'Estado LAB 02', 'CNA-04', 'ZA-LAB-3', 'MANTENIMIENTO LAB', 'MEDIA', 3020.8333333333335, 1, 12, 33350.0, 9, 27187.5, 3, 3750, 1, 10500, 7250, 2, 'ACTIVO', 'MEDIO', 13500, 10450, 'NO'),
  (971008, '99008-LAB-ELE-DGB', 'LAB - WALMART SC SAN JOSE DEL CABO', 920008, 'Cliente LAB 08 SA de CV', 'United Elevadores LAB', 'REGION LAB', 'Estado LAB 03', 'OCC-01', 'ZA-LAB-4', 'MANTENIMIENTO LAB', 'ALTA', 3166.6666666666665, 1, 12, 34960.0, 9, 28500.0, 0, 0, 2, 12000, 4000, 3, 'ACTIVO', 'ALTO', 14000, 10800, 'NO'),
  (971009, '99009-LAB-MON-DGB', 'LAB - AKOYA SKY LIVING', 920009, 'Cliente LAB 09 SA de CV', 'United Elevadores LAB', 'REGION LAB', 'Estado LAB 04', 'OCC-02', 'ZA-LAB-1', 'MANTENIMIENTO LAB', 'BAJA', 3312.5, 1, 12, 36570.0, 9, 29812.5, 1, 1250, 0, 13500, 5750, 4, 'ACTIVO', 'BAJO', 14500, 11150, 'NO'),
  (971010, '99010-LAB-ELE-DGB', 'LAB - TORRE 22-22', 920010, 'Cliente LAB 10 SA de CV', 'United Elevadores LAB', 'REGION LAB', 'Estado LAB 05', 'NOR-01', 'ZA-LAB-2', 'MANTENIMIENTO LAB', 'MEDIA', 3458.3333333333335, 1, 12, 38180.0, 9, 31125.0, 2, 2500, 1, 15000, 7500, 0, 'ACTIVO', 'MEDIO', 15000, 11500, 'NO'),
  (971011, '99011-LAB-ESC-DGB', 'LAB - PABELLON METEPEC', 920011, 'Cliente LAB 11 SA de CV', 'United Elevadores LAB', 'REGION LAB', 'Estado LAB 01', 'NOR-02', 'ZA-LAB-3', 'MANTENIMIENTO LAB', 'ALTA', 3604.1666666666665, 1, 12, 39790.0, 9, 32437.5, 3, 3750, 2, 16500, 9250, 1, 'ACTIVO', 'ALTO', 15500, 11850, 'NO'),
  (971012, '99012-LAB-RAM-DGB', 'LAB - HOSPITAL SAN ANGEL INN PATRIOTISMO', 920012, 'Cliente LAB 12 SA de CV', 'United Elevadores LAB', 'REGION LAB', 'Estado LAB 02', 'NOR-03', 'ZA-LAB-4', 'MANTENIMIENTO LAB', 'BAJA', 3750.0, 1, 12, 41400.0, 9, 33750.0, 0, 0, 0, 18000, 6000, 2, 'ACTIVO', 'BAJO', 16000, 12200, 'NO'),
  (971013, '99013-LAB-ELE-DGB', 'LAB - ALBOR UNIVERSIDAD', 920013, 'Cliente LAB 13 SA de CV', 'United Elevadores LAB', 'REGION LAB', 'Estado LAB 03', 'CNB-01', 'ZA-LAB-1', 'MANTENIMIENTO LAB', 'MEDIA', 3895.8333333333335, 1, 12, 43010.0, 9, 35062.5, 1, 1250, 1, 19500, 7750, 3, 'ACTIVO', 'MEDIO', 16500, 12550, 'NO'),
  (971014, '99014-LAB-MON-DGB', 'LAB - PLAZA CITADEL', 920014, 'Cliente LAB 14 SA de CV', 'United Elevadores LAB', 'REGION LAB', 'Estado LAB 04', 'CNB-02', 'ZA-LAB-2', 'MANTENIMIENTO LAB', 'ALTA', 4041.6666666666665, 1, 12, 44620.0, 9, 36375.0, 2, 2500, 2, 21000, 9500, 4, 'ACTIVO', 'ALTO', 17000, 12900, 'NO'),
  (971015, '99015-LAB-ELE-DGB', 'LAB - CENTRO COMERCIAL PUNTA LAGUNA', 920015, 'Cliente LAB 15 SA de CV', 'United Elevadores LAB', 'REGION LAB', 'Estado LAB 05', 'CNB-03', 'ZA-LAB-3', 'MANTENIMIENTO LAB', 'BAJA', 4187.5, 1, 12, 46230.0, 9, 37687.5, 3, 3750, 0, 22500, 11250, 0, 'ACTIVO', 'BAJO', 17500, 13250, 'NO');

-- pc: 15 registros
INSERT INTO `pc` (`id_pc`, `zona_adm`, `proyecto`, `id_proyecto_cobranza`, `cliente`, `ov`, `fecha_ov`, `mes_ov`, `concepto`, `precio_venta`, `pagado_iva`, `no_pagado_iva`, `venta_total`, `facturas_pendientes_pago`, `adeudo`, `tipo_pago`, `no_factura`, `fecha_factura`, `mes_factura`, `terminos`, `fecha_vencimiento`, `dias_vencimiento`, `estatus`, `estatus_administrativo`, `estatus_operativo`, `zona_operativa`, `estado`, `comentarios_cobranza`) VALUES
  (972001, 'ZA-LAB-1', 'LAB - PUNTO VALLE', 920001, 'Cliente LAB 01 SA de CV', 'OV-LAB-0001', '2026-01-05', 'MES-01', 'Servicio LAB', 2145.8333333333335, 895.8333333333335, 1250, 2145.8333333333335, 1, 1250, 'TRANSFERENCIA', 'FAC-LAB-0001', '2026-08-06', 'AGOSTO', '30 DIAS', '2026-09-06', 0, 'PENDIENTE', 'LAB', 'LAB', 'CNB-01', 'Estado LAB 01', 'Registro sintético.'),
  (972002, 'ZA-LAB-2', 'LAB - MISTIQ TEMPLE II', 920002, 'Cliente LAB 02 SA de CV', 'OV-LAB-0002', '2026-02-05', 'MES-02', 'Servicio LAB', 2291.6666666666665, 0, 2500, 2291.6666666666665, 2, 2500, 'TRANSFERENCIA', 'FAC-LAB-0002', '2026-08-07', 'AGOSTO', '30 DIAS', '2026-09-07', 0, 'VENCIDO', 'LAB', 'LAB', 'CNB-02', 'Estado LAB 02', 'Registro sintético.'),
  (972003, 'ZA-LAB-3', 'LAB - DURANGO 262', 920003, 'Cliente LAB 03 SA de CV', 'OV-LAB-0003', '2026-03-05', 'MES-03', 'Servicio LAB', 2437.5, 0, 3750, 2437.5, 0, 3750, 'TRANSFERENCIA', 'FAC-LAB-0003', '2026-08-08', 'AGOSTO', '30 DIAS', '2026-09-08', 0, 'PAGADO', 'LAB', 'LAB', 'CNB-03', 'Estado LAB 03', 'Registro sintético.'),
  (972004, 'ZA-LAB-4', 'LAB - AEROPUERTO TIJUANA', 920004, 'Cliente LAB 04 SA de CV', 'OV-LAB-0004', '2026-04-05', 'MES-04', 'Servicio LAB', 2583.3333333333335, 2583.3333333333335, 0, 2583.3333333333335, 1, 0, 'TRANSFERENCIA', 'FAC-LAB-0004', '2026-08-09', 'AGOSTO', '30 DIAS', '2026-09-09', 0, 'PENDIENTE', 'LAB', 'LAB', 'CNA-01', 'Estado LAB 04', 'Registro sintético.'),
  (972005, 'ZA-LAB-1', 'LAB - AEROPUERTO GUADALAJARA', 920005, 'Cliente LAB 05 SA de CV', 'OV-LAB-0005', '2026-05-05', 'MES-05', 'Servicio LAB', 2729.1666666666665, 1479.1666666666665, 1250, 2729.1666666666665, 2, 1250, 'TRANSFERENCIA', 'FAC-LAB-0005', '2026-08-10', 'AGOSTO', '30 DIAS', '2026-09-10', 0, 'VENCIDO', 'LAB', 'LAB', 'CNA-02', 'Estado LAB 05', 'Registro sintético.'),
  (972006, 'ZA-LAB-2', 'LAB - AEROPUERTO LOS CABOS', 920006, 'Cliente LAB 06 SA de CV', 'OV-LAB-0006', '2026-06-05', 'MES-06', 'Servicio LAB', 2875.0, 375.0, 2500, 2875.0, 0, 2500, 'TRANSFERENCIA', 'FAC-LAB-0006', '2026-08-11', 'AGOSTO', '30 DIAS', '2026-09-11', 1, 'PAGADO', 'LAB', 'LAB', 'CNA-03', 'Estado LAB 01', 'Registro sintético.'),
  (972007, 'ZA-LAB-3', 'LAB - AEROPUERTO PUERTO VALLARTA', 920007, 'Cliente LAB 07 SA de CV', 'OV-LAB-0007', '2026-07-05', 'MES-07', 'Servicio LAB', 3020.8333333333335, 0, 3750, 3020.8333333333335, 1, 3750, 'TRANSFERENCIA', 'FAC-LAB-0007', '2026-08-12', 'AGOSTO', '30 DIAS', '2026-09-12', 2, 'PENDIENTE', 'LAB', 'LAB', 'CNA-04', 'Estado LAB 02', 'Registro sintético.'),
  (972008, 'ZA-LAB-4', 'LAB - WALMART SC SAN JOSE DEL CABO', 920008, 'Cliente LAB 08 SA de CV', 'OV-LAB-0008', '2026-08-05', 'MES-08', 'Servicio LAB', 3166.6666666666665, 3166.6666666666665, 0, 3166.6666666666665, 2, 0, 'TRANSFERENCIA', 'FAC-LAB-0008', '2026-08-13', 'AGOSTO', '30 DIAS', '2026-09-13', 3, 'VENCIDO', 'LAB', 'LAB', 'OCC-01', 'Estado LAB 03', 'Registro sintético.'),
  (972009, 'ZA-LAB-1', 'LAB - AKOYA SKY LIVING', 920009, 'Cliente LAB 09 SA de CV', 'OV-LAB-0009', '2026-01-05', 'MES-01', 'Servicio LAB', 3312.5, 2062.5, 1250, 3312.5, 0, 1250, 'TRANSFERENCIA', 'FAC-LAB-0009', '2026-08-14', 'AGOSTO', '30 DIAS', '2026-09-14', 4, 'PAGADO', 'LAB', 'LAB', 'OCC-02', 'Estado LAB 04', 'Registro sintético.'),
  (972010, 'ZA-LAB-2', 'LAB - TORRE 22-22', 920010, 'Cliente LAB 10 SA de CV', 'OV-LAB-0010', '2026-02-05', 'MES-02', 'Servicio LAB', 3458.3333333333335, 958.3333333333335, 2500, 3458.3333333333335, 1, 2500, 'TRANSFERENCIA', 'FAC-LAB-0010', '2026-08-15', 'AGOSTO', '30 DIAS', '2026-09-15', 5, 'PENDIENTE', 'LAB', 'LAB', 'NOR-01', 'Estado LAB 05', 'Registro sintético.'),
  (972011, 'ZA-LAB-3', 'LAB - PABELLON METEPEC', 920011, 'Cliente LAB 11 SA de CV', 'OV-LAB-0011', '2026-03-05', 'MES-03', 'Servicio LAB', 3604.1666666666665, 0, 3750, 3604.1666666666665, 2, 3750, 'TRANSFERENCIA', 'FAC-LAB-0011', '2026-08-16', 'AGOSTO', '30 DIAS', '2026-09-16', 6, 'VENCIDO', 'LAB', 'LAB', 'NOR-02', 'Estado LAB 01', 'Registro sintético.'),
  (972012, 'ZA-LAB-4', 'LAB - HOSPITAL SAN ANGEL INN PATRIOTISMO', 920012, 'Cliente LAB 12 SA de CV', 'OV-LAB-0012', '2026-04-05', 'MES-04', 'Servicio LAB', 3750.0, 3750.0, 0, 3750.0, 0, 0, 'TRANSFERENCIA', 'FAC-LAB-0012', '2026-08-17', 'AGOSTO', '30 DIAS', '2026-09-17', 7, 'PAGADO', 'LAB', 'LAB', 'NOR-03', 'Estado LAB 02', 'Registro sintético.'),
  (972013, 'ZA-LAB-1', 'LAB - ALBOR UNIVERSIDAD', 920013, 'Cliente LAB 13 SA de CV', 'OV-LAB-0013', '2026-05-05', 'MES-05', 'Servicio LAB', 3895.8333333333335, 2645.8333333333335, 1250, 3895.8333333333335, 1, 1250, 'TRANSFERENCIA', 'FAC-LAB-0013', '2026-08-18', 'AGOSTO', '30 DIAS', '2026-09-18', 8, 'PENDIENTE', 'LAB', 'LAB', 'CNB-01', 'Estado LAB 03', 'Registro sintético.'),
  (972014, 'ZA-LAB-2', 'LAB - PLAZA CITADEL', 920014, 'Cliente LAB 14 SA de CV', 'OV-LAB-0014', '2026-06-05', 'MES-06', 'Servicio LAB', 4041.6666666666665, 1541.6666666666665, 2500, 4041.6666666666665, 2, 2500, 'TRANSFERENCIA', 'FAC-LAB-0014', '2026-08-19', 'AGOSTO', '30 DIAS', '2026-09-19', 9, 'VENCIDO', 'LAB', 'LAB', 'CNB-02', 'Estado LAB 04', 'Registro sintético.'),
  (972015, 'ZA-LAB-3', 'LAB - CENTRO COMERCIAL PUNTA LAGUNA', 920015, 'Cliente LAB 15 SA de CV', 'OV-LAB-0015', '2026-07-05', 'MES-07', 'Servicio LAB', 4187.5, 437.5, 3750, 4187.5, 0, 3750, 'TRANSFERENCIA', 'FAC-LAB-0015', '2026-08-20', 'AGOSTO', '30 DIAS', '2026-09-20', 10, 'PAGADO', 'LAB', 'LAB', 'CNB-03', 'Estado LAB 05', 'Registro sintético.');

-- ins_fl: 15 registros
INSERT INTO `ins_fl` (`id_ins_fl`, `proyecto`, `id_proyecto`, `referencia_sitio`, `estatus`, `fecha_visita`, `comentarios_fl`, `avance_oc`, `avance_mo`, `avance_aj`, `numero_pisos`, `numero_desembarques`, `numero_puertas`, `velocidad_ms`, `capacidad_kg`, `fecha_cpvp`, `estatus_produccion`, `fecha_inicio_montaje`, `fecha_fin_montaje_planeado`, `dias_restantes`, `estatus_inspeccion_calidad`, `pendientes_calidad`, `estado`, `supervisor_fl`, `ciudad`, `condiciones_obra`, `vendedor`, `cliente`, `id_sup`, `id_asesor`, `id_admin`, `activo`) VALUES
  (966001, 'LAB - PUNTO VALLE', 'PPNS-LAB-0001', 'Sitio instalación LAB 01', '02-OC', '2026-09-02', 'Proyecto sintético de instalación.', '58', '34', '15', '4', '4', '4', '1.25', '600', '2026-07-01', 'EN PROCESO LAB', '2026-08-01', '2026-10-15', '14', 'Sin Pendientes', NULL, 'Estado LAB 01', 'Usuario LAB Supervisor 2', 'Ciudad LAB 01', 'Condiciones simuladas.', 'Asesor LAB', 'Cliente LAB 01 SA de CV', 910051, 910039, 910037, 1),
  (966002, 'LAB - MISTIQ TEMPLE II', 'PPNS-LAB-0002', 'Sitio instalación LAB 02', '03-PM', '2026-09-03', 'Proyecto sintético de instalación.', '61', '38', '20', '5', '5', '5', '1.5', '750', '2026-07-01', 'EN PROCESO LAB', '2026-08-01', '2026-10-15', '13', 'Sin Pendientes', NULL, 'Estado LAB 02', 'Usuario LAB Supervisor 3', 'Ciudad LAB 02', 'Condiciones simuladas.', 'Asesor LAB', 'Cliente LAB 02 SA de CV', 910051, 910039, 910037, 1),
  (966003, 'LAB - DURANGO 262', 'PPNS-LAB-0003', 'Sitio instalación LAB 03', '08-T', '2026-09-04', 'Proyecto sintético de instalación.', '64', '42', '25', '6', '6', '6', '1.75', '900', '2026-07-01', 'EN PROCESO LAB', '2026-08-01', '2026-10-15', '12', 'Sin Pendientes', NULL, 'Estado LAB 03', 'Usuario LAB Supervisor 1', 'Ciudad LAB 03', 'Condiciones simuladas.', 'Asesor LAB', 'Cliente LAB 03 SA de CV', 910051, 910039, 910037, 1),
  (966004, 'LAB - AEROPUERTO TIJUANA', 'PPNS-LAB-0004', 'Sitio instalación LAB 04', '01-SUS', '2026-09-05', 'Proyecto sintético de instalación.', '67', '46', '30', '7', '7', '7', '1.0', '1050', '2026-07-01', 'EN PROCESO LAB', '2026-08-01', '2026-10-15', '11', 'Con Pendientes', 'Pendiente sintético de calidad.', 'Estado LAB 04', 'Usuario LAB Supervisor 2', 'Ciudad LAB 04', 'Condiciones simuladas.', 'Asesor LAB', 'Cliente LAB 04 SA de CV', 910051, 910039, 910037, 1),
  (966005, 'LAB - AEROPUERTO GUADALAJARA', 'PPNS-LAB-0005', 'Sitio instalación LAB 05', '02-OC', '2026-09-06', 'Proyecto sintético de instalación.', '70', '50', '35', '8', '8', '8', '1.25', '450', '2026-07-01', 'EN PROCESO LAB', '2026-08-01', '2026-10-15', '10', 'Sin Pendientes', NULL, 'Estado LAB 05', 'Usuario LAB Supervisor 3', 'Ciudad LAB 05', 'Condiciones simuladas.', 'Asesor LAB', 'Cliente LAB 05 SA de CV', 910051, 910039, 910037, 1),
  (966006, 'LAB - AEROPUERTO LOS CABOS', 'PPNS-LAB-0006', 'Sitio instalación LAB 06', '03-PM', '2026-09-07', 'Proyecto sintético de instalación.', '73', '54', '40', '9', '9', '9', '1.5', '600', '2026-07-01', 'EN PROCESO LAB', '2026-08-01', '2026-10-15', '9', 'Sin Pendientes', NULL, 'Estado LAB 01', 'Usuario LAB Supervisor 1', 'Ciudad LAB 06', 'Condiciones simuladas.', 'Asesor LAB', 'Cliente LAB 06 SA de CV', 910051, 910039, 910037, 1),
  (966007, 'LAB - AEROPUERTO PUERTO VALLARTA', 'PPNS-LAB-0007', 'Sitio instalación LAB 07', '08-T', '2026-09-08', 'Proyecto sintético de instalación.', '76', '58', '45', '10', '10', '10', '1.75', '750', '2026-07-01', 'EN PROCESO LAB', '2026-08-01', '2026-10-15', '8', 'Sin Pendientes', NULL, 'Estado LAB 02', 'Usuario LAB Supervisor 2', 'Ciudad LAB 07', 'Condiciones simuladas.', 'Asesor LAB', 'Cliente LAB 07 SA de CV', 910051, 910039, 910037, 1),
  (966008, 'LAB - WALMART SC SAN JOSE DEL CABO', 'PPNS-LAB-0008', 'Sitio instalación LAB 08', '01-SUS', '2026-09-09', 'Proyecto sintético de instalación.', '79', '62', '50', '11', '11', '11', '1.0', '900', '2026-07-01', 'EN PROCESO LAB', '2026-08-01', '2026-10-15', '7', 'Con Pendientes', 'Pendiente sintético de calidad.', 'Estado LAB 03', 'Usuario LAB Supervisor 3', 'Ciudad LAB 08', 'Condiciones simuladas.', 'Asesor LAB', 'Cliente LAB 08 SA de CV', 910051, 910039, 910037, 1),
  (966009, 'LAB - AKOYA SKY LIVING', 'PPNS-LAB-0009', 'Sitio instalación LAB 09', '02-OC', '2026-09-10', 'Proyecto sintético de instalación.', '82', '66', '55', '12', '12', '12', '1.25', '1050', '2026-07-01', 'EN PROCESO LAB', '2026-08-01', '2026-10-15', '6', 'Sin Pendientes', NULL, 'Estado LAB 04', 'Usuario LAB Supervisor 1', 'Ciudad LAB 09', 'Condiciones simuladas.', 'Asesor LAB', 'Cliente LAB 09 SA de CV', 910051, 910039, 910037, 1),
  (966010, 'LAB - TORRE 22-22', 'PPNS-LAB-0010', 'Sitio instalación LAB 10', '03-PM', '2026-09-11', 'Proyecto sintético de instalación.', '85', '70', '60', '13', '3', '3', '1.5', '450', '2026-07-01', 'EN PROCESO LAB', '2026-08-01', '2026-10-15', '5', 'Sin Pendientes', NULL, 'Estado LAB 05', 'Usuario LAB Supervisor 2', 'Ciudad LAB 10', 'Condiciones simuladas.', 'Asesor LAB', 'Cliente LAB 10 SA de CV', 910051, 910039, 910037, 1),
  (966011, 'LAB - PABELLON METEPEC', 'PPNS-LAB-0011', 'Sitio instalación LAB 11', '08-T', '2026-09-12', 'Proyecto sintético de instalación.', '88', '74', '65', '14', '4', '4', '1.75', '600', '2026-07-01', 'EN PROCESO LAB', '2026-08-01', '2026-10-15', '4', 'Sin Pendientes', NULL, 'Estado LAB 01', 'Usuario LAB Supervisor 3', 'Ciudad LAB 11', 'Condiciones simuladas.', 'Asesor LAB', 'Cliente LAB 11 SA de CV', 910051, 910039, 910037, 1),
  (966012, 'LAB - HOSPITAL SAN ANGEL INN PATRIOTISMO', 'PPNS-LAB-0012', 'Sitio instalación LAB 12', '01-SUS', '2026-09-13', 'Proyecto sintético de instalación.', '91', '78', '70', '3', '5', '5', '1.0', '750', '2026-07-01', 'EN PROCESO LAB', '2026-08-01', '2026-10-15', '3', 'Con Pendientes', 'Pendiente sintético de calidad.', 'Estado LAB 02', 'Usuario LAB Supervisor 1', 'Ciudad LAB 12', 'Condiciones simuladas.', 'Asesor LAB', 'Cliente LAB 12 SA de CV', 910051, 910039, 910037, 1),
  (966013, 'LAB - ALBOR UNIVERSIDAD', 'PPNS-LAB-0013', 'Sitio instalación LAB 13', '02-OC', '2026-09-14', 'Proyecto sintético de instalación.', '94', '82', '75', '4', '6', '6', '1.25', '900', '2026-07-01', 'EN PROCESO LAB', '2026-08-01', '2026-10-15', '2', 'Sin Pendientes', NULL, 'Estado LAB 03', 'Usuario LAB Supervisor 2', 'Ciudad LAB 13', 'Condiciones simuladas.', 'Asesor LAB', 'Cliente LAB 13 SA de CV', 910051, 910039, 910037, 1),
  (966014, 'LAB - PLAZA CITADEL', 'PPNS-LAB-0014', 'Sitio instalación LAB 14', '03-PM', '2026-09-15', 'Proyecto sintético de instalación.', '97', '86', '80', '5', '7', '7', '1.5', '1050', '2026-07-01', 'EN PROCESO LAB', '2026-08-01', '2026-10-15', '1', 'Sin Pendientes', NULL, 'Estado LAB 04', 'Usuario LAB Supervisor 3', 'Ciudad LAB 14', 'Condiciones simuladas.', 'Asesor LAB', 'Cliente LAB 14 SA de CV', 910051, 910039, 910037, 1),
  (966015, 'LAB - CENTRO COMERCIAL PUNTA LAGUNA', 'PPNS-LAB-0015', 'Sitio instalación LAB 15', '08-T', '2026-09-16', 'Proyecto sintético de instalación.', '100', '90', '85', '6', '8', '8', '1.75', '450', '2026-07-01', 'EN PROCESO LAB', '2026-08-01', '2026-10-15', '0', 'Sin Pendientes', NULL, 'Estado LAB 05', 'Usuario LAB Supervisor 1', 'Ciudad LAB 15', 'Condiciones simuladas.', 'Asesor LAB', 'Cliente LAB 15 SA de CV', 910051, 910039, 910037, 1);

-- ins_proyecto_fotos: 8 registros
INSERT INTO `ins_proyecto_fotos` (`id_photo`, `id_ppns`, `carpeta`, `foto_blt_1`, `foto_blt_2`, `foto_principal`, `imagen_drive`, `imagen_p_g`, `activo`, `created_by`, `updated_by`) VALUES
  (966501, 'PPNS-LAB-0001', 'carpeta-lab-01', 'https://example.invalid/lab/fotos/inst/01-1.jpg', 'https://example.invalid/lab/fotos/inst/01-2.jpg', 'foto_blt_1', 'https://example.invalid/lab/drive/01', 'https://example.invalid/lab/pg/01', 1, 910063, 910006),
  (966502, 'PPNS-LAB-0002', 'carpeta-lab-02', 'https://example.invalid/lab/fotos/inst/02-1.jpg', 'https://example.invalid/lab/fotos/inst/02-2.jpg', 'foto_blt_1', 'https://example.invalid/lab/drive/02', 'https://example.invalid/lab/pg/02', 1, 910063, 910006),
  (966503, 'PPNS-LAB-0003', 'carpeta-lab-03', 'https://example.invalid/lab/fotos/inst/03-1.jpg', 'https://example.invalid/lab/fotos/inst/03-2.jpg', 'foto_blt_1', 'https://example.invalid/lab/drive/03', 'https://example.invalid/lab/pg/03', 1, 910063, 910006),
  (966504, 'PPNS-LAB-0004', 'carpeta-lab-04', 'https://example.invalid/lab/fotos/inst/04-1.jpg', 'https://example.invalid/lab/fotos/inst/04-2.jpg', 'foto_blt_1', 'https://example.invalid/lab/drive/04', 'https://example.invalid/lab/pg/04', 1, 910063, 910006),
  (966505, 'PPNS-LAB-0005', 'carpeta-lab-05', 'https://example.invalid/lab/fotos/inst/05-1.jpg', 'https://example.invalid/lab/fotos/inst/05-2.jpg', 'foto_blt_1', 'https://example.invalid/lab/drive/05', 'https://example.invalid/lab/pg/05', 1, 910063, 910006),
  (966506, 'PPNS-LAB-0006', 'carpeta-lab-06', 'https://example.invalid/lab/fotos/inst/06-1.jpg', 'https://example.invalid/lab/fotos/inst/06-2.jpg', 'foto_blt_1', 'https://example.invalid/lab/drive/06', 'https://example.invalid/lab/pg/06', 1, 910063, 910006),
  (966507, 'PPNS-LAB-0007', 'carpeta-lab-07', 'https://example.invalid/lab/fotos/inst/07-1.jpg', 'https://example.invalid/lab/fotos/inst/07-2.jpg', 'foto_blt_1', 'https://example.invalid/lab/drive/07', 'https://example.invalid/lab/pg/07', 1, 910063, 910006),
  (966508, 'PPNS-LAB-0008', 'carpeta-lab-08', 'https://example.invalid/lab/fotos/inst/08-1.jpg', 'https://example.invalid/lab/fotos/inst/08-2.jpg', 'foto_blt_1', 'https://example.invalid/lab/drive/08', 'https://example.invalid/lab/pg/08', 1, 910063, 910006);

-- instalaciones_drive_carpetas: 4 registros
INSERT INTO `instalaciones_drive_carpetas` (`id_carpeta`, `nombre_carpeta`, `carpeta_id`, `enlace`, `activo`, `fecha_sincronizacion`, `created_by`, `updated_by`) VALUES
  (967001, 'Carpeta LAB 01', 'DRIVE-LAB-FOLDER-0001', 'https://example.invalid/lab/drive/folder/0001', 1, '2026-09-10 12:00:00', 910037, 910006),
  (967002, 'Carpeta LAB 02', 'DRIVE-LAB-FOLDER-0002', 'https://example.invalid/lab/drive/folder/0002', 1, '2026-09-10 12:00:00', 910037, 910006),
  (967003, 'Carpeta LAB 03', 'DRIVE-LAB-FOLDER-0003', 'https://example.invalid/lab/drive/folder/0003', 1, '2026-09-10 12:00:00', 910037, 910006),
  (967004, 'Carpeta LAB 04', 'DRIVE-LAB-FOLDER-0004', 'https://example.invalid/lab/drive/folder/0004', 1, '2026-09-10 12:00:00', 910037, 910006),
  (967005, 'Carpeta LAB 05', 'DRIVE-LAB-FOLDER-0005', 'https://example.invalid/lab/drive/folder/0005', 1, '2026-09-10 12:00:00', 910037, 910006),
  (967006, 'Carpeta LAB 06', 'DRIVE-LAB-FOLDER-0006', 'https://example.invalid/lab/drive/folder/0006', 1, '2026-09-10 12:00:00', 910037, 910006),
  (967007, 'Carpeta LAB 07', 'DRIVE-LAB-FOLDER-0007', 'https://example.invalid/lab/drive/folder/0007', 1, '2026-09-10 12:00:00', 910037, 910006),
  (967008, 'Carpeta LAB 08', 'DRIVE-LAB-FOLDER-0008', 'https://example.invalid/lab/drive/folder/0008', 1, '2026-09-10 12:00:00', 910037, 910006);

-- instalaciones_proyecto_drive: 8 registros
INSERT INTO `instalaciones_proyecto_drive` (`id_proyecto_drive`, `id_proyecto`, `nombre_proyecto`, `id_carpeta`, `activo`, `created_by`, `updated_by`) VALUES
  (968001, 'PPNS-LAB-0001', 'LAB - PUNTO VALLE', 967001, 1, 910037, 910006),
  (968002, 'PPNS-LAB-0002', 'LAB - MISTIQ TEMPLE II', 967002, 1, 910037, 910006),
  (968003, 'PPNS-LAB-0003', 'LAB - DURANGO 262', 967003, 1, 910037, 910006),
  (968004, 'PPNS-LAB-0004', 'LAB - AEROPUERTO TIJUANA', 967004, 1, 910037, 910006),
  (968005, 'PPNS-LAB-0005', 'LAB - AEROPUERTO GUADALAJARA', 967005, 1, 910037, 910006),
  (968006, 'PPNS-LAB-0006', 'LAB - AEROPUERTO LOS CABOS', 967006, 1, 910037, 910006),
  (968007, 'PPNS-LAB-0007', 'LAB - AEROPUERTO PUERTO VALLARTA', 967007, 1, 910037, 910006),
  (968008, 'PPNS-LAB-0008', 'LAB - WALMART SC SAN JOSE DEL CABO', 967008, 1, 910037, 910006);

-- instalaciones_proyecto_usuarios: 16 registros
INSERT INTO `instalaciones_proyecto_usuarios` (`id_proyecto_usuario`, `id_proyecto_drive`, `id_usuario`, `tipo`, `activo`) VALUES
  (968501, 968001, 910051, 'SUPERVISOR', 1),
  (968502, 968001, 910039, 'ASESOR', 1),
  (968503, 968002, 910051, 'SUPERVISOR', 1),
  (968504, 968002, 910039, 'ASESOR', 1),
  (968505, 968003, 910051, 'SUPERVISOR', 1),
  (968506, 968003, 910039, 'ASESOR', 1),
  (968507, 968004, 910051, 'SUPERVISOR', 1),
  (968508, 968004, 910039, 'ASESOR', 1),
  (968509, 968005, 910051, 'SUPERVISOR', 1),
  (968510, 968005, 910039, 'ASESOR', 1),
  (968511, 968006, 910051, 'SUPERVISOR', 1),
  (968512, 968006, 910039, 'ASESOR', 1),
  (968513, 968007, 910051, 'SUPERVISOR', 1),
  (968514, 968007, 910039, 'ASESOR', 1),
  (968515, 968008, 910051, 'SUPERVISOR', 1),
  (968516, 968008, 910039, 'ASESOR', 1);

-- instalaciones_bitacora_sync_estado: 8 registros
INSERT INTO `instalaciones_bitacora_sync_estado` (`id_proyecto`, `ultima_sincronizacion`, `ultimo_usuario`, `total_activos`, `total_eliminados`, `truncado`) VALUES
  ('PPNS-LAB-0001', '2026-09-10 12:00:00', 910037, 2, 0, 0),
  ('PPNS-LAB-0002', '2026-09-10 12:00:00', 910037, 2, 0, 0),
  ('PPNS-LAB-0003', '2026-09-10 12:00:00', 910037, 2, 0, 0),
  ('PPNS-LAB-0004', '2026-09-10 12:00:00', 910037, 2, 0, 0),
  ('PPNS-LAB-0005', '2026-09-10 12:00:00', 910037, 2, 0, 0),
  ('PPNS-LAB-0006', '2026-09-10 12:00:00', 910037, 2, 0, 0),
  ('PPNS-LAB-0007', '2026-09-10 12:00:00', 910037, 2, 0, 0),
  ('PPNS-LAB-0008', '2026-09-10 12:00:00', 910037, 2, 0, 0);

-- instalaciones_bitacora_documentos: 16 registros
INSERT INTO `instalaciones_bitacora_documentos` (`id_documento`, `id_proyecto`, `carpeta_raiz_id`, `drive_file_id`, `drive_parent_folder_id`, `nombre_archivo`, `ruta_carpeta`, `mime_type`, `web_view_link`, `fecha_creacion_drive`, `fecha_modificacion_drive`, `fecha_primera_deteccion`, `fecha_ultima_deteccion`, `estatus`, `detectado_por_usuario`) VALUES
  (968803, 'PPNS-LAB-0001', 'DRIVE-LAB-FOLDER-0001', 'DRIVE-LAB-FILE-0001-1', 'DRIVE-LAB-FOLDER-0001', 'documento_lab_01_1.pdf', 'Documentos LAB', 'application/pdf', 'https://example.invalid/lab/drive/file/0001-1', '2026-09-01 10:00:00', '2026-09-09 10:00:00', '2026-09-10 12:00:00', '2026-09-10 12:00:00', 'activo', 910037),
  (968804, 'PPNS-LAB-0001', 'DRIVE-LAB-FOLDER-0001', 'DRIVE-LAB-FILE-0001-2', 'DRIVE-LAB-FOLDER-0001', 'documento_lab_01_2.pdf', 'Documentos LAB', 'application/pdf', 'https://example.invalid/lab/drive/file/0001-2', '2026-09-01 10:00:00', '2026-09-09 10:00:00', '2026-09-10 12:00:00', '2026-09-10 12:00:00', 'activo', 910037),
  (968805, 'PPNS-LAB-0002', 'DRIVE-LAB-FOLDER-0002', 'DRIVE-LAB-FILE-0002-1', 'DRIVE-LAB-FOLDER-0002', 'documento_lab_02_1.pdf', 'Documentos LAB', 'application/pdf', 'https://example.invalid/lab/drive/file/0002-1', '2026-09-01 10:00:00', '2026-09-09 10:00:00', '2026-09-10 12:00:00', '2026-09-10 12:00:00', 'activo', 910037),
  (968806, 'PPNS-LAB-0002', 'DRIVE-LAB-FOLDER-0002', 'DRIVE-LAB-FILE-0002-2', 'DRIVE-LAB-FOLDER-0002', 'documento_lab_02_2.pdf', 'Documentos LAB', 'application/pdf', 'https://example.invalid/lab/drive/file/0002-2', '2026-09-01 10:00:00', '2026-09-09 10:00:00', '2026-09-10 12:00:00', '2026-09-10 12:00:00', 'activo', 910037),
  (968807, 'PPNS-LAB-0003', 'DRIVE-LAB-FOLDER-0003', 'DRIVE-LAB-FILE-0003-1', 'DRIVE-LAB-FOLDER-0003', 'documento_lab_03_1.pdf', 'Documentos LAB', 'application/pdf', 'https://example.invalid/lab/drive/file/0003-1', '2026-09-01 10:00:00', '2026-09-09 10:00:00', '2026-09-10 12:00:00', '2026-09-10 12:00:00', 'activo', 910037),
  (968808, 'PPNS-LAB-0003', 'DRIVE-LAB-FOLDER-0003', 'DRIVE-LAB-FILE-0003-2', 'DRIVE-LAB-FOLDER-0003', 'documento_lab_03_2.pdf', 'Documentos LAB', 'application/pdf', 'https://example.invalid/lab/drive/file/0003-2', '2026-09-01 10:00:00', '2026-09-09 10:00:00', '2026-09-10 12:00:00', '2026-09-10 12:00:00', 'activo', 910037),
  (968809, 'PPNS-LAB-0004', 'DRIVE-LAB-FOLDER-0004', 'DRIVE-LAB-FILE-0004-1', 'DRIVE-LAB-FOLDER-0004', 'documento_lab_04_1.pdf', 'Documentos LAB', 'application/pdf', 'https://example.invalid/lab/drive/file/0004-1', '2026-09-01 10:00:00', '2026-09-09 10:00:00', '2026-09-10 12:00:00', '2026-09-10 12:00:00', 'activo', 910037),
  (968810, 'PPNS-LAB-0004', 'DRIVE-LAB-FOLDER-0004', 'DRIVE-LAB-FILE-0004-2', 'DRIVE-LAB-FOLDER-0004', 'documento_lab_04_2.pdf', 'Documentos LAB', 'application/pdf', 'https://example.invalid/lab/drive/file/0004-2', '2026-09-01 10:00:00', '2026-09-09 10:00:00', '2026-09-10 12:00:00', '2026-09-10 12:00:00', 'activo', 910037),
  (968811, 'PPNS-LAB-0005', 'DRIVE-LAB-FOLDER-0001', 'DRIVE-LAB-FILE-0005-1', 'DRIVE-LAB-FOLDER-0001', 'documento_lab_05_1.pdf', 'Documentos LAB', 'application/pdf', 'https://example.invalid/lab/drive/file/0005-1', '2026-09-01 10:00:00', '2026-09-09 10:00:00', '2026-09-10 12:00:00', '2026-09-10 12:00:00', 'activo', 910037),
  (968812, 'PPNS-LAB-0005', 'DRIVE-LAB-FOLDER-0001', 'DRIVE-LAB-FILE-0005-2', 'DRIVE-LAB-FOLDER-0001', 'documento_lab_05_2.pdf', 'Documentos LAB', 'application/pdf', 'https://example.invalid/lab/drive/file/0005-2', '2026-09-01 10:00:00', '2026-09-09 10:00:00', '2026-09-10 12:00:00', '2026-09-10 12:00:00', 'activo', 910037),
  (968813, 'PPNS-LAB-0006', 'DRIVE-LAB-FOLDER-0002', 'DRIVE-LAB-FILE-0006-1', 'DRIVE-LAB-FOLDER-0002', 'documento_lab_06_1.pdf', 'Documentos LAB', 'application/pdf', 'https://example.invalid/lab/drive/file/0006-1', '2026-09-01 10:00:00', '2026-09-09 10:00:00', '2026-09-10 12:00:00', '2026-09-10 12:00:00', 'activo', 910037),
  (968814, 'PPNS-LAB-0006', 'DRIVE-LAB-FOLDER-0002', 'DRIVE-LAB-FILE-0006-2', 'DRIVE-LAB-FOLDER-0002', 'documento_lab_06_2.pdf', 'Documentos LAB', 'application/pdf', 'https://example.invalid/lab/drive/file/0006-2', '2026-09-01 10:00:00', '2026-09-09 10:00:00', '2026-09-10 12:00:00', '2026-09-10 12:00:00', 'activo', 910037),
  (968815, 'PPNS-LAB-0007', 'DRIVE-LAB-FOLDER-0003', 'DRIVE-LAB-FILE-0007-1', 'DRIVE-LAB-FOLDER-0003', 'documento_lab_07_1.pdf', 'Documentos LAB', 'application/pdf', 'https://example.invalid/lab/drive/file/0007-1', '2026-09-01 10:00:00', '2026-09-09 10:00:00', '2026-09-10 12:00:00', '2026-09-10 12:00:00', 'activo', 910037),
  (968816, 'PPNS-LAB-0007', 'DRIVE-LAB-FOLDER-0003', 'DRIVE-LAB-FILE-0007-2', 'DRIVE-LAB-FOLDER-0003', 'documento_lab_07_2.pdf', 'Documentos LAB', 'application/pdf', 'https://example.invalid/lab/drive/file/0007-2', '2026-09-01 10:00:00', '2026-09-09 10:00:00', '2026-09-10 12:00:00', '2026-09-10 12:00:00', 'activo', 910037),
  (968817, 'PPNS-LAB-0008', 'DRIVE-LAB-FOLDER-0004', 'DRIVE-LAB-FILE-0008-1', 'DRIVE-LAB-FOLDER-0004', 'documento_lab_08_1.pdf', 'Documentos LAB', 'application/pdf', 'https://example.invalid/lab/drive/file/0008-1', '2026-09-01 10:00:00', '2026-09-09 10:00:00', '2026-09-10 12:00:00', '2026-09-10 12:00:00', 'activo', 910037),
  (968818, 'PPNS-LAB-0008', 'DRIVE-LAB-FOLDER-0004', 'DRIVE-LAB-FILE-0008-2', 'DRIVE-LAB-FOLDER-0004', 'documento_lab_08_2.pdf', 'Documentos LAB', 'application/pdf', 'https://example.invalid/lab/drive/file/0008-2', '2026-09-01 10:00:00', '2026-09-09 10:00:00', '2026-09-10 12:00:00', '2026-09-10 12:00:00', 'activo', 910037);

-- ventas_clientes: 10 registros
INSERT INTO `ventas_clientes` (`id_cliente`, `nombre_empresa`, `razon_social`, `ciudad`, `estado`, `ubicacion`, `nombre_contacto`, `puesto_contacto`, `email`, `telefono`, `tipo_cliente`, `estatus_cliente`, `proyecto_vendido`, `iniciales`, `visualiza`, `comentarios`, `activo`, `created_by`, `updated_by`) VALUES
  (960001, 'Cliente Comercial LAB 01', 'Razón Social Laboratorio 01 SA de CV', 'Ciudad Comercial LAB 01', 'Estado Comercial LAB 01', 'Ubicación sintética 01', 'Contacto LAB 01', 'Compras LAB', 'contacto01@cliente.lab.invalid', '+52-555-000-0001', 'CORPORATIVO', 'ACTIVO', 'LAB - PUNTO VALLE', 'CL01', 'LAB', 'Cliente completamente ficticio.', 1, 910039, 910039),
  (960002, 'Cliente Comercial LAB 02', 'Razón Social Laboratorio 02 SA de CV', 'Ciudad Comercial LAB 02', 'Estado Comercial LAB 02', 'Ubicación sintética 02', 'Contacto LAB 02', 'Compras LAB', 'contacto02@cliente.lab.invalid', '+52-555-000-0002', 'PARTICULAR', 'ACTIVO', 'LAB - MISTIQ TEMPLE II', 'CL02', 'LAB', 'Cliente completamente ficticio.', 1, 910039, 910039),
  (960003, 'Cliente Comercial LAB 03', 'Razón Social Laboratorio 03 SA de CV', 'Ciudad Comercial LAB 03', 'Estado Comercial LAB 03', 'Ubicación sintética 03', 'Contacto LAB 03', 'Compras LAB', 'contacto03@cliente.lab.invalid', '+52-555-000-0003', 'DESARROLLADOR', 'ACTIVO', 'LAB - DURANGO 262', 'CL03', 'LAB', 'Cliente completamente ficticio.', 1, 910039, 910039),
  (960004, 'Cliente Comercial LAB 04', 'Razón Social Laboratorio 04 SA de CV', 'Ciudad Comercial LAB 04', 'Estado Comercial LAB 04', 'Ubicación sintética 04', 'Contacto LAB 04', 'Compras LAB', 'contacto04@cliente.lab.invalid', '+52-555-000-0004', 'CORPORATIVO', 'ACTIVO', 'LAB - AEROPUERTO TIJUANA', 'CL04', 'LAB', 'Cliente completamente ficticio.', 1, 910039, 910039),
  (960005, 'Cliente Comercial LAB 05', 'Razón Social Laboratorio 05 SA de CV', 'Ciudad Comercial LAB 05', 'Estado Comercial LAB 01', 'Ubicación sintética 05', 'Contacto LAB 05', 'Compras LAB', 'contacto05@cliente.lab.invalid', '+52-555-000-0005', 'PARTICULAR', 'ACTIVO', 'LAB - AEROPUERTO GUADALAJARA', 'CL05', 'LAB', 'Cliente completamente ficticio.', 1, 910039, 910039),
  (960006, 'Cliente Comercial LAB 06', 'Razón Social Laboratorio 06 SA de CV', 'Ciudad Comercial LAB 06', 'Estado Comercial LAB 02', 'Ubicación sintética 06', 'Contacto LAB 06', 'Compras LAB', 'contacto06@cliente.lab.invalid', '+52-555-000-0006', 'DESARROLLADOR', 'ACTIVO', 'LAB - AEROPUERTO LOS CABOS', 'CL06', 'LAB', 'Cliente completamente ficticio.', 1, 910039, 910039),
  (960007, 'Cliente Comercial LAB 07', 'Razón Social Laboratorio 07 SA de CV', 'Ciudad Comercial LAB 07', 'Estado Comercial LAB 03', 'Ubicación sintética 07', 'Contacto LAB 07', 'Compras LAB', 'contacto07@cliente.lab.invalid', '+52-555-000-0007', 'CORPORATIVO', 'ACTIVO', 'LAB - AEROPUERTO PUERTO VALLARTA', 'CL07', 'LAB', 'Cliente completamente ficticio.', 1, 910039, 910039),
  (960008, 'Cliente Comercial LAB 08', 'Razón Social Laboratorio 08 SA de CV', 'Ciudad Comercial LAB 08', 'Estado Comercial LAB 04', 'Ubicación sintética 08', 'Contacto LAB 08', 'Compras LAB', 'contacto08@cliente.lab.invalid', '+52-555-000-0008', 'PARTICULAR', 'ACTIVO', 'LAB - WALMART SC SAN JOSE DEL CABO', 'CL08', 'LAB', 'Cliente completamente ficticio.', 1, 910039, 910039),
  (960009, 'Cliente Comercial LAB 09', 'Razón Social Laboratorio 09 SA de CV', 'Ciudad Comercial LAB 09', 'Estado Comercial LAB 01', 'Ubicación sintética 09', 'Contacto LAB 09', 'Compras LAB', 'contacto09@cliente.lab.invalid', '+52-555-000-0009', 'DESARROLLADOR', 'ACTIVO', 'LAB - AKOYA SKY LIVING', 'CL09', 'LAB', 'Cliente completamente ficticio.', 1, 910039, 910039),
  (960010, 'Cliente Comercial LAB 10', 'Razón Social Laboratorio 10 SA de CV', 'Ciudad Comercial LAB 10', 'Estado Comercial LAB 02', 'Ubicación sintética 10', 'Contacto LAB 10', 'Compras LAB', 'contacto10@cliente.lab.invalid', '+52-555-000-0010', 'CORPORATIVO', 'ACTIVO', 'LAB - TORRE 22-22', 'CL10', 'LAB', 'Cliente completamente ficticio.', 1, 910039, 910039);

-- ventas_clientes_contactos: 10 registros
INSERT INTO `ventas_clientes_contactos` (`id_contacto`, `id_cliente`, `nombre_contacto`, `puesto_contacto`, `email`, `telefono`, `contacto_principal`, `activo`, `created_by`, `updated_by`) VALUES
  (961001, 960001, 'Contacto LAB 01', 'Compras LAB', 'contacto01@cliente.lab.invalid', '+52-555-100-0001', 1, 1, 910039, 910039),
  (961002, 960002, 'Contacto LAB 02', 'Compras LAB', 'contacto02@cliente.lab.invalid', '+52-555-100-0002', 1, 1, 910039, 910039),
  (961003, 960003, 'Contacto LAB 03', 'Compras LAB', 'contacto03@cliente.lab.invalid', '+52-555-100-0003', 1, 1, 910039, 910039),
  (961004, 960004, 'Contacto LAB 04', 'Compras LAB', 'contacto04@cliente.lab.invalid', '+52-555-100-0004', 1, 1, 910039, 910039),
  (961005, 960005, 'Contacto LAB 05', 'Compras LAB', 'contacto05@cliente.lab.invalid', '+52-555-100-0005', 1, 1, 910039, 910039),
  (961006, 960006, 'Contacto LAB 06', 'Compras LAB', 'contacto06@cliente.lab.invalid', '+52-555-100-0006', 1, 1, 910039, 910039),
  (961007, 960007, 'Contacto LAB 07', 'Compras LAB', 'contacto07@cliente.lab.invalid', '+52-555-100-0007', 1, 1, 910039, 910039),
  (961008, 960008, 'Contacto LAB 08', 'Compras LAB', 'contacto08@cliente.lab.invalid', '+52-555-100-0008', 1, 1, 910039, 910039),
  (961009, 960009, 'Contacto LAB 09', 'Compras LAB', 'contacto09@cliente.lab.invalid', '+52-555-100-0009', 1, 1, 910039, 910039),
  (961010, 960010, 'Contacto LAB 10', 'Compras LAB', 'contacto10@cliente.lab.invalid', '+52-555-100-0010', 1, 1, 910039, 910039);

-- ventas_cotizaciones_cor: 10 registros
INSERT INTO `ventas_cotizaciones_cor` (`id_cotizacion`, `id_cot_origen`, `nombre_proyecto`, `id_cliente`, `id_contacto`, `cliente`, `contacto`, `telefono`, `correo`, `ciudad`, `estado`, `tipo_proyecto`, `numero_equipos`, `tipo_equipos`, `informacion_envia`, `asesor`, `id_asesor`, `visualiza`, `anio_mes_cotizacion`, `mx`, `fecha_cotizacion`, `fecha_solicitud`, `zona`, `estatus_proyecto`, `razon_perdido`, `admin`, `id_admin`, `fecha_cambio_estatus`, `fecha_cierre`, `comentario`, `empresa_vs_perdido`, `id_equipo_vendido`, `anio_actual`, `activo`, `created_by`, `updated_by`) VALUES
  (962001, 5001, 'LAB - PUNTO VALLE', 960001, 961001, 'Cliente Comercial LAB 01', 'Contacto LAB 01', '+52-555-100-0001', 'contacto01@cliente.lab.invalid', 'Ciudad Comercial LAB 01', 'Estado Comercial LAB 01', 'Proyecto LAB', 2, 'Escalera', 'Información sintética', 'L39', 910039, 'LAB', '2026-09', 'MXN', '2026-09-01', '2026-08-16', 'CNB-01', 'Contacto', NULL, 'L47', 910047, '2026-09-01', NULL, 'Cotización sintética para laboratorio.', NULL, NULL, 2026, 1, 910039, 910039),
  (962002, 5002, 'LAB - MISTIQ TEMPLE II', 960002, 961002, 'Cliente Comercial LAB 02', 'Contacto LAB 02', '+52-555-100-0002', 'contacto02@cliente.lab.invalid', 'Ciudad Comercial LAB 02', 'Estado Comercial LAB 02', 'Proyecto LAB', 3, 'Rampa', 'Información sintética', 'L39', 910039, 'LAB', '2026-09', 'MXN', '2026-09-02', '2026-08-17', 'CNB-02', 'En Cotización', NULL, 'L47', 910047, '2026-09-02', NULL, 'Cotización sintética para laboratorio.', NULL, NULL, 2026, 1, 910039, 910039),
  (962003, 5003, 'LAB - DURANGO 262', 960003, 961003, 'Cliente Comercial LAB 03', 'Contacto LAB 03', '+52-555-100-0003', 'contacto03@cliente.lab.invalid', 'Ciudad Comercial LAB 03', 'Estado Comercial LAB 03', 'Proyecto LAB', 1, 'Elevador', 'Información sintética', 'L39', 910039, 'LAB', '2026-09', 'MXN', '2026-09-03', '2026-08-18', 'CNB-03', 'Sin Respuesta', NULL, 'L47', 910047, '2026-09-03', NULL, 'Cotización sintética para laboratorio.', NULL, NULL, 2026, 1, 910039, 910039),
  (962004, 5004, 'LAB - AEROPUERTO TIJUANA', 960004, 961004, 'Cliente Comercial LAB 04', 'Contacto LAB 04', '+52-555-100-0004', 'contacto04@cliente.lab.invalid', 'Ciudad Comercial LAB 04', 'Estado Comercial LAB 04', 'Proyecto LAB', 2, 'Escalera', 'Información sintética', 'L39', 910039, 'LAB', '2026-09', 'MXN', '2026-09-04', '2026-08-19', 'CNA-01', 'Seguimiento', NULL, 'L47', 910047, '2026-09-04', NULL, 'Cotización sintética para laboratorio.', NULL, NULL, 2026, 1, 910039, 910039),
  (962005, 5005, 'LAB - AEROPUERTO GUADALAJARA', 960005, 961005, 'Cliente Comercial LAB 05', 'Contacto LAB 05', '+52-555-100-0005', 'contacto05@cliente.lab.invalid', 'Ciudad Comercial LAB 05', 'Estado Comercial LAB 01', 'Proyecto LAB', 3, 'Rampa', 'Información sintética', 'L39', 910039, 'LAB', '2026-09', 'MXN', '2026-09-05', '2026-08-20', 'CNA-02', 'En Espera', NULL, 'L47', 910047, '2026-09-05', NULL, 'Cotización sintética para laboratorio.', NULL, NULL, 2026, 1, 910039, 910039),
  (962006, 5006, 'LAB - AEROPUERTO LOS CABOS', 960006, 961006, 'Cliente Comercial LAB 06', 'Contacto LAB 06', '+52-555-100-0006', 'contacto06@cliente.lab.invalid', 'Ciudad Comercial LAB 06', 'Estado Comercial LAB 02', 'Proyecto LAB', 1, 'Elevador', 'Información sintética', 'L39', 910039, 'LAB', '2026-09', 'MXN', '2026-09-06', '2026-08-21', 'CNA-03', 'Pre Asignado', NULL, 'L47', 910047, '2026-09-06', NULL, 'Cotización sintética para laboratorio.', NULL, NULL, 2026, 1, 910039, 910039),
  (962007, 5007, 'LAB - AEROPUERTO PUERTO VALLARTA', 960007, 961007, 'Cliente Comercial LAB 07', 'Contacto LAB 07', '+52-555-100-0007', 'contacto07@cliente.lab.invalid', 'Ciudad Comercial LAB 07', 'Estado Comercial LAB 03', 'Proyecto LAB', 2, 'Escalera', 'Información sintética', 'L39', 910039, 'LAB', '2026-09', 'MXN', '2026-09-07', '2026-08-22', 'CNA-04', 'Asignado', NULL, 'L47', 910047, '2026-09-07', NULL, 'Cotización sintética para laboratorio.', NULL, NULL, 2026, 1, 910039, 910039),
  (962008, 5008, 'LAB - WALMART SC SAN JOSE DEL CABO', 960008, 961008, 'Cliente Comercial LAB 08', 'Contacto LAB 08', '+52-555-100-0008', 'contacto08@cliente.lab.invalid', 'Ciudad Comercial LAB 08', 'Estado Comercial LAB 04', 'Proyecto LAB', 3, 'Rampa', 'Información sintética', 'L39', 910039, 'LAB', '2026-09', 'MXN', '2026-09-08', '2026-08-23', 'OCC-01', 'En Contrato', NULL, 'L47', 910047, '2026-09-08', NULL, 'Cotización sintética para laboratorio.', NULL, NULL, 2026, 1, 910039, 910039),
  (962009, 5009, 'LAB - AKOYA SKY LIVING', 960009, 961009, 'Cliente Comercial LAB 09', 'Contacto LAB 09', '+52-555-100-0009', 'contacto09@cliente.lab.invalid', 'Ciudad Comercial LAB 09', 'Estado Comercial LAB 01', 'Proyecto LAB', 1, 'Elevador', 'Información sintética', 'L39', 910039, 'LAB', '2026-09', 'MXN', '2026-09-09', '2026-08-24', 'OCC-02', 'Vendido', NULL, 'L47', 910047, '2026-09-09', '2026-09-09', 'Cotización sintética para laboratorio.', NULL, '99009-LAB-MON-DGB', 2026, 1, 910039, 910039),
  (962010, 5010, 'LAB - TORRE 22-22', 960010, 961010, 'Cliente Comercial LAB 10', 'Contacto LAB 10', '+52-555-100-0010', 'contacto10@cliente.lab.invalid', 'Ciudad Comercial LAB 10', 'Estado Comercial LAB 02', 'Proyecto LAB', 2, 'Escalera', 'Información sintética', 'L39', 910039, 'LAB', '2026-09', 'MXN', '2026-09-10', '2026-08-25', 'NOR-01', 'Perdido', 'Precio LAB', 'L47', 910047, '2026-09-10', '2026-09-10', 'Cotización sintética para laboratorio.', 'Competidor LAB', NULL, 2026, 1, 910039, 910039);

-- ventas_cotizaciones_equipos_cor: 10 registros
INSERT INTO `ventas_cotizaciones_equipos_cor` (`id_cotizacion_equipo`, `id_cotizacion`, `tipo_equipo`, `cantidad`, `orden`, `activo`) VALUES
  (962501, 962001, 'Montacargas', 2, 1, 1),
  (962502, 962002, 'Escalera', 3, 1, 1),
  (962503, 962003, 'Rampa', 1, 1, 1),
  (962504, 962004, 'Plataformas/Otros', 2, 1, 1),
  (962505, 962005, 'Elevador', 3, 1, 1),
  (962506, 962006, 'Montacargas', 1, 1, 1),
  (962507, 962007, 'Escalera', 2, 1, 1),
  (962508, 962008, 'Rampa', 3, 1, 1),
  (962509, 962009, 'Plataformas/Otros', 1, 1, 1),
  (962510, 962010, 'Elevador', 2, 1, 1);

-- ventas_cotizaciones_historial: 10 registros
INSERT INTO `ventas_cotizaciones_historial` (`id_historial`, `id_cotizacion`, `estatus_anterior`, `estatus_nuevo`, `fecha_movimiento`, `motivo`, `comentario`, `campo_origen`, `valor_anterior`, `valor_nuevo`, `id_usuario`, `iniciales_usuario`, `origen_movimiento`, `empresa`, `activo`) VALUES
  (962601, 962001, NULL, 'Contacto', '2026-09-01 12:00:00', 'Cambio sintético', 'Historial LAB', 'estatus_proyecto', NULL, 'Contacto', 910039, 'L39', 'CAMBIO_ESTATUS', 'Corellian LAB', 1),
  (962602, 962002, 'Contacto', 'En Cotización', '2026-09-02 12:00:00', 'Cambio sintético', 'Historial LAB', 'estatus_proyecto', 'Contacto', 'En Cotización', 910039, 'L39', 'CAMBIO_ESTATUS', 'Corellian LAB', 1),
  (962603, 962003, 'Contacto', 'Sin Respuesta', '2026-09-03 12:00:00', 'Cambio sintético', 'Historial LAB', 'estatus_proyecto', 'Contacto', 'Sin Respuesta', 910039, 'L39', 'CAMBIO_ESTATUS', 'Corellian LAB', 1),
  (962604, 962004, 'Contacto', 'Seguimiento', '2026-09-04 12:00:00', 'Cambio sintético', 'Historial LAB', 'estatus_proyecto', 'Contacto', 'Seguimiento', 910039, 'L39', 'CAMBIO_ESTATUS', 'Corellian LAB', 1),
  (962605, 962005, 'Contacto', 'En Espera', '2026-09-05 12:00:00', 'Cambio sintético', 'Historial LAB', 'estatus_proyecto', 'Contacto', 'En Espera', 910039, 'L39', 'CAMBIO_ESTATUS', 'Corellian LAB', 1),
  (962606, 962006, 'Contacto', 'Pre Asignado', '2026-09-06 12:00:00', 'Cambio sintético', 'Historial LAB', 'estatus_proyecto', 'Contacto', 'Pre Asignado', 910039, 'L39', 'CAMBIO_ESTATUS', 'Corellian LAB', 1),
  (962607, 962007, 'Contacto', 'Asignado', '2026-09-07 12:00:00', 'Cambio sintético', 'Historial LAB', 'estatus_proyecto', 'Contacto', 'Asignado', 910039, 'L39', 'CAMBIO_ESTATUS', 'Corellian LAB', 1),
  (962608, 962008, 'Contacto', 'En Contrato', '2026-09-08 12:00:00', 'Cambio sintético', 'Historial LAB', 'estatus_proyecto', 'Contacto', 'En Contrato', 910039, 'L39', 'CAMBIO_ESTATUS', 'Corellian LAB', 1),
  (962609, 962009, 'Contacto', 'Vendido', '2026-09-09 12:00:00', 'Cambio sintético', 'Historial LAB', 'estatus_proyecto', 'Contacto', 'Vendido', 910039, 'L39', 'CAMBIO_ESTATUS', 'Corellian LAB', 1),
  (962610, 962010, 'Contacto', 'Perdido', '2026-09-10 12:00:00', 'Cambio sintético', 'Historial LAB', 'estatus_proyecto', 'Contacto', 'Perdido', 910039, 'L39', 'CAMBIO_ESTATUS', 'Corellian LAB', 1);

-- ventas_cotizaciones_comentarios: 10 registros
INSERT INTO `ventas_cotizaciones_comentarios` (`id_comentario`, `id_cotizacion`, `id_usuario`, `comentario`, `editado`, `activo`) VALUES
  (962701, 962001, 910039, 'Comentario comercial sintético.', 0, 1),
  (962702, 962002, 910039, 'Comentario comercial sintético.', 0, 1),
  (962703, 962003, 910039, 'Comentario comercial sintético.', 0, 1),
  (962704, 962004, 910039, 'Comentario comercial sintético.', 0, 1),
  (962705, 962005, 910039, 'Comentario comercial sintético.', 0, 1),
  (962706, 962006, 910039, 'Comentario comercial sintético.', 0, 1),
  (962707, 962007, 910039, 'Comentario comercial sintético.', 0, 1),
  (962708, 962008, 910039, 'Comentario comercial sintético.', 0, 1),
  (962709, 962009, 910039, 'Comentario comercial sintético.', 0, 1),
  (962710, 962010, 910039, 'Comentario comercial sintético.', 0, 1);

-- ventas_cotizaciones_archivos: 5 registros
INSERT INTO `ventas_cotizaciones_archivos` (`id_archivo`, `id_cotizacion`, `id_comentario`, `id_usuario`, `nombre_archivo`, `nombre_original`, `extension`, `mime_type`, `tamanio_bytes`, `storage_provider`, `storage_url`, `tipo_archivo`, `descripcion`, `version_numero`, `activo`) VALUES
  (962801, 962001, 962701, 910039, 'cotizacion_lab_01.pdf', 'cotizacion_lab_01.pdf', 'pdf', 'application/pdf', 10100, 'LAB_LOCAL', 'https://example.invalid/lab/ventas/cot/01.pdf', 'COTIZACION', 'Archivo ficticio.', 1, 1),
  (962802, 962002, 962702, 910039, 'cotizacion_lab_02.pdf', 'cotizacion_lab_02.pdf', 'pdf', 'application/pdf', 10200, 'LAB_LOCAL', 'https://example.invalid/lab/ventas/cot/02.pdf', 'COTIZACION', 'Archivo ficticio.', 1, 1),
  (962803, 962003, 962703, 910039, 'cotizacion_lab_03.pdf', 'cotizacion_lab_03.pdf', 'pdf', 'application/pdf', 10300, 'LAB_LOCAL', 'https://example.invalid/lab/ventas/cot/03.pdf', 'COTIZACION', 'Archivo ficticio.', 1, 1),
  (962804, 962004, 962704, 910039, 'cotizacion_lab_04.pdf', 'cotizacion_lab_04.pdf', 'pdf', 'application/pdf', 10400, 'LAB_LOCAL', 'https://example.invalid/lab/ventas/cot/04.pdf', 'COTIZACION', 'Archivo ficticio.', 1, 1),
  (962805, 962005, 962705, 910039, 'cotizacion_lab_05.pdf', 'cotizacion_lab_05.pdf', 'pdf', 'application/pdf', 10500, 'LAB_LOCAL', 'https://example.invalid/lab/ventas/cot/05.pdf', 'COTIZACION', 'Archivo ficticio.', 1, 1);

-- ventas_prospeccion_estatus: 6 registros
INSERT INTO `ventas_prospeccion_estatus` (`id_estatus`, `codigo`, `nombre`, `orden`, `es_cierre`, `es_descartado`, `activo`) VALUES
  (981001, 'NUEVO', 'Nuevo LAB', 1, 0, 0, 1),
  (981002, 'CONTACTADO', 'Contactado LAB', 2, 0, 0, 1),
  (981003, 'VISITA', 'Visita LAB', 3, 0, 0, 1),
  (981004, 'COTIZADO', 'Cotizado LAB', 4, 0, 0, 1),
  (981005, 'GANADO', 'Ganado LAB', 5, 1, 0, 1),
  (981006, 'DESCARTADO', 'Descartado LAB', 6, 1, 1, 1);

-- ventas_prospecciones: 10 registros
INSERT INTO `ventas_prospecciones` (`id_pros`, `empresa`, `proyecto`, `ubicacion`, `latitud`, `longitud`, `contacto`, `puesto_contacto`, `correo`, `telefono`, `comentario`, `id_usuario`, `ciudad`, `estado`, `tipo_proyecto`, `fecha_visita`, `id_estatus`, `estatus`, `fecha_cam_estatus`, `nuevo`, `proyecto_activo`, `proyecto_cotizado`, `id_proyecto_instalacion`, `id_cotizacion`, `id_cliente`, `id_contacto`, `activo`) VALUES
  (963001, 'Prospecto Empresa LAB 01', 'LAB - AEROPUERTO LOS CABOS', 'Zona simulada 01', 19.01, -99.01, 'Prospecto Contacto LAB 01', 'Desarrollo LAB', 'prospecto01@lab.invalid', '+52-555-200-0001', 'Prospección totalmente sintética.', 910039, 'Ciudad Prospección LAB 01', 'Estado Prospección LAB 02', 'Desarrollo LAB', '2026-09-01 10:00:00', 981001, 'Nuevo LAB', '2026-09-01 11:00:00', 1, 0, 0, NULL, NULL, NULL, NULL, 1),
  (963002, 'Prospecto Empresa LAB 02', 'LAB - AEROPUERTO PUERTO VALLARTA', 'Zona simulada 02', 19.02, -99.02, 'Prospecto Contacto LAB 02', 'Desarrollo LAB', 'prospecto02@lab.invalid', '+52-555-200-0002', 'Prospección totalmente sintética.', 910039, 'Ciudad Prospección LAB 02', 'Estado Prospección LAB 03', 'Desarrollo LAB', '2026-09-02 10:00:00', 981002, 'Contactado LAB', '2026-09-02 11:00:00', 1, 0, 0, NULL, NULL, NULL, NULL, 1),
  (963003, 'Prospecto Empresa LAB 03', 'LAB - WALMART SC SAN JOSE DEL CABO', 'Zona simulada 03', 19.03, -99.03, 'Prospecto Contacto LAB 03', 'Desarrollo LAB', 'prospecto03@lab.invalid', '+52-555-200-0003', 'Prospección totalmente sintética.', 910039, 'Ciudad Prospección LAB 03', 'Estado Prospección LAB 04', 'Desarrollo LAB', '2026-09-03 10:00:00', 981003, 'Visita LAB', '2026-09-03 11:00:00', 0, 1, 0, NULL, NULL, NULL, NULL, 1),
  (963004, 'Prospecto Empresa LAB 04', 'LAB - AKOYA SKY LIVING', 'Zona simulada 04', 19.04, -99.04, 'Prospecto Contacto LAB 04', 'Desarrollo LAB', 'prospecto04@lab.invalid', '+52-555-200-0004', 'Prospección totalmente sintética.', 910039, 'Ciudad Prospección LAB 04', 'Estado Prospección LAB 01', 'Desarrollo LAB', '2026-09-04 10:00:00', 981004, 'Cotizado LAB', '2026-09-04 11:00:00', 0, 0, 1, NULL, 962004, NULL, NULL, 1),
  (963005, 'Prospecto Empresa LAB 05', 'LAB - TORRE 22-22', 'Zona simulada 05', 19.05, -99.05, 'Prospecto Contacto LAB 05', 'Desarrollo LAB', 'prospecto05@lab.invalid', '+52-555-200-0005', 'Prospección totalmente sintética.', 910039, 'Ciudad Prospección LAB 05', 'Estado Prospección LAB 02', 'Desarrollo LAB', '2026-09-05 10:00:00', 981005, 'Ganado LAB', '2026-09-05 11:00:00', 0, 1, 0, 'PPNS-LAB-0005', 962005, 960005, 961005, 1),
  (963006, 'Prospecto Empresa LAB 06', 'LAB - PABELLON METEPEC', 'Zona simulada 06', 19.06, -99.06, 'Prospecto Contacto LAB 06', 'Desarrollo LAB', 'prospecto06@lab.invalid', '+52-555-200-0006', 'Prospección totalmente sintética.', 910039, 'Ciudad Prospección LAB 06', 'Estado Prospección LAB 03', 'Desarrollo LAB', '2026-09-06 10:00:00', 981006, 'Descartado LAB', '2026-09-06 11:00:00', 1, 0, 0, NULL, NULL, NULL, NULL, 1),
  (963007, 'Prospecto Empresa LAB 07', 'LAB - HOSPITAL SAN ANGEL INN PATRIOTISMO', 'Zona simulada 07', 19.07, -99.07, 'Prospecto Contacto LAB 07', 'Desarrollo LAB', 'prospecto07@lab.invalid', '+52-555-200-0007', 'Prospección totalmente sintética.', 910039, 'Ciudad Prospección LAB 07', 'Estado Prospección LAB 04', 'Desarrollo LAB', '2026-09-07 10:00:00', 981001, 'Nuevo LAB', '2026-09-07 11:00:00', 1, 0, 0, NULL, NULL, NULL, NULL, 1),
  (963008, 'Prospecto Empresa LAB 08', 'LAB - ALBOR UNIVERSIDAD', 'Zona simulada 08', 19.08, -99.08, 'Prospecto Contacto LAB 08', 'Desarrollo LAB', 'prospecto08@lab.invalid', '+52-555-200-0008', 'Prospección totalmente sintética.', 910039, 'Ciudad Prospección LAB 08', 'Estado Prospección LAB 01', 'Desarrollo LAB', '2026-09-08 10:00:00', 981002, 'Contactado LAB', '2026-09-08 11:00:00', 0, 1, 0, NULL, NULL, NULL, NULL, 1),
  (963009, 'Prospecto Empresa LAB 09', 'LAB - PLAZA CITADEL', 'Zona simulada 09', 19.09, -99.09, 'Prospecto Contacto LAB 09', 'Desarrollo LAB', 'prospecto09@lab.invalid', '+52-555-200-0009', 'Prospección totalmente sintética.', 910039, 'Ciudad Prospección LAB 09', 'Estado Prospección LAB 02', 'Desarrollo LAB', '2026-09-09 10:00:00', 981003, 'Visita LAB', '2026-09-09 11:00:00', 0, 1, 0, NULL, NULL, NULL, NULL, 1),
  (963010, 'Prospecto Empresa LAB 10', 'LAB - CENTRO COMERCIAL PUNTA LAGUNA', 'Zona simulada 10', 19.1, -99.1, 'Prospecto Contacto LAB 10', 'Desarrollo LAB', 'prospecto10@lab.invalid', '+52-555-200-0010', 'Prospección totalmente sintética.', 910039, 'Ciudad Prospección LAB 10', 'Estado Prospección LAB 03', 'Desarrollo LAB', '2026-09-10 10:00:00', 981004, 'Cotizado LAB', '2026-09-10 11:00:00', 0, 0, 1, NULL, 962010, NULL, NULL, 1);

-- ventas_prospeccion_comentarios: 10 registros
INSERT INTO `ventas_prospeccion_comentarios` (`id_com_pors`, `id_pros`, `id_usuario`, `comentario`, `fecha_hora`, `editado`, `activo`) VALUES
  (963501, 963001, 910039, 'Comentario de prospección LAB.', '2026-09-01 11:30:00', 0, 1),
  (963502, 963002, 910039, 'Comentario de prospección LAB.', '2026-09-02 11:30:00', 0, 1),
  (963503, 963003, 910039, 'Comentario de prospección LAB.', '2026-09-03 11:30:00', 0, 1),
  (963504, 963004, 910039, 'Comentario de prospección LAB.', '2026-09-04 11:30:00', 0, 1),
  (963505, 963005, 910039, 'Comentario de prospección LAB.', '2026-09-05 11:30:00', 0, 1),
  (963506, 963006, 910039, 'Comentario de prospección LAB.', '2026-09-06 11:30:00', 0, 1),
  (963507, 963007, 910039, 'Comentario de prospección LAB.', '2026-09-07 11:30:00', 0, 1),
  (963508, 963008, 910039, 'Comentario de prospección LAB.', '2026-09-08 11:30:00', 0, 1),
  (963509, 963009, 910039, 'Comentario de prospección LAB.', '2026-09-09 11:30:00', 0, 1),
  (963510, 963010, 910039, 'Comentario de prospección LAB.', '2026-09-10 11:30:00', 0, 1);

-- ventas_prospeccion_archivos: 5 registros
INSERT INTO `ventas_prospeccion_archivos` (`id_archivo`, `id_pros`, `id_com_pors`, `tipo_relacion`, `nombre_archivo`, `nombre_original`, `mime_type`, `extension`, `tamano_bytes`, `storage_provider`, `storage_url`, `orden`, `es_imagen`, `activo`) VALUES
  (963601, 963001, 963501, 'COMENTARIO', 'visita_lab_01.jpg', 'visita_lab_01.jpg', 'image/jpeg', 'jpg', 8100, 'LAB_LOCAL', 'https://example.invalid/lab/prospeccion/01.jpg', 1, 1, 1),
  (963602, 963002, 963502, 'COMENTARIO', 'visita_lab_02.jpg', 'visita_lab_02.jpg', 'image/jpeg', 'jpg', 8200, 'LAB_LOCAL', 'https://example.invalid/lab/prospeccion/02.jpg', 1, 1, 1),
  (963603, 963003, 963503, 'COMENTARIO', 'visita_lab_03.jpg', 'visita_lab_03.jpg', 'image/jpeg', 'jpg', 8300, 'LAB_LOCAL', 'https://example.invalid/lab/prospeccion/03.jpg', 1, 1, 1),
  (963604, 963004, 963504, 'COMENTARIO', 'visita_lab_04.jpg', 'visita_lab_04.jpg', 'image/jpeg', 'jpg', 8400, 'LAB_LOCAL', 'https://example.invalid/lab/prospeccion/04.jpg', 1, 1, 1),
  (963605, 963005, 963505, 'COMENTARIO', 'visita_lab_05.jpg', 'visita_lab_05.jpg', 'image/jpeg', 'jpg', 8500, 'LAB_LOCAL', 'https://example.invalid/lab/prospeccion/05.jpg', 1, 1, 1);

-- ventas_redes: 10 registros
INSERT INTO `ventas_redes` (`id_redes`, `nombre_contacto`, `id_contacto_via`, `email`, `telefono`, `id_estado`, `nombre_empresa`, `ciudad`, `nombre_proyecto`, `informacion_enviada`, `id_solicitud`, `id_usuario_asignado`, `created_by`, `id_estatus`, `fecha_cambio_estatus`, `id_cotizacion`, `activo`, `updated_by`) VALUES
  (964001, 'Red Contacto LAB 01', 980011, 'red01@lab.invalid', '+52-555-300-0001', 980013, 'Empresa Redes LAB 01', 'Ciudad Redes LAB 01', 'LAB - AEROPUERTO TIJUANA', 'Ficha sintética enviada.', 980014, 910039, 910047, 980015, '2026-09-01 12:00:00', 962001, 1, 910039),
  (964002, 'Red Contacto LAB 02', 980010, 'red02@lab.invalid', '+52-555-300-0002', 980012, 'Empresa Redes LAB 02', 'Ciudad Redes LAB 02', 'LAB - AEROPUERTO GUADALAJARA', 'Ficha sintética enviada.', 980014, 910039, 910047, 980015, '2026-09-02 12:00:00', 962002, 1, 910039),
  (964003, 'Red Contacto LAB 03', 980011, 'red03@lab.invalid', '+52-555-300-0003', 980013, 'Empresa Redes LAB 03', 'Ciudad Redes LAB 03', 'LAB - AEROPUERTO LOS CABOS', 'Ficha sintética enviada.', 980014, 910039, 910047, 980015, '2026-09-03 12:00:00', 962003, 1, 910039),
  (964004, 'Red Contacto LAB 04', 980010, 'red04@lab.invalid', '+52-555-300-0004', 980012, 'Empresa Redes LAB 04', 'Ciudad Redes LAB 04', 'LAB - AEROPUERTO PUERTO VALLARTA', 'Ficha sintética enviada.', 980014, 910039, 910047, 980015, '2026-09-04 12:00:00', 962004, 1, 910039),
  (964005, 'Red Contacto LAB 05', 980011, 'red05@lab.invalid', '+52-555-300-0005', 980013, 'Empresa Redes LAB 05', 'Ciudad Redes LAB 05', 'LAB - WALMART SC SAN JOSE DEL CABO', 'Ficha sintética enviada.', 980014, 910039, 910047, 980015, '2026-09-05 12:00:00', 962005, 1, 910039),
  (964006, 'Red Contacto LAB 06', 980010, 'red06@lab.invalid', '+52-555-300-0006', 980012, 'Empresa Redes LAB 06', 'Ciudad Redes LAB 06', 'LAB - AKOYA SKY LIVING', 'Ficha sintética enviada.', 980014, 910039, 910047, 980015, '2026-09-06 12:00:00', NULL, 1, 910039),
  (964007, 'Red Contacto LAB 07', 980011, 'red07@lab.invalid', '+52-555-300-0007', 980013, 'Empresa Redes LAB 07', 'Ciudad Redes LAB 07', 'LAB - TORRE 22-22', 'Ficha sintética enviada.', 980014, 910039, 910047, 980015, '2026-09-07 12:00:00', NULL, 1, 910039),
  (964008, 'Red Contacto LAB 08', 980010, 'red08@lab.invalid', '+52-555-300-0008', 980012, 'Empresa Redes LAB 08', 'Ciudad Redes LAB 08', 'LAB - PABELLON METEPEC', 'Ficha sintética enviada.', 980014, 910039, 910047, 980015, '2026-09-08 12:00:00', NULL, 1, 910039),
  (964009, 'Red Contacto LAB 09', 980011, 'red09@lab.invalid', '+52-555-300-0009', 980013, 'Empresa Redes LAB 09', 'Ciudad Redes LAB 09', 'LAB - HOSPITAL SAN ANGEL INN PATRIOTISMO', 'Ficha sintética enviada.', 980014, 910039, 910047, 980015, '2026-09-09 12:00:00', NULL, 1, 910039),
  (964010, 'Red Contacto LAB 10', 980010, 'red10@lab.invalid', '+52-555-300-0010', 980012, 'Empresa Redes LAB 10', 'Ciudad Redes LAB 10', 'LAB - ALBOR UNIVERSIDAD', 'Ficha sintética enviada.', 980014, 910039, 910047, 980015, '2026-09-10 12:00:00', NULL, 1, 910039);

-- ventas_redes_comentarios: 10 registros
INSERT INTO `ventas_redes_comentarios` (`id_comentario`, `id_redes`, `id_usuario`, `comentario`, `tipo_evento`, `fecha_hora`, `editado`, `activo`) VALUES
  (964501, 964001, 910039, 'Comentario sintético de redes.', 'COMENTARIO', '2026-09-01 12:30:00', 0, 1),
  (964502, 964002, 910039, 'Comentario sintético de redes.', 'COMENTARIO', '2026-09-02 12:30:00', 0, 1),
  (964503, 964003, 910039, 'Comentario sintético de redes.', 'COMENTARIO', '2026-09-03 12:30:00', 0, 1),
  (964504, 964004, 910039, 'Comentario sintético de redes.', 'COMENTARIO', '2026-09-04 12:30:00', 0, 1),
  (964505, 964005, 910039, 'Comentario sintético de redes.', 'COMENTARIO', '2026-09-05 12:30:00', 0, 1),
  (964506, 964006, 910039, 'Comentario sintético de redes.', 'COMENTARIO', '2026-09-06 12:30:00', 0, 1),
  (964507, 964007, 910039, 'Comentario sintético de redes.', 'COMENTARIO', '2026-09-07 12:30:00', 0, 1),
  (964508, 964008, 910039, 'Comentario sintético de redes.', 'COMENTARIO', '2026-09-08 12:30:00', 0, 1),
  (964509, 964009, 910039, 'Comentario sintético de redes.', 'COMENTARIO', '2026-09-09 12:30:00', 0, 1),
  (964510, 964010, 910039, 'Comentario sintético de redes.', 'COMENTARIO', '2026-09-10 12:30:00', 0, 1);

-- ventas_redes_archivos: 5 registros
INSERT INTO `ventas_redes_archivos` (`id_archivo`, `id_redes`, `orden_archivo`, `nombre_archivo`, `nombre_original`, `extension`, `mime_type`, `tamanio_bytes`, `storage_provider`, `storage_url`, `tipo_archivo`, `descripcion`, `id_usuario`, `activo`) VALUES
  (964601, 964001, 1, 'red_lab_01.pdf', 'red_lab_01.pdf', 'pdf', 'application/pdf', 9050, 'LAB_LOCAL', 'https://example.invalid/lab/redes/01.pdf', 'EVIDENCIA', 'Archivo ficticio.', 910039, 1),
  (964602, 964002, 1, 'red_lab_02.pdf', 'red_lab_02.pdf', 'pdf', 'application/pdf', 9100, 'LAB_LOCAL', 'https://example.invalid/lab/redes/02.pdf', 'EVIDENCIA', 'Archivo ficticio.', 910039, 1),
  (964603, 964003, 1, 'red_lab_03.pdf', 'red_lab_03.pdf', 'pdf', 'application/pdf', 9150, 'LAB_LOCAL', 'https://example.invalid/lab/redes/03.pdf', 'EVIDENCIA', 'Archivo ficticio.', 910039, 1),
  (964604, 964004, 1, 'red_lab_04.pdf', 'red_lab_04.pdf', 'pdf', 'application/pdf', 9200, 'LAB_LOCAL', 'https://example.invalid/lab/redes/04.pdf', 'EVIDENCIA', 'Archivo ficticio.', 910039, 1),
  (964605, 964005, 1, 'red_lab_05.pdf', 'red_lab_05.pdf', 'pdf', 'application/pdf', 9250, 'LAB_LOCAL', 'https://example.invalid/lab/redes/05.pdf', 'EVIDENCIA', 'Archivo ficticio.', 910039, 1);

-- log_ops: 10 registros
INSERT INTO `log_ops` (`id_log_ops`, `id_ppns`, `ph_ns`, `estatus`, `marca`, `no_control`, `cantidad`, `proyecto`, `supervisor`, `asesor`, `ict`, `incoterm`, `proveedor`, `carpeta`, `pvo`, `pago_cliente`, `pago_liberacion`, `fecha_produccion`, `fecha_estimada_obra`, `fecha_exw`, `puerto_origen`, `fecha_salida_estimada`, `fecha_salida_real`, `tiempo_transito`) VALUES
  (965001, 'PPNS-LAB-0001', 'PH-LAB-0001', 'EN PRODUCCION', 'MARCA LAB', 'CTRL-LAB-0001', 2, 'LAB - PUNTO VALLE', 'Supervisor Logística LAB', 'Asesor LAB', 'ICT-LAB-0001', 'FOB LAB', 'Proveedor LAB 01', 'CARP-LAB-0001', 'PVO-LAB-0001', 'SIMULADO', 'SIMULADO', '2026-08-11', '2026-11-01', '2026-10-01', 'PUERTO LAB', '2026-10-11', NULL, '25 días LAB'),
  (965002, 'PPNS-LAB-0002', 'PH-LAB-0002', 'EN TRANSITO', 'MARCA LAB', 'CTRL-LAB-0002', 3, 'LAB - MISTIQ TEMPLE II', 'Supervisor Logística LAB', 'Asesor LAB', 'ICT-LAB-0002', 'FOB LAB', 'Proveedor LAB 02', 'CARP-LAB-0002', 'PVO-LAB-0002', 'SIMULADO', 'SIMULADO', '2026-08-12', '2026-11-02', '2026-10-02', 'PUERTO LAB', '2026-10-12', '2026-10-13', '25 días LAB'),
  (965003, 'PPNS-LAB-0003', 'PH-LAB-0003', 'LIBERADO', 'MARCA LAB', 'CTRL-LAB-0003', 1, 'LAB - DURANGO 262', 'Supervisor Logística LAB', 'Asesor LAB', 'ICT-LAB-0003', 'FOB LAB', 'Proveedor LAB 03', 'CARP-LAB-0003', 'PVO-LAB-0003', 'SIMULADO', 'SIMULADO', '2026-08-13', '2026-11-03', '2026-10-03', 'PUERTO LAB', '2026-10-13', NULL, '25 días LAB'),
  (965004, 'PPNS-LAB-0004', 'PH-LAB-0004', 'PENDIENTE', 'MARCA LAB', 'CTRL-LAB-0004', 2, 'LAB - AEROPUERTO TIJUANA', 'Supervisor Logística LAB', 'Asesor LAB', 'ICT-LAB-0004', 'FOB LAB', 'Proveedor LAB 04', 'CARP-LAB-0004', 'PVO-LAB-0004', 'SIMULADO', 'SIMULADO', '2026-08-14', '2026-11-04', '2026-10-04', 'PUERTO LAB', '2026-10-14', '2026-10-15', '25 días LAB'),
  (965005, 'PPNS-LAB-0005', 'PH-LAB-0005', 'EN PRODUCCION', 'MARCA LAB', 'CTRL-LAB-0005', 3, 'LAB - AEROPUERTO GUADALAJARA', 'Supervisor Logística LAB', 'Asesor LAB', 'ICT-LAB-0005', 'FOB LAB', 'Proveedor LAB 05', 'CARP-LAB-0005', 'PVO-LAB-0005', 'SIMULADO', 'SIMULADO', '2026-08-15', '2026-11-05', '2026-10-05', 'PUERTO LAB', '2026-10-15', NULL, '25 días LAB'),
  (965006, 'PPNS-LAB-0006', 'PH-LAB-0006', 'EN TRANSITO', 'MARCA LAB', 'CTRL-LAB-0006', 1, 'LAB - AEROPUERTO LOS CABOS', 'Supervisor Logística LAB', 'Asesor LAB', 'ICT-LAB-0006', 'FOB LAB', 'Proveedor LAB 06', 'CARP-LAB-0006', 'PVO-LAB-0006', 'SIMULADO', 'SIMULADO', '2026-08-16', '2026-11-06', '2026-10-06', 'PUERTO LAB', '2026-10-16', '2026-10-17', '25 días LAB'),
  (965007, 'PPNS-LAB-0007', 'PH-LAB-0007', 'LIBERADO', 'MARCA LAB', 'CTRL-LAB-0007', 2, 'LAB - AEROPUERTO PUERTO VALLARTA', 'Supervisor Logística LAB', 'Asesor LAB', 'ICT-LAB-0007', 'FOB LAB', 'Proveedor LAB 07', 'CARP-LAB-0007', 'PVO-LAB-0007', 'SIMULADO', 'SIMULADO', '2026-08-17', '2026-11-07', '2026-10-07', 'PUERTO LAB', '2026-10-17', NULL, '25 días LAB'),
  (965008, 'PPNS-LAB-0008', 'PH-LAB-0008', 'PENDIENTE', 'MARCA LAB', 'CTRL-LAB-0008', 3, 'LAB - WALMART SC SAN JOSE DEL CABO', 'Supervisor Logística LAB', 'Asesor LAB', 'ICT-LAB-0008', 'FOB LAB', 'Proveedor LAB 08', 'CARP-LAB-0008', 'PVO-LAB-0008', 'SIMULADO', 'SIMULADO', '2026-08-18', '2026-11-08', '2026-10-08', 'PUERTO LAB', '2026-10-18', '2026-10-19', '25 días LAB'),
  (965009, 'PPNS-LAB-0009', 'PH-LAB-0009', 'EN PRODUCCION', 'MARCA LAB', 'CTRL-LAB-0009', 1, 'LAB - AKOYA SKY LIVING', 'Supervisor Logística LAB', 'Asesor LAB', 'ICT-LAB-0009', 'FOB LAB', 'Proveedor LAB 09', 'CARP-LAB-0009', 'PVO-LAB-0009', 'SIMULADO', 'SIMULADO', '2026-08-19', '2026-11-09', '2026-10-09', 'PUERTO LAB', '2026-10-19', NULL, '25 días LAB'),
  (965010, 'PPNS-LAB-0010', 'PH-LAB-0010', 'EN TRANSITO', 'MARCA LAB', 'CTRL-LAB-0010', 2, 'LAB - TORRE 22-22', 'Supervisor Logística LAB', 'Asesor LAB', 'ICT-LAB-0010', 'FOB LAB', 'Proveedor LAB 10', 'CARP-LAB-0010', 'PVO-LAB-0010', 'SIMULADO', 'SIMULADO', '2026-08-20', '2026-11-10', '2026-10-10', 'PUERTO LAB', '2026-10-20', '2026-10-21', '25 días LAB');

-- logistica_produccion: 10 registros
INSERT INTO `logistica_produccion` (`id_produccion`, `id_log_ops`, `modo_registro`, `ppns`, `proyecto`, `id_cotizacion_venta`, `id_asesor`, `id_supervisor`, `fecha_pvo`, `fecha_pvo_fl`, `fecha_cubos`, `estatus_logistica`, `id_estatus_produccion`, `comentario`, `fecha_envio_docs_fabrica`, `fecha_envio_pago_fabrica`, `semana_registro`, `anio_registro`, `origen_registro`, `legacy_source_key`, `activo`, `created_by`, `updated_by`) VALUES
  (965501, 965001, 'MANUAL', 'PPNS-LAB-0001', 'LAB - PUNTO VALLE', 962001, 910039, 910056, '2026-08-01', '2026-08-11', '2026-09-01', 'En producción LAB', 980002, 'Registro logístico sintético.', '2026-08-06', '2026-08-07', 36, 2026, 'GESTOR', NULL, 1, 910038, 910056),
  (965502, 965002, 'SEMI_AUTOMATICO', 'PPNS-LAB-0002', 'LAB - MISTIQ TEMPLE II', 962002, 910039, 910056, '2026-08-02', '2026-08-12', '2026-09-02', 'Liberado LAB', 980003, 'Registro logístico sintético.', '2026-08-07', '2026-08-08', 37, 2026, 'GESTOR', NULL, 1, 910038, 910056),
  (965503, 965003, 'MANUAL', 'PPNS-LAB-0003', 'LAB - DURANGO 262', 962003, 910039, 910056, '2026-08-03', '2026-08-13', '2026-09-03', 'En diseño LAB', 980001, 'Registro logístico sintético.', '2026-08-08', '2026-08-09', 38, 2026, 'GESTOR', NULL, 1, 910038, 910056),
  (965504, 965004, 'SEMI_AUTOMATICO', 'PPNS-LAB-0004', 'LAB - AEROPUERTO TIJUANA', 962004, 910039, 910056, '2026-08-04', '2026-08-14', '2026-09-04', 'En producción LAB', 980002, 'Registro logístico sintético.', '2026-08-09', '2026-08-10', 39, 2026, 'GESTOR', NULL, 1, 910038, 910056),
  (965505, 965005, 'MANUAL', 'PPNS-LAB-0005', 'LAB - AEROPUERTO GUADALAJARA', 962005, 910039, 910056, '2026-08-05', '2026-08-15', '2026-09-05', 'Liberado LAB', 980003, 'Registro logístico sintético.', '2026-08-10', '2026-08-11', 35, 2026, 'GESTOR', NULL, 1, 910038, 910056),
  (965506, 965006, 'SEMI_AUTOMATICO', 'PPNS-LAB-0006', 'LAB - AEROPUERTO LOS CABOS', 962006, 910039, 910056, '2026-08-06', '2026-08-16', '2026-09-06', 'En diseño LAB', 980001, 'Registro logístico sintético.', '2026-08-11', '2026-08-12', 36, 2026, 'GESTOR', NULL, 1, 910038, 910056),
  (965507, 965007, 'MANUAL', 'PPNS-LAB-0007', 'LAB - AEROPUERTO PUERTO VALLARTA', 962007, 910039, 910056, '2026-08-07', '2026-08-17', '2026-09-07', 'En producción LAB', 980002, 'Registro logístico sintético.', '2026-08-12', '2026-08-13', 37, 2026, 'GESTOR', NULL, 1, 910038, 910056),
  (965508, 965008, 'SEMI_AUTOMATICO', 'PPNS-LAB-0008', 'LAB - WALMART SC SAN JOSE DEL CABO', 962008, 910039, 910056, '2026-08-08', '2026-08-18', '2026-09-08', 'Liberado LAB', 980003, 'Registro logístico sintético.', '2026-08-13', '2026-08-14', 38, 2026, 'GESTOR', NULL, 1, 910038, 910056),
  (965509, 965009, 'MANUAL', 'PPNS-LAB-0009', 'LAB - AKOYA SKY LIVING', 962009, 910039, 910056, '2026-08-09', '2026-08-19', '2026-09-09', 'En diseño LAB', 980001, 'Registro logístico sintético.', '2026-08-14', '2026-08-15', 39, 2026, 'GESTOR', NULL, 1, 910038, 910056),
  (965510, 965010, 'SEMI_AUTOMATICO', 'PPNS-LAB-0010', 'LAB - TORRE 22-22', 962010, 910039, 910056, '2026-08-10', '2026-08-20', '2026-09-10', 'En producción LAB', 980002, 'Registro logístico sintético.', '2026-08-15', '2026-08-16', 35, 2026, 'GESTOR', NULL, 1, 910038, 910056);

-- logistica_produccion_archivos: 5 registros
INSERT INTO `logistica_produccion_archivos` (`id_archivo`, `id_produccion`, `tipo_archivo`, `numero_archivo`, `nombre_archivo`, `nombre_original`, `extension`, `mime_type`, `tamanio_bytes`, `storage_provider`, `storage_container`, `storage_blob_name`, `storage_url`, `origen_archivo`, `id_usuario`, `activo`) VALUES
  (965701, 965501, 'GM', 1, 'logistica_lab_01.pdf', 'logistica_lab_01.pdf', 'pdf', 'application/pdf', 12100, 'LAB_LOCAL', 'lab', 'logistica/01.pdf', 'https://example.invalid/lab/logistica/01.pdf', 'NUEVO', 910038, 1),
  (965702, 965502, 'GM', 1, 'logistica_lab_02.pdf', 'logistica_lab_02.pdf', 'pdf', 'application/pdf', 12200, 'LAB_LOCAL', 'lab', 'logistica/02.pdf', 'https://example.invalid/lab/logistica/02.pdf', 'NUEVO', 910038, 1),
  (965703, 965503, 'GM', 1, 'logistica_lab_03.pdf', 'logistica_lab_03.pdf', 'pdf', 'application/pdf', 12300, 'LAB_LOCAL', 'lab', 'logistica/03.pdf', 'https://example.invalid/lab/logistica/03.pdf', 'NUEVO', 910038, 1),
  (965704, 965504, 'GM', 1, 'logistica_lab_04.pdf', 'logistica_lab_04.pdf', 'pdf', 'application/pdf', 12400, 'LAB_LOCAL', 'lab', 'logistica/04.pdf', 'https://example.invalid/lab/logistica/04.pdf', 'NUEVO', 910038, 1),
  (965705, 965505, 'GM', 1, 'logistica_lab_05.pdf', 'logistica_lab_05.pdf', 'pdf', 'application/pdf', 12500, 'LAB_LOCAL', 'lab', 'logistica/05.pdf', 'https://example.invalid/lab/logistica/05.pdf', 'NUEVO', 910038, 1);

-- logistica_cortes_semanales: 1 registros
INSERT INTO `logistica_cortes_semanales` (`id_corte`, `anio_iso`, `semana_iso`, `fecha_corte`, `total_log_ops`, `total_movimientos`, `total_ingresos`, `total_cambios_estatus`, `snapshot_json`, `movimientos_json`, `estado`, `hash_contenido`, `generado_por`) VALUES
  (965900, 2026, 37, '2026-09-13 12:00:00', 10, 4, 2, 2, '{"lab": true, "total": 10}', '{"lab": true, "movimientos": 4}', 'CERRADO', '5b34f41f2923696d02d44374dd1b61796d7985a7e72751b889beab16bcdbc225', 910006);

-- cobranza_indice_cor: 10 registros
INSERT INTO `cobranza_indice_cor` (`id_indice_cor`, `proyecto`, `qty`, `anio`, `pp`, `mrc`, `adm`, `sup`, `vend`, `edo`, `estatus`, `cobranza_usd`, `cobranza_mxn`, `fianzas`, `tipo_fianza`, `repse_siroc`, `activo`, `creado_por`, `actualizado_por`) VALUES
  (973001, 'LAB - AEROPUERTO LOS CABOS', 2, 2026, 'PP-LAB-0001', 'MRC-LAB-0001', 910042, 910051, 910039, 'EDO-LAB-2', 'PENDIENTE', 0.6, 0.5, 0, NULL, 0, 1, 910042, 910006),
  (973002, 'LAB - AEROPUERTO PUERTO VALLARTA', 3, 2026, 'PP-LAB-0002', 'MRC-LAB-0002', 910042, 910051, 910039, 'EDO-LAB-3', 'CERRADO', 0.7, 0.6, 0, NULL, 0, 1, 910042, 910006),
  (973003, 'LAB - WALMART SC SAN JOSE DEL CABO', 1, 2026, 'PP-LAB-0003', 'MRC-LAB-0003', 910042, 910051, 910039, 'EDO-LAB-4', 'ACTIVO', 0.8, 0.7, 1, 'Cumplimiento LAB', 0, 1, 910042, 910006),
  (973004, 'LAB - AKOYA SKY LIVING', 2, 2026, 'PP-LAB-0004', 'MRC-LAB-0004', 910042, 910051, 910039, 'EDO-LAB-1', 'PENDIENTE', 0.9, 0.8, 0, NULL, 1, 1, 910042, 910006),
  (973005, 'LAB - TORRE 22-22', 3, 2026, 'PP-LAB-0005', 'MRC-LAB-0005', 910042, 910051, 910039, 'EDO-LAB-2', 'CERRADO', 0.5, 0.9, 0, NULL, 0, 1, 910042, 910006),
  (973006, 'LAB - PABELLON METEPEC', 1, 2026, 'PP-LAB-0006', 'MRC-LAB-0006', 910042, 910051, 910039, 'EDO-LAB-3', 'ACTIVO', 0.6, 0.4, 1, 'Cumplimiento LAB', 0, 1, 910042, 910006),
  (973007, 'LAB - HOSPITAL SAN ANGEL INN PATRIOTISMO', 2, 2026, 'PP-LAB-0007', 'MRC-LAB-0007', 910042, 910051, 910039, 'EDO-LAB-4', 'PENDIENTE', 0.7, 0.5, 0, NULL, 0, 1, 910042, 910006),
  (973008, 'LAB - ALBOR UNIVERSIDAD', 3, 2026, 'PP-LAB-0008', 'MRC-LAB-0008', 910042, 910051, 910039, 'EDO-LAB-1', 'CERRADO', 0.8, 0.6, 0, NULL, 1, 1, 910042, 910006),
  (973009, 'LAB - PLAZA CITADEL', 1, 2026, 'PP-LAB-0009', 'MRC-LAB-0009', 910042, 910051, 910039, 'EDO-LAB-2', 'ACTIVO', 0.9, 0.7, 1, 'Cumplimiento LAB', 0, 1, 910042, 910006),
  (973010, 'LAB - CENTRO COMERCIAL PUNTA LAGUNA', 2, 2026, 'PP-LAB-0010', 'MRC-LAB-0010', 910042, 910051, 910039, 'EDO-LAB-3', 'PENDIENTE', 0.5, 0.8, 0, NULL, 0, 1, 910042, 910006);

-- cobranza_fuente_cor: 20 registros
INSERT INTO `cobranza_fuente_cor` (`id_fuente_cor`, `id_indice_cor`, `proyecto`, `id_proyecto_origen`, `porcentaje`, `condicion`, `moneda`, `subtotal`, `iva`, `total`, `factura`, `pago_total`, `estatus_factura`, `fecha_pago`, `fecha_vencimiento`, `dias_vencimiento`, `estimado_pago`, `estatus_vencimiento`, `anio_proyecto`, `activo`, `creado_por`, `actualizado_por`) VALUES
  (973501, 973001, 'LAB - AEROPUERTO LOS CABOS', 'COR-LAB-0001', 0.5, 'Condición sintética 1', 'MXN', 22844.8275862069, 3655.1724137931014, 26500, 'FACT-COR-LAB-001-1', 10600.0, 'PENDIENTE', NULL, '2026-09-11', 0, 'Septiembre LAB', 'VIGENTE', 2026, 1, 910042, 910006),
  (973502, 973001, 'LAB - AEROPUERTO LOS CABOS', 'COR-LAB-0001', 0.5, 'Condición sintética 2', 'USD', 23275.862068965518, 3724.137931034482, 27000, 'FACT-COR-LAB-001-2', 27000, 'PAGADA', '2026-09-01', '2026-09-11', 0, 'Septiembre LAB', 'VIGENTE', 2026, 1, 910042, 910006),
  (973503, 973002, 'LAB - AEROPUERTO PUERTO VALLARTA', 'COR-LAB-0002', 0.5, 'Condición sintética 1', 'MXN', 23706.89655172414, 3793.1034482758587, 27500, 'FACT-COR-LAB-002-1', 27500, 'PAGADA', '2026-09-02', '2026-09-12', 0, 'Septiembre LAB', 'VIGENTE', 2026, 1, 910042, 910006),
  (973504, 973002, 'LAB - AEROPUERTO PUERTO VALLARTA', 'COR-LAB-0002', 0.5, 'Condición sintética 2', 'USD', 24137.93103448276, 3862.068965517239, 28000, 'FACT-COR-LAB-002-2', 11200.0, 'PENDIENTE', NULL, '2026-09-12', 0, 'Septiembre LAB', 'VIGENTE', 2026, 1, 910042, 910006),
  (973505, 973003, 'LAB - WALMART SC SAN JOSE DEL CABO', 'COR-LAB-0003', 0.5, 'Condición sintética 1', 'MXN', 24568.96551724138, 3931.0344827586196, 28500, 'FACT-COR-LAB-003-1', 11400.0, 'PENDIENTE', NULL, '2026-09-13', 0, 'Septiembre LAB', 'VIGENTE', 2026, 1, 910042, 910006),
  (973506, 973003, 'LAB - WALMART SC SAN JOSE DEL CABO', 'COR-LAB-0003', 0.5, 'Condición sintética 2', 'USD', 25000.0, 4000.0, 29000, 'FACT-COR-LAB-003-2', 11600.0, 'PENDIENTE', NULL, '2026-09-13', 0, 'Septiembre LAB', 'VIGENTE', 2026, 1, 910042, 910006),
  (973507, 973004, 'LAB - AKOYA SKY LIVING', 'COR-LAB-0004', 0.5, 'Condición sintética 1', 'MXN', 25431.034482758623, 4068.965517241377, 29500, 'FACT-COR-LAB-004-1', 11800.0, 'PENDIENTE', NULL, '2026-09-14', 0, 'Septiembre LAB', 'VIGENTE', 2026, 1, 910042, 910006),
  (973508, 973004, 'LAB - AKOYA SKY LIVING', 'COR-LAB-0004', 0.5, 'Condición sintética 2', 'USD', 25862.068965517243, 4137.931034482757, 30000, 'FACT-COR-LAB-004-2', 30000, 'PAGADA', '2026-09-04', '2026-09-14', 0, 'Septiembre LAB', 'VIGENTE', 2026, 1, 910042, 910006),
  (973509, 973005, 'LAB - TORRE 22-22', 'COR-LAB-0005', 0.5, 'Condición sintética 1', 'MXN', 26293.103448275862, 4206.896551724138, 30500, 'FACT-COR-LAB-005-1', 30500, 'PAGADA', '2026-09-05', '2026-09-15', 0, 'Septiembre LAB', 'VIGENTE', 2026, 1, 910042, 910006),
  (973510, 973005, 'LAB - TORRE 22-22', 'COR-LAB-0005', 0.5, 'Condición sintética 2', 'USD', 26724.137931034486, 4275.8620689655145, 31000, 'FACT-COR-LAB-005-2', 12400.0, 'PENDIENTE', NULL, '2026-09-15', 0, 'Septiembre LAB', 'VIGENTE', 2026, 1, 910042, 910006),
  (973511, 973006, 'LAB - PABELLON METEPEC', 'COR-LAB-0006', 0.5, 'Condición sintética 1', 'MXN', 27155.172413793105, 4344.827586206895, 31500, 'FACT-COR-LAB-006-1', 12600.0, 'PENDIENTE', NULL, '2026-09-16', 1, 'Septiembre LAB', 'VENCIDA', 2026, 1, 910042, 910006),
  (973512, 973006, 'LAB - PABELLON METEPEC', 'COR-LAB-0006', 0.5, 'Condición sintética 2', 'USD', 27586.206896551725, 4413.793103448275, 32000, 'FACT-COR-LAB-006-2', 12800.0, 'PENDIENTE', NULL, '2026-09-16', 1, 'Septiembre LAB', 'VENCIDA', 2026, 1, 910042, 910006),
  (973513, 973007, 'LAB - HOSPITAL SAN ANGEL INN PATRIOTISMO', 'COR-LAB-0007', 0.5, 'Condición sintética 1', 'MXN', 28017.241379310348, 4482.758620689652, 32500, 'FACT-COR-LAB-007-1', 13000.0, 'PENDIENTE', NULL, '2026-09-17', 2, 'Septiembre LAB', 'VENCIDA', 2026, 1, 910042, 910006),
  (973514, 973007, 'LAB - HOSPITAL SAN ANGEL INN PATRIOTISMO', 'COR-LAB-0007', 0.5, 'Condición sintética 2', 'USD', 28448.275862068967, 4551.724137931033, 33000, 'FACT-COR-LAB-007-2', 33000, 'PAGADA', '2026-09-07', '2026-09-17', 2, 'Septiembre LAB', 'VENCIDA', 2026, 1, 910042, 910006),
  (973515, 973008, 'LAB - ALBOR UNIVERSIDAD', 'COR-LAB-0008', 0.5, 'Condición sintética 1', 'MXN', 28879.310344827587, 4620.689655172413, 33500, 'FACT-COR-LAB-008-1', 33500, 'PAGADA', '2026-09-08', '2026-09-18', 3, 'Septiembre LAB', 'VENCIDA', 2026, 1, 910042, 910006),
  (973516, 973008, 'LAB - ALBOR UNIVERSIDAD', 'COR-LAB-0008', 0.5, 'Condición sintética 2', 'USD', 29310.34482758621, 4689.65517241379, 34000, 'FACT-COR-LAB-008-2', 13600.0, 'PENDIENTE', NULL, '2026-09-18', 3, 'Septiembre LAB', 'VENCIDA', 2026, 1, 910042, 910006),
  (973517, 973009, 'LAB - PLAZA CITADEL', 'COR-LAB-0009', 0.5, 'Condición sintética 1', 'MXN', 29741.37931034483, 4758.62068965517, 34500, 'FACT-COR-LAB-009-1', 13800.0, 'PENDIENTE', NULL, '2026-09-19', 4, 'Septiembre LAB', 'VENCIDA', 2026, 1, 910042, 910006),
  (973518, 973009, 'LAB - PLAZA CITADEL', 'COR-LAB-0009', 0.5, 'Condición sintética 2', 'USD', 30172.41379310345, 4827.586206896551, 35000, 'FACT-COR-LAB-009-2', 14000.0, 'PENDIENTE', NULL, '2026-09-19', 4, 'Septiembre LAB', 'VENCIDA', 2026, 1, 910042, 910006),
  (973519, 973010, 'LAB - CENTRO COMERCIAL PUNTA LAGUNA', 'COR-LAB-0010', 0.5, 'Condición sintética 1', 'MXN', 30603.448275862072, 4896.5517241379275, 35500, 'FACT-COR-LAB-010-1', 14200.0, 'PENDIENTE', NULL, '2026-09-20', 5, 'Septiembre LAB', 'VENCIDA', 2026, 1, 910042, 910006),
  (973520, 973010, 'LAB - CENTRO COMERCIAL PUNTA LAGUNA', 'COR-LAB-0010', 0.5, 'Condición sintética 2', 'USD', 31034.482758620692, 4965.517241379308, 36000, 'FACT-COR-LAB-010-2', 36000, 'PAGADA', '2026-09-10', '2026-09-20', 5, 'Septiembre LAB', 'VENCIDA', 2026, 1, 910042, 910006);

-- cobranza_aditivas_cor: 10 registros
INSERT INTO `cobranza_aditivas_cor` (`id_aditiva_cor`, `id_indice_cor`, `anio_cot`, `departamento`, `categoria`, `fecha_cot`, `firma_cot`, `no_cot`, `ov`, `factura`, `estatus_trabajos`, `estatus_cobranza`, `sup`, `pp_ns`, `proyecto`, `equipo`, `descripcion`, `comentario_fuente`, `monto_subtotal`, `iva_pct`, `monto_iva`, `monto_total`, `gasto_subtotal`, `oc`, `diferencia`, `utilidad_real_pct`, `monto_pagado`, `pagado_sin_iva`, `pendiente_pago`, `fecha_pago`, `semana_pago`, `moneda`, `gasto_ejercido`, `activo`, `creado_por`, `actualizado_por`) VALUES
  (974001, 973001, 2026, 'Ventas Adicionales LAB', 'Servicio LAB', '2026-08-01', 'FIRMA LAB', 'COT-AD-LAB-0001', 'OV-AD-LAB-0001', 'FAC-AD-LAB-0001', 'EN PROCESO', 'PARCIAL', 'L51', 'PPNS-LAB-0001', 'LAB - AEROPUERTO LOS CABOS', '99006-LAB-ESC-DGB', 'Venta adicional sintética.', 'Fuente LAB', 5250, 0.16, 840.0, 6090.0, 2600, 'OC-LAB-0001', 1050, 0.35, 3100, 2672.4137931034484, 2990.0, NULL, 'S37-01', 'MXN', 'SIMULADO', 1, 910042, 910006),
  (974002, 973002, 2026, 'Ventas Adicionales LAB', 'Servicio LAB', '2026-08-02', 'FIRMA LAB', 'COT-AD-LAB-0002', 'OV-AD-LAB-0002', 'FAC-AD-LAB-0002', 'TERMINADO', 'PAGADO', 'L51', 'PPNS-LAB-0002', 'LAB - AEROPUERTO PUERTO VALLARTA', '99007-LAB-RAM-DGB', 'Venta adicional sintética.', 'Fuente LAB', 5500, 0.16, 880.0, 6380.0, 2700, 'OC-LAB-0002', 1100, 0.35, 3200, 2758.6206896551726, 3180.0, NULL, 'S37-02', 'MXN', 'SIMULADO', 1, 910042, 910006),
  (974003, 973003, 2026, 'Ventas Adicionales LAB', 'Servicio LAB', '2026-08-03', 'FIRMA LAB', 'COT-AD-LAB-0003', 'OV-AD-LAB-0003', 'FAC-AD-LAB-0003', 'PENDIENTE', 'PENDIENTE', 'L51', 'PPNS-LAB-0003', 'LAB - WALMART SC SAN JOSE DEL CABO', '99008-LAB-ELE-DGB', 'Venta adicional sintética.', 'Fuente LAB', 5750, 0.16, 920.0, 6669.999999999999, 2800, 'OC-LAB-0003', 1150, 0.35, 3300, 2844.8275862068967, 3369.999999999999, '2026-09-03', 'S37-03', 'MXN', 'SIMULADO', 1, 910042, 910006),
  (974004, 973004, 2026, 'Ventas Adicionales LAB', 'Servicio LAB', '2026-08-04', 'FIRMA LAB', 'COT-AD-LAB-0004', 'OV-AD-LAB-0004', 'FAC-AD-LAB-0004', 'EN PROCESO', 'PARCIAL', 'L51', 'PPNS-LAB-0004', 'LAB - AKOYA SKY LIVING', '99009-LAB-MON-DGB', 'Venta adicional sintética.', 'Fuente LAB', 6000, 0.16, 960.0, 6959.999999999999, 2900, 'OC-LAB-0004', 1200, 0.35, 3400, 2931.034482758621, 3559.999999999999, NULL, 'S37-04', 'MXN', 'SIMULADO', 1, 910042, 910006),
  (974005, 973005, 2026, 'Ventas Adicionales LAB', 'Servicio LAB', '2026-08-05', 'FIRMA LAB', 'COT-AD-LAB-0005', 'OV-AD-LAB-0005', 'FAC-AD-LAB-0005', 'TERMINADO', 'PAGADO', 'L51', 'PPNS-LAB-0005', 'LAB - TORRE 22-22', '99010-LAB-ELE-DGB', 'Venta adicional sintética.', 'Fuente LAB', 6250, 0.16, 1000.0, 7249.999999999999, 3000, 'OC-LAB-0005', 1250, 0.35, 3500, 3017.241379310345, 3749.999999999999, NULL, 'S37-05', 'MXN', 'SIMULADO', 1, 910042, 910006),
  (974006, 973006, 2026, 'Ventas Adicionales LAB', 'Servicio LAB', '2026-08-06', 'FIRMA LAB', 'COT-AD-LAB-0006', 'OV-AD-LAB-0006', 'FAC-AD-LAB-0006', 'PENDIENTE', 'PENDIENTE', 'L51', 'PPNS-LAB-0006', 'LAB - PABELLON METEPEC', '99011-LAB-ESC-DGB', 'Venta adicional sintética.', 'Fuente LAB', 6500, 0.16, 1040.0, 7539.999999999999, 3100, 'OC-LAB-0006', 1300, 0.35, 3600, 3103.4482758620693, 3939.999999999999, '2026-09-06', 'S37-06', 'MXN', 'SIMULADO', 1, 910042, 910006),
  (974007, 973007, 2026, 'Ventas Adicionales LAB', 'Servicio LAB', '2026-08-07', 'FIRMA LAB', 'COT-AD-LAB-0007', 'OV-AD-LAB-0007', 'FAC-AD-LAB-0007', 'EN PROCESO', 'PARCIAL', 'L51', 'PPNS-LAB-0007', 'LAB - HOSPITAL SAN ANGEL INN PATRIOTISMO', '99012-LAB-RAM-DGB', 'Venta adicional sintética.', 'Fuente LAB', 6750, 0.16, 1080.0, 7829.999999999999, 3200, 'OC-LAB-0007', 1350, 0.35, 3700, 3189.6551724137935, 4129.999999999999, NULL, 'S37-07', 'MXN', 'SIMULADO', 1, 910042, 910006),
  (974008, 973008, 2026, 'Ventas Adicionales LAB', 'Servicio LAB', '2026-08-08', 'FIRMA LAB', 'COT-AD-LAB-0008', 'OV-AD-LAB-0008', 'FAC-AD-LAB-0008', 'TERMINADO', 'PAGADO', 'L51', 'PPNS-LAB-0008', 'LAB - ALBOR UNIVERSIDAD', '99013-LAB-ELE-DGB', 'Venta adicional sintética.', 'Fuente LAB', 7000, 0.16, 1120.0, 8119.999999999999, 3300, 'OC-LAB-0008', 1400, 0.35, 3800, 3275.8620689655177, 4319.999999999999, NULL, 'S37-08', 'MXN', 'SIMULADO', 1, 910042, 910006),
  (974009, 973009, 2026, 'Ventas Adicionales LAB', 'Servicio LAB', '2026-08-09', 'FIRMA LAB', 'COT-AD-LAB-0009', 'OV-AD-LAB-0009', 'FAC-AD-LAB-0009', 'PENDIENTE', 'PENDIENTE', 'L51', 'PPNS-LAB-0009', 'LAB - PLAZA CITADEL', '99014-LAB-MON-DGB', 'Venta adicional sintética.', 'Fuente LAB', 7250, 0.16, 1160.0, 8410.0, 3400, 'OC-LAB-0009', 1450, 0.35, 3900, 3362.0689655172414, 4510.0, '2026-09-09', 'S37-09', 'MXN', 'SIMULADO', 1, 910042, 910006),
  (974010, 973010, 2026, 'Ventas Adicionales LAB', 'Servicio LAB', '2026-08-10', 'FIRMA LAB', 'COT-AD-LAB-0010', 'OV-AD-LAB-0010', 'FAC-AD-LAB-0010', 'EN PROCESO', 'PARCIAL', 'L51', 'PPNS-LAB-0010', 'LAB - CENTRO COMERCIAL PUNTA LAGUNA', '99015-LAB-ELE-DGB', 'Venta adicional sintética.', 'Fuente LAB', 7500, 0.16, 1200.0, 8700.0, 3500, 'OC-LAB-0010', 1500, 0.35, 4000, 3448.2758620689656, 4700.0, NULL, 'S37-10', 'MXN', 'SIMULADO', 1, 910042, 910006);

-- cobranza_comentarios_cor: 10 registros
INSERT INTO `cobranza_comentarios_cor` (`id_comentario_cor`, `id_indice_cor`, `id_fuente_cor`, `id_aditiva_cor`, `id_usuario`, `comentario`, `editado`, `activo`) VALUES
  (974501, 973001, 973501, 974001, 910042, 'Comentario sintético de cobranza Corellian.', 0, 1),
  (974502, 973002, 973503, 974002, 910042, 'Comentario sintético de cobranza Corellian.', 0, 1),
  (974503, 973003, 973505, 974003, 910042, 'Comentario sintético de cobranza Corellian.', 0, 1),
  (974504, 973004, 973507, 974004, 910042, 'Comentario sintético de cobranza Corellian.', 0, 1),
  (974505, 973005, 973509, 974005, 910042, 'Comentario sintético de cobranza Corellian.', 0, 1),
  (974506, 973006, 973511, 974006, 910042, 'Comentario sintético de cobranza Corellian.', 0, 1),
  (974507, 973007, 973513, 974007, 910042, 'Comentario sintético de cobranza Corellian.', 0, 1),
  (974508, 973008, 973515, 974008, 910042, 'Comentario sintético de cobranza Corellian.', 0, 1),
  (974509, 973009, 973517, 974009, 910042, 'Comentario sintético de cobranza Corellian.', 0, 1),
  (974510, 973010, 973519, 974010, 910042, 'Comentario sintético de cobranza Corellian.', 0, 1);

-- cobranza_archivos_cor: 5 registros
INSERT INTO `cobranza_archivos_cor` (`id_archivo_cor`, `id_indice_cor`, `id_fuente_cor`, `id_aditiva_cor`, `id_comentario_cor`, `subido_por`, `tipo_archivo`, `nombre_original`, `nombre_servidor`, `ruta_archivo`, `extension_archivo`, `mime_type`, `peso_archivo`, `storage_provider`, `storage_container`, `storage_blob_name`, `activo`) VALUES
  (974601, 973001, 973501, 974001, 974501, 910042, 'ADJUNTO', 'cobranza_lab_01.pdf', 'cobranza_lab_01.pdf', 'https://example.invalid/lab/cobranza/01.pdf', 'pdf', 'application/pdf', 15100, 'LAB_LOCAL', 'lab', 'cobranza/01.pdf', 1),
  (974602, 973002, 973503, 974002, 974502, 910042, 'ADJUNTO', 'cobranza_lab_02.pdf', 'cobranza_lab_02.pdf', 'https://example.invalid/lab/cobranza/02.pdf', 'pdf', 'application/pdf', 15200, 'LAB_LOCAL', 'lab', 'cobranza/02.pdf', 1),
  (974603, 973003, 973505, 974003, 974503, 910042, 'ADJUNTO', 'cobranza_lab_03.pdf', 'cobranza_lab_03.pdf', 'https://example.invalid/lab/cobranza/03.pdf', 'pdf', 'application/pdf', 15300, 'LAB_LOCAL', 'lab', 'cobranza/03.pdf', 1),
  (974604, 973004, 973507, 974004, 974504, 910042, 'ADJUNTO', 'cobranza_lab_04.pdf', 'cobranza_lab_04.pdf', 'https://example.invalid/lab/cobranza/04.pdf', 'pdf', 'application/pdf', 15400, 'LAB_LOCAL', 'lab', 'cobranza/04.pdf', 1),
  (974605, 973005, 973509, 974005, 974505, 910042, 'ADJUNTO', 'cobranza_lab_05.pdf', 'cobranza_lab_05.pdf', 'https://example.invalid/lab/cobranza/05.pdf', 'pdf', 'application/pdf', 15500, 'LAB_LOCAL', 'lab', 'cobranza/05.pdf', 1);

-- almacen_fuente_excel: 20 registros
INSERT INTO `almacen_fuente_excel` (`id`, `lote_importacion`, `archivo_origen`, `hoja_origen`, `fila_origen`, `fecha_corte`, `fecha_importacion`, `activo`, `hash_archivo`, `hash_fila`, `encabezados_json`, `mapeo_json`, `tipo_registro`, `codigo`, `articulo`, `categoria`, `empresa`, `almacen`, `tipo_almacen`, `fisico`, `precio_unitario`, `valor`, `abc`, `criticidad`, `demanda`, `stock_seguridad`, `punto_reorden`, `minimo`, `maximo`, `fecha_evento`, `responsable`, `sitio`, `cantidad`, `costo_unitario`, `folio`, `departamento`, `unidad`, `proyecto`, `equipo`, `entregado_por`, `salida`, `ubicacion`, `con_stock`, `raw_json`, `creado_por`) VALUES
  (975001, '11111111-2222-4333-8444-555555555555', 'INVENTARIO_LAB.xlsx', 'INVENTARIO LAB', 2, '2026-09-01', '2026-09-01 08:00:00.000', 1, 'f7824c07c8856c4dbb0232b1f3bf2aa9237f666b6a19791fd22533f2b3c04a20', 'f2459dde350c9fa66fa4028d82bbe60587394934e7f212c7d914e83fe476633b', '["codigo", "articulo", "fisico"]', '{"codigo": "A", "articulo": "B", "fisico": "C"}', 'INVENTARIO', 'ART-LAB-0001', 'Refacción sintética LAB 01', 'MECÁNICO', 'Corellian LAB', 'ALMACEN LAB 1', 'OPERATIVO', 6, 112.5, 675.0, 'B', 'MEDIA', 2, 4, 6, 3, 16, '2026-09-01', 'Responsable Almacén LAB 1', 'Sitio almacén LAB 1', 6, 112.5, 'ALM-LAB-0001', 'Almacén LAB', 'PZA', 'LAB - PUNTO VALLE', '99001-LAB-ESC-DGB', 'Operador LAB', 'NO', 'Rack LAB 2', 'SI', '{"lab": true, "codigo": "ART-LAB-0001", "fila": 2}', 910041),
  (975002, '11111111-2222-4333-8444-555555555555', 'INVENTARIO_LAB.xlsx', 'INVENTARIO LAB', 3, '2026-09-01', '2026-09-01 08:00:00.000', 1, 'f7824c07c8856c4dbb0232b1f3bf2aa9237f666b6a19791fd22533f2b3c04a20', '9900d2366a28845991b794e6358358a92c478dac2fbd6bde12afc4f555658e46', '["codigo", "articulo", "fisico"]', '{"codigo": "A", "articulo": "B", "fisico": "C"}', 'INVENTARIO', 'ART-LAB-0002', 'Refacción sintética LAB 02', 'SEGURIDAD', 'Corellian LAB', 'ALMACEN LAB 2', 'OPERATIVO', 7, 125.0, 875.0, 'C', 'ALTA', 3, 5, 7, 4, 17, '2026-09-01', 'Responsable Almacén LAB 2', 'Sitio almacén LAB 2', 7, 125.0, 'ALM-LAB-0002', 'Almacén LAB', 'PZA', 'LAB - MISTIQ TEMPLE II', '99002-LAB-RAM-DGB', 'Operador LAB', 'NO', 'Rack LAB 3', 'SI', '{"lab": true, "codigo": "ART-LAB-0002", "fila": 3}', 910041),
  (975003, '11111111-2222-4333-8444-555555555555', 'INVENTARIO_LAB.xlsx', 'INVENTARIO LAB', 4, '2026-09-01', '2026-09-01 08:00:00.000', 1, 'f7824c07c8856c4dbb0232b1f3bf2aa9237f666b6a19791fd22533f2b3c04a20', '4ff37facc57d92d4329803ae4a6531012e941243c9f119af323da2e4240727bf', '["codigo", "articulo", "fisico"]', '{"codigo": "A", "articulo": "B", "fisico": "C"}', 'INVENTARIO', 'ART-LAB-0003', 'Refacción sintética LAB 03', 'CONSUMIBLE', 'Corellian LAB', 'ALMACEN LAB 3', 'OPERATIVO', 8, 137.5, 1100.0, 'A', 'BAJA', 4, 6, 8, 2, 18, '2026-09-01', 'Responsable Almacén LAB 3', 'Sitio almacén LAB 3', 8, 137.5, 'ALM-LAB-0003', 'Almacén LAB', 'PZA', 'LAB - DURANGO 262', '99003-LAB-ELE-DGB', 'Operador LAB', 'NO', 'Rack LAB 4', 'SI', '{"lab": true, "codigo": "ART-LAB-0003", "fila": 4}', 910041),
  (975004, '11111111-2222-4333-8444-555555555555', 'INVENTARIO_LAB.xlsx', 'INVENTARIO LAB', 5, '2026-09-01', '2026-09-01 08:00:00.000', 1, 'f7824c07c8856c4dbb0232b1f3bf2aa9237f666b6a19791fd22533f2b3c04a20', '88a6ee261d99555924a5a973761a12a31b4bd621ac52f5f1d343ae35a693cb3d', '["codigo", "articulo", "fisico"]', '{"codigo": "A", "articulo": "B", "fisico": "C"}', 'INVENTARIO', 'ART-LAB-0004', 'Refacción sintética LAB 04', 'ELÉCTRICO', 'Corellian LAB', 'ALMACEN LAB 1', 'OPERATIVO', 9, 150.0, 1350.0, 'B', 'MEDIA', 5, 3, 9, 3, 19, '2026-09-01', 'Responsable Almacén LAB 1', 'Sitio almacén LAB 1', 9, 150.0, 'ALM-LAB-0004', 'Almacén LAB', 'PZA', 'LAB - AEROPUERTO TIJUANA', '99004-LAB-MON-DGB', 'Operador LAB', 'NO', 'Rack LAB 5', 'SI', '{"lab": true, "codigo": "ART-LAB-0004", "fila": 5}', 910041),
  (975005, '11111111-2222-4333-8444-555555555555', 'INVENTARIO_LAB.xlsx', 'INVENTARIO LAB', 6, '2026-09-01', '2026-09-01 08:00:00.000', 1, 'f7824c07c8856c4dbb0232b1f3bf2aa9237f666b6a19791fd22533f2b3c04a20', '8f926b067ca60c58788de57f0a2d65bed55f544547beda1919c9ba64dc8f664c', '["codigo", "articulo", "fisico"]', '{"codigo": "A", "articulo": "B", "fisico": "C"}', 'INVENTARIO', 'ART-LAB-0005', 'Refacción sintética LAB 05', 'MECÁNICO', 'Corellian LAB', 'ALMACEN LAB 2', 'OPERATIVO', 10, 162.5, 1625.0, 'C', 'ALTA', 6, 4, 10, 4, 20, '2026-09-01', 'Responsable Almacén LAB 2', 'Sitio almacén LAB 2', 10, 162.5, 'ALM-LAB-0005', 'Almacén LAB', 'PZA', 'LAB - AEROPUERTO GUADALAJARA', '99005-LAB-ELE-DGB', 'Operador LAB', 'NO', 'Rack LAB 1', 'SI', '{"lab": true, "codigo": "ART-LAB-0005", "fila": 6}', 910041),
  (975006, '11111111-2222-4333-8444-555555555555', 'INVENTARIO_LAB.xlsx', 'INVENTARIO LAB', 7, '2026-09-01', '2026-09-01 08:00:00.000', 1, 'f7824c07c8856c4dbb0232b1f3bf2aa9237f666b6a19791fd22533f2b3c04a20', 'f028871d09b31877c13fb4d6229c21c9f0feb829b22688bbdeaa8502ff892413', '["codigo", "articulo", "fisico"]', '{"codigo": "A", "articulo": "B", "fisico": "C"}', 'INVENTARIO', 'ART-LAB-0006', 'Refacción sintética LAB 06', 'SEGURIDAD', 'Corellian LAB', 'ALMACEN LAB 3', 'OPERATIVO', 11, 175.0, 1925.0, 'A', 'BAJA', 7, 5, 5, 2, 21, '2026-09-01', 'Responsable Almacén LAB 3', 'Sitio almacén LAB 3', 11, 175.0, 'ALM-LAB-0006', 'Almacén LAB', 'PZA', 'LAB - AEROPUERTO LOS CABOS', '99006-LAB-ESC-DGB', 'Operador LAB', 'NO', 'Rack LAB 2', 'SI', '{"lab": true, "codigo": "ART-LAB-0006", "fila": 7}', 910041),
  (975007, '11111111-2222-4333-8444-555555555555', 'INVENTARIO_LAB.xlsx', 'INVENTARIO LAB', 8, '2026-09-01', '2026-09-01 08:00:00.000', 1, 'f7824c07c8856c4dbb0232b1f3bf2aa9237f666b6a19791fd22533f2b3c04a20', '411f5c2838a5c9023a6c22aff90bee04ab5ff14d773569bea3d6339dbda4fdb8', '["codigo", "articulo", "fisico"]', '{"codigo": "A", "articulo": "B", "fisico": "C"}', 'INVENTARIO', 'ART-LAB-0007', 'Refacción sintética LAB 07', 'CONSUMIBLE', 'Corellian LAB', 'ALMACEN LAB 1', 'OPERATIVO', 12, 187.5, 2250.0, 'B', 'MEDIA', 1, 6, 6, 3, 22, '2026-09-01', 'Responsable Almacén LAB 1', 'Sitio almacén LAB 1', 12, 187.5, 'ALM-LAB-0007', 'Almacén LAB', 'PZA', 'LAB - AEROPUERTO PUERTO VALLARTA', '99007-LAB-RAM-DGB', 'Operador LAB', 'NO', 'Rack LAB 3', 'SI', '{"lab": true, "codigo": "ART-LAB-0007", "fila": 8}', 910041),
  (975008, '11111111-2222-4333-8444-555555555555', 'INVENTARIO_LAB.xlsx', 'INVENTARIO LAB', 9, '2026-09-01', '2026-09-01 08:00:00.000', 1, 'f7824c07c8856c4dbb0232b1f3bf2aa9237f666b6a19791fd22533f2b3c04a20', 'b4d778d91be6038b335a1ebc30944a4c8843cfed583476f74742ae76dd1a31ab', '["codigo", "articulo", "fisico"]', '{"codigo": "A", "articulo": "B", "fisico": "C"}', 'INVENTARIO', 'ART-LAB-0008', 'Refacción sintética LAB 08', 'ELÉCTRICO', 'Corellian LAB', 'ALMACEN LAB 2', 'OPERATIVO', 13, 200.0, 2600.0, 'C', 'ALTA', 2, 3, 7, 4, 23, '2026-09-01', 'Responsable Almacén LAB 2', 'Sitio almacén LAB 2', 13, 200.0, 'ALM-LAB-0008', 'Almacén LAB', 'PZA', 'LAB - WALMART SC SAN JOSE DEL CABO', '99008-LAB-ELE-DGB', 'Operador LAB', 'NO', 'Rack LAB 4', 'SI', '{"lab": true, "codigo": "ART-LAB-0008", "fila": 9}', 910041),
  (975009, '11111111-2222-4333-8444-555555555555', 'INVENTARIO_LAB.xlsx', 'INVENTARIO LAB', 10, '2026-09-01', '2026-09-01 08:00:00.000', 1, 'f7824c07c8856c4dbb0232b1f3bf2aa9237f666b6a19791fd22533f2b3c04a20', 'd5f4af39048564bc6772ea822a5130e4e9774baef138ff442993b14b5f71f7e8', '["codigo", "articulo", "fisico"]', '{"codigo": "A", "articulo": "B", "fisico": "C"}', 'INVENTARIO', 'ART-LAB-0009', 'Refacción sintética LAB 09', 'MECÁNICO', 'Corellian LAB', 'ALMACEN LAB 3', 'OPERATIVO', 14, 212.5, 2975.0, 'A', 'BAJA', 3, 4, 8, 2, 24, '2026-09-01', 'Responsable Almacén LAB 3', 'Sitio almacén LAB 3', 14, 212.5, 'ALM-LAB-0009', 'Almacén LAB', 'PZA', 'LAB - AKOYA SKY LIVING', '99009-LAB-MON-DGB', 'Operador LAB', 'NO', 'Rack LAB 5', 'SI', '{"lab": true, "codigo": "ART-LAB-0009", "fila": 10}', 910041),
  (975010, '11111111-2222-4333-8444-555555555555', 'INVENTARIO_LAB.xlsx', 'INVENTARIO LAB', 11, '2026-09-01', '2026-09-01 08:00:00.000', 1, 'f7824c07c8856c4dbb0232b1f3bf2aa9237f666b6a19791fd22533f2b3c04a20', '3916bc7bd5452ebf446060f066623a017a2985eba2efc9fd9986d83b3448b628', '["codigo", "articulo", "fisico"]', '{"codigo": "A", "articulo": "B", "fisico": "C"}', 'INVENTARIO', 'ART-LAB-0010', 'Refacción sintética LAB 10', 'SEGURIDAD', 'Corellian LAB', 'ALMACEN LAB 1', 'OPERATIVO', 15, 225.0, 3375.0, 'B', 'MEDIA', 4, 5, 9, 3, 15, '2026-09-01', 'Responsable Almacén LAB 1', 'Sitio almacén LAB 1', 15, 225.0, 'ALM-LAB-0010', 'Almacén LAB', 'PZA', 'LAB - TORRE 22-22', '99010-LAB-ELE-DGB', 'Operador LAB', 'NO', 'Rack LAB 1', 'SI', '{"lab": true, "codigo": "ART-LAB-0010", "fila": 11}', 910041),
  (975011, '11111111-2222-4333-8444-555555555555', 'INVENTARIO_LAB.xlsx', 'INVENTARIO LAB', 12, '2026-09-01', '2026-09-01 08:00:00.000', 1, 'f7824c07c8856c4dbb0232b1f3bf2aa9237f666b6a19791fd22533f2b3c04a20', '577ebd5e627550f200da5cac3c1d2f140113ced86e26aca104d1036e727a924e', '["codigo", "articulo", "fisico"]', '{"codigo": "A", "articulo": "B", "fisico": "C"}', 'INVENTARIO', 'ART-LAB-0011', 'Refacción sintética LAB 11', 'CONSUMIBLE', 'Corellian LAB', 'ALMACEN LAB 2', 'OPERATIVO', 16, 237.5, 3800.0, 'C', 'ALTA', 5, 6, 10, 4, 16, '2026-09-01', 'Responsable Almacén LAB 2', 'Sitio almacén LAB 2', 16, 237.5, 'ALM-LAB-0011', 'Almacén LAB', 'PZA', 'LAB - PABELLON METEPEC', '99011-LAB-ESC-DGB', 'Operador LAB', 'NO', 'Rack LAB 2', 'SI', '{"lab": true, "codigo": "ART-LAB-0011", "fila": 12}', 910041),
  (975012, '11111111-2222-4333-8444-555555555555', 'INVENTARIO_LAB.xlsx', 'INVENTARIO LAB', 13, '2026-09-01', '2026-09-01 08:00:00.000', 1, 'f7824c07c8856c4dbb0232b1f3bf2aa9237f666b6a19791fd22533f2b3c04a20', '2abc08ac7275c20c5eced55c5b095effc68191b378c6bad3feb6915954ec9a3b', '["codigo", "articulo", "fisico"]', '{"codigo": "A", "articulo": "B", "fisico": "C"}', 'INVENTARIO', 'ART-LAB-0012', 'Refacción sintética LAB 12', 'ELÉCTRICO', 'Corellian LAB', 'ALMACEN LAB 3', 'OPERATIVO', 17, 250.0, 4250.0, 'A', 'BAJA', 6, 3, 5, 2, 17, '2026-09-01', 'Responsable Almacén LAB 3', 'Sitio almacén LAB 3', 17, 250.0, 'ALM-LAB-0012', 'Almacén LAB', 'PZA', 'LAB - HOSPITAL SAN ANGEL INN PATRIOTISMO', '99012-LAB-RAM-DGB', 'Operador LAB', 'NO', 'Rack LAB 3', 'SI', '{"lab": true, "codigo": "ART-LAB-0012", "fila": 13}', 910041),
  (975013, '11111111-2222-4333-8444-555555555555', 'INVENTARIO_LAB.xlsx', 'INVENTARIO LAB', 14, '2026-09-01', '2026-09-01 08:00:00.000', 1, 'f7824c07c8856c4dbb0232b1f3bf2aa9237f666b6a19791fd22533f2b3c04a20', '3cfb4a36b169ef7e2fb1c2f67cec37cdd692350c6da67972dc90ca02e9f5ed34', '["codigo", "articulo", "fisico"]', '{"codigo": "A", "articulo": "B", "fisico": "C"}', 'INVENTARIO', 'ART-LAB-0013', 'Refacción sintética LAB 13', 'MECÁNICO', 'Corellian LAB', 'ALMACEN LAB 1', 'OPERATIVO', 18, 262.5, 4725.0, 'B', 'MEDIA', 7, 4, 6, 3, 18, '2026-09-01', 'Responsable Almacén LAB 1', 'Sitio almacén LAB 1', 18, 262.5, 'ALM-LAB-0013', 'Almacén LAB', 'PZA', 'LAB - ALBOR UNIVERSIDAD', '99013-LAB-ELE-DGB', 'Operador LAB', 'NO', 'Rack LAB 4', 'SI', '{"lab": true, "codigo": "ART-LAB-0013", "fila": 14}', 910041),
  (975014, '11111111-2222-4333-8444-555555555555', 'INVENTARIO_LAB.xlsx', 'INVENTARIO LAB', 15, '2026-09-01', '2026-09-01 08:00:00.000', 1, 'f7824c07c8856c4dbb0232b1f3bf2aa9237f666b6a19791fd22533f2b3c04a20', '4d61a26133d10b967026f87e4d393f1aca642022235e28643f8e23e9501c1814', '["codigo", "articulo", "fisico"]', '{"codigo": "A", "articulo": "B", "fisico": "C"}', 'INVENTARIO', 'ART-LAB-0014', 'Refacción sintética LAB 14', 'SEGURIDAD', 'Corellian LAB', 'ALMACEN LAB 2', 'OPERATIVO', 19, 275.0, 5225.0, 'C', 'ALTA', 1, 5, 7, 4, 19, '2026-09-01', 'Responsable Almacén LAB 2', 'Sitio almacén LAB 2', 19, 275.0, 'ALM-LAB-0014', 'Almacén LAB', 'PZA', 'LAB - PLAZA CITADEL', '99014-LAB-MON-DGB', 'Operador LAB', 'NO', 'Rack LAB 5', 'SI', '{"lab": true, "codigo": "ART-LAB-0014", "fila": 15}', 910041),
  (975015, '11111111-2222-4333-8444-555555555555', 'INVENTARIO_LAB.xlsx', 'INVENTARIO LAB', 16, '2026-09-01', '2026-09-01 08:00:00.000', 1, 'f7824c07c8856c4dbb0232b1f3bf2aa9237f666b6a19791fd22533f2b3c04a20', '715d0c332cd0023ddaae660f4fa196f683642c51b98b482c78d6cdabc171a633', '["codigo", "articulo", "fisico"]', '{"codigo": "A", "articulo": "B", "fisico": "C"}', 'INVENTARIO', 'ART-LAB-0015', 'Refacción sintética LAB 15', 'CONSUMIBLE', 'Corellian LAB', 'ALMACEN LAB 3', 'OPERATIVO', 20, 287.5, 5750.0, 'A', 'BAJA', 2, 6, 8, 2, 20, '2026-09-01', 'Responsable Almacén LAB 3', 'Sitio almacén LAB 3', 20, 287.5, 'ALM-LAB-0015', 'Almacén LAB', 'PZA', 'LAB - CENTRO COMERCIAL PUNTA LAGUNA', '99015-LAB-ELE-DGB', 'Operador LAB', 'NO', 'Rack LAB 1', 'SI', '{"lab": true, "codigo": "ART-LAB-0015", "fila": 16}', 910041),
  (975016, '11111111-2222-4333-8444-555555555555', 'INVENTARIO_LAB.xlsx', 'INVENTARIO LAB', 17, '2026-09-01', '2026-09-01 08:00:00.000', 1, 'f7824c07c8856c4dbb0232b1f3bf2aa9237f666b6a19791fd22533f2b3c04a20', '7dfe428d8db4cbd0967dfc46b929d439a96e371e610f094e1caa2c9f542c8d4e', '["codigo", "articulo", "fisico"]', '{"codigo": "A", "articulo": "B", "fisico": "C"}', 'INVENTARIO', 'ART-LAB-0016', 'Refacción sintética LAB 16', 'ELÉCTRICO', 'Corellian LAB', 'ALMACEN LAB 1', 'OPERATIVO', 21, 300.0, 6300.0, 'B', 'MEDIA', 3, 3, 9, 3, 21, '2026-09-01', 'Responsable Almacén LAB 1', 'Sitio almacén LAB 1', 21, 300.0, 'ALM-LAB-0016', 'Almacén LAB', 'PZA', 'LAB - PUNTO VALLE', '99001-LAB-ESC-DGB', 'Operador LAB', 'NO', 'Rack LAB 2', 'SI', '{"lab": true, "codigo": "ART-LAB-0016", "fila": 17}', 910041),
  (975017, '11111111-2222-4333-8444-555555555555', 'INVENTARIO_LAB.xlsx', 'INVENTARIO LAB', 18, '2026-09-01', '2026-09-01 08:00:00.000', 1, 'f7824c07c8856c4dbb0232b1f3bf2aa9237f666b6a19791fd22533f2b3c04a20', '837818a5ea41442ce266a62cc10ac1d4e2e1937894c5c4b05128913e50965865', '["codigo", "articulo", "fisico"]', '{"codigo": "A", "articulo": "B", "fisico": "C"}', 'INVENTARIO', 'ART-LAB-0017', 'Refacción sintética LAB 17', 'MECÁNICO', 'Corellian LAB', 'ALMACEN LAB 2', 'OPERATIVO', 22, 312.5, 6875.0, 'C', 'ALTA', 4, 4, 10, 4, 22, '2026-09-01', 'Responsable Almacén LAB 2', 'Sitio almacén LAB 2', 22, 312.5, 'ALM-LAB-0017', 'Almacén LAB', 'PZA', 'LAB - MISTIQ TEMPLE II', '99002-LAB-RAM-DGB', 'Operador LAB', 'NO', 'Rack LAB 3', 'SI', '{"lab": true, "codigo": "ART-LAB-0017", "fila": 18}', 910041),
  (975018, '11111111-2222-4333-8444-555555555555', 'INVENTARIO_LAB.xlsx', 'INVENTARIO LAB', 19, '2026-09-01', '2026-09-01 08:00:00.000', 1, 'f7824c07c8856c4dbb0232b1f3bf2aa9237f666b6a19791fd22533f2b3c04a20', '6aa4ed83358d96e349d65194a4d8da5324137b381caceacd9ce3da36f61fc001', '["codigo", "articulo", "fisico"]', '{"codigo": "A", "articulo": "B", "fisico": "C"}', 'INVENTARIO', 'ART-LAB-0018', 'Refacción sintética LAB 18', 'SEGURIDAD', 'Corellian LAB', 'ALMACEN LAB 3', 'OPERATIVO', 23, 325.0, 7475.0, 'A', 'BAJA', 5, 5, 5, 2, 23, '2026-09-01', 'Responsable Almacén LAB 3', 'Sitio almacén LAB 3', 23, 325.0, 'ALM-LAB-0018', 'Almacén LAB', 'PZA', 'LAB - DURANGO 262', '99003-LAB-ELE-DGB', 'Operador LAB', 'NO', 'Rack LAB 4', 'SI', '{"lab": true, "codigo": "ART-LAB-0018", "fila": 19}', 910041),
  (975019, '11111111-2222-4333-8444-555555555555', 'INVENTARIO_LAB.xlsx', 'INVENTARIO LAB', 20, '2026-09-01', '2026-09-01 08:00:00.000', 1, 'f7824c07c8856c4dbb0232b1f3bf2aa9237f666b6a19791fd22533f2b3c04a20', 'ce01e455eb767c45e46cafca34fd2c1e54261083d1b2d81f53cf70e7d7cf3f60', '["codigo", "articulo", "fisico"]', '{"codigo": "A", "articulo": "B", "fisico": "C"}', 'INVENTARIO', 'ART-LAB-0019', 'Refacción sintética LAB 19', 'CONSUMIBLE', 'Corellian LAB', 'ALMACEN LAB 1', 'OPERATIVO', 24, 337.5, 8100.0, 'B', 'MEDIA', 6, 6, 6, 3, 24, '2026-09-01', 'Responsable Almacén LAB 1', 'Sitio almacén LAB 1', 24, 337.5, 'ALM-LAB-0019', 'Almacén LAB', 'PZA', 'LAB - AEROPUERTO TIJUANA', '99004-LAB-MON-DGB', 'Operador LAB', 'NO', 'Rack LAB 5', 'SI', '{"lab": true, "codigo": "ART-LAB-0019", "fila": 20}', 910041),
  (975020, '11111111-2222-4333-8444-555555555555', 'INVENTARIO_LAB.xlsx', 'INVENTARIO LAB', 21, '2026-09-01', '2026-09-01 08:00:00.000', 1, 'f7824c07c8856c4dbb0232b1f3bf2aa9237f666b6a19791fd22533f2b3c04a20', 'edfecd4219567873a1bec291c77b7a7ffb39ba81c4523a2dc9919654dbb7df5e', '["codigo", "articulo", "fisico"]', '{"codigo": "A", "articulo": "B", "fisico": "C"}', 'INVENTARIO', 'ART-LAB-0020', 'Refacción sintética LAB 20', 'ELÉCTRICO', 'Corellian LAB', 'ALMACEN LAB 2', 'OPERATIVO', 25, 350.0, 8750.0, 'C', 'ALTA', 7, 3, 7, 4, 15, '2026-09-01', 'Responsable Almacén LAB 2', 'Sitio almacén LAB 2', 25, 350.0, 'ALM-LAB-0020', 'Almacén LAB', 'PZA', 'LAB - AEROPUERTO GUADALAJARA', '99005-LAB-ELE-DGB', 'Operador LAB', 'NO', 'Rack LAB 1', 'SI', '{"lab": true, "codigo": "ART-LAB-0020", "fila": 21}', 910041);

-- almacen_auditoria: 6 registros
INSERT INTO `almacen_auditoria` (`id_auditoria`, `folio_auditoria`, `lote_importacion`, `fecha_corte`, `empresa`, `almacen`, `codigo_articulo`, `articulo`, `categoria`, `unidad_medida`, `existencia_esperada`, `precio_unitario`, `valor_esperado`, `existencia_fisica`, `observaciones`, `estatus`, `auditado_por`, `cerrado_por`, `fecha_inicio`, `fecha_cierre`, `created_by`, `updated_by`) VALUES
  (976001, 'AUD-LAB-0001', '11111111-2222-4333-8444-555555555555', '2026-09-01', 'Corellian LAB', 'ALMACEN LAB 1', 'ART-LAB-0001', 'Refacción sintética LAB 01', 'MECÁNICO', 'PZA', 11, 160, 1760, 9, 'Conteo físico sintético.', 'BORRADOR', 910041, NULL, '2026-09-01 09:00:00', NULL, 910041, 910006),
  (976002, 'AUD-LAB-0002', '11111111-2222-4333-8444-555555555555', '2026-09-01', 'Corellian LAB', 'ALMACEN LAB 2', 'ART-LAB-0002', 'Refacción sintética LAB 02', 'MECÁNICO', 'PZA', 12, 170, 2040, 11, 'Conteo físico sintético.', 'EN_PROCESO', 910041, NULL, '2026-09-02 09:00:00', NULL, 910041, 910006),
  (976003, 'AUD-LAB-0003', '11111111-2222-4333-8444-555555555555', '2026-09-01', 'Corellian LAB', 'ALMACEN LAB 3', 'ART-LAB-0003', 'Refacción sintética LAB 03', 'MECÁNICO', 'PZA', 13, 180, 2340, 13, 'Conteo físico sintético.', 'REVISADA', 910041, NULL, '2026-09-03 09:00:00', NULL, 910041, 910006),
  (976004, 'AUD-LAB-0004', '11111111-2222-4333-8444-555555555555', '2026-09-01', 'Corellian LAB', 'ALMACEN LAB 1', 'ART-LAB-0004', 'Refacción sintética LAB 04', 'MECÁNICO', 'PZA', 14, 190, 2660, 15, 'Conteo físico sintético.', 'CERRADA', 910041, 910045, '2026-09-04 09:00:00', '2026-09-04 12:00:00', 910041, 910006),
  (976005, 'AUD-LAB-0005', '11111111-2222-4333-8444-555555555555', '2026-09-01', 'Corellian LAB', 'ALMACEN LAB 2', 'ART-LAB-0005', 'Refacción sintética LAB 05', 'MECÁNICO', 'PZA', 15, 200, 3000, 17, 'Conteo físico sintético.', 'REVISADA', 910041, NULL, '2026-09-05 09:00:00', NULL, 910041, 910006),
  (976006, 'AUD-LAB-0006', '11111111-2222-4333-8444-555555555555', '2026-09-01', 'Corellian LAB', 'ALMACEN LAB 3', 'ART-LAB-0006', 'Refacción sintética LAB 06', 'MECÁNICO', 'PZA', 16, 210, 3360, 16, 'Conteo físico sintético.', 'CERRADA', 910041, 910045, '2026-09-06 09:00:00', '2026-09-06 12:00:00', 910041, 910006);

-- almacen_stock_reabasto_excepciones: 2 registros
INSERT INTO `almacen_stock_reabasto_excepciones` (`id_excepcion`, `clave_articulo`, `empresa`, `codigo`, `articulo`, `no_requiere_reabasto`, `motivo`, `lote_importacion`, `fecha_corte`, `alerta_tecnica_al_cambio`, `fisico_al_cambio`, `stock_seguridad_al_cambio`, `punto_reorden_al_cambio`, `creado_por`) VALUES
  (977003, '09df800fe119df99b001da7bbfff1122522f80d818e714b781e9dd8d79ea48a3', 'Corellian LAB', 'ART-LAB-0003', 'Refacción sintética LAB 03', 1, 'Excepción sintética para validar flujo de auditoría.', '11111111-2222-4333-8444-555555555555', '2026-09-01', 'MEDIA', 8, 3, 5, 910041),
  (977007, 'c74d933230f0c2fef4439609cbaaa0df6a9c8d32012f8ce9fdccaa30e7f6895f', 'Corellian LAB', 'ART-LAB-0007', 'Refacción sintética LAB 07', 1, 'Excepción sintética para validar flujo de auditoría.', '11111111-2222-4333-8444-555555555555', '2026-09-01', 'MEDIA', 12, 3, 5, 910041);

-- sup_ticket_categorias: 6 registros
INSERT INTO `sup_ticket_categorias` (`id_ticket_categoria`, `nombre_categoria`, `descripcion_categoria`, `icono_categoria`, `orden_visualizacion`, `activo`) VALUES
  (1, 'Acceso LAB', 'Categoría sintética de soporte.', 'LAB', 1, 1),
  (2, 'Usuarios y Permisos LAB', 'Categoría sintética de soporte.', 'LAB', 2, 1),
  (3, 'Dashboard LAB', 'Categoría sintética de soporte.', 'LAB', 3, 1),
  (4, 'Portafolio LAB', 'Categoría sintética de soporte.', 'LAB', 4, 1),
  (5, 'Tickets LAB', 'Categoría sintética de soporte.', 'LAB', 5, 1),
  (15, 'Solicitud de mejora LAB', 'Categoría sintética de soporte.', 'LAB', 15, 1);

-- sup_tickets: 8 registros
INSERT INTO `sup_tickets` (`id_ticket`, `folio`, `id_usuario`, `empresa`, `id_soporte`, `id_ticket_categoria`, `tipo_ticket`, `estado_ticket`, `prioridad_ticket`, `origen_ticket`, `modulo_ticket`, `asunto_ticket`, `descripcion_ticket`, `comentarios_internos`, `historial`, `ultima_respuesta_por`, `fecha_primer_contacto`, `fecha_ultima_respuesta`, `calificacion`, `comentario_calificacion`, `cerrado_por`, `motivo_cierre`, `activo`, `fecha_creacion`, `fecha_cierre`) VALUES
  (969001, 'SUP-LAB-0001', 910007, 'BLT LAB', 910062, 1, 'SOLICITUD', 'EN_PROCESO', 'MEDIA', 'LAB', 'Portafolio', 'Solicitud LAB 01', 'Solicitud de soporte completamente ficticia.', 'Uso exclusivo del laboratorio.', '[]', 'LAB', '2026-09-01 10:00:00', '2026-09-01 11:00:00', NULL, NULL, NULL, NULL, 1, '2026-09-01 09:00:00', NULL),
  (969002, 'SUP-LAB-0002', 910007, 'BLT LAB', 910062, 2, 'SOLICITUD', 'CERRADO', 'ALTA', 'LAB', 'Tickets', 'Solicitud LAB 02', 'Solicitud de soporte completamente ficticia.', 'Uso exclusivo del laboratorio.', '[]', 'LAB', '2026-09-02 10:00:00', '2026-09-02 11:00:00', NULL, NULL, NULL, NULL, 1, '2026-09-02 09:00:00', NULL),
  (969003, 'SUP-LAB-0003', 910007, 'BLT LAB', 910062, 3, 'SOLICITUD', 'NUEVO', 'BAJA', 'LAB', 'Ventas', 'Solicitud LAB 03', 'Solicitud de soporte completamente ficticia.', 'Uso exclusivo del laboratorio.', '[]', 'LAB', '2026-09-03 10:00:00', '2026-09-03 11:00:00', 5, 'Prueba satisfactoria LAB', 910062, 'RESUELTO LAB', 1, '2026-09-03 09:00:00', '2026-09-03 12:00:00'),
  (969004, 'SUP-LAB-0004', 910007, 'BLT LAB', 910062, 4, 'SOLICITUD', 'EN_PROCESO', 'MEDIA', 'LAB', 'Home', 'Solicitud LAB 04', 'Solicitud de soporte completamente ficticia.', 'Uso exclusivo del laboratorio.', '[]', 'LAB', '2026-09-04 10:00:00', '2026-09-04 11:00:00', NULL, NULL, NULL, NULL, 1, '2026-09-04 09:00:00', NULL),
  (969005, 'SUP-LAB-0005', 910007, 'BLT LAB', 910062, 5, 'SOLICITUD', 'CERRADO', 'ALTA', 'LAB', 'Portafolio', 'Solicitud LAB 05', 'Solicitud de soporte completamente ficticia.', 'Uso exclusivo del laboratorio.', '[]', 'LAB', '2026-09-05 10:00:00', '2026-09-05 11:00:00', NULL, NULL, NULL, NULL, 1, '2026-09-05 09:00:00', NULL),
  (969006, 'SUP-LAB-0006', 910007, 'BLT LAB', 910062, 15, 'SOLICITUD', 'NUEVO', 'BAJA', 'LAB', 'Tickets', 'Solicitud LAB 06', 'Solicitud de soporte completamente ficticia.', 'Uso exclusivo del laboratorio.', '[]', 'LAB', '2026-09-06 10:00:00', '2026-09-06 11:00:00', 5, 'Prueba satisfactoria LAB', 910062, 'RESUELTO LAB', 1, '2026-09-06 09:00:00', '2026-09-06 12:00:00'),
  (969007, 'SUP-LAB-0007', 910007, 'BLT LAB', 910062, 1, 'SOLICITUD', 'EN_PROCESO', 'MEDIA', 'LAB', 'Ventas', 'Solicitud LAB 07', 'Solicitud de soporte completamente ficticia.', 'Uso exclusivo del laboratorio.', '[]', 'LAB', '2026-09-07 10:00:00', '2026-09-07 11:00:00', NULL, NULL, NULL, NULL, 1, '2026-09-07 09:00:00', NULL),
  (969008, 'SUP-LAB-0008', 910007, 'BLT LAB', 910062, 2, 'SOLICITUD', 'CERRADO', 'ALTA', 'LAB', 'Home', 'Solicitud LAB 08', 'Solicitud de soporte completamente ficticia.', 'Uso exclusivo del laboratorio.', '[]', 'LAB', '2026-09-08 10:00:00', '2026-09-08 11:00:00', NULL, NULL, NULL, NULL, 1, '2026-09-08 09:00:00', NULL);

-- sup_avisos: 1 registros
INSERT INTO `sup_avisos` (`id_aviso`, `nombre_aviso`, `descripcion_aviso`, `roles_visibles`, `prioridad_aviso`, `fecha_inicio`, `fecha_fin`, `creado_por`, `actualizado_por`, `activo`) VALUES
  (969900, 'Laboratorio DGB', 'Todos los datos visibles son sintéticos. No existe conexión productiva.', '*', 'alta', '2026-09-01 00:00:00', NULL, 910006, 910006, 1);

-- portafolio_cortes_semanales: 1 registros
INSERT INTO `portafolio_cortes_semanales` (`id_corte`, `anio_iso`, `semana_iso`, `fecha_inicio`, `fecha_fin`, `fecha_corte`, `total_portafolio`, `total_movimientos`, `total_salidas`, `total_regresos`, `total_cambios`, `total_ingresos`, `snapshot_json`, `movimientos_json`, `estado`, `hash_contenido`, `generado_por`) VALUES
  (978001, 2026, 37, '2026-09-07', '2026-09-13', '2026-09-13 12:00:00', 15, 3, 1, 1, 1, 0, '[{"id_portafolio": 930001, "proyecto": "LAB - PUNTO VALLE", "equipo": "99001-LAB-ESC-DGB"}, {"id_portafolio": 930002, "proyecto": "LAB - MISTIQ TEMPLE II", "equipo": "99002-LAB-RAM-DGB"}, {"id_portafolio": 930003, "proyecto": "LAB - DURANGO 262", "equipo": "99003-LAB-ELE-DGB"}, {"id_portafolio": 930004, "proyecto": "LAB - AEROPUERTO TIJUANA", "equipo": "99004-LAB-MON-DGB"}, {"id_portafolio": 930005, "proyecto": "LAB - AEROPUERTO GUADALAJARA", "equipo": "99005-LAB-ELE-DGB"}, {"id_portafolio": 930006, "proyecto": "LAB - AEROPUERTO LOS CABOS", "equipo": "99006-LAB-ESC-DGB"}, {"id_portafolio": 930007, "proyecto": "LAB - AEROPUERTO PUERTO VALLARTA", "equipo": "99007-LAB-RAM-DGB"}, {"id_portafolio": 930008, "proyecto": "LAB - WALMART SC SAN JOSE DEL CABO", "equipo": "99008-LAB-ELE-DGB"}, {"id_portafolio": 930009, "proyecto": "LAB - AKOYA SKY LIVING", "equipo": "99009-LAB-MON-DGB"}, {"id_portafolio": 930010, "proyecto": "LAB - TORRE 22-22", "equipo": "99010-LAB-ELE-DGB"}, {"id_portafolio": 930011, "proyecto": "LAB - PABELLON METEPEC", "equipo": "99011-LAB-ESC-DGB"}, {"id_portafolio": 930012, "proyecto": "LAB - HOSPITAL SAN ANGEL INN PATRIOTISMO", "equipo": "99012-LAB-RAM-DGB"}, {"id_portafolio": 930013, "proyecto": "LAB - ALBOR UNIVERSIDAD", "equipo": "99013-LAB-ELE-DGB"}, {"id_portafolio": 930014, "proyecto": "LAB - PLAZA CITADEL", "equipo": "99014-LAB-MON-DGB"}, {"id_portafolio": 930015, "proyecto": "LAB - CENTRO COMERCIAL PUNTA LAGUNA", "equipo": "99015-LAB-ELE-DGB"}]', '[{"lab": true, "tipo": "CAMBIO", "equipo": "99001-LAB-ESC-DGB"}]', 'CERRADO', '6b0011bae6ebca3c4d7b4dcff0fc130083308ace3bcbc84cffbc18494c7f2533', 910006);


-- Tablas que se dejan vacias intencionalmente en LAB por ser de sesion, dispositivo o integracion externa:
-- auth_audit, auth_sessions, notificaciones_push_suscripciones, usuarios_dispositivos, usuario_google_oauth.
