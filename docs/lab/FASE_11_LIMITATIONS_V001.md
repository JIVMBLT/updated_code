# FASE 11 — Limitaciones V001

- No modifica `.github/workflows/pages.yml`.
- No habilita GitHub Pages.
- El workflow actualmente existente puede seguir fallando hasta que GitHub Pages se configure y se entregue el YML definitivo.
- No se realizó prueba E2E visual servida desde GitHub Pages.
- No se realizó instalación real de PWA raíz; la PWA LAB continúa siendo la definida bajo `/lab/`.
- `index.html` raíz se conserva completo y sin modificaciones para no introducir regresiones visuales. Los textos heredados de entorno se normalizan desde `core/config.js` al cargar la interfaz.
- `core/data-sync.js` de F11 es una capa de compatibilidad LAB. No realiza transporte propio; los módulos que no expongan un mecanismo de sincronización compatible simplemente no ejecutan refresh silencioso desde esta capa.
- `core/push-notifications.js` devuelve Push como deshabilitado por diseño en LAB.
- Las dos eliminaciones de `tools/` son manuales porque la entrega no usa scripts de mutación.
- No se creó tabla, columna, índice, relación, migración 011 ni nuevo seed.
- No hubo escritura remota a GitHub durante la generación de esta entrega.
