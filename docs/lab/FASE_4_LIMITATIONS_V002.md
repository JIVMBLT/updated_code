# FASE 4 V002 — Limitaciones y datos no confirmados

## Catálogo de permisos

La matriz base cargada por `004_permissions_catalog.sql` proviene de `SABANA270826.sql` (corte 27/08/2026) y se filtró contra los roles sintéticos del LAB.

**No puedo confirmar que los 510 permisos de este catálogo sean una copia bit-a-bit del Aiven productivo vigente al 13/09/2026**, porque esta entrega no consultó el Aiven productivo.

El repositorio real contiene cambios/migraciones posteriores al corte de la Sábana, incluyendo archivos de septiembre de 2026 y al menos un cambio de permiso visual fechado 11/09/2026. Por lo tanto, los permisos posteriores al corte se incorporarán únicamente cuando una fase funcional los necesite y exista evidencia verificable en código/migraciones actuales. No se inventan filas para completar el catálogo.

## Roles con baseline incompleto

Los siguientes roles existen en el seed LAB pero no tienen una matriz completa verificable en la Sábana usada como baseline:

```text
57 Ingeniería de TI
59 Supervisor Mantenimiento Zona OCC01
60 Programador United
61 Programador Corellian
62 Soporte
63 Gestor de Fotografías
```

Estado cargado en Fase 4:

```text
57 → 0 permisos heredados confirmados
59 → 0 permisos heredados confirmados
60 → 2 permisos explícitamente compatibles/verificados
61 → 2 permisos explícitamente compatibles/verificados
62 → 0 permisos heredados confirmados
63 → 0 permisos heredados confirmados
```

Para 60 y 61 solamente se agregaron:

```text
GENERAL_PANEL_DE_CONTROL_ACCESO_VISUAL_MODULO.ACCESO_VISUAL
GENERAL_VISOR_USUARIOS_OPERACION.USAR_VISOR
```

No se completó por suposición ningún otro permiso.

## Rutas diferidas

Las rutas de administración de matriz de notificaciones existentes en el backend real no forman parte de Fase 4. Permanecen 501 `LAB_MOCK_NOT_IMPLEMENTED` hasta la fase correspondiente.

## Validación no realizada

No se ejecutó:

- despliegue a GitHub Pages;
- E2E en navegador real publicado;
- consulta/escritura de Azure;
- consulta/escritura de Aiven;
- modificación de GitHub remoto.

Por tanto, no se afirma validación E2E ni paridad total con Aiven productivo.
