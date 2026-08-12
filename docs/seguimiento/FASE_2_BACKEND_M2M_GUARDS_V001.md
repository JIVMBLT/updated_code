# FASE 2 — Backend M2M / Guards V001

Estado: IMPLEMENTADO / PENDIENTE DE DEPLOY Y VALIDACION
Fecha: 2026-08-12
Firma: ASTER-MG

## Objetivo
Aplicar autenticacion M2M/HMAC a las rutas de integracion ya preparadas en Apps Script, sin cambiar payloads, logica de negocio, base de datos ni frontend.

## Rutas protegidas cuando INTEGRATION_AUTH_ENABLED=true

- FL: `POST /api/ins-fl/sync` → `INTEGRATION_INS_FL_ID`
- Tickets: `POST /api/tickets/sync` → `INTEGRATION_TICKETS_ID`
- Tickets fechas CDMX: `POST /api/tickets/sync-fechas-cdmx` → `INTEGRATION_TICKETS_ID`
- Portafolio: `POST /api/portafolio/sync` → `INTEGRATION_PORTAFOLIO_ID`
- Logistica: `POST /api/logistica/sync` → `INTEGRATION_LOGISTICA_ID`
- Instalaciones Drive: `POST /api/instalaciones/drive/carpetas/sync` → `INTEGRATION_INSTALACIONES_DRIVE_ID`
- Instalaciones Proyecto Drive: `POST /api/instalaciones/proyecto-drive/sync` → `INTEGRATION_INSTALACIONES_DRIVE_ID`
- Ventas Clientes: `POST /api/ventas/clientes/sync` → `INTEGRATION_VENTAS_ID`
- Ventas Cotizaciones: `POST /api/ventas/cotizaciones/sync` → `INTEGRATION_VENTAS_ID`
- Ventas Comentarios Cotizaciones: `POST /api/ventas/cotizaciones/comentarios/sync` → `INTEGRATION_VENTAS_ID`
- Ventas Prospeccion: `POST /api/ventas/prospeccion/sync` → `INTEGRATION_VENTAS_ID`
- Ventas Comentarios Prospeccion: `POST /api/ventas/prospeccion/comentarios/sync` → `INTEGRATION_VENTAS_ID`
- Ventas Redes: `POST /api/ventas/redes/importar-backup` → `INTEGRATION_VENTAS_ID`
- Ventas Comentarios Redes: `POST /api/ventas/redes/comentarios/importar-backup` → `INTEGRATION_VENTAS_ID`

## Compatibilidad durante Fase 2
`INTEGRATION_AUTH_ENABLED` debe permanecer en `false`.

- Rutas que antes eran publicas continúan publicas mientras el switch este apagado.
- Cotizaciones y Prospeccion conservan su proteccion anterior mientras el switch este apagado: `requireAuth` + `requireHistoricalSyncEnabled`.
- Al activar HMAC en Fase 3, esas rutas dejan de exigir JWT humano y pasan a exigir exclusivamente la identidad M2M de Ventas.

Esto evita abrir accidentalmente endpoints historicos durante el despliegue intermedio.

## Cambio de middleware
`integration-auth.middleware.js` incorpora `requireIntegrationAuthFor(...)` para limitar cada ruta a su Integration ID esperado. Una firma valida de otra integracion no autoriza acceso cruzado.

## Fuera de alcance
- Flexibilidad por registro / tolerancia de lotes: Fase 4.
- Replay protection persistente: pendiente arquitectonico separado.
- Cambios frontend, DB, payloads y Apps Script: ninguno.

## Deploy
1. Aplicar Fase 1 si aun no esta aplicada.
2. Aplicar estos archivos.
3. Mantener `INTEGRATION_AUTH_ENABLED=false`.
4. Reiniciar backend y validar `/api/health` + logs.
5. No cambiar a `true` hasta Fase 3.
