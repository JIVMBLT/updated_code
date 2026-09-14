# FASE 1 — LAB DGB · SQLite WASM + IndexedDB V002

## Estado
Nueva línea válida de reconstrucción LAB DGB. Las entregas V001 anteriores quedan fuera de esta línea.

## Baseline
- Repositorio objetivo: `JIVMBLT/updated_code`
- Rama: `main`
- Commit verificado: `d3b766477663e6726ea46f1bb08bdc30b01a74e6`
- Árbol: `a0c78d785842ca7dfc1b987a68b43a50aa1f399e`
- En ese baseline no existe la carpeta `lab/`.

## Objetivo
Agregar la base persistente del Laboratorio DGB sin modificar todavía el frontend principal ni la backend real.

La fase entrega:

1. SQLite WASM ejecutado en navegador.
2. Persistencia de los bytes completos de SQLite en IndexedDB.
3. `schema.sql` SQLite compatible.
4. `seed.sql` exclusivamente sintético.
5. Reset aislado del LAB V2.
6. API JavaScript `ManttoLabDB` que usarán las siguientes fases.
7. Página de diagnóstico independiente en `/lab/`.
8. `sql.js` v1.14.2 servido localmente por GitHub Pages; no se usa CDN en runtime.

## Arquitectura resultante

```text
GitHub Pages
   |
   +-- /lab/index.html
   |
   +-- /lab/vendor/sql.js/1.14.2/
   |      +-- sql-wasm.js
   |      +-- sql-wasm.wasm
   |
   +-- /lab/database/
   |      +-- schema.sql
   |      +-- seed.sql
   |      +-- version.json
   |
   +-- /lab/runtime/lab-db.js
              |
              +-- SQLite WASM
              |
              +-- IndexedDB: mantto_lab_dgb_v2
```

## Archivos completos
Esta entrega no contiene `.patch`, `git apply`, scripts de búsqueda/reemplazo ni aplicadores que modifiquen fragmentos.

Todos los archivos de código incluidos son archivos completos. En Fase 1 todos son nuevos respecto del baseline verificado, por lo que no se sustituye ningún archivo existente del Gestor.

## SQLite
El esquema se obtuvo de la estructura MySQL de Gestor Mantto preparada para el LAB y se validó como SQLite ejecutable.

Conversión aplicada:
- enteros MySQL -> `INTEGER`;
- `DECIMAL/FLOAT/DOUBLE` -> `REAL`;
- texto, fechas, `ENUM` y JSON -> `TEXT`;
- PK autoincremental simple -> `INTEGER PRIMARY KEY AUTOINCREMENT`;
- se preservan PK, FK, `CHECK`, índices e índices únicos;
- se preservan columnas generadas compatibles;
- se eliminan `ENGINE`, charset/collation y `ON UPDATE CURRENT_TIMESTAMP` exclusivos de MySQL;
- índices SQLite se prefijan con el nombre de tabla para evitar colisiones globales.

Resultado:
- 93 tablas;
- 1,553 columnas, contando columnas generadas mediante `PRAGMA table_xinfo`;
- 445 índices;
- `PRAGMA user_version = 1`.

## Dataset LAB
El seed contiene únicamente información sintética.

Cobertura principal:
- 61 identidades LAB;
- 15 proyectos LAB;
- 15 equipos LAB;
- 30 tickets LAB;
- 20 pendientes Home LAB;
- 30 servicios preventivos LAB;
- 67 tablas pobladas;
- 900 registros totales.

Se dejan vacías deliberadamente tablas de sesión, OAuth, dispositivo y Push real:
- `auth_audit`;
- `auth_sessions`;
- `notificaciones_push_suscripciones`;
- `usuarios_dispositivos`;
- `usuario_google_oauth`.

## Persistencia
La nueva línea V2 usa un namespace distinto para no restaurar accidentalmente una base creada por las entregas V001 anuladas:

