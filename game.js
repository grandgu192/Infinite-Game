// Game constants
const GRAVITY = 0.5;
const JUMP_FORCE = 15;
const PLAYER_SPEED = 5;
const PLATFORM_GENERATION_DISTANCE = 20;
const PLATFORM_CLEANUP_DISTANCE = 30;

// Game state
let gameState = 'title'; // title, shop, playing, paused, gameOver
let score = 0;
let coins = 0;
let totalCoins = 0;

// Player state
let player = {
  x: 0,
  y: 0,
  width: 40,
  height: 60,
  velocityX: 0,
  velocityY: 0,
  isJumping: false,
  isGrounded: false,
  direction: 0, // -1: left, 0: none, 1: right
  jumpForce: JUMP_FORCE,
  speed: PLAYER_SPEED,
  color: '#4287f5'
};

// Camera position
let camera = {
  x: 0,
  y: 0
};

// Game elements
let platforms = [];
let gameCoins = [];
let obstacles = [];
let shopItems = [];

// Game cheats
let cheats = {
  scoreMultiplier: 1,
  coinMultiplier: 1,
  unlockAll: false,
  speedMultiplier: 1,
  noGravity: false
};

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let canvasWidth, canvasHeight;

// Audio elements
let bgMusic = new Audio();
let hitSound = new Audio();
let successSound = new Audio();
let isMuted = false;

// Key states
const keys = {
  left: false,
  right: false,
  jump: false
};

// Platform generation
let lastPlatformEnd = 0;
let platformCounter = 0;
let coinCounter = 0;
let obstacleCounter = 0;

// Animation frame ID
let animationId;

// Timing for score updates
let lastScoreTime = 0;
const SCORE_INTERVAL = 1000; // ms

// Shop state
let selectedCategory = 'all';
let selectedItem = null;

// Initialize the game
function init() {
  // Set canvas dimensions
  resizeCanvas();
  
  // Set up event listeners
  setupEventListeners();
  
  // Initialize shop items
  initializeShopItems();
  
  // Set up initial game state
  resetGame();
  
  // Show title screen
  showScreen('title');
  
  // Load audio
  loadAudio();
  
  // Start game loop
  gameLoop();
}

// Resize canvas to fit window
function resizeCanvas() {
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
}

// Set up event listeners
function setupEventListeners() {
  // Keyboard controls
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  
  // Window resize
  window.addEventListener('resize', resizeCanvas);
  
  // Button click handlers for title screen
  document.getElementById('startButton').addEventListener('click', () => {
    startGame();
  });
  
  document.getElementById('shopButton').addEventListener('click', () => {
    showScreen('shop');
    updateShopUI();
  });
  
  document.getElementById('muteButton').addEventListener('click', toggleMute);
  
  // Button click handlers for pause screen
  document.getElementById('resumeButton').addEventListener('click', () => {
    resumeGame();
  });
  
  document.getElementById('restartButton').addEventListener('click', () => {
    resetGame();
    startGame();
  });
  
  document.getElementById('pauseToTitleButton').addEventListener('click', () => {
    showScreen('title');
  });
  
  // Button click handlers for game over screen
  document.getElementById('playAgainButton').addEventListener('click', () => {
    resetGame();
    startGame();
  });
  
  document.getElementById('gameOverShopButton').addEventListener('click', () => {
    showScreen('shop');
    updateShopUI();
  });
  
  document.getElementById('gameOverToTitleButton').addEventListener('click', () => {
    showScreen('title');
  });
  
  // Button click handlers for shop
  document.getElementById('shopBackButton').addEventListener('click', () => {
    showScreen('title');
  });
  
  // Button click handlers for dev menu
  document.getElementById('closeDevMenu').addEventListener('click', toggleDevMenu);
  document.getElementById('toggleScoreMultiplier').addEventListener('click', toggleScoreMultiplier);
  document.getElementById('toggleCoinMultiplier').addEventListener('click', toggleCoinMultiplier);
  document.getElementById('toggleUnlockAll').addEventListener('click', toggleUnlockAll);
  document.getElementById('toggleSpeedMultiplier').addEventListener('click', toggleSpeedMultiplier);
  document.getElementById('toggleNoGravity').addEventListener('click', toggleNoGravity);
  
  // Category buttons in shop
  const categoryButtons = document.querySelectorAll('.category-button');
  categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      selectedCategory = button.dataset.category;
      
      // Update active class
      categoryButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      updateShopItems();
    });
  });
}

// Handle key down events
function handleKeyDown(e) {
  switch (e.code) {
    case 'ArrowLeft':
    case 'KeyA':
      keys.left = true;
      break;
    case 'ArrowRight':
    case 'KeyD':
      keys.right = true;
      break;
    case 'Space':
      keys.jump = true;
      break;
    case 'Escape':
      if (gameState === 'playing') {
        pauseGame();
      } else if (gameState === 'paused') {
        resumeGame();
      }
      break;
    case 'KeyO':
      if (e.altKey && (gameState === 'playing' || gameState === 'paused')) {
        toggleDevMenu();
      }
      break;
  }
}

// Handle key up events
function handleKeyUp(e) {
  switch (e.code) {
    case 'ArrowLeft':
    case 'KeyA':
      keys.left = false;
      break;
    case 'ArrowRight':
    case 'KeyD':
      keys.right = false;
      break;
    case 'Space':
      keys.jump = false;
      break;
  }
}

