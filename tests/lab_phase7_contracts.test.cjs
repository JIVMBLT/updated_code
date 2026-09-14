#!/usr/bin/env node
'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const routes=read('lab/backend/routes/lab-operation.routes.js');
const op=read('lab/backend/services/lab-operation.service.js');
const pf=read('lab/backend/services/lab-portfolio.service.js');
const mov=read('lab/backend/services/lab-movements.service.js');
const shared=read('lab/backend/routes/lab-shared.routes.js');
const required=[
  '/api/operacion/resumen-dia/inicial',
  '/api/operacion/dashboard-call-center/inicial',
  '/api/operacion/dashboard-operativo/inicial',
  '/api/servicios-preventivos/resumen-supervisor',
  '/api/equipos-criticos',
  '/api/proyectos-criticos',
  '/api/indicadores/mtbc/equipos',
  '/api/indicadores/mtbc/proyectos',
  '/api/callcenter/u365/equipos',
  '/api/callcenter/u365/proyectos',
  '/api/criticidad-corporativa',
  '/api/portafolio/dashboard/inicial',
  '/api/portafolio/dashboard/equipos',
  '/api/portafolio/movimientos/inicial',
  '/api/portafolio/movimientos-semanales/catalogo',
  '/api/portafolio/seguimiento-especial',
  '/api/tickets/:ticket/comentarios',
  '/api/tickets/:ticket/validacion',
  '/api/tickets/:ticket/vobo'
];
for(const route of required)assert(routes.includes(route),'missing route '+route);
assert(routes.includes('LAB_MOCK_NOT_IMPLEMENTED'),'productive ticket sync must be explicitly disabled');
assert(![routes,op,pf,mov,shared].join('\n').includes('ManttoLabAssetsService'),'obsolete V001 asset service must not return');
assert(pf.includes("upper(row.estatus_cobranza)==='EN COBRANZA'"),'commercial En Cobranza must use estatus_cobranza');
assert(pf.includes("upper(row.estatus_cobranza)==='GRATUITO'"),'commercial Gratuito/Garantia must use estatus_cobranza Gratuito');
assert(pf.includes("includes('NO EN SERVICIO')"),'No en Servicio must have commercial priority');
assert(mov.includes("status==='EN SERVICIO'||status==='SERVICIO'"),'movement service must use current real in-service semantics');
assert(mov.includes('zona_id_oficial'),'weekly movement rows must expose canonical zone id');
assert(mov.includes('historicalId')&&mov.includes('return null'),'historical/current zone mismatch must fail closed');
assert(shared.includes('ManttoLabPortfolioService'),'shared F5 routes must delegate detail/filter contracts to F7 when loaded');
console.log('FASE 7 contract guard: OK');
