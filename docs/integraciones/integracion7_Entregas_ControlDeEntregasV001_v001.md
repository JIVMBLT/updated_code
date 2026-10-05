# Integración INT-7 — Entregas · ControlDeEntregasV001 · v001

## Número y versión de integración
INT-7, v001 (primera versión; sin versiones previas).

## Objetivo solicitado
Nueva sección del sidebar, independiente de Operación/Instalaciones/etc.: "Entregas". Cada usuario puede programar un control de entregas de sus colaboradores (quién debe entregar, qué reporte/información, fecha, con posibilidad de recurrencia semanal/quincenal/mensual o entrega única). Seguimiento de cada entrega con fechas (a tiempo / tarde / no entregada) e indicadores porcentuales. En vez de depender de correo o fechas externas, la carga del documento ocurre directamente en el registro — el propio sistema determina con qué fecha se cargó y si estuvo dentro de plazo. Validador: solo quien generó el recordatorio de entrega puede marcar el documento cargado como correcto o no, para evitar que se suba cualquier archivo solo para figurar como "cumplido".

## Decisiones de diseño tomadas (sin estructura previa que replicar, a diferencia de otras integraciones)
- **Generación de ocurrencias**: el LAB no tiene un job en segundo plano, así que las entregas recurrentes generan 12 ocurrencias por adelantado al crearse (horizonte fijo), en vez de depender de un proceso programado que este entorno no tiene.
- **Quincenal** interpretado como +15 días por ocurrencia (no "dos veces al mes en fechas fijas") — es la interpretación más simple y predecible dado que el usuario no especificó el detalle.
- **Estado de entrega nunca se guarda fijo**: se calcula en cada consulta contra la fecha de hoy, para que "No entregado" refleje el momento real de la consulta, no el momento en que se generó la fila.
- **Almacenamiento del archivo**: se reutilizó `ManttoLabBlobStore` (IndexedDB), el mismo mecanismo que ya usan Pendientes/Logística/Ventas en este LAB — no se inventó un mecanismo nuevo.
- **Catálogo de permisos**: no existía ninguna agrupación "Entregas" previa (sí existe un "Entregas Recientes" bajo Experimental, pero es una función distinta, de logística). Se creó la agrupación `ENTREGAS` (id=18) completa desde cero, y una acción nueva `VALIDAR` en el catálogo (no existía una genérica — solo `VALIDAR_VO_BO`, específica de otro módulo), siguiendo el mismo patrón con que se agregaron `ADJUNTAR_ARCHIVO`/`GESTIONAR_RELACION_COTIZACION` cuando hicieron falta.

## Comportamiento anterior
No existía. Era necesario llevar el control de entregas por fuera del sistema (correo, mensajería), sin forma de medir cumplimiento ni de validar que lo entregado fuera correcto.

## Comportamiento final
Nueva sección "Entregas" en el sidebar (independiente, con su propio grupo desplegable), con una vista de 4 pestañas:
- **Programadas**: lista de las entregas que el usuario ha programado como responsable, cada una con su resumen de cumplimiento (% a tiempo / % general / % no entregado) y acceso al detalle completo (todas las ocurrencias con su estado). Botón "+ Nueva entrega programada" abre un formulario: colaborador, título, descripción, tipo de recurrencia, fecha de la primera entrega.
- **Mis Entregas**: lista de las entregas donde el usuario es el colaborador que debe entregar, con su estado (a tiempo/tarde/no entregado/pendiente) y un control de carga de archivo directo en el registro. Si una entrega fue rechazada, muestra el motivo y permite volver a cargar el archivo correcto.
- **Validación**: lista de entregas con archivo cargado y pendientes de revisión, visible solo para el responsable que las programó. Botones "✓ Válido" / "✗ Rechazar" con comentario opcional, y acceso directo para ver el archivo cargado.
- **Indicadores**: KPIs de % a tiempo, % general (a tiempo + tarde) y % no entregado — calculados solo sobre las entregas que ya vencieron (no castiga lo que todavía no se vence) — con desglose por colaborador.

