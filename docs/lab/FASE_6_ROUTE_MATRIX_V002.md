# FASE 6 V002 — Matriz de rutas Home

| Método | Ruta | Regla LAB principal |
|---|---|---|
| GET | `/api/home/snapshot` | Usuario autenticado; solo tareas/interacciones visibles |
| GET | `/api/home/bootstrap` | Usuario autenticado; Home + bandejas + catálogos |
| GET | `/api/actividad-reciente` | Solo interacciones del usuario efectivo |
| GET | `/api/pendientes/catalogos` | Empresa + alcance CORELLIAN/UNITED del usuario |
| GET | `/api/pendientes` | PERSONAL creador; COLAB creador o relacionado |
| GET | `/api/pendientes/:id` | Mismo alcance de tarea |
| POST | `/api/pendientes` | Auth + empresa/proyecto/equipo dentro de alcance |
| PUT | `/api/pendientes/:id` | Solo creador + alcance de proyecto/equipo |
| DELETE | `/api/pendientes/:id` | Solo creador |
| PATCH | `/api/pendientes/:id/estatus` | Solo creador |
| PATCH | `/api/pendientes/:id/prioridad` | PERSONAL: creador; COLABORATIVA: solo RESPONSABLE |
| PATCH | `/api/pendientes/:id/subtareas/:idSubtarea` | Cualquier usuario con acceso a la tarea |
| POST | `/api/pendientes/:id/comentarios` | Cualquier usuario con acceso; texto o archivo requerido |
| DELETE | `/api/pendientes/:id/archivos/:idArchivo` | Solo creador |
| GET | `/api/pendientes/:id/archivos/:idArchivo/acceso` | Usuario con acceso; solo `LAB_INDEXEDDB` |
| GET | `/api/pendientes/:id/comentarios/:idComentario/adjuntos/:idAdjunto/acceso` | Usuario con acceso; solo `LAB_INDEXEDDB` |
| GET | `/api/pendientes/:id/evidencia-legacy/:tipo/acceso` | Usuario con acceso; solo `labblob://` local |
| GET | `/api/notificaciones` | Solo notificaciones del usuario efectivo + política de campana |
| GET | `/api/notificaciones/estado` | Conteo de nuevas visibles del usuario efectivo |
| PATCH | `/api/notificaciones/:id/abrir` | Solo notificación propia |
| PATCH | `/api/notificaciones/:id/nuevo` | Solo notificación propia |
| GET | `/api/notificaciones/preferencias` | Preferencias propias + matriz Evento ↔ Rol |
| PUT | `/api/notificaciones/preferencias` | Preferencias propias; OBLIGATORIA no puede deshabilitarse |
| GET | `/api/interacciones` | Solo interacciones propias |
| POST | `/api/interacciones` | NAVEGACION/CONSULTAR se omiten; operaciones fabricadas se rechazan |
| GET | `/api/__lab/home-status` | Diagnóstico local autenticado |

## Códigos fail-closed relevantes

- `PENDIENTE_ACCESS_FORBIDDEN`
- `PENDIENTE_CREATOR_REQUIRED`
- `PENDIENTE_PRIORITY_FORBIDDEN`
- `PENDIENTE_EMPRESA_FORBIDDEN`
- `PENDIENTE_EMPRESA_NO_SOPORTADA`
- `PENDIENTE_PROYECTO_FUERA_ALCANCE`
- `PENDIENTE_EQUIPO_REQUIERE_PROYECTO`
- `PENDIENTE_EQUIPO_FUERA_ALCANCE`
- `LAB_FILE_TOO_LARGE`
- `LAB_BLOB_NOT_FOUND`
- `ROLE_MATRIX_DENIED` (resultado interno de emisión)
