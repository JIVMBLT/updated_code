#!/usr/bin/env node
'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const ROOT=path.resolve(__dirname,'..');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{const full=path.join(dir,entry.name);return entry.isDirectory()?walk(full):[full];});}
const files=walk(ROOT).map(file=>path.relative(ROOT,file).replace(/\\/g,'/'));
assert(!files.some(file=>/\.patch$|\.diff$/i.test(file)),'Phase 7 V002 must not ship patch/diff files');
assert(!files.some(file=>/^APPLY_FASE.*\.ps1$/i.test(path.basename(file))),'Phase 7 V002 uses full-file overlay, not apply scripts');
assert(!files.includes('modules/home/home.js'),'must preserve current LAB Home frontend');
assert(!files.includes('styles/home.css'),'must preserve current LAB Home styles');
assert(!files.includes('core/rich-text.js'),'must preserve current LAB Rich Text helper');

const config=fs.readFileSync(path.join(ROOT,'core/config.js'),'utf8');
const auth=fs.readFileSync(path.join(ROOT,'lab/runtime/lab-auth.js'),'utf8');
const index=fs.readFileSync(path.join(ROOT,'lab/index.html'),'utf8');
const migration=fs.readFileSync(path.join(ROOT,'lab/database/migrations/007_operation_portfolio.sql'),'utf8');
const p7=config.indexOf('./lab/runtime/lab-phase7-bootstrap.js');
const authIndex=config.indexOf('./lab/runtime/lab-auth.js');
assert(p7>=0&&authIndex>p7,'Phase 7 must register before lab-auth in root config');
assert(config.includes('./lab/runtime/lab-phase6-bootstrap.js'),'root config must retain Phase 6');
assert(config.includes('ManttoLabPhase7Ready'),'core ready must await Phase 7');
assert(index.indexOf('./runtime/lab-phase7-bootstrap.js')<index.indexOf('./runtime/lab-auth.js'),'diagnostic must register Phase 7 before auth');
assert(auth.includes('ManttoLabPhase7Ready'),'auth must wait Phase 7 readiness');
assert(auth.includes('ManttoLabPhase7?.resetDatabase'),'Reset LAB must prefer Phase 7');
assert(/PRAGMA user_version\s*=\s*7/i.test(migration),'migration must set user_version 7');
assert(!/CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE/i.test(migration),'Phase 7 must reuse existing tables');
console.log('FASE 7 package guard: OK');
