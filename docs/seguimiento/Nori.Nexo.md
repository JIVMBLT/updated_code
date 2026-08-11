# Nori.Nexo

Proyecto: Mantto Gestor  
Componente: Nori / Nexo  
Estado: PROPUESTO — PENDIENTE DE AUDITORÍA N0  
Documento interno: updated_code  
Fecha: 2026-08-10  
Autor técnico de integración: Aster  
Firma técnica: ASTER-MG  
Documento base funcional: propuesta de Nexo, firma documental NX-DOC  

---

## 1. Objetivo

Evolucionar el Nori actual para incorporar capacidades de IA controladas dentro de Mantto Gestor, conservando su función como asistente visible del usuario y agregando un flujo interno de diagnóstico especializado mediante Nexo.

La IA no sustituirá la arquitectura existente, los permisos del backend ni la autoridad técnica del proyecto.

La separación conceptual acordada es:

```text
Nori = asistente visible para el usuario
Nexo = analista interno para tickets especializados
Aster = autoridad de ingeniería, auditoría e implementación
```

---

## 2. Estado de esta definición

### APROBADO CONCEPTUALMENTE

- Nori permanece como asistente del usuario final.
- Nexo no se expone como un modo general disponible para todos los usuarios.
- Nexo se utilizará como proceso interno asociado a tickets especializados.
- Aster conserva la autoridad técnica para causa raíz, arquitectura, código, seguridad, dependencias, FIX, FASE y validación.
- La IA interpreta; el backend autoriza; el backend ejecuta.
- La IA no tendrá acceso directo a la base de datos.
- Nori no se convertirá en un asistente generalista ni en un buscador de Internet.
- El usuario normal no deberá recibir información técnica interna.
- No se implementará nada antes de la auditoría N0 contra la última versión real de `updated_code`.

### PROPUESTO

- Integrar un proveedor de IA mediante backend.
- Implementar un motor de conocimiento autorizado para Nori.
- Crear un flujo automático de diagnóstico de Nexo para tickets especializados.
- Crear un motor de guías visuales en pantalla para Nori.
- Crear un Action Gateway para acciones permitidas.

### POR VALIDAR

- Implementación real actual de Nori.
- Endpoints actuales.
- Services, repositories y legacy asociados.
- Tablas actuales reutilizables para tickets, notas internas y diagnósticos.
- Proveedor final de IA.
- Modelo final de almacenamiento del conocimiento.
- Permisos exactos para consultar diagnósticos internos.
- Costos, límites y retención de contexto de IA.

### DESCARTADO

- Un “Modo Nexo” abierto a todos los usuarios.
- Activación mediante una clave fija almacenada en frontend.
- Acceso IA directo a MySQL.
- Nexo modificando código automáticamente.
- Volver Nori un asistente generalista.
- Exponer endpoints, SQL, infraestructura, credenciales, tokens o logs internos al usuario final.
- Implementar la arquitectura únicamente a partir de este documento sin auditar código real.

---

## 3. Rol de Nori

Nori será la identidad visible para los usuarios de Mantto Gestor.

Su ámbito estará restringido al propio Gestor.

### Capacidades funcionales previstas

Nivel 1 — Consulta:

- explicar funcionalidades;
- guiar procedimientos;
- consultar FAQs y documentación autorizada;
- consultar estados e información permitida por los permisos efectivos del usuario.

Nivel 2 — Operación no crítica:

- crear tareas personales;
- crear tareas colaborativas;
- preparar solicitudes;
- levantar tickets.

Nivel 3 — Escalamiento:

- recopilar contexto adicional;
- generar tickets especializados;
- conservar contexto funcional suficiente para evitar que el usuario repita el problema.

Nivel 4 — Acciones críticas:

- no disponibles inicialmente.

Nori no deberá responder preguntas generales ajenas a Mantto Gestor.

Ejemplo de límite:

```text
Usuario: ¿Cuál es la capital de Francia?

Nori: Puedo ayudarte con Mantto Gestor, sus procesos y las tareas disponibles dentro del sistema.
```

---

## 4. Información que Nori no debe exponer

Aunque exista una IA con contexto técnico interno, el usuario normal no deberá recibir:

- código;
- endpoints internos;
- Controllers;
- Services;
- Repositories;
- SQL;
- nombres de tablas cuando no sean parte funcional del producto;
- credenciales;
- tokens;
- secretos;
- arquitectura de infraestructura;
- configuración de servidores;
- logs internos completos;
- stack traces técnicos.

