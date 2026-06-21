// ============================================================
// Nav background toggle (transparent over intro, solid after)
// ============================================================
(function(){
  const nav = document.querySelector('nav');
  const introEl = document.getElementById('intro');
  if(!nav) return;
  function toggleNav(){
    const introHeight = introEl ? introEl.offsetHeight : 0;
    const introBottom = introHeight - window.innerHeight;
    if(window.scrollY > introBottom - 4){
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', toggleNav, {passive:true});
  toggleNav();
})();

// ============================================================
// INTRO — scroll-driven brain video sequence
// ============================================================
(function(){
  const introSection = document.getElementById('intro');
  const video = document.getElementById('intro-video');
  const titleWrap = document.querySelector('.intro-title-wrap');
  const eyebrow = document.querySelector('.intro-eyebrow');
  const scrollCue = document.querySelector('.intro-scroll-cue');
  const vignette = document.querySelector('.intro-vignette');
  if(!introSection) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if(prefersReduced){
    // Static: show title immediately, skip scroll-linked effects
    if(titleWrap){ titleWrap.style.opacity = 1; titleWrap.style.transform = 'none'; }
    if(scrollCue) scrollCue.style.display = 'none';
    video.removeAttribute('autoplay');
    video.pause();
    video.currentTime = 0;
    return;
  }

  function clamp01(v){ return Math.max(0, Math.min(1, v)); }
  function lerp(a,b,t){ return a + (b-a)*t; }

  function update(){
    const rect = introSection.getBoundingClientRect();
    const total = introSection.offsetHeight - window.innerHeight;
    if(total <= 0) return;
    // progress 0 -> 1 across the whole pinned scroll distance
    const progress = clamp01(-rect.top / total);

    // Phase A (0 -> 0.22): brain settles in, cue visible
    // Phase B (0.18 -> 0.55): title fades/scales in over the brain
    // Phase C (0.55 -> 1.0): title + brain fade out together, revealing hero exactly as pin releases

    const titleT = clamp01((progress - 0.18) / 0.30);
    const fadeOutT = clamp01((progress - 0.55) / 0.45);
    const cueT = clamp01(progress / 0.10);

    // video subtle continuous scale-up (parallax depth) + fade near end
    const videoScale = lerp(1, 1.12, progress);
    const videoOpacity = lerp(1, 0, fadeOutT);
    video.style.transform = `translate(-50%,-50%) scale(${videoScale})`;
    video.style.opacity = videoOpacity;

    if(vignette) vignette.style.opacity = lerp(1, 0, fadeOutT);

    if(eyebrow) eyebrow.style.opacity = lerp(1, 0, clamp01((progress-0.4)/0.2));
    if(scrollCue) scrollCue.style.opacity = lerp(1, 0, cueT);

    if(titleWrap){
      titleWrap.style.opacity = lerp(0, 1, titleT) * (1 - fadeOutT);
      titleWrap.style.transform = `translateY(${lerp(18,0,titleT)}px) scale(${lerp(0.97,1,titleT)})`;
    }
  }

  let ticking = false;
  window.addEventListener('scroll', ()=>{
    if(!ticking){
      requestAnimationFrame(()=>{ update(); ticking = false; });
      ticking = true;
    }
  }, {passive:true});
  window.addEventListener('resize', update);
  update();

  // ensure video actually plays (some mobile browsers need a nudge)
  video.play().catch(()=>{});
})();

// ============================================================
// Mobile nav toggle
// ============================================================
const navToggle = document.getElementById('nav-toggle');
const navMobile = document.getElementById('nav-mobile');
navToggle.addEventListener('click', ()=>{
  const open = navMobile.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
  navToggle.textContent = open ? '✕' : '☰';
});
navMobile.querySelectorAll('a').forEach(a=>{
  a.addEventListener('click', ()=>{
    navMobile.classList.remove('open');
    navToggle.setAttribute('aria-expanded','false');
    navToggle.textContent = '☰';
  });
});

// ============================================================
// Reveal-on-scroll
// ============================================================
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
},{threshold:0.12});
revealEls.forEach(el=>io.observe(el));

