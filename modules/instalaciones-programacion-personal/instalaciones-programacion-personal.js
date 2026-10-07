// [Claude | 2026-10-07 | CLAUDE-MG | LAB DGB - INSTALACIONES PROGRAMACION PERSONAL V001]
// Instalaciones > Programación de Personal (Montadores y Ajustadores).
// Pestañas: Calendario, Personal, Historial, Disponibilidad y simulación.
// Los días de trabajo salen del reporte de Instalaciones (inicio/fin de montaje o de ajuste);
// aquí solo se asigna personal a equipos. Todo pasa por /api/instalaciones/programacion/*.
(function(){
  const BASE='/api/instalaciones/programacion';
  const TIPOS={MONTADOR:{plural:'Montadores',singular:'Montador',fase:'montaje'},AJUSTADOR:{plural:'Ajustadores',singular:'Ajustador',fase:'ajuste'}};
  const MESES=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const COLORES=['#1B4FD8','#0F766E','#B45309','#7C3AED','#BE123C','#0369A1','#4D7C0F','#C2410C','#6D28D9','#047857'];

  const state={
    inicializado:false,tipo:'MONTADOR',tab:'calendario',opciones:null,
    cal:{desde:null,span:31,q:'',personal:[],asignaciones:[],sin_fechas:[],hoy:null,cubrir:[]},
    personal:[],personalQ:'',hist:{id_personal:'',desde:'',hasta:'',q:'',res:null},
    disp:{desde:'',hasta:'',gran:'semana',res:null},sim:{res:null},
    equipos:[],modal:null
  };

  const $=id=>document.getElementById(id);
  const root=()=>$('view-instalaciones-programacion-personal');
  function esc(v){return String(v==null||v===''?'—':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function escR(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  const T=()=>TIPOS[state.tipo];

  // ---------------------------------------------------------------- fechas (UTC, sin zona horaria)
  const pad=n=>String(n).padStart(2,'0');
  const dn=iso=>{const[y,m,d]=iso.split('-').map(Number);return Math.floor(Date.UTC(y,m-1,d)/86400000);};
  const fromDn=n=>{const t=new Date(n*86400000);return t.getUTCFullYear()+'-'+pad(t.getUTCMonth()+1)+'-'+pad(t.getUTCDate());};
  const addDays=(iso,n)=>fromDn(dn(iso)+n);
  const dow=iso=>(dn(iso)+4)%7; // 0=domingo
  function hoyLocal(){const d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
  function fmt(iso){if(!iso)return '—';const[y,m,d]=iso.split('-');return Number(d)+' '+MESES[Number(m)-1]+' '+y;}
  function lunes(iso){const w=dow(iso);return addDays(iso,-((w+6)%7));}

  // ---------------------------------------------------------------- API
  async function api(path,opts){
    const o=Object.assign({method:'GET'},opts||{});
    if(window.ManttoAuth&&typeof window.ManttoAuth.api==='function')return window.ManttoAuth.api(path,o);
    const base=(window.MANTTO_API_BASE||'http://localhost:3001').replace(/\/$/,'');
    const headers=Object.assign({Accept:'application/json','Content-Type':'application/json'},o.headers||{});
    if(window.ManttoAuth&&typeof window.ManttoAuth.authHeaders==='function')Object.assign(headers,window.ManttoAuth.authHeaders());
    const r=await fetch(base+path,Object.assign({},o,{headers}));
    const data=await r.json().catch(()=>({ok:false,message:'Respuesta inválida del backend'}));
    if(!r.ok||!data.ok)throw new Error(data.message||'Error consultando backend');
    return data;
  }
  const qs=obj=>Object.entries(obj).filter(([,v])=>v!==''&&v!=null).map(([k,v])=>encodeURIComponent(k)+'='+encodeURIComponent(v)).join('&');
  const get=(p,q)=>api(BASE+p+(q?'?'+qs(q):'')).then(r=>r.data);
  const send=(method,p,body)=>api(BASE+p,{method,body:body?JSON.stringify(body):undefined}).then(r=>r.data);

  // ---------------------------------------------------------------- esqueleto
  function esqueleto(){
    root().innerHTML=
      '<div class="pp-page">'+
        '<section class="pp-card pp-head"><div><h1>Programación de Personal</h1><p>Asigna montadores y ajustadores a los equipos de Instalación. Los días salen de las fechas del reporte de Instalaciones.</p></div>'+
        '<div class="pp-seg" id="pp-tipo"></div></section>'+
        '<nav class="pp-tabs" id="pp-tabs"></nav>'+
        '<div id="pp-body"><div class="pp-status">Cargando…</div></div>'+
        '<div class="pp-overlay" id="pp-overlay" hidden><div class="pp-modal" role="dialog" aria-modal="true"><div class="pp-modal-head"><h2 id="pp-modal-titulo"></h2><button type="button" class="pp-x" data-act="cerrar-modal" aria-label="Cerrar">✕</button></div><div class="pp-modal-body" id="pp-modal-body"></div></div></div>'+
      '</div>';
    root().addEventListener('click',onClick);
    root().addEventListener('change',onChange);
    root().addEventListener('submit',onSubmit);
    root().addEventListener('input',onInput);
    document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&state.modal)cerrarModal();});
  }
  function pintarCabecera(){
    $('pp-tipo').innerHTML=Object.entries(TIPOS).map(([k,v])=>'<button type="button" class="pp-seg-btn'+(state.tipo===k?' on':'')+'" data-act="tipo" data-v="'+k+'">'+v.plural+'</button>').join('');
    const tabs=[['calendario','Calendario'],['personal','Personal'],['historial','Historial'],['disponibilidad','Disponibilidad y simulación']];
    $('pp-tabs').innerHTML=tabs.map(([k,l])=>'<button type="button" class="pp-tab'+(state.tab===k?' on':'')+'" data-act="tab" data-v="'+k+'">'+l+'</button>').join('');
  }
  function status(msg,err){$('pp-body').innerHTML='<div class="pp-status'+(err?' pp-err':'')+'">'+esc(msg)+'</div>';}

  // ---------------------------------------------------------------- carga por pestaña
  async function cargarTab(){
    pintarCabecera();
    try{
      if(state.tab==='calendario')await cargarCalendario();
      else if(state.tab==='personal')await cargarPersonal();
      else if(state.tab==='historial')await cargarHistorial();
      else await cargarDisponibilidad();
    }catch(e){status('Error: '+e.message,true);console.error('[Programación de Personal]',e);}
  }

  // ---------------------------------------------------------------- CALENDARIO
  async function cargarCalendario(){
    const c=state.cal;
    if(!c.desde)c.desde=lunes(hoyLocal());
    const hasta=addDays(c.desde,c.span-1);
    const [cal,cub]=await Promise.all([
      get('/calendario',{tipo:state.tipo,desde:c.desde,hasta,q:c.q}),
      get('/equipos',{tipo:state.tipo,desde:c.desde,hasta,solo_sin_personal:1})
    ]);
    c.personal=cal.personal;c.asignaciones=cal.asignaciones;c.sin_fechas=cal.sin_fechas;c.hoy=cal.hoy;c.cubrir=cub.equipos.filter(e=>e.valida);
    pintarCalendario();
  }
  function colorEquipo(id){return COLORES[Math.abs(Number(id)||0)%COLORES.length];}
  function pintarCalendario(){
    const c=state.cal,hasta=addDays(c.desde,c.span-1);
    const dias=[];for(let i=0;i<c.span;i++)dias.push(addDays(c.desde,i));
    const porPersona=new Map();for(const a of c.asignaciones){if(!porPersona.has(a.id_personal))porPersona.set(a.id_personal,[]);porPersona.get(a.id_personal).push(a);}
    let head='<tr><th class="pp-sticky pp-namecol">'+T().singular+'</th>';
    dias.forEach((d,i)=>{const w=dow(d),nuevoMes=i===0||d.endsWith('-01');
      head+='<th class="pp-day'+(w===0||w===6?' pp-we':'')+(d===c.hoy?' pp-hoy':'')+(nuevoMes?' pp-mes':'')+'">'+(nuevoMes?'<small>'+MESES[Number(d.slice(5,7))-1]+'</small>':'')+Number(d.slice(8))+'</th>';});
    head+='</tr>';
    let rows='',grupoPrev=null;
    const ordenados=[...c.personal].sort((a,b)=>String(a.grupo).localeCompare(String(b.grupo),'es')||String(a.nombre).localeCompare(String(b.nombre),'es'));
    for(const p of ordenados){
      if(p.grupo!==grupoPrev){rows+='<tr class="pp-grupo"><td colspan="'+(c.span+1)+'">'+esc(p.grupo)+'</td></tr>';grupoPrev=p.grupo;}
      const mias=porPersona.get(p.id_personal)||[];
      rows+='<tr><td class="pp-sticky pp-namecol"><b>'+esc(p.nombre)+'</b><small>'+esc(state.tipo==='MONTADOR'?p.contratista:(p.experiencia||p.categoria))+'</small></td>';
      for(const d of dias){
        const hit=mias.filter(a=>a.inicio<=d&&a.fin>=d),w=dow(d);
        const cls='pp-cell'+(w===0||w===6?' pp-we':'')+(d===c.hoy?' pp-hoy':'');
        if(!hit.length)rows+='<td class="'+cls+' pp-free" data-act="asignar-celda" data-p="'+p.id_personal+'" data-d="'+d+'" title="Asignar a '+escR(p.nombre)+'"></td>';
        else{
          const a=hit[0],dup=hit.length>1;
          const col=a.visible?colorEquipo(a.id_ins_fl):'#64748B';
          const tip=a.visible?(a.proyecto+' · '+(a.equipo||'')+' ('+fmt(a.inicio)+' → '+fmt(a.fin)+')'):'Ocupado: proyecto fuera de tu alcance';
          rows+='<td class="'+cls+' pp-busy'+(dup?' pp-dup':'')+'" style="--c:'+col+'" '+(a.visible?'data-act="editar-asignacion" data-a="'+a.id_asignacion+'"':'')+' title="'+escR(tip+(dup?' — TRASLAPE':''))+'">'+(d===a.inicio?'<i>'+escR((a.proyecto||'•').slice(0,10))+'</i>':'')+'</td>';
        }
      }
      rows+='</tr>';
    }
    if(!c.personal.length)rows='<tr><td colspan="'+(c.span+1)+'" class="pp-status">Sin personal registrado. Agrégalo en la pestaña «Personal».</td></tr>';
    const spans=[[14,'2 semanas'],[31,'1 mes'],[62,'2 meses'],[93,'3 meses']];
    $('pp-body').innerHTML=
      '<section class="pp-card"><div class="pp-bar">'+
        '<button type="button" class="pp-btn pp-soft" data-act="cal-prev">◀</button>'+
        '<label>Desde<input type="date" id="pp-cal-desde" value="'+c.desde+'"></label>'+
        '<button type="button" class="pp-btn pp-soft" data-act="cal-next">▶</button>'+
        '<button type="button" class="pp-btn pp-soft" data-act="cal-hoy">Hoy</button>'+
        '<label>Ver<select id="pp-cal-span">'+spans.map(([n,l])=>'<option value="'+n+'"'+(c.span===n?' selected':'')+'>'+l+'</option>').join('')+'</select></label>'+
        '<label>Buscar<input type="text" id="pp-cal-q" value="'+escR(c.q)+'" placeholder="Nombre, contratista, categoría…"></label>'+
        '<button type="button" class="pp-btn pp-primary" data-act="asignar-nueva">+ Asignar a equipo</button>'+
      '</div><p class="pp-hint">'+fmt(c.desde)+' → '+fmt(hasta)+'. Clic en un día libre para asignar; clic en una barra para editar o quitar. Traslapes se marcan con rayas.</p>'+
      '<div class="pp-scroll"><table class="pp-cal"><thead>'+head+'</thead><tbody>'+rows+'</tbody></table></div></section>'+
      (c.cubrir.length?'<section class="pp-card"><h3>Equipos en este rango sin '+T().singular.toLowerCase()+' asignado</h3><div class="pp-chips">'+c.cubrir.map(e=>
        '<button type="button" class="pp-chip" data-act="asignar-equipo" data-e="'+e.id_ins_fl+'"><b>'+esc(e.proyecto)+'</b> · '+esc(e.equipo)+'<small>'+fmt(e.inicio)+' → '+fmt(e.fin)+' · '+e.dias+' d</small></button>').join('')+'</div></section>':'')+
      (c.sin_fechas.length?'<section class="pp-card"><h3>Asignaciones sin fechas válidas en el reporte</h3><p class="pp-hint">No aparecen en el calendario hasta que el equipo tenga inicio y fin de '+T().fase+' (o captures fechas manuales).</p><div class="pp-chips">'+c.sin_fechas.map(a=>
        '<button type="button" class="pp-chip pp-warn" data-act="editar-asignacion" data-a="'+a.id_asignacion+'"><b>'+esc(personaNombre(a.id_personal))+'</b> · '+esc(a.proyecto)+' · '+esc(a.equipo)+'</button>').join('')+'</div></section>':'');
  }
  function personaNombre(id){const p=state.cal.personal.find(x=>x.id_personal===id)||state.personal.find(x=>x.id_personal===id);return p?p.nombre:'#'+id;}

  // ---------------------------------------------------------------- modal genérico
  function abrirModal(titulo,html,kind){
    state.modal=kind||'x';$('pp-modal-titulo').textContent=titulo;$('pp-modal-body').innerHTML=html;$('pp-overlay').hidden=false;
  }
  function cerrarModal(){state.modal=null;$('pp-overlay').hidden=true;$('pp-modal-body').innerHTML='';}
  const optEquipo=e=>'<option value="'+e.id_ins_fl+'" data-v="'+(e.valida?1:0)+'">'+escR(e.proyecto)+' · '+escR(e.equipo||'')+(e.valida?' ('+fmt(e.inicio)+' → '+fmt(e.fin)+', '+e.dias+' d)':' (sin fechas de '+T().fase+')')+'</option>';

  async function abrirAsignar({idEquipo=null,idPersona=null,fecha=null}={}){
    try{
      const [eq,pe]=await Promise.all([get('/equipos',{tipo:state.tipo}),get('/personal',{tipo:state.tipo})]);
      state.equipos=eq.equipos;state.personal=pe.personal;
    }catch(e){alert('No se pudo cargar: '+e.message);return;}
    let lista=state.equipos;
    if(!idEquipo&&fecha){const cand=lista.filter(e=>e.valida&&e.inicio<=fecha&&e.fin>=fecha);if(cand.length)lista=[...cand,...lista.filter(e=>!cand.includes(e))];}
    abrirModal('Asignar '+T().plural.toLowerCase()+' a un equipo',
      '<form id="pp-form-asignar" class="pp-form">'+
        '<label>Equipo*<select id="pp-a-equipo" required><option value="">Selecciona un equipo…</option>'+lista.map(optEquipo).join('')+'</select></label>'+
        '<div class="pp-info" id="pp-a-ventana">Los días de trabajo se toman del reporte de Instalaciones.</div>'+
        '<label>'+T().plural+'* <span class="pp-hint-inline" id="pp-a-count">0 seleccionados</span><input type="text" id="pp-a-buscar" placeholder="Buscar…"></label>'+
        '<div class="pp-checks" id="pp-a-lista">'+state.personal.map(p=>
          '<label class="pp-check" data-t="'+escR((p.nombre+' '+(p.contratista||'')+' '+(p.grupo||'')).toLowerCase())+'"><input type="checkbox" name="pp-a-p" value="'+p.id_personal+'"'+(idPersona===p.id_personal?' checked':'')+'> <span><b>'+esc(p.nombre)+'</b><small>'+esc(state.tipo==='MONTADOR'?(p.contratista+' · '+p.puesto):(p.categoria||'Sin categoría'))+(p.asignacion_actual?' · ahora en '+escR(p.asignacion_actual.proyecto||'otro proyecto'):'')+'</small></span></label>').join('')+'</div>'+
        '<details><summary>Acotar días manualmente (opcional)</summary><div class="pp-row2"><label>Desde<input type="date" id="pp-a-desde"></label><label>Hasta<input type="date" id="pp-a-hasta"></label></div><p class="pp-hint">Úsalo para relevos a mitad de obra o si el reporte aún no tiene fechas.</p></details>'+
        '<label>Notas<input type="text" id="pp-a-notas" maxlength="1000"></label>'+
        '<div id="pp-a-conflictos"></div><div class="pp-error" id="pp-a-error" hidden></div>'+
        '<div class="pp-actions"><button type="submit" class="pp-btn pp-primary" id="pp-a-guardar">Asignar</button><button type="button" class="pp-btn pp-soft" data-act="cerrar-modal">Cancelar</button></div>'+
      '</form>','asignar');
    if(idEquipo)$('pp-a-equipo').value=String(idEquipo);
    actualizarVentana();contarSeleccion();
  }
  function equipoSel(){return state.equipos.find(e=>String(e.id_ins_fl)===$('pp-a-equipo').value)||null;}
  function actualizarVentana(){
    const e=equipoSel(),box=$('pp-a-ventana');if(!box)return;
    if(!e){box.textContent='Los días de trabajo se toman del reporte de Instalaciones.';return;}
    box.innerHTML=e.valida?'Días de '+T().fase+' según el reporte: <b>'+fmt(e.inicio)+' → '+fmt(e.fin)+'</b> ('+e.dias+' días, fin '+esc(e.fuente_fin)+').':'<b>El reporte no tiene fechas de '+T().fase+' válidas para este equipo.</b> Captura «Desde» y «Hasta» manualmente.';
  }
  function contarSeleccion(){const n=document.querySelectorAll('input[name="pp-a-p"]:checked').length;const el=$('pp-a-count');if(el)el.textContent=n+' seleccionado'+(n===1?'':'s');}

  async function guardarAsignacion(permitir){
    const err=$('pp-a-error');err.hidden=true;
    const ids=[...document.querySelectorAll('input[name="pp-a-p"]:checked')].map(i=>Number(i.value));
    const e=equipoSel();
    if(!e){err.textContent='Selecciona un equipo.';err.hidden=false;return;}
    if(!ids.length){err.textContent='Selecciona al menos una persona.';err.hidden=false;return;}
    const body={tipo:state.tipo,id_ins_fl:e.id_ins_fl,ids_personal:ids,fecha_desde:$('pp-a-desde').value||null,fecha_hasta:$('pp-a-hasta').value||null,notas:$('pp-a-notas').value||null};
    if(permitir)body.permitir_traslape=true;
    const btn=$('pp-a-guardar');btn.disabled=true;
    try{
      const r=await send('POST','/asignaciones',body);
      if(r.requiere_confirmacion){
        $('pp-a-conflictos').innerHTML='<div class="pp-conflicto"><b>Traslape de fechas</b><ul>'+r.conflictos.map(c=>'<li><b>'+esc(c.nombre)+'</b> ya está en: '+c.con.map(x=>esc(x.proyecto||'proyecto fuera de tu alcance')+(x.equipo?' · '+esc(x.equipo):'')+' ('+fmt(x.inicio)+' → '+fmt(x.fin)+')').join('; ')+'</li>').join('')+'</ul>'+
          '<button type="button" class="pp-btn pp-danger" data-act="asignar-forzar">Asignar de todos modos</button></div>';
        return;
      }
      cerrarModal();await cargarTab();
    }catch(ex){err.textContent=ex.message;err.hidden=false;}
    finally{btn.disabled=false;}
  }

  async function abrirEditarAsignacion(id){
    const a=state.cal.asignaciones.find(x=>x.id_asignacion===id)||state.cal.sin_fechas.find(x=>x.id_asignacion===id);
    if(!a)return;
    abrirModal('Asignación de '+personaNombre(a.id_personal),
      '<form id="pp-form-editar" class="pp-form" data-a="'+a.id_asignacion+'">'+
        '<div class="pp-info"><b>'+esc(a.proyecto)+'</b> · '+esc(a.equipo)+'<br>'+(a.valida?fmt(a.inicio)+' → '+fmt(a.fin)+' ('+a.dias+' días'+(a.inicio_manual||a.fin_manual?', acotado manualmente':', según reporte')+')':'Sin fechas válidas')+'</div>'+
        '<div class="pp-row2"><label>Desde (manual)<input type="date" id="pp-e-desde" value="'+escR(a.fecha_desde||'')+'"></label><label>Hasta (manual)<input type="date" id="pp-e-hasta" value="'+escR(a.fecha_hasta||'')+'"></label></div>'+
        '<p class="pp-hint">Déjalos vacíos para usar las fechas del reporte de Instalaciones.</p>'+
        '<label>Notas<input type="text" id="pp-e-notas" maxlength="1000" value="'+escR(a.notas||'')+'"></label>'+
        '<div id="pp-e-conflictos"></div><div class="pp-error" id="pp-e-error" hidden></div>'+
        '<div class="pp-actions"><button type="submit" class="pp-btn pp-primary">Guardar</button><button type="button" class="pp-btn pp-danger" data-act="quitar-asignacion" data-a="'+a.id_asignacion+'">Quitar del equipo</button><button type="button" class="pp-btn pp-soft" data-act="cerrar-modal">Cancelar</button></div>'+
      '</form>','editar');
  }
  async function guardarEdicion(id,permitir){
    const err=$('pp-e-error');err.hidden=true;
    const body={fecha_desde:$('pp-e-desde').value||null,fecha_hasta:$('pp-e-hasta').value||null,notas:$('pp-e-notas').value||null};
    if(permitir)body.permitir_traslape=true;
    try{
      const r=await send('PUT','/asignaciones/'+id,body);
      if(r.requiere_confirmacion){
        $('pp-e-conflictos').innerHTML='<div class="pp-conflicto"><b>Traslape de fechas</b><ul>'+r.conflictos.map(c=>'<li><b>'+esc(c.nombre)+'</b> ya está en: '+c.con.map(x=>esc(x.proyecto||'proyecto fuera de tu alcance')+' ('+fmt(x.inicio)+' → '+fmt(x.fin)+')').join('; ')+'</li>').join('')+'</ul><button type="button" class="pp-btn pp-danger" data-act="editar-forzar" data-a="'+id+'">Guardar de todos modos</button></div>';
        return;
      }
      cerrarModal();await cargarTab();
    }catch(ex){err.textContent=ex.message;err.hidden=false;}
  }

  // ---------------------------------------------------------------- PERSONAL
  async function cargarPersonal(){
    const d=await get('/personal',{tipo:state.tipo,q:state.personalQ});
    state.personal=d.personal;
    const mont=state.tipo==='MONTADOR';
    const cols=mont?['Nombre','Contratista','Puesto','Categoría']:['Nombre','Categoría','Experiencia'];
    const filas=d.personal.map(p=>'<tr><td><b>'+esc(p.nombre)+'</b></td>'+(mont?'<td>'+esc(p.contratista)+'</td><td><span class="pp-badge">'+esc(p.puesto)+'</span></td><td>'+esc(p.categoria)+'</td>':'<td>'+esc(p.categoria)+'</td><td>'+esc(p.experiencia)+'</td>')+
      '<td>'+(p.asignacion_actual?'<span class="pp-badge pp-on">En obra</span> '+esc(p.asignacion_actual.proyecto||'fuera de alcance')+' · '+esc(p.asignacion_actual.equipo)+' (hasta '+fmt(p.asignacion_actual.fin)+')':'<span class="pp-badge pp-off">Libre hoy</span>')+'</td>'+
      '<td>'+(p.proxima_asignacion?esc(p.proxima_asignacion.proyecto||'fuera de alcance')+' · '+fmt(p.proxima_asignacion.inicio):'—')+'</td>'+
      '<td class="pp-acts"><button type="button" class="pp-ico" data-act="personal-editar" data-p="'+p.id_personal+'" title="Editar">✏️</button><button type="button" class="pp-ico" data-act="personal-baja" data-p="'+p.id_personal+'" title="Dar de baja">🗑️</button></td></tr>').join('');
    $('pp-body').innerHTML='<section class="pp-card"><div class="pp-bar"><label>Buscar<input type="text" id="pp-p-q" value="'+escR(state.personalQ)+'" placeholder="Nombre, contratista, categoría…"></label>'+
      '<button type="button" class="pp-btn pp-primary" data-act="personal-nuevo">+ Nuevo '+T().singular.toLowerCase()+'</button></div>'+
      '<div class="pp-scroll"><table class="pp-table"><thead><tr>'+cols.map(c=>'<th>'+c+'</th>').join('')+'<th>Situación hoy</th><th>Próxima asignación</th><th></th></tr></thead><tbody>'+(filas||'<tr><td colspan="'+(cols.length+3)+'" class="pp-status">Sin registros.</td></tr>')+'</tbody></table></div>'+
      '<p class="pp-hint">'+d.total+' '+T().plural.toLowerCase()+' activos.</p></section>';
  }
  function abrirPersonal(p){
    const mont=state.tipo==='MONTADOR',op=state.opciones||{montadores:{contratistas:[],categorias:[]},ajustadores:{categorias:[]}};
    const dl=(id,arr)=>'<datalist id="'+id+'">'+arr.map(v=>'<option value="'+escR(v)+'">').join('')+'</datalist>';
    abrirModal((p?'Editar ':'Nuevo ')+T().singular.toLowerCase(),
      '<form id="pp-form-personal" class="pp-form" data-p="'+(p?p.id_personal:'')+'">'+
        '<label>Nombre*<input type="text" id="pp-f-nombre" required maxlength="200" value="'+escR(p?p.nombre:'')+'"></label>'+
        (mont?
          '<label>Contratista*<input type="text" id="pp-f-contratista" required maxlength="200" list="pp-dl-c" value="'+escR(p?p.contratista:'')+'"></label>'+dl('pp-dl-c',op.montadores.contratistas)+
          '<label>Puesto*<select id="pp-f-puesto" required>'+['Mecánico','Ayudante'].map(x=>'<option'+(p&&p.puesto===x?' selected':'')+'>'+x+'</option>').join('')+'</select></label>'+
          '<label>Categoría<input type="text" id="pp-f-categoria" maxlength="100" list="pp-dl-k" value="'+escR(p?p.categoria:'')+'"></label>'+dl('pp-dl-k',op.montadores.categorias)
        :
          '<label>Categoría<input type="text" id="pp-f-categoria" maxlength="100" list="pp-dl-k" value="'+escR(p?p.categoria:'')+'"></label>'+dl('pp-dl-k',op.ajustadores.categorias)+
          '<label>Experiencia<input type="text" id="pp-f-experiencia" maxlength="200" placeholder="Ej. 8 años, líneas de escaleras" value="'+escR(p?p.experiencia:'')+'"></label>')+
        '<div class="pp-error" id="pp-f-error" hidden></div>'+
        '<div class="pp-actions"><button type="submit" class="pp-btn pp-primary">Guardar</button><button type="button" class="pp-btn pp-soft" data-act="cerrar-modal">Cancelar</button></div>'+
      '</form>','personal');
  }
  async function guardarPersonal(form){
    const err=$('pp-f-error');err.hidden=true;
    const id=form.dataset.p,mont=state.tipo==='MONTADOR';
    const body={tipo:state.tipo,nombre:$('pp-f-nombre').value,categoria:$('pp-f-categoria').value||null};
    if(mont){body.contratista=$('pp-f-contratista').value;body.puesto=$('pp-f-puesto').value;}else body.experiencia=$('pp-f-experiencia').value||null;
    try{
      if(id)await send('PUT','/personal/'+state.tipo+'/'+id,body);else await send('POST','/personal',body);
      cerrarModal();await refrescarOpciones();await cargarTab();
    }catch(ex){err.textContent=ex.message;err.hidden=false;}
  }
  async function bajaPersonal(id){
    const p=state.personal.find(x=>x.id_personal===id);
    if(!confirm('¿Dar de baja a '+(p?p.nombre:'este registro')+'? Su historial se conserva.'))return;
    try{await send('DELETE','/personal/'+state.tipo+'/'+id);await cargarTab();}catch(ex){alert(ex.message);}
  }

  // ---------------------------------------------------------------- HISTORIAL
  async function cargarHistorial(){
    const h=state.hist;
    const [pe,res]=await Promise.all([get('/personal',{tipo:state.tipo}),get('/historial',{tipo:state.tipo,id_personal:h.id_personal,desde:h.desde,hasta:h.hasta,q:h.q})]);
    state.personal=pe.personal;h.res=res;
    const est={Pasada:'pp-off',Futura:'pp-fut','En curso':'pp-on','Sin fechas':'pp-warnb'};
    const filas=res.filas.map(f=>'<tr><td><b>'+esc(f.nombre)+'</b>'+(f.contratista?'<small>'+esc(f.contratista)+'</small>':'')+'</td><td>'+esc(f.proyecto)+'</td><td>'+esc(f.equipo)+'</td><td>'+fmt(f.inicio)+'</td><td>'+fmt(f.fin)+(f.fin_manual?' <small>manual</small>':'')+'</td><td class="pp-n">'+esc(f.dias)+'</td><td class="pp-n">'+f.dias_trabajados+'</td><td class="pp-n">'+f.dias_programados+'</td><td><span class="pp-badge '+(est[f.estado]||'')+'">'+esc(f.estado)+'</span></td><td>'+esc(f.notas)+'</td></tr>').join('');
    $('pp-body').innerHTML='<section class="pp-card"><div class="pp-bar">'+
      '<label>Persona<select id="pp-h-p"><option value="">Todas</option>'+pe.personal.map(p=>'<option value="'+p.id_personal+'"'+(String(h.id_personal)===String(p.id_personal)?' selected':'')+'>'+escR(p.nombre)+'</option>').join('')+'</select></label>'+
      '<label>Desde<input type="date" id="pp-h-desde" value="'+escR(h.desde)+'"></label><label>Hasta<input type="date" id="pp-h-hasta" value="'+escR(h.hasta)+'"></label>'+
      '<label>Buscar<input type="text" id="pp-h-q" value="'+escR(h.q)+'" placeholder="Proyecto, equipo, persona…"></label></div>'+
      '<div class="pp-kpis"><div><b>'+res.resumen.total_asignaciones+'</b><span>Asignaciones</span></div><div><b>'+res.resumen.proyectos_distintos+'</b><span>Proyectos</span></div><div><b>'+res.resumen.dias_trabajados+'</b><span>Días trabajados</span></div><div><b>'+res.resumen.dias_programados+'</b><span>Días programados</span></div></div>'+
      '<div class="pp-scroll"><table class="pp-table"><thead><tr><th>Persona</th><th>Proyecto</th><th>Equipo</th><th>Inicio</th><th>Fin</th><th>Días</th><th>Trabajados</th><th>Programados</th><th>Estado</th><th>Notas</th></tr></thead><tbody>'+(filas||'<tr><td colspan="10" class="pp-status">Sin asignaciones en el filtro.</td></tr>')+'</tbody></table></div>'+
      (res.ocultas?'<p class="pp-hint">'+res.ocultas+' asignación(es) en proyectos fuera de tu alcance no se muestran.</p>':'')+'</section>';
  }

  // ---------------------------------------------------------------- DISPONIBILIDAD + SIMULACION
  const PRESETS={'3m':[92,'semana','3 meses'],'12m':[365,'semana','12 meses'],'3a':[1095,'mes','3 años'],'5a':[1825,'mes','5 años']};
  async function cargarDisponibilidad(){
    const d=state.disp;
    if(!d.desde){d.desde=hoyLocal();d.hasta=addDays(d.desde,364);d.gran='semana';}
    const [res,eq]=await Promise.all([get('/disponibilidad',{tipo:state.tipo,desde:d.desde,hasta:d.hasta,granularidad:d.gran}),get('/equipos',{tipo:state.tipo})]);
    d.res=res;state.equipos=eq.equipos;
    pintarDisponibilidad();
  }
  function pintarDisponibilidad(){
    const d=state.disp,res=d.res,mont=state.tipo==='MONTADOR';
    const filas=res.buckets.map(b=>{
      const pct=b.total?Math.round(b.ocupados*100/b.total):0;
      return '<tr><td>'+fmt(b.desde)+(b.hasta!==b.desde?' → '+fmt(b.hasta):'')+'</td><td class="pp-n"><b>'+b.libres+'</b></td><td class="pp-n">'+b.ocupados+'</td><td><div class="pp-meter" title="'+pct+'% ocupado"><i style="width:'+pct+'%"></i></div></td>'+
        res.grupos.map(g=>'<td class="pp-n">'+b.grupos[g].libres+' / '+b.grupos[g].total+'</td>').join('')+'</tr>';}).join('');
    const sim=state.sim.res;
    $('pp-body').innerHTML=
      '<section class="pp-card"><h3>Proyección de disponibilidad</h3><div class="pp-bar">'+
        '<label>Desde<input type="date" id="pp-d-desde" value="'+d.desde+'"></label><label>Hasta<input type="date" id="pp-d-hasta" value="'+d.hasta+'"></label>'+
        '<label>Agrupar por<select id="pp-d-gran">'+[['dia','Día'],['semana','Semana'],['mes','Mes']].map(([k,l])=>'<option value="'+k+'"'+(d.gran===k?' selected':'')+'>'+l+'</option>').join('')+'</select></label>'+
        '<div class="pp-presets">'+Object.entries(PRESETS).map(([k,v])=>'<button type="button" class="pp-btn pp-soft" data-act="preset" data-v="'+k+'">'+v[2]+'</button>').join('')+'</div></div>'+
      '<p class="pp-hint">Libres = personas sin ninguna asignación que se traslape con el periodo. Considera '+res.total_personal+' '+T().plural.toLowerCase()+' activos y las fechas actuales del reporte de Instalaciones.</p>'+
      '<div class="pp-scroll pp-tall"><table class="pp-table"><thead><tr><th>Periodo</th><th>Libres</th><th>Ocupados</th><th>Ocupación</th>'+res.grupos.map(g=>'<th>'+esc(g)+' (libres/total)</th>').join('')+'</tr></thead><tbody>'+filas+'</tbody></table></div></section>'+
      '<section class="pp-card"><h3>Simulación: ¿quién puede cubrir un trabajo?</h3><form id="pp-form-sim" class="pp-bar">'+
        '<label>Equipo (opcional)<select id="pp-s-equipo"><option value="">— Sin equipo: capturar fechas —</option>'+state.equipos.map(optEquipo).join('')+'</select></label>'+
        '<label>Inicio<input type="date" id="pp-s-ini"></label><label>Fin<input type="date" id="pp-s-fin"></label>'+
        (mont?'<label>Mecánicos req.<input type="number" min="0" max="50" id="pp-s-mec" value="1"></label><label>Ayudantes req.<input type="number" min="0" max="50" id="pp-s-ayu" value="1"></label>':'<label>Ajustadores req.<input type="number" min="0" max="50" id="pp-s-aju" value="1"></label>')+
        '<button type="submit" class="pp-btn pp-primary">Simular</button></form>'+
      '<p class="pp-hint">Es solo una consulta: no crea ni modifica asignaciones. Si eliges un equipo con fechas, se usan las del reporte (puedes sobrescribirlas con Inicio/Fin para proyectar un corrimiento).</p>'+
      '<div id="pp-s-res">'+(sim?htmlSimulacion(sim):'')+'</div></section>';
  }
  function htmlSimulacion(s){
    const li=p=>'<li><b>'+esc(p.nombre)+'</b><small>'+esc(state.tipo==='MONTADOR'?p.contratista+' · '+p.puesto:(p.categoria||'Sin categoría'))+(p.ya_asignado?' · ya asignado a este equipo':'')+'</small></li>';
    return '<div class="pp-sim '+(s.viable?'pp-ok':'pp-no')+'"><b>'+(s.viable?'Viable':'No viable')+'</b> · ventana '+fmt(s.ventana.inicio)+' → '+fmt(s.ventana.fin)+' ('+s.ventana.dias+' días'+(s.ventana.desde_reporte?', del reporte':'')+')'+
      (s.resumen.length?'<ul class="pp-sumlist">'+s.resumen.map(r=>'<li>'+esc(r.grupo)+': requeridos '+r.requeridos+', libres '+r.libres+(r.faltantes?' → <b>faltan '+r.faltantes+'</b>':' ✔')+'</li>').join('')+'</ul>':'')+'</div>'+
      '<div class="pp-two"><div><h4>Libres ('+s.libres.length+')</h4><ul class="pp-people">'+(s.libres.map(li).join('')||'<li>Nadie</li>')+'</ul></div>'+
      '<div><h4>Ocupados en la ventana ('+s.ocupados.length+')</h4><ul class="pp-people">'+(s.ocupados.map(p=>'<li><b>'+esc(p.nombre)+'</b><small>libre desde '+fmt(p.libre_desde)+' · '+p.ocupado_en.map(o=>esc(o.proyecto||'fuera de alcance')).join(', ')+'</small></li>').join('')||'<li>Nadie</li>')+'</ul></div></div>';
  }
  async function simular(){
    const mont=state.tipo==='MONTADOR',q={tipo:state.tipo,id_ins_fl:$('pp-s-equipo').value,fecha_inicio:$('pp-s-ini').value,fecha_fin:$('pp-s-fin').value};
    if(mont){q.mecanicos=$('pp-s-mec').value;q.ayudantes=$('pp-s-ayu').value;}else q.ajustadores=$('pp-s-aju').value;
    const box=$('pp-s-res');box.innerHTML='<div class="pp-status">Simulando…</div>';
    try{state.sim.res=await get('/simulacion',q);box.innerHTML=htmlSimulacion(state.sim.res);}
    catch(ex){state.sim.res=null;box.innerHTML='<div class="pp-error">'+esc(ex.message)+'</div>';}
  }

  // ---------------------------------------------------------------- eventos
  async function onClick(ev){
    const el=ev.target.closest('[data-act]');if(!el)return;
    const act=el.dataset.act;
    if(act==='tipo'){state.tipo=el.dataset.v;state.sim.res=null;state.cal.q='';state.personalQ='';state.hist.id_personal='';cargarTab();}
    else if(act==='tab'){state.tab=el.dataset.v;cargarTab();}
    else if(act==='cerrar-modal')cerrarModal();
    else if(act==='cal-prev'){state.cal.desde=addDays(state.cal.desde,-state.cal.span);cargarTab();}
    else if(act==='cal-next'){state.cal.desde=addDays(state.cal.desde,state.cal.span);cargarTab();}
    else if(act==='cal-hoy'){state.cal.desde=lunes(hoyLocal());cargarTab();}
    else if(act==='asignar-nueva')abrirAsignar();
    else if(act==='asignar-equipo')abrirAsignar({idEquipo:Number(el.dataset.e)});
    else if(act==='asignar-celda')abrirAsignar({idPersona:Number(el.dataset.p),fecha:el.dataset.d});
    else if(act==='asignar-forzar')guardarAsignacion(true);
    else if(act==='editar-asignacion')abrirEditarAsignacion(Number(el.dataset.a));
    else if(act==='editar-forzar')guardarEdicion(Number(el.dataset.a),true);
    else if(act==='quitar-asignacion'){
      if(!confirm('¿Quitar esta asignación? Deja de contar en el calendario y el historial.'))return;
      try{await send('DELETE','/asignaciones/'+el.dataset.a);cerrarModal();await cargarTab();}catch(ex){alert(ex.message);}
    }
    else if(act==='personal-nuevo')abrirPersonal(null);
    else if(act==='personal-editar')abrirPersonal(state.personal.find(p=>p.id_personal===Number(el.dataset.p)));
    else if(act==='personal-baja')bajaPersonal(Number(el.dataset.p));
    else if(act==='preset'){const pr=PRESETS[el.dataset.v];state.disp.desde=hoyLocal();state.disp.hasta=addDays(state.disp.desde,pr[0]-1);state.disp.gran=pr[1];cargarTab();}
  }
  let debounce=null;
  function diferir(fn){clearTimeout(debounce);debounce=setTimeout(fn,350);}
  function onInput(ev){
    const id=ev.target.id;
    if(id==='pp-a-buscar'){const t=ev.target.value.toLowerCase();document.querySelectorAll('#pp-a-lista .pp-check').forEach(l=>{l.hidden=t&&!l.dataset.t.includes(t);});}
    else if(id==='pp-cal-q')diferir(()=>{state.cal.q=ev.target.value;cargarTab();});
    else if(id==='pp-p-q')diferir(()=>{state.personalQ=ev.target.value;cargarTab();});
    else if(id==='pp-h-q')diferir(()=>{state.hist.q=ev.target.value;cargarTab();});
  }
  function onChange(ev){
    const id=ev.target.id;
    if(id==='pp-a-equipo')actualizarVentana();
    else if(ev.target.name==='pp-a-p')contarSeleccion();
    else if(id==='pp-cal-desde'&&ev.target.value){state.cal.desde=ev.target.value;cargarTab();}
    else if(id==='pp-cal-span'){state.cal.span=Number(ev.target.value);cargarTab();}
    else if(id==='pp-h-p'){state.hist.id_personal=ev.target.value;cargarTab();}
    else if(id==='pp-h-desde'){state.hist.desde=ev.target.value;cargarTab();}
    else if(id==='pp-h-hasta'){state.hist.hasta=ev.target.value;cargarTab();}
    else if(id==='pp-d-desde'||id==='pp-d-hasta'||id==='pp-d-gran'){
      state.disp.desde=$('pp-d-desde').value||state.disp.desde;state.disp.hasta=$('pp-d-hasta').value||state.disp.hasta;state.disp.gran=$('pp-d-gran').value;cargarTab();
    }
  }
  function onSubmit(ev){
    const f=ev.target;ev.preventDefault();
    if(f.id==='pp-form-asignar')guardarAsignacion(false);
    else if(f.id==='pp-form-editar')guardarEdicion(Number(f.dataset.a),false);
    else if(f.id==='pp-form-personal')guardarPersonal(f);
    else if(f.id==='pp-form-sim')simular();
  }

  async function refrescarOpciones(){try{state.opciones=await get('/opciones');}catch(e){console.warn('[Programación de Personal] opciones',e);}}

  async function init(){
    const view=root();if(!view)return;
    if(!state.inicializado){esqueleto();state.inicializado=true;await refrescarOpciones();}
    await cargarTab();
  }
  window.ManttoInstalacionesProgramacionPersonal={init};
})();
