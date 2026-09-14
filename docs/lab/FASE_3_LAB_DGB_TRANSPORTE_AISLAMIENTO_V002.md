# FASE 3 — LAB DGB · Transporte local y aislamiento V002

## Estado

Entrega incremental sobre:

1. `FASE_1_LAB_DGB_SQLITE_WASM_V002`
2. `FASE_2_LAB_DGB_BACKEND_ENGINE_V002`

Baseline GitHub verificado antes de preparar la fase:

- Repositorio LAB: `JIVMBLT/updated_code`
- Rama: `main`
- Commit: `d3b766477663e6726ea46f1bb08bdc30b01a74e6`

## Objetivo

Eliminar el transporte HTTP productivo del Laboratorio DGB y conservar los contratos conceptuales `/api/*` del frontend.

```text
Frontend actual
      ↓
ManttoHttp / fetch('/api/*')
      ↓
ManttoLabTransport
      ↓
ManttoLabBackend
      ↓
LabRouter
      ↓
SQLite WASM
      ↓
IndexedDB
```

No se implementan todavía identidad, JWT LAB, roles ni scopes. Eso pertenece a Fase 4.

## Archivos completos entregados

### Modificados

- `core/config.js`
- `core/http.js`
- `_redirects`
- `lab/index.html`

### Nuevos

- `lab/runtime/lab-transport.js`
- `tests/lab_phase3_transport.test.cjs`
- documentación de esta fase

No se entregan `.patch`, `git apply`, scripts PowerShell de búsqueda/reemplazo ni archivos parciales.

## Reglas de transporte

### `/api/*`

Toda petición cuyo pathname sea `/api` o empiece por `/api/` se resuelve contra `ManttoLabBackend`.

No existe fallback HTTP.

Si el backend LAB todavía no implementa la ruta, el transporte transforma el 404 interno en:

```json
{
  "ok": false,
  "message": "Funcionalidad no implementada en LAB.",
  "code": "LAB_MOCK_NOT_IMPLEMENTED",
  "method": "GET",
  "path": "/api/..."
}
```

con estado HTTP conceptual `501`.

### Hosts productivos bloqueados

El guard reconoce y bloquea destinos de aplicación asociados con:

- Azure App Service (`*.azurewebsites.net`)
- Aiven (`*.aivencloud.com`)
- Supabase (`*.supabase.co`)
- Railway (`*.railway.app`, `*.up.railway.app`)
- Google Apps Script (`script.google.com`, `script.googleusercontent.com`)

Una URL productiva que apunte a `/api/*` se redirige al backend LAB por su pathname y nunca se envía a la red.

Una URL productiva no API falla con `LAB_EXTERNAL_CONNECTION_BLOCKED`.

También se bloquean mutaciones `POST/PUT/PATCH/DELETE` hacia orígenes externos desconocidos.

Los `GET` estáticos no productivos permanecen permitidos para no romper recursos como bibliotecas visuales externas ya usadas por el frontend.

## Guardas instaladas

- `fetch`
- `XMLHttpRequest`
- `navigator.sendBeacon` cuando el navegador permite sustituirlo
- `WebSocket`
- `EventSource`

El mensaje de auditoría de bloqueo es:

```text
[LAB DGB] BLOQUEADA PETICION PRODUCTIVA
```

## `core/config.js`

El LAB deja de configurar Azure como `MANTTO_API_BASE` y `MANTTO_SESSION_API_BASE`.

Ambos quedan en mismo origen para conservar compatibilidad con el frontend.

Además, como el `index.html` vigente ya carga `core/config.js` antes de Push, Device Permissions, Auth y HTTP, Fase 3 usa ese archivo como bootstrap parser-blocking de los runtimes LAB de Fases 1–3. Esto evita modificar el `index.html` principal en esta fase.

## `core/http.js`

`ManttoHttp.request('/api/...')` usa directamente `ManttoLabTransport.request()` cuando `MANTTO_LAB_MODE=true`.

Los `fetch('/api/...')` legacy también quedan cubiertos por el bridge y por el guard global de transporte.

Se conserva:

- deduplicación GET/HEAD;
- caché TTL;
- encabezados de contexto;
- eventos `mantto:data-mutated`;
- carga de templates estáticos.

## `_redirects`

Se elimina el proxy Netlify `/api/auth/* → Azure`.

El archivo queda únicamente como declaración LAB sin reglas de redirección.

## Frontera de fase

Después de Fase 3:

- DB local: sí.
- Backend Engine: sí.
- Transporte local `/api/*`: sí.
- Bloqueo productivo: sí.
- Login LAB: no.
- Identidades/roles/scopes LAB: no.

Por ello, el frontend principal todavía puede recibir `501 LAB_MOCK_NOT_IMPLEMENTED` en rutas de Auth hasta aplicar Fase 4. Esto es deliberado y evita inventar autenticación antes de su fase.

## Instalación

Copiar el contenido del ZIP sobre la raíz del repositorio LAB después de haber aplicado Fases 1 y 2 V002.

Ejemplo de copia completa de archivos, sin patch:

```powershell
$REPO="C:\Users\T14s\Desktop\Nueva-estructura-Modulos\mantto_gestor_frontend"
$ZIP="$env:USERPROFILE\Downloads\FASE_3_LAB_DGB_TRANSPORTE_AISLAMIENTO_V002.zip"
$TMP=Join-Path $env:TEMP "FASE_3_LAB_DGB_TRANSPORTE_AISLAMIENTO_V002"

Remove-Item $TMP -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive $ZIP -DestinationPath $TMP -Force
Copy-Item "$TMP\*" $REPO -Recurse -Force

Set-Location $REPO
git status --short
git diff -- core/config.js core/http.js _redirects lab/index.html
```

## Validación

Se ejecutó validación acumulada sobre Fase 1 + Fase 2 + Fase 3:

- Python SQLite smoke F1: PASS
- sql.js/WASM smoke F1: PASS
- Fase 2 Backend Engine: 11/11 PASS
- Fase 3 Transport: 10/10 PASS
- `node --check`: PASS
- recursos requeridos F1/F2/F3 presentes: PASS
- `_redirects` sin proxy productivo: PASS
- `core/config.js` sin URL Azure/Aiven: PASS
- `core/http.js` sin URL Azure/Aiven: PASS
- `.patch`: 0
- `APPLY_FASE*.ps1`: 0

No se ejecutó E2E en GitHub Pages ni se modificó GitHub remoto.
