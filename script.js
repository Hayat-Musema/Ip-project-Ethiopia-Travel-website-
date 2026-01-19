// Search input in hero
const searchInput = document.getElementById('search');
const searchBtn = document.getElementById('searchBtn');
const featured = document.getElementById('featured');

function filterCards(query){
    const q = (query||'').toLowerCase();
    const cards = document.querySelectorAll('.featured-grid .card');
    cards.forEach(card=>{
        const title = card.querySelector('h4').textContent.toLowerCase();
        const desc = card.querySelector('.muted').textContent.toLowerCase();
        if(!q || title.includes(q) || desc.includes(q)) card.style.display='block';
        else card.style.display='none';
    });
}

if(searchInput){
    searchInput.addEventListener('input', e=>filterCards(e.target.value));
}
if(searchBtn){
    searchBtn.addEventListener('click', ()=>{
        const q = (searchInput.value||'').trim();
        // If destinations grid is not present (we're on homepage), navigate to destinations page with query
        if(!document.getElementById('dest-grid')){
            const url = 'destinations.html' + (q ? ('?q=' + encodeURIComponent(q)) : '');
            window.location.href = url;
            return;
        }
        // otherwise, filter the featured cards in-place
        filterCards(q);
    });
}

// Region filters
document.querySelectorAll('.region').forEach(btn=>{
    btn.addEventListener('click', ()=>{
        document.querySelectorAll('.region').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const region = btn.dataset.region;
        document.querySelectorAll('.featured-grid .card').forEach(card=>{
            if(region==='all' || card.dataset.region.includes(region)) card.style.display='block';
            else card.style.display='none';
        });
    });
});

// Newsletter subscribe (simple demo)
const subscribeBtn = document.getElementById('subscribeBtn');
if(subscribeBtn){
    subscribeBtn.addEventListener('click', ()=>{
        const email = document.getElementById('newsletterEmail').value;
        if(!email) return alert('Please enter an email');
        alert('Thanks! We will send updates to ' + email);
        document.getElementById('newsletterEmail').value='';
    });
}

