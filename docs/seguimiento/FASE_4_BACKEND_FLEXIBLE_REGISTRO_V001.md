# FASE 4 — BACKEND FLEXIBLE POR REGISTRO V001

Fecha: 2026-08-12  
Estado: IMPLEMENTADO / PENDIENTE DE DEPLOY Y VALIDACIÓN REAL

## Objetivo

Alinear las sincronizaciones masivas con el patrón tolerante ya usado en Tickets: un registro inválido o una escritura individual fallida no debe rechazar el lote completo. Los registros válidos continúan y la respuesta HTTP puede ser 200 con detalle de rechazados.

## Alcance aplicado

- `ins_fl`: errores de validación o escritura se reportan por registro; se usan SAVEPOINTS por fila.
- `log_ops`: mismo patrón por registro.
- `portafolio`: cada fila se intenta de forma independiente; una fila fallida no detiene las siguientes.
- `instalaciones_drive_carpetas`: SAVEPOINT por carpeta y errores individuales.
- `instalaciones_proyecto_drive`: errores de normalización, duplicidad y referencias con índice ya no tumban el bloque; errores estructurales globales siguen siendo fatales.
- `ventas_clientes`: SAVEPOINT por registro.
- `ventas_cotizaciones`: el UPSERT se ejecuta por registro dentro del bloque, con SAVEPOINT individual.
- `ventas_prospeccion` y comentarios: errores de escritura se aíslan por registro y la respuesta conserva `ok:true` con `parcial:true` cuando hay rechazados.
- `ventas_redes` y comentarios: mismo comportamiento tolerante por registro.

## Contrato de respuesta

Los procesos modificados mantienen `ok:true` cuando la solicitud fue procesable aunque existan registros rechazados. Cuando aplica se agrega `parcial:true` y se conserva el arreglo de errores/rechazos.

Los errores estructurales que impiden procesar de forma segura toda la solicitud (por ejemplo, falla de conexión, error de esquema o invariantes globales) continúan produciendo error HTTP.

## Fuera de alcance

- No se cambian rutas ni guards M2M.
- No se modifican Apps Script.
- No se modifica la base de datos ni se crean tablas/columnas.
- No se cambia lógica de negocio ajena a sincronización.
- `ventas/cotizaciones/comentarios/sync` no se modifica en esta fase porque el service actual no expone `syncComentariosHistoricos`; es una inconsistencia preexistente que debe corregirse por separado antes de validar ese endpoint específico.

## Archivos modificados

1. `backend/src/controllers/ins-fl.controller.js`
2. `backend/src/controllers/logistica.controller.js`
3. `backend/src/controllers/data.controller.legacy.js`
4. `backend/src/modules/instalaciones-drive/instalaciones-drive.service.js`
5. `backend/src/modules/instalaciones-drive/instalaciones-drive.repository.js`
6. `backend/src/modules/instalaciones-proyecto-drive/instalaciones-proyecto-drive.service.js`
7. `backend/src/modules/ventas-clientes/ventas-clientes.service.js`
8. `backend/src/modules/ventas-cotizaciones/ventas-cotizaciones.service.js`
9. `backend/src/modules/ventas-prospeccion/ventas-prospeccion.service.js`
10. `backend/src/modules/ventas-redes/ventas-redes-sync.service.js`

## Validación requerida después del deploy

Para cada integración, enviar un lote que contenga al menos un registro válido y uno inválido conocido. La respuesta esperada es HTTP 200, procesamiento del válido y detalle individual del rechazado. Después confirmar en Aiven que el registro válido sí quedó aplicado y el inválido no produjo escritura parcial.
