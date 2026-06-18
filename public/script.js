// Navigation logic
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links li');
    const navbar = document.querySelector('.navbar');

    if(hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            links.forEach((link, index) => {
                if (link.style.animation) {
                    link.style.animation = '';
                } else {
                    link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
                }
            });
            hamburger.classList.toggle('toggle');
        });

        // Auto-close menu when a link is clicked
        links.forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    hamburger.classList.remove('toggle');
                    links.forEach(l => {
                        l.style.animation = '';
                    });
                }
            });
        });
    }

    const handleScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll);

    const API_BASE = ''; // Use relative path so it works perfectly on both Render and Localhost

    // Dynamic Gallery Rendering (Synced with Admin Panel)
    const galleryGrid = document.querySelector('.gallery-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // Default fallback images
    const defaultGallery = [
        { id: 1, src: 'img/gallery1.jpg', title: 'Bright Classroom', category: 'classroom' },
        { id: 2, src: 'img/gallery2.jpg', title: 'Children playing blocks', category: 'activity' },
        { id: 3, src: 'img/gallery3.jpg', title: 'Art class painting', category: 'activity' },
        { id: 4, src: 'img/gallery4.jpg', title: 'Annual day celebration', category: 'event' },
        { id: 5, src: 'img/gallery5.jpg', title: 'Reading corner', category: 'classroom' },
        { id: 6, src: 'img/gallery6.jpg', title: 'Sports day event', category: 'event' }
    ];

    async function loadGallery() {
        if (!galleryGrid) return;
        try {
            const res  = await fetch(`${API_BASE}/api/gallery`);
            const data = await res.json();
            galleryGrid.innerHTML = '';
            data.forEach(item => {
                const div = document.createElement('div');
                div.className = `gallery-item ${item.category} show`;
                div.innerHTML = `
                    <img src="${item.url}" alt="${item.title}" loading="lazy"/>
                    <div class="overlay"><i class="fa-solid fa-magnifying-glass-plus"></i></div>
                `;
                div.addEventListener('click', () => {
                    const lightbox    = document.getElementById('lightbox');
                    const lightboxImg = document.getElementById('lightbox-img');
                    if (lightbox && lightboxImg) {
                        lightboxImg.src = item.url;
                        lightbox.style.display = 'flex';
                    }
                });
                galleryGrid.appendChild(div);
            });
            bindFilters();
        } catch (err) {
            console.error('Gallery load failed:', err);
        }
    }

    function bindFilters() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filterValue = btn.getAttribute('data-filter');
                galleryItems.forEach(item => {
                    if (item.classList.contains(filterValue) || filterValue === 'all') {
                        item.classList.remove('hide');
                        item.classList.add('show');
                    } else {
                        item.classList.remove('show');
                        item.classList.add('hide');
                    }
                });
            });
        });
    }

    // Lightbox Close Logic
    const lightbox = document.getElementById('lightbox');
    const closeLightboxBtn = document.querySelector('.close-lightbox');
    
    if(closeLightboxBtn && lightbox) {
        closeLightboxBtn.addEventListener('click', () => lightbox.style.display = 'none');
        lightbox.addEventListener('click', (e) => {
            if(e.target === lightbox) lightbox.style.display = 'none';
        });
    }

    // Dynamic Announcements Rendering
    async function loadAnnouncements() {
        const annGrid = document.getElementById('dynamic-announcements');
        if (!annGrid) return;
        try {
            const res  = await fetch(`${API_BASE}/api/announcements`);
            const data = await res.json();
            annGrid.innerHTML = '';
            data.forEach(ann => {
                const card = document.createElement('div');
                card.className = `ann-public-card ${ann.pinned ? 'pinned-card' : ''}`;
                let imgHTML = ann.image_url
                    ? `<img src="${ann.image_url}" class="ann-card-img" alt="Announcement">`
                    : '';
                let btnHTML = ann.btn_text && ann.btn_link
                    ? `<a href="${ann.btn_link}" class="btn btn-primary ann-btn">${ann.btn_text}</a>`
                    : '';
                let pinHTML = ann.pinned
                    ? `<div class="pin-badge"><i class="fa-solid fa-thumbtack"></i> Pinned</div>`
                    : '';
                card.innerHTML = `
                    ${pinHTML}${imgHTML}
                    <div class="ann-card-content">
                        <div class="ann-card-header">
                            <span class="date-badge ${ann.status.toLowerCase()}">${ann.status}</span>
                            <span class="ann-date"><i class="fa-regular fa-calendar"></i> ${ann.ann_date}</span>
                        </div>
                        <h4>${ann.title}</h4>
                        <p>${ann.message}</p>
                        ${btnHTML}
                    </div>`;
                annGrid.appendChild(card);
            });
        } catch (err) {
            console.error('Announcements load failed:', err);
        }
    }

    // Initialize
    loadGallery();
    loadAnnouncements();
    loadTourMedia();

    // ==========================================
    // TOUR MEDIA LOGIC
    // ==========================================
    async function loadTourMedia() {
        const mediaSection = document.getElementById('tour-media');
        const heroTourBtn = document.querySelector('a[href="#tour-media"]');
        try {
            const res  = await fetch(`${API_BASE}/api/media`);
            const data = await res.json();
            if (!data || data.is_deleted) { 
                if (mediaSection) mediaSection.style.display = 'none'; 
                if (heroTourBtn) heroTourBtn.style.display = 'none';
                return; 
            }
            if (mediaSection) mediaSection.style.display = 'block';
            if (heroTourBtn) heroTourBtn.style.display = 'inline-block';
            document.getElementById('frontend-media-title').textContent = data.title || 'School Tour';
            document.getElementById('frontend-media-desc').textContent  = data.description || '';
            const container = document.getElementById('media-player-container');
            container.innerHTML = '';
            if (data.src_type === 'youtube') {
                container.innerHTML = `<iframe src="https://www.youtube.com/embed/${data.src}?controls=1" frameborder="0" allowfullscreen></iframe>`;
            } else {
                container.innerHTML = `<video controls poster="${data.thumbnail_url || ''}"><source src="${data.src}"></video>`;
            }
        } catch (err) {
            console.error('Tour media load failed:', err);
            if (mediaSection) mediaSection.style.display = 'none';
        }
    }

    // ==========================================
    // CONTACT FORM LOGIC
    // ==========================================
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Message Sent!';
            btn.style.backgroundColor = '#4caf50'; // Green success color
            contactForm.reset();
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.backgroundColor = '';
            }, 4000);
        });
    }
