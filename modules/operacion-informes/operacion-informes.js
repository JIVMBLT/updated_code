// [Claude | 2026-09-17 | CLAUDE-MG | LAB DGB - TRASLADO INFORMES V001]
// Trasladado de produccion (ziSirrush/GestorMantto) sin cambios de fondo:
// usa window.ManttoAuth.api cuando esta disponible (igual que
// equipos-criticos.js en este mismo LAB), con fetch directo como resguardo.
(function(){
  const API = () => (window.MANTTO_API_BASE || 'http://localhost:3001').replace(/\/$/, '');

  const state = {
    loaded:false,
    opciones:{ superintendentes:[], supervisores:[], estados:[], zonas:[], proyectos:[], equipos:[] },
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
          '<label>Superintendente<select id="inf-f-superintendente" multiple></select></label>' +
          '<label>Supervisor<select id="inf-f-supervisor" multiple></select></label>' +
          '<label>Estado<select id="inf-f-estado" multiple></select></label>' +
          '<label>Zona<select id="inf-f-zona" multiple></select></label>' +
          '<label>Proyecto<select id="inf-f-proyecto" multiple></select></label>' +
          '<label>Equipo<select id="inf-f-equipo" multiple></select></label>' +
        '</div>' +
        '<div class="inf-actions">' +
          '<button type="button" class="inf-btn inf-btn-primary" id="inf-generar">Generar informe</button>' +
          '<button type="button" class="inf-btn inf-btn-soft" id="inf-limpiar">Limpiar filtros</button>' +
          '<button type="button" class="inf-btn inf-btn-soft" id="inf-pdf" disabled>Exportar PDF</button>' +
        '</div>' +
      '</section>' +
      '<div id="inf-resultado"><div class="inf-status">Elige los filtros que necesites (todos opcionales e independientes) y pulsa "Generar informe".</div></div>' +
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

  function selectedValues(id){
    const el = $(id);
    if(!el) return [];
    return Array.from(el.selectedOptions || []).map(o=>o.value).filter(Boolean);
  }

  function fillSelect(id, values){
    const el = $(id);
    if(!el) return;
    el.innerHTML = values.map(v=>'<option value="'+esc(v)+'">'+esc(v)+'</option>').join('');
  }

  async function loadOpciones(){
    const data = await fetchJson('/api/informes/opciones');
    state.opciones = data.opciones || state.opciones;
    fillSelect('inf-f-superintendente', state.opciones.superintendentes);
    fillSelect('inf-f-supervisor', state.opciones.supervisores);
    fillSelect('inf-f-estado', state.opciones.estados);
    fillSelect('inf-f-zona', state.opciones.zonas);
    fillSelect('inf-f-proyecto', state.opciones.proyectos);
    fillSelect('inf-f-equipo', state.opciones.equipos);
  }

  function buildQuery(){
    const params = new URLSearchParams();
    params.set('fecha_inicio', $('inf-fecha-inicio').value || monthsAgoIso(6));
    params.set('fecha_fin', $('inf-fecha-fin').value || todayIso());
    params.set('mtbc_ventana', state.mtbcVentana);
    const map = {
      superintendente:'inf-f-superintendente', supervisor:'inf-f-supervisor', estado:'inf-f-estado',
      zona:'inf-f-zona', proyecto:'inf-f-proyecto', equipo:'inf-f-equipo'
    };
    Object.entries(map).forEach(([key, id])=>{
      selectedValues(id).forEach(v=>params.append(key, v));
    });
    return params.toString();
  }

  function barList(items, colorClass){
    if(!items || !items.length) return '<div class="inf-empty">Sin datos en el periodo.</div>';
    const total = items.reduce((s,i)=>s+n0(i.total),0) || 1;
    const max = Math.max(...items.map(i=>n0(i.total)), 1);
    return items.map(i=>{
      const val = n0(i.total);
      const pct = Math.round(100*val/total);
      const w = Math.max(4, Math.round(100*val/max));
      return '<div class="inf-bar-row">' +
        '<div class="inf-bar-labels"><span>'+esc(i.causa||i.tipo)+'</span><span>'+val+' · '+pct+'%</span></div>' +
        '<div class="inf-bar-track"><div class="inf-bar-fill '+colorClass+'" style="width:'+w+'%;background:'+colorClass+'"></div></div>' +
      '</div>';
    }).join('');
  }

  function renderInforme(data){
    state.ultimoInforme = data;
    const r = data.resumen_alcance || {};
    const t = data.tickets || {};
    const e = data.estado_actual || {};

    const html =
      '<div class="inf-scope-banner">Informe generado con datos del '+esc(data.criterio.fecha_inicio)+' al '+esc(data.criterio.fecha_fin)+'.</div>' +
      '<section class="inf-card"><div class="inf-grid">' +
        '<div><p class="inf-metric-label">Equipos activos en el alcance</p><p class="inf-metric-value">'+n0(r.equipos_activos)+'</p></div>' +
        '<div><p class="inf-metric-label">Proyectos</p><p class="inf-metric-value">'+n0(r.n_proyectos)+'</p></div>' +
        '<div><p class="inf-metric-label">Supervisores</p><p class="inf-metric-value">'+n0(r.n_supervisores)+'</p></div>' +
        '<div><p class="inf-metric-label">Zonas</p><p class="inf-metric-value">'+n0(r.n_zonas)+'</p></div>' +
        '<div><p class="inf-metric-label">Estados</p><p class="inf-metric-value">'+n0(r.n_estados)+'</p></div>' +
      '</div></section>' +

      '<div class="inf-grid">' +
        '<section class="inf-card"><p class="inf-metric-label">Tickets totales del periodo</p><p class="inf-metric-value">'+n0(t.total)+'</p></section>' +
        '<section class="inf-card"><p class="inf-metric-label">Responsabilidad</p>' +
          '<p style="margin:2px 0;color:#1B4FD8;font-weight:800">'+n0(t.responsabilidad_blt)+' BLT</p>' +
          '<p style="margin:2px 0;color:#0284C7;font-weight:800">'+n0(t.responsabilidad_cliente)+' Cliente</p></section>' +
        '<section class="inf-card"><p class="inf-metric-label">Estado de tickets</p>' +
          '<div class="inf-list-row"><span>Abiertos</span><span>'+n0(t.abiertos)+'</span></div>' +
          '<div class="inf-list-row"><span>Cerrados</span><span>'+n0(t.cerrados)+'</span></div>' +
          '<div class="inf-list-row"><span>En curso</span><span>'+n0(t.en_curso)+'</span></div></section>' +
      '</div>' +

      '<div class="inf-grid">' +
        '<section class="inf-card"><p class="inf-metric-label">Causas de falla — responsabilidad BLT</p>' + barList(t.causas_blt, '#4338CA') + '</section>' +
        '<section class="inf-card"><p class="inf-metric-label">Causas de falla — responsabilidad Cliente</p>' + barList(t.causas_cliente, '#0284C7') + '</section>' +
      '</div>' +

      '<div class="inf-grid">' +
        '<section class="inf-card"><p class="inf-metric-label">Tickets por tipo de equipo</p>' + barList(t.tipo_equipo, '#7C3AED') + '</section>' +
        '<section class="inf-card"><p class="inf-metric-label">Promedio tiempo de llegada</p>' +
          '<div style="display:flex;gap:18px"><div><p class="inf-metric-value" style="font-size:19px">'+h1(t.tiempo_promedio_llegada)+'</p><p class="inf-metric-sub">Total</p></div>' +
          '<div><p class="inf-metric-value" style="font-size:19px;color:#16A34A">'+h1(t.tiempo_promedio_llegada_habil)+'</p><p class="inf-metric-sub">Hábil</p></div>' +
          '<div><p class="inf-metric-value" style="font-size:19px;color:#D97706">'+h1(t.tiempo_promedio_llegada_inhabil)+'</p><p class="inf-metric-sub">Inhábil</p></div></div>' +
          '<p class="inf-metric-sub">Inhábil = 8pm–8am y fines de semana</p></section>' +
        '<section class="inf-card"><p class="inf-metric-label">Promedio tiempo de solución</p><p class="inf-metric-value">'+h1(t.tiempo_promedio_solucion)+'</p><p class="inf-metric-sub">solo tickets cerrados</p></section>' +
      '</div>' +

      '<div class="inf-grid">' +
        '<section class="inf-card"><p class="inf-metric-label">Equipos parados actuales</p><p class="inf-metric-value" style="color:#D97706">'+n0(e.equipos_parados)+'</p></section>' +
        '<section class="inf-card"><p class="inf-metric-label">Equipos críticos actuales</p><p class="inf-metric-value" style="color:#DC2626">'+(e.equipos_criticos?e.equipos_criticos.length:0)+'</p>' +
          (e.equipos_criticos && e.equipos_criticos.length ? e.equipos_criticos.slice(0,5).map(x=>'<div class="inf-list-row"><span>'+esc(x.equipo)+'</span><span>'+n0(x.fallas_blt)+'</span></div>').join('') : '') +
        '</section>' +
        '<section class="inf-card"><p class="inf-metric-label">Eventos con personas atrapadas</p><p class="inf-metric-value" style="color:#DC2626">'+n0(t.eventos_atrapados)+'</p>' +
          (n0(t.eventos_atrapados)>0 ? '<span class="inf-badge inf-badge-danger">Atención inmediata</span>' : '') + '</section>' +
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
    ['inf-f-superintendente','inf-f-supervisor','inf-f-estado','inf-f-zona','inf-f-proyecto','inf-f-equipo'].forEach(id=>{
      const el = $(id); if(el) Array.from(el.options).forEach(o=>o.selected=false);
    });
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
      $('inf-generar').addEventListener('click', generar);
      $('inf-limpiar').addEventListener('click', limpiarFiltros);
      $('inf-pdf').addEventListener('click', exportPdf);
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
