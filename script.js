// Simple Portfolio App
class SimplePortfolio {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.notes = JSON.parse(localStorage.getItem('notes')) || [];
        this.skills = [
            'Full-Stack Developer',
            'Web Designer',
            'Problem Solver',
            'Tech Enthusiast'
        ];
        this.currentSkill = 0;
        this.init();
    }

    init() {
        this.setupTheme();
        this.setupTypewriter();
        this.loadProjects();
        this.loadNotes();
        this.setupEventListeners();
    }

    // Theme Management
    setupTheme() {
        document.body.setAttribute('data-theme', this.currentTheme);
        this.updateThemeButton();
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        this.updateThemeButton();
    }

    updateThemeButton() {
        const button = document.getElementById('theme-toggle');
        button.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
    }

    // Typewriter Effect
    setupTypewriter() {
        this.typeSkill(0);
    }

    typeSkill(index) {
        const textElement = document.getElementById('type-text');
        const skill = this.skills[index];
        let i = 0;
        
        textElement.textContent = '';
        
        const typeInterval = setInterval(() => {
            if (i < skill.length) {
                textElement.textContent += skill.charAt(i);
                i++;
            } else {
                clearInterval(typeInterval);
                setTimeout(() => this.deleteSkill(index), 2000);
            }
        }, 100);
    }

    deleteSkill(index) {
        const textElement = document.getElementById('type-text');
        const skill = this.skills[index];
        let i = skill.length;
        
        const deleteInterval = setInterval(() => {
            if (i > 0) {
                textElement.textContent = skill.substring(0, i - 1);
                i--;
            } else {
                clearInterval(deleteInterval);
                this.currentSkill = (index + 1) % this.skills.length;
                setTimeout(() => this.typeSkill(this.currentSkill), 500);
            }
        }, 50);
    }

    // Projects Management
    loadProjects() {
        const projects = [
            {
                title: "E-Commerce Website",
                description: "A full-stack e-commerce platform with React and Node.js",
                tags: ["React", "Node.js", "MongoDB"]
            },
            {
                title: "Weather App",
                description: "Real-time weather application with beautiful UI",
                tags: ["JavaScript", "API", "CSS"]
            },
            {
                title: "Task Manager",
                description: "Productivity app with drag-and-drop functionality",
                tags: ["Vue.js", "Firebase", "PWA"]
            }
        ];

        const grid = document.getElementById('projects-grid');
        grid.innerHTML = projects.map(project => `
            <div class="project-card">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <div class="project-tags">
                    ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        `).join('');
    }

    // Notes Management
    loadNotes() {
        const notesList = document.getElementById('notes-list');
        if (this.notes.length === 0) {
            notesList.innerHTML = '<p>No notes yet. Write your first note above!</p>';
            return;
        }

        notesList.innerHTML = this.notes.map((note, index) => `
            <div class="note-item">
                <p>${note}</p>
                <button onclick="portfolio.deleteNote(${index})" class="delete-btn">Delete</button>
            </div>
        `).join('');
    }

    saveNote() {
        const input = document.getElementById('note-input');
        const text = input.value.trim();
        
        if (text) {
            this.notes.push(text);
            localStorage.setItem('notes', JSON.stringify(this.notes));
            input.value = '';
            this.loadNotes();
        }
    }

    deleteNote(index) {
        this.notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(this.notes));
        this.loadNotes();
    }

    // Event Listeners
    setupEventListeners() {
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });
    }
}

// CV Download Function
function downloadCV() {
    const cvContent = `
        Alex Developer
        Full-Stack Developer
        
        Experience:
        - Senior Developer at Tech Corp (2020-Present)
        - Frontend Developer at Web Solutions (2018-2020)
        
        Skills: JavaScript, React, Node.js, CSS, HTML
        Education: BS Computer Science
    `;
    
    const blob = new Blob([cvContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'alex-developer-cv.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Global functions for HTML onclick
function saveNote() {
    portfolio.saveNote();
}

// Initialize app when page loads
let portfolio;
document.addEventListener('DOMContentLoaded', () => {
    portfolio = new SimplePortfolio();
});
