# Integración INT-5 — Customer Experience · DetalleEncuestasPorArea · v001

## Número y versión de integración
INT-5, v001 (primera versión; sin versiones previas).

## Objetivo solicitado
Segunda parte de Customer Experience, acordada al cerrar INT-4: una pestaña por área (Venta/Instalaciones, Mantenimiento) y, dentro de cada una, el detalle de todas las encuestas individuales (no solo agregados).

## Comportamiento anterior
El botón "Encuestas" del sidebar de CX abría la vista genérica "En construcción / En desarrollo". No existía forma de ver una encuesta individual completa — solo los agregados del Dashboard (INT-4).

## Comportamiento final
"Encuestas" abre una vista con dos pestañas:
- **Venta / Instalaciones**: filtros (tipo de encuesta, vendedor, supervisor) + listado de las 102 encuestas individuales (proyecto, cliente, tipo, badge de NPS con color según Promotor/Pasivo/Detractor). Clic en una fila abre un modal con el detalle completo — los datos generales (proyecto, cliente, sitio, vendedor, supervisor, NPS) y únicamente las preguntas del grupo correspondiente a su `tipo_encuesta` (Venta Concretada, Venta No Concretada, Instalación, Ajuste o Encuesta de Cierre), cada una con la etiqueta legible original del Excel, no el nombre de columna técnico.
- **Mantenimiento**: filtros (estado, superintendente, categoría) + listado de las 65 encuestas, agrupadas en el detalle por secciones (Identificación, NPS y confianza, CSAT por componente, Oportunidades de mejora, Comentarios y clasificación, Zonas y responsables).

## Módulos afectados
Customer Experience (extensión). No se tocó el Dashboard construido en INT-4 salvo para agregar las dos funciones de listado al mismo servicio backend.

## Rutas exactas de archivos modificados
- `core/app.js` (visibilidad del botón "Encuestas" en el sidebar)
- `core/config.js`
- `core/module-loader.js`
- `core/router.js`
- `index.html`
- `lab/backend/routes/lab-cx.routes.js`
- `lab/backend/services/lab-cx.service.js`
- `lab/index.html`

## Archivos nuevos
- `lab/database/migrations/015_cx_encuestas_permiso.sql`
- `lab/runtime/lab-phase15-cx-encuestas-permiso-bootstrap.js`
- `modules/customer-experience-encuestas/customer-experience-encuestas.js`
- `modules/customer-experience-encuestas/customer-experience-encuestas.css`
- `docs/integraciones/integracion5_CustomerExperience_DetalleEncuestasPorArea_v001.md`

## Archivos eliminados
Ninguno.

## Cambios de Frontend
Sí. Módulo nuevo `modules/customer-experience-encuestas/*`: pestañas, filtros, listado, modal de detalle con los campos agrupados por tipo de encuesta (generados a partir de las columnas reales del Excel de origen, con sus etiquetas legibles). `index.html`: contenedor `#view-cx-encuestas`. `core/router.js`: `showCxEncuestas()` + despacho. `core/module-loader.js`: entrada de carga perezosa. `core/app.js`: `cx_encuestas:true` agregado al mapa temporal de visibilidad de sidebar (mismo patrón que cada módulo anterior, para que el botón no quede invisible).

## Cambios de Backend LAB
Sí, acotado. `lab-cx.service.js`: dos funciones nuevas, `listarVentaInstalacion()` y `listarMantenimiento()`, que reutilizan la misma lógica de filtrado (`matches()`) ya usada por el dashboard de INT-4, pero devuelven las filas individuales completas en vez de agregarlas. `lab-cx.routes.js`: dos rutas nuevas, gateadas con un permiso distinto al del Dashboard (`CUSTOMER_EXPERIENCE_ENCUESTAS_ACCESO_VISUAL_MODULO.ACCESO_VISUAL`, el que corresponde al módulo "Encuestas" del catálogo, no al de "Dashboard CX").

