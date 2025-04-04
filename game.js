const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game states
let gameState = 'home'; // 'home', 'playing', or 'paused'
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
let showMobileControls = isMobile;

// Game variables
const gravity = 0.8;
const playerWidth = 50;
const playerHeight = 50;
let selectedCharacter = 0;
const characters = [
    { color1: '#FF6B6B', color2: '#FF4141', name: 'Red Cube' },
    { color1: '#6B96FF', color2: '#4169FF', name: 'Blue Cube' },
    { color1: '#7AFF6B', color2: '#41FF45', name: 'Green Cube' },
    { color1: '#FFD700', color2: '#FFA500', name: 'Gold Cube' }
];
const VOID_THRESHOLD = 1000; // Height at which player dies
let isJumping = false;
let gameOver = false;
let gameTimer = 0;
let timerStarted = false;
let lastTime = 0;
let hasShield = false;
let hasSpeedBoost = false;
let powerUpTimer = 0;
let jumpTrailParticles = [];
let moveLeft = false;
let moveRight = false;
let score = 0;
let highScore = loadScore();
let cameraX = 0;  // Camera position tracking
let cameraY = 0;  // Vertical camera position
let powerUps = []; // Array to store power-ups
const CAMERA_SMOOTHNESS = 0.1;  // Adjust this value to change how smooth the camera follows (0-1)

// Platforms array and spikes
let platforms = [];
let spikes = [];

// Function to generate platforms dynamically
function generatePlatforms() {
    let y = canvas.height - 100;
    let x = 50; // Start at the left
    const maxJumpHeight = 120; // Maximum height player can jump
    const minGap = 100; // Minimum gap between platforms
    const maxGap = 200; // Maximum gap between platforms

    const platformTypes = [
        { type: 'normal', colors: ['#4CAF50', '#45A049'] },
        { type: 'ice', colors: ['#87CEEB', '#5FB4EA'] },
        { type: 'bounce', colors: ['#FF69B4', '#FF1493'] },
        { type: 'speed', colors: ['#FFD700', '#FFA500'] }
    ];

    for (let i = 0; i < 10; i++) {
        let width = Math.random() * 100 + 100;

        // First platform is always normal and easily accessible
        if (i === 0) {
            width = 200;
            platforms.push({ 
                x, 
                y, 
                width, 
                height: 20,
                type: 'normal',
                colors: platformTypes[0].colors
            });
        } else {
            // Calculate next platform position based on player's jump capabilities
            let heightDiff = Math.random() * (maxJumpHeight * 0.7); // 70% of max jump height for safety
            y = Math.max(80, y - heightDiff); // Ensure platforms don't go too high

            // Calculate horizontal gap based on height difference
            let gap = minGap + (heightDiff / maxJumpHeight) * (maxGap - minGap);
            x += gap + width;

            const randomType = platformTypes[Math.floor(Math.random() * platformTypes.length)];
            platforms.push({ x, y, width, height: 20, type: randomType.type, colors: randomType.colors });
        }
    }
}

// Initialize platforms
generatePlatforms();

// Player object (spawns on the leftmost platform)
let particles = [];

let player = {
    x: platforms[0].x,
    y: platforms[0].y - playerHeight,
    width: playerWidth,
    height: playerHeight,
    speed: 8,
    dx: 0,
    dy: 0,
    acceleration: 0.5,
    friction: 0.85,
    maxSpeed: 8,
    jumpsLeft: 2
};

