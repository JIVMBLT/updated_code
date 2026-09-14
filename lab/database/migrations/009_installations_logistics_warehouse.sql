-- [Aster | 2026-09-14 | ASTER-MG | FASE 9 LAB DGB V002]
-- LAB ONLY. Instalaciones + Produccion/Logistica + Almacen.
-- Reutiliza exclusivamente las tablas existentes del schema V002.
-- No crea tablas ni columnas.
PRAGMA foreign_keys = ON;

-- Los fixtures base ya contienen datos sinteticos para ins_fl, logistica_produccion
-- y almacen_fuente_excel. Esta migracion solo marca la version funcional acumulativa.
PRAGMA user_version = 9;
