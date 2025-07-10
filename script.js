// ===== GAME STATE =====
const gameState = {
  score: 0,
  isGameOver: false,
  speed: 2,
  obstacles: [],
  lastObstacleTime: 0
};

// ===== DOM ELEMENTS =====
const character = document.getElementById('character');
const gameContainer = document.querySelector('.game-container');
const scoreEl = document.getElementById('score');
const jumpBtn = document.getElementById('jump-btn');

// ===== CHARACTER CONTROLS =====
let isJumping = false;

function jump() {
  if (isJumping) return;
  
  isJumping = true;
  character.classList.add('jump');
  
  setTimeout(() => {
    character.classList.remove('jump');
    isJumping = false;
  }, 500);
}

jumpBtn.addEventListener('click', jump);

// ===== OBSTACLE GENERATION =====
function createObstacle() {
  if (gameState.isGameOver) return;
  
  const obstacle = document.createElement('div');
  obstacle.className = 'obstacle';
  obstacle.style.right = '0px';
  gameContainer.appendChild(obstacle);
  
  gameState.obstacles.push({
    element: obstacle,
    x: window.innerWidth,
    width: 40,
    height: 40
  });
}

// ===== GAME LOOP =====
function gameLoop(timestamp) {
  if (gameState.isGameOver) return;
  
  // Spawn obstacles every 2 seconds
  if (timestamp - gameState.lastObstacleTime > 2000) {
    createObstacle();
    gameState.lastObstacleTime = timestamp;
  }
  
  // Move obstacles
  gameState.obstacles.forEach((obs, index) => {
    obs.x -= gameState.speed;
    obs.element.style.right = `${obs.x}px`;
    
    // Remove off-screen obstacles
    if (obs.x < -obs.width) {
      obs.element.remove();
      gameState.obstacles.splice(index, 1);
    }
    
    // Collision detection
    if (
      !isJumping &&
      obs.x < 100 + 40 && // Character's left position + width
      obs.x + obs.width > 100 && // Character's left position
      20 + 80 > window.innerHeight - 20 - obs.height // Character's bottom vs obstacle top
    ) {
      endGame();
    }
  });
  
  // Increase difficulty
  gameState.speed += 0.001;
  
  requestAnimationFrame(gameLoop);
}

// ===== GAME CONTROLS =====
function startGame() {
  gameState.score = 0;
  gameState.isGameOver = false;
  scoreEl.textContent = '0';
  requestAnimationFrame(gameLoop);
}

function endGame() {
  gameState.isGameOver = true;
  alert(`Game Over! Score: ${gameState.score}`);
}

// ===== INITIALIZE =====
startGame();
