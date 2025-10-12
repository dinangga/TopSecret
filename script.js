// script.js
// Main application script for NexusVault

// Application state
const AppState = {
    isAuthenticated: false,
    currentUser: null,
    notes: [],
    files: [],
    currentNote: null,
    encryptionKey: null
};

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const passwordInput = document.getElementById('password');
const logoutBtn = document.getElementById('logoutBtn');
const navBtns = document.querySelectorAll('.nav-btn');
const contentSections = document.querySelectorAll('.content-section');
const notesCount = document.getElementById('notes-count');
const filesCount = document.getElementById('files-count');
const activityList = document.getElementById('activity-list');
const notesList = document.getElementById('notesList');
const noteEditor = document.getElementById('noteEditor');
const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');
const saveNoteBtn = document.getElementById('saveNoteBtn');
const deleteNoteBtn = document.getElementById('deleteNoteBtn');
const newNoteBtn = document.getElementById('newNoteBtn');
const filesGrid = document.getElementById('filesGrid');
const fileUpload = document.getElementById('fileUpload');
const loadingOverlay = document.getElementById('loadingOverlay');

// Initialize the application
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    // Check if user is already authenticated
    checkAuthentication();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize UI components
    initializeUI();
}

// Check if user has a valid authentication token
function checkAuthentication() {
    const authToken = localStorage.getItem('nexusVaultAuth');
    const tokenExpiry = localStorage.getItem('nexusVaultExpiry');
    
    if (authToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
        // User is authenticated
        AppState.isAuthenticated = true;
        AppState.encryptionKey = authToken;
        showDashboard();
        loadUserData();
    } else {
        // Clear expired tokens
        localStorage.removeItem('nexusVaultAuth');
        localStorage.removeItem('nexusVaultExpiry');
        showLoginScreen();
    }
}

// Set up all event listeners
function setupEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    
    // Logout button
    logoutBtn.addEventListener('click', handleLogout);
    
    // Navigation buttons
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => switchSection(btn.dataset.section));
    });
    
    // Note actions
    saveNoteBtn.addEventListener('click', saveNote);
    deleteNoteBtn.addEventListener('click', deleteNote);
    newNoteBtn.addEventListener('click', createNewNote);
    
    // File upload
    fileUpload.addEventListener('change', handleFileUpload);
}

// Initialize UI components
function initializeUI() {
    // Initialize empty note editor
    resetNoteEditor();
}

// Show login screen
function showLoginScreen() {
    loginScreen.classList.add('active');
    dashboard.classList.remove('active');
}

// Show dashboard
function showDashboard() {
    loginScreen.classList.remove('active');
    dashboard.classList.add('active');
}

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    
    const password = passwordInput.value.trim();
    
    if (!password) {
        showNotification('Please enter an access code', 'warning');
        return;
    }
    
    // Show loading state
    showLoading(true);
    
    // Simulate authentication process
    setTimeout(() => {
        // In a real app, this would validate against a server or stored hash
        // For demo purposes, we'll accept any non-empty password
        if (password.length >= 4) {
            // Generate encryption key from password
            const encryptionKey = generateEncryptionKey(password);
            
            // Store authentication token (encrypted)
            const authToken = btoa(encryptionKey); // Simple encoding for demo
            const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
            
            localStorage.setItem('nexusVaultAuth', authToken);
            localStorage.setItem('nexusVaultExpiry', expiryTime.toString());
            
            AppState.isAuthenticated = true;
            AppState.encryptionKey = encryptionKey;
            
            showDashboard();
            loadUserData();
            
            showNotification('Access granted. Welcome to your secure vault.', 'success');
        } else {
            showNotification('Access code must be at least 4 characters', 'error');
        }
        
        showLoading(false);
    }, 1500);
}

// Handle logout
function handleLogout() {
    // Clear authentication data
    localStorage.removeItem('nexusVaultAuth');
    localStorage.removeItem('nexusVaultExpiry');
    
    AppState.isAuthenticated = false;
    AppState.encryptionKey = null;
    AppState.notes = [];
    AppState.files = [];
    
    // Reset UI
    resetNoteEditor();
    updateDashboardStats();
    updateActivityList();
    
    showLoginScreen();
    showNotification('You have been logged out securely', 'info');
}

