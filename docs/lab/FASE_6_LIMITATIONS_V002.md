# FASE 6 V002 — Limitaciones verificadas

1. **No se ejecutó un E2E visual en un navegador real ni un deploy de GitHub Pages.** Se validó sintaxis, ensamblado acumulado, SQL y servicios en Node/sql.js.
2. **SQLite e IndexedDB no forman una transacción ACID única.** El servicio intenta limpiar blobs si una operación local falla, pero no existe commit distribuido entre ambos almacenes del navegador.
3. Los `blob:` URLs son temporales de la sesión. Cada acceso vuelve a generar un URL desde IndexedDB.
4. La Fase 6 no implementa push remoto, Web Push, correo ni servicios externos. La bandeja y emisión son exclusivamente locales.
5. Metadata seed que apunte a proveedores remotos/productivos no se descarga. Solo archivos `LAB_INDEXEDDB` creados en el LAB pueden abrirse localmente.
6. No se fabricaron relaciones faltantes de `notificacion_evento_roles`. Una matriz existente sin un rol aplicable falla cerrada; eventos sin matriz conservan la compatibilidad legacy observada en el backend real.
7. Los catálogos de proyecto/equipo de Home son de selección y validación. Dashboards, analítica, movimientos, fotografías y detalle avanzado de Portafolio pertenecen a Fase 7.
8. `core/rich-text.js`, `modules/home/home.js` y `styles/home.css` no vienen en este paquete. La Fase 6 depende deliberadamente de las versiones LAB ya existentes para no revertir el cambio funcional pendiente de Rich Text.
9. Las etiquetas de empresa del seed (`Corellian LAB`, `United Elevadores LAB`, `BLT LAB`) son ficticias. El engine solo interpreta como dominio operativo las que contienen CORELLIAN o UNITED; no convierte `BLT LAB` en una llave adicional.
10. No se escribió nada en `JIVMBLT/updated_code`, `ziSirrush/GestorMantto`, Azure, Aiven, Netlify ni otro sistema remoto durante la generación de esta entrega.
