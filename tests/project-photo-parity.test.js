'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function occurrences(text, token) {
  return text.split(token).length - 1;
}

test('COR y UNI comparten la misma politica de administracion fotografica', () => {
  const frontend = read('core/details.js');
  const middleware = read('backend/src/middleware/project-photo.middleware.js');

  for (const token of ['programador', 'director general', 'gestor de fotografias', 'gestor_fotografias']) {
    assert.ok(frontend.toLowerCase().includes(token), `Frontend sin rol esperado: ${token}`);
  }

  for (const token of ['PROGRAMADOR', 'DIRECTOR GENERAL', 'GESTOR DE FOTOGRAFIAS', 'GESTOR_FOTOGRAFIAS']) {
    assert.ok(middleware.includes(token), `Backend sin rol esperado: ${token}`);
  }

  assert.ok(!frontend.includes('id_rol = 63'));
  assert.ok(!middleware.includes('id_rol = 63'));
});

test('el frontend conserva un solo motor de carrete para CORELLIAN y UNITED', () => {
  const frontend = read('core/details.js');

  assert.ok(frontend.includes("const PROJECT_PHOTO_DOMAIN_COR = 'CORELLIAN';"));
  assert.ok(frontend.includes("const PROJECT_PHOTO_DOMAIN_UNI = 'UNITED';"));
  assert.ok(frontend.includes('function openProjectPhotoLightbox('));
  assert.ok(frontend.includes('function renderProjectPhotoLightbox('));
  assert.ok(frontend.includes('function bindProjectPhotoCover('));
  assert.ok(occurrences(frontend, 'bindProjectPhotoCover(detailRoot') >= 2, 'COR y UNI deben enlazar la misma portada');
});

test('las mutaciones resuelven endpoints separados sin cruzar dominios', () => {
  const frontend = read('core/details.js');

  assert.ok(frontend.includes("upload:'/api/ins-fl/proyectos/fotografias/'+id"));
  assert.ok(frontend.includes("principal:'/api/ins-fl/proyectos/fotografias/'+id+'/principal'"));
  assert.ok(frontend.includes("upload:'/api/portafolio/proyectos/'+id+'/fotografias'"));
  assert.ok(frontend.includes("principal:'/api/portafolio/proyectos/'+id+'/fotografias/principal'"));
});

test('Corellian y United usan el mismo guard backend para subir y elegir principal', () => {
  const corRoutes = read('backend/src/routes/ins-fl.routes.js');
  const uniRoutes = read('backend/src/modules/portafolio/portafolio.routes.js');

  assert.ok(occurrences(corRoutes, 'requireProjectPhotoManager_gnral') >= 3, 'Corellian debe importar y usar el guard en POST/PATCH');
  assert.ok(occurrences(uniRoutes, 'requireProjectPhotoManager_gnral') >= 3, 'United debe importar y usar el guard en POST/PATCH');
  assert.ok(corRoutes.includes("router.post(\n  '/proyectos/fotografias/:id_ppns'"));
  assert.ok(corRoutes.includes("router.patch(\n  '/proyectos/fotografias/:id_ppns/principal'"));
  assert.ok(uniRoutes.includes("'/portafolio/proyectos/:proyecto/fotografias'"));
  assert.ok(uniRoutes.includes("'/portafolio/proyectos/:proyecto/fotografias/principal'"));
});

test('United conserva maximo 7 y primera fotografia principal automatica', () => {
  const uniPhotos = read('backend/src/modules/portafolio/portafolio-proyecto-fotos_uni.js');

  for (let i = 1; i <= 7; i += 1) {
    assert.ok(uniPhotos.includes(`'foto_${i}'`), `Falta foto_${i}`);
  }
  assert.ok(uniPhotos.includes('MAX_PROJECT_PHOTOS_UNI = PROJECT_PHOTO_FIELDS_UNI.length'));
  assert.ok(uniPhotos.includes('const principal = firstPhoto'));
  assert.ok(uniPhotos.includes("empresa: 'UNITED'"));
});

test('la Fase 3 no incorpora eliminacion de fotografias', () => {
  const frontend = read('core/details.js');
  const corRoutes = read('backend/src/routes/ins-fl.routes.js');
  const uniRoutes = read('backend/src/modules/portafolio/portafolio.routes.js');

  assert.ok(!frontend.includes('deleteProjectPhoto'));
  assert.ok(!corRoutes.includes("router.delete('/proyectos/fotografias"));
  assert.ok(!uniRoutes.includes("router.delete('/portafolio/proyectos"));
});