// Switch between sections
function switchSection(sectionId) {
    // Update navigation buttons
    navBtns.forEach(btn => {
        if (btn.dataset.section === sectionId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Show selected section
    contentSections.forEach(section => {
        if (section.id === `${sectionId}-section`) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });
    
    // Load section-specific data
    if (sectionId === 'notes') {
        loadNotes();
    } else if (sectionId === 'files') {
        loadFiles();
    }
}

// Generate encryption key from password
function generateEncryptionKey(password) {
    // In a real implementation, this would use a proper key derivation function
    // For demo purposes, we're using a simplified approach
    let key = '';
    for (let i = 0; i < password.length; i++) {
        key += String.fromCharCode(password.charCodeAt(i) * 2 % 256);
    }
    
    // Pad or truncate to 32 bytes for AES-256
    while (key.length < 32) {
        key += password;
    }
    
    return key.substring(0, 32);
}

// Simple encryption function (demo purposes)
function encryptData(data, key) {
    // In a real implementation, this would use Web Crypto API or a library like CryptoJS
    // This is a simple XOR cipher for demonstration only
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
        encrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(encrypted);
}

// Simple decryption function (demo purposes)
function decryptData(encryptedData, key) {
    // In a real implementation, this would use Web Crypto API or a library like CryptoJS
    // This is a simple XOR cipher for demonstration only
    const data = atob(encryptedData);
    let decrypted = '';
    for (let i = 0; i < data.length; i++) {
        decrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return decrypted;
}

// Load user data from localStorage
function loadUserData() {
    // Load notes
    const storedNotes = localStorage.getItem('nexusVaultNotes');
    if (storedNotes) {
        try {
            const encryptedNotes = JSON.parse(storedNotes);
            AppState.notes = encryptedNotes.map(note => ({
                id: note.id,
                title: decryptData(note.title, AppState.encryptionKey),
                content: decryptData(note.content, AppState.encryptionKey),
                createdAt: note.createdAt,
                updatedAt: note.updatedAt
            }));
        } catch (error) {
            console.error('Error loading notes:', error);
            AppState.notes = [];
        }
    }
    
    // Load files metadata
    const storedFiles = localStorage.getItem('nexusVaultFiles');
    if (storedFiles) {
        try {
            AppState.files = JSON.parse(storedFiles);
        } catch (error) {
            console.error('Error loading files:', error);
            AppState.files = [];
        }
    }
    
    // Update UI
    updateDashboardStats();
    updateActivityList();
}

// Update dashboard statistics
function updateDashboardStats() {
    notesCount.textContent = AppState.notes.length;
    filesCount.textContent = AppState.files.length;
}

// Update activity list
function updateActivityList() {
    activityList.innerHTML = '';
    
    // Combine notes and files activities
    const activities = [];
    
    // Add note activities
    AppState.notes.forEach(note => {
        activities.push({
            type: 'note',
            action: note.updatedAt > note.createdAt ? 'updated' : 'created',
            title: note.title,
            time: new Date(note.updatedAt)
        });
    });
    
    // Add file activities
    AppState.files.forEach(file => {
        activities.push({
            type: 'file',
            action: 'uploaded',
            title: file.name,
            time: new Date(file.uploadedAt)
        });
    });
    
    // Sort by time (newest first)
    activities.sort((a, b) => b.time - a.time);
    
    // Display up to 5 recent activities
    const recentActivities = activities.slice(0, 5);
    
    if (recentActivities.length === 0) {
        activityList.innerHTML = '<div class="activity-item"><div class="activity-details"><p>No recent activity</p></div></div>';
        return;
    }
    
    recentActivities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        const icon = activity.type === 'note' ? '📝' : '📁';
        const actionText = activity.type === 'note' 
            ? (activity.action === 'created' ? 'Created note' : 'Updated note')
            : 'Uploaded file';
        
        activityItem.innerHTML = `
            <div class="activity-icon">${icon}</div>
            <div class="activity-details">
                <p>${actionText}: ${activity.title}</p>
                <div class="activity-time">${formatTime(activity.time)}</div>
            </div>
        `;
        
        activityList.appendChild(activityItem);
    });
}

// Format time for display
function formatTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
}

// Load and display notes
function loadNotes() {
    notesList.innerHTML = '';
    
    if (AppState.notes.length === 0) {
        notesList.innerHTML = '<div class="note-item"><div class="note-preview">No notes yet. Create your first note!</div></div>';
        return;
    }
    
    AppState.notes.forEach(note => {
        const noteItem = document.createElement('div');
        noteItem.className = 'note-item';
        if (AppState.currentNote && AppState.currentNote.id === note.id) {
            noteItem.classList.add('active');
        }
        
        noteItem.innerHTML = `
            <div class="note-title">${note.title || 'Untitled Note'}</div>
            <div class="note-preview">${note.content.substring(0, 50)}${note.content.length > 50 ? '...' : ''}</div>
        `;
        
        noteItem.addEventListener('click', () => openNote(note));
        notesList.appendChild(noteItem);
    });
}

// Open a note in the editor
function openNote(note) {
    AppState.currentNote = note;
    
    // Update active state in notes list
    document.querySelectorAll('.note-item').forEach(item => {
        item.classList.remove('active');
    });
    
    event.target.closest('.note-item').classList.add('active');
    
    // Populate editor
    noteTitle.value = note.title;
    noteContent.value = note.content;
    
    // Show editor if it was hidden
    noteEditor.style.display = 'flex';
}

// Create a new note
function createNewNote() {
    const newNote = {
        id: generateId(),
        title: '',
        content: '',
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    
    AppState.notes.unshift(newNote);
    AppState.currentNote = newNote;
    
    // Update UI
    loadNotes();
    resetNoteEditor();
    
    // Focus on title input
    setTimeout(() => {
        noteTitle.focus();
    }, 100);
}

// Reset note editor to empty state
function resetNoteEditor() {
    noteTitle.value = '';
    noteContent.value = '';
    AppState.currentNote = null;
    
    // Update active state in notes list
    document.querySelectorAll('.note-item').forEach(item => {
        item.classList.remove('active');
    });
}

// Save current note
function saveNote() {
    if (!AppState.currentNote) {
        showNotification('No note selected', 'warning');
        return;
    }
    
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();
    
    if (!title && !content) {
        showNotification('Note cannot be empty', 'warning');
        return;
    }
    
    // Update note
    AppState.currentNote.title = title;
    AppState.currentNote.content = content;
    AppState.currentNote.updatedAt = Date.now();
    
    // Encrypt and save to localStorage
    saveNotesToStorage();
    
    // Update UI
    loadNotes();
    updateDashboardStats();
    updateActivityList();
    
    showNotification('Note saved securely', 'success');
}

// Delete current note
function deleteNote() {
    if (!AppState.currentNote) {
        showNotification('No note selected', 'warning');
        return;
    }
    
    if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
        // Remove note from array
        AppState.notes = AppState.notes.filter(note => note.id !== AppState.currentNote.id);
        
        // Save to storage
        saveNotesToStorage();
        
        // Update UI
        resetNoteEditor();
        loadNotes();
        updateDashboardStats();
        updateActivityList();
        
        showNotification('Note deleted', 'info');
    }
}

// Save notes to localStorage with encryption
function saveNotesToStorage() {
    const encryptedNotes = AppState.notes.map(note => ({
        id: note.id,
        title: encryptData(note.title, AppState.encryptionKey),
        content: encryptData(note.content, AppState.encryptionKey),
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
    }));
    
    localStorage.setItem('nexusVaultNotes', JSON.stringify(encryptedNotes));
}

// Load and display files
function loadFiles() {
    filesGrid.innerHTML = '';
    
    if (AppState.files.length === 0) {
        filesGrid.innerHTML = '<div class="file-card"><div class="file-name">No files yet</div><div class="file-size">Upload your first file</div></div>';
        return;
    }
    
    AppState.files.forEach(file => {
        const fileCard = document.createElement('div');
        fileCard.className = 'file-card';
        
        // Determine file type icon
        let fileIcon = '📄';
        if (file.type.includes('image')) fileIcon = '🖼️';
        else if (file.type.includes('pdf')) fileIcon = '📕';
        else if (file.type.includes('zip') || file.type.includes('archive')) fileIcon = '📦';
        
        fileCard.innerHTML = `
            <div class="file-icon">${fileIcon}</div>
            <div class="file-name">${file.name}</div>
            <div class="file-size">${formatFileSize(file.size)}</div>
        `;
        
        fileCard.addEventListener('click', () => downloadFile(file));
        filesGrid.appendChild(fileCard);
    });
}

// Handle file upload
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (limit to 10MB for demo)
    if (file.size > 10 * 1024 * 1024) {
        showNotification('File size exceeds 10MB limit', 'error');
        return;
    }
    
    showLoading(true);
    
    // Simulate file processing and encryption
    setTimeout(() => {
        const fileData = {
            id: generateId(),
            name: file.name,
            type: file.type,
            size: file.size,
            uploadedAt: Date.now()
        };
        
        // In a real implementation, we would encrypt and upload the file
        // For demo, we're just storing metadata
        AppState.files.unshift(fileData);
        localStorage.setItem('nexusVaultFiles', JSON.stringify(AppState.files));
        
        // Update UI
        loadFiles();
        updateDashboardStats();
        updateActivityList();
        
        showLoading(false);
        showNotification('File uploaded securely', 'success');
        
        // Reset file input
        e.target.value = '';
    }, 1500);
}

