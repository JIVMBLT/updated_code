(function(){
  'use strict';

  const VERSION_COR = '20260819-fase3-v001';
  const STAGES = Object.freeze({
    '03-PM':Object.freeze({
      key:'03',
      path:'/api/instalaciones/pmm/03-pm',
      label:'Equipos Proximos a Montar'
    }),
    '04-M':Object.freeze({
      key:'04',
      path:'/api/instalaciones/pmm/04-m',
      label:'Equipos en Montaje'
    })
  });

  const state = {
    ready:false,
    bound:false,
    loadingAll:false,
    stages:{
      '03-PM':{ page:1, loading:false, forbidden:false, error:null, response:null, visualCatalog:new Map() },
      '04-M':{ page:1, loading:false, forbidden:false, error:null, response:null, visualCatalog:new Map() }
    }
  };

  const $ = id => document.getElementById(id);
  const raw = value => value === null || value === undefined ? '' : String(value).trim();
  const esc = value => raw(value)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');

  function getView_cor(){ return $('view-instalaciones-pmm'); }

  async function loadHtml_cor(){
    const view = getView_cor();
    if(!view) throw new Error('No existe la vista view-instalaciones-pmm.');
    if(view.dataset.ipmmCorReady === '1') return view;

    const response = await fetch(
      './modules/instalaciones-pmm/instalaciones-pmm_cor.html?v=' + VERSION_COR,
      { cache:'no-store' }
    );
    if(!response.ok) throw new Error('No se pudo cargar la vista PM&M.');
    view.innerHTML = await response.text();
    view.dataset.ipmmCorReady = '1';
    return view;
  }

  async function apiGet_cor(path){
    if(window.ManttoAuth && typeof window.ManttoAuth.api === 'function'){
      return window.ManttoAuth.api(path,{ method:'GET', cache:'no-store' });
    }
    const base = (window.MANTTO_API_BASE || 'http://localhost:3001').replace(/\/$/,'');
    const headers = Object.assign(
      { Accept:'application/json' },
      window.ManttoAuth && typeof window.ManttoAuth.authHeaders === 'function'
        ? window.ManttoAuth.authHeaders()
        : {}
    );
    const response = await fetch(base + path,{ headers, cache:'no-store' });
    const text = await response.text();
    let json = null;
    try{ json = text ? JSON.parse(text) : null; }
    catch(_error){ throw new Error('El backend respondio contenido no JSON.'); }
    if(!response.ok || (json && json.ok === false)){
      const error = new Error((json && (json.message || json.error)) || ('Error HTTP ' + response.status));
      error.status = response.status;
      error.code = json && json.code;
      throw error;
    }
    return json || {};
  }

  function formatDate_cor(value){
    const text = raw(value);
    if(!text || ['-','.','N/A'].includes(text.toUpperCase())) return '\u2014';
    const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if(iso) return iso[3] + '/' + iso[2] + '/' + iso[1];
    const slash = text.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
    if(slash) return String(slash[1]).padStart(2,'0') + '/' + String(slash[2]).padStart(2,'0') + '/' + slash[3];
    const monthMap = {JAN:'01',FEB:'02',MAR:'03',APR:'04',MAY:'05',JUN:'06',JUL:'07',AUG:'08',SEP:'09',OCT:'10',NOV:'11',DEC:'12'};
    const legacy = text.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2}|\d{4})$/);
    if(legacy){
      const month = monthMap[String(legacy[2]).toUpperCase()];
      if(month){
        const year = legacy[3].length === 2 ? ('20' + legacy[3]) : legacy[3];
        return String(legacy[1]).padStart(2,'0') + '/' + month + '/' + year;
      }
    }
    return text;
  }

  function formatTimestamp_cor(value){
    const date = value ? new Date(value) : new Date();
    if(Number.isNaN(date.getTime())) return '';
    const pad = number => String(number).padStart(2,'0');
    return pad(date.getDate()) + '/' + pad(date.getMonth() + 1) + '/' + date.getFullYear() +
      ' - ' + pad(date.getHours()) + ':' + pad(date.getMinutes());
  }

  function formatPercent_cor(value){
    if(value === null || value === undefined || raw(value) === '') return '\u2014';
    const number = Number(String(value).replace('%','').replace(',','.'));
    if(!Number.isFinite(number)) return raw(value) || '\u2014';
    const percent = Math.abs(number) <= 1 ? number * 100 : number;
    return Math.round(percent) + '%';
  }

  function textOrDash_cor(value){ return raw(value) || '\u2014'; }

  function safeColor_cor(value, fallback){
    const text = raw(value);
    return /^#[0-9a-fA-F]{6}$/.test(text) ? text : fallback;
  }

  function stageState_cor(code){ return state.stages[code]; }
  function stageConfig_cor(code){ return STAGES[code]; }

  function updateVisualCatalog_cor(code, response){
    const stage = stageState_cor(code);
    stage.visualCatalog = new Map();
    const visual = response && response.estados_visuales ? response.estados_visuales : {};
    const catalog = Array.isArray(visual.catalogo) ? visual.catalogo : [];
    const statusRows = visual.por_estatus && Array.isArray(visual.por_estatus[code])
      ? visual.por_estatus[code]
      : [];
    catalog.concat(statusRows).forEach(item => {
      const key = raw(item && item.codigo);
      if(key && !stage.visualCatalog.has(key)) stage.visualCatalog.set(key,item);
    });
  }

  function visualItemsForRow_cor(code, row){
    const catalog = stageState_cor(code).visualCatalog;
    const codes = Array.isArray(row && row.estados_visuales_codigos) ? row.estados_visuales_codigos : [];
    return codes.map(item => catalog.get(raw(item))).filter(Boolean);
  }

  function visualBadge_cor(item, withName){
    if(!item) return '';
    const emoji = raw(item.emoji) || '\u2022';
    const name = raw(item.nombre) || raw(item.codigo) || 'Alerta';
    const description = raw(item.descripcion);
    const title = description ? (name + ' \u00b7 ' + description) : name;
    const text = safeColor_cor(item.color_texto,'#0f172a');
    const background = safeColor_cor(item.color_fondo,'#f8fafc');
    const border = safeColor_cor(item.color_borde,'#cbd5e1');
    return '<span class="ipmm-cor-visual-badge' + (withName ? ' ipmm-cor-visual-badge-wide' : '') + '"' +
      ' title="' + esc(title) + '" aria-label="' + esc(name) + '"' +
      ' style="--ipmm-ev-text:' + esc(text) + ';--ipmm-ev-bg:' + esc(background) + ';--ipmm-ev-border:' + esc(border) + '">' +
      '<span aria-hidden="true">' + esc(emoji) + '</span>' + (withName ? '<span>' + esc(name) + '</span>' : '') + '</span>';
  }

  function visualCell_cor(code, row){
    const items = visualItemsForRow_cor(code,row);
    if(!items.length) return '<span class="ipmm-cor-no-visual-state">\u2014</span>';
    return '<div class="ipmm-cor-visual-list">' + items.map(item => visualBadge_cor(item,false)).join('') + '</div>';
  }

  function renderLegend_cor(code){
    const key = stageConfig_cor(code).key;
    const root = $('ipmm-cor-legend-' + key);
    if(!root) return;
    const items = Array.from(stageState_cor(code).visualCatalog.values());
    root.hidden = !items.length;
    root.innerHTML = items.length
      ? '<strong>Alertas Reporte Instalaciones</strong><div class="ipmm-cor-visual-legend-items">' +
        items.map(item => visualBadge_cor(item,true)).join('') + '</div>'
      : '';
  }

  function equipmentButton_cor(row){
    const project = raw(row && row.proyecto);
    const reference = raw(row && row.referencia_sitio);
    if(!project || !reference) return esc(textOrDash_cor(reference));
    return '<button type="button" class="ipmm-cor-link" data-ipmm-equipment="1"' +
      ' data-ipmm-project="' + esc(project) + '" data-ipmm-reference="' + esc(reference) + '">' + esc(reference) + '</button>';
  }

  function projectButton_cor(row){
    const id = raw(row && row.id_proyecto);
    const project = raw(row && row.proyecto);
    if(!project) return '\u2014';
    return '<button type="button" class="ipmm-cor-link" data-ipmm-project-link="1"' +
      ' data-ipmm-project-id="' + esc(id) + '" data-ipmm-project-name="' + esc(project) + '">' + esc(project) + '</button>';
  }

  function daysCell_cor(value){
    const text = raw(value);
    if(!text) return '\u2014';
    const number = Number(text.replace(',','.'));
    let className = 'ipmm-cor-days';
    if(Number.isFinite(number) && number < 0) className += ' is-late';
    else if(Number.isFinite(number) && number <= 14) className += ' is-close';
    return '<span class="' + className + '">' + esc(text) + '</span>';
  }

  function row03_cor(row){
    return '<tr>' +
      '<td>' + esc(textOrDash_cor(row.supervisor_fl)) + '</td>' +
      '<td>' + visualCell_cor('03-PM',row) + '</td>' +
      '<td><span class="ipmm-cor-percent">' + esc(formatPercent_cor(row.avance_oc)) + '</span></td>' +
      '<td class="ipmm-cor-date">' + esc(formatDate_cor(row.fecha_posible_recepcion_cubo)) + '</td>' +
      '<td>' + projectButton_cor(row) + '</td>' +
      '<td>' + equipmentButton_cor(row) + '</td>' +
      '<td class="ipmm-cor-comment">' + esc(textOrDash_cor(row.comentarios_fl)) + '</td>' +
      '</tr>';
  }

  function row04_cor(row){
    return '<tr>' +
      '<td>' + esc(textOrDash_cor(row.supervisor_fl)) + '</td>' +
      '<td>' + visualCell_cor('04-M',row) + '</td>' +
      '<td><span class="ipmm-cor-percent">' + esc(formatPercent_cor(row.avance_mo)) + '</span></td>' +
      '<td>' + projectButton_cor(row) + '</td>' +
      '<td>' + equipmentButton_cor(row) + '</td>' +
      '<td class="ipmm-cor-date">' + esc(formatDate_cor(row.fecha_ccr)) + '</td>' +
      '<td>' + esc(textOrDash_cor(row.subcontratista)) + '</td>' +
      '<td class="ipmm-cor-date">' + esc(formatDate_cor(row.fecha_inicio_montaje)) + '</td>' +
      '<td class="ipmm-cor-date">' + esc(formatDate_cor(row.fecha_fin_montaje_planeado)) + '</td>' +
      '<td class="ipmm-cor-date">' + esc(formatDate_cor(row.fecha_fin_montaje_modificado)) + '</td>' +
      '<td class="ipmm-cor-date">' + esc(formatDate_cor(row.fecha_fin_montaje_real)) + '</td>' +
      '<td>' + daysCell_cor(row.dias_restantes) + '</td>' +
      '<td class="ipmm-cor-comment">' + esc(textOrDash_cor(row.comentarios_fl)) + '</td>' +
      '</tr>';
  }

  function renderStage_cor(code){
    const config = stageConfig_cor(code);
    const stage = stageState_cor(code);
    const response = stage.response || {};
    const pagination = response.pagination || {};
    const rows = Array.isArray(response.data) ? response.data : [];
    const total = Number(pagination.total || 0);
    const page = Math.max(1,Number(pagination.page || stage.page || 1));
    const totalPages = Math.max(1,Number(pagination.total_pages || 0) || 1);
    const key = config.key;
    const body = $('ipmm-cor-body-' + key);
    const loading = $('ipmm-cor-loading-' + key);
    const error = $('ipmm-cor-error-' + key);
    const wrap = $('ipmm-cor-table-wrap-' + key);
    const footer = $('ipmm-cor-footer-' + key);
    const totalLabel = $('ipmm-cor-total-' + key);

    if(loading) loading.hidden = !stage.loading;
    if(error){
      error.hidden = !stage.error;
      error.dataset.type = stage.error ? 'error' : '';
      error.textContent = stage.error || '';
    }
    if(totalLabel) totalLabel.textContent = total.toLocaleString('es-MX') + ' equipo(s)';
    if(wrap) wrap.hidden = stage.loading || !!stage.error;
    if(footer) footer.hidden = stage.loading || !!stage.error;
    if(body){
      body.innerHTML = rows.length
        ? rows.map(code === '03-PM' ? row03_cor : row04_cor).join('')
        : '<tr><td class="ipmm-cor-empty" colspan="' + (code === '03-PM' ? 7 : 13) + '">Sin equipos en este estatus.</td></tr>';
    }

    renderLegend_cor(code);

    const range = $('ipmm-cor-range-' + key);
    const pageText = $('ipmm-cor-page-' + key);
    const prev = $('ipmm-cor-prev-' + key);
    const next = $('ipmm-cor-next-' + key);
    const start = total ? ((page - 1) * 30 + 1) : 0;
    const end = total ? Math.min((page - 1) * 30 + rows.length,total) : 0;
    if(range) range.textContent = total ? ('Mostrando ' + start + '-' + end + ' de ' + total.toLocaleString('es-MX')) : '0 registros';
    if(pageText) pageText.textContent = page + ' / ' + totalPages;
    if(prev) prev.disabled = stage.loading || page <= 1;
    if(next) next.disabled = stage.loading || page >= totalPages;
  }

  function renderGlobal_cor(){
    const allowed = Object.keys(STAGES).filter(code => !stageState_cor(code).forbidden);
    Object.keys(STAGES).forEach(code => {
      const card = $('ipmm-cor-card-' + stageConfig_cor(code).key);
      if(card) card.hidden = stageState_cor(code).forbidden;
    });
    const global = $('ipmm-cor-global-message');
    if(global){
      global.hidden = allowed.length > 0;
      global.textContent = allowed.length ? '' : 'No tienes permiso para consultar las tablas de PM&M.';
    }
  }

  async function loadStage_cor(code, options){
    const config = stageConfig_cor(code);
    const stage = stageState_cor(code);
    const nextPage = Number(options && options.page) || stage.page || 1;
    stage.page = Math.max(1,nextPage);
    stage.loading = true;
    stage.error = null;
    stage.forbidden = false;
    renderStage_cor(code);

    try{
      const response = await apiGet_cor(config.path + '?page=' + encodeURIComponent(stage.page));
      stage.response = response || {};
      stage.page = Number(response && response.pagination && response.pagination.page) || stage.page;
      updateVisualCatalog_cor(code,response);
    }catch(error){
      const status = Number(error && error.status);
      if(status === 403 || error && error.code === 'INSTALACIONES_PMM_FORBIDDEN'){
        stage.forbidden = true;
        stage.response = null;
      }else{
        stage.error = error && error.message ? error.message : 'No fue posible cargar la tabla.';
      }
    }finally{
      stage.loading = false;
      renderStage_cor(code);
      renderGlobal_cor();
    }
  }

  async function loadAll_cor(){
    if(state.loadingAll) return;
    state.loadingAll = true;
    const refresh = $('ipmm-cor-refresh');
    if(refresh) refresh.disabled = true;
    const status = $('ipmm-cor-status');
    if(status) status.textContent = 'Actualizando...';

    await Promise.all([
      loadStage_cor('03-PM',{page:stageState_cor('03-PM').page}),
      loadStage_cor('04-M',{page:stageState_cor('04-M').page})
    ]);

    const responses = Object.keys(STAGES).map(code => stageState_cor(code).response).filter(Boolean);
    const generatedAt = responses.map(item => item.generated_at).filter(Boolean).sort().pop();
    if(status) status.textContent = generatedAt ? ('Actualizado ' + formatTimestamp_cor(generatedAt)) : '';
    if(refresh) refresh.disabled = false;
    state.loadingAll = false;
  }

  function changePage_cor(code, delta){
    const stage = stageState_cor(code);
    const pagination = stage.response && stage.response.pagination ? stage.response.pagination : {};
    const current = Number(pagination.page || stage.page || 1);
    const totalPages = Math.max(1,Number(pagination.total_pages || 1));
    const target = Math.min(Math.max(current + delta,1),totalPages);
    if(target === current) return;
    loadStage_cor(code,{page:target});
  }

  function openProject_cor(target){
    const project = raw(target && target.dataset.ipmmProjectName);
    const id = raw(target && target.dataset.ipmmProjectId) || project;
    if(!id || !window.ManttoRouter || typeof window.ManttoRouter.open !== 'function') return;
    window.ManttoRouter.open('detalle',{
      type:'proyecto',
      id,
      projectName:project,
      source:'instalaciones-pmm',
      template:'cliente-unificado'
    });
  }

  function openEquipment_cor(target){
    const project = raw(target && target.dataset.ipmmProject);
    const reference = raw(target && target.dataset.ipmmReference);
    if(!project || !reference || !window.ManttoRouter || typeof window.ManttoRouter.open !== 'function') return;
    window.ManttoRouter.open('detalle',{
      type:'equipo',
      id:project + '|||' + reference,
      source:'instalaciones-pmm',
      projectName:project,
      referencia_sitio:reference
    });
  }

  function bind_cor(){
    if(state.bound) return;
    state.bound = true;
    $('ipmm-cor-refresh')?.addEventListener('click',loadAll_cor);
    $('ipmm-cor-prev-03')?.addEventListener('click',()=>changePage_cor('03-PM',-1));
    $('ipmm-cor-next-03')?.addEventListener('click',()=>changePage_cor('03-PM',1));
    $('ipmm-cor-prev-04')?.addEventListener('click',()=>changePage_cor('04-M',-1));
    $('ipmm-cor-next-04')?.addEventListener('click',()=>changePage_cor('04-M',1));
    getView_cor()?.addEventListener('click',event => {
      const project = event.target.closest('[data-ipmm-project-link]');
      if(project){ openProject_cor(project); return; }
      const equipment = event.target.closest('[data-ipmm-equipment]');
      if(equipment) openEquipment_cor(equipment);
    });
  }

  async function init(){
    try{
      await loadHtml_cor();
      bind_cor();
      renderGlobal_cor();
      await loadAll_cor();
      state.ready = true;
    }catch(error){
      const view = getView_cor();
      if(view){
        view.innerHTML = '<div class="ipmm-cor-page"><section class="ipmm-cor-card ipmm-cor-head"><div><p class="ipmm-cor-eyebrow">Instalaciones</p><h1>PM&amp;M</h1><p>No fue posible inicializar el modulo.</p></div></section><div class="ipmm-cor-message">' + esc(error && error.message ? error.message : 'Error de inicializacion.') + '</div></div>';
      }
      console.error('[PMM_cor]',error);
    }
  }

  window.ManttoInstalacionesPmm_cor = { init, refresh:loadAll_cor };
})();
