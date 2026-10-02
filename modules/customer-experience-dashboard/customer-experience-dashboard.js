// [Claude | 2026-10-02 | CLAUDE-MG | LAB DGB - CUSTOMER EXPERIENCE V001]
// Dashboard combinado de Customer Experience: Venta/Instalaciones (5 tipos
// de encuesta: Venta Concretada, Venta No Concretada, Instalacion, Ajuste,
// Encuesta de Cierre) y Mantenimiento (NPS, CSAT x6, Confianza, Valor,
// Riesgo de churn), cada area con sus propios filtros en cascada. Datos de
// origen: migracion 014 (2 archivos Excel reales compartidos por el
// usuario, con (PRUEBA) en nombres y PII de contacto ficticia).
(function(){
  const API = () => (window.MANTTO_API_BASE || 'http://localhost:3001').replace(/\/$/, '');

  const state = { loaded:false, opciones:null, area:'ambas', filtrosVi:{}, filtrosMt:{} };

  const CX_HTML =
    '<div class="cx-page">' +
      '<section class="cx-card cx-head"><div><h1>Customer Experience</h1><p>Panel combinado de encuestas: Venta/Instalaciones y Mantenimiento.</p></div></section>' +
      '<section class="cx-card">' +
        '<div class="cx-filters">' +
          '<label>Área<select id="cx-f-area"><option value="ambas">Ambas áreas</option><option value="venta_instalacion">Venta / Instalaciones</option><option value="mantenimiento">Mantenimiento</option></select></label>' +
          '<div id="cx-f-vi" class="cx-subfilters"></div>' +
          '<div id="cx-f-mt" class="cx-subfilters"></div>' +
        '</div>' +
        '<div class="cx-actions"><button type="button" class="cx-btn cx-btn-soft" id="cx-limpiar">Limpiar filtros</button></div>' +
      '</section>' +
      '<div id="cx-resultado"><div class="cx-status">Cargando...</div></div>' +
    '</div>';

  function $(id){ return document.getElementById(id); }
  function esc(v){ return String(v==null||v==='' ? '—' : v).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function n0(v){ return v===null||v===undefined ? 0 : v; }
  function d1(v){ return v===null||v===undefined ? '—' : v; }
  function pct(part,total){ return total? Math.round(100*part/total):0; }

  async function fetchJson(path){
    if(window.ManttoAuth && typeof window.ManttoAuth.api === 'function') return window.ManttoAuth.api(path, { method:'GET' });
    const headers = Object.assign({ 'Accept':'application/json' }, window.ManttoAuth && window.ManttoAuth.authHeaders ? window.ManttoAuth.authHeaders() : {});
    const r = await fetch(API()+path, { headers });
    const data = await r.json().catch(()=>({ ok:false, message:'Respuesta inválida del backend' }));
    if(!r.ok || !data.ok) throw new Error(data.message || data.error || 'Error consultando backend');
    return data;
  }

  function selectHtml(id,label,opts,current){
    const options = '<option value="">Todos</option>' + (opts||[]).map(v=>'<option value="'+esc(v)+'"'+(v===current?' selected':'')+'>'+esc(v)+'</option>').join('');
    return '<label>'+esc(label)+'<select id="'+id+'">'+options+'</select></label>';
  }

  function renderSubfiltros(){
    const vi = $('cx-f-vi'), mt = $('cx-f-mt');
    const showVi = state.area==='ambas'||state.area==='venta_instalacion';
    const showMt = state.area==='ambas'||state.area==='mantenimiento';
    vi.hidden = !showVi; mt.hidden = !showMt;
    if(showVi){
      const o = state.opciones.venta_instalacion;
      vi.innerHTML =
        selectHtml('cx-vi-tipo','Tipo de encuesta',o.tipos_encuesta,state.filtrosVi.tipo_encuesta) +
        selectHtml('cx-vi-vendedor','Vendedor',o.vendedores,state.filtrosVi.vendedor) +
        selectHtml('cx-vi-supervisor','Supervisor',o.supervisores,state.filtrosVi.supervisor);
      ['cx-vi-tipo','cx-vi-vendedor','cx-vi-supervisor'].forEach((id,i)=>{
        const key=['tipo_encuesta','vendedor','supervisor'][i];
        $(id).addEventListener('change', ()=>{ state.filtrosVi[key] = $(id).value; cargar(); });
      });
    } else vi.innerHTML='';
    if(showMt){
      const o = state.opciones.mantenimiento;
      mt.innerHTML =
        selectHtml('cx-mt-estado','Estado',o.estados,state.filtrosMt.estado) +
        selectHtml('cx-mt-zona','Zona general',o.zonas_generales,state.filtrosMt.z_general) +
        selectHtml('cx-mt-superintendente','Superintendente',o.superintendentes,state.filtrosMt.superintendente) +
        selectHtml('cx-mt-supervisor','Supervisor operativo',o.supervisores_operativos,state.filtrosMt.supervisor_operativo) +
        selectHtml('cx-mt-categoria','Categoría',o.categorias,state.filtrosMt.categoria) +
        selectHtml('cx-mt-prioridad','Prioridad',o.prioridades,state.filtrosMt.prioridad);
      [['cx-mt-estado','estado'],['cx-mt-zona','z_general'],['cx-mt-superintendente','superintendente'],['cx-mt-supervisor','supervisor_operativo'],['cx-mt-categoria','categoria'],['cx-mt-prioridad','prioridad']].forEach(([id,key])=>{
        $(id).addEventListener('change', ()=>{ state.filtrosMt[key] = $(id).value; cargar(); });
      });
    } else mt.innerHTML='';
  }

  function npsBar(clasificacion,total){
    const p=clasificacion.PROMOTOR||0, pa=clasificacion.PASIVO||0, d=clasificacion.DETRACTOR||0;
    return '<div class="cx-nps-bar">' +
      '<div class="cx-nps-seg promotor" style="width:'+pct(p,total)+'%" title="Promotor: '+p+'"></div>' +
      '<div class="cx-nps-seg pasivo" style="width:'+pct(pa,total)+'%" title="Pasivo: '+pa+'"></div>' +
      '<div class="cx-nps-seg detractor" style="width:'+pct(d,total)+'%" title="Detractor: '+d+'"></div>' +
    '</div><div class="cx-nps-legend"><span class="promotor">● Promotor '+p+'</span><span class="pasivo">● Pasivo '+pa+'</span><span class="detractor">● Detractor '+d+'</span></div>';
  }

  function tablaSimple(headers,rows){
    if(!rows.length) return '<div class="cx-empty">Sin datos con estos filtros.</div>';
    return '<div class="cx-table-wrap"><table class="cx-table"><thead><tr>'+headers.map(h=>'<th>'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+
      rows.map(r=>'<tr>'+r.map(c=>'<td>'+esc(c)+'</td>').join('')+'</tr>').join('')+
    '</tbody></table></div>';
  }

  function renderVentaInstalacion(d){
    return '<section class="cx-area-block">' +
      '<h2>Venta / Instalaciones</h2>' +
      '<div class="cx-grid">' +
        '<div class="cx-card"><p class="cx-metric-label">Encuestas</p><p class="cx-metric-value">'+n0(d.total)+'</p></div>' +
        '<div class="cx-card"><p class="cx-metric-label">NPS promedio</p><p class="cx-metric-value">'+d1(d.nps_promedio)+'</p></div>' +
        '<div class="cx-card" style="grid-column:span 2"><p class="cx-metric-label">Clasificación NPS</p>'+npsBar(d.clasificacion,d.total)+'</div>' +
      '</div>' +
      '<div class="cx-grid">' +
        '<div class="cx-card"><p class="cx-metric-label">Por tipo de encuesta</p>'+tablaSimple(['Tipo','Encuestas','NPS prom.'],d.por_tipo_encuesta.map(x=>[x.tipo_encuesta,x.total,d1(x.nps_promedio)]))+'</div>' +
        '<div class="cx-card"><p class="cx-metric-label">Por vendedor</p>'+tablaSimple(['Vendedor','Encuestas','NPS prom.'],d.por_vendedor.map(x=>[x.vendedor,x.total,d1(x.nps_promedio)]))+'</div>' +
      '</div>' +
    '</section>';
  }

  function renderMantenimiento(d){
    const csatRows = [
      ['Mantenimiento preventivo', d.csat.mantenimiento],
      ['Atención de fallas', d.csat.atencion_fallas],
      ['Seguimiento de supervisor', d.csat.seguimiento_supervisor],
      ['Cotizaciones/suministros/reparaciones', d.csat.cotizaciones],
      ['Facturación', d.csat.facturacion],
      ['Atención al cliente', d.csat.atencion_cliente]
    ];
    const maxCsat = 5;
    const csatHtml = csatRows.map(([label,val])=>{
      const w = val==null?0:Math.round(100*val/maxCsat);
      return '<div class="cx-bar-row"><div class="cx-bar-labels"><span>'+esc(label)+'</span><span>'+d1(val)+' / 5</span></div><div class="cx-bar-track"><div class="cx-bar-fill" style="width:'+w+'%"></div></div></div>';
    }).join('');
    return '<section class="cx-area-block">' +
      '<h2>Mantenimiento</h2>' +
      '<div class="cx-grid">' +
        '<div class="cx-card"><p class="cx-metric-label">Encuestas</p><p class="cx-metric-value">'+n0(d.total)+'</p></div>' +
        '<div class="cx-card"><p class="cx-metric-label">NPS promedio</p><p class="cx-metric-value">'+d1(d.nps_promedio)+'</p></div>' +
        '<div class="cx-card" style="grid-column:span 2"><p class="cx-metric-label">Clasificación NPS</p>'+npsBar(d.clasificacion,d.total)+'</div>' +
      '</div>' +
      '<div class="cx-grid">' +
        '<div class="cx-card"><p class="cx-metric-label">Índice de confianza</p><p class="cx-metric-value">'+d1(d.indice_confianza)+' / 5</p></div>' +
        '<div class="cx-card"><p class="cx-metric-label">Percepción de valor</p><p class="cx-metric-value">'+d1(d.percepcion_valor)+' / 5</p></div>' +
        '<div class="cx-card"><p class="cx-metric-label">CSAT general</p><p class="cx-metric-value">'+d1(d.csat.general)+' / 5</p></div>' +
        '<div class="cx-card"><p class="cx-metric-label">Riesgo de cambio de proveedor</p><p class="cx-metric-value" style="color:'+((d.indice_riesgo_churn||0)>1?'#DC2626':'#16A34A')+'">'+d1(d.indice_riesgo_churn)+'</p></div>' +
      '</div>' +
      '<div class="cx-card"><p class="cx-metric-label">CSAT por componente del servicio</p>'+csatHtml+'</div>' +
      '<div class="cx-grid">' +
        '<div class="cx-card"><p class="cx-metric-label">Por estado</p>'+tablaSimple(['Estado','Encuestas','NPS prom.'],d.por_estado.map(x=>[x.estado,x.total,d1(x.nps_promedio)]))+'</div>' +
        '<div class="cx-card"><p class="cx-metric-label">Por superintendente</p>'+tablaSimple(['Superintendente','Encuestas','NPS prom.'],d.por_superintendente.map(x=>[x.superintendente,x.total,d1(x.nps_promedio)]))+'</div>' +
      '</div>' +
    '</section>';
  }

  async function cargar(){
    const resultado = $('cx-resultado');
    resultado.innerHTML = '<div class="cx-status">Cargando...</div>';
    try{
      const params = new URLSearchParams();
      params.set('area', state.area);
      Object.entries(state.filtrosVi).forEach(([k,v])=>{ if(v) params.set(k,v); });
      Object.entries(state.filtrosMt).forEach(([k,v])=>{ if(v) params.set(k,v); });
      const data = await fetchJson('/api/customer-experience/dashboard?'+params.toString());
      let html = '';
      if(data.venta_instalacion) html += renderVentaInstalacion(data.venta_instalacion);
      if(data.mantenimiento) html += renderMantenimiento(data.mantenimiento);
      resultado.innerHTML = html || '<div class="cx-status">Sin datos.</div>';
    }catch(e){
      resultado.innerHTML = '<div class="cx-status">Error: '+esc(e.message)+'</div>';
    }
  }

  function limpiarFiltros(){
    state.filtrosVi = {}; state.filtrosMt = {};
    renderSubfiltros();
    cargar();
  }

  async function init(){
    const view = $('view-cx-dashboard');
    if(!view) return;
    if(!view.innerHTML.trim()) view.innerHTML = CX_HTML;
    if(!state.loaded){
      try{
        const data = await fetchJson('/api/customer-experience/opciones');
        state.opciones = data.data;
        renderSubfiltros();
        $('cx-f-area').addEventListener('change', ()=>{ state.area = $('cx-f-area').value; renderSubfiltros(); cargar(); });
        $('cx-limpiar').addEventListener('click', limpiarFiltros);
        state.loaded = true;
        await cargar();
      }catch(e){
        $('cx-resultado').innerHTML = '<div class="cx-status">Error cargando el dashboard: '+esc(e.message)+'</div>';
        console.error('[Customer Experience]', e);
      }
    }
  }

  window.ManttoCustomerExperienceDashboard = { init };
})();
