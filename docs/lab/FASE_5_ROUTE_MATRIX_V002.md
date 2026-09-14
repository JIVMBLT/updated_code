# Fase 5 V002 · Matriz de rutas

## Implementadas localmente

| Método | Ruta | Fuente LAB | Estado |
|---|---|---|---|
| GET | `/api/catalogos/roles` | `roles` | OK |
| GET | `/api/catalogos/zonas` | `z_op` | OK |
| GET | `/api/catalogos/preguntas-seguridad` | `preguntas_seguridad` | OK |
| GET | `/api/catalogos/usuarios-superiores` | `usuarios` + `roles` | OK |
| GET | `/api/estados-visuales` | `estados_visuales` | OK; seed actual = 0 filas activas |
| GET | `/api/permisos` | legacy `permisos` | 501 explícito: tabla no existe en snapshot LAB |
| GET | `/api/roles` | `roles` | OK |
| GET | `/api/zonas` | `z_op` | OK |
| GET | `/api/usuario-zop` | `usuario_zop` | OK |
| GET | `/api/usuarios` | `usuarios` | OK |
| GET | `/api/usuarios/me/criticos-preferencias` | `usuarios` | OK |
| PATCH | `/api/usuarios/me/criticos-preferencias` | `usuarios` | OK |
| GET | `/api/usuarios/directorio` | `usuarios` | OK |
| GET | `/api/usuarios/supervisores-mantenimiento` | usuarios/roles/zonas | OK |
| GET | `/api/usuarios/:id/detalle` | usuarios/roles/zonas | OK |
| GET | `/api/usuarios/:id/roles` | `usuario_roles` | OK |
| GET | `/api/usuarios/:id/zonas` | `usuario_zop` | OK |
| GET | `/api/usuarios/:id` | usuarios/roles/zonas | OK |
| POST | `/api/usuarios` | usuarios/roles/zonas | OK; solo datos sintéticos |
| PUT | `/api/usuarios/:id` | usuarios/roles/zonas | OK; solo datos sintéticos |
| POST | `/api/usuarios/:id/reset-credentials` | usuarios/sesiones | OK; sin contraseña |
| GET | `/api/usuarios-rel-admin` | `usuarios_rel_admin` | OK |
| POST | `/api/usuarios-rel-admin` | `usuarios_rel_admin` | OK |
| DELETE | `/api/usuarios-rel-admin/:id` | `usuarios_rel_admin` | OK |
| GET | `/api/proyectos/inicial` | portafolio/tickets/zonas | OK; permiso dedicado requerido |
| GET | `/api/proyectos/filtros` | portafolio/zonas | OK |
| GET | `/api/proyectos` | portafolio/tickets/zonas | OK |
| GET | `/api/portafolio/filtros` | portafolio/tickets | OK |
| GET | `/api/portafolio` | `portafolio` | OK |
| GET | `/api/equipos` | `portafolio` | OK |
| GET | `/api/__lab/shared-services` | diagnóstico | Solo LAB |

Todas las respuestas con procedencia de datos usan `source: "lab-sqlite"` cuando el contrato incluye un campo de fuente. No se etiqueta SQLite como Aiven.

## Deliberadamente no registradas en Fase 5

Estas rutas pertenecen al desarrollo funcional de Fase 7 y no se registran aquí para no sombrear sus futuros handlers dentro de `LabRouter`:

- `/api/proyectos/:proyecto`
- `/api/proyectos/detalle`
- `/api/proyectos/detalle/:proyecto`
- `/api/portafolio/equipos/:codigo`
- Dashboard Portafolio y Movimientos
- detalle avanzado de equipo/proyecto

La Fase 3 mantiene el cierre local de `/api/*`: una ruta todavía no implementada no cae a producción.