// Function to draw the background with gradient
function drawScore() {
    ctx.font = '20px "Press Start 2P"';
    ctx.fillStyle = '#000';
    ctx.fillText(`Score: ${score}`, canvas.width / 10, 40);
    ctx.fillText(`High Score: ${highScore}`, canvas.width / 6.5, 70);
    if (timerStarted) {
        const seconds = Math.floor(gameTimer / 1000);
        const milliseconds = Math.floor((gameTimer % 1000) / 10);
        ctx.fillText(`Time: ${seconds}.${milliseconds.toString().padStart(2, '0')}`, canvas.width / 8, 100);
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');  // Sky blue at top
    gradient.addColorStop(1, '#E0F6FF');  // Lighter blue at bottom
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw lava effect
    const lavaY = VOID_THRESHOLD - cameraY;
    const lavaGradient = ctx.createLinearGradient(0, lavaY - 100, 0, lavaY + 200);
    lavaGradient.addColorStop(0, 'rgba(255, 69, 0, 0)');
    lavaGradient.addColorStop(0.4, 'rgba(255, 69, 0, 0.8)');
    lavaGradient.addColorStop(1, '#FF4500');
    ctx.fillStyle = lavaGradient;

    // Animate lava waves
    const time = Date.now() / 1000;
    ctx.beginPath();
    ctx.moveTo(0, lavaY);

    for (let x = 0; x <= canvas.width; x += 30) {
        const waveHeight = Math.sin(x / 50 + time) * 15;
        ctx.lineTo(x, lavaY + waveHeight);
    }

    ctx.lineTo(canvas.width, canvas.height + 100);
    ctx.lineTo(0, canvas.height + 100);
    ctx.closePath();
    ctx.fill();

    // Add lava particles
    for (let i = 0; i < 5; i++) {
        const x = (Math.random() * canvas.width);
        const y = lavaY + Math.random() * 20 - 10;
        const size = Math.random() * 4 + 2;

        ctx.fillStyle = 'rgba(255, 255, 0, 0.6)';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw sun
    const sunX = 100 - cameraX * 0.1; // Parallax effect for sun
    const sunY = 100;

    // Sun glow
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 80);
    sunGlow.addColorStop(0, 'rgba(255, 255, 200, 0.4)');
    sunGlow.addColorStop(1, 'rgba(255, 255, 200, 0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 80, 0, Math.PI * 2);
    ctx.fill();

    // Sun body
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 40, 0, Math.PI * 2);
    ctx.fill();

    // Draw dirt background
    ctx.fillStyle = '#964B00'; // Brown color for

    // Add dirt texture (grey dots)
    ctx.fillStyle = 'rgba(150, 75, 0, 0.3)';
    for (let x = 0; x < canvas.width; x += 20) {
        for (let y = VOID_THRESHOLD; y < VOID_THRESHOLD + canvas.height; y += 20) {
            ctx.beginPath();
            ctx.arc(x, y - cameraY, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Add infinite decorative clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    let cloudX = -cameraX * 0.3; // Parallax effect
    let cloudY = -cameraY * 0.1; // Vertical parallax effect

    // Generate clouds based on camera position with more variation
    const cloudSpacing = 300;
    const startCloud = Math.floor(cameraX / cloudSpacing) - 8;
    const endCloud = startCloud + 20;

    for (let i = startCloud; i < endCloud; i++) {
        // Use pseudo-random values based on cloud index for consistent yet varied appearance
        const seed = Math.abs(Math.sin(i * 12.9898) * 43758.5453);
        const randSize = Math.abs((Math.sin(seed) + 1.5) * 15 + Math.cos(i) * 10);
        const randHeight = Math.cos(seed * 2.71828) * 150 + 200;
        const randOpacity = (Math.sin(seed * 1.41421) + 1) * 0.2 + 0.2;
        const randOffset = Math.sin(seed * 3.14159) * 50;

        ctx.fillStyle = `rgba(255, 255, 255, ${randOpacity})`;
        ctx.beginPath();
        ctx.arc(cloudX + i * cloudSpacing + randOffset, randHeight + cloudY, randSize, 0, Math.PI * 2);
        ctx.arc(cloudX + 40 + i * cloudSpacing + randOffset, randHeight + cloudY - 10, randSize * 0.9, 0, Math.PI * 2);
        ctx.arc(cloudX + 80 + i * cloudSpacing + randOffset, randHeight + cloudY, randSize * 0.8, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Function to draw the player with rounded corners and gradient
function drawPlayer() {
    // Draw jump trail
    if (player.dy < 0) {
        jumpTrailParticles.push({
            x: player.x + player.width/2,
            y: player.y + player.height,
            alpha: 1
        });
    }

    jumpTrailParticles.forEach((particle, index) => {
        particle.alpha -= 0.05;
        if (particle.alpha <= 0) {
            jumpTrailParticles.splice(index, 1);
        } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${particle.alpha})`;
            ctx.fillRect(particle.x - cameraX, particle.y - cameraY, 4, 4);
        }
    });

    ctx.save();
    ctx.translate(player.x - cameraX, player.y - cameraY);

    // Draw shield effect
    if (hasShield) {
        ctx.beginPath();
        ctx.arc(player.width/2, player.height/2, player.width * 0.8, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 100, 255, 0.5)';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    // Add smooth stretch effect when jumping
    const targetStretchHeight = player.dy < 0 ? player.height * 1.2 :
        player.dy > 0 ? player.height * 0.8 :
            player.height;
    const targetStretchWidth = player.dy < 0 ? player.width * 0.8 :
        player.dy > 0 ? player.width * 1.2 :
            player.width;

    // Store current dimensions if not exist
    player.currentHeight = player.currentHeight || player.height;
    player.currentWidth = player.currentWidth || player.width;

    // Smooth transition using lerp with reduced smoothness for slower animation
    const smoothness = 0.08;
    player.currentHeight += (targetStretchHeight - player.currentHeight) * smoothness;
    player.currentWidth += (targetStretchWidth - player.currentWidth) * smoothness;

    let stretchWidth = player.currentWidth;
    let stretchHeight = player.currentHeight;

    // Create gradient for player using selected character colors
    const gradient = ctx.createLinearGradient(0, 0, 0, stretchHeight);
    gradient.addColorStop(0, characters[selectedCharacter].color1);
    gradient.addColorStop(1, characters[selectedCharacter].color2);

    // Draw rounded rectangle with stretch effect
    ctx.beginPath();
    ctx.roundRect(
        (player.width - stretchWidth) / 2,
        (player.height - stretchHeight) / 2,
        stretchWidth,
        stretchHeight,
        10
    );
    ctx.fillStyle = gradient;
    ctx.fill();

    // Add eyes
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(player.width * 0.3, player.height * 0.3, 5, 0, Math.PI * 2);
    ctx.arc(player.width * 0.7, player.height * 0.3, 5, 0, Math.PI * 2);
    ctx.fill();

    // Add smile
    ctx.beginPath();
    ctx.arc(player.width * 0.5, player.height * 0.5, 15, 0, Math.PI);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
}

// Function to draw platforms with gradients and rounded corners
function drawPlatforms() {
    platforms.forEach(platform => {
        ctx.save();
        ctx.translate(platform.x - cameraX, platform.y - cameraY);

        // Draw platform shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.roundRect(5, 5, platform.width, platform.height, 8);
        ctx.fill();

        // Create gradient for platform top
        const gradient = ctx.createLinearGradient(0, 0, 0, platform.height);
        gradient.addColorStop(0, platform.colors[0]);
        gradient.addColorStop(1, platform.colors[1]);

        // Draw platform top with rounded corners
        ctx.beginPath();
        ctx.roundRect(0, 0, platform.width, platform.height, 8);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw platform extension down infinitely
        const extensionHeight = canvas.height * 2;  // Make it extend beyond screen
        ctx.fillStyle = '#8B4513';  // Brown color for extension
        ctx.fillRect(10, platform.height, platform.width - 20, extensionHeight);

        // Add some texture to the extension
        ctx.fillStyle = 'rgba(139, 69, 19, 0.4)';  // Darker brown for texture
        for (let y = platform.height; y < extensionHeight; y += 20) {
            for (let x = 5; x < platform.width - 5; x += 15) {
                ctx.fillRect(x, y, 3, 3);
            }
        }

        // Add platform shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(10, 2, platform.width - 20, 3);

        ctx.restore();
    });
}

// Function to move the player
function movePlayer() {
    // Smooth horizontal movement with acceleration
    if (moveLeft) {
        player.dx -= player.acceleration;
        player.dx = Math.max(player.dx, -player.maxSpeed);
    } else if (moveRight) {
        player.dx += player.acceleration;
        player.dx = Math.min(player.dx, player.maxSpeed);
    } else {
        // Apply friction when not moving
        player.dx *= player.friction;
    }

    // Stop tiny sliding
    if (Math.abs(player.dx) < 0.1) player.dx = 0;

    // Apply gravity with smoothing
    player.dy += gravity * 0.9;
    player.dy *= 0.99; // Slight air resistance

    player.x += player.dx;
    player.y += player.dy;

    // Smooth horizontal camera movement
    const targetCameraX = player.x - canvas.width / 3;
    cameraX += (targetCameraX - cameraX) * 0.08;

    // Smooth vertical camera movement with increased range
    const targetCameraY = player.y - canvas.height / 2;
    cameraY += (targetCameraY - cameraY) * 0.06;

    // Check for void death
    if (player.y > VOID_THRESHOLD) {
        gameOver = true;
        resetGame();
    }
}

// Function to reset the game
// Function to save score to cookie
function saveScore(score) {
    localStorage.setItem('highScore', score.toString());
}

// Function to load score from cookie
function loadScore() {
    const savedScore = localStorage.getItem('highScore');
    return savedScore ? parseInt(savedScore) : 0;
}

function resetGame() {
    if (score > highScore) {
        highScore = score;
        saveScore(highScore);
    }
    platforms = [];
    generatePlatforms();
    score = 0;
    gameTimer = 0;
    timerStarted = false;
    spikes = [];
    player.x = platforms[0].x;
    player.y = platforms[0].y - playerHeight;
    player.dx = 0;
    player.dy = 0;
    cameraX = 0;
    cameraY = 0;
    gameOver = false;
}

// Function to detect collision with platforms
function detectCollision() {
    let onGround = false;
    let touchingPlatform = false;

    // Handle platform effects
    platforms.forEach(platform => {
        if (player.x + player.width > platform.x &&
            player.x < platform.x + platform.width &&
            player.y + player.height <= platform.y + player.dy &&
            player.y + player.height + player.dy >= platform.y) {

            switch(platform.type) {
                case 'ice':
                    player.friction = 0.99; // More slippery
                    break;
                case 'bounce':
                    player.dy = -20; // Extra bounce
                    break;
                case 'speed':
                    player.maxSpeed = 12; // Temporary speed boost
                    setTimeout(() => player.maxSpeed = 8, 1000);
                    break;
                default: // normal platform
                    player.friction = 0.85; // Reset friction
                    break;
            }
        }
    });

    // Check spike collisions
    spikes.forEach(spike => {
        if (
            player.x + player.width > spike.x &&
            player.x < spike.x + 30 &&
            player.y + player.height > spike.y &&
            player.y < spike.y + 15
        ) {
            gameOver = true;
            resetGame();
        }
    });
    platforms.forEach(platform => {
        if (
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width &&
            player.y + player.height <= platform.y + player.dy &&
            player.y + player.height + player.dy >= platform.y
        ) {
            player.y = platform.y - player.height;
            player.dy = 0;
            onGround = true;
            touchingPlatform = true;
        }
    });

    if (onGround) {
        isJumping = false;
        player.jumpsLeft = 2; // Reset jumps when touching ground
    } else if (!touchingPlatform && player.jumpsLeft === 2) {
        // If in air and haven't used any jumps yet, set to 1 jump left
        player.jumpsLeft = 1;
    }
}

// Function to handle jumping
function createParticles() {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: player.x + player.width / 2,
            y: player.y + player.height,
            dx: (Math.random() - 0.5) * 2,
            dy: Math.random() * 2 + 1,
            life: 1,
            color: '#ffffff'
        });
    }
}

function jump() {
    if (player.jumpsLeft > 0) {
        createParticles();
        isJumping = true;
        player.jumpsLeft--;

        // Adjust jump force based on which jump it is
        if (player.jumpsLeft === 1) {
            player.dy = -16;  // First jump stronger
        } else if (player.jumpsLeft === 0) {
            player.dy = -14;  // Second jump weaker
        }
    }
}

// Infinite level logic: generate new platforms as player moves right
function updatePlatforms() {
    let lastPlatform = platforms[platforms.length - 1];
    const maxJumpHeight = 120;
    const minGap = 100;
    const maxGap = 200;

    if (player.x > lastPlatform.x - 500) { // Generate platforms earlier
        let width = Math.random() * 100 + 100;

        // Calculate next platform position based on last platform
        const heightDiff = Math.abs(Math.random() * (maxJumpHeight * 0.7));
        let newY = Math.max(100, lastPlatform.y + (Math.random() < 0.5 ? -heightDiff : heightDiff * 0.3));

        // Ensure the height difference isn't too extreme
        if (Math.abs(newY - lastPlatform.y) > maxJumpHeight * 0.7) {
            newY = lastPlatform.y + (newY > lastPlatform.y ? maxJumpHeight * 0.7 : -maxJumpHeight * 0.7);
        }

        // Calculate gap based on height difference
        let gap = minGap + (Math.abs(newY - lastPlatform.y) / maxJumpHeight) * (maxGap - minGap);
        let x = lastPlatform.x + gap + lastPlatform.width;

        const platformTypes = [
            { type: 'normal', colors: ['#4CAF50', '#45A049'] },
            { type: 'ice', colors: ['#87CEEB', '#5FB4EA'] },
            { type: 'bounce', colors: ['#FF69B4', '#FF1493'] },
            { type: 'speed', colors: ['#FFD700', '#FFA500'] }
        ];
        const randomType = platformTypes[Math.floor(Math.random() * platformTypes.length)];

        platforms.push({ x, y: newY, width, height: 20, type: randomType.type, colors: randomType.colors });

        // Add spikes and power-ups with chance, but only if platform is far enough from player
        const minSafeDistance = 500; // Minimum distance from player to spawn spikes
        if (Math.random() < 0.2 && (x - player.x) > minSafeDistance) {
            // Spawn power-ups with 30% chance
            if (Math.random() < 0.3) {
                const type = Math.random() < 0.5 ? 'shield' : 'speed';
                powerUps.push({
                    x: x + (width / 2),
                    y: newY - 30,
                    type: type
                });
            }
            // Place a single spike in the middle of the platform
            spikes.push({
                x: x + (width / 2) - 15, // Center the spike on the platform
                y: newY // Spawn on top of platform
            });
        }

        // Remove platforms and spikes that are too far left (optimization)
        platforms = platforms.filter(p => p.x > player.x - canvas.width * 1.5);
        spikes = spikes.filter(s => s.x > player.x - canvas.width * 1.5);
    }
}

// Function to draw spikes
function drawSpikes() {
    spikes.forEach(spike => {
        ctx.save();
        ctx.translate(spike.x - cameraX, spike.y - cameraY);

        // Draw larger, more visible spike
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(15, -20);
        ctx.lineTo(30, 0);
        ctx.closePath();

        // Add gradient for better visibility
        const gradient = ctx.createLinearGradient(0, -20, 0, 0);
        gradient.addColorStop(0, '#FF0000');
        gradient.addColorStop(1, '#990000');
        ctx.fillStyle = gradient;
        ctx.fill();

        // Add outline
        ctx.strokeStyle = '#FF6666';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    });
}

// Event listeners for movement
document.addEventListener('keydown', (e) => {
    if (e.key === "ArrowLeft" || e.key === "a") {
        moveLeft = true;
        timerStarted = true;
    } else if (e.key === "ArrowRight" || e.key === "d") {
        moveRight = true;
        timerStarted = true;
    } else if (e.key === " " || e.key === "ArrowUp" || e.key === "w") {
        jump();
        timerStarted = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === "ArrowLeft" || e.key === "a") {
        moveLeft = false;
    } else if (e.key === "ArrowRight" || e.key === "d") {
        moveRight = false;
    }
});

// Game loop
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.dx;
        p.y += p.dy;
        p.life -= 0.03;

        if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - cameraX, p.y - cameraY, 4, 4);
        ctx.globalAlpha = 1;
    }
}

function drawPauseMenu() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = '40px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2 - 50);

    ctx.font = '20px "Press Start 2P"';
    ctx.fillText('Press ESC to Resume', canvas.width / 2, canvas.height / 2 + 50);

    // Draw mobile controls toggle button
    const buttonY = canvas.height / 2 + 100;
    const buttonWidth = 300;
    const buttonHeight = 40;
    const buttonX = canvas.width / 2 - buttonWidth / 2;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

    ctx.fillStyle = 'white';
    ctx.font = '16px "Press Start 2P"';
    ctx.fillText('Mobile Controls: ' + (showMobileControls ? 'ON' : 'OFF'), canvas.width / 2, buttonY + 25);
}

function drawHomeScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = '40px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('Platform Runner', canvas.width / 2, canvas.height / 2 - 150);

    // Draw character selection text
    ctx.font = '20px "Press Start 2P"';
    ctx.fillText('Choose Your Character', canvas.width / 2, canvas.height / 2 - 50);
    ctx.font = '16px "Press Start 2P"';
    ctx.fillText('Press ENTER to continue', canvas.width / 2, canvas.height / 2 - 20);

    // Draw character options
    const characterSpacing = 120;
    const startX = canvas.width / 2 - (characters.length * characterSpacing) / 2;

    characters.forEach((char, index) => {
        const x = startX + index * characterSpacing;
        const y = canvas.height / 2 + 30;

        // Draw character box
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(x - 35, y - 35, 70, 70);

        // Draw selection highlight with animation
        if (index === selectedCharacter) {
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 4;
            const pulseSize = Math.sin(Date.now() / 200) * 5; // Pulsing animation
            ctx.strokeRect(x - 40 - pulseSize, y - 40 - pulseSize, 80 + pulseSize * 2, 80 + pulseSize * 2);

            // Add glow effect
            ctx.shadowColor = '#FFF';
            ctx.shadowBlur = 20;
        }

        // Draw character
        ctx.save();
        const gradient = ctx.createLinearGradient(x - 25, y - 25, x - 25, y + 25);
        gradient.addColorStop(0, char.color1);
        gradient.addColorStop(1, char.color2);
        ctx.fillStyle = gradient;
        ctx.fillRect(x - 25, y - 25, 50, 50);

        // Draw eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(x - 10, y - 10, 5, 0, Math.PI * 2);
        ctx.arc(x + 10, y - 10, 5, 0, Math.PI * 2);
        ctx.fill();

        // Draw smile
        ctx.beginPath();
        ctx.arc(x, y + 5, 15, 0, Math.PI);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // Draw character name
        ctx.font = '12px "Press Start 2P"';
        ctx.fillStyle = 'white';
        ctx.fillText(char.name, x, y + 60);

        // Reset shadow
        ctx.shadowBlur = 0;
    });

    // Draw start button
    const buttonWidth = 200;
    const buttonHeight = 50;
    const buttonX = canvas.width / 2 - buttonWidth / 2;
    const buttonY = canvas.height - 120;

    // Pulse animation for the start button
    const pulseSize = Math.sin(Date.now() / 200) * 2;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(buttonX - pulseSize, buttonY - pulseSize, 
                buttonWidth + pulseSize * 2, buttonHeight + pulseSize * 2);

    ctx.font = '20px "Press Start 2P"';
    ctx.fillStyle = 'white';
    ctx.fillText('START', canvas.width / 2, buttonY + 33);

    // Add glow effect to the button text
    ctx.shadowColor = '#FFF';
    ctx.shadowBlur = 10;
    ctx.fillText('START', canvas.width / 2, buttonY + 33);
    ctx.shadowBlur = 0;

    if (isMobile) {
        ctx.font = '16px "Press Start 2P"';
        ctx.fillText('Mobile Controls: ' + (showMobileControls ? 'ON' : 'OFF'), canvas.width / 2, canvas.height - 60);
        ctx.fillText('Tap here to toggle', canvas.width / 2, canvas.height - 30);
    }
}

function drawMobileControls() {if (!showMobileControls) return;

    const buttonSize = 80;
    const cornerRadius = 15;

    // D-pad background
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = 'black';
    ctx.fillRect(20, canvas.height - 180, buttonSize * 2.2, buttonSize * 2.2);

    ctx.globalAlpha = 0.6;

    // Left arrow (larger and positioned like Minecraft)
    ctx.beginPath();
    ctx.roundRect(30, canvas.height - 120, buttonSize, buttonSize, cornerRadius);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fill();
    ctx.font = '30px "Press Start 2P"';
    ctx.fillStyle = '#333';
    ctx.fillText('←', 55, canvas.height - 75);

    // Right arrow
    ctx.beginPath();
    ctx.roundRect(120, canvas.height - 120, buttonSize, buttonSize, cornerRadius);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.fillText('→', 145, canvas.height - 75);

    // Jump button (larger, on right side likeMinecraft)
    ctx.beginPath();
    ctx.roundRect(canvas.width - 100, canvas.height - 120, buttonSize, buttonSize, cornerRadius);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.fillText('↑', canvas.width - 75, canvas.height - 75);

    // Pause button
    ctx.beginPath();
    ctx.roundRect(canvas.width - 90, 20, 70, 70, cornerRadius);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.font = '24px "Press Start 2P"';
    ctx.fillText('⏸', canvas.width - 70, 65);

    ctx.globalAlpha = 1;
}

function drawPowerUps() {
    powerUps.forEach((powerUp, index) => {
        const screenX = powerUp.x - cameraX;
        const screenY = powerUp.y - cameraY;

        ctx.save();
        ctx.translate(screenX, screenY);

        if (powerUp.type === 'shield') {
            ctx.fillStyle = 'rgba(0, 100, 255, 0.7)';
        } else {
            ctx.fillStyle = 'rgba(255, 255, 0, 0.7)';
        }

        ctx.beginPath();
        ctx.arc(0, 0, Math.abs(15), 0, Math.PI * 2);
        ctx.fill();

        // Collection detection
        if (Math.abs(player.x + player.width/2 - powerUp.x) < 30 &&
            Math.abs(player.y + player.height/2 - powerUp.y) < 30) {
            if (powerUp.type === 'shield') {
                hasShield = true;
                powerUpTimer = 300;
            } else {
                hasSpeedBoost = true;
                player.maxSpeed = 12;
                powerUpTimer = 300;
            }
            powerUps.splice(index, 1);
            playSound(powerUp.type);
        }

        ctx.restore();
    });
}

function playSound(type) {
    const audio = new Audio();
    audio.volume = 0.2;
    if (type === 'shield') {
        audio.src = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...';
    } else {
        audio.src = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...';
    }
    audio.play();
}

function update(currentTime) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear canvas
    drawBackground();

    if (gameState === 'playing' && timerStarted) {
        if (lastTime) {
            gameTimer += currentTime - lastTime;
        }
        lastTime = currentTime;
    } else {
        lastTime = currentTime;
    }

    if (powerUpTimer > 0) {
        powerUpTimer--;
        if (powerUpTimer === 0) {
            hasShield = false;
            hasSpeedBoost = false;
            player.maxSpeed = 8;
        }
    }

    if (gameState === 'home') {
        drawHomeScreen();
    } else if (gameState === 'paused') {
        drawPauseMenu();
    } else {
        movePlayer();
        detectCollision();
        updatePlatforms();  // Generate new platforms
        drawPlatforms();
        drawSpikes();
        updateParticles();
        drawPlayer();
        score = Math.floor(player.x / 100); // Score increases based on distance
        drawScore();
        if (isMobile && showMobileControls) {
            drawMobileControls();
        }
    }

    requestAnimationFrame(update);
}

// Event listeners for mobile controls
canvas.addEventListener('click', (e) => {
    if (gameState === 'home') {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if start button was clicked
        const buttonWidth = 200;
        const buttonHeight = 50;
        const buttonX = canvas.width / 2 - buttonWidth / 2;
        const buttonY = canvas.height - 120;

        if (x >= buttonX && x <= buttonX + buttonWidth &&
            y >= buttonY && y <= buttonY + buttonHeight) {
            gameState = 'playing';
            timerStarted = true;
        }

        // Check if character was clicked
        const characterSpacing = 120;
        const startX = canvas.width / 2 - (characters.length * characterSpacing) / 2;
        characters.forEach((_, index) => {
            const charX = startX + index * characterSpacing;
            const charY = canvas.height / 2 + 30;
            if (x >= charX - 35 && x <= charX + 35 &&
                y >= charY - 35 && y <= charY + 35) {
                selectedCharacter = index;
            }
        });
    }
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    Array.from(e.touches).forEach(touch => {
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        if (gameState === 'home' || gameState === 'paused') {
            const buttonY = canvas.height / 2 + 100;
            const buttonWidth = 300;
            const buttonHeight = 40;
            const buttonX = canvas.width / 2 - buttonWidth / 2;

            if (x >= buttonX && x <= buttonX + buttonWidth &&
                y >= buttonY && y <= buttonY + buttonHeight) {
                showMobileControls = !showMobileControls;
                isMobile = showMobileControls;
                return;
            }

            if (gameState === 'home') {
                gameState = 'playing';
            }
            return;
        }

        if (!showMobileControls || gameState !== 'playing') return;

        const buttonSize = 70;

        // Check pause button
        if (x >= canvas.width - 90 && x <= canvas.width - 90 + buttonSize &&
            y >= 20 && y <= 20 + buttonSize) {
            if (gameState === 'playing') {
                gameState = 'paused';
            }
            return;
        }

        // Check movement buttons
        if (y >= canvas.height - 100 && y <= canvas.height - 100 + buttonSize) {
            if (x >= 20 && x <= 20 + buttonSize) {
                moveLeft = true;
            } else if (x >= 100 && x <= 100 + buttonSize) {
                moveRight = true;
            }
        }

        // Check jump button
        if (x >= canvas.width - 90 && x <= canvas.width - 90 + buttonSize &&
            y >= canvas.height - 100 && y <= canvas.height - 100 + buttonSize) {
            jump();
        }
    });
});

canvas.addEventListener('touchend', (e) => {
    if (e.touches.length === 0) {
        moveLeft = false;
        moveRight = false;
    } else {
        // Check remaining touches to maintain movement
        Array.from(e.touches).forEach(touch => {
            const rect = canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;

            if (y >= canvas.height - 100 && y <= canvas.height - 30) {
                if (x >= 20 && x <= 80) {
                    moveLeft = true;
                } else if (x >= 100 && x <= 160) {
                    moveRight = true;
                }
            }
        });
    }
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (gameState === 'home') {
        if (e.key === ' ' || e.key === 'Enter') {
            gameState = 'playing';
            timerStarted = true;
            return;
        }
        if (e.key === 'ArrowLeft' || e.key === 'a') {
            selectedCharacter = (selectedCharacter - 1 + characters.length) % characters.length;
            return;
        }
        if (e.key === 'ArrowRight' || e.key === 'd') {
            selectedCharacter = (selectedCharacter + 1) % characters.length;
            return;
        }
    }

    if (e.key === 'Escape') {
        if (gameState === 'playing') {
            gameState = 'paused';
        } else if (gameState === 'paused') {
            gameState = 'playing';
        }
        return;
    }

    if (gameState === 'playing') {
        if (e.key === "ArrowLeft" || e.key === "a") {
            moveLeft = true;
        } else if (e.key === "ArrowRight" || e.key === "d") {
            moveRight = true;
        } else if (e.key === " " || e.key === "ArrowUp" || e.key === "w") {
            jump();
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (gameState === 'playing') {
        if (e.key === "ArrowLeft" || e.key === "a") {
            moveLeft = false;
        } else if (e.key === "ArrowRight" || e.key === "d") {
            moveRight = false;
        }
    }
});

// Start the game
update();