# FASE 0 — AUDITORÍA MAESTRA DE INTEGRACIÓN CODEX

Proyecto: Mantto Gestor  
Estado: CERRADA — AUDITORÍA COMPLETADA / SIN IMPLEMENTACIÓN  
Fecha: 2026-08-11  
Autor técnico: Aster  
Firma: ASTER-MG  

---

## 1. Objetivo

Auditar la versión modificada por Codex antes de integrar, desplegar o ejecutar migraciones, comparando:

- **A — Base funcional previa a Codex:** `Ultima ver 1004hrs - 0811.zip`.
- **B — Versión Codex:** `JIVMBLT/updated_code`, rama `main`.
- **C — Base de datos de referencia:** `Dump20260811.zip`.

Durante esta fase NO se modificó código funcional, NO se ejecutó SQL en Aiven, NO se modificaron Apps Script, NO se desplegó Azure/Netlify y NO se tocaron módulos en Nevera.

---

## 2. Resumen ejecutivo

La auditoría confirma que la mayor parte del endurecimiento de seguridad de Codex es **conceptualmente correcta y recomendable**, especialmente:

- primer acceso ligado a identidad autenticada;
- endurecimiento de recuperación de contraseña;
- invalidación de sesiones por cambio de contraseña;
- almacenamiento del access token fuera de `localStorage`;
- refresh token en cookie HttpOnly;
- CSRF para sesión renovable;
- protección de rutas operativas;
- TLS con validación de certificado por defecto;
- CORS compatible con cookies/credenciales;
- rate limiting;
- protección adicional de rutas de sincronización.

Sin embargo, la versión **NO es desplegable como está**. Se detectaron cuatro bloqueos principales:

1. **CRÍTICO — `auth_sessions` de Aiven no coincide con el esquema que exige Codex.**
2. **CRÍTICO — los Apps Script actuales no pueden autenticarse contra los `/sync` endurecidos con sesión humana + rol Programador.**
3. **CRÍTICO — `core/config.js` de `updated_code` apunta a `http://localhost:3001`.**
4. **ALTO — `ins_fl` en GitHub conserva una regresión SQL ya confirmada en producción/pruebas (`f.id_proyecto` sin alias declarado).**

Adicionalmente se confirmó una inconsistencia TLS en `.env.example` y un defecto legado adicional en `ins_fl` (`f.f.proyecto`) que ya existía antes de Codex.

Conclusión general:

```text
CODEX SECURITY
→ CONSERVAR
→ PERO NO DESPLEGAR DIRECTAMENTE
→ REQUIERE RECONCILIACIÓN PREVIA
```

---

## 3. Fuentes revisadas

### Base A

Se inspeccionó directamente el contenido de `Ultima ver 1004hrs - 0811.zip`.

La base A confirma, entre otras cosas:

- `core/auth.js` guardaba access token y usuario principalmente en `localStorage`.
- no existía `auth-session.service.js`.
- no existía `auth-rate-limit.middleware.js`.
- `/first-login/password` y `/first-login/security-question` no exigían `requireAuth`.
- primer acceso aceptaba `user_id`, `id_SB` o `correo` enviados por cliente.
- múltiples rutas de lectura eran públicas u opcionalmente autenticadas.
- varios `/sync` estaban abiertos sin sesión humana.
- `core/config.js` apuntaba a Azure publicado.
- `db.js` solo verificaba certificado si `DB_SSL_REJECT_UNAUTHORIZED === 'true'`.
- `ins_fl.sync` utilizaba correctamente `WHERE id_proyecto = ?`.

### Versión B

Se inspeccionó `updated_code` en GitHub, incluyendo:

- `backend/src/routes/auth.routes.js`
- `backend/src/controllers/auth.controller.js`
- `backend/src/middleware/auth.middleware.js`
- `backend/src/middleware/auth-rate-limit.middleware.js`
- `backend/src/middleware/historical-sync.middleware.js`
- `backend/src/services/auth-session.service.js`
- rutas de Tickets, Portafolio, Logística, Instalaciones, Clientes, `ins_fl`
- `backend/src/config/db.js`
- `backend/src/config/http.config.js`
- `backend/.env.example`
- `backend/sql/20260810_AUTH_SESSIONS.sql`
- `core/auth.js`
- `core/config.js`
- `backend/package-lock.json`
- `backend/src/controllers/ins-fl.controller.js`

