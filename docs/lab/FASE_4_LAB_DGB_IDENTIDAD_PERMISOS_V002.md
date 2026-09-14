# FASE 4 — LAB DGB · Identidad, permisos y alcances V002

Fecha: 13/09/2026  
Proyecto: Gestor Mantto · Laboratorio DGB  
Prerrequisitos: FASE 1 V002 + FASE 2 V002 + FASE 3 V002

## Objetivo

Sustituir la autenticación productiva por una identidad sintética de laboratorio y reconstruir, dentro del navegador, las capas de autorización y Alcance de Información que el frontend actual necesita para seguir trabajando con sus contratos `/api/*` sin salir a Azure/Aiven.

Esta fase mantiene la arquitectura ya cerrada:

```text
Frontend actual
   ↓
ManttoAuth / ManttoHttp
   ↓
ManttoLabTransport
   ↓
ManttoLabBackend
   ├── identidad LAB
   ├── permisos efectivos
   ├── Panel de Control
   ├── Visor de Usuarios
   └── alcance GENERAL / CORELLIAN / UNITED
         ↓
      SQLite WASM
         ↓
      IndexedDB
```

## Fuentes verificadas para el contrato

Se revisó el código real vigente de `ziSirrush/GestorMantto` antes de implementar esta fase. Las reglas usadas son las que soportan los archivos reales actuales:

- `backend/src/services/permissions/effective-permission.service.js`: precedencia de permiso personal activo sobre herencia de rol y fail-closed cuando el permiso no existe.
- `backend/src/services/user-viewer.service.js`: permiso `GENERAL_VISOR_USUARIOS_OPERACION.USAR_VISOR` y universo del Visor por Programador / Programador United / Programador Corellian.
- `backend/src/controllers/panel-control.controller.js`: alcance administrativo de Panel de Control y compatibilidad de roles Programador.
- `backend/src/controllers/panel-control-alcance.controller.js`: administración global de Alcance de Información solo por Programador o Director General; Usuarios adicionales solo por Programador.
- `backend/src/services/alcance/alcance-gnral.service.js`, `alcance-cor.service.js`, `alcance-uni.service.js` y `alcance-panel.service.js`: motores separados GENERAL / CORELLIAN / UNITED.
- `backend/src/routes/panel-control.routes.js`: contratos públicos actuales de Panel de Control.

El `main` de laboratorio verificado al preparar esta entrega fue `d3b766477663e6726ea46f1bb08bdc30b01a74e6` (`JIVMBLT/updated_code`).

## Archivos completos modificados

Esta entrega NO contiene parches. Los archivos existentes que se sustituyen completos son:

```text
core/auth.js
core/config.js
lab/index.html
```

Los demás archivos de Fase 4 son nuevos:

```text
lab/backend/routes/lab-auth-permissions.routes.js
lab/backend/services/lab-permissions.service.js
lab/backend/services/lab-scope.service.js
lab/database/migrations/004_permissions_catalog.sql
lab/runtime/lab-auth.js
lab/runtime/lab-phase4-bootstrap.js
lab/styles/lab-phase4.css
tests/lab_phase4_auth_permissions.test.cjs
tests/lab_phase4_sqlite_smoke.py
```

## Identidad LAB

No existe login productivo en esta fase. La interfaz muestra un selector de identidad basado exclusivamente en los 61 usuarios ficticios del seed LAB.

No se copian ni se usan:

- contraseñas reales;
- JWT reales;
- correos personales de producción;
- sesiones productivas;
- tokens de dispositivo productivos.

`core/auth.js` se mantiene como fachada compatible y publica `window.ManttoAuth`, pero delega en `ManttoLabAuth`.

La compatibilidad pública incluye:

```text
init
logout
getToken
getUser
getActorUser
getViewUser
setViewUser
clearViewUser
isViewingAs
createViewerLaunch
hydrateViewerUser
applyUserToHeader
api
apiGet
apiPost
authHeaders
```

El encabezado LAB conserva permanentemente las advertencias:

```text
LABORATORIO DGB
DATOS FICTICIOS
SIN CONEXIÓN A PRODUCCIÓN
```

## Permisos efectivos

La evaluación local conserva la precedencia del backend real:

```text
usuario_permisos activo y vigente
        ↓ prevalece
rol_permisos de cualquier rol activo
        ↓
permiso inexistente / no configurado
        ↓
DENEGADO
```

La migración `004_permissions_catalog.sql` carga el catálogo de referencia y lleva `PRAGMA user_version` a `4`.

Conteos validados:

