// [Claude | 2026-09-19 | CLAUDE-MG | LAB DGB - INSTALACIONES CONTACTOS V001]
// Base de Datos - Formato de Contactos (Instalaciones). CRUD completo:
// listado con filtros (categoria, proyecto, busqueda), alta, edicion y baja
// logica. El selector de "Proyecto" es un combo con buscador (un proyecto
// por contacto, mismo criterio de UX que Operacion > Informes).
(function(){
  const API = () => (window.MANTTO_API_BASE || 'http://localhost:3001').replace(/\/$/, '');

  const state = {
    loaded:false,
    opciones:{ categorias:[], proyectos:[] },
    filtros:{ categoria:'', id_ins_fl:'', search:'' },
    contactos:[],
    editando:null,        // id_contacto en edicion, o null = alta
    proyectoSeleccionado:null  // {id_ins_fl,proyecto} elegido en el formulario
  };

  const IC_HTML =
    '<div class="ic-page">' +
      '<section class="ic-card ic-head">' +
        '<div><h1>Base de Datos - Formato de Contactos</h1><p>Directorio de contactos de Instalaciones, ligado a proyecto y categoría.</p></div>' +
        '<button type="button" class="ic-btn ic-btn-primary" id="ic-nuevo">+ Nuevo contacto</button>' +
      '</section>' +
      '<section class="ic-card">' +
        '<div class="ic-filters">' +
          '<label>Categoría<select id="ic-f-categoria"><option value="">Todas</option></select></label>' +
          '<div class="ic-combo" id="ic-f-combo-proyecto"></div>' +
          '<label>Buscar<input type="text" id="ic-f-buscar" placeholder="Nombre, puesto, correo, teléfono, proyecto..."></label>' +
        '</div>' +
      '</section>' +
      '<div id="ic-resultado"><div class="ic-status">Cargando contactos...</div></div>' +
      '<div class="ic-modal-overlay" id="ic-form-overlay" hidden>' +
        '<div class="ic-modal" role="dialog" aria-modal="true">' +
          '<div class="ic-modal-head"><h2 id="ic-form-titulo">Nuevo contacto</h2><button type="button" class="ic-modal-close" id="ic-form-cerrar" aria-label="Cerrar">✕</button></div>' +
          '<div class="ic-modal-body">' +
            '<form id="ic-form">' +
              '<label>Nombre*<input type="text" id="ic-form-nombre" required maxlength="180"></label>' +
              '<label>Puesto<input type="text" id="ic-form-puesto" maxlength="150"></label>' +
              '<label>Correo<input type="email" id="ic-form-correo" maxlength="200"></label>' +
              '<label>Teléfono<input type="text" id="ic-form-telefono" maxlength="80"></label>' +
              '<label>Categoría*<select id="ic-form-categoria" required></select></label>' +
              '<label>Proyecto*<div class="ic-combo" id="ic-form-combo-proyecto"></div></label>' +
              '<div class="ic-form-error" id="ic-form-error" hidden></div>' +
              '<div class="ic-form-actions"><button type="submit" class="ic-btn ic-btn-primary" id="ic-form-guardar">Guardar</button><button type="button" class="ic-btn ic-btn-soft" id="ic-form-cancelar">Cancelar</button></div>' +
            '</form>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

  function $(id){ return document.getElementById(id); }
  function esc(v){ return String(v==null||v==='' ? '—' : v).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  async function requestJson(path, options){
    const opts = Object.assign({ method:'GET' }, options || {});
    if(window.ManttoAuth && typeof window.ManttoAuth.api === 'function') return window.ManttoAuth.api(path, opts);
    const headers = Object.assign({ 'Accept':'application/json', 'Content-Type':'application/json' }, opts.headers || {});
    if(window.ManttoAuth && typeof window.ManttoAuth.authHeaders === 'function') Object.assign(headers, window.ManttoAuth.authHeaders());
    const r = await fetch(API()+path, Object.assign({}, opts, { headers }));
    const data = await r.json().catch(()=>({ ok:false, message:'Respuesta inválida del backend' }));
    if(!r.ok || !data.ok) throw new Error(data.message || data.error || 'Error consultando backend');
    return data;
  }
  async function fetchJson(path){ return requestJson(path, { method:'GET' }); }

  // ---------------------------------------------------------------------
  // Combo de un solo proyecto, con buscador (mismo patron de UX que los
  // filtros de Operacion > Informes, pero seleccion unica en vez de
  // checkboxes, porque un contacto pertenece a un solo proyecto).
  // ---------------------------------------------------------------------
  function buildProyectoCombo(containerId, onChange){
    const host = $(containerId);
    if(!host) return null;
    const uid = containerId;
    host.innerHTML =
      '<button type="button" class="ic-combo-trigger" id="'+uid+'-trigger"><span id="'+uid+'-trigger-text">Todos los proyectos</span><span class="ic-combo-caret">▾</span></button>' +
      '<div class="ic-combo-panel" id="'+uid+'-panel" hidden>' +
        '<input type="text" class="ic-combo-search" id="'+uid+'-search" placeholder="Escribe para buscar...">' +
        '<div class="ic-combo-options" id="'+uid+'-options"></div>' +
      '</div>';
    let selected = null; // {id_ins_fl, proyecto} o null = "todos" (solo aplica al filtro)
    const trigger = $(uid+'-trigger'), panel = $(uid+'-panel'), search = $(uid+'-search');
    function renderOptions(filterText, allowTodos){
      const list = $(uid+'-options');
      const q = (filterText||'').trim().toLowerCase();
      const opts = state.opciones.proyectos.filter(p=>!q || String(p.proyecto).toLowerCase().includes(q));
      let html = '';
      if(allowTodos) html += '<div class="ic-combo-option" data-todos="1"><span>Todos los proyectos</span></div>';
      html += opts.length ? opts.map(p=>'<div class="ic-combo-option" data-id="'+esc(p.id_ins_fl)+'"><span>'+esc(p.proyecto)+'</span></div>').join('') : '<div class="ic-combo-empty">Sin coincidencias.</div>';
      list.innerHTML = html;
      list.querySelectorAll('[data-id]').forEach(opt=>{
        opt.addEventListener('click', ()=>{
          const proj = state.opciones.proyectos.find(p=>String(p.id_ins_fl)===opt.getAttribute('data-id'));
          selected = proj || null;
          $(uid+'-trigger-text').textContent = proj ? proj.proyecto : 'Todos los proyectos';
          panel.hidden = true;
          if(onChange) onChange(selected);
        });
      });
      list.querySelectorAll('[data-todos]').forEach(opt=>{
        opt.addEventListener('click', ()=>{
          selected = null;
          $(uid+'-trigger-text').textContent = 'Todos los proyectos';
          panel.hidden = true;
          if(onChange) onChange(null);
        });
      });
    }
    trigger.addEventListener('click', ev=>{
      ev.stopPropagation();
      const willOpen = panel.hidden;
      document.querySelectorAll('.ic-combo-panel').forEach(p=>{ if(p!==panel) p.hidden = true; });
      panel.hidden = !willOpen;
      if(willOpen){ search.value=''; renderOptions('', containerId==='ic-f-combo-proyecto'); search.focus(); }
    });
    search.addEventListener('input', ()=> renderOptions(search.value, containerId==='ic-f-combo-proyecto'));
    return {
      get(){ return selected; },
      set(proj){ selected = proj||null; $(uid+'-trigger-text').textContent = proj ? proj.proyecto : 'Todos los proyectos'; },
      refresh(){ renderOptions(search.value||'', containerId==='ic-f-combo-proyecto'); }
    };
  }
  let filtroProyectoCombo = null;
  let formProyectoCombo = null;

  function fillCategoriaSelects(){
    const opts = state.opciones.categorias.map(c=>'<option value="'+esc(c)+'">'+esc(c)+'</option>').join('');
    $('ic-f-categoria').innerHTML = '<option value="">Todas</option>' + opts;
    $('ic-form-categoria').innerHTML = '<option value="">Selecciona una categoría</option>' + opts;
  }

  async function cargarOpciones(){
    const data = await fetchJson('/api/instalaciones/contactos/opciones');
    state.opciones = data.data || state.opciones;
    fillCategoriaSelects();
    if(filtroProyectoCombo) filtroProyectoCombo.refresh();
    if(formProyectoCombo) formProyectoCombo.refresh();
  }

  function renderTabla(){
    const rows = state.contactos;
    if(!rows.length){
      $('ic-resultado').innerHTML = '<div class="ic-status">No hay contactos con estos filtros.</div>';
      return;
    }
    const head = '<tr><th>Nombre</th><th>Puesto</th><th>Correo</th><th>Teléfono</th><th>Categoría</th><th>Proyecto</th><th></th></tr>';
    const body = rows.map(c=>
      '<tr>' +
        '<td>'+esc(c.nombre)+'</td>' +
        '<td>'+esc(c.puesto)+'</td>' +
        '<td>'+esc(c.correo)+'</td>' +
        '<td>'+esc(c.telefono)+'</td>' +
        '<td><span class="ic-badge">'+esc(c.categoria)+'</span></td>' +
        '<td>'+esc(c.proyecto_nombre)+'</td>' +
        '<td class="ic-row-actions">' +
          '<button type="button" class="ic-icon-btn" data-editar="'+c.id_contacto+'" title="Editar">✏️</button>' +
          '<button type="button" class="ic-icon-btn" data-eliminar="'+c.id_contacto+'" title="Eliminar">🗑️</button>' +
        '</td>' +
      '</tr>'
    ).join('');
    $('ic-resultado').innerHTML = '<div class="ic-table-wrap"><table class="ic-table"><thead>'+head+'</thead><tbody>'+body+'</tbody></table></div>';
    $('ic-resultado').querySelectorAll('[data-editar]').forEach(btn=> btn.addEventListener('click', ()=> abrirFormulario(Number(btn.getAttribute('data-editar')))));
    $('ic-resultado').querySelectorAll('[data-eliminar]').forEach(btn=> btn.addEventListener('click', ()=> eliminarContacto(Number(btn.getAttribute('data-eliminar')))));
  }

  async function cargarContactos(){
    $('ic-resultado').innerHTML = '<div class="ic-status">Cargando contactos...</div>';
    try{
      const params = new URLSearchParams();
      if(state.filtros.categoria) params.set('categoria', state.filtros.categoria);
      if(state.filtros.id_ins_fl) params.set('id_ins_fl', state.filtros.id_ins_fl);
      if(state.filtros.search) params.set('search', state.filtros.search);
      const data = await fetchJson('/api/instalaciones/contactos?'+params.toString());
      state.contactos = data.contactos || [];
      renderTabla();
    }catch(e){
      $('ic-resultado').innerHTML = '<div class="ic-status">Error: '+esc(e.message)+'</div>';
    }
  }

  function formError(msg){
    const el = $('ic-form-error');
    if(!msg){ el.hidden = true; el.textContent=''; return; }
    el.hidden = false; el.textContent = msg;
  }

  function abrirFormulario(contactId){
    state.editando = contactId || null;
    formError(null);
    const contacto = contactId ? state.contactos.find(c=>c.id_contacto===contactId) : null;
    $('ic-form-titulo').textContent = contacto ? 'Editar contacto' : 'Nuevo contacto';
    $('ic-form-nombre').value = contacto ? contacto.nombre||'' : '';
    $('ic-form-puesto').value = contacto ? contacto.puesto||'' : '';
    $('ic-form-correo').value = contacto ? contacto.correo||'' : '';
    $('ic-form-telefono').value = contacto ? contacto.telefono||'' : '';
    $('ic-form-categoria').value = contacto ? contacto.categoria||'' : '';
    if(formProyectoCombo){
      const proj = contacto ? state.opciones.proyectos.find(p=>p.id_ins_fl===contacto.id_ins_fl) : null;
      formProyectoCombo.set(proj);
    }
    $('ic-form-overlay').hidden = false;
    $('ic-form-nombre').focus();
  }
  function cerrarFormulario(){ $('ic-form-overlay').hidden = true; state.editando = null; }

  async function guardarFormulario(ev){
    ev.preventDefault();
    formError(null);
    const proyecto = formProyectoCombo ? formProyectoCombo.get() : null;
    const payload = {
      nombre: $('ic-form-nombre').value.trim(),
      puesto: $('ic-form-puesto').value.trim(),
      correo: $('ic-form-correo').value.trim(),
      telefono: $('ic-form-telefono').value.trim(),
      categoria: $('ic-form-categoria').value,
      id_ins_fl: proyecto ? proyecto.id_ins_fl : ''
    };
    if(!payload.nombre){ formError('El nombre es obligatorio.'); return; }
    if(!payload.categoria){ formError('Selecciona una categoría.'); return; }
    if(!payload.id_ins_fl){ formError('Selecciona un proyecto.'); return; }
    const btn = $('ic-form-guardar');
    btn.disabled = true; btn.textContent = 'Guardando...';
    try{
      if(state.editando) await requestJson('/api/instalaciones/contactos/'+state.editando, { method:'PUT', body: JSON.stringify(payload) });
      else await requestJson('/api/instalaciones/contactos', { method:'POST', body: JSON.stringify(payload) });
      cerrarFormulario();
      await cargarContactos();
    }catch(e){
      formError(e.message);
    }finally{
      btn.disabled = false; btn.textContent = 'Guardar';
    }
  }

  async function eliminarContacto(contactId){
    const contacto = state.contactos.find(c=>c.id_contacto===contactId);
    if(!confirm('¿Eliminar el contacto "'+(contacto?contacto.nombre:contactId)+'"?')) return;
    try{
      await requestJson('/api/instalaciones/contactos/'+contactId, { method:'DELETE' });
      await cargarContactos();
    }catch(e){
      alert('No se pudo eliminar: '+e.message);
    }
  }

  async function init(){
    const view = $('view-instalaciones-contactos');
    if(!view) return;
    if(!view.innerHTML.trim()) view.innerHTML = IC_HTML;
    if(!state.loaded){
      filtroProyectoCombo = buildProyectoCombo('ic-f-combo-proyecto', proj=>{
        state.filtros.id_ins_fl = proj ? proj.id_ins_fl : '';
        cargarContactos();
      });
      formProyectoCombo = buildProyectoCombo('ic-form-combo-proyecto', ()=>{});
      document.addEventListener('click', ()=> document.querySelectorAll('.ic-combo-panel').forEach(p=>p.hidden=true));

      $('ic-f-categoria').addEventListener('change', ()=>{ state.filtros.categoria = $('ic-f-categoria').value; cargarContactos(); });
      let searchTimer=null;
      $('ic-f-buscar').addEventListener('input', ()=>{
        clearTimeout(searchTimer);
        searchTimer = setTimeout(()=>{ state.filtros.search = $('ic-f-buscar').value.trim(); cargarContactos(); }, 300);
      });
      $('ic-nuevo').addEventListener('click', ()=> abrirFormulario(null));
      $('ic-form-cerrar').addEventListener('click', cerrarFormulario);
      $('ic-form-cancelar').addEventListener('click', cerrarFormulario);
      $('ic-form-overlay').addEventListener('click', ev=>{ if(ev.target.id==='ic-form-overlay') cerrarFormulario(); });
      $('ic-form').addEventListener('submit', guardarFormulario);
      document.addEventListener('keydown', ev=>{ if(ev.key==='Escape' && !$('ic-form-overlay').hidden) cerrarFormulario(); });

      try{
        await cargarOpciones();
        await cargarContactos();
        state.loaded = true;
      }catch(e){
        $('ic-resultado').innerHTML = '<div class="ic-status">Error cargando el módulo: '+esc(e.message)+'</div>';
        console.error('[Instalaciones Contactos]', e);
      }
    }
  }

  window.ManttoInstalacionesContactos = { init };
})();
