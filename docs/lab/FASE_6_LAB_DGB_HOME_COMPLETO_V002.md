# FASE 6 — LAB DGB · Home Completo V002

Fecha de generación: 14/09/2026

## Objetivo

Reconstruir dentro del navegador el backend que consume **Home** sin conectar el Laboratorio DGB a la API productiva, Aiven, Azure, Supabase ni ningún almacenamiento externo.

La fase mantiene los contratos `/api/*` que ya usa el frontend, pero los resuelve en:

```text
Frontend Home actual
    ↓
ManttoAuth / ManttoLabTransport
    ↓
ManttoLabBackend + LabRouter
    ↓
Servicios Home / Tareas / Notificaciones / Interacciones
    ↓
SQLite WASM                IndexedDB
(tablas relacionales)      (blobs de archivos)
```

## Prerrequisitos

Aplicar previamente, en orden, las fases V002:

1. `FASE_1_LAB_DGB_SQLITE_WASM_V002`
2. `FASE_2_LAB_DGB_BACKEND_ENGINE_V002`
3. `FASE_3_LAB_DGB_TRANSPORTE_AISLAMIENTO_V002`
4. `FASE_4_LAB_DGB_IDENTIDAD_PERMISOS_V002`
5. `FASE_5_LAB_DGB_SERVICIOS_COMPARTIDOS_V002`

Esta entrega es un **overlay incremental**. No incluye `.patch`, no incluye script `APPLY_FASE_*.ps1` y no modifica GitHub por sí misma.

## Fuentes verificadas antes de construirla

### LAB

- Repositorio: `JIVMBLT/updated_code`
- Branch: `main`
- HEAD verificado: `d3b766477663e6726ea46f1bb08bdc30b01a74e6`
- Commit: `Laboratorio DGB`
- Fecha del commit: `2026-09-14T00:01:41Z`

Se revisó el Home vigente y se decidió **no entregar ni reemplazar**:

- `modules/home/home.js`
- `styles/home.css`
- `core/rich-text.js`

Por lo tanto, la modificación funcional pendiente de Rich Text del LAB se conserva.

### Gestor Mantto real usado como contrato

- Repositorio: `ziSirrush/GestorMantto`
- Branch: `main`
- HEAD verificado: `af76fe08a5c100747a15a155d5989dcdd1ef4023`
- Commit: `Version 091126.24 - Edo Cta`
- Fecha del commit: `2026-09-12T07:10:27Z`

Rutas/servicios inspeccionados:

- `backend/src/modules/home/home.routes.js`
- `backend/src/modules/home/home.service.js`
- `backend/src/modules/home/home.repository.js`
- `backend/src/modules/pendientes/pendientes.routes.js`
- `backend/src/modules/pendientes/pendientes.controller.js`
- `backend/src/modules/pendientes/pendientes.service.js`
- `backend/src/modules/pendientes/pendientes-project-scope.service.js`
- `backend/src/modules/notificaciones/notificaciones.routes.js`
- `backend/src/modules/notificaciones/notificaciones.service.js`
- `backend/src/services/notifications/notification-policy.js`
- `backend/src/modules/interacciones/interacciones.routes.js`
- `backend/src/modules/interacciones/interacciones.controller.js`
- `backend/src/services/interactions/interactions.service.js`

## Alcance funcional implementado

### 1. Home

Implementa:

- `GET /api/home/snapshot`
- `GET /api/home/bootstrap`
- `GET /api/actividad-reciente`

El snapshot usa únicamente las tareas visibles para la identidad efectiva LAB y las interacciones operativas de esa misma identidad.

### 2. Tareas / Pendientes

Implementa el CRUD y operaciones que usa Home:

- personales y colaborativas;
- responsables / seguimiento;
- subtareas;
- prioridad;
- estatus;
- comentarios;
- evidencia directa;
- adjuntos de comentarios;
- lectura de evidencias locales;
- catálogos de área, empresa, usuarios, proyectos y equipos.

Reglas relevantes portadas del backend real:

- PERSONAL: visible solo al creador.
- COLABORATIVA: visible al creador o usuario relacionado.
- editar/eliminar/cambiar estatus: solo creador.
- cambiar prioridad de PERSONAL: solo creador.
- cambiar prioridad de COLABORATIVA: **solo RESPONSABLE**.
- comentar o actualizar subtarea: cualquier usuario con acceso a la tarea.
- el creador no puede agregarse como responsable/seguimiento de su propia tarea.
- título máximo: 255 caracteres.
- prioridad PERSONAL predeterminada: `MEDIA`.
- prioridad COLABORATIVA puede quedar sin valor.

### 3. Alcance de empresa / proyecto / equipo

La selección se valida antes de persistir.

