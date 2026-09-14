# Limitaciones verificadas - Fase 7 V002

1. No se ejecuto E2E visual en GitHub Pages ni en navegador publicado. Las validaciones realizadas son estaticas, SQLite/sql.js y runtime de servicios.
2. No se consulto Aiven productivo. Los permisos y relaciones rol-permiso siguen viniendo del catalogo LAB de Fase 4; Fase 7 no inventa asignaciones nuevas.
3. El permiso `PORTAFOLIO_MOVIMIENTOS_PORTAFOLIO_ACCESO_VISUAL_MODULO.ACCESO_VISUAL` existe en el catalogo LAB, pero la base de permisos conocida no asigna ese permiso a los perfiles sintéticos utilizados en las pruebas. El servicio de Movimientos esta implementado y probado directamente, pero la puerta HTTP puede devolver 403 hasta que una fuente autorizada confirme una asignacion de rol/personalizacion valida. No se amplio artificialmente el permiso.
4. Las rutas productivas M2M de sincronizacion de Tickets se bloquean con 501. No existe fallback a produccion.
5. Fotografias de proyecto de Portafolio no se reconstruyen en esta fase. La tabla existe, pero la carga/gestion binaria transversal queda fuera del alcance declarado de Fase 7; no se invento un contrato alternativo.
6. El corte semanal manual usa solo perfiles Programador/Programador United/Programador Corellian, igual que la regla de referencia revisada. En el fixture de fecha actual puede devolver el corte ya existente de la semana 37/2026 en vez de crear otro.
7. Los calculos de MTBC/criticidad de LAB trabajan con los tickets sinteticos disponibles; sirven para validar contrato y flujo, no representan indicadores productivos reales.