La respuesta visible debe mantenerse en lenguaje funcional y operativo.

---

## 5. Nexo: rol interno

Nexo será un analista interno, no una segunda experiencia general para usuarios.

Su función será:

- analizar tickets especializados;
- interpretar contexto técnico sanitizado;
- preparar diagnósticos preliminares;
- separar evidencia de hipótesis;
- identificar componentes y capas a revisar;
- clasificar riesgo;
- preparar información para Aster;
- colaborar con documentación funcional y ejecutiva a partir de cierres técnicos.

Nexo no sustituye a Aster como autoridad técnica.

---

## 6. Cambio acordado: Nexo automático en tickets especializados

Se descarta por ahora la idea de obligar a los usuarios a entrar manualmente a un “Modo Nexo”.

La arquitectura preferida es:

```text
Usuario
  ↓
Nori
  ↓
Ticket
  ↓
¿Ticket especializado?
  ├── No → flujo normal de soporte
  └── Sí
       ↓
Backend prepara contexto técnico sanitizado
       ↓
Nexo genera diagnóstico preliminar
       ↓
Diagnóstico asociado al ticket
       ↓
Visible solo para personal autorizado
       ↓
Aster lo usa como insumo técnico
```

El diagnóstico interno no debe estar visible para el usuario creador del ticket si no tiene permiso explícito.

La restricción deberá aplicarse en backend/API, no únicamente ocultarse en frontend.

---

## 7. Contexto mínimo propuesto para Nexo

Un ticket especializado deberá entregar a Nexo información estructurada, evitando contexto irrelevante o sensible.

Campos conceptuales:

```text
ticket_id
usuario_id interno
empresa
módulo
función afectada
registro o entidad, si aplica
descripción
resultado esperado
resultado obtenido
mensaje visible
acciones previas
historial funcional pertinente
fecha/hora
correlation_id, si existe
```

No enviar salvo necesidad técnica autorizada:

- JWT;
- cookies;
- contraseñas;
- API keys;
- secretos;
- headers sensibles;
- credenciales de BD;
- stack traces completos sin sanitizar.

---

## 8. Contrato de salida de Nexo

El diagnóstico deberá mantener un formato estructurado y verificable.

```text
DIAGNÓSTICO NEXO

Ticket:
Problema:

EVIDENCIA CONFIRMADA:
- datos observados o respaldados

HIPÓTESIS:
- explicaciones posibles que requieren comprobación

PUNTOS A REVISAR:
- módulos, capas o flujos que Aster debe auditar

RIESGO:
- bajo / medio / alto / crítico

RECOMENDACIÓN:
- qué debe auditar Aster

POR VALIDAR:
- información no confirmable todavía
```

Nexo nunca deberá presentar una hipótesis como causa raíz confirmada.

---

## 9. Autoridad técnica

Flujo obligatorio:

```text
Ticket especializado
 ↓
Nexo analiza
 ↓
Diagnóstico preliminar
 ↓
Aster revisa código real
 ↓
Aster confirma o rechaza hipótesis
 ↓
Auditoría completa del flujo cuando proceda
 ↓
FIX / FASE
 ↓
Implementación
 ↓
Validación
```

Aster mantiene autoridad sobre:

- causa raíz;
- arquitectura;
- seguridad;
- backend;
- frontend;
- base de datos;
- dependencias;
- legacy;
- FIX;
- FASE;
- pruebas;
- aprobación técnica.

---

## 10. Arquitectura IA propuesta

Conceptualmente:

```text
Frontend Nori
      ↓
Backend Mantto Gestor
      ↓
Nori Service / AI Orchestrator
      ↓
Control de alcance
      ↓
Control de permisos
      ↓
Proveedor IA
      ↓
Interpretación estructurada
      ↓
Action Gateway
      ↓
Validaciones del backend
      ↓
Service real autorizado
      ↓
Resultado
```

Regla fundamental:

```text
La IA interpreta.
El backend autoriza.
El backend ejecuta.
```

La IA no ejecutará directamente SQL ni operaciones arbitrarias del sistema.

---

## 11. Action Gateway

Se propone una capa explícita entre la IA y las operaciones reales.

