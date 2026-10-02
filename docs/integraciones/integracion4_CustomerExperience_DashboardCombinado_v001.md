# Integración INT-4 — Customer Experience · DashboardCombinado · v001

## Número y versión de integración
INT-4, v001 (primera versión; sin versiones previas).

## Objetivo solicitado
Retrabajar la sección de Customer Experience (hasta ahora solo 3 botones placeholder "En construcción" en el sidebar). CX lleva el control de encuestas de 2 áreas — Venta/Instalaciones y Mantenimiento — a partir de 2 archivos Excel reales compartidos por el usuario (`CUSTOMER_EX_2026_PRO.xlsx` y `ENCUESTA_BLT — EXPERIENCIA Y CONFIANZA (respuestas).xlsx`). Primera entrega: un dashboard combinado con estadísticas de ambas áreas y filtros en cascada desde lo general por área hacia abajo (zona, ciudad, supervisor, etc.). El detalle de encuesta individual por registro queda para una siguiente ronda (acordado explícitamente con el usuario).

## Decisiones de datos confirmadas con el usuario antes de construir
- Usar los datos reales de los 2 archivos tal cual, marcando cada registro identificable (proyecto, cliente/nombre de contacto) con `(PRUEBA)`.
- Excepción aplicada por Claude y aceptada por el usuario: correos y teléfonos de contacto de la encuesta de Mantenimiento se sustituyeron por datos ficticios — es el único dato que podía exponer a terceros reales fuera de esta conversación, dado que el repositorio es público.
- Sin zona/ciudad para Venta/Instalaciones en esta primera entrega (ese archivo no las trae; no se cruzó con otra fuente).
- Alcance de esta integración: dashboard + filtros. Detalle de encuesta individual pendiente, explícitamente para después.

## Comportamiento anterior
Sidebar con 3 botones (Dashboard CX, Encuestas, Visitas) que abrían una vista genérica "En construcción / En desarrollo". Sin tablas, sin backend, sin datos.

## Comportamiento final
"Dashboard CX" abre un panel combinado con:
- Selector de Área (Ambas / Venta e Instalaciones / Mantenimiento), que muestra/oculta los sub-filtros propios de cada área.
- Venta/Instalaciones: filtros por Tipo de encuesta (Venta Concretada, Venta No Concretada, Instalación, Ajuste, Encuesta de Cierre), Vendedor, Supervisor. KPIs: total de encuestas, NPS promedio, clasificación Promotor/Pasivo/Detractor, desglose por tipo de encuesta y por vendedor.
- Mantenimiento: filtros por Estado, Zona general, Superintendente, Supervisor operativo, Categoría, Prioridad. KPIs: total, NPS promedio, clasificación NPS, Índice de Confianza, Percepción de Valor, Riesgo de cambio de proveedor, CSAT por 6 componentes del servicio, desglose por Estado y por Superintendente.

"Encuestas" y "Visitas" quedan sin cambios (siguen "En construcción"), fuera del alcance de esta integración.

## Módulos afectados
Customer Experience (nuevo). No se tocó ningún otro módulo.

## Rutas exactas de archivos modificados
- `core/app.js` (visibilidad del botón de sidebar — mismo gate temporal que ya afectó a Instalaciones/Informes)
- `core/config.js`
- `core/module-loader.js`
- `core/router.js`
- `index.html`
- `lab/index.html`

## Archivos nuevos
- `lab/database/migrations/014_customer_experience_encuestas.sql`
- `lab/backend/services/lab-cx.service.js`
- `lab/backend/routes/lab-cx.routes.js`
- `lab/runtime/lab-phase14-cx-bootstrap.js`
- `modules/customer-experience-dashboard/customer-experience-dashboard.js`
- `modules/customer-experience-dashboard/customer-experience-dashboard.css`
- `docs/integraciones/integracion4_CustomerExperience_DashboardCombinado_v001.md`

## Archivos eliminados
Ninguno.

## Cambios de Frontend
Sí. Módulo nuevo `modules/customer-experience-dashboard/*`. `index.html`: contenedor de vista `#view-cx-dashboard` (el botón de sidebar ya existía de fases anteriores). `core/router.js`: función `showCxDashboard()` + despacho de ruta. `core/module-loader.js`: entrada de carga perezosa para `cx-dashboard`. `core/app.js`: se agregó `cx_dashboard:true` al mapa temporal de visibilidad de sidebar — sin este cambio el botón hubiera quedado invisible pese a que el resto funcionara, exactamente lo que ya ocurrió con Instalaciones/Informes en una ronda anterior.

## Cambios de Backend LAB
Sí, todo nuevo y aislado. `lab-cx.service.js`: `opciones()` (catálogos de filtro por área) y `dashboard()` (agregados de ambas áreas con los filtros aplicados). `lab-cx.routes.js`: expone `register(router)` como archivo de rutas independiente (no piggybackea sobre un routes file existente, a diferencia de Informes/Contactos), siguiendo el patrón de `registerRoutes()` propio que ya usan las Fases 4 y 5.

