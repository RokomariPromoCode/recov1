// app.js - responsive menu + hide-on-scroll + search + lazy load
const DATA_URL = 'data.json';
const BATCH_SIZE = 10;
let allData = [];
let index = 0;
let observer = null;

// small escaping helpers
function escapeHtml(s){ if(!s) return ''; return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escapeAttr(s){ if(!s) return ''; return s.replace(/"/g,'%22'); }

function placeholderSVG(){ return `<svg width="140" height="140" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet"><rect width="100%" height="100%" fill="#f4f6f8"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#b0b7bd" font-size="13">No image</text></svg>`; }

function createCard(item){
  const article = document.createElement('article');
  article.className = 'card';
  article.innerHTML = `
    <div class="card-content">
      <div class="media">${ item.img ? `<img src="${escapeAttr(item.img)}" alt="${escapeHtml(item.title)}" loading="lazy">` : placeholderSVG() }</div>
      <div class="body">
        <h3 class="title">${escapeHtml(item.title)}</h3>
        <div class="hr"></div>
        <p class="desc">${escapeHtml(item.desc || '')}</p>
        <div class="offer-row">
          <div class="offer-text">ডিসকাউন্ট পেতে এখানে কিনুন</div>
          <a class="btn" href="${escapeAttr(item.link)}" target="_blank" rel="noopener">Buy Now</a>
        </div>
      </div>
    </div>`;
  return article;
}

async function fetchData(){
  try{
    const res = await fetch(DATA_URL);
    if(!res.ok) throw new Error('HTTP '+res.status);
    allData = await res.json();
    document.getElementById('stats').textContent = `${allData.length} items`;
    loadNextBatch();
  }catch(err){
    console.error('Failed to load data.json', err);
    document.getElementById('stats').textContent = 'Failed to load items';
  }
}

function loadNextBatch(){
  const spinner = document.getElementById('spinner');
  const endMsg = document.getElementById('endMessage');
  spinner.hidden = false;
  setTimeout(()=>{
    const container = document.getElementById('cardsArea');
    const items = allData.slice(index, index + BATCH_SIZE);
    items.forEach(it => container.appendChild(createCard(it)));
    index += items.length;
    spinner.hidden = true;
    if(index >= allData.length){
      endMsg.hidden = false;
      if(observer && document.getElementById('sentinel')) observer.unobserve(document.getElementById('sentinel'));
    }
  }, 120);
}

function performSearch(q){
  q = (q||'').trim().toLowerCase();
  const container = document.getElementById('cardsArea');
  container.innerHTML = '';
  index = 0;
  document.getElementById('endMessage').hidden = true;

  if(!q){
    loadNextBatch();
    document.getElementById('stats').textContent = `${allData.length} items`;
    return;
  }

  const results = allData.filter(item => {
    const hay = (item.title + ' ' + (item.desc || '') + ' ' + (item.full_desc || '')).toLowerCase();
    return hay.includes(q);
  });

  document.getElementById('stats').textContent = `${results.length} matches`;
  results.forEach(it => container.appendChild(createCard(it)));
}

// ---------------- Menu & UI binding ----------------
function bindUI(){
  // desktop search (visible only on desktop)
  const desktopSearchBtn = document.getElementById('searchBtn');
  const desktopSearchInput = document.getElementById('globalSearch');
  if(desktopSearchBtn && desktopSearchInput){
    desktopSearchBtn.addEventListener('click', ()=> performSearch(desktopSearchInput.value));
    desktopSearchInput.addEventListener('keydown', (e)=> { if(e.key==='Enter') performSearch(desktopSearchInput.value); });
  }

  // mobile search inside slide menu
  const mobileSearchBtn = document.getElementById('mobileSearchBtn');
  const mobileSearchInput = document.getElementById('mobileSearch');
  if(mobileSearchBtn && mobileSearchInput){
    mobileSearchBtn.addEventListener('click', ()=> {
      performSearch(mobileSearchInput.value);
      closeMobileMenu();
    });
    mobileSearchInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ performSearch(mobileSearchInput.value); closeMobileMenu(); }});
  }

  // mobile menu open/close
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileClose = document.getElementById('mobileMenuClose');
  if(menuToggle && mobileMenu){
    menuToggle.addEventListener('click', ()=> mobileMenu.classList.add('open'));
  }
  if(mobileClose && mobileMenu){
    mobileClose.addEventListener('click', ()=> mobileMenu.classList.remove('open'));
  }

  // close mobile menu if user taps link (delegation)
  mobileMenu && mobileMenu.addEventListener('click', (ev)=>{
    if(ev.target && ev.target.tagName === 'A'){ mobileMenu.classList.remove('open'); }
  });
}

// close mobile menu helper
function closeMobileMenu(){ const mm = document.getElementById('mobileMenu'); mm && mm.classList.remove('open'); }

// ---------------- Header hide on scroll ----------------
let lastScroll = window.scrollY;
function initHeaderScrollHide(){
  const header = document.getElementById('siteHeader');
  let ticking = false;
  window.addEventListener('scroll', ()=>{
    if(!header) return;
    const current = window.scrollY;
    if(!ticking){
      window.requestAnimationFrame(()=>{
        if(current > lastScroll && current > 120){
          // scrolling down -> hide
          header.classList.add('hidden');
          header.classList.remove('visible');
        } else {
          // scrolling up -> show
          header.classList.remove('hidden');
          header.classList.add('visible');
        }
        lastScroll = current;
        ticking = false;
      });
      ticking = true;
    }
  });
}

// ---------------- IntersectionObserver for infinite load ----------------
function initObserver(){
  const sentinel = document.getElementById('sentinel');
  if(!sentinel) return;
  observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if(entry.isIntersecting) loadNextBatch(); });
  }, {rootMargin:'400px'});
  observer.observe(sentinel);
}

// ---------------- Init ----------------
document.addEventListener('DOMContentLoaded', async ()=>{
  bindUI();
  initHeaderScrollHide();
  await fetchData();
  initObserver();
});
