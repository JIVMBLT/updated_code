// [Claude | 2026-09-17 | CLAUDE-MG | LAB DGB - TRASLADO INFORMES V001]
// [Claude | 2026-09-19 | CLAUDE-MG | LAB DGB - INFORMES FILTROS BUSCABLES + DRILL-DOWN V001]
// Trasladado de produccion (ziSirrush/GestorMantto) sin cambios de fondo en
// las formulas del informe: usa window.ManttoAuth.api cuando esta disponible
// (igual que equipos-criticos.js en este mismo LAB), con fetch directo como
// resguardo. Los 6 filtros (superintendente/supervisor/estado/zona/proyecto/
// equipo) pasan de <select multiple> nativo (requeria Ctrl+click) a un combo
// propio: buscar-para-filtrar + checkboxes para multi-seleccion. Las
// tarjetas de "Actividad del periodo" abren un detalle de tickets con las
// mismas 18 columnas que Operacion > Resumen del dia > Tickets del periodo
// (ver modules/resumen-dia/resumen-dia.js, TICKETS_CONTEXTUAL_UNI_HEADERS).
(function(){
  const API = () => (window.MANTTO_API_BASE || 'http://localhost:3001').replace(/\/$/, '');

  const FILTROS = [
    { key:'superintendente', label:'Superintendente', opKey:'superintendentes' },
    { key:'supervisor', label:'Supervisor', opKey:'supervisores' },
    { key:'zona', label:'Zona', opKey:'zonas' },
    { key:'estado', label:'Estado', opKey:'estados' },
    { key:'proyecto', label:'Proyecto', opKey:'proyectos' },
    { key:'equipo', label:'Equipo', opKey:'equipos' }
  ];

  const state = {
    loaded:false,
    opciones:{ superintendentes:[], supervisores:[], estados:[], zonas:[], proyectos:[], equipos:[] },
    filtros:{ superintendente:new Set(), supervisor:new Set(), estado:new Set(), zona:new Set(), proyecto:new Set(), equipo:new Set() },
    ultimoInforme:null,
    mtbcVentana:'anio'
  };

  const INF_HTML =
    '<div class="inf-page">' +
      '<section class="inf-card inf-head">' +
        '<div><h1>Informes</h1><p>Genera y consulta informes ejecutivos de mantenimiento por superintendencia, zona, estado, supervisor, proyecto o equipo.</p></div>' +
      '</section>' +
      '<section class="inf-card">' +
        '<div class="inf-filters">' +
          '<label>Fecha inicio<input type="date" id="inf-fecha-inicio"></label>' +
          '<label>Fecha final<input type="date" id="inf-fecha-fin"></label>' +
          FILTROS.map(f=>'<div class="inf-combo" id="inf-combo-'+f.key+'" data-key="'+f.key+'"></div>').join('') +
        '</div>' +
        '<div class="inf-actions">' +
          '<button type="button" class="inf-btn inf-btn-primary" id="inf-generar">Generar informe</button>' +
          '<button type="button" class="inf-btn inf-btn-soft" id="inf-limpiar">Limpiar filtros</button>' +
          '<button type="button" class="inf-btn inf-btn-soft" id="inf-pdf" disabled>Exportar PDF</button>' +
        '</div>' +
      '</section>' +
      '<div id="inf-resultado"><div class="inf-status">Elige los filtros que necesites (todos opcionales e independientes) y pulsa "Generar informe".</div></div>' +
      '<div class="inf-modal-overlay" id="inf-detalle-overlay" hidden>' +
        '<div class="inf-modal" role="dialog" aria-modal="true">' +
          '<div class="inf-modal-head"><h2 id="inf-detalle-titulo">Detalle</h2><button type="button" class="inf-modal-close" id="inf-detalle-cerrar" aria-label="Cerrar">✕</button></div>' +
          '<div class="inf-modal-body" id="inf-detalle-body"><div class="inf-status">Cargando...</div></div>' +
        '</div>' +
      '</div>' +
    '</div>';

  function $(id){ return document.getElementById(id); }
  function esc(v){ return String(v==null||v==='' ? '—' : v).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function n0(v){ return v===null||v===undefined ? 0 : Number(v); }
  function h1(v){ return v===null||v===undefined ? '—' : (Math.round(Number(v)*10)/10)+' h'; }
  function d1(v){ return v===null||v===undefined ? '—' : (Math.round(Number(v)*10)/10); }
  function todayIso(){ return new Date().toISOString().slice(0,10); }
  function monthsAgoIso(n){ const d=new Date(); d.setMonth(d.getMonth()-n); return d.toISOString().slice(0,10); }

  async function requestJson(path, options){
    const opts = Object.assign({ method:'GET' }, options || {});
    if(window.ManttoAuth && typeof window.ManttoAuth.api === 'function') return window.ManttoAuth.api(path, opts);
    const headers = Object.assign({ 'Accept':'application/json', 'Content-Type':'application/json' }, opts.headers || {});
    if(window.ManttoAuth && typeof window.ManttoAuth.authHeaders === 'function') Object.assign(headers, window.ManttoAuth.authHeaders());
    const r = await fetch(API()+path, Object.assign({}, opts, { headers }));
    const data = await r.json().catch(()=>({ ok:false, message:'Respuesta invalida del backend' }));
    if(!r.ok || !data.ok) throw new Error(data.message || data.error || 'Error consultando backend');
    return data;
  }
  async function fetchJson(path){ return requestJson(path, { method:'GET' }); }

  // ---------------------------------------------------------------------
  // Combo: buscar para filtrar + checkboxes para multi-seleccion.
  // Reemplaza al <select multiple> nativo (requeria Ctrl+click).
  // ---------------------------------------------------------------------
  function comboSummary(key){
    const set = state.filtros[key];
    if(!set || !set.size) return 'Todos';
    if(set.size === 1) return [...set][0];
    return set.size + ' seleccionados';
  }
  function closeAllCombos(exceptKey){
    FILTROS.forEach(f=>{
      if(f.key===exceptKey) return;
      const panel = $('inf-combo-panel-'+f.key);
      if(panel) panel.hidden = true;
    });
  }
  function renderComboOptions(key, filterText){
    const list = $('inf-combo-options-'+key);
    if(!list) return;
    const opts = state.opciones[FILTROS.find(f=>f.key===key).opKey] || [];
    const q = (filterText||'').trim().toLowerCase();
    const filtered = q ? opts.filter(v=>String(v).toLowerCase().includes(q)) : opts;
    if(!filtered.length){
      list.innerHTML = '<div class="inf-combo-empty">Sin coincidencias.</div>';
      return;
    }
    list.innerHTML = filtered.map(v=>{
      const checked = state.filtros[key].has(v) ? 'checked' : '';
      return '<label class="inf-combo-option"><input type="checkbox" value="'+esc(v)+'" '+checked+'><span>'+esc(v)+'</span></label>';
    }).join('');
    list.querySelectorAll('input[type="checkbox"]').forEach(cb=>{
      cb.addEventListener('change', ()=>{
        if(cb.checked) state.filtros[key].add(cb.value); else state.filtros[key].delete(cb.value);
        updateComboTrigger(key);
      });
    });
  }
  function updateComboTrigger(key){
    const trigger = $('inf-combo-trigger-text-'+key);
    if(trigger) trigger.textContent = comboSummary(key);
  }
  function buildCombo(f){
    const host = $('inf-combo-'+f.key);
    if(!host) return;
    host.innerHTML =
      '<label class="inf-combo-label">'+esc(f.label)+'</label>' +
      '<button type="button" class="inf-combo-trigger" id="inf-combo-trigger-'+f.key+'">' +
        '<span id="inf-combo-trigger-text-'+f.key+'">Todos</span><span class="inf-combo-caret">▾</span>' +
      '</button>' +
      '<div class="inf-combo-panel" id="inf-combo-panel-'+f.key+'" hidden>' +
        '<input type="text" class="inf-combo-search" id="inf-combo-search-'+f.key+'" placeholder="Escribe para buscar...">' +
        '<div class="inf-combo-actions">' +
          '<button type="button" data-act="all">Marcar todo</button>' +
          '<button type="button" data-act="none">Quitar todo</button>' +
        '</div>' +
        '<div class="inf-combo-options" id="inf-combo-options-'+f.key+'"></div>' +
      '</div>';
    const trigger = $('inf-combo-trigger-'+f.key);
    const panel = $('inf-combo-panel-'+f.key);
    const search = $('inf-combo-search-'+f.key);
    trigger.addEventListener('click', ev=>{
      ev.stopPropagation();
      const willOpen = panel.hidden;
      closeAllCombos(f.key);
      panel.hidden = !willOpen;
      if(willOpen){ search.value=''; renderComboOptions(f.key,''); search.focus(); }
    });
    search.addEventListener('input', ()=> renderComboOptions(f.key, search.value));
    panel.querySelectorAll('[data-act]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const opts = state.opciones[f.opKey] || [];
        const q = search.value.trim().toLowerCase();
        const visibles = q ? opts.filter(v=>String(v).toLowerCase().includes(q)) : opts;
        if(btn.dataset.act==='all') visibles.forEach(v=>state.filtros[f.key].add(v));
        else visibles.forEach(v=>state.filtros[f.key].delete(v));
        renderComboOptions(f.key, search.value);
        updateComboTrigger(f.key);
      });
    });
  }
  function initCombos(){
    FILTROS.forEach(buildCombo);
    document.addEventListener('click', ()=> closeAllCombos(null));
  }
  function refreshComboOptionsFromState(){
    FILTROS.forEach(f=>{
      renderComboOptions(f.key, '');
      updateComboTrigger(f.key);
    });
  }

  async function loadOpciones(){
    const data = await fetchJson('/api/informes/opciones');
    state.opciones = data.opciones || state.opciones;
    refreshComboOptionsFromState();
  }

  function buildQuery(extra){
    const params = new URLSearchParams();
    params.set('fecha_inicio', $('inf-fecha-inicio').value || monthsAgoIso(6));
    params.set('fecha_fin', $('inf-fecha-fin').value || todayIso());
    params.set('mtbc_ventana', state.mtbcVentana);
    FILTROS.forEach(f=>{ state.filtros[f.key].forEach(v=>params.append(f.key, v)); });
    if(extra) Object.entries(extra).forEach(([k,v])=>{ if(v!==undefined && v!==null && v!=='') params.set(k, v); });
    return params.toString();
  }

  function barList(items, colorClass, criterioKey){
    if(!items || !items.length) return '<div class="inf-empty">Sin datos en el periodo.</div>';
    const total = items.reduce((s,i)=>s+n0(i.total),0) || 1;
    const max = Math.max(...items.map(i=>n0(i.total)), 1);
    return items.map(i=>{
      const val = n0(i.total);
      const pct = Math.round(100*val/total);
      const w = Math.max(4, Math.round(100*val/max));
      const etiqueta = i.causa||i.tipo;
      return '<button type="button" class="inf-bar-row inf-drill" data-criterio="'+esc(criterioKey)+'" data-valor="'+esc(etiqueta)+'" data-etiqueta="'+esc(etiqueta)+'">' +
        '<div class="inf-bar-labels"><span>'+esc(etiqueta)+'</span><span>'+val+' · '+pct+'%</span></div>' +
        '<div class="inf-bar-track"><div class="inf-bar-fill '+colorClass+'" style="width:'+w+'%;background:'+colorClass+'"></div></div>' +
      '</button>';
    }).join('');
  }

  function drillBtn(criterio, etiqueta, html){
    return '<button type="button" class="inf-drill inf-drill-inline" data-criterio="'+esc(criterio)+'" data-etiqueta="'+esc(etiqueta)+'">'+html+'</button>';
  }

  function renderInforme(data){
    state.ultimoInforme = data;
    const r = data.resumen_alcance || {};
    const t = data.tickets || {};
    const e = data.estado_actual || {};

    const html =
      '<div class="inf-scope-banner">Informe generado con datos del '+esc(data.criterio.fecha_inicio)+' al '+esc(data.criterio.fecha_fin)+'. Haz clic en cualquier cifra o barra para ver el detalle de tickets.</div>' +
      '<section class="inf-card"><div class="inf-grid">' +
        '<div><p class="inf-metric-label">Equipos activos en el alcance</p><p class="inf-metric-value">'+n0(r.equipos_activos)+'</p></div>' +
        '<div><p class="inf-metric-label">Proyectos</p><p class="inf-metric-value">'+n0(r.n_proyectos)+'</p></div>' +
        '<div><p class="inf-metric-label">Supervisores</p><p class="inf-metric-value">'+n0(r.n_supervisores)+'</p></div>' +
        '<div><p class="inf-metric-label">Zonas</p><p class="inf-metric-value">'+n0(r.n_zonas)+'</p></div>' +
        '<div><p class="inf-metric-label">Estados</p><p class="inf-metric-value">'+n0(r.n_estados)+'</p></div>' +
      '</div></section>' +

      '<div class="inf-grid">' +
        '<section class="inf-card">' + drillBtn('total','Tickets totales del periodo','<p class="inf-metric-label">Tickets totales del periodo</p><p class="inf-metric-value">'+n0(t.total)+'</p>') + '</section>' +
        '<section class="inf-card"><p class="inf-metric-label">Responsabilidad</p>' +
          drillBtn('responsabilidad_blt','Responsabilidad BLT','<p style="margin:2px 0;color:#1B4FD8;font-weight:800">'+n0(t.responsabilidad_blt)+' BLT</p>') +
          drillBtn('responsabilidad_cliente','Responsabilidad Cliente','<p style="margin:2px 0;color:#0284C7;font-weight:800">'+n0(t.responsabilidad_cliente)+' Cliente</p>') +
        '</section>' +
        '<section class="inf-card"><p class="inf-metric-label">Estado de tickets</p>' +
          drillBtn('abiertos','Tickets abiertos','<div class="inf-list-row"><span>Abiertos</span><span>'+n0(t.abiertos)+'</span></div>') +
          drillBtn('cerrados','Tickets cerrados','<div class="inf-list-row"><span>Cerrados</span><span>'+n0(t.cerrados)+'</span></div>') +
          drillBtn('en_curso','Tickets en curso','<div class="inf-list-row"><span>En curso</span><span>'+n0(t.en_curso)+'</span></div>') +
        '</section>' +
      '</div>' +

      '<div class="inf-grid">' +
        '<section class="inf-card"><p class="inf-metric-label">Causas de falla — responsabilidad BLT</p>' + barList(t.causas_blt, '#4338CA', 'causa_blt') + '</section>' +
        '<section class="inf-card"><p class="inf-metric-label">Causas de falla — responsabilidad Cliente</p>' + barList(t.causas_cliente, '#0284C7', 'causa_cliente') + '</section>' +
      '</div>' +

      '<div class="inf-grid">' +
        '<section class="inf-card"><p class="inf-metric-label">Tickets por tipo de equipo</p>' + barList(t.tipo_equipo, '#7C3AED', 'tipo_equipo') + '</section>' +
        '<section class="inf-card"><p class="inf-metric-label">Promedio tiempo de llegada</p>' +
          '<div style="display:flex;gap:18px">' +
          drillBtn('tiempo_llegada','Tiempo de llegada — todos','<div><p class="inf-metric-value" style="font-size:19px">'+h1(t.tiempo_promedio_llegada)+'</p><p class="inf-metric-sub">Total</p></div>') +
          drillBtn('tiempo_llegada_habil','Tiempo de llegada — hábil','<div><p class="inf-metric-value" style="font-size:19px;color:#16A34A">'+h1(t.tiempo_promedio_llegada_habil)+'</p><p class="inf-metric-sub">Hábil</p></div>') +
          drillBtn('tiempo_llegada_inhabil','Tiempo de llegada — inhábil','<div><p class="inf-metric-value" style="font-size:19px;color:#D97706">'+h1(t.tiempo_promedio_llegada_inhabil)+'</p><p class="inf-metric-sub">Inhábil</p></div>') +
          '</div>' +
          '<p class="inf-metric-sub">Inhábil = 8pm–8am y fines de semana</p></section>' +
        '<section class="inf-card">' + drillBtn('tiempo_solucion','Tiempo de solución','<p class="inf-metric-label">Promedio tiempo de solución</p><p class="inf-metric-value">'+h1(t.tiempo_promedio_solucion)+'</p><p class="inf-metric-sub">solo tickets cerrados</p>') + '</section>' +
      '</div>' +

      '<div class="inf-grid">' +
        '<section class="inf-card"><p class="inf-metric-label">Equipos parados actuales</p><p class="inf-metric-value" style="color:#D97706">'+n0(e.equipos_parados)+'</p></section>' +
        '<section class="inf-card"><p class="inf-metric-label">Equipos críticos actuales</p><p class="inf-metric-value" style="color:#DC2626">'+(e.equipos_criticos?e.equipos_criticos.length:0)+'</p>' +
          (e.equipos_criticos && e.equipos_criticos.length ? e.equipos_criticos.slice(0,5).map(x=>'<div class="inf-list-row"><span>'+esc(x.equipo)+'</span><span>'+n0(x.fallas_blt)+'</span></div>').join('') : '') +
        '</section>' +
        '<section class="inf-card">' + drillBtn('atrapados','Eventos con personas atrapadas','<p class="inf-metric-label">Eventos con personas atrapadas</p><p class="inf-metric-value" style="color:#DC2626">'+n0(t.eventos_atrapados)+'</p>'+(n0(t.eventos_atrapados)>0 ? '<span class="inf-badge inf-badge-danger">Atención inmediata</span>' : '')) + '</section>' +
      '</div>' +

      '<div class="inf-grid">' +
        '<section class="inf-card">' +
          '<p class="inf-metric-label">MTBC general</p>' +
          '<div class="inf-mtbc-toggle">' +
            '<button type="button" data-mtbc="anio" class="'+(state.mtbcVentana==='anio'?'active':'')+'">Año actual</button>' +
            '<button type="button" data-mtbc="365" class="'+(state.mtbcVentana==='365'?'active':'')+'">U365D</button>' +
          '</div>' +
          '<p class="inf-metric-value">'+(e.mtbc_general==null?'—':d1(e.mtbc_general))+'</p><p class="inf-metric-sub">días</p>' +
        '</section>' +
        '<section class="inf-card" style="grid-column:span 2">' +
          '<p class="inf-metric-label">Tendencia MTBC mes a mes</p>' +
          (e.mtbc_tendencia_mensual && e.mtbc_tendencia_mensual.length ?
            e.mtbc_tendencia_mensual.map(x=>'<div class="inf-list-row"><span>'+esc(x.mes)+'</span><span>'+(x.mtbc==null?'—':d1(x.mtbc)+' días')+'</span></div>').join('')
            : '<div class="inf-empty">Sin fallas BLT suficientes en el periodo.</div>') +
        '</section>' +
      '</div>' +

      '<section class="inf-card"><p class="inf-metric-label">Proyectos críticos (MTBC menor a 100 días)</p>' +
        (e.proyectos_criticos && e.proyectos_criticos.length ?
          e.proyectos_criticos.map((x,i)=>'<div class="inf-list-row"><span>'+(i+1)+'. '+esc(x.proyecto)+'</span><span style="color:#DC2626;font-weight:800">'+d1(x.mtbc)+' días</span></div>').join('')
          : '<div class="inf-empty">Ningún proyecto por debajo del umbral en este alcance.</div>') +
      '</section>';

    $('inf-resultado').innerHTML = html;
    $('inf-resultado').querySelectorAll('[data-mtbc]').forEach(btn=>{
      btn.addEventListener('click', ()=>{ state.mtbcVentana = btn.getAttribute('data-mtbc'); generar(); });
    });
    $('inf-resultado').querySelectorAll('.inf-drill').forEach(btn=>{
      btn.addEventListener('click', ()=> abrirDetalle(btn.getAttribute('data-criterio'), btn.getAttribute('data-valor')||'', btn.getAttribute('data-etiqueta')||''));
    });
    const pdfBtn = $('inf-pdf'); if(pdfBtn) pdfBtn.disabled = false;
  }

  async function generar(){
    const resultado = $('inf-resultado');
    resultado.innerHTML = '<div class="inf-status">Generando informe...</div>';
    try{
      const data = await fetchJson('/api/informes/generar?'+buildQuery());
      renderInforme(data);
    }catch(e){
      resultado.innerHTML = '<div class="inf-status">Error: '+esc(e.message)+'</div>';
    }
  }

  function limpiarFiltros(){
    FILTROS.forEach(f=> state.filtros[f.key].clear());
    refreshComboOptionsFromState();
  }

  // ---------------------------------------------------------------------
  // Detalle de tickets (drill-down): mismas 18 columnas que Operacion >
  // Resumen del dia > Tickets del periodo (ver resumen-dia.js,
  // TICKETS_CONTEXTUAL_UNI_HEADERS + mapTicket). Se duplica aqui a
  // proposito (cada modulo LAB es autocontenido, igual que el resto del
  // codebase) en vez de importar resumen-dia.js.
  // ---------------------------------------------------------------------
  const DETALLE_HEADERS = ['No. Ticket','Proyecto','Equipo','Estado','Fecha Reporte','Hora Reporte','Asunto','Estatus inicial','Fecha Llegada','Hora Llegada','T. llegada','Fecha Solución','Hora Solución','Estatus final','Causa','Acción cierre','Responsabilidad','Causa de falla'];

  function dNrm(v){ return (v==null?'':String(v)).trim(); }
  function dUpper(v){ return dNrm(v).toUpperCase(); }
  function dYmd(v){
    if(v===null||v===undefined||v==='') return null;
    const s=String(v).trim();
    if(!s||s.toLowerCase()==='null') return null;
    let m=s.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|[T\s])/);
    if(m) return m[1]+'-'+m[2]+'-'+m[3];
    m=s.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})(?:$|[T\s])/);
    if(m) return m[3]+'-'+m[2]+'-'+m[1];
    return null;
  }
  function dHm(v){
    if(!v) return null;
    let s=String(v).trim();
    if(!s||s.toLowerCase()==='null') return null;
    s=s.replace(/\.\d+Z?$/,'').trim();
    const ampm=s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
    if(ampm){ let h=parseInt(ampm[1],10); const m=ampm[2]; const ap=ampm[3].toUpperCase(); if(ap==='PM'&&h<12)h+=12; if(ap==='AM'&&h===12)h=0; return String(h).padStart(2,'0')+':'+m; }
    const m24=s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?/);
    if(m24) return String(parseInt(m24[1],10)).padStart(2,'0')+':'+m24[2];
    return null;
  }
  function dDurHours(v){
    if(v==null||v==='') return null;
    if(typeof v==='number') return isNaN(v)?null:v;
    const s=String(v).trim().toLowerCase();
    if(!s||s==='null'||s==='—') return null;
    const clean=s.replace(',','.');
    if(/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(clean)||/^\d{4}-\d{2}-\d{2}/.test(clean)) return null;
    if(/^\d+(\.\d+)?$/.test(clean)) return parseFloat(clean);
    const hmMatch=clean.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if(hmMatch) return parseInt(hmMatch[1],10)+parseInt(hmMatch[2],10)/60;
    const any=parseFloat(clean);
    return isNaN(any)?null:any;
  }
  function dDiffHours(d1v,h1v,d2v,h2v){
    if(!d1v||!d2v) return null;
    const a=new Date(d1v+'T'+(h1v||'00:00')+':00');
    const b=new Date(d2v+'T'+(h2v||'00:00')+':00');
    if(isNaN(a.getTime())||isNaN(b.getTime())) return null;
    const hrs=(b-a)/3600000;
    return hrs>0&&hrs<24*30?hrs:null;
  }
  function dFmtDate(v){ const value=dYmd(v); if(!value) return '—'; const parts=value.split('-'); return parts.length===3?(parts[2]+'/'+parts[1]+'/'+parts[0]):'—'; }
  function dTableText(value){ const text=dNrm(value)||'—'; return '<span title="'+esc(text)+'">'+esc(text)+'</span>'; }
  function dFmtDuration(v){
    const h=dDurHours(v); if(h==null) return '—';
    const totalMin=Math.round(h*60);
    if(totalMin<60) return totalMin+' min';
    const days=Math.floor(totalMin/1440), rem=totalMin%1440, hh=Math.floor(rem/60), mm=rem%60;
    if(days>0){ const parts=[days+' d']; if(hh) parts.push(hh+' h'); if(mm) parts.push(mm+' min'); return parts.join(' '); }
    return mm?(hh+' h '+mm+' min'):(hh+' h');
  }
  function dFormatProyecto(value){
    if(window.ManttoFormat && typeof window.ManttoFormat.projectName==='function') return window.ManttoFormat.projectName(value);
    return dNrm(value)||'—';
  }
  function mapTicketDetalle(row){
    const caf=dNrm(row.causa_falla);
    const fr=dYmd(row.fecha_reporte), hr=dHm(row.h_reporte);
    const fl=dYmd(row.fecha_llegada), hl=dHm(row.h_llegada);
    const fs=dYmd(row.fecha_cierre||row.fecha_solucion), hs=dHm(row.h_solucion);
    let tll=dDurHours(row.tiempo_llegada), tso=dDurHours(row.tiempo_solucion);
    const tllCalc=dDiffHours(fr,hr,fl,hl), tsoCalc=dDiffHours(fl,hl,fs,hs);
    if(tllCalc!=null) tll=tllCalc;
    if(tsoCalc!=null) tso=tsoCalc;
    let edo=dNrm(row.estado_ticket);
    const low=edo.toLowerCase();
    if(low.includes('cerr')) edo='Cerrado'; else if(low.includes('curso')||low.includes('proceso')) edo='En curso'; else if(low.includes('abier')||low.includes('pend')) edo='Abierto'; else if(!edo) edo='Abierto';
    let res=dUpper(row.responsabilidad);
    if(res.includes('BLT')) res='BLT'; else if(res.includes('CLIENT')) res='CLIENTE'; else res=dNrm(row.responsabilidad);
    return {
      n: dNrm(row.ticket||row.id_interno||row.id),
      pro: dNrm(row.proyecto), cod: dNrm(row.codigo_equipo||row.equipo),
      edo, fr, hr, asu: dNrm(row.descripcion||row.asunto_ticket),
      eqi: dNrm(row.estatus_equipo_ir), fl, hl, tll,
      fs, hs, eqf: dNrm(row.estatus_equipo_final),
      cau: dNrm(row.causa), acc: dNrm(row.accion_en_cierre),
      res, caf
    };
  }
  function renderDetalleTabla(tickets){
    const head='<tr>'+DETALLE_HEADERS.map(l=>'<th>'+esc(l)+'</th>').join('')+'</tr>';
    if(!tickets || !tickets.length){
      return '<div class="inf-table-wrap"><table class="inf-table"><thead>'+head+'</thead><tbody><tr><td colspan="18" style="text-align:center;color:#667085;padding:20px">Sin tickets para este criterio.</td></tr></tbody></table></div>';
    }
    const rows = tickets.map(raw=>{
      const t = mapTicketDetalle(raw);
      return '<tr>' +
        '<td>'+esc(t.n)+'</td>' +
        '<td title="'+esc(t.pro)+'">'+esc(dFormatProyecto(t.pro))+'</td>' +
        '<td>'+esc(t.cod||'—')+'</td>' +
        '<td>'+dTableText(t.edo)+'</td>' +
        '<td>'+dFmtDate(t.fr)+'</td>' +
        '<td>'+esc(t.hr||'—')+'</td>' +
        '<td class="inf-cell-wide">'+dTableText(t.asu)+'</td>' +
        '<td>'+dTableText(t.eqi)+'</td>' +
        '<td>'+dFmtDate(t.fl)+'</td>' +
        '<td>'+esc(t.hl||'—')+'</td>' +
        '<td>'+esc(dFmtDuration(t.tll))+'</td>' +
        '<td>'+dFmtDate(t.fs)+'</td>' +
        '<td>'+esc(t.hs||'—')+'</td>' +
        '<td>'+dTableText(t.eqf)+'</td>' +
        '<td class="inf-cell-wide">'+dTableText(t.cau)+'</td>' +
        '<td class="inf-cell-wide">'+dTableText(t.acc)+'</td>' +
        '<td>'+dTableText(t.res)+'</td>' +
        '<td class="inf-cell-wide">'+dTableText(t.caf)+'</td>' +
      '</tr>';
    }).join('');
    return '<div class="inf-table-wrap"><table class="inf-table"><thead>'+head+'</thead><tbody>'+rows+'</tbody></table></div>';
  }

  function cerrarDetalle(){
    const overlay = $('inf-detalle-overlay');
    if(overlay) overlay.hidden = true;
  }
  async function abrirDetalle(criterio, valor, etiqueta){
    const overlay = $('inf-detalle-overlay');
    const titulo = $('inf-detalle-titulo');
    const body = $('inf-detalle-body');
    if(!overlay || !body) return;
    titulo.textContent = etiqueta || 'Detalle de tickets';
    body.innerHTML = '<div class="inf-status">Cargando...</div>';
    overlay.hidden = false;
    try{
      const data = await fetchJson('/api/informes/detalle?'+buildQuery({ criterio, valor }));
      titulo.textContent = (etiqueta || 'Detalle de tickets') + ' · ' + (data.total||0) + ' ticket(s)';
      body.innerHTML = renderDetalleTabla(data.tickets);
    }catch(e){
      body.innerHTML = '<div class="inf-status">Error: '+esc(e.message)+'</div>';
    }
  }

  // ---- Exportar PDF: mismo patron (canvas -> imagen -> jsPDF + autoTable)
  // ya usado en el perfil de equipo (core/details.js -> exportEquipmentArchivePdf).
  function exportPdf(){
    const data = state.ultimoInforme;
    if(!data){ alert('Genera un informe primero.'); return; }
    if(!window.jspdf || !window.jspdf.jsPDF){ alert('jsPDF no está disponible.'); return; }
    const doc = new window.jspdf.jsPDF({ orientation:'landscape', unit:'pt', format:'letter' });
    if(typeof doc.autoTable !== 'function'){ alert('jsPDF AutoTable no está disponible.'); return; }

    const colors = { navy:'#0D2E6E', blue:'#1B4FD8', cyan:'#0284C7', green:'#16A34A', amber:'#D97706', red:'#DC2626', indigo:'#4338CA', slate:'#64748B', light:'#EFF6FF' };
    const hexToRgb = hex => { const v=String(hex).replace('#',''); return [parseInt(v.slice(0,2),16),parseInt(v.slice(2,4),16),parseInt(v.slice(4,6),16)]; };
    const setColor = (method,hex) => doc[method].apply(doc, hexToRgb(hex));
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 32;
    const contentWidth = pageWidth - margin*2;
    const addPageIfNeeded = (y,h) => { if(y+h>pageHeight-40){ doc.addPage(); return margin; } return y; };
    const drawSectionTitle = (title,y) => { y=addPageIfNeeded(y,30); setColor('setFillColor',colors.light); doc.roundedRect(margin,y,contentWidth,24,5,5,'F'); setColor('setTextColor',colors.navy); doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.text(title,margin+10,y+16); return y+32; };
    const makeCanvas = (w,h) => { const c=document.createElement('canvas'); c.width=w; c.height=h; return c; };
    const canvasImage = (canvas,x,y,w,h) => doc.addImage(canvas.toDataURL('image/png'),'PNG',x,y,w,h,undefined,'FAST');

    const r = data.resumen_alcance||{}, t = data.tickets||{}, e = data.estado_actual||{};

    setColor('setTextColor', colors.navy); doc.setFont('helvetica','bold'); doc.setFontSize(18);
    doc.text('Informes — Gestor Mantto', margin, margin);
    setColor('setTextColor', colors.slate); doc.setFont('helvetica','normal'); doc.setFontSize(9);
    doc.text('Periodo: '+data.criterio.fecha_inicio+' a '+data.criterio.fecha_fin+'  ·  MTBC: '+(data.criterio.mtbc_ventana==='365'?'U365D':'Año actual'), margin, margin+16);

    let y = margin+34;
    y = drawSectionTitle('Resumen del alcance', y);
    const kpiCanvas = () => {
      const items = [
        ['Equipos activos', n0(r.equipos_activos), colors.navy],
        ['Proyectos', n0(r.n_proyectos), colors.blue],
        ['Supervisores', n0(r.n_supervisores), colors.cyan],
        ['Zonas', n0(r.n_zonas), colors.indigo],
        ['Estados', n0(r.n_estados), colors.slate],
        ['Tickets del periodo', n0(t.total), colors.navy],
        ['Resp. BLT', n0(t.responsabilidad_blt), colors.blue],
        ['Resp. Cliente', n0(t.responsabilidad_cliente), colors.cyan],
        ['Equipos parados', n0(e.equipos_parados), colors.amber],
        ['Equipos críticos', (e.equipos_criticos||[]).length, colors.red],
        ['Atrapados', n0(t.eventos_atrapados), colors.red],
        ['MTBC general', e.mtbc_general==null?'—':d1(e.mtbc_general), colors.indigo]
      ];
      const cols=6, gap=12, c=makeCanvas(1500,300), ctx=c.getContext('2d');
      ctx.fillStyle='#FFFFFF'; ctx.fillRect(0,0,c.width,c.height);
      const cardW=(c.width-gap*(cols-1))/cols, cardH=135;
      items.forEach((item,i)=>{
        const col=i%cols, row=Math.floor(i/cols);
        const x=col*(cardW+gap), yy=row*(cardH+gap);
        ctx.fillStyle=item[2]; ctx.beginPath(); ctx.roundRect(x,yy,cardW,cardH,14); ctx.fill();
        ctx.fillStyle='#FFFFFF'; ctx.textAlign='center';
        ctx.font='bold 30px Arial'; ctx.fillText(String(item[1]), x+cardW/2, yy+62);
        ctx.font='bold 13px Arial'; ctx.fillText(item[0].toUpperCase(), x+cardW/2, yy+95);
      });
      return c;
    };
    const kc = kpiCanvas();
    const kcH = contentWidth * (kc.height/kc.width);
    y = addPageIfNeeded(y, kcH+10);
    canvasImage(kc, margin, y, contentWidth, kcH);
    y += kcH + 20;

    y = drawSectionTitle('Causas de falla', y);
    const causasBody = (t.causas_blt||[]).map(x=>['BLT', x.causa, x.total]).concat((t.causas_cliente||[]).map(x=>['Cliente', x.causa, x.total]));
    doc.autoTable({ startY:y, margin:{left:margin,right:margin}, head:[['Responsabilidad','Causa','Tickets']], body:causasBody.length?causasBody:[['—','Sin datos','—']],
      headStyles:{ fillColor: hexToRgb(colors.navy) }, styles:{ fontSize:9 } });
    y = doc.lastAutoTable.finalY + 20;

    y = drawSectionTitle('Equipos críticos actuales', y);
    const criticosBody = (e.equipos_criticos||[]).map(x=>[x.equipo, x.fallas_blt]);
    doc.autoTable({ startY:y, margin:{left:margin,right:margin}, head:[['Equipo','Fallas BLT']], body:criticosBody.length?criticosBody:[['—','Sin equipos críticos en el alcance']],
      headStyles:{ fillColor: hexToRgb(colors.red) }, styles:{ fontSize:9 } });
    y = doc.lastAutoTable.finalY + 20;

    y = drawSectionTitle('Proyectos críticos (MTBC < 100 días)', y);
    const proyectosBody = (e.proyectos_criticos||[]).map(x=>[x.proyecto, d1(x.mtbc)]);
    doc.autoTable({ startY:y, margin:{left:margin,right:margin}, head:[['Proyecto','MTBC (días)']], body:proyectosBody.length?proyectosBody:[['—','Ninguno en el alcance']],
      headStyles:{ fillColor: hexToRgb(colors.amber) }, styles:{ fontSize:9 } });

    doc.save('informe-gestor-mantto-'+data.criterio.fecha_inicio+'-a-'+data.criterio.fecha_fin+'.pdf');
  }

  async function init(){
    const view = $('view-informes');
    if(!view) return;
    if(!view.innerHTML.trim()) view.innerHTML = INF_HTML;
    if(!state.loaded){
      $('inf-fecha-inicio').value = monthsAgoIso(6);
      $('inf-fecha-fin').value = todayIso();
      initCombos();
      $('inf-generar').addEventListener('click', generar);
      $('inf-limpiar').addEventListener('click', limpiarFiltros);
      $('inf-pdf').addEventListener('click', exportPdf);
      $('inf-detalle-cerrar').addEventListener('click', cerrarDetalle);
      $('inf-detalle-overlay').addEventListener('click', ev=>{ if(ev.target.id==='inf-detalle-overlay') cerrarDetalle(); });
      document.addEventListener('keydown', ev=>{ if(ev.key==='Escape') cerrarDetalle(); });
      try{
        await loadOpciones();
        state.loaded = true;
      }catch(e){
        $('inf-resultado').innerHTML = '<div class="inf-status">Error cargando opciones de filtro: '+esc(e.message)+'</div>';
        console.error('[Informes]', e);
      }
    }
  }

  window.ManttoOperacionInformes = { init };
})();
