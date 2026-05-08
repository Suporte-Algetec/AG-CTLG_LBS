function ensureTemplatesCSS() {
  if (document.getElementById('templates-css')) return;

  const link = document.createElement('link');
  link.id = 'templates-css';
  link.rel = 'stylesheet';
  link.href = 'templates/templates.css';
  document.head.appendChild(link);
}

function ensureCatalogCSS() {
  if (document.getElementById('catalog-css')) return;

  const link = document.createElement('link');
  link.id = 'catalog-css';
  link.rel = 'stylesheet';
  link.href = 'catalogo.css';
  document.head.appendChild(link);
}


const fileInput = document.getElementById('file-input');
const renderBtn = document.getElementById('render-btn');
const printBtn = document.getElementById('print-btn');
let preview = document.getElementById('preview');
if(!preview){
  preview = document.createElement('div');
  preview.id = 'preview';
  preview.style.display = 'none';
  document.body.appendChild(preview);
}
const messages = document.getElementById('messages');
const lmsLinkInput = document.getElementById('lms-link');
const langSelect = document.getElementById('lang-select');
const showIntegratedPageInput = document.getElementById('show-integrated-page');

// Cover-field visibility: hidden by default; toggled by a button; Spanish forces hidden
let coverCustomized = false;
const toggleCoverBtn = document.getElementById('toggle-cover-btn');

function updateCoverFieldsVisibility() {
  try {
    document.querySelectorAll('.cover-field').forEach(el => {
      // animation-friendly: toggle a .visible class
      if (coverCustomized) el.classList.add('visible');
      else el.classList.remove('visible');
    });

    if (toggleCoverBtn) {
      toggleCoverBtn.disabled = false;
      const _btnLang = (langSelect && langSelect.value) || 'pt';
      toggleCoverBtn.textContent = coverCustomized
        ? (_btnLang === 'es' ? 'Ocultar otras opciones' : 'Ocultar outras opções')
        : (_btnLang === 'es' ? 'Otras opciones' : 'Outras opções');
    }
  } catch (e) {
    console.error('updateCoverFieldsVisibility error', e);
  }
}

if (toggleCoverBtn) {
  toggleCoverBtn.addEventListener('click', () => {
    coverCustomized = !coverCustomized;
    updateCoverFieldsVisibility();
  });
}

// Initialize: cover fields hidden until user opts in
coverCustomized = false;
if (langSelect) {
  langSelect.addEventListener('change', () => {
    updateFieldsForLocale(langSelect.value);
    updateCoverFieldsVisibility();
  });
}
updateCoverFieldsVisibility();

const LOCALES = {
  pt: {
    order: ["SAÚDE","CIÊNCIAS NATURAIS","ENGENHARIAS E ARQUITETURA","HUMANAS"],
    linkText: 'Links para integração em seu LMS',
    headers: { name: 'Nome do laboratório', idPratica: 'ID prática', idCatalogo: 'ID catálogo integrado', empty: '' },
    pillText: 'Novo'
  },
  es: {
    order: ["SALUD","CIENCIAS NATURALES","INGENIERÍAS Y CIENCIAS EXACTAS","HUMANIDADES"],
    linkText: 'Enlaces para la integración en su LMS',
    headers: { name: 'Nombre del laboratorio', idPratica: 'ID práctica', idCatalogo: 'ID catálogo integrado', empty: '' },
    pillText: 'Nuevo'
  }
};

// Traduções para a capa
LOCALES.pt.cover = {
  title: 'Laboratórios Virtuais',
  metrics: { totalLabel: 'Laboratórios virtuais', newLabel: 'Novos laboratórios' },
  bannerAlt: 'Laboratório virtual',
  areas: { saude: 'Saúde', exatas: 'Engenharias e Arquitetura', naturais: 'Ciências Naturais', humanas: 'Humanas' },
  areaLabel: 'práticas'
};
LOCALES.es.cover = {
  title: 'Laboratorios Virtuales',
  metrics: { totalLabel: 'Laboratorios virtuales', newLabel: 'Nuevos laboratorios' },
  bannerAlt: 'Laboratorio virtual',
  areas: { saude: 'Salud', exatas: 'INGENIERÍAS Y CIENCIAS EXACTAS', naturais: 'Ciencias Naturales', humanas: 'Humanidades' },
  areaLabel: 'prácticas'
};

LOCALES.pt.backCover = {
  text: 'O Catálogo Integrado apoia instituições parceiras na curadoria de conteúdos, oferecendo busca por Inteligência Artificial, filtros por nível de ensino, área, curso ou disciplina e pesquisa por palavra-chave ou ementa.',
  cta: 'Ainda não utiliza o Catálogo Integrado em sua instituição de ensino? Entre em contato conosco!',
  bannerCaptionPlaceholder: 'Digite a legenda do banner',
  backTitlePlaceholder: 'CATÁLOGO INTEGRADO',
  backTextPlaceholder: 'Texto da contracapa',
};
LOCALES.es.backCover = {
  text: 'El Catálogo Integrado apoya a las instituciones socias en la curaduría de contenidos, ofreciendo búsqueda por Inteligencia Artificial, filtros por nivel de enseñanza, área, curso o disciplina y búsqueda por palabra clave o programa.',
  cta: '¿Aún no utiliza el Catálogo Integrado en su institución educativa? ¡Contáctenos!',
  bannerCaptionPlaceholder: 'Escriba el pie de foto del banner',
  backTitlePlaceholder: 'CATÁLOGO INTEGRADO',
  backTextPlaceholder: 'Texto de la contraportada',
};

const _userModifiedFields = new Set();
['cover-banner-caption', 'back-title', 'back-text', 'back-cta'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => _userModifiedFields.add(id));
});

function updateFieldsForLocale(lang) {
  const bc = (LOCALES[lang] || LOCALES.pt).backCover;
  if (!bc) return;
  [
    { id: 'cover-banner-caption', key: 'bannerCaptionPlaceholder', attr: 'placeholder' },
    { id: 'back-title',           key: 'backTitlePlaceholder',     attr: 'placeholder' },
    { id: 'back-text',            key: 'text',                     attr: 'value' },
    { id: 'back-cta',             key: 'cta',                      attr: 'value' },
  ].forEach(({ id, key, attr }) => {
    if (_userModifiedFields.has(id)) return;
    const el = document.getElementById(id);
    if (!el || bc[key] === undefined) return;
    el[attr] = bc[key];
  });
}

