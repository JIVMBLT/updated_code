# FASE 8 - LAB DGB - Ventas + Cobranza V002

## Objetivo

Reconstruir dentro del navegador la capa de **Ventas** y **Cobranza** del Gestor Mantto usando la arquitectura LAB ya establecida en Fases 1 a 7 V002.

Esta fase no levanta un servidor HTTP ni consume Aiven/Azure. Los contratos `/api/*` se resuelven localmente por `ManttoLabBackend` y sus servicios contra SQLite WASM persistido en IndexedDB.

## Baselines verificados durante la generacion

- LAB `JIVMBLT/updated_code` main: `d3b766477663e6726ea46f1bb08bdc30b01a74e6`.
- Referencia productiva `ziSirrush/GestorMantto` main: `1e54c9b1a21925585f828915f0c62158ba85b58e`.

La referencia productiva se uso solamente para leer contratos actuales de rutas, permisos, formas de respuesta y reglas de alcance. No se escribio en ese repositorio.

## Arquitectura

```text
Frontend existente
   -> /api/*
ManttoLabTransport
   -> ManttoLabBackend / LabRouter
      -> lab-sales.service.js
      -> lab-collections-uni.service.js
      -> lab-collections-cor.service.js
         -> SQLite WASM
            -> IndexedDB
```

Los archivos binarios asociados a Cotizaciones, Prospeccion y Redes usan el Blob Store local de IndexedDB introducido por las fases anteriores. No se llama Azure Blob ni Drive.

## Alcance implementado

### Ventas

- Dashboard Ventas: selector comercial, KPI, tablas comerciales, tablas operativas y datos para PDF generado por navegador.
- Clientes: catalogos, KPI, listado, detalle, alta, edicion, baja logica y contactos.
- Cotizaciones: catalogos, KPI, embudo, vendidos, perdidos, proyeccion, listado, detalle, comentarios, archivos, historial, asignacion, estatus, alta/edicion/baja y Proyectos de interes personales.
- Prospeccion: catalogos de captura, fuentes, contactos, KPI, listado, mapa, detalle, alta, comentarios, archivos, cambio de estatus y liga con cotizacion.
- Asignacion de Redes: catalogos, usuarios asignables, cotizaciones activas, listado, detalle, evidencia, comentarios/adjuntos, estatus, asignacion y relacion con cotizacion.

### Cobranza UNITED

- Gestion de credito y detalle.
- Venta adicional y detalle.
- Detalle MP 2026 y detalle de registro.
- Alcance territorial basado en evidencia canonica de zona.

### Cobranza CORELLIAN

- Estados de cuenta y detalle.
- Aditivas: listado, alta, detalle y modificacion.
- Adeudos contractuales.

## Contratos registrados

La fase registra **116 rutas locales**:

- Ventas: 97
- Cobranza UNITED: 8
- Cobranza CORELLIAN: 10
- Diagnostico LAB: 1

Por metodo: GET 61, POST 24, PATCH 14, PUT 7, DELETE 10.

Ver `docs/lab/FASE_8_ROUTE_MATRIX_V002.md` para la matriz completa.

## Integraciones productivas deliberadamente bloqueadas

Se preservan 12 rutas historicas/de integracion para que el frontend reciba un contrato explicito, pero en LAB responden `501 LAB_MOCK_NOT_IMPLEMENTED`. Ninguna intenta salir a produccion.

## Alcance de informacion

- Ventas usa CORELLIAN + agrupacion `VENTAS`.
- Cotizaciones se limitan por `id_asesor` / `id_admin` cuando el usuario no tiene dominio completo.
- Clientes respetan el modelo productivo de iniciales comerciales de usuarios visibles.
- Redes se limita por `id_usuario_asignado`.
- Cobranza UNITED usa puerta `COBRANZA_UNI` y evidencia de zona canonica.
- Cobranza CORELLIAN usa agrupacion `COBRANZA`.
- El Visor continua en solo lectura para mutaciones.

## Migracion 008

`lab/database/migrations/008_sales_collections.sql`:

- No crea tablas.
- No agrega columnas.
- No agrega indices.
- Reutiliza las tablas ya incluidas en el snapshot Fase 1.
- Establece `PRAGMA user_version = 8`.
- Ajusta exclusivamente fixtures sinteticos LAB para que existan escenarios deterministas de Ventas/Cobranza y permisos funcionales de prueba.

Las asignaciones de permisos de la migracion son **fixtures de laboratorio**. No se presentan como matriz de roles productiva.

## Datos de prueba despues de la migracion

```text
ventas_clientes              10
ventas_cotizaciones_cor      10
ventas_prospecciones         10
ventas_redes                 10
gestion_credito              15
detalle_mp_2026              15
cobranza_indice_cor          10
cobranza_fuente_cor          20
cobranza_aditivas_cor        10
PRAGMA user_version           8
foreign_key_violations        0
```

## Archivos completos

Esta entrega no contiene parches. `core/config.js`, `lab/index.html` y `lab/runtime/lab-auth.js` se incluyen completos porque cambian para integrar Fase 8 en la cadena acumulativa. Los servicios/rutas/migracion/tests de F8 son archivos completos nuevos.

## Aplicacion

Prerequisito: repositorio LAB con Fases 1 a 7 V002 aplicadas.

Descomprimir el ZIP preservando las rutas y sustituir los archivos existentes con los incluidos. No se requiere `git apply`.

## Validacion

Se ejecuto regresion acumulativa Fases 1 a 8 V002 y termino en `PASS`. Ver `docs/lab/FASE_8_VALIDATION_V002.txt`.

No se realizo deploy a GitHub Pages ni una prueba E2E visual publicada.
