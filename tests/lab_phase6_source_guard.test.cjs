#!/usr/bin/env node
'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const ROOT=path.resolve(__dirname,'..');
const runtimeFiles=[
  'core/config.js','lab/runtime/lab-auth.js','lab/runtime/lab-phase6-bootstrap.js','lab/backend/routes/lab-home.routes.js',
  'lab/backend/services/lab-blob-store.js','lab/backend/services/lab-interactions.service.js','lab/backend/services/lab-notifications.service.js',
  'lab/backend/services/lab-tasks.service.js','lab/backend/services/lab-home.service.js'
];
const forbidden=['azurewebsites.net','aivencloud.com','supabase.co','railway.app','script.google.com'];
for(const file of runtimeFiles){
  const source=fs.readFileSync(path.join(ROOT,file),'utf8').toLowerCase();
  for(const needle of forbidden) assert(!source.includes(needle),`${file} contains forbidden host ${needle}`);
}
console.log('FASE 6 source isolation guard: OK');
