'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const runtimeFiles=['core/config.js','core/push-notifications.js','core/data-sync.js'];
const forbidden=[/azurewebsites\.net/i,/aivencloud\.com/i,/supabase\.co/i,/script\.google\.com/i,/netlify\.app/i];

for(const file of runtimeFiles){
  const source=read(file);
  for(const pattern of forbidden) assert.equal(pattern.test(source),false,`${file} contiene host productivo: ${pattern}`);
}

const push=read('core/push-notifications.js');
assert.equal(/serviceWorker\.register/i.test(push),false,'Push LAB no debe registrar Service Worker productivo');
assert.equal(/\bfetch\s*\(/.test(push),false,'Push LAB no debe ejecutar fetch');
assert.match(push,/lab-disabled/);

const config=read('core/config.js');
assert.match(config,/MANTTO_LAB_MODE=true/);
assert.match(config,/MANTTO_LAB_PRODUCTION_CONNECTIONS_ALLOWED=false/);
assert.match(config,/20260914-fase11-lab-dgb-v001/);
assert.match(config,/LABORATORIO DGB · DATOS FICTICIOS/);

const manifest=JSON.parse(read('manifest.json'));
assert.equal(manifest.start_url,'./');
assert.equal(manifest.scope,'./');
for(const icon of manifest.icons||[]) assert.match(icon.src,/^\.\//);
console.log('FASE 11 source guard: OK');