// Download file (demo - in real implementation would decrypt and download)
function downloadFile(file) {
    showNotification(`Downloading ${file.name}...`, 'info');
    // In a real implementation, this would decrypt and trigger download
}

// Format file size for display
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Show/hide loading overlay
function showLoading(show) {
    if (show) {
        loadingOverlay.classList.add('active');
    } else {
        loadingOverlay.classList.remove('active');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">${message}</div>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #222;
                border: 1px solid rgba(0, 238, 255, 0.3);
                border-radius: 8px;
                padding: 1rem;
                color: white;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
                z-index: 1000;
                display: flex;
                align-items: center;
                gap: 1rem;
                max-width: 400px;
                animation: slideIn 0.3s ease;
            }
            
            .notification-success {
                border-color: rgba(0, 255, 0, 0.3);
            }
            
            .notification-warning {
                border-color: rgba(255, 255, 0, 0.3);
            }
            
            .notification-error {
                border-color: rgba(255, 0, 0, 0.3);
            }
            
            .notification-content {
                flex: 1;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
    
    // Close button handler
    notification.querySelector('.notification-close').addEventListener('click', () => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    });
}

// Add slideOut animation if not already defined
if (!document.querySelector('#notification-animations')) {
    const animations = document.createElement('style');
    animations.id = 'notification-animations';
    animations.textContent = `
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(animations);
}
