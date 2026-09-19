# Integración INT-1 — Informes · FiltrosBuscablesYDrilldown · v001

## Número y versión de integración
INT-1, v001 (primera integración funcional registrada bajo la Norma Final de Trabajo; sin versiones previas).

## Objetivo solicitado
Dos mejoras al módulo Operación > Informes:
1. Los 6 filtros posteriores al plazo (superintendente, supervisor, zona, estado, proyecto, equipo) eran `<select multiple>` nativos: para elegir más de una opción había que usar Ctrl+click, poco práctico con listas largas. Se pidió que cada uno permita escribir para filtrar la lista y usar checkboxes para la selección múltiple.
2. En la sección "Actividad del periodo", cualquier cifra o desglose (tickets totales, responsabilidad, estado, causas de falla BLT/Cliente, tipo de equipo, tiempo promedio de llegada total/hábil/inhábil, tiempo promedio de solución, eventos atrapados) debía poder abrir el detalle de los tickets que la componen, con las mismas columnas que Operación > Resumen del día > Tickets del periodo.

## Comportamiento anterior
Filtros: `<select multiple>` nativo por cada uno de los 6 campos; selección múltiple solo posible con Ctrl+click, sin buscador. Actividad del periodo: solo cifras y barras estáticas, sin forma de ver los tickets individuales detrás de cada una.

## Comportamiento final
Filtros: combo propio por cada uno de los 6 campos — botón que abre un panel con buscador de texto (filtra la lista en vivo) y checkboxes para selección múltiple, más botones "Marcar todo" / "Quitar todo" sobre lo que esté visible en ese momento con el buscador. Actividad del periodo: cada cifra/barra es un botón que abre un modal con la tabla de tickets correspondiente a ese criterio específico, respetando los 6 filtros y el rango de fechas vigentes, con las mismas 18 columnas que Resumen del día > Tickets del periodo (No. Ticket, Proyecto, Equipo, Estado, Fecha/Hora Reporte, Asunto, Estatus inicial, Fecha/Hora Llegada, T. llegada, Fecha/Hora Solución, Estatus final, Causa, Acción cierre, Responsabilidad, Causa de falla).

## Módulos afectados
Operación > Informes (frontend y backend LAB). No se tocó Operación > Resumen del día (solo se leyeron sus columnas como referencia).

## Rutas exactas de archivos modificados
- `modules/operacion-informes/operacion-informes.js`
- `modules/operacion-informes/operacion-informes.css`
- `lab/backend/services/lab-informes.service.js`
- `lab/backend/routes/lab-operation.routes.js`
- `core/module-loader.js` (cache-bust de versión de los assets de informes)
- `tests/lab_phase10_runtime.test.cjs` (conteo de rutas: 290→291 por la ruta nueva)

## Archivos nuevos
- `docs/integraciones/README.md`
- `docs/integraciones/integracion1_Informes_FiltrosBuscablesYDrilldown_v001.md`

## Archivos eliminados
Ninguno.

## Cambios de Frontend
Sí. `operacion-informes.js`: los 6 `<select multiple>` se reemplazaron por un combo propio (buscador + checkboxes) por filtro, con estado en `state.filtros` (Set por campo) en vez de leer `selectedOptions` del DOM. Se agregó un modal de detalle (overlay + tabla) reutilizable para las 13 cifras/desgloses de "Actividad del periodo", cada una ahora es un botón (`.inf-drill`) con `data-criterio`/`data-valor`. Se duplicó dentro del módulo (mismo patrón de autocontención que el resto del LAB) el mapeo de columnas de tickets usado en Resumen del día, para mostrar exactamente las mismas 18 columnas. `operacion-informes.css`: estilos nuevos para el combo y el modal, reutilizando la paleta de colores ya existente en el módulo.

## Cambios de Backend LAB
Sí, acotado. `lab-informes.service.js`: se factorizó el cálculo de "tickets en alcance" (portafolio activo + filtros de usuario + rango de fechas) — antes vivía en línea dentro de `generarInforme`, ahora es la función `ticketsEnAlcance()`, reutilizada tanto por `generarInforme` (sin cambio de resultado) como por la función nueva `detalleTickets()`, que aplica sobre ese mismo alcance el criterio de la tarjeta en la que se hizo clic (`total`, `abiertos`, `cerrados`, `en_curso`, `responsabilidad_blt`, `responsabilidad_cliente`, `causa_blt`, `causa_cliente`, `tipo_equipo`, `tiempo_llegada`, `tiempo_llegada_habil`, `tiempo_llegada_inhabil`, `tiempo_solucion`, `atrapados`) y devuelve las filas crudas de `tickets`.