// ============================================================
// HERO SVG — antibody (blue Y) binding antigen (red) on gold electrode
// ============================================================
const heroSVG = `
<svg viewBox="0 0 520 560" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Animated diagram of a blue antibody binding a red TDP-43 antigen above a gold electrode surface">
  <defs>
    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#E2C079"/>
      <stop offset="100%" stop-color="#8a6f2e"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#C9A24B" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#C9A24B" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3"/>
    </filter>
  </defs>

  <circle cx="260" cy="330" r="220" fill="url(#glow)"/>

  <!-- gold electrode base -->
  <g transform="translate(60,420)">
    <rect x="0" y="0" width="400" height="26" rx="3" fill="url(#goldGrad)"/>
    <rect x="0" y="0" width="400" height="26" rx="3" fill="none" stroke="#8a6f2e" stroke-width="1"/>
    <!-- hatch texture -->
    <g stroke="#0B1620" stroke-opacity="0.25" stroke-width="1">
      ${Array.from({length:22}).map((_,i)=>`<line x1="${i*19}" y1="2" x2="${i*19-10}" y2="24"/>`).join('')}
    </g>
  </g>
  <text x="260" y="470" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="11" letter-spacing="1.5" fill="#8C9BA8">GOLD ELECTRODE</text>

  <!-- SAM tick marks -->
  <g stroke="#5C6B78" stroke-width="1.5">
    ${Array.from({length:14}).map((_,i)=>`<line x1="${80+i*26}" y1="420" x2="${80+i*26}" y2="404"/>`).join('')}
  </g>

  <!-- three anchored antibodies (Y shapes), middle one active -->
  ${[ [140,0.55,false], [260,1,true], [380,0.55,false] ].map(([x,scale,active])=>`
    <g transform="translate(${x},404) scale(${active?1:scale})" opacity="${active?1:0.55}">
      <line x1="0" y1="0" x2="0" y2="-34" stroke="${active?'#4D7FB8':'#3B5876'}" stroke-width="4" stroke-linecap="round"/>
      <line x1="0" y1="-34" x2="-22" y2="-58" stroke="${active?'#4D7FB8':'#3B5876'}" stroke-width="4" stroke-linecap="round"/>
      <line x1="0" y1="-34" x2="22" y2="-58" stroke="${active?'#4D7FB8':'#3B5876'}" stroke-width="4" stroke-linecap="round"/>
      <circle cx="-22" cy="-58" r="4.5" fill="${active?'#E2C079':'#5C6B78'}"/>
      <circle cx="22" cy="-58" r="4.5" fill="${active?'#E2C079':'#5C6B78'}"/>
    </g>
  `).join('')}

  <!-- animated TDP-43 antigen approaching + binding to middle antibody -->
  <g id="antigen-group">
    <animateTransform attributeName="transform" type="translate"
      values="260,40; 260,40; 260,128; 260,128; 260,40"
      keyTimes="0; 0.35; 0.55; 0.85; 1"
      dur="4.5s" repeatCount="indefinite" calcMode="spline"
      keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0 0 0.2 1; 0.4 0 0.2 1"/>
    <circle cx="0" cy="0" r="17" fill="#C44536" filter="url(#soft)" opacity="0.9"/>
    <circle cx="0" cy="0" r="17" fill="none" stroke="#E15D4C" stroke-width="1.5"/>
    <circle cx="-5" cy="-4" r="3" fill="#E15D4C" opacity="0.8"/>
  </g>

  <!-- DPV pulse readout at bottom -->
  <g transform="translate(60,500)">
    <text x="0" y="-10" font-family="IBM Plex Mono, monospace" font-size="10" letter-spacing="1.2" fill="#5C6B78">DPV SIGNAL</text>
    <polyline points="0,30 40,30 50,4 60,30 110,30 120,4 130,30 180,30 190,4 200,30 250,30 260,4 270,30 320,30 330,4 340,30 400,30"
      fill="none" stroke="#C9A24B" stroke-width="1.5" opacity="0.7">
      <animate attributeName="stroke" values="#5C6B78;#C9A24B;#5C6B78" dur="4.5s" repeatCount="indefinite"/>
    </polyline>
  </g>
</svg>`;
document.getElementById('hero-svg-mount').innerHTML = heroSVG;