/* Destinations page: data-driven rendering, search, region/theme filters, load more */
(function(){
    const data = [
        {id:1,title:'Lalibela',slug:'lalibela',region:'amhara',themes:['history','culture'],rating:4.9,img:'images/lalibela.jpg',desc:'Home to 11 monolithic cave churches.'},
        {id:2,title:'Simien Mountains',slug:'simien-mountains',region:'amhara',themes:['trekking','wildlife'],rating:5.0,img:'images/simien-mountains.jpg',desc:'Dramatic escarpments and endemic wildlife.'},
        {id:3,title:'Omo Valley',slug:'omo-valley',region:'snnpr',themes:['culture','photography'],rating:4.7,img:'images/omo-valley.jpg',desc:'A cultural kaleidoscope with many tribes.'},
        {id:4,title:'Danakil Depression',slug:'danakil-depression',region:'afar',themes:['adventure','extreme'],rating:4.8,img:'images/danakil-depression.jpg',desc:'Surreal geothermal landscapes and salt flats.'},
        {id:5,title:'Gondar',slug:'gondar',region:'amhara',themes:['history','royalty'],rating:4.6,img:'images/gondar.jpg',desc:'Known as the Camelot of Africa with castles.'},
        {id:6,title:'Bale Mountains',slug:'bale-mountains',region:'oromia',themes:['trekking','wildlife'],rating:4.8,img:'images/bale-mountains.jpg',desc:'High-altitude plateaus, waterfalls, and wolves.'},
        {id:7,title:'Axum',slug:'axum',region:'tigray',themes:['history','religion'],rating:4.5,img:'images/axum.jpg',desc:'Ancient obelisks and historic ruins.'},
        {id:8,title:'Harar',slug:'harar',region:'harari',themes:['culture','history'],rating:4.4,img:'images/harar.jpg',desc:'A historic walled city known for its vibrant markets, colorful houses, and deep cultural heritage.'}
    ];

    const grid = document.getElementById('dest-grid');
    if(!grid) return; // only run on destinations page

    let perPage = 6; let shown = 0; let activeData = data.slice();

    function createCard(item){
        const art = document.createElement('article');
        art.className='card';
        art.dataset.region = item.region;

        // image candidates: prefer slug-based local file, then variations of the title, then fallback
        const candidates = [];
        if(item.img) candidates.push(item.img);
        if(item.slug) candidates.push(`images/${item.slug}.jpg`);
        if(item.title) candidates.push(`images/${item.title}.jpg`);
        if(item.title) candidates.push(`images/${item.title.replace(/\s+/g,'-').toLowerCase()}.jpg`);
        if(item.title) candidates.push(`images/${item.title.replace(/[,\s]+/g,'').toLowerCase()}.jpg`);
        // Known files in the images/ folder (fallbacks) — add any filenames that already exist in your project
        const extraImages = {
            'simien-mountains': 'images/Simien Mountains, Ethiopia.jpg',
            'omo-valley': 'images/omo.jpg',
            'bale-mountains': 'images/Bale Mountains.jpg',
            'danakil-depression': 'images/denakil.jpg',
            'axum': 'images/Axum.jpg',
            'gondar': 'images/gondar.jpg',
            'lalibela': 'images/lalibela.jpg',
            'harar': 'images/harar.jpg'
        };
        if(item.slug && extraImages[item.slug]) candidates.push(extraImages[item.slug]);

        const imgEl = document.createElement('img');
        imgEl.alt = item.title;
        let idx = 0;
        const externalFallback = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop';
        function tryNext(){
            if(idx < candidates.length){
                imgEl.src = candidates[idx++];
            } else {
                imgEl.src = externalFallback;
            }
        }
        imgEl.addEventListener('error', tryNext);
        tryNext();

        const body = document.createElement('div');
        body.className = 'card-body';
        body.innerHTML = `
            <div class="tag">${item.region.toUpperCase()}</div>
            <h4>${item.title}</h4>
            <p class="muted">${item.desc}</p>
            <div class="card-foot">
                <span class="rating">${item.rating}</span>
            </div>
        `;

        const foot = body.querySelector('.card-foot');
        const btn = document.createElement('button');
        btn.className = 'details-btn';
        btn.dataset.id = item.id;
        btn.textContent = 'View Details';
        foot.appendChild(btn);

        art.appendChild(imgEl);
        art.appendChild(body);
        return art;
    }

    function render(reset){
        if(reset){ grid.innerHTML=''; shown=0; }
        const slice = activeData.slice(shown, shown+perPage);
        slice.forEach(it=>grid.appendChild(createCard(it)));
        shown += slice.length;
        document.getElementById('loadMoreBtn').style.display = shown < activeData.length ? 'inline-block' : 'none';
    }

    function applyFilters(){
        const q = (document.getElementById('destSearch').value||'').toLowerCase().trim();
        const region = document.getElementById('destRegion').value;
        const theme = document.getElementById('destTheme').value;
        activeData = data.filter(d=>{
            const matchQ = !q || d.title.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q) || d.themes.join(' ').includes(q);
            const matchRegion = region==='all' || d.region===region;
            const matchTheme = theme==='all' || d.themes.includes(theme);
            return matchQ && matchRegion && matchTheme;
        });
        render(true);
    }

    document.getElementById('applyFilters').addEventListener('click', ()=>applyFilters());
    document.getElementById('clearFilters').addEventListener('click', ()=>{
        document.getElementById('destSearch').value='';
        document.getElementById('destRegion').value='all';
        document.getElementById('destTheme').value='all';
        activeData = data.slice();
        render(true);
    });

    document.getElementById('loadMoreBtn').addEventListener('click', ()=>render(false));

    // Instant search as user types
    document.getElementById('destSearch').addEventListener('input', ()=>applyFilters());

    // initial render
    render(true);

    // If the page was opened with a query param, apply it to the search
    const urlQ = new URLSearchParams(window.location.search).get('q');
    if(urlQ){
        const destSearch = document.getElementById('destSearch');
        if(destSearch){ destSearch.value = urlQ; }
        applyFilters();
    }

    // handle View Details clicks: navigate to a detail page if available, otherwise open modal
    grid.addEventListener('click', e=>{
        const btn = e.target.closest('.details-btn');
        if(!btn) return;
        const id = btn.dataset.id;
        const item = data.find(d=>String(d.id)===String(id));
        if(!item) return;
        const slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
        const pages = { 'lalibela':'lalibela.html', 'harar':'harar.html' };
        if(pages[slug]){
            window.location.href = pages[slug];
            return;
        }
        const modal = document.getElementById('destModal');
        if(!modal) return;
        modal.querySelector('#modalTitle').textContent = item.title;
        modal.querySelector('#modalRegion').textContent = item.region.toUpperCase();
        modal.querySelector('#modalDesc').textContent = item.desc;
        const link = modal.querySelector('#modalDetailsLink');
        if(pages[slug]){ link.href = pages[slug]; link.style.display = 'inline-block'; }
        else { link.href = '#'; link.style.display = 'none'; }
        modal.classList.remove('hidden'); modal.setAttribute('aria-hidden','false');
    });

    // modal close
    const modalClose = document.getElementById('modalClose');
    const destModal = document.getElementById('destModal');
    if(modalClose && destModal){
        modalClose.addEventListener('click', ()=>{ destModal.classList.add('hidden'); destModal.setAttribute('aria-hidden','true'); });
        destModal.addEventListener('click', e=>{ if(e.target===destModal) { destModal.classList.add('hidden'); destModal.setAttribute('aria-hidden','true'); } });
    }
})();

