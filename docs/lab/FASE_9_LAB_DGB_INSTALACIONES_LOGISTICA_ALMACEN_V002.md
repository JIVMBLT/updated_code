# FASE 9 — LAB DGB · Instalaciones + Producción/Logística + Almacén V002

Fecha: 2026-09-14  
Línea: LAB_DGB_V2  
Prerrequisito: Fases 1–8 V002 aplicadas en orden.

## Objetivo

Incorporar al backend ejecutado completamente en navegador los dominios de Instalaciones, Producción/Logística y Almacén sin crear una API remota ni permitir acceso a Azure, Aiven, Google Sheets, Google Drive o fuentes productivas.

## Regla de entrega

Esta fase contiene archivos completos. No contiene `.patch`, `.diff`, `git apply` ni scripts `APPLY_FASE*.ps1`.

## Implementación

### Instalaciones

- Lectura de proyectos desde `ins_fl` con alcance CORELLIAN y relaciones locales de proyecto.
- Detalle y actualización de campos operativos ya existentes.
- Relación Proyecto ↔ Carpeta usando `instalaciones_drive_carpetas` e `instalaciones_proyecto_drive`.
- Usuarios relacionados mediante `instalaciones_proyecto_usuarios`.
- Documentos LAB almacenados como Blob en IndexedDB; SQLite conserva metadatos en `instalaciones_bitacora_documentos`.
- `drive_file_id` usa el prefijo `LAB_BLOB:` exclusivamente dentro de LAB. No representa un ID real de Google Drive.
- Sincronizaciones reales de Drive quedan cerradas con `501 LAB_MOCK_NOT_IMPLEMENTED`.

### Producción / Logística

- CRUD local sobre `logistica_produccion`.
- Consulta por alcance CORELLIAN.
- Resumen semanal local.
- Configuración y columnas devueltas desde LAB sin Google Sheets.
- Archivos CPVO/GM en IndexedDB; metadatos en `logistica_produccion_archivos` con `storage_provider=LAB_INDEXEDDB`.
- Los límites del esquema existente se respetan: CPVO 1–2, GM 1–10 y máximo 25 MB por archivo.
- Sincronizaciones Google Sheets y migraciones productivas quedan deshabilitadas.

### Almacén

- Inventario local desde `almacen_fuente_excel`.
- Movimientos locales desde registros no INVENTARIO del mismo histórico.
- Dashboard LAB calculado desde la información local.
- Excepciones de reabasto en `almacen_stock_reabasto_excepciones`.
- Auditoría física en `almacen_auditoria`, con BORRADOR → EN_PROCESO → CERRADO.
- Importación Excel/sincronización externa queda deshabilitada en esta fase. El fixture ya cargado en SQLite es la fuente LAB.

## Base de datos

La migración `009_installations_logistics_warehouse.sql` no crea tablas ni columnas. Solo avanza `PRAGMA user_version = 9`. El esquema acumulativo continúa en 93 tablas.

## Integración acumulativa

`core/config.js` ahora carga Fase 9 antes de `lab-auth.js`. `lab-auth.js` espera `ManttoLabPhase9Ready` y el botón Reset ejecuta el reset acumulativo hasta Fase 9.

## Rutas

La fase agrega 39 contratos `/api/*` locales. Ver `FASE_9_ROUTE_MATRIX_V002.md`.

## Validación

Se ensambló una instalación acumulativa F1→F9 y se volvieron a ejecutar todas las pruebas existentes de F1→F8 más F9. Resultado: PASS. Ver `FASE_9_VALIDATION_V002.txt`.

## Límites

No se realizó deploy ni prueba visual E2E en GitHub Pages. No se realizó ninguna escritura sobre GitHub remoto, Azure, Aiven, Google Drive, Google Sheets ni Netlify.