// Initialize shop items
function initializeShopItems() {
  shopItems = [
    {
      id: 'character_blue',
      name: 'Blue Runner',
      description: 'The standard character with balanced abilities.',
      cost: 0,
      owned: true,
      equipped: true,
      type: 'character',
      icon: 'user',
      color: '#4287f5'
    },
    {
      id: 'character_red',
      name: 'Red Speedster',
      description: 'A faster character with reduced jump height.',
      cost: 500,
      owned: false,
      equipped: false,
      type: 'character',
      icon: 'zap',
      color: '#e53e3e',
      effect: { speed: 1.2, jumpForce: 0.9 }
    },
    {
      id: 'character_green',
      name: 'Green Bouncer',
      description: 'A character with enhanced jump abilities.',
      cost: 500,
      owned: false,
      equipped: false,
      type: 'character',
      icon: 'trending-up',
      color: '#38a169',
      effect: { jumpForce: 1.3 }
    },
    {
      id: 'ability_doubleJump',
      name: 'Double Jump',
      description: 'Allows you to jump once more while in the air.',
      cost: 1000,
      owned: false,
      equipped: false,
      type: 'ability',
      icon: 'chevrons-up'
    },
    {
      id: 'ability_coinMagnet',
      name: 'Coin Magnet',
      description: 'Attracts nearby coins to your character.',
      cost: 800,
      owned: false,
      equipped: false,
      type: 'ability',
      icon: 'magnet'
    },
    {
      id: 'booster_scoreMultiplier',
      name: 'Score Multiplier',
      description: 'Multiplies your score gain by 1.5x.',
      cost: 1200,
      owned: false,
      equipped: false,
      type: 'booster',
      icon: 'plus-circle'
    },
    {
      id: 'booster_coinMultiplier',
      name: 'Coin Multiplier',
      description: 'Multiplies your coin gain by 1.5x.',
      cost: 1200,
      owned: false,
      equipped: false,
      type: 'booster',
      icon: 'dollar-sign'
    },
    {
      id: 'cosmetic_trail',
      name: 'Motion Trail',
      description: 'Adds a colorful trail behind your character.',
      cost: 300,
      owned: false,
      equipped: false,
      type: 'cosmetic',
      icon: 'git-branch'
    },
    {
      id: 'cosmetic_glow',
      name: 'Character Glow',
      description: 'Makes your character glow with a bright aura.',
      cost: 300,
      owned: false,
      equipped: false,
      type: 'cosmetic',
      icon: 'sun'
    }
  ];
}

// Update shop UI
function updateShopUI() {
  document.getElementById('shopCoins').textContent = coins.toString();
  updateShopItems();
}

// Update shop items display
function updateShopItems() {
  const shopItemsContainer = document.getElementById('shopItems');
  shopItemsContainer.innerHTML = '';
  
  // Filter items based on selected category
  const filteredItems = selectedCategory === 'all' 
    ? shopItems 
    : shopItems.filter(item => item.type === selectedCategory);
  
  // Create HTML for each item
  filteredItems.forEach(item => {
    // Create item card
    const itemCard = document.createElement('div');
    itemCard.className = `shop-item ${item.owned ? 'owned' : ''} ${item.equipped ? 'equipped' : ''}`;
    itemCard.dataset.id = item.id;
    
    // Create item content
    itemCard.innerHTML = `
      <div class="item-icon" style="background-color: ${item.color || '#4287f5'}">
        <svg class="icon" style="fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;" viewBox="0 0 24 24" width="24" height="24">
          ${getIconPath(item.icon)}
        </svg>
      </div>
      <h3 class="item-name">${item.name}</h3>
      ${item.equipped ? '<span class="item-equipped">Equipped</span>' : ''}
      <p class="item-description">${item.description}</p>
      ${!item.owned 
        ? `<button class="buy-button ${coins < item.cost ? 'disabled' : ''}" data-id="${item.id}">
            <svg class="icon" style="fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;" viewBox="0 0 24 24" width="16" height="16">
              ${getIconPath('dollar-sign')}
            </svg>
            ${item.cost}
          </button>`
        : !item.equipped 
          ? `<button class="equip-button" data-id="${item.id}">Equip</button>`
          : ''
      }
    `;
    
    // Add event listener for clicking on item
    itemCard.addEventListener('click', () => {
      selectItem(item);
    });
    
    // Add event listeners for buy/equip buttons
    const buyButton = itemCard.querySelector('.buy-button');
    if (buyButton) {
      buyButton.addEventListener('click', (e) => {
        e.stopPropagation();
        buyItem(item.id);
      });
    }
    
    const equipButton = itemCard.querySelector('.equip-button');
    if (equipButton) {
      equipButton.addEventListener('click', (e) => {
        e.stopPropagation();
        equipItem(item.id);
      });
    }
    
    // Add to container
    shopItemsContainer.appendChild(itemCard);
  });
  
  // Show item details if one is selected
  if (selectedItem) {
    showItemDetails(selectedItem);
  } else if (filteredItems.length > 0) {
    selectItem(filteredItems[0]);
  }
}

// Select an item to view details
function selectItem(item) {
  selectedItem = item;
  showItemDetails(item);
  
  // Highlight selected item
  const items = document.querySelectorAll('.shop-item');
  items.forEach(element => {
    element.classList.remove('selected');
    if (element.dataset.id === item.id) {
      element.classList.add('selected');
    }
  });
}

// Show item details in the sidebar
function showItemDetails(item) {
  const detailsContainer = document.getElementById('itemDetails');
  
  detailsContainer.innerHTML = `
    <h2>${item.name}</h2>
    
    <div class="item-icon-large" style="background-color: ${item.color || '#4287f5'}">
      <svg class="icon" style="fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;" viewBox="0 0 24 24" width="36" height="36">
        ${getIconPath(item.icon)}
      </svg>
    </div>
    
    <p class="item-description-full">${item.description}</p>
    
    <div class="item-info">
      <h3>Type</h3>
      <p class="capitalize">${item.type}</p>
    </div>
    
    <div class="item-info">
      <h3>Status</h3>
      <p>${item.owned 
        ? `<span class="status-owned">Owned</span>` 
        : `<span class="status-cost">Available for ${item.cost} coins</span>`}
      </p>
    </div>
    
    ${!item.owned 
      ? `<button id="detailBuyButton" class="button ${coins < item.cost ? 'disabled' : ''}">
          Buy for ${item.cost} coins
        </button>`
      : !item.equipped 
        ? `<button id="detailEquipButton" class="button">Equip</button>`
        : `<button class="button disabled">Currently Equipped</button>`
    }
  `;
  
  // Add event listeners for buttons
  const detailBuyButton = document.getElementById('detailBuyButton');
  if (detailBuyButton) {
    detailBuyButton.addEventListener('click', () => {
      buyItem(item.id);
    });
  }
  
  const detailEquipButton = document.getElementById('detailEquipButton');
  if (detailEquipButton) {
    detailEquipButton.addEventListener('click', () => {
      equipItem(item.id);
    });
  }
}

