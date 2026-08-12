# FIX_CORS_LOCAL_DEV_V001

Estado: IMPLEMENTADO / pendiente de prueba local.
Fecha: 2026-08-12
Firma: ASTER-MG

## Origen del problema

El backend rechazaba los preflight `OPTIONS` antes de llegar a los controladores:

- `/api/estados-visuales`
- `/api/criticidad-corporativa`
- `/api/auth/refresh`
- `/api/auth/login`

El error era `403` desde `src/config/http.config.js`, por lo que `EstadosVisuales_gnral` solo mostraba el efecto secundario `Failed to fetch`.

## Cambio aplicado

- Se conserva `credentials: true`.
- En `NODE_ENV != production` se permiten automáticamente:
  - `localhost`
  - `127.0.0.1`
  - `::1`
  - `0.0.0.0`
  - redes privadas RFC1918: `10.x.x.x`, `172.16-31.x.x`, `192.168.x.x`
- El puerto puede variar durante desarrollo (Live Server/PWA local).
- En producción NO se habilitan redes privadas automáticamente.
- En producción y para cualquier origen no-local se mantiene la lista exacta `CORS_ORIGINS`.
- `CORS_ORIGINS=*` no abre credenciales a cualquier origen web.

## Archivos modificados

- `backend/src/config/http.config.js`
- `backend/.env.example`

## Validación recomendada

1. `npm run check`
2. `npm start`
3. Abrir el frontend local y confirmar que desaparecen los `OPTIONS ... 403`.
4. Probar login.
5. Confirmar carga de Estados Visuales y criticidad corporativa.
6. Validar `/api/health`.

Este FIX parte del estado GitHub `ENV update 2.1` y no revierte `FIX_PREPRUEBA_BACKEND_M2M_V001`.
