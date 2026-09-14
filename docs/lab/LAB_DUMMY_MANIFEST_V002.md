# LAB DGB — Dataset sintético V002

## Regla
Este dataset pertenece exclusivamente al Laboratorio DGB.

No reutiliza nombres de personas, correos, teléfonos, contraseñas, identificadores personales, dispositivos, sesiones ni credenciales productivas.

- Correos LAB usan `.invalid`.
- Contraseñas productivas no existen en el seed.
- URLs de archivo/Drive son sintéticas o `.invalid`.
- IDs de registros se reservan en rangos LAB.
- Roles y códigos de zona conservan taxonomía funcional porque son parte del comportamiento del sistema, no datos personales.
- Los nombres de proyecto visibles llevan prefijo `LAB -`.

## Integridad
El dataset fue contrastado con PK, FK, `UNIQUE` y `CHECK` del esquema SQLite generado.

Cobertura:

```text
Tablas SQLite:             93
Columnas:                1,553
Índices:                   445
Tablas pobladas:            67
Registros:                 900
Usuarios LAB:               61
Proyectos LAB:              15
Equipos LAB:                15
Tickets LAB:                30
Pendientes Home LAB:        20
Preventivos LAB:            30
Violaciones FK:              0
```

## Ajustes de integridad incorporados
Los fixtures ya incluyen las correcciones necesarias para las restricciones del esquema:

1. `usuarios_alcance_informacion`: dominios nulos cuando el tipo de alcance no admite dominio explícito.
2. `instalaciones_drive_carpetas`: suficientes carpetas sintéticas para cumplir unicidad de proyecto/carpeta.
3. `ventas_prospecciones`: exactamente una bandera de clasificación activa por registro.
4. `logistica_produccion_archivos`: tipos de archivo limitados a valores permitidos por el `CHECK`.

## Tablas deliberadamente vacías

```text
auth_audit
auth_sessions
notificaciones_push_suscripciones
usuarios_dispositivos
usuario_google_oauth
```

La ausencia de registros en estas tablas es intencional y evita simular reutilizando estados de autenticación, OAuth, dispositivos o Push reales.
