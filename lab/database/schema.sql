-- [Aster | 2026-09-13 | ASTER-MG | LAB DGB SQLITE SCHEMA V002]
-- Conversion validated from the 93-table Gestor Mantto MySQL schema snapshot for SQLite WASM/sql.js.
-- LAB ONLY. Never execute against Aiven or production.
PRAGMA foreign_keys = OFF;
PRAGMA recursive_triggers = ON;

-- Table: almacen_auditoria
DROP TABLE IF EXISTS `almacen_auditoria`;
CREATE TABLE `almacen_auditoria` (
  `id_auditoria` INTEGER PRIMARY KEY AUTOINCREMENT,
  `folio_auditoria` TEXT NOT NULL,
  `lote_importacion` TEXT NOT NULL,
  `fecha_corte` TEXT DEFAULT NULL,
  `empresa` TEXT NOT NULL,
  `almacen` TEXT NOT NULL,
  `codigo_articulo` TEXT DEFAULT NULL,
  `articulo` TEXT NOT NULL,
  `categoria` TEXT DEFAULT NULL,
  `unidad_medida` TEXT DEFAULT NULL,
  `existencia_esperada` REAL NOT NULL DEFAULT '0.0000',
  `precio_unitario` REAL DEFAULT NULL,
  `valor_esperado` REAL DEFAULT NULL,
  `existencia_fisica` REAL DEFAULT NULL,
  `diferencia` REAL GENERATED ALWAYS AS ((case when (`existencia_fisica` is null) then NULL else (`existencia_fisica` - `existencia_esperada`) end)) STORED,
  `valor_diferencia` REAL GENERATED ALWAYS AS ((case when ((`existencia_fisica` is null) or (`precio_unitario` is null)) then NULL else ((`existencia_fisica` - `existencia_esperada`) * `precio_unitario`) end)) STORED,
  `observaciones` TEXT,
  `estatus` TEXT NOT NULL DEFAULT 'BORRADOR',
  `auditado_por` INTEGER DEFAULT NULL,
  `cerrado_por` INTEGER DEFAULT NULL,
  `fecha_inicio` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_cierre` TEXT DEFAULT NULL,
  `created_by` INTEGER DEFAULT NULL,
  `updated_by` INTEGER DEFAULT NULL,
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`auditado_por`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`cerrado_por`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS `almacen_auditoria__idx_alm_aud_folio` ON `almacen_auditoria` (`folio_auditoria`);
CREATE INDEX IF NOT EXISTS `almacen_auditoria__idx_alm_aud_lote` ON `almacen_auditoria` (`lote_importacion`);
CREATE INDEX IF NOT EXISTS `almacen_auditoria__idx_alm_aud_fecha_corte` ON `almacen_auditoria` (`fecha_corte`);
CREATE INDEX IF NOT EXISTS `almacen_auditoria__idx_alm_aud_empresa_almacen` ON `almacen_auditoria` (`empresa`,`almacen`);
CREATE INDEX IF NOT EXISTS `almacen_auditoria__idx_alm_aud_codigo` ON `almacen_auditoria` (`codigo_articulo`);
CREATE INDEX IF NOT EXISTS `almacen_auditoria__idx_alm_aud_estatus` ON `almacen_auditoria` (`estatus`);
CREATE INDEX IF NOT EXISTS `almacen_auditoria__idx_alm_aud_auditor` ON `almacen_auditoria` (`auditado_por`);
CREATE INDEX IF NOT EXISTS `almacen_auditoria__fk_alm_aud_cerrado_por` ON `almacen_auditoria` (`cerrado_por`);
CREATE INDEX IF NOT EXISTS `almacen_auditoria__fk_alm_aud_created_by` ON `almacen_auditoria` (`created_by`);
CREATE INDEX IF NOT EXISTS `almacen_auditoria__fk_alm_aud_updated_by` ON `almacen_auditoria` (`updated_by`);

-- Table: almacen_fuente_excel
DROP TABLE IF EXISTS `almacen_fuente_excel`;
CREATE TABLE `almacen_fuente_excel` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `lote_importacion` TEXT NOT NULL,
  `archivo_origen` TEXT NOT NULL,
  `hoja_origen` TEXT DEFAULT NULL,
  `fila_origen` INTEGER NOT NULL,
  `fecha_corte` TEXT DEFAULT NULL,
  `fecha_importacion` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `activo` INTEGER NOT NULL DEFAULT '0',
  `hash_archivo` TEXT NOT NULL,
  `hash_fila` TEXT NOT NULL,
  `encabezados_json` TEXT DEFAULT NULL,
  `mapeo_json` TEXT DEFAULT NULL,
  `tipo_registro` TEXT NOT NULL DEFAULT 'INVENTARIO',
  `codigo` TEXT DEFAULT NULL,
  `articulo` TEXT DEFAULT NULL,
  `categoria` TEXT DEFAULT NULL,
  `empresa` TEXT DEFAULT NULL,
  `almacen` TEXT DEFAULT NULL,
  `tipo_almacen` TEXT DEFAULT NULL,
  `fisico` REAL DEFAULT NULL,
  `precio_unitario` REAL DEFAULT NULL,
  `valor` REAL DEFAULT NULL,
  `abc` TEXT DEFAULT NULL,
  `criticidad` TEXT DEFAULT NULL,
  `demanda` REAL DEFAULT NULL,
  `stock_seguridad` REAL DEFAULT NULL,
  `punto_reorden` REAL DEFAULT NULL,
  `minimo` REAL DEFAULT NULL,
  `maximo` REAL DEFAULT NULL,
  `fecha_evento` TEXT DEFAULT NULL,
  `ag` TEXT DEFAULT NULL,
  `responsable` TEXT DEFAULT NULL,
  `sitio` TEXT DEFAULT NULL,
  `cantidad` REAL DEFAULT NULL,
  `costo_unitario` REAL DEFAULT NULL,
  `folio` TEXT DEFAULT NULL,
  `departamento` TEXT DEFAULT NULL,
  `unidad` TEXT DEFAULT NULL,
  `proyecto` TEXT DEFAULT NULL,
  `equipo` TEXT DEFAULT NULL,
  `entregado_por` TEXT DEFAULT NULL,
  `salida` TEXT DEFAULT NULL,
  `ubicacion` TEXT DEFAULT NULL,
  `con_stock` TEXT DEFAULT NULL,
  `raw_json` TEXT NOT NULL,
  `creado_por` INTEGER DEFAULT NULL,
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS `almacen_fuente_excel__uq_almacen_excel_lote_tipo_hoja_fila` ON `almacen_fuente_excel` (`lote_importacion`,`tipo_registro`,`hoja_origen`,`fila_origen`);
CREATE INDEX IF NOT EXISTS `almacen_fuente_excel__idx_almacen_excel_activo` ON `almacen_fuente_excel` (`activo`,`fecha_importacion`);
CREATE INDEX IF NOT EXISTS `almacen_fuente_excel__idx_almacen_excel_empresa` ON `almacen_fuente_excel` (`activo`,`empresa`);
CREATE INDEX IF NOT EXISTS `almacen_fuente_excel__idx_almacen_excel_almacen` ON `almacen_fuente_excel` (`activo`,`almacen`);
CREATE INDEX IF NOT EXISTS `almacen_fuente_excel__idx_almacen_excel_categoria` ON `almacen_fuente_excel` (`activo`,`categoria`);
CREATE INDEX IF NOT EXISTS `almacen_fuente_excel__idx_almacen_excel_codigo` ON `almacen_fuente_excel` (`activo`,`codigo`);
CREATE INDEX IF NOT EXISTS `almacen_fuente_excel__idx_almacen_excel_articulo` ON `almacen_fuente_excel` (`activo`,`articulo`);
CREATE INDEX IF NOT EXISTS `almacen_fuente_excel__idx_almacen_excel_lote` ON `almacen_fuente_excel` (`lote_importacion`);
CREATE INDEX IF NOT EXISTS `almacen_fuente_excel__idx_almacen_excel_tipo_empresa` ON `almacen_fuente_excel` (`activo`,`tipo_registro`,`empresa`);
CREATE INDEX IF NOT EXISTS `almacen_fuente_excel__idx_almacen_excel_tipo_resp` ON `almacen_fuente_excel` (`activo`,`tipo_registro`,`responsable`);
CREATE INDEX IF NOT EXISTS `almacen_fuente_excel__idx_almacen_excel_tipo_fecha` ON `almacen_fuente_excel` (`activo`,`tipo_registro`,`fecha_evento`);

-- Table: almacen_stock_reabasto_excepciones
DROP TABLE IF EXISTS `almacen_stock_reabasto_excepciones`;
CREATE TABLE `almacen_stock_reabasto_excepciones` (
  `id_excepcion` INTEGER PRIMARY KEY AUTOINCREMENT,
  `clave_articulo` TEXT NOT NULL,
  `empresa` TEXT NOT NULL,
  `codigo` TEXT DEFAULT NULL,
  `articulo` TEXT DEFAULT NULL,
  `no_requiere_reabasto` INTEGER NOT NULL,
  `motivo` TEXT NOT NULL,
  `lote_importacion` TEXT DEFAULT NULL,
  `fecha_corte` TEXT DEFAULT NULL,
  `alerta_tecnica_al_cambio` TEXT NOT NULL,
  `fisico_al_cambio` REAL DEFAULT NULL,
  `stock_seguridad_al_cambio` REAL DEFAULT NULL,
  `punto_reorden_al_cambio` REAL DEFAULT NULL,
  `creado_por` INTEGER NOT NULL,
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_SB`)
);
CREATE INDEX IF NOT EXISTS `almacen_stock_reabasto_excepciones__idx_alm_stock_reabasto_clave` ON `almacen_stock_reabasto_excepciones` (`clave_articulo`,`id_excepcion`);
CREATE INDEX IF NOT EXISTS `almacen_stock_reabasto_excepciones__idx_alm_stock_reabasto_usuario_fecha` ON `almacen_stock_reabasto_excepciones` (`creado_por`,`created_at`);
CREATE INDEX IF NOT EXISTS `almacen_stock_reabasto_excepciones__idx_alm_stock_reabasto_lote` ON `almacen_stock_reabasto_excepciones` (`lote_importacion`);
CREATE INDEX IF NOT EXISTS `almacen_stock_reabasto_excepciones__idx_alm_stock_reabasto_estado` ON `almacen_stock_reabasto_excepciones` (`no_requiere_reabasto`,`id_excepcion`);

-- Table: auth_audit
DROP TABLE IF EXISTS `auth_audit`;
CREATE TABLE `auth_audit` (
  `id_auth_audit` INTEGER PRIMARY KEY AUTOINCREMENT,
  `usuario_id` INTEGER NOT NULL,
  `event_type` TEXT NOT NULL,
  `event_details` TEXT,
  `ip_address` TEXT DEFAULT NULL,
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id_SB`) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS `auth_audit__idx_auth_audit_usuario` ON `auth_audit` (`usuario_id`);
CREATE INDEX IF NOT EXISTS `auth_audit__idx_auth_audit_event_type` ON `auth_audit` (`event_type`);
CREATE INDEX IF NOT EXISTS `auth_audit__idx_auth_audit_created_at` ON `auth_audit` (`created_at`);

-- Table: auth_sessions
DROP TABLE IF EXISTS `auth_sessions`;
CREATE TABLE `auth_sessions` (
  `id_session` INTEGER PRIMARY KEY AUTOINCREMENT,
  `usuario_id` INTEGER NOT NULL,
  `token_hash` TEXT NOT NULL,
  `csrf_hash` TEXT NOT NULL,
  `session_version` TEXT NOT NULL,
  `session_started_at` TEXT NOT NULL,
  `last_activity_at` TEXT NOT NULL,
  `idle_expires_at` TEXT NOT NULL,
  `absolute_expires_at` TEXT NOT NULL,
  `revoked_at` TEXT DEFAULT NULL,
  `created_ip` TEXT DEFAULT NULL,
  `last_ip` TEXT DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS `auth_sessions__uq_auth_sessions_token_hash` ON `auth_sessions` (`token_hash`);
CREATE INDEX IF NOT EXISTS `auth_sessions__idx_auth_sessions_usuario` ON `auth_sessions` (`usuario_id`,`revoked_at`);
CREATE INDEX IF NOT EXISTS `auth_sessions__idx_auth_sessions_expiracion` ON `auth_sessions` (`idle_expires_at`,`absolute_expires_at`);

-- Table: catalogo_general
DROP TABLE IF EXISTS `catalogo_general`;
CREATE TABLE `catalogo_general` (
  `id_catalogo` INTEGER PRIMARY KEY AUTOINCREMENT,
  `area` TEXT NOT NULL,
  `elemento` TEXT NOT NULL,
  `articulo` TEXT NOT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `orden` INTEGER NOT NULL DEFAULT '0',
  `activo` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` INTEGER DEFAULT NULL,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` INTEGER DEFAULT NULL,
  FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS `catalogo_general__uq_catalogo_general` ON `catalogo_general` (`area`,`elemento`,`articulo`);
CREATE INDEX IF NOT EXISTS `catalogo_general__idx_catalogo_area_elemento` ON `catalogo_general` (`area`,`elemento`,`activo`,`orden`);
CREATE INDEX IF NOT EXISTS `catalogo_general__idx_catalogo_articulo` ON `catalogo_general` (`articulo`);
CREATE INDEX IF NOT EXISTS `catalogo_general__idx_catalogo_activo` ON `catalogo_general` (`activo`);
CREATE INDEX IF NOT EXISTS `catalogo_general__fk_catalogo_general_created_by` ON `catalogo_general` (`created_by`);
CREATE INDEX IF NOT EXISTS `catalogo_general__fk_catalogo_general_updated_by` ON `catalogo_general` (`updated_by`);

-- Table: cobranza_aditivas_cor
DROP TABLE IF EXISTS `cobranza_aditivas_cor`;
CREATE TABLE `cobranza_aditivas_cor` (
  `id_aditiva_cor` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_indice_cor` INTEGER DEFAULT NULL,
  `anio_cot` INTEGER DEFAULT NULL,
  `departamento` TEXT DEFAULT NULL,
  `categoria` TEXT DEFAULT NULL,
  `fecha_cot` TEXT DEFAULT NULL,
  `firma_cot` TEXT DEFAULT NULL,
  `no_cot` TEXT DEFAULT NULL,
  `ov` TEXT DEFAULT NULL,
  `factura` TEXT DEFAULT NULL,
  `estatus_trabajos` TEXT DEFAULT NULL,
  `estatus_cobranza` TEXT DEFAULT NULL,
  `sup` TEXT DEFAULT NULL,
  `pp_ns` TEXT DEFAULT NULL,
  `proyecto` TEXT DEFAULT NULL,
  `equipo` TEXT DEFAULT NULL,
  `descripcion` TEXT,
  `comentario_fuente` TEXT,
  `monto_subtotal` REAL DEFAULT NULL,
  `iva_pct` REAL DEFAULT NULL,
  `monto_iva` REAL DEFAULT NULL,
  `monto_total` REAL DEFAULT NULL,
  `gasto_subtotal` REAL DEFAULT NULL,
  `oc` TEXT DEFAULT NULL,
  `diferencia` REAL DEFAULT NULL,
  `utilidad_real_pct` REAL DEFAULT NULL,
  `monto_pagado` REAL DEFAULT NULL,
  `pagado_sin_iva` REAL DEFAULT NULL,
  `pendiente_pago` REAL DEFAULT NULL,
  `fecha_pago` TEXT DEFAULT NULL,
  `semana_pago` TEXT DEFAULT NULL,
  `moneda` TEXT DEFAULT NULL,
  `gasto_ejercido` TEXT DEFAULT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `creado_por` INTEGER DEFAULT NULL,
  `actualizado_por` INTEGER DEFAULT NULL,
  `fecha_creacion` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`actualizado_por`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`id_indice_cor`) REFERENCES `cobranza_indice_cor` (`id_indice_cor`) ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS `cobranza_aditivas_cor__idx_cac_indice` ON `cobranza_aditivas_cor` (`id_indice_cor`,`activo`);
CREATE INDEX IF NOT EXISTS `cobranza_aditivas_cor__idx_cac_pp` ON `cobranza_aditivas_cor` (`pp_ns`);
CREATE INDEX IF NOT EXISTS `cobranza_aditivas_cor__idx_cac_cot` ON `cobranza_aditivas_cor` (`no_cot`);
CREATE INDEX IF NOT EXISTS `cobranza_aditivas_cor__idx_cac_ov` ON `cobranza_aditivas_cor` (`ov`);
CREATE INDEX IF NOT EXISTS `cobranza_aditivas_cor__idx_cac_factura` ON `cobranza_aditivas_cor` (`factura`);
CREATE INDEX IF NOT EXISTS `cobranza_aditivas_cor__idx_cac_estatus` ON `cobranza_aditivas_cor` (`estatus_cobranza`);
CREATE INDEX IF NOT EXISTS `cobranza_aditivas_cor__idx_cac_anio` ON `cobranza_aditivas_cor` (`anio_cot`);
CREATE INDEX IF NOT EXISTS `cobranza_aditivas_cor__fk_cac_creado_por` ON `cobranza_aditivas_cor` (`creado_por`);
CREATE INDEX IF NOT EXISTS `cobranza_aditivas_cor__fk_cac_actualizado_por` ON `cobranza_aditivas_cor` (`actualizado_por`);

-- Table: cobranza_archivos_cor
DROP TABLE IF EXISTS `cobranza_archivos_cor`;
CREATE TABLE `cobranza_archivos_cor` (
  `id_archivo_cor` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_indice_cor` INTEGER DEFAULT NULL,
  `id_fuente_cor` INTEGER DEFAULT NULL,
  `id_aditiva_cor` INTEGER DEFAULT NULL,
  `id_comentario_cor` INTEGER DEFAULT NULL,
  `subido_por` INTEGER NOT NULL,
  `tipo_archivo` TEXT NOT NULL DEFAULT 'ADJUNTO',
  `nombre_original` TEXT NOT NULL,
  `nombre_servidor` TEXT NOT NULL,
  `ruta_archivo` TEXT NOT NULL,
  `extension_archivo` TEXT DEFAULT NULL,
  `mime_type` TEXT DEFAULT NULL,
  `peso_archivo` INTEGER DEFAULT NULL,
  `storage_provider` TEXT DEFAULT NULL,
  `storage_container` TEXT DEFAULT NULL,
  `storage_blob_name` TEXT DEFAULT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `fecha_creacion` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_aditiva_cor`) REFERENCES `cobranza_aditivas_cor` (`id_aditiva_cor`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`id_comentario_cor`) REFERENCES `cobranza_comentarios_cor` (`id_comentario_cor`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`id_fuente_cor`) REFERENCES `cobranza_fuente_cor` (`id_fuente_cor`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`id_indice_cor`) REFERENCES `cobranza_indice_cor` (`id_indice_cor`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`subido_por`) REFERENCES `usuarios` (`id_SB`) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS `cobranza_archivos_cor__idx_carc_indice` ON `cobranza_archivos_cor` (`id_indice_cor`,`activo`);
CREATE INDEX IF NOT EXISTS `cobranza_archivos_cor__idx_carc_fuente` ON `cobranza_archivos_cor` (`id_fuente_cor`,`activo`);
CREATE INDEX IF NOT EXISTS `cobranza_archivos_cor__idx_carc_aditiva` ON `cobranza_archivos_cor` (`id_aditiva_cor`,`activo`);
CREATE INDEX IF NOT EXISTS `cobranza_archivos_cor__idx_carc_comentario` ON `cobranza_archivos_cor` (`id_comentario_cor`);
CREATE INDEX IF NOT EXISTS `cobranza_archivos_cor__idx_carc_usuario` ON `cobranza_archivos_cor` (`subido_por`);
CREATE INDEX IF NOT EXISTS `cobranza_archivos_cor__idx_carc_storage` ON `cobranza_archivos_cor` (`storage_provider`,`storage_blob_name`);

