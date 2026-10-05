// [Claude | 2026-10-05 | CLAUDE-MG | LAB DGB - ENTREGAS V001]
// Control de Entregas: seccion independiente del sidebar (no es parte de
// Operacion/Instalaciones/etc). 4 pestañas: Programadas (como
// responsable, crear/gestionar), Mis Entregas (como colaborador, subir
// archivo), Validacion (como responsable, aprobar/rechazar) e
// Indicadores (porcentajes de cumplimiento).
(function(){
  const API = () => (window.MANTTO_API_BASE || 'http://localhost:3001').replace(/\/$/, '');

  const state = { loaded:false, tab:'programadas', opciones:null, programadas:[], misEntregas:[], validacion:[], indicadores:null };

  const EC_HTML =
    '<div class="ec-page">' +
      '<section class="ec-card ec-head"><div><h1>Entregas</h1><p>Control de entregas de colaboradores: programa, sube evidencia y valida.</p></div><button type="button" class="ec-btn ec-btn-primary" id="ec-nuevo-btn">+ Nueva entrega programada</button></section>' +
      '<div class="ec-tabs">' +
        '<button type="button" class="ec-tab active" data-tab="programadas">Programadas</button>' +
        '<button type="button" class="ec-tab" data-tab="mis-entregas">Mis Entregas</button>' +
        '<button type="button" class="ec-tab" data-tab="validacion">Validación</button>' +
        '<button type="button" class="ec-tab" data-tab="indicadores">Indicadores</button>' +
      '</div>' +
      '<div id="ec-resultado"><div class="ec-status">Cargando...</div></div>' +
      '<div class="ec-modal-overlay" id="ec-form-overlay" hidden>' +
        '<div class="ec-modal" role="dialog" aria-modal="true">' +
          '<div class="ec-modal-head"><h2>Nueva entrega programada</h2><button type="button" class="ec-modal-close" id="ec-form-cerrar" aria-label="Cerrar">✕</button></div>' +
          '<div class="ec-modal-body">' +
            '<form id="ec-form">' +
              '<label>Colaborador*<select id="ec-f-colaborador" required></select></label>' +
              '<label>Título — qué reporte o información debe entregar*<input type="text" id="ec-f-titulo" required maxlength="200"></label>' +
              '<label>Descripción (opcional)<textarea id="ec-f-descripcion" rows="2" maxlength="2000"></textarea></label>' +
              '<label>Tipo de recurrencia*<select id="ec-f-tipo" required>' +
                '<option value="UNICA">Única</option><option value="SEMANAL">Semanal</option><option value="QUINCENAL">Quincenal</option><option value="MENSUAL">Mensual</option>' +
              '</select></label>' +
              '<label>Fecha de la primera entrega*<input type="date" id="ec-f-fecha" required></label>' +
              '<p class="ec-hint">Para recurrentes se generan 12 ocurrencias por adelantado.</p>' +
              '<div class="ec-form-error" id="ec-form-error" hidden></div>' +
              '<div class="ec-form-actions"><button type="submit" class="ec-btn ec-btn-primary" id="ec-form-guardar">Guardar</button><button type="button" class="ec-btn ec-btn-soft" id="ec-form-cancelar">Cancelar</button></div>' +
            '</form>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="ec-modal-overlay" id="ec-detalle-overlay" hidden>' +
        '<div class="ec-modal" role="dialog" aria-modal="true">' +
          '<div class="ec-modal-head"><h2 id="ec-detalle-titulo">Detalle</h2><button type="button" class="ec-modal-close" id="ec-detalle-cerrar" aria-label="Cerrar">✕</button></div>' +
          '<div class="ec-modal-body" id="ec-detalle-body"></div>' +
        '</div>' +
      '</div>' +
    '</div>';

  function $(id){ return document.getElementById(id); }
  function esc(v){ return String(v==null||v==='' ? '—' : v).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function d1(v){ return v==null?'—':v+'%'; }
  function fmtFecha(v){ if(!v) return '—'; const s=String(v).slice(0,10); const p=s.split('-'); return p.length===3?(p[2]+'/'+p[1]+'/'+p[0]):s; }

  async function requestJson(path, options){
    const opts = Object.assign({ method:'GET' }, options || {});
    if(window.ManttoAuth && typeof window.ManttoAuth.api === 'function') return window.ManttoAuth.api(path, opts);
    const headers = Object.assign({}, opts.headers || {});
    if(!(opts.body instanceof FormData)) headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    headers['Accept'] = 'application/json';
    if(window.ManttoAuth && typeof window.ManttoAuth.authHeaders === 'function') Object.assign(headers, window.ManttoAuth.authHeaders());
    const r = await fetch(API()+path, Object.assign({}, opts, { headers }));
    const data = await r.json().catch(()=>({ ok:false, message:'Respuesta inválida del backend' }));
    if(!r.ok || !data.ok) throw new Error(data.message || data.error || 'Error consultando backend');
    return data;
  }
  async function fetchJson(path){ return requestJson(path, { method:'GET' }); }

  const ESTADO_LABEL = { A_TIEMPO:'A tiempo', TARDE:'Tarde', NO_ENTREGADO:'No entregado', PENDIENTE:'Pendiente' };
  const ESTADO_CLASE = { A_TIEMPO:'ok', TARDE:'warn', NO_ENTREGADO:'danger', PENDIENTE:'neutral' };
  const VALIDACION_LABEL = { VALIDO:'Válido', RECHAZADO:'Rechazado', SIN_REVISAR:'Sin revisar', NO_APLICA:'—' };
  const VALIDACION_CLASE = { VALIDO:'ok', RECHAZADO:'danger', SIN_REVISAR:'warn', NO_APLICA:'neutral' };

  function badge(label,clase){ return '<span class="ec-badge ec-badge-'+clase+'">'+esc(label)+'</span>'; }

  // ---------------------------------------------------------------------
  // Pestaña Programadas
  // ---------------------------------------------------------------------
  function renderProgramadas(){
    const rows = state.programadas;
    if(!rows.length){ $('ec-resultado').innerHTML = '<div class="ec-status">Todavía no has programado ninguna entrega. Usa "+ Nueva entrega programada" arriba.</div>'; return; }
    const items = rows.map(p=>
      '<div class="ec-card ec-prog-card">' +
        '<div class="ec-prog-head">' +
          '<div><strong>'+esc(p.titulo)+'</strong><span class="ec-row-sub">'+esc(p.colaborador_nombre)+' · '+esc({UNICA:'Única',SEMANAL:'Semanal',QUINCENAL:'Quincenal',MENSUAL:'Mensual'}[p.tipo_recurrencia]||p.tipo_recurrencia)+'</span></div>' +
          '<div class="ec-prog-actions"><button type="button" class="ec-btn ec-btn-soft" data-ver="'+p.id_entrega_programada+'">Ver detalle</button>'+(Number(p.activo)?'<button type="button" class="ec-btn ec-btn-danger" data-desactivar="'+p.id_entrega_programada+'">Desactivar</button>':'<span class="ec-badge ec-badge-neutral">Inactiva</span>')+'</div>' +
        '</div>' +
        '<div class="ec-prog-kpis">' +
          '<span>Total: <b>'+p.total_instancias+'</b></span>' +
          '<span>A tiempo: <b>'+d1(p.pct_a_tiempo)+'</b></span>' +
          '<span>General: <b>'+d1(p.pct_general)+'</b></span>' +
          '<span>No entregado: <b>'+d1(p.pct_no_entregado)+'</b></span>' +
        '</div>' +
      '</div>'
    ).join('');
    $('ec-resultado').innerHTML = '<div class="ec-list-stack">'+items+'</div>';
    $('ec-resultado').querySelectorAll('[data-ver]').forEach(btn=> btn.addEventListener('click', ()=> abrirDetalleProgramada(Number(btn.dataset.ver))));
    $('ec-resultado').querySelectorAll('[data-desactivar]').forEach(btn=> btn.addEventListener('click', ()=> desactivarProgramada(Number(btn.dataset.desactivar))));
  }

  async function cargarProgramadas(){
    $('ec-resultado').innerHTML = '<div class="ec-status">Cargando...</div>';
    try{
      const data = await fetchJson('/api/entregas/programadas');
      state.programadas = data.programadas || [];
      renderProgramadas();
    }catch(e){ $('ec-resultado').innerHTML = '<div class="ec-status">Error: '+esc(e.message)+'</div>'; }
  }

  async function abrirDetalleProgramada(idProgramada){
    $('ec-detalle-titulo').textContent = 'Detalle de la entrega programada';
    $('ec-detalle-body').innerHTML = '<div class="ec-status">Cargando...</div>';
    $('ec-detalle-overlay').hidden = false;
    try{
      const data = await fetchJson('/api/entregas/programadas/'+idProgramada);
      $('ec-detalle-titulo').textContent = data.programada.titulo;
      const filas = data.instancias.map(i=>
        '<tr><td>#'+i.numero_ocurrencia+'</td><td>'+fmtFecha(i.fecha_limite)+'</td><td>'+badge(ESTADO_LABEL[i.estado_entrega],ESTADO_CLASE[i.estado_entrega])+'</td>' +
        '<td>'+(i.fecha_entrega?fmtFecha(i.fecha_entrega):'—')+'</td>' +
        '<td>'+badge(VALIDACION_LABEL[i.estado_validacion],VALIDACION_CLASE[i.estado_validacion])+'</td></tr>'
      ).join('');
      $('ec-detalle-body').innerHTML =
        '<p class="ec-hint">Colaborador: <b>'+esc(data.programada.colaborador_nombre)+'</b> · '+esc(data.programada.descripcion||'Sin descripción')+'</p>' +
        '<div class="ec-table-wrap"><table class="ec-table"><thead><tr><th>#</th><th>Fecha límite</th><th>Estado</th><th>Entregado</th><th>Validación</th></tr></thead><tbody>'+filas+'</tbody></table></div>';
    }catch(e){ $('ec-detalle-body').innerHTML = '<div class="ec-status">Error: '+esc(e.message)+'</div>'; }
  }

  async function desactivarProgramada(idProgramada){
    if(!confirm('¿Desactivar esta entrega programada? No se generarán nuevas ocurrencias, pero el historial se conserva.')) return;
    try{ await requestJson('/api/entregas/programadas/'+idProgramada, { method:'DELETE' }); await cargarProgramadas(); }
    catch(e){ alert('No se pudo desactivar: '+e.message); }
  }

  function abrirFormulario(){
    $('ec-form-error').hidden = true;
    $('ec-form').reset();
    $('ec-f-colaborador').innerHTML = state.opciones.usuarios.map(u=>'<option value="'+u.id_SB+'">'+esc(u.nombre)+(u.puesto?' — '+esc(u.puesto):'')+'</option>').join('');
    $('ec-f-fecha').value = new Date().toISOString().slice(0,10);
    $('ec-form-overlay').hidden = false;
  }
  function cerrarFormulario(){ $('ec-form-overlay').hidden = true; }
  async function guardarFormulario(ev){
    ev.preventDefault();
    const errEl=$('ec-form-error'); errEl.hidden=true;
    const payload = {
      id_colaborador: $('ec-f-colaborador').value,
      titulo: $('ec-f-titulo').value.trim(),
      descripcion: $('ec-f-descripcion').value.trim(),
      tipo_recurrencia: $('ec-f-tipo').value,
      fecha_inicio: $('ec-f-fecha').value
    };
    const btn=$('ec-form-guardar'); btn.disabled=true; btn.textContent='Guardando...';
    try{
      await requestJson('/api/entregas/programadas', { method:'POST', body: JSON.stringify(payload) });
      cerrarFormulario();
      await cargarProgramadas();
    }catch(e){ errEl.hidden=false; errEl.textContent=e.message; }
    finally{ btn.disabled=false; btn.textContent='Guardar'; }
  }

  // ---------------------------------------------------------------------
  // Pestaña Mis Entregas
  // ---------------------------------------------------------------------
  function renderMisEntregas(){
    const rows = state.misEntregas;
    if(!rows.length){ $('ec-resultado').innerHTML = '<div class="ec-status">No tienes entregas asignadas.</div>'; return; }
    const items = rows.map(i=>{
      const subirHtml = (i.estado_entrega==='A_TIEMPO'||i.estado_entrega==='TARDE')
        ? '<span class="ec-archivo-nombre">📎 '+esc(i.nombre_archivo)+'</span> '+badge(VALIDACION_LABEL[i.estado_validacion],VALIDACION_CLASE[i.estado_validacion])+
          (i.estado_validacion==='RECHAZADO' && i.comentario_validacion ? '<div class="ec-rechazo">Motivo: '+esc(i.comentario_validacion)+' — vuelve a subir el archivo correcto.</div>' : '') +
          '<form class="ec-upload-inline" data-id="'+i.id_instancia+'"><input type="file" required><button type="submit" class="ec-btn ec-btn-soft">Reemplazar archivo</button></form>'
        : '<form class="ec-upload-inline" data-id="'+i.id_instancia+'"><input type="file" required><button type="submit" class="ec-btn ec-btn-primary">Subir archivo</button></form>';
      return '<div class="ec-card ec-mi-entrega-card">' +
        '<div class="ec-prog-head"><div><strong>'+esc(i.titulo)+'</strong><span class="ec-row-sub">Pide: '+esc(i.responsable_nombre)+' · Fecha límite: '+fmtFecha(i.fecha_limite)+'</span></div>' + badge(ESTADO_LABEL[i.estado_entrega],ESTADO_CLASE[i.estado_entrega]) + '</div>' +
        '<div class="ec-mi-entrega-body">'+subirHtml+'</div>' +
      '</div>';
    }).join('');
    $('ec-resultado').innerHTML = '<div class="ec-list-stack">'+items+'</div>';
    $('ec-resultado').querySelectorAll('.ec-upload-inline').forEach(form=>{
      form.addEventListener('submit', async ev=>{
        ev.preventDefault();
        const file = form.querySelector('input[type=file]').files[0];
        if(!file){ alert('Selecciona un archivo.'); return; }
        const data = new FormData(); data.set('archivo', file);
        const btn = form.querySelector('button'); btn.disabled=true; btn.textContent='Subiendo...';
        try{
          await requestJson('/api/entregas/instancias/'+form.dataset.id+'/archivo', { method:'POST', body:data });
          await cargarMisEntregas();
        }catch(e){ alert('No se pudo subir: '+e.message); btn.disabled=false; btn.textContent='Subir archivo'; }
      });
    });
  }
  async function cargarMisEntregas(){
    $('ec-resultado').innerHTML = '<div class="ec-status">Cargando...</div>';
    try{
      const data = await fetchJson('/api/entregas/mis-entregas');
      state.misEntregas = data.instancias || [];
      renderMisEntregas();
    }catch(e){ $('ec-resultado').innerHTML = '<div class="ec-status">Error: '+esc(e.message)+'</div>'; }
  }

  // ---------------------------------------------------------------------
  // Pestaña Validación
  // ---------------------------------------------------------------------
  function renderValidacion(){
    const rows = state.validacion;
    if(!rows.length){ $('ec-resultado').innerHTML = '<div class="ec-status">No hay entregas pendientes de validar.</div>'; return; }
    const items = rows.map(i=>
      '<div class="ec-card ec-validar-card">' +
        '<div class="ec-prog-head"><div><strong>'+esc(i.titulo)+'</strong><span class="ec-row-sub">'+esc(i.colaborador_nombre)+' · entregó '+fmtFecha(i.fecha_entrega)+' (límite '+fmtFecha(i.fecha_limite)+')</span></div>' + badge(ESTADO_LABEL[i.estado_entrega],ESTADO_CLASE[i.estado_entrega]) + '</div>' +
        '<div class="ec-validar-body">' +
          '<button type="button" class="ec-btn ec-btn-soft" data-ver-archivo="'+i.id_instancia+'">📎 Ver archivo (' + esc(i.nombre_archivo) + ')</button>' +
          '<textarea class="ec-comentario" data-comentario="'+i.id_instancia+'" placeholder="Comentario (opcional)" rows="1"></textarea>' +
          '<div class="ec-validar-botones">' +
            '<button type="button" class="ec-btn ec-btn-ok" data-validar="'+i.id_instancia+'" data-valido="1">✓ Válido</button>' +
            '<button type="button" class="ec-btn ec-btn-danger" data-validar="'+i.id_instancia+'" data-valido="0">✗ Rechazar</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    ).join('');
    $('ec-resultado').innerHTML = '<div class="ec-list-stack">'+items+'</div>';
    $('ec-resultado').querySelectorAll('[data-ver-archivo]').forEach(btn=> btn.addEventListener('click', ()=> verArchivo(Number(btn.dataset.verArchivo))));
    $('ec-resultado').querySelectorAll('[data-validar]').forEach(btn=> btn.addEventListener('click', ()=> validarInstancia(Number(btn.dataset.validar), btn.dataset.valido==='1')));
  }
  async function verArchivo(idInstancia){
    try{
      const data = await fetchJson('/api/entregas/instancias/'+idInstancia+'/archivo/acceso');
      window.open(data.data.access_url, '_blank');
    }catch(e){ alert('No se pudo abrir el archivo: '+e.message); }
  }
  async function validarInstancia(idInstancia, valido){
    const comentarioEl = document.querySelector('[data-comentario="'+idInstancia+'"]');
    const comentario = comentarioEl ? comentarioEl.value.trim() : '';
    if(!valido && !comentario){ if(!confirm('Vas a rechazar sin comentario. ¿Continuar de todas formas?')) return; }
    try{
      await requestJson('/api/entregas/instancias/'+idInstancia+'/validar', { method:'POST', body: JSON.stringify({ valido, comentario }) });
      await cargarValidacion();
    }catch(e){ alert('No se pudo registrar la validación: '+e.message); }
  }
  async function cargarValidacion(){
    $('ec-resultado').innerHTML = '<div class="ec-status">Cargando...</div>';
    try{
      const data = await fetchJson('/api/entregas/validacion');
      state.validacion = data.instancias || [];
      renderValidacion();
    }catch(e){ $('ec-resultado').innerHTML = '<div class="ec-status">Error: '+esc(e.message)+'</div>'; }
  }

  // ---------------------------------------------------------------------
  // Pestaña Indicadores
  // ---------------------------------------------------------------------
  function renderIndicadores(){
    const d = state.indicadores;
    if(!d){ $('ec-resultado').innerHTML = '<div class="ec-status">Sin datos.</div>'; return; }
    const filas = d.por_colaborador.map(c=>
      '<tr><td>'+esc(c.nombre)+'</td><td>'+c.total+'</td><td>'+d1(c.pct_a_tiempo)+'</td><td>'+d1(c.pct_general)+'</td><td>'+d1(c.pct_no_entregado)+'</td></tr>'
    ).join('');
    $('ec-resultado').innerHTML =
      '<div class="ec-grid">' +
        '<div class="ec-card"><p class="ec-metric-label">Entregas vencidas totales</p><p class="ec-metric-value">'+(d.conteo.A_TIEMPO+d.conteo.TARDE+d.conteo.NO_ENTREGADO)+'</p></div>' +
        '<div class="ec-card"><p class="ec-metric-label">% a tiempo</p><p class="ec-metric-value" style="color:#16A34A">'+d1(d.pct_a_tiempo)+'</p></div>' +
        '<div class="ec-card"><p class="ec-metric-label">% general (a tiempo + tarde)</p><p class="ec-metric-value" style="color:#1B4FD8">'+d1(d.pct_general)+'</p></div>' +
        '<div class="ec-card"><p class="ec-metric-label">% no entregado</p><p class="ec-metric-value" style="color:#DC2626">'+d1(d.pct_no_entregado)+'</p></div>' +
      '</div>' +
      '<div class="ec-card"><p class="ec-metric-label">Por colaborador</p>' +
        (filas?'<div class="ec-table-wrap"><table class="ec-table"><thead><tr><th>Colaborador</th><th>Total</th><th>A tiempo</th><th>General</th><th>No entregado</th></tr></thead><tbody>'+filas+'</tbody></table></div>':'<div class="ec-status">Sin colaboradores con entregas programadas.</div>') +
      '</div>';
  }
  async function cargarIndicadores(){
    $('ec-resultado').innerHTML = '<div class="ec-status">Cargando...</div>';
    try{
      const data = await fetchJson('/api/entregas/indicadores');
      state.indicadores = data.data;
      renderIndicadores();
    }catch(e){ $('ec-resultado').innerHTML = '<div class="ec-status">Error: '+esc(e.message)+'</div>'; }
  }

  // ---------------------------------------------------------------------
  function cambiarTab(tab){
    state.tab = tab;
    document.querySelectorAll('.ec-tab').forEach(b=> b.classList.toggle('active', b.dataset.tab===tab));
    if(tab==='programadas') cargarProgramadas();
    else if(tab==='mis-entregas') cargarMisEntregas();
    else if(tab==='validacion') cargarValidacion();
    else if(tab==='indicadores') cargarIndicadores();
  }

  async function init(){
    const view = $('view-entregas-control');
    if(!view) return;
    if(!view.innerHTML.trim()) view.innerHTML = EC_HTML;
    if(!state.loaded){
      document.querySelectorAll('.ec-tab').forEach(btn=> btn.addEventListener('click', ()=> cambiarTab(btn.dataset.tab)));
      $('ec-form-cerrar').addEventListener('click', cerrarFormulario);
      $('ec-form-cancelar').addEventListener('click', cerrarFormulario);
      $('ec-form-overlay').addEventListener('click', ev=>{ if(ev.target.id==='ec-form-overlay') cerrarFormulario(); });
      $('ec-form').addEventListener('submit', guardarFormulario);
      $('ec-detalle-cerrar').addEventListener('click', ()=> $('ec-detalle-overlay').hidden = true);
      $('ec-detalle-overlay').addEventListener('click', ev=>{ if(ev.target.id==='ec-detalle-overlay') $('ec-detalle-overlay').hidden = true; });
      document.addEventListener('keydown', ev=>{ if(ev.key==='Escape'){ $('ec-detalle-overlay').hidden=true; cerrarFormulario(); } });
      try{
        const data = await fetchJson('/api/entregas/opciones');
        state.opciones = data.data;
        state.loaded = true;
        await cargarProgramadas();
      }catch(e){
        $('ec-resultado').innerHTML = '<div class="ec-status">Error cargando el módulo: '+esc(e.message)+'</div>';
        console.error('[Entregas]', e);
      }
    }
  }

  window.ManttoEntregasControl = { init };

  // Expuesto para el boton "+ Nueva entrega programada" del header, que
  // se agrega dinamicamente (ver abajo) la primera vez que se entra a la
  // pestaña Programadas.
  document.addEventListener('click', ev=>{
    const btn = ev.target.closest('#ec-nuevo-btn');
    if(btn) abrirFormulario();
  });
})();
