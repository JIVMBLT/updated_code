-- [Aster | 2026-09-14 | ASTER-MG-LAB | FASE 8 V002]
-- Ventas + Cobranza para Laboratorio DGB.
-- IMPORTANTE:
-- 1) No crea ni altera estructura. Reutiliza las tablas del snapshot de Fase 1.
-- 2) Los permisos siguientes son FIXTURES EXCLUSIVOS DEL LAB para poder probar
--    los contratos funcionales. NO representan ni afirman la matriz productiva.
-- 3) Las integraciones/sync productivas permanecen bloqueadas por el runtime LAB.

-- Usuarios comerciales ficticios que se usan como identidades de prueba de Ventas.
-- Se les habilitan únicamente permisos ya existentes en el catálogo F4 con prefijo VENTAS_.
INSERT INTO usuario_permisos (
  id_usuario,
  id_subelemento_accion,
  permitido,
  motivo,
  fecha_inicio,
  fecha_fin,
  activo,
  created_by,
  updated_by
)
SELECT
  u.id_SB,
  p.id_subelemento_accion,
  1,
  'LAB F8 V002 - fixture sintetico Ventas; no replica permisos productivos',
  CURRENT_TIMESTAMP,
  NULL,
  1,
  910006,
  910006
FROM usuarios u
JOIN perm_subelemento_acciones p
  ON p.activo = 1
 AND p.codigo_permiso LIKE 'VENTAS\_%' ESCAPE '\'
WHERE u.id_SB IN (910005,910006,910039,910047,910048,910050,910054)
  AND u.estado = 1
  AND NOT EXISTS (
    SELECT 1
      FROM usuario_permisos up
     WHERE up.id_usuario = u.id_SB
       AND up.id_subelemento_accion = p.id_subelemento_accion
       AND up.activo = 1
  );

-- Puerta CORELLIAN/VENTAS para identidades comerciales restringidas.
INSERT INTO usuarios_alcance_informacion (
  id_usuario,
  tipo_alcance,
  dominio,
  id_agrupacion,
  id_usuario_visible,
  activo,
  created_by,
  updated_by
)
SELECT
  u.id_SB,
  'AGRUPACION',
  NULL,
  g.id_agrupacion,
  NULL,
  1,
  910006,
  910006
FROM usuarios u
JOIN perm_agrupaciones g
  ON g.codigo = 'VENTAS'
 AND g.activo = 1
WHERE u.id_SB IN (910005,910006,910039,910047,910048,910050,910054)
  AND u.estado = 1
  AND NOT EXISTS (
    SELECT 1
      FROM usuarios_alcance_informacion ai
     WHERE ai.id_usuario = u.id_SB
       AND ai.activo = 1
       AND ai.tipo_alcance = 'AGRUPACION'
       AND ai.id_agrupacion = g.id_agrupacion
  );

-- Cobranza: se habilita solo a dos identidades maestras ficticias para QA.
-- Nuevamente, esto es un fixture LAB y no una afirmación de rol/perfil productivo.
INSERT INTO usuario_permisos (
  id_usuario,
  id_subelemento_accion,
  permitido,
  motivo,
  fecha_inicio,
  fecha_fin,
  activo,
  created_by,
  updated_by
)
SELECT
  u.id_SB,
  p.id_subelemento_accion,
  1,
  'LAB F8 V002 - fixture sintetico Cobranza; no replica permisos productivos',
  CURRENT_TIMESTAMP,
  NULL,
  1,
  910006,
  910006
FROM usuarios u
JOIN perm_subelemento_acciones p
  ON p.activo = 1
 AND p.codigo_permiso LIKE 'COBRANZA\_%' ESCAPE '\'
WHERE u.id_SB IN (910001,910006)
  AND u.estado = 1
  AND NOT EXISTS (
    SELECT 1
      FROM usuario_permisos up
     WHERE up.id_usuario = u.id_SB
       AND up.id_subelemento_accion = p.id_subelemento_accion
       AND up.activo = 1
  );


-- Normalización exclusivamente sintética del seed comercial de Fase 1.
-- El snapshot LAB relaciona estas cotizaciones con el asesor ficticio L39; se
-- alinea ventas_clientes.iniciales para que el alcance de Clientes reproduzca
-- la regla productiva por iniciales sin ampliar visibilidad por created_by.
UPDATE ventas_clientes
   SET iniciales = COALESCE((
         SELECT u.iniciales
           FROM ventas_cotizaciones_cor q
           JOIN usuarios u ON u.id_SB = q.id_asesor AND u.estado = 1
          WHERE q.activo = 1
            AND q.id_cliente = ventas_clientes.id_cliente
            AND NULLIF(TRIM(u.iniciales), '') IS NOT NULL
          ORDER BY q.id_cotizacion
          LIMIT 1
       ), iniciales),
       updated_at = CURRENT_TIMESTAMP
 WHERE id_cliente BETWEEN 960001 AND 960010
   AND activo = 1;

PRAGMA user_version = 8;
