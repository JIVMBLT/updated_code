'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const bannedExtensions=new Set(['.patch','.diff']);
const bannedNames=/^(APPLY_|APLICAR_)/i;
const files=[];
function walk(dir){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())walk(full); else files.push(path.relative(root,full).replaceAll('\\','/'));
  }
}
walk(root);
for(const file of files){
  assert.equal(bannedExtensions.has(path.extname(file).toLowerCase()),false,`Archivo prohibido: ${file}`);
  assert.equal(bannedNames.test(path.basename(file)),false,`Aplicador prohibido: ${file}`);
}
assert(files.includes('README.md'));
assert(files.includes('core/config.js'));
assert(files.includes('core/push-notifications.js'));
assert(files.includes('core/data-sync.js'));
assert(files.includes('manifest.json'));
console.log('FASE 11 package guard: OK');