const RESERVED_BOTTOM_MM = 12;


function mmToPx(mm){
  const el = document.createElement('div');
  el.style.position = 'absolute';
  el.style.visibility = 'hidden';
  el.style.height = mm + 'mm';
  document.body.appendChild(el);
  const px = el.getBoundingClientRect().height || el.offsetHeight || 0;
  document.body.removeChild(el);
  return px;
}

function normalizeRows(rawRows){
  const norm = rawRows.slice(1).map(r => ({
    macroarea: (r[0]||"").toString().trim(),
    microarea: (r[1]||"").toString().trim(),
    nome: (r[2]||"").toString().trim(),
    id_pratica: (r[3]||"").toString().trim(),
    
    
    novo: (()=>{
      const f = (r[4]||"").toString().trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
      return f === 'LANCAMENTO' || f === 'LANZAMIENTO';
    })(),
    id_catalogo: (r[6]||"").toString().trim()
  }));

  let lastMacro = "", lastMicro = "";
  norm.forEach(row=>{
    if(row.macroarea) lastMacro = row.macroarea;
    else row.macroarea = lastMacro;
    if(row.microarea) lastMicro = row.microarea;
    else row.microarea = lastMicro;
  });
  return norm.filter(r=>r.nome);
}

function groupRows(rows){
  const tree = {};
  rows.forEach(r=>{
    const m=r.macroarea||"Outros", s=r.microarea||"Geral";
    if(!tree[m]) tree[m]={};
    if(!tree[m][s]) tree[m][s]=[];
    tree[m][s].push(r);
  });
  return tree;
}


function fixPageOverflows(){
  const pages = Array.from(preview.querySelectorAll('.page:not(.cover-page)'));
  if(!pages.length) return;

  
  const TOLERANCE = 2;

  for(let i=0;i<pages.length;i++){
    let page = pages[i];
    
    
    while(true){
      const pageRect = page.getBoundingClientRect();
      const tbody = page.querySelector('tbody');
      if(!tbody) break;
      const rows = Array.from(tbody.children);
      if(rows.length === 0) break;

      const overflowIndex = rows.findIndex(tr => {
        const rRect = tr.getBoundingClientRect();
        return rRect.bottom > pageRect.top + page.clientHeight - TOLERANCE;
      });

      if(overflowIndex === -1) break; 

      
      let nextPage = pages[i+1];
      if(!nextPage){
        
        nextPage = document.createElement('section');
        nextPage.className = 'page';
        nextPage.style.position = 'relative';
        nextPage.style.padding = '18px 0 28px';
        const stripe = document.createElement('div');
        stripe.className = 'faixa-esquerda';
        stripe.setAttribute('aria-hidden','true');
  // layout and colors for the stripe are controlled by CSS in templates/templates.css
        nextPage.appendChild(stripe);
        const wrap2 = document.createElement('div');
        wrap2.className = 'wrap';
  wrap2.innerHTML = '<section><table><colgroup><col style="width:72%;"/><col style="width:6%;"/><col style="width:11%;"/><col style="width:11%;"/></colgroup><tbody></tbody></table></section>';
        nextPage.appendChild(wrap2);
        page.parentNode.insertBefore(nextPage, page.nextSibling);
        pages.splice(i+1,0,nextPage);
      }

      const nextTbody = nextPage.querySelector('tbody');

      
      const toMove = rows.slice(overflowIndex);

      
      const first = toMove[0];
      const prev = first.previousElementSibling;
      if(prev && prev.classList && prev.classList.contains('group-header')){
        
        if(prev.nextElementSibling === first){
          toMove.unshift(prev);
        }
      }

      
      toMove.forEach(node => nextTbody.appendChild(node));

      
    }
  }
}

function shrinkOverflowingCells(minPx = 9) {
  
  const trs = preview.querySelectorAll('tbody tr');
  trs.forEach(tr => {
    const td = tr.querySelector('td[data-label="Nome do laboratório"]') || tr.querySelector('td:first-child');
    if(!td) return;
    
    td.style.fontSize = '';
    
    let computed = window.getComputedStyle(td);
    let fontSize = parseFloat(computed.fontSize);
    
    while(td.scrollHeight > td.clientHeight && fontSize > minPx) {
      fontSize = Math.max(minPx, fontSize - 0.6);
      td.style.fontSize = fontSize + 'px';
      
      if(fontSize <= minPx) break;
    }
  });
} 
// INSERE A CAPA
function insertUnifiedCoverPage(preview, data, locale) {
  const {
    version,
    newLabs,
    totalLabs,
    byArea
  } = data;
  locale = locale || LOCALES.pt;

  const page = document.createElement('section');
  page.className = 'page cover-page';
  page.style.position = 'relative';
  page.style.padding = '18px 0 28px';

  
  const stripe = document.createElement('div');
  stripe.className = 'faixa-esquerda cover-stripe';
  stripe.setAttribute('aria-hidden','true');
  page.appendChild(stripe);

  const cover = locale.cover || LOCALES.pt.cover;
  page.innerHTML += `
    <div class="cover-wrap">

      <!-- HEADER -->
      <header class="cover-header">
        <h1>${cover.title}</h1>
        ${version ? `<span class="cover-version">v${version}</span>` : ''}
        <img class="cover-logo" src="images/algetec.svg" alt="Algetec">
      </header>

      <!-- MÉTRICAS -->
      <section class="cover-metrics">
        <div class="metric-card highlight">
          <span class="metric-value">${totalLabs}</span>
          <span class="metric-label">${cover.metrics.totalLabel}</span>
        </div>
        <div class="metric-card primary">
          <span class="metric-value">${newLabs}</span>
          <span class="metric-label">${cover.metrics.newLabel}</span>
        </div>
      </section>

      <!-- BANNER -->
      <div class="cover-banner">
        <img
          src="${data.frontImage || 'images/banner.png'}"
          alt="${cover.bannerAlt}"
        />
        ${data.bannerCaption ? `<p class="cover-banner-caption">${data.bannerCaption}</p>` : ''}
      </div>

      <!-- ÁREAS -->
      <section class="cover-areas">

        <div class="area-pill saude">
          <img src="images/saude.svg" alt="" />
          <div class="area-info">
            <span class="area-name">${cover.areas.saude}</span>
            <strong class="area-count">${byArea.saude}</strong>
            <span class="area-label">${cover.areaLabel}</span>
          </div>
        </div>

        <div class="area-pill exatas">
          <img src="images/engenharias.svg" alt="" />
          <div class="area-info">
            <span class="area-name">${cover.areas.exatas}</span>
            <strong class="area-count">${byArea.exatas}</strong>
            <span class="area-label">${cover.areaLabel}</span>
          </div>
        </div>

        <div class="area-pill naturais">
          <img src="images/cienciasnaturais.svg" alt="" />
          <div class="area-info">
            <span class="area-name">${cover.areas.naturais}</span>
            <strong class="area-count">${byArea.naturais}</strong>
            <span class="area-label">${cover.areaLabel}</span>
          </div>
        </div>

        <div class="area-pill humanas">
          <img src="images/humanas.svg" alt="" />
          <div class="area-info">
            <span class="area-name">${cover.areas.humanas}</span>
            <strong class="area-count">${byArea.humanas}</strong>
            <span class="area-label">${cover.areaLabel}</span>
          </div>
        </div>

      </section>

    </div>
  `;

  
  const logo = document.createElement('img');
  logo.src = 'images/algetec.svg';
  logo.style.display = 'none';
  logo.style.width = '0%';  

  page.appendChild(logo);
  preview.appendChild(page);
}

