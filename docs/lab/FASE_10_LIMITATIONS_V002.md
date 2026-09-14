# FASE 10 — Limitaciones verificadas V002

1. **No hay E2E publicado.** Se validó sintaxis, SQLite/sql.js, contratos, servicios y regresión local; no se hizo deploy ni prueba visual en GitHub Pages.
2. **PWA LAB solamente.** El Service Worker usa scope `/lab/`; no controla el frontend raíz. El estado `registered=true` solo puede confirmarse en un navegador compatible servido por HTTP/HTTPS, no mediante las pruebas Node ejecutadas aquí.
3. **Jobs no son procesos de servidor.** El intervalo de notificaciones funciona únicamente mientras una página del LAB permanece abierta; no es cron ni background job persistente.
4. **Backup local.** Exportar/importar modifica únicamente IndexedDB/SQLite del navegador LAB. No es respaldo de Aiven y no debe tratarse como respaldo productivo.
5. **Rollback de importación.** La importación conserva una copia en memoria del estado anterior e intenta restaurarla ante error. Una falla extrema del navegador/almacenamiento durante el rollback no puede ofrecer atomicidad equivalente a una transacción distribuida entre dos bases IndexedDB independientes.
6. **Icono PWA.** Se usa SVG same-origin del LAB. La experiencia de instalación puede variar por navegador/plataforma.
7. **Diagnósticos técnicos.** Las rutas de cierre, jobs, salud y cobertura son exclusivas de Programador. No se concede acceso por ser Director, administrador o tener permisos amplios.
8. **Sin conexiones externas.** F10 no agrega acceso a Aiven, Azure, Netlify, Google Drive, Google Sheets ni otra API externa.
