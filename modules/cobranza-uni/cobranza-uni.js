(function(){
  'use strict';

  const ROUTE_GESTION_CREDITO_UNI = 'cobranza-uni-estados-cuenta';
  const ROUTE_MP_UNI = 'cobranza-uni-mp-pro';
  const ROUTE_VENTA_ADICIONAL_UNI = 'cobranza-uni-venta-adicional';
  const MODULES_UNI = Object.freeze({
    'cobranza-uni-dashboard':{title:'Dashboard Cobranza',icon:'📊'},
    'cobranza-uni-estados-cuenta':{title:'Gestión de Crédito',icon:'🛡️'},
    'cobranza-uni-aditivas':{title:'Aditivas',icon:'➕'}
  });

  const state_uni = {
    loaded:false,
    loading:false,
    rows:[],
    catalogs:{estado:[],z_oper:[],z_adm:[],nivel_riesgo_credito:[]},
    generatedAt:null,
    filters:{search:'',estado:'',z_oper:'',z_adm:'',riesgo:''},
    mobileRisk:'alto',
    detailId:null,
    detailCache:{},
    detailLoading:false,
    detailError:null
  };

  function escapeHtml_uni(value){
    return String(value == null ? '' : value).replace(/[&<>"']/g,function(character){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character];
    });
  }

  function apiBase_uni(){
    return String(window.MANTTO_API_BASE || 'http://localhost:3001').replace(/\/$/, '');
  }

  function authHeaders_uni(){
    const auth = window.ManttoAuth && typeof window.ManttoAuth.authHeaders === 'function'
      ? window.ManttoAuth.authHeaders()
      : {};
    return Object.assign({'Accept':'application/json'}, auth || {});
  }

  function number_uni(value){
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function money_uni(value){
    return new Intl.NumberFormat('es-MX',{
      style:'currency',currency:'MXN',maximumFractionDigits:0
    }).format(number_uni(value));
  }

  function integer_uni(value){
    return new Intl.NumberFormat('es-MX',{maximumFractionDigits:0}).format(number_uni(value));
  }

  function date_uni(value){
    if(!value) return '—';
    const raw=String(value).trim();
    const iso=raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if(iso) return iso[3]+'/'+iso[2]+'/'+iso[1];
    const d=new Date(value);
    if(Number.isNaN(d.getTime())) return raw;
    return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear();
  }

  function normalize_uni(value){
    return String(value == null ? '' : value)
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .trim().toLowerCase();
  }

  function riskKey_uni(value){
    const normalized = normalize_uni(value);
    if(normalized.includes('alto') || normalized.includes('alta')) return 'alto';
    if(normalized.includes('medio') || normalized.includes('media')) return 'medio';
    if(normalized.includes('bajo') || normalized.includes('baja')) return 'bajo';
    return 'sin-clasificar';
  }

  function projectLabel_uni(row){
    return row.proyecto || row.idns || ('Registro ' + row.id_gc);
  }

  function syncSidebarLabel_uni(){
    const button = document.querySelector('[data-route="' + ROUTE_GESTION_CREDITO_UNI + '"]');
    if(!button) return;
    const icon = button.querySelector('span');
    const label = button.querySelector('b');
    if(icon) icon.textContent = '🛡️';
    if(label) label.textContent = 'Gestión de Crédito';
    button.setAttribute('title','Gestión de Crédito');
  }

  function shell_uni(route){
    const config = MODULES_UNI[route];
    const view = document.getElementById('view-' + route);
    if(!config || !view) return false;
    view.innerHTML = '<div class="cob-uni-shell">' +
      '<section class="cob-uni-head">' +
        '<div><p class="cob-uni-kicker">' + escapeHtml_uni(config.icon) + ' Cobranza United</p>' +
        '<h1>' + escapeHtml_uni(config.title) + '</h1>' +
        '<p class="cob-uni-description">Módulo independiente de United.</p></div>' +
        '<span class="cob-uni-badge">En preparación</span>' +
      '</section>' +
      '<section class="cob-uni-card"><h2>Vista pendiente de integración</h2><p>Esta fase todavía no modifica este módulo.</p></section>' +
    '</div>';
    return true;
  }

  function optionList_uni(values, selected, emptyLabel){
    return '<option value="">' + escapeHtml_uni(emptyLabel) + '</option>' +
      (values || []).map(function(value){
        const text = String(value || '').trim();
        return '<option value="' + escapeHtml_uni(text) + '"' + (text === selected ? ' selected' : '') + '>' + escapeHtml_uni(text) + '</option>';
      }).join('');
  }

  function renderGestionCreditoBase_uni(view){
    view.innerHTML = '<div class="gc-uni-page" data-gc-uni-root>' +
      '<section class="gc-uni-titlebar">' +
        '<div><p class="gc-uni-eyebrow">💰 Cobranza United</p><h1>Gestión de Crédito</h1><p>Control de cartera y riesgo crediticio por proyecto · fuente: Aiven / gestion_credito.</p></div>' +
        '<div class="gc-uni-title-actions"><span class="gc-uni-source"><i></i>Aiven</span><button type="button" class="gc-uni-btn" data-gc-action="refresh">↻ Actualizar</button></div>' +
      '</section>' +
      '<div class="gc-uni-loading"><span class="gc-uni-spinner"></span><b>Consultando Gestión de Crédito...</b></div>' +
    '</div>';
  }

  function filteredRows_uni(){
    const f = state_uni.filters;
    const search = normalize_uni(f.search);
    return state_uni.rows.filter(function(row){
      if(search){
        const haystack = normalize_uni([row.proyecto,row.cliente,row.idns].join(' '));
        if(!haystack.includes(search)) return false;
      }
      if(f.estado && normalize_uni(row.estado) !== normalize_uni(f.estado)) return false;
      if(f.z_oper && normalize_uni(row.z_oper) !== normalize_uni(f.z_oper)) return false;
      if(f.z_adm && normalize_uni(row.z_adm) !== normalize_uni(f.z_adm)) return false;
      // El filtro de riesgo compara el valor real de Aiven normalizado.
      // No fuerza Bajo/Medio/Alto mientras la tabla pueda contener otras clasificaciones.
      if(f.riesgo && normalize_uni(row.nivel_riesgo_credito) !== normalize_uni(f.riesgo)) return false;
      return true;
    });
  }

  function summarize_uni(rows){
    const result = {
      total:rows.length,
      sinCredito:0,
      adeudo:0,
      facturas:0,
      alto:0,
      medio:0,
      bajo:0,
      conAdeudo:0,
      creditoDisponible:0
    };
    rows.forEach(function(row){
      const adeudo = number_uni(row.adeudo);
      const credito = number_uni(row.credito_disponible_venta);
      const risk = riskKey_uni(row.nivel_riesgo_credito);
      result.adeudo += adeudo;
      result.facturas += number_uni(row.facts_adeudadas);
      result.creditoDisponible += credito;
      if(credito <= 0) result.sinCredito += 1;
      if(adeudo > 0) result.conAdeudo += 1;
      if(risk === 'alto') result.alto += 1;
      else if(risk === 'medio') result.medio += 1;
      else if(risk === 'bajo') result.bajo += 1;
    });
    return result;
  }

  function renderKpis_uni(rows){
    const summary = summarize_uni(rows);
    const total = Math.max(summary.total,1);
    return '<section class="gc-uni-kpis" aria-label="Indicadores de Gestión de Crédito">' +
      kpi_uni('💳','Proyectos sin Crédito Disponible',integer_uni(summary.sinCredito),((summary.sinCredito/total)*100).toFixed(1)+'% del filtro','danger') +
      kpi_uni('⚠️','Adeudo Total',money_uni(summary.adeudo),integer_uni(summary.conAdeudo)+' proyectos con adeudo','warning') +
      kpi_uni('🧾','Facturas Adeudadas',integer_uni(summary.facturas),'Registros en cartera','violet') +
      kpi_uni('🚨','Proyectos en Riesgo Alto',integer_uni(summary.alto),((summary.alto/total)*100).toFixed(1)+'% del filtro','danger') +
    '</section>';
  }

  function kpi_uni(icon,title,value,meta,tone){
    return '<article class="gc-uni-kpi gc-tone-' + tone + '"><div class="gc-uni-kpi-icon">' + icon + '</div><div><span>' + escapeHtml_uni(title) + '</span><strong>' + escapeHtml_uni(value) + '</strong><small>' + escapeHtml_uni(meta) + '</small></div></article>';
  }

  function renderFilters_uni(){
    const f = state_uni.filters;
    return '<section class="gc-uni-filters">' +
      '<label class="gc-uni-search"><span>Buscar proyecto o cliente</span><input data-gc-filter="search" type="search" value="' + escapeHtml_uni(f.search) + '" placeholder="Proyecto, cliente o IDNS..."></label>' +
      '<label><span>Estado</span><select data-gc-filter="estado">' + optionList_uni(state_uni.catalogs.estado,f.estado,'Todos') + '</select></label>' +
      '<label><span>Zona Operativa</span><select data-gc-filter="z_oper">' + optionList_uni(state_uni.catalogs.z_oper,f.z_oper,'Todas') + '</select></label>' +
      '<label><span>Zona Administrativa</span><select data-gc-filter="z_adm">' + optionList_uni(state_uni.catalogs.z_adm,f.z_adm,'Todas') + '</select></label>' +
      '<label><span>Nivel de Riesgo</span><select data-gc-filter="riesgo">' + optionList_uni(state_uni.catalogs.nivel_riesgo_credito,f.riesgo,'Todos') + '</select></label>' +
      '<button type="button" class="gc-uni-btn gc-uni-btn-clear" data-gc-action="clear">Limpiar</button>' +
    '</section>';
  }

  function renderCard_uni(row){
    const risk = riskKey_uni(row.nivel_riesgo_credito);
    const riskText = row.nivel_riesgo_credito || 'Sin clasificar';
    return '<article class="gc-uni-project-card" data-risk="' + escapeHtml_uni(risk) + '" data-gc-project-id="' + escapeHtml_uni(row.id_gc) + '" role="button" tabindex="0" aria-label="Abrir detalle de ' + escapeHtml_uni(projectLabel_uni(row)) + '">' +
      '<div class="gc-uni-project-head"><div><strong>' + escapeHtml_uni(projectLabel_uni(row)) + '</strong><span>' + escapeHtml_uni(row.cliente || 'Cliente no registrado') + '</span></div><em class="gc-risk gc-risk-' + escapeHtml_uni(risk) + '">' + escapeHtml_uni(riskText) + '</em></div>' +
      '<div class="gc-uni-project-metrics">' +
        '<div><span>Adeudo</span><b class="' + (number_uni(row.adeudo)>0?'is-debt':'') + '">' + money_uni(row.adeudo) + '</b></div>' +
        '<div><span>Crédito disponible</span><b class="' + (number_uni(row.credito_disponible_venta)<=0?'is-debt':'is-credit') + '">' + money_uni(row.credito_disponible_venta) + '</b></div>' +
        '<div><span>Fact. adeudadas</span><b>' + integer_uni(row.facts_adeudadas) + '</b></div>' +
      '</div><small class="gc-uni-card-open">Ver detalle →</small>' +
    '</article>';
  }

  function riskColumn_uni(key,title,icon,rows){
    const grouped = rows.filter(row => riskKey_uni(row.nivel_riesgo_credito) === key);
    const visible = grouped.slice(0,8);
    return '<section class="gc-uni-risk-column gc-col-' + key + '">' +
      '<header><div><span>' + icon + '</span><b>' + escapeHtml_uni(title) + '</b></div><em>' + integer_uni(grouped.length) + ' proyectos</em></header>' +
      '<div class="gc-uni-risk-list">' + (visible.length ? visible.map(renderCard_uni).join('') : '<div class="gc-uni-empty">Sin proyectos en este nivel.</div>') + '</div>' +
      (grouped.length > visible.length ? '<footer>Mostrando ' + visible.length + ' de ' + grouped.length + '</footer>' : '') +
    '</section>';
  }

  function renderKanban_uni(rows){
    const unknown = rows.filter(row => riskKey_uni(row.nivel_riesgo_credito) === 'sin-clasificar').length;
    return '<section class="gc-uni-section">' +
      '<div class="gc-uni-section-head"><div><h2>Cartera por Nivel de Riesgo</h2><p>Clasificación tomada directamente de <code>nivel_riesgo_credito</code>.</p></div>' +
      (unknown ? '<span class="gc-uni-neutral-note">' + integer_uni(unknown) + ' sin clasificar</span>' : '') + '</div>' +
      '<div class="gc-uni-mobile-tabs" role="tablist">' +
        '<button type="button" class="' + (state_uni.mobileRisk==='alto'?'active':'') + '" data-gc-risk-tab="alto">🔴 Alto</button>' +
        '<button type="button" class="' + (state_uni.mobileRisk==='medio'?'active':'') + '" data-gc-risk-tab="medio">🟡 Medio</button>' +
        '<button type="button" class="' + (state_uni.mobileRisk==='bajo'?'active':'') + '" data-gc-risk-tab="bajo">🟢 Bajo</button>' +
      '</div>' +
      '<div class="gc-uni-kanban" data-mobile-risk="' + escapeHtml_uni(state_uni.mobileRisk) + '">' +
        riskColumn_uni('bajo','Bajo Riesgo','🟢',rows) +
        riskColumn_uni('medio','Riesgo Medio','🟡',rows) +
        riskColumn_uni('alto','Riesgo Alto','🔴',rows) +
      '</div>' +
    '</section>';
  }

  function zoneData_uni(rows){
    const map = new Map();
    rows.forEach(function(row){
      const zone = String(row.z_oper || '').trim() || 'Sin zona';
      const current = map.get(zone) || {zone:zone,adeudo:0,projects:0,debtProjects:0};
      const debt = number_uni(row.adeudo);
      current.projects += 1;
      current.adeudo += debt;
      if(debt > 0) current.debtProjects += 1;
      map.set(zone,current);
    });
    return Array.from(map.values()).sort((a,b)=>b.adeudo-a.adeudo).slice(0,8);
  }

  function renderZoneBars_uni(rows){
    const data = zoneData_uni(rows);
    const max = Math.max.apply(null,data.map(item=>item.adeudo).concat([1]));
    const bars = data.map(function(item){
      const pct = Math.max(2,(item.adeudo/max)*100);
      return '<div class="gc-uni-vbar-item"><div class="gc-uni-vbar-value">' + escapeHtml_uni(moneyCompact_uni(item.adeudo)) + '</div><div class="gc-uni-vbar-track"><i style="height:' + pct.toFixed(2) + '%"></i></div><b>' + escapeHtml_uni(item.zone) + '</b></div>';
    }).join('');
    return '<article class="gc-uni-analytics-card"><header><h3>Distribución de Adeudo por Zona Operativa</h3><p>Suma de <code>adeudo</code> agrupada por <code>z_oper</code>.</p></header><div class="gc-uni-vbars">' + (bars || '<div class="gc-uni-empty">Sin datos para la selección.</div>') + '</div></article>';
  }

  function moneyCompact_uni(value){
    const n = number_uni(value);
    if(Math.abs(n) >= 1000000) return '$' + (n/1000000).toFixed(1) + ' M';
    if(Math.abs(n) >= 1000) return '$' + (n/1000).toFixed(1) + ' K';
    return money_uni(n);
  }

  function riskZoneData_uni(rows){
    const map = new Map();
    rows.forEach(function(row){
      const zone = String(row.z_adm || '').trim() || 'Sin zona';
      const key = riskKey_uni(row.nivel_riesgo_credito);
      const current = map.get(zone) || {zone:zone,bajo:0,medio:0,alto:0,other:0,total:0};
      current.total += 1;
      if(key === 'bajo') current.bajo += 1;
      else if(key === 'medio') current.medio += 1;
      else if(key === 'alto') current.alto += 1;
      else current.other += 1;
      map.set(zone,current);
    });
    return Array.from(map.values()).sort((a,b)=>a.zone.localeCompare(b.zone,'es')).slice(0,8);
  }

  function renderRiskZones_uni(rows){
    const data = riskZoneData_uni(rows);
    const content = data.map(function(item){
      const total = Math.max(item.total,1);
      const low=(item.bajo/total)*100, med=(item.medio/total)*100, high=(item.alto/total)*100, other=(item.other/total)*100;
      return '<div class="gc-uni-riskbar-row"><b>' + escapeHtml_uni(item.zone) + '</b><div class="gc-uni-riskbar"><i class="low" style="width:' + low.toFixed(2) + '%"></i><i class="medium" style="width:' + med.toFixed(2) + '%"></i><i class="high" style="width:' + high.toFixed(2) + '%"></i><i class="other" style="width:' + other.toFixed(2) + '%"></i></div><span>' + item.total + '</span></div>';
    }).join('');
    return '<article class="gc-uni-analytics-card"><header><h3>Concentración de Riesgo por Zona Administrativa</h3><p>Distribución de <code>nivel_riesgo_credito</code> por <code>z_adm</code>.</p></header><div class="gc-uni-riskbars">' + (content || '<div class="gc-uni-empty">Sin datos para la selección.</div>') + '</div><div class="gc-uni-legend"><span><i class="low"></i>Bajo</span><span><i class="medium"></i>Medio</span><span><i class="high"></i>Alto</span><span><i class="other"></i>Sin clasificar</span></div></article>';
  }

  function renderAnalytics_uni(rows){
    return '<section class="gc-uni-analytics">' + renderZoneBars_uni(rows) + renderRiskZones_uni(rows) + '</section>';
  }

  function routeReady_uni(route){
    return Boolean(document.getElementById('view-' + route));
  }

  function detailItem_uni(label,value,formatter){
    const empty = value === null || value === undefined || value === '';
    const display = empty ? '—' : (formatter ? formatter(value) : String(value));
    return '<div class="gc-uni-detail-item"><span>' + escapeHtml_uni(label) + '</span><b>' + escapeHtml_uni(display) + '</b></div>';
  }

  function relationButton_uni(type,label,icon,enabled,reason){
    return '<button type="button" class="gc-uni-relation-btn" data-gc-relation="' + escapeHtml_uni(type) + '"' +
      (enabled ? '' : ' disabled') + (reason ? ' title="' + escapeHtml_uni(reason) + '"' : '') + '>' + icon + ' ' + escapeHtml_uni(label) + '</button>';
  }

  function currentDetailRow_uni(){
    return state_uni.rows.find(function(row){ return Number(row.id_gc) === Number(state_uni.detailId); }) || null;
  }

  function tableCell_uni(value,formatter){
    const empty=value===null||value===undefined||value==='';
    return escapeHtml_uni(empty?'—':(formatter?formatter(value):String(value)));
  }

  function disabledOpenButton_uni(label){
    return '<button type="button" class="gc-uni-relation-btn gc-uni-record-open" disabled title="La navegación al detalle se habilitará en una fase posterior.">↗ '+escapeHtml_uni(label||'Abrir')+'</button>';
  }

  function renderMpRows_uni(rows){
    if(!rows.length) return '<tr><td colspan="17" class="gc-uni-record-empty">No hay registros de Mantenimiento Preventivo relacionados con este proyecto.</td></tr>';
    return rows.map(function(item){
      return '<tr>'+
        '<td>'+tableCell_uni(item.id_dmp)+'</td>'+
        '<td><strong>'+tableCell_uni(item.proyecto)+'</strong></td>'+
        '<td>'+tableCell_uni(item.idns)+'</td>'+
        '<td>'+tableCell_uni(item.cliente)+'</td>'+
        '<td>'+tableCell_uni(item.periodicidad)+'</td>'+
        '<td>'+tableCell_uni(item.momento_facturacion)+'</td>'+
        '<td>'+tableCell_uni(item.estado)+'</td>'+
        '<td>'+tableCell_uni(item.z_oper)+'</td>'+
        '<td>'+tableCell_uni(item.zona_adm)+'</td>'+
        '<td>'+tableCell_uni(item.forma_pago)+'</td>'+
        '<td>'+tableCell_uni(item.iguala,money_uni)+'</td>'+
        '<td>'+tableCell_uni(item.condiciones_pago)+'</td>'+
        '<td>'+tableCell_uni(item.monto_anual,money_uni)+'</td>'+
        '<td>'+tableCell_uni(item.pendiente_corriente,money_uni)+'</td>'+
        '<td>'+tableCell_uni(item.pendiente_vencido,money_uni)+'</td>'+
        '<td>'+tableCell_uni(item.facturas_pendientes,integer_uni)+'</td>'+
        '<td class="gc-uni-relation-table-action">'+disabledOpenButton_uni('Abrir')+'</td>'+
      '</tr>';
    }).join('');
  }

  function renderVaRows_uni(rows){
    if(!rows.length) return '<tr><td colspan="19" class="gc-uni-record-empty">No hay registros de Venta Adicional relacionados con este proyecto.</td></tr>';
    return rows.map(function(item){
      return '<tr>'+
        '<td>'+tableCell_uni(item.id_pc)+'</td>'+
        '<td><strong>'+tableCell_uni(item.proyecto)+'</strong></td>'+
        '<td>'+tableCell_uni(item.cliente)+'</td>'+
        '<td>'+tableCell_uni(item.ov)+'</td>'+
        '<td>'+tableCell_uni(item.fecha_ov,date_uni)+'</td>'+
        '<td>'+tableCell_uni(item.concepto)+'</td>'+
        '<td>'+tableCell_uni(item.precio_venta,money_uni)+'</td>'+
        '<td>'+tableCell_uni(item.venta_total,money_uni)+'</td>'+
        '<td>'+tableCell_uni(item.facturas_pendientes_pago,integer_uni)+'</td>'+
        '<td>'+tableCell_uni(item.adeudo,money_uni)+'</td>'+
        '<td>'+tableCell_uni(item.tipo_pago)+'</td>'+
        '<td>'+tableCell_uni(item.no_factura)+'</td>'+
        '<td>'+tableCell_uni(item.fecha_factura,date_uni)+'</td>'+
        '<td>'+tableCell_uni(item.fecha_vencimiento,date_uni)+'</td>'+
        '<td>'+tableCell_uni(item.dias_vencimiento,integer_uni)+'</td>'+
        '<td>'+tableCell_uni(item.estatus)+'</td>'+
        '<td>'+tableCell_uni(item.estatus_administrativo)+'</td>'+
        '<td>'+tableCell_uni(item.estatus_operativo)+'</td>'+
        '<td class="gc-uni-relation-table-action">'+disabledOpenButton_uni('Abrir')+'</td>'+
      '</tr>';
    }).join('');
  }

  function renderRelatedRecords_uni(){
    if(state_uni.detailLoading){
      return '<section class="gc-uni-related-loading"><span class="gc-uni-loader"></span><div><h2>Cargando relaciones</h2><p>Consultando Mantenimiento Preventivo y Venta Adicional en una sola solicitud.</p></div></section>';
    }
    if(state_uni.detailError){
      return '<section class="gc-uni-related-error"><span>⚠️</span><div><h2>No fue posible cargar las relaciones</h2><p>'+escapeHtml_uni(state_uni.detailError)+'</p><button type="button" class="gc-uni-btn" data-gc-detail-action="relations-refresh">Reintentar</button></div></section>';
    }
    const detail=state_uni.detailCache[String(state_uni.detailId)]||null;
    if(!detail){
      return '<section class="gc-uni-related-loading"><div><h2>Relaciones del proyecto</h2><p>Preparando registros relacionados.</p></div></section>';
    }
    const mp=Array.isArray(detail.mantenimiento_preventivo)?detail.mantenimiento_preventivo:[];
    const va=Array.isArray(detail.venta_adicional)?detail.venta_adicional:[];
    return '<section class="gc-uni-record-section">'+
      '<header class="gc-uni-record-header"><div><p class="gc-uni-record-kicker">🧾 Relación operativa</p><h2>Mantenimiento Preventivo</h2><p>Todos los registros de <code>detalle_mp_2026</code> relacionados con el proyecto actual.</p></div><span>'+escapeHtml_uni(integer_uni(mp.length))+' registro(s)</span></header>'+
      '<div class="gc-uni-table-wrap gc-uni-record-table-wrap"><table class="gc-uni-record-table gc-uni-record-table-mp"><thead><tr>'+
        '<th>ID</th><th>Proyecto</th><th>IDNS</th><th>Cliente</th><th>Periodicidad</th><th>Momento facturación</th><th>Estado</th><th>Z. Operativa</th><th>Z. Administrativa</th><th>Forma pago</th><th>Iguala</th><th>Condiciones pago</th><th>Monto anual</th><th>Pendiente corriente</th><th>Pendiente vencido</th><th>Facturas pendientes</th><th>Acción</th>'+
      '</tr></thead><tbody>'+renderMpRows_uni(mp)+'</tbody></table></div>'+
    '</section>'+
    '<section class="gc-uni-record-section">'+
      '<header class="gc-uni-record-header"><div><p class="gc-uni-record-kicker">➕ Relación comercial</p><h2>Venta Adicional</h2><p>Todos los registros de <code>pc</code> relacionados con el proyecto actual.</p></div><span>'+escapeHtml_uni(integer_uni(va.length))+' registro(s)</span></header>'+
      '<div class="gc-uni-table-wrap gc-uni-record-table-wrap"><table class="gc-uni-record-table gc-uni-record-table-va"><thead><tr>'+
        '<th>ID</th><th>Proyecto</th><th>Cliente</th><th>OV</th><th>Fecha OV</th><th>Concepto</th><th>Precio venta</th><th>Venta total</th><th>Facturas pendientes</th><th>Adeudo</th><th>Tipo pago</th><th>No. Factura</th><th>Fecha factura</th><th>Vencimiento</th><th>Días vencimiento</th><th>Estatus</th><th>Estatus administrativo</th><th>Estatus operativo</th><th>Acción</th>'+
      '</tr></thead><tbody>'+renderVaRows_uni(va)+'</tbody></table></div>'+
    '</section>';
  }

  async function loadDetailRelations_uni(id,force){
    const key=String(id||'');
    if(!key||state_uni.detailLoading) return;
    if(state_uni.detailCache[key]&&!force){ renderDetailContent_uni(); return; }
    state_uni.detailLoading=true;
    state_uni.detailError=null;
    renderDetailContent_uni();
    try{
      const response=await fetch(apiBase_uni()+'/api/cobranza-uni/gestion-credito/'+encodeURIComponent(key)+'/detalle',{
        method:'GET',headers:authHeaders_uni(),cache:'no-store'
      });
      const payload=await response.json().catch(function(){return {};});
      if(!response.ok||!payload.ok) throw new Error(payload.message||('HTTP '+response.status));
      state_uni.detailCache[key]=payload;
      if(payload.gestion_credito){
        const index=state_uni.rows.findIndex(function(item){return Number(item.id_gc)===Number(id);});
        if(index>=0) state_uni.rows[index]=Object.assign({},state_uni.rows[index],payload.gestion_credito);
      }
    }catch(error){
      state_uni.detailError=error.message||'Error de conexión';
    }finally{
      state_uni.detailLoading=false;
      renderDetailContent_uni();
    }
  }

  function renderDetailContent_uni(){
    const root = document.querySelector('[data-gc-uni-root]');
    if(!root) return;
    const row = currentDetailRow_uni();
    if(!row){
      state_uni.detailId = null;
      renderContent_uni();
      return;
    }
    const risk = riskKey_uni(row.nivel_riesgo_credito);
    const projectReady = Boolean(row.proyecto && window.ManttoRouter && typeof window.ManttoRouter.go === 'function');
    const mpReason = 'Navegación a Mantenimiento Preventivo pendiente de habilitar.';
    const vaReason = 'Navegación a Venta Adicional pendiente de habilitar.';

    root.innerHTML = '<section class="gc-uni-titlebar gc-uni-detail-titlebar">' +
      '<div><p class="gc-uni-eyebrow">💰 Cobranza United · Gestión de Crédito</p><div class="gc-uni-detail-heading"><button type="button" class="gc-uni-btn gc-uni-back-main" data-gc-detail-action="back">← Volver</button><div><h1>' + escapeHtml_uni(projectLabel_uni(row)) + '</h1><p>' + escapeHtml_uni(row.cliente || 'Cliente no registrado') + (row.idns ? ' · IDNS ' + escapeHtml_uni(row.idns) : '') + '</p></div></div></div>' +
      '<div class="gc-uni-title-actions"><em class="gc-risk gc-risk-' + escapeHtml_uni(risk) + '">' + escapeHtml_uni(row.nivel_riesgo_credito || 'Sin clasificar') + '</em><button type="button" class="gc-uni-btn" data-gc-detail-action="refresh">↻ Actualizar</button></div>' +
    '</section>' +
    '<section class="gc-uni-relations" aria-label="Relaciones del proyecto">' +
      '<div><span>Relaciones</span><p>Navegación contextual del mismo proyecto.</p></div>' +
      '<div class="gc-uni-relation-actions">' +
        relationButton_uni('proyecto','Ir a Proyecto','🏢',projectReady,projectReady?'':'Proyecto no disponible para navegación.') +
        relationButton_uni('mp','Ir a MP','🧾',false,mpReason) +
        relationButton_uni('venta-adicional','Ir a Venta Adicional','➕',false,vaReason) +
      '</div>' +
    '</section>' +
    '<section class="gc-uni-kpis gc-uni-detail-kpis" aria-label="Indicadores del proyecto">' +
      kpi_uni('💳','Crédito Disponible',money_uni(row.credito_disponible_venta),number_uni(row.credito_disponible_venta)<=0?'Sin crédito disponible':'Disponible para venta','danger') +
      kpi_uni('⚠️','Adeudo',money_uni(row.adeudo),number_uni(row.adeudo)>0?'Proyecto con adeudo':'Sin adeudo','warning') +
      kpi_uni('🧾','Facturas Adeudadas',integer_uni(row.facts_adeudadas),'Facturas pendientes','violet') +
      kpi_uni('🚨','Nivel de Riesgo',row.nivel_riesgo_credito || 'Sin clasificar','Clasificación de gestion_credito',risk==='alto'?'danger':(risk==='medio'?'warning':'violet')) +
    '</section>' +
    '<section class="gc-uni-detail-grid">' +
      '<article class="gc-uni-detail-panel"><header><h2>Detalle del Proyecto</h2><p>Datos del registro seleccionado en <code>gestion_credito</code>.</p></header><div class="gc-uni-detail-items">' +
        detailItem_uni('ID Gestión',row.id_gc) + detailItem_uni('IDNS',row.idns) + detailItem_uni('Proyecto',row.proyecto) + detailItem_uni('Cliente',row.cliente) +
        detailItem_uni('Subsidiaria',row.subsidiaria) + detailItem_uni('Región',row.region) + detailItem_uni('Estado',row.estado) + detailItem_uni('Zona Operativa',row.z_oper) +
        detailItem_uni('Zona Administrativa',row.z_adm) + detailItem_uni('Categoría',row.categoria) + detailItem_uni('Prioridad',row.prioridad) + detailItem_uni('Suministro',row.suministro) +
        detailItem_uni('Anticipo',row.anticipo) + detailItem_uni('No. Equipos',row.recuento_no_equipos,integer_uni) + detailItem_uni('Valor Unitario',row.suma_valor_unitario,money_uni) +
      '</div></article>' +
      '<article class="gc-uni-detail-panel"><header><h2>Cartera Relacionada</h2><p>Resumen MP y Venta Adicional disponible en el mismo registro.</p></header><div class="gc-uni-detail-items">' +
        detailItem_uni('MP 2025',row.mp_2025,integer_uni) + detailItem_uni('Monto MP 2025',row.monto_mp_2025,money_uni) + detailItem_uni('MP 2026',row.mp_2026,integer_uni) + detailItem_uni('Monto MP 2026',row.monto_mp_2026,money_uni) +
        detailItem_uni('Facturas MP',row.facturas_mp,integer_uni) + detailItem_uni('Monto MP Pendiente',row.montp_mp,money_uni) + detailItem_uni('Facturas VA',row.facturas_va,integer_uni) + detailItem_uni('Monto VA',row.monto_va,money_uni) +
        detailItem_uni('Crédito para VA',row.credito_para_va,money_uni) + detailItem_uni('Crédito Disponible Venta',row.credito_disponible_venta,money_uni) + detailItem_uni('Adeudo',row.adeudo,money_uni) + detailItem_uni('Facturas Adeudadas',row.facts_adeudadas,integer_uni) +
      '</div></article>' +
    '</section>' +
    renderRelatedRecords_uni() +
    '<footer class="gc-uni-footer"><span>Detalle base desde snapshot · relaciones cargadas en una sola consulta selectiva</span><span>Última consulta: ' + escapeHtml_uni(formatDateTime_uni(state_uni.generatedAt)) + '</span></footer>';
    bindGestionCredito_uni(root);
  }

  function openDetail_uni(id){
    const exists = state_uni.rows.some(function(row){ return Number(row.id_gc) === Number(id); });
    if(!exists) return;
    state_uni.detailId = Number(id);
    state_uni.detailError = null;
    renderDetailContent_uni();
    loadDetailRelations_uni(state_uni.detailId,false);
  }

  function navigateRelation_uni(type){
    const row = currentDetailRow_uni();
    if(!row || !window.ManttoRouter || typeof window.ManttoRouter.go !== 'function') return;
    if(type === 'proyecto' && row.proyecto){
      window.ManttoRouter.go('proyectos',{proyecto:row.proyecto,idns:row.idns||null,source:'gestion_credito'});
      return;
    }
    if(type === 'mp' && routeReady_uni(ROUTE_MP_UNI)){
      window.ManttoRouter.go(ROUTE_MP_UNI,{id:row.idns||row.proyecto,idns:row.idns||null,proyecto:row.proyecto||null,source:'gestion_credito'});
      return;
    }
    if(type === 'venta-adicional' && routeReady_uni(ROUTE_VENTA_ADICIONAL_UNI)){
      window.ManttoRouter.go(ROUTE_VENTA_ADICIONAL_UNI,{id:row.proyecto||row.idns,proyecto:row.proyecto||null,idns:row.idns||null,source:'gestion_credito'});
    }
  }

  function renderContent_uni(){
    const root = document.querySelector('[data-gc-uni-root]');
    if(!root) return;
    if(state_uni.detailId){ renderDetailContent_uni(); return; }
    const rows = filteredRows_uni();
    root.innerHTML = '<section class="gc-uni-titlebar">' +
      '<div><p class="gc-uni-eyebrow">💰 Cobranza United</p><h1>Gestión de Crédito</h1><p>Control de cartera y riesgo crediticio por proyecto · fuente: Aiven / gestion_credito.</p></div>' +
      '<div class="gc-uni-title-actions"><span class="gc-uni-source"><i></i>Aiven</span><button type="button" class="gc-uni-btn" data-gc-action="refresh">↻ Actualizar</button></div>' +
    '</section>' +
    renderKpis_uni(rows) +
    renderFilters_uni() +
    renderKanban_uni(rows) +
    renderAnalytics_uni(rows) +
    '<footer class="gc-uni-footer"><span>' + integer_uni(rows.length) + ' de ' + integer_uni(state_uni.rows.length) + ' proyectos</span><span>Última consulta: ' + escapeHtml_uni(formatDateTime_uni(state_uni.generatedAt)) + '</span></footer>';
    bindGestionCredito_uni(root);
  }

  function formatDateTime_uni(value){
    if(!value) return '—';
    const date = new Date(value);
    if(Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('es-MX',{dateStyle:'short',timeStyle:'short'});
  }

  function bindGestionCredito_uni(root){
    root.querySelectorAll('[data-gc-project-id]').forEach(function(card){
      const activate = function(){ openDetail_uni(card.getAttribute('data-gc-project-id')); };
      card.addEventListener('click',activate);
      card.addEventListener('keydown',function(event){ if(event.key === 'Enter' || event.key === ' '){ event.preventDefault(); activate(); } });
    });
    root.querySelectorAll('[data-gc-detail-action]').forEach(function(button){
      button.addEventListener('click',function(){
        const action = button.getAttribute('data-gc-detail-action');
        if(action === 'back'){ state_uni.detailId = null; state_uni.detailError=null; renderContent_uni(); }
        if(action === 'refresh' || action === 'relations-refresh') loadDetailRelations_uni(state_uni.detailId,true);
      });
    });
    root.querySelectorAll('[data-gc-relation]').forEach(function(button){
      button.addEventListener('click',function(){ if(!button.disabled) navigateRelation_uni(button.getAttribute('data-gc-relation')); });
    });
    root.querySelectorAll('[data-gc-filter]').forEach(function(control){
      const field = control.getAttribute('data-gc-filter');
      const eventName = control.tagName === 'INPUT' ? 'input' : 'change';
      let timer = null;
      control.addEventListener(eventName,function(){
        const apply = function(){
          state_uni.filters[field] = control.value || '';
          renderContent_uni();
          const fresh = document.querySelector('[data-gc-filter="' + field + '"]');
          if(fresh && field === 'search'){
            fresh.focus();
            fresh.setSelectionRange(fresh.value.length,fresh.value.length);
          }
        };
        if(field === 'search'){
          clearTimeout(timer);
          timer = setTimeout(apply,180);
        }else apply();
      });
    });
    root.querySelectorAll('[data-gc-action]').forEach(function(button){
      button.addEventListener('click',function(){
        const action = button.getAttribute('data-gc-action');
        if(action === 'refresh') loadGestionCredito_uni(true);
        if(action === 'clear'){
          state_uni.filters = {search:'',estado:'',z_oper:'',z_adm:'',riesgo:''};
          renderContent_uni();
        }
      });
    });
    root.querySelectorAll('[data-gc-risk-tab]').forEach(function(button){
      button.addEventListener('click',function(){
        state_uni.mobileRisk = button.getAttribute('data-gc-risk-tab') || 'alto';
        renderContent_uni();
      });
    });
  }

  async function loadGestionCredito_uni(force){
    if(state_uni.loading) return;
    if(state_uni.loaded && !force){
      renderContent_uni();
      return;
    }
    const view = document.getElementById('view-' + ROUTE_GESTION_CREDITO_UNI);
    if(!view) return;
    state_uni.loading = true;
    renderGestionCreditoBase_uni(view);
    try{
      const response = await fetch(apiBase_uni() + '/api/cobranza-uni/gestion-credito',{
        method:'GET',
        headers:authHeaders_uni(),
        cache:'no-store'
      });
      const payload = await response.json().catch(function(){return {};});
      if(!response.ok || !payload.ok) throw new Error(payload.message || ('HTTP ' + response.status));
      state_uni.rows = Array.isArray(payload.rows) ? payload.rows : [];
      state_uni.catalogs = payload.catalogs || {estado:[],z_oper:[],z_adm:[],nivel_riesgo_credito:[]};
      state_uni.generatedAt = payload.generated_at || new Date().toISOString();
      state_uni.loaded = true;
      renderContent_uni();
    }catch(error){
      const root = document.querySelector('[data-gc-uni-root]');
      if(root){
        root.innerHTML = '<section class="gc-uni-error"><span>⚠️</span><div><h2>No fue posible cargar Gestión de Crédito</h2><p>' + escapeHtml_uni(error.message || 'Error de conexión') + '</p><button type="button" class="gc-uni-btn" data-gc-action="refresh">Reintentar</button></div></section>';
        bindGestionCredito_uni(root);
      }
    }finally{
      state_uni.loading = false;
    }
  }

  function init_uni(route){
    syncSidebarLabel_uni();
    if(route === ROUTE_GESTION_CREDITO_UNI){
      loadGestionCredito_uni(false);
      return true;
    }
    return shell_uni(route);
  }

  syncSidebarLabel_uni();
  document.addEventListener('DOMContentLoaded',syncSidebarLabel_uni);

  window.ManttoCobranza_uni = {
    init:init_uni,
    reloadGestionCredito:function(){ return loadGestionCredito_uni(true); }
  };
})();
