// Konfigurasi - GANTI DENGAN URL SCRIPT ANDA
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwUUoxOrgjXBmmsHL71W8VHfrNa8WLbj9p9TRhWdVVYFvazgQ4J9GYpuWC0XUXCnUWqoA/exec';

// Variabel global
let posts = [];
let images = [];

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    initializeCanvas();
    setupEventListeners();
    
    // Cek jika sudah login
    if (localStorage.getItem('isAuthenticated') === 'true') {
        grantAccess();
    }
});

// Setup event listeners
function setupEventListeners() {
    // Akses dengan kata kunci
    document.getElementById('accessButton').addEventListener('click', checkPassword);
    document.getElementById('passwordInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') checkPassword();
    });
    
    // Navigasi tab
    document.querySelectorAll('.nav-link').forEach(link => {
        if (!link.classList.contains('logout')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                switchTab(this.dataset.tab);
            });
        }
    });
    
    // Logout
    document.getElementById('logoutButton').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
    
    // Posting konten baru
    document.getElementById('submitPost').addEventListener('click', createPost);
    
    // Modal gambar
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    document.getElementById('imageModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
    
    // Hamburger menu untuk mobile
    document.querySelector('.hamburger').addEventListener('click', toggleMobileMenu);
}

// Animasi canvas planet
function initializeCanvas() {
    const canvas = document.getElementById('planetCanvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Planet objects
    const planets = [
        { x: 100, y: 100, radius: 40, speed: 0.002, angle: 0, color: '#ff6b6b' },
        { x: 300, y: 300, radius: 60, speed: 0.001, angle: 1.5, color: '#4ecdc4' },
        { x: 700, y: 200, radius: 30, speed: 0.003, angle: 3, color: '#ffe66d' },
        { x: 900, y: 400, radius: 50, speed: 0.0015, angle: 4.5, color: '#ff9ff3' }
    ];
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw stars
        drawStars();
        
        // Draw and update planets
        planets.forEach(planet => {
            // Update position in circular motion
            planet.angle += planet.speed;
            planet.x = canvas.width/2 + Math.cos(planet.angle) * (canvas.width/3);
            planet.y = canvas.height/2 + Math.sin(planet.angle) * (canvas.height/3);
            
            // Draw planet
            ctx.beginPath();
            ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
            ctx.fillStyle = planet.color;
            ctx.fill();
            
            // Draw glow
            const gradient = ctx.createRadialGradient(
                planet.x, planet.y, planet.radius,
                planet.x, planet.y, planet.radius * 2
            );
            gradient.addColorStop(0, `${planet.color}40`);
            gradient.addColorStop(1, 'transparent');
            
            ctx.beginPath();
            ctx.arc(planet.x, planet.y, planet.radius * 2, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        });
        
        requestAnimationFrame(animate);
    }
    
    function drawStars() {
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = Math.random() * 1.5;
            
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fill();
        }
    }
    
    animate();
}

// Fungsi untuk memeriksa kata kunci
async function checkPassword() {
    const passwordInput = document.getElementById('passwordInput').value;
    const errorMessage = document.getElementById('errorMessage');
    
    try {
        const response = await fetch(`${SCRIPT_URL}?action=verifyPassword&password=${encodeURIComponent(passwordInput)}`);
        const result = await response.json();
        
        if (result.success) {
            grantAccess();
            localStorage.setItem('isAuthenticated', 'true');
        } else {
            errorMessage.textContent = "Kata kunci salah! Coba lagi.";
            errorMessage.style.display = 'block';
            
            // Animasi shake pada input
            const input = document.getElementById('passwordInput');
            input.style.animation = 'shake 0.5s';
            setTimeout(() => {
                input.style.animation = '';
            }, 500);
        }
    } catch (error) {
        console.error('Error:', error);
        errorMessage.textContent = "Terjadi kesalahan, coba lagi.";
        errorMessage.style.display = 'block';
    }
}

// Memberikan akses ke konten utama
async function grantAccess() {
    document.getElementById('accessOverlay').classList.add('hidden');
    document.getElementById('mainContent').classList.remove('hidden');
    await loadPosts();
    await loadGallery();
}