-- Table: cobranza_comentarios_cor
DROP TABLE IF EXISTS `cobranza_comentarios_cor`;
CREATE TABLE `cobranza_comentarios_cor` (
  `id_comentario_cor` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_indice_cor` INTEGER DEFAULT NULL,
  `id_fuente_cor` INTEGER DEFAULT NULL,
  `id_aditiva_cor` INTEGER DEFAULT NULL,
  `id_usuario` INTEGER NOT NULL,
  `comentario` TEXT NOT NULL,
  `editado` INTEGER NOT NULL DEFAULT '0',
  `activo` INTEGER NOT NULL DEFAULT '1',
  `fecha_creacion` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_aditiva_cor`) REFERENCES `cobranza_aditivas_cor` (`id_aditiva_cor`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`id_fuente_cor`) REFERENCES `cobranza_fuente_cor` (`id_fuente_cor`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`id_indice_cor`) REFERENCES `cobranza_indice_cor` (`id_indice_cor`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_SB`) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS `cobranza_comentarios_cor__idx_ccc_indice` ON `cobranza_comentarios_cor` (`id_indice_cor`,`activo`,`fecha_creacion`);
CREATE INDEX IF NOT EXISTS `cobranza_comentarios_cor__idx_ccc_fuente` ON `cobranza_comentarios_cor` (`id_fuente_cor`,`activo`,`fecha_creacion`);
CREATE INDEX IF NOT EXISTS `cobranza_comentarios_cor__idx_ccc_aditiva` ON `cobranza_comentarios_cor` (`id_aditiva_cor`,`activo`,`fecha_creacion`);
CREATE INDEX IF NOT EXISTS `cobranza_comentarios_cor__idx_ccc_usuario` ON `cobranza_comentarios_cor` (`id_usuario`);

-- Table: cobranza_fuente_cor
DROP TABLE IF EXISTS `cobranza_fuente_cor`;
CREATE TABLE `cobranza_fuente_cor` (
  `id_fuente_cor` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_indice_cor` INTEGER DEFAULT NULL,
  `proyecto` TEXT NOT NULL,
  `id_proyecto_origen` TEXT DEFAULT NULL,
  `porcentaje` REAL DEFAULT NULL,
  `condicion` TEXT DEFAULT NULL,
  `moneda` TEXT DEFAULT NULL,
  `subtotal` REAL DEFAULT NULL,
  `iva` REAL DEFAULT NULL,
  `total` REAL DEFAULT NULL,
  `factura` TEXT DEFAULT NULL,
  `pago_total` REAL DEFAULT NULL,
  `estatus_factura` TEXT DEFAULT NULL,
  `fecha_pago` TEXT DEFAULT NULL,
  `fecha_vencimiento` TEXT DEFAULT NULL,
  `dias_vencimiento` INTEGER DEFAULT NULL,
  `estimado_pago` TEXT DEFAULT NULL,
  `estatus_vencimiento` TEXT DEFAULT NULL,
  `anio_proyecto` INTEGER DEFAULT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `creado_por` INTEGER DEFAULT NULL,
  `actualizado_por` INTEGER DEFAULT NULL,
  `fecha_creacion` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`actualizado_por`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`id_indice_cor`) REFERENCES `cobranza_indice_cor` (`id_indice_cor`) ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS `cobranza_fuente_cor__idx_cfc_indice` ON `cobranza_fuente_cor` (`id_indice_cor`,`activo`);
CREATE INDEX IF NOT EXISTS `cobranza_fuente_cor__idx_cfc_proyecto_origen` ON `cobranza_fuente_cor` (`id_proyecto_origen`);
CREATE INDEX IF NOT EXISTS `cobranza_fuente_cor__idx_cfc_proyecto` ON `cobranza_fuente_cor` (`proyecto`);
CREATE INDEX IF NOT EXISTS `cobranza_fuente_cor__idx_cfc_factura` ON `cobranza_fuente_cor` (`factura`);
CREATE INDEX IF NOT EXISTS `cobranza_fuente_cor__idx_cfc_fecha_pago` ON `cobranza_fuente_cor` (`fecha_pago`);
CREATE INDEX IF NOT EXISTS `cobranza_fuente_cor__idx_cfc_fecha_vencimiento` ON `cobranza_fuente_cor` (`fecha_vencimiento`);
CREATE INDEX IF NOT EXISTS `cobranza_fuente_cor__idx_cfc_estatus_factura` ON `cobranza_fuente_cor` (`estatus_factura`);
CREATE INDEX IF NOT EXISTS `cobranza_fuente_cor__idx_cfc_estatus_vencimiento` ON `cobranza_fuente_cor` (`estatus_vencimiento`);
CREATE INDEX IF NOT EXISTS `cobranza_fuente_cor__idx_cfc_anio` ON `cobranza_fuente_cor` (`anio_proyecto`);
CREATE INDEX IF NOT EXISTS `cobranza_fuente_cor__fk_cfc_creado_por` ON `cobranza_fuente_cor` (`creado_por`);
CREATE INDEX IF NOT EXISTS `cobranza_fuente_cor__fk_cfc_actualizado_por` ON `cobranza_fuente_cor` (`actualizado_por`);

