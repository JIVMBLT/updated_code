# FASE BACKEND FOTOGRAFÍAS UNITED V001

## Base revisada

- Repositorio: `ziSirrush/GestorMantto`
- Rama: `main`
- Commit base: `13d865d232f2ded60caadd0da57bec27b52edbc6`
- Commit base: `Reinicio de Sesion 082426.1 - Llaves de acceso`

## Objetivo

Implementar el backend de fotografías para Detalle Proyecto UNITED reutilizando el patrón estable de Corellian y la tabla ya creada `portafolio_proyecto_fotos`.

También se homologa la política de administración fotográfica de Corellian y United mediante un guard compartido.

## Política aplicada

### Ver

Todos los usuarios que ya pueden abrir el proyecto y cuyo alcance de información permite ese proyecto.

No se crea una puerta fotográfica adicional para la lectura del Detalle Proyecto.

### Subir

- Director General
- Programador
- Gestor de Fotografías (`GESTOR_FOTOGRAFIAS`)

### Elegir/cambiar principal

- Director General
- Programador
- Gestor de Fotografías (`GESTOR_FOTOGRAFIAS`)

El backend no depende de `id_rol = 63`.

## Contrato UNITED

### GET

`/api/portafolio/proyectos/:proyecto/fotografias`

- Valida acceso al Detalle Proyecto UNITED.
- Valida alcance territorial con `requirePortafolioProjectScope_gnral`.
- Lee `portafolio_proyecto_fotos`.
- Devuelve SAS temporales para visualización.
- Calcula `foto_portada`.
- Devuelve `total_fotos` y `max_fotos = 7`.
- Si el proyecto todavía no tiene fila fotográfica devuelve una estructura vacía válida, no crea registros durante lectura.

### POST

`/api/portafolio/proyectos/:proyecto/fotografias`

`multipart/form-data`, campo `foto`.

- Requiere acceso al proyecto.
- Requiere rol autorizado.
- Usa `multer.memoryStorage()` y el límite global de Storage.
- Conserva el mismo contrato de Corellian: JPG, PNG, WEBP, GIF o AVIF para carrusel; HEIC/HEIF se rechaza.
- Valida nuevamente que el proyecto exista en `portafolio` con `estado_registro = 1`.
- Crea la fila de `portafolio_proyecto_fotos` si no existe.
- Bloquea la fila con `FOR UPDATE`.
- Usa el primer slot libre `foto_1` a `foto_7`.
- Máximo 7 fotografías.
- Sube en Azure privado con:
  - `empresa: UNITED`
  - `modulo: portafolio`
  - `entidadTipo: proyecto`
  - `subruta: fotografias`
  - `policyName: IMAGE`
- Persiste la URL estable en Aiven.
- Primera fotografía = principal automática.
- Genera SAS antes de `COMMIT`.
- Si falla el guardado, hace rollback y compensación de Blob Azure.

### PATCH principal

`/api/portafolio/proyectos/:proyecto/fotografias/principal`

Body:

```json
{
  "campo": "foto_3"
}
```

- Solo acepta `foto_1` a `foto_7`.
- Verifica que el slot tenga fotografía.
- Guarda el nombre del slot en `foto_principal`, no la URL.
- Actualiza `updated_by`.
- Devuelve la nueva `foto_portada` con SAS temporal.

## Corellian homologado

`backend/src/routes/ins-fl.routes.js` ahora usa el mismo guard compartido para subir y elegir principal.

La lectura de fotografías desde Detalle Proyecto Corellian utiliza los permisos existentes de acceso al detalle (`ABRIR_DETALLE` / `VER`) en lugar de exigir una puerta fotográfica adicional.

Las mutaciones Corellian incorporan además validación a nivel de registro para impedir actuar sobre un proyecto fuera del alcance efectivo del usuario.

No se modificó `ins-fl.controller.js`; la mecánica de almacenamiento existente se conserva.

## Archivos nuevos

- `backend/src/middleware/project-photo.middleware.js`
- `backend/src/modules/portafolio/portafolio-proyecto-fotos_uni.js`

## Archivos modificados

- `backend/src/routes/ins-fl.routes.js`
- `backend/src/modules/portafolio/portafolio.routes.js`
- `backend/src/modules/portafolio/portafolio.controller.js`
- `backend/src/modules/portafolio/portafolio.repository.js`

## No incluido en esta fase

- Frontend United.
- Eliminación de fotografías (`DELETE`).
- SQL de creación de tabla: la tabla ya fue creada antes de esta fase.
- SQL del rol: `GESTOR_FOTOGRAFIAS` ya fue creado antes de esta fase.
- Cambios de infraestructura/deploy.

## Validaciones realizadas

- `node --check` sobre todos los JS entregados: OK.
- Cadena `routes -> controller -> service -> repository -> handler _uni`: validada estáticamente.
- Tabla utilizada: `portafolio_proyecto_fotos`: validada en el código generado.
- Storage UNITED: validado en el código generado.
- No existe `DELETE` en esta fase: validado.
- No se hardcodea `id_rol = 63`: validado.
- Corellian y United usan el guard compartido de administración fotográfica: validado.

## Dependencias reutilizadas

No se agregan paquetes nuevos. Se reutilizan las dependencias ya existentes del backend:

- `express`
- `multer`
- servicios Aiven existentes
- Azure Storage existente
- `storage-file-policy.service.js`
- Guard General y alcance de registros existentes