// Buy a shop item
function buyItem(itemId) {
  const item = shopItems.find(item => item.id === itemId);
  if (!item) return false;
  
  // Check if already owned
  if (item.owned) return false;
  
  // Check if enough coins
  if (coins < item.cost) return false;
  
  // Purchase item
  coins -= item.cost;
  item.owned = true;
  
  // Update UI
  updateCoinsDisplay();
  updateShopUI();
  
  // Play success sound
  playSound(successSound);
  
  return true;
}

// Equip a shop item
function equipItem(itemId) {
  const item = shopItems.find(item => item.id === itemId);
  if (!item || !item.owned) return false;
  
  // Unequip all other items of the same type
  shopItems.forEach(otherItem => {
    if (otherItem.type === item.type) {
      otherItem.equipped = false;
    }
  });
  
  // Equip this item
  item.equipped = true;
  
  // Apply effects if character
  if (item.type === 'character') {
    player.color = item.color || '#4287f5';
    
    // Reset stats first
    player.speed = PLAYER_SPEED;
    player.jumpForce = JUMP_FORCE;
    
    // Apply any effects
    if (item.effect) {
      if (item.effect.speed) player.speed *= item.effect.speed;
      if (item.effect.jumpForce) player.jumpForce *= item.effect.jumpForce;
    }
  }
  
  // Update UI
  updateShopUI();
  
  return true;
}

// Get equipped items
function getEquippedItems() {
  return shopItems.filter(item => item.equipped);
}

// Check if player has a specific ability
function hasAbility(abilityId) {
  const ability = shopItems.find(item => item.id === abilityId);
  return ability && ability.owned && ability.equipped;
}

// Start the game
function startGame() {
  gameState = 'playing';
  score = 0;
  
  // Reset player position
  player.x = 0;
  player.y = 0;
  player.velocityX = 0;
  player.velocityY = 0;
  player.isJumping = false;
  player.isGrounded = false;
  
  // Reset camera
  camera.x = 0;
  camera.y = 0;
  
  // Generate initial platforms
  generateInitialPlatforms();
  
  // Show game UI and hide other screens
  showScreen('playing');
  
  // Play background music if not muted
  if (!isMuted) {
    bgMusic.play().catch(err => {
      console.error("Error playing background music:", err);
    });
  }
  
  // Reset timing
  lastScoreTime = Date.now();
}

// Pause the game
function pauseGame() {
  gameState = 'paused';
  showScreen('paused');
  
  // Pause background music
  bgMusic.pause();
}

// Resume the game
function resumeGame() {
  gameState = 'playing';
  showScreen('playing');
  
  // Resume background music if not muted
  if (!isMuted) {
    bgMusic.play().catch(err => {
      console.error("Error playing background music:", err);
    });
  }
  
  // Reset last score time to avoid sudden score jump
  lastScoreTime = Date.now();
}

// End the game (game over)
function endGame() {
  gameState = 'gameOver';
  showScreen('gameOver');
  
  // Update final score and coins display
  document.getElementById('finalScore').textContent = score.toLocaleString();
  document.getElementById('finalCoins').textContent = coins.toString();
  
  // Pause background music
  bgMusic.pause();
}

// Reset the game
function resetGame() {
  // Reset score and coins (but keep total coins)
  score = 0;
  
  // Reset player position and state
  player.x = 0;
  player.y = 0;
  player.velocityX = 0;
  player.velocityY = 0;
  player.isJumping = false;
  player.isGrounded = false;
  player.direction = 0;
  
  // Reset camera
  camera.x = 0;
  camera.y = 0;
  
  // Clear platforms, coins, and obstacles
  platforms = [];
  gameCoins = [];
  obstacles = [];
  
  // Reset platform generation
  lastPlatformEnd = 0;
  platformCounter = 0;
  coinCounter = 0;
  obstacleCounter = 0;
  
  // Generate the initial ground platform
  platforms.push({
    id: platformCounter++,
    x: 0,
    y: 200,
    width: 500,
    height: 40,
    type: 'normal'
  });
  
  // Update UI
  updateScoreDisplay();
  updateCoinsDisplay();
}

// Show a specific screen
function showScreen(screen) {
  // Hide all screens first
  document.getElementById('titleScreen').classList.add('hidden');
  document.getElementById('shopScreen').classList.add('hidden');
  document.getElementById('pauseScreen').classList.add('hidden');
  document.getElementById('gameOverScreen').classList.add('hidden');
  document.getElementById('gameUI').classList.add('hidden');
  
  // Show the selected screen
  switch (screen) {
    case 'title':
      document.getElementById('titleScreen').classList.remove('hidden');
      gameState = 'title';
      break;
    case 'shop':
      document.getElementById('shopScreen').classList.remove('hidden');
      gameState = 'shop';
      break;
    case 'playing':
      document.getElementById('gameUI').classList.remove('hidden');
      gameState = 'playing';
      break;
    case 'paused':
      document.getElementById('pauseScreen').classList.remove('hidden');
      document.getElementById('gameUI').classList.remove('hidden');
      gameState = 'paused';
      break;
    case 'gameOver':
      document.getElementById('gameOverScreen').classList.remove('hidden');
      document.getElementById('gameUI').classList.remove('hidden');
      gameState = 'gameOver';
      break;
  }
}

