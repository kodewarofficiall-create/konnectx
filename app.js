// Shared site behavior
const businesses=[
{id:'northstar-kitchen',name:'Northstar Kitchen',category:'food',categoryLabel:'Food & drink',location:'Downtown',description:'Seasonal plates, warm hospitality and a little room for the unexpected.',rating:'4.9',mark:'✳',featured:true},
{id:'the-gathering-house',name:'The Gathering House',category:'events',categoryLabel:'Events',location:'Riverside',description:'A light-filled venue for celebrations, launches and meaningful moments.',rating:'4.8',mark:'✧',featured:true},
{id:'fieldstone-property',name:'Fieldstone Property Co.',category:'property',categoryLabel:'Real estate',location:'Central district',description:'Thoughtful guidance for finding a place to call your own.',rating:'4.9',mark:'⌂',featured:true},
{id:'wellspace-clinic',name:'Wellspace Clinic',category:'medical',categoryLabel:'Medical & wellness',location:'West End',description:'Personalised wellbeing and care from a team that listens first.',rating:'5.0',mark:'✚',featured:true},
{id:'little-loom',name:'Little Loom Studio',category:'boutique',categoryLabel:'Boutiques',location:'Old Town',description:'Independent style, considered pieces and makers worth knowing.',rating:'4.8',mark:'◇',featured:false},
{id:'brightline-events',name:'Brightline Events',category:'events',categoryLabel:'Events',location:'Citywide',description:'Creative event planning for gatherings that feel like you.',rating:'4.9',mark:'✦',featured:false},
{id:'goodground-cafe',name:'Goodground Café',category:'food',categoryLabel:'Food & drink',location:'Market Quarter',description:'Small-batch coffee, fresh bakes and a favourite neighbourhood table.',rating:'4.7',mark:'☕',featured:false},
{id:'harbor-health',name:'Harbor Health Studio',category:'medical',categoryLabel:'Medical & wellness',location:'Northside',description:'Movement, recovery and practical support for feeling your best.',rating:'4.9',mark:'✚',featured:false},
{id:'open-door-homes',name:'Open Door Homes',category:'property',categoryLabel:'Real estate',location:'East district',description:'Friendly local property advice, from first viewing to moving day.',rating:'4.8',mark:'⌂',featured:false}
];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function card(b){return `<article class="business-card"><div class="business-art art-${esc(b.category)}"><span class="art-mark">${esc(b.mark)}</span>${b.featured?'<span class="featured-badge">✦ Featured</span>':''}</div><div class="business-content"><span class="business-category">${esc(b.categoryLabel)}</span><h3>${esc(b.name)}</h3><p>${esc(b.description)}</p><div class="business-meta"><span>⌖ &nbsp;${esc(b.location)}</span><span>✦ &nbsp;${esc(b.rating)}</span></div><div class="business-actions"><a href="enquiry.html?business=${encodeURIComponent(b.name)}">Enquire &amp; book →</a><span class="rating">● &nbsp;Open to connect</span></div></div></article>`}
function allBusinesses(){try{return [...businesses,...JSON.parse(localStorage.getItem('kxBusinesses')||'[]')]}catch{return businesses}}
const featured=document.getElementById('featuredBusinesses');if(featured)featured.innerHTML=businesses.filter(b=>b.featured).map(card).join('');
const directory=document.getElementById('directoryBusinesses');let activeCategory='all';const searchInput=document.getElementById('directorySearch');
function renderDirectory(){if(!directory)return;const q=(searchInput?.value||new URLSearchParams(location.search).get('q')||'').trim().toLowerCase();const list=allBusinesses().filter(b=>(activeCategory==='all'||b.category===activeCategory)&&(!q||`${b.name} ${b.categoryLabel} ${b.location} ${b.description}`.toLowerCase().includes(q)));directory.innerHTML=list.map(card).join('');const count=document.getElementById('resultCount');if(count)count.textContent=`Showing ${list.length} ${list.length===1?'business':'businesses'}`;const empty=document.getElementById('emptyState');if(empty)empty.hidden=list.length>0}
if(directory){const params=new URLSearchParams(location.search);activeCategory=params.get('category')||'all';document.querySelectorAll('.filter-pill').forEach(btn=>{btn.classList.toggle('active',btn.dataset.category===activeCategory);btn.addEventListener('click',()=>{activeCategory=btn.dataset.category;document.querySelectorAll('.filter-pill').forEach(b=>b.classList.toggle('active',b===btn));renderDirectory()})});if(searchInput){searchInput.value=params.get('q')||'';searchInput.addEventListener('input',renderDirectory)}renderDirectory()}
// Account role and form switches
const switchButtons=document.querySelectorAll('.switch-btn');switchButtons.forEach(btn=>btn.addEventListener('click',()=>{switchButtons.forEach(x=>x.classList.toggle('active',x===btn));document.querySelectorAll('.form-card').forEach(card=>card.hidden=card.id!==btn.dataset.target);if(btn.dataset.target==='business-panel')document.querySelector('.account-panel')?.classList.add('business-selected');else document.querySelector('.account-panel')?.classList.remove('business-selected')}));
document.querySelectorAll('.form-tab').forEach(btn=>btn.addEventListener('click',()=>{const card=btn.closest('.form-card');card.querySelectorAll('.form-tab').forEach(x=>x.classList.toggle('active',x===btn));card.querySelectorAll('.account-form').forEach(form=>form.hidden=form.id!==btn.dataset.form)}));
function message(form,text,error=false){const el=form.querySelector('.form-message');if(el){el.textContent=text;el.classList.toggle('error',error)}}
document.querySelectorAll('.account-form').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(form);const email=String(fd.get('email')||'').trim().toLowerCase();const password=String(fd.get('password')||'');if(password.length<8){message(form,'Please use a password with at least 8 characters.',true);return}let users=[];try{users=JSON.parse(localStorage.getItem('kxUsers')||'[]')}catch{}if(form.id==='user-register'||form.id==='business-register'){const role=form.id==='user-register'?'user':'business';const record={role,email,name:String(fd.get('name')||fd.get('business')||''),password,category:String(fd.get('category')||''),location:String(fd.get('location')||''),plan:String(fd.get('plan')||'Basic')};users=users.filter(x=>x.email!==email);users.push(record);localStorage.setItem('kxUsers',JSON.stringify(users));if(role==='business'){let saved=[];try{saved=JSON.parse(localStorage.getItem('kxBusinesses')||'[]')}catch{}const cat=record.category;const labels={food:'Food & drink',events:'Events',property:'Real estate',medical:'Medical & wellness',boutique:'Boutiques',other:'Other'};saved=saved.filter(x=>x.name!==record.name);saved.push({id:'user-'+Date.now(),name:record.name,category:cat==='other'?'business':cat,categoryLabel:labels[cat]||'Other',location:record.location,description:`${record.name} is ready to connect with you. Send an enquiry to start a conversation.`,rating:'New',mark:'✦',featured:record.plan==='Premium'});localStorage.setItem('kxBusinesses',JSON.stringify(saved))}message(form,role==='user'?'Your demo account is ready. You can now explore and request appointments.':'Your demo business profile is saved. It is now listed in this browser’s directory.');if(directory)renderDirectory()}else{const user=users.find(x=>x.email===email&&x.password===password);message(form,user?`Welcome back${user.name?`, ${user.name}`:''}! This demo keeps you on this page.`:'We couldn’t find a matching demo account. Create an account first, or check your details.',!user)}}));
// Appointment requests are saved locally for this prototype.
const businessSelect=document.getElementById('businessSelect');if(businessSelect){allBusinesses().forEach(b=>{const o=document.createElement('option');o.value=b.name;o.textContent=`${b.name} — ${b.categoryLabel}`;businessSelect.appendChild(o)});const requested=new URLSearchParams(location.search).get('business');if(requested)businessSelect.value=requested;const date=businessSelect.form.querySelector('[name="date"]');if(date){const today=new Date();date.min=new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().slice(0,10)}}
const enquiryForm=document.getElementById('enquiryForm');if(enquiryForm)enquiryForm.addEventListener('submit',e=>{e.preventDefault();const request=Object.fromEntries(new FormData(enquiryForm));let requests=[];try{requests=JSON.parse(localStorage.getItem('kxRequests')||'[]')}catch{}requests.push({...request,createdAt:new Date().toISOString()});localStorage.setItem('kxRequests',JSON.stringify(requests));message(enquiryForm,`Request saved for ${request.business}. This prototype doesn’t send email; the business can confirm once connected to a backend.`);enquiryForm.reset();if(businessSelect&&new URLSearchParams(location.search).get('business'))businessSelect.value=new URLSearchParams(location.search).get('business')});
if(enquiryForm){const subcategory=new URLSearchParams(location.search).get('subcategory');const discussion=enquiryForm.elements.namedItem('message');if(subcategory&&discussion)discussion.value=`I’m interested in ${subcategory}. Please contact me with more information.`}
// (Mobile navigation is handled in extras.js)
document.querySelectorAll('.site-header .header-actions .button-small').forEach(link=>{
 if(link.textContent.trim().startsWith('Join konnectkx'))link.href='KonnectXBussinessRegestration/index.html?open=1';
});
// Gentle entrance animations respect reduced-motion settings.
if('IntersectionObserver'in window&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el))}else document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));
// Deep links open the matching registration flow from the site's calls to action.
function openDeepLink(){if(location.hash==='#register'||location.hash==='#business-register'){
 const business=location.hash==='#business-register';
 if(business)document.querySelector('.switch-btn[data-target="business-panel"]')?.click();
 const target=business?'business-register':'user-register';
 document.querySelector(`.form-tab[data-form="${target}"]`)?.click();
}else if(location.hash==='#login'&&document.querySelector('.account-main')){
 document.querySelector('.switch-btn[data-target="user-panel"]')?.click();
 document.querySelector('.form-tab[data-form="user-login"]')?.click();
}}
openDeepLink();addEventListener('hashchange',openDeepLink);


