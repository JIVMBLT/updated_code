# FIX_SYNCS_TICKETS_PORTAFOLIO_V001

## Causa confirmada

`backend/src/routes/data.routes.js` monta primero el router de Catalogos y despues Tickets y Portafolio.

El router de Catalogos tenia:

```js
router.use(requireAuth);
```

Como ese router esta montado sin prefijo dentro de `data.routes.js`, el middleware se ejecutaba para cualquier request posterior que atravesara ese agregador, incluyendo:

- `POST /api/tickets/sync`
- `POST /api/tickets/sync-fechas-cdmx`
- `POST /api/portafolio/sync`

Por eso las peticiones M2M eran rechazadas antes de llegar a sus guards HMAC con:

```json
{"ok":false,"message":"Sesión requerida."}
```

FL, Logistica, Instalaciones Drive y Ventas no presentaban el problema porque sus routers se montan directamente en `routes/index.js` antes de `dataRoutes`.

## Cambio aplicado

Se elimina el `router.use(requireAuth)` global del router de Catalogos y se aplica `requireAuth` individualmente a las cinco rutas humanas de Catalogos.

Esto conserva la proteccion de Catalogos y evita que intercepte los SYNC M2M de Tickets y Portafolio.

## Archivo modificado

- `backend/src/modules/catalogos/catalogos.routes.js`

## No modificado

- Auth/login/JWT/sesiones.
- Middleware M2M/HMAC.
- Tickets controller/service/repository.
- Portafolio controller/service/repository.
- FL, Logistica, Drive o Ventas.
- Frontend.

## Validacion requerida despues del deploy

1. Reiniciar/deployar backend.
2. Confirmar `/api/health`.
3. Ejecutar `POST /api/tickets/sync` desde Apps Script y confirmar HTTP 200.
4. Ejecutar `POST /api/portafolio/sync` y confirmar HTTP 200.
5. Confirmar que Catalogos sigue requiriendo sesion desde el frontend.