// Toggle mute state
function toggleMute() {
  isMuted = !isMuted;
  
  // Update icon
  const volumeIcon = document.getElementById('volumeIcon');
  if (isMuted) {
    volumeIcon.innerHTML = `
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <line x1="23" y1="9" x2="17" y2="15"></line>
      <line x1="17" y1="9" x2="23" y2="15"></line>
    `;
    
    // Pause background music
    bgMusic.pause();
  } else {
    volumeIcon.innerHTML = `
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
    `;
    
    // Resume background music if playing
    if (gameState === 'playing') {
      bgMusic.play().catch(err => {
        console.error("Error playing background music:", err);
      });
    }
  }
}

// Toggle dev menu visibility
function toggleDevMenu() {
  const devMenu = document.getElementById('devMenu');
  devMenu.classList.toggle('hidden');
}

// Toggle score multiplier cheat
function toggleScoreMultiplier() {
  cheats.scoreMultiplier = cheats.scoreMultiplier === 1 ? 10 : 1;
  updateCheatUI('score');
}

// Toggle coin multiplier cheat
function toggleCoinMultiplier() {
  cheats.coinMultiplier = cheats.coinMultiplier === 1 ? 10 : 1;
  updateCheatUI('coin');
}

// Toggle unlock all cheat
function toggleUnlockAll() {
  cheats.unlockAll = !cheats.unlockAll;
  
  // Update shop items
  if (cheats.unlockAll) {
    shopItems.forEach(item => {
      item.owned = true;
    });
    
    // Update shop UI if on shop screen
    if (gameState === 'shop') {
      updateShopUI();
    }
  }
  
  updateCheatUI('unlock');
}

// Toggle speed multiplier cheat
function toggleSpeedMultiplier() {
  cheats.speedMultiplier = cheats.speedMultiplier === 1 ? 10 : 1;
  updateCheatUI('speed');
}

// Toggle no gravity cheat
function toggleNoGravity() {
  cheats.noGravity = !cheats.noGravity;
  updateCheatUI('gravity');
}

// Update the visual state of cheat buttons
function updateCheatUI(cheatType) {
  switch (cheatType) {
    case 'score':
      document.getElementById('scoreCheckbox').classList.toggle('hidden', cheats.scoreMultiplier === 1);
      document.getElementById('scoreSquare').classList.toggle('hidden', cheats.scoreMultiplier !== 1);
      document.getElementById('toggleScoreMultiplier').classList.toggle('active', cheats.scoreMultiplier !== 1);
      break;
    case 'coin':
      document.getElementById('coinCheckbox').classList.toggle('hidden', cheats.coinMultiplier === 1);
      document.getElementById('coinSquare').classList.toggle('hidden', cheats.coinMultiplier !== 1);
      document.getElementById('toggleCoinMultiplier').classList.toggle('active', cheats.coinMultiplier !== 1);
      break;
    case 'unlock':
      document.getElementById('unlockCheckbox').classList.toggle('hidden', !cheats.unlockAll);
      document.getElementById('unlockSquare').classList.toggle('hidden', cheats.unlockAll);
      document.getElementById('toggleUnlockAll').classList.toggle('active', cheats.unlockAll);
      break;
    case 'speed':
      document.getElementById('speedCheckbox').classList.toggle('hidden', cheats.speedMultiplier === 1);
      document.getElementById('speedSquare').classList.toggle('hidden', cheats.speedMultiplier !== 1);
      document.getElementById('toggleSpeedMultiplier').classList.toggle('active', cheats.speedMultiplier !== 1);
      break;
    case 'gravity':
      document.getElementById('gravityCheckbox').classList.toggle('hidden', !cheats.noGravity);
      document.getElementById('gravitySquare').classList.toggle('hidden', cheats.noGravity);
      document.getElementById('toggleNoGravity').classList.toggle('active', cheats.noGravity);
      break;
  }
}

// Game loop
function gameLoop() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  
  // Only update game logic if in playing state
  if (gameState === 'playing') {
    updateGameLogic();
  }
  
  // Always render the game
  renderGame();
  
  // Request the next frame
  animationId = requestAnimationFrame(gameLoop);
}

// Update game logic
function updateGameLogic() {
  // Update player direction based on key presses
  if (keys.left && !keys.right) {
    player.direction = -1;
  } else if (keys.right && !keys.left) {
    player.direction = 1;
  } else {
    player.direction = 0;
  }
  
  // Apply horizontal movement
  player.velocityX = player.direction * player.speed * cheats.speedMultiplier;
  
  // Apply jumping
  if (keys.jump && player.isGrounded) {
    player.velocityY = -player.jumpForce;
    player.isJumping = true;
    player.isGrounded = false;
    
    // Play jump sound
    playSound(hitSound);
  }
  
  // Apply double jump ability if equipped
  if (keys.jump && !player.isGrounded && hasAbility('ability_doubleJump') && !player.doubleJumped) {
    player.velocityY = -player.jumpForce * 0.8;
    player.doubleJumped = true;
    
    // Play jump sound
    playSound(hitSound);
  }
  
  // Apply gravity if not using the no gravity cheat
  if (!cheats.noGravity) {
    player.velocityY += GRAVITY;
  } else {
    // In no gravity mode, gradually reduce vertical velocity
    player.velocityY *= 0.9;
  }
  
  // Update player position
  player.x += player.velocityX;
  player.y += player.velocityY;
  
  // Reset grounded state for collision detection
  player.isGrounded = false;
  
  // Check platform collisions
  checkPlatformCollisions();
  
  // Check coin collisions
  checkCoinCollisions();
  
  // Check obstacle collisions
  checkObstacleCollisions();
  
  // Update camera position to follow player
  camera.x = player.x - canvasWidth / 3;
  
  // Generate more platforms as player moves
  if (player.x > lastPlatformEnd - PLATFORM_GENERATION_DISTANCE) {
    generateMorePlatforms();
  }
  
  // Clean up platforms that are far behind
  cleanupPlatforms();
  
  // Check if player fell off the screen
  if (player.y > canvasHeight + 100) {
    endGame();
  }
  
  // Add to score based on time survived
  const currentTime = Date.now();
  if (currentTime - lastScoreTime >= SCORE_INTERVAL) {
    addScore(10);
    lastScoreTime = currentTime;
  }
}