- UNITED usa `ManttoLabSharedAssetsService` de Fase 5 y el alcance `usuario_zop` / llave maestra UNITED.
- CORELLIAN usa el engine de alcance de Fase 4 y `ins_fl`, limitado por usuarios visibles o llave maestra CORELLIAN.
- Solo una identidad con las llaves maestras CORELLIAN **y** UNITED puede seleccionar entre ambas razones sociales.
- Una identidad sin ambas llaves queda limitada a su empresa efectiva.
- Proyecto fuera de alcance: `403 PENDIENTE_PROYECTO_FUERA_ALCANCE`.
- Equipo sin proyecto: `400 PENDIENTE_EQUIPO_REQUIERE_PROYECTO`.
- Equipo fuera del proyecto/alcance: `403 PENDIENTE_EQUIPO_FUERA_ALCANCE`.

El seed LAB usa etiquetas ficticias como `Corellian LAB` y `United Elevadores LAB`. La resolución de dominio reconoce exclusivamente CORELLIAN/UNITED dentro de esas etiquetas; no concede alcance por texto arbitrario.

### 4. Rich Text

La Fase 6 **consume** `window.ManttoRichText.sanitizeHtml()` del archivo LAB vigente `core/rich-text.js`.

No entrega una copia nueva de ese archivo, por lo que no pisa el cambio funcional pendiente.

Si el helper no está disponible durante un arranque incompleto, el fallback convierte el contenido en texto escapado; nunca ejecuta HTML sin sanitizar.

### 5. Archivos locales

Los archivos de Home se guardan en IndexedDB:

- IndexedDB DB: `mantto_lab_dgb_blobs_v1`
- Object store: `blobs`
- Límite: **25 MB por archivo**
- Provider lógico en SQLite: `LAB_INDEXEDDB`

SQLite conserva únicamente metadata y la llave del blob. El acceso genera un `blob:` URL local de sesión.

No se utiliza Azure Blob, Google Drive ni otro proveedor remoto.

### 6. Notificaciones

Implementa:

- listado;
- estado de nuevas;
- marcar abierta;
- volver a marcar nueva;
- lectura de preferencias;
- actualización de preferencias;
- emisión local al asignar una tarea;
- emisión local al comentar una tarea.

La política replica la precedencia verificada del backend real:

```text
si existe matriz Evento ↔ Rol:
    cualquier OBLIGATORIA aplicable => canal activo
    de lo contrario una OPCIONAL aplicable => preferencia personal/default
    sin rol aplicable => denegar

si NO existe matriz activa:
    compatibilidad legacy => visible
```

No se inventan relaciones Evento ↔ Rol faltantes.

### 7. Interacciones

Las mutaciones exitosas de tareas registran interacciones operativas en `usuario_interacciones`.

La API cliente conserva la restricción real:

- `NAVEGACION` / `CONSULTAR` → se omiten con `SOLO_ACCIONES_OPERATIVAS_BACKEND`.
- cualquier intento del cliente de fabricar una interacción operativa → `400`.

Los campos técnicos `metodo_http`, `endpoint`, `ip_address` y `user_agent` no se exponen en el listado público.

## Base de datos

La migración `006_home_services.sql`:

- **NO crea tablas**;
- **NO crea columnas**;
- **NO altera índices**;
- reutiliza el esquema de Fase 1;
- agrega únicamente fixtures 100% sintéticos de diagnóstico;
- establece `PRAGMA user_version = 6`.

Tablas reutilizadas:

- `pendientes`
- `pendientes_usuarios`
- `pendientes_subtareas`
- `pendientes_comentarios`
- `pendientes_archivos`
- `pendientes_comentarios_adjuntos`
- `sup_notificaciones`
- `notificacion_eventos`
- `notificacion_evento_roles`
- `notificacion_preferencias`
- `usuario_interacciones`

## Runtime

`core/config.js` ahora carga Fase 6 después de Fase 5 y antes de `lab-auth.js`.

`lab-auth.js` conserva las claves V2 y las protecciones existentes, pero espera:

```text
ManttoLabPhase6Ready
    ↓ fallback
ManttoLabPhase5Ready
    ↓ fallback
ManttoLabPhase4Ready
```

Así se evita disparar `mantto:auth-ready` antes de registrar las rutas de Home.

El botón **Reset LAB** usa Fase 6 si está disponible y limpia también el IndexedDB local de blobs.

## Instalación manual

Descomprimir el ZIP y copiar su contenido sobre la raíz del repositorio LAB **después de Fase 5 V002**.

Ejemplo PowerShell:

```powershell
$REPO = "C:\Users\T14s\Desktop\Nueva-estructura-Modulos\mantto_gestor_frontend"
$ZIP  = "$env:USERPROFILE\Downloads\FASE_6_LAB_DGB_HOME_COMPLETO_V002.zip"
$TMP  = Join-Path $env:TEMP "FASE_6_LAB_DGB_HOME_COMPLETO_V002"

Remove-Item $TMP -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive -Path $ZIP -DestinationPath $TMP -Force
Copy-Item "$TMP\*" $REPO -Recurse -Force

Set-Location $REPO
git status
git diff -- core/config.js lab/runtime/lab-auth.js
```

No use `robocopy /MIR` para esta fase.

## Validación

Consultar `FASE_6_VALIDATION_V002.txt` para los resultados ejecutados y `FASE_6_LIMITATIONS_V002.md` para lo que no se confirmó.