// Keluar dari akun
function logout() {
    localStorage.removeItem('isAuthenticated');
    document.getElementById('accessOverlay').classList.remove('hidden');
    document.getElementById('mainContent').classList.add('hidden');
    document.getElementById('passwordInput').value = '';
    document.getElementById('errorMessage').style.display = 'none';
}

// Beralih antara tab
function switchTab(tabName) {
    // Update nav link aktif
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update konten tab aktif
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
    
    // Tutup menu mobile jika terbuka
    document.querySelector('.nav-menu').classList.remove('active');
    document.querySelector('.hamburger').classList.remove('active');
}

// Membuat postingan baru
async function createPost() {
    const postText = document.getElementById('postText').value.trim();
    const imageInput = document.getElementById('imageUpload');
    
    if (!postText && !imageInput.files[0]) {
        alert('Masukkan teks atau unggah gambar!');
        return;
    }

    try {
        const formData = new FormData();
        const postData = {
            action: 'createPost',
            text: postText,
            date: new Date().toLocaleString('id-ID')
        };

        // Handle image upload
        let imageBase64 = '';
        if (imageInput.files[0]) {
            imageBase64 = await fileToBase64(imageInput.files[0]);
            postData.image = imageBase64;
        }

        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        });

        const result = await response.json();
        
        if (result.success) {
            // Reset form
            document.getElementById('postText').value = '';
            document.getElementById('imageUpload').value = '';
            
            // Muat ulang postingan
            await loadPosts();
            await loadGallery();
            switchTab('posts');
            
            alert('Postingan berhasil dibuat!');
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat membuat postingan');
    }
}

// Convert file to Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Memuat postingan dari Google Drive
async function loadPosts() {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getPosts`);
        const result = await response.json();
        
        const postsContainer = document.getElementById('postsContainer');
        
        if (!result.success || result.data.length === 0) {
            postsContainer.innerHTML = '<p class="no-posts">Belum ada postingan. Mulai dengan mengunggah sesuatu!</p>';
            return;
        }
        
        postsContainer.innerHTML = result.data.map(post => `
            <div class="post" data-id="${post.id}">
                ${post.text ? `<div class="post-text">${post.text}</div>` : ''}
                ${post.imageUrl ? `<img src="https://drive.google.com/uc?export=view&id=${post.imageUrl.split('/d/')[1]?.split('/')[0]}" alt="Post image" class="post-image" onclick="openModal('https://drive.google.com/uc?export=view&id=${post.imageUrl.split('/d/')[1]?.split('/')[0]}')">` : ''}
                <div class="post-date">${post.date}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading posts:', error);
        document.getElementById('postsContainer').innerHTML = '<p class="no-posts">Error memuat postingan.</p>';
    }
}

// Memuat galeri dari Google Drive
async function loadGallery() {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getGallery`);
        const result = await response.json();
        
        const galleryContainer = document.getElementById('galleryContainer');
        
        if (!result.success || result.data.length === 0) {
            galleryContainer.innerHTML = '<p class="no-images">Belum ada gambar di galeri.</p>';
            return;
        }
        
        galleryContainer.innerHTML = result.data.map(image => `
            <div class="gallery-item" onclick="openModal('https://drive.google.com/uc?export=view&id=${image.id}')">
                <img src="https://drive.google.com/uc?export=view&id=${image.id}" alt="Gallery image">
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading gallery:', error);
        document.getElementById('galleryContainer').innerHTML = '<p class="no-images">Error memuat galeri.</p>';
    }
}

// Membuka modal gambar
function openModal(imageSrc) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    
    modal.style.display = 'block';
    modalImg.src = imageSrc;
}

// Menutup modal gambar
function closeModal() {
    document.getElementById('imageModal').style.display = 'none';
}

// Toggle menu mobile
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const hamburger = document.querySelector('.hamburger');
    
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
}

// CSS untuk animasi shake (ditambahkan via JavaScript)
const shakeAnimation = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}
`;

// Tambahkan animasi shake ke stylesheet
const styleSheet = document.createElement('style');
styleSheet.textContent = shakeAnimation;
document.head.appendChild(styleSheet);