// Check collisions with platforms
function checkPlatformCollisions() {
  for (let i = 0; i < platforms.length; i++) {
    const platform = platforms[i];
    
    // Skip platforms that are far away
    if (Math.abs(platform.x - player.x) > platform.width + player.width) {
      continue;
    }
    
    // Skip platforms that are far below or above
    if (Math.abs(platform.y - player.y) > 200) {
      continue;
    }
    
    // Calculate platform boundaries
    const platformLeft = platform.x - platform.width / 2;
    const platformRight = platform.x + platform.width / 2;
    const platformTop = platform.y - platform.height / 2;
    const platformBottom = platform.y + platform.height / 2;
    
    // Calculate player boundaries
    const playerLeft = player.x - player.width / 2;
    const playerRight = player.x + player.width / 2;
    const playerTop = player.y - player.height / 2;
    const playerBottom = player.y + player.height / 2;
    
    // Check for collision
    if (
      playerRight > platformLeft &&
      playerLeft < platformRight &&
      playerBottom > platformTop &&
      playerTop < platformBottom
    ) {
      // Check if landing on top of platform
      if (
        playerBottom - player.velocityY <= platformTop &&
        player.velocityY >= 0
      ) {
        // Land on platform
        player.y = platformTop - player.height / 2;
        player.velocityY = 0;
        player.isGrounded = true;
        player.isJumping = false;
        player.doubleJumped = false;
        
        // For bouncy platforms, apply upward force
        if (platform.type === 'bouncy') {
          player.velocityY = -player.jumpForce * 1.3;
          player.isGrounded = false;
          player.isJumping = true;
          
          // Play bounce sound
          playSound(hitSound);
        }
        
        // For moving platforms, move the player with the platform
        if (platform.type === 'moving') {
          // Add platform's movement to player
          player.x += platform.movementDirection * platform.movementSpeed;
        }
      }
      // Check for side collision
      else if (
        playerRight > platformLeft &&
        playerLeft < platformRight
      ) {
        // If hitting from left
        if (playerRight - player.velocityX <= platformLeft) {
          player.x = platformLeft - player.width / 2;
          player.velocityX = 0;
        }
        // If hitting from right
        else if (playerLeft - player.velocityX >= platformRight) {
          player.x = platformRight + player.width / 2;
          player.velocityX = 0;
        }
      }
    }
    
    // Update moving platforms
    if (platform.type === 'moving') {
      // Update horizontal position
      platform.currentOffset += platform.movementDirection * platform.movementSpeed;
      
      // Reverse direction if reached movement limits
      if (Math.abs(platform.currentOffset) >= platform.movementRange) {
        platform.movementDirection *= -1;
        platform.currentOffset = Math.sign(platform.currentOffset) * platform.movementRange;
      }
      
      // Apply movement
      platform.x = platform.initialX + platform.currentOffset;
    }
  }
}

// Check collisions with coins
function checkCoinCollisions() {
  const coinMagnetRange = hasAbility('ability_coinMagnet') ? 150 : 0;
  
  for (let i = 0; i < gameCoins.length; i++) {
    const coin = gameCoins[i];
    
    // Skip coins that are far away
    if (Math.abs(coin.x - player.x) > 300) {
      continue;
    }
    
    // Skip collected coins
    if (coin.collected) {
      continue;
    }
    
    // Calculate distance to player
    const dx = player.x - coin.x;
    const dy = player.y - coin.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Coin magnet effect
    if (coinMagnetRange > 0 && distance < coinMagnetRange) {
      // Move coin towards player
      const attractionSpeed = 5 * (1 - distance / coinMagnetRange);
      const angle = Math.atan2(dy, dx);
      
      coin.x += Math.cos(angle) * attractionSpeed;
      coin.y += Math.sin(angle) * attractionSpeed;
    }
    
    // Check for collection (when player touches coin)
    if (distance < player.width / 2 + coin.radius) {
      // Mark as collected
      coin.collected = true;
      
      // Add coins and score
      addCoins(coin.value);
      addScore(coin.value * 50);
      
      // Play sound
      playSound(successSound);
    }
  }
  
  // Remove collected coins
  gameCoins = gameCoins.filter(coin => !coin.collected);
}

// Check collisions with obstacles
function checkObstacleCollisions() {
  for (let i = 0; i < obstacles.length; i++) {
    const obstacle = obstacles[i];
    
    // Skip obstacles that are far away
    if (Math.abs(obstacle.x - player.x) > 200) {
      continue;
    }
    
    // Calculate obstacle boundaries
    const obstacleLeft = obstacle.x - obstacle.width / 2;
    const obstacleRight = obstacle.x + obstacle.width / 2;
    const obstacleTop = obstacle.y - obstacle.height / 2;
    const obstacleBottom = obstacle.y + obstacle.height / 2;
    
    // Calculate player boundaries
    const playerLeft = player.x - player.width / 2;
    const playerRight = player.x + player.width / 2;
    const playerTop = player.y - player.height / 2;
    const playerBottom = player.y + player.height / 2;
    
    // Check for collision
    if (
      playerRight > obstacleLeft &&
      playerLeft < obstacleRight &&
      playerBottom > obstacleTop &&
      playerTop < obstacleBottom
    ) {
      // Collision detected!
      handleObstacleCollision(obstacle);
    }
  }
}