## Cambios de API
Sí. Rutas nuevas:
- `GET /api/customer-experience/opciones`
- `GET /api/customer-experience/dashboard`

Ambas gateadas con el permiso `CUSTOMER_EXPERIENCE_DASHBOARD_ACCESO_VISUAL_MODULO.ACCESO_VISUAL`, que **ya existía en el catálogo** desde una fase anterior (placeholder de los 3 botones de sidebar) — no se creó ningún permiso nuevo.

## Cambios de SQLite/SQL
Sí. Migración 014: dos tablas nuevas, `cx_venta_instalacion_encuestas` (102 filas, 107 columnas — 5 tipos de encuesta combinados en el mismo layout ancho del archivo origen) y `cx_mantenimiento_encuestas` (65 filas, 58 columnas). Sin tocar ninguna tabla existente. `PRAGMA foreign_key_check` sin violaciones (verificado en arnés de prueba).

## Cambios de Dummy
Sí, es el contenido central de esta integración: los dos conjuntos de datos reales compartidos por el usuario, con los recortes de privacidad descritos arriba (nombres marcados `(PRUEBA)`, correo/teléfono de contacto de Mantenimiento ficticios).

## Cambios de permisos o alcances
Sí, pero mínimo: se concedió al rol 1 (Director General / usuario LAB R01) el permiso `CUSTOMER_EXPERIENCE_DASHBOARD_ACCESO_VISUAL_MODULO.ACCESO_VISUAL` (id_subelemento_accion=324), que ya existía en el catálogo pero no estaba concedido a ningún rol. A diferencia de Informes/Contactos, esta vez la concesión se hizo en la misma migración que crea las tablas, no como pendiente para después.

## Navegación afectada
"Dashboard CX" deja de ser un placeholder y abre la vista real. "Encuestas" y "Visitas" no cambiaron.

## Filtros, búsqueda o paginación afectados
Sí — es el objetivo central: filtros en cascada por área, con sub-filtros propios de Venta/Instalaciones (tipo de encuesta, vendedor, supervisor) y de Mantenimiento (estado, zona general, superintendente, supervisor operativo, categoría, prioridad). Sin paginación (volumen de datos pequeño para esta primera entrega).

## Elementos expresamente no modificados
Los módulos "Encuestas" y "Visitas" de Customer Experience (siguen como placeholder), todos los módulos de Instalaciones/Informes construidos en integraciones anteriores, `lab-permissions.service.js`/`lab-scope.service.js` (solo se leyeron para verificar el gate, sin tocarlos).

## Pruebas realmente ejecutadas
- **Estática**: `node --check` en los 7 archivos `.js` nuevos/modificados — PASS.
- **Runtime (Node, contra datos reales de seed + los datos de CX recién cargados)**: arnés propio que carga schema+seed+las 14 migraciones en SQLite WASM real. Confirmado: `PRAGMA foreign_key_check` sin violaciones; conteo de filas correcto (102 + 65); el promedio de NPS calculado por el servicio (9.03 para Venta/Instalaciones) coincide con el que ya traía el propio Excel de origen; muestra de correos/teléfonos de Mantenimiento confirmada como ficticia; filtrado por estado probado. Las 2 rutas se probaron de punta a punta simulando el router real **a través del gate de permisos real** (`hasEffectivePermission` + `groupAllowed` para el usuario LAB R01) — ambas devuelven 200 con datos correctos.
- **Batería completa del LAB**: `tests/lab_*.cjs` y `tests/lab_*.py` (Fases 1–11) — PASS, sin regresiones. El conteo de rutas de `lab_phase10_runtime.test.cjs` no cambió porque las rutas de CX se registran en un router propio vía la Fase 14, fuera del alcance de esa prueba específica.

## Pruebas no ejecutadas
- **Runtime en navegador real / E2E**: NO EJECUTADO. Los selectores de filtro, el cambio de Área mostrando/ocultando sub-filtros, y el renderizado visual de las barras/tablas no se probaron interactivamente en un navegador.

## Riesgos o pendientes
- Detalle de encuesta individual (las 5 variantes de Venta/Instalaciones + la de Mantenimiento): pendiente, explícitamente para la siguiente ronda, como se acordó con el usuario.
- Zona/ciudad para Venta/Instalaciones: no incluidas en esta entrega (decisión explícita del usuario); si se necesitan después, requerirían cruzar `proyecto_padre` contra `ins_fl`/`portafolio` por nombre, sin garantía de cruce exacto al 100%.
- Los módulos "Encuestas" y "Visitas" del sidebar de CX siguen siendo placeholders.
- El dashboard no pagina ni cachea — para 102+65 registros no es un problema; si el volumen real crece mucho, convendría revisarlo.

## SHA del commit final
Pendiente de push (se completa en el mensaje del chat tras publicar).

## Estado final
**COMPLETADA** (para el alcance acordado: dashboard + filtros) — código final aplicado y validado (estática + runtime contra datos reales + batería completa), MD de integración (este documento), `docs/integraciones/README.md` actualizado, commit `CLAUDE | INT-4 | Customer Experience | DashboardCombinado | v001`.
