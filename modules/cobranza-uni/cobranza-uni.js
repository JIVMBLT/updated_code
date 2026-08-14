(function(){
  'use strict';

  const ROUTE_GESTION_CREDITO_UNI = 'cobranza-uni-estados-cuenta';
  const ROUTE_MP_UNI = 'cobranza-uni-mp-pro';
  const ROUTE_VENTA_ADICIONAL_UNI = 'cobranza-uni-venta-adicional';
  const MODULES_UNI = Object.freeze({
    'cobranza-uni-dashboard':{title:'Dashboard Cobranza',icon:'📊'},
    'cobranza-uni-estados-cuenta':{title:'Gestión de Crédito',icon:'🛡️'},
    'cobranza-uni-aditivas':{title:'Venta Adicional',icon:'➕'},
    'cobranza-uni-mp-pro':{title:'Mantenimiento Preventivo',icon:'🛠️'}
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
    detailError:null,
    relatedTables:{
      mp:{search:'',estado:'',periodicidad:'',page:1,pageSize:30},
      va:{search:'',estatus:'',page:1,pageSize:30}
    }
  };

  const mpState_uni = {
    loaded:false,
    loading:false,
    rows:[],
    catalogs:{estado:[],periodicidad:[],momento_facturacion:[],z_oper:[],zona_adm:[],forma_pago:[]},
    kpis:{},
    generatedAt:null,
    filters:{search:'',estado:'',periodicidad:'',momento_facturacion:'',z_oper:'',zona_adm:'',forma_pago:''},
    page:1,
    pageSize:30,
    detailId:null,
    detailCache:{},
    detailLoading:false,
    detailError:null,
    detailTables:{
      mp:{search:'',estado:'',periodicidad:'',page:1,pageSize:30},
      va:{search:'',estatus:'',page:1,pageSize:30}
    }
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

  function projectName_uni(value){
    return window.ManttoFormat&&typeof window.ManttoFormat.projectName==='function' ? window.ManttoFormat.projectName(value) : String(value||'—');
  }

  function projectLabel_uni(row){
    return row.proyecto ? projectName_uni(row.proyecto) : (row.idns || ('Registro ' + row.id_gc));
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

  function relationFilteredRows_uni(kind, rows, tableState){
    const needle=normalize_uni(tableState.search);
    return rows.filter(function(row){
      if(needle && !normalize_uni(Object.keys(row||{}).map(function(key){ return row[key]; }).join(' ')).includes(needle)) return false;
      if(kind==='mp' && tableState.estado && normalize_uni(row.estado)!==normalize_uni(tableState.estado)) return false;
      if(kind==='mp' && tableState.periodicidad && normalize_uni(row.periodicidad)!==normalize_uni(tableState.periodicidad)) return false;
      if(kind==='va' && tableState.estatus && normalize_uni(row.estatus)!==normalize_uni(tableState.estatus)) return false;
      return true;
    });
  }

  function relationPagination_uni(kind, rows, tableState, scope){
    const filtered=relationFilteredRows_uni(kind,rows,tableState);
    const pages=Math.max(1,Math.ceil(filtered.length/tableState.pageSize));
    if(tableState.page>pages) tableState.page=pages;
    const start=(tableState.page-1)*tableState.pageSize;
    const visible=filtered.slice(start,start+tableState.pageSize);
    const buttons=[];
    const from=Math.max(1,tableState.page-2),to=Math.min(pages,tableState.page+2);
    for(let page=from;page<=to;page+=1){
      buttons.push('<button type="button" data-rel-page="'+page+'" data-rel-kind="'+kind+'" data-rel-scope="'+scope+'" class="'+(page===tableState.page?'active':'')+'">'+page+'</button>');
    }
    const pagination=pages>1?'<div class="gc-uni-record-pagination"><button type="button" data-rel-page="'+Math.max(1,tableState.page-1)+'" data-rel-kind="'+kind+'" data-rel-scope="'+scope+'"'+(tableState.page===1?' disabled':'')+'>‹ Anterior</button>'+buttons.join('')+'<button type="button" data-rel-page="'+Math.min(pages,tableState.page+1)+'" data-rel-kind="'+kind+'" data-rel-scope="'+scope+'"'+(tableState.page===pages?' disabled':'')+'>Siguiente ›</button></div>':'';
    return {filtered:filtered,visible:visible,start:start,pagination:pagination};
  }

  function renderMpRows_uni(rows){
    if(!rows.length) return '<tr><td colspan="17" class="gc-uni-record-empty">No hay registros de Mantenimiento Preventivo relacionados con este proyecto.</td></tr>';
    return rows.map(function(item){
      return '<tr>'+
        '<td>'+tableCell_uni(item.id_dmp)+'</td>'+
        '<td><strong>'+tableCell_uni(projectName_uni(item.proyecto))+'</strong></td>'+
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
        '<td class="gc-uni-relation-table-action"><button type="button" class="gc-uni-relation-btn gc-uni-record-open" data-open-mp-id="'+escapeHtml_uni(item.id_dmp)+'">↗ Abrir</button></td>'+
      '</tr>';
    }).join('');
  }

  function renderVaRows_uni(rows){
    if(!rows.length) return '<tr><td colspan="19" class="gc-uni-record-empty">No hay registros de Venta Adicional relacionados con este proyecto.</td></tr>';
    return rows.map(function(item){
      return '<tr>'+
        '<td>'+tableCell_uni(item.id_pc)+'</td>'+
        '<td><strong>'+tableCell_uni(projectName_uni(item.proyecto))+'</strong></td>'+
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

  function uniqueValues_uni(rows,field){
    return Array.from(new Set((rows||[]).map(function(row){ return String(row&&row[field]||'').trim(); }).filter(Boolean))).sort(function(a,b){ return a.localeCompare(b,'es',{sensitivity:'base'}); });
  }

  function renderRelatedTable_uni(kind,title,kicker,description,rows,tableState,scope){
    const pageData=relationPagination_uni(kind,rows,tableState,scope);
    const isMp=kind==='mp';
    const headers=isMp
      ? '<th>ID</th><th>Proyecto</th><th>IDNS</th><th>Cliente</th><th>Periodicidad</th><th>Momento facturación</th><th>Estado</th><th>Z. Operativa</th><th>Z. Administrativa</th><th>Forma pago</th><th>Iguala</th><th>Condiciones pago</th><th>Monto anual</th><th>Pendiente corriente</th><th>Pendiente vencido</th><th>Facturas pendientes</th><th>Acción</th>'
      : '<th>ID</th><th>Proyecto</th><th>Cliente</th><th>OV</th><th>Fecha OV</th><th>Concepto</th><th>Precio venta</th><th>Venta total</th><th>Facturas pendientes</th><th>Adeudo</th><th>Tipo pago</th><th>No. Factura</th><th>Fecha factura</th><th>Vencimiento</th><th>Días vencimiento</th><th>Estatus</th><th>Estatus administrativo</th><th>Estatus operativo</th><th>Acción</th>';
    const body=isMp?renderMpRows_uni(pageData.visible):renderVaRows_uni(pageData.visible);
    return '<section class="gc-uni-record-section">'+
      '<header class="gc-uni-record-header"><div><p class="gc-uni-record-kicker">'+kicker+'</p><h2>'+escapeHtml_uni(title)+'</h2><p>'+description+'</p></div><span>'+escapeHtml_uni(integer_uni(pageData.filtered.length))+' registro(s)</span></header>'+
      '<div class="gc-uni-record-tools"><label class="gc-uni-record-search"><span>Buscar en tabla</span><input type="search" data-rel-search="'+kind+'" data-rel-scope="'+scope+'" value="'+escapeHtml_uni(tableState.search)+'" placeholder="Buscar en los registros..."></label>'+      (isMp?'<label><span>Estado</span><select data-rel-filter="estado" data-rel-kind="'+kind+'" data-rel-scope="'+scope+'">'+optionList_uni(uniqueValues_uni(rows,'estado'),tableState.estado,'Todos')+'</select></label><label><span>Periodicidad</span><select data-rel-filter="periodicidad" data-rel-kind="'+kind+'" data-rel-scope="'+scope+'">'+optionList_uni(uniqueValues_uni(rows,'periodicidad'),tableState.periodicidad,'Todas')+'</select></label>':'<label><span>Estatus</span><select data-rel-filter="estatus" data-rel-kind="'+kind+'" data-rel-scope="'+scope+'">'+optionList_uni(uniqueValues_uni(rows,'estatus'),tableState.estatus,'Todos')+'</select></label>')+      '<b>30 por página</b></div>'+
      '<div class="gc-uni-table-wrap gc-uni-record-table-wrap"><table class="gc-uni-record-table '+(isMp?'gc-uni-record-table-mp':'gc-uni-record-table-va')+'"><thead><tr>'+headers+'</tr></thead><tbody>'+body+'</tbody></table></div>'+
      '<div class="gc-uni-record-footer"><span>Mostrando '+(pageData.filtered.length?integer_uni(pageData.start+1):'0')+'–'+integer_uni(Math.min(pageData.start+pageData.visible.length,pageData.filtered.length))+' de '+integer_uni(pageData.filtered.length)+'</span>'+pageData.pagination+'</div>'+
    '</section>';
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
    return renderRelatedTable_uni('mp','Mantenimiento Preventivo','🧾 Relación operativa','Todos los registros de <code>detalle_mp_2026</code> relacionados con el proyecto actual.',mp,state_uni.relatedTables.mp,'gc')+
      renderRelatedTable_uni('va','Venta Adicional','➕ Relación comercial','Todos los registros de <code>pc</code> relacionados con el proyecto actual.',va,state_uni.relatedTables.va,'gc');
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
    const detailCurrent = state_uni.detailCache[String(state_uni.detailId)] || null;
    const relatedMp = detailCurrent && Array.isArray(detailCurrent.mantenimiento_preventivo) ? detailCurrent.mantenimiento_preventivo : [];
    const firstMp = relatedMp.find(function(item){ return Number(item&&item.id_dmp)>0; }) || null;
    const mpReady = Boolean(firstMp && routeReady_uni(ROUTE_MP_UNI));
    const mpReason = relatedMp.length ? 'No fue posible resolver el detalle de Mantenimiento Preventivo.' : 'Este proyecto no tiene Mantenimiento Preventivo relacionado.';
    const vaReason = 'Navegación a Venta Adicional pendiente de habilitar.';

    root.innerHTML = '<section class="gc-uni-titlebar gc-uni-detail-titlebar">' +
      '<div><p class="gc-uni-eyebrow">💰 Cobranza United · Gestión de Crédito</p><div class="gc-uni-detail-heading"><button type="button" class="gc-uni-btn gc-uni-back-main" data-gc-detail-action="back">← Volver</button><div><h1>' + escapeHtml_uni(projectLabel_uni(row)) + '</h1><p>' + escapeHtml_uni(row.cliente || 'Cliente no registrado') + (row.idns ? ' · IDNS ' + escapeHtml_uni(row.idns) : '') + '</p></div></div></div>' +
      '<div class="gc-uni-title-actions"><em class="gc-risk gc-risk-' + escapeHtml_uni(risk) + '">' + escapeHtml_uni(row.nivel_riesgo_credito || 'Sin clasificar') + '</em><button type="button" class="gc-uni-btn" data-gc-detail-action="refresh">↻ Actualizar</button></div>' +
    '</section>' +
    '<section class="gc-uni-relations" aria-label="Relaciones del proyecto">' +
      '<div><span>Relaciones</span><p>Navegación contextual del mismo proyecto.</p></div>' +
      '<div class="gc-uni-relation-actions">' +
        relationButton_uni('proyecto','Ir a Proyecto','🏢',projectReady,projectReady?'':'Proyecto no disponible para navegación.') +
        relationButton_uni('mp','Ir a MP','🧾',mpReady,mpReady?'':mpReason) +
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
        detailItem_uni('ID Gestión',row.id_gc) + detailItem_uni('IDNS',row.idns) + detailItem_uni('Proyecto',projectName_uni(row.proyecto)) + detailItem_uni('Cliente',row.cliente) +
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
    state_uni.relatedTables={mp:{search:'',estado:'',periodicidad:'',page:1,pageSize:30},va:{search:'',estatus:'',page:1,pageSize:30}};
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
      const detail=state_uni.detailCache[String(state_uni.detailId)]||null;
      const list=detail&&Array.isArray(detail.mantenimiento_preventivo)?detail.mantenimiento_preventivo:[];
      const target=list.find(function(item){ return Number(item&&item.id_dmp)>0; });
      if(!target) return;
      const exists=mpState_uni.rows.some(function(item){ return Number(item.id_dmp)===Number(target.id_dmp); });
      if(!exists) mpState_uni.rows.push(Object.assign({},target));
      mpState_uni.detailId=Number(target.id_dmp);
      mpState_uni.detailError=null;
      mpState_uni.detailTables={mp:{search:'',estado:'',periodicidad:'',page:1,pageSize:30},va:{search:'',estatus:'',page:1,pageSize:30}};
      window.ManttoRouter.go(ROUTE_MP_UNI,{id:String(target.id_dmp),id_dmp:Number(target.id_dmp),idns:target.idns||row.idns||null,proyecto:row.proyecto||null,source:'gestion_credito'});
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
    root.querySelectorAll('[data-rel-search][data-rel-scope="gc"]').forEach(function(control){
      const kind=control.getAttribute('data-rel-search');
      let timer=null;
      control.addEventListener('input',function(){
        clearTimeout(timer);
        timer=setTimeout(function(){
          if(!state_uni.relatedTables[kind]) return;
          state_uni.relatedTables[kind].search=control.value||'';
          state_uni.relatedTables[kind].page=1;
          renderDetailContent_uni();
          const fresh=document.querySelector('[data-rel-search="'+kind+'"][data-rel-scope="gc"]');
          if(fresh){ fresh.focus(); fresh.setSelectionRange(fresh.value.length,fresh.value.length); }
        },180);
      });
    });
    root.querySelectorAll('[data-rel-filter][data-rel-scope="gc"]').forEach(function(control){
      control.addEventListener('change',function(){
        const kind=control.getAttribute('data-rel-kind');
        const field=control.getAttribute('data-rel-filter');
        if(!state_uni.relatedTables[kind]) return;
        state_uni.relatedTables[kind][field]=control.value||'';
        state_uni.relatedTables[kind].page=1;
        renderDetailContent_uni();
      });
    });
    root.querySelectorAll('[data-rel-page][data-rel-scope="gc"]').forEach(function(button){
      button.addEventListener('click',function(){
        const kind=button.getAttribute('data-rel-kind');
        if(!state_uni.relatedTables[kind]) return;
        state_uni.relatedTables[kind].page=Number(button.getAttribute('data-rel-page'))||1;
        renderDetailContent_uni();
      });
    });
    root.querySelectorAll('[data-open-mp-id]').forEach(function(button){
      button.addEventListener('click',function(){
        const id=Number(button.getAttribute('data-open-mp-id'));
        if(!id) return;
        mpState_uni.detailId=id;
        mpState_uni.detailError=null;
        if(window.ManttoRouter&&typeof window.ManttoRouter.go==='function') window.ManttoRouter.go(ROUTE_MP_UNI);
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

  function mpFilteredRows_uni(){
    const f = mpState_uni.filters;
    const search = normalize_uni(f.search);
    return mpState_uni.rows.filter(function(row){
      if(search){
        const haystack = normalize_uni([row.proyecto,row.idns,row.cliente,row.condiciones_pago].join(' '));
        if(!haystack.includes(search)) return false;
      }
      if(f.estado && normalize_uni(row.estado) !== normalize_uni(f.estado)) return false;
      if(f.periodicidad && normalize_uni(row.periodicidad) !== normalize_uni(f.periodicidad)) return false;
      if(f.momento_facturacion && normalize_uni(row.momento_facturacion) !== normalize_uni(f.momento_facturacion)) return false;
      if(f.z_oper && normalize_uni(row.z_oper) !== normalize_uni(f.z_oper)) return false;
      if(f.zona_adm && normalize_uni(row.zona_adm) !== normalize_uni(f.zona_adm)) return false;
      if(f.forma_pago && normalize_uni(row.forma_pago) !== normalize_uni(f.forma_pago)) return false;
      return true;
    });
  }

  function mpKpi_uni(icon,title,value,meta,tone){
    return '<article class="mp-uni-kpi mp-tone-' + tone + '"><div class="mp-uni-kpi-icon">' + icon + '</div><div><span>' + escapeHtml_uni(title) + '</span><strong>' + escapeHtml_uni(value) + '</strong><small>' + escapeHtml_uni(meta) + '</small></div></article>';
  }

  function renderMpKpis_uni(rows){
    let monto=0,corriente=0,vencido=0,pendiente=0,facturas=0,conPendiente=0;
    rows.forEach(function(row){
      monto += number_uni(row.monto_anual);
      corriente += number_uni(row.pendiente_corriente);
      vencido += number_uni(row.pendiente_vencido);
      pendiente += number_uni(row.pendiente);
      facturas += number_uni(row.facturas_pendientes);
      if(number_uni(row.pendiente)>0 || number_uni(row.facturas_pendientes)>0) conPendiente += 1;
    });
    return '<section class="mp-uni-kpis" aria-label="Indicadores de Mantenimiento Preventivo">' +
      mpKpi_uni('📋','Total registros',integer_uni(rows.length),'Registros del filtro','blue') +
      mpKpi_uni('🧾','Con pendiente',integer_uni(conPendiente),'Con saldo o facturas pendientes','warning') +
      mpKpi_uni('📈','Monto anual',money_uni(monto),'Monto anual del filtro','violet') +
      mpKpi_uni('🟦','Pendiente corriente',money_uni(corriente),'Saldo corriente','blue') +
      mpKpi_uni('🔴','Pendiente vencido',money_uni(vencido),'Saldo vencido','danger') +
      mpKpi_uni('📄','Facturas pendientes',integer_uni(facturas),'Facturas del filtro','warning') +
    '</section>';
  }

  function renderMpFilters_uni(){
    const f=mpState_uni.filters;
    return '<section class="mp-uni-filter-card"><div class="mp-uni-filter-head"><div><h2>Filtros de búsqueda</h2><p>Filtra la tabla sin generar nuevas consultas a Aiven.</p></div><button type="button" class="mp-uni-btn mp-uni-btn-light" data-mp-action="clear">Limpiar filtros</button></div><div class="mp-uni-filters">' +
      '<label class="mp-uni-search"><span>Proyecto, cliente o IDNS</span><input type="search" data-mp-filter="search" value="' + escapeHtml_uni(f.search) + '" placeholder="Buscar..."></label>' +
      '<label><span>Estado</span><select data-mp-filter="estado">' + optionList_uni(mpState_uni.catalogs.estado,f.estado,'Todos') + '</select></label>' +
      '<label><span>Periodicidad</span><select data-mp-filter="periodicidad">' + optionList_uni(mpState_uni.catalogs.periodicidad,f.periodicidad,'Todas') + '</select></label>' +
      '<label><span>Momento facturación</span><select data-mp-filter="momento_facturacion">' + optionList_uni(mpState_uni.catalogs.momento_facturacion,f.momento_facturacion,'Todos') + '</select></label>' +
      '<label><span>Zona Operativa</span><select data-mp-filter="z_oper">' + optionList_uni(mpState_uni.catalogs.z_oper,f.z_oper,'Todas') + '</select></label>' +
      '<label><span>Zona Administrativa</span><select data-mp-filter="zona_adm">' + optionList_uni(mpState_uni.catalogs.zona_adm,f.zona_adm,'Todas') + '</select></label>' +
      '<label><span>Forma de pago</span><select data-mp-filter="forma_pago">' + optionList_uni(mpState_uni.catalogs.forma_pago,f.forma_pago,'Todas') + '</select></label>' +
    '</div></section>';
  }

  function renderMpTable_uni(rows){
    const pages=Math.max(1,Math.ceil(rows.length/mpState_uni.pageSize));
    if(mpState_uni.page>pages) mpState_uni.page=pages;
    const start=(mpState_uni.page-1)*mpState_uni.pageSize;
    const visible=rows.slice(start,start+mpState_uni.pageSize);
    const body=visible.length ? visible.map(function(row){
      return '<tr class="mp-uni-row-open" data-mp-detail-id="' + escapeHtml_uni(row.id_dmp) + '" tabindex="0" role="button" aria-label="Abrir detalle de Mantenimiento Preventivo">' +
        '<td><strong>' + escapeHtml_uni(projectName_uni(row.proyecto)) + '</strong></td>' +
        '<td>' + escapeHtml_uni(row.idns || '—') + '</td>' +
        '<td>' + escapeHtml_uni(row.cliente || '—') + '</td>' +
        '<td>' + escapeHtml_uni(row.periodicidad || '—') + '</td>' +
        '<td>' + escapeHtml_uni(row.momento_facturacion || '—') + '</td>' +
        '<td><span class="mp-uni-status">' + escapeHtml_uni(row.estado || '—') + '</span></td>' +
        '<td>' + escapeHtml_uni(row.z_oper || '—') + '</td>' +
        '<td>' + escapeHtml_uni(row.zona_adm || '—') + '</td>' +
        '<td>' + escapeHtml_uni(row.forma_pago || '—') + '</td>' +
        '<td class="mp-uni-num">' + money_uni(row.iguala) + '</td>' +
        '<td>' + escapeHtml_uni(row.condiciones_pago || '—') + '</td>' +
        '<td class="mp-uni-num"><strong>' + money_uni(row.monto_anual) + '</strong></td>' +
        '<td class="mp-uni-num">' + money_uni(row.pendiente_corriente) + '</td>' +
        '<td class="mp-uni-num ' + (number_uni(row.pendiente_vencido)>0?'is-overdue':'') + '">' + money_uni(row.pendiente_vencido) + '</td>' +
        '<td class="mp-uni-num ' + (number_uni(row.pendiente)>0?'is-pending':'') + '">' + money_uni(row.pendiente) + '</td>' +
        '<td class="mp-uni-center">' + integer_uni(row.facturas_pendientes) + '</td>' +
      '</tr>';
    }).join('') : '<tr><td colspan="16" class="mp-uni-empty">No hay registros para los filtros seleccionados.</td></tr>';

    let pagination='';
    if(pages>1){
      const buttons=[];
      const from=Math.max(1,mpState_uni.page-2), to=Math.min(pages,mpState_uni.page+2);
      for(let i=from;i<=to;i+=1) buttons.push('<button type="button" data-mp-page="' + i + '" class="' + (i===mpState_uni.page?'active':'') + '">' + i + '</button>');
      pagination='<div class="mp-uni-pagination"><button type="button" data-mp-page="' + Math.max(1,mpState_uni.page-1) + '"' + (mpState_uni.page===1?' disabled':'') + '>‹ Anterior</button>' + buttons.join('') + '<button type="button" data-mp-page="' + Math.min(pages,mpState_uni.page+1) + '"' + (mpState_uni.page===pages?' disabled':'') + '>Siguiente ›</button></div>';
    }

    return '<section class="mp-uni-table-card"><div class="mp-uni-table-head"><div><h2>Registros de Mantenimiento Preventivo 2026</h2><p>Fuente Aiven · tabla <code>detalle_mp_2026</code>.</p></div><span>' + integer_uni(rows.length) + ' registros</span></div>' +
      '<div class="mp-uni-table-wrap"><table class="mp-uni-table"><thead><tr>' +
      '<th>Proyecto</th><th>IDNS</th><th>Cliente</th><th>Periodicidad</th><th>Momento facturación</th><th>Estado</th><th>Zona Operativa</th><th>Zona Administrativa</th><th>Forma pago</th><th>Iguala</th><th>Condiciones pago</th><th>Monto anual</th><th>Pendiente corriente</th><th>Pendiente vencido</th><th>Pendiente total</th><th>Facturas pendientes</th>' +
      '</tr></thead><tbody>' + body + '</tbody></table></div>' +
      '<div class="mp-uni-table-footer"><span>Mostrando ' + (rows.length ? integer_uni(start+1) : '0') + '–' + integer_uni(Math.min(start+visible.length,rows.length)) + ' de ' + integer_uni(rows.length) + '</span><b>30 por página</b>' + pagination + '</div></section>';
  }

  function renderMpMain_uni(){
    const root=document.querySelector('[data-mp-uni-root]');
    if(!root) return;
    const rows=mpFilteredRows_uni();
    if(mpState_uni.detailId){ renderMpDetail_uni(); return; }
    root.innerHTML='<section class="mp-uni-titlebar"><div><p class="mp-uni-eyebrow">🛠️ Cobranza United</p><h1>Mantenimiento Preventivo 2026</h1><p>Administración y control del mantenimiento preventivo por proyecto.</p></div><div class="mp-uni-title-actions"><span class="mp-uni-source"><i></i>Aiven</span><button type="button" class="mp-uni-btn" data-mp-action="refresh">↻ Actualizar</button></div></section>' + renderMpKpis_uni(rows) + renderMpFilters_uni() + renderMpTable_uni(rows) + '<footer class="mp-uni-footer"><span>Vista MAIN · 30 registros por página</span><span>Última consulta: ' + escapeHtml_uni(formatDateTime_uni(mpState_uni.generatedAt)) + '</span></footer>';
    bindMpMain_uni(root);
  }

  function renderMpBase_uni(view){
    view.innerHTML='<div class="mp-uni-page" data-mp-uni-root><section class="mp-uni-titlebar"><div><p class="mp-uni-eyebrow">🛠️ Cobranza United</p><h1>Mantenimiento Preventivo 2026</h1><p>Administración y control del mantenimiento preventivo por proyecto.</p></div></section><div class="mp-uni-loading"><span class="gc-uni-spinner"></span><b>Consultando detalle_mp_2026...</b></div></div>';
  }

  function bindMpMain_uni(root){
    root.querySelectorAll('[data-mp-filter]').forEach(function(control){
      const field=control.getAttribute('data-mp-filter');
      const eventName=control.tagName==='INPUT'?'input':'change';
      let timer=null;
      control.addEventListener(eventName,function(){
        const apply=function(){
          mpState_uni.filters[field]=control.value||'';
          mpState_uni.page=1;
          renderMpMain_uni();
          if(field==='search'){
            const fresh=document.querySelector('[data-mp-filter="search"]');
            if(fresh){ fresh.focus(); fresh.setSelectionRange(fresh.value.length,fresh.value.length); }
          }
        };
        if(field==='search'){ clearTimeout(timer); timer=setTimeout(apply,180); } else apply();
      });
    });
    root.querySelectorAll('[data-mp-action]').forEach(function(button){
      button.addEventListener('click',function(){
        const action=button.getAttribute('data-mp-action');
        if(action==='refresh') loadMpMain_uni(true);
        if(action==='clear'){
          mpState_uni.filters={search:'',estado:'',periodicidad:'',momento_facturacion:'',z_oper:'',zona_adm:'',forma_pago:''};
          mpState_uni.page=1;
          renderMpMain_uni();
        }
      });
    });
    root.querySelectorAll('[data-mp-page]').forEach(function(button){
      button.addEventListener('click',function(){ mpState_uni.page=Number(button.getAttribute('data-mp-page'))||1; renderMpMain_uni(); });
    });
    root.querySelectorAll('[data-mp-detail-id]').forEach(function(row){
      const activate=function(){ openMpDetail_uni(row.getAttribute('data-mp-detail-id')); };
      row.addEventListener('click',activate);
      row.addEventListener('keydown',function(event){ if(event.key==='Enter'||event.key===' '){ event.preventDefault(); activate(); } });
    });
  }

  function mpCurrentDetail_uni(){
    return mpState_uni.rows.find(function(row){ return Number(row.id_dmp)===Number(mpState_uni.detailId); })||null;
  }

  function mpDetailKpis_uni(row){
    return '<section class="mp-uni-detail-kpis">'+
      mpKpi_uni('📈','Monto anual',money_uni(row.monto_anual),'Monto anual contratado','violet')+
      mpKpi_uni('🟦','Pendiente corriente',money_uni(row.pendiente_corriente),'Saldo corriente','blue')+
      mpKpi_uni('🔴','Pendiente vencido',money_uni(row.pendiente_vencido),'Saldo vencido','danger')+
      mpKpi_uni('💰','Pendiente total',money_uni(row.pendiente),'Saldo total','warning')+
      mpKpi_uni('📄','Facturas pendientes',integer_uni(row.facturas_pendientes),'Facturas pendientes','warning')+
    '</section>';
  }

  function renderMpCreditSummary_uni(detail){
    const gc=detail&&detail.gestion_credito?detail.gestion_credito:null;
    if(!gc) return '<section class="mp-uni-detail-panel"><header><div><p class="mp-uni-detail-kicker">🛡️ Relación</p><h2>Gestión de Crédito</h2></div></header><div class="mp-uni-detail-empty">No existe registro relacionado en Gestión de Crédito para este proyecto.</div></section>';
    return '<section class="mp-uni-detail-panel"><header><div><p class="mp-uni-detail-kicker">🛡️ Relación</p><h2>Gestión de Crédito</h2></div></header><div class="mp-uni-detail-grid-items">'+
      detailItem_uni('Nivel de riesgo',gc.nivel_riesgo_credito)+detailItem_uni('Adeudo',gc.adeudo,money_uni)+detailItem_uni('Facturas adeudadas',gc.facts_adeudadas,integer_uni)+detailItem_uni('Crédito disponible',gc.credito_disponible_venta,money_uni)+detailItem_uni('Crédito para VA',gc.credito_para_va,money_uni)+detailItem_uni('Prioridad',gc.prioridad)+
    '</div></section>';
  }

  function renderMpDetailTables_uni(detail){
    const mp=detail&&Array.isArray(detail.mantenimiento_preventivo)?detail.mantenimiento_preventivo:[];
    const va=detail&&Array.isArray(detail.venta_adicional)?detail.venta_adicional:[];
    return renderRelatedTable_uni('mp','Mantenimientos del Proyecto','🛠️ Mantenimiento Preventivo','Registros de <code>detalle_mp_2026</code> vinculados mediante <code>id_proyecto_cobranza</code>.',mp,mpState_uni.detailTables.mp,'mp')+
      renderRelatedTable_uni('va','Venta Adicional','➕ Relación comercial','Registros de <code>pc</code> vinculados al mismo proyecto.',va,mpState_uni.detailTables.va,'mp');
  }

  function renderMpDetail_uni(){
    const root=document.querySelector('[data-mp-uni-root]');
    if(!root) return;
    const row=mpCurrentDetail_uni();
    if(!row){ mpState_uni.detailId=null; renderMpMain_uni(); return; }
    const detail=mpState_uni.detailCache[String(mpState_uni.detailId)]||null;
    root.innerHTML='<section class="mp-uni-detail-head">'+
      '<div><button type="button" class="mp-uni-back" data-mp-detail-action="back">← Volver a Mantenimiento Preventivo</button><p class="mp-uni-eyebrow">🛠️ Cobranza United · Detalle</p><h1>'+escapeHtml_uni(row.proyecto?projectName_uni(row.proyecto):('MP '+row.id_dmp))+'</h1><p>'+escapeHtml_uni(row.cliente||'—')+' · '+escapeHtml_uni(row.idns||'Sin IDNS')+'</p></div>'+
      '<div class="mp-uni-title-actions"><span class="mp-uni-source"><i></i>Aiven</span><button type="button" class="mp-uni-btn" data-mp-detail-action="refresh">↻ Actualizar detalle</button></div></section>'+
      '<section class="mp-uni-detail-panel mp-uni-detail-info"><header><div><p class="mp-uni-detail-kicker">📋 Información</p><h2>Información del Mantenimiento Preventivo</h2></div><span>ID '+escapeHtml_uni(row.id_dmp)+'</span></header><div class="mp-uni-detail-grid-items">'+
        detailItem_uni('Proyecto',projectName_uni(row.proyecto))+detailItem_uni('IDNS',row.idns)+detailItem_uni('Cliente',row.cliente)+detailItem_uni('Periodicidad',row.periodicidad)+detailItem_uni('Momento de facturación',row.momento_facturacion)+detailItem_uni('Estado',row.estado)+detailItem_uni('Zona Operativa',row.z_oper)+detailItem_uni('Zona Administrativa',row.zona_adm)+detailItem_uni('Forma de pago',row.forma_pago)+detailItem_uni('Iguala',row.iguala,money_uni)+detailItem_uni('Condiciones de pago',row.condiciones_pago)+detailItem_uni('ID Proyecto Cobranza',row.id_proyecto_cobranza)+
      '</div></section>'+mpDetailKpis_uni(row)+
      (mpState_uni.detailLoading?'<section class="gc-uni-related-loading"><span class="gc-uni-loader"></span><div><h2>Cargando relaciones</h2><p>Consultando información relacionada del proyecto.</p></div></section>':(mpState_uni.detailError?'<section class="gc-uni-related-error"><span>⚠️</span><div><h2>No fue posible cargar el detalle</h2><p>'+escapeHtml_uni(mpState_uni.detailError)+'</p><button type="button" class="mp-uni-btn" data-mp-detail-action="refresh">Reintentar</button></div></section>':(detail?renderMpCreditSummary_uni(detail)+renderMpDetailTables_uni(detail):'')))+
      '<footer class="mp-uni-footer"><span>Detalle por proyecto · tablas de 30 registros por página</span><span>Última consulta: '+escapeHtml_uni(formatDateTime_uni(detail&&detail.generated_at?detail.generated_at:mpState_uni.generatedAt))+'</span></footer>';
    bindMpDetail_uni(root);
  }

  function bindMpDetail_uni(root){
    root.querySelectorAll('[data-mp-detail-action]').forEach(function(button){
      button.addEventListener('click',function(){
        const action=button.getAttribute('data-mp-detail-action');
        if(action==='back'){ mpState_uni.detailId=null; mpState_uni.detailError=null; renderMpMain_uni(); }
        if(action==='refresh') loadMpDetail_uni(mpState_uni.detailId,true);
      });
    });
    root.querySelectorAll('[data-open-mp-id]').forEach(function(button){
      button.addEventListener('click',function(){
        const id=Number(button.getAttribute('data-open-mp-id'));
        if(!id||id===Number(mpState_uni.detailId)) return;
        openMpDetail_uni(id);
      });
    });
    root.querySelectorAll('[data-rel-search][data-rel-scope="mp"]').forEach(function(control){
      const kind=control.getAttribute('data-rel-search');
      let timer=null;
      control.addEventListener('input',function(){
        clearTimeout(timer);
        timer=setTimeout(function(){
          if(!mpState_uni.detailTables[kind]) return;
          mpState_uni.detailTables[kind].search=control.value||'';
          mpState_uni.detailTables[kind].page=1;
          renderMpDetail_uni();
          const fresh=document.querySelector('[data-rel-search="'+kind+'"][data-rel-scope="mp"]');
          if(fresh){ fresh.focus(); fresh.setSelectionRange(fresh.value.length,fresh.value.length); }
        },180);
      });
    });
    root.querySelectorAll('[data-rel-filter][data-rel-scope="mp"]').forEach(function(control){
      control.addEventListener('change',function(){
        const kind=control.getAttribute('data-rel-kind');
        const field=control.getAttribute('data-rel-filter');
        if(!mpState_uni.detailTables[kind]) return;
        mpState_uni.detailTables[kind][field]=control.value||'';
        mpState_uni.detailTables[kind].page=1;
        renderMpDetail_uni();
      });
    });
    root.querySelectorAll('[data-rel-page][data-rel-scope="mp"]').forEach(function(button){
      button.addEventListener('click',function(){
        const kind=button.getAttribute('data-rel-kind');
        if(!mpState_uni.detailTables[kind]) return;
        mpState_uni.detailTables[kind].page=Number(button.getAttribute('data-rel-page'))||1;
        renderMpDetail_uni();
      });
    });
  }

  function openMpDetail_uni(id){
    const exists=mpState_uni.rows.some(function(row){ return Number(row.id_dmp)===Number(id); });
    if(!exists) return;
    mpState_uni.detailId=Number(id);
    mpState_uni.detailError=null;
    mpState_uni.detailTables={mp:{search:'',estado:'',periodicidad:'',page:1,pageSize:30},va:{search:'',estatus:'',page:1,pageSize:30}};
    renderMpDetail_uni();
    loadMpDetail_uni(mpState_uni.detailId,false);
  }

  async function loadMpDetail_uni(id,force){
    const key=String(id||'');
    if(!key||mpState_uni.detailLoading) return;
    if(mpState_uni.detailCache[key]&&!force){ renderMpDetail_uni(); return; }
    mpState_uni.detailLoading=true;
    mpState_uni.detailError=null;
    renderMpDetail_uni();
    try{
      const response=await fetch(apiBase_uni()+'/api/cobranza-uni/detalle-mp-2026/'+encodeURIComponent(key),{method:'GET',headers:authHeaders_uni(),cache:'no-store'});
      const payload=await response.json().catch(function(){return {};});
      if(!response.ok||!payload.ok) throw new Error(payload.message||('HTTP '+response.status));
      mpState_uni.detailCache[key]=payload;
      if(payload.mantenimiento){
        const index=mpState_uni.rows.findIndex(function(item){ return Number(item.id_dmp)===Number(id); });
        if(index>=0) mpState_uni.rows[index]=Object.assign({},mpState_uni.rows[index],payload.mantenimiento);
      }
    }catch(error){
      mpState_uni.detailError=error.message||'Error de conexión';
    }finally{
      mpState_uni.detailLoading=false;
      renderMpDetail_uni();
    }
  }

  async function loadMpMain_uni(force){
    if(mpState_uni.loading) return;
    if(mpState_uni.loaded && !force){ renderMpMain_uni(); return; }
    const view=document.getElementById('view-' + ROUTE_MP_UNI);
    if(!view) return;
    mpState_uni.loading=true;
    renderMpBase_uni(view);
    try{
      const response=await fetch(apiBase_uni() + '/api/cobranza-uni/detalle-mp-2026',{method:'GET',headers:authHeaders_uni(),cache:'no-store'});
      const payload=await response.json().catch(function(){return {};});
      if(!response.ok || !payload.ok) throw new Error(payload.message || ('HTTP ' + response.status));
      mpState_uni.rows=Array.isArray(payload.rows)?payload.rows:[];
      mpState_uni.catalogs=payload.catalogs||mpState_uni.catalogs;
      mpState_uni.kpis=payload.kpis||{};
      mpState_uni.generatedAt=payload.generated_at||new Date().toISOString();
      mpState_uni.loaded=true;
      renderMpMain_uni();
    }catch(error){
      const root=document.querySelector('[data-mp-uni-root]');
      if(root){ root.innerHTML='<section class="gc-uni-error"><span>⚠️</span><div><h2>No fue posible cargar Mantenimiento Preventivo</h2><p>' + escapeHtml_uni(error.message||'Error de conexión') + '</p><button type="button" class="mp-uni-btn" data-mp-action="refresh">Reintentar</button></div></section>'; bindMpMain_uni(root); }
    }finally{ mpState_uni.loading=false; }
  }

  function init_uni(route){
    syncSidebarLabel_uni();
    if(route === ROUTE_GESTION_CREDITO_UNI){
      loadGestionCredito_uni(false);
      return true;
    }
    if(route === ROUTE_MP_UNI){
      loadMpMain_uni(false);
      return true;
    }
    return shell_uni(route);
  }

  syncSidebarLabel_uni();
  document.addEventListener('DOMContentLoaded',syncSidebarLabel_uni);

  window.ManttoCobranza_uni = {
    init:init_uni,
    reloadGestionCredito:function(){ return loadGestionCredito_uni(true); },
    reloadMantenimientoPreventivo:function(){ return loadMpMain_uni(true); }
  };
})();
