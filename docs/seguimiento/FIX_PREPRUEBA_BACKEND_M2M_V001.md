# FIX_PREPRUEBA_BACKEND_M2M_V001

Estado: IMPLEMENTADO / pendiente de prueba local.
Fecha: 2026-08-12
Firma: ASTER-MG

## Alcance

1. Unificar la configuracion SSL de MySQL/Aiven en `DB_SSL`.
2. Eliminar del contrato de ejemplo `DB_SSL_REJECT_UNAUTHORIZED`.
3. Corregir un `ReferenceError` potencial en `instalaciones-proyecto-drive.service.js`.

## Archivos modificados

- `backend/src/config/db.js`
- `backend/.env.example`
- `backend/src/modules/instalaciones-proyecto-drive/instalaciones-proyecto-drive.service.js`

## Regla SSL

- `DB_SSL=true`: usa TLS hacia Aiven con `rejectUnauthorized: false`, compatible con el comportamiento historico del proyecto.
- `DB_SSL=false`: desactiva SSL solamente para un entorno que expresamente lo requiera.
- No se usa `DB_SSL_REJECT_UNAUTHORIZED`.

## Correccion Fase 4

Dentro de `processBatch()`, el log usaba `sourceRecords.length`, variable fuera de scope. Se cambia por `records.length`, que corresponde al lote recibido por la funcion.

## Prueba local recomendada

- Mantener `INTEGRATION_AUTH_ENABLED=false`.
- Configurar `DB_SSL=true` en `.env`.
- Opcionalmente usar `WEB_PUSH_ENABLED=false` durante la prueba para reducir ruido de logs.
- Ejecutar `npm run check`.
- Ejecutar `npm start`.
- Validar `/api/health`.
