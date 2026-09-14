(function initManttoLabJobsService(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.ManttoLabJobsService=api;})(typeof globalThis!=='undefined'?globalThis:this,function createManttoLabJobsService(root){
'use strict';
const TIMER_MS=30000;
let timer=null;const history=[];
function dbOr(candidate){const db=candidate||root?.ManttoLabDB;if(!db||typeof db.query!=='function')throw new Error('MANTTO_LAB_DB_REQUIRED');return db;}
function push(entry){history.unshift(entry);if(history.length>50)history.length=50;return entry;}
function currentUser(){return root?.ManttoLabAuth?.getUser?.()||root?.ManttoLabAuth?.getActorUser?.()||null;}
async function notificationRefresh(options){const db=dbOr(options?.db),user=options?.user||currentUser();if(!user?.id_SB)return{skipped:true,reason:'NO_ACTIVE_IDENTITY'};const service=root?.ManttoLabNotificationsService;if(!service?.status)return{skipped:true,reason:'NOTIFICATION_SERVICE_UNAVAILABLE'};const data=service.status({contextUser:user,user,query:{}},db);if(root?.document&&typeof root.CustomEvent==='function')root.document.dispatchEvent(new root.CustomEvent('mantto:lab-notification-refresh',{detail:{userId:Number(user.id_SB),...data}}));return{userId:Number(user.id_SB),...data};}
async function integrityCheck(options){const db=dbOr(options?.db),violations=db.query('PRAGMA foreign_key_check');return{userVersion:Number(db.scalar('PRAGMA user_version')||0),tables:Number(db.scalar("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")||0),foreignKeyViolations:violations.length,ok:violations.length===0};}
async function persistDatabase(options){const db=dbOr(options?.db);const saved=await db.persist('phase10-job-persist');return{savedAt:saved.savedAt,userVersion:Number(saved.sqliteUserVersion||0)};}
async function storageSummary(options){const db=dbOr(options?.db),blobStore=options?.blobStore||root?.ManttoLabBlobStore;const blobs=blobStore?.list?await blobStore.list():[];const bytes=db.exportBytes();return{databaseBytes:Number(bytes.byteLength||0),blobCount:blobs.length,blobBytes:blobs.reduce((sum,row)=>sum+Number(row.size||0),0)};}
const definitions=Object.freeze({
 'notifications-refresh':{description:'Actualiza el contador local de notificaciones del usuario activo.',automatic:true,intervalMs:TIMER_MS,run:notificationRefresh},
 'integrity-check':{description:'Ejecuta PRAGMA foreign_key_check y verifica la estructura local.',automatic:false,run:integrityCheck},
 'persist-database':{description:'Persiste explícitamente SQLite en IndexedDB.',automatic:false,run:persistDatabase},
 'storage-summary':{description:'Resume bytes de SQLite y Blob Store local.',automatic:false,run:storageSummary}
});
function list(){return Object.entries(definitions).map(([name,job])=>({name,description:job.description,automatic:Boolean(job.automatic),intervalMs:job.intervalMs||null,lastRun:history.find(row=>row.name===name)||null}));}
async function run(name,options){const key=String(name||'').trim(),job=definitions[key];if(!job)throw Object.assign(new Error(`Job LAB desconocido: ${key}`),{status:404,code:'LAB_JOB_NOT_FOUND'});const startedAt=new Date().toISOString(),start=Date.now();try{const result=await job.run(options||{});return push({name:key,ok:true,startedAt,finishedAt:new Date().toISOString(),durationMs:Date.now()-start,result});}catch(error){push({name:key,ok:false,startedAt,finishedAt:new Date().toISOString(),durationMs:Date.now()-start,error:error?.message||String(error)});throw error;}}
function start(){if(timer||typeof root?.setInterval!=='function')return{started:Boolean(timer),intervalMs:TIMER_MS};timer=root.setInterval(()=>{run('notifications-refresh').catch(()=>{});},TIMER_MS);if(typeof timer?.unref==='function')timer.unref();return{started:true,intervalMs:TIMER_MS};}
function stop(){if(timer&&typeof root?.clearInterval==='function')root.clearInterval(timer);timer=null;return{started:false,intervalMs:TIMER_MS};}
function status(){return{started:Boolean(timer),intervalMs:TIMER_MS,jobs:list(),history:history.slice(0,20)};}
return Object.freeze({TIMER_MS,list,run,start,stop,status});
});
