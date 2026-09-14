# FASE 8 - Matriz de rutas V002

Fuente de esta matriz: `lab/backend/routes/lab-sales-collections.routes.js` de la propia entrega.

| # | Area | Metodo | Ruta | Ejecucion LAB |
|---:|---|---|---|---|
| 1 | Ventas - Dashboard | `GET` | `/api/ventas/dashboard/usuarios` | Servicio local SQLite/IndexedDB |
| 2 | Ventas - Dashboard | `GET` | `/api/ventas/dashboard/kpis` | Servicio local SQLite/IndexedDB |
| 3 | Ventas - Dashboard | `GET` | `/api/ventas/dashboard/tablas` | Servicio local SQLite/IndexedDB |
| 4 | Ventas - Dashboard | `GET` | `/api/ventas/dashboard/operacion` | Servicio local SQLite/IndexedDB |
| 5 | Ventas - Dashboard | `GET` | `/api/ventas/dashboard/pdf/capabilities` | Servicio local SQLite/IndexedDB |
| 6 | Ventas - Dashboard | `GET` | `/api/ventas/dashboard/pdf/prepare` | Servicio local SQLite/IndexedDB |
| 7 | Ventas - Dashboard | `GET` | `/api/ventas/dashboard/pdf/data` | Servicio local SQLite/IndexedDB |
| 8 | Ventas - Clientes | `POST` | `/api/ventas/clientes/sync` | 501 local - integracion deshabilitada |
| 9 | Ventas - Clientes | `GET` | `/api/ventas/clientes/catalogos` | Servicio local SQLite/IndexedDB |
| 10 | Ventas - Clientes | `GET` | `/api/ventas/clientes/asesores-asignables` | Servicio local SQLite/IndexedDB |
| 11 | Ventas - Clientes | `GET` | `/api/ventas/clientes/kpis` | Servicio local SQLite/IndexedDB |
| 12 | Ventas - Clientes | `GET` | `/api/ventas/clientes` | Servicio local SQLite/IndexedDB |
| 13 | Ventas - Clientes | `GET` | `/api/ventas/clientes/:id` | Servicio local SQLite/IndexedDB |
| 14 | Ventas - Clientes | `POST` | `/api/ventas/clientes` | Servicio local SQLite/IndexedDB |
| 15 | Ventas - Clientes | `PUT` | `/api/ventas/clientes/:id` | Servicio local SQLite/IndexedDB |
| 16 | Ventas - Clientes | `PATCH` | `/api/ventas/clientes/:id` | Servicio local SQLite/IndexedDB |
| 17 | Ventas - Clientes | `DELETE` | `/api/ventas/clientes/:id` | Servicio local SQLite/IndexedDB |
| 18 | Ventas - Clientes | `GET` | `/api/ventas/clientes/:id/contactos` | Servicio local SQLite/IndexedDB |
| 19 | Ventas - Clientes | `POST` | `/api/ventas/clientes/:id/contactos` | Servicio local SQLite/IndexedDB |
| 20 | Ventas - Clientes | `PUT` | `/api/ventas/clientes/:id/contactos/:idContacto` | Servicio local SQLite/IndexedDB |
| 21 | Ventas - Clientes | `PATCH` | `/api/ventas/clientes/:id/contactos/:idContacto` | Servicio local SQLite/IndexedDB |
| 22 | Ventas - Clientes | `PATCH` | `/api/ventas/clientes/:id/contactos/:idContacto/principal` | Servicio local SQLite/IndexedDB |
| 23 | Ventas - Clientes | `DELETE` | `/api/ventas/clientes/:id/contactos/:idContacto` | Servicio local SQLite/IndexedDB |
| 24 | Ventas - Cotizaciones | `POST` | `/api/ventas/cotizaciones/sync` | 501 local - integracion deshabilitada |
| 25 | Ventas - Cotizaciones | `POST` | `/api/ventas/cotizaciones/comentarios/sync` | 501 local - integracion deshabilitada |
| 26 | Ventas - Cotizaciones | `GET` | `/api/ventas/cotizaciones/catalogos` | Servicio local SQLite/IndexedDB |
| 27 | Ventas - Cotizaciones | `GET` | `/api/ventas/cotizaciones/kpis` | Servicio local SQLite/IndexedDB |
| 28 | Ventas - Cotizaciones | `GET` | `/api/ventas/cotizaciones/embudo` | Servicio local SQLite/IndexedDB |
| 29 | Ventas - Cotizaciones | `GET` | `/api/ventas/cotizaciones/vendidos` | Servicio local SQLite/IndexedDB |
| 30 | Ventas - Cotizaciones | `GET` | `/api/ventas/cotizaciones/perdidos` | Servicio local SQLite/IndexedDB |
| 31 | Ventas - Cotizaciones | `GET` | `/api/ventas/cotizaciones/proyeccion` | Servicio local SQLite/IndexedDB |
| 32 | Ventas - Cotizaciones | `GET` | `/api/ventas/cotizaciones/proyectos-interes` | Servicio local SQLite/IndexedDB |
| 33 | Ventas - Cotizaciones | `GET` | `/api/ventas/cotizaciones/historial` | Servicio local SQLite/IndexedDB |
| 34 | Ventas - Cotizaciones | `GET` | `/api/ventas/cotizaciones/:id/historial` | Servicio local SQLite/IndexedDB |
| 35 | Ventas - Cotizaciones | `GET` | `/api/ventas/cotizaciones` | Servicio local SQLite/IndexedDB |
| 36 | Ventas - Cotizaciones | `GET` | `/api/ventas/cotizaciones/:id/comentarios` | Servicio local SQLite/IndexedDB |
| 37 | Ventas - Cotizaciones | `POST` | `/api/ventas/cotizaciones/:id/comentarios` | Servicio local SQLite/IndexedDB |
| 38 | Ventas - Cotizaciones | `PATCH` | `/api/ventas/cotizaciones/:id/comentarios/:idComentario` | Servicio local SQLite/IndexedDB |
| 39 | Ventas - Cotizaciones | `DELETE` | `/api/ventas/cotizaciones/:id/comentarios/:idComentario` | Servicio local SQLite/IndexedDB |
| 40 | Ventas - Cotizaciones | `GET` | `/api/ventas/cotizaciones/:id/archivos` | Servicio local SQLite/IndexedDB |
| 41 | Ventas - Cotizaciones | `POST` | `/api/ventas/cotizaciones/:id/archivos` | Servicio local SQLite/IndexedDB |
| 42 | Ventas - Cotizaciones | `GET` | `/api/ventas/cotizaciones/:id/archivos/:idArchivo/acceso` | Servicio local SQLite/IndexedDB |
| 43 | Ventas - Cotizaciones | `GET` | `/api/ventas/cotizaciones/:id/archivos/:idArchivo` | Servicio local SQLite/IndexedDB |
| 44 | Ventas - Cotizaciones | `PATCH` | `/api/ventas/cotizaciones/:id/archivos/:idArchivo` | Servicio local SQLite/IndexedDB |
| 45 | Ventas - Cotizaciones | `DELETE` | `/api/ventas/cotizaciones/:id/archivos/:idArchivo` | Servicio local SQLite/IndexedDB |
| 46 | Ventas - Cotizaciones | `PATCH` | `/api/ventas/cotizaciones/:id/estatus` | Servicio local SQLite/IndexedDB |
| 47 | Ventas - Cotizaciones | `PATCH` | `/api/ventas/cotizaciones/:id/asignacion` | Servicio local SQLite/IndexedDB |
| 48 | Ventas - Cotizaciones | `GET` | `/api/ventas/cotizaciones/:id/editar-bootstrap` | Servicio local SQLite/IndexedDB |
| 49 | Ventas - Cotizaciones | `GET` | `/api/ventas/cotizaciones/:id/interes` | Servicio local SQLite/IndexedDB |
| 50 | Ventas - Cotizaciones | `PUT` | `/api/ventas/cotizaciones/:id/interes` | Servicio local SQLite/IndexedDB |
| 51 | Ventas - Cotizaciones | `GET` | `/api/ventas/cotizaciones/:id` | Servicio local SQLite/IndexedDB |
| 52 | Ventas - Cotizaciones | `POST` | `/api/ventas/cotizaciones` | Servicio local SQLite/IndexedDB |
| 53 | Ventas - Cotizaciones | `PUT` | `/api/ventas/cotizaciones/:id` | Servicio local SQLite/IndexedDB |
| 54 | Ventas - Cotizaciones | `DELETE` | `/api/ventas/cotizaciones/:id` | Servicio local SQLite/IndexedDB |
| 55 | Ventas - Prospeccion | `POST` | `/api/ventas/prospeccion/sync` | 501 local - integracion deshabilitada |
| 56 | Ventas - Prospeccion | `POST` | `/api/ventas/prospeccion/comentarios/sync` | 501 local - integracion deshabilitada |
| 57 | Ventas - Prospeccion | `GET` | `/api/ventas/prospeccion/catalogos-captura` | Servicio local SQLite/IndexedDB |
| 58 | Ventas - Prospeccion | `GET` | `/api/ventas/prospeccion/fuentes` | Servicio local SQLite/IndexedDB |
| 59 | Ventas - Prospeccion | `GET` | `/api/ventas/prospeccion/contactos` | Servicio local SQLite/IndexedDB |
| 60 | Ventas - Prospeccion | `POST` | `/api/ventas/prospeccion` | Servicio local SQLite/IndexedDB |
| 61 | Ventas - Prospeccion | `GET` | `/api/ventas/prospeccion/catalogos` | Servicio local SQLite/IndexedDB |
| 62 | Ventas - Prospeccion | `GET` | `/api/ventas/prospeccion/kpis` | Servicio local SQLite/IndexedDB |
| 63 | Ventas - Prospeccion | `GET` | `/api/ventas/prospeccion/mapa` | Servicio local SQLite/IndexedDB |
| 64 | Ventas - Prospeccion | `GET` | `/api/ventas/prospeccion` | Servicio local SQLite/IndexedDB |
| 65 | Ventas - Prospeccion | `GET` | `/api/ventas/prospeccion/detalle/catalogos` | Servicio local SQLite/IndexedDB |
| 66 | Ventas - Prospeccion | `PATCH` | `/api/ventas/prospeccion/:id/estatus` | Servicio local SQLite/IndexedDB |
| 67 | Ventas - Prospeccion | `PATCH` | `/api/ventas/prospeccion/:id/cotizacion` | Servicio local SQLite/IndexedDB |
| 68 | Ventas - Prospeccion | `POST` | `/api/ventas/prospeccion/:id/comentarios` | Servicio local SQLite/IndexedDB |
| 69 | Ventas - Prospeccion | `GET` | `/api/ventas/prospeccion/:id/archivos/:idArchivo/acceso` | Servicio local SQLite/IndexedDB |
| 70 | Ventas - Prospeccion | `DELETE` | `/api/ventas/prospeccion/:id/archivos/:idArchivo` | Servicio local SQLite/IndexedDB |
| 71 | Ventas - Prospeccion | `GET` | `/api/ventas/prospeccion/:id` | Servicio local SQLite/IndexedDB |
| 72 | Ventas - Redes | `POST` | `/api/ventas/redes/importar-backup` | 501 local - integracion deshabilitada |
| 73 | Ventas - Redes | `POST` | `/api/ventas/redes/comentarios/importar-backup` | 501 local - integracion deshabilitada |
| 74 | Ventas - Redes | `GET` | `/api/ventas/redes/catalogos` | Servicio local SQLite/IndexedDB |
| 75 | Ventas - Redes | `GET` | `/api/ventas/redes/usuarios-asignables` | Servicio local SQLite/IndexedDB |
| 76 | Ventas - Redes | `GET` | `/api/ventas/redes/cotizaciones-activas` | Servicio local SQLite/IndexedDB |
| 77 | Ventas - Redes | `GET` | `/api/ventas/redes` | Servicio local SQLite/IndexedDB |
| 78 | Ventas - Redes | `POST` | `/api/ventas/redes` | Servicio local SQLite/IndexedDB |
| 79 | Ventas - Redes | `GET` | `/api/ventas/redes/:id/archivos` | Servicio local SQLite/IndexedDB |
| 80 | Ventas - Redes | `POST` | `/api/ventas/redes/:id/archivos` | Servicio local SQLite/IndexedDB |
| 81 | Ventas - Redes | `GET` | `/api/ventas/redes/:id/archivos/:idArchivo/acceso` | Servicio local SQLite/IndexedDB |
| 82 | Ventas - Redes | `DELETE` | `/api/ventas/redes/:id/archivos/:idArchivo` | Servicio local SQLite/IndexedDB |
| 83 | Ventas - Redes | `GET` | `/api/ventas/redes/:id/comentarios` | Servicio local SQLite/IndexedDB |
| 84 | Ventas - Redes | `POST` | `/api/ventas/redes/:id/comentarios` | Servicio local SQLite/IndexedDB |
| 85 | Ventas - Redes | `PATCH` | `/api/ventas/redes/:id/comentarios/:idComentario` | Servicio local SQLite/IndexedDB |
| 86 | Ventas - Redes | `PUT` | `/api/ventas/redes/:id/comentarios/:idComentario` | Servicio local SQLite/IndexedDB |
| 87 | Ventas - Redes | `DELETE` | `/api/ventas/redes/:id/comentarios/:idComentario` | Servicio local SQLite/IndexedDB |
| 88 | Ventas - Redes | `POST` | `/api/ventas/redes/:id/comentarios/:idComentario/adjuntos` | Servicio local SQLite/IndexedDB |
| 89 | Ventas - Redes | `GET` | `/api/ventas/redes/:id/comentarios/:idComentario/adjuntos/:idAdjunto/acceso` | Servicio local SQLite/IndexedDB |
| 90 | Ventas - Redes | `DELETE` | `/api/ventas/redes/:id/comentarios/:idComentario/adjuntos/:idAdjunto` | Servicio local SQLite/IndexedDB |
| 91 | Ventas - Redes | `PATCH` | `/api/ventas/redes/:id/estatus` | Servicio local SQLite/IndexedDB |
| 92 | Ventas - Redes | `PATCH` | `/api/ventas/redes/:id/asignacion` | Servicio local SQLite/IndexedDB |
| 93 | Ventas - Redes | `PATCH` | `/api/ventas/redes/:id/cotizacion` | Servicio local SQLite/IndexedDB |
| 94 | Ventas - Redes | `GET` | `/api/ventas/redes/:id` | Servicio local SQLite/IndexedDB |
| 95 | Ventas - Redes | `PUT` | `/api/ventas/redes/:id` | Servicio local SQLite/IndexedDB |
| 96 | Ventas - Redes | `PATCH` | `/api/ventas/redes/:id` | Servicio local SQLite/IndexedDB |
| 97 | Ventas - Redes | `DELETE` | `/api/ventas/redes/:id` | Servicio local SQLite/IndexedDB |
| 98 | Cobranza UNITED | `POST` | `/api/cobranza-uni/sync` | 501 local - integracion deshabilitada |
| 99 | Cobranza UNITED | `GET` | `/api/cobranza-uni/gestion-credito` | Servicio local SQLite/IndexedDB |
| 100 | Cobranza UNITED | `GET` | `/api/cobranza-uni/gestion-credito/:id/detalle` | Servicio local SQLite/IndexedDB |
| 101 | Cobranza UNITED | `GET` | `/api/cobranza-uni/venta-adicional` | Servicio local SQLite/IndexedDB |
| 102 | Cobranza UNITED | `GET` | `/api/cobranza-uni/venta-adicional/:id/detalle` | Servicio local SQLite/IndexedDB |
| 103 | Cobranza UNITED | `POST` | `/api/cobranza-uni/detalle-mp-2026/sync` | 501 local - integracion deshabilitada |
| 104 | Cobranza UNITED | `GET` | `/api/cobranza-uni/detalle-mp-2026` | Servicio local SQLite/IndexedDB |
| 105 | Cobranza UNITED | `GET` | `/api/cobranza-uni/detalle-mp-2026/:id` | Servicio local SQLite/IndexedDB |
| 106 | Cobranza CORELLIAN | `POST` | `/api/cobranza-cor/carga/indice` | 501 local - integracion deshabilitada |
| 107 | Cobranza CORELLIAN | `POST` | `/api/cobranza-cor/carga/fuente` | 501 local - integracion deshabilitada |
| 108 | Cobranza CORELLIAN | `POST` | `/api/cobranza-cor/carga/aditivas` | 501 local - integracion deshabilitada |
| 109 | Cobranza CORELLIAN | `GET` | `/api/cobranza-cor/estados-cuenta` | Servicio local SQLite/IndexedDB |
| 110 | Cobranza CORELLIAN | `GET` | `/api/cobranza-cor/estados-cuenta/:idIndiceCor` | Servicio local SQLite/IndexedDB |
| 111 | Cobranza CORELLIAN | `GET` | `/api/cobranza-cor/aditivas` | Servicio local SQLite/IndexedDB |
| 112 | Cobranza CORELLIAN | `POST` | `/api/cobranza-cor/aditivas` | Servicio local SQLite/IndexedDB |
| 113 | Cobranza CORELLIAN | `GET` | `/api/cobranza-cor/aditivas/:idAditivaCor` | Servicio local SQLite/IndexedDB |
| 114 | Cobranza CORELLIAN | `PUT` | `/api/cobranza-cor/aditivas/:idAditivaCor` | Servicio local SQLite/IndexedDB |
| 115 | Cobranza CORELLIAN | `GET` | `/api/cobranza-cor/adeudos-contractuales` | Servicio local SQLite/IndexedDB |
| 116 | Diagnostico LAB | `GET` | `/api/__lab/sales-collections-status` | Servicio local SQLite/IndexedDB |

## Resumen

- Ventas - Dashboard: 7
- Ventas - Clientes: 16
- Ventas - Cotizaciones: 31
- Ventas - Prospeccion: 17
- Ventas - Redes: 26
- Cobranza UNITED: 8
- Cobranza CORELLIAN: 10
- Diagnostico LAB: 1

- Total: 116
- Integraciones bloqueadas localmente: 12
