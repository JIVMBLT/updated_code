# FASE 9 — Limitaciones verificadas V002

1. **No hay conexión real a Google Drive.** Las carpetas y documentos se simulan localmente. Los archivos viven en IndexedDB.
2. **No hay conexión real a Google Sheets.** Los endpoints de sincronización quedan en `501 LAB_MOCK_NOT_IMPLEMENTED`.
3. **No hay importación Excel en runtime en Fase 9.** Almacén utiliza el fixture SQLite ya preparado; la importación externa queda cerrada.
4. **Permisos de escritura.** El snapshot de permisos conocido contiene permisos visuales/consulta para Logística y Almacén, pero no una matriz completa de acciones CRUD para todas las mutaciones. Para permitir pruebas de escritura sin inventar nuevos códigos de permiso, esas mutaciones conservan la puerta funcional disponible del módulo + puerta de agrupación + alcance de información. No se afirma que esa granularidad sea idéntica a producción.
5. **Documentos de Instalaciones.** El esquema existente fue reutilizado sin agregar columnas. `drive_file_id` puede contener `LAB_BLOB:<key>` solo dentro del laboratorio.
6. **No se ejecutó E2E visual publicado en GitHub Pages.** Las pruebas ejecutadas fueron de sintaxis, SQLite/WASM, servicios, contratos, aislamiento y regresión acumulativa.
