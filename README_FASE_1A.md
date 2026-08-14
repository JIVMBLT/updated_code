# FASE 1-A - Gestión de Crédito United

## Alcance
Implementa exclusivamente la vista MAIN de Gestión de Crédito para Cobranza United.

## Fuente real
- Aiven MySQL
- Tabla: `gestion_credito`
- No se incluyen datos dummy ni valores inventados.

## Flujo de datos
- Una sola llamada HTTP desde frontend:
  - `GET /api/cobranza-uni/gestion-credito`
- La backend realiza una sola lectura de `gestion_credito` y devuelve el payload completo necesario para la vista.
- KPIs, filtros, Kanban y gráficas se construyen a partir de esos registros reales.

## Componentes incluidos
- KPIs:
  - Proyectos sin crédito disponible.
  - Adeudo total.
  - Facturas adeudadas.
  - Proyectos en riesgo alto.
- Filtros:
  - Proyecto / cliente / IDNS.
  - Estado.
  - Zona operativa.
  - Zona administrativa.
  - Nivel de riesgo.
- Cartera por nivel de riesgo:
  - Bajo.
  - Medio.
  - Alto.
- Distribución de adeudo por zona operativa.
- Concentración de riesgo por zona administrativa.
- Adaptación responsive/PWA con tabs de riesgo en pantallas pequeñas.

## Fuera de alcance
- Detalle de Proyecto: FASE 1-B.
- Conexiones con otros módulos/tablas: FASE 1-C.
- Edición o acciones sobre proyectos.

## Compatibilidad
Para no alterar todavía permisos/rutas existentes, la ruta técnica actual
`cobranza-uni-estados-cuenta` se reutiliza internamente y el frontend la presenta como
`Gestión de Crédito`. No se crean tablas ni registros de permisos en esta fase.

## Archivos modificados
- `modules/cobranza-uni/cobranza-uni.js`
- `modules/cobranza-uni/cobranza-uni.css`
- `backend/src/controllers/cobranza-uni.controller.js`
- `backend/src/routes/cobranza-uni.routes.js`