/* Detail page gallery interactions */
(function(){
    const gallery = document.getElementById('detailGallery');
    const thumbs = document.getElementById('detailThumbs');
    if(!gallery || !thumbs) return;
    const mainImg = gallery.querySelector('img');
    thumbs.addEventListener('click', e=>{
        const t = e.target.closest('img');
        if(!t) return;
        const src = t.dataset.src || t.src;
        mainImg.src = src;
        thumbs.querySelectorAll('img').forEach(i=>i.classList.remove('active'));
        t.classList.add('active');
    });
})();

/* Gallery page: render thumbnails and lightbox */
(function(){
    const grid = document.getElementById('galleryGrid');
    if(!grid) return;
    const images = [
        '../images/Axum.jpg',
        '../images/Bale Mountains.jpg',
        '../images/gondar.jpg',
        '../images/harar.jpg',
        '../images/lalibela.jpg',
        '../images/omo.jpg',
        '../images/Simien Mountains, Ethiopia.jpg',
        '../images/gondar.jpg',
        '../images/harar.jpg',
        '../images/lalibela.jpg',
        '../images/omo.jpg',
        '../images/Simien Mountains, Ethiopia.jpg'
    ];
    images.forEach(src=>{
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Ethiopia photo';
        grid.appendChild(img);
    });

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lbClose = document.getElementById('lightboxClose');

    grid.addEventListener('click', e=>{
        const t = e.target.closest('img');
        if(!t) return;
        lightboxImg.src = t.src;
        lightbox.classList.remove('hidden');
    });
    lbClose.addEventListener('click', ()=>lightbox.classList.add('hidden'));
    lightbox.addEventListener('click', e=>{ if(e.target===lightbox) lightbox.classList.add('hidden'); });
})();

/* Contact form handling for about & contact pages */
(function(){
    function handleForm(id){
        const f = document.getElementById(id); if(!f) return;
        f.addEventListener('submit', e=>{
            e.preventDefault();
            const formData = new FormData(f);
            const name = formData.get('name') || '';
            const email = formData.get('email') || '';
            const message = formData.get('message') || '';
            if(!name.trim() || !email.trim() || !message.trim()){
                return alert('Please fill all required fields.');
            }
            // Demo: show a thank you message. In production, send to server.
            alert('Thanks, ' + name + '! Your message has been received.');
            f.reset();
        });
    }
    handleForm('aboutContactForm');
    handleForm('contactForm');
})();