// INSERE A CONTRACAPA

function insertBackCoverPage(preview, options = {}) {
  const {
    image = '',
    title = '',
    text = '',
    cta = ''
  } = options;

  const page = document.createElement('section');
  page.className = 'page back-cover-page';
  page.style.position = 'relative';
  page.style.padding = '0';

  // faixa lateral
  const stripe = document.createElement('div');
  stripe.className = 'faixa-esquerda';
  stripe.setAttribute('aria-hidden', 'true');
  // faixa lateral styling moved to templates/templates.css; back-cover uses .back-cover-page override

  page.appendChild(stripe);

  page.innerHTML += `
    <div class="back-cover-wrap">

      <div class="back-cover-content">
        <h2>${title}</h2>
        <p>${text}</p>
      </div>

      <div class="back-cover-image">
        <img src="${image}" alt="Catálogo Integrado">
      </div>

      <footer class="back-cover-cta">
        <a href="http://suporte-contato.algetec.com.br/"><span class="back-cover-cta-inline">
          <img src="images/WhatsApp.svg">
          ${cta}
        </span></a>
      </footer>

    </div>
  `;

  preview.appendChild(page);
}



function readFile(file){
  return new Promise((resolve, reject)=>{
    const name=file.name.toLowerCase();
    if(name.endsWith(".csv")){
      const reader=new FileReader();
      reader.onload=e=>{
        const result=Papa.parse(e.target.result,{header:false,skipEmptyLines:true});
        resolve(result.data);
      };
      reader.onerror = ()=> reject(new Error('Erro leitura CSV'));
      reader.readAsText(file,"utf-8");
    } else {
      const reader=new FileReader();
      reader.onload=e=>{
        const wb=XLSX.read(new Uint8Array(e.target.result),{type:"array"});
        const sheet=wb.Sheets[wb.SheetNames[0]];
        resolve(XLSX.utils.sheet_to_json(sheet,{header:1,defval:""}));
      };
      reader.onerror = ()=> reject(new Error('Erro leitura XLSX'));
      reader.readAsArrayBuffer(file);
    }
  });
}

let lastRenderPromise = null;


