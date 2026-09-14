#!/usr/bin/env node
'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const ROOT=path.resolve(__dirname,'..');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{const full=path.join(dir,entry.name);return entry.isDirectory()?walk(full):[full];});}
const files=walk(ROOT).map(file=>path.relative(ROOT,file).replace(/\\/g,'/'));
assert(!files.some(file=>/\.patch$|\.diff$/i.test(file)),'Phase 6 V002 must not ship patch/diff files');
assert(!files.some(file=>/^APPLY_FASE.*\.ps1$/i.test(path.basename(file))),'Phase 6 V002 uses overlay copy, not apply scripts');
assert(!files.includes('modules/home/home.js'),'must preserve current LAB Home frontend');
assert(!files.includes('styles/home.css'),'must preserve current LAB Home styles');
assert(!files.includes('core/rich-text.js'),'must preserve current LAB Rich Text helper');

const config=fs.readFileSync(path.join(ROOT,'core/config.js'),'utf8');
const auth=fs.readFileSync(path.join(ROOT,'lab/runtime/lab-auth.js'),'utf8');
const index=fs.readFileSync(path.join(ROOT,'lab/index.html'),'utf8');
const migration=fs.readFileSync(path.join(ROOT,'lab/database/migrations/006_home_services.sql'),'utf8');
const phase6=config.indexOf('./lab/runtime/lab-phase6-bootstrap.js');
const authIndex=config.indexOf('./lab/runtime/lab-auth.js');
assert(phase6>=0&&authIndex>phase6,'Phase 6 must register before lab-auth');
assert(config.includes('ManttoLabPhase6Ready'),'core ready must await Phase 6');
assert(index.indexOf('./runtime/lab-phase6-bootstrap.js')<index.indexOf('./runtime/lab-auth.js'),'diagnostic must register Phase 6 before auth');
assert(index.indexOf('../core/rich-text.js')<index.indexOf('./backend/services/lab-tasks.service.js'),'diagnostic must load existing Rich Text helper before task service');
assert(auth.includes("mantto_lab_identity_id_v2"),'must preserve V2 LAB identity storage');
assert(auth.includes('clearProductionAuthState'),'must preserve production auth cleanup');
assert(auth.includes('ManttoLabPhase6Ready'),'auth must wait Phase 6 readiness');
assert(/PRAGMA user_version\s*=\s*6/i.test(migration),'migration must set user_version 6');
assert(!/CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE/i.test(migration),'Phase 6 must reuse existing tables');
console.log('FASE 6 package guard: OK');
