# Gestor Mantto · LAB DGB · Fase 5 V002

## Objetivo

Incorporar la capa de **servicios compartidos** del Gestor Mantto dentro del backend ejecutable en navegador, reutilizando SQLite WASM + IndexedDB y los contratos `/api/*` ya existentes en el proyecto real.

Esta fase **no crea un backend HTTP**, **no consume Aiven**, **no consume Azure** y **no introduce datos productivos**.

## Baseline revisado antes de programar

- Laboratorio: `JIVMBLT/updated_code`, rama `main`, HEAD observado `d3b766477663e6726ea46f1bb08bdc30b01a74e6`.
- Referencia funcional: `ziSirrush/GestorMantto`, rama `main`, con rutas/controladores/servicios vigentes revisados para Usuarios, Catálogos, Relaciones Administrativas, Proyectos y Portafolio.
- Prerrequisito local: Fases 1, 2, 3 y 4 **V002**.

## Arquitectura

```text
Frontend existente
      ↓
ManttoHttp / fetch('/api/*')
      ↓
ManttoLabTransport
      ↓
ManttoLabBackend
      ↓
LabRouter
      ↓
┌──────────────────────────────────────┐
│ Fase 4                               │
│ identidad / permisos / alcance       │
├──────────────────────────────────────┤
│ Fase 5                               │
│ usuarios / catálogos / relaciones    │
│ proyectos base / equipos / portafolio│
└──────────────────────────────────────┘
      ↓
SQLite WASM
      ↓
IndexedDB
```

## Archivos de programación

- `core/config.js` — archivo completo; agrega la carga de Fase 5 antes de `lab-auth.js`.
- `lab/index.html` — diagnóstico completo actualizado a Fase 5.
- `lab/backend/services/lab-catalogs.service.js`
- `lab/backend/services/lab-users.service.js`
- `lab/backend/services/lab-relations.service.js`
- `lab/backend/services/lab-shared-assets.service.js`
- `lab/backend/routes/lab-shared.routes.js`
- `lab/runtime/lab-phase5-bootstrap.js`
- `lab/database/migrations/005_shared_services.sql`

No se entrega `.patch`, `.diff`, `git apply`, ni un script que edite fragmentos del proyecto.

## Servicios implementados

### Usuarios

Se portan los contratos vigentes de `/api/usuarios` para listado, directorio, detalle, roles, zonas, preferencias de criticidad, supervisores de mantenimiento, alta, actualización y reseteo de contexto de credenciales.

La autorización de alta/edición/reset respeta la regla real de **Programador global**: rol activo con código `PROGRAMADOR` dentro del dominio `GENERAL`.

### Política de datos sintéticos

El LAB no usa contraseñas. Las altas y modificaciones de usuarios:

- almacenan `LAB_NO_PASSWORD` como marcador técnico;
- fuerzan `must_change_password = 0`;
- nunca devuelven una contraseña temporal;
- exigen correo sintético con dominio `@lab.invalid`.

Esto es una divergencia deliberada respecto al backend real para impedir que el laboratorio se convierta en un repositorio de credenciales o identidades productivas.

### Catálogos

Se portan los contratos actuales de:

- roles;
- zonas operativas;
- preguntas de seguridad;
- usuarios superiores;
- estados visuales;
- relación usuario-zona.

`/api/permisos` se mantiene como ruta conocida, pero la estructura LAB recibida no contiene la tabla legacy `permisos`. Por ello responde **501** con `LAB_LEGACY_PERMISOS_TABLE_UNAVAILABLE` en lugar de inventar datos.

### Relaciones administrativas

`usuarios_rel_admin` conserva lectura, alta y eliminación con las mismas validaciones básicas del controlador real: IDs válidos, usuarios existentes, no autorrelación y no duplicados.

### Proyectos de Mantenimiento

Fase 5 implementa la capa compartida de:

- `/api/proyectos/inicial`;
- `/api/proyectos/filtros`;
- `/api/proyectos`.

Se calcula sobre `portafolio`, `tickets`, `z_op` y `proyecto_equivalencias`, respetando:

1. permiso funcional efectivo;
2. agrupación autorizada;
3. alcance UNITED;
4. zonas de `usuario_zop` para identidades sin llave maestra.

El detalle completo de Proyecto queda reservado para Fase 7. Si se solicita `GET /api/proyectos?detalle=1&proyecto=...`, Fase 5 devuelve `501 LAB_PHASE7_PROJECT_DETAIL_PENDING`.

### Equipos / Portafolio base

Se habilitan los contratos compartidos:

- `/api/portafolio/filtros`;
- `/api/portafolio`;
- `/api/equipos`.

La lista base se filtra por `portafolio.zona_id` para identidades UNITED sin llave maestra. Dashboard, movimientos y detalles avanzados siguen reservados para Fase 7.

## Regla de seguridad usada

```text
Sesión LAB
  + permiso funcional efectivo
  + puerta de agrupación
  + alcance de información
  + zona/registro visible
  = acceso
```

Ante ausencia de evidencia, el comportamiento es **fail closed**.

## Migración 005

`005_shared_services.sql` no crea tablas ni columnas. Únicamente eleva:

```sql
PRAGMA user_version = 5;
```

La Fase 5 reutiliza las tablas existentes de Fase 1 y los catálogos/permisos consolidados en Fase 4.

## Instalación

Extraer el ZIP directamente sobre la raíz del laboratorio **después de Fases 1–4 V002**. Los archivos incluidos son completos y pueden copiarse con sobrescritura.

Ejemplo PowerShell:

```powershell
$REPO="C:\Users\T14s\Desktop\Nueva-estructura-Modulos\mantto_gestor_frontend"
$ZIP="$env:USERPROFILE\Downloads\FASE_5_LAB_DGB_SERVICIOS_COMPARTIDOS_V002.zip"
$STAGE=Join-Path $env:TEMP "FASE_5_LAB_DGB_SERVICIOS_COMPARTIDOS_V002"

Remove-Item $STAGE -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive $ZIP -DestinationPath $STAGE -Force
Copy-Item "$STAGE\*" $REPO -Recurse -Force

Set-Location $REPO
git status
git diff -- core/config.js lab/index.html lab/backend lab/runtime lab/database/migrations tests docs/lab
```

No se requiere ejecutar SQL externo, Node/Express, Aiven ni Azure.

## Validación

La validación acumulativa se ejecutó en una carpeta construida con Fases 1 → 5 V002. Consultar `FASE_5_VALIDATION_V002.txt` para el resultado exacto y `FASE_5_LIMITATIONS_V002.md` para lo que no se afirma como verificado.