// ============================================================
// CROSSLINKER SVG — homobifunctional vs heterobifunctional
// ============================================================
const crosslinkerSVG = `
<svg viewBox="0 0 480 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagram comparing homobifunctional and heterobifunctional crosslinkers">
  <defs>
    <style>
      .lbl{font-family:'IBM Plex Mono', monospace; font-size:10.5px; fill:#8C9BA8; letter-spacing:0.5px;}
      .lbl-title{font-family:'IBM Plex Sans', sans-serif; font-size:13px; fill:#F2EDE2; font-weight:600;}
    </style>
  </defs>

  <!-- Homobifunctional -->
  <g transform="translate(40,40)">
    <text class="lbl-title" x="0" y="0">Homobifunctional</text>
    <text class="lbl" x="0" y="18">identical ends — no orientation control</text>
    <g transform="translate(20,55)">
      <circle cx="0" cy="20" r="14" fill="none" stroke="#4D7FB8" stroke-width="2"/>
      <text class="lbl" x="-5" y="24" fill="#4D7FB8">A</text>
      <line x1="14" y1="20" x2="166" y2="20" stroke="#C9A24B" stroke-width="2.5" stroke-dasharray="4 3"/>
      <circle cx="180" cy="20" r="14" fill="none" stroke="#4D7FB8" stroke-width="2"/>
      <text class="lbl" x="175" y="24" fill="#4D7FB8">A</text>
    </g>
  </g>

  <line x1="20" y1="170" x2="460" y2="170" stroke="#1B2A37" stroke-width="1"/>

  <!-- Heterobifunctional -->
  <g transform="translate(40,200)">
    <text class="lbl-title" x="0" y="0">Heterobifunctional <tspan fill="#C9A24B">— used here</tspan></text>
    <text class="lbl" x="0" y="18">different ends — directional, oriented binding</text>
    <g transform="translate(20,55)">
      <circle cx="0" cy="20" r="14" fill="none" stroke="#4D7FB8" stroke-width="2"/>
      <text class="lbl" x="-5" y="24" fill="#4D7FB8">A</text>
      <line x1="14" y1="20" x2="166" y2="20" stroke="#C9A24B" stroke-width="2.5"/>
      <polygon points="180,20 168,14 168,26" fill="#C9A24B"/>
      <rect x="186" y="6" width="28" height="28" rx="4" fill="none" stroke="#C44536" stroke-width="2"/>
      <text class="lbl" x="193" y="24" fill="#C44536">B</text>
    </g>
    <g transform="translate(20,110)">
      <text class="lbl" x="0" y="0" fill="#5C6B78">A → reacts with antibody amine</text>
      <text class="lbl" x="0" y="16" fill="#5C6B78">B → reacts with gold/electrode surface</text>
    </g>
  </g>
</svg>`;
document.getElementById('crosslinker-svg-mount').innerHTML = crosslinkerSVG;

// ============================================================
// LAYER BUILDER — 4 stacked layers, interactive
// ============================================================
const layerStage = document.getElementById('layer-svg-mount');
const layerItems = document.querySelectorAll('.layer-item');
const layerReadout = document.getElementById('layer-readout');
let currentLayer = 0;
const totalLayers = 4;

const layerDefs = [
  {name:'Gold electrode', color:'#C9A24B'},
  {name:'SAM coating', color:'#7A8B99'},
  {name:'Antibody layer', color:'#4D7FB8'},
  {name:'BSA blocking', color:'#D8D0BE'}
];

