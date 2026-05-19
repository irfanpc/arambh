// Default Data if local storage is empty
const defaultGallery = [
    { id: 1, src: 'img/gallery1.jpg', title: 'Bright Classroom', category: 'classroom' },
    { id: 2, src: 'img/gallery2.jpg', title: 'Children playing blocks', category: 'activity' },
    { id: 3, src: 'img/gallery3.jpg', title: 'Art class painting', category: 'activity' },
    { id: 4, src: 'img/gallery4.jpg', title: 'Annual day celebration', category: 'event' },
    { id: 5, src: 'img/gallery5.jpg', title: 'Reading corner', category: 'classroom' },
    { id: 6, src: 'img/gallery6.jpg', title: 'Sports day event', category: 'event' }
];

let galleryData = JSON.parse(localStorage.getItem('aarambh_gallery')) || defaultGallery;

// Login Logic
const loginForm = document.getElementById('login-form');
const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const errorMsg = document.getElementById('login-error');

// Check Session
if (sessionStorage.getItem('admin_logged_in') === 'true') {
    loginScreen.style.display = 'none';
    dashboardScreen.style.display = 'flex';
    renderGallery();
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (user === 'admin' && pass === 'admin') { // Hardcoded secure demo login
        sessionStorage.setItem('admin_logged_in', 'true');
        loginScreen.style.display = 'none';
        dashboardScreen.style.display = 'flex';
        renderGallery();
    } else {
        errorMsg.textContent = 'Invalid username or password.';
        errorMsg.style.display = 'block';
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem('admin_logged_in');
    window.location.reload();
});

// Render Gallery
const editableGrid = document.getElementById('editable-grid');

