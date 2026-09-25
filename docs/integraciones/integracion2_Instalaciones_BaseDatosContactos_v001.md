# Integración INT-2 — Instalaciones · BaseDatosContactos · v001

## Número y versión de integración
INT-2, v001 (primera versión; sin versiones previas).

## Objetivo solicitado
Nuevo módulo dentro de Instalaciones: "Base de Datos - Formato de Contactos". Una base de datos de contactos con Nombre, Puesto, Correo, Teléfono, Categoría y Proyecto (relacionando cada contacto a un proyecto real de Instalaciones). Decisiones confirmadas con el usuario antes de construir: (1) categoría es una de 3 opciones fijas — "Administración y Cobranza", "Notificaciones de Avance de Materiales, Obra y/o Instalaciones", "Comunicados Críticos"; (2) un contacto pertenece a un solo proyecto (si trabaja en varios, se captura una fila por proyecto); (3) acceso restringido, con permiso propio separado del resto de Instalaciones.

## Comportamiento anterior
No existía. Instalaciones no tenía ningún directorio de contactos; los proyectos de Instalaciones (tabla `ins_fl`) no tenían ninguna relación con personas/contactos externos.

## Comportamiento final
Nueva entrada en el sidebar de Instalaciones ("Base de Datos - Contactos") con: listado filtrable por categoría, por proyecto (combo con buscador) y por texto libre; alta y edición vía formulario modal (nombre y categoría obligatorios, proyecto obligatorio vía el mismo combo con buscador); baja lógica (desactivar) con confirmación. El selector de "Proyecto" es un combo con buscador de texto (mismo patrón de UX ya usado en Informes para los filtros), en vez de un `<select>` plano, dado que la lista de proyectos de Instalaciones puede ser larga.

## Módulos afectados
Instalaciones (nuevo submódulo). No se tocó ningún submódulo existente de Instalaciones (Dashboard, Proyectos, Concentrado Cliente, Reporte, Ajuste, PM&M, Documentación, Carpetas, Cerrados).

## Rutas exactas de archivos modificados
- `core/config.js`
- `core/module-loader.js`
- `core/router.js`
- `index.html`
- `lab/backend/routes/lab-installations-logistics-warehouse.routes.js`
- `lab/index.html`
- `tests/lab_phase10_runtime.test.cjs` (conteo de rutas: 291→296 por las 5 rutas nuevas)

## Archivos nuevos
- `lab/database/migrations/012_instalaciones_contactos.sql`
- `lab/runtime/lab-phase12-contactos-bootstrap.js`
- `lab/backend/services/lab-instalaciones-contactos.service.js`
- `modules/instalaciones-contactos/instalaciones-contactos.js`
- `modules/instalaciones-contactos/instalaciones-contactos.css`
- `docs/integraciones/integracion2_Instalaciones_BaseDatosContactos_v001.md`

## Archivos eliminados
Ninguno.

## Cambios de Frontend
Sí. Módulo nuevo completo: `modules/instalaciones-contactos/*`. `index.html`: botón de sidebar (`data-route="instalaciones-contactos"`) y contenedor de vista (`#view-instalaciones-contactos`). `core/router.js`: función `showInstalacionesContactos()` + entrada en el mapa de nombres de ruta + despacho. `core/module-loader.js`: entrada `'instalaciones-contactos'` en el registro de carga perezosa (mismo mecanismo genérico que ya usa Informes, confirmado leyendo `ensure(route)` en el propio module-loader antes de registrar la entrada).

## Cambios de Backend LAB
Sí, todo nuevo y aislado. `lab-instalaciones-contactos.service.js`: `opciones()` (categorías fijas + catálogo de proyectos desde `ins_fl`), `listar()` (con filtros de categoría/proyecto/búsqueda), `crear()`, `editar()`, `eliminar()` (baja lógica). Mismo patrón de helpers y validación que `lab-sales.service.js` (contactos de clientes en Ventas), confirmado leyendo `createContact`/`updateContact`/`removeContact` antes de escribir el servicio nuevo.

## Cambios de API
Sí. 5 rutas nuevas en `lab-installations-logistics-warehouse.routes.js`, todas bajo su propio gate de permisos (no el permiso general de Instalaciones):
- `GET /api/instalaciones/contactos/opciones`
- `GET /api/instalaciones/contactos`
- `POST /api/instalaciones/contactos`
- `PUT /api/instalaciones/contactos/:id`
- `DELETE /api/instalaciones/contactos/:id`

Ninguna ruta existente cambió de contrato.

