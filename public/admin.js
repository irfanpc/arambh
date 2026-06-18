const API_BASE = ''; // Use relative path so it works perfectly on both Render and Localhost

function authHeader() {
    return { 'Authorization': `Bearer ${sessionStorage.getItem('aarambh_token')}` };
}

// Default Data if local storage is empty
const defaultGallery = [
    { id: 1, src: 'img/gallery1.jpg', title: 'Bright Classroom', category: 'classroom' },
    { id: 2, src: 'img/gallery2.jpg', title: 'Children playing blocks', category: 'activity' },
    { id: 3, src: 'img/gallery3.jpg', title: 'Art class painting', category: 'activity' },
    { id: 4, src: 'img/gallery4.jpg', title: 'Annual day celebration', category: 'event' },
    { id: 5, src: 'img/gallery5.jpg', title: 'Reading corner', category: 'classroom' },
    { id: 6, src: 'img/gallery6.jpg', title: 'Sports day event', category: 'event' }
];

let galleryData = [];

// Login Logic
const loginForm = document.getElementById('login-form');
const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const errorMsg = document.getElementById('login-error');

// Password Visibility Toggle
const togglePassword = document.getElementById('toggle-password');
const passwordInput = document.getElementById('password');

if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
        this.style.color = type === 'text' ? 'var(--primary-color)' : '#a0aec0';
    });
}


// Check Session
if (sessionStorage.getItem('aarambh_token')) {
    loginScreen.style.display = 'none';
    dashboardScreen.style.display = 'flex';
    renderGallery();
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorMsg.style.display = 'none';
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  try {
    const res  = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      const { token } = await res.json();
      sessionStorage.setItem('aarambh_token', token);
      loginScreen.style.display = 'none';
      dashboardScreen.style.display = 'flex';
      renderGallery();
    } else {
      const { error } = await res.json();
      errorMsg.textContent = error || 'Invalid credentials';
      errorMsg.style.display = 'block';
    }
  } catch (err) {
    errorMsg.textContent = 'Cannot connect to server.';
    errorMsg.style.display = 'block';
  }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem('aarambh_token');
    window.location.reload();
});

// Render Gallery
const editableGrid = document.getElementById('editable-grid');