```text
perm_acciones                    44
perm_agrupaciones                14
perm_modulos                     64
perm_elementos                  129
perm_subelementos               232
perm_subelemento_acciones       510
perm_subelemento_acciones activos 509
rol_permisos                 14,669
```

## Panel de Control

Se implementan localmente los contratos necesarios para permisos, roles e información de sesión.

Regla administrativa verificada:

```text
Programador / Director General
→ GENERAL + UNITED + CORELLIAN

Programador United
→ GENERAL + UNITED

Programador Corellian
→ GENERAL + CORELLIAN
```

Los filtros no son solo visuales: las lecturas y mutaciones validan el dominio permitido antes de consultar o modificar registros.

También se conserva la incompatibilidad real entre:

```text
Programador
vs
Programador United / Programador Corellian
```

## Visor de Usuarios

El Visor exige el permiso efectivo:

```text
GENERAL_VISOR_USUARIOS_OPERACION.USAR_VISOR
```

Universo verificado:

```text
Programador           → todos los usuarios autorizados
Programador United    → UNITED
Programador Corellian → CORELLIAN
```

El contexto visualizado es siempre de solo lectura. Cualquier POST/PUT/PATCH/DELETE dentro del modo visor falla cerrado con `VIEWER_READ_ONLY`.

## Alcance de Información

Los motores quedan separados:

### GENERAL

Utiliza el contrato GENERAL para propiedad/relación de registros. Sin evidencia de propiedad o relación, falla cerrado.

### CORELLIAN

Soporta:

- llave maestra CORELLIAN;
- propio usuario;
- `REPORTA_A` con reportes directos, no recursivos;
- `REL_ADMIN`;
- usuarios adicionales;
- agrupaciones autorizadas.

### UNITED

Soporta:

- llave maestra UNITED;
- zonas operativas provenientes de `usuario_zop` + `z_op`;
- agrupaciones autorizadas.

Una llave maestra UNITED no depende de zonas. Sin llave y sin zonas, el universo visible queda vacío.

### Administración global

La administración global de Alcance de Información reproduce la regla vigente:

```text
Programador       → puede administrar
Director General  → puede administrar
Programador United/Corellian → NO puede administrar alcance global
```

Solo `Programador` puede modificar `usuarios_adicionales`. Director General conserva los existentes al guardar.

## Contratos LAB implementados en Fase 4

Entre los contratos registrados se encuentran:

```text
GET  /api/auth/me
POST /api/auth/refresh
POST /api/auth/logout

GET  /api/panel-control/session-permissions
GET  /api/panel-control/viewer-users
GET  /api/panel-control/viewer-bootstrap
POST /api/panel-control/viewer-context
POST /api/panel-control/viewer-close
GET  /api/panel-control/bootstrap

GET  /api/panel-control/roles/:id/permisos
PUT  /api/panel-control/roles/:id/permisos
GET  /api/panel-control/usuarios/:id/permisos
PUT  /api/panel-control/usuarios/:id/permisos
PUT  /api/panel-control/usuarios/:id/roles

GET  /api/panel-control/usuarios/:id/alcance-informacion
PUT  /api/panel-control/usuarios/:id/alcance-informacion
POST /api/panel-control/alcance-informacion/activacion-masiva

GET/POST/PUT de administración de roles requeridos por el Panel de Control
```

Las rutas de matriz de notificaciones del Panel de Control NO se implementan en esta fase. Permanecen fail-closed/501 hasta la fase que reconstruya el motor de notificaciones.

## Instalación

1. Aplicar previamente Fases 1, 2 y 3 V002.
2. Descomprimir este ZIP.
3. Copiar su contenido sobre la raíz del repositorio LAB conservando carpetas y sobrescribiendo únicamente los archivos incluidos.

Ejemplo PowerShell:

```powershell
$REPO="C:\Users\T14s\Desktop\Nueva-estructura-Modulos\mantto_gestor_frontend"
$ZIP="$env:USERPROFILE\Downloads\FASE_4_LAB_DGB_IDENTIDAD_PERMISOS_V002.zip"
$TMP=Join-Path $env:TEMP "FASE_4_LAB_DGB_IDENTIDAD_PERMISOS_V002"

Remove-Item $TMP -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive $ZIP -DestinationPath $TMP -Force
Copy-Item "$TMP\*" $REPO -Recurse -Force

Set-Location $REPO
git status --short
git diff
```

No se requiere `git apply`, `.patch`, `.diff` ni script de aplicación.

## Validación

Las pruebas locales acumuladas Fases 1–4 están documentadas en `FASE_4_VALIDATION_V002.txt`.

No se ejecutó despliegue ni E2E en GitHub Pages. La validación de esta entrega es local/estática + SQLite/sql.js.