function renderGallery() {
    editableGrid.innerHTML = '';
    galleryData.forEach((img, index) => {
        const card = document.createElement('div');
        card.className = 'edit-card';
        card.draggable = true;
        card.dataset.index = index;
        
        card.innerHTML = `
            <img src="${img.src}" alt="${img.title}">
            <div class="edit-card-info">
                <h4>${img.title}</h4>
                <span class="badge">${img.category}</span>
            </div>
            <div class="card-actions">
                <button class="action-btn edit" onclick="openEditModal(${index})"><i class="fa-solid fa-pen"></i></button>
                <button class="action-btn delete" onclick="deleteImage(${index})"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        
        // Drag and Drop Listeners
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragover', handleDragOver);
        card.addEventListener('drop', handleDrop);
        
        editableGrid.appendChild(card);
    });
}

// Drag & Drop Reordering Logic
let dragStartIndex;

function handleDragStart(e) {
    dragStartIndex = +e.target.closest('.edit-card').dataset.index;
}

function handleDragOver(e) {
    e.preventDefault(); // Necessary to allow dropping
}

function handleDrop(e) {
    const dragEndIndex = +e.target.closest('.edit-card').dataset.index;
    swapItems(dragStartIndex, dragEndIndex);
}

function swapItems(fromIndex, toIndex) {
    const itemOne = galleryData[fromIndex];
    const itemTwo = galleryData[toIndex];
    galleryData[fromIndex] = itemTwo;
    galleryData[toIndex] = itemOne;
    renderGallery();
}

// Upload Logic
const uploadZone = document.getElementById('upload-zone');
const fileInput = document.getElementById('file-input');

uploadZone.addEventListener('click', () => fileInput.click());

uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    handleFiles(files);
});

fileInput.addEventListener('change', function() {
    handleFiles(this.files);
});

function handleFiles(files) {
    for (let file of files) {
        if (!file.type.startsWith('image/')) continue;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const newIndex = galleryData.length;
            galleryData.push({
                id: Date.now() + Math.random(),
                src: e.target.result, // Base64 string for local demo
                title: 'New Uploaded Image',
                category: 'classroom'
            });
            renderGallery();
            openEditModal(newIndex); // Immediately prompt user for details
        };
        reader.readAsDataURL(file);
    }
}

// Delete Logic
window.deleteImage = function(index) {
    if(confirm('Are you sure you want to delete this image?')) {
        galleryData.splice(index, 1);
        renderGallery();
    }
};

// Edit Logic
const modal = document.getElementById('edit-modal');
const closeBtn = document.querySelector('.close-modal');

window.openEditModal = function(index) {
    document.getElementById('edit-title').value = galleryData[index].title;
    document.getElementById('edit-category').value = galleryData[index].category;
    document.getElementById('edit-index').value = index;
    modal.classList.add('active');
};

closeBtn.addEventListener('click', () => modal.classList.remove('active'));

document.getElementById('save-edit-btn').addEventListener('click', () => {
    const index = document.getElementById('edit-index').value;
    galleryData[index].title = document.getElementById('edit-title').value;
    galleryData[index].category = document.getElementById('edit-category').value;
    modal.classList.remove('active');
    renderGallery();
});

// Save and Reset
document.getElementById('save-btn').addEventListener('click', () => {
    localStorage.setItem('aarambh_gallery', JSON.stringify(galleryData));
    alert('Gallery successfully updated! Changes are live on the website.');
});

document.getElementById('reset-btn').addEventListener('click', () => {
    if(confirm('Reset all changes back to default?')) {
        localStorage.removeItem('aarambh_gallery');
        galleryData = [...defaultGallery];
        renderGallery();
    }
});

const navGallery = document.getElementById('nav-gallery');
const navAnnouncements = document.getElementById('nav-announcements');
const navMedia = document.getElementById('nav-media');

const gallerySection = document.querySelector('.gallery-manager:not(#announcements-manager):not(#media-manager)');
const announcementsSection = document.getElementById('announcements-manager');
const mediaSection = document.getElementById('media-manager');

function switchTab(activeNav, activeSection) {
    navGallery.classList.remove('active');
    navAnnouncements.classList.remove('active');
    if(navMedia) navMedia.classList.remove('active');
    
    gallerySection.style.display = 'none';
    announcementsSection.style.display = 'none';
    if(mediaSection) mediaSection.style.display = 'none';
    
    activeNav.classList.add('active');
    activeSection.style.display = 'block';
}

navGallery.addEventListener('click', (e) => {
    e.preventDefault();
    switchTab(navGallery, gallerySection);
});

navAnnouncements.addEventListener('click', (e) => {
    e.preventDefault();
    switchTab(navAnnouncements, announcementsSection);
    renderAnnouncementsAdmin();
});

if(navMedia) {
    navMedia.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab(navMedia, mediaSection);
        loadMediaAdmin();
    });
}

// Default Announcements Data
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

let announcementsData = JSON.parse(localStorage.getItem('aarambh_announcements')) || defaultAnnouncements;

function renderAnnouncementsAdmin() {
    const listContainer = document.getElementById('announcements-admin-list');
    listContainer.innerHTML = '';
    
    // Sort pinned first, then by date descending
    const sorted = [...announcementsData].sort((a, b) => {
        if(a.pinned !== b.pinned) return b.pinned ? 1 : -1;
        return new Date(b.date) - new Date(a.date);
    });

    sorted.forEach(ann => {
        const originalIndex = announcementsData.findIndex(x => x.id === ann.id);
        const card = document.createElement('div');
        card.className = `ann-admin-card ${ann.pinned ? 'pinned' : ''}`;
        
        card.innerHTML = `
            <div class="ann-admin-info">
                <h4>${ann.pinned ? '📌 ' : ''}${ann.title} <span class="badge" style="margin-left: 10px;">${ann.status}</span></h4>
                <p>${ann.message}</p>
                <small style="color: #999;">Date: ${ann.date}</small>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="action-btn edit" onclick="openAnnModal(${originalIndex})"><i class="fa-solid fa-pen"></i></button>
                <button class="action-btn delete" onclick="deleteAnnouncement(${originalIndex})"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        listContainer.appendChild(card);
    });
}

// Modal Logic
const annModal = document.getElementById('announcement-modal');
const closeAnnBtn = document.querySelector('.close-announcement-modal');

