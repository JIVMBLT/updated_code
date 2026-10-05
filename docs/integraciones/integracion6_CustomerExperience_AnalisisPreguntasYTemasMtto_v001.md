# Integración INT-6 — Customer Experience · AnalisisPreguntasYTemasMtto · v001

## Número y versión de integración
INT-6, v001 (primera versión; sin versiones previas).

## Objetivo solicitado
Dentro de la pestaña Mantenimiento de Encuestas (INT-5), agregar dos análisis sobre todo lo que hay en la hoja "Respuestas de formulario 1" del Excel de origen:
1. Para las preguntas con respuesta predeterminada (las que el usuario identificó visualmente como encabezado morado): porcentaje de cada respuesta posible, y poder seleccionar una respuesta para ver el detalle de las encuestas que la eligieron.
2. Para los campos de texto abierto/observaciones del encuestador (encabezado naranja): tablas que relacionen los comentarios por tema y cuántas veces/en qué encuestas se mencionó cada uno.

## Verificación previa a construir (no se asumió nada)
- El color "morado" del encabezado no existe como relleno real en el .xlsx (confirmado leyendo el XML crudo del archivo: solo existe el relleno naranja, `FFFF9900`, aplicado a 10 columnas). Es casi seguro una extensión propia de Google Sheets que no sobrevive la exportación a xlsx.
- Ante eso, se identificaron las preguntas cerradas por el contenido real de los datos (conjuntos fijos y pequeños de valores, confirmado inspeccionando los valores únicos de cada columna), no por suposición: 1 pregunta de NPS crudo, 6 de CSAT (Excelente/Bueno/Neutral/Malo/Muy Malo), 6 de "Oportunidad de mejora" (selección múltiple tipo checkbox, valores separados por coma en la celda — confirmado con los datos reales) y 3 de acuerdo/confianza (escala de 5 o 3 opciones). 16 preguntas en total.
- El color naranja (orange, confirmado con el relleno real del archivo) marca 10 columnas; de esas, 5 son comentarios narrativos genuinos aptos para análisis de temas (Aspectos destacables, Áreas de oportunidad, Temas Operativos, Temas Administrativos, Valor Agregado); las otras 5 (Proyecto, Medio de encuesta, Encuestador, Tickets Generados, ID de encuesta) son identificadores/metadatos de una sola palabra o número, no comentarios — no se les aplicó análisis de temas porque no tendría ningún valor (ya se ven en el detalle de cada encuesta). El usuario confirmó la instrucción "todo dentro de la pestaña" antes de que se tomara esta decisión de alcance práctico.

## Comportamiento anterior
La pestaña Mantenimiento (INT-5) solo mostraba el listado de encuestas individuales con su detalle. No había ningún agregado de las preguntas cerradas ni de los comentarios.

## Comportamiento final
Dentro de la pestaña Mantenimiento, arriba del listado, un panel colapsable "Análisis de preguntas cerradas y comentarios" (cerrado por defecto, para no sobrecargar la vista) con dos secciones:
- **Preguntas cerradas**: una tarjeta por cada una de las 16 preguntas, con barras de porcentaje por respuesta (las de selección múltiple marcadas con una etiqueta "selección múltiple", y el porcentaje calculado sobre encuestas que respondieron, no sobre el total de selecciones). Clic en una barra abre el detalle: la lista de encuestas que dieron esa respuesta, y clic en una de esas encuestas abre su ficha completa (mismo modal de dos niveles).
- **Temas en comentarios abiertos**: una tarjeta por cada uno de los 5 campos narrativos, con las palabras que se repiten en 2 o más encuestas (como chips, con su conteo), ignorando palabras muy cortas y una lista de palabras vacías en español. Clic en una palabra abre la lista de encuestas cuyo comentario la menciona, con el mismo drill-down a dos niveles.
- El panel respeta los filtros (Estado/Superintendente/Categoría) ya existentes de la pestaña: al cambiar un filtro, si el panel está abierto, se recalcula.

## Módulos afectados
Customer Experience > Encuestas > pestaña Mantenimiento (extensión). No se tocó la pestaña Venta/Instalaciones ni el Dashboard (INT-4).

## Rutas exactas de archivos modificados
- `core/module-loader.js` (cache-bust)
- `lab/backend/routes/lab-cx.routes.js`
- `lab/backend/services/lab-cx.service.js`
- `modules/customer-experience-encuestas/customer-experience-encuestas.js`
- `modules/customer-experience-encuestas/customer-experience-encuestas.css`

## Archivos nuevos
- `docs/integraciones/integracion6_CustomerExperience_AnalisisPreguntasYTemasMtto_v001.md`

## Archivos eliminados
Ninguno.

## Cambios de Frontend
Sí. Panel colapsable de análisis agregado a la pestaña Mantenimiento: barras de porcentaje para las 16 preguntas cerradas y chips de frecuencia para los 5 campos de tema, ambos con drill-down a la lista de encuestas y de ahí al detalle completo (reutilizando el modal y la función `abrirDetalleMt()` ya existentes de INT-5).

