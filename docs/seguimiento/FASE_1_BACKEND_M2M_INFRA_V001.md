# FASE 1 — Backend M2M / HMAC — Infraestructura V001

**Estado:** IMPLEMENTADO / PENDIENTE DE DEPLOY Y VALIDACION EN AZURE  
**Fecha:** 2026-08-12  
**Responsable tecnico:** Aster — ASTER-MG

## Alcance

Esta fase incorpora exclusivamente la infraestructura base de autenticacion maquina-a-maquina. No protege rutas todavia y no cambia controladores, servicios, repositorios, payloads ni logica de negocio.

## Archivos

- `backend/src/app.js` — captura el cuerpo crudo mediante `verify` de Express.
- `backend/src/middleware/raw-body.middleware.js` — conserva los bytes exactos recibidos.
- `backend/src/middleware/integration-auth.middleware.js` — valida ID, timestamp y firma HMAC usando comparacion segura.
- `backend/.env.example` — documenta el contrato M2M sin secretos reales.

## Contrato HMAC

Cadena canonica:

`timestamp + "\\n" + METHOD + "\\n" + originalUrl + "\\n" + rawBody`

- Algoritmo esperado actualmente: `sha256`.
- Firma: hexadecimal.
- Timestamp: Unix en segundos; tambien se acepta entrada de 13 digitos y se normaliza a segundos.
- Ventana temporal: `INTEGRATION_TIMESTAMP_TOLERANCE_SECONDS` (300 por defecto).
- Comparacion: `crypto.timingSafeEqual`.

## Importante

1. `INTEGRATION_AUTH_ENABLED=false` debe mantenerse durante el deploy de esta fase.
2. `requireIntegrationAuth` NO se monta en rutas en esta fase; eso corresponde a FASE 2.
3. `INTEGRATION_REPLAY_PROTECTION_ENABLED` ya forma parte del contrato de configuracion de Azure, pero la proteccion persistente contra replay no se implementa en esta fase. La unica proteccion temporal actual es la ventana del timestamp.
4. No se modifican rutas humanas ni autenticacion JWT.
5. No se cambia la logica batch ni la tolerancia por registro; ese endurecimiento permanece como pendiente separado.

## Criterio de cierre de FASE 1

- `npm run check` exitoso.
- Sintaxis Node valida en los tres archivos JavaScript involucrados.
- `createApp()` puede construirse con la configuracion existente.
- Deploy Azure con `INTEGRATION_AUTH_ENABLED=false` sin regresiones de arranque.
