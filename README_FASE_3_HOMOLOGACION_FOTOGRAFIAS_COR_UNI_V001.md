# FASE 3 — Homologación Fotografías Corellian ↔ United

**Proyecto:** Mantto Gestor  
**Base funcional:** FASE_BACKEND_FOTOGRAFIAS_UNI_V001 + FASE_2_FRONTEND_FOTOGRAFIAS_UNI_V001  
**Repo de referencia:** `ziSirrush/GestorMantto` · `main`  
**Commit original revisado:** `13d865d232f2ded60caadd0da57bec27b52edbc6`  
**Fecha:** 24/08/2026

## Objetivo

Cerrar la homologación del motor fotográfico de **Detalle Proyecto Corellian** y **Detalle Proyecto United** sin cambiar la posición, el diseño ni el flujo visual aprobado.

Ambos dominios conservan un solo motor de:

- portada;
- carrete/lightbox;
- anterior/siguiente;
- agregar fotografía;
- seleccionar principal;
- máximo de 7 fotografías;
- actualización inmediata de portada.

## Política definitiva

### Ver

Todos los usuarios que ya pueden abrir el proyecto y cuyo alcance de información permite ver ese proyecto.

### Subir

- Director General
- Programador
- Gestor de Fotografías (`GESTOR_FOTOGRAFIAS`)

### Elegir foto principal

- Director General
- Programador
- Gestor de Fotografías (`GESTOR_FOTOGRAFIAS`)

No se utiliza `id_rol = 63` en código.

## Cambios de esta fase

### `backend/src/middleware/project-photo.middleware.js`

Se endurece el guard compartido de COR/UNI para reconocer los roles de forma estable aunque la sesión los entregue como:

- nombre de rol;
- código de rol;
- `roles` como strings u objetos;
- `roles_detalle`;
- `rol`, `role`, `rol_codigo`, `role_code` o `codigo_rol`;
- `is_programador`.

La comparación normaliza mayúsculas/minúsculas y acentos. El mismo guard sigue siendo utilizado por Corellian y United.

### `core/details.js`

Se consolida la detección frontend de los mismos tres perfiles autorizados.

También se elimina la comprobación legacy exclusiva de `Programador` que ya no corresponde a la política acordada y se conserva una única función `canManageProjectPhotos()` para **Subir** y **Seleccionar principal**.

Se mantiene el mismo componente visual para COR y UNI. No se crea otro lightbox.

Se corrige además una duplicación interna de condición en el botón `Ir a Proyecto`; no cambia su comportamiento visible.

### `index.html`

Solo cambia el cache-bust de:

```text
core/details.js?v=20260824-fase3-fotos-cor-uni-v001
```

### `tests/project-photo-parity.test.js`

Prueba de regresión para verificar:

- mismos roles autorizados frontend/backend;
- mismo carrete para COR y UNI;
- endpoints separados por dominio;
- mismo guard de mutaciones;
- máximo 7 en United;
- primera fotografía principal automática;
- ausencia de `DELETE` en esta fase;
- ausencia de `id_rol = 63` hardcodeado.

## Contratos que NO cambian

### Corellian

```text
GET   /api/ins-fl/proyectos/fotografias?id_ppns=...
POST  /api/ins-fl/proyectos/fotografias/:id_ppns
PATCH /api/ins-fl/proyectos/fotografias/:id_ppns/principal
```

### United

```text
GET   /api/portafolio/proyectos/:proyecto/fotografias
POST  /api/portafolio/proyectos/:proyecto/fotografias
PATCH /api/portafolio/proyectos/:proyecto/fotografias/principal
```

## Posición visual

No se modifica.

En ambos detalles:

```text
┌───────────────────────┬───────────────────────────────────┐
│                       │ Información general del proyecto  │
│   FOTO PRINCIPAL      │                                   │
│         o             │ Datos del proyecto                │
│   + Agregar foto      │                                   │
│                       │                                   │
└───────────────────────┴───────────────────────────────────┘
```

El carrete se abre al seleccionar la portada, igual que en Detalle Proyecto Corellian.

## Dependencias

Esta fase es **incremental** y supone aplicadas previamente:

1. `FASE_BACKEND_FOTOGRAFIAS_UNI_V001`
2. `FASE_2_FRONTEND_FOTOGRAFIAS_UNI_V001`

No crea tablas, roles ni permisos nuevos.

## Fuera de alcance

- eliminación de fotografías;
- compactación de slots;
- nueva pestaña de fotografías;
- Fotos Mapa de Ventas;
- cambios a equipos/tickets/KPIs;
- cambios visuales de la posición de la portada.

## Validaciones realizadas

Ejecutadas sobre un árbol compuesto con repo + Fase 1 + Fase 2 + Fase 3:

```text
node --check core/details.js
node --check backend/src/middleware/project-photo.middleware.js
node --test tests/project-photo-parity.test.js
npm run check   (backend)
```

Resultados obtenidos: `node --check` OK, `node --test` 6/6 OK y `npm run check` del backend OK.