async function renderCatalog({ rows, tree, lmsUrl }) {

  if (!Array.isArray(rows) || !rows.length) {
    console.error('renderCatalog: rows inválido', rows);
    alert('Erro: dados do catálogo não encontrados.');
    return;
  }

  if (!tree || typeof tree !== 'object') {
    console.error('renderCatalog: tree inválido', tree);
    alert('Erro: estrutura do catálogo inválida.');
    return;
  }

  const preview = document.getElementById('preview');
  preview.innerHTML = "";

  
  
  

  let saude = 0;
  let exatas = 0;
  let naturais = 0;
  let humanas = 0;

  rows.forEach(r => {
    const macro = (r.macroarea || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .trim();

    if (macro.includes('SAUDE') || macro.includes('SALUD')) {
      saude++;
    } else if (
      macro.includes('ENGENHARIA') ||
      macro.includes('EXATA') ||
      macro.includes('EXACTA') ||
      macro.includes('ARQUITETURA') ||
      macro.includes('INGENIERIA')
    ) {
      exatas++;
    } else if (
      macro.includes('CIENCIAS NATURAIS') ||
      macro.includes('CIÊNCIAS NATURAIS') ||
      macro.includes('CIENCIAS NATURALES') ||
      macro.includes('NATURAIS')
    ) {
      naturais++;
    } else if (
      macro.includes('HUMANAS') ||
      macro.includes('HUMANIDADES')
    ) {
      humanas++;
    }
  });

  const totalLabs = saude + exatas + naturais + humanas;

  
  
  

  const versionInput = document.getElementById('catalogVersion');
  const version = versionInput && versionInput.value.trim()
    ? versionInput.value.trim()
    : '';

  
  
  

  const newLabs = rows.filter(r => r.novo === true).length;

  
  
  

  // determinar idioma/locale antes de inserir a capa
  const selectedLang = (langSelect && langSelect.value) || 'pt';
  const locale = LOCALES[selectedLang] || LOCALES.pt;

  // support custom front cover image if provided via the UI
  const frontImageInput = document.getElementById('front-image-input');
  let frontImageUrl = null;
  if(frontImageInput && frontImageInput.files && frontImageInput.files[0]){
    try{ frontImageUrl = URL.createObjectURL(frontImageInput.files[0]); }catch(e){ frontImageUrl = null; }
  }

  const bannerCaptionInput = document.getElementById('cover-banner-caption');
  const bannerCaption = bannerCaptionInput ? bannerCaptionInput.value.trim() : '';

  insertUnifiedCoverPage(preview, {
    version,
    newLabs,
    totalLabs,
    frontImage: frontImageUrl,
    bannerCaption,
    byArea: {
      saude,
      exatas,
      naturais,
      humanas
    }
  }, locale);
  ensureTemplatesCSS();
  ensureCatalogCSS();
  // inserir contracapa logo após a capa (valores vindos dos campos no index)
  try{
  const backImageInput = document.getElementById('back-image-input');
    let backImageUrl = null;
    if(backImageInput && backImageInput.files && backImageInput.files[0]){
      try{
        backImageUrl = URL.createObjectURL(backImageInput.files[0]);
      }catch(e){ backImageUrl = null; }
    }
    const _bcFallback = (LOCALES[selectedLang] || LOCALES.pt).backCover || LOCALES.pt.backCover;
    const backTitle = (document.getElementById('back-title') && document.getElementById('back-title').value.trim()) || _bcFallback.backTitlePlaceholder;
    const backText = (document.getElementById('back-text') && document.getElementById('back-text').value.trim()) || _bcFallback.text;
    const backCta = (document.getElementById('back-cta') && document.getElementById('back-cta').value.trim()) || _bcFallback.cta;
    const _defaultBackImage = selectedLang === 'es' ? 'images/catalogo-integrado-es.png' : 'images/catalogo-integrado.png';
    const showIntegratedCatalogPage = showIntegratedPageInput ? showIntegratedPageInput.checked : true;
    if (showIntegratedCatalogPage) {
      insertBackCoverPage(preview, { image: backImageUrl || _defaultBackImage, title: backTitle, text: backText, cta: backCta });
    }
  }catch(e){ console.warn('Falha ao inserir contracapa:', e); }
  
  const _prevDisplay = preview.style.display;
  const _prevVisibility = preview.style.visibility;
  const _prevPosition = preview.style.position;
  const _prevLeft = preview.style.left;

  preview.style.display = 'block';
  preview.style.visibility = 'hidden';
  preview.style.position = 'absolute';
  preview.style.left = '-9999px';

   // selectedLang and locale were already defined earlier (used for the cover)
   const order = locale.order;
   const macros = Object.keys(tree);
   const sorted = order.filter(o=>macros.includes(o)).concat(macros.filter(m=>!order.includes(m)));

   
   const hasPratica = rows.some(r => (r.id_pratica || '').toString().trim() !== '');
   const hasCatalogo = rows.some(r => (r.id_catalogo || '').toString().trim() !== '');
   const hasNovo = rows.some(r => !!r.novo);
   const visibleCols = ['name'].concat(hasNovo?['pill']:[], hasPratica?['id_pratica']:[], hasCatalogo?['id_catalogo']:[]);

   function buildColgroupHtml(cols){
     const others = Math.max(0, cols.length - 1);
     
     const namePct = Math.max(50, 100 - others * 12);
     const remaining = 100 - namePct;
     const otherPct = others > 0 ? (remaining / others) : 0;
     let parts = [];
     parts.push(`<col style="width:${namePct}%;"/>`);
     for(let i=0;i<others;i++) parts.push(`<col style="width:${otherPct}%;"/>`);
     return `<colgroup>${parts.join('')}</colgroup>`;
   }

   function buildTheadHtml(cols){
     const headers = {
       name: locale.headers.name,
       pill: locale.headers.empty || '',
       id_pratica: locale.headers.idPratica,
       id_catalogo: locale.headers.idCatalogo
     };
     return `<thead><tr>` + cols.map(c => `<th${c==='pill' ? ' aria-hidden="true"' : ''}>${headers[c] || ''}</th>`).join('') + `</tr></thead>`;
   }

   const palettes = {
     "CIÊNCIAS NATURAIS": { main:'#035C55', mid:'#11C16C', light:'#6BEC94', icon:'cienciasnaturais.svg' },
     "SAÚDE": { main:'#510404', mid:'#BF1623', light:'#EB7E71', icon:'saude.svg' },
     "ENGENHARIAS E ARQUITETURA": { main:'#0F52BA', mid:'#1D8EEA', light:'#39A3EF', icon:'engenharias.svg' },
     "HUMANAS": { main:'#A36405', mid:'#E39C0A', light:'#F6D169', icon:'humanas.svg' },
     "default": { main:'#510404', mid:'#BF1623', light:'#EB7E71', icon:'saude.svg' }
   };

  
  function normalizeKey(s){
    if(!s) return '';
    return s.toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().trim();
  }

  
  const normalizedPalettes = {};
  Object.keys(palettes).forEach(k => {
    normalizedPalettes[normalizeKey(k)] = palettes[k];
  });
  
  normalizedPalettes[normalizeKey('SALUD')] = palettes['SAÚDE'];
  normalizedPalettes[normalizeKey('CIENCIAS NATURALES')] = palettes['CIÊNCIAS NATURAIS'];
  normalizedPalettes[normalizeKey('INGENIERÍAS Y CIENCIAS EXACTAS')] = palettes['ENGENHARIAS E ARQUITETURA'];
  normalizedPalettes[normalizeKey('HUMANIDADES Y CIENCIAS SOCIALES APLICADAS')] = palettes['HUMANAS'];
  normalizedPalettes[normalizeKey('HUMANAS / SOCIAIS APLICADAS')] = palettes['HUMANAS'];
  function paletteFor(macro){
    const nk = normalizeKey(macro);
    return normalizedPalettes[nk] || palettes.default;
  }
 
   const MAX_LABS_PER_PAGE = 14; 

   function buildItemsByGroup(groups){
     return Object.keys(groups).map(name => ({ name, rows: groups[name].slice() }));
   }

   
   function paginateGroups(groupsArr, limit){
     const pages = [];
     let currentPage = { items: [], labsUsed: 0 };

     function pushCurrentIfAny(){
       if(currentPage.items.length){
         pages.push(currentPage);
         currentPage = { items: [], labsUsed: 0 };
       }
     }

     const headerCost = 1; 
     const rowsPerFragment = Math.max(1, limit - headerCost);

     
     function planGroupFragments(totalRows, limit, currentLabsUsed){
       const planned = [];
       let rowsLeft = totalRows;
       let labsUsed = currentLabsUsed;
       while(rowsLeft > 0){
         const remaining = limit - labsUsed;
         const totalNeededIfWhole = headerCost + rowsLeft;
         if(labsUsed === 0){
           if(totalNeededIfWhole <= limit){
             planned.push(rowsLeft);
             labsUsed += headerCost + rowsLeft;
             rowsLeft = 0;
             break;
           } else {
             const take = Math.min(rowsPerFragment, rowsLeft);
             planned.push(take);
             rowsLeft -= take;
             labsUsed += headerCost + take;
             
             labsUsed = 0;
             continue;
           }
         }

         if(totalNeededIfWhole <= remaining){
           planned.push(rowsLeft);
           labsUsed += headerCost + rowsLeft;
           rowsLeft = 0;
           break;
         }

         if(totalNeededIfWhole <= limit){
           if(remaining > 0 && remaining <= 3){
             labsUsed = 0;
             continue;
           }
           const usableForData = Math.max(0, remaining - headerCost);
           if(usableForData > 0){
             const take = Math.min(usableForData, rowsLeft);
             planned.push(take);
             rowsLeft -= take;
             labsUsed += headerCost + take;
             if(labsUsed >= limit){
               labsUsed = 0;
             }
             continue;
           } else {
             labsUsed = 0;
             continue;
           }
         }

         if(remaining > 0 && remaining <= 3){
           labsUsed = 0;
           continue;
         }

         const usable = Math.max(0, remaining - headerCost);
         if(usable > 0){
           const take = Math.min(usable, rowsLeft);
           planned.push(take);
           rowsLeft -= take;
           labsUsed += headerCost + take;
           if(labsUsed >= limit){
             labsUsed = 0;
           }
           continue;
         }

         labsUsed = 0;
       }
       return planned;
     }

     for(const group of groupsArr){
       let rows = group.rows.slice();
       const totalRows = rows.length;
       const planned = planGroupFragments(totalRows, limit, currentPage.labsUsed);
       const fragTotal = Math.max(1, planned.length);
       const needsFragments = fragTotal > 1;
       let fragIndex = 1;
       let planIdx = 0;

       
       function insertChunk(asFrag, chunk){
         if(asFrag){
           currentPage.items.push({ type: 'group-frag', name: group.name, fragIndex, fragTotal });
         } else {
           currentPage.items.push({ type: 'group', name: group.name });
         }
         for(const r of chunk) currentPage.items.push({ type: 'row', row: r });
         currentPage.labsUsed += headerCost + chunk.length;
       }

       
       while(rows.length > 0){
         const remaining = limit - currentPage.labsUsed;
         const rowsRemaining = rows.length;
         const totalNeededIfWhole = headerCost + rowsRemaining;

         
         if(currentPage.labsUsed === 0){
           if(totalNeededIfWhole <= limit){
             
             const asFrag = needsFragments && fragIndex > 1;
             const takePlanned = planned[planIdx] || rowsRemaining;
             insertChunk(asFrag, rows.splice(0, takePlanned));
             planIdx++;
             if(asFrag) fragIndex++;
             
             if(currentPage.labsUsed >= limit) pushCurrentIfAny();
             break;
           } else {
             
             const takePlanned = planned[planIdx] || Math.min(rowsPerFragment, rows.length);
             insertChunk(true, rows.splice(0, takePlanned));
             planIdx++;
             fragIndex++;
             
             pushCurrentIfAny();
             continue;
           }
         }

         
         if(totalNeededIfWhole <= remaining){
           
           const asFrag = needsFragments; 
           const takePlanned = planned[planIdx] || rowsRemaining;
           insertChunk(asFrag, rows.splice(0, takePlanned));
           planIdx++;
           if(asFrag) fragIndex++;
           
           if(currentPage.labsUsed >= limit) pushCurrentIfAny();
           break;
         }

         
         if(totalNeededIfWhole <= limit){
           
           if(remaining > 0 && remaining <= 3){
             pushCurrentIfAny();
             continue; 
           }
           
           const usableForData = Math.max(0, remaining - headerCost);
           if(usableForData > 0){
             const takePlanned = planned[planIdx] || Math.min(usableForData, rows.length);
             insertChunk(true, rows.splice(0, takePlanned));
             planIdx++;
             fragIndex++;
             if(currentPage.labsUsed >= limit) pushCurrentIfAny();
             continue;
           } else {
             
             pushCurrentIfAny();
             continue;
           }
         }

         
         
         if(remaining > 0 && remaining <= 3){
           pushCurrentIfAny();
           continue;
         }

         
         const usable = Math.max(0, remaining - headerCost);
         if(usable > 0){
           const takePlanned = planned[planIdx] || Math.min(usable, rows.length);
           insertChunk(true, rows.splice(0, takePlanned));
           planIdx++;
           fragIndex++;
           if(currentPage.labsUsed >= limit) pushCurrentIfAny();
           continue;
         }

         
         pushCurrentIfAny();
       } 

      
      if(currentPage.labsUsed >= limit) pushCurrentIfAny();
    }

    
    if(currentPage.items.length) pages.push(currentPage);
    return pages;
  }

  
  function measureRowsPerPage(palette, lmsUrl){
    
    const meas = document.createElement('div');
    meas.style.position = 'absolute';
    meas.style.visibility = 'hidden';
    meas.style.left = '-9999px';
    meas.style.top = '0';

    
    
    
    
    const lmsLink = lmsUrl ? `<a class="link-lms" style="display:inline-block;padding:6px 10px;border-radius:6px;background:linear-gradient(to right, ${palette.main}, ${palette.mid});color:#fff;">LMS</a>` : '';
    meas.innerHTML = `
      <div class="page" style="height:297mm; box-sizing:border-box; padding:18px 0 28px;">
        <div class="wrap header-bar" style="margin-bottom:6px; display:flex; align-items:center; gap:12px;">
          <div class="titulo"><img src="images/${palette.icon}" width="48" height="48" alt="" />${"TÍTULO"}</div>
          ${lmsLink}
        </div>
        <div class="wrap">
          <section>
            <table style="width:100%; border-collapse:collapse;"><colgroup><col style="width:72%"/><col style="width:6%"/><col style="width:11%"/><col style="width:11%"/></colgroup>
              <thead><tr><th style="padding:0;">h</th><th></th><th>h</th><th>h</th></tr></thead>
              <tbody>
                <tr><td style="padding:8px 16px;">Exemplo de linha</td><td></td><td style="padding:8px 16px;">1</td><td style="padding:8px 16px;">2</td></tr>
              </tbody>
            </table>
          </section>
        </div>
      </div>
    `;
    document.body.appendChild(meas);
    const pageEl = meas.querySelector('.page');
    const headerEl = meas.querySelector('.wrap.header-bar');
    const rowEl = meas.querySelector('tbody tr');

    
    const pageHeightPx = (pageEl.getBoundingClientRect().height || pageEl.offsetHeight) || 1;
    const headerHeightPx = (headerEl.getBoundingClientRect().height || headerEl.offsetHeight) || 0;
    const rowHeightPx = (rowEl.getBoundingClientRect().height || rowEl.offsetHeight) || 1;

    
    
    const topPadding = 18; 
    const bottomPadding = 28; 
    const availablePx = Math.max(0, pageHeightPx - headerHeightPx - topPadding - bottomPadding - 2); 

    
    let rows = Math.floor(availablePx / rowHeightPx);

    
    if(rows > 1) rows = Math.max(1, rows - 0); 

    document.body.removeChild(meas);
    
    return Math.min(Math.max(1, rows), MAX_LABS_PER_PAGE);
  }

  sorted.forEach(macro=>{
    const palette = paletteFor(macro);
    const groups = tree[macro] || {};
    const groupsArr = buildItemsByGroup(groups);

    
    const rowsPerPage = measureRowsPerPage(palette, lmsUrl);

    if(groupsArr.length === 0){
      const container = document.createElement('section');
      container.className = 'page';
      container.style.position = 'relative';
      container.style.padding = '18px 0 16px';

      const stripe = document.createElement('div');
      stripe.className = 'faixa-esquerda';
      stripe.setAttribute('aria-hidden','true');
      try{
        container.style.setProperty('--stripe-main', palette.main);
        container.style.setProperty('--stripe-mid', palette.mid);
        container.style.setProperty('--stripe-light', palette.light);
      }catch(e){}
      container.appendChild(stripe);

      const headerBar = document.createElement('div');
      headerBar.className = 'wrap header-bar';
      headerBar.style.marginBottom = '12px';
      const lmsHref = lmsUrl || '#';
      const lmsLinkHtml = lmsUrl ? `<a class="link-lms" href="${lmsHref}" style="display:inline-block;background:linear-gradient(to right, ${palette.main}, ${palette.mid});color:#fff;padding:10px 16px;border-radius:8px;font-weight:700;">${locale.linkText}</a>` : '';
      headerBar.innerHTML = `
        <div class="titulo"><img src="images/${palette.icon}" alt="" width="48" height="48" />${macro}</div>
        ${lmsLinkHtml}
      `;
      container.appendChild(headerBar);

      const wrap = document.createElement('div');
      wrap.className = 'wrap';
  
  wrap.innerHTML = `<section aria-labelledby="catalogo-${macro}"><table>${buildColgroupHtml(visibleCols)}${buildTheadHtml(visibleCols)}<tbody></tbody></table></section>`;
      container.appendChild(wrap);
      preview.appendChild(container);
      return;
    }

    const pages = paginateGroups(groupsArr, rowsPerPage);

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      const pageObj = pages[pageIndex];
      if (!pageObj || !Array.isArray(pageObj.items) || pageObj.items.length === 0) continue;

      const container = document.createElement('section');
      container.className = 'page';
      container.style.position = 'relative';
      container.style.padding = '18px 0 28px';

      const stripe = document.createElement('div');
      stripe.className = 'faixa-esquerda';
      stripe.setAttribute('aria-hidden','true');
      // set palette colors as CSS variables on the container so templates.css can build the gradient
      try{
        container.style.setProperty('--stripe-main', palette.main);
        container.style.setProperty('--stripe-mid', palette.mid);
        container.style.setProperty('--stripe-light', palette.light);
      }catch(e){}
      container.appendChild(stripe);

      const totalMacroPages = pages.length;
      const headerBar = document.createElement('div');
      headerBar.className = 'wrap header-bar';
      headerBar.style.marginBottom = '12px';

      const titulo = document.createElement('div');
      titulo.className = 'titulo';
      titulo.style.display = 'inline-flex';
      titulo.style.alignItems = 'center';
      titulo.style.gap = '12px';
      titulo.style.fontWeight = '800';
      titulo.style.fontSize = '26px';
      titulo.style.textTransform = 'uppercase';
      const img2 = document.createElement('img');
      img2.src = 'images/' + palette.icon;
      img2.width = 48;
      img2.height = 48;
      img2.alt = '';
      titulo.appendChild(img2);
      titulo.appendChild(document.createTextNode(macro + (totalMacroPages > 1 ? ' — ' + (pageIndex+1) + '/' + totalMacroPages : '')));
      headerBar.appendChild(titulo);

      if(lmsUrl){
        const link2 = document.createElement('a');
        link2.className = 'link-lms';
        
        link2.href = lmsUrl || '#';
        link2.style.display = 'inline-block';
        link2.style.background = `linear-gradient(to right, ${palette.main}, ${palette.mid})`;
        link2.style.color = '#fff';
        link2.style.textDecoration = 'none';
        link2.style.fontWeight = '700';
        link2.style.fontSize = '15px';
        link2.style.padding = '10px 16px';
        link2.style.borderRadius = '8px';
    link2.textContent = locale.linkText;
        headerBar.appendChild(link2);
      }

      container.appendChild(headerBar);

      const wrap2 = document.createElement('div');
      wrap2.className = 'wrap';
  
  wrap2.innerHTML = '<section aria-labelledby="catalogo-' + macro + '"><table aria-describedby="catalogo-' + macro + '">' + buildColgroupHtml(visibleCols) + buildTheadHtml(visibleCols) + '<tbody></tbody></table></section>';
      container.appendChild(wrap2);

      const tbody = wrap2.querySelector('tbody');

      pageObj.items.forEach(it => {
        if(it.type === 'group'){
          const gtr = document.createElement('tr');
          gtr.className = 'group-header';
          const gth = document.createElement('th');
          gth.setAttribute('scope','colgroup');
          gth.setAttribute('colspan', String(visibleCols.length));
          gth.textContent = it.name;
          gth.style.background = 'linear-gradient(to right, ' + palette.main + ', ' + palette.mid + ')';
          gth.style.color = "#fff";
          gth.style.fontWeight = "700";
          gth.style.textAlign = "left";
          gth.style.padding = "10px 16px";
          gth.style.borderRadius = "8px";
          gtr.appendChild(gth);
          tbody.appendChild(gtr);
        } else if(it.type === 'group-frag'){
          const gtr = document.createElement('tr');
          gtr.className = 'group-header';
          const gth = document.createElement('th');
          gth.setAttribute('scope','colgroup');
          gth.setAttribute('colspan', String(visibleCols.length));
          const ind = it.fragTotal > 1 ? ' — ' + it.fragIndex + '/' + it.fragTotal : '';
          gth.textContent = it.name + ind;
          gth.style.background = 'linear-gradient(to right, ' + palette.main + ', ' + palette.mid + ')';
          gth.style.color = "#fff";
          gth.style.fontWeight = "700";
          gth.style.textAlign = "left";
          gth.style.padding = "10px 16px";
          gth.style.borderRadius = "8px";
          gtr.appendChild(gth);
          tbody.appendChild(gtr);
        } else if(it.type === 'row'){
          const r = it.row;
          const isNew = r.novo || r.nova || r.isNew || r.new;
          const tr = document.createElement('tr');

          const tdName = document.createElement('td');
          tdName.setAttribute('data-label','Nome do laboratório');
          tdName.textContent = r.nome || '';
          tr.appendChild(tdName);

          
          if(hasNovo){
            const tdPill = document.createElement('td');
            tdPill.setAttribute('data-label','');
            if(isNew){
              const pill = document.createElement('div');
              pill.className = 'pill';
              pill.setAttribute('role','status');
              pill.setAttribute('aria-label','Nova');
              try{ pill.style.setProperty('--pill-bg', palette.mid); } catch(e){}
              pill.innerHTML = '<span class="pill-text"><span class="star" aria-hidden="true">★</span><span>' + locale.pillText + '</span></span>';
              tdPill.appendChild(pill);
            }
            tr.appendChild(tdPill);
          }

          if(hasPratica){
            const tdPratica = document.createElement('td');
            tdPratica.setAttribute('data-label','ID prática');
            tdPratica.innerHTML = '<span class="valor">' + (r.id_pratica || '') + '</span>';
            tr.appendChild(tdPratica);
          }

          if(hasCatalogo){
            const tdCatalogo = document.createElement('td');
            tdCatalogo.setAttribute('data-label','ID catálogo integrado');
            tdCatalogo.innerHTML = '<span class="valor">' + (r.id_catalogo || '') + '</span>';
            tr.appendChild(tdCatalogo);
          }

          tbody.appendChild(tr);
        }
      });

      preview.appendChild(container);
    }
    
  });

  try { fixPageOverflows(); } catch(e){ console.warn('fixPageOverflows:', e); }
  try { shrinkOverflowingCells(9); } catch(e){ console.warn('shrinkOverflowingCells:', e); }

  // remove páginas sem linhas de dados reais (tbody vazio ou apenas com cabeçalho de grupo)
  try {
    preview.querySelectorAll('.page:not(.cover-page):not(.back-cover-page)').forEach(page => {
      const tbody = page.querySelector('tbody');
      if (!tbody) return;
      const hasDataRows = Array.from(tbody.children).some(tr => !tr.classList.contains('group-header'));
      if (!hasDataRows) page.remove();
    });
  } catch(e){ console.warn('empty-page cleanup:', e); }

  preview.style.display = _prevDisplay;
  preview.style.visibility = _prevVisibility;
  preview.style.position = _prevPosition;
  preview.style.left = _prevLeft;
}