### Base C

Se inspeccionó `Dump20260811.zip`, especialmente:

- `mydb_auth_sessions.sql`
- `mydb_auth_audit.sql`
- `mydb_usuarios.sql`
- tablas de permisos, Tickets, Portafolio, `ins_fl`, Instalaciones y Ventas.

---

## 4. Hallazgos por área

## 4.1 Primer acceso

### Antes

La base A permitía que el cliente enviara directamente:

```text
user_id / id_SB / correo
```

para establecer contraseña inicial o pregunta de seguridad.

Los endpoints no requerían `requireAuth`.

### Codex

La versión B cambia a:

```text
POST /api/auth/first-login/password
POST /api/auth/first-login/security-question
```

ambos protegidos por `requireAuth`.

El backend obtiene al usuario desde:

```text
req.user.id_SB
```

y valida que continúe activo y con `must_change_password = 1`.

### Evaluación

**CONSERVAR.**

Es una mejora real porque elimina la posibilidad de elegir arbitrariamente otro usuario desde el payload del navegador.

### Ajuste requerido

Debe integrarse junto con la nueva estrategia de sesión; no debe desplegarse de forma aislada si `auth_sessions` permanece incompatible.

---

## 4.2 Recuperación de contraseña

Codex agrega:

- rate limit de recuperación;
- challenge firmado con caducidad;
- vínculo del challenge con usuario/correo/versión de contraseña;
- invalidación del challenge si la contraseña cambia;
- bloqueo tras intentos fallidos;
- revocación de sesiones después del cambio.

### Evaluación

**CONSERVAR CON VALIDACIÓN.**

El enfoque es correcto.

### Observación

El dump actual de `usuarios` incluye columnas relacionadas con recuperación/bloqueo, por lo que existe soporte parcial en BD.

Antes de Fase 2 se deberá validar el flujo completo con casos reales:

- respuesta correcta;
- respuesta incorrecta;
- quinto intento;
- challenge vencido;
- challenge previo después de cambiar contraseña;
- sesión antigua después de recuperación.

---

## 4.3 JWT y versión de sesión

Codex incorpora `session_version` dentro del access token, derivado de `password_changed_at`.

`auth.middleware.js` vuelve a consultar al usuario y exige:

```text
JWT.session_version == usuarios.password_changed_at
```

### Evaluación

**CONSERVAR.**

Es una mejora importante porque permite invalidar JWT existentes al cambiar la contraseña o resetear credenciales.

### Dependencia

Debe quedar alineado con los resets administrativos del Panel de Control; no se debe poner `password_changed_at = NULL` sin definir explícitamente la semántica final.

---

## 4.4 Sesiones persistentes

Codex introduce:

- access token en `sessionStorage`;
- refresh token en cookie HttpOnly;
- `SameSite=None; Secure` en publicación;
- CSRF separado;
- rotación de refresh token;
- 28 días de inactividad;
- 90 días máximos absolutos;
- refresh coordinado entre pestañas mediante `navigator.locks`;
- renovación de actividad no más frecuente que aproximadamente cada 30 minutos;
- logout con revocación server-side.

### Evaluación

**CONSERVAR CON AJUSTES OBLIGATORIOS.**

La arquitectura es superior a la base A, donde access token/usuario persistían en `localStorage`.

### BLOQUEO CRÍTICO DETECTADO

La BD real ya contiene una tabla llamada `auth_sessions`, pero su esquema es distinto.

#### Esquema existente en Dump20260811

```text
id_sesion CHAR(36)
usuario_id BIGINT
refresh_token_hash CHAR(64)
expires_at DATETIME
last_used_at DATETIME
revoked_at DATETIME
created_at DATETIME
```

#### Esquema esperado por Codex