La IA podrá producir una solicitud estructurada, por ejemplo:

```json
{
  "action": "TASK_CREATE",
  "parameters": {}
}
```

El backend deberá resolver posteriormente:

- si la acción existe;
- si está autorizada;
- si el usuario tiene permisos;
- si el alcance de empresa/zona es válido;
- si los parámetros son válidos;
- si requiere confirmación;
- qué Service real debe ejecutar la acción.

La IA nunca debe producir JavaScript arbitrario para controlar la aplicación.

---

## 12. Confirmaciones por nivel

Política conceptual:

```text
Nivel 1 — Consulta
→ puede ejecutarse directamente.

Nivel 2 — Operación reversible/no crítica
→ confirmar cuando afecte a terceros o cree información compartida.

Nivel 3 — Escalamiento
→ confirmar antes de crear un ticket especializado cuando corresponda.

Nivel 4 — Acción crítica
→ bloqueada inicialmente.
```

La política exacta se definirá en N1 después de la auditoría.

---

## 13. Guías visuales de Nori

Se considera técnicamente viable que Nori guíe al usuario mediante animaciones y resaltado de elementos reales de la interfaz.

Ejemplo:

```text
Usuario: ¿Cómo creo una tarea colaborativa?

Nori
 ↓
activa guía autorizada
 ↓
resalta Tareas
 ↓
espera interacción
 ↓
resalta Nueva tarea
 ↓
explica campos
 ↓
avanza según estado real de la vista
```

Capacidades previstas:

- spotlight;
- resaltado o pulso;
- flechas;
- tooltip/burbuja de Nori;
- indicador de pasos;
- siguiente / atrás / salir;
- espera de interacción;
- scroll controlado;
- adaptación escritorio/móvil/PWA.

### Regla de seguridad

Nori no deberá generar selectores CSS arbitrarios ni manipular libremente el DOM.

Se propone un catálogo controlado de guías:

```text
Nori
 ↓
GUIDE_CREATE_COLLABORATIVE_TASK
 ↓
Guide Engine de Mantto Gestor
 ↓
Pasos previamente autorizados
```

Cada guía deberá respetar permisos efectivos. Si el usuario no tiene acceso a una función, Nori no debe enseñarle a ejecutarla como si estuviera disponible.

La misma fuente estructurada de pasos podrá servir posteriormente como insumo del Manual de Usuario.

---

## 14. Conocimiento autorizado

Nori podrá consultar únicamente fuentes de conocimiento autorizadas para Mantto Gestor.

Posibles fuentes futuras:

- FAQ;
- Manual de Usuario;
- procedimientos;
- glosario;
- manual de soluciones para Soporte;
- reglas de negocio aprobadas;
- documentación funcional de módulos.

No se autoriza por este documento navegación general por Internet.

Nexo será responsable de generar y mantener la documentación funcional, operativa, ejecutiva y de soporte a partir de los cierres técnicos suministrados por Aster.

---

## 15. División de responsabilidades Aster / Nexo

### Aster

Responsable técnico de:

- arquitectura;
- auditoría de código;
- backend;
- frontend;
- base de datos;
- APIs;
- seguridad;
- autenticación;
- permisos;
- integraciones;
- Apps Script;
- Azure/Aiven;
- legacy;
- dependencias;
- migraciones;
- FIX;
- FASE;
- validación;
- cumplimiento de Constitución y Nevera.

### Nexo

Responsable documental de:

- Manual de Usuario;
- glosario;
- Manual de Soluciones para Soporte;
- FAQs;
- guías rápidas;
- procedimientos;
- material de capacitación;
- reportes ejecutivos;
- presentables para Dirección;
- cierres funcionales;
- documentación operativa.

Nexo utilizará como fuente los cierres técnicos almacenados en `updated_code`.

No deberá inventar funciones o estados. Lo no respaldado deberá marcarse `POR VALIDAR`.

---

## 16. Documentación técnica que Aster debe dejar

Después de cada fase relevante, FIX importante o envío a Nevera, Aster deberá generar dentro de `updated_code` documentación con, cuando aplique:

```text
Estado
Problema original
Solución aplicada
Archivos modificados
Endpoints afectados
Controllers
Services
Repositories
BD
Dependencias
Validaciones
Pruebas
Riesgos
Pendientes
Comportamiento esperado
Mensajes relevantes al usuario
Restricciones
Siguiente paso
Autor
Firma
PATCH / FASE
Fecha
```