function readFile(file){
  return new Promise((resolve, reject)=>{
    const name=file.name.toLowerCase();
    if(name.endsWith(".csv")){
      const reader=new FileReader();
      reader.onload=e=>{
        const result=Papa.parse(e.target.result,{header:false,skipEmptyLines:true});
        resolve(result.data);
      };
      reader.onerror = ()=> reject(new Error('Erro leitura CSV'));
      reader.readAsText(file,"utf-8");
    } else {
      const reader=new FileReader();
      reader.onload=e=>{
        const wb=XLSX.read(new Uint8Array(e.target.result),{type:"array"});
        const sheet=wb.Sheets[wb.SheetNames[0]];
        resolve(XLSX.utils.sheet_to_json(sheet,{header:1,defval:""}));
      };
      reader.onerror = ()=> reject(new Error('Erro leitura XLSX'));
      reader.readAsArrayBuffer(file);
    }
  });
}

fileInput.addEventListener("change", async ev=>{
  const file=ev.target.files[0];
  if(!file) return;
  messages.textContent="Lendo arquivo...";
  try{
    const raw=await readFile(file);
    const norm=normalizeRows(raw);
    const tree=groupRows(norm);
    
    
    const lmsUrl = (lmsLinkInput && lmsLinkInput.value || '').trim() || null;
    console.log('LMS URL captured:', lmsUrl);
    
    
    
    lastRenderPromise = renderCatalog({
      rows: norm,
      tree,
      lmsUrl
    });
    await lastRenderPromise;
    messages.textContent = (norm.length || 0) + " registros carregados.";
  }catch(err){
    messages.textContent = "Erro ao ler arquivo.";
    console.error(err);
  }
});