```text
id_session BIGINT AUTO_INCREMENT
usuario_id INT
 token_hash CHAR(64)
csrf_hash CHAR(64)
session_version VARCHAR(64)
session_started_at DATETIME(3)
last_activity_at DATETIME(3)
idle_expires_at DATETIME(3)
absolute_expires_at DATETIME(3)
revoked_at DATETIME(3)
created_ip
last_ip
user_agent
created_at
```

`auth-session.service.js` utiliza explícitamente las columnas del segundo esquema.

### Problema adicional de la migración

`20260810_AUTH_SESSIONS.sql` usa:

```sql
CREATE TABLE IF NOT EXISTS auth_sessions (...)
```

Como `auth_sessions` YA existe, ejecutar ese SQL no transforma la tabla existente.

Por tanto:

```text
Ejecutar migración Codex tal cual
→ tabla ya existe
→ MySQL no la modifica
→ backend intenta token_hash/csrf_hash/id_session...
→ columnas inexistentes
→ login/refresh fallan
```

### Decisión

**NO EJECUTAR `20260810_AUTH_SESSIONS.sql` COMO ESTÁ.**

Fase posterior deberá diseñar una migración real de reconciliación (`ALTER`, tabla nueva + migración o reemplazo controlado), preservando lo que corresponda.

### Otra inconsistencia

`usuarios.id_SB` es `BIGINT`, mientras el SQL Codex propone `auth_sessions.usuario_id INT`.

Debe alinearse a `BIGINT` antes de producción.

---

## 4.5 Access token en frontend

### Base A

`core/auth.js` utilizaba `localStorage` para token y usuario.

### Codex

`core/auth.js` mueve el access token a `sessionStorage`, usa cookie HttpOnly para refresh y mantiene CSRF de sesión separado.

### Evaluación

**CONSERVAR.**

Reduce la persistencia del bearer token en almacenamiento local de larga duración.

### Validaciones futuras obligatorias

- F5;
- cerrar/reabrir navegador;
- múltiples pestañas;
- expiración access token;
- renovación silenciosa;
- logout;
- usuario desactivado;
- cambio/reset de contraseña;
- Visor de usuarios.

---

## 4.6 Visor de usuarios

Codex conserva identidad real en:

```text
req.actorUser
```

y usa identidad efectiva en lecturas seguras:

```text
req.user = viewedUser
```

manteniendo `req.contextUser` / `req.viewerContext`.

### Evaluación

**CONSERVAR.**

Es consistente con la regla del proyecto de que los filtros deben usar identidad efectiva, especialmente en alcance comercial.

### Riesgo a validar

Cualquier endpoint de escritura debe continuar operando con identidad real/autorización correcta y no con identidad visualizada.

---

## 4.7 Rate limiting

Codex agrega middleware de rate limit.

Configuración observada/reportada:

- login: 10 solicitudes / 15 min por clave;
- recuperación: 5 solicitudes / 15 min;
- protección adicional de memoria del Map interno.

### Evaluación

**CONSERVAR.**

### Nota de precisión

El límite de 5/15 min corresponde a recuperación; login usa un límite distinto.

### Pendiente

Para despliegue multi-instancia, un limiter en memoria no comparte estado entre instancias. Para ~100 usuarios actuales puede ser suficiente inicialmente, pero si Azure escala horizontalmente debe considerarse un store compartido en revisión futura si el riesgo lo exige.

---

## 4.8 CORS

### Base A

Con `CORS_ORIGINS=*`:

```text
origin: true
credentials: false
```

### Codex

Las sesiones persistentes requieren cookies, por lo que Codex fuerza `credentials: true`.

Si `CORS_ORIGINS=*`:

- en desarrollo solo permite localhost/127.0.0.1/::1;
- en producción un origen web real será rechazado hasta configurar explícitamente `CORS_ORIGINS`.

### Evaluación

**CONSERVAR, REQUIERE CONFIGURACIÓN PREVIA.**

### Riesgo ALTO

Si se despliega sin configurar los orígenes productivos exactos, el navegador recibirá rechazo CORS.

Fase de configuración deberá definir explícitamente los frontends autorizados.

---

## 4.9 TLS MySQL

### Base A

