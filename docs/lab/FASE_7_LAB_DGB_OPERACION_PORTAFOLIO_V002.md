# FASE 7 - LAB DGB - Operacion + Portafolio V002

## Objetivo

Reconstruir dentro del navegador la capa operativa UNITED y los contratos base/avanzados de Portafolio usando exclusivamente SQLite WASM + IndexedDB del Laboratorio DGB.

Esta entrega es incremental sobre Fases 1 a 6 V002. No crea un servidor Node/Express, no usa Aiven, Azure ni una API remota.

## Fuentes verificadas

- LAB `JIVMBLT/updated_code` main verificado: `d3b766477663e6726ea46f1bb08bdc30b01a74e6`.
- Referencia real `ziSirrush/GestorMantto` main verificada: `af76fe08a5c100747a15a155d5989dcdd1ef4023`.
- Contratos revisados: Resumen del Dia, Dashboard Call Center, Dashboard Operativo, Criticos/MTBC, Tickets, Proyectos de Mantenimiento, Dashboard Portafolio y Movimientos.

## Arquitectura

```text
Frontend actual
  -> /api/* conceptual
  -> ManttoLabTransport
  -> ManttoLabBackend / LabRouter
  -> servicios F7
  -> SQLite WASM
  -> IndexedDB
```

## Servicios agregados

- `lab-operation.service.js`: universo visible UNITED, Resumen del Dia, Call Center, Dashboard Operativo y preventivos.
- `lab-criticals.service.js`: equipos/proyectos criticos, MTBC y U365.
- `lab-portfolio.service.js`: Dashboard Portafolio, paginacion, detalle equipo/proyecto y tickets por lote.
- `lab-movements.service.js`: movimientos mensuales y cortes semanales con zona canonica.
- `lab-followup.service.js`: Seguimiento Especial personal por proyecto/equipo.
- `lab-tickets.service.js`: listado, detalle, comentarios, interacciones y Vo.Bo. local.

## Reglas preservadas

1. UNITED con llave maestra puede usar el universo completo visible del LAB.
2. Sin llave maestra, el universo se limita por `usuario_zop -> portafolio.zona_id -> z_op`.
3. Texto legacy de zona no concede acceso.
4. Dashboard Portafolio clasifica comercialmente:
   - No en Servicio por `estatus_servicio` y con prioridad.
   - En Cobranza solo por `estatus_cobranza = En Cobranza`.
   - Gratuito/Garantia solo por `estatus_cobranza = Gratuito`.
5. Movimientos usa `En Servicio` / `Servicio` como estado operativo de referencia.
6. Comentarios/Vo.Bo. de Tickets se persisten solo en SQLite LAB y generan interacciones locales.
7. Sincronizaciones M2M de Tickets no se ejecutan: responden 501 LAB.

## Migracion 007

`007_operation_portfolio.sql` no crea ni altera tablas. Reutiliza las 93 tablas de Fase 1 y establece `PRAGMA user_version = 7`.

Ajusta unicamente datos ficticios del LAB para generar escenarios deterministas de pruebas: clasificacion comercial, movimientos y fallas BLT adicionales. El total final del fixture queda en 40 tickets.

## Integracion acumulada de root

Fase 7 entrega `core/config.js` completo. Esto es intencional: el cargador principal ahora encadena Fases 1-7 antes de `lab-auth.js`, incluyendo F5 y F6. No se usa un parche ni un script de insercion.

## Aplicacion

Descomprimir el ZIP sobre el repositorio LAB despues de tener Fases 1-6 V002. Los archivos incluidos son archivos completos. La copia debe preservar las rutas del ZIP y sustituir los archivos con la misma ruta.

## Validacion

Ver `FASE_7_VALIDATION_V002.txt`.

No se realizo deploy a GitHub Pages ni E2E visual en navegador publicado.
