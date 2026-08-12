# FASE 3 - ACTIVACION Y VALIDACION M2M/HMAC V001

Fecha: 2026-08-12  
Proyecto: Mantto Gestor  
Estado inicial: POR VALIDAR EN AZURE

## Objetivo

Activar la autenticacion M2M/HMAC preparada en Fases 1 y 2 y comprobar que las integraciones automaticas quedan protegidas sin afectar rutas humanas.

Esta fase NO modifica controladores, repositorios, tablas, payloads ni logica funcional de sincronizacion.

## Precondiciones

Antes de activar:

1. Fase 1 desplegada.
2. Fase 2 desplegada.
3. Backend inicia correctamente con `INTEGRATION_AUTH_ENABLED=false`.
4. Las seis identidades y secretos existen en Azure.
5. Los Apps Script finales tienen el mismo Integration ID y secreto correspondiente.
6. `INTEGRATION_TIMESTAMP_TOLERANCE_SECONDS=300` y `INTEGRATION_HMAC_ALGORITHM=sha256`, salvo decision posterior documentada.

## Activacion

Cambiar exclusivamente en Azure:

```env
INTEGRATION_AUTH_ENABLED=true
```

Despues reiniciar el App Service y validar el arranque del backend.

No cambiar secretos durante esta activacion.

## Validacion minima del backend

Confirmar:

- proceso Node inicia;
- conexion Aiven OK;
- `/api/health` responde correctamente;
- no existen excepciones de carga de middleware/rutas;
- no existen errores por variables M2M faltantes.

## Pruebas negativas obligatorias

Con AUTH=true, una ruta M2M debe responder 401 cuando:

- faltan headers;
- el Integration ID es desconocido;
- el timestamp esta vencido;
- la firma es incorrecta;
- una identidad valida intenta usar una ruta asignada a otra integracion.

Codigos esperados del middleware:

- `INTEGRATION_AUTH_HEADERS_MISSING`
- `INTEGRATION_AUTH_UNKNOWN_ID`
- `INTEGRATION_AUTH_EXPIRED_TIMESTAMP`
- `INTEGRATION_AUTH_INVALID_SIGNATURE`
- `INTEGRATION_AUTH_WRONG_ROUTE_ID`

## Prueba segura incluida

Archivo:

```text
backend/scripts/validate-m2m-auth.js
```

El script usa `{"registros":[]}` para las pruebas positivas, evitando una carga real de datos. Una firma valida puede recibir 2xx o un 4xx funcional del controlador por payload vacio; lo importante es que no reciba 401/403/404 del guard/ruta.

Ejemplo local con Node 22 y variables cargadas:

```text
node --env-file=.env backend/scripts/validate-m2m-auth.js
```

Si el script se ejecuta desde la carpeta `backend`:

```text
node --env-file=.env scripts/validate-m2m-auth.js
```

No guardar secretos en el script ni en GitHub.

## Pruebas reales Apps Script

Despues de validar el guard, ejecutar una por una:

1. FL
2. Tickets
3. Portafolio
4. Logistica
5. Instalaciones Drive
6. Ventas

Resultado esperado: las llamadas firmadas reales deben superar HMAC y conservar el comportamiento funcional previo.

Un HTTP 200 en estas pruebas, con AUTH=true, ya valida tanto conectividad como firma HMAC para esa integracion.

## Rutas protegidas

### FL
- `POST /api/ins-fl/sync`

### Tickets
- `POST /api/tickets/sync`
- `POST /api/tickets/sync-fechas-cdmx`

### Portafolio
- `POST /api/portafolio/sync`

### Logistica
- `POST /api/logistica/sync`

### Instalaciones Drive
- `POST /api/instalaciones/drive/carpetas/sync`
- `POST /api/instalaciones/proyecto-drive/sync`

### Ventas
- `POST /api/ventas/clientes/sync`
- `POST /api/ventas/cotizaciones/sync`
- `POST /api/ventas/cotizaciones/comentarios/sync`
- `POST /api/ventas/prospeccion/sync`
- `POST /api/ventas/prospeccion/comentarios/sync`
- `POST /api/ventas/redes/importar-backup`
- `POST /api/ventas/redes/comentarios/importar-backup`

## Rollback inmediato

Si una integracion critica queda bloqueada:

```env
INTEGRATION_AUTH_ENABLED=false
```

Reiniciar App Service.

Esto devuelve temporalmente el comportamiento definido por Fase 2 para AUTH=false y permite investigar sin retirar el codigo HMAC.

## Fuera de alcance

- Flexibilidad por registro dentro de lotes: Fase 4.
- Replay protection persistente: pendiente separado; la ventana temporal actual no equivale a proteccion persistente contra replay.
- Cambios de frontend.
- Cambios de BD.
- Cambios de payload o reglas de negocio.

## Criterio de cierre

Fase 3 queda APROBADA solo cuando:

1. backend estable con AUTH=true;
2. controles negativos devuelven 401 correctamente;
3. las seis integraciones reales superan HMAC;
4. no hay regresiones en rutas humanas;
5. se documentan las incidencias encontradas.