```text
rejectUnauthorized = true solamente si variable === 'true'
```

Por defecto quedaba desactivada la validación.

### Codex

```text
rejectUnauthorized = true salvo que variable === 'false'
```

### Evaluación

**CONSERVAR.**

La política correcta para publicación es validar certificado por defecto.

### Inconsistencia

`backend/.env.example` actualmente contiene:

```text
DB_SSL_REJECT_UNAUTHORIZED=false
```

Esto contradice el objetivo del código y puede inducir a copiar una configuración insegura.

### Decisión

**CORREGIR EN FASE 1.**

No cambiar el valor productivo real sin verificar primero la configuración Azure/Aiven vigente.

---

## 4.10 Configuración frontend

### Base A

`core/config.js` apuntaba al backend Azure publicado.

### updated_code actual

```text
window.MANTTO_API_BASE = ... 'http://localhost:3001'
```

con Azure comentado.

### Evaluación

**NO INTEGRAR COMO ESTÁ.**

### Riesgo CRÍTICO de deploy

Si ese archivo se publica directamente, el navegador del usuario intentará llamar a `localhost:3001` en su propio dispositivo.

### Decisión

Fase 1 deberá reconciliar configuración de desarrollo/producción sin volver a mezclar URLs manualmente.

---

## 4.11 Protección de rutas operativas

Codex agregó autenticación obligatoria a varios módulos que antes eran públicos u opcionales.

Ejemplos confirmados:

### Tickets

Antes:

- listado público;
- detalle/interacciones con `optionalAuth`;
- sync público.

Codex:

```text
router.use(requireAuth)
/tickets/sync → requireProgrammerRole
/tickets/sync-fechas-cdmx → requireProgrammerRole
```

### Portafolio

Antes: rutas y sync sin `requireAuth` general.

Codex:

```text
router.use(requireAuth)
/portafolio/sync → requireProgrammerRole
```

### Logística

Antes: sync/read sin autenticación.

Codex:

```text
router.use(requireAuth)
/sync → requireProgrammerRole
```

### ins_fl

Antes:

```text
POST /sync → público
lecturas → públicas
```

Codex:

```text
router.use(requireAuth)
POST /sync → requireProgrammerRole
```

### Instalaciones Drive

Antes:

```text
/drive/carpetas/sync → público
```

Codex:

```text
requireAuth + requireProgrammerRole
```

### Ventas Clientes

Antes:

```text
/clientes/sync → público
```

Codex:

```text
requireAuth + requireHistoricalSyncEnabled
```

### Evaluación de lecturas humanas

**CONSERVAR.**

Cerrar lecturas operativas públicas es correcto.

### Evaluación de syncs

**NO INTEGRAR COMO ESTÁ PARA APPS SCRIPT.**

Ver siguiente sección.

---

## 4.12 Apps Script / sincronizaciones máquina a máquina

Este es el conflicto arquitectónico principal entre Codex y el flujo operativo real.

Los Apps Script actuales envían datos a endpoints como:

```text
Tickets sync
Portafolio sync
FL / ins_fl sync
Logística sync
Instalaciones Drive sync
Clientes / históricos
otros procesos controlados
```

No mantienen una sesión humana normal ni pueden depender razonablemente de un JWT personal de Programador.

Codex protegió varios de esos endpoints con:

```text
requireAuth
+
requireProgrammerRole
```

### Resultado si se despliega tal cual

```text
Apps Script
→ POST /sync
→ no bearer JWT humano
→ 401 Sesión requerida
```

O si se improvisa un token humano:

- expirará;
- quedará ligado a una persona;
- cambiar contraseña puede invalidarlo;
- refresh HttpOnly/CSRF no corresponde al modelo de Apps Script;
- auditoría atribuiría una integración automática a una identidad humana.

### Decisión arquitectónica

Separar identidades:

```text
requireAuth
→ usuarios humanos

requireIntegrationAuth
→ Apps Script / integraciones máquina a máquina
```

### Modelo recomendado para estudiar en fase específica

```text
Integration ID
+ timestamp
+ firma HMAC del body/timestamp
+ secret solo backend/Apps Script Properties
+ ventana temporal
+ protección replay
```

