# FASE 2 — LAB DGB · Backend Engine en navegador V002

## Estado

**Entrega válida de la línea V002.**

Esta fase reemplaza conceptualmente a la antigua Fase 2 V001 anulada. No contiene archivos ".patch", no usa `git apply` y no incluye scripts que modifiquen fragmentos de archivos.

## Objetivo

Construir el núcleo de backend del Laboratorio DGB **íntegramente dentro del navegador**, sin Node/Express en runtime y sin consumir una API HTTP.

La Fase 2 se apoya en `FASE_1_LAB_DGB_SQLITE_WASM_V002` y agrega:

- router local para contratos conceptuales `/api/*`;
- parámetros `:id` y comodín `*`;
- query string con soporte de claves repetidas;
- headers y body JSON / URL encoded / FormData;
- middleware encadenable;
- objetos `req` / `res` compatibles con el patrón usado por controllers del backend real;
- respuestas HTTP simuladas con `status`, `headers`, `body` y `ok`;
- normalización de 404 y errores controlados;
- transacción SQLite automática para POST/PUT/PATCH/DELETE;
- contexto preparado para Auth, Viewer y Alcance de Información de Fase 4;
- rutas de diagnóstico exclusivamente LAB.

## Prerrequisito exacto

Debe estar aplicada previamente:

`FASE_1_LAB_DGB_SQLITE_WASM_V002`

SHA-256 del ZIP de Fase 1 usado para esta validación acumulada:

`7a290d07d99a9859921d7790b77e4a9222924c2b1ca939305c0c55c8cee08a52`

Fase 2 **no repite** los archivos de SQLite WASM, schema, seed ni vendor de Fase 1 porque no fueron modificados.

## Baseline de código revisado

Repositorio LAB: `JIVMBLT/updated_code`  
Branch: `main`  
Commit verificado al generar esta fase:

`d3b766477663e6726ea46f1bb08bdc30b01a74e6`

La Fase 1 V002 se construyó sobre ese baseline y Fase 2 se construye sobre el estado acumulado **baseline + Fase 1 V002**.

## Referencia de backend real revisada

Se verificaron en `ziSirrush/GestorMantto/main`:

- `backend/src/app.js`: el backend real monta middleware, luego `/api` y termina con `notFoundHandler` + `errorHandler`.
- `backend/src/middleware/error.middleware.js`: 404 con `Ruta no encontrada`, `method` y `path`; errores 5xx ocultan el detalle público salvo exposición explícita.

Fase 2 reproduce ese patrón como motor JavaScript local, no como servidor HTTP.

## Archivos nuevos

```text
lab/backend/lab-errors.js
lab/backend/lab-context.js
lab/backend/lab-router.js
lab/backend/lab-backend.js
lab/backend/routes/lab-system.routes.js
lab/runtime/lab-backend-bootstrap.js
tests/lab_phase2_backend_engine.test.cjs
docs/lab/FASE_2_LAB_DGB_BACKEND_ENGINE_V002.md
docs/lab/FASE_2_FILES_V002.txt
docs/lab/FASE_2_VALIDATION_V002.txt
docs/lab/FASE_2_CHECKSUMS_V002.sha256
```

## Archivo modificado y entregado completo

```text
lab/index.html
```

No se entrega un diff de este archivo. El ZIP contiene el archivo completo final de Fase 2.

## API pública del Backend Engine

Después de inicializar:

```javascript
await ManttoLabBackendReady;

ManttoLabBackend.getStatus();
ManttoLabBackend.listRoutes();
ManttoLabBackend.use('/api', middleware);
ManttoLabBackend.register(method, path, handlers, options);

const response = await ManttoLabBackend.dispatch('/api/ruta', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ejemplo: true })
});

const body = await ManttoLabBackend.request('/api/ruta');
```

`dispatch()` entrega una respuesta local:

```javascript
{
  status: 200,
  ok: true,
  headers: {},
  body: {}
}
```

`request()` devuelve el body cuando la respuesta es 2xx y lanza `ManttoLabApiError` en respuestas no exitosas.