async function renderGallery() {
  editableGrid.innerHTML = '<p>Loading...</p>';
  const res  = await fetch(`${API_BASE}/api/gallery`);
  galleryData = await res.json();
  editableGrid.innerHTML = `<p>Debug: loaded ${galleryData.length} items. Raw data: ${JSON.stringify(galleryData).substring(0, 50)}...</p>`;
  galleryData.forEach((img, index) => {
    const card = document.createElement('div');
    card.className = 'edit-card';
    card.draggable = true;
    card.dataset.index = index;
    card.innerHTML = `
      <img src="${img.url}" alt="${img.title}">
      <div class="edit-card-info">
        <h4>${img.title}</h4>
        <span class="badge">${img.category}</span>
      </div>
      <div class="card-actions">
        <button class="action-btn edit" onclick="openEditModal('${img.id}')">
          <i class="fa-solid fa-pen"></i></button>
        <button class="action-btn delete" onclick="deleteImage('${img.id}')">
          <i class="fa-solid fa-trash"></i></button>
      </div>`;
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
    // Re-render visually without saving instantly to db
    editableGrid.innerHTML = '';
    galleryData.forEach((img, index) => {
        const card = document.createElement('div');
        card.className = 'edit-card';
        card.draggable = true;
        card.dataset.index = index;
        card.innerHTML = `
          <img src="${img.url}" alt="${img.title}">
          <div class="edit-card-info">
            <h4>${img.title}</h4>
            <span class="badge">${img.category}</span>
          </div>
          <div class="card-actions">
            <button class="action-btn edit" onclick="openEditModal('${img.id}')">
              <i class="fa-solid fa-pen"></i></button>
            <button class="action-btn delete" onclick="deleteImage('${img.id}')">
              <i class="fa-solid fa-trash"></i></button>
          </div>`;
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragover', handleDragOver);
        card.addEventListener('drop', handleDrop);
        editableGrid.appendChild(card);
    });
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
    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', 'New Image');
    formData.append('category', 'classroom');
    fetch(`${API_BASE}/api/gallery`, {
      method: 'POST',
      headers: authHeader(),
      body: formData,
    }).then(r => r.json()).then(img => {
      galleryData.push(img);
      openEditModal(img.id);
      renderGallery();
    });
  }
}

// Delete Logic
window.deleteImage = async function(id) {
  if (!confirm('Delete this image?')) return;
  const res = await fetch(`${API_BASE}/api/gallery/${id}`, {
    method: 'DELETE',
    headers: authHeader(),
  });
  if (res.ok) renderGallery();
  else alert('Delete failed.');
};

// Edit Logic
const modal = document.getElementById('edit-modal');
const closeBtn = document.querySelector('.close-modal');

window.openEditModal = function(id) {
    const img = galleryData.find(i => i.id === id);
    if (!img) return;
    document.getElementById('edit-title').value = img.title;
    document.getElementById('edit-category').value = img.category;
    document.getElementById('edit-index').value = id; // Store ID here
    modal.classList.add('active');
};

closeBtn.addEventListener('click', () => modal.classList.remove('active'));

document.getElementById('save-edit-btn').addEventListener('click', async () => {
    const id = document.getElementById('edit-index').value; // This is now the ID
    const title = document.getElementById('edit-title').value;
    const category = document.getElementById('edit-category').value;
    
    try {
        const res = await fetch(`${API_BASE}/api/gallery/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeader() },
            body: JSON.stringify({ title, category }),
        });
        
        if (res.ok) {
            modal.classList.remove('active');
            renderGallery();
        } else {
            alert('Failed to update image.');
        }
    } catch (err) {
        alert('Error connecting to server.');
    }
});

// Save and Reset
document.getElementById('save-btn').addEventListener('click', async () => {
  const token = sessionStorage.getItem('aarambh_token');
  const order = galleryData.map((img, i) => ({ id: img.id, sort_order: i }));
  const res = await fetch(`${API_BASE}/api/gallery/reorder`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ order }),
  });
  if (res.ok) alert('Gallery saved and published!');
  else alert('Error saving gallery.');
});

document.getElementById('reset-btn').addEventListener('click', () => {
    if(confirm('Reset all changes back to default? (This requires backend logic not implemented, ignoring)')) {
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

// Announcements Logic
let announcementsData = [];

async function renderAnnouncementsAdmin() {
    const listContainer = document.getElementById('announcements-admin-list');
    listContainer.innerHTML = '<p>Loading...</p>';
    
    const res = await fetch(`${API_BASE}/api/announcements`);
    announcementsData = await res.json();
    listContainer.innerHTML = '';

    announcementsData.forEach((ann, index) => {
        const card = document.createElement('div');
        card.className = `ann-admin-card ${ann.pinned ? 'pinned' : ''}`;
        
        card.innerHTML = `
            <div class="ann-admin-info">
                <h4>${ann.pinned ? '📌 ' : ''}${ann.title} <span class="badge" style="margin-left: 10px;">${ann.status}</span></h4>
                <p>${ann.message}</p>
                <small style="color: #999;">Date: ${ann.ann_date}</small>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="action-btn edit" onclick="openAnnModal(${index})"><i class="fa-solid fa-pen"></i></button>
                <button class="action-btn delete" onclick="deleteAnnouncement('${ann.id}')"><i class="fa-solid fa-trash"></i></button>
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
    document.getElementById('ann-date').value = ann.ann_date; // changed from ann.date
    document.getElementById('ann-status').value = ann.status;
    document.getElementById('ann-btn-text').value = ann.btn_text || '';
    document.getElementById('ann-btn-link').value = ann.btn_link || '';
    document.getElementById('ann-pinned').checked = ann.pinned;
    document.getElementById('ann-image-base64').value = ''; 
    
    if(ann.image_url) {
        document.getElementById('ann-image-preview').src = ann.image_url;
        document.getElementById('ann-preview-container').style.display = 'block';
    } else {
        document.getElementById('ann-preview-container').style.display = 'none';
    }
    
    document.getElementById('ann-image-upload').value = '';
    annModal.classList.add('active');
};

closeAnnBtn.addEventListener('click', () => annModal.classList.remove('active'));

let annSelectedFile = null;
document.getElementById('ann-image-upload').addEventListener('change', function() {
    annSelectedFile = this.files[0];
    if(annSelectedFile && annSelectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('ann-image-preview').src = e.target.result;
            document.getElementById('ann-preview-container').style.display = 'block';
        };
        reader.readAsDataURL(annSelectedFile);
    }
});

document.getElementById('remove-ann-image-btn').addEventListener('click', () => {
    annSelectedFile = null;
    document.getElementById('ann-image-upload').value = '';
    document.getElementById('ann-preview-container').style.display = 'none';
});

// Save from Modal
document.getElementById('save-announcement-modal-btn').addEventListener('click', async () => {
    const index = parseInt(document.getElementById('ann-index').value);
    
    const formData = new FormData();
    formData.append('title', document.getElementById('ann-title').value);
    formData.append('message', document.getElementById('ann-message').value);
    formData.append('ann_date', document.getElementById('ann-date').value);
    formData.append('status', document.getElementById('ann-status').value);
    formData.append('btn_text', document.getElementById('ann-btn-text').value);
    formData.append('btn_link', document.getElementById('ann-btn-link').value);
    formData.append('pinned', document.getElementById('ann-pinned').checked);
    
    if (annSelectedFile) {
        formData.append('image', annSelectedFile);
    }

    if(index === -1) {
        await fetch(`${API_BASE}/api/announcements`, {
            method: 'POST',
            headers: authHeader(),
            body: formData
        });
    } else {
        const id = announcementsData[index].id;
        await fetch(`${API_BASE}/api/announcements/${id}`, {
            method: 'PUT',
            headers: authHeader(),
            body: formData
        });
    }
    
    annSelectedFile = null;
    annModal.classList.remove('active');
    renderAnnouncementsAdmin();
});

// Delete Announcement
window.deleteAnnouncement = async function(id) {
    if(confirm('Are you sure you want to delete this announcement?')) {
        await fetch(`${API_BASE}/api/announcements/${id}`, {
            method: 'DELETE',
            headers: authHeader(),
        });
        renderAnnouncementsAdmin();
    }
};

// Save & Publish handled implicitly now, but we keep the button so users aren't confused
document.getElementById('save-announcements-btn').addEventListener('click', () => {
    alert('Announcements successfully updated! Changes are live on the website.');
});

// ==========================================
// TOUR MEDIA LOGIC
// ==========================================
let mediaData = null;

async function loadMediaAdmin() {
    const res = await fetch(`${API_BASE}/api/media`);
    mediaData = await res.json() || {
        title: 'School Tour',
        description: 'Discover our beautiful campus, state-of-the-art facilities, and the joyous environment where children thrive.',
        media_type: 'video', 
        src_type: 'mp4', 
        src: 'https://assets.mixkit.co/videos/preview/mixkit-children-playing-with-colorful-blocks-in-a-classroom-41887-large.mp4',
        thumbnail_url: ''
    };

    document.getElementById('media-title').value = mediaData.title || '';
    document.getElementById('media-desc').value = mediaData.description || '';
    document.getElementById('media-type').value = mediaData.media_type || 'video';
    
    if (mediaData.src_type !== 'cloudinary' && mediaData.src_type !== 'audio-base64') {
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
    if(!mediaData) return;
    
    if(mediaData.media_type === 'audio') {
        const bgImg = mediaData.thumbnail_url || 'img/gallery1.jpg';
        container.innerHTML = `
            <div style="width:100%; height:100%; background:url('${bgImg}') center/cover; display:flex; align-items:center; justify-content:center;">
                <div style="background:rgba(0,0,0,0.6); padding:20px; border-radius:10px; text-align:center;">
                    <i class="fa-solid fa-music" style="font-size:3rem; color:var(--primary-color);"></i>
                    <audio controls src="${mediaData.src}" style="display:block; margin-top:15px;"></audio>
                </div>
            </div>`;
    } else {
        if (mediaData.src_type === 'youtube') {
            container.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${mediaData.src}?autoplay=0&controls=1" frameborder="0" allowfullscreen></iframe>`;
        } else {
            container.innerHTML = `<video width="100%" height="100%" style="object-fit:cover;" controls><source src="${mediaData.src}" type="video/mp4"></video>`;
        }
    }
}

let mediaSelectedFile = null;
document.getElementById('media-file').addEventListener('change', function(e) {
    mediaSelectedFile = e.target.files[0];
    if (mediaSelectedFile) {
        document.getElementById('media-file-status').textContent = 'File selected (will upload on save)';
        document.getElementById('media-url').value = '';
    }
});

window.saveMediaAdmin = async function() {
    const formData = new FormData();
    formData.append('title', document.getElementById('media-title').value.trim());
    formData.append('description', document.getElementById('media-desc').value.trim());
    
    const typeSelect = document.getElementById('media-type').value;
    formData.append('media_type', typeSelect);
    
    let url = document.getElementById('media-url').value.trim();
    
    if (url && !mediaSelectedFile) {
        if(typeSelect === 'audio') {
            formData.append('src_type', 'audio-url');
            formData.append('src', url);
        } else {
            let vType = 'mp4';
            if(url.length === 11 && !url.includes('/')) {
                vType = 'youtube';
            } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
                vType = 'youtube';
                const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=))([^"&?\/\s]{11})/);
                if(match) url = match[1];
            }
            formData.append('src_type', vType);
            formData.append('src', url);
        }
    } else if (mediaSelectedFile) {
        formData.append('media_file', mediaSelectedFile);
    }
    
    try {
        const res = await fetch(`${API_BASE}/api/media`, {
            method: 'POST',
            headers: authHeader(),
            body: formData
        });
        if(res.ok) {
            alert('Media Section updated! Refresh homepage to see changes.');
            loadMediaAdmin();
        } else {
            alert('Failed to save media.');
        }
    } catch(error) {
        alert('Server connection failed.');
    }
};

window.deleteMediaAdmin = async function() {
    if(confirm('Are you sure you want to completely remove the School Tour section from the website?')) {
        await fetch(`${API_BASE}/api/media`, {
            method: 'DELETE',
            headers: authHeader()
        });
        document.getElementById('media-title').value = '';
        document.getElementById('media-desc').value = '';
        document.getElementById('media-url').value = '';
        document.getElementById('media-preview-container').innerHTML = '<p style="color:white; text-align:center; padding: 20px;">No media (Section is hidden)</p>';
        alert('School Tour section has been removed from the website.');
    }
};