Los FIX pequeños pueden mantener solamente el README técnico del entregable. Los cambios importantes, arquitectónicos, de seguridad, permisos, BD, integraciones o Nevera deberán tener cierre documental específico.

Esta documentación es interna de `updated_code` y no se incorpora automáticamente al producto final.

---

## 17. Seguridad

La futura integración deberá contemplar como mínimo:

- prompt injection;
- bypass de permisos;
- extracción de secretos;
- acceso cruzado entre usuarios;
- acceso cruzado entre empresas;
- ejecución de acciones no autorizadas;
- manipulación de contexto;
- instrucciones externas maliciosas;
- exposición de arquitectura;
- replay o abuso de acciones;
- sanitización del contexto técnico enviado a Nexo.

No registrar nunca:

- API Keys;
- tokens;
- contraseñas;
- secretos;
- cookies de sesión.

---

## 18. Proveedor IA

La integración con un proveedor IA es factible, pero el proveedor exacto permanece `POR VALIDAR`.

El documento base de Nexo propuso variables de Azure OpenAI como referencia:

```text
AZURE_OPENAI_ENDPOINT
AZURE_OPENAI_API_KEY
AZURE_OPENAI_API_VERSION
AZURE_OPENAI_DEPLOYMENT
AZURE_OPENAI_MODEL
```

Opcionales conceptuales:

```text
NORI_AI_ENABLED
NORI_AI_MAX_TOKENS
NORI_AI_TEMPERATURE
NORI_AI_TIMEOUT_MS
```

Esto NO constituye todavía una decisión de proveedor ni autoriza agregar esas variables.

Toda credencial real deberá existir únicamente en configuración segura de backend y nunca en frontend, GitHub, documentación, logs o commits.

Una decisión de proveedor o arquitectura IA deberá documentarse mediante ADR si corresponde.

---

## 19. Persistencia del diagnóstico Nexo

Se considera necesario que el diagnóstico técnico pueda quedar asociado al ticket especializado y mostrarse en una sección interna de su interfaz.

Ejemplo conceptual:

```text
🔒 Diagnóstico técnico interno

Estado
Fecha
Riesgo
Evidencia
Hipótesis
Puntos a revisar
Recomendación
Por validar
```

### POR VALIDAR

No se ha decidido dónde persistir esta información.

Antes de crear una tabla nueva se deberá revisar si las estructuras existentes de tickets, interacciones, comentarios o notas internas pueden soportarla sin ambigüedad ni pérdida de integridad.

Crear una tabla nueva requiere justificación técnica y aprobación expresa.

---

## 20. Relación con Constitución de Desarrollo

Toda evolución Nori/Nexo deberá respetar:

- trabajo acumulativo;
- última versión aprobada;
- fases;
- PATCH;
- módulos en Nevera;
- revisión de legacy;
- revisión de dependencias;
- auditoría completa del flujo ante la primera inconsistencia;
- conservación de cambios aprobados;
- no realizar fixes aislados sin revisar contratos y dependencias;
- validar antes de avanzar;
- Aiven como fuente oficial de datos operativos;
- permisos efectivos también en backend;
- responsive/PWA;
- Nori desacoplada.

Este documento no reemplaza el código real.

---

## 21. Fases técnicas propuestas Nori/Nexo

Estas fases son independientes del trabajo actual de reconciliación Codex.

No deberán comenzar hasta que la capa de autenticación/seguridad que actualmente se está auditando esté suficientemente definida.

### N0 — Auditoría

Estado: PENDIENTE

No modificar código.

Revisar contra la última versión real de `updated_code`:

- Nori frontend;
- backend relacionado;
- endpoints;
- Controllers;
- Services;
- Repositories;
- BD;
- permisos;
- tickets;
- tareas;
- FAQ;
- documentación;
- legacy;
- dependencias;
- almacenamiento actual de contexto/historial.

Entregable: mapa de diferencias entre Nori real y este documento.

### N1 — Contrato funcional

Definir:

- alcance;
- personalidad;
- límites;
- acciones permitidas;
- confirmaciones;
- permisos;
- escalamiento;
- criterio de ticket especializado;
- estructura de contexto y diagnóstico.

### N2 — Conocimiento

Definir y conectar fuentes autorizadas:

