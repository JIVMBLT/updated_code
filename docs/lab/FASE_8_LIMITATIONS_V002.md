# FASE 8 - Limitaciones verificadas V002

1. **No se hizo deploy ni E2E visual publicado.** La validacion ejecutada cubre sintaxis, contratos, aislamiento, SQLite, servicios runtime y regresion acumulativa local. No puedo confirmar aun el comportamiento visual en GitHub Pages.
2. **El snapshot LAB no es Aiven productivo.** Los datos de SQLite son sinteticos. No puedo confirmar que sean una copia bit-a-bit de Aiven vigente y no deben tratarse como datos productivos.
3. **Permisos F8 de prueba.** La migracion 008 concede permisos existentes a identidades sinteticas para ejercitar la fase. Esto no es ni pretende ser una matriz de roles productiva.
4. **Integraciones/sincronizaciones.** Las rutas M2M/importacion se registran pero responden `501 LAB_MOCK_NOT_IMPLEMENTED`; no hay sincronizacion con sistemas reales.
5. **Catalogos Redes en seed.** El servicio consulta primero los paths de catalogo usados por el backend actual. Cuando esos paths no existen en el seed sintetico de Fase 1, se permite un fallback exclusivamente a entradas legacy `REDES/*` ya presentes en ese mismo seed. No se consulta una fuente externa ni se inventa una tabla.
6. **Cobranza UNITED.** El frontend vigente de Cobranza UNITED existe en la referencia actual. Durante esta generacion no se localizo con la misma claridad un modulo backend autonomo `backend/src/modules/cobranza-uni`; por ello el contrato LAB conserva la superficie UNITED ya verificada en el proyecto y la contrasta con las tablas existentes `gestion_credito` y `detalle_mp_2026`. No afirmo que exista hoy un archivo backend standalone con ese nombre.
7. **PDF Dashboard Ventas.** LAB entrega los datos/capacidades necesarios; la construccion del PDF permanece en el navegador. No se crea un archivo PDF desde un servidor LAB.
8. **Archivos.** Los binarios se conservan localmente en IndexedDB. URLs legacy externas no se convierten en accesos a produccion.