-- Table: cobranza_indice_cor
DROP TABLE IF EXISTS `cobranza_indice_cor`;
CREATE TABLE `cobranza_indice_cor` (
  `id_indice_cor` INTEGER PRIMARY KEY AUTOINCREMENT,
  `proyecto` TEXT NOT NULL,
  `qty` INTEGER DEFAULT NULL,
  `anio` INTEGER DEFAULT NULL,
  `pp` TEXT DEFAULT NULL,
  `mrc` TEXT DEFAULT NULL,
  `adm` INTEGER DEFAULT NULL,
  `sup` INTEGER DEFAULT NULL,
  `vend` INTEGER DEFAULT NULL,
  `edo` TEXT DEFAULT NULL,
  `estatus` TEXT DEFAULT NULL,
  `cobranza_usd` REAL DEFAULT NULL,
  `cobranza_mxn` REAL DEFAULT NULL,
  `fianzas` INTEGER NOT NULL DEFAULT '0',
  `tipo_fianza` TEXT DEFAULT NULL,
  `repse_siroc` INTEGER NOT NULL DEFAULT '0',
  `activo` INTEGER NOT NULL DEFAULT '1',
  `creado_por` INTEGER DEFAULT NULL,
  `actualizado_por` INTEGER DEFAULT NULL,
  `fecha_creacion` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`actualizado_por`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`adm`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`sup`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`vend`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS `cobranza_indice_cor__idx_cic_proyecto` ON `cobranza_indice_cor` (`proyecto`);
CREATE INDEX IF NOT EXISTS `cobranza_indice_cor__idx_cic_pp` ON `cobranza_indice_cor` (`pp`);
CREATE INDEX IF NOT EXISTS `cobranza_indice_cor__idx_cic_anio` ON `cobranza_indice_cor` (`anio`);
CREATE INDEX IF NOT EXISTS `cobranza_indice_cor__idx_cic_estatus` ON `cobranza_indice_cor` (`estatus`);
CREATE INDEX IF NOT EXISTS `cobranza_indice_cor__idx_cic_activo` ON `cobranza_indice_cor` (`activo`);
CREATE INDEX IF NOT EXISTS `cobranza_indice_cor__fk_cic_creado_por` ON `cobranza_indice_cor` (`creado_por`);
CREATE INDEX IF NOT EXISTS `cobranza_indice_cor__fk_cic_actualizado_por` ON `cobranza_indice_cor` (`actualizado_por`);
CREATE INDEX IF NOT EXISTS `cobranza_indice_cor__idx_cic_adm` ON `cobranza_indice_cor` (`adm`);
CREATE INDEX IF NOT EXISTS `cobranza_indice_cor__idx_cic_sup` ON `cobranza_indice_cor` (`sup`);
CREATE INDEX IF NOT EXISTS `cobranza_indice_cor__idx_cic_vend` ON `cobranza_indice_cor` (`vend`);

-- Table: cobranza_proyectos
DROP TABLE IF EXISTS `cobranza_proyectos`;
CREATE TABLE `cobranza_proyectos` (
  `id_proyecto_cobranza` INTEGER PRIMARY KEY AUTOINCREMENT,
  `proyecto` TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS `cobranza_proyectos__uq_cobranza_proyectos_proyecto` ON `cobranza_proyectos` (`proyecto`);

-- Table: detalle_mp_2026
DROP TABLE IF EXISTS `detalle_mp_2026`;
CREATE TABLE `detalle_mp_2026` (
  `id_dmp` INTEGER PRIMARY KEY AUTOINCREMENT,
  `zona_adm` TEXT DEFAULT NULL,
  `proyecto` TEXT DEFAULT NULL,
  `id_proyecto_cobranza` INTEGER DEFAULT NULL,
  `idns` TEXT DEFAULT NULL,
  `cliente` TEXT DEFAULT NULL,
  `periodicidad` TEXT DEFAULT NULL,
  `momento_facturacion` TEXT DEFAULT NULL,
  `estado` TEXT DEFAULT NULL,
  `z_oper` TEXT DEFAULT NULL,
  `forma_pago` TEXT DEFAULT NULL,
  `iguala` REAL DEFAULT NULL,
  `condiciones_pago` TEXT DEFAULT NULL,
  `monto_anual` REAL DEFAULT NULL,
  `pendiente_corriente` REAL DEFAULT NULL,
  `pendiente_vencido` REAL DEFAULT NULL,
  `pendiente` REAL DEFAULT NULL,
  `facturas_pendientes` INTEGER DEFAULT NULL,
  `estatus_cartera` TEXT DEFAULT NULL,
  FOREIGN KEY (`id_proyecto_cobranza`) REFERENCES `cobranza_proyectos` (`id_proyecto_cobranza`) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS `detalle_mp_2026__idx_detalle_mp_2026_idns` ON `detalle_mp_2026` (`idns`);
CREATE INDEX IF NOT EXISTS `detalle_mp_2026__idx_detalle_mp_2026_proyecto` ON `detalle_mp_2026` (`proyecto`);
CREATE INDEX IF NOT EXISTS `detalle_mp_2026__idx_detalle_mp_2026_cliente` ON `detalle_mp_2026` (`cliente`);
CREATE INDEX IF NOT EXISTS `detalle_mp_2026__idx_detalle_mp_2026_z_oper` ON `detalle_mp_2026` (`z_oper`);
CREATE INDEX IF NOT EXISTS `detalle_mp_2026__idx_dmp_id_proyecto_cobranza` ON `detalle_mp_2026` (`id_proyecto_cobranza`);

-- Table: estados_visuales
DROP TABLE IF EXISTS `estados_visuales`;
CREATE TABLE `estados_visuales` (
  `id_estado_visual` INTEGER PRIMARY KEY AUTOINCREMENT,
  `codigo` TEXT NOT NULL,
  `nombre` TEXT NOT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `categoria` TEXT NOT NULL,
  `emoji` TEXT DEFAULT NULL,
  `icono` TEXT DEFAULT NULL,
  `color_texto` TEXT DEFAULT NULL,
  `color_fondo` TEXT DEFAULT NULL,
  `color_borde` TEXT DEFAULT NULL,
  `prioridad` INTEGER NOT NULL DEFAULT '100',
  `activo` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (((`emoji` is not null) or (`icono` is not null)))
);
CREATE UNIQUE INDEX IF NOT EXISTS `estados_visuales__uk_estado_codigo` ON `estados_visuales` (`codigo`);
CREATE INDEX IF NOT EXISTS `estados_visuales__idx_categoria` ON `estados_visuales` (`categoria`);
CREATE INDEX IF NOT EXISTS `estados_visuales__idx_prioridad` ON `estados_visuales` (`prioridad`);
CREATE INDEX IF NOT EXISTS `estados_visuales__idx_activo` ON `estados_visuales` (`activo`);

-- Table: gestion_credito
DROP TABLE IF EXISTS `gestion_credito`;
CREATE TABLE `gestion_credito` (
  `id_gc` INTEGER NOT NULL,
  `idns` TEXT DEFAULT NULL,
  `proyecto` TEXT DEFAULT NULL,
  `id_proyecto_cobranza` INTEGER DEFAULT NULL,
  `cliente` TEXT DEFAULT NULL,
  `subsidiaria` TEXT DEFAULT NULL,
  `region` TEXT DEFAULT NULL,
  `estado` TEXT DEFAULT NULL,
  `z_oper` TEXT DEFAULT NULL,
  `z_adm` TEXT DEFAULT NULL,
  `categoria` TEXT DEFAULT NULL,
  `prioridad` TEXT DEFAULT NULL,
  `suma_valor_unitario` REAL DEFAULT NULL,
  `recuento_no_equipos` INTEGER DEFAULT NULL,
  `mp_2025` INTEGER DEFAULT NULL,
  `monto_mp_2025` REAL DEFAULT NULL,
  `mp_2026` INTEGER DEFAULT NULL,
  `monto_mp_2026` REAL DEFAULT NULL,
  `facturas_mp` INTEGER DEFAULT NULL,
  `montp_mp` REAL DEFAULT NULL,
  `facturas_va` INTEGER DEFAULT NULL,
  `monto_va` REAL DEFAULT NULL,
  `adeudo` REAL DEFAULT NULL,
  `facts_adeudadas` INTEGER DEFAULT NULL,
  `suministro` TEXT DEFAULT NULL,
  `nivel_riesgo_credito` TEXT DEFAULT NULL,
  `credito_para_va` REAL DEFAULT NULL,
  `credito_disponible_venta` REAL DEFAULT NULL,
  `anticipo` TEXT DEFAULT NULL,
  PRIMARY KEY (`id_gc`),
  FOREIGN KEY (`id_proyecto_cobranza`) REFERENCES `cobranza_proyectos` (`id_proyecto_cobranza`) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS `gestion_credito__idx_cobranza_uni_id` ON `gestion_credito` (`idns`);
CREATE INDEX IF NOT EXISTS `gestion_credito__idx_cobranza_uni_proyecto` ON `gestion_credito` (`proyecto`);
CREATE INDEX IF NOT EXISTS `gestion_credito__idx_cobranza_uni_cliente` ON `gestion_credito` (`cliente`);
CREATE INDEX IF NOT EXISTS `gestion_credito__idx_gc_id_proyecto_cobranza` ON `gestion_credito` (`id_proyecto_cobranza`);

-- Table: ins_fl
DROP TABLE IF EXISTS `ins_fl`;
CREATE TABLE `ins_fl` (
  `id_ins_fl` INTEGER PRIMARY KEY AUTOINCREMENT,
  `proyecto` TEXT DEFAULT NULL,
  `id_proyecto` TEXT DEFAULT NULL,
  `referencia_sitio` TEXT DEFAULT NULL,
  `estatus` TEXT DEFAULT NULL,
  `fecha_visita` TEXT DEFAULT NULL,
  `comentarios_fl` TEXT,
  `avance_oc` TEXT DEFAULT NULL,
  `avance_mo` TEXT DEFAULT NULL,
  `avance_aj` TEXT DEFAULT NULL,
  `numero_pisos` TEXT DEFAULT NULL,
  `numero_desembarques` TEXT DEFAULT NULL,
  `numero_puertas` TEXT DEFAULT NULL,
  `velocidad_ms` TEXT DEFAULT NULL,
  `capacidad_kg` TEXT DEFAULT NULL,
  `entrepiso_mm` TEXT DEFAULT NULL,
  `longitud_mm` TEXT DEFAULT NULL,
  `ancho_peldano_mm` TEXT DEFAULT NULL,
  `fecha_cpvp` TEXT DEFAULT NULL,
  `estatus_produccion` TEXT DEFAULT NULL,
  `fecha_descarga` TEXT DEFAULT NULL,
  `fecha_colocacion_esc_ramp` TEXT DEFAULT NULL,
  `fecha_ccnr` TEXT DEFAULT NULL,
  `fecha_ccr` TEXT DEFAULT NULL,
  `subcontratista` TEXT DEFAULT NULL,
  `fecha_inicio_montaje` TEXT DEFAULT NULL,
  `fecha_fin_montaje_planeado` TEXT DEFAULT NULL,
  `fecha_fin_montaje_modificado` TEXT DEFAULT NULL,
  `fecha_fin_montaje_real` TEXT DEFAULT NULL,
  `dias_restantes` TEXT DEFAULT NULL,
  `fecha_cti` TEXT DEFAULT NULL,
  `fecha_revision_supervisor` TEXT DEFAULT NULL,
  `fecha_minuta_revision_ajuste` TEXT DEFAULT NULL,
  `fecha_liberacion_ajuste` TEXT DEFAULT NULL,
  `ajustador` TEXT DEFAULT NULL,
  `fecha_inicio_ajuste` TEXT DEFAULT NULL,
  `fecha_fin_ajuste_planeado` TEXT DEFAULT NULL,
  `fecha_fin_ajuste_modificado` TEXT DEFAULT NULL,
  `fecha_fin_ajuste_real` TEXT DEFAULT NULL,
  `fecha_reporte_ajuste` TEXT DEFAULT NULL,
  `fecha_protocolo_aceptacion` TEXT DEFAULT NULL,
  `estatus_inspeccion_calidad` TEXT DEFAULT NULL,
  `pendientes_calidad` TEXT,
  `fecha_entrega_cliente` TEXT DEFAULT NULL,
  `formato_caf_pg` TEXT DEFAULT NULL,
  `estatus_equipo_entrega` TEXT DEFAULT NULL,
  `anio_termino` TEXT DEFAULT NULL,
  `dias_sin_visita` TEXT DEFAULT NULL,
  `dias_sin_ccnr` TEXT DEFAULT NULL,
  `estado` TEXT DEFAULT NULL,
  `supervisor_fl` TEXT DEFAULT NULL,
  `ciudad` TEXT DEFAULT NULL,
  `fecha_posible_recepcion_cubo` TEXT DEFAULT NULL,
  `fecha_posible_inicio_ajuste` TEXT DEFAULT NULL,
  `condiciones_obra` TEXT,
  `evaluacion_subcontrato` TEXT,
  `minuta_interfon` TEXT,
  `certificado_regulador` TEXT DEFAULT NULL,
  `vendedor` TEXT DEFAULT NULL,
  `cliente` TEXT DEFAULT NULL,
  `id_sup` INTEGER DEFAULT NULL,
  `id_asesor` INTEGER DEFAULT NULL,
  `id_admin` INTEGER DEFAULT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_admin`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`id_asesor`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`id_sup`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS `ins_fl__uq_ins_fl_proyecto_referencia` ON `ins_fl` (`id_proyecto`,`referencia_sitio`);
CREATE INDEX IF NOT EXISTS `ins_fl__idx_ins_fl_proyecto` ON `ins_fl` (`proyecto`);
CREATE INDEX IF NOT EXISTS `ins_fl__idx_ins_fl_id_proyecto` ON `ins_fl` (`id_proyecto`);
CREATE INDEX IF NOT EXISTS `ins_fl__idx_ins_fl_referencia_sitio` ON `ins_fl` (`referencia_sitio`);
CREATE INDEX IF NOT EXISTS `ins_fl__idx_ins_fl_estatus` ON `ins_fl` (`estatus`);
CREATE INDEX IF NOT EXISTS `ins_fl__idx_ins_fl_estado` ON `ins_fl` (`estado`);
CREATE INDEX IF NOT EXISTS `ins_fl__idx_ins_fl_ciudad` ON `ins_fl` (`ciudad`);
CREATE INDEX IF NOT EXISTS `ins_fl__idx_ins_fl_supervisor_fl` ON `ins_fl` (`supervisor_fl`);
CREATE INDEX IF NOT EXISTS `ins_fl__idx_ins_fl_vendedor` ON `ins_fl` (`vendedor`);
CREATE INDEX IF NOT EXISTS `ins_fl__idx_ins_fl_cliente` ON `ins_fl` (`cliente`);
CREATE INDEX IF NOT EXISTS `ins_fl__idx_ins_fl_id_sup` ON `ins_fl` (`id_sup`);
CREATE INDEX IF NOT EXISTS `ins_fl__idx_ins_fl_id_asesor` ON `ins_fl` (`id_asesor`);
CREATE INDEX IF NOT EXISTS `ins_fl__idx_ins_fl_id_admin` ON `ins_fl` (`id_admin`);
CREATE INDEX IF NOT EXISTS `ins_fl__idx_ins_fl_activo` ON `ins_fl` (`activo`);

-- Table: ins_proyecto_fotos
DROP TABLE IF EXISTS `ins_proyecto_fotos`;
CREATE TABLE `ins_proyecto_fotos` (
  `id_photo` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_ppns` TEXT NOT NULL,
  `carpeta` TEXT DEFAULT NULL,
  `foto_blt_1` TEXT DEFAULT NULL,
  `foto_blt_2` TEXT DEFAULT NULL,
  `foto_blt_3` TEXT DEFAULT NULL,
  `foto_blt_4` TEXT DEFAULT NULL,
  `foto_blt_5` TEXT DEFAULT NULL,
  `foto_blt_6` TEXT DEFAULT NULL,
  `foto_blt_7` TEXT DEFAULT NULL,
  `foto_principal` TEXT DEFAULT NULL,
  `imagen_drive` TEXT DEFAULT NULL,
  `imagen_p_g` TEXT DEFAULT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `created_by` INTEGER DEFAULT NULL,
  `updated_by` INTEGER DEFAULT NULL,
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS `ins_proyecto_fotos__uq_ins_proyecto_fotos_ppns` ON `ins_proyecto_fotos` (`id_ppns`);
CREATE INDEX IF NOT EXISTS `ins_proyecto_fotos__idx_ins_proyecto_fotos_activo` ON `ins_proyecto_fotos` (`activo`);
CREATE INDEX IF NOT EXISTS `ins_proyecto_fotos__idx_ins_proyecto_fotos_created_by` ON `ins_proyecto_fotos` (`created_by`);
CREATE INDEX IF NOT EXISTS `ins_proyecto_fotos__idx_ins_proyecto_fotos_updated_by` ON `ins_proyecto_fotos` (`updated_by`);

-- Table: instalaciones_bitacora_documentos
DROP TABLE IF EXISTS `instalaciones_bitacora_documentos`;
CREATE TABLE `instalaciones_bitacora_documentos` (
  `id_documento` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_proyecto` TEXT NOT NULL,
  `carpeta_raiz_id` TEXT NOT NULL,
  `drive_file_id` TEXT NOT NULL,
  `drive_parent_folder_id` TEXT DEFAULT NULL,
  `nombre_archivo` TEXT NOT NULL,
  `ruta_carpeta` TEXT DEFAULT NULL,
  `mime_type` TEXT DEFAULT NULL,
  `web_view_link` TEXT DEFAULT NULL,
  `fecha_creacion_drive` TEXT DEFAULT NULL,
  `fecha_modificacion_drive` TEXT DEFAULT NULL,
  `fecha_primera_deteccion` TEXT NOT NULL,
  `fecha_ultima_deteccion` TEXT NOT NULL,
  `fecha_baja` TEXT DEFAULT NULL,
  `estatus` TEXT NOT NULL DEFAULT 'activo',
  `detectado_por_usuario` INTEGER DEFAULT NULL,
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS `instalaciones_bitacora_documentos__uk_proyecto_drive_file` ON `instalaciones_bitacora_documentos` (`id_proyecto`,`drive_file_id`);
CREATE INDEX IF NOT EXISTS `instalaciones_bitacora_documentos__idx_proyecto_estatus` ON `instalaciones_bitacora_documentos` (`id_proyecto`,`estatus`);
CREATE INDEX IF NOT EXISTS `instalaciones_bitacora_documentos__idx_drive_file` ON `instalaciones_bitacora_documentos` (`drive_file_id`);

-- Table: instalaciones_bitacora_sync_estado
DROP TABLE IF EXISTS `instalaciones_bitacora_sync_estado`;
CREATE TABLE `instalaciones_bitacora_sync_estado` (
  `id_proyecto` TEXT NOT NULL,
  `ultima_sincronizacion` TEXT NOT NULL,
  `ultimo_usuario` INTEGER DEFAULT NULL,
  `total_activos` INTEGER NOT NULL DEFAULT '0',
  `total_eliminados` INTEGER NOT NULL DEFAULT '0',
  `truncado` INTEGER NOT NULL DEFAULT '0',
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_proyecto`)
);

-- Table: instalaciones_drive_carpetas
DROP TABLE IF EXISTS `instalaciones_drive_carpetas`;
CREATE TABLE `instalaciones_drive_carpetas` (
  `id_carpeta` INTEGER PRIMARY KEY AUTOINCREMENT,
  `nombre_carpeta` TEXT NOT NULL,
  `carpeta_id` TEXT NOT NULL,
  `enlace` TEXT NOT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `fecha_sincronizacion` TEXT DEFAULT NULL,
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` INTEGER DEFAULT NULL,
  `updated_by` INTEGER DEFAULT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS `instalaciones_drive_carpetas__uq_drive_folder_id` ON `instalaciones_drive_carpetas` (`carpeta_id`);
CREATE INDEX IF NOT EXISTS `instalaciones_drive_carpetas__idx_nombre` ON `instalaciones_drive_carpetas` (`nombre_carpeta`);
CREATE INDEX IF NOT EXISTS `instalaciones_drive_carpetas__idx_activo` ON `instalaciones_drive_carpetas` (`activo`);

-- Table: instalaciones_drive_configuracion
DROP TABLE IF EXISTS `instalaciones_drive_configuracion`;
CREATE TABLE `instalaciones_drive_configuracion` (
  `id_configuracion` INTEGER PRIMARY KEY AUTOINCREMENT,
  `tipo_configuracion` TEXT NOT NULL,
  `carpeta_id` TEXT NOT NULL,
  `nombre_carpeta` TEXT DEFAULT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `actualizado_por` INTEGER NOT NULL,
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`actualizado_por`) REFERENCES `usuarios` (`id_SB`) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS `instalaciones_drive_configuracion__uq_tipo_configuracion` ON `instalaciones_drive_configuracion` (`tipo_configuracion`);
CREATE INDEX IF NOT EXISTS `instalaciones_drive_configuracion__idx_inst_drive_config_actualizado_por` ON `instalaciones_drive_configuracion` (`actualizado_por`);

-- Table: instalaciones_proyecto_drive
DROP TABLE IF EXISTS `instalaciones_proyecto_drive`;
CREATE TABLE `instalaciones_proyecto_drive` (
  `id_proyecto_drive` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_proyecto` TEXT NOT NULL,
  `nombre_proyecto` TEXT DEFAULT NULL,
  `id_carpeta` INTEGER NOT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `vinculado_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` INTEGER DEFAULT NULL,
  `updated_by` INTEGER DEFAULT NULL,
  FOREIGN KEY (`id_carpeta`) REFERENCES `instalaciones_drive_carpetas` (`id_carpeta`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS `instalaciones_proyecto_drive__uq_instalaciones_proyecto_drive_proyecto` ON `instalaciones_proyecto_drive` (`id_proyecto`);
CREATE UNIQUE INDEX IF NOT EXISTS `instalaciones_proyecto_drive__uq_instalaciones_proyecto_drive_carpeta` ON `instalaciones_proyecto_drive` (`id_carpeta`);
CREATE INDEX IF NOT EXISTS `instalaciones_proyecto_drive__idx_instalaciones_proyecto_drive_activo` ON `instalaciones_proyecto_drive` (`activo`);
CREATE INDEX IF NOT EXISTS `instalaciones_proyecto_drive__idx_instalaciones_proyecto_drive_created_by` ON `instalaciones_proyecto_drive` (`created_by`);
CREATE INDEX IF NOT EXISTS `instalaciones_proyecto_drive__idx_instalaciones_proyecto_drive_updated_by` ON `instalaciones_proyecto_drive` (`updated_by`);

-- Table: instalaciones_proyecto_usuarios
DROP TABLE IF EXISTS `instalaciones_proyecto_usuarios`;
CREATE TABLE `instalaciones_proyecto_usuarios` (
  `id_proyecto_usuario` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_proyecto_drive` INTEGER NOT NULL,
  `id_usuario` INTEGER NOT NULL,
  `tipo` TEXT NOT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_proyecto_drive`) REFERENCES `instalaciones_proyecto_drive` (`id_proyecto_drive`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_SB`) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS `instalaciones_proyecto_usuarios__uq_instalaciones_proyecto_usuario_tipo` ON `instalaciones_proyecto_usuarios` (`id_proyecto_drive`,`id_usuario`,`tipo`);
CREATE INDEX IF NOT EXISTS `instalaciones_proyecto_usuarios__idx_instalaciones_proyecto_usuarios_proyecto` ON `instalaciones_proyecto_usuarios` (`id_proyecto_drive`);
CREATE INDEX IF NOT EXISTS `instalaciones_proyecto_usuarios__idx_instalaciones_proyecto_usuarios_usuario` ON `instalaciones_proyecto_usuarios` (`id_usuario`);
CREATE INDEX IF NOT EXISTS `instalaciones_proyecto_usuarios__idx_instalaciones_proyecto_usuarios_tipo` ON `instalaciones_proyecto_usuarios` (`tipo`);
CREATE INDEX IF NOT EXISTS `instalaciones_proyecto_usuarios__idx_instalaciones_proyecto_usuarios_activo` ON `instalaciones_proyecto_usuarios` (`activo`);

-- Table: log_ops
DROP TABLE IF EXISTS `log_ops`;
CREATE TABLE `log_ops` (
  `id_log_ops` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_ppns` TEXT NOT NULL,
  `ph_ns` TEXT DEFAULT NULL,
  `estatus` TEXT NOT NULL,
  `marca` TEXT DEFAULT NULL,
  `no_control` TEXT DEFAULT NULL,
  `cantidad` INTEGER DEFAULT NULL,
  `proyecto` TEXT DEFAULT NULL,
  `supervisor` TEXT DEFAULT NULL,
  `asesor` TEXT DEFAULT NULL,
  `ict` TEXT DEFAULT NULL,
  `incoterm` TEXT DEFAULT NULL,
  `proveedor` TEXT DEFAULT NULL,
  `carpeta` TEXT DEFAULT NULL,
  `pvo` TEXT DEFAULT NULL,
  `pago_cliente` TEXT DEFAULT NULL,
  `pago_liberacion` TEXT DEFAULT NULL,
  `fecha_produccion` TEXT DEFAULT NULL,
  `fecha_estimada_obra` TEXT DEFAULT NULL,
  `fecha_exw` TEXT DEFAULT NULL,
  `puerto_origen` TEXT DEFAULT NULL,
  `fecha_salida_estimada` TEXT DEFAULT NULL,
  `fecha_salida_real` TEXT DEFAULT NULL,
  `tiempo_transito` TEXT DEFAULT NULL,
  `puerto_destino` TEXT DEFAULT NULL,
  `fecha_llegada_estimada` TEXT DEFAULT NULL,
  `fecha_llegada_real` TEXT DEFAULT NULL,
  `fecha_pago_pedimento` TEXT DEFAULT NULL,
  `fecha_carga_transporte_nacional` TEXT DEFAULT NULL,
  `tiempo_aduana` TEXT DEFAULT NULL,
  `lugar_entrega` TEXT DEFAULT NULL,
  `fecha_entrega_programada` TEXT DEFAULT NULL,
  `fecha_entrega_real_obra` TEXT DEFAULT NULL,
  `fecha_entrada_almacen` TEXT DEFAULT NULL,
  `fecha_salida_almacen` TEXT DEFAULT NULL,
  `fecha_termino_aditiva` TEXT DEFAULT NULL,
  `diferencia_dias` TEXT DEFAULT NULL,
  `tiempo_total` TEXT DEFAULT NULL,
  `comentarios` TEXT,
  `estatus_corte_anterior` TEXT DEFAULT NULL,
  `fecha_corte_anterior` TEXT DEFAULT NULL,
  `fecha_sync` TEXT DEFAULT NULL,
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS `log_ops__idx_log_ops_ppns` ON `log_ops` (`id_ppns`);
CREATE INDEX IF NOT EXISTS `log_ops__idx_log_ops_phns` ON `log_ops` (`ph_ns`);
CREATE INDEX IF NOT EXISTS `log_ops__idx_log_ops_estatus` ON `log_ops` (`estatus`);
CREATE INDEX IF NOT EXISTS `log_ops__idx_log_ops_proyecto` ON `log_ops` (`proyecto`);
CREATE INDEX IF NOT EXISTS `log_ops__idx_log_ops_control` ON `log_ops` (`no_control`);

-- Table: logistica_cortes_semanales
DROP TABLE IF EXISTS `logistica_cortes_semanales`;
CREATE TABLE `logistica_cortes_semanales` (
  `id_corte` INTEGER PRIMARY KEY AUTOINCREMENT,
  `anio_iso` INTEGER NOT NULL,
  `semana_iso` INTEGER NOT NULL,
  `fecha_corte` TEXT NOT NULL,
  `id_corte_anterior` INTEGER DEFAULT NULL,
  `total_log_ops` INTEGER NOT NULL DEFAULT '0',
  `total_movimientos` INTEGER NOT NULL DEFAULT '0',
  `total_ingresos` INTEGER NOT NULL DEFAULT '0',
  `total_cambios_estatus` INTEGER NOT NULL DEFAULT '0',
  `snapshot_json` TEXT NOT NULL,
  `movimientos_json` TEXT NOT NULL,
  `estado` TEXT NOT NULL DEFAULT 'GENERANDO',
  `hash_contenido` TEXT DEFAULT NULL,
  `generado_por` INTEGER DEFAULT NULL,
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_corte_anterior`) REFERENCES `logistica_cortes_semanales` (`id_corte`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`generado_por`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  CHECK ((`anio_iso` between 2000 and 2100)),
  CHECK ((`semana_iso` between 1 and 53))
);
CREATE UNIQUE INDEX IF NOT EXISTS `logistica_cortes_semanales__uq_logistica_corte_semana` ON `logistica_cortes_semanales` (`anio_iso`,`semana_iso`);
CREATE INDEX IF NOT EXISTS `logistica_cortes_semanales__idx_logistica_corte_fecha` ON `logistica_cortes_semanales` (`fecha_corte`);
CREATE INDEX IF NOT EXISTS `logistica_cortes_semanales__idx_logistica_corte_estado` ON `logistica_cortes_semanales` (`estado`);
CREATE INDEX IF NOT EXISTS `logistica_cortes_semanales__fk_logistica_corte_anterior` ON `logistica_cortes_semanales` (`id_corte_anterior`);
CREATE INDEX IF NOT EXISTS `logistica_cortes_semanales__fk_logistica_corte_usuario` ON `logistica_cortes_semanales` (`generado_por`);

-- Table: logistica_produccion
DROP TABLE IF EXISTS `logistica_produccion`;
CREATE TABLE `logistica_produccion` (
  `id_produccion` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_log_ops` INTEGER DEFAULT NULL,
  `modo_registro` TEXT NOT NULL DEFAULT 'SEMI_AUTOMATICO',
  `ppns` TEXT DEFAULT NULL,
  `proyecto` TEXT DEFAULT NULL,
  `id_cotizacion_venta` INTEGER DEFAULT NULL,
  `id_asesor` INTEGER DEFAULT NULL,
  `id_supervisor` INTEGER DEFAULT NULL,
  `fecha_pvo` TEXT DEFAULT NULL,
  `fecha_pvo_fl` TEXT DEFAULT NULL,
  `fecha_cubos` TEXT DEFAULT NULL,
  `estatus_logistica` TEXT DEFAULT NULL,
  `id_estatus_produccion` INTEGER DEFAULT NULL,
  `comentario` TEXT,
  `fecha_envio_docs_fabrica` TEXT DEFAULT NULL,
  `fecha_envio_pago_fabrica` TEXT DEFAULT NULL,
  `semana_registro` INTEGER NOT NULL,
  `anio_registro` INTEGER NOT NULL,
  `origen_registro` TEXT NOT NULL DEFAULT 'GESTOR',
  `legacy_source_key` TEXT DEFAULT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `created_by` INTEGER DEFAULT NULL,
  `updated_by` INTEGER DEFAULT NULL,
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_asesor`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`id_estatus_produccion`) REFERENCES `catalogo_general` (`id_catalogo`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`id_log_ops`) REFERENCES `log_ops` (`id_log_ops`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`id_supervisor`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`id_cotizacion_venta`) REFERENCES `ventas_cotizaciones_cor` (`id_cotizacion`) ON DELETE SET NULL ON UPDATE CASCADE,
  CHECK ((`anio_registro` between 2000 and 2100)),
  CHECK ((`semana_registro` between 1 and 53))
);
CREATE UNIQUE INDEX IF NOT EXISTS `logistica_produccion__uq_logistica_produccion_log_ops` ON `logistica_produccion` (`id_log_ops`);
CREATE UNIQUE INDEX IF NOT EXISTS `logistica_produccion__uq_logistica_produccion_legacy_source` ON `logistica_produccion` (`legacy_source_key`);
CREATE INDEX IF NOT EXISTS `logistica_produccion__idx_log_prod_ppns` ON `logistica_produccion` (`ppns`);
CREATE INDEX IF NOT EXISTS `logistica_produccion__idx_log_prod_proyecto` ON `logistica_produccion` (`proyecto`);
CREATE INDEX IF NOT EXISTS `logistica_produccion__idx_log_prod_modo` ON `logistica_produccion` (`modo_registro`,`activo`);
CREATE INDEX IF NOT EXISTS `logistica_produccion__idx_log_prod_estatus` ON `logistica_produccion` (`id_estatus_produccion`,`activo`);
CREATE INDEX IF NOT EXISTS `logistica_produccion__idx_log_prod_estatus_logistica` ON `logistica_produccion` (`estatus_logistica`,`activo`);
CREATE INDEX IF NOT EXISTS `logistica_produccion__idx_log_prod_semana` ON `logistica_produccion` (`anio_registro`,`semana_registro`,`activo`);
CREATE INDEX IF NOT EXISTS `logistica_produccion__idx_log_prod_venta` ON `logistica_produccion` (`id_cotizacion_venta`);
CREATE INDEX IF NOT EXISTS `logistica_produccion__idx_log_prod_asesor` ON `logistica_produccion` (`id_asesor`);
CREATE INDEX IF NOT EXISTS `logistica_produccion__idx_log_prod_supervisor` ON `logistica_produccion` (`id_supervisor`);
CREATE INDEX IF NOT EXISTS `logistica_produccion__fk_log_prod_created_by` ON `logistica_produccion` (`created_by`);
CREATE INDEX IF NOT EXISTS `logistica_produccion__fk_log_prod_updated_by` ON `logistica_produccion` (`updated_by`);

-- Table: logistica_produccion_archivos
DROP TABLE IF EXISTS `logistica_produccion_archivos`;
CREATE TABLE `logistica_produccion_archivos` (
  `id_archivo` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_produccion` INTEGER NOT NULL,
  `tipo_archivo` TEXT NOT NULL,
  `numero_archivo` INTEGER NOT NULL,
  `nombre_archivo` TEXT NOT NULL,
  `nombre_original` TEXT DEFAULT NULL,
  `extension` TEXT DEFAULT NULL,
  `mime_type` TEXT DEFAULT NULL,
  `tamanio_bytes` INTEGER DEFAULT NULL,
  `storage_provider` TEXT NOT NULL DEFAULT 'AZURE_BLOB',
  `storage_container` TEXT DEFAULT NULL,
  `storage_blob_name` TEXT DEFAULT NULL,
  `storage_url` TEXT,
  `origen_archivo` TEXT NOT NULL DEFAULT 'NUEVO',
  `id_usuario` INTEGER DEFAULT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `eliminado_por` INTEGER DEFAULT NULL,
  `eliminado_at` TEXT DEFAULT NULL,
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`eliminado_por`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`id_produccion`) REFERENCES `logistica_produccion` (`id_produccion`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  CHECK ((((`tipo_archivo` = 'CPVO') and (`numero_archivo` between 1 and 2)) or ((`tipo_archivo` = 'GM') and (`numero_archivo` between 1 and 10)))),
  CHECK (((`tamanio_bytes` is null) or (`tamanio_bytes` <= 26214400))),
  CHECK ((`tipo_archivo` in ('CPVO','GM')))
);
CREATE UNIQUE INDEX IF NOT EXISTS `logistica_produccion_archivos__uq_log_prod_archivo_slot` ON `logistica_produccion_archivos` (`id_produccion`,`tipo_archivo`,`numero_archivo`);
CREATE INDEX IF NOT EXISTS `logistica_produccion_archivos__idx_log_prod_archivos_produccion` ON `logistica_produccion_archivos` (`id_produccion`,`activo`,`tipo_archivo`,`numero_archivo`);
CREATE INDEX IF NOT EXISTS `logistica_produccion_archivos__idx_log_prod_archivos_usuario` ON `logistica_produccion_archivos` (`id_usuario`);
CREATE INDEX IF NOT EXISTS `logistica_produccion_archivos__fk_log_prod_arch_eliminado_por` ON `logistica_produccion_archivos` (`eliminado_por`);

-- Table: notificacion_evento_roles
DROP TABLE IF EXISTS `notificacion_evento_roles`;
CREATE TABLE `notificacion_evento_roles` (
  `id_evento_rol` INTEGER PRIMARY KEY AUTOINCREMENT,
  `codigo_evento` TEXT NOT NULL,
  `id_rol` INTEGER NOT NULL,
  `politica` TEXT NOT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`codigo_evento`) REFERENCES `notificacion_eventos` (`codigo_evento`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS `notificacion_evento_roles__uq_not_evento_rol` ON `notificacion_evento_roles` (`codigo_evento`,`id_rol`);
CREATE INDEX IF NOT EXISTS `notificacion_evento_roles__idx_not_evento_roles_rol` ON `notificacion_evento_roles` (`id_rol`,`activo`);
CREATE INDEX IF NOT EXISTS `notificacion_evento_roles__idx_not_evento_roles_evento` ON `notificacion_evento_roles` (`codigo_evento`,`activo`);

-- Table: notificacion_eventos
DROP TABLE IF EXISTS `notificacion_eventos`;
CREATE TABLE `notificacion_eventos` (
  `codigo_evento` TEXT NOT NULL,
  `agrupacion` TEXT NOT NULL,
  `modulo` TEXT NOT NULL,
  `accion` TEXT NOT NULL,
  `nombre_evento` TEXT NOT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `prioridad_default` TEXT NOT NULL DEFAULT 'MEDIA',
  `configurable` INTEGER NOT NULL DEFAULT '1',
  `obligatoria` INTEGER NOT NULL DEFAULT '0',
  `campana_default` INTEGER NOT NULL DEFAULT '1',
  `push_default` INTEGER NOT NULL DEFAULT '0',
  `correo_default` INTEGER NOT NULL DEFAULT '0',
  `titulo_default` TEXT DEFAULT NULL,
  `mensaje_default` TEXT DEFAULT NULL,
  `icono_default` TEXT DEFAULT NULL,
  `accion_destino` TEXT NOT NULL DEFAULT 'ABRIR_MODULO',
  `ruta_default` TEXT DEFAULT NULL,
  `orden` INTEGER NOT NULL DEFAULT '100',
  `activo` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`codigo_evento`)
);
CREATE INDEX IF NOT EXISTS `notificacion_eventos__idx_not_evento_agrupacion` ON `notificacion_eventos` (`agrupacion`,`modulo`,`activo`);

-- Table: notificacion_preferencias
DROP TABLE IF EXISTS `notificacion_preferencias`;
CREATE TABLE `notificacion_preferencias` (
  `id_preferencia` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_usuario` INTEGER NOT NULL,
  `codigo_evento` TEXT NOT NULL,
  `campana` INTEGER NOT NULL DEFAULT '1',
  `push` INTEGER NOT NULL DEFAULT '0',
  `correo` INTEGER NOT NULL DEFAULT '0',
  `silenciada` INTEGER NOT NULL DEFAULT '0',
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`codigo_evento`) REFERENCES `notificacion_eventos` (`codigo_evento`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_SB`) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS `notificacion_preferencias__uq_not_pref_usuario_evento` ON `notificacion_preferencias` (`id_usuario`,`codigo_evento`);
CREATE INDEX IF NOT EXISTS `notificacion_preferencias__idx_not_pref_evento` ON `notificacion_preferencias` (`codigo_evento`);

-- Table: notificaciones_push_suscripciones
DROP TABLE IF EXISTS `notificaciones_push_suscripciones`;
CREATE TABLE `notificaciones_push_suscripciones` (
  `id_suscripcion` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_usuario` INTEGER NOT NULL,
  `endpoint` TEXT NOT NULL,
  `p256dh` TEXT NOT NULL,
  `auth` TEXT NOT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `dispositivo_nombre` TEXT DEFAULT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `ultimo_uso_at` TEXT DEFAULT NULL,
  `ultimo_id_notificacion` INTEGER DEFAULT NULL,
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS `notificaciones_push_suscripciones__uq_push_endpoint` ON `notificaciones_push_suscripciones` (`endpoint`);
CREATE INDEX IF NOT EXISTS `notificaciones_push_suscripciones__idx_push_usuario_activo` ON `notificaciones_push_suscripciones` (`id_usuario`,`activo`);

-- Table: pc
DROP TABLE IF EXISTS `pc`;
CREATE TABLE `pc` (
  `id_pc` INTEGER NOT NULL,
  `zona_adm` TEXT DEFAULT NULL,
  `proyecto` TEXT DEFAULT NULL,
  `id_proyecto_cobranza` INTEGER DEFAULT NULL,
  `cliente` TEXT DEFAULT NULL,
  `ov` TEXT DEFAULT NULL,
  `fecha_ov` TEXT DEFAULT NULL,
  `mes_ov` TEXT DEFAULT NULL,
  `concepto` TEXT DEFAULT NULL,
  `precio_venta` REAL DEFAULT NULL,
  `pagado_iva` REAL DEFAULT NULL,
  `no_pagado_iva` REAL DEFAULT NULL,
  `venta_total` REAL DEFAULT NULL,
  `facturas_pendientes_pago` INTEGER DEFAULT NULL,
  `adeudo` REAL DEFAULT NULL,
  `tipo_pago` TEXT DEFAULT NULL,
  `no_factura` TEXT DEFAULT NULL,
  `fecha_factura` TEXT DEFAULT NULL,
  `mes_factura` TEXT DEFAULT NULL,
  `terminos` TEXT DEFAULT NULL,
  `fecha_vencimiento` TEXT DEFAULT NULL,
  `dias_vencimiento` INTEGER DEFAULT NULL,
  `estatus` TEXT DEFAULT NULL,
  `estatus_administrativo` TEXT DEFAULT NULL,
  `estatus_operativo` TEXT DEFAULT NULL,
  `fecha_pago` TEXT DEFAULT NULL,
  `refacturacion_sustitucion` TEXT DEFAULT NULL,
  `zona_operativa` TEXT DEFAULT NULL,
  `estado` TEXT DEFAULT NULL,
  `comentarios_cobranza` TEXT,
  `estatus_cartera` TEXT DEFAULT NULL,
  PRIMARY KEY (`id_pc`),
  FOREIGN KEY (`id_proyecto_cobranza`) REFERENCES `cobranza_proyectos` (`id_proyecto_cobranza`) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS `pc__idx_pc_ov` ON `pc` (`ov`);
CREATE INDEX IF NOT EXISTS `pc__idx_pc_proyecto` ON `pc` (`proyecto`);
CREATE INDEX IF NOT EXISTS `pc__idx_pc_cliente` ON `pc` (`cliente`);
CREATE INDEX IF NOT EXISTS `pc__idx_pc_no_factura` ON `pc` (`no_factura`);
CREATE INDEX IF NOT EXISTS `pc__idx_pc_id_proyecto_cobranza` ON `pc` (`id_proyecto_cobranza`);

-- Table: pendientes
DROP TABLE IF EXISTS `pendientes`;
CREATE TABLE `pendientes` (
  `id_pendiente` INTEGER PRIMARY KEY AUTOINCREMENT,
  `pendiente` TEXT NOT NULL,
  `tipo_pendiente` TEXT NOT NULL,
  `estatus` TEXT NOT NULL DEFAULT 'Pendiente',
  `area` TEXT DEFAULT NULL,
  `empresa` TEXT DEFAULT NULL,
  `descripcion` TEXT,
  `date_created` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `creado_por_email` TEXT NOT NULL,
  `creado_por_iniciales` TEXT NOT NULL,
  `due_date` TEXT DEFAULT NULL,
  `proyecto` TEXT DEFAULT NULL,
  `equipo` TEXT DEFAULT NULL,
  `photo_url` TEXT,
  `adjunto_url` TEXT,
  `con_subtareas` INTEGER NOT NULL DEFAULT '0',
  `prioridad` TEXT DEFAULT NULL,
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS `pendientes__idx_tipo_pendiente` ON `pendientes` (`tipo_pendiente`);
CREATE INDEX IF NOT EXISTS `pendientes__idx_estatus` ON `pendientes` (`estatus`);
CREATE INDEX IF NOT EXISTS `pendientes__idx_prioridad` ON `pendientes` (`prioridad`);
CREATE INDEX IF NOT EXISTS `pendientes__idx_area` ON `pendientes` (`area`);
CREATE INDEX IF NOT EXISTS `pendientes__idx_proyecto` ON `pendientes` (`proyecto`);
CREATE INDEX IF NOT EXISTS `pendientes__idx_due_date` ON `pendientes` (`due_date`);
CREATE INDEX IF NOT EXISTS `pendientes__idx_pendientes_empresa` ON `pendientes` (`empresa`);

-- Table: pendientes_archivos
DROP TABLE IF EXISTS `pendientes_archivos`;
CREATE TABLE `pendientes_archivos` (
  `id_archivo` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_pendiente` INTEGER NOT NULL,
  `tipo_archivo` TEXT NOT NULL,
  `nombre_original` TEXT NOT NULL,
  `mime_type` TEXT DEFAULT NULL,
  `tamano_bytes` INTEGER DEFAULT NULL,
  `storage_provider` TEXT NOT NULL DEFAULT 'AZURE_BLOB',
  `storage_container` TEXT DEFAULT NULL,
  `storage_blob_name` TEXT NOT NULL,
  `storage_url` TEXT DEFAULT NULL,
  `origen_archivo` TEXT NOT NULL DEFAULT 'NUEVO',
  `subido_por` INTEGER DEFAULT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `eliminado_por` INTEGER DEFAULT NULL,
  `eliminado_at` TEXT DEFAULT NULL,
  `motivo_baja` TEXT DEFAULT NULL,
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`eliminado_por`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`id_pendiente`) REFERENCES `pendientes` (`id_pendiente`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`subido_por`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS `pendientes_archivos__idx_pendientes_archivos_tarea` ON `pendientes_archivos` (`id_pendiente`,`activo`,`id_archivo`);
CREATE INDEX IF NOT EXISTS `pendientes_archivos__idx_pendientes_archivos_tipo` ON `pendientes_archivos` (`id_pendiente`,`tipo_archivo`,`activo`);
CREATE INDEX IF NOT EXISTS `pendientes_archivos__idx_pendientes_archivos_storage` ON `pendientes_archivos` (`storage_provider`,`storage_blob_name`);
CREATE INDEX IF NOT EXISTS `pendientes_archivos__idx_pendientes_archivos_subido` ON `pendientes_archivos` (`subido_por`);
CREATE INDEX IF NOT EXISTS `pendientes_archivos__idx_pendientes_archivos_eliminado` ON `pendientes_archivos` (`eliminado_por`);

-- Table: pendientes_comentarios
DROP TABLE IF EXISTS `pendientes_comentarios`;
CREATE TABLE `pendientes_comentarios` (
  `id_comentario` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_pendiente` INTEGER NOT NULL,
  `id_usuario` INTEGER NOT NULL,
  `comentario` TEXT NOT NULL,
  `fecha` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_pendiente`) REFERENCES `pendientes` (`id_pendiente`) ON DELETE CASCADE,
  FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_SB`) ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS `pendientes_comentarios__idx_pendiente` ON `pendientes_comentarios` (`id_pendiente`);
CREATE INDEX IF NOT EXISTS `pendientes_comentarios__idx_usuario` ON `pendientes_comentarios` (`id_usuario`);
CREATE INDEX IF NOT EXISTS `pendientes_comentarios__idx_fecha` ON `pendientes_comentarios` (`fecha`);

-- Table: pendientes_comentarios_adjuntos
DROP TABLE IF EXISTS `pendientes_comentarios_adjuntos`;
CREATE TABLE `pendientes_comentarios_adjuntos` (
  `id_adjunto` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_comentario` INTEGER NOT NULL,
  `nombre_archivo` TEXT NOT NULL,
  `archivo_url` TEXT NOT NULL,
  `tipo_archivo` TEXT DEFAULT NULL,
  `storage_provider` TEXT DEFAULT NULL,
  `storage_container` TEXT DEFAULT NULL,
  `storage_blob_name` TEXT DEFAULT NULL,
  `tamano_bytes` INTEGER DEFAULT NULL,
  `subido_por` INTEGER DEFAULT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `fecha` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_comentario`) REFERENCES `pendientes_comentarios` (`id_comentario`) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS `pendientes_comentarios_adjuntos__idx_comentario` ON `pendientes_comentarios_adjuntos` (`id_comentario`);
CREATE INDEX IF NOT EXISTS `pendientes_comentarios_adjuntos__idx_pca_storage` ON `pendientes_comentarios_adjuntos` (`storage_provider`,`storage_blob_name`);
CREATE INDEX IF NOT EXISTS `pendientes_comentarios_adjuntos__idx_pca_activo` ON `pendientes_comentarios_adjuntos` (`activo`);
CREATE INDEX IF NOT EXISTS `pendientes_comentarios_adjuntos__idx_pca_subido_por` ON `pendientes_comentarios_adjuntos` (`subido_por`);

-- Table: pendientes_subtareas
DROP TABLE IF EXISTS `pendientes_subtareas`;
CREATE TABLE `pendientes_subtareas` (
  `id_subtarea` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_pendiente` INTEGER NOT NULL,
  `subtarea` TEXT NOT NULL,
  `estatus` TEXT NOT NULL DEFAULT 'Pendiente',
  `orden` INTEGER DEFAULT '1',
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_pendiente`) REFERENCES `pendientes` (`id_pendiente`) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS `pendientes_subtareas__idx_subtarea_pendiente` ON `pendientes_subtareas` (`id_pendiente`);

-- Table: pendientes_usuarios
DROP TABLE IF EXISTS `pendientes_usuarios`;
CREATE TABLE `pendientes_usuarios` (
  `id_pendiente_usuario` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_pendiente` INTEGER NOT NULL,
  `iniciales_usuario` TEXT NOT NULL,
  `tipo_relacion` TEXT NOT NULL,
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_pendiente`) REFERENCES `pendientes` (`id_pendiente`) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS `pendientes_usuarios__idx_pendiente` ON `pendientes_usuarios` (`id_pendiente`);
CREATE INDEX IF NOT EXISTS `pendientes_usuarios__idx_usuario` ON `pendientes_usuarios` (`iniciales_usuario`);
CREATE INDEX IF NOT EXISTS `pendientes_usuarios__idx_relacion` ON `pendientes_usuarios` (`tipo_relacion`);

-- Table: perm_acciones
DROP TABLE IF EXISTS `perm_acciones`;
CREATE TABLE `perm_acciones` (
  `id_accion` INTEGER PRIMARY KEY AUTOINCREMENT,
  `codigo` TEXT NOT NULL,
  `nombre` TEXT NOT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `requiere_auditoria` INTEGER NOT NULL DEFAULT '0',
  `activo` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS `perm_acciones__uq_perm_accion_codigo` ON `perm_acciones` (`codigo`);

-- Table: perm_agrupaciones
DROP TABLE IF EXISTS `perm_agrupaciones`;
CREATE TABLE `perm_agrupaciones` (
  `id_agrupacion` INTEGER PRIMARY KEY AUTOINCREMENT,
  `codigo` TEXT NOT NULL,
  `nombre` TEXT NOT NULL,
  `empresa` TEXT NOT NULL,
  `orden` INTEGER NOT NULL DEFAULT '0',
  `activo` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS `perm_agrupaciones__uq_perm_agrupacion_codigo` ON `perm_agrupaciones` (`codigo`);

-- Table: perm_elementos
DROP TABLE IF EXISTS `perm_elementos`;
CREATE TABLE `perm_elementos` (
  `id_elemento` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_modulo` INTEGER NOT NULL,
  `codigo` TEXT NOT NULL,
  `nombre` TEXT NOT NULL,
  `tipo` TEXT DEFAULT NULL,
  `orden` INTEGER NOT NULL DEFAULT '0',
  `activo` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_modulo`) REFERENCES `perm_modulos` (`id_modulo`) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS `perm_elementos__uq_perm_elemento_codigo` ON `perm_elementos` (`codigo`);
CREATE INDEX IF NOT EXISTS `perm_elementos__idx_perm_elemento_modulo` ON `perm_elementos` (`id_modulo`);

-- Table: perm_modulos
DROP TABLE IF EXISTS `perm_modulos`;
CREATE TABLE `perm_modulos` (
  `id_modulo` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_agrupacion` INTEGER NOT NULL,
  `codigo` TEXT NOT NULL,
  `nombre` TEXT NOT NULL,
  `ruta_frontend` TEXT DEFAULT NULL,
  `orden` INTEGER NOT NULL DEFAULT '0',
  `activo` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_agrupacion`) REFERENCES `perm_agrupaciones` (`id_agrupacion`) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS `perm_modulos__uq_perm_modulo_codigo` ON `perm_modulos` (`codigo`);
CREATE INDEX IF NOT EXISTS `perm_modulos__idx_perm_modulo_agrupacion` ON `perm_modulos` (`id_agrupacion`);

-- Table: perm_subelemento_acciones
DROP TABLE IF EXISTS `perm_subelemento_acciones`;
CREATE TABLE `perm_subelemento_acciones` (
  `id_subelemento_accion` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_subelemento` INTEGER NOT NULL,
  `id_accion` INTEGER NOT NULL,
  `codigo_permiso` TEXT NOT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_accion`) REFERENCES `perm_acciones` (`id_accion`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`id_subelemento`) REFERENCES `perm_subelementos` (`id_subelemento`) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS `perm_subelemento_acciones__uq_perm_subelemento_accion` ON `perm_subelemento_acciones` (`id_subelemento`,`id_accion`);
CREATE UNIQUE INDEX IF NOT EXISTS `perm_subelemento_acciones__uq_perm_codigo_permiso` ON `perm_subelemento_acciones` (`codigo_permiso`);
CREATE INDEX IF NOT EXISTS `perm_subelemento_acciones__idx_perm_sa_subelemento` ON `perm_subelemento_acciones` (`id_subelemento`);
CREATE INDEX IF NOT EXISTS `perm_subelemento_acciones__idx_perm_sa_accion` ON `perm_subelemento_acciones` (`id_accion`);

-- Table: perm_subelementos
DROP TABLE IF EXISTS `perm_subelementos`;
CREATE TABLE `perm_subelementos` (
  `id_subelemento` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_elemento` INTEGER NOT NULL,
  `codigo` TEXT NOT NULL,
  `nombre` TEXT NOT NULL,
  `orden` INTEGER NOT NULL DEFAULT '0',
  `activo` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_elemento`) REFERENCES `perm_elementos` (`id_elemento`) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS `perm_subelementos__uq_perm_subelemento_codigo` ON `perm_subelementos` (`codigo`);
CREATE INDEX IF NOT EXISTS `perm_subelementos__idx_perm_subelemento_elemento` ON `perm_subelementos` (`id_elemento`);

-- Table: portafolio
DROP TABLE IF EXISTS `portafolio`;
CREATE TABLE `portafolio` (
  `id_portafolio` INTEGER PRIMARY KEY AUTOINCREMENT,
  `proyecto` TEXT DEFAULT NULL,
  `id_proyecto_cobranza` INTEGER DEFAULT NULL,
  `ciudad` TEXT DEFAULT NULL,
  `estado` TEXT DEFAULT NULL,
  `numero_equipo` TEXT NOT NULL,
  `id_equipo_ns` TEXT DEFAULT NULL,
  `identificacion_sitio` TEXT DEFAULT NULL,
  `inactivo` TEXT DEFAULT NULL,
  `estatus_servicio` TEXT DEFAULT NULL,
  `causa_no_servicio` TEXT DEFAULT NULL,
  `detalle_no_servicio` TEXT DEFAULT NULL,
  `zona_id` INTEGER DEFAULT NULL,
  `zona_operativa` TEXT DEFAULT NULL,
  `direccion` TEXT,
  `motivo_inactivo` TEXT DEFAULT NULL,
  `suspension_temporal` TEXT DEFAULT NULL,
  `causa_suspension_temporal` TEXT DEFAULT NULL,
  `fecha_instalacion` TEXT DEFAULT NULL,
  `fecha_entrega` TEXT DEFAULT NULL,
  `termino_garantia` TEXT DEFAULT NULL,
  `fecha_recepcion_mantenimiento` TEXT DEFAULT NULL,
  `mes_inicio_gratuitos` TEXT DEFAULT NULL,
  `mes_termino_gratuitos` TEXT DEFAULT NULL,
  `mes_objetivo_inicio_cobranza` TEXT DEFAULT NULL,
  `fecha_ingreso_portafolio` TEXT DEFAULT NULL,
  `superintendente` TEXT DEFAULT NULL,
  `supervisor_zona` TEXT DEFAULT NULL,
  `proyecto_cc_x_port` TEXT DEFAULT NULL,
  `cliente` TEXT DEFAULT NULL,
  `subsidiaria` TEXT DEFAULT NULL,
  `region` TEXT DEFAULT NULL,
  `zona_administrativa` TEXT DEFAULT NULL,
  `categoria` TEXT DEFAULT NULL,
  `prioridad` TEXT DEFAULT NULL,
  `nivel_precio` TEXT DEFAULT NULL,
  `terminos` TEXT DEFAULT NULL,
  `frecuencia` TEXT DEFAULT NULL,
  `estatus_cobranza` TEXT DEFAULT NULL,
  `precio_unitario` TEXT DEFAULT NULL,
  `tipo_poliza` TEXT DEFAULT NULL,
  `tipo_facturacion` TEXT DEFAULT NULL,
  `numero_contrato_fabricante` TEXT DEFAULT NULL,
  `producto` TEXT DEFAULT NULL,
  `marca` TEXT DEFAULT NULL,
  `modelo` TEXT DEFAULT NULL,
  `no_paradas` TEXT DEFAULT NULL,
  `no_accesos` TEXT DEFAULT NULL,
  `velocidad_ms` TEXT DEFAULT NULL,
  `capacidad_kg` TEXT DEFAULT NULL,
  `desnivel_mm` TEXT DEFAULT NULL,
  `longitud_mm` TEXT DEFAULT NULL,
  `ancho_peldano_mm` TEXT DEFAULT NULL,
  `inclinacion_grados` TEXT DEFAULT NULL,
  `tiempo_mp_hrs` TEXT DEFAULT NULL,
  `no_gratuitos` TEXT DEFAULT NULL,
  `no_garantia` TEXT DEFAULT NULL,
  `estatus_ul_mes` TEXT DEFAULT NULL,
  `estatus_ul_mes_fecha` TEXT DEFAULT NULL,
  `estado_registro` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` TEXT DEFAULT NULL,
  `updated_by` TEXT DEFAULT NULL,
  FOREIGN KEY (`id_proyecto_cobranza`) REFERENCES `cobranza_proyectos` (`id_proyecto_cobranza`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`zona_id`) REFERENCES `z_op` (`id_zona`) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS `portafolio__uq_portafolio_numero_equipo` ON `portafolio` (`numero_equipo`);
CREATE INDEX IF NOT EXISTS `portafolio__fk_portafolio_zona` ON `portafolio` (`zona_id`);
CREATE INDEX IF NOT EXISTS `portafolio__idx_portafolio_id_proyecto_cobranza` ON `portafolio` (`id_proyecto_cobranza`);

-- Table: portafolio_cortes_semanales
DROP TABLE IF EXISTS `portafolio_cortes_semanales`;
CREATE TABLE `portafolio_cortes_semanales` (
  `id_corte` INTEGER PRIMARY KEY AUTOINCREMENT,
  `anio_iso` INTEGER NOT NULL,
  `semana_iso` INTEGER NOT NULL,
  `fecha_inicio` TEXT NOT NULL,
  `fecha_fin` TEXT NOT NULL,
  `fecha_corte` TEXT NOT NULL,
  `id_corte_anterior` INTEGER DEFAULT NULL,
  `total_portafolio` INTEGER NOT NULL DEFAULT '0',
  `total_movimientos` INTEGER NOT NULL DEFAULT '0',
  `total_salidas` INTEGER NOT NULL DEFAULT '0',
  `total_regresos` INTEGER NOT NULL DEFAULT '0',
  `total_cambios` INTEGER NOT NULL DEFAULT '0',
  `total_ingresos` INTEGER NOT NULL DEFAULT '0',
  `snapshot_json` TEXT NOT NULL,
  `movimientos_json` TEXT NOT NULL,
  `estado` TEXT NOT NULL DEFAULT 'GENERANDO',
  `hash_contenido` TEXT DEFAULT NULL,
  `generado_por` INTEGER DEFAULT NULL,
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_corte_anterior`) REFERENCES `portafolio_cortes_semanales` (`id_corte`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`generado_por`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS `portafolio_cortes_semanales__uq_portafolio_semana` ON `portafolio_cortes_semanales` (`anio_iso`,`semana_iso`);
CREATE INDEX IF NOT EXISTS `portafolio_cortes_semanales__idx_portafolio_corte_fecha` ON `portafolio_cortes_semanales` (`fecha_corte`);
CREATE INDEX IF NOT EXISTS `portafolio_cortes_semanales__idx_portafolio_corte_estado` ON `portafolio_cortes_semanales` (`estado`);
CREATE INDEX IF NOT EXISTS `portafolio_cortes_semanales__idx_portafolio_corte_anterior` ON `portafolio_cortes_semanales` (`id_corte_anterior`);
CREATE INDEX IF NOT EXISTS `portafolio_cortes_semanales__idx_portafolio_corte_usuario` ON `portafolio_cortes_semanales` (`generado_por`);

-- Table: portafolio_interes
DROP TABLE IF EXISTS `portafolio_interes`;
CREATE TABLE `portafolio_interes` (
  `id_interes` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_usuario` INTEGER NOT NULL,
  `id_portafolio` INTEGER NOT NULL,
  `origen` TEXT NOT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_portafolio`) REFERENCES `portafolio` (`id_portafolio`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_SB`) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS `portafolio_interes__uq_portafolio_interes_usuario_equipo` ON `portafolio_interes` (`id_usuario`,`id_portafolio`);
CREATE INDEX IF NOT EXISTS `portafolio_interes__idx_portafolio_interes_equipo_activo` ON `portafolio_interes` (`id_portafolio`,`activo`);
CREATE INDEX IF NOT EXISTS `portafolio_interes__idx_portafolio_interes_usuario_activo` ON `portafolio_interes` (`id_usuario`,`activo`);
CREATE INDEX IF NOT EXISTS `portafolio_interes__idx_portafolio_interes_origen` ON `portafolio_interes` (`origen`,`activo`);

-- Table: portafolio_proyecto_fotos
DROP TABLE IF EXISTS `portafolio_proyecto_fotos`;
CREATE TABLE `portafolio_proyecto_fotos` (
  `id_photo` INTEGER PRIMARY KEY AUTOINCREMENT,
  `proyecto` TEXT NOT NULL,
  `foto_1` TEXT DEFAULT NULL,
  `foto_2` TEXT DEFAULT NULL,
  `foto_3` TEXT DEFAULT NULL,
  `foto_4` TEXT DEFAULT NULL,
  `foto_5` TEXT DEFAULT NULL,
  `foto_6` TEXT DEFAULT NULL,
  `foto_7` TEXT DEFAULT NULL,
  `foto_principal` TEXT DEFAULT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `created_by` INTEGER DEFAULT NULL,
  `updated_by` INTEGER DEFAULT NULL,
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS `portafolio_proyecto_fotos__uq_portafolio_proyecto_fotos_proyecto` ON `portafolio_proyecto_fotos` (`proyecto`);
CREATE INDEX IF NOT EXISTS `portafolio_proyecto_fotos__idx_portafolio_proyecto_fotos_activo` ON `portafolio_proyecto_fotos` (`activo`);
CREATE INDEX IF NOT EXISTS `portafolio_proyecto_fotos__idx_portafolio_proyecto_fotos_created_by` ON `portafolio_proyecto_fotos` (`created_by`);
CREATE INDEX IF NOT EXISTS `portafolio_proyecto_fotos__idx_portafolio_proyecto_fotos_updated_by` ON `portafolio_proyecto_fotos` (`updated_by`);

-- Table: portafolio_zona_backup_20260826_fix1
DROP TABLE IF EXISTS `portafolio_zona_backup_20260826_fix1`;
CREATE TABLE `portafolio_zona_backup_20260826_fix1` (
  `id_portafolio` INTEGER PRIMARY KEY AUTOINCREMENT,
  `proyecto` TEXT DEFAULT NULL,
  `id_proyecto_cobranza` INTEGER DEFAULT NULL,
  `ciudad` TEXT DEFAULT NULL,
  `estado` TEXT DEFAULT NULL,
  `numero_equipo` TEXT NOT NULL,
  `id_equipo_ns` TEXT DEFAULT NULL,
  `identificacion_sitio` TEXT DEFAULT NULL,
  `inactivo` TEXT DEFAULT NULL,
  `estatus_servicio` TEXT DEFAULT NULL,
  `causa_no_servicio` TEXT DEFAULT NULL,
  `detalle_no_servicio` TEXT DEFAULT NULL,
  `zona_id` INTEGER DEFAULT NULL,
  `zona_operativa` TEXT DEFAULT NULL,
  `direccion` TEXT,
  `motivo_inactivo` TEXT DEFAULT NULL,
  `suspension_temporal` TEXT DEFAULT NULL,
  `causa_suspension_temporal` TEXT DEFAULT NULL,
  `fecha_instalacion` TEXT DEFAULT NULL,
  `fecha_entrega` TEXT DEFAULT NULL,
  `termino_garantia` TEXT DEFAULT NULL,
  `fecha_recepcion_mantenimiento` TEXT DEFAULT NULL,
  `mes_inicio_gratuitos` TEXT DEFAULT NULL,
  `mes_termino_gratuitos` TEXT DEFAULT NULL,
  `mes_objetivo_inicio_cobranza` TEXT DEFAULT NULL,
  `fecha_ingreso_portafolio` TEXT DEFAULT NULL,
  `superintendente` TEXT DEFAULT NULL,
  `supervisor_zona` TEXT DEFAULT NULL,
  `proyecto_cc_x_port` TEXT DEFAULT NULL,
  `cliente` TEXT DEFAULT NULL,
  `subsidiaria` TEXT DEFAULT NULL,
  `region` TEXT DEFAULT NULL,
  `zona_administrativa` TEXT DEFAULT NULL,
  `categoria` TEXT DEFAULT NULL,
  `prioridad` TEXT DEFAULT NULL,
  `nivel_precio` TEXT DEFAULT NULL,
  `terminos` TEXT DEFAULT NULL,
  `frecuencia` TEXT DEFAULT NULL,
  `estatus_cobranza` TEXT DEFAULT NULL,
  `precio_unitario` TEXT DEFAULT NULL,
  `tipo_poliza` TEXT DEFAULT NULL,
  `tipo_facturacion` TEXT DEFAULT NULL,
  `numero_contrato_fabricante` TEXT DEFAULT NULL,
  `producto` TEXT DEFAULT NULL,
  `marca` TEXT DEFAULT NULL,
  `modelo` TEXT DEFAULT NULL,
  `no_paradas` TEXT DEFAULT NULL,
  `no_accesos` TEXT DEFAULT NULL,
  `velocidad_ms` TEXT DEFAULT NULL,
  `capacidad_kg` TEXT DEFAULT NULL,
  `desnivel_mm` TEXT DEFAULT NULL,
  `longitud_mm` TEXT DEFAULT NULL,
  `ancho_peldano_mm` TEXT DEFAULT NULL,
  `inclinacion_grados` TEXT DEFAULT NULL,
  `tiempo_mp_hrs` TEXT DEFAULT NULL,
  `no_gratuitos` TEXT DEFAULT NULL,
  `no_garantia` TEXT DEFAULT NULL,
  `estatus_ul_mes` TEXT DEFAULT NULL,
  `estatus_ul_mes_fecha` TEXT DEFAULT NULL,
  `estado_registro` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` TEXT DEFAULT NULL,
  `updated_by` TEXT DEFAULT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS `portafolio_zona_backup_20260826_fix1__uq_portafolio_numero_equipo` ON `portafolio_zona_backup_20260826_fix1` (`numero_equipo`);
CREATE INDEX IF NOT EXISTS `portafolio_zona_backup_20260826_fix1__fk_portafolio_zona` ON `portafolio_zona_backup_20260826_fix1` (`zona_id`);
CREATE INDEX IF NOT EXISTS `portafolio_zona_backup_20260826_fix1__idx_portafolio_id_proyecto_cobranza` ON `portafolio_zona_backup_20260826_fix1` (`id_proyecto_cobranza`);

-- Table: preguntas_seguridad
DROP TABLE IF EXISTS `preguntas_seguridad`;
CREATE TABLE `preguntas_seguridad` (
  `id_pregunta` INTEGER PRIMARY KEY AUTOINCREMENT,
  `pregunta` TEXT NOT NULL,
  `estado` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` TEXT DEFAULT NULL,
  `updated_by` TEXT DEFAULT NULL
);

-- Table: proyecto_equivalencias
DROP TABLE IF EXISTS `proyecto_equivalencias`;
CREATE TABLE `proyecto_equivalencias` (
  `id_equivalencia` INTEGER PRIMARY KEY AUTOINCREMENT,
  `proyecto_corellian` TEXT NOT NULL,
  `proyecto_united` TEXT NOT NULL,
  `nombre_publico` TEXT NOT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS `proyecto_equivalencias__uq_proyecto_equivalencia_corellian` ON `proyecto_equivalencias` (`proyecto_corellian`);
CREATE UNIQUE INDEX IF NOT EXISTS `proyecto_equivalencias__uq_proyecto_equivalencia_united` ON `proyecto_equivalencias` (`proyecto_united`);

-- Table: rol_permisos
DROP TABLE IF EXISTS `rol_permisos`;
CREATE TABLE `rol_permisos` (
  `id_rol_permiso` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_rol` INTEGER NOT NULL,
  `id_subelemento_accion` INTEGER NOT NULL,
  `permitido` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` INTEGER DEFAULT NULL,
  `updated_by` INTEGER DEFAULT NULL,
  FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`id_subelemento_accion`) REFERENCES `perm_subelemento_acciones` (`id_subelemento_accion`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS `rol_permisos__uq_rol_permiso` ON `rol_permisos` (`id_rol`,`id_subelemento_accion`);
CREATE INDEX IF NOT EXISTS `rol_permisos__idx_rol_permisos_rol` ON `rol_permisos` (`id_rol`);
CREATE INDEX IF NOT EXISTS `rol_permisos__idx_rol_permisos_permiso` ON `rol_permisos` (`id_subelemento_accion`);
CREATE INDEX IF NOT EXISTS `rol_permisos__fk_rol_permisos_created_by` ON `rol_permisos` (`created_by`);
CREATE INDEX IF NOT EXISTS `rol_permisos__fk_rol_permisos_updated_by` ON `rol_permisos` (`updated_by`);

-- Table: roles
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id_rol` INTEGER PRIMARY KEY AUTOINCREMENT,
  `rol` TEXT NOT NULL,
  `codigo` TEXT DEFAULT NULL,
  `descripcion` TEXT,
  `nivel` INTEGER NOT NULL DEFAULT '0',
  `es_sistema` INTEGER NOT NULL DEFAULT '0',
  `empresa` TEXT NOT NULL DEFAULT 'GENERAL',
  `estado` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` TEXT DEFAULT NULL,
  `updated_by` TEXT DEFAULT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS `roles__id_rol_UNIQUE` ON `roles` (`id_rol`);
CREATE UNIQUE INDEX IF NOT EXISTS `roles__rol_UNIQUE` ON `roles` (`rol`);
CREATE UNIQUE INDEX IF NOT EXISTS `roles__uq_roles_codigo` ON `roles` (`codigo`);

-- Table: servicios_preventivos
DROP TABLE IF EXISTS `servicios_preventivos`;
CREATE TABLE `servicios_preventivos` (
  `id_servicio` INTEGER PRIMARY KEY AUTOINCREMENT,
  `numero_equipo` TEXT NOT NULL,
  `mes_servicio` TEXT NOT NULL,
  `tipo_servicio` TEXT NOT NULL DEFAULT 'PREVENTIVO',
  `servicio_realizado` INTEGER NOT NULL DEFAULT '0',
  `programado_para` TEXT DEFAULT NULL,
  `fecha_servicio` TEXT DEFAULT NULL,
  `realizado_por` TEXT DEFAULT NULL,
  `duracion_minutos` INTEGER DEFAULT NULL,
  `resultado` TEXT DEFAULT NULL,
  `confirmado_por_id` INTEGER DEFAULT NULL,
  `confirmado_por_iniciales` TEXT DEFAULT NULL,
  `evidencia_url` TEXT,
  `observaciones` TEXT,
  `fuente` TEXT DEFAULT NULL,
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`numero_equipo`) REFERENCES `portafolio` (`numero_equipo`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`confirmado_por_id`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS `servicios_preventivos__uq_servicio_equipo_mes_tipo` ON `servicios_preventivos` (`numero_equipo`,`mes_servicio`,`tipo_servicio`);
CREATE INDEX IF NOT EXISTS `servicios_preventivos__idx_serv_prev_equipo` ON `servicios_preventivos` (`numero_equipo`);
CREATE INDEX IF NOT EXISTS `servicios_preventivos__idx_serv_prev_mes` ON `servicios_preventivos` (`mes_servicio`);
CREATE INDEX IF NOT EXISTS `servicios_preventivos__idx_serv_prev_tipo` ON `servicios_preventivos` (`tipo_servicio`);
CREATE INDEX IF NOT EXISTS `servicios_preventivos__idx_serv_prev_realizado` ON `servicios_preventivos` (`servicio_realizado`);
CREATE INDEX IF NOT EXISTS `servicios_preventivos__idx_serv_prev_confirmado` ON `servicios_preventivos` (`confirmado_por_id`);

-- Table: sup_adjuntos
DROP TABLE IF EXISTS `sup_adjuntos`;
CREATE TABLE `sup_adjuntos` (
  `id_adjunto` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_ticket` INTEGER NOT NULL,
  `tipo_adjunto` TEXT NOT NULL,
  `origen_adjunto` TEXT NOT NULL,
  `subido_por` INTEGER NOT NULL,
  `nombre_original` TEXT NOT NULL,
  `nombre_servidor` TEXT NOT NULL,
  `ruta_archivo` TEXT NOT NULL,
  `extension_archivo` TEXT NOT NULL,
  `mime_type` TEXT NOT NULL,
  `peso_archivo` INTEGER NOT NULL,
  `storage_provider` TEXT DEFAULT NULL,
  `storage_container` TEXT DEFAULT NULL,
  `storage_blob_name` TEXT DEFAULT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `fecha_creacion` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_ticket`) REFERENCES `sup_tickets` (`id_ticket`) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS `sup_adjuntos__idx_adjunto_ticket` ON `sup_adjuntos` (`id_ticket`);
CREATE INDEX IF NOT EXISTS `sup_adjuntos__idx_adjunto_tipo` ON `sup_adjuntos` (`tipo_adjunto`);
CREATE INDEX IF NOT EXISTS `sup_adjuntos__idx_adjunto_origen` ON `sup_adjuntos` (`origen_adjunto`);
CREATE INDEX IF NOT EXISTS `sup_adjuntos__idx_adjunto_subido_por` ON `sup_adjuntos` (`subido_por`);
CREATE INDEX IF NOT EXISTS `sup_adjuntos__idx_adjunto_activo` ON `sup_adjuntos` (`activo`);
CREATE INDEX IF NOT EXISTS `sup_adjuntos__idx_sup_adjuntos_storage` ON `sup_adjuntos` (`storage_provider`,`storage_blob_name`);

-- Table: sup_avisos
DROP TABLE IF EXISTS `sup_avisos`;
CREATE TABLE `sup_avisos` (
  `id_aviso` INTEGER PRIMARY KEY AUTOINCREMENT,
  `nombre_aviso` TEXT NOT NULL,
  `descripcion_aviso` TEXT NOT NULL,
  `roles_visibles` TEXT NOT NULL DEFAULT '*',
  `prioridad_aviso` TEXT NOT NULL DEFAULT 'normal',
  `fecha_inicio` TEXT NOT NULL,
  `fecha_fin` TEXT DEFAULT NULL,
  `creado_por` INTEGER DEFAULT NULL,
  `actualizado_por` INTEGER DEFAULT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `fecha_creacion` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS `sup_avisos__idx_aviso_roles` ON `sup_avisos` (`roles_visibles`);
CREATE INDEX IF NOT EXISTS `sup_avisos__idx_aviso_prioridad` ON `sup_avisos` (`prioridad_aviso`);
CREATE INDEX IF NOT EXISTS `sup_avisos__idx_aviso_activo` ON `sup_avisos` (`activo`);
CREATE INDEX IF NOT EXISTS `sup_avisos__idx_aviso_fecha_inicio` ON `sup_avisos` (`fecha_inicio`);
CREATE INDEX IF NOT EXISTS `sup_avisos__idx_aviso_fecha_fin` ON `sup_avisos` (`fecha_fin`);

-- Table: sup_faq
DROP TABLE IF EXISTS `sup_faq`;
CREATE TABLE `sup_faq` (
  `id_faq` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_faq_categoria` INTEGER NOT NULL,
  `pregunta_faq` TEXT NOT NULL,
  `respuesta_faq` TEXT NOT NULL,
  `palabras_clave` TEXT DEFAULT NULL,
  `orden_visualizacion` INTEGER NOT NULL DEFAULT '1',
  `creado_por` INTEGER DEFAULT NULL,
  `actualizado_por` INTEGER DEFAULT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `fecha_creacion` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_faq_categoria`) REFERENCES `sup_faq_categorias` (`id_faq_categoria`) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS `sup_faq__idx_faq_categoria` ON `sup_faq` (`id_faq_categoria`);
CREATE INDEX IF NOT EXISTS `sup_faq__idx_faq_orden_visualizacion` ON `sup_faq` (`orden_visualizacion`);
CREATE INDEX IF NOT EXISTS `sup_faq__idx_faq_activo` ON `sup_faq` (`activo`);

-- Table: sup_faq_categorias
DROP TABLE IF EXISTS `sup_faq_categorias`;
CREATE TABLE `sup_faq_categorias` (
  `id_faq_categoria` INTEGER PRIMARY KEY AUTOINCREMENT,
  `nombre_categoria` TEXT NOT NULL,
  `descripcion_categoria` TEXT,
  `icono_categoria` TEXT DEFAULT NULL,
  `orden_visualizacion` INTEGER NOT NULL DEFAULT '1',
  `creado_por` INTEGER DEFAULT NULL,
  `actualizado_por` INTEGER DEFAULT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `fecha_creacion` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS `sup_faq_categorias__uk_nombre_categoria` ON `sup_faq_categorias` (`nombre_categoria`);
CREATE INDEX IF NOT EXISTS `sup_faq_categorias__idx_faq_categoria_orden_visualizacion` ON `sup_faq_categorias` (`orden_visualizacion`);
CREATE INDEX IF NOT EXISTS `sup_faq_categorias__idx_faq_categoria_activo` ON `sup_faq_categorias` (`activo`);

-- Table: sup_flujos
DROP TABLE IF EXISTS `sup_flujos`;
CREATE TABLE `sup_flujos` (
  `id_flujo` INTEGER PRIMARY KEY AUTOINCREMENT,
  `nombre_flujo` TEXT NOT NULL,
  `descripcion_flujo` TEXT,
  `version_flujo` INTEGER NOT NULL DEFAULT '1',
  `orden_visualizacion` INTEGER NOT NULL DEFAULT '1',
  `creado_por` INTEGER DEFAULT NULL,
  `actualizado_por` INTEGER DEFAULT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `fecha_creacion` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS `sup_flujos__uk_flujo_version` ON `sup_flujos` (`nombre_flujo`,`version_flujo`);
CREATE INDEX IF NOT EXISTS `sup_flujos__idx_flujo_orden_visualizacion` ON `sup_flujos` (`orden_visualizacion`);
CREATE INDEX IF NOT EXISTS `sup_flujos__idx_flujo_activo` ON `sup_flujos` (`activo`);

-- Table: sup_nodos
DROP TABLE IF EXISTS `sup_nodos`;
CREATE TABLE `sup_nodos` (
  `id_nodo` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_flujo` INTEGER NOT NULL,
  `titulo_nodo` TEXT NOT NULL,
  `descripcion_nodo` TEXT,
  `tipo_nodo` TEXT NOT NULL,
  `orden_visualizacion` INTEGER NOT NULL DEFAULT '1',
  `creado_por` INTEGER DEFAULT NULL,
  `actualizado_por` INTEGER DEFAULT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `fecha_creacion` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_flujo`) REFERENCES `sup_flujos` (`id_flujo`) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS `sup_nodos__idx_nodo_flujo` ON `sup_nodos` (`id_flujo`);
CREATE INDEX IF NOT EXISTS `sup_nodos__idx_nodo_tipo` ON `sup_nodos` (`tipo_nodo`);
CREATE INDEX IF NOT EXISTS `sup_nodos__idx_nodo_orden_visualizacion` ON `sup_nodos` (`orden_visualizacion`);
CREATE INDEX IF NOT EXISTS `sup_nodos__idx_nodo_activo` ON `sup_nodos` (`activo`);

-- Table: sup_notificaciones
DROP TABLE IF EXISTS `sup_notificaciones`;
CREATE TABLE `sup_notificaciones` (
  `id_notificacion` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_usuario` INTEGER NOT NULL,
  `tipo_notificacion` TEXT NOT NULL,
  `titulo_notificacion` TEXT NOT NULL,
  `mensaje_notificacion` TEXT NOT NULL,
  `icono_notificacion` TEXT DEFAULT NULL,
  `accion_notificacion` TEXT NOT NULL,
  `id_referencia` INTEGER DEFAULT NULL,
  `ruta_destino` TEXT DEFAULT NULL,
  `clave_deduplicacion` TEXT DEFAULT NULL,
  `trace_id` TEXT DEFAULT NULL,
  `leido` INTEGER NOT NULL DEFAULT '0',
  `fecha_lectura` TEXT DEFAULT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `fecha_creacion` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS `sup_notificaciones__uq_sup_notif_evento_logico` ON `sup_notificaciones` (`id_usuario`,`tipo_notificacion`,`clave_deduplicacion`);
CREATE INDEX IF NOT EXISTS `sup_notificaciones__idx_notificacion_usuario` ON `sup_notificaciones` (`id_usuario`);
CREATE INDEX IF NOT EXISTS `sup_notificaciones__idx_notificacion_tipo` ON `sup_notificaciones` (`tipo_notificacion`);
CREATE INDEX IF NOT EXISTS `sup_notificaciones__idx_notificacion_accion` ON `sup_notificaciones` (`accion_notificacion`);
CREATE INDEX IF NOT EXISTS `sup_notificaciones__idx_notificacion_referencia` ON `sup_notificaciones` (`id_referencia`);
CREATE INDEX IF NOT EXISTS `sup_notificaciones__idx_notificacion_leido` ON `sup_notificaciones` (`leido`);
CREATE INDEX IF NOT EXISTS `sup_notificaciones__idx_notificacion_activo` ON `sup_notificaciones` (`activo`);
CREATE INDEX IF NOT EXISTS `sup_notificaciones__idx_notificacion_fecha` ON `sup_notificaciones` (`fecha_creacion`);
CREATE INDEX IF NOT EXISTS `sup_notificaciones__idx_sup_notif_trace` ON `sup_notificaciones` (`trace_id`);

-- Table: sup_opciones
DROP TABLE IF EXISTS `sup_opciones`;
CREATE TABLE `sup_opciones` (
  `id_opcion` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_nodo` INTEGER NOT NULL,
  `texto_opcion` TEXT NOT NULL,
  `accion_opcion` TEXT NOT NULL,
  `id_destino` INTEGER DEFAULT NULL,
  `orden_visualizacion` INTEGER NOT NULL DEFAULT '1',
  `creado_por` INTEGER DEFAULT NULL,
  `actualizado_por` INTEGER DEFAULT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `fecha_creacion` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_nodo`) REFERENCES `sup_nodos` (`id_nodo`) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS `sup_opciones__idx_opcion_nodo` ON `sup_opciones` (`id_nodo`);
CREATE INDEX IF NOT EXISTS `sup_opciones__idx_opcion_accion` ON `sup_opciones` (`accion_opcion`);
CREATE INDEX IF NOT EXISTS `sup_opciones__idx_opcion_destino` ON `sup_opciones` (`id_destino`);
CREATE INDEX IF NOT EXISTS `sup_opciones__idx_opcion_orden_visualizacion` ON `sup_opciones` (`orden_visualizacion`);
CREATE INDEX IF NOT EXISTS `sup_opciones__idx_opcion_activo` ON `sup_opciones` (`activo`);

-- Table: sup_ticket_categorias
DROP TABLE IF EXISTS `sup_ticket_categorias`;
CREATE TABLE `sup_ticket_categorias` (
  `id_ticket_categoria` INTEGER PRIMARY KEY AUTOINCREMENT,
  `nombre_categoria` TEXT NOT NULL,
  `descripcion_categoria` TEXT,
  `icono_categoria` TEXT DEFAULT NULL,
  `orden_visualizacion` INTEGER NOT NULL DEFAULT '1',
  `creado_por` INTEGER DEFAULT NULL,
  `actualizado_por` INTEGER DEFAULT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `fecha_creacion` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS `sup_ticket_categorias__uk_nombre_categoria` ON `sup_ticket_categorias` (`nombre_categoria`);
CREATE INDEX IF NOT EXISTS `sup_ticket_categorias__idx_ticket_categoria_orden_visualizacion` ON `sup_ticket_categorias` (`orden_visualizacion`);
CREATE INDEX IF NOT EXISTS `sup_ticket_categorias__idx_ticket_categoria_activo` ON `sup_ticket_categorias` (`activo`);

-- Table: sup_tickets
DROP TABLE IF EXISTS `sup_tickets`;
CREATE TABLE `sup_tickets` (
  `id_ticket` INTEGER PRIMARY KEY AUTOINCREMENT,
  `folio` TEXT NOT NULL,
  `id_usuario` INTEGER NOT NULL,
  `empresa` TEXT DEFAULT NULL,
  `id_soporte` INTEGER DEFAULT NULL,
  `id_ticket_categoria` INTEGER NOT NULL,
  `tipo_ticket` TEXT NOT NULL,
  `estado_ticket` TEXT NOT NULL,
  `prioridad_ticket` TEXT NOT NULL,
  `origen_ticket` TEXT NOT NULL,
  `modulo_ticket` TEXT DEFAULT NULL,
  `asunto_ticket` TEXT NOT NULL,
  `descripcion_ticket` TEXT NOT NULL,
  `comentarios_internos` TEXT,
  `historial` TEXT,
  `ultima_respuesta_por` TEXT DEFAULT NULL,
  `fecha_primer_contacto` TEXT DEFAULT NULL,
  `fecha_ultima_respuesta` TEXT DEFAULT NULL,
  `calificacion` INTEGER DEFAULT NULL,
  `comentario_calificacion` TEXT,
  `cerrado_por` INTEGER DEFAULT NULL,
  `motivo_cierre` TEXT DEFAULT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `fecha_creacion` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_cierre` TEXT DEFAULT NULL,
  FOREIGN KEY (`id_ticket_categoria`) REFERENCES `sup_ticket_categorias` (`id_ticket_categoria`) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS `sup_tickets__uk_ticket_folio` ON `sup_tickets` (`folio`);
CREATE INDEX IF NOT EXISTS `sup_tickets__idx_ticket_usuario` ON `sup_tickets` (`id_usuario`);
CREATE INDEX IF NOT EXISTS `sup_tickets__idx_ticket_soporte` ON `sup_tickets` (`id_soporte`);
CREATE INDEX IF NOT EXISTS `sup_tickets__idx_ticket_categoria` ON `sup_tickets` (`id_ticket_categoria`);
CREATE INDEX IF NOT EXISTS `sup_tickets__idx_ticket_estado` ON `sup_tickets` (`estado_ticket`);
CREATE INDEX IF NOT EXISTS `sup_tickets__idx_ticket_prioridad` ON `sup_tickets` (`prioridad_ticket`);
CREATE INDEX IF NOT EXISTS `sup_tickets__idx_ticket_origen` ON `sup_tickets` (`origen_ticket`);
CREATE INDEX IF NOT EXISTS `sup_tickets__idx_ticket_modulo` ON `sup_tickets` (`modulo_ticket`);
CREATE INDEX IF NOT EXISTS `sup_tickets__idx_ticket_activo` ON `sup_tickets` (`activo`);
CREATE INDEX IF NOT EXISTS `sup_tickets__idx_ticket_fecha_creacion` ON `sup_tickets` (`fecha_creacion`);
CREATE INDEX IF NOT EXISTS `sup_tickets__idx_ticket_fecha_ultima_respuesta` ON `sup_tickets` (`fecha_ultima_respuesta`);
CREATE INDEX IF NOT EXISTS `sup_tickets__idx_ticket_cerrado_por` ON `sup_tickets` (`cerrado_por`);
CREATE INDEX IF NOT EXISTS `sup_tickets__idx_sup_tickets_empresa` ON `sup_tickets` (`empresa`);

-- Table: ticket_comentarios
DROP TABLE IF EXISTS `ticket_comentarios`;
CREATE TABLE `ticket_comentarios` (
  `id_comentario` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_ticket` INTEGER NOT NULL,
  `id_usuario` INTEGER NOT NULL,
  `comentario` TEXT NOT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `fecha_creacion` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_ticket`) REFERENCES `tickets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_SB`) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS `ticket_comentarios__idx_ticket_comentarios_ticket` ON `ticket_comentarios` (`id_ticket`,`fecha_creacion`);
CREATE INDEX IF NOT EXISTS `ticket_comentarios__idx_ticket_comentarios_usuario` ON `ticket_comentarios` (`id_usuario`);

-- Table: ticket_validaciones
DROP TABLE IF EXISTS `ticket_validaciones`;
CREATE TABLE `ticket_validaciones` (
  `id_validacion` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_ticket` INTEGER NOT NULL,
  `id_usuario` INTEGER NOT NULL,
  `estado_anterior` TEXT DEFAULT NULL,
  `estado_nuevo` TEXT NOT NULL,
  `comentario` TEXT,
  `ip_origen` TEXT DEFAULT NULL,
  `fecha_creacion` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_ticket`) REFERENCES `tickets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_SB`) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS `ticket_validaciones__idx_ticket_validaciones_ticket` ON `ticket_validaciones` (`id_ticket`,`fecha_creacion`);
CREATE INDEX IF NOT EXISTS `ticket_validaciones__idx_ticket_validaciones_usuario` ON `ticket_validaciones` (`id_usuario`);

-- Table: tickets
DROP TABLE IF EXISTS `tickets`;
CREATE TABLE `tickets` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `ticket` TEXT NOT NULL,
  `id_interno` TEXT DEFAULT NULL,
  `folio` TEXT DEFAULT NULL,
  `estado_ticket` TEXT DEFAULT NULL,
  `estado` TEXT DEFAULT NULL,
  `ciudad` TEXT DEFAULT NULL,
  `proyecto` TEXT DEFAULT NULL,
  `equipo` TEXT DEFAULT NULL,
  `codigo_equipo` TEXT DEFAULT NULL,
  `referencia_en_zona_operativa` TEXT,
  `zona` TEXT DEFAULT NULL,
  `descripcion` TEXT,
  `fecha_reporte` TEXT DEFAULT NULL,
  `h_reporte` TEXT DEFAULT NULL,
  `estatus_equipo_ir` TEXT DEFAULT NULL,
  `fecha_llegada` TEXT DEFAULT NULL,
  `h_llegada` TEXT DEFAULT NULL,
  `persona_que_atiende` TEXT DEFAULT NULL,
  `fecha_cierre` TEXT DEFAULT NULL,
  `h_solucion` TEXT DEFAULT NULL,
  `tecnico` TEXT DEFAULT NULL,
  `supervisor` TEXT DEFAULT NULL,
  `estatus_equipo_final` TEXT DEFAULT NULL,
  `causa` TEXT,
  `accion_en_cierre` TEXT,
  `responsabilidad` TEXT DEFAULT NULL,
  `causa_falla` TEXT DEFAULT NULL,
  `tiempo_llegada` REAL DEFAULT NULL,
  `tiempo_solucion` REAL DEFAULT NULL,
  `tipo_equipo` TEXT DEFAULT NULL,
  `prioridad` TEXT DEFAULT NULL,
  `ejecutivo_call` TEXT DEFAULT NULL,
  `tiempo_llegada_ii` REAL DEFAULT NULL,
  `tiempo_solucion_ii` REAL DEFAULT NULL,
  `blt_empleado` TEXT DEFAULT NULL,
  `ticket_excede` TEXT DEFAULT NULL,
  `zona_administrativa` TEXT DEFAULT NULL,
  `zona_de_falla` TEXT DEFAULT NULL,
  `mes_reporte` TEXT DEFAULT NULL,
  `proyecto_padre` TEXT DEFAULT NULL,
  `vobo_estado` TEXT DEFAULT NULL,
  `vobo_comentario` TEXT,
  `vobo_por_id` INTEGER DEFAULT NULL,
  `vobo_por_nombre` TEXT DEFAULT NULL,
  `vobo_en` TEXT DEFAULT NULL,
  `creado_en` TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` TEXT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS `tickets__uq_tickets_ticket` ON `tickets` (`ticket`);
CREATE INDEX IF NOT EXISTS `tickets__idx_ticket` ON `tickets` (`ticket`);
CREATE INDEX IF NOT EXISTS `tickets__idx_folio` ON `tickets` (`folio`);
CREATE INDEX IF NOT EXISTS `tickets__idx_equipo` ON `tickets` (`codigo_equipo`);
CREATE INDEX IF NOT EXISTS `tickets__idx_estado` ON `tickets` (`estado`);
CREATE INDEX IF NOT EXISTS `tickets__idx_estado_ticket` ON `tickets` (`estado_ticket`);
CREATE INDEX IF NOT EXISTS `tickets__idx_zona` ON `tickets` (`zona`);
CREATE INDEX IF NOT EXISTS `tickets__idx_fecha_reporte` ON `tickets` (`fecha_reporte`);
CREATE INDEX IF NOT EXISTS `tickets__idx_codigo_equipo` ON `tickets` (`codigo_equipo`);
CREATE INDEX IF NOT EXISTS `tickets__idx_proyecto` ON `tickets` (`proyecto`);

-- Table: tickets_fechas_cdmx_correccion
DROP TABLE IF EXISTS `tickets_fechas_cdmx_correccion`;
CREATE TABLE `tickets_fechas_cdmx_correccion` (
  `ticket` TEXT NOT NULL,
  `fecha_reporte` TEXT DEFAULT NULL,
  `fecha_llegada` TEXT DEFAULT NULL,
  `fecha_cierre` TEXT DEFAULT NULL,
  `cargado_en` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ticket`),
  FOREIGN KEY (`ticket`) REFERENCES `tickets` (`ticket`) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS `tickets_fechas_cdmx_correccion__idx_tickets_fechas_cdmx_cargado_en` ON `tickets_fechas_cdmx_correccion` (`cargado_en`);

-- Table: usuario_google_oauth
DROP TABLE IF EXISTS `usuario_google_oauth`;
CREATE TABLE `usuario_google_oauth` (
  `id_google_oauth` INTEGER PRIMARY KEY AUTOINCREMENT,
  `usuario_id` INTEGER NOT NULL,
  `google_email` TEXT NOT NULL,
  `google_user_id` TEXT DEFAULT NULL,
  `access_token` TEXT NOT NULL,
  `refresh_token` TEXT,
  `token_type` TEXT DEFAULT NULL,
  `scope` TEXT,
  `expiry_date` INTEGER DEFAULT NULL,
  `estado` INTEGER NOT NULL DEFAULT '1',
  `connected_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_refresh_at` TEXT DEFAULT NULL,
  `disconnected_at` TEXT DEFAULT NULL,
  `created_at` TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id_SB`) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS `usuario_google_oauth__uq_google_oauth_usuario` ON `usuario_google_oauth` (`usuario_id`);
CREATE UNIQUE INDEX IF NOT EXISTS `usuario_google_oauth__uq_google_oauth_email` ON `usuario_google_oauth` (`google_email`);
CREATE UNIQUE INDEX IF NOT EXISTS `usuario_google_oauth__uq_google_oauth_google_user_id` ON `usuario_google_oauth` (`google_user_id`);
CREATE INDEX IF NOT EXISTS `usuario_google_oauth__idx_google_oauth_estado` ON `usuario_google_oauth` (`estado`);
CREATE INDEX IF NOT EXISTS `usuario_google_oauth__idx_google_oauth_expiry` ON `usuario_google_oauth` (`expiry_date`);

-- Table: usuario_interacciones
DROP TABLE IF EXISTS `usuario_interacciones`;
CREATE TABLE `usuario_interacciones` (
  `id_interaccion` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_usuario` INTEGER NOT NULL,
  `tipo_interaccion` TEXT NOT NULL,
  `modulo` TEXT NOT NULL,
  `entidad` TEXT DEFAULT NULL,
  `id_referencia` TEXT DEFAULT NULL,
  `titulo` TEXT NOT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `empresa_contexto` TEXT DEFAULT NULL,
  `ruta_destino` TEXT DEFAULT NULL,
  `payload_json` TEXT DEFAULT NULL,
  `detalle_json` TEXT DEFAULT NULL,
  `metodo_http` TEXT DEFAULT NULL,
  `endpoint` TEXT DEFAULT NULL,
  `ip_address` TEXT DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_SB`) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS `usuario_interacciones__idx_ui_usuario_fecha` ON `usuario_interacciones` (`id_usuario`,`created_at`);
CREATE INDEX IF NOT EXISTS `usuario_interacciones__idx_ui_tipo` ON `usuario_interacciones` (`tipo_interaccion`);
CREATE INDEX IF NOT EXISTS `usuario_interacciones__idx_ui_modulo` ON `usuario_interacciones` (`modulo`);
CREATE INDEX IF NOT EXISTS `usuario_interacciones__idx_ui_referencia` ON `usuario_interacciones` (`modulo`,`entidad`,`id_referencia`);
CREATE INDEX IF NOT EXISTS `usuario_interacciones__idx_ui_fecha` ON `usuario_interacciones` (`created_at`);

-- Table: usuario_permisos
DROP TABLE IF EXISTS `usuario_permisos`;
CREATE TABLE `usuario_permisos` (
  `id_usuario_permiso` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_usuario` INTEGER NOT NULL,
  `id_subelemento_accion` INTEGER NOT NULL,
  `permitido` INTEGER NOT NULL,
  `motivo` TEXT DEFAULT NULL,
  `fecha_inicio` TEXT DEFAULT NULL,
  `fecha_fin` TEXT DEFAULT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` INTEGER DEFAULT NULL,
  `updated_by` INTEGER DEFAULT NULL,
  FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`id_subelemento_accion`) REFERENCES `perm_subelemento_acciones` (`id_subelemento_accion`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_SB`) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS `usuario_permisos__uq_usuario_permiso` ON `usuario_permisos` (`id_usuario`,`id_subelemento_accion`);
CREATE INDEX IF NOT EXISTS `usuario_permisos__fk_usuario_permisos_permiso` ON `usuario_permisos` (`id_subelemento_accion`);
CREATE INDEX IF NOT EXISTS `usuario_permisos__fk_usuario_permisos_created_by` ON `usuario_permisos` (`created_by`);
CREATE INDEX IF NOT EXISTS `usuario_permisos__fk_usuario_permisos_updated_by` ON `usuario_permisos` (`updated_by`);

-- Table: usuario_roles
DROP TABLE IF EXISTS `usuario_roles`;
CREATE TABLE `usuario_roles` (
  `id_usuario_rol` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_usuario` INTEGER NOT NULL,
  `id_rol` INTEGER NOT NULL,
  `principal` INTEGER NOT NULL DEFAULT '0',
  `activo` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_SB`) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS `usuario_roles__uq_usuario_rol` ON `usuario_roles` (`id_usuario`,`id_rol`);
CREATE INDEX IF NOT EXISTS `usuario_roles__idx_usuario` ON `usuario_roles` (`id_usuario`);
CREATE INDEX IF NOT EXISTS `usuario_roles__idx_rol` ON `usuario_roles` (`id_rol`);

-- Table: usuario_zop
DROP TABLE IF EXISTS `usuario_zop`;
CREATE TABLE `usuario_zop` (
  `id_usuario_zop` INTEGER PRIMARY KEY AUTOINCREMENT,
  `usuario_id` INTEGER NOT NULL,
  `zona_id` INTEGER NOT NULL,
  `estado` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` TEXT DEFAULT NULL,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` TEXT DEFAULT NULL,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id_SB`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`zona_id`) REFERENCES `z_op` (`id_zona`) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS `usuario_zop__fk_usuario_zop_usuario_idx` ON `usuario_zop` (`usuario_id`);
CREATE INDEX IF NOT EXISTS `usuario_zop__fk_usuario_zop_zona_idx` ON `usuario_zop` (`zona_id`);

-- Table: usuarios
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id_SB` INTEGER PRIMARY KEY AUTOINCREMENT,
  `nombre` TEXT NOT NULL,
  `iniciales` TEXT NOT NULL,
  `puesto` TEXT NOT NULL,
  `area` TEXT NOT NULL,
  `empresa` TEXT DEFAULT NULL,
  `rol_id` INTEGER NOT NULL,
  `correo` TEXT NOT NULL,
  `pass` TEXT NOT NULL,
  `must_change_password` INTEGER NOT NULL DEFAULT '1',
  `reporta_a` INTEGER DEFAULT NULL,
  `estado` INTEGER NOT NULL DEFAULT '1',
  `id_pregunta` INTEGER DEFAULT '11',
  `respuesta_recuperacion` TEXT DEFAULT NULL,
  `failed_login_attempts` INTEGER NOT NULL DEFAULT '0',
  `locked_until` TEXT DEFAULT NULL,
  `password_changed_at` TEXT DEFAULT NULL,
  `first_login_completed_at` TEXT DEFAULT NULL,
  `ultimo_acceso` TEXT DEFAULT NULL,
  `last_login_ip` TEXT DEFAULT NULL,
  `two_factor_enabled` INTEGER NOT NULL DEFAULT '0',
  `totp_secret` TEXT DEFAULT NULL,
  `created_at` TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` TEXT DEFAULT NULL,
  `updated_by` TEXT DEFAULT NULL,
  `criticos_fallas` INTEGER NOT NULL DEFAULT '3',
  `criticos_periodo` INTEGER NOT NULL DEFAULT '35',
  `recovery_failed_attempts` INTEGER NOT NULL DEFAULT '0',
  `recovery_locked_until` TEXT DEFAULT NULL,
  FOREIGN KEY (`id_pregunta`) REFERENCES `preguntas_seguridad` (`id_pregunta`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id_rol`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`reporta_a`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS `usuarios__correo_UNIQUE` ON `usuarios` (`correo`);
CREATE UNIQUE INDEX IF NOT EXISTS `usuarios__iniciales` ON `usuarios` (`iniciales`);
CREATE INDEX IF NOT EXISTS `usuarios__fk_usuario_rol_idx` ON `usuarios` (`rol_id`);
CREATE INDEX IF NOT EXISTS `usuarios__fk_usuario_superior_idx` ON `usuarios` (`reporta_a`);
CREATE INDEX IF NOT EXISTS `usuarios__fk_usuario_pregunta` ON `usuarios` (`id_pregunta`);
CREATE INDEX IF NOT EXISTS `usuarios__idx_usuarios_puesto` ON `usuarios` (`puesto`);
CREATE INDEX IF NOT EXISTS `usuarios__ix_usuarios_recovery_locked` ON `usuarios` (`recovery_locked_until`);

-- Table: usuarios_alcance_informacion
DROP TABLE IF EXISTS `usuarios_alcance_informacion`;
CREATE TABLE `usuarios_alcance_informacion` (
  `id_alcance` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_usuario` INTEGER NOT NULL,
  `tipo_alcance` TEXT NOT NULL,
  `dominio` TEXT DEFAULT NULL,
  `id_agrupacion` INTEGER DEFAULT NULL,
  `id_usuario_visible` INTEGER DEFAULT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` INTEGER DEFAULT NULL,
  `updated_by` INTEGER DEFAULT NULL,
  FOREIGN KEY (`id_agrupacion`) REFERENCES `perm_agrupaciones` (`id_agrupacion`) ON DELETE RESTRICT,
  FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL,
  FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL,
  FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_SB`) ON DELETE CASCADE,
  FOREIGN KEY (`id_usuario_visible`) REFERENCES `usuarios` (`id_SB`) ON DELETE RESTRICT,
  CHECK ((((`tipo_alcance` = 'DOMINIO_COMPLETO') and (`dominio` is not null) and (`id_agrupacion` is null) and (`id_usuario_visible` is null)) or ((`tipo_alcance` = 'AGRUPACION') and (`dominio` is null) and (`id_agrupacion` is not null) and (`id_usuario_visible` is null)) or ((`tipo_alcance` in ('REPORTA_A','REL_ADMIN')) and (`dominio` is null) and (`id_agrupacion` is null) and (`id_usuario_visible` is null)) or ((`tipo_alcance` = 'USUARIO') and (`dominio` is null) and (`id_agrupacion` is null) and (`id_usuario_visible` is not null))))
);
CREATE INDEX IF NOT EXISTS `usuarios_alcance_informacion__idx_alcance_usuario` ON `usuarios_alcance_informacion` (`id_usuario`,`activo`);
CREATE INDEX IF NOT EXISTS `usuarios_alcance_informacion__idx_alcance_tipo` ON `usuarios_alcance_informacion` (`tipo_alcance`,`activo`);
CREATE INDEX IF NOT EXISTS `usuarios_alcance_informacion__idx_alcance_dominio` ON `usuarios_alcance_informacion` (`dominio`);
CREATE INDEX IF NOT EXISTS `usuarios_alcance_informacion__idx_alcance_usuario_visible` ON `usuarios_alcance_informacion` (`id_usuario_visible`,`activo`);
CREATE INDEX IF NOT EXISTS `usuarios_alcance_informacion__idx_alcance_created_by` ON `usuarios_alcance_informacion` (`created_by`);
CREATE INDEX IF NOT EXISTS `usuarios_alcance_informacion__idx_alcance_updated_by` ON `usuarios_alcance_informacion` (`updated_by`);
CREATE INDEX IF NOT EXISTS `usuarios_alcance_informacion__idx_alcance_agrupacion` ON `usuarios_alcance_informacion` (`id_agrupacion`,`activo`);

-- Table: usuarios_dispositivos
DROP TABLE IF EXISTS `usuarios_dispositivos`;
CREATE TABLE `usuarios_dispositivos` (
  `id_dispositivo` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_usuario` INTEGER NOT NULL,
  `device_token` TEXT NOT NULL,
  `nombre_dispositivo` TEXT DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `gps_estado` TEXT NOT NULL DEFAULT 'PENDIENTE',
  `camara_estado` TEXT NOT NULL DEFAULT 'PENDIENTE',
  `microfono_estado` TEXT NOT NULL DEFAULT 'PENDIENTE',
  `push_estado` TEXT NOT NULL DEFAULT 'PENDIENTE',
  `activo` INTEGER NOT NULL DEFAULT '1',
  `ultimo_acceso_at` TEXT DEFAULT NULL,
  `permisos_revisados_at` TEXT DEFAULT NULL,
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS `usuarios_dispositivos__uq_usuario_device_token` ON `usuarios_dispositivos` (`id_usuario`,`device_token`);
CREATE INDEX IF NOT EXISTS `usuarios_dispositivos__idx_dispositivo_usuario_activo` ON `usuarios_dispositivos` (`id_usuario`,`activo`);

-- Table: usuarios_rel_admin
DROP TABLE IF EXISTS `usuarios_rel_admin`;
CREATE TABLE `usuarios_rel_admin` (
  `id_rel_admin` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_asesor` INTEGER NOT NULL,
  `id_admin` INTEGER NOT NULL,
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_admin`) REFERENCES `usuarios` (`id_SB`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`id_asesor`) REFERENCES `usuarios` (`id_SB`) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS `usuarios_rel_admin__uq_usuarios_rel_admin_par` ON `usuarios_rel_admin` (`id_asesor`,`id_admin`);
CREATE INDEX IF NOT EXISTS `usuarios_rel_admin__idx_usuarios_rel_admin_asesor` ON `usuarios_rel_admin` (`id_asesor`);
CREATE INDEX IF NOT EXISTS `usuarios_rel_admin__idx_usuarios_rel_admin_admin` ON `usuarios_rel_admin` (`id_admin`);

-- Table: ventas_clientes
DROP TABLE IF EXISTS `ventas_clientes`;
CREATE TABLE `ventas_clientes` (
  `id_cliente` INTEGER PRIMARY KEY AUTOINCREMENT,
  `nombre_empresa` TEXT NOT NULL,
  `razon_social` TEXT DEFAULT NULL,
  `ciudad` TEXT DEFAULT NULL,
  `estado` TEXT DEFAULT NULL,
  `ubicacion` TEXT DEFAULT NULL,
  `nombre_contacto` TEXT DEFAULT NULL,
  `puesto_contacto` TEXT DEFAULT NULL,
  `email` TEXT DEFAULT NULL,
  `telefono` TEXT DEFAULT NULL,
  `tipo_cliente` TEXT DEFAULT NULL,
  `estatus_cliente` TEXT DEFAULT NULL,
  `proyecto_vendido` TEXT DEFAULT NULL,
  `iniciales` TEXT DEFAULT NULL,
  `visualiza` TEXT DEFAULT NULL,
  `comentarios` TEXT,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` INTEGER DEFAULT NULL,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` INTEGER DEFAULT NULL,
  FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS `ventas_clientes__idx_ventas_clientes_nombre_empresa` ON `ventas_clientes` (`nombre_empresa`);
CREATE INDEX IF NOT EXISTS `ventas_clientes__idx_ventas_clientes_razon_social` ON `ventas_clientes` (`razon_social`);
CREATE INDEX IF NOT EXISTS `ventas_clientes__idx_ventas_clientes_nombre_contacto` ON `ventas_clientes` (`nombre_contacto`);
CREATE INDEX IF NOT EXISTS `ventas_clientes__idx_ventas_clientes_email` ON `ventas_clientes` (`email`);
CREATE INDEX IF NOT EXISTS `ventas_clientes__idx_ventas_clientes_tipo_cliente` ON `ventas_clientes` (`tipo_cliente`);
CREATE INDEX IF NOT EXISTS `ventas_clientes__idx_ventas_clientes_estatus_cliente` ON `ventas_clientes` (`estatus_cliente`);
CREATE INDEX IF NOT EXISTS `ventas_clientes__idx_ventas_clientes_iniciales` ON `ventas_clientes` (`iniciales`);
CREATE INDEX IF NOT EXISTS `ventas_clientes__idx_ventas_clientes_ciudad_estado` ON `ventas_clientes` (`ciudad`,`estado`);
CREATE INDEX IF NOT EXISTS `ventas_clientes__idx_ventas_clientes_activo` ON `ventas_clientes` (`activo`);
CREATE INDEX IF NOT EXISTS `ventas_clientes__idx_ventas_clientes_created_by` ON `ventas_clientes` (`created_by`);
CREATE INDEX IF NOT EXISTS `ventas_clientes__idx_ventas_clientes_updated_by` ON `ventas_clientes` (`updated_by`);

-- Table: ventas_clientes_contactos
DROP TABLE IF EXISTS `ventas_clientes_contactos`;
CREATE TABLE `ventas_clientes_contactos` (
  `id_contacto` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_cliente` INTEGER NOT NULL,
  `nombre_contacto` TEXT NOT NULL,
  `puesto_contacto` TEXT DEFAULT NULL,
  `email` TEXT DEFAULT NULL,
  `telefono` TEXT DEFAULT NULL,
  `contacto_principal` INTEGER NOT NULL DEFAULT '0',
  `activo` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` INTEGER DEFAULT NULL,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` INTEGER DEFAULT NULL,
  FOREIGN KEY (`id_cliente`) REFERENCES `ventas_clientes` (`id_cliente`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS `ventas_clientes_contactos__idx_vcc_cliente_activo` ON `ventas_clientes_contactos` (`id_cliente`,`activo`);
CREATE INDEX IF NOT EXISTS `ventas_clientes_contactos__idx_vcc_nombre` ON `ventas_clientes_contactos` (`nombre_contacto`);
CREATE INDEX IF NOT EXISTS `ventas_clientes_contactos__idx_vcc_email` ON `ventas_clientes_contactos` (`email`);
CREATE INDEX IF NOT EXISTS `ventas_clientes_contactos__idx_vcc_created_by` ON `ventas_clientes_contactos` (`created_by`);
CREATE INDEX IF NOT EXISTS `ventas_clientes_contactos__idx_vcc_updated_by` ON `ventas_clientes_contactos` (`updated_by`);

-- Table: ventas_cotizaciones_archivos
DROP TABLE IF EXISTS `ventas_cotizaciones_archivos`;
CREATE TABLE `ventas_cotizaciones_archivos` (
  `id_archivo` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_cotizacion` INTEGER NOT NULL,
  `id_comentario` INTEGER DEFAULT NULL,
  `id_usuario` INTEGER NOT NULL,
  `nombre_archivo` TEXT NOT NULL,
  `nombre_original` TEXT DEFAULT NULL,
  `extension` TEXT DEFAULT NULL,
  `mime_type` TEXT DEFAULT NULL,
  `tamanio_bytes` INTEGER DEFAULT NULL,
  `storage_provider` TEXT DEFAULT NULL,
  `storage_url` TEXT,
  `storage_container` TEXT DEFAULT NULL,
  `storage_blob_name` TEXT DEFAULT NULL,
  `thumbnail_url` TEXT,
  `drive_file_id` TEXT DEFAULT NULL,
  `drive_folder_id` TEXT DEFAULT NULL,
  `drive_url` TEXT,
  `tipo_archivo` TEXT DEFAULT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `version_numero` INTEGER NOT NULL DEFAULT '1',
  `id_archivo_anterior` INTEGER DEFAULT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_archivo_anterior`) REFERENCES `ventas_cotizaciones_archivos` (`id_archivo`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`id_comentario`) REFERENCES `ventas_cotizaciones_comentarios` (`id_comentario`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`id_cotizacion`) REFERENCES `ventas_cotizaciones_cor` (`id_cotizacion`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_SB`) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS `ventas_cotizaciones_archivos__uq_vca_drive_file` ON `ventas_cotizaciones_archivos` (`drive_file_id`);
CREATE INDEX IF NOT EXISTS `ventas_cotizaciones_archivos__idx_vca_cotizacion` ON `ventas_cotizaciones_archivos` (`id_cotizacion`,`activo`,`created_at`);
CREATE INDEX IF NOT EXISTS `ventas_cotizaciones_archivos__idx_vca_comentario` ON `ventas_cotizaciones_archivos` (`id_comentario`);
CREATE INDEX IF NOT EXISTS `ventas_cotizaciones_archivos__idx_vca_usuario` ON `ventas_cotizaciones_archivos` (`id_usuario`);
CREATE INDEX IF NOT EXISTS `ventas_cotizaciones_archivos__idx_vca_tipo` ON `ventas_cotizaciones_archivos` (`tipo_archivo`);
CREATE INDEX IF NOT EXISTS `ventas_cotizaciones_archivos__idx_vca_version_anterior` ON `ventas_cotizaciones_archivos` (`id_archivo_anterior`);

-- Table: ventas_cotizaciones_comentarios
DROP TABLE IF EXISTS `ventas_cotizaciones_comentarios`;
CREATE TABLE `ventas_cotizaciones_comentarios` (
  `id_comentario` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_cotizacion` INTEGER NOT NULL,
  `id_usuario` INTEGER NOT NULL,
  `comentario` TEXT NOT NULL,
  `id_comentario_padre` INTEGER DEFAULT NULL,
  `editado` INTEGER NOT NULL DEFAULT '0',
  `activo` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_cotizacion`) REFERENCES `ventas_cotizaciones_cor` (`id_cotizacion`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`id_comentario_padre`) REFERENCES `ventas_cotizaciones_comentarios` (`id_comentario`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_SB`) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS `ventas_cotizaciones_comentarios__idx_vcc_cotizacion` ON `ventas_cotizaciones_comentarios` (`id_cotizacion`,`activo`,`created_at`);
CREATE INDEX IF NOT EXISTS `ventas_cotizaciones_comentarios__idx_vcc_usuario` ON `ventas_cotizaciones_comentarios` (`id_usuario`);
CREATE INDEX IF NOT EXISTS `ventas_cotizaciones_comentarios__idx_vcc_padre` ON `ventas_cotizaciones_comentarios` (`id_comentario_padre`);

-- Table: ventas_cotizaciones_cor
DROP TABLE IF EXISTS `ventas_cotizaciones_cor`;
CREATE TABLE `ventas_cotizaciones_cor` (
  `id_cotizacion` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_cot_origen` INTEGER DEFAULT NULL,
  `nombre_proyecto` TEXT NOT NULL,
  `id_cliente` INTEGER DEFAULT NULL,
  `id_contacto` INTEGER DEFAULT NULL,
  `cliente` TEXT NOT NULL,
  `contacto` TEXT DEFAULT NULL,
  `telefono` TEXT DEFAULT NULL,
  `correo` TEXT DEFAULT NULL,
  `ciudad` TEXT DEFAULT NULL,
  `estado` TEXT DEFAULT NULL,
  `tipo_proyecto` TEXT DEFAULT NULL,
  `numero_equipos` INTEGER NOT NULL DEFAULT '0',
  `tipo_equipos` TEXT DEFAULT NULL,
  `informacion_envia` TEXT DEFAULT NULL,
  `asesor` TEXT DEFAULT NULL,
  `id_asesor` INTEGER DEFAULT NULL,
  `visualiza` TEXT DEFAULT NULL,
  `anio_mes_cotizacion` TEXT DEFAULT NULL,
  `mx` TEXT DEFAULT NULL,
  `fecha_cotizacion` TEXT DEFAULT NULL,
  `fecha_solicitud` TEXT DEFAULT NULL,
  `zona` TEXT DEFAULT NULL,
  `estatus_proyecto` TEXT DEFAULT NULL,
  `razon_perdido` TEXT DEFAULT NULL,
  `admin` TEXT DEFAULT NULL,
  `id_admin` INTEGER DEFAULT NULL,
  `fecha_cambio_estatus` TEXT DEFAULT NULL,
  `fecha_cierre` TEXT DEFAULT NULL,
  `comentario` TEXT,
  `empresa_vs_perdido` TEXT DEFAULT NULL,
  `id_equipo_vendido` TEXT DEFAULT NULL,
  `anio_actual` INTEGER DEFAULT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` INTEGER DEFAULT NULL,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` INTEGER DEFAULT NULL,
  FOREIGN KEY (`id_admin`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`id_asesor`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`id_cliente`) REFERENCES `ventas_clientes` (`id_cliente`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`id_contacto`) REFERENCES `ventas_clientes_contactos` (`id_contacto`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  CHECK ((`numero_equipos` >= 0))
);
CREATE UNIQUE INDEX IF NOT EXISTS `ventas_cotizaciones_cor__uq_ventas_cotizaciones_id_cot_origen` ON `ventas_cotizaciones_cor` (`id_cot_origen`);
CREATE INDEX IF NOT EXISTS `ventas_cotizaciones_cor__idx_ventas_cotizaciones_estatus` ON `ventas_cotizaciones_cor` (`estatus_proyecto`);
CREATE INDEX IF NOT EXISTS `ventas_cotizaciones_cor__idx_ventas_cotizaciones_id_asesor` ON `ventas_cotizaciones_cor` (`id_asesor`);
CREATE INDEX IF NOT EXISTS `ventas_cotizaciones_cor__idx_ventas_cotizaciones_id_admin` ON `ventas_cotizaciones_cor` (`id_admin`);
CREATE INDEX IF NOT EXISTS `ventas_cotizaciones_cor__idx_ventas_cotizaciones_cliente` ON `ventas_cotizaciones_cor` (`cliente`);
CREATE INDEX IF NOT EXISTS `ventas_cotizaciones_cor__idx_ventas_cotizaciones_zona` ON `ventas_cotizaciones_cor` (`zona`);
CREATE INDEX IF NOT EXISTS `ventas_cotizaciones_cor__idx_ventas_cotizaciones_fecha_cotizacion` ON `ventas_cotizaciones_cor` (`fecha_cotizacion`);
CREATE INDEX IF NOT EXISTS `ventas_cotizaciones_cor__idx_ventas_cotizaciones_fecha_solicitud` ON `ventas_cotizaciones_cor` (`fecha_solicitud`);
CREATE INDEX IF NOT EXISTS `ventas_cotizaciones_cor__idx_ventas_cotizaciones_fecha_cierre` ON `ventas_cotizaciones_cor` (`fecha_cierre`);
CREATE INDEX IF NOT EXISTS `ventas_cotizaciones_cor__idx_ventas_cotizaciones_fecha_cambio_estatus` ON `ventas_cotizaciones_cor` (`fecha_cambio_estatus`);
CREATE INDEX IF NOT EXISTS `ventas_cotizaciones_cor__idx_ventas_cotizaciones_activo` ON `ventas_cotizaciones_cor` (`activo`);
CREATE INDEX IF NOT EXISTS `ventas_cotizaciones_cor__idx_ventas_cotizaciones_estatus_cierre` ON `ventas_cotizaciones_cor` (`activo`,`estatus_proyecto`,`fecha_cierre`);
CREATE INDEX IF NOT EXISTS `ventas_cotizaciones_cor__idx_ventas_cotizaciones_estatus_cambio` ON `ventas_cotizaciones_cor` (`activo`,`estatus_proyecto`,`fecha_cambio_estatus`);
CREATE INDEX IF NOT EXISTS `ventas_cotizaciones_cor__idx_ventas_cotizaciones_created_by` ON `ventas_cotizaciones_cor` (`created_by`);
CREATE INDEX IF NOT EXISTS `ventas_cotizaciones_cor__idx_ventas_cotizaciones_updated_by` ON `ventas_cotizaciones_cor` (`updated_by`);
CREATE INDEX IF NOT EXISTS `ventas_cotizaciones_cor__idx_ventas_cotizaciones_id_cliente` ON `ventas_cotizaciones_cor` (`id_cliente`);
CREATE INDEX IF NOT EXISTS `ventas_cotizaciones_cor__idx_ventas_cotizaciones_id_contacto` ON `ventas_cotizaciones_cor` (`id_contacto`);

-- Table: ventas_cotizaciones_equipos_cor
DROP TABLE IF EXISTS `ventas_cotizaciones_equipos_cor`;
CREATE TABLE `ventas_cotizaciones_equipos_cor` (
  `id_cotizacion_equipo` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_cotizacion` INTEGER NOT NULL,
  `tipo_equipo` TEXT NOT NULL,
  `cantidad` INTEGER NOT NULL,
  `orden` INTEGER NOT NULL DEFAULT '1',
  `activo` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_cotizacion`) REFERENCES `ventas_cotizaciones_cor` (`id_cotizacion`) ON DELETE CASCADE ON UPDATE CASCADE,
  CHECK ((`cantidad` > 0)),
  CHECK ((`orden` between 1 and 5))
);
CREATE UNIQUE INDEX IF NOT EXISTS `ventas_cotizaciones_equipos_cor__uq_cotizacion_tipo_equipo` ON `ventas_cotizaciones_equipos_cor` (`id_cotizacion`,`tipo_equipo`);
CREATE INDEX IF NOT EXISTS `ventas_cotizaciones_equipos_cor__idx_cotizacion_equipos_cotizacion` ON `ventas_cotizaciones_equipos_cor` (`id_cotizacion`);
CREATE INDEX IF NOT EXISTS `ventas_cotizaciones_equipos_cor__idx_cotizacion_equipos_activo` ON `ventas_cotizaciones_equipos_cor` (`activo`);

-- Table: ventas_cotizaciones_historial
DROP TABLE IF EXISTS `ventas_cotizaciones_historial`;
CREATE TABLE `ventas_cotizaciones_historial` (
  `id_historial` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_cotizacion` INTEGER NOT NULL,
  `estatus_anterior` TEXT DEFAULT NULL,
  `estatus_nuevo` TEXT NOT NULL,
  `fecha_movimiento` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `motivo` TEXT DEFAULT NULL,
  `comentario` TEXT,
  `campo_origen` TEXT DEFAULT NULL,
  `valor_anterior` TEXT,
  `valor_nuevo` TEXT,
  `id_usuario` INTEGER DEFAULT NULL,
  `iniciales_usuario` TEXT DEFAULT NULL,
  `origen_movimiento` TEXT NOT NULL DEFAULT 'CAMBIO_ESTATUS',
  `empresa` TEXT DEFAULT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_cotizacion`) REFERENCES `ventas_cotizaciones_cor` (`id_cotizacion`),
  FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_SB`)
);
CREATE INDEX IF NOT EXISTS `ventas_cotizaciones_historial__idx_vch_cotizacion` ON `ventas_cotizaciones_historial` (`id_cotizacion`);
CREATE INDEX IF NOT EXISTS `ventas_cotizaciones_historial__idx_vch_fecha` ON `ventas_cotizaciones_historial` (`fecha_movimiento`);
CREATE INDEX IF NOT EXISTS `ventas_cotizaciones_historial__idx_vch_estatus_nuevo` ON `ventas_cotizaciones_historial` (`estatus_nuevo`);
CREATE INDEX IF NOT EXISTS `ventas_cotizaciones_historial__idx_vch_usuario` ON `ventas_cotizaciones_historial` (`id_usuario`);
CREATE INDEX IF NOT EXISTS `ventas_cotizaciones_historial__idx_vch_empresa` ON `ventas_cotizaciones_historial` (`empresa`);

-- Table: ventas_prospeccion_archivos
DROP TABLE IF EXISTS `ventas_prospeccion_archivos`;
CREATE TABLE `ventas_prospeccion_archivos` (
  `id_archivo` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_pros` INTEGER NOT NULL,
  `id_com_pors` INTEGER DEFAULT NULL,
  `tipo_relacion` TEXT NOT NULL,
  `nombre_archivo` TEXT NOT NULL,
  `nombre_original` TEXT DEFAULT NULL,
  `mime_type` TEXT DEFAULT NULL,
  `extension` TEXT DEFAULT NULL,
  `tamano_bytes` INTEGER DEFAULT NULL,
  `storage_provider` TEXT NOT NULL DEFAULT 'GLIDE',
  `storage_url` TEXT NOT NULL,
  `storage_container` TEXT DEFAULT NULL,
  `storage_blob_name` TEXT DEFAULT NULL,
  `thumbnail_url` TEXT,
  `orden` INTEGER NOT NULL DEFAULT '1',
  `es_imagen` INTEGER NOT NULL DEFAULT '0',
  `activo` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_com_pors`) REFERENCES `ventas_prospeccion_comentarios` (`id_com_pors`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`id_pros`) REFERENCES `ventas_prospecciones` (`id_pros`) ON DELETE CASCADE ON UPDATE CASCADE,
  CHECK ((`activo` in (0,1))),
  CHECK ((`es_imagen` in (0,1)))
);
CREATE INDEX IF NOT EXISTS `ventas_prospeccion_archivos__idx_ventas_prospeccion_archivos_prospeccion` ON `ventas_prospeccion_archivos` (`id_pros`);
CREATE INDEX IF NOT EXISTS `ventas_prospeccion_archivos__idx_ventas_prospeccion_archivos_comentario` ON `ventas_prospeccion_archivos` (`id_com_pors`);
CREATE INDEX IF NOT EXISTS `ventas_prospeccion_archivos__idx_ventas_prospeccion_archivos_tipo` ON `ventas_prospeccion_archivos` (`tipo_relacion`);
CREATE INDEX IF NOT EXISTS `ventas_prospeccion_archivos__idx_ventas_prospeccion_archivos_lista` ON `ventas_prospeccion_archivos` (`id_pros`,`tipo_relacion`,`activo`,`orden`);

-- Table: ventas_prospeccion_comentarios
DROP TABLE IF EXISTS `ventas_prospeccion_comentarios`;
CREATE TABLE `ventas_prospeccion_comentarios` (
  `id_com_pors` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_pros` INTEGER NOT NULL,
  `id_usuario` INTEGER NOT NULL,
  `comentario` TEXT NOT NULL,
  `fecha_hora` TEXT DEFAULT NULL,
  `editado` INTEGER NOT NULL DEFAULT '0',
  `activo` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_pros`) REFERENCES `ventas_prospecciones` (`id_pros`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_SB`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CHECK ((`activo` in (0,1))),
  CHECK ((`editado` in (0,1)))
);
CREATE INDEX IF NOT EXISTS `ventas_prospeccion_comentarios__idx_ventas_prospeccion_comentarios_prospeccion` ON `ventas_prospeccion_comentarios` (`id_pros`);
CREATE INDEX IF NOT EXISTS `ventas_prospeccion_comentarios__idx_ventas_prospeccion_comentarios_usuario` ON `ventas_prospeccion_comentarios` (`id_usuario`);
CREATE INDEX IF NOT EXISTS `ventas_prospeccion_comentarios__idx_ventas_prospeccion_comentarios_fecha` ON `ventas_prospeccion_comentarios` (`fecha_hora`);
CREATE INDEX IF NOT EXISTS `ventas_prospeccion_comentarios__idx_ventas_prospeccion_comentarios_lista` ON `ventas_prospeccion_comentarios` (`id_pros`,`activo`,`fecha_hora`,`created_at`);

-- Table: ventas_prospeccion_estatus
DROP TABLE IF EXISTS `ventas_prospeccion_estatus`;
CREATE TABLE `ventas_prospeccion_estatus` (
  `id_estatus` INTEGER PRIMARY KEY AUTOINCREMENT,
  `codigo` TEXT NOT NULL,
  `nombre` TEXT NOT NULL,
  `orden` INTEGER NOT NULL DEFAULT '0',
  `es_cierre` INTEGER NOT NULL DEFAULT '0',
  `es_descartado` INTEGER NOT NULL DEFAULT '0',
  `activo` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS `ventas_prospeccion_estatus__uq_ventas_prospeccion_estatus_codigo` ON `ventas_prospeccion_estatus` (`codigo`);
CREATE UNIQUE INDEX IF NOT EXISTS `ventas_prospeccion_estatus__uq_ventas_prospeccion_estatus_nombre` ON `ventas_prospeccion_estatus` (`nombre`);
CREATE INDEX IF NOT EXISTS `ventas_prospeccion_estatus__idx_ventas_prospeccion_estatus_activo_orden` ON `ventas_prospeccion_estatus` (`activo`,`orden`);

-- Table: ventas_prospecciones
DROP TABLE IF EXISTS `ventas_prospecciones`;
CREATE TABLE `ventas_prospecciones` (
  `id_pros` INTEGER PRIMARY KEY AUTOINCREMENT,
  `empresa` TEXT DEFAULT NULL,
  `proyecto` TEXT DEFAULT NULL,
  `ubicacion` TEXT DEFAULT NULL,
  `latitud` REAL DEFAULT NULL,
  `longitud` REAL DEFAULT NULL,
  `contacto` TEXT DEFAULT NULL,
  `puesto_contacto` TEXT DEFAULT NULL,
  `correo` TEXT DEFAULT NULL,
  `telefono` TEXT DEFAULT NULL,
  `comentario` TEXT,
  `id_usuario` INTEGER NOT NULL,
  `ciudad` TEXT DEFAULT NULL,
  `estado` TEXT DEFAULT NULL,
  `tipo_proyecto` TEXT DEFAULT NULL,
  `fecha_visita` TEXT DEFAULT NULL,
  `id_estatus` INTEGER DEFAULT NULL,
  `estatus` TEXT DEFAULT NULL,
  `fecha_cam_estatus` TEXT DEFAULT NULL,
  `nuevo` INTEGER NOT NULL DEFAULT '1',
  `proyecto_activo` INTEGER NOT NULL DEFAULT '0',
  `proyecto_cotizado` INTEGER NOT NULL DEFAULT '0',
  `id_proyecto_instalacion` TEXT DEFAULT NULL,
  `id_cotizacion` INTEGER DEFAULT NULL,
  `id_cliente` INTEGER DEFAULT NULL,
  `id_contacto` INTEGER DEFAULT NULL,
  `activo` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_estatus`) REFERENCES `ventas_prospeccion_estatus` (`id_estatus`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_SB`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`id_cliente`) REFERENCES `ventas_clientes` (`id_cliente`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`id_contacto`) REFERENCES `ventas_clientes_contactos` (`id_contacto`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`id_cotizacion`) REFERENCES `ventas_cotizaciones_cor` (`id_cotizacion`) ON DELETE SET NULL ON UPDATE CASCADE,
  CHECK ((`activo` in (0,1))),
  CHECK ((((`nuevo` + `proyecto_activo`) + `proyecto_cotizado`) = 1)),
  CHECK ((`nuevo` in (0,1))),
  CHECK ((`proyecto_activo` in (0,1))),
  CHECK ((`proyecto_cotizado` in (0,1)))
);
CREATE INDEX IF NOT EXISTS `ventas_prospecciones__idx_ventas_prospecciones_usuario` ON `ventas_prospecciones` (`id_usuario`);
CREATE INDEX IF NOT EXISTS `ventas_prospecciones__idx_ventas_prospecciones_estatus` ON `ventas_prospecciones` (`id_estatus`);
CREATE INDEX IF NOT EXISTS `ventas_prospecciones__idx_ventas_prospecciones_fecha_visita` ON `ventas_prospecciones` (`fecha_visita`);
CREATE INDEX IF NOT EXISTS `ventas_prospecciones__idx_ventas_prospecciones_estado` ON `ventas_prospecciones` (`estado`);
CREATE INDEX IF NOT EXISTS `ventas_prospecciones__idx_ventas_prospecciones_ciudad` ON `ventas_prospecciones` (`ciudad`);
CREATE INDEX IF NOT EXISTS `ventas_prospecciones__idx_ventas_prospecciones_activo` ON `ventas_prospecciones` (`activo`);
CREATE INDEX IF NOT EXISTS `ventas_prospecciones__idx_ventas_prospecciones_mapa` ON `ventas_prospecciones` (`activo`,`latitud`,`longitud`);
CREATE INDEX IF NOT EXISTS `ventas_prospecciones__idx_ventas_prospecciones_clasificacion` ON `ventas_prospecciones` (`nuevo`,`proyecto_activo`,`proyecto_cotizado`);
CREATE INDEX IF NOT EXISTS `ventas_prospecciones__idx_ventas_prospecciones_usuario_fecha` ON `ventas_prospecciones` (`id_usuario`,`fecha_visita`);
CREATE INDEX IF NOT EXISTS `ventas_prospecciones__idx_vp_proyecto_instalacion` ON `ventas_prospecciones` (`id_proyecto_instalacion`);
CREATE INDEX IF NOT EXISTS `ventas_prospecciones__idx_vp_cotizacion` ON `ventas_prospecciones` (`id_cotizacion`);
CREATE INDEX IF NOT EXISTS `ventas_prospecciones__idx_vp_cliente` ON `ventas_prospecciones` (`id_cliente`);
CREATE INDEX IF NOT EXISTS `ventas_prospecciones__idx_vp_contacto` ON `ventas_prospecciones` (`id_contacto`);

-- Table: ventas_redes
DROP TABLE IF EXISTS `ventas_redes`;
CREATE TABLE `ventas_redes` (
  `id_redes` INTEGER PRIMARY KEY AUTOINCREMENT,
  `nombre_contacto` TEXT DEFAULT NULL,
  `id_contacto_via` INTEGER DEFAULT NULL,
  `email` TEXT DEFAULT NULL,
  `telefono` TEXT DEFAULT NULL,
  `id_estado` INTEGER DEFAULT NULL,
  `nombre_empresa` TEXT DEFAULT NULL,
  `ciudad` TEXT DEFAULT NULL,
  `nombre_proyecto` TEXT DEFAULT NULL,
  `informacion_enviada` TEXT,
  `id_solicitud` INTEGER DEFAULT NULL,
  `id_usuario_asignado` INTEGER DEFAULT NULL,
  `created_by` INTEGER DEFAULT NULL,
  `id_estatus` INTEGER DEFAULT NULL,
  `fecha_cambio_estatus` TEXT DEFAULT NULL,
  `id_cotizacion` INTEGER DEFAULT NULL,
  `activo` INTEGER DEFAULT '1',
  `created_at` TEXT DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT DEFAULT CURRENT_TIMESTAMP,
  `updated_by` INTEGER DEFAULT NULL,
  FOREIGN KEY (`id_contacto_via`) REFERENCES `catalogo_general` (`id_catalogo`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`id_cotizacion`) REFERENCES `ventas_cotizaciones_cor` (`id_cotizacion`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`id_estado`) REFERENCES `catalogo_general` (`id_catalogo`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`id_estatus`) REFERENCES `catalogo_general` (`id_catalogo`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`id_solicitud`) REFERENCES `catalogo_general` (`id_catalogo`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`id_usuario_asignado`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  CHECK (((`activo` is null) or (`activo` in (0,1))))
);
CREATE INDEX IF NOT EXISTS `ventas_redes__idx_ventas_redes_contacto_via` ON `ventas_redes` (`id_contacto_via`);
CREATE INDEX IF NOT EXISTS `ventas_redes__idx_ventas_redes_estado` ON `ventas_redes` (`id_estado`);
CREATE INDEX IF NOT EXISTS `ventas_redes__idx_ventas_redes_solicitud` ON `ventas_redes` (`id_solicitud`);
CREATE INDEX IF NOT EXISTS `ventas_redes__idx_ventas_redes_usuario_asignado` ON `ventas_redes` (`id_usuario_asignado`);
CREATE INDEX IF NOT EXISTS `ventas_redes__idx_ventas_redes_created_by` ON `ventas_redes` (`created_by`);
CREATE INDEX IF NOT EXISTS `ventas_redes__idx_ventas_redes_updated_by` ON `ventas_redes` (`updated_by`);
CREATE INDEX IF NOT EXISTS `ventas_redes__idx_ventas_redes_estatus` ON `ventas_redes` (`id_estatus`);
CREATE INDEX IF NOT EXISTS `ventas_redes__idx_ventas_redes_cotizacion` ON `ventas_redes` (`id_cotizacion`);
CREATE INDEX IF NOT EXISTS `ventas_redes__idx_ventas_redes_activo` ON `ventas_redes` (`activo`);
CREATE INDEX IF NOT EXISTS `ventas_redes__idx_ventas_redes_fecha_cambio_estatus` ON `ventas_redes` (`fecha_cambio_estatus`);
CREATE INDEX IF NOT EXISTS `ventas_redes__idx_ventas_redes_lista` ON `ventas_redes` (`activo`,`id_estatus`,`id_usuario_asignado`,`created_at`);

-- Table: ventas_redes_archivos
DROP TABLE IF EXISTS `ventas_redes_archivos`;
CREATE TABLE `ventas_redes_archivos` (
  `id_archivo` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_redes` INTEGER DEFAULT NULL,
  `orden_archivo` INTEGER DEFAULT NULL,
  `nombre_archivo` TEXT DEFAULT NULL,
  `nombre_original` TEXT DEFAULT NULL,
  `extension` TEXT DEFAULT NULL,
  `mime_type` TEXT DEFAULT NULL,
  `tamanio_bytes` INTEGER DEFAULT NULL,
  `storage_provider` TEXT DEFAULT NULL,
  `storage_url` TEXT DEFAULT NULL,
  `storage_container` TEXT DEFAULT NULL,
  `storage_blob_name` TEXT DEFAULT NULL,
  `tipo_archivo` TEXT DEFAULT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `id_usuario` INTEGER DEFAULT NULL,
  `activo` INTEGER DEFAULT '1',
  `created_at` TEXT DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_redes`) REFERENCES `ventas_redes` (`id_redes`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  CHECK (((`activo` is null) or (`activo` in (0,1)))),
  CHECK (((`orden_archivo` is null) or (`orden_archivo` in (1,2))))
);
CREATE UNIQUE INDEX IF NOT EXISTS `ventas_redes_archivos__uq_ventas_redes_archivo_orden` ON `ventas_redes_archivos` (`id_redes`,`orden_archivo`);
CREATE INDEX IF NOT EXISTS `ventas_redes_archivos__idx_ventas_redes_archivos_redes` ON `ventas_redes_archivos` (`id_redes`);
CREATE INDEX IF NOT EXISTS `ventas_redes_archivos__idx_ventas_redes_archivos_usuario` ON `ventas_redes_archivos` (`id_usuario`);
CREATE INDEX IF NOT EXISTS `ventas_redes_archivos__idx_ventas_redes_archivos_activo` ON `ventas_redes_archivos` (`activo`);
CREATE INDEX IF NOT EXISTS `ventas_redes_archivos__idx_ventas_redes_archivos_storage` ON `ventas_redes_archivos` (`storage_provider`,`storage_blob_name`);

-- Table: ventas_redes_comentarios
DROP TABLE IF EXISTS `ventas_redes_comentarios`;
CREATE TABLE `ventas_redes_comentarios` (
  `id_comentario` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_redes` INTEGER DEFAULT NULL,
  `id_usuario` INTEGER DEFAULT NULL,
  `comentario` TEXT,
  `tipo_evento` TEXT NOT NULL DEFAULT 'COMENTARIO',
  `campo` TEXT DEFAULT NULL,
  `valor_anterior` TEXT DEFAULT NULL,
  `valor_nuevo` TEXT DEFAULT NULL,
  `fecha_hora` TEXT DEFAULT CURRENT_TIMESTAMP,
  `editado` INTEGER DEFAULT '0',
  `activo` INTEGER DEFAULT '1',
  `created_at` TEXT DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_redes`) REFERENCES `ventas_redes` (`id_redes`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  CHECK (((`activo` is null) or (`activo` in (0,1)))),
  CHECK (((`editado` is null) or (`editado` in (0,1))))
);
CREATE INDEX IF NOT EXISTS `ventas_redes_comentarios__idx_ventas_redes_comentarios_redes` ON `ventas_redes_comentarios` (`id_redes`);
CREATE INDEX IF NOT EXISTS `ventas_redes_comentarios__idx_ventas_redes_comentarios_usuario` ON `ventas_redes_comentarios` (`id_usuario`);
CREATE INDEX IF NOT EXISTS `ventas_redes_comentarios__idx_ventas_redes_comentarios_fecha` ON `ventas_redes_comentarios` (`fecha_hora`);
CREATE INDEX IF NOT EXISTS `ventas_redes_comentarios__idx_ventas_redes_comentarios_lista` ON `ventas_redes_comentarios` (`id_redes`,`activo`,`fecha_hora`,`created_at`);
CREATE INDEX IF NOT EXISTS `ventas_redes_comentarios__idx_ventas_redes_evento_fecha` ON `ventas_redes_comentarios` (`id_redes`,`tipo_evento`,`fecha_hora`);

-- Table: ventas_redes_comentarios_adjuntos
DROP TABLE IF EXISTS `ventas_redes_comentarios_adjuntos`;
CREATE TABLE `ventas_redes_comentarios_adjuntos` (
  `id_adjunto` INTEGER PRIMARY KEY AUTOINCREMENT,
  `id_comentario` INTEGER DEFAULT NULL,
  `nombre_archivo` TEXT DEFAULT NULL,
  `nombre_original` TEXT DEFAULT NULL,
  `extension` TEXT DEFAULT NULL,
  `mime_type` TEXT DEFAULT NULL,
  `tamanio_bytes` INTEGER DEFAULT NULL,
  `storage_provider` TEXT DEFAULT NULL,
  `storage_url` TEXT DEFAULT NULL,
  `storage_container` TEXT DEFAULT NULL,
  `storage_blob_name` TEXT DEFAULT NULL,
  `tipo_archivo` TEXT DEFAULT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `id_usuario` INTEGER DEFAULT NULL,
  `activo` INTEGER DEFAULT '1',
  `created_at` TEXT DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_comentario`) REFERENCES `ventas_redes_comentarios` (`id_comentario`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_SB`) ON DELETE SET NULL ON UPDATE CASCADE,
  CHECK (((`activo` is null) or (`activo` in (0,1))))
);
CREATE INDEX IF NOT EXISTS `ventas_redes_comentarios_adjuntos__idx_ventas_redes_adjuntos_comentario` ON `ventas_redes_comentarios_adjuntos` (`id_comentario`);
CREATE INDEX IF NOT EXISTS `ventas_redes_comentarios_adjuntos__idx_ventas_redes_adjuntos_usuario` ON `ventas_redes_comentarios_adjuntos` (`id_usuario`);
CREATE INDEX IF NOT EXISTS `ventas_redes_comentarios_adjuntos__idx_ventas_redes_adjuntos_activo` ON `ventas_redes_comentarios_adjuntos` (`activo`);
CREATE INDEX IF NOT EXISTS `ventas_redes_comentarios_adjuntos__idx_ventas_redes_adjuntos_storage` ON `ventas_redes_comentarios_adjuntos` (`storage_provider`,`storage_blob_name`);

-- Table: z_op
DROP TABLE IF EXISTS `z_op`;
CREATE TABLE `z_op` (
  `id_zona` INTEGER PRIMARY KEY AUTOINCREMENT,
  `zona` TEXT NOT NULL,
  `nombre` TEXT NOT NULL,
  `estado` INTEGER NOT NULL DEFAULT '1',
  `created_at` TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` TEXT DEFAULT NULL,
  `updated_at` TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` TEXT DEFAULT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS `z_op__id_zona_UNIQUE` ON `z_op` (`id_zona`);
CREATE UNIQUE INDEX IF NOT EXISTS `z_op__zona_UNIQUE` ON `z_op` (`zona`);

PRAGMA user_version = 1;
PRAGMA foreign_keys = ON;

-- Tables converted: 93