## Cambios de API
Sí. Ruta nueva: `GET /api/informes/detalle` (mismo `requireAuth`/`gate(INFORMES)` que `/opciones` y `/generar`, mismos parámetros de filtro y rango de fechas, más `criterio` y `valor`). `/api/informes/opciones` y `/api/informes/generar` no cambiaron de contrato.

## Cambios de SQLite/SQL
Ninguno. No se tocaron `schema.sql`, `seed.sql` ni migraciones. `detalleTickets()` reutiliza `ManttoLabOperationService.visibleTickets()`/`activeInServicePortfolio()`, ya existentes.

## Cambios de Dummy
Ninguno.

## Cambios de permisos o alcances
Ninguno. La ruta nueva usa el mismo permiso ya existente (`OPERACION_INFORMES_INFORMES_INFORMES.VER`) y el mismo alcance United que `/opciones` y `/generar`. Sigue pendiente, sin cambios en esta integración, la concesión de ese permiso a roles en `rol_permisos` (reportado en la reparación anterior del bootstrap del módulo).

## Navegación afectada
Ninguna. Misma ruta `informes` del sidebar.

## Filtros, búsqueda o paginación afectados
Sí — es el objetivo central de esta integración: los 6 filtros de Informes ahora tienen buscador y checkboxes. No se tocó paginación (el módulo no pagina; el detalle tampoco pagina, muestra todos los tickets del criterio).

## Elementos expresamente no modificados
`lab-operation.service.js` (fuente de `visiblePortfolio`/`visibleTickets`, sin cambios), `lab-shared-assets.service.js`, `modules/resumen-dia/*` (solo se leyó como referencia de columnas), `lab-phase11-informes-bootstrap.js`, migración `011_informes_traslado.sql`, `index.html`, `lab/index.html`, permisos/`rol_permisos`.

## Pruebas realmente ejecutadas
- **Estática**: `node --check` en los 4 archivos `.js` modificados — PASS.
- **Runtime (Node, contra datos reales de seed)**: arnés propio que carga `schema.sql`+`seed.sql`+migraciones 004–011 en SQLite WASM real, ejecuta `generarInforme` y luego `detalleTickets` con los 13 criterios (`total`, `abiertos`, `cerrados`, `en_curso`, `responsabilidad_blt`, `responsabilidad_cliente`, `causa_blt`, `tipo_equipo`, `tiempo_llegada`, `tiempo_llegada_habil`, `tiempo_llegada_inhabil`, `tiempo_solucion`, `atrapados`) para un usuario con llave maestra United — PASS. Se verificó por cruce (`console.assert`) que los totales de `detalleTickets` para `total/abiertos/cerrados/en_curso/responsabilidad_blt/responsabilidad_cliente` coinciden exactamente con los agregados que ya devuelve `generarInforme` — PASS, sin discrepancias.
- **Batería completa del LAB**: `tests/lab_*.cjs` y `tests/lab_*.py` (Fases 1–11 completas) — PASS, incluida la actualización de `lab_phase10_runtime.test.cjs` (conteo de rutas 290→291 por la ruta nueva).

## Pruebas no ejecutadas
- **Runtime en navegador real / E2E**: NO EJECUTADO. No tengo acceso a un navegador desde este entorno. El combo de filtros (buscador, checkboxes, apertura/cierre del panel, click-fuera-para-cerrar) y el modal de detalle (apertura, cierre con X/Escape/click-fuera, scroll de la tabla) se implementaron siguiendo el mismo patrón vainilla-JS ya usado en el resto del LAB, pero no se probaron interactivamente en un navegador.

## Riesgos o pendientes
- El detalle de tickets no pagina: si un criterio devuelve muchos tickets (poco probable con datos de LAB, posible en producción con volumen real) la tabla del modal podría ser larga. No se agregó paginación por no haber sido parte de lo solicitado.
- Pendiente de sesión anterior, sin relación con esta integración: `rol_permisos` no concede `OPERACION_INFORMES_INFORMES_INFORMES.VER` a ningún rol todavía.

## SHA del commit final
`d8b4a1e...` (ver mensaje de confirmación en el chat con el SHA completo tras el push).

## Estado final
**COMPLETADA** — código final aplicado, pruebas ejecutadas (estática + runtime contra datos reales + batería completa), MD de integración (este documento), `docs/integraciones/README.md` creado y actualizado, commit `CLAUDE | INT-1 | Informes | FiltrosBuscablesYDrilldown | v001`, `git diff`/`git status` revisados antes de comitear.
