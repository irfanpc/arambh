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

    function loadGallery() {
        if(!galleryGrid) return;
        
        // Load from LocalStorage or use default
        const savedGallery = JSON.parse(localStorage.getItem('aarambh_gallery')) || defaultGallery;
        
        galleryGrid.innerHTML = ''; // Clear hardcoded HTML
        
        savedGallery.forEach(item => {
            const div = document.createElement('div');
            div.className = `gallery-item ${item.category} show`;
            div.innerHTML = `
                <img src="${item.src}" alt="${item.title}" />
                <div class="overlay"><i class="fa-solid fa-magnifying-glass-plus"></i></div>
            `;
            
            // Lightbox Event
            div.addEventListener('click', () => {
                const lightbox = document.getElementById('lightbox');
                const lightboxImg = document.getElementById('lightbox-img');
                if(lightbox && lightboxImg) {
                    lightboxImg.src = item.src;
                    lightbox.style.display = 'flex';
                }
            });
            
            galleryGrid.appendChild(div);
        });

        // Rebind filters
        bindFilters();
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
    function loadAnnouncements() {
        const annGrid = document.getElementById('dynamic-announcements');
        if(!annGrid) return;
        
        const defaultAnnouncements = [
            {
                id: 1,
                title: "Admissions open for the 2026-27 academic year!",
                message: "We are excited to welcome new students to Aarambh. Early bird discounts are available until the end of the month.",
                date: "2026-06-01",
                status: "New",
                pinned: true,
                btnText: "Apply Now",
                btnLink: "#admissions",
                image: ""
            },
            {
                id: 2,
                title: "Annual Sports Day",
                message: "Annual Sports Day is scheduled for next Friday. All parents are welcome to join us for a fun-filled day!",
                date: "2026-05-15",
                status: "Event",
                pinned: false,
                btnText: "",
                btnLink: "",
                image: ""
            }
        ];

        const savedAnn = JSON.parse(localStorage.getItem('aarambh_announcements')) || defaultAnnouncements;
        
        // Sort pinned first, then by date descending
        const sorted = [...savedAnn].sort((a, b) => {
            if(a.pinned !== b.pinned) return b.pinned ? 1 : -1;
            return new Date(b.date) - new Date(a.date);
        });

        annGrid.innerHTML = '';

        sorted.forEach(ann => {
            const card = document.createElement('div');
            card.className = `ann-public-card ${ann.pinned ? 'pinned-card' : ''}`;
            
            let imgHTML = '';
            if(ann.image) {
                imgHTML = `<img src="${ann.image}" class="ann-card-img" alt="Announcement Image">`;
            }
            
            let btnHTML = '';
            if(ann.btnText && ann.btnLink) {
                btnHTML = `<a href="${ann.btnLink}" class="btn btn-primary ann-btn">${ann.btnText}</a>`;
            }

            let pinHTML = '';
            if(ann.pinned) {
                pinHTML = `<div class="pin-badge"><i class="fa-solid fa-thumbtack"></i> Pinned</div>`;
            }

            card.innerHTML = `
                ${pinHTML}
                ${imgHTML}
                <div class="ann-card-content">
                    <div class="ann-card-header">
                        <span class="date-badge ${ann.status.toLowerCase()}">${ann.status}</span>
                        <span class="ann-date"><i class="fa-regular fa-calendar"></i> ${ann.date}</span>
                    </div>
                    <h4>${ann.title}</h4>
                    <p>${ann.message}</p>
                    ${btnHTML}
                </div>
            `;
            
            annGrid.appendChild(card);
        });
    }

    // Initialize
    loadGallery();
    loadAnnouncements();
    loadTourMedia();

    // ==========================================
    // TOUR MEDIA LOGIC
    // ==========================================
    function loadTourMedia() {
        const defaultMediaData = {
            title: 'School Tour',
            desc: 'Discover our beautiful campus, state-of-the-art facilities, and the joyous environment where children thrive.',
            mediaType: 'video',
            srcType: 'mp4',
            src: 'https://assets.mixkit.co/videos/preview/mixkit-children-playing-with-colorful-blocks-in-a-classroom-41887-large.mp4',
            thumbnail: 'img/gallery1.jpg'
        };
        
        const rawData = JSON.parse(localStorage.getItem('aarambh_tour_media'));
        const mediaSection = document.getElementById('tour-media');
        
        if (rawData && rawData.isDeleted) {
            mediaSection.style.display = 'none';
            return;
        }

        const mediaData = rawData || defaultMediaData;
        
        if (mediaData && mediaData.src) {
            mediaSection.style.display = 'block';
            
            document.getElementById('frontend-media-title').textContent = mediaData.title || 'School Tour';
            document.getElementById('frontend-media-desc').textContent = mediaData.desc || '';
            
            const container = document.getElementById('media-player-container');
            const loader = document.getElementById('media-loader');
            
            container.innerHTML = '';
            
            if (mediaData.mediaType === 'audio') {
                const bgImg = mediaData.thumbnail || 'img/gallery1.jpg';
                container.innerHTML = `
                    <div class="audio-player-container" style="background-image: url('${bgImg}');">
                        <div class="audio-overlay"></div>
                        <div class="audio-controls-wrapper">
                            <i class="fa-solid fa-music audio-icon"></i>
                            <h3 style="margin-bottom:10px;">Listen to our School Anthem</h3>
                            <audio controls src="${mediaData.src}"></audio>
                        </div>
                    </div>
                `;
            } else {
                if (mediaData.srcType === 'youtube') {
                    const ytSrc = `https://www.youtube.com/embed/${mediaData.src}?autoplay=0&controls=1&modestbranding=1`;
                    container.innerHTML = `<iframe src="${ytSrc}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
                } else {
                    container.innerHTML = `
                        <video id="frontend-media-video" poster="${mediaData.thumbnail || 'img/gallery1.jpg'}" playsinline autoplay muted loop>
                            <source src="${mediaData.src}">
                        </video>
                        <div class="video-overlay-ui" id="video-overlay-ui">
                            <button class="play-btn-large" id="play-btn-large"><i class="fa-solid fa-play"></i></button>
                        </div>
                        <div class="video-controls-bar">
                            <button class="control-btn" id="play-pause-toggle"><i class="fa-solid fa-play"></i></button>
                            <div class="progress-container" id="progress-container">
                                <div class="progress-bar" id="progress-bar"></div>
                            </div>
                            <button class="control-btn" id="fullscreen-btn"><i class="fa-solid fa-expand"></i></button>
                        </div>
                    `;
                    
                    const video = document.getElementById('frontend-media-video');
                    const overlayUi = document.getElementById('video-overlay-ui');
                    const playLargeBtn = document.getElementById('play-btn-large');
                    const playToggleBtn = document.getElementById('play-pause-toggle');
                    const progressBar = document.getElementById('progress-bar');
                    const progressContainer = document.getElementById('progress-container');
                    const fullscreenBtn = document.getElementById('fullscreen-btn');
                    
                    function togglePlay() {
                        if (video.paused) {
                            video.play();
                        } else {
                            video.pause();
                        }
                    }

                    video.addEventListener('play', () => {
                        overlayUi.classList.add('hidden');
                        playToggleBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
                    });

                    video.addEventListener('pause', () => {
                        overlayUi.classList.remove('hidden');
                        playToggleBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
                    });

                    playLargeBtn.addEventListener('click', togglePlay);
                    playToggleBtn.addEventListener('click', togglePlay);
                    video.addEventListener('click', togglePlay);

                    video.addEventListener('timeupdate', () => {
                        const percentage = (video.currentTime / video.duration) * 100;
                        progressBar.style.width = percentage + '%';
                    });

                    progressContainer.addEventListener('click', (e) => {
                        const rect = progressContainer.getBoundingClientRect();
                        const pos = (e.clientX - rect.left) / rect.width;
                        video.currentTime = pos * video.duration;
                    });

                    fullscreenBtn.addEventListener('click', () => {
                        if (container.requestFullscreen) {
                            container.requestFullscreen();
                        } else if (container.webkitRequestFullscreen) {
                            container.webkitRequestFullscreen();
                        }
                    });
                }
            }
        }
    }
