# FASE 11 — LAB DGB — Cierre e integración de entrada raíz V001

## Baseline verificado

Repositorio: `JIVMBLT/updated_code`

Rama: `main`

Commit: `dc2296db8cb6670199dde9b2b2597372789ec9ff`

Tree: `778f9f6fc490d723c4519ec5a3a230fc1ae7191a`

La revisión previa confirmó que Fases 1–10 ya están integradas y que la arquitectura LAB está presente en `lab/`, `core/config.js`, `core/http.js` y `core/auth.js`.

## Objetivo

Cerrar los residuos de integración detectados en la entrada raíz del Gestor sin modificar el backend LAB, la base SQLite, las rutas API ni GitHub Pages.

La entrada raíz vigente referencia `manifest.json`, `core/push-notifications.js` y `core/data-sync.js`; dichos archivos habían sido eliminados durante la limpieza anterior. Esta fase restablece esas rutas con implementaciones compatibles con LAB, evitando volver a introducir infraestructura productiva.

También normaliza en runtime los textos heredados de Aiven que permanecen dentro del HTML raíz, conservando intacto el archivo `index.html` para no alterar accidentalmente la estructura visual validada del frontend.

## Cambios funcionales

### `core/config.js`

Se conserva íntegra la carga acumulada F1–F10 y se incrementa únicamente la versión de bootstrap a F11.

Se agrega normalización de etiquetas de entorno para que la interfaz raíz muestre:

- `Mantto Gestor | LAB DGB`;
- `LABORATORIO DGB · DATOS FICTICIOS`;
- referencias de soporte y Nori a `LAB DGB`;
- textos de carga y ayuda sin presentar Aiven como origen activo.

No habilita conexiones externas ni cambia el transporte `/api/*`.

### `manifest.json`

Se restablece como manifiesto local de la entrada raíz. Usa únicamente rutas relativas y los iconos existentes del repositorio.

No registra Service Worker ni agrega backend.

### `core/push-notifications.js`

Se restablece la superficie pública `ManttoPushNotifications` consumida por el frontend, pero como fachada LAB segura.

En LAB:

- Push remoto permanece deshabilitado;
- no se registra el Service Worker productivo;
- no se solicitan suscripciones Push;
- no se envían peticiones a servicios externos.

### `core/data-sync.js`

Se restablece la superficie `ManttoDataSync` necesaria para compatibilidad del frontend.

El coordinador solo trabaja con eventos y objetos ya cargados en el navegador. No implementa transporte propio ni conexiones externas.

### `.gitignore`

Se eliminan referencias específicas al backend Node/MySQL eliminado y a carpetas legacy que ya no pertenecen a la arquitectura LAB.

## Eliminaciones de cierre

Eliminar manualmente, si todavía existen:

- `tools/validar_fix_notificaciones_layout_v001.py`
- `tools/validar_fix_notificaciones_popover_v002.py`

No se entrega script de borrado.

## Capas

Frontend: **CON CAMBIOS DE COMPATIBILIDAD LAB**.

Backend LAB: **SIN CAMBIOS**.

API: **SIN CAMBIOS**.

SQLite: **SIN CAMBIOS**.

SQL: **SIN CAMBIOS**.

Permisos/alcances: **SIN CAMBIOS**.

Dummy: **SIN CAMBIOS**.

PWA `/lab/`: **SIN CAMBIOS**.

GitHub Pages / workflow YML: **SIN CAMBIOS**.

## Base de datos

No existe migración 011.

`PRAGMA user_version` permanece en `10`.

## Rutas

No se agregan endpoints.

La cobertura acumulada de F10 permanece en 288 rutas registradas por el backend LAB.

## Instalación

1. Aplicar previamente Fases 1–10 V002.
2. Copiar/descomprimir esta fase sobre la raíz del repositorio conservando exactamente las rutas.
3. Sobrescribir `.gitignore`, `README.md` y `core/config.js`.
4. Agregar `manifest.json`, `core/push-notifications.js` y `core/data-sync.js`.
5. Eliminar manualmente los dos validadores legacy indicados arriba, si siguen presentes.
6. Ejecutar las pruebas F11 y la regresión acumulada disponible en el repositorio.
7. Revisar `git status` antes de crear el commit.

No usar `.patch`, `.diff`, `git apply` ni scripts de búsqueda/reemplazo.

## Resultado esperado

La entrada raíz deja de generar referencias locales faltantes para Manifest, Push y DataSync, y muestra claramente que trabaja como Laboratorio DGB, mientras `/api/*` continúa resolviéndose dentro del navegador mediante el runtime LAB de Fases 1–10.