function renderStack(activeIdx){
  // Build cross-section: base electrode + stacked layers up to activeIdx, with antigen binding only when antibody layer (2) is active or beyond
  const w = 360, h = 420;
  let svg = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cross-section diagram of biosensor layer stack, currently showing layer ${activeIdx+1} of 4">`;

  const baseY = 340;
  const layerH = 26;

  // electrode (always present)
  svg += `<g>
    <rect x="40" y="${baseY}" width="280" height="32" rx="3" fill="#C9A24B"/>
    <g stroke="#0B1620" stroke-opacity="0.3" stroke-width="1">
      ${Array.from({length:16}).map((_,i)=>`<line x1="${50+i*17}" y1="${baseY+3}" x2="${50+i*17-9}" y2="${baseY+29}"/>`).join('')}
    </g>
    <text x="180" y="${baseY+50}" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="10.5" fill="#8C9BA8" letter-spacing="1">01 · GOLD ELECTRODE</text>
  </g>`;

  let y = baseY;

  // Layer 2: SAM (thin tick layer)
  if(activeIdx>=1){
    y -= 18;
    svg += `<g opacity="${activeIdx===1?1:0.85}">
      <rect x="40" y="${y}" width="280" height="14" fill="#1B2A37"/>
      <g stroke="#7A8B99" stroke-width="1.5">
        ${Array.from({length:28}).map((_,i)=>`<line x1="${44+i*10}" y1="${y+14}" x2="${44+i*10}" y2="${y+2}"/>`).join('')}
      </g>
      ${activeIdx===1?`<text x="330" y="${y+10}" font-family="IBM Plex Mono, monospace" font-size="9.5" fill="#7A8B99">SAM</text>`:''}
    </g>`;
  }

  // Layer 3: antibodies (Y shapes)
  if(activeIdx>=2){
    y -= 56;
    const xs = [80,130,180,230,280];
    svg += `<g opacity="${activeIdx===2?1:0.9}">
      ${xs.map(x=>`
        <line x1="${x}" y1="${y+56}" x2="${x}" y2="${y+24}" stroke="#4D7FB8" stroke-width="4" stroke-linecap="round"/>
        <line x1="${x}" y1="${y+24}" x2="${x-16}" y2="${y+2}" stroke="#4D7FB8" stroke-width="4" stroke-linecap="round"/>
        <line x1="${x}" y1="${y+24}" x2="${x+16}" y2="${y+2}" stroke="#4D7FB8" stroke-width="4" stroke-linecap="round"/>
        <circle cx="${x-16}" cy="${y+2}" r="4" fill="#E2C079"/>
        <circle cx="${x+16}" cy="${y+2}" r="4" fill="#E2C079"/>
      `).join('')}
    </g>`;
  }

  // Layer 4: BSA blocking blobs filling gaps
  if(activeIdx>=3){
    const gapXs = [105,155,205,255];
    svg += `<g opacity="${activeIdx===3?1:0.9}">
      ${gapXs.map(x=>`<ellipse cx="${x}" cy="${y+44}" rx="9" ry="13" fill="#D8D0BE" fill-opacity="0.55" stroke="#D8D0BE" stroke-width="1"/>`).join('')}
    </g>`;
  }

  // antigen binding animation when on antibody layer or beyond
  if(activeIdx>=2){
    svg += `<g>
      <animateTransform attributeName="transform" type="translate"
        values="180,30; 180,30; 180,${y-30}; 180,${y-30}; 180,30"
        keyTimes="0; 0.3; 0.5; 0.8; 1" dur="3.6s" repeatCount="indefinite"
        calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1;0 0 0.2 1;0.4 0 0.2 1"/>
      <circle r="13" fill="#C44536"/>
      <circle r="13" fill="none" stroke="#E15D4C" stroke-width="1.5"/>
    </g>`;
  }

  svg += `</svg>`;
  layerStage.innerHTML = svg;
}

function setLayer(idx){
  currentLayer = Math.max(0, Math.min(totalLayers-1, idx));
  layerItems.forEach((item,i)=>{
    item.classList.toggle('active', i===currentLayer);
    item.classList.toggle('done', i<currentLayer);
  });
  layerReadout.textContent = `Layer ${currentLayer+1} of ${totalLayers} active — ${layerDefs[currentLayer].name}`;
  renderStack(currentLayer);
}

layerItems.forEach(item=>{
  item.addEventListener('click', ()=> setLayer(parseInt(item.dataset.layer)));
});
document.getElementById('prev-layer').addEventListener('click', ()=> setLayer(currentLayer-1));
document.getElementById('next-layer').addEventListener('click', ()=> setLayer(currentLayer+1));

setLayer(0);

// ============================================================
// TABS — reaction pathways
// ============================================================
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');
tabBtns.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    tabBtns.forEach(b=>b.classList.remove('active'));
    tabPanels.forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-'+btn.dataset.tab).classList.add('active');
  });
});
