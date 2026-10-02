// Generado a partir de las columnas reales de CUSTOMER_EX_2026_PRO.xlsx
const VI_COMUNES = [["proyecto_padre", "Proyecto Padre"], ["cliente", "Cliente"], ["sitio", "Sitio"], ["vendedor", "Vendedor"], ["modalidad", "Modalidad"], ["semana", "Semana"], ["supervisor", "Supervisor"], ["calificacion_nps", "Calificación NPS"], ["nps", "NPS"]];
const VI_GRUPOS = {
 "VENTA CONCRETADA": [
  [
   "vc_1_sat_proc_asec_vent",
   "1 SAT PROC ASEC VENT"
  ],
  [
   "vc_2_amabilidad",
   "2(AMABILIDAD)"
  ],
  [
   "vc_3_claridad",
   "3 CLARIDAD"
  ],
  [
   "vc_4_asesor",
   "4 (ASESOR)"
  ],
  [
   "vc_5_vendedor",
   "5 VENDEDOR"
  ],
  [
   "vc_6_tiempo_ase_com",
   "6 TIEMPO ASE COM"
  ],
  [
   "vc_7_tiempo_pres",
   "7 TIEMPO PRES"
  ],
  [
   "vc_8_tiem_contrato",
   "8 TIEM CONTRATO"
  ],
  [
   "vc_9_agilidad_comp_y_cont",
   "9 AGILIDAD COMP Y CONT"
  ],
  [
   "vc_10_prod_nec",
   "10 PROD NEC"
  ],
  [
   "vc_comentarios",
   "COMENTARIOS"
  ],
  [
   "vc_11_consid_opc",
   "11 CONSID OPC"
  ],
  [
   "vc_12_pq_eligio",
   "12 PQ ELIGIO"
  ],
  [
   "vc_comentarios_1",
   "COMENTARIOS.1"
  ],
  [
   "vc_13_exp_com_gen",
   "13 EXP COM GEN"
  ],
  [
   "vc_comentarios_2",
   "COMENTARIOS.2"
  ],
  [
   "vc_resultados",
   "RESULTADOS"
  ]
 ],
 "VENTA NO CONCRETADA": [
  [
   "vnc_csc",
   "CSC"
  ],
  [
   "vnc_1_exp_vent_pro_gen",
   "1 (EXP VENT PRO GEN)"
  ],
  [
   "vnc_2_amab_ase",
   "2 AMAB ASE"
  ],
  [
   "vnc_3_clar_ase_prop_y_prod",
   "3 (CLAR ASE PROP Y PROD)"
  ],
  [
   "vnc_4_ase_exp_y_nec",
   "4 (ASE EXP Y NEC)"
  ],
  [
   "vnc_5_vent_asp_pos_y_ao",
   "5 (VENT ASP POS Y AO)"
  ],
  [
   "vnc_6_tiem_ate_ase",
   "6 TIEM ATE ASE"
  ],
  [
   "vnc_7_con_q_empr",
   "7 CON Q EMPR"
  ],
  [
   "vnc_8_tiem_ate_ase",
   "8 TIEM ATE ASE"
  ],
  [
   "vnc_9_tiem_pre_presu",
   "9 TIEM PRE PRESU"
  ],
  [
   "vnc_10_pord_porp",
   "10 PORD PORP"
  ],
  [
   "vnc_comentarios_3",
   "COMENTARIOS.3"
  ],
  [
   "vnc_resultados_1",
   "RESULTADOS.1"
  ],
  [
   "vnc_csc_1",
   "CSC.1"
  ]
 ],
 "INSTALACION": [
  [
   "ins_1_sat_pro_oc",
   "1 SAT PRO OC"
  ],
  [
   "ins_2_sat_pro_supr",
   "2 SAT PRO SUPR"
  ],
  [
   "ins_3_calif_com_y_ate",
   "3 CALIF COM Y ATE"
  ],
  [
   "ins_4_disp_sup_inst",
   "4 DISP SUP INST"
  ],
  [
   "ins_comentarios_4",
   "COMENTARIOS.4"
  ],
  [
   "ins_5_pt_pro_y_con",
   "5 PT PRO Y CON"
  ],
  [
   "ins_6_cla_inf_tec",
   "6 CLA INF TEC"
  ],
  [
   "ins_7_res_incide",
   "7 RES INCIDE"
  ],
  [
   "ins_8_pod_mej",
   "8 POD MEJ"
  ],
  [
   "ins_comentarios_5",
   "COMENTARIOS.5"
  ],
  [
   "ins_9_aspec_sup_ob_civ",
   "9 ASPEC SUP OB CIV"
  ],
  [
   "ins_comentarios_6",
   "COMENTARIOS.6"
  ],
  [
   "ins_resultados_2",
   "RESULTADOS.2"
  ],
  [
   "ins_csc_2",
   "CSC.2"
  ]
 ],
 "AJUSTE": [
  [
   "aj_1_sat_pro_ajus",
   "1 SAT PRO AJUS"
  ],
  [
   "aj_2_calif_com_y_ate",
   "2 CALIF COM Y ATE"
  ],
  [
   "aj_3_disp_sup_ajus",
   "3 DISP SUP AJUS"
  ],
  [
   "aj_comentarios_7",
   "COMENTARIOS.7"
  ],
  [
   "aj_4_calif_pro_entre",
   "4 CALIF PRO ENTRE"
  ],
  [
   "aj_5_pt_prof_y_con",
   "5 PT PROF Y CON"
  ],
  [
   "aj_6_cla_inf_tec_1",
   "6 CLA INF TEC.1"
  ],
  [
   "aj_7_res_inc",
   "7 RES INC"
  ],
  [
   "aj_8_pod_mejor",
   "8 POD MEJOR"
  ],
  [
   "aj_comentarios_8",
   "COMENTARIOS.8"
  ],
  [
   "aj_9_asp_pro_dest",
   "9 ASP PRO DEST"
  ],
  [
   "aj_comentarios_9",
   "COMENTARIOS.9"
  ],
  [
   "aj_resultado",
   "Resultado"
  ],
  [
   "aj_csc_3",
   "CSC.3"
  ]
 ],
 "ENCUESTA DE CIERRE": [
  [
   "ci_1_sat_pro_grl",
   "1 SAT PRO GRL"
  ],
  [
   "ci_2_pv_res_prob",
   "2 PV RES PROB"
  ],
  [
   "ci_3_sat_aten_com",
   "3 SAT ATEN COM"
  ],
  [
   "ci_4_com_eq_vent_y_ope",
   "4 COM EQ VENT Y OPE"
  ],
  [
   "ci_5_calif_des_eq_vent",
   "5 CALIF DES EQ VENT"
  ],
  [
   "ci_6_calif_des_eq_inst",
   "6 CALIF DES EQ INST"
  ],
  [
   "ci_7_cal_des_eq_aj",
   "7 CAL DES EQ AJ"
  ],
  [
   "ci_8_cal_cal_ele_esc",
   "8 CAL CAL ELE/ESC"
  ],
  [
   "ci_9_prob_rec",
   "9 PROB REC"
  ],
  [
   "ci_10_pro_vol_cont",
   "10 PRO VOL CONT"
  ],
  [
   "ci_11_fac_trab_blt",
   "11 FAC TRAB BLT"
  ],
  [
   "ci_12_punt_des_blt",
   "12 PUNT DES BLT"
  ],
  [
   "ci_13_asp_mej_blt",
   "13 ASP MEJ BLT"
  ],
  [
   "ci_14_va",
   "14 VA"
  ],
  [
   "ci_comentarios_10",
   "COMENTARIOS.10"
  ],
  [
   "ci_resultado",
   "RESULTADO"
  ],
  [
   "ci_csc_4",
   "CSC.4"
  ],
  [
   "ci_aspectos_destacables",
   "ASPECTOS DESTACABLES"
  ],
  [
   "ci_clasificacion_de_areas_de_oportunida",
   "CLASIFICACION DE AREAS DE OPORTUNIDAD"
  ],
  [
   "ci_areas_de_oportunidad",
   "AREAS DE OPORTUNIDAD"
  ],
  [
   "ci_valor_agregado",
   "VALOR AGREGADO"
  ]
 ]
};
const MT_GRUPOS = {
 "Identificación": [
  [
   "marca_temporal",
   "Marca temporal"
  ],
  [
   "proyecto_sitio_del_servicio",
   "Proyecto (sitio del servicio)"
  ],
  [
   "nombre",
   "Nombre"
  ],
  [
   "cargo",
   "Cargo"
  ],
  [
   "correo_electronico",
   "Correo electrónico"
  ],
  [
   "telefono",
   "Teléfono"
  ],
  [
   "medio_de_encuesta",
   "Medio de encuesta"
  ],
  [
   "encuestador",
   "Encuestador"
  ],
  [
   "id_de_encuesta",
   "ID de encuesta"
  ]
 ],
 "NPS y confianza": [
  [
   "indice_de_recomendacion",
   "Índice de recomendación (NPS)"
  ],
  [
   "tipo_de_cliente",
   "Clasificación NPS"
  ],
  [
   "indice_de_confianza",
   "Índice de Confianza"
  ],
  [
   "percepcion_de_valor",
   "Percepción de Valor"
  ],
  [
   "indice_de_riesgo_churn",
   "Índice de riesgo / churn"
  ]
 ],
 "CSAT por componente": [
  [
   "csat_mantenimiento",
   "CSAT Mantenimiento preventivo"
  ],
  [
   "csat_atencion_de_fallas",
   "CSAT Atención de fallas"
  ],
  [
   "csat_seguimiento_de_supervisor",
   "CSAT Seguimiento de supervisor"
  ],
  [
   "csat_cotizaciones_suministros_y_reparaci",
   "CSAT Cotizaciones/suministros/reparaciones"
  ],
  [
   "csat_facturacion",
   "CSAT Facturación"
  ],
  [
   "csat_atencion_al_cliente",
   "CSAT Atención al cliente"
  ],
  [
   "csat_general",
   "CSAT General"
  ],
  [
   "2_1_cual_es_el_nombre_de_su_supervisor_o",
   "Nombre del supervisor/contacto operativo"
  ]
 ],
 "Oportunidades de mejora": [
  [
   "3_1_mantenimiento_preventivo_oportunidad",
   "Mantenimiento preventivo: oportunidad"
  ],
  [
   "3_2_atencion_de_fallas_oportunidad_de_me",
   "Atención de fallas: oportunidad"
  ],
  [
   "3_3_seguimiento_de_supervisor_oportunida",
   "Seguimiento de supervisor: oportunidad"
  ],
  [
   "3_4_cotizaciones_suministros_y_reparacio",
   "Cotizaciones/suministros/reparaciones: oportunidad"
  ],
  [
   "3_5_facturacion_oportunidad_de_mejora",
   "Facturación: oportunidad"
  ],
  [
   "3_6_atencion_al_cliente_oportunidad_de_m",
   "Atención al cliente: oportunidad"
  ]
 ],
 "Comentarios y clasificación": [
  [
   "cuentanos_mas_sobre_tu_experiencia_algo_",
   "Comentario libre"
  ],
  [
   "aspectos_destacables",
   "Aspectos destacables"
  ],
  [
   "areas_de_oportunidad",
   "Áreas de oportunidad"
  ],
  [
   "temas_operativos",
   "Temas operativos"
  ],
  [
   "temas_administrativos",
   "Temas administrativos"
  ],
  [
   "valor_agregado",
   "Valor agregado"
  ],
  [
   "tickets_generados",
   "Tickets generados"
  ]
 ],
 "Zonas y responsables": [
  [
   "z_general",
   "Zona general"
  ],
  [
   "z_operativa",
   "Zona operativa"
  ],
  [
   "z_administrativa",
   "Zona administrativa"
  ],
  [
   "c_administrativo",
   "Contacto administrativo"
  ],
  [
   "z_ventas",
   "Zona ventas"
  ],
  [
   "c_ventas",
   "Contacto ventas"
  ],
  [
   "z_contratos",
   "Zona contratos"
  ],
  [
   "c_contratos",
   "Contacto contratos"
  ],
  [
   "superintendente",
   "Superintendente"
  ],
  [
   "supervisor_operativo",
   "Supervisor operativo"
  ],
  [
   "categoria",
   "Categoría"
  ],
  [
   "prioridad",
   "Prioridad"
  ],
  [
   "estado",
   "Estado"
  ]
 ]
};