document.getElementById('add-announcement-btn').addEventListener('click', () => {
    // Open modal with empty fields
    document.getElementById('ann-index').value = '-1'; // -1 means new
    document.getElementById('ann-title').value = '';
    document.getElementById('ann-message').value = '';
    document.getElementById('ann-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('ann-status').value = 'New';
    document.getElementById('ann-btn-text').value = '';
    document.getElementById('ann-btn-link').value = '';
    document.getElementById('ann-pinned').checked = false;
    document.getElementById('ann-image-base64').value = '';
    document.getElementById('ann-preview-container').style.display = 'none';
    document.getElementById('ann-image-upload').value = '';
    annModal.classList.add('active');
});

window.openAnnModal = function(index) {
    const ann = announcementsData[index];
    document.getElementById('ann-index').value = index;
    document.getElementById('ann-title').value = ann.title;
    document.getElementById('ann-message').value = ann.message;
    document.getElementById('ann-date').value = ann.date;
    document.getElementById('ann-status').value = ann.status;
    document.getElementById('ann-btn-text').value = ann.btnText || '';
    document.getElementById('ann-btn-link').value = ann.btnLink || '';
    document.getElementById('ann-pinned').checked = ann.pinned;
    document.getElementById('ann-image-base64').value = ann.image || '';
    
    if(ann.image) {
        document.getElementById('ann-image-preview').src = ann.image;
        document.getElementById('ann-preview-container').style.display = 'block';
    } else {
        document.getElementById('ann-preview-container').style.display = 'none';
    }
    
    document.getElementById('ann-image-upload').value = '';
    annModal.classList.add('active');
};

closeAnnBtn.addEventListener('click', () => annModal.classList.remove('active'));

// Image Upload inside Announcement Modal
document.getElementById('ann-image-upload').addEventListener('change', function() {
    const file = this.files[0];
    if(file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('ann-image-base64').value = e.target.result;
            document.getElementById('ann-image-preview').src = e.target.result;
            document.getElementById('ann-preview-container').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

// Remove Image Logic
document.getElementById('remove-ann-image-btn').addEventListener('click', () => {
    document.getElementById('ann-image-base64').value = '';
    document.getElementById('ann-image-upload').value = '';
    document.getElementById('ann-preview-container').style.display = 'none';
});

// Save from Modal
document.getElementById('save-announcement-modal-btn').addEventListener('click', () => {
    const index = parseInt(document.getElementById('ann-index').value);
    
    const newAnn = {
        id: index === -1 ? Date.now() : announcementsData[index].id,
        title: document.getElementById('ann-title').value,
        message: document.getElementById('ann-message').value,
        date: document.getElementById('ann-date').value,
        status: document.getElementById('ann-status').value,
        btnText: document.getElementById('ann-btn-text').value,
        btnLink: document.getElementById('ann-btn-link').value,
        pinned: document.getElementById('ann-pinned').checked,
        image: document.getElementById('ann-image-base64').value
    };

    if(index === -1) {
        announcementsData.push(newAnn);
    } else {
        announcementsData[index] = newAnn;
    }
    
    annModal.classList.remove('active');
    renderAnnouncementsAdmin();
});

// Delete Announcement
window.deleteAnnouncement = function(index) {
    if(confirm('Are you sure you want to delete this announcement?')) {
        announcementsData.splice(index, 1);
        renderAnnouncementsAdmin();
    }
};

// Save & Publish
document.getElementById('save-announcements-btn').addEventListener('click', () => {
    localStorage.setItem('aarambh_announcements', JSON.stringify(announcementsData));
    alert('Announcements successfully updated! Changes are live on the website.');
});

// ==========================================
// TOUR MEDIA LOGIC
// ==========================================
let mediaData = JSON.parse(localStorage.getItem('aarambh_tour_media')) || {
    title: 'School Tour',
    desc: 'Discover our beautiful campus, state-of-the-art facilities, and the joyous environment where children thrive.',
    mediaType: 'video', // 'video' or 'audio'
    srcType: 'mp4', // 'mp4', 'youtube', 'base64', 'audio-url', 'audio-base64'
    src: 'https://assets.mixkit.co/videos/preview/mixkit-children-playing-with-colorful-blocks-in-a-classroom-41887-large.mp4',
    thumbnail: 'img/gallery1.jpg'
};

function loadMediaAdmin() {
    document.getElementById('media-title').value = mediaData.title || '';
    document.getElementById('media-desc').value = mediaData.desc || '';
    document.getElementById('media-type').value = mediaData.mediaType || 'video';
    
    if (mediaData.srcType !== 'base64' && mediaData.srcType !== 'audio-base64') {
        document.getElementById('media-url').value = mediaData.src || '';
    } else {
        document.getElementById('media-url').value = '';
    }
    
    toggleThumbnailField();
    updateMediaPreview();
}

function toggleThumbnailField() {
    const type = document.getElementById('media-type').value;
    if(type === 'audio') {
        document.getElementById('thumbnail-group').style.display = 'block';
    } else {
        document.getElementById('thumbnail-group').style.display = 'none';
    }
}

document.getElementById('media-type').addEventListener('change', toggleThumbnailField);

function updateMediaPreview() {
    const container = document.getElementById('media-preview-container');
    container.innerHTML = '';
    
    if(mediaData.mediaType === 'audio') {
        const bgImg = mediaData.thumbnail || 'img/gallery1.jpg';
        container.innerHTML = `
            <div style="width:100%; height:100%; background:url('${bgImg}') center/cover; display:flex; align-items:center; justify-content:center;">
                <div style="background:rgba(0,0,0,0.6); padding:20px; border-radius:10px; text-align:center;">
                    <i class="fa-solid fa-music" style="font-size:3rem; color:var(--primary-color);"></i>
                    <audio controls src="${mediaData.src}" style="display:block; margin-top:15px;"></audio>
                </div>
            </div>`;
    } else {
        if (mediaData.srcType === 'youtube') {
            container.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${mediaData.src}?autoplay=0&controls=1" frameborder="0" allowfullscreen></iframe>`;
        } else {
            container.innerHTML = `<video width="100%" height="100%" style="object-fit:cover;" controls><source src="${mediaData.src}" type="video/mp4"></video>`;
        }
    }
}

// Handle URL Input Change manually (we won't auto-save, we'll let them click save)
// Handle Media Upload
document.getElementById('media-file').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        if(file.size > 5 * 1024 * 1024) {
            alert('File is too large for offline storage (Max 5MB). Please use a direct URL instead.');
            this.value = '';
            return;
        }
        document.getElementById('media-file-status').textContent = 'Processing...';
        
        const reader = new FileReader();
        reader.onload = function(event) {
            mediaData.src = event.target.result;
            const typeSelect = document.getElementById('media-type').value;
            mediaData.srcType = (typeSelect === 'audio') ? 'audio-base64' : 'base64';
            mediaData.mediaType = typeSelect;
            
            document.getElementById('media-file-status').textContent = 'Ready to save';
            document.getElementById('media-url').value = '';
            updateMediaPreview();
        };
        reader.readAsDataURL(file);
    }
});

// Handle Thumbnail Upload
document.getElementById('media-thumb').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        if(file.size > 2 * 1024 * 1024) {
            alert('Image too large (Max 2MB).');
            this.value = '';
            return;
        }
        document.getElementById('thumb-file-status').textContent = 'Processing...';
        
        const reader = new FileReader();
        reader.onload = function(event) {
            mediaData.thumbnail = event.target.result;
            document.getElementById('thumb-file-status').textContent = 'Ready to save';
            updateMediaPreview();
        };
        reader.readAsDataURL(file);
    }
});

