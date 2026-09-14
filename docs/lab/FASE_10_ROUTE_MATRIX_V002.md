# Matriz de rutas — Fase 10 V002

Todas las rutas son **diagnóstico interno del Laboratorio DGB**, requieren identidad LAB y están limitadas a Programador.

| # | Método | Ruta | Función |
|---:|---|---|---|
| 1 | GET | `/api/__lab/closure` | Estado de cierre técnico F10 |
| 2 | GET | `/api/__lab/health` | Integridad SQLite, Blob Store, backend, transporte, jobs y PWA |
| 3 | GET | `/api/__lab/routes` | Inventario/cobertura de rutas registradas |
| 4 | GET | `/api/__lab/jobs` | Estado de jobs simulados del navegador |
| 5 | POST | `/api/__lab/jobs/:name/run` | Ejecuta manualmente un job LAB; se registra sin transacción automática del router |
| 6 | GET | `/api/__lab/backup/summary` | Resumen de base y Blob Store antes de exportar/importar |

## Jobs válidos

- `notifications-refresh`
- `integrity-check`
- `persist-database`
- `storage-summary`

## Cobertura acumulativa

Después de F10:

```text
GET       172
POST       58
PUT        19
PATCH      23
DELETE     16
TOTAL     288
```

F10 agrega 5 GET + 1 POST = **6 rutas**. Las rutas productivas existentes de F1–F9 no se renombran ni sustituyen.
