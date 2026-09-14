#!/usr/bin/env node
'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const routes=read('lab/backend/routes/lab-sales-collections.routes.js');
const sales=read('lab/backend/services/lab-sales.service.js');
const uni=read('lab/backend/services/lab-collections-uni.service.js');
const cor=read('lab/backend/services/lab-collections-cor.service.js');
const config=read('core/config.js');
const required=[
 '/api/ventas/dashboard/usuarios','/api/ventas/dashboard/kpis','/api/ventas/dashboard/tablas','/api/ventas/dashboard/operacion','/api/ventas/dashboard/pdf/capabilities','/api/ventas/dashboard/pdf/prepare','/api/ventas/dashboard/pdf/data',
 '/api/ventas/clientes/catalogos','/api/ventas/clientes/asesores-asignables','/api/ventas/clientes/kpis','/api/ventas/clientes','/api/ventas/clientes/:id',
 '/api/ventas/cotizaciones/catalogos','/api/ventas/cotizaciones/kpis','/api/ventas/cotizaciones/embudo','/api/ventas/cotizaciones/vendidos','/api/ventas/cotizaciones/perdidos','/api/ventas/cotizaciones/proyeccion','/api/ventas/cotizaciones/proyectos-interes','/api/ventas/cotizaciones/:id/interes','/api/ventas/cotizaciones/:id/estatus','/api/ventas/cotizaciones/:id/asignacion','/api/ventas/cotizaciones/:id/editar-bootstrap',
 '/api/ventas/prospeccion/catalogos-captura','/api/ventas/prospeccion/fuentes','/api/ventas/prospeccion/contactos','/api/ventas/prospeccion/catalogos','/api/ventas/prospeccion/kpis','/api/ventas/prospeccion/mapa','/api/ventas/prospeccion/:id/estatus','/api/ventas/prospeccion/:id/cotizacion',
 '/api/ventas/redes/catalogos','/api/ventas/redes/usuarios-asignables','/api/ventas/redes/cotizaciones-activas','/api/ventas/redes/:id/asignacion','/api/ventas/redes/:id/cotizacion',
 '/api/cobranza-uni/gestion-credito','/api/cobranza-uni/venta-adicional','/api/cobranza-uni/detalle-mp-2026',
 '/api/cobranza-cor/estados-cuenta','/api/cobranza-cor/aditivas','/api/cobranza-cor/adeudos-contractuales'
];
for(const route of required)assert(routes.includes(route),'missing route '+route);
for(const route of ['/api/ventas/cotizaciones/sync','/api/ventas/cotizaciones/comentarios/sync','/api/ventas/clientes/sync','/api/ventas/prospeccion/sync','/api/ventas/prospeccion/comentarios/sync','/api/ventas/redes/importar-backup','/api/ventas/redes/comentarios/importar-backup','/api/cobranza-uni/sync','/api/cobranza-cor/carga/indice','/api/cobranza-cor/carga/fuente','/api/cobranza-cor/carga/aditivas'])assert(routes.includes(route),'missing blocked integration route '+route);
assert(routes.includes('LAB_MOCK_NOT_IMPLEMENTED'),'integration routes must fail locally');
assert(routes.includes('VENTAS_MAPA_PROSPECCION_MAPA_VISITAS_MARCADORES.VER'),'must use current Map Prospection permission');
assert(routes.includes('VENTAS_COTIZACIONES_TABLA_COTIZACIONES_DETALLE_COTIZACION.CAMBIAR_ESTADO'),'must use current quote status permission');
assert(routes.includes("catalogos:services().sales.prospectCaptureCatalogs"),'prospection capture catalogs must expose production catalogos contract');
assert(routes.includes("resultados:services().sales.prospectSources"),'prospection source search must expose resultados contract');
assert(routes.includes("contactos:services().sales.prospectContacts"),'prospection contacts must expose contactos contract');
assert(routes.includes("puntos:services().sales.prospectMap"),'prospection map must expose puntos contract');
assert(routes.includes("catalogos:services().sales.networkCatalogs"),'redes catalogs must expose catalogos contract');
assert(routes.includes("usuarios:rows"),'redes assignable users must expose usuarios contract');
assert(routes.includes("cotizaciones:rows"),'redes active quotations must expose cotizaciones contract');
assert(routes.includes("registro:row"),'redes detail/create must expose registro contract');
assert(sales.includes("id_usuario_asignado IN"),'redes scope must use assigned-user evidence');
assert(sales.includes("id_asesor IN")&&sales.includes("id_admin IN"),'quotation scope must use asesor/admin evidence');
for(const status of ['Contacto','En Cotizacion','Sin Respuesta','Seguimiento con Probabilidad','En Espera de Definicion','Pre Asignado','Asignado','En Contrato','Vendido','Perdido','Siguiente Año','Borrar'])assert(sales.includes(`'${status}'`),'missing canonical quote status '+status);
assert(sales.includes("'Elevador','Montacargas','Escalera','Rampa','Plataformas/Otros'"),'equipment catalog must remain canonical');
assert(uni.includes('zona_id'),'UNITED collections must retain canonical zone evidence');
assert(cor.includes('cobranza_indice_cor'),'CORELLIAN collections must use existing schema');
const p8=config.indexOf('./lab/runtime/lab-phase8-bootstrap.js');
const auth=config.indexOf('./lab/runtime/lab-auth.js');
assert(p8>=0&&auth>p8,'Phase 8 bootstrap must load before LAB auth');
console.log('FASE 8 contract guard: OK');
