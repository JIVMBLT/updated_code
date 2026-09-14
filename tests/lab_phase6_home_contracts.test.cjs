#!/usr/bin/env node
'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const routes=read('lab/backend/routes/lab-home.routes.js');
const tasks=read('lab/backend/services/lab-tasks.service.js');
const notifications=read('lab/backend/services/lab-notifications.service.js');
const blobs=read('lab/backend/services/lab-blob-store.js');
const interactions=read('lab/backend/services/lab-interactions.service.js');
const endpoints=[
  '/api/home/snapshot','/api/home/bootstrap','/api/actividad-reciente','/api/pendientes/catalogos','/api/pendientes',
  '/api/pendientes/:id/archivos/:idArchivo/acceso','/api/pendientes/:id/comentarios/:idComentario/adjuntos/:idAdjunto/acceso',
  '/api/pendientes/:id/evidencia-legacy/:tipo/acceso','/api/pendientes/:id/archivos/:idArchivo','/api/pendientes/:id',
  '/api/pendientes/:id/estatus','/api/pendientes/:id/prioridad','/api/pendientes/:id/comentarios','/api/pendientes/:id/subtareas/:idSubtarea',
  '/api/notificaciones','/api/notificaciones/estado','/api/notificaciones/:id/abrir','/api/notificaciones/:id/nuevo',
  '/api/notificaciones/preferencias','/api/interacciones','/api/__lab/home-status'
];
for(const endpoint of endpoints) assert(routes.includes(`'${endpoint}'`),`missing route ${endpoint}`);
assert(tasks.includes('ManttoLabSharedAssetsService'),'Phase 6 must use F5 V002 shared assets service');
assert(!tasks.includes('ManttoLabAssetsService'),'must not reference obsolete Phase 5 service name');
assert(tasks.includes("text(body?.pendiente, 255)"),'task title must be capped at the real 255 contract');
assert(tasks.includes("type === 'COLABORATIVA'"),'task type semantics present');
assert(tasks.includes("Solo un responsable puede definir la prioridad de una tarea colaborativa."),'collaborative priority must be responsible-only');
assert(tasks.includes('PENDIENTE_PROYECTO_FUERA_ALCANCE'),'project selection must fail closed');
assert(tasks.includes('PENDIENTE_EQUIPO_FUERA_ALCANCE'),'equipment selection must fail closed');
assert(tasks.includes('root?.ManttoRichText?.sanitizeHtml'),'must preserve/use current LAB Rich Text sanitization');
assert(tasks.includes('LAB_INDEXEDDB'),'task files must remain local');
assert(Number(/MAX_FILE_BYTES\s*=\s*25\s*\*\s*1024\s*\*\s*1024/.test(blobs))===1,'blob limit must be 25 MB');
assert(notifications.includes("'OBLIGATORIA'"));
assert(notifications.includes("'OPCIONAL'"));
assert(notifications.includes('LEGACY_NO_MATRIX'),'must preserve real legacy notification compatibility');
assert(notifications.includes('ROLE_MATRIX_DENIED'),'notification role matrix must fail closed');
assert(interactions.includes('SOLO_ACCIONES_OPERATIVAS_BACKEND'),'client interaction writes must remain blocked');
console.log('FASE 6 Home contracts: OK');
