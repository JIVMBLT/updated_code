# FASE 2 — Frontend Fotografías en Detalle Proyecto United

**Proyecto:** Mantto Gestor  
**Base revisada:** `ziSirrush/GestorMantto` · `main`  
**Commit base:** `13d865d232f2ded60caadd0da57bec27b52edbc6`  
**Fecha:** 24/08/2026

## Objetivo

Trasladar a **Detalle Proyecto United** la misma experiencia fotográfica que ya usa **Detalle Proyecto Corellian**, sin crear una galería paralela ni cambiar la posición del bloque.

La fotografía queda en la parte superior izquierda, al lado de **Información general del proyecto**, reutilizando las clases y el lightbox existentes de `core/details.js`.

## Archivos modificados

- `core/details.js`
- `index.html`

No se modificaron otros módulos.

## Comportamiento implementado

### Detalle Proyecto United

Al abrir un proyecto United:

1. Se conserva la consulta real de detalle del proyecto.
2. Se obtiene el identificador canónico United desde `proyecto_busqueda`, `proyecto_codigo` o `proyecto`.
3. Se consulta:

```text
GET /api/portafolio/proyectos/:proyecto/fotografias
```

4. Se normalizan los slots:

```text
foto_1 ... foto_7
```

5. Se determina la portada mediante `foto_portada` / `foto_principal`, con fallback a la primera foto disponible.
6. La portada se muestra en el mismo bloque superior izquierdo usado por Corellian.
7. Si no hay fotografías y el usuario puede administrarlas, se muestra `+ Agregar foto` en esa misma posición.
8. Click en la portada abre el mismo carrete/lightbox ya utilizado por Corellian.

## Carrete reutilizado

Se mantiene el mismo componente existente:

- foto actual;
- contador;
- anterior;
- siguiente;
- Foto Principal Actual;
- Seleccionar Foto Principal;
- Agregar Foto;
- máximo 7 fotografías.

No se creó un segundo lightbox para United.

## Endpoints dinámicos

El motor fotográfico ahora conserva el dominio del proyecto y resuelve las mutaciones correctas.

### Corellian

```text
POST  /api/ins-fl/proyectos/fotografias/:id_ppns
PATCH /api/ins-fl/proyectos/fotografias/:id_ppns/principal
```

### United

```text
POST  /api/portafolio/proyectos/:proyecto/fotografias
PATCH /api/portafolio/proyectos/:proyecto/fotografias/principal
```

Así se reutiliza una sola lógica visual sin enviar accidentalmente una foto United a los endpoints Corellian.

## Política de permisos aplicada en frontend

### Ver

La fotografía y el carrete son visibles para cualquier usuario que ya tenga acceso al Detalle Proyecto correspondiente.

### Subir

- Director General
- Programador
- Gestor de Fotografías (`GESTOR_FOTOGRAFIAS`)

### Seleccionar principal

- Director General
- Programador
- Gestor de Fotografías (`GESTOR_FOTOGRAFIAS`)

La detección contempla nombre de rol y `roles_detalle.codigo`; no se hardcodea `id_rol = 63`.

## Homologación Corellian

El mismo motor compartido también actualiza la UI Corellian para que **Seleccionar Foto Principal** use la política acordada y no quede limitado únicamente a Programador.

No se cambió la posición ni la estructura visual de la fotografía Corellian.

## Primera fotografía

La Fase 2 respeta el contrato de backend de la Fase 1:

```text
primera fotografía cargada -> foto principal automática
```

El frontend actualiza inmediatamente la portada con la URL SAS recibida.

## Cambio de principal

Cuando una fotografía del carrete se selecciona como principal:

1. se envía el `campo` correcto (`foto_blt_N` en COR / `foto_N` en UNI);
2. el backend persiste `foto_principal`;
3. el frontend actualiza `projectPhotoState.principalUrl`;
4. la portada superior cambia inmediatamente sin recargar todo el detalle.

## Dependencia

Esta Fase 2 requiere tener aplicada previamente **FASE_BACKEND_FOTOGRAFIAS_UNI_V001**, que incorpora los endpoints United y la tabla `portafolio_proyecto_fotos` ya creada en Aiven.

## Fuera de alcance

No se implementó:

- DELETE de fotografías;
- compactación de slots;
- una pestaña nueva de Fotografías;
- una galería de miniaturas permanente dentro de Detalle Proyecto United;
- cambios en indicadores, equipos, tickets, cobranza o cualquier bloque inferior del detalle.

## Cache bust

`index.html` cambia únicamente la versión de carga de `core/details.js` a:

```text
20260824-fase2-fotos-uni-v001
```

Se preservó la versión actual de `core/auth.js` del repo.

## Validaciones realizadas

- `core/details.js` base verificado contra blob Git actual:
  `3c80a079fa72b2addd52d75d709c49b4bb17cda5`
- `index.html` base reconstruido y verificado contra blob Git actual:
  `12d6981ef08f474a1bd1d849e609593834d05c83`
- `node --check core/details.js`: OK
- Verificado GET United de fotografías.
- Verificados POST/PATCH dinámicos COR/UNI.
- Verificado soporte de `foto_1 ... foto_7` y `foto_blt_1 ... foto_blt_7`.
- Verificado reconocimiento de `GESTOR_FOTOGRAFIAS`.
- Verificado máximo visual de 7 fotografías.
- No se agregó ninguna ruta DELETE.

## Prueba funcional recomendada después del deploy

1. Abrir un Detalle Proyecto United sin fotos como usuario normal: debe mostrar la información sin controles de carga.
2. Abrirlo como Director General, Programador o Gestor de Fotografías: debe aparecer `+ Agregar foto` a la izquierda.
3. Subir la primera foto: debe convertirse en portada automáticamente.
4. Subir una segunda foto desde el carrete.
5. Navegar anterior/siguiente.
6. Seleccionar la segunda como principal: la portada debe cambiar de inmediato.
7. Abrir el mismo proyecto como usuario normal: debe poder ver portada y carrete, pero no ejecutar carga ni cambio de principal.
8. Confirmar que Detalle Proyecto Corellian conserva el mismo layout y que los tres roles autorizados pueden seleccionar principal.