- FAQ;
- manuales;
- procedimientos;
- glosario;
- documentación funcional.

### N3 — Arquitectura IA

Definir:

- proveedor;
- modelo;
- costos;
- límites;
- timeouts;
- logging;
- seguridad;
- retención;
- contratos;
- Action Gateway;
- fallback si aplica.

### N4 — Integración IA mínima

Conectar el backend con el proveedor seleccionado sin habilitar todavía acciones críticas.

### N5 — Acciones

Implementar progresivamente:

1. consultas;
2. tareas personales;
3. tareas colaborativas;
4. tickets especializados.

### N6 — Diagnóstico automático especializado

Implementar:

- detección/clasificación autorizada del ticket especializado;
- construcción de contexto sanitizado;
- ejecución de Nexo;
- salida estructurada;
- persistencia;
- permisos de lectura;
- reanálisis cuando corresponda;
- entrega de diagnóstico a Aster.

### N7 — Seguridad

Pruebas de:

- permisos;
- prompt injection;
- acceso indebido;
- información sensible;
- acciones no autorizadas;
- aislamiento entre usuarios/empresas;
- fuga de contexto.

### N8 — UX y guías visuales

Revisar e implementar progresivamente:

- interfaz Nori;
- estados de carga;
- mensajes;
- errores;
- confirmaciones;
- accesibilidad;
- Guide Engine;
- comportamiento responsive/PWA.

### N9 — Validación integral

Validar:

- Nori funcional;
- conocimiento;
- IA;
- tareas;
- tickets;
- diagnóstico Nexo;
- permisos;
- seguridad;
- guías visuales;
- regresiones;
- módulos en Nevera.

---

## 22. Relación con la auditoría Codex actual

Actualmente el proyecto se encuentra primero en la Fase 0 de reconciliación/auditoría de los cambios de Codex relacionados con autenticación, sesiones, CORS, TLS, rutas y sincronizaciones.

La línea Nori/Nexo NO debe mezclarse con esa fase.

Orden recomendado:

```text
Fase 0 Codex
↓
Reconciliar seguridad/autenticación
↓
Cerrar dependencias necesarias
↓
N0 Nori/Nexo
```

Motivo: Nori/Nexo dependerá de autenticación, permisos y backend, por lo que diseñarlo antes de estabilizar esas capas aumentaría el riesgo de retrabajo.

---

## 23. Regla de última versión

Cuando se abra N0, Aster deberá:

1. obtener el `updated_code` vigente;
2. identificar la última versión técnicamente válida;
3. revisar cambios posteriores;
4. auditar Nori real;
5. comparar implementación contra este documento;
6. identificar contradicciones;
7. reportar diferencias;
8. implementar únicamente la fase autorizada.

No reconstruir Nori basándose exclusivamente en esta especificación.

---

## 24. Resultado esperado

### Usuario normal

```text
Usuario
 ↓
Nori
 ↓
Ayuda y acciones autorizadas dentro de Mantto Gestor
```

### Problema especializado

```text
Usuario
 ↓
Nori
 ↓
Ticket especializado
 ↓
Nexo interno
 ↓
Diagnóstico preliminar oculto al usuario normal
 ↓
Aster
 ↓
Auditoría contra código real
 ↓
FIX / FASE
```

### Desarrollo

```text
Aster
 ↓
Código real
 ↓
Auditoría
 ↓
Implementación
 ↓
Validación
 ↓
Cierre técnico en updated_code
 ↓
Nexo
 ↓
Manual / Soporte / Dirección / Presentables
```

---

## 25. Principio final

Nori debe ser la asistente del usuario.

Nexo debe ser el puente de análisis y documentación interna.

Aster debe ser la autoridad de ingeniería.

Ninguno debe invadir el ámbito del otro.

La IA debe aumentar la capacidad de Mantto Gestor sin sustituir sus controles de seguridad, permisos, arquitectura ni proceso de desarrollo.

---

## Próxima actividad autorizada

**Ninguna implementación Nori/Nexo por ahora.**

La próxima actividad de esta línea será, cuando corresponda:

```text
N0 — AUDITORÍA DEL NORI EXISTENTE CONTRA LA ÚLTIMA VERSIÓN DE updated_code
```

Cualquier diferencia entre este documento y el código real deberá reportarse antes de modificar arquitectura, BD, permisos o flujos existentes.