window.saveMediaAdmin = function() {
    mediaData.title = document.getElementById('media-title').value.trim();
    mediaData.desc = document.getElementById('media-desc').value.trim();
    
    const typeSelect = document.getElementById('media-type').value;
    mediaData.mediaType = typeSelect;
    
    let url = document.getElementById('media-url').value.trim();
    
    if (url) {
        if(typeSelect === 'audio') {
            mediaData.srcType = 'audio-url';
            mediaData.src = url;
        } else {
            let vType = 'mp4';
            if(url.length === 11 && !url.includes('/')) {
                vType = 'youtube';
            } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
                vType = 'youtube';
                const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=))([^"&?\/\s]{11})/);
                if(match) url = match[1];
            }
            mediaData.srcType = vType;
            mediaData.src = url;
        }
    }
    
    try {
        mediaData.isDeleted = false;
        localStorage.setItem('aarambh_tour_media', JSON.stringify(mediaData));
        updateMediaPreview();
        alert('Media Section updated! Refresh homepage to see changes.');
    } catch(error) {
        alert('Storage Quota Exceeded! Video/Audio file is too large to save offline. Use a URL instead.');
    }
};

window.deleteMediaAdmin = function() {
    if(confirm('Are you sure you want to completely remove the School Tour section from the website?')) {
        mediaData = { isDeleted: true };
        localStorage.setItem('aarambh_tour_media', JSON.stringify(mediaData));
        document.getElementById('media-title').value = '';
        document.getElementById('media-desc').value = '';
        document.getElementById('media-url').value = '';
        document.getElementById('media-preview-container').innerHTML = '<p style="color:white; text-align:center; padding: 20px;">No media (Section is hidden)</p>';
        alert('School Tour section has been removed from the website.');
    }
};