No se aprueba todavía el contrato exacto ni nombres de headers.

### Clasificación

**CRÍTICO — REQUIERE FASE PREVIA AL DESPLIEGUE DE RUTAS SYNC ENDURECIDAS.**

---

## 4.13 `ins_fl` — regresión confirmada

En base A, `syncInsFl` tenía:

```sql
FROM ins_fl
WHERE id_proyecto = ?
  AND referencia_sitio = ?
```

En `updated_code` aparece:

```sql
FROM ins_fl
WHERE f.id_proyecto = ?
  AND referencia_sitio = ?
```

No existe alias `f` en ese SELECT.

Este error coincide con el error real observado:

```text
Unknown column 'f.id_proyecto' in 'where clause'
```

### Evaluación

**REGRESIÓN CONFIRMADA EN VERSION CODEX/GITHUB.**

### Decisión

Fase 1 debe restaurar la consulta válida.

### Hallazgo legado adicional

En `getInsFlProjects` existe también:

```text
f.f.proyecto
```

Este defecto ya estaba presente en la base A, por lo que NO se atribuye a Codex.

Debe quedar registrado como pendiente separado; no mezclarlo con la reconciliación de la regresión de sync salvo que se abra explícitamente ese flujo.

---

## 4.14 Dependencias

Codex reportó actualización de `brace-expansion` y `npm audit` sin vulnerabilidades.

El `package-lock.json` actual muestra dependencias Azure sincronizadas y versiones nuevas de `brace-expansion` respecto a la base previa.

### Evaluación

**CONSERVAR.**

### Precisión

Durante esta Fase 0 no se ejecutó un nuevo `npm audit` independiente sobre un checkout completo de la versión B. Por tanto:

```text
npm audit = 0
```

se mantiene como **resultado reportado por Codex, no revalidado de manera independiente en esta fase**.

Antes de candidato a deploy deberá ejecutarse nuevamente `npm ci` + `npm audit` + validación de sintaxis.

---

## 4.15 Legacy / adaptadores

Se confirmó que continúan existiendo adaptadores legacy, por ejemplo rutas `data/*` que reexportan módulos nuevos y compatibilidades como `/usuarios` / `/users` dentro del adaptador de notificaciones.

### Evaluación

**NO ELIMINAR DURANTE RECONCILIACIÓN DE SEGURIDAD.**

La protección debe aplicarse sin romper contratos históricos mientras no exista evidencia de que un adaptador ya no tenga consumidores.

---

## 4.16 Nevera

La mayoría de cambios Codex analizados son transversales:

- middleware;
- auth;
- guards de rutas;
- configuración.

No constituyen por sí mismos una autorización para modificar lógica funcional de módulos congelados.

### Regla para siguientes fases

Si una ruta de un módulo en Nevera necesita seguridad:

```text
permitido → agregar guard transversal sin cambiar lógica funcional
prohibido → refactor funcional, cambios de KPI, consultas o UX no relacionados
```

Cualquier regresión encontrada dentro de un módulo congelado deberá tratarse como bug específico y con el mínimo cambio posible.

---

## 5. Matriz de decisiones