// Handle collision with an obstacle
function handleObstacleCollision(obstacle) {
  // Play hit sound
  playSound(hitSound);
  
  if (obstacle.type === 'spike') {
    // Spikes cause game over
    endGame();
  } else {
    // Barriers knock player back
    const knockbackForce = 8;
    
    // Apply knockback in opposite direction from barrier
    const dx = player.x - obstacle.x;
    const directionX = dx > 0 ? 1 : -1;
    
    // Update velocity with knockback
    player.velocityX = directionX * knockbackForce;
    player.velocityY = -5; // Add some upward force
  }
}

// Add to the score
function addScore(points) {
  // Apply score multiplier from equipped items
  let multiplier = cheats.scoreMultiplier;
  
  // Check for equipped booster
  if (hasAbility('booster_scoreMultiplier')) {
    multiplier *= 1.5;
  }
  
  score += Math.floor(points * multiplier);
  updateScoreDisplay();
}

// Add coins
function addCoins(amount) {
  // Apply coin multiplier from equipped items
  let multiplier = cheats.coinMultiplier;
  
  // Check for equipped booster
  if (hasAbility('booster_coinMultiplier')) {
    multiplier *= 1.5;
  }
  
  const coinAmount = Math.floor(amount * multiplier);
  coins += coinAmount;
  totalCoins += coinAmount;
  
  updateCoinsDisplay();
}

// Update score display
function updateScoreDisplay() {
  document.getElementById('scoreDisplay').textContent = score.toLocaleString();
}

// Update coins display
function updateCoinsDisplay() {
  document.getElementById('coinsDisplay').textContent = coins.toString();
  
  // Also update shop display if on shop screen
  if (gameState === 'shop') {
    document.getElementById('shopCoins').textContent = coins.toString();
  }
}

// Generate initial platforms for a new game
function generateInitialPlatforms() {
  // Clear existing platforms
  platforms = [];
  coins = [];
  obstacles = [];
  
  // Reset counters
  platformCounter = 0;
  coinCounter = 0;
  obstacleCounter = 0;
  
  // Add starting platform
  platforms.push({
    id: platformCounter++,
    x: 0,
    y: 200,
    width: 500,
    height: 40,
    type: 'normal'
  });
  
  // Add a few more platforms
  lastPlatformEnd = 250; // Half the starting platform width
  
  // Generate more platforms
  generateMorePlatforms(10);
}

// Generate more platforms as player progresses
function generateMorePlatforms(count = 5) {
  const newPlatforms = [];
  const newCoins = [];
  const newObstacles = [];
  
  let currentX = lastPlatformEnd;
  const difficulty = Math.min(10, 1 + Math.floor(score / 1000));
  
  // Generate a sequence of platforms
  for (let i = 0; i < count; i++) {
    // Generate platform width (larger at the beginning, smaller as difficulty increases)
    const platformWidth = Math.max(100, 200 - difficulty * 10 + Math.random() * 200);
    const platformHeight = 40;
    
    // Set position with gaps between platforms that increase with difficulty
    const gap = 50 + (Math.random() * difficulty * 20);
    currentX += platformWidth / 2 + gap;
    
    // Vary platform height with difficulty
    const heightVariation = Math.min(200, 50 + difficulty * 20);
    const platformY = 200 + (Math.random() * heightVariation - heightVariation / 2);
    
    // Determine platform type (with increasing chance of special platforms based on difficulty)
    let platformType = 'normal';
    const typeRoll = Math.random();
    
    // Higher chance of special platforms with higher difficulty
    if (typeRoll < 0.05 * difficulty) {
      platformType = 'bouncy';
    } else if (typeRoll < 0.1 * difficulty) {
      platformType = 'moving';
    }
    
    // Movement parameters for moving platforms
    const movementRange = platformType === 'moving' ? 50 + Math.random() * 100 : 0;
    const movementSpeed = 1 + Math.random() * 2;
    
    // Add the platform
    const newPlatform = {
      id: platformCounter++,
      x: currentX,
      y: platformY,
      width: platformWidth,
      height: platformHeight,
      type: platformType,
      movementRange: movementRange,
      movementSpeed: movementSpeed,
      movementDirection: 1,
      currentOffset: 0,
      initialX: currentX
    };
    
    newPlatforms.push(newPlatform);
    
    // Add coins on some platforms (higher chance with higher difficulty)
    if (Math.random() < 0.3 + (difficulty * 0.05)) {
      // Number of coins to place on this platform
      const coinCount = 1 + Math.floor(Math.random() * 3);
      
      for (let c = 0; c < coinCount; c++) {
        // Position coins along the platform
        const coinOffset = (Math.random() * platformWidth * 0.8) - (platformWidth * 0.4);
        
        newCoins.push({
          id: coinCounter++,
          x: currentX + coinOffset,
          y: platformY - 50, // Above the platform
          radius: 15,
          value: 1,
          collected: false
        });
      }
    }
    
    // Special gold coin (higher value) on some platforms
    if (Math.random() < 0.05 * difficulty) {
      newCoins.push({
        id: coinCounter++,
        x: currentX,
        y: platformY - 80, // Higher above the platform
        radius: 20,
        value: 5, // Gold coin worth more
        collected: false
      });
    }
    
    // Add obstacles on some platforms (higher chance with higher difficulty)
    if (Math.random() < 0.1 * difficulty && platformWidth > 150) {
      // Obstacle type
      const obstacleType = Math.random() < 0.5 ? 'spike' : 'barrier';
      
      // Position obstacle on the platform
      const obstacleOffset = (Math.random() * platformWidth * 0.6) - (platformWidth * 0.3);
      
      // Size depends on type
      const obstacleWidth = obstacleType === 'spike' ? 20 : 30;
      const obstacleHeight = obstacleType === 'spike' ? 20 : 60;
      
      newObstacles.push({
        id: obstacleCounter++,
        x: currentX + obstacleOffset,
        y: platformY - platformHeight / 2 - obstacleHeight / 2,
        width: obstacleWidth,
        height: obstacleHeight,
        type: obstacleType
      });
    }
    
    // Update the last platform end position
    currentX += platformWidth / 2;
  }
  
  // Update the last platform end position
  lastPlatformEnd = currentX;
  
  // Add new platforms to the game
  platforms = platforms.concat(newPlatforms);
  coins = coins.concat(newCoins);
  obstacles = obstacles.concat(newObstacles);
}

