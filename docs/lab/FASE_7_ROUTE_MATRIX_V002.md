# Matriz de rutas - Fase 7 V002

## Operacion

- GET `/api/operacion/resumen-dia/inicial`
- GET `/api/operacion/dashboard-call-center/inicial`
- GET `/api/operacion/dashboard-operativo/inicial`
- GET `/api/servicios-preventivos/resumen-supervisor`

## Criticos / MTBC / U365

- GET `/api/equipos-criticos`
- GET `/api/equipos-criticos/:codigo/tickets`
- GET `/api/proyectos-criticos`
- GET `/api/proyectos-criticos/:proyecto/tickets`
- GET `/api/indicadores/mtbc/equipos`
- GET `/api/indicadores/mtbc/proyectos`
- GET `/api/callcenter/u365/equipos`
- GET `/api/callcenter/u365/proyectos`
- GET `/api/criticidad-corporativa`

## Portafolio y detalle

- GET `/api/portafolio/dashboard/inicial`
- GET `/api/portafolio/dashboard`
- GET `/api/portafolio/dashboard/equipos`
- GET `/api/portafolio/equipos`
- GET `/api/portafolio/equipos/:codigo`
- POST `/api/portafolio/equipos/tickets-lote`
- GET `/api/portafolio/proyectos/detalle/:proyecto`
- GET `/api/proyectos/detalle`
- GET `/api/proyectos/detalle/:proyecto`
- GET `/api/proyectos/:proyecto`

Las rutas compartidas de Fase 5 `/api/portafolio/filtros` y `/api/proyectos?detalle=1` delegan a F7 cuando F7 esta cargada.

## Movimientos

- GET `/api/portafolio/movimientos/inicial`
- GET `/api/portafolio/movimientos`
- GET `/api/portafolio/movimientos/:codigo/detalle`
- GET `/api/portafolio/movimientos-semanales/catalogo`
- GET `/api/portafolio/movimientos-semanales`
- POST `/api/portafolio/movimientos-semanales/corte`

## Seguimiento Especial

- GET `/api/portafolio/seguimiento-especial`
- GET `/api/proyectos/:proyecto/seguimiento-especial`
- PUT `/api/proyectos/:proyecto/seguimiento-especial`
- GET `/api/equipos/:codigo/seguimiento-especial`
- PUT `/api/equipos/:codigo/seguimiento-especial`

## Tickets

- GET `/api/tickets`
- GET `/api/tickets/:ticket/interacciones`
- POST `/api/tickets/:ticket/comentarios`
- POST `/api/tickets/:ticket/validacion`
- GET `/api/tickets/:ticket`
- POST `/api/tickets/:ticket/vobo`

## M2M deshabilitado en LAB

- POST `/api/tickets/sync` -> 501 `LAB_MOCK_NOT_IMPLEMENTED`
- POST `/api/tickets/sync-fechas-cdmx` -> 501 `LAB_MOCK_NOT_IMPLEMENTED`

## Diagnostico

- GET `/api/__lab/phase7`