## Cambios de SQLite/SQL
Sí. Migración `012_instalaciones_contactos.sql`: tabla nueva `instalaciones_contactos` (`id_contacto`, `nombre`, `puesto`, `correo`, `telefono`, `categoria` con `CHECK` a las 3 categorías fijas, `id_ins_fl` como FK real a `ins_fl.id_ins_fl` con `ON DELETE CASCADE`, `activo`, `created_at`/`created_by`/`updated_at`/`updated_by`), con 3 índices. No se tocó ninguna tabla existente. `PRAGMA foreign_key_check` sin violaciones tras aplicar la migración (verificado en el arnés de prueba).

## Cambios de Dummy
No directamente — se reutilizan los 15 proyectos ya existentes en `ins_fl` (seed.sql) como catálogo de proyectos para el selector. No se agregaron filas de contactos de ejemplo (la tabla nace vacía; los datos de prueba del arnés se crean y se limpian solo dentro de esa prueba, no quedan en `seed.sql`).

## Cambios de permisos o alcances
Sí. Permiso funcional nuevo y propio (no el general de Instalaciones), agregado al catálogo (`perm_modulos`/`perm_elementos`/`perm_subelementos`/`perm_subelemento_acciones`, IDs 9005–9011, sin colisión con el catálogo existente — verificado consultando `MAX(id)` de cada tabla antes de elegir los IDs): `INSTALACIONES_CONTACTOS_DIRECTORIO_LISTADO.VER` / `.CREAR` / `.EDITAR` / `.DESACTIVAR`. **Igual que con Informes (INT-1): la migración registra el permiso en el catálogo pero no lo concede a ningún rol en `rol_permisos`** — sigue siendo la misma decisión pendiente del usuario, no algo nuevo de esta integración.

## Navegación afectada
Nueva: sidebar de Instalaciones gana una octava entrada, "Base de Datos - Contactos".

## Filtros, búsqueda o paginación afectados
Sí — filtros por categoría (select) y proyecto (combo con buscador), más búsqueda de texto libre con debounce de 300ms. Sin paginación (no se esperan volúmenes grandes de contactos por proyecto; se puede agregar después si hace falta).

## Elementos expresamente no modificados
`lab-installations.service.js` (servicio existente de proyectos de Instalaciones — solo se leyó `ins_fl` desde el servicio nuevo, sin tocar el existente), `lab-sales.service.js` (solo se leyó como referencia de patrón), todos los demás submódulos de Instalaciones, `lab-operation.routes.js` (rutas de Informes, sin tocar), IndexedDB, Service Worker, scopes.

## Pruebas realmente ejecutadas
- **Estática**: `node --check` en los 7 archivos `.js` nuevos/modificados — PASS.
- **Runtime (Node, contra datos reales de seed)**: arnés propio que carga `schema.sql`+`seed.sql`+las 12 migraciones en SQLite WASM real, y ejercita el servicio completo: `opciones()` (3 categorías + 15 proyectos reales), `crear()` con datos válidos, rechazo de nombre vacío, rechazo de categoría inválida, rechazo de proyecto inexistente, segundo contacto para el mismo nombre en otro proyecto (confirma "un proyecto por fila"), `listar()` sin filtro y filtrado por categoría y por búsqueda de texto, `editar()` (confirma que campos no enviados no se pierden), `eliminar()` (baja lógica) y rechazo de editar un contacto ya desactivado — PASS en los 12 casos. `PRAGMA foreign_key_check` sin violaciones tras la migración.
- **Batería completa del LAB**: `tests/lab_*.cjs` y `tests/lab_*.py` (Fases 1–11 completas) — PASS, incluido el ajuste de conteo de rutas 291→296 en `lab_phase10_runtime.test.cjs`.

## Pruebas no ejecutadas
- **Runtime en navegador real / E2E**: NO EJECUTADO. El combo de proyecto (buscador, click-fuera-para-cerrar), el modal de alta/edición y el flujo completo de la UI no se probaron interactivamente en un navegador — solo el backend fue validado con datos reales.

## Riesgos o pendientes
- Pendiente, no nuevo de esta integración: `rol_permisos` no concede el permiso nuevo (`INSTALACIONES_CONTACTOS_DIRECTORIO_LISTADO.*`) a ningún rol todavía — mismo pendiente que Informes.
- Sin paginación en el listado; si el volumen de contactos crece mucho, se puede agregar después.
- El selector de "Proyecto" en el formulario no distingue proyectos activos vs. cerrados/inactivos — lista todos los proyectos de `ins_fl` sin filtrar por estatus. No se pidió ese filtro; queda como posible mejora futura si hace falta.

## SHA del commit final
`67c31f2225e1e781ee96022a1aaf3074350b0f74`.

## Estado final
**COMPLETADA** — código final aplicado y validado (estática + runtime contra datos reales + batería completa), MD de integración (este documento), `docs/integraciones/README.md` actualizado, commit `CLAUDE | INT-2 | Instalaciones | BaseDatosContactos | v001` (`67c31f2225e1e781ee96022a1aaf3074350b0f74`), `git diff`/`git status` revisados antes de comitear.