// Clean up platforms that are far behind the player
function cleanupPlatforms() {
  const cleanupDistance = player.x - PLATFORM_CLEANUP_DISTANCE;
  
  // Remove platforms that are too far behind
  platforms = platforms.filter(platform => {
    return platform.x + platform.width / 2 > cleanupDistance;
  });
  
  // Remove coins that are too far behind
  coins = coins.filter(coin => {
    return coin.x > cleanupDistance;
  });
  
  // Remove obstacles that are too far behind
  obstacles = obstacles.filter(obstacle => {
    return obstacle.x > cleanupDistance;
  });
}

// Render the game
function renderGame() {
  // Set canvas transform to follow camera
  ctx.save();
  ctx.translate(-camera.x, 0);
  
  // Draw background (gradient)
  const gradient = ctx.createLinearGradient(camera.x, 0, camera.x, canvasHeight);
  gradient.addColorStop(0, '#0f0f3e');
  gradient.addColorStop(1, '#1a1a4e');
  ctx.fillStyle = gradient;
  ctx.fillRect(camera.x, 0, canvasWidth, canvasHeight);
  
  // Draw some background stars
  drawStars();
  
  // Draw platforms
  drawPlatforms();
  
  // Draw coins
  drawCoins();
  
  // Draw obstacles
  drawObstacles();
  
  // Draw player
  drawPlayer();
  
  // Restore canvas transform
  ctx.restore();
}