## Módulos afectados
Ninguno existente — es una sección completamente nueva, sin tocar Operación/Instalaciones/Customer Experience ni ningún otro módulo.

## Rutas exactas de archivos modificados
- `core/app.js` (visibilidad del nuevo botón de sidebar)
- `core/config.js`
- `core/module-loader.js`
- `core/router.js`
- `index.html`
- `lab/index.html`

## Archivos nuevos
- `lab/database/migrations/016_entregas.sql`
- `lab/backend/services/lab-entregas.service.js`
- `lab/backend/routes/lab-entregas.routes.js`
- `lab/runtime/lab-phase16-entregas-bootstrap.js`
- `modules/entregas-control/entregas-control.js`
- `modules/entregas-control/entregas-control.css`
- `docs/integraciones/integracion7_Entregas_ControlDeEntregasV001_v001.md`

## Archivos eliminados
Ninguno.

## Cambios de Frontend
Sí, completo. Nuevo grupo de sidebar "Entregas" (icono 📬, independiente, no anidado en ningún grupo existente) con un único ítem "Control de Entregas". Módulo nuevo `modules/entregas-control/*` con las 4 pestañas descritas arriba, formulario de alta con combo de colaboradores, control de carga de archivo (`<input type=file>` + `FormData`, mismo patrón ya usado en Logística/Ventas), y modal de detalle por entrega programada.

## Cambios de Backend LAB
Sí, completo y nuevo. `lab-entregas.service.js`: `opciones`, `crearProgramada` (genera hasta 12 ocurrencias por adelantado con cálculo de fechas semanal/quincenal/mensual, incluido manejo correcto de fin de mes), `listarProgramadas`, `detalleProgramada`, `desactivarProgramada`, `misEntregas`, `subirArchivo` (usa `ManttoLabBlobStore`), `archivoAcceso`, `validacionPendientes`, `validar`, `indicadores`. Guardias de autorización explícitos: solo el colaborador asignado puede subir el archivo de su propia entrega; solo el responsable que programó la entrega puede validarla — verificados con pruebas que confirman el rechazo cuando el usuario no corresponde.

## Cambios de API
Sí, 11 rutas nuevas, todas bajo `/api/entregas/*`:
- `GET /api/entregas/opciones`
- `GET /api/entregas/programadas`, `GET /api/entregas/programadas/:id`, `POST /api/entregas/programadas`, `DELETE /api/entregas/programadas/:id`
- `GET /api/entregas/mis-entregas`
- `POST /api/entregas/instancias/:id/archivo`, `GET /api/entregas/instancias/:id/archivo/acceso`
- `GET /api/entregas/validacion`, `POST /api/entregas/instancias/:id/validar`
- `GET /api/entregas/indicadores`

Registradas con `registerRoutes()` propio (dominio nuevo, mismo patrón que Customer Experience en INT-4, no piggybackea sobre un routes file existente).

## Cambios de SQLite/SQL
Sí. Migración 016: dos tablas nuevas (`entregas_programadas`, `entregas_instancias`) + catálogo de permisos completo nuevo (agrupación `ENTREGAS`, módulo `ENTREGAS_CONTROL`, 4 elementos, 5 subelementos, 10 acciones, más una acción nueva `VALIDAR` agregada al catálogo general) + concesión de las 10 acciones a LAB R01 en la misma migración (sin dejar pendiente de conceder, como sí ocurrió con Informes/Contactos en su momento). `PRAGMA foreign_key_check` sin violaciones.

## Cambios de Dummy
Ninguno — no se agregaron filas de ejemplo; las tablas nacen vacías, el usuario crea sus propias entregas programadas desde la UI.

## Cambios de permisos o alcances
Sí, completo: agrupación, módulo, elementos, subelementos y acciones nuevos, todo descrito arriba.

## Navegación afectada
Nueva: sidebar gana un grupo completo "Entregas" con un ítem.