// Shared navigation, reveal, footer, and newsletter behavior
(()=>{const $=(s,r=document)=>[...r.querySelectorAll(s)];
const bar=document.createElement('div');bar.id='progress';document.body.append(bar);
const top=document.createElement('button');top.id='top';top.textContent='↑';top.setAttribute('aria-label','Back to top');top.onclick=()=>scrollTo({top:0,behavior:'smooth'});document.body.append(top);
const hdr=document.querySelector('.site-header');
addEventListener('scroll',()=>{const h=document.documentElement,y=h.scrollTop;bar.style.width=y/(h.scrollHeight-h.clientHeight||1)*100+'%';hdr.classList.toggle('scrolled',y>40);top.classList.toggle('show',y>500)},{passive:true});

/* ---------- Navigation: keeps the current page highlighted on every page ---------- */
(()=>{const nav=hdr.querySelector('nav'),toggle=hdr.querySelector('.menu-toggle'),acts=hdr.querySelector('.header-actions');
const file=(location.pathname.split('/').pop()||'index.html').toLowerCase();
const mark=()=>{$('nav a, .login-link',hdr).forEach(a=>{const u=new URL(a.getAttribute('href'),location.href);const f=(u.pathname.split('/').pop()||'index.html').toLowerCase();
 let on=f===file;
 if(a.classList.contains('login-link')&&f==='categories.html'&&file==='categories.html')on=location.hash!=='#register'&&location.hash!=='#business-register';
 if(f==='index.html'&&u.hash&&file==='index.html')on=false;
 a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
 $('.header-actions .button',hdr).forEach(b=>b.classList.toggle('active',file==='categories.html'&&(location.hash==='#register'||location.hash==='#business-register')))};
/* Log in + Join live inside the 3-dot menu on phones */
if(nav&&acts&&!nav.querySelector('.nav-actions')){const w=document.createElement('div');w.className='nav-actions';acts.querySelectorAll('a').forEach(a=>{const c=a.cloneNode(true);c.classList.add('nav-clone');w.append(c)});nav.append(w)}
mark();addEventListener('hashchange',mark);
const close=()=>{nav.classList.remove('open');toggle?.setAttribute('aria-expanded','false');hdr.classList.remove('menu-open')};
toggle?.addEventListener('click',e=>{e.stopPropagation();const o=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',o);hdr.classList.toggle('menu-open',o)});
nav.addEventListener('click',e=>{if(e.target.closest('a'))setTimeout(close,0)});
document.addEventListener('click',e=>{if(!hdr.contains(e.target))close()});
addEventListener('keydown',e=>{if(e.key==='Escape')close()});
addEventListener('resize',()=>{if(innerWidth>900)close()});
})();

const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.1});
$('main section, .footer').forEach(sec=>{$(':scope .section-head, :scope .category-card, :scope .business-card, :scope .step, :scope .value-card, :scope .story-copy, :scope .story-visual, :scope .search-box, :scope .search-intro, :scope .cta-section>*, :scope .enquiry-aside, :scope .enquiry-form, :scope .form-card, :scope .account-intro, :scope .directory-tools, :scope .footer-top',sec).forEach((el,i)=>{if(el.classList.contains('reveal'))el.classList.remove('reveal');el.classList.add('rv');el.style.setProperty('--d',(i%6)*.08+'s');io.observe(el)})});
$('.page-hero>*, .footer-top').forEach(el=>el.classList.add('in'));
const dir=document.getElementById('directoryBusinesses');if(dir)new MutationObserver(()=>$('.business-card',dir).forEach((c,i)=>{c.classList.remove('rv');c.classList.add('pop');c.style.setProperty('--d',Math.min(i,8)*.05+'s')})).observe(dir,{childList:true});
const steps=$('.step');if(steps.length){let n=0;setInterval(()=>{steps.forEach((s,i)=>s.classList.toggle('cycle',i===n));n=(n+1)%steps.length},2400)}
})();
// Category videos: load when visible, play on hover/in view, fall back to icon art if file is missing.
(()=>{const vs=[...document.querySelectorAll('.cat-media video')];if(!vs.length)return;
vs.forEach(v=>{v.addEventListener('canplay',()=>v.classList.add('ready'));v.addEventListener('error',()=>v.remove());
const card=v.closest('.cat-xl');card.addEventListener('mouseenter',()=>{v.play().catch(()=>{});card.classList.add('playing')});card.addEventListener('mouseleave',()=>{v.pause();card.classList.remove('playing')})});
const o=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const v=e.target;v.src=v.dataset.src;if(matchMedia('(hover:none)').matches)v.play().catch(()=>{});o.unobserve(v)}}),{rootMargin:'200px'});vs.forEach(v=>o.observe(v))})();
// Site-wide video background (wide on desktop, tall on phones), skipped for reduced motion.
(()=>{if(document.body.classList.contains('categories-page'))return;const wrap=document.createElement('div');wrap.className='bg-video-wrap';const poster='assets/video/poster.jpg';
if(matchMedia('(prefers-reduced-motion: reduce)').matches){wrap.style.backgroundImage=`url(${poster})`}
else{const v=document.createElement('video');v.className='bg-video';v.muted=true;v.loop=true;v.autoplay=true;v.playsInline=true;v.setAttribute('muted','');v.poster=poster;v.src=innerWidth<700?'assets/video/bg-tall.mp4':'assets/video/bg-wide.mp4';wrap.append(v);v.play().catch(()=>{wrap.style.backgroundImage=`url(${poster})`})}
const shade=document.createElement('div');shade.className='bg-shade';wrap.append(shade);document.body.prepend(wrap)})();
// Newsletter signup (prototype: saved in this browser only)
(()=>{const f=document.getElementById('noteForm');if(!f)return;f.addEventListener('submit',e=>{e.preventDefault();const em=f.email.value.trim();let l=[];try{l=JSON.parse(localStorage.getItem('kxNote')||'[]')}catch{}if(!l.includes(em))l.push(em);localStorage.setItem('kxNote',JSON.stringify(l));f.querySelector('.note-msg').textContent='Thanks! You’re on the list (saved in this browser for now).';f.reset()})})();
// Keep footer links expanded on desktop and collapsed into accordions on phones.
(()=>{const groups=[...document.querySelectorAll('.footer-accordion')];if(!groups.length)return;const mobile=matchMedia('(max-width: 560px)');const sync=()=>groups.forEach(group=>group.open=!mobile.matches);sync();mobile.addEventListener('change',sync)})();