// Draw background stars
function drawStars() {
  // Use camera position to create parallax effect
  const parallaxFactor = 0.3;
  const starFieldWidth = 2000; // Wider than screen to avoid gaps
  
  // Calculate which star field section we're in
  const fieldSection = Math.floor(camera.x / starFieldWidth);
  
  // Draw stars for current section and adjacent sections
  for (let section = fieldSection - 1; section <= fieldSection + 1; section++) {
    // Generate stars based on section number (consistent for each section)
    const starSeed = section * 10000;
    const starCount = 100;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    // Generate and draw stars
    for (let i = 0; i < starCount; i++) {
      const starX = (section * starFieldWidth) + pseudoRandom(starSeed + i) * starFieldWidth;
      const starY = pseudoRandom(starSeed + i + 1000) * canvasHeight;
      const starSize = 1 + pseudoRandom(starSeed + i + 2000) * 2;
      
      // Apply parallax effect
      const adjustedX = starX - (camera.x * parallaxFactor);
      
      ctx.beginPath();
      ctx.arc(adjustedX, starY, starSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Pseudo-random number generator for consistent star positions
function pseudoRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Draw platforms
function drawPlatforms() {
  platforms.forEach(platform => {
    // Skip platforms that are far off screen
    if (platform.x + platform.width / 2 < camera.x - 100 || 
        platform.x - platform.width / 2 > camera.x + canvasWidth + 100) {
      return;
    }
    
    // Platform color based on type
    let color;
    switch (platform.type) {
      case 'bouncy':
        color = '#ff5555';
        break;
      case 'moving':
        color = '#55ff55';
        break;
      default:
        color = '#8B4513'; // Brown
    }
    
    // Draw platform
    ctx.fillStyle = color;
    ctx.fillRect(
      platform.x - platform.width / 2,
      platform.y - platform.height / 2,
      platform.width,
      platform.height
    );
    
    // Add wood texture pattern
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    
    const stripeWidth = 20;
    for (let i = 0; i < platform.width; i += stripeWidth * 2) {
      ctx.fillRect(
        platform.x - platform.width / 2 + i,
        platform.y - platform.height / 2,
        stripeWidth,
        platform.height
      );
    }
  });
}

// Draw coins
function drawCoins() {
  coins.forEach(coin => {
    // Skip coins that are far off screen
    if (coin.x < camera.x - 100 || coin.x > camera.x + canvasWidth + 100) {
      return;
    }
    
    // Draw coin
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
    
    // Gold color with gradient
    const gradient = ctx.createRadialGradient(
      coin.x, coin.y, 0,
      coin.x, coin.y, coin.radius
    );
    
    if (coin.value > 1) {
      // Special gold coin
      gradient.addColorStop(0, '#ffee77');
      gradient.addColorStop(0.8, '#ffcc00');
      gradient.addColorStop(1, '#cc9900');
      
      // Add glow effect
      ctx.shadowColor = '#ffcc00';
      ctx.shadowBlur = 10;
    } else {
      // Regular coin
      gradient.addColorStop(0, '#ffdc73');
      gradient.addColorStop(0.8, '#ffb700');
      gradient.addColorStop(1, '#cc9900');
      
      ctx.shadowBlur = 0;
    }
    
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Draw coin inner detail
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, coin.radius * 0.7, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

// Draw obstacles
function drawObstacles() {
  obstacles.forEach(obstacle => {
    // Skip obstacles that are far off screen
    if (obstacle.x < camera.x - 100 || obstacle.x > camera.x + canvasWidth + 100) {
      return;
    }
    
    if (obstacle.type === 'spike') {
      // Draw spike (triangle)
      ctx.beginPath();
      ctx.moveTo(obstacle.x, obstacle.y - obstacle.height / 2);
      ctx.lineTo(obstacle.x - obstacle.width / 2, obstacle.y + obstacle.height / 2);
      ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2);
      ctx.closePath();
      ctx.fillStyle = '#ff3030';
      ctx.fill();
    } else {
      // Draw barrier (rectangle)
      ctx.fillStyle = '#555555';
      ctx.fillRect(
        obstacle.x - obstacle.width / 2,
        obstacle.y - obstacle.height / 2,
        obstacle.width,
        obstacle.height
      );
      
      // Add some detail
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      for (let i = 0; i < obstacle.height; i += 10) {
        ctx.fillRect(
          obstacle.x - obstacle.width / 2,
          obstacle.y - obstacle.height / 2 + i,
          obstacle.width,
          5
        );
      }
    }
  });
}

// Draw player
function drawPlayer() {
  // Get equipped items
  const equippedItems = getEquippedItems();
  
  // Check for special effects
  const hasGlow = equippedItems.some(item => item.id === 'cosmetic_glow');
  const hasTrail = equippedItems.some(item => item.id === 'cosmetic_trail');
  
  // Draw trail if enabled
  if (hasTrail && player.direction !== 0) {
    // Add new trail point
    if (!player.trailPoints) {
      player.trailPoints = [];
    }
    
    // Only add points when moving
    if (player.velocityX !== 0) {
      player.trailPoints.push({
        x: player.x,
        y: player.y,
        age: 0
      });
      
      // Limit trail length
      if (player.trailPoints.length > 10) {
        player.trailPoints.shift();
      }
    }
    
    // Draw trail
    if (player.trailPoints.length > 1) {
      ctx.beginPath();
      ctx.moveTo(player.trailPoints[0].x, player.trailPoints[0].y);
      
      for (let i = 1; i < player.trailPoints.length; i++) {
        ctx.lineTo(player.trailPoints[i].x, player.trailPoints[i].y);
        // Age trail points
        player.trailPoints[i-1].age++;
      }
      
      ctx.strokeStyle = 'rgba(136, 204, 255, 0.7)';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Remove old trail points
      player.trailPoints = player.trailPoints.filter(point => point.age < 10);
    }
  }
  
  // Draw glow effect if enabled
  if (hasGlow) {
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.width * 0.8, 0, Math.PI * 2);
    
    const gradient = ctx.createRadialGradient(
      player.x, player.y, 0,
      player.x, player.y, player.width * 0.8
    );
    
    gradient.addColorStop(0, 'rgba(136, 204, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(136, 204, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fill();
  }
  
  // Draw player body
  ctx.fillStyle = player.color;
  ctx.fillRect(
    player.x - player.width / 2,
    player.y - player.height / 2,
    player.width,
    player.height
  );
  
  // Add some detail to the player
  // Eyes
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(
    player.x - player.width * 0.15,
    player.y - player.height * 0.2,
    player.width * 0.1,
    0,
    Math.PI * 2
  );
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(
    player.x + player.width * 0.15,
    player.y - player.height * 0.2,
    player.width * 0.1,
    0,
    Math.PI * 2
  );
  ctx.fill();
  
  // Pupils (looking in movement direction)
  let eyeOffsetX = 0;
  if (player.direction !== 0) {
    eyeOffsetX = player.direction * 0.05 * player.width;
  }
  
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(
    player.x - player.width * 0.15 + eyeOffsetX,
    player.y - player.height * 0.2,
    player.width * 0.05,
    0,
    Math.PI * 2
  );
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(
    player.x + player.width * 0.15 + eyeOffsetX,
    player.y - player.height * 0.2,
    player.width * 0.05,
    0,
    Math.PI * 2
  );
  ctx.fill();
  
  // Draw mouth based on whether jumping/falling or grounded
  if (player.isGrounded) {
    // Happy mouth
    ctx.beginPath();
    ctx.arc(
      player.x,
      player.y + player.height * 0.1,
      player.width * 0.2,
      0,
      Math.PI
    );
    ctx.stroke();
  } else {
    // Surprised mouth
    ctx.beginPath();
    ctx.arc(
      player.x,
      player.y + player.height * 0.1,
      player.width * 0.1,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

// Play sound with volume control
function playSound(sound) {
  if (!sound || isMuted) return;
  
  // Clone the sound to allow overlapping playback
  const soundClone = sound.cloneNode();
  soundClone.volume = 0.5;
  soundClone.play().catch(err => {
    console.error("Error playing sound:", err);
  });
}

// Load audio assets
function loadAudio() {
  // Set audio sources
  bgMusic.src = 'audio/background.mp3';
  hitSound.src = 'audio/hit.mp3';
  successSound.src = 'audio/coin.mp3';
  
  // Set volume
  bgMusic.volume = 0.3;
  hitSound.volume = 0.5;
  successSound.volume = 0.5;
  
  // Preload
  bgMusic.load();
  hitSound.load();
  successSound.load();
}

// Get SVG path data for an icon
function getIconPath(iconName) {
  // Simple icon path data for common icons
  const iconPaths = {
    'user': '<circle cx="12" cy="8" r="4"></circle><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>',
    'zap': '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>',
    'trending-up': '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>',
    'chevrons-up': '<polyline points="17 11 12 6 7 11"></polyline><polyline points="17 18 12 13 7 18"></polyline>',
    'magnet': '<path d="M6 2l0 5.5c0 1.33 .8 2.5 2 3l0 3.5c0 1.33 -.8 2.5 -2 3l0 3h12l0 -3c-1.2 -.5 -2 -1.67 -2 -3v-3.5c1.2 -.5 2 -1.67 2 -3v-5.5"></path><path d="M6 5h12"></path><path d="M6 17h12"></path>',
    'plus-circle': '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line>',
    'dollar-sign': '<line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>',
    'git-branch': '<line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path>',
    'sun': '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>',
    'chevron-left': '<polyline points="15 18 9 12 15 6"></polyline>',
    'check': '<polyline points="20 6 9 17 4 12"></polyline>',
    'star': '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>'
  };
  
  return iconPaths[iconName] || '<circle cx="12" cy="12" r="10"></circle>';
}

// Create directory for audio files
function createAudioDirectory() {
  // Function to create a directory for audio files
  // This would be done on the server side in a real application
}

// Initialize the game when the window loads
window.onload = init;