## Cambios de Backend LAB
Sí. `lab-cx.service.js`: se factorizó el filtrado de Mantenimiento en `mantenimientoFiltrosFromQuery()`/`mantenimientoRowsFiltradas()` (reutilizado por `listarMantenimiento()`, sin cambio de resultado). Cuatro funciones nuevas: `analisisPreguntasCerradas()`, `detallePreguntaCerrada()`, `analisisTemas()`, `detalleTema()`. El conteo de selección múltiple separa cada celda por coma; el análisis de temas tokeniza cada comentario, descarta palabras de menos de 5 letras y una lista de palabras vacías en español, cuenta cada palabra una sola vez por encuesta (no por repetición dentro del mismo comentario) y descarta palabras que solo aparecen en 1 encuesta.

## Cambios de API
Sí. Rutas nuevas, todas gateadas con el mismo permiso de "Encuestas" ya usado en INT-5:
- `GET /api/customer-experience/mantenimiento/analisis-preguntas`
- `GET /api/customer-experience/mantenimiento/analisis-preguntas/detalle`
- `GET /api/customer-experience/mantenimiento/analisis-temas`
- `GET /api/customer-experience/mantenimiento/analisis-temas/detalle`

## Cambios de SQLite/SQL
Ninguno. No se agregó ninguna tabla ni migración — todo el análisis se calcula en caliente sobre `cx_mantenimiento_encuestas` (la misma tabla de INT-4), sin persistir nada nuevo.

## Cambios de Dummy
Ninguno — se reutilizan los mismos datos de INT-4.

## Cambios de permisos o alcances
Ninguno — las rutas nuevas usan el permiso de "Encuestas" que ya se concedió a LAB R01 en INT-5.

## Navegación afectada
Ninguna ruta nueva — es una extensión de la pestaña Mantenimiento ya existente.

## Filtros, búsqueda o paginación afectados
El análisis respeta los filtros ya existentes de la pestaña Mantenimiento (Estado, Superintendente, Categoría). Sin paginación (16 preguntas + 5 campos de tema, manejable en una sola vista).

## Elementos expresamente no modificados
Pestaña Venta/Instalaciones de Encuestas, Dashboard CX (INT-4), tabla `cx_mantenimiento_encuestas` (sin cambios de esquema ni de datos), `cx_venta_instalacion_encuestas` (sin tocar).

## Pruebas realmente ejecutadas
- **Estática**: `node --check` en los 4 archivos `.js` modificados — PASS.
- **Verificación de datos de origen**: antes de escribir cualquier código, se inspeccionó el XML crudo del archivo Excel (confirmando que no hay relleno morado real) y los valores únicos reales de cada columna candidata (confirmando el conjunto fijo de respuestas de cada pregunta cerrada y el patrón de multi-selección separada por comas de las 6 preguntas "Oportunidad de mejora").
- **Runtime (Node, contra datos reales)**: arnés propio probando `analisisPreguntasCerradas()` para las 16 preguntas (totales y porcentajes verificados a mano para varias, ej. "No lo consideraría" 57% en riesgo de cambio de proveedor, "Seguimiento hasta la solución" 83% de menciones en la pregunta de seguimiento de supervisor) y `analisisTemas()` para los 5 campos — PASS. Drill-down de una pregunta cerrada y de un tema, confirmando que el conteo devuelto coincide exactamente con el número de encuestas encontradas en cada caso — PASS, sin discrepancias.
- **Rutas**: las 2 rutas de análisis (preguntas y temas) probadas de punta a punta simulando el router real a través del gate de permisos real — status 200, con 16 preguntas y 5 campos respectivamente.
- **Batería completa del LAB**: `tests/lab_*.cjs` y `tests/lab_*.py` (Fases 1–11) — PASS, sin regresiones.

## Pruebas no ejecutadas
- **Runtime en navegador real / E2E**: NO EJECUTADO. El toggle de apertura/cierre del panel, el clic en una barra o un chip, y la navegación de dos niveles del modal (lista → detalle) no se probaron interactivamente en un navegador.
- Las 2 rutas de drill-down (`/detalle`) no se probaron de punta a punta a través del router simulado en esta ronda (sí se probó la función de servicio directamente, con resultados correctos); se asume el mismo patrón de gate que ya funcionó para las otras 6 rutas de este módulo.

## Riesgos o pendientes
- El análisis de temas es deliberadamente simple (frecuencia de palabras individuales, sin IA ni n-gramas): es transparente y 100% verificable contra el texto real, pero no agrupa sinónimos ni frases completas (ej. "tiempo de respuesta" cuenta como dos palabras sueltas, no como una frase). Si el usuario prefiere un análisis más sofisticado (frases, sinónimos), sería una iteración aparte.
- La lista de palabras vacías (stopwords) es una lista corta armada para este caso de uso, no un diccionario exhaustivo — palabras muy comunes no incluidas ahí podrían aparecer en el top si se repiten mucho.
- Las 5 columnas naranjas excluidas del análisis de temas (Proyecto, Medio de encuesta, Encuestador, Tickets Generados, ID de encuesta) no tienen ningún tratamiento especial — si el usuario sí quiere algo para ellas, es un ajuste de alcance a definir.

## SHA del commit final
Pendiente de push (se completa en el mensaje del chat tras publicar).

## Estado final
**COMPLETADA** — código final aplicado y validado (estática + verificación de datos de origen + runtime contra datos reales + batería completa), MD de integración (este documento), `docs/integraciones/README.md` actualizado, commit `CLAUDE | INT-6 | Customer Experience | AnalisisPreguntasYTemasMtto | v001`.