## Contrato req/res local

Los handlers reciben, entre otros:

```javascript
req.method;
req.path;
req.originalUrl;
req.params;
req.query;
req.headers;
req.body;
req.context;
req.contextUser;
req.user;
req.actorUser;
req.viewUser;
req.viewerContext;
req.informationAccess;
req.db;
req.get('header');

res.status(200).json({ ok: true });
```

## Transacciones SQLite

Por defecto:

- GET / HEAD / OPTIONS: no abren transacción automática.
- POST / PUT / PATCH / DELETE: usan `ManttoLabDB.transaction(...)`.

Una ruta puede declarar `{ transaction:false }` cuando sea estrictamente de diagnóstico o no modifique SQLite.

Si el handler lanza error durante una mutación, la transacción se revierte.

## Fail closed

Una ruta registrada que termina sin producir respuesta no devuelve éxito implícito. Falla con:

`LAB_HANDLER_NO_RESPONSE`

Esto evita ocultar controllers incompletos durante la reconstrucción.

## Contrato 404 de este motor

Ruta inexistente:

```json
{
  "ok": false,
  "message": "Ruta no encontrada",
  "method": "GET",
  "path": "/api/no-existe"
}
```

El 501 `LAB_MOCK_NOT_IMPLEMENTED` para rutas `/api/*` todavía no portadas pertenece a **Fase 3**, cuando el transporte del frontend principal quede interceptado y aislado de producción.

## Rutas de diagnóstico de Fase 2

```text
GET  /api/__lab/health
GET  /api/__lab/routes
GET  /api/__lab/data-counts
POST /api/__lab/echo/:id
```

Son contratos exclusivos del Laboratorio DGB. No pertenecen a GestorMantto productivo.

## Lo que NO cambia todavía

Fase 2 no modifica:

- `index.html` principal;
- `core/http.js`;
- `core/auth.js`;
- `core/config.js`;
- `_redirects`;
- rutas funcionales de módulos;
- schema o seed SQLite;
- `PRAGMA user_version`, que permanece en 1.

El frontend principal todavía no utiliza `ManttoLabBackend`. Eso corresponde a Fase 3.

## Instalación por sustitución directa

No usar `git apply`.

Desde PowerShell:

```powershell
$REPO="C:\Users\T14s\Desktop\Nueva-estructura-Modulos\mantto_gestor_frontend"
$ZIP="$env:USERPROFILE\Downloads\FASE_2_LAB_DGB_BACKEND_ENGINE_V002.zip"
$TMP=Join-Path $env:TEMP "FASE_2_LAB_DGB_BACKEND_ENGINE_V002"

Remove-Item $TMP -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive $ZIP -DestinationPath $TMP -Force
Copy-Item "$TMP\*" $REPO -Recurse -Force

Set-Location $REPO
git status --short
```

La copia agrega los archivos nuevos y **sustituye el `lab/index.html` completo** de Fase 1 por el de Fase 2.

## Validación local

```powershell
node --test .\tests\lab_phase2_backend_engine.test.cjs
node --check .\lab\backend\lab-errors.js
node --check .\lab\backend\lab-context.js
node --check .\lab\backend\lab-router.js
node --check .\lab\backend\lab-backend.js
node --check .\lab\backend\routes\lab-system.routes.js
node --check .\lab\runtime\lab-backend-bootstrap.js
```

Para validación manual del diagnóstico:

```powershell
npx http-server -p 5500
```

Abrir:

`http://localhost:5500/lab/`

## Validaciones realizadas al generar el ZIP

Consultar `FASE_2_VALIDATION_V002.txt`.

Se ejecutaron pruebas de sintaxis, tests unitarios del Backend Engine y nuevamente los smoke tests de Fase 1 sobre una instalación acumulada Fase 1 + Fase 2.

No se realizó despliegue ni prueba E2E en GitHub Pages. No se modificó GitHub remoto, Azure, Aiven, Netlify ni el repositorio productivo.
