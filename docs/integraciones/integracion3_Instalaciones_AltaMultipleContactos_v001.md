# Integración INT-3 — Instalaciones · AltaMultipleContactos · v001

## Número y versión de integración
INT-3, v001 (primera versión; sin versiones previas).

## Objetivo solicitado
En el formulario de "Nuevo contacto" (Instalaciones > Base de Datos de Contactos), permitir dar de alta varios contactos de manera simultánea: se llena la información de uno, se pulsa un "+" para agregar otro dentro del mismo formulario y se desglosan de nuevo los campos, tantas veces como haga falta. Caso de uso descrito por el usuario: los contactos normalmente se dan de alta para 1 proyecto en 1 exhibición, así que el usuario captura 6-8 contactos ligados al mismo proyecto de una sola vez.

## Comportamiento anterior
El formulario de alta tenía un único juego de campos (Nombre, Puesto, Correo, Teléfono, Categoría, Proyecto). Dar de alta 8 contactos del mismo proyecto requería abrir y cerrar el formulario 8 veces, reseleccionando el proyecto cada vez.

## Comportamiento final
El selector de Proyecto ahora es único y compartido, arriba del formulario — todos los contactos que se agreguen en esa sesión del formulario quedan ligados a ese mismo proyecto. Debajo, cada contacto tiene su propio bloque repetible (Nombre, Puesto, Correo, Teléfono, Categoría) con un botón "✕" para quitarlo. Un botón "+ Agregar otro contacto" agrega un bloque vacío más. Al guardar: se validan todos los bloques antes de enviar nada (si a cualquiera le falta nombre o categoría, no se manda nada y se señala cuál); si pasan la validación, se envían uno por uno contra el mismo endpoint que ya existía. Los que se guardan bien desaparecen del formulario; si alguno falla del lado del servidor, se queda visible con su error específico para corregirlo y reintentar solo ese, sin perder los demás ni reenviar los que ya se guardaron. La edición de un contacto existente sigue siendo de un solo bloque, sin botón de agregar/quitar.

## Módulos afectados
Instalaciones > Base de Datos de Contactos (frontend únicamente). No se tocó ningún otro submódulo.

## Rutas exactas de archivos modificados
- `modules/instalaciones-contactos/instalaciones-contactos.js`
- `modules/instalaciones-contactos/instalaciones-contactos.css`
- `core/module-loader.js` (cache-bust de versión de los assets del módulo)

## Archivos nuevos
- `docs/integraciones/integracion3_Instalaciones_AltaMultipleContactos_v001.md`

## Archivos eliminados
Ninguno.

## Cambios de Frontend
Sí, es el objetivo central de esta integración. Reestructuración del formulario modal: Proyecto pasó de estar dentro de cada contacto a ser un campo único y compartido arriba; se agregó un contenedor de bloques repetibles (`#ic-form-bloques`) con funciones nuevas `bloqueHtml()`, `agregarBloque()`, `quitarBloque` (inline), `renumerarBloques()`, `leerBloque()`; `guardarFormulario()` se reescribió para branchear entre edición (un bloque) y alta múltiple (N bloques, validación previa completa, envío secuencial con manejo de éxito/fallo por bloque).

## Cambios de Backend LAB
Ninguno. Se reutiliza tal cual el mismo `POST /api/instalaciones/contactos` de INT-2, llamado varias veces en secuencia desde el frontend — una petición por contacto, no una petición por lote.

## Cambios de API
Ninguno. Sin rutas nuevas ni cambios de contrato en las existentes.

## Cambios de SQLite/SQL
Ninguno.

## Cambios de Dummy
Ninguno.

## Cambios de permisos o alcances
Ninguno.

## Navegación afectada
Ninguna.

## Filtros, búsqueda o paginación afectados
Ninguno — esta integración es sobre el formulario de alta, no sobre el listado/filtros ya existentes.

## Elementos expresamente no modificados
`lab-instalaciones-contactos.service.js`, `lab-installations-logistics-warehouse.routes.js`, migración 012, `index.html`, `core/router.js`, `core/config.js` — nada de esto cambió, ya que la funcionalidad se logró enteramente reestructurando el formulario del frontend y reutilizando el endpoint de alta ya existente.

## Pruebas realmente ejecutadas
- **Estática**: `node --check` en los 2 archivos `.js` modificados — PASS.
- **Runtime (Node, contra datos reales de seed)**: arnés propio que simula exactamente el caso de uso descrito — 8 llamadas secuenciales a `crear()` para el mismo `id_ins_fl` (mismo proyecto), con nombres y categorías distintas — PASS: las 8 se crean sin conflicto y `listar()` filtrado por ese proyecto cuenta exactamente 8.
- **Batería completa del LAB**: `tests/lab_*.cjs` — PASS, sin cambios de conteo de rutas (no se agregó ninguna ruta).

## Pruebas no ejecutadas
- **Runtime en navegador real / E2E**: NO EJECUTADO. No se probó interactivamente el click de "+ Agregar otro contacto", el botón "✕" para quitar un bloque, el foco automático en el nuevo bloque, ni el comportamiento visual cuando algunos contactos se guardan y otros fallan (bloques que desaparecen vs. bloques que se quedan con su error). Solo se validó la lógica de backend que el flujo termina invocando.

## Riesgos o pendientes
- Si el usuario cierra el formulario (✕ o clic fuera) a mitad de un guardado parcial fallido, los contactos que ya se guardaron exitosamente quedan en la base de datos (correcto), pero los que quedaron en pantalla con error se pierden — comportamiento esperado de cualquier formulario que se cierra sin guardar, no es un bug, pero vale la pena confirmarlo en la prueba real.
- El envío es secuencial (una petición a la vez, no en paralelo ni en una sola transacción de backend). Para 6-8 contactos esto es prácticamente instantáneo en SQLite WASM local; si en el futuro se necesitaran lotes mucho más grandes, convendría un endpoint de alta masiva transaccional en el backend.

## SHA del commit final
`416f24a3e913534a0c962250b62fb88ff9a42e03` (commit de código) — este documento se agregó en un commit de seguimiento inmediato, ya que se comiteó primero el código con el formato `CLAUDE | INT-3 | ...` y la documentación se completó justo después, sin cambios adicionales de código entre ambos commits.

## Estado final
**COMPLETADA** — código final aplicado y validado (estática + runtime contra datos reales + batería completa), MD de integración (este documento), `docs/integraciones/README.md` actualizado, commit `CLAUDE | INT-3 | Instalaciones | AltaMultipleContactos | v001`.