| Cambio Codex | Decisión | Motivo |
|---|---|---|
| Primer acceso con `requireAuth` | CONSERVAR | Evita seleccionar otro usuario desde payload |
| Identidad desde JWT/req.user | CONSERVAR | Seguridad y trazabilidad |
| Recovery challenge firmado | CONSERVAR | Reduce abuso/replay |
| Rate limit | CONSERVAR | Protección adicional |
| Access JWT máx. 12 h | CONSERVAR | Límite razonable |
| `session_version` | CONSERVAR | Revocación tras password change |
| Refresh cookie HttpOnly | CONSERVAR CON AJUSTES | BD actual incompatible |
| 28 días idle / 90 absoluto | CONSERVAR CON AJUSTES | Requiere migración real |
| CSRF refresh/logout | CONSERVAR | Necesario con cookies |
| Token access en sessionStorage | CONSERVAR | Mejora frente a localStorage |
| CORS credentials | CONSERVAR CON CONFIG PREVIA | Requiere orígenes exactos |
| TLS verify default true | CONSERVAR | Mejora seguridad |
| `.env.example` SSL=false | CORREGIR | Contradice política |
| Protección de lecturas | CONSERVAR | Datos operativos no deben ser públicos |
| `/sync` con JWT humano | NO INTEGRAR COMO ESTÁ | Rompe Apps Script |
| `core/config.js` localhost | NO INTEGRAR COMO ESTÁ | Rompe frontend publicado |
| `auth_sessions` CREATE IF NOT EXISTS | NO EJECUTAR COMO ESTÁ | Tabla existente no se transforma |
| `ins_fl WHERE f.id_proyecto` | CORREGIR | Regresión SQL confirmada |
| `f.f.proyecto` legado | PENDIENTE SEPARADO | Preexistente, no Codex |
| `brace-expansion` actualizado | CONSERVAR | Dependencia corregida |

---

## 6. Riesgos clasificados

### CRÍTICOS

1. **Esquema `auth_sessions` incompatible con servicio Codex.**
2. **Migración actual no modifica tabla existente.**
3. **Apps Script bloqueados por autenticación humana en `/sync`.**
4. **`core/config.js` apunta a localhost en main.**

### ALTOS

5. Regresión `ins_fl` en GitHub.
6. CORS productivo puede quedar completamente bloqueado si `CORS_ORIGINS` no se configura.
7. Reset administrativo futuro debe coordinarse con `session_version` / revocación.

### MEDIOS

8. `.env.example` contradice TLS seguro.
9. Limiter en memoria no comparte estado si Azure escala a varias instancias.
10. Adaptadores legacy pueden quedar inadvertidamente inaccesibles si se endurecen rutas sin inventario.

### BAJOS / CONTROLABLES

11. Compatibilidad de `navigator.locks` requiere fallback; el código ya contempla ruta sin locks.
12. Cambios de UX de sesión requieren pruebas en móvil/PWA.

---

## 7. Auditoría de BD

### Confirmado en Dump20260811

- `usuarios.id_SB` = BIGINT.
- existen `pass`, `must_change_password`, `failed_login_attempts`, `locked_until`, `password_changed_at`, `first_login_completed_at`.
- existe `auth_audit`.
- existe `auth_sessions`, pero con esquema anterior/incompatible.

### No se ejecutó

- ALTER;
- CREATE;
- DROP;
- migración;
- prueba directa contra Aiven.

### Recomendación

La futura reconciliación de `auth_sessions` debe definir explícitamente:

1. si hay sesiones antiguas que conservar;
2. si se migra estructura o se crea tabla reemplazo;
3. tipo BIGINT para `usuario_id`;
4. índices;
5. FK si procede;
6. estrategia de rollback;
7. despliegue coordinado backend + DB.

---

## 8. Auditoría de configuración

### Debe existir antes de despliegue

- `CORS_ORIGINS` productivo explícito.
- `JWT_SECRET` seguro.
- variables Aiven correctas.
- política TLS validada.
- configuración frontend productiva sin localhost.

### No se recomienda

- editar manualmente URL Azure/local cada deploy;
- `CORS_ORIGINS=*` en producción con cookies;
- desactivar TLS por copiar `.env.example`.

---

## 9. Qué Codex NO resolvió o dejó pendiente

La auditoría inversa detecta que el endurecimiento no cubre completamente:

- identidad propia para integraciones Apps Script;
- reconciliación con una tabla `auth_sessions` ya existente;
- configuración de `core/config.js` para múltiples entornos;
- regresión SQL de `ins_fl`;
- defectos legacy como `f.f.proyecto`;
- coordinación del reset administrativo con sesiones nuevas;
- prueba de carga/primer acceso concurrente.

Esto no invalida el trabajo de Codex; define las dependencias reales que faltaban para integrarlo al proyecto existente.

---

## 10. FASE 1 exacta resultante

### FASE 1 — Reconciliación base antes de Auth persistente

Objetivo: dejar `updated_code` coherente y sin regresiones conocidas antes de activar la nueva arquitectura de sesión.

