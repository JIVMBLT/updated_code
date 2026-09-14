# Fase 5 V002 · Limitaciones verificadas

1. **No puedo confirmar que el snapshot SQLite sea una copia bit-a-bit del Aiven productivo vigente.** La Fase 5 trabaja exclusivamente con el esquema/seed LAB V002 ya entregado.
2. La tabla legacy `permisos` que consulta el endpoint real `/api/permisos` **no existe** en la estructura de Fase 1. No se creó una tabla ficticia: la ruta falla de forma explícita con HTTP 501 y código `LAB_LEGACY_PERMISOS_TABLE_UNAVAILABLE`.
3. `estados_visuales` existe, pero el seed LAB actual contiene **0 registros activos**. La ruta funciona y devuelve arreglo vacío hasta que exista fixture sintético respaldado por una fase posterior.
4. El detalle amplio de Proyecto/Equipo, Dashboard Portafolio y Movimientos no pertenecen a esta fase. Se reservan para **Fase 7**.
5. `GET /api/proyectos?detalle=1&proyecto=...` devuelve `501 LAB_PHASE7_PROJECT_DETAIL_PENDING`; no fabrica un detalle simplificado incompatible con el contrato real.
6. Las rutas de detalle no se registran en Fase 5 para no bloquear la implementación posterior debido a que `LabRouter` resuelve la primera ruta coincidente.
7. El reseteo de credenciales es deliberadamente distinto en LAB: no crea ni devuelve contraseñas. Restablece el marcador local `LAB_NO_PASSWORD`, limpia bloqueo y revoca sesiones LAB activas.
8. Alta/edición de usuarios exige correo `@lab.invalid`; no se intenta decidir automáticamente si un nombre corresponde a una persona real. La operación del laboratorio debe continuar usando nombres ficticios.
9. Para el filtro de Supervisores de Mantenimiento se normaliza únicamente el sufijo sintético ` LAB` de la empresa, de forma que `United Elevadores LAB` represente el mismo dominio funcional que `UNITED ELEVADORES` sin introducir una empresa productiva real en los fixtures.
10. No se ejecutó un E2E visual en GitHub Pages ni en navegador real durante esta entrega. Sí se ejecutaron pruebas con `sql.js`, SQLite, `LabBackend`, `LabRouter` y servicios acumulados.
11. No se modificó GitHub remoto, Azure, Aiven, Netlify ni ningún servicio productivo.
