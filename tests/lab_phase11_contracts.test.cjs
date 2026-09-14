'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');

function load(rel,extra={}){
  const source=fs.readFileSync(path.join(root,rel),'utf8');
  const listeners={};
  const document={
    readyState:'complete', hidden:false,
    addEventListener:(name,fn)=>{listeners[name]=fn;},
    querySelectorAll:()=>[],
    dispatchEvent:()=>true
  };
  const sandbox={
    console,
    document,
    CustomEvent:function(name,init){this.type=name;this.detail=init?.detail;},
    setTimeout:fn=>{fn();return 1;},
    clearTimeout:()=>{},
    Map,Set,Promise,Object,Array,String,Number,Boolean,Date,
    ...extra
  };
  sandbox.window=sandbox;
  sandbox.globalThis=sandbox;
  vm.runInNewContext(source,sandbox,{filename:rel});
  return sandbox;
}

const push=load('core/push-notifications.js');
assert.equal(push.ManttoPushNotifications.supported(),false);
push.ManttoPushNotifications.getStatus().reason.includes('Laboratorio DGB');

const sync=load('core/data-sync.js',{ManttoAuth:{getUser:()=>({rol:'Programador'})}});
assert.equal(typeof sync.ManttoDataSync.register,'function');
assert.equal(typeof sync.ManttoDataSync.refresh,'function');
assert.equal(typeof sync.ManttoDataSync.notifyMutation,'function');
assert.equal(sync.ManttoDataSync.isProgrammer(),true);
sync.ManttoDataSync.markDirty('home');
assert.equal(sync.ManttoDataSync.isDirty('home'),true);
sync.ManttoDataSync.markSynced('home');
assert.equal(sync.ManttoDataSync.isDirty('home'),false);

console.log('FASE 11 contracts: OK');
