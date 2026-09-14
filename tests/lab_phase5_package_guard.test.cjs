#!/usr/bin/env node
'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const ROOT=path.resolve(__dirname,'..');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{const full=path.join(dir,entry.name);return entry.isDirectory()?walk(full):[full];});}
const files=walk(ROOT).map(file=>path.relative(ROOT,file).replace(/\\/g,'/'));
assert(!files.some(file=>/\.patch$|\.diff$/i.test(file)),'no patch/diff');
assert(!files.some(file=>/^APPLY_FASE.*\.ps1$/i.test(path.basename(file))),'no apply script');
const config=fs.readFileSync(path.join(ROOT,'core/config.js'),'utf8');
const index=fs.readFileSync(path.join(ROOT,'lab/index.html'),'utf8');
const route=fs.readFileSync(path.join(ROOT,'lab/backend/routes/lab-shared.routes.js'),'utf8');
const migration=fs.readFileSync(path.join(ROOT,'lab/database/migrations/005_shared_services.sql'),'utf8');
const phase5=config.indexOf('./lab/runtime/lab-phase5-bootstrap.js');
const auth=config.indexOf('./lab/runtime/lab-auth.js');
assert(phase5>=0&&auth>phase5,'Phase 5 must register before lab-auth');
assert(index.indexOf('./runtime/lab-phase5-bootstrap.js')<index.indexOf('./runtime/lab-auth.js'),'diagnostic load order');
assert(route.includes("'/api/catalogos/roles'"));
assert(route.includes("'/api/usuarios'"));
assert(route.includes("'/api/proyectos'"));
assert(route.includes("'/api/portafolio'"));
assert(route.includes("'/api/equipos'"));
assert(route.includes('LAB_LEGACY_PERMISOS_TABLE_UNAVAILABLE')===false,'legacy error code belongs in catalog service, not duplicated route logic');
assert(/PRAGMA user_version\s*=\s*5/i.test(migration));
assert(!/CREATE\s+TABLE/i.test(migration),'Phase 5 must reuse existing tables');
const phase5Executable=[
  'core/config.js',
  'lab/index.html',
  'lab/backend/services/lab-catalogs.service.js',
  'lab/backend/services/lab-users.service.js',
  'lab/backend/services/lab-relations.service.js',
  'lab/backend/services/lab-shared-assets.service.js',
  'lab/backend/routes/lab-shared.routes.js',
  'lab/runtime/lab-phase5-bootstrap.js',
  'lab/database/migrations/005_shared_services.sql'
];
for(const file of phase5Executable){
  const text=fs.readFileSync(path.join(ROOT,file),'utf8');
  assert(!/azurewebsites\.net|aivencloud\.com|supabase\.co/i.test(text),`production host in ${file}`);
}

console.log('FASE5_V002_PACKAGE_GUARD_OK');
