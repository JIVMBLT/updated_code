# Gestor Mantto — Laboratorio DGB

Repositorio de laboratorio: `JIVMBLT/updated_code`.

Estado de esta entrega: **Fases 1–11 integradas**. La Fase 11 cierra la compatibilidad de la entrada raíz del frontend con el runtime LAB y no modifica GitHub Pages.

## Arquitectura activa

Frontend existente → `/api/*` → Backend LAB en navegador → SQLite WASM → IndexedDB.

Los binarios del laboratorio usan IndexedDB Blob Store. No existe backend Node/MySQL activo dentro de esta arquitectura LAB.

## Entradas

- `/index.html`: Gestor Mantto completo usando el runtime LAB.
- `/lab/index.html`: consola técnica/diagnóstico del Laboratorio DGB.

## Aislamiento

`core/config.js` mantiene `MANTTO_LAB_MODE=true`, usa transporte same-origin y declara las conexiones productivas como no permitidas. `lab/runtime/lab-transport.js` resuelve `/api/*` dentro del navegador y aplica los bloqueos definidos por las fases anteriores.

Todos los datos de `lab/database/seed.sql` son fixtures de laboratorio. La base se persiste en IndexedDB mediante SQLite WASM.

## Fase 11

Esta fase:

- normaliza en runtime los textos heredados de Aiven de la entrada raíz para mostrarlos como LAB DGB;
- restaura `manifest.json` como manifiesto local del LAB, evitando la referencia rota del `index.html` raíz;
- restaura `core/data-sync.js` como coordinador de sincronización compatible y sin transporte propio;
- restaura `core/push-notifications.js` como fachada LAB segura, sin Push remoto ni registro del Service Worker productivo;
- limpia `.gitignore` de rutas heredadas del backend eliminado;
- conserva `PRAGMA user_version = 10`; no agrega migración 011;
- no cambia rutas API ni esquema SQLite;
- no modifica `.github/workflows/pages.yml`.

## Eliminaciones manuales de cierre

Después de copiar los archivos de esta fase, eliminar únicamente si todavía existen:

- `tools/validar_fix_notificaciones_layout_v001.py`
- `tools/validar_fix_notificaciones_popover_v002.py`

No se entrega script de borrado, `.patch`, `.diff` ni `git apply`.

## Instalación

Prerequisito: Fases 1–10 V002 aplicadas sobre `updated_code/main`, baseline verificado en commit `dc2296db8cb6670199dde9b2b2597372789ec9ff`.

Copiar el contenido de este paquete sobre la raíz del repositorio respetando exactamente las rutas y sobrescribiendo los archivos existentes. Los archivos incluidos son completos.

Luego ejecutar las eliminaciones manuales indicadas arriba y revisar `git status` antes del commit.

## Validación

Ver:

- `docs/lab/FASE_11_VALIDATION_V001.txt`
- `docs/lab/FASE_11_LIMITATIONS_V001.md`
- `docs/lab/FASE_11_FILES_V001.txt`
- `docs/lab/FASE_11_CHECKSUMS_V001.sha256`

La validación de esta entrega es estática/contractual. **No se declara E2E visual de GitHub Pages.**
