// Variabel global
let posts = JSON.parse(localStorage.getItem('secretPosts')) || [];
let images = JSON.parse(localStorage.getItem('secretImages')) || [];
const PASSWORD = "rahasia123"; // Ganti dengan kata kunci yang diinginkan

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
function checkPassword() {
    const passwordInput = document.getElementById('passwordInput').value;
    const errorMessage = document.getElementById('errorMessage');
    
    if (passwordInput === PASSWORD) {
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
}

// Memberikan akses ke konten utama
function grantAccess() {
    document.getElementById('accessOverlay').classList.add('hidden');
    document.getElementById('mainContent').classList.remove('hidden');
    loadPosts();
    loadGallery();
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
function createPost() {
    const postText = document.getElementById('postText').value.trim();
    const imageInput = document.getElementById('imageUpload');
    
    if (!postText && !imageInput.files[0]) {
        alert('Masukkan teks atau unggah gambar!');
        return;
    }
    
    const newPost = {
        id: Date.now(),
        text: postText,
        date: new Date().toLocaleString('id-ID'),
        image: null
    };
    
    // Jika ada gambar yang diunggah
    if (imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            newPost.image = e.target.result;
            
            // Simpan gambar ke galeri jika ada
            if (newPost.image) {
                images.push({
                    id: Date.now(),
                    src: newPost.image,
                    date: new Date().toLocaleString('id-ID')
                });
                localStorage.setItem('secretImages', JSON.stringify(images));
            }
            
            // Simpan postingan
            posts.unshift(newPost);
            localStorage.setItem('secretPosts', JSON.stringify(posts));
            
            // Reset form dan muat ulang konten
            document.getElementById('postText').value = '';
            document.getElementById('imageUpload').value = '';
            loadPosts();
            loadGallery();
            switchTab('posts');
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        // Simpan postingan tanpa gambar
        posts.unshift(newPost);
        localStorage.setItem('secretPosts', JSON.stringify(posts));
        
        // Reset form dan muat ulang konten
        document.getElementById('postText').value = '';
        loadPosts();
        switchTab('posts');
    }
}

// Memuat postingan
function loadPosts() {
    const postsContainer = document.getElementById('postsContainer');
    
    if (posts.length === 0) {
        postsContainer.innerHTML = '<p class="no-posts">Belum ada postingan. Mulai dengan mengunggah sesuatu!</p>';
        return;
    }
    
    postsContainer.innerHTML = posts.map(post => `
        <div class="post" data-id="${post.id}">
            ${post.text ? `<div class="post-text">${post.text}</div>` : ''}
            ${post.image ? `<img src="${post.image}" alt="Post image" class="post-image" onclick="openModal('${post.image}')">` : ''}
            <div class="post-date">${post.date}</div>
        </div>
    `).join('');
}

// Memuat galeri
function loadGallery() {
    const galleryContainer = document.getElementById('galleryContainer');
    
    if (images.length === 0) {
        galleryContainer.innerHTML = '<p class="no-images">Belum ada gambar di galeri.</p>';
        return;
    }
    
    galleryContainer.innerHTML = images.map(image => `
        <div class="gallery-item" onclick="openModal('${image.src}')">
            <img src="${image.src}" alt="Gallery image">
        </div>
    `).join('');
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
