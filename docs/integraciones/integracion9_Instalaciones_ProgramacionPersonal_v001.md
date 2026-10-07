# INT-9 · Instalaciones · ProgramacionPersonal · v001

- Integración: INT-9
- Versión: v001
- Repositorio / rama: `JIVMBLT/updated_code` · `main`
- SHA del commit final: `PENDIENTE-SHA` (se registra en commit posterior de documentación)
- Estado final: **COMPLETADA**

## Objetivo solicitado
Nueva sección dentro de Instalaciones, «Programación de Personal», para Montadores y Ajustadores: calendario para asignar actividades actuales y futuras, registro histórico de dónde y qué días trabajó cada persona, base de datos de personal por tipo, relación del personal con equipos de Instalaciones (duración en días tomada de las fechas del reporte de Instalaciones) y simulación/proyección de disponibilidad a periodos largos.

## Comportamiento anterior
No existía la sección, ni catálogo de personal, ni asignación de personal a equipos.

## Comportamiento final
- Menú Instalaciones → «Programación de Personal» (ruta `instalaciones-programacion-personal`). Selector Montadores / Ajustadores y cuatro pestañas:
  - **Calendario**: filas = personal (agrupado por puesto o categoría), columnas = días (2 semanas, 1, 2 o 3 meses; navegación y buscador). Clic en día libre o «Asignar a equipo» abre el alta; clic en una barra edita o quita. Panel «Equipos sin personal» en el rango y panel de asignaciones sin fechas válidas.
  - **Personal**: alta, edición y baja lógica. Montadores: contratista, nombre, puesto (Mecánico/Ayudante), categoría. Ajustadores: nombre, categoría, experiencia. Muestra situación hoy y próxima asignación.
  - **Historial**: asignaciones pasadas, en curso y futuras con proyecto, equipo, inicio, fin, días, trabajados y programados; filtros por persona, rango y texto.
  - **Disponibilidad y simulación**: proyección libres/ocupados por día, semana o mes (atajos 3 meses, 12 meses, 3 años, 5 años) y simulación de un trabajo (por equipo o fechas) con requeridos (mecánicos/ayudantes o ajustadores) que lista libres, ocupados («libre desde») y si es viable. La simulación no escribe datos.
- Regla de fechas (decisión mía, sin confirmar explícitamente con el usuario; ver riesgos): Montador = `fecha_inicio_montaje` → fin real, si no modificado, si no planeado; Ajustador = `fecha_inicio_ajuste` → fin real, si no modificado, si no planeado. Duración en días naturales, inclusive. Si cambian las fechas del reporte, calendario, historial y disponibilidad cambian solos.
- Fechas manuales opcionales por asignación (`fecha_desde`/`fecha_hasta`) para relevos o equipos sin fechas.
- Conflictos: traslape de una persona con otro equipo → el backend responde `requiere_confirmacion` y la UI pide confirmar («Asignar de todos modos»); persona duplicada en el mismo equipo → 409 sin opción; baja de personal con asignaciones vigentes/futuras → 409.
- Alcance: el catálogo de personal es global; las asignaciones se detallan solo para equipos visibles al usuario (misma regla de Instalaciones); las de equipos fuera de alcance cuentan para ocupación pero se muestran sin detalle (404 fail-closed al operar sobre ellas).

## Módulos afectados
Instalaciones (nuevo módulo de catálogo de permisos `INSTALACIONES_PROGRAMACION_PERSONAL`), router/menú, módulo de carga de módulos, bootstrap LAB.

## Archivos
Nuevos:
- `lab/database/migrations/019_instalaciones_programacion_personal.sql`
- `lab/runtime/lab-phase19-programacion-personal-bootstrap.js`
- `lab/backend/services/lab-instalaciones-programacion.service.js`
- `modules/instalaciones-programacion-personal/instalaciones-programacion-personal.js`
- `modules/instalaciones-programacion-personal/instalaciones-programacion-personal.css`
- `tests/lab_int9_programacion_personal.test.cjs`
- `docs/integraciones/integracion9_Instalaciones_ProgramacionPersonal_v001.md`

Modificados:
- `core/config.js` (dependencias y checks de bootstrap y servicio)
- `core/module-loader.js` (registro del módulo)
- `core/router.js` (título, `showInstalacionesProgramacionPersonal`, despacho)
- `core/app.js` (clave `instalaciones_programacion_personal` en `TEMP_SIDEBAR_PERMISSIONS`)
- `index.html` (botón de menú y vista)
- `lab/index.html` (scripts del bootstrap y del servicio)
- `lab/backend/routes/lab-installations-logistics-warehouse.routes.js` (PERMS + 13 rutas)
- `tests/lab_phase10_runtime.test.cjs` (conteo de rutas 300→313; GET 179→186)
- `docs/integraciones/README.md`

Eliminados: ninguno.

