#!/usr/bin/env node
'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const ROOT=path.resolve(__dirname,'..');
const files=[
 'core/config.js','lab/index.html','lab/runtime/lab-auth.js','lab/runtime/lab-phase8-bootstrap.js',
 'lab/backend/routes/lab-sales-collections.routes.js','lab/backend/services/lab-sales.service.js',
 'lab/backend/services/lab-collections-uni.service.js','lab/backend/services/lab-collections-cor.service.js'
];
const blocked=['azurewebsites.net','aivencloud.com','supabase.co','railway.app','script.google.com','http://localhost:3001','https://localhost:3001'];
for(const rel of files){const text=fs.readFileSync(path.join(ROOT,rel),'utf8').toLowerCase();for(const value of blocked)assert(!text.includes(value),`${rel} contains blocked production/network target ${value}`);}
const routes=fs.readFileSync(path.join(ROOT,'lab/backend/routes/lab-sales-collections.routes.js'),'utf8');
assert(routes.includes('LAB_MOCK_NOT_IMPLEMENTED'));
console.log('FASE 8 source isolation guard: OK');