```text
IndexedDB: mantto_lab_dgb_v2
Store:     sqlite
Key:       gestor_mantto_lab_v2
```

Después de cada mutación persistida se exportan los bytes de SQLite a IndexedDB.

## Reset LAB

```javascript
await ManttoLabDB.reset();
```

El reset elimina únicamente `gestor_mantto_lab_v2` del store LAB V2 y reconstruye desde `schema.sql` + `seed.sql`.

No toca almacenamiento de producción ni otro IndexedDB del Gestor.

## API de Fase 1

```javascript
await ManttoLabDB.init();
ManttoLabDB.query(sql, params);
ManttoLabDB.scalar(sql, params);
await ManttoLabDB.run(sql, params);
await ManttoLabDB.exec(sql);
await ManttoLabDB.transaction(async tx => { /* ... */ });
await ManttoLabDB.persist();
await ManttoLabDB.reset();
ManttoLabDB.exportBytes();
await ManttoLabDB.replaceWithBytes(bytes);
ManttoLabDB.databaseStatistics();
ManttoLabDB.getStatus();
```

## Dependencia SQLite WASM
Se fija `sql.js` v1.14.2.

Los archivos `sql-wasm.js` y `sql-wasm.wasm` incluidos provienen del artifact `dist` del workflow oficial de `sql-js/sql.js` para el commit de release `9c4e167ec37129192d166ab9223faa9a4bd07c58`.

Esta entrega incluye también la licencia MIT del proyecto.

No existe petición runtime a jsDelivr, npm ni GitHub Releases para cargar SQLite: los archivos quedan dentro del propio repositorio y GitHub Pages los sirve como assets estáticos.

## Página de diagnóstico
Abrir:

```text
/lab/
```

Debe mostrar estado, tablas, usuarios, proyectos, equipos y tickets LAB, además de permitir persistencia manual y Reset LAB.

## Aplicación
**Prerequisito:** usar un worktree limpio basado en el commit indicado. No superponer esta fase sobre las Fases LAB V001 anuladas.

Extraer el ZIP y copiar su contenido en la raíz de `updated_code` conservando carpetas.

Ejemplo PowerShell no destructivo:

```powershell
$REPO="C:\Users\T14s\Desktop\Nueva-estructura-Modulos\mantto_gestor_frontend"
$ZIP="$env:USERPROFILE\Downloads\FASE_1_LAB_DGB_SQLITE_WASM_V002.zip"
$TMP=Join-Path $env:TEMP "FASE_1_LAB_DGB_SQLITE_WASM_V002"

Remove-Item $TMP -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive $ZIP -DestinationPath $TMP -Force
Copy-Item "$TMP\*" $REPO -Recurse -Force

Set-Location $REPO
git status --short
git diff --stat
```

No se requiere `git apply`.

## Validaciones de esta entrega
Se ejecutan dos motores distintos:

```text
Python sqlite3        -> DDL + seed + FK + columnas generadas
sql.js 1.14.2 WASM   -> DDL + seed + FK + fixtures + columnas generadas
```

También se valida sintaxis JavaScript con `node --check`, integridad SHA-256 del paquete y ausencia de URLs productivas en el runtime de Fase 1.

## Fuera de alcance
Fase 1 todavía no modifica:
- `index.html` principal;
- `core/http.js`;
- `core/auth.js`;
- `_redirects`;
- backend Node/Express de referencia;
- módulos funcionales.

Por lo tanto, Fase 1 no afirma todavía que el frontend principal esté aislado de producción. Ese aislamiento corresponde a Fase 3.

## Declaraciones de ejecución
- No se modifica GitHub remoto al generar el ZIP.
- No se ejecuta contra Aiven.
- No se ejecuta contra Azure.
- No se modifica `ziSirrush/GestorMantto`.
- No se declara E2E de GitHub Pages hasta probarlo en navegador publicado.