## Cambios por capa
- **Frontend**: módulo nuevo (JS/CSS) con calendario, personal, historial, disponibilidad y simulación; botón de menú bajo Instalaciones; vista nueva.
- **Backend LAB**: servicio nuevo con reglas de fechas, conflictos, historial, disponibilidad y simulación.
- **API** (13 rutas nuevas bajo `/api/instalaciones/programacion/`): `GET opciones`, `GET equipos`, `GET personal`, `POST personal`, `PUT personal/:tipo/:id`, `DELETE personal/:tipo/:id`, `GET calendario`, `POST asignaciones`, `PUT asignaciones/:id`, `DELETE asignaciones/:id`, `GET historial`, `GET disponibilidad`, `GET simulacion`.
- **SQLite/SQL**: tablas nuevas `instalaciones_personal_montadores`, `instalaciones_personal_ajustadores`, `instalaciones_programacion_asignaciones` (FK a `ins_fl`, índice único parcial persona+equipo activo). Estas tablas son necesarias porque no existía estructura equivalente en el modelo. No se modificaron tablas existentes. Catálogo de permisos: módulo 9020, elemento 9021, subelemento 9022, acciones 9023–9026 (VER, CREAR, EDITAR, DESACTIVAR); concesión al rol 1 (`rol_permisos` 14956–14959). Migración idempotente (`INSERT OR IGNORE`).
- **Dummy** (todo ficticio, dentro de la migración 019 para que llegue también a bases LAB ya inicializadas): 6 equipos de ejemplo (966103–966108) más fechas de ajuste a 966101/966102 (de la migración 018), 15 montadores, 6 ajustadores y 38 asignaciones. `lab/database/seed.sql`: SIN CAMBIOS.
- **Permisos/alcances**: permisos nuevos arriba; alcance por `visibleProjectSql` de Instalaciones.
- **Navegación**: nuevo ítem «Programación de Personal» en Instalaciones.
- **Filtros/búsqueda/paginación**: filtros y búsqueda propios de la sección (nombre, rango, persona); sin paginación (el calendario acota el rango; disponibilidad limita periodos a 186 días / 160 semanas / 60 meses).

## Elementos expresamente NO modificados
Ficha/Bitácora de proyecto, Contactos y envío simulado, tablas existentes (incl. `ins_fl`), `seed.sql`, otros módulos del menú, reporte de Instalaciones (solo lectura de sus fechas).

## Pruebas ejecutadas
| Tipo | Prueba | Resultado |
|---|---|---|
| Estática | `node --check` de servicio, rutas, router, app, config, module-loader y JS del módulo | PASS |
| SQLite | `tests/lab_int9_programacion_personal.test.cjs` sobre sql.js con schema+seed+migraciones 004–019 (FK sin violaciones, migración idempotente, conteos dummy) | PASS |
| Runtime / servicio | Mismo archivo: CRUD de personal y validaciones, regla de fechas (real/modificado/planeado/sin fechas), alta múltiple, duplicado 409, traslape con confirmación, edición con fechas manuales, historial, baja bloqueada con asignaciones, disponibilidad día/semana/mes y rechazo de rango excesivo, simulación (viable/no viable, sin escritura), usuario inexistente fail-closed | PASS |
| Contractual | Mismo archivo: 4 permisos en catálogo y concedidos a R01; 13 rutas registradas | PASS |
| Contractual | `tests/lab_phase10_runtime.test.cjs` (313 rutas, 186 GET) | PASS |
| Regresión | Batería `tests/lab_*.cjs` (sin `package_guard`) | PASS salvo `lab_phase7_runtime.test.cjs` |
| Navegador | Chromium headless contra servidor local (script Playwright ad hoc, **no incluido en el repo**) con identidad LAB R01: menú visible tras recarga, calendario (17 filas, 333 barras), alta con detección de traslape + confirmación, pestañas Personal/Historial/Disponibilidad con datos, simulación | Ejecutado manualmente; sin errores de página (solo fallos de CDN jsPDF por red del sandbox) |

## Pruebas no ejecutadas
- E2E automatizado versionado: NO EJECUTADO (la verificación en navegador fue un script ad hoc no incluido).
- Edición/quitar asignación y alta/edición/baja de personal desde la UI en navegador: NO EJECUTADO (cubierto solo a nivel servicio).
- Simulación en navegador con datos capturados: solo se verificó el mensaje de validación sin fechas; el resultado con datos está cubierto a nivel servicio.
- Prueba con usuarios de otros alcances (no R01) en navegador: NO EJECUTADO.

## Riesgos o pendientes
- `lab_phase7_runtime.test.cjs` falla también en `main` limpio (dependiente de fecha); no relacionado.
- Supuestos a validar con el usuario: (1) regla de fechas y fallback real → modificado → planeado; (2) días naturales inclusive (no hábiles); (3) «categoría» y «experiencia» como texto libre; (4) columna «contratista nombre Montador» interpretada como contratista + nombre; (5) un traslape es advertencia confirmable, no bloqueo.
- En un navegador sin base previa, el menú puede aparecer solo tras recargar una vez (la migración termina después del primer login); mismo comportamiento que migraciones anteriores.
- Este commit se apila sobre el commit local `c272357` (dummy de proyectos, migración 018), que depende de acceso de escritura al repositorio de la organización para publicarse.
- Estado de publicación: ver nota de entrega (push sujeto a acceso a GitHub).

## Estado final
COMPLETADA