// [Claude | 2026-10-02 | CLAUDE-MG | LAB DGB - CUSTOMER EXPERIENCE DETALLE V001]
// Pestaña "Encuestas": una pestaña por área (Venta/Instalaciones, Mantenimiento),
// cada una con su listado filtrable de encuestas individuales y el detalle
// completo de cada una (campos agrupados segun el tipo de encuesta, con las
// mismas etiquetas legibles del Excel de origen).
(function(){
  const API = () => (window.MANTTO_API_BASE || 'http://localhost:3001').replace(/\/$/, '');

  const state = { loaded:false, tab:'venta_instalacion', opciones:null, filtrosVi:{}, filtrosMt:{}, encuestasVi:[], encuestasMt:[] };

  const CE_HTML =
    '<div class="ce-page">' +
      '<section class="ce-card ce-head"><div><h1>Encuestas</h1><p>Detalle de cada encuesta de Customer Experience, por área.</p></div></section>' +
      '<div class="ce-tabs">' +
        '<button type="button" class="ce-tab active" data-tab="venta_instalacion">Venta / Instalaciones</button>' +
        '<button type="button" class="ce-tab" data-tab="mantenimiento">Mantenimiento</button>' +
      '</div>' +
      '<section class="ce-card">' +
        '<div class="ce-filters" id="ce-filtros"></div>' +
      '</section>' +
      '<div id="ce-resultado"><div class="ce-status">Cargando...</div></div>' +
      '<div class="ce-modal-overlay" id="ce-detalle-overlay" hidden>' +
        '<div class="ce-modal" role="dialog" aria-modal="true">' +
          '<div class="ce-modal-head"><h2 id="ce-detalle-titulo">Detalle</h2><button type="button" class="ce-modal-close" id="ce-detalle-cerrar" aria-label="Cerrar">✕</button></div>' +
          '<div class="ce-modal-body" id="ce-detalle-body"></div>' +
        '</div>' +
      '</div>' +
    '</div>';

  function $(id){ return document.getElementById(id); }
  function esc(v){ return String(v==null||v==='' ? '—' : v).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

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

  function renderFiltros(){
    const host = $('ce-filtros');
    if(state.tab==='venta_instalacion'){
      const o = state.opciones.venta_instalacion;
      host.innerHTML =
        selectHtml('ce-vi-tipo','Tipo de encuesta',o.tipos_encuesta,state.filtrosVi.tipo_encuesta) +
        selectHtml('ce-vi-vendedor','Vendedor',o.vendedores,state.filtrosVi.vendedor) +
        selectHtml('ce-vi-supervisor','Supervisor',o.supervisores,state.filtrosVi.supervisor);
      [['ce-vi-tipo','tipo_encuesta'],['ce-vi-vendedor','vendedor'],['ce-vi-supervisor','supervisor']].forEach(([id,key])=>{
        $(id).addEventListener('change', ()=>{ state.filtrosVi[key] = $(id).value; cargarTab(); });
      });
    } else {
      const o = state.opciones.mantenimiento;
      host.innerHTML =
        selectHtml('ce-mt-estado','Estado',o.estados,state.filtrosMt.estado) +
        selectHtml('ce-mt-superintendente','Superintendente',o.superintendentes,state.filtrosMt.superintendente) +
        selectHtml('ce-mt-categoria','Categoría',o.categorias,state.filtrosMt.categoria);
      [['ce-mt-estado','estado'],['ce-mt-superintendente','superintendente'],['ce-mt-categoria','categoria']].forEach(([id,key])=>{
        $(id).addEventListener('change', ()=>{ state.filtrosMt[key] = $(id).value; cargarTab(); });
      });
    }
  }

  function npsBadgeClase(valor){
    const n = Number(valor);
    if(!Number.isFinite(n)) return '';
    return n>=9 ? 'promotor' : (n>=7 ? 'pasivo' : 'detractor');
  }

  function renderListaVi(){
    const rows = state.encuestasVi;
    if(!rows.length){ $('ce-resultado').innerHTML = '<div class="ce-status">Sin encuestas con estos filtros.</div>'; return; }
    const items = rows.map(r=>
      '<button type="button" class="ce-row" data-id="'+r.id+'">' +
        '<div class="ce-row-main"><strong>'+esc(r.proyecto_padre)+'</strong><span class="ce-row-sub">'+esc(r.cliente)+' · '+esc(r.sitio)+'</span></div>' +
        '<div class="ce-row-meta"><span class="ce-chip">'+esc(r.tipo_encuesta)+'</span><span class="ce-chip">'+esc(r.vendedor)+'</span><span class="ce-nps-badge '+npsBadgeClase(r.nps)+'">NPS '+esc(r.nps)+'</span></div>' +
      '</button>'
    ).join('');
    $('ce-resultado').innerHTML = '<div class="ce-list">'+items+'</div>';
    $('ce-resultado').querySelectorAll('.ce-row').forEach(btn=> btn.addEventListener('click', ()=> abrirDetalleVi(Number(btn.dataset.id))));
  }

  function renderListaMt(){
    const rows = state.encuestasMt;
    if(!rows.length){ $('ce-resultado').innerHTML = '<div class="ce-status">Sin encuestas con estos filtros.</div>'; return; }
    const items = rows.map(r=>
      '<button type="button" class="ce-row" data-id="'+r.id+'">' +
        '<div class="ce-row-main"><strong>'+esc(r.proyecto_sitio_del_servicio)+'</strong><span class="ce-row-sub">'+esc(r.nombre)+' · '+esc(r.cargo)+'</span></div>' +
        '<div class="ce-row-meta"><span class="ce-chip">'+esc(r.estado)+'</span><span class="ce-chip">'+esc(r.superintendente)+'</span><span class="ce-nps-badge '+npsBadgeClase(r.indice_de_recomendacion)+'">NPS '+esc(r.indice_de_recomendacion)+'</span></div>' +
      '</button>'
    ).join('');
    $('ce-resultado').innerHTML = '<div class="ce-list">'+items+'</div>';
    $('ce-resultado').querySelectorAll('.ce-row').forEach(btn=> btn.addEventListener('click', ()=> abrirDetalleMt(Number(btn.dataset.id))));
  }

  function camposDetalleHtml(row, grupos){
    return Object.entries(grupos).map(([seccion,campos])=>{
      const filas = campos
        .filter(([key])=> row[key]!=null && String(row[key]).trim()!=='')
        .map(([key,label])=> '<div class="ce-detail-row"><span class="ce-detail-label">'+esc(label)+'</span><span class="ce-detail-value">'+esc(row[key])+'</span></div>')
        .join('');
      if(!filas) return '';
      return '<div class="ce-detail-section"><h3>'+esc(seccion)+'</h3>'+filas+'</div>';
    }).join('');
  }

  function abrirDetalleVi(id){
    const row = state.encuestasVi.find(r=>r.id===id);
    if(!row) return;
    $('ce-detalle-titulo').textContent = row.proyecto_padre + ' · ' + row.tipo_encuesta;
    const comunesHtml = '<div class="ce-detail-section"><h3>Datos generales</h3>' + VI_COMUNES
      .filter(([key])=> row[key]!=null && String(row[key]).trim()!=='')
      .map(([key,label])=>'<div class="ce-detail-row"><span class="ce-detail-label">'+esc(label)+'</span><span class="ce-detail-value">'+esc(row[key])+'</span></div>').join('') + '</div>';
    const tipoKey = Object.keys(VI_GRUPOS).find(t=> t.trim()===String(row.tipo_encuesta||'').trim());
    const detalleHtml = tipoKey ? camposDetalleHtml(row, {[tipoKey]: VI_GRUPOS[tipoKey]}) : '<div class="ce-status">Tipo de encuesta sin grupo de campos definido.</div>';
    $('ce-detalle-body').innerHTML = comunesHtml + detalleHtml;
    $('ce-detalle-overlay').hidden = false;
  }

  function abrirDetalleMt(id){
    const row = state.encuestasMt.find(r=>r.id===id);
    if(!row) return;
    $('ce-detalle-titulo').textContent = row.proyecto_sitio_del_servicio + ' · ' + row.nombre;
    $('ce-detalle-body').innerHTML = camposDetalleHtml(row, MT_GRUPOS);
    $('ce-detalle-overlay').hidden = false;
  }

  function cerrarDetalle(){ $('ce-detalle-overlay').hidden = true; }

  async function cargarTab(){
    const resultado = $('ce-resultado');
    resultado.innerHTML = '<div class="ce-status">Cargando...</div>';
    try{
      if(state.tab==='venta_instalacion'){
        const params = new URLSearchParams();
        Object.entries(state.filtrosVi).forEach(([k,v])=>{ if(v) params.set(k,v); });
        const data = await fetchJson('/api/customer-experience/venta-instalacion/encuestas?'+params.toString());
        state.encuestasVi = data.encuestas || [];
        renderListaVi();
      } else {
        const params = new URLSearchParams();
        Object.entries(state.filtrosMt).forEach(([k,v])=>{ if(v) params.set(k,v); });
        const data = await fetchJson('/api/customer-experience/mantenimiento/encuestas?'+params.toString());
        state.encuestasMt = data.encuestas || [];
        renderListaMt();
      }
    }catch(e){
      resultado.innerHTML = '<div class="ce-status">Error: '+esc(e.message)+'</div>';
    }
  }

  function cambiarTab(tab){
    state.tab = tab;
    document.querySelectorAll('.ce-tab').forEach(b=> b.classList.toggle('active', b.dataset.tab===tab));
    renderFiltros();
    cargarTab();
  }

  async function init(){
    const view = $('view-cx-encuestas');
    if(!view) return;
    if(!view.innerHTML.trim()) view.innerHTML = CE_HTML;
    if(!state.loaded){
      document.querySelectorAll('.ce-tab').forEach(btn=> btn.addEventListener('click', ()=> cambiarTab(btn.dataset.tab)));
      $('ce-detalle-cerrar').addEventListener('click', cerrarDetalle);
      $('ce-detalle-overlay').addEventListener('click', ev=>{ if(ev.target.id==='ce-detalle-overlay') cerrarDetalle(); });
      document.addEventListener('keydown', ev=>{ if(ev.key==='Escape' && !$('ce-detalle-overlay').hidden) cerrarDetalle(); });
      try{
        const data = await fetchJson('/api/customer-experience/opciones');
        state.opciones = data.data;
        renderFiltros();
        state.loaded = true;
        await cargarTab();
      }catch(e){
        $('ce-resultado').innerHTML = '<div class="ce-status">Error cargando opciones: '+esc(e.message)+'</div>';
        console.error('[Customer Experience · Encuestas]', e);
      }
    }
  }

  window.ManttoCustomerExperienceEncuestas = { init };
})();
