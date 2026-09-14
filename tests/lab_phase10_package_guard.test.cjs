#!/usr/bin/env node
'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);return e.isDirectory()?walk(p):[p];});}
const files=walk(ROOT).map(f=>path.relative(ROOT,f).replace(/\\/g,'/'));
assert(!files.some(f=>/\.(patch|diff)$/i.test(f)),'No patch/diff allowed');
assert(!files.some(f=>/^APPLY_FASE.*\.ps1$/i.test(path.basename(f))),'No APPLY scripts allowed');
for(const f of ['core/config.js','lab/index.html','lab/runtime/lab-auth.js','lab/runtime/lab-db.js','lab/backend/services/lab-blob-store.js'])assert(files.includes(f),`full modified file missing: ${f}`);
for(const f of ['lab/backend/services/lab-backup.service.js','lab/backend/services/lab-jobs.service.js','lab/backend/services/lab-diagnostics.service.js','lab/backend/routes/lab-technical.routes.js','lab/runtime/lab-pwa.js','lab/runtime/lab-phase10-bootstrap.js','lab/manifest.webmanifest','lab/sw.js','lab/database/migrations/010_technical_closure.sql'])assert(files.includes(f),`new F10 file missing: ${f}`);
const migration=fs.readFileSync(path.join(ROOT,'lab/database/migrations/010_technical_closure.sql'),'utf8');
assert(!/\b(CREATE|ALTER|DROP)\s+(TABLE|INDEX)\b/i.test(migration),'migration 010 cannot change schema');
assert(/PRAGMA\s+user_version\s*=\s*10/i.test(migration),'migration 010 must set user_version=10');
const config=fs.readFileSync(path.join(ROOT,'core/config.js'),'utf8');
assert(config.indexOf('lab-phase9-bootstrap.js')<config.indexOf('lab-phase10-bootstrap.js'),'F10 must follow F9');
assert(config.indexOf('lab-phase10-bootstrap.js')<config.indexOf('lab-auth.js'),'F10 must load before auth');
const auth=fs.readFileSync(path.join(ROOT,'lab/runtime/lab-auth.js'),'utf8');
assert(auth.includes('ManttoLabPhase10Ready'),'auth must wait F10');
assert(auth.includes('ManttoLabPhase10?.resetDatabase'),'auth reset must prefer F10');
console.log('FASE 10 package guard: OK');