Alcance propuesto:

1. Corregir regresión `ins_fl` de alias en `syncInsFl`.
2. Reconciliar `core/config.js` para entorno local/publicado sin URL localhost accidental en producción.
3. Corregir inconsistencia `DB_SSL_REJECT_UNAUTHORIZED=false` en `.env.example` sin tocar secretos ni configuración productiva real.
4. Revisar `.gitignore`/archivos sensibles y confirmar que no se reintroduzcan credenciales.
5. Preparar, pero NO ejecutar todavía, propuesta de reconciliación de `auth_sessions` basada en la tabla real del Dump20260811.
6. Inventariar consumidores máquina-a-máquina de todos los `/sync` para diseñar Fase M2M.

### Fuera de Fase 1

- no activar todavía refresh persistente en producción;
- no ejecutar SQL `auth_sessions`;
- no cambiar Apps Script todavía;
- no desplegar rutas `/sync` endurecidas hasta resolver M2M;
- no tocar lógica funcional de módulos en Nevera.

---

## 11. Plan de fases actualizado después de la auditoría

### Fase 1 — Reconciliación base

Config, regresión ins_fl, seguridad de archivos y diseño de migración real.

### Fase 2 — Primer acceso + recuperación

Integrar y probar primer acceso, recovery, rate limit, password/session version.

### Fase 3 — Sesiones persistentes + BD

Crear migración compatible con la tabla real, ejecutar solo después de aprobación, integrar refresh/logout y validar 28/90 días.

### Fase 4 — CORS + TLS + entornos

Cerrar configuración Azure/Netlify/local y validar cookies cross-origin.

### Fase 5 — Autenticación máquina-a-máquina

Diseñar e implementar `requireIntegrationAuth` y adaptar Apps Script solo en transporte/autenticación, sin alterar lógica funcional.

### Fase 6 — Protección progresiva de rutas

Activar guards finales por módulo una vez que humanos e integraciones tengan contratos separados.

### Fase 7 — Validación integral / candidato deploy

- sintaxis;
- npm ci;
- npm audit;
- health;
- login;
- primer acceso;
- recovery;
- refresh;
- logout;
- Visor;
- permisos;
- Apps Script;
- Tickets;
- Portafolio;
- FL;
- smoke tests;
- prueba controlada de primeros accesos concurrentes.

---

## 12. Respuestas de cierre de Fase 0

### 1. ¿Qué modificó realmente Codex?

Principalmente autenticación, sesiones, recuperación, rate limiting, CORS/TLS y guards de rutas, además de actualización de dependencia y configuración relacionada.

### 2. ¿Qué debemos preservar?

La mayoría del endurecimiento de autenticación y protección de lecturas.

### 3. ¿Qué rompe el proyecto actual?

- sesión persistente contra la tabla `auth_sessions` real;
- `/sync` con autenticación humana;
- `core/config.js` localhost;
- regresión `ins_fl`.

### 4. ¿Qué requiere BD/config antes?

- reconciliación real de `auth_sessions`;
- CORS productivo;
- TLS/config de entorno;
- frontend API base.

### 5. ¿Qué cambios posteriores deben incorporarse?

No hubo FIX funcional del Gestor posterior ayer. Los trabajos posteriores fueron sobre Scripts. La regresión `ins_fl` ya fue identificada y corregida en una versión desplegada/externa, pero el repositorio `updated_code` aún conserva la consulta incorrecta.

### 6. ¿Qué entra exactamente a Fase 1?

La sección 10 de este documento.

---

## 13. Estado final

```text
FASE 0
AUDITORÍA: COMPLETADA
IMPLEMENTACIÓN: NO REALIZADA
BD: NO MODIFICADA
APPS SCRIPT: NO MODIFICADO
DEPLOY: NO REALIZADO
```

La versión Codex queda clasificada como:

```text
APROBADA COMO BASE DE SEGURIDAD
PERO NO APROBADA PARA DEPLOY DIRECTO
```

El siguiente paso técnico, sujeto a autorización, es **FASE 1 — RECONCILIACIÓN BASE**.
