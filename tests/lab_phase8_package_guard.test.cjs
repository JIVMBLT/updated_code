#!/usr/bin/env node
'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const ROOT=path.resolve(__dirname,'..');
function walk(dir){if(!fs.existsSync(dir))return[];return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const f=path.join(dir,e.name);return e.isDirectory()?walk(f):[f];});}
const files=walk(ROOT).map(f=>path.relative(ROOT,f).replace(/\\/g,'/'));
assert(!files.some(f=>/\.patch$|\.diff$/i.test(f)),'F8 V002 must not ship patch/diff files');
assert(!files.some(f=>/^APPLY_FASE.*\.ps1$/i.test(path.basename(f))),'F8 V002 uses full-file overlay, not apply scripts');
assert(!files.includes('modules/home/home.js'),'F8 must not replace unchanged Home frontend');
assert(!files.includes('styles/home.css'),'F8 must not replace unchanged Home CSS');
assert(!files.includes('core/rich-text.js'),'F8 must not replace unchanged Rich Text helper');
for(const rel of ['core/config.js','lab/index.html','lab/runtime/lab-auth.js','lab/runtime/lab-phase8-bootstrap.js','lab/backend/routes/lab-sales-collections.routes.js','lab/backend/services/lab-sales.service.js','lab/backend/services/lab-collections-uni.service.js','lab/backend/services/lab-collections-cor.service.js','lab/database/migrations/008_sales_collections.sql'])assert(files.includes(rel),'missing complete F8 file '+rel);
const migration=fs.readFileSync(path.join(ROOT,'lab/database/migrations/008_sales_collections.sql'),'utf8');
assert(/PRAGMA user_version\s*=\s*8/i.test(migration));
assert(!/CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE/i.test(migration),'F8 must reuse existing tables');
const auth=fs.readFileSync(path.join(ROOT,'lab/runtime/lab-auth.js'),'utf8');
assert(auth.includes('ManttoLabPhase8Ready'),'auth must await Phase 8');
assert(auth.includes('ManttoLabPhase8?.resetDatabase'),'Reset LAB must prefer Phase 8');
console.log('FASE 8 package guard: OK');