## Cambios de API
Sí. Rutas nuevas:
- `GET /api/customer-experience/venta-instalacion/encuestas`
- `GET /api/customer-experience/mantenimiento/encuestas`

Ambas devuelven las filas completas (todas las columnas) filtradas, sin agregar. Sin cambios en `/opciones` ni `/dashboard` (INT-4).

## Cambios de SQLite/SQL
Sí, mínimo. Migración 015: una sola concesión de permiso (`rol_permisos`, rol 1 → id_subelemento_accion=325, el permiso de "Encuestas" que ya existía en el catálogo desde fases previas pero no estaba concedido a ningún rol — mismo caso que el Dashboard en INT-4, resuelto en la misma migración esta vez). Sin tablas nuevas ni cambios a `cx_venta_instalacion_encuestas`/`cx_mantenimiento_encuestas` (INT-4).

## Cambios de Dummy
Ninguno — se reutilizan los mismos datos cargados en INT-4.

## Cambios de permisos o alcances
Sí: concesión del permiso `CUSTOMER_EXPERIENCE_ENCUESTAS_ACCESO_VISUAL_MODULO.ACCESO_VISUAL` a LAB R01, en la misma migración que lo introduce (no queda como pendiente, a diferencia de cómo quedaron Informes/Contactos en su momento).

## Navegación afectada
"Encuestas" deja de ser un placeholder y abre la vista real con sus dos pestañas. "Visitas" sigue sin cambios.

## Filtros, búsqueda o paginación afectados
Sí — filtros propios por pestaña (más acotados que los del Dashboard, pensados para ubicar una encuesta específica: tipo/vendedor/supervisor en Venta-Instalaciones; estado/superintendente/categoría en Mantenimiento). Sin paginación (102 y 65 registros respectivamente, manejable en una sola lista).

## Elementos expresamente no modificados
`modules/customer-experience-dashboard/*` (INT-4, sin cambios), `cx_venta_instalacion_encuestas`/`cx_mantenimiento_encuestas` (mismas tablas y datos de INT-4, sin tocar su contenido), el módulo "Visitas" (sigue como placeholder).

## Pruebas realmente ejecutadas
- **Estática**: `node --check` en los 8 archivos `.js` nuevos/modificados — PASS.
- **Runtime (Node, contra datos reales de seed + los datos de CX de INT-4)**: arnés propio cargando las 15 migraciones completas — `PRAGMA foreign_key_check` sin violaciones; `hasEffectivePermission` para el permiso de Encuestas confirmado `true` tras la migración 015; las 2 rutas nuevas probadas de punta a punta simulando el router real a través del gate de permisos real, devolviendo 102 y 65 registros respectivamente con status 200.
- **Batería completa del LAB**: `tests/lab_*.cjs` y `tests/lab_*.py` (Fases 1–11) — PASS, sin regresiones.

## Pruebas no ejecutadas
- **Runtime en navegador real / E2E**: NO EJECUTADO. El cambio de pestañas, el clic en una fila para abrir el modal, y el renderizado de los grupos de campos por tipo de encuesta no se probaron interactivamente en un navegador.

## Riesgos o pendientes
- "Visitas" (tercer botón del sidebar de CX) sigue siendo un placeholder — fuera del alcance acordado hasta ahora.
- El agrupamiento de campos de Mantenimiento en 6 secciones (Identificación, NPS y confianza, CSAT, Oportunidades de mejora, Comentarios, Zonas) fue una decisión de organización de Claude para que el detalle sea legible — no se consultó explícitamente con el usuario; si prefiere otro agrupamiento, es un ajuste simple.

## SHA del commit final
`cd240273be52014ee294b82bb4d34ba1139cd2e7`.

## Estado final
**COMPLETADA** — código final aplicado y validado (estática + runtime contra datos reales + batería completa), MD de integración (este documento), `docs/integraciones/README.md` actualizado, commit `CLAUDE | INT-5 | Customer Experience | DetalleEncuestasPorArea | v001`.