// Homepage globe interaction
// Hero globe: gentle mouse + scroll parallax, and keeps the globe centred on the orbit (skipped for reduced motion).
(()=>{
  const g=document.querySelector('.hb-globe');
  if(!g)return;
  const shell=g.closest('.hero-shell'),world=shell.querySelector('.hero-world');
  /* centre of the orbit, measured with offsets so entrance animations don't shift it */
  function align(){
    if(!world)return;
    let x=world.offsetWidth/2,y=world.offsetHeight/2,el=world;
    while(el&&el!==shell){x+=el.offsetLeft;y+=el.offsetTop;el=el.offsetParent}
    g.style.setProperty('--gx',x+'px');g.style.setProperty('--gy',y+'px');
  }
  align();addEventListener('load',align);addEventListener('resize',align);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(align);
  if('ResizeObserver'in window){const ro=new ResizeObserver(align);ro.observe(shell);ro.observe(world)}
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let tx=0,ty=0,cx=0,cy=0,sy=0,running=false,visible=true;
  shell.addEventListener('pointermove',e=>{
    if(e.pointerType!=='mouse')return;
    const r=shell.getBoundingClientRect();
    tx=((e.clientX-r.left)/r.width-.5)*-16;
    ty=((e.clientY-r.top)/r.height-.5)*-10;
    kick();
  });
  shell.addEventListener('pointerleave',()=>{tx=ty=0;kick()});
  addEventListener('scroll',()=>{sy=Math.min(scrollY,900)*.04;kick()},{passive:true});
  new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)kick()}).observe(shell);
  function kick(){if(!running&&visible){running=true;requestAnimationFrame(tick)}}
  function tick(){
    cx+=(tx-cx)*.07;
    cy+=(ty+sy-cy)*.07;
    g.style.setProperty('--px',cx.toFixed(2)+'px');
    g.style.setProperty('--py',cy.toFixed(2)+'px');
    if(visible&&(Math.abs(tx-cx)>.05||Math.abs(ty+sy-cy)>.05))requestAnimationFrame(tick);
    else running=false;
  }
})();