renderBtn.addEventListener("click", async ()=>{
  if(!fileInput.files.length){
    messages.textContent = "Selecione um arquivo CSV/Excel.";
    return;
  }
  
  messages.textContent = "Gerando catálogo...";
  
  
  const lmsUrl = (lmsLinkInput && lmsLinkInput.value || '').trim() || null;
  console.log('LMS URL at button click:', lmsUrl);
  
  // processar o arquivo diretamente aqui para evitar condição de corrida
  try{
    const file = fileInput.files[0];
    if(!file){
      messages.textContent = "Selecione um arquivo CSV/Excel.";
      return;
    }
    messages.textContent = "Lendo arquivo...";
    const raw = await readFile(file);
    const norm = normalizeRows(raw);
    const tree = groupRows(norm);
    lastRenderPromise = renderCatalog({ rows: norm, tree, lmsUrl });
    await lastRenderPromise;
    messages.textContent = (norm.length || 0) + " registros carregados.";
  }catch(err){
    messages.textContent = "Erro ao ler arquivo.";
    console.error(err);
    return;
  }
  
  const htmlContent = preview.innerHTML;
  const win = window.open("", "_blank");
  if(!win){
    messages.textContent = "Não foi possível abrir a janela de preview (bloqueador de pop-ups?).";
    return;
  }
  // obter versão atual (vem do campo no index) para incluir no título da janela
  const _versionInput = document.getElementById('catalogVersion');
  const _version = (_versionInput && _versionInput.value && _versionInput.value.trim()) ? _versionInput.value.trim() : '';
  win.document.open();
  win.document.write(`<!doctype html><html><head><title>Catálogo | Laboratórios Virtuais | v${_version}</title></head><body></body></html>`);
  win.document.close();
  try {
    
    const baseEl = win.document.createElement('base');
    baseEl.href = document.location.href;
    win.document.head.prepend(baseEl);

    
    const nodes = document.querySelectorAll('link[rel="stylesheet"], style');
    nodes.forEach(n => {
      win.document.head.appendChild(n.cloneNode(true));
    });
  } catch(e){
    console.warn('Não foi possível clonar estilos para o preview:', e);
  }
  
  win.document.body.innerHTML = htmlContent;
  // garantir inline object-position no preview (força topo se CSS/usuário alterar)
    try{
    const winImg = win.document.querySelector('.cover-banner img');
    if(winImg){
      try{ winImg.style.objectFit = 'cover'; }catch(e){}
      try{ winImg.style.setProperty('object-position','50% 0%','important'); }catch(e){}
      // fallback: reaplica por alguns ciclos até o primeiro pointerdown
      try{
        let _cnt = 0;
        const _int = win.setInterval(function(){
          try{ winImg.style.setProperty('object-position','50% 0%','important'); }catch(e){}
          _cnt++;
          if(_cnt > 12) win.clearInterval(_int);
        }, 40);
        winImg.addEventListener('pointerdown', function(){ try{ win.clearInterval(_int); }catch(e){} }, { once: true });
      }catch(e){}
    }
  }catch(e){ console.warn('Não foi possível forçar objectPosition no preview:', e); }
  // posicionar crop do banner antes da impressão (usando object-position)
  try{
    const dragScript = win.document.createElement('script');
    dragScript.type = 'text/javascript';
    dragScript.textContent = `(function(){
      function setup(){
        const container = document.querySelector('.cover-banner');
        if(!container) return;
        const img = container.querySelector('img');
        if(!img) return;
        container.style.position = container.style.position || 'relative';
        // garantir object-fit: cover
        try{ img.style.objectFit = 'cover'; }catch(e){}
        // inicial object-position — forçar topo
        img.style.setProperty('object-position','50% 0%','important');
        // fallback: reaplica por alguns ciclos até o primeiro pointerdown
        try{
          let _cnt2 = 0;
          const _int2 = setInterval(function(){
            try{ img.style.setProperty('object-position','50% 0%','important'); }catch(e){}
            _cnt2++;
            if(_cnt2 > 12) clearInterval(_int2);
          }, 40);
          container.addEventListener('pointerdown', function(){ try{ clearInterval(_int2); }catch(e){} }, { once: true });
        }catch(e){}
        img.style.cursor = 'grab';

        let startY = 0;
        let startPercent = 0; // 0..100

        function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

        function computeMaxShift(){
          const natW = img.naturalWidth || 1;
          const natH = img.naturalHeight || 1;
          const cW = container.clientWidth || 1;
          const cH = container.clientHeight || 1;
          const scale = Math.max(cW / natW, cH / natH);
          const renderedH = natH * scale;
          const maxShift = Math.max(0, renderedH - cH);
          return { renderedH, maxShift };
        }

        function getCurrentPercent(){
          let op = getComputedStyle(img).objectPosition || img.style.objectPosition || '50% 0%';
          // coerça valores genéricos/centrados para topo inicial
          if(/center/i.test(op) || /\b50%\s+50%\b/.test(op)) op = '50% 0%';
          const parts = op.split(/\s+/);
          const y = parts.length === 1 ? parts[0] : parts[1];
          if(y.endsWith('%')) return parseFloat(y);
          if(y.endsWith('px')){
            const px = parseFloat(y);
            const info = computeMaxShift();
            return info.maxShift ? clamp((px / info.maxShift) * 100, 0, 100) : 0;
          }
          return 0;
        }

        function setPercent(p){
          p = clamp(p, 0, 100);
          img.style.setProperty('object-position', '50% ' + p + '%', 'important');
        }

        function onPointerDown(e){
          e.preventDefault();
          startY = e.clientY;
          startPercent = getCurrentPercent();
          img.style.cursor = 'grabbing';
          window.addEventListener('pointermove', onPointerMove);
          window.addEventListener('pointerup', onPointerUp, { once: true });
        }

        function onPointerMove(e){
          const dy = e.clientY - startY;
          const info = computeMaxShift();
          if(info.maxShift <= 0) return;
          const deltaPercent = (dy / info.maxShift) * 100;
          setPercent(startPercent + deltaPercent);
        }

        function onPointerUp(){
          img.style.cursor = 'grab';
          window.removeEventListener('pointermove', onPointerMove);
        }

        container.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('resize', function(){ setPercent(getCurrentPercent()); });
        if(img.complete) setTimeout(function(){ setPercent(getCurrentPercent()); }, 50); else img.addEventListener('load', function(){ setPercent(getCurrentPercent()); });
      }
      if(document.readyState === 'complete' || document.readyState === 'interactive'){
        setTimeout(setup,30);
      } else {
        document.addEventListener('DOMContentLoaded', setup);
      }
    })();`;
    win.document.head.appendChild(dragScript);
  }catch(e){ console.warn('Não foi possível injetar script de arraste no preview:', e); }
  win.focus();

// Abre o menu de impressão automaticamente após abrir o preview
  try{
    let _printed = false;
    const triggerPrint = () => {
      if(_printed) return;
      _printed = true;
      try{ win.print(); }catch(e){ console.warn('Falha ao acionar print na janela de preview:', e); }
    };
    try{ win.addEventListener('load', triggerPrint, { once: true }); }catch(e){}
    setTimeout(triggerPrint, 600);
  }catch(e){ console.warn('Não foi possível agendar impressão automática:', e); }
});