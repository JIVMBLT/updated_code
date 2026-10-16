# INT-10 · Fotografías · CatalogoGeneralMapaEstados · v001

- Integración: INT-10
- Versión: v001
- Repositorio / rama: `JIVMBLT/updated_code` · `main`
- SHA del commit final: `PENDIENTE-SHA` (se registra en commit posterior de documentación)
- Estado final: **COMPLETADA**

## Objetivo solicitado
En Fotografías → Catálogo General, en lugar de entrar directo a un listado de proyectos, mostrar un mapa de la República Mexicana delimitado por estados; al seleccionar un estado, mostrar el listado de fotografías de ese estado.

## Comportamiento anterior
El Catálogo General abría directo en el listado (mosaico de proyectos agrupado por estado) con un filtro desplegable de estado. En el LAB, además, el módulo no cargaba datos («No fue posible cargar Catálogo General») porque el backend LAB no tenía las rutas del catálogo (la versión original consume Aiven).

## Comportamiento final
- Al abrir el Catálogo General se muestra el **mapa de México por estados** (32 entidades). Cada estado se colorea por cantidad de proyectos con fotografías (sin color = sin fotografías), con tooltip (estado y total), navegación por teclado y lista lateral «Estados con fotografías» (clicable).
- Clic en un estado → encabezado con el nombre, botón «← Mapa de México» y el **mosaico de fotografías de ese estado**; clic en una miniatura abre el carrusel existente (sin cambios).
- Búsqueda por texto conservada: sin estado abierto busca en todos los estados y muestra resultados agrupados (borrar el texto regresa al mapa); con estado abierto filtra dentro del estado.
- Proyectos cuyo estado está vacío o no se reconoce (por ejemplo los datos «Estado LAB 0X») quedan accesibles en el botón «Sin estado reconocido» del panel lateral; no se pierde ninguno. Se reconocen alias comunes (CDMX, Distrito Federal, Edo. de México, Coahuila de Zaragoza, etc.).
- KPIs: proyectos con fotografía, estados con fotografías y carretes unidos por equivalencia.
- Backend LAB: el Catálogo General ahora funciona en el LAB con las tablas existentes.
- Director General: recibe los 8 permisos `FOTOGRAFIAS_CATALOGO_GENERAL_*` (todos de lectura) resolviendo el rol por código `DIRECTOR_GENERAL`; antes no tenía ninguno y la sección no aparecía en su menú. Navegación a proyectos (botones «Ir a proyecto…») abierta para DG; el resto de usuarios queda acotado por su alcance.

## Módulos afectados
Fotografías → Catálogo General (módulo `ventas-fotos-mapa`), Backend LAB de Ventas/Fotografías, bootstrap LAB, carga de módulos.

## Archivos
Nuevos:
- `modules/ventas-fotos-mapa/mexico-estados.js` (geometría del mapa; fuente `@svg-maps/mexico` 2.0.0, Victor Cazanave, **CC BY 4.0**, con atribución en el archivo y en la pantalla)
- `lab/backend/services/lab-fotografias-catalogo.service.js`
- `lab/database/migrations/020_fotografias_catalogo_general_mapa.sql`
- `lab/runtime/lab-phase20-fotografias-catalogo-mapa-bootstrap.js`
- `tests/lab_int10_fotografias_mapa.test.cjs`
- `docs/integraciones/integracion10_Fotografias_CatalogoGeneralMapaEstados_v001.md`

Modificados:
- `modules/ventas-fotos-mapa/ventas-fotos-mapa.js`, `.css` y `.html` (vista de mapa, estado, búsqueda; se retiró el selector desplegable de estado)
- `core/module-loader.js` (carga `mexico-estados.js` antes del módulo; versiones)
- `core/config.js` (servicio y bootstrap fase 20)
- `index.html` (versiones de caché de `config.js`, `module-loader.js`, `router.js` y `app.js`; ver riesgos)
- `lab/index.html` (scripts del servicio y bootstrap)
- `lab/backend/routes/lab-sales-collections.routes.js` (3 rutas)
- `tests/lab_phase10_runtime.test.cjs` (conteo de rutas 313→316; GET 186→189)
- `docs/integraciones/README.md`

Eliminados: ninguno.