/* Packages page rendering + filters */
(function(){
    const pkgGrid = document.getElementById('pkgGrid');
    if(!pkgGrid) return;

    const packages = [
        {id:1,title:'Lalibela Cultural Escape',duration:'4-7',theme:'culture',price:520,days:5,desc:'Explore the rock-hewn churches and local traditions.'},
        {id:2,title:'Simien Trekking Adventure',duration:'8plus',theme:'adventure',price:980,days:9,desc:'Multi-day trekking with guides and camping.'},
        {id:3,title:'Danakil Extreme Tour',duration:'4-7',theme:'adventure',price:760,days:5,desc:'Geothermal wonders and salt caravan history.'},
        {id:4,title:'Bale Mountains Wildlife',duration:'4-7',theme:'wildlife',price:650,days:6,desc:'Highland wildlife and plateaus exploration.'},
        {id:5,title:'Addis City + Culture',duration:'2-3',theme:'culture',price:220,days:2,desc:'City highlights, museums, and cuisine.'}
    ];

    function renderPkgs(list){
        pkgGrid.innerHTML = '';
        list.forEach(p=>{
            const art = document.createElement('article');
            art.className='card pkg-card';
            art.innerHTML = `
                <img src="images/ALL.jfif" alt="${p.title}">
                <div class="card-body">
                    <div class="tag">${p.theme.toUpperCase()}</div>
                    <h4>${p.title}</h4>
                    <p class="muted">${p.desc}</p>
                    <div class="meta">
                        <div>${p.days} days</div>
                        <div class="price">$${p.price}</div>
                    </div>
                    <div style="margin-top:10px"><a class="details" href="#">Book Now</a></div>
                </div>
            `;
            pkgGrid.appendChild(art);
        });
    }

    function applyPkgFilters(){
        const q = (document.getElementById('pkgSearch').value||'').toLowerCase().trim();
        const dur = document.getElementById('pkgDuration').value;
        const theme = document.getElementById('pkgTheme').value;
        const filtered = packages.filter(p=>{
            const matchQ = !q || p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
            const matchDur = dur==='all' || p.duration===dur;
            const matchTheme = theme==='all' || p.theme===theme;
            return matchQ && matchDur && matchTheme;
        });
        renderPkgs(filtered);
    }

    document.getElementById('pkgApply').addEventListener('click', applyPkgFilters);
    document.getElementById('pkgClear').addEventListener('click', ()=>{
        document.getElementById('pkgSearch').value='';
        document.getElementById('pkgDuration').value='all';
        document.getElementById('pkgTheme').value='all';
        renderPkgs(packages);
    });

    document.getElementById('pkgSearch').addEventListener('input', applyPkgFilters);

    renderPkgs(packages);
})();

/* Homepage hero: single local image loader (hide slideshow controls) */
(function(){
    const heroImg = document.getElementById('homeHeroImg');
    if(!heroImg) return;
    const prevBtn = document.getElementById('prevHero');
    const nextBtn = document.getElementById('nextHero');
    const dotsEl = document.getElementById('heroDots');

    if(prevBtn) prevBtn.style.display = 'none';
    if(nextBtn) nextBtn.style.display = 'none';
    if(dotsEl) dotsEl.style.display = 'none';

    const candidates = ['images/home-hero.jpg','images/home-heroo.jpg','images/home.jpg'];
    const fallback = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop';
    let idx = 0;

    function tryNext(){
        if(idx < candidates.length){
            heroImg.src = candidates[idx++];
        } else {
            heroImg.src = fallback;
        }
    }

    heroImg.addEventListener('error', tryNext);
    tryNext();
})();