## Filtros, búsqueda o paginación afectados
No aplica en esta primera versión — no se pidieron filtros ni paginación, y el volumen esperado (entregas programadas por usuario) no los requiere todavía.

## Elementos expresamente no modificados
Todos los módulos existentes (Operación, Instalaciones, Customer Experience, etc.), `lab-tasks.service.js`/`lab-logistics.service.js` (solo se leyeron como referencia del patrón de carga de archivos, sin tocarlos), `lab-blob-store.js` (reutilizado tal cual, sin cambios).

## Pruebas realmente ejecutadas
- **Estática**: `node --check` en los 8 archivos `.js` nuevos/modificados — PASS.
- **Runtime (Node, contra datos reales de seed, con un mock funcional de IndexedDB para probar `ManttoLabBlobStore` fuera del navegador)**: arnés propio que ejercita el ciclo de vida completo: creación de una entrega SEMANAL (12 ocurrencias generadas con fechas correctamente espaciadas cada 7 días, confirmado contra el cálculo real), carga de archivo por el colaborador correcto (estado pasa a A_TIEMPO/TARDE según corresponda), rechazo explícito al intentar subir el archivo con un usuario que no es el colaborador asignado, rechazo explícito al intentar validar con un usuario que no es el responsable, validación como VÁLIDO y como RECHAZADO, cálculo de indicadores (verificado a mano: 3 de 3 instancias vencidas, 2 entregadas de las cuales 0 a tiempo → 0% a tiempo, 67% general, 33% no entregado — coincide exactamente), y desactivación de la entrega programada. Todos los casos PASS.
- **Rutas**: las 11 rutas probadas de punta a punta simulando el router real a través del gate de permisos y alcance de información real (agrupación ENTREGAS nueva, confirmada con `groupAllowed`), incluyendo creación de una entrega programada completa vía POST y lectura de indicadores vía GET — status 200/201 en todos los casos.
- **Batería completa del LAB**: `tests/lab_*.cjs` y `tests/lab_*.py` (Fases 1–11) — PASS, sin regresiones.

## Pruebas no ejecutadas
- **Runtime en navegador real / E2E**: NO EJECUTADO. El formulario de alta, el cambio entre pestañas, la carga de archivo real desde un `<input type=file>` del navegador (se probó con un mock de archivo en Node, no con un archivo real seleccionado por el usuario), y el flujo visual de validación/rechazo no se probaron interactivamente en un navegador.

## Riesgos o pendientes
- El horizonte de 12 ocurrencias por adelantado es fijo: una entrega recurrente que supere ese horizonte (por ejemplo, semanal sostenida más de ~3 meses) se queda sin ocurrencias nuevas generadas. No se implementó un mecanismo de "generar más" porque no fue parte de lo solicitado; sería una extensión simple si hace falta.
- "Quincenal" se interpretó como +15 días por ocurrencia. Si el usuario esperaba un comportamiento distinto (ej. los días 1 y 16 de cada mes), es un ajuste de la función `siguienteFecha()` en el servicio.
- No hay notificaciones ni recordatorios automáticos (el usuario no los pidió explícitamente) — el colaborador debe entrar a "Mis Entregas" para ver lo que tiene pendiente.
- Al igual que en integraciones anteriores, el archivo vive en IndexedDB local del navegador (vía `ManttoLabBlobStore`) — no hay respaldo en otro lugar; si el usuario borra datos del sitio, los archivos cargados se pierden (mismo comportamiento ya existente para Pendientes/Logística/Ventas, no es una limitación nueva de este módulo).

## SHA del commit final
Pendiente de push (se completa en el mensaje del chat tras publicar).

## Estado final
**COMPLETADA** — código final aplicado y validado (estática + runtime contra datos reales con guardias de autorización probados explícitamente + batería completa), MD de integración (este documento), `docs/integraciones/README.md` actualizado, commit `CLAUDE | INT-7 | Entregas | ControlDeEntregasV001 | v001`.
