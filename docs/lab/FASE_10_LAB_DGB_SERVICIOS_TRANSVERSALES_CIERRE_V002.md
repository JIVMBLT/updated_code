# FASE 10 — LAB DGB · Servicios transversales + cierre técnico V002

Fecha: 2026-09-14  
Línea: `LAB_DGB_V2`  
Prerrequisito: Fases 1–9 V002 aplicadas en orden.

## Objetivo

Cerrar técnicamente el Laboratorio DGB sin introducir backend remoto ni una segunda fuente operativa. Esta fase completa persistencia/recuperación local, Blob Store, jobs de navegador, diagnóstico técnico, PWA LAB y validación acumulativa F1→F10.

## Baseline verificado

- Repositorio LAB: `JIVMBLT/updated_code`.
- Rama: `main`.
- Commit revisado antes de generar esta fase: `d3b766477663e6726ea46f1bb08bdc30b01a74e6`.
- Árbol revisado: `a0c78d785842ca7dfc1b987a68b43a50aa1f399e`.

No se realizó ninguna escritura en GitHub.

## Respaldo local

`lab-backup.service.js` exporta un sobre JSON `MANTTO_LAB_DGB_BACKUP` que contiene:

- bytes completos de SQLite en Base64;
- SHA-256 de SQLite cuando Web Crypto está disponible;
- `lineage` y `userVersion`;
- contenido del Blob Store local con metadatos y bytes Base64.

La importación es fail-closed: verifica formato, línea `LAB_DGB_V2`, `user_version = 10`, firma SQLite, conteo de tablas, tablas mínimas, llaves foráneas y SHA-256 cuando está disponible. Antes de sustituir los datos guarda el estado local actual para intentar rollback si falla la restauración del Blob Store.

`lab-db.js` ahora expone `inspectBytes()` y `replaceWithBytes()` valida la base candidata antes de cerrar la base activa.

## Blob Store

Se amplía el Blob Store existente; no se crea otro almacén binario. Se agregan:

- `list()`;
- `exportAll()`;
- `validateImportEntries()`;
- `importAll()`.

Se conserva el mismo IndexedDB `mantto_lab_dgb_blobs_v1`, la misma store `blobs` y el límite existente de 25 MB por archivo.

## Jobs simulados

Los jobs viven únicamente mientras la página está abierta. No representan cron, worker de Azure ni proceso de servidor.

- `notifications-refresh`: cada 30 segundos, usando el servicio local de notificaciones.
- `integrity-check`: `PRAGMA foreign_key_check`.
- `persist-database`: persistencia explícita a IndexedDB.
- `storage-summary`: bytes SQLite y Blob Store.

## Diagnóstico técnico

Se agregan seis rutas `__lab`. Todas requieren sesión LAB y rol efectivo Programador/Programador United/Programador Corellian. No se usa un rol administrativo amplio como sustituto.

El inventario acumulativo después de registrar F10 es de **288 rutas locales**: 172 GET, 58 POST, 19 PUT, 23 PATCH y 16 DELETE. F10 agrega 6 rutas sobre las 282 previas.

## PWA LAB

Se agrega una PWA específica bajo `lab/`:

- `manifest.webmanifest`;
- `sw.js`;
- `runtime/lab-pwa.js`;
- icono SVG LAB.

El Service Worker tiene scope `/lab/`, usa solamente recursos same-origin del LAB, ignora `/api/` y no contiene hosts productivos. El registro no amplía control al frontend raíz.

## Base de datos

`010_technical_closure.sql` no crea ni altera tablas, columnas o índices. Solo establece:

```sql
PRAGMA user_version = 10;
```

Resultado acumulativo validado:

```text
Tablas                     93
PRAGMA user_version        10
Foreign key violations      0
```

## Archivos completos

La fase entrega archivos completos. Los archivos existentes modificados son:

- `core/config.js`
- `lab/index.html`
- `lab/runtime/lab-auth.js`
- `lab/runtime/lab-db.js`
- `lab/backend/services/lab-blob-store.js`

Los demás archivos de implementación F10 son nuevos. No se entregan parches ni scripts APPLY.

## Estado externo

No se modificó GitHub, Aiven, Azure, Netlify, Google Drive ni Google Sheets. No se realizó deploy ni validación E2E publicada en GitHub Pages.
