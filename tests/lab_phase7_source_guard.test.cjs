#!/usr/bin/env node
'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const ROOT=path.resolve(__dirname,'..');
function walk(dir){if(!fs.existsSync(dir))return[];return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{const full=path.join(dir,entry.name);return entry.isDirectory()?walk(full):[full];});}
const targets=[path.join(ROOT,'core'),path.join(ROOT,'lab','backend'),path.join(ROOT,'lab','runtime')];
const sourceFiles=targets.flatMap(walk).filter(file=>/\.(js|cjs)$/i.test(file)).concat([path.join(ROOT,'lab','index.html'),path.join(ROOT,'lab','database','migrations','007_operation_portfolio.sql')]).filter(fs.existsSync);
const blocked=['azurewebsites.net','aivencloud.com','supabase.co','railway.app','script.google.com'];
for(const file of sourceFiles){const text=fs.readFileSync(file,'utf8').toLowerCase();for(const host of blocked)assert(!text.includes(host),`${path.relative(ROOT,file)} contains blocked production host ${host}`);}
console.log('FASE 7 source isolation guard: OK');