// Categories page interaction (no-op on other pages)
(()=>{
const ICONS={
all:'<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>',
food:'<path d="M6 3v8a2 2 0 0 0 2 2v8M10 3v8M6 7h4M17 3c-2 1.5-3 4-3 7v3h3v8"/>',
events:'<path d="M12 3l2.4 5 5.6.8-4 3.9.9 5.5-4.9-2.6L7.1 18l.9-5.5-4-3.9 5.6-.8z"/>',
property:'<path d="M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6"/>',
medical:'<path d="M12 21s-7-4.4-9-9.5C1.7 8 4 5 7 5c2 0 3.3 1 5 3 1.7-2 3-3 5-3 3 0 5.300 3 4 6.500-2 5.100-9 9.500-9 9.500z"/><path d="M12 9v5M9.500 11.500h5"/>',
boutique:'<path d="M6 7h12l1 14H5zM9 7a3 3 0 0 1 6 0"/>',
manufacturing:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.900 4.900l2.100 2.100M17 17l2.100 2.100M4.900 19.100L7 17M17 7l2.100-2.100"/>',
services:'<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
pin:'<path d="M12 21s7-6.100 7-11a7 7 0 0 0-14 0c0 4.900 7 11 7 11z"/><circle cx="12" cy="10" r="2.500"/>'};
const svg=k=>`<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[k]||ICONS.all}</svg>`;
const CATS=[['all','All categories'],['medical','Healthcare & Wellness'],['boutique','Fashion, Beauty & Jewellery'],['education','Education & Training'],['events','Events & Entertainment'],['property','Home, Construction & Property'],['food','Food & Hospitality'],['services','Professional & Business Services'],['automotive','Automotive & Transport'],['media','Media, Design & Photography'],['agriculture','Agriculture & Natural Products']];
const SUBCATEGORIES={
education:['Studios','Schools','Training','Coaching'],
events:['Event planning','Event services','Venues','Celebrations'],
boutique:['Jewellery','Salons and beauty','Clothing','Boutiques'],
property:['Smart homes','Modular construction','Real estate','Furniture','Home furnishings'],
medical:['Hospitals and clinics','Dental care','Eye care','Surgical and medical supplies','Wellness services'],
food:['Catering','Restaurants','Cafés','Food products','Agro products'],
services:['Business services','Private wealth and finance','Cloud and digital services'],
automotive:['Vehicle sales and service','Motors','Transport','Depots'],
media:['Photography','Creative studios','Design','Marketing'],
agriculture:['Agro products','Farming supplies','Natural and organic products']
};
const SUBCATEGORY_IMAGES={
 education:[
  'assets/subcategories/education-studios.jpg',
  'assets/subcategories/education-schools.jpg',
  'assets/subcategories/education-training.jpg',
  'assets/subcategories/education-coaching.jpg'
 ],
 events:[
  'assets/subcategories/events-planning.jpg',
  'assets/subcategories/events-services.jpg',
  'assets/subcategories/events-venues.jpg',
  'assets/subcategories/events-celebrations.jpg'
 ],
 boutique:[
  'assets/subcategories/boutique-jewellery.jpg',
  'assets/subcategories/boutique-salons.jpg',
  'assets/subcategories/boutique-clothing.jpg',
  'assets/subcategories/boutique-shops.jpg'
 ],
 property:[
  'assets/subcategories/property-smart-homes.jpg',
  'assets/subcategories/property-modular-construction.jpg',
  'assets/subcategories/property-real-estate.jpg',
  'assets/subcategories/property-furniture.jpg',
  'assets/subcategories/property-home-furnishings.jpg'
 ],
 medical:[
  'assets/categories/hospital.png',
  'assets/subcategories/medical-dental.jpg',
  'assets/subcategories/medical-eye-care.jpg',
  'assets/subcategories/medical-supplies.jpg',
  'assets/subcategories/medical-wellness.jpg'
 ],
 food:[
  'assets/subcategories/food-catering.jpg',
  'assets/subcategories/food-restaurants.jpg',
  'assets/subcategories/food-cafes.jpg',
  'assets/subcategories/food-products.jpg',
  'assets/subcategories/food-agro-products.jpg'
 ],
 services:[
  'assets/subcategories/services-business.jpg',
  'assets/subcategories/services-finance.jpg',
  'assets/subcategories/services-cloud.jpg'
 ],
 automotive:[
  'assets/categories/automotive.jpg',
  'assets/subcategories/automotive-motors.jpg',
  'assets/subcategories/automotive-transport.jpg',
  'assets/subcategories/automotive-depots.jpg'
 ],
 media:[
  'assets/categories/media.jpg',
  'assets/subcategories/media-studios.jpg',
  'assets/subcategories/media-design.jpg',
  'assets/subcategories/media-marketing.jpg'
 ],
 agriculture:[
  'assets/categories/agriculture.jpg',
  'assets/subcategories/agriculture-supplies.jpg',
  'assets/subcategories/agriculture-organic.jpg'
 ]
};
const CATEGORY_ORDER=CATS.filter(([id])=>id!=='all').map(([id])=>id);
function orderCategorySections(){
 document.querySelectorAll('.cat-filters').forEach(section=>{
  const pills=[...section.querySelectorAll('.cat-pill')];
  const categoryOf=el=>new URL(el.href,location.href).searchParams.get('category');
  pills.sort((a,b)=>{
   const aCategory=categoryOf(a),bCategory=categoryOf(b);
   if(!aCategory)return -1;
   if(!bCategory)return 1;
   return CATEGORY_ORDER.indexOf(aCategory)-CATEGORY_ORDER.indexOf(bCategory);
  }).forEach(pill=>section.appendChild(pill));
 });
 document.querySelectorAll('.bento-grid').forEach(grid=>{
  const cards=[...grid.querySelectorAll(':scope > .bento-card')];
  cards.sort((a,b)=>{
   const aCategory=new URL(a.querySelector('.bento-action').href,location.href).searchParams.get('category');
   const bCategory=new URL(b.querySelector('.bento-action').href,location.href).searchParams.get('category');
   return CATEGORY_ORDER.indexOf(aCategory)-CATEGORY_ORDER.indexOf(bCategory);
  }).forEach((card,index)=>{
   const badge=card.querySelector('.bento-badge');
   if(badge)badge.textContent=badge.textContent.replace(/^\d+/,String(index+1).padStart(2,'0'));
   grid.appendChild(card);
  });
 });
}
orderCategorySections();
const LABEL=Object.fromEntries(CATS);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let cat=new URLSearchParams(location.search).get('category')||'all';if(!LABEL[cat])cat='all';
const chips=document.getElementById('cpChips'),subcategories=document.getElementById('cpSubcategories'),title=document.getElementById('cpTitle'),count=document.getElementById('cpCount');if(!chips||!subcategories)return;
chips.innerHTML=CATS.map(([k,l])=>`<button class="cp-chip" data-c="${k}" type="button">${svg(k)}<span>${esc(l)}</span></button>`).join('');
function subcategoryCards(key){
 return SUBCATEGORIES[key].map((item,index)=>`<a class="cp-subcategory-card" href="enquiry.html?subcategory=${encodeURIComponent(item)}" aria-label="Contact us about ${esc(item)}"><img class="cp-subcategory-image" src="${SUBCATEGORY_IMAGES[key][index]}" alt="" loading="lazy" decoding="async"><div class="cp-subcategory-shade"></div><span class="cp-subcategory-number">${String(index+1).padStart(2,'0')}</span><div class="cp-subcategory-label"><h3>${esc(item)}</h3><span class="cp-subcategory-arrow" aria-hidden="true">↗</span></div></a>`).join('');
}
function render(){
 chips.querySelectorAll('.cp-chip').forEach(b=>b.classList.toggle('active',b.dataset.c===cat));
 subcategories.classList.toggle('cp-single-category',cat!=='all');
 const keys=cat==='all'?CATEGORY_ORDER:[cat];
 subcategories.innerHTML=keys.map(key=>`<section class="cp-subcategory-group"><div class="cp-subcategory-group-head"><span class="cp-subcategory-group-icon">${svg(key)}</span><h3>${esc(LABEL[key])}</h3><span class="cp-subcategory-group-count">${SUBCATEGORIES[key].length} specialties</span></div><div class="cp-subcategory-grid">${subcategoryCards(key)}</div></section>`).join('');
 title.textContent=cat==='all'?'Explore all categories':LABEL[cat];
 const total=cat==='all'?CATEGORY_ORDER.reduce((sum,key)=>sum+SUBCATEGORIES[key].length,0):SUBCATEGORIES[cat].length;
 count.textContent=`${total} ${total===1?'subcategory':'subcategories'}`;
}
chips.addEventListener('click',e=>{const b=e.target.closest('.cp-chip');if(!b)return;cat=b.dataset.c;history.replaceState(null,'',cat==='all'?'categories.html':'categories.html?category='+cat);render()});
render();
})();
