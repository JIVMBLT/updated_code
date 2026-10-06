# Integración INT-8 — Instalaciones · ContactosYEnvioBitacora · v001

## Número y versión de integración
INT-8, v001 (primera versión).

## Base
Repositorio `JIVMBLT/updated_code`, rama `main`. Base vigente al iniciar: `53606ef` (posterior a INT-4 a INT-7). Se renumeró la migración propia a 017 porque 014–016 ya estaban ocupadas por integraciones previas.

## Objetivo solicitado
1. Mostrar los contactos del proyecto dentro del resumen de proyecto de Instalaciones (la ficha con "Información general", "Gestor de la carpeta" y "Bitácora de Obra").
2. Desde la Bitácora, poder enviar un documento por correo a los contactos de 1 o varias categorías de ese proyecto. Acordado con el usuario: el envío se **simula** en el LAB (no hay servidor de correo real).

## Comportamiento anterior
- La ficha de proyecto (`openUnifiedClientProject` en `core/details.js`) consumía `/api/ins-fl` y `/api/instalaciones/bitacora/:id`, rutas que no existían en el Backend LAB, y exigía el permiso `INSTALACIONES_PROYECTOS_DETALLE_PROYECTO_BITACORA.VER`, ausente del catálogo LAB. En LAB la bitácora no podía mostrarse.
- No había contactos en la ficha ni forma de enviar documentos.

## Comportamiento final
- La ficha incluye la sección "Contactos del proyecto", agrupada por categoría (nombre, puesto, correo, teléfono).
- La tabla de Bitácora agrega la columna "Correo" con el botón "✉ Enviar" por documento. Abre un modal con las 3 categorías (checkbox; se deshabilitan las que no tienen contactos con correo), muestra los destinatarios resueltos y registra el envío. Cada fila muestra fecha y número del último envío.
- El envío es simulado y lo indica en pantalla; queda registro en `instalaciones_bitacora_envios`.
- Errores controlados: sin categorías, sin contactos con correo en las categorías elegidas, documento inexistente, proyecto fuera de alcance.

## Módulos afectados
Instalaciones › Proyectos (ficha de proyecto y Bitácora de Obra). La compartición con producción no cambia: las columnas y secciones nuevas aparecen solo si la respuesta de bitácora trae `contactos`.

## Archivos modificados
- `core/details.js`
- `core/config.js`
- `index.html` (solo cache-bust de `core/details.js`)
- `lab/index.html`
- `lab/backend/services/lab-installations.service.js`
- `lab/backend/routes/lab-installations-logistics-warehouse.routes.js`
- `tests/lab_phase9_services.test.cjs` (agrega migraciones 012 y 017 a su carga)
- `tests/lab_phase10_runtime.test.cjs` (rutas 297→300; GET 177→179)
- `docs/integraciones/README.md`

## Archivos nuevos
- `lab/database/migrations/017_instalaciones_bitacora_envios.sql`
- `lab/runtime/lab-phase17-bitacora-envios-bootstrap.js`
- `tests/lab_int8_bitacora_envio.test.cjs`
- `docs/integraciones/integracion8_Instalaciones_ContactosYEnvioBitacora_v001.md`

## Archivos eliminados
Ninguno.

## Cambios de Frontend
`core/details.js`: sección de contactos, columna "Correo", botón y modal de envío, estilos. Solo se activan cuando la bitácora trae `contactos`.

## Cambios de Backend LAB
`lab-installations.service.js`: `detail()` agrega iniciales de asesor/admin, contactos del proyecto y último envío/total de envíos por documento; funciones nuevas `bitacora()` y `sendBitacoraDocument()`.

## Cambios de API
Nuevas: `POST /api/instalaciones/proyectos/:id/documentos/:idDocumento/enviar`, `GET /api/instalaciones/bitacora/:id`, `GET /api/ins-fl` (alias de lectura del listado de proyectos que ya consumía el frontend), `POST /api/instalaciones/bitacora/:id/sync` (responde 501 LAB, igual que el resto de Drive). El envío reutiliza el permiso existente de documentación de Instalaciones.

## Cambios de SQLite/SQL
Migración 017 (`user_version` 17): tabla nueva `instalaciones_bitacora_envios` (documento, proyecto, categorías, destinatarios en JSON, total, quién y cuándo) con dos índices; más filas de catálogo de permisos (IDs 9012–9014, `rol_permisos` 14955).

## Cambios de Dummy
`seed.sql` SIN CAMBIOS.

## Cambios de permisos o alcances
Permiso nuevo `INSTALACIONES_PROYECTOS_DETALLE_PROYECTO_BITACORA.VER`, concedido al rol 1 (LAB R01) en la misma migración. Alcance de proyecto: sin cambios (se sigue usando `assertProject`).

## Navegación afectada
Ninguna.

## Filtros, búsqueda o paginación afectados
La paginación de la tabla de Bitácora se conserva; solo se agrega una columna.

## Elementos expresamente no modificados
`lab-instalaciones-contactos.service.js`, módulo "Base de Datos de Contactos", `seed.sql`, Gestor de la carpeta / OAuth Google, sincronización con Drive.

## Pruebas realmente ejecutadas
- Estática: `node --check` de todos los .js tocados — PASS.
- SQLite/runtime (Node + sql.js, seed ficticio): `tests/lab_int8_bitacora_envio.test.cjs` — PASS (FK sin violaciones; permiso en catálogo y concedido a rol 1; `detail()`; 7 casos de envío: 1 categoría, varias, contacto sin correo excluido, sin categorías, sin destinatarios, documento inexistente, usuario fuera de alcance; `bitacora()`; registro de las 4 rutas).
- Batería completa `tests/lab_*.cjs` (22 archivos, sin package_guard) — PASS tras actualizar los dos tests indicados.

## Pruebas no ejecutadas
- Navegador / E2E: NO EJECUTADO. No se probó visualmente la ficha, el modal ni el envío.

## Riesgos o pendientes
- Al abrir la ficha, la sincronización automática con Drive responde 501 en LAB y la etiqueta "Última actualización" muestra ese aviso.
- "Gestor de la carpeta" sigue dependiendo de endpoints de Google/Drive que no existen en LAB; fuera del alcance de esta integración.
- Los contactos viajan en la respuesta de bitácora; la visibilidad queda ligada al permiso de detalle de proyecto.
- No se llegó a verificar con el bootstrap real en navegador que la migración 017 aplique tras la 016.

## SHA del commit final
`a54060b7ea05605d541a2ba0250e06a93606bf6f` (CLAUDE | INT-8 | Instalaciones | ContactosYEnvioBitacora | v001).

## Estado final
**COMPLETADA** en backend y código frontend; validación E2E en navegador pendiente.
