#!/usr/bin/env node
'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..');
const targets=['lab/backend/services/lab-backup.service.js','lab/backend/services/lab-jobs.service.js','lab/backend/services/lab-diagnostics.service.js','lab/backend/routes/lab-technical.routes.js','lab/runtime/lab-pwa.js','lab/runtime/lab-phase10-bootstrap.js','lab/sw.js','core/config.js'];
const blocked=['azurewebsites.net','aivencloud.com','supabase.co','railway.app','script.google.com','googleapis.com'];
for(const rel of targets){const text=fs.readFileSync(path.join(ROOT,rel),'utf8').toLowerCase();for(const host of blocked)assert(!text.includes(host),`${rel} contains blocked host ${host}`);}
console.log('FASE 10 source isolation guard: OK');