## Cambios por capa
- **Frontend**: ver arriba. Sin dependencias externas (mapa embebido).
- **Backend LAB**: servicio de lectura que entrega las formas que ya consumía el módulo: CORELLIAN desde `ins_proyecto_fotos` + `ins_fl`; UNITED desde `portafolio_proyecto_fotos` + `portafolio` + `proyecto_equivalencias`.
- **API** (3 rutas GET nuevas bajo `/api/ventas/fotos-mapa/catalogo-general/`): `fotografias`, `navegacion-corellian`, `navegacion-united`. Gate: permiso funcional del Catálogo General (acceso visual o listado); las fotografías no se filtran por alcance, igual que la puerta GENERAL original.
- **SQLite/SQL**: SIN CAMBIOS de estructura (no hay tablas ni columnas nuevas). Migración 020 solo agrega permisos al rol `DIRECTOR_GENERAL` (por código, idempotente) y datos ficticios.
- **Dummy** (en la migración 020, ficticio): 10 proyectos de ejemplo en `ins_fl` (Yucatán, Quintana Roo, Baja California, Sonora, Veracruz, Puebla, Querétaro, Guanajuato, Chihuahua, Oaxaca) y filas de fotografías en `ins_proyecto_fotos` para ellos y para los 3 proyectos de ejemplo previos (CDMX, Jalisco, Nuevo León): 13 estados con fotografías. Las imágenes son ilustraciones SVG embebidas (sin enlaces externos). `seed.sql`: SIN CAMBIOS.
- **Permisos/alcances**: ver Director General arriba; no se tocó el motor global de permisos.
- **Navegación**: la ruta y el menú ya existían; sin cambios.
- **Filtros/búsqueda/paginación**: filtro de estado reemplazado por el mapa; búsqueda de texto conservada; sin paginación (como antes).

## Elementos expresamente NO modificados
Carrusel/lightbox de fotos (`core/details.js`), ficha de proyecto, tablas y esquema, `seed.sql`, `core/router.js` y `core/app.js` (solo se subió su versión de caché en `index.html`), demás módulos.

## Pruebas ejecutadas
| Tipo | Prueba | Resultado |
|---|---|---|
| Estática | `node --check` de servicio, rutas, bootstrap, config, module-loader, módulo y geometría | PASS |
| SQLite / contractual | `tests/lab_int10_fotografias_mapa.test.cjs`: FK sin violaciones, migración idempotente, 8 permisos de lectura concedidos a DG por código, formas devueltas por el servicio, 13 estados dummy, navegación DG completa y acotada para no-DG, 3 rutas registradas, mapa con 32 estados únicos y atribución, estados dummy reconocidos | PASS |
| Contractual | `tests/lab_phase10_runtime.test.cjs` (316 rutas, 189 GET) | PASS |
| Regresión | Batería `tests/lab_*.cjs` (sin `package_guard`) y 8 smoke `tests/lab_*.py` | PASS |
| Navegador | Chromium headless contra servidor local (script Playwright ad hoc, **no incluido en el repo**), usuario LAB R01: el mapa carga con 32 estados y 13 coloreados, KPIs, tooltip, clic en Puebla → mosaico con su proyecto, apertura del carrusel con la foto, regreso al mapa, búsqueda global y volver al mapa al limpiar; sin errores de página | Ejecutado manualmente |

## Pruebas no ejecutadas
- E2E automatizado versionado: NO EJECUTADO.
- Usuarios no-DG en navegador y apertura de «Ir a proyecto CORELLIAN/UNITED» desde el carrusel: NO EJECUTADO.
- Datos reales de Aiven (producción): NO EJECUTADO; el módulo usa las mismas formas de respuesta que la versión con Aiven, pero solo se probó contra el LAB.
- Pantallas móviles: NO EJECUTADO (hay regla CSS responsiva, no verificada visualmente).

## Riesgos o pendientes
- En INT-9 subí rutas/menú sin actualizar las versiones de caché de `module-loader.js`, `router.js` y `app.js` en `index.html`; navegadores con caché antigua podían no mostrar el menú nuevo. Aquí se corrigió subiendo esas versiones.
- Estados con nombres no estándar en datos reales se agrupan en «Sin estado reconocido»; si hay variantes frecuentes conviene añadir alias en `ventas-fotos-mapa.js`.
- Los datos «Estado LAB 0X» del seed original siguen cayendo en «Sin estado reconocido» (no se modificaron).
- La geometría del mapa es simplificada (nivel estatal); las islas pequeñas del Pacífico/Golfo no tienen área clicable propia.
- Crédito CC BY 4.0 obligatorio: se muestra en pantalla y en el archivo; no retirarlo.

## Estado final
COMPLETADA
