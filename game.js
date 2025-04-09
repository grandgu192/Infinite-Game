const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game states
let gameState = 'home'; // 'home', 'playing', 'paused', 'dev', or 'sharePrompt'
let newHighScoreAchieved = false;
let selectedScoreForSharing = null;
let highScoresList = [];
let showHighScores = false;
let showShareOptions = false;
let showShop = false;
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
let showMobileControls = isMobile;

// Character emotion system variables
let playerEmotion = 'neutral'; // Current emotion: neutral, happy, excited, scared, sad, proud
let emotionIntensity = 0.5; // How intense the emotion is (0.0 to 1.0)
let emotionTimer = 0; // How long the current emotion lasts
let emotionQueue = []; // Queue of upcoming emotions to blend through
let lastEmotionTrigger = 0; // Timestamp of last emotion change (to prevent rapid changes)
let facialAnimationTime = 0; // For tracking facial animations
let blinkTimer = 0; // For eye blinking animation
let isBlinking = false; // Whether character is currently blinking

// Dev menu options
let devOptions = {
    tenXScore: false,
    tenXCoin: false,
    unlockAll: false,
    tenXSpeed: false,
    noGravity: false
};

// Game variables
const gravity = 0.8;
const playerWidth = 50;
const playerHeight = 50;
let selectedCharacter = 0;
// Generate 100 icons with various colors, gradients, and patterns
const characters = [
    // Default unlocked characters (first 4 remain free)
    { color1: '#FF6B6B', color2: '#FF4141', name: 'Red Cube', unlocked: true, price: 0, inShop: false },
    { color1: '#7AFF6B', color2: '#41FF45', name: 'Green Cube', unlocked: true, price: 0, inShop: false },
    { color1: '#6B96FF', color2: '#4169FF', name: 'Blue Cube', unlocked: true, price: 0, inShop: false },
    { color1: '#FFD700', color2: '#FFA500', name: 'Gold Cube', unlocked: true, price: 0, inShop: false },
    
    // Original premium characters
    { color1: '#8A2BE2', color2: '#4B0082', name: 'Galaxy Cube', unlocked: false, price: 50, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, '#8A2BE2');
        g.addColorStop(1, '#4B0082');
        return g;
      }
    },
    { color1: '#FDB813', color2: '#F7931E', name: 'Sun Cube', unlocked: false, price: 75, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createRadialGradient(x + w/2, y + h/2, 0, x + w/2, y + h/2, w/2);
        g.addColorStop(0, '#FDB813');
        g.addColorStop(1, '#F7931E');
        return g;
      }
    },
    { color1: '#00FFFF', color2: '#0000FF', name: 'Water Cube', unlocked: false, price: 100, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, '#00FFFF');
        g.addColorStop(0.5, '#0099FF');
        g.addColorStop(1, '#0000FF');
        return g;
      }
    },
    { color1: '#FF4500', color2: '#8B0000', name: 'Lava Cube', unlocked: false, price: 150, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, '#FF4500');
        g.addColorStop(0.5, '#FF0000');
        g.addColorStop(1, '#8B0000');
        return g;
      }
    },
    { color1: '#9370DB', color2: '#6A5ACD', name: 'Magic Cube', unlocked: false, price: 200, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, '#9370DB');
        g.addColorStop(0.5, '#8A2BE2');
        g.addColorStop(1, '#6A5ACD');
        return g;
      }
    },
    
    // Additional 91 icons with unique designs and patterns
    // Rainbow Series
    { color1: '#FF0000', color2: '#FFA500', name: 'Rainbow 1', unlocked: false, price: 100, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createLinearGradient(x, y, x + w, y + h);
        g.addColorStop(0, '#FF0000');
        g.addColorStop(0.2, '#FFA500');
        g.addColorStop(0.4, '#FFFF00');
        g.addColorStop(0.6, '#00FF00');
        g.addColorStop(0.8, '#0000FF');
        g.addColorStop(1, '#9400D3');
        return g;
      }
    },
    { color1: '#FF0000', color2: '#9400D3', name: 'Rainbow 2', unlocked: false, price: 120, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, '#FF0000');
        g.addColorStop(0.2, '#FFA500');
        g.addColorStop(0.4, '#FFFF00');
        g.addColorStop(0.6, '#00FF00');
        g.addColorStop(0.8, '#0000FF');
        g.addColorStop(1, '#9400D3');
        return g;
      }
    },
    
    // Metallic Series
    { color1: '#A0A0A0', color2: '#D0D0D0', name: 'Silver', unlocked: false, price: 150, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createLinearGradient(x, y, x + w, y);
        g.addColorStop(0, '#D0D0D0');
        g.addColorStop(0.5, '#F8F8F8');
        g.addColorStop(1, '#A0A0A0');
        return g;
      }
    },
    { color1: '#B8860B', color2: '#DAA520', name: 'Antique Gold', unlocked: false, price: 180, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createLinearGradient(x, y, x + w, y);
        g.addColorStop(0, '#B8860B');
        g.addColorStop(0.5, '#DAA520');
        g.addColorStop(1, '#B8860B');
        return g;
      }
    },
    { color1: '#808080', color2: '#A9A9A9', name: 'Titanium', unlocked: false, price: 200, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createLinearGradient(x, y, x + w, y + h);
        g.addColorStop(0, '#808080');
        g.addColorStop(0.5, '#A9A9A9');
        g.addColorStop(1, '#696969');
        return g;
      }
    },
    
    // Neon Series
    { color1: '#FF00FF', color2: '#FF69B4', name: 'Neon Pink', unlocked: false, price: 120, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createLinearGradient(x, y, x + w, y + h);
        g.addColorStop(0, '#FF00FF');
        g.addColorStop(1, '#FF69B4');
        return g;
      }
    },
    { color1: '#00FF00', color2: '#39FF14', name: 'Neon Green', unlocked: false, price: 120, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createLinearGradient(x, y, x + w, y + h);
        g.addColorStop(0, '#00FF00');
        g.addColorStop(1, '#39FF14');
        return g;
      }
    },
    { color1: '#FF6600', color2: '#FF9933', name: 'Neon Orange', unlocked: false, price: 120, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createLinearGradient(x, y, x + w, y + h);
        g.addColorStop(0, '#FF6600');
        g.addColorStop(1, '#FF9933');
        return g;
      }
    },
    
    // Celestial Series
    { color1: '#000033', color2: '#0000FF', name: 'Night Sky', unlocked: false, price: 150, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createRadialGradient(x + w/2, y + h/2, 0, x + w/2, y + h/2, w);
        g.addColorStop(0, '#0000FF');
        g.addColorStop(1, '#000033');
        return g;
      },
      render: (ctx, x, y, w, h) => {
        // Draw base
        const g = ctx.createRadialGradient(x + w/2, y + h/2, 0, x + w/2, y + h/2, w);
        g.addColorStop(0, '#0000FF');
        g.addColorStop(1, '#000033');
        ctx.fillStyle = g;
        ctx.fillRect(x, y, w, h);
        
        // Draw stars
        ctx.fillStyle = "#FFFFFF";
        for (let i = 0; i < 20; i++) {
          ctx.beginPath();
          const starX = x + Math.random() * w;
          const starY = y + Math.random() * h;
          const radius = Math.random() * 2;
          ctx.arc(starX, starY, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
    { color1: '#4B0082', color2: '#800080', name: 'Nebula', unlocked: false, price: 180, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createRadialGradient(x + w/2, y + h/2, 0, x + w/2, y + h/2, w);
        g.addColorStop(0, '#800080');
        g.addColorStop(0.5, '#9370DB');
        g.addColorStop(1, '#4B0082');
        return g;
      },
      render: (ctx, x, y, w, h) => {
        // Draw base
        const g = ctx.createRadialGradient(x + w/2, y + h/2, 0, x + w/2, y + h/2, w);
        g.addColorStop(0, '#800080');
        g.addColorStop(0.5, '#9370DB');
        g.addColorStop(1, '#4B0082');
        ctx.fillStyle = g;
        ctx.fillRect(x, y, w, h);
        
        // Draw nebula texture
        ctx.globalAlpha = 0.5;
        for (let i = 0; i < 10; i++) {
          ctx.beginPath();
          const cloudX = x + Math.random() * w;
          const cloudY = y + Math.random() * h;
          const radius = Math.random() * 20 + 5;
          ctx.fillStyle = Math.random() > 0.5 ? '#9370DB' : '#C3B1E1';
          ctx.arc(cloudX, cloudY, radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    },
    
    // Nature Series
    { color1: '#228B22', color2: '#008000', name: 'Forest', unlocked: false, price: 120, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, '#228B22');
        g.addColorStop(1, '#008000');
        return g;
      },
      render: (ctx, x, y, w, h) => {
        // Draw base
        const g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, '#228B22');
        g.addColorStop(1, '#008000');
        ctx.fillStyle = g;
        ctx.fillRect(x, y, w, h);
        
        // Draw leaf pattern
        ctx.strokeStyle = '#32CD32';
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          const startX = x + Math.random() * w;
          const startY = y + Math.random() * h;
          ctx.moveTo(startX, startY);
          ctx.bezierCurveTo(
            startX + 10, startY - 10,
            startX + 20, startY - 10,
            startX + 30, startY
          );
          ctx.stroke();
        }
      }
    },
    { color1: '#5F9EA0', color2: '#ADD8E6', name: 'Ocean', unlocked: false, price: 120, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, '#ADD8E6');
        g.addColorStop(1, '#5F9EA0');
        return g;
      }
    },
    
    // Patterns Series
    { color1: '#000000', color2: '#FFFFFF', name: 'Checkerboard', unlocked: false, price: 150, inShop: true,
      render: (ctx, x, y, w, h) => {
        const tileSize = w / 4;
        for (let i = 0; i < 4; i++) {
          for (let j = 0; j < 4; j++) {
            ctx.fillStyle = (i + j) % 2 === 0 ? '#000000' : '#FFFFFF';
            ctx.fillRect(x + i * tileSize, y + j * tileSize, tileSize, tileSize);
          }
        }
      }
    },
    { color1: '#000000', color2: '#FF0000', name: 'Striped', unlocked: false, price: 130, inShop: true,
      render: (ctx, x, y, w, h) => {
        const stripeWidth = w / 5;
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = i % 2 === 0 ? '#000000' : '#FF0000';
          ctx.fillRect(x + i * stripeWidth, y, stripeWidth, h);
        }
      }
    },
    
    // Elemental Series
    { color1: '#E25822', color2: '#FF4500', name: 'Fire', unlocked: false, price: 150, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createLinearGradient(x, y + h, x, y);
        g.addColorStop(0, '#E25822');
        g.addColorStop(0.5, '#FF4500');
        g.addColorStop(1, '#FFD700');
        return g;
      }
    },
    { color1: '#A5F2F3', color2: '#00FFFF', name: 'Ice', unlocked: false, price: 150, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, '#FFFFFF');
        g.addColorStop(0.5, '#A5F2F3');
        g.addColorStop(1, '#00FFFF');
        return g;
      }
    },
    { color1: '#8B4513', color2: '#A0522D', name: 'Earth', unlocked: false, price: 150, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, '#A0522D');
        g.addColorStop(1, '#8B4513');
        return g;
      }
    },
    { color1: '#F0FFFF', color2: '#E0FFFF', name: 'Air', unlocked: false, price: 150, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createRadialGradient(x + w/2, y + h/2, 0, x + w/2, y + h/2, w/2);
        g.addColorStop(0, '#FFFFFF');
        g.addColorStop(1, '#E0FFFF');
        return g;
      }
    },
    
    // Candy Series
    { color1: '#FF77FF', color2: '#FFC0CB', name: 'Cotton Candy', unlocked: false, price: 100, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createLinearGradient(x, y, x + w, y + h);
        g.addColorStop(0, '#FF77FF');
        g.addColorStop(1, '#FFC0CB');
        return g;
      }
    },
    { color1: '#CD5C5C', color2: '#FF6347', name: 'Cherry', unlocked: false, price: 100, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createRadialGradient(x + w/2, y + h/2, 0, x + w/2, y + h/2, w/2);
        g.addColorStop(0, '#FF6347');
        g.addColorStop(1, '#CD5C5C');
        return g;
      }
    },
    { color1: '#FFDAB9', color2: '#FFE4B5', name: 'Caramel', unlocked: false, price: 100, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, '#FFDAB9');
        g.addColorStop(1, '#FFE4B5');
        return g;
      }
    },
    
    // Gem Series
    { color1: '#50C878', color2: '#00A36C', name: 'Emerald', unlocked: false, price: 200, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createLinearGradient(x, y, x + w, y + h);
        g.addColorStop(0, '#50C878');
        g.addColorStop(1, '#00A36C');
        return g;
      }
    },
    { color1: '#E0115F', color2: '#FF007F', name: 'Ruby', unlocked: false, price: 200, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createLinearGradient(x, y, x + w, y + h);
        g.addColorStop(0, '#E0115F');
        g.addColorStop(1, '#FF007F');
        return g;
      }
    },
    { color1: '#0F52BA', color2: '#4169E1', name: 'Sapphire', unlocked: false, price: 200, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createLinearGradient(x, y, x + w, y + h);
        g.addColorStop(0, '#0F52BA');
        g.addColorStop(1, '#4169E1');
        return g;
      }
    },
    { color1: '#9966CC', color2: '#8A2BE2', name: 'Amethyst', unlocked: false, price: 200, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createLinearGradient(x, y, x + w, y + h);
        g.addColorStop(0, '#9966CC');
        g.addColorStop(1, '#8A2BE2');
        return g;
      }
    },
    
    // Exotic Series
    { color1: '#800000', color2: '#A52A2A', name: 'Mahogany', unlocked: false, price: 150, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, '#800000');
        g.addColorStop(1, '#A52A2A');
        return g;
      }
    },
    { color1: '#4B0082', color2: '#800080', name: 'Royal Purple', unlocked: false, price: 180, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, '#4B0082');
        g.addColorStop(1, '#800080');
        return g;
      }
    },
    { color1: '#FFD700', color2: '#B8860B', name: 'Royal Gold', unlocked: false, price: 200, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, '#FFD700');
        g.addColorStop(1, '#B8860B');
        return g;
      }
    },
    
    // Holiday Series
    { color1: '#FF0000', color2: '#006400', name: 'Christmas', unlocked: false, price: 150, inShop: true,
      render: (ctx, x, y, w, h) => {
        // Draw base
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(x, y, w, h/2);
        ctx.fillStyle = '#006400';
        ctx.fillRect(x, y + h/2, w, h/2);
        
        // Draw snowflakes
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 10; i++) {
          ctx.beginPath();
          const snowX = x + Math.random() * w;
          const snowY = y + Math.random() * (h/2);
          ctx.arc(snowX, snowY, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
    { color1: '#FF6600', color2: '#000000', name: 'Halloween', unlocked: false, price: 150, inShop: true,
      render: (ctx, x, y, w, h) => {
        // Base
        ctx.fillStyle = '#FF6600';
        ctx.fillRect(x, y, w, h);
        
        // Draw pattern
        ctx.fillStyle = '#000000';
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            if ((i + j) % 2 === 1) {
              ctx.beginPath();
              ctx.arc(x + w * (i+1)/4, y + h * (j+1)/4, 5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }
    },
    
    // Pop Culture Series
    { color1: '#FF0000', color2: '#0000FF', name: 'Superhero', unlocked: false, price: 180, inShop: true,
      render: (ctx, x, y, w, h) => {
        // Draw split background
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(x, y, w/2, h);
        ctx.fillStyle = '#0000FF';
        ctx.fillRect(x + w/2, y, w/2, h);
        
        // Draw emblem
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(x + w/2, y + h/4);
        ctx.lineTo(x + w/2 + w/8, y + h/2);
        ctx.lineTo(x + w/2, y + h*3/4);
        ctx.lineTo(x + w/2 - w/8, y + h/2);
        ctx.closePath();
        ctx.fill();
      }
    },
    { color1: '#000000', color2: '#FFFFFF', name: 'Ninja', unlocked: false, price: 180, inShop: true,
      render: (ctx, x, y, w, h) => {
        // Base
        ctx.fillStyle = '#000000';
        ctx.fillRect(x, y, w, h);
        
        // Mask
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + w/4, y + h/3, w/2, h/12);
      }
    },
    
    // Cosmic Series
    { color1: '#663399', color2: '#C71585', name: 'Galaxy Swirl', unlocked: false, price: 200, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createRadialGradient(x + w/2, y + h/2, 0, x + w/2, y + h/2, w);
        g.addColorStop(0, '#663399');
        g.addColorStop(0.5, '#C71585');
        g.addColorStop(1, '#000000');
        return g;
      },
      render: (ctx, x, y, w, h) => {
        // Base gradient
        const g = ctx.createRadialGradient(x + w/2, y + h/2, 0, x + w/2, y + h/2, w);
        g.addColorStop(0, '#663399');
        g.addColorStop(0.5, '#C71585');
        g.addColorStop(1, '#000000');
        ctx.fillStyle = g;
        ctx.fillRect(x, y, w, h);
        
        // Stars
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 20; i++) {
          const size = Math.random() * 2;
          ctx.fillRect(
            x + Math.random() * w,
            y + Math.random() * h,
            size, size
          );
        }
      }
    },
    { color1: '#000000', color2: '#191970', name: 'Black Hole', unlocked: false, price: 250, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createRadialGradient(x + w/2, y + h/2, 0, x + w/2, y + h/2, w);
        g.addColorStop(0, '#000000');
        g.addColorStop(0.7, '#191970');
        g.addColorStop(1, '#000000');
        return g;
      }
    },
    
    // Tech Series
    { color1: '#00FFFF', color2: '#000000', name: 'Digital', unlocked: false, price: 180, inShop: true,
      render: (ctx, x, y, w, h) => {
        // Base
        ctx.fillStyle = '#000000';
        ctx.fillRect(x, y, w, h);
        
        // Binary pattern
        ctx.font = '10px Arial';
        ctx.fillStyle = '#00FFFF';
        
        for (let i = 0; i < 10; i++) {
          for (let j = 0; j < 5; j++) {
            const digit = Math.random() > 0.5 ? '1' : '0';
            ctx.fillText(digit, x + i * 10 + 5, y + j * 15 + 15);
          }
        }
      }
    },
    { color1: '#C0C0C0', color2: '#808080', name: 'Robot', unlocked: false, price: 180, inShop: true,
      render: (ctx, x, y, w, h) => {
        // Base
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(x, y, w, h);
        
        // Eyes
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(x + w/4, y + h/3, w/6, h/10);
        ctx.fillRect(x + w*3/5, y + h/3, w/6, h/10);
        
        // Mouth
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + w/4, y + h*2/3, w/2, h/12);
        
        // Lines
        ctx.strokeStyle = '#808080';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + w/5, y);
        ctx.lineTo(x + w/5, y + h);
        ctx.moveTo(x + w*4/5, y);
        ctx.lineTo(x + w*4/5, y + h);
        ctx.stroke();
      }
    },
    
    // Abstract Series
    { color1: '#FF00FF', color2: '#00FFFF', name: 'Neon Lights', unlocked: false, price: 150, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createLinearGradient(x, y, x + w, y + h);
        g.addColorStop(0, '#FF00FF');
        g.addColorStop(1, '#00FFFF');
        return g;
      }
    },
    { color1: '#000000', color2: '#FFFFFF', name: 'Hypnotic', unlocked: false, price: 180, inShop: true,
      render: (ctx, x, y, w, h) => {
        // Base
        ctx.fillStyle = '#000000';
        ctx.fillRect(x, y, w, h);
        
        // Concentric circles
        const maxRadius = Math.min(w, h) / 2;
        const centerX = x + w/2;
        const centerY = y + h/2;
        
        for (let i = maxRadius; i > 0; i -= maxRadius/5) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, i, 0, Math.PI * 2);
          ctx.fillStyle = i % (maxRadius/2.5) < maxRadius/5 ? '#FFFFFF' : '#000000';
          ctx.fill();
        }
      }
    },
    
    // Animal Series
    { color1: '#FFA500', color2: '#000000', name: 'Tiger', unlocked: false, price: 150, inShop: true,
      render: (ctx, x, y, w, h) => {
        // Base
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(x, y, w, h);
        
        // Stripes
        ctx.fillStyle = '#000000';
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.moveTo(x, y + i * h/4);
          ctx.lineTo(x + w, y + i * h/4 + h/8);
          ctx.lineTo(x + w, y + i * h/4 + h/4);
          ctx.lineTo(x, y + i * h/4 + h/8);
          ctx.closePath();
          ctx.fill();
        }
      }
    },
    { color1: '#FFFFFF', color2: '#000000', name: 'Panda', unlocked: false, price: 150, inShop: true,
      render: (ctx, x, y, w, h) => {
        // Base
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x, y, w, h);
        
        // Eyes
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x + w/3, y + h/3, w/8, 0, Math.PI * 2);
        ctx.arc(x + w*2/3, y + h/3, w/8, 0, Math.PI * 2);
        ctx.fill();
        
        // Ears
        ctx.beginPath();
        ctx.arc(x + w/5, y + h/6, w/10, 0, Math.PI * 2);
        ctx.arc(x + w*4/5, y + h/6, w/10, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    
    // Retro Series
    { color1: '#FF4500', color2: '#FFD700', name: 'Retro Sunset', unlocked: false, price: 150, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, '#FFD700');
        g.addColorStop(0.5, '#FF4500');
        g.addColorStop(1, '#800080');
        return g;
      }
    },
    { color1: '#000000', color2: '#00FF00', name: 'Matrix', unlocked: false, price: 180, inShop: true,
      render: (ctx, x, y, w, h) => {
        // Base
        ctx.fillStyle = '#000000';
        ctx.fillRect(x, y, w, h);
        
        // Matrix characters
        ctx.font = '10px Courier';
        ctx.fillStyle = '#00FF00';
        
        const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        
        for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 5; j++) {
            const char = characters.charAt(Math.floor(Math.random() * characters.length));
            ctx.fillText(char, x + i * 12 + 5, y + j * 15 + 15);
          }
        }
      }
    },
    
    // Food Series
    { color1: '#8B0000', color2: '#FF0000', name: 'Cherry', unlocked: false, price: 100, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createRadialGradient(x + w/2, y + h/2, 0, x + w/2, y + h/2, w/2);
        g.addColorStop(0, '#FF0000');
        g.addColorStop(1, '#8B0000');
        return g;
      }
    },
    { color1: '#FFD700', color2: '#FFA500', name: 'Cheese', unlocked: false, price: 100, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createLinearGradient(x, y, x + w, y + h);
        g.addColorStop(0, '#FFD700');
        g.addColorStop(1, '#FFA500');
        return g;
      },
      render: (ctx, x, y, w, h) => {
        // Base
        const g = ctx.createLinearGradient(x, y, x + w, y + h);
        g.addColorStop(0, '#FFD700');
        g.addColorStop(1, '#FFA500');
        ctx.fillStyle = g;
        ctx.fillRect(x, y, w, h);
        
        // Holes
        ctx.fillStyle = '#FFF8DC';
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          const holeX = x + Math.random() * (w - 10) + 5;
          const holeY = y + Math.random() * (h - 10) + 5;
          const holeSize = Math.random() * 8 + 5;
          ctx.arc(holeX, holeY, holeSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
    
    // Weather Series
    { color1: '#1E90FF', color2: '#00BFFF', name: 'Rainy', unlocked: false, price: 130, inShop: true,
      render: (ctx, x, y, w, h) => {
        // Base
        const g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, '#1E90FF');
        g.addColorStop(1, '#00BFFF');
        ctx.fillStyle = g;
        ctx.fillRect(x, y, w, h);
        
        // Rain drops
        ctx.strokeStyle = '#E0FFFF';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < 20; i++) {
          const dropX = x + Math.random() * w;
          const dropY = y + Math.random() * h;
          const dropLength = Math.random() * 10 + 5;
          
          ctx.beginPath();
          ctx.moveTo(dropX, dropY);
          ctx.lineTo(dropX - dropLength/3, dropY + dropLength);
          ctx.stroke();
        }
      }
    },
    { color1: '#FFFF00', color2: '#FFA500', name: 'Sunny', unlocked: false, price: 130, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createRadialGradient(x + w/2, y + h/2, 0, x + w/2, y + h/2, Math.max(w, h));
        g.addColorStop(0, '#FFFF00');
        g.addColorStop(0.7, '#FFA500');
        g.addColorStop(1, '#FF4500');
        return g;
      }
    },
    
    // Monochrome Series
    { color1: '#000000', color2: '#FFFFFF', name: 'Yin Yang', unlocked: false, price: 150, inShop: true,
      render: (ctx, x, y, w, h) => {
        const centerX = x + w/2;
        const centerY = y + h/2;
        const radius = Math.min(w, h)/2 - 5;
        
        // Draw dividing curve
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.clip();
        
        // White half
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x, y, w, h);
        
        // Black half
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI/2, Math.PI * 3/2);
        ctx.fill();
        
        // Small circles
        ctx.beginPath();
        ctx.arc(centerX, centerY - radius/2, radius/4, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(centerX, centerY + radius/2, radius/4, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        
        ctx.restore();
      }
    },
    { color1: '#000000', color2: '#FFFFFF', name: 'Zebra', unlocked: false, price: 150, inShop: true,
      render: (ctx, x, y, w, h) => {
        // Base
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x, y, w, h);
        
        // Stripes
        ctx.fillStyle = '#000000';
        for (let i = 0; i < 10; i++) {
          ctx.fillRect(x, y + i * h/5, w, h/10);
        }
      }
    },
    
    // Fruit Series
    { color1: '#FF6347', color2: '#FF4500', name: 'Tomato', unlocked: false, price: 100, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createRadialGradient(x + w/2, y + h/2, 0, x + w/2, y + h/2, w/2);
        g.addColorStop(0, '#FF6347');
        g.addColorStop(1, '#FF4500');
        return g;
      }
    },
    { color1: '#9ACD32', color2: '#556B2F', name: 'Lime', unlocked: false, price: 100, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createRadialGradient(x + w/2, y + h/2, 0, x + w/2, y + h/2, w/2);
        g.addColorStop(0, '#9ACD32');
        g.addColorStop(1, '#556B2F');
        return g;
      }
    },
    { color1: '#8A2BE2', color2: '#4B0082', name: 'Grape', unlocked: false, price: 100, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createRadialGradient(x + w/2, y + h/2, 0, x + w/2, y + h/2, w/2);
        g.addColorStop(0, '#8A2BE2');
        g.addColorStop(1, '#4B0082');
        return g;
      }
    },
    
    // Emoji Series
    { color1: '#FFFF00', color2: '#FFD700', name: 'Happy Face', unlocked: false, price: 120, inShop: true,
      render: (ctx, x, y, w, h) => {
        // Base
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.arc(x + w/2, y + h/2, Math.min(w, h)/2 - 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x + w/3, y + h/3, w/10, 0, Math.PI * 2);
        ctx.arc(x + w*2/3, y + h/3, w/10, 0, Math.PI * 2);
        ctx.fill();
        
        // Smile
        ctx.beginPath();
        ctx.arc(x + w/2, y + h/2, w/3, 0, Math.PI);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    },
    { color1: '#FFFF00', color2: '#FFD700', name: 'Cool Face', unlocked: false, price: 120, inShop: true,
      render: (ctx, x, y, w, h) => {
        // Base
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.arc(x + w/2, y + h/2, Math.min(w, h)/2 - 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Sunglasses
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + w/5, y + h/3, w*3/5, h/8);
        
        // Smile
        ctx.beginPath();
        ctx.arc(x + w/2, y + h*2/3, w/4, 0, Math.PI);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    },
    
    // Sports Series
    { color1: '#FF6600', color2: '#000000', name: 'Basketball', unlocked: false, price: 150, inShop: true,
      render: (ctx, x, y, w, h) => {
        // Base
        ctx.fillStyle = '#FF6600';
        ctx.beginPath();
        ctx.arc(x + w/2, y + h/2, Math.min(w, h)/2 - 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Lines
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        
        // Horizontal line
        ctx.beginPath();
        ctx.moveTo(x + 5, y + h/2);
        ctx.lineTo(x + w - 5, y + h/2);
        ctx.stroke();
        
        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(x + w/2, y + 5);
        ctx.lineTo(x + w/2, y + h - 5);
        ctx.stroke();
        
        // Curve lines
        ctx.beginPath();
        ctx.arc(x + w/2, y - h/3, h, 0, Math.PI, false);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(x + w/2, y + h + h/3, h, Math.PI, Math.PI * 2, false);
        ctx.stroke();
      }
    },
    { color1: '#FFFFFF', color2: '#000000', name: 'Soccer Ball', unlocked: false, price: 150, inShop: true,
      render: (ctx, x, y, w, h) => {
        // Base
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x + w/2, y + h/2, Math.min(w, h)/2 - 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Pentagon pattern
        ctx.fillStyle = '#000000';
        const centerX = x + w/2;
        const centerY = y + h/2;
        const radius = Math.min(w, h)/2 - 5;
        
        for (let i = 0; i < 5; i++) {
          const angle = i * (Math.PI * 2 / 5) - Math.PI/2;
          const px = centerX + Math.cos(angle) * radius * 0.6;
          const py = centerY + Math.sin(angle) * radius * 0.6;
          
          ctx.beginPath();
          ctx.arc(px, py, radius * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
    
    // Miscellaneous Series (filling up to 100)
    { color1: '#FF69B4', color2: '#FF1493', name: 'Bubblegum', unlocked: false, price: 110, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createRadialGradient(x + w/2, y + h/2, 0, x + w/2, y + h/2, w/2);
        g.addColorStop(0, '#FF69B4');
        g.addColorStop(1, '#FF1493');
        return g;
      }
    },
    { color1: '#000000', color2: '#C0C0C0', name: 'Vinyl Record', unlocked: false, price: 140, inShop: true,
      render: (ctx, x, y, w, h) => {
        // Base
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x + w/2, y + h/2, Math.min(w, h)/2 - 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Rings
        ctx.strokeStyle = '#C0C0C0';
        
        for (let i = 1; i <= 5; i++) {
          ctx.beginPath();
          ctx.arc(x + w/2, y + h/2, (Math.min(w, h)/2 - 5) * i/6, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        // Center hole
        ctx.fillStyle = '#C0C0C0';
        ctx.beginPath();
        ctx.arc(x + w/2, y + h/2, Math.min(w, h)/10, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    { color1: '#6495ED', color2: '#4682B4', name: 'Denim', unlocked: false, price: 120, inShop: true,
      render: (ctx, x, y, w, h) => {
        // Base
        const g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, '#6495ED');
        g.addColorStop(1, '#4682B4');
        ctx.fillStyle = g;
        ctx.fillRect(x, y, w, h);
        
        // Texture
        ctx.strokeStyle = '#4169E1';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < 10; i++) {
          ctx.beginPath();
          ctx.moveTo(x, y + i * h/10);
          ctx.lineTo(x + w, y + i * h/10 + h/15);
          ctx.stroke();
        }
        
        for (let i = 0; i < 10; i++) {
          ctx.beginPath();
          ctx.moveTo(x + i * w/10, y);
          ctx.lineTo(x + i * w/10 + w/30, y + h);
          ctx.stroke();
        }
      }
    },
    { color1: '#F0E68C', color2: '#BDB76B', name: 'Parchment', unlocked: false, price: 130, inShop: true,
      render: (ctx, x, y, w, h) => {
        // Base
        const g = ctx.createLinearGradient(x, y, x + w, y + h);
        g.addColorStop(0, '#F0E68C');
        g.addColorStop(1, '#BDB76B');
        ctx.fillStyle = g;
        ctx.fillRect(x, y, w, h);
        
        // Texture
        ctx.fillStyle = 'rgba(139, 126, 102, 0.1)';
        for (let i = 0; i < 20; i++) {
          const tx = x + Math.random() * w;
          const ty = y + Math.random() * h;
          const ts = Math.random() * 10 + 5;
          ctx.beginPath();
          ctx.arc(tx, ty, ts, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
    { color1: '#8B4513', color2: '#A0522D', name: 'Wood Grain', unlocked: false, price: 130, inShop: true,
      render: (ctx, x, y, w, h) => {
        // Base
        const g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, '#8B4513');
        g.addColorStop(1, '#A0522D');
        ctx.fillStyle = g;
        ctx.fillRect(x, y, w, h);
        
        // Grain
        ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < 15; i++) {
          ctx.beginPath();
          ctx.moveTo(x, y + i * h/15);
          
          let lastX = x;
          let lastY = y + i * h/15;
          
          for (let j = 0; j < 10; j++) {
            const newX = lastX + w/10;
            const newY = lastY + (Math.random() * 10 - 5);
            ctx.lineTo(newX, newY);
            lastX = newX;
            lastY = newY;
          }
          
          ctx.stroke();
        }
      }
    },
    { color1: '#40E0D0', color2: '#7FFFD4', name: 'Liquid', unlocked: false, price: 140, inShop: true,
      render: (ctx, x, y, w, h) => {
        // Base
        const g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, '#40E0D0');
        g.addColorStop(1, '#7FFFD4');
        ctx.fillStyle = g;
        ctx.fillRect(x, y, w, h);
        
        // Bubble pattern
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        for (let i = 0; i < 12; i++) {
          const bubbleX = x + Math.random() * w;
          const bubbleY = y + Math.random() * h;
          const bubbleSize = Math.random() * 12 + 3;
          
          ctx.beginPath();
          ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
          ctx.fill();
          
          // Bubble highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.beginPath();
          ctx.arc(bubbleX - bubbleSize/3, bubbleY - bubbleSize/3, bubbleSize/4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        }
      }
    },
    { color1: '#FFE4E1', color2: '#FFC0CB', name: 'Bubble Gum', unlocked: false, price: 110, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, '#FFE4E1');
        g.addColorStop(1, '#FFC0CB');
        return g;
      }
    },
    { color1: '#2E8B57', color2: '#3CB371', name: 'Evergreen', unlocked: false, price: 120, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, '#2E8B57');
        g.addColorStop(1, '#3CB371');
        return g;
      }
    },
    { color1: '#8B0000', color2: '#CD5C5C', name: 'Brick', unlocked: false, price: 130, inShop: true,
      render: (ctx, x, y, w, h) => {
        // Base
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(x, y, w, h);
        
        // Brick pattern
        ctx.strokeStyle = '#CD5C5C';
        ctx.lineWidth = 2;
        
        const brickHeight = h / 6;
        const brickWidth = w / 3;
        
        for (let i = 0; i < 6; i++) {
          // Horizontal lines
          ctx.beginPath();
          ctx.moveTo(x, y + i * brickHeight);
          ctx.lineTo(x + w, y + i * brickHeight);
          ctx.stroke();
          
          // Vertical lines - offset every other row
          const offset = i % 2 === 0 ? 0 : brickWidth / 2;
          
          for (let j = 0; j < 3; j++) {
            ctx.beginPath();
            ctx.moveTo(x + offset + j * brickWidth, y + i * brickHeight);
            ctx.lineTo(x + offset + j * brickWidth, y + (i + 1) * brickHeight);
            ctx.stroke();
          }
        }
      }
    },
    { color1: '#F5F5DC', color2: '#DEB887', name: 'Pebbles', unlocked: false, price: 140, inShop: true,
      render: (ctx, x, y, w, h) => {
        // Base
        ctx.fillStyle = '#F5F5DC';
        ctx.fillRect(x, y, w, h);
        
        // Pebble pattern
        for (let i = 0; i < 25; i++) {
          const pebbleX = x + Math.random() * w;
          const pebbleY = y + Math.random() * h;
          const pebbleW = Math.random() * 15 + 5;
          const pebbleH = Math.random() * 10 + 5;
          
          ctx.fillStyle = `rgba(222, 184, 135, ${Math.random() * 0.5 + 0.5})`;
          ctx.beginPath();
          ctx.ellipse(pebbleX, pebbleY, pebbleW/2, pebbleH/2, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
    { color1: '#000000', color2: '#696969', name: 'Outer Space', unlocked: false, price: 180, inShop: true,
      render: (ctx, x, y, w, h) => {
        // Base
        ctx.fillStyle = '#000000';
        ctx.fillRect(x, y, w, h);
        
        // Stars
        for (let i = 0; i < 50; i++) {
          const starX = x + Math.random() * w;
          const starY = y + Math.random() * h;
          const starSize = Math.random() * 2 + 0.5;
          
          ctx.fillStyle = Math.random() > 0.8 ? '#00FFFF' : '#FFFFFF';
          ctx.beginPath();
          ctx.arc(starX, starY, starSize, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Nebula
        ctx.globalAlpha = 0.2;
        for (let i = 0; i < 3; i++) {
          const nebulaX = x + Math.random() * w;
          const nebulaY = y + Math.random() * h;
          const nebulaSize = Math.random() * 40 + 20;
          
          ctx.fillStyle = i % 3 === 0 ? '#9370DB' : i % 3 === 1 ? '#1E90FF' : '#FF1493';
          ctx.beginPath();
          ctx.arc(nebulaX, nebulaY, nebulaSize, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    },
    { color1: '#FFD700', color2: '#8B4513', name: 'Treasure', unlocked: false, price: 200, inShop: true,
      render: (ctx, x, y, w, h) => {
        // Base - gold
        const g = ctx.createLinearGradient(x, y, x + w, y + h);
        g.addColorStop(0, '#FFD700');
        g.addColorStop(1, '#B8860B');
        ctx.fillStyle = g;
        ctx.fillRect(x, y, w, h);
        
        // Gem pattern
        const gemColors = ['#FF0000', '#0000FF', '#00FF00', '#9400D3', '#00FFFF'];
        
        for (let i = 0; i < 5; i++) {
          const gemX = x + Math.random() * (w - 20) + 10;
          const gemY = y + Math.random() * (h - 20) + 10;
          const gemSize = Math.random() * 10 + 5;
          
          ctx.fillStyle = gemColors[Math.floor(Math.random() * gemColors.length)];
          
          // Draw a diamond shape
          ctx.beginPath();
          ctx.moveTo(gemX, gemY - gemSize);
          ctx.lineTo(gemX + gemSize, gemY);
          ctx.lineTo(gemX, gemY + gemSize);
          ctx.lineTo(gemX - gemSize, gemY);
          ctx.closePath();
          ctx.fill();
          
          // Add highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.beginPath();
          ctx.moveTo(gemX, gemY - gemSize/2);
          ctx.lineTo(gemX + gemSize/4, gemY - gemSize/4);
          ctx.lineTo(gemX, gemY);
          ctx.lineTo(gemX - gemSize/4, gemY - gemSize/4);
          ctx.closePath();
          ctx.fill();
        }
      }
    },
    { color1: '#E6E6FA', color2: '#D8BFD8', name: 'Pastel Dreams', unlocked: false, price: 140, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, '#E6E6FA');
        g.addColorStop(1, '#D8BFD8');
        return g;
      },
      render: (ctx, x, y, w, h) => {
        // Base
        const g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, '#E6E6FA');
        g.addColorStop(1, '#D8BFD8');
        ctx.fillStyle = g;
        ctx.fillRect(x, y, w, h);
        
        // Pastel circles
        const colors = ['#FFB6C1', '#87CEFA', '#98FB98', '#FFFACD'];
        
        for (let i = 0; i < 8; i++) {
          const circleX = x + Math.random() * w;
          const circleY = y + Math.random() * h;
          const circleSize = Math.random() * 15 + 5;
          
          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
          ctx.globalAlpha = 0.4;
          ctx.beginPath();
          ctx.arc(circleX, circleY, circleSize, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    },
    { color1: '#8A2BE2', color2: '#4B0082', name: 'Regal', unlocked: false, price: 180, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createLinearGradient(x, y, x + w, y);
        g.addColorStop(0, '#8A2BE2');
        g.addColorStop(1, '#4B0082');
        return g;
      },
      render: (ctx, x, y, w, h) => {
        // Base
        const g = ctx.createLinearGradient(x, y, x + w, y);
        g.addColorStop(0, '#8A2BE2');
        g.addColorStop(1, '#4B0082');
        ctx.fillStyle = g;
        ctx.fillRect(x, y, w, h);
        
        // Crown pattern
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(x + w/4, y + h/2);
        ctx.lineTo(x + w/3, y + h/3);
        ctx.lineTo(x + w/2, y + h/2);
        ctx.lineTo(x + w*2/3, y + h/3);
        ctx.lineTo(x + w*3/4, y + h/2);
        ctx.lineTo(x + w*2/3, y + h*2/3);
        ctx.lineTo(x + w/3, y + h*2/3);
        ctx.closePath();
        ctx.fill();
      }
    },
    { color1: '#FFA07A', color2: '#FF7F50', name: 'Coral Reef', unlocked: false, price: 160, inShop: true,
      gradient: (ctx, x, y, w, h) => {
        const g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, '#FFA07A');
        g.addColorStop(1, '#FF7F50');
        return g;
      },
      render: (ctx, x, y, w, h) => {
        // Base
        const g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, '#FFA07A');
        g.addColorStop(1, '#FF7F50');
        ctx.fillStyle = g;
        ctx.fillRect(x, y, w, h);
        
        // Coral patterns
        ctx.fillStyle = '#FF6347';
        for (let i = 0; i < 6; i++) {
          const cx = x + Math.random() * (w - 20) + 10;
          const cy = y + h - Math.random() * 20 - 10;
          
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx - 10, cy - 20);
          ctx.lineTo(cx, cy - 30);
          ctx.lineTo(cx + 10, cy - 20);
          ctx.closePath();
          ctx.fill();
        }
        
        // Bubbles
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < 10; i++) {
          const bx = x + Math.random() * w;
          const by = y + Math.random() * h;
          const bs = Math.random() * 5 + 2;
          
          ctx.beginPath();
          ctx.arc(bx, by, bs, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
    { color1: '#FFFFFF', color2: '#87CEEB', name: 'Clouds', unlocked: false, price: 120, inShop: true,
      render: (ctx, x, y, w, h) => {
        // Sky background
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(x, y, w, h);
        
        // Cloud shapes
        ctx.fillStyle = '#FFFFFF';
        
        // Cloud 1
        ctx.beginPath();
        ctx.arc(x + w/4, y + h/3, w/8, 0, Math.PI * 2);
        ctx.arc(x + w/3, y + h/4, w/10, 0, Math.PI * 2);
        ctx.arc(x + w/6, y + h/4, w/12, 0, Math.PI * 2);
        ctx.fill();
        
        // Cloud 2
        ctx.beginPath();
        ctx.arc(x + w*2/3, y + h*2/3, w/10, 0, Math.PI * 2);
        ctx.arc(x + w*3/4, y + h*3/5, w/8, 0, Math.PI * 2);
        ctx.arc(x + w*5/6, y + h*2/3, w/12, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    
    // Premium Icon (most expensive, special effect)
    { color1: '#FFFFFF', color2: '#000000', name: 'Rainbow Prism', unlocked: false, price: 500, inShop: true,
      render: (ctx, x, y, w, h) => {
        // Create animated rainbow gradient
        const time = Date.now() / 1000;
        const g = ctx.createLinearGradient(x, y, x + w, y + h);
        
        g.addColorStop(0, `hsl(${(time * 50) % 360}, 100%, 50%)`);
        g.addColorStop(0.2, `hsl(${(time * 50 + 72) % 360}, 100%, 50%)`);
        g.addColorStop(0.4, `hsl(${(time * 50 + 144) % 360}, 100%, 50%)`);
        g.addColorStop(0.6, `hsl(${(time * 50 + 216) % 360}, 100%, 50%)`);
        g.addColorStop(0.8, `hsl(${(time * 50 + 288) % 360}, 100%, 50%)`);
        g.addColorStop(1, `hsl(${(time * 50) % 360}, 100%, 50%)`);
        
        ctx.fillStyle = g;
        ctx.fillRect(x, y, w, h);
        
        // Add prismatic effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w/2, y + h/2);
        ctx.lineTo(x, y + h);
        ctx.closePath();
        ctx.fill();
      },
      animated: true
    }
];
const VOID_THRESHOLD = 1000; // Height at which player dies
let isJumping = false;
let gameOver = false;
let gameTimer = 0;
let timerStarted = false;
let lastTime = 0;
let hasShield = false;
let hasSpeedBoost = false;
let hasDoubleJump = false;
let hasMagnet = false;
let hasInvincibility = false;
let hasCoinMultiplier = false;
let hasGravityReduction = false;
let hasBounce = false;
let powerUpTimer = 0;
let doubleJumpTimer = 0;
let magnetTimer = 0;
let invincibilityTimer = 0;
let coinMultiplierTimer = 0;
let gravityReductionTimer = 0;
let bounceTimer = 0;
let jumpTrailParticles = [];
let moveLeft = false;
let moveRight = false;
let coinCount = 0; // Initialize coin counter
let score = 0;
let highScore = loadScore();
let cameraX = 0;  // Camera position tracking
let cameraY = 0;  // Vertical camera position
let powerUps = []; // Array to store power-ups
const CAMERA_SMOOTHNESS = 0.1;  // Adjust this value to change how smooth the camera follows (0-1)
const MAGNET_RANGE = 150; // Range in pixels for coin magnet

// Platforms array and spikes
let platforms = [];
let spikes = [];
let coins = []; // Array to store coins

// Function to generate platforms dynamically
function generatePlatforms() {
    let y = canvas.height - 100;
    let x = 50; // Start at the left
    const maxJumpHeight = 120; // Maximum height player can jump
    const minGap = 100; // Minimum gap between platforms
    const maxGap = 200; // Maximum gap between platforms

    const platformTypes = [
        { type: 'normal', colors: ['#4CAF50', '#45A049'], weight: 5 }, // Normal platforms are more common
        { type: 'ice', colors: ['#87CEEB', '#5FB4EA'], weight: 2 },
        { type: 'bounce', colors: ['#FF69B4', '#FF1493'], weight: 2 },
        { type: 'speed', colors: ['#FFD700', '#FFA500'], weight: 1 },
        { type: 'break', colors: ['#808080', '#A9A9A9'], weight: 1 } // Grey breaking platforms
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

            // Weighted random platform selection
            const totalWeight = platformTypes.reduce((sum, type) => sum + type.weight, 0);
            let random = Math.random() * totalWeight;
            const randomType = platformTypes.find(type => {
                random -= type.weight;
                return random <= 0;
            });

            // Add coins with 40% chance
            if (Math.random() < 0.7) {  // Increased from 0.4 to 0.7
                coins.push({
                    x: x + Math.random() * width,
                    y: y - 30,
                    rotation: 0
                });
            }

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
    
    // Draw coin icon
    ctx.save();
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(canvas.width / 3.5, 95, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw coin count
    ctx.fillStyle = '#000';
    ctx.fillText(`${coinCount}`, canvas.width / 3.2, 100);
    ctx.restore();
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

    // Add dirt texture (random grey dots)
    for (let x = 0; x < canvas.width; x += 10) {
        for (let y = VOID_THRESHOLD; y < VOID_THRESHOLD + canvas.height; y += 10) {
            if (Math.random() < 0.3) {  // 30% chance to draw a dot
                const shade = Math.floor(Math.random() * 30) + 40;  // Random grey shade
                ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade}, 0.4)`;
                const size = Math.random() * 2 + 1;  // Random size between 1-3
                ctx.beginPath();
                ctx.arc(x + Math.random() * 5, y - cameraY + Math.random() * 5, size, 0, Math.PI * 2);
                ctx.fill();
            }
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
            alpha: 1,
            size: Math.abs(player.dy) / 4 // Trail size based on speed
        });
    }

    jumpTrailParticles.forEach((particle, index) => {
        particle.alpha -= 0.05;
        if (particle.alpha <= 0) {
            jumpTrailParticles.splice(index, 1);
        } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${particle.alpha})`;
            ctx.fillRect(particle.x - cameraX, particle.y - cameraY, particle.size, particle.size); // Use particle size
        }
    });

    ctx.save();
    ctx.translate(player.x - cameraX, player.y - cameraY);

    // Draw shield effect
    if (hasShield) {
        // Draw an animated shield bubble
        ctx.beginPath();
        ctx.arc(player.width/2, player.height/2, player.width * 0.8, 0, Math.PI * 2);
        
        // Create animated gradient for shield
        const shieldGradient = ctx.createRadialGradient(
            player.width/2, player.height/2, player.width * 0.4,
            player.width/2, player.height/2, player.width * 0.8
        );
        shieldGradient.addColorStop(0, 'rgba(0, 120, 255, 0.0)');
        shieldGradient.addColorStop(0.7, 'rgba(0, 150, 255, 0.2)');
        shieldGradient.addColorStop(1, 'rgba(0, 200, 255, 0.5)');
        
        ctx.fillStyle = shieldGradient;
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.7)';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Add shield energy ripples
        const time = Date.now() / 200;
        for (let i = 0; i < 3; i++) {
            const pulseSize = ((time + i * 2) % 10) / 10;
            if (pulseSize < 0.9) { // Don't draw when too close to edge
                ctx.beginPath();
                ctx.arc(
                    player.width/2, 
                    player.height/2, 
                    player.width * 0.4 + pulseSize * player.width * 0.4, 
                    0, 
                    Math.PI * 2
                );
                ctx.strokeStyle = `rgba(100, 200, 255, ${0.5 - pulseSize * 0.5})`;
                ctx.lineWidth = 2 - pulseSize;
                ctx.stroke();
            }
        }
    }
    
    // Draw invincibility effect
    if (hasInvincibility) {
        // Add star sparkles circling around the player
        const time = Date.now() / 100;
        const numStars = 8;
        
        for (let i = 0; i < numStars; i++) {
            const angle = (time * 0.2 + i * (Math.PI * 2 / numStars)) % (Math.PI * 2);
            const distance = player.width * 0.9 + Math.sin(time * 0.5 + i) * 5;
            
            const x = player.width/2 + Math.cos(angle) * distance;
            const y = player.height/2 + Math.sin(angle) * distance;
            
            // Draw star
            const starSize = 3 + Math.sin(time + i) * 1.5;
            
            // Draw 5-point star
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(time * 0.05 + i);
            
            ctx.beginPath();
            for (let j = 0; j < 5; j++) {
                const starAngle = j * Math.PI * 2 / 5 - Math.PI / 2;
                const starX = Math.cos(starAngle) * starSize;
                const starY = Math.sin(starAngle) * starSize;
                
                if (j === 0) {
                    ctx.moveTo(starX, starY);
                } else {
                    ctx.lineTo(starX, starY);
                }
                
                // Draw inner points of star
                const innerAngle = starAngle + Math.PI / 5;
                const innerX = Math.cos(innerAngle) * (starSize / 2.5);
                const innerY = Math.sin(innerAngle) * (starSize / 2.5);
                ctx.lineTo(innerX, innerY);
            }
            
            ctx.closePath();
            
            // Create shimmering color effect
            const hue = (time * 5 + i * 30) % 360;
            ctx.fillStyle = `hsl(${hue}, 100%, 70%)`;
            ctx.fill();
            
            ctx.restore();
        }
        
        // Add invincibility glow around player
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.beginPath();
        ctx.arc(player.width/2, player.height/2, player.width * 0.7, 0, Math.PI * 2);
        
        const invincibilityGlow = ctx.createRadialGradient(
            player.width/2, player.height/2, player.width * 0.3,
            player.width/2, player.height/2, player.width * 0.7
        );
        
        // Multi-color invincibility glow
        const timeHue = (time * 5) % 360;
        invincibilityGlow.addColorStop(0, `hsla(${timeHue}, 100%, 70%, 0.1)`);
        invincibilityGlow.addColorStop(0.7, `hsla(${(timeHue + 40) % 360}, 100%, 60%, 0.05)`);
        invincibilityGlow.addColorStop(1, `hsla(${(timeHue + 80) % 360}, 100%, 50%, 0)`);
        
        ctx.fillStyle = invincibilityGlow;
        ctx.fill();
        ctx.restore();
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

    // Body positioning
    const bodyX = (player.width - stretchWidth) / 2;
    const bodyY = (player.height - stretchHeight) / 2;
    const character = characters[selectedCharacter];
    
    // Draw shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.roundRect(
        bodyX + 4,
        bodyY + 4,
        stretchWidth,
        stretchHeight,
        10
    );
    ctx.fill();
    
    // Create gradient for player 
    let gradient;
    if (character.gradient) {
        // Use custom gradient if available
        gradient = character.gradient(ctx, bodyX, bodyY, stretchWidth, stretchHeight);
    } else {
        // Use default linear gradient
        gradient = ctx.createLinearGradient(0, 0, 0, stretchHeight);
        gradient.addColorStop(0, character.color1);
        gradient.addColorStop(1, character.color2);
    }

    // Draw main body with rounded corners, shading and highlights
    ctx.beginPath();
    ctx.roundRect(
        bodyX,
        bodyY,
        stretchWidth,
        stretchHeight,
        10
    );
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Add border/outline
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Add a shine effect at the top
    const shineGradient = ctx.createLinearGradient(
        bodyX, 
        bodyY, 
        bodyX, 
        bodyY + stretchHeight * 0.3);
    shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
    shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.beginPath();
    ctx.roundRect(
        bodyX + 2,
        bodyY + 2,
        stretchWidth - 4,
        stretchHeight * 0.25,
        7
    );
    ctx.fillStyle = shineGradient;
    ctx.fill();
    
    // Draw the character's expression using the emotion system
    drawCharacterExpression(ctx, bodyX, bodyY, stretchWidth, stretchHeight, player);
    
    // Add character-specific details based on type
    if (character.name === 'Lava Cube') {
        // Draw flame particles on top
        for (let i = 0; i < 3; i++) {
            const flameX = bodyX + stretchWidth * (0.25 + 0.25 * i);
            const flameHeight = Math.sin(Date.now() / 200 + i * 2) * 5 + 10;
            
            const flameGradient = ctx.createLinearGradient(0, bodyY - flameHeight, 0, bodyY);
            flameGradient.addColorStop(0, 'rgba(255, 255, 0, 0.7)');
            flameGradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
            
            ctx.fillStyle = flameGradient;
            ctx.beginPath();
            ctx.moveTo(flameX - 5, bodyY);
            ctx.quadraticCurveTo(flameX, bodyY - flameHeight * 2, flameX + 5, bodyY);
            ctx.fill();
        }
    } else if (character.name === 'Water Cube') {
        // Draw water droplets
        ctx.fillStyle = 'rgba(100, 200, 255, 0.5)';
        for (let i = 0; i < 2; i++) {
            const dropX = bodyX + stretchWidth * (0.3 + 0.4 * i);
            const dropY = bodyY + stretchHeight * 0.9;
            const dropSize = 4 + Math.sin(Date.now() / 300 + i * 2) * 2;
            
            ctx.beginPath();
            ctx.arc(dropX, dropY, dropSize, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (character.name === 'Galaxy Cube') {
        // Add star particles
        for (let i = 0; i < 5; i++) {
            const starX = bodyX + Math.random() * stretchWidth;
            const starY = bodyY + Math.random() * stretchHeight;
            const starSize = Math.random() * 2 + 1;
            
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.7 + 0.3})`;
            ctx.beginPath();
            ctx.arc(starX, starY, starSize, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (character.name === 'Magic Cube') {
        // Add magic sparkles
        for (let i = 0; i < 3; i++) {
            const sparkleX = bodyX + stretchWidth * (0.25 + 0.25 * i);
            const sparkleY = bodyY + stretchHeight * (0.2 + 0.3 * i);
            const sparkleSize = 3 + Math.sin(Date.now() / 200 + i * 2) * 2;
            
            ctx.fillStyle = `hsl(${(Date.now() / 30 + i * 40) % 360}, 100%, 70%)`;
            ctx.beginPath();
            ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (character.name === 'Gold Cube') {
        // Add gold shine effect
        const shineAngle = Date.now() / 500;
        const shineX = bodyX + stretchWidth/2 + Math.cos(shineAngle) * (stretchWidth/3);
        const shineY = bodyY + stretchHeight/2 + Math.sin(shineAngle) * (stretchHeight/3);
        
        ctx.fillStyle = 'rgba(255, 255, 200, 0.8)';
        ctx.beginPath();
        ctx.arc(shineX, shineY, 4, 0, Math.PI * 2);
        ctx.fill();
    }

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
    // Apply dev options
    const speedMultiplier = devOptions.tenXSpeed ? 10 : 1;
    
    // Smooth horizontal movement with acceleration
    if (moveLeft) {
        player.dx -= player.acceleration * speedMultiplier;
        player.dx = Math.max(player.dx, -player.maxSpeed * speedMultiplier);
    } else if (moveRight) {
        player.dx += player.acceleration * speedMultiplier;
        player.dx = Math.min(player.dx, player.maxSpeed * speedMultiplier);
    } else {
        // Apply friction when not moving
        player.dx *= player.friction;
    }

    // Stop tiny sliding
    if (Math.abs(player.dx) < 0.1) player.dx = 0;

    // Apply gravity with smoothing (unless disabled in dev menu)
    if (!devOptions.noGravity) {
        // Apply reduced gravity if power-up is active
        let gravityModifier = 0.9;
        if (hasGravityReduction) {
            gravityModifier = 0.4; // 60% reduction in gravity
        }
        player.dy += gravity * gravityModifier;
        player.dy *= 0.99; // Slight air resistance
    }

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
// Function to save game state
// Function to save current score to high scores list
function saveScore(score) {
    // Check if this is a new high score
    newHighScoreAchieved = score > highScore;
    
    // Save current high score for backward compatibility
    localStorage.setItem('highScore', score.toString());
    localStorage.setItem('coins', coinCount.toString());
    
    // Save unlocked characters
    const unlockedStates = characters.map(char => char.unlocked);
    localStorage.setItem('unlockedCharacters', JSON.stringify(unlockedStates));
    
    // Save to high scores list
    let highScores = [];
    const savedHighScores = localStorage.getItem('highScoresList');
    
    if (savedHighScores) {
        highScores = JSON.parse(savedHighScores);
    }
    
    // Add current score with date
    const currentDate = new Date();
    const dateString = `${currentDate.getMonth()+1}/${currentDate.getDate()}/${currentDate.getFullYear()}`;
    
    // Create score entry with character name
    const scoreEntry = {
        score: score,
        date: dateString,
        character: characters[selectedCharacter].name,
        coins: coinCount,
        timestamp: Date.now()
    };
    
    // Add new score and sort
    highScores.push(scoreEntry);
    highScores.sort((a, b) => b.score - a.score);
    
    // Keep only top 10 scores
    if (highScores.length > 10) {
        highScores = highScores.slice(0, 10);
    }
    
    // Update high scores list global variable for display
    highScoresList = highScores;
    
    // Save back to localStorage
    localStorage.setItem('highScoresList', JSON.stringify(highScores));
    
    // Return the score entry for potential sharing
    return scoreEntry;
}

// Function to load game state and high scores
function loadScore() {
    const savedScore = localStorage.getItem('highScore');
    const savedCoins = localStorage.getItem('coins');
    const savedCharacters = localStorage.getItem('unlockedCharacters');
    
    coinCount = savedCoins ? parseInt(savedCoins) : 0;
    
    // Load unlocked characters
    if (savedCharacters) {
        const unlockedStates = JSON.parse(savedCharacters);
        unlockedStates.forEach((isUnlocked, index) => {
            if (index < characters.length) {
                characters[index].unlocked = isUnlocked;
            }
        });
    }
    
    // Initialize global highScoresList
    const savedHighScores = localStorage.getItem('highScoresList');
    if (savedHighScores) {
        highScoresList = JSON.parse(savedHighScores);
    }
    
    return savedScore ? parseInt(savedScore) : 0;
}

// Function to show score share prompt after game over
function drawSharePrompt() {
    // Semi-transparent background with background effects
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add decorative background
    const gradient = ctx.createRadialGradient(
        canvas.width/2, canvas.height/2, 50, 
        canvas.width/2, canvas.height/2, canvas.height
    );
    gradient.addColorStop(0, 'rgba(50, 50, 100, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add animated particles in background
    const time = Date.now();
    for (let i = 0; i < 30; i++) {
        const baseX = canvas.width * (i % 10) / 10;
        const baseY = canvas.height * Math.floor(i / 10) / 3;
        const offsetX = Math.sin(time / 2000 + i * 0.3) * 50;
        const offsetY = Math.cos(time / 2500 + i * 0.2) * 30;
        const x = baseX + offsetX;
        const y = baseY + offsetY;
        
        const size = 1 + Math.sin(time / 1000 + i) * 1.5;
        const alpha = 0.2 + Math.sin(time / 700 + i * 0.5) * 0.1;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Game over text with glow
    ctx.shadowColor = 'rgba(255, 0, 0, 0.7)';
    ctx.shadowBlur = 15;
    ctx.fillStyle = 'white';
    ctx.font = '40px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, 100);
    ctx.shadowBlur = 0;
    
    // Score container with background
    ctx.fillStyle = 'rgba(50, 50, 100, 0.4)';
    ctx.fillRect(canvas.width/2 - 200, 130, 400, 80);
    
    // Score outline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(canvas.width/2 - 200, 130, 400, 80);
    
    // Show final score
    ctx.fillStyle = 'white';
    ctx.font = '30px "Press Start 2P"';
    ctx.fillText(`Score: ${score}`, canvas.width / 2, 180);
    
    // Add celebratory message if it's a high score
    if (newHighScoreAchieved) {
        // High score ribbon
        ctx.save();
        ctx.translate(canvas.width / 2, 240);
        
        // Ribbon banner
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(-180, -20);
        ctx.lineTo(180, -20);
        ctx.lineTo(200, 0);
        ctx.lineTo(180, 20);
        ctx.lineTo(-180, 20);
        ctx.lineTo(-200, 0);
        ctx.closePath();
        ctx.fill();
        
        // Banner shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 5;
        
        // High score text
        ctx.fillStyle = '#800000';
        ctx.font = '25px "Press Start 2P"';
        ctx.fillText('NEW HIGH SCORE!', 0, 7);
        ctx.restore();
        
        // Animated sparkles around the text
        const sparkleTime = Date.now() / 200;
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 + sparkleTime;
            const dist = 220 + Math.sin(sparkleTime * 2 + i) * 15;
            const x = canvas.width / 2 + Math.cos(angle) * dist;
            const y = 240 + Math.sin(angle) * 30;
            
            const size = 3 + Math.sin(sparkleTime * 3 + i * 0.7) * 2;
            
            // Create a star shape
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(sparkleTime / 2 + i);
            
            ctx.fillStyle = `rgba(255, 215, 0, ${0.6 + Math.sin(sparkleTime + i) * 0.4})`;
            ctx.beginPath();
            for (let j = 0; j < 5; j++) {
                const starAngle = (j * 2 * Math.PI / 5) - Math.PI / 2;
                const innerAngle = starAngle + Math.PI / 5;
                const outerRadius = size * 2;
                const innerRadius = size;
                
                const outerX = Math.cos(starAngle) * outerRadius;
                const outerY = Math.sin(starAngle) * outerRadius;
                
                const innerX = Math.cos(innerAngle) * innerRadius;
                const innerY = Math.sin(innerAngle) * innerRadius;
                
                if (j === 0) {
                    ctx.moveTo(outerX, outerY);
                } else {
                    ctx.lineTo(outerX, outerY);
                }
                
                ctx.lineTo(innerX, innerY);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }
    
    // Social sharing title
    ctx.fillStyle = 'white';
    ctx.font = '22px "Press Start 2P"';
    ctx.fillText('Share your achievement!', canvas.width / 2, 320);
    
    // Social media sharing grid
    const shareLinks = generateShareURL({
        score: score,
        character: characters[selectedCharacter].name,
        date: new Date().toLocaleDateString()
    });
    
    const iconsPerRow = 3;
    const buttonSize = 90;
    const buttonMargin = 20;
    const startX = canvas.width/2 - ((buttonSize * iconsPerRow) + buttonMargin * (iconsPerRow - 1))/2;
    const startY = 350;
    
    const platformData = [
        { name: 'Twitter', color: '#1DA1F2', icon: '🐦', link: shareLinks.twitter },
        { name: 'Facebook', color: '#4267B2', icon: 'f', link: shareLinks.facebook },
        { name: 'LinkedIn', color: '#0077B5', icon: 'in', link: shareLinks.linkedin },
        { name: 'Reddit', color: '#FF4500', icon: '🔄', link: shareLinks.reddit },
        { name: 'WhatsApp', color: '#25D366', icon: '💬', link: shareLinks.whatsapp },
        { name: 'Copy Link', color: '#6c757d', icon: '🔗', link: null }
    ];
    
    // Draw social buttons in a grid
    for (let i = 0; i < platformData.length; i++) {
        const row = Math.floor(i / iconsPerRow);
        const col = i % iconsPerRow;
        
        const x = startX + (buttonSize + buttonMargin) * col;
        const y = startY + (buttonSize + buttonMargin) * row;
        
        const platform = platformData[i];
        
        // Button background with rounded corners
        ctx.fillStyle = platform.color;
        ctx.beginPath();
        ctx.roundRect(x, y, buttonSize, buttonSize, 10);
        ctx.fill();
        
        // Platform icon
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.fillText(platform.icon, x + buttonSize/2, y + buttonSize/2 - 5);
        
        // Platform name
        ctx.font = '12px "Press Start 2P"';
        ctx.fillText(platform.name, x + buttonSize/2, y + buttonSize - 12);
    }
    
    // Play again button
    const buttonWidth = 250;
    const buttonHeight = 50;
    const buttonX = canvas.width / 2 - buttonWidth / 2;
    const buttonY = startY + Math.ceil(platformData.length / iconsPerRow) * (buttonSize + buttonMargin) + 30;
    
    // Button with glow effect
    const pulseAmount = Math.sin(Date.now() / 400) * 0.2;
    const buttonColor = `rgba(40, 167, 69, ${0.8 + pulseAmount})`;
    
    // Draw play again button with subtle animation
    ctx.fillStyle = buttonColor;
    ctx.beginPath();
    ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
    ctx.fill();
    
    // Add inner glow
    const buttonGlow = ctx.createLinearGradient(buttonX, buttonY, buttonX, buttonY + buttonHeight);
    buttonGlow.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    buttonGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = buttonGlow;
    ctx.beginPath();
    ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight/2, [10, 10, 0, 0]);
    ctx.fill();
    
    ctx.fillStyle = 'white';
    ctx.font = '18px "Press Start 2P"';
    ctx.fillText('Play Again', canvas.width / 2, buttonY + 32);
}

function resetGame() {
    let scoreAtReset = score;
    let isHighScore = scoreAtReset > highScore;
    
    // Handle score saving and high score checks
    if (isHighScore) {
        highScore = scoreAtReset;
        const savedScoreEntry = saveScore(highScore);
        selectedScoreForSharing = savedScoreEntry;
        
        // Show share prompt if it's a new high score and score is significant
        if (scoreAtReset > 100) {
            gameState = 'sharePrompt';
            return; // Don't reset game yet, wait for user to choose from share prompt
        }
    } else {
        // Regular save (not a high score)
        saveScore(scoreAtReset);
    }
    
    // Continue with regular reset
    platforms = [];
    generatePlatforms();
    score = 0;
    gameTimer = 0;
    timerStarted = false;
    spikes = [];
    coins = []; // Reset coins
    coinCount = 0; // Reset coin counter
    player.x = platforms[0].x;
    player.y = platforms[0].y - playerHeight;
    player.dx = 0;
    player.dy = 0;
    cameraX = 0;
    cameraY = 0;
    gameOver = false;
    gameState = 'home'; // Return to home screen
    newHighScoreAchieved = false;
}

// Function to detect collision with platforms
function detectCollision() {
    let onGround = false;
    let touchingPlatform = false;

    // Handle platform effects and collisions
    platforms.forEach(platform => {
        // Get the overlap amounts
        const overlapX = Math.min(player.x + player.width - platform.x, platform.x + platform.width - player.x);
        const overlapY = Math.min(player.y + player.height - platform.y, platform.y + platform.height - player.y);

        // Check if there's any overlap at all
        if (overlapX > 0 && overlapY > 0) {
            // Determine if collision is from top/bottom or sides
            if (overlapX > overlapY) {
                // Top/bottom collision
                if (player.y < platform.y) {
                    // Player is above platform
                    player.y = platform.y - player.height;
                    player.dy = 0;
                    onGround = true;
                    touchingPlatform = true;
                }
            } else {
                // Side collision
                if (player.x < platform.x) {
                    // Player is to the left of platform
                    player.x = platform.x - player.width;
                    player.dx = 0;
                } else {
                    // Player is to the right of platform
                    player.x = platform.x + platform.width;
                    player.dx = 0;
                }
            }

            // Apply platform effects
            switch(platform.type) {
                case 'ice':
                    player.friction = 0.92; // Less slippery than before (was 0.99)
                    break;
                case 'bounce':
                    // Apply super bounce if power-up is active
                    player.dy = hasBounce ? -30 : -20; // Extra bounce with power-up or normal
                    
                    // Create bounce effect particles
                    const bounceColor = hasBounce ? '#FF1493' : '#FF69B4'; // Brighter for power-up bounce
                    for (let i = 0; i < (hasBounce ? 20 : 10); i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const speed = Math.random() * 4 + 2;
                        particles.push({
                            x: player.x + player.width / 2,
                            y: player.y + player.height,
                            dx: Math.cos(angle) * speed,
                            dy: Math.sin(angle) * speed - (hasBounce ? 4 : 2),
                            radius: Math.random() * 3 + 2,
                            color: bounceColor,
                            alpha: 1,
                            life: 0.8,
                            gravity: 0.05
                        });
                    }
                    break;
                case 'speed':
                    player.maxSpeed = 10; // Reduced speed boost (was 12)
                    setTimeout(() => player.maxSpeed = 8, 1000);
                    break;
                case 'break':
                    if (!platform.breaking) {
                        platform.breaking = true;
                        platform.breakTimer = 30; // About 0.5 seconds at 60fps
                        // Change color to indicate breaking
                        platform.colors = ['#ff4444', '#cc0000'];
                    }
                    break;
                default: // normal platform
                    player.friction = 0.85; // Reset friction
                    break;
            }
        }
    });

    // Remove old collision check as it's now handled above
    if (onGround) {
        isJumping = false;
        player.jumpsLeft = 2;
    } else if (!touchingPlatform && player.jumpsLeft === 2) {
        player.jumpsLeft = 1;
    }

    // Check spike collisions
    spikes.forEach(spike => {
        const playerRight = player.x + player.width;
        const playerBottom = player.y + player.height;
        const spikeRight = spike.x + 30;
        const spikeBottom = spike.y + 15;

        // Only check collision if player is above or at same level as spike
        if (player.y + player.height <= spike.y + 5 && 
            player.x < spikeRight &&
            playerRight > spike.x &&
            playerBottom > spike.y) {
            console.log("You've touched a spike");
            // Player is protected if they have shield or invincibility
            if (!hasShield && !hasInvincibility) {
                gameOver = true;
                resetGame();
            } else {
                // Create effect particles to show shield/invincibility protection
                const protectionColor = hasInvincibility ? '#FFD700' : '#0080FF';
                for (let i = 0; i < 10; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    particles.push({
                        x: player.x + player.width / 2,
                        y: player.y + player.height / 2,
                        dx: Math.cos(angle) * 4,
                        dy: Math.sin(angle) * 4,
                        radius: Math.random() * 3 + 2,
                        color: protectionColor,
                        alpha: 1,
                        life: 0.7,
                        gravity: 0
                    });
                }
            }
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
    // Regular double jump logic
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
    // Special triple jump with power-up
    else if (hasDoubleJump && player.jumpsLeft === 0) {
        createParticles();
        isJumping = true;
        
        // Extra jump with the double jump power-up
        player.dy = -15;  // Slightly stronger than second jump
        
        // Create special effect for double jump power-up use
        for (let i = 0; i < 15; i++) {
            const angle = (i / 15) * Math.PI * 2;
            const speed = 3;
            particles.push({
                x: player.x + player.width / 2,
                y: player.y + player.height,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed,
                radius: Math.random() * 3 + 2,
                color: '#32CD32', // Lime green color for double jump particles
                alpha: 1,
                gravity: 0.1
            });
        }
        
        // Play a special sound for power-up jump
        playSound('doubleJump');
    }
}

// Infinite level logic: generate new platforms as player moves right
function updatePlatforms() {
    // Update breaking platforms
    platforms.forEach(platform => {
        if (platform.breaking) {
            platform.breakTimer--;
            if (platform.breakTimer <= 0) {
                platforms = platforms.filter(p => p !== platform);
            }
        }
    });
    
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
            { type: 'normal', colors: ['#4CAF50', '#45A049'], weight: 5 }, // Normal platforms are more common
            { type: 'ice', colors: ['#87CEEB', '#5FB4EA'], weight: 2 },
            { type: 'bounce', colors: ['#FF69B4', '#FF1493'], weight: 2 },
            { type: 'speed', colors: ['#FFD700', '#FFA500'], weight: 1 },
            { type: 'break', colors: ['#808080', '#A9A9A9'], weight: 1 } // Grey breaking platforms
        ];

        // Weighted random platform selection
        const totalWeight = platformTypes.reduce((sum, type) => sum + type.weight, 0);
        let random = Math.random() * totalWeight;
        const randomType = platformTypes.find(type => {
            random -= type.weight;
            return random <= 0;
        });

        platforms.push({ x, y: newY, width, height: 20, type: randomType.type, colors: randomType.colors });

        // Add coins with 40% chance
        if (Math.random() < 0.4) {
            coins.push({
                x: x + Math.random() * width,
                y: newY - 30,
                rotation: 0
            });
        }

        // Add power-ups with guaranteed spawn rate and minimum spacing
        const minSafeDistance = 500; // Minimum distance from player
        const lastPowerUp = powerUps[powerUps.length - 1];
        const minPowerUpSpacing = 800; // Minimum distance between power-ups
        
        if ((x - player.x) > minSafeDistance && 
            (!lastPowerUp || (x - lastPowerUp.x) > minPowerUpSpacing)) {
            
            // Randomize power-up type with different weights
            const powerUpTypes = [
                { type: 'shield', weight: 15 },          // 15% chance
                { type: 'speed', weight: 15 },           // 15% chance
                { type: 'doubleJump', weight: 15 },      // 15% chance
                { type: 'magnet', weight: 15 },          // 15% chance
                { type: 'invincibility', weight: 10 },   // 10% chance (rare as it's powerful)
                { type: 'coinMultiplier', weight: 10 },  // 10% chance
                { type: 'gravityReduction', weight: 10 }, // 10% chance
                { type: 'bounce', weight: 10 }           // 10% chance
            ];
            
            // Weighted random selection
            const totalWeight = powerUpTypes.reduce((sum, powerUp) => sum + powerUp.weight, 0);
            let random = Math.random() * totalWeight;
            const selectedPowerUp = powerUpTypes.find(powerUp => {
                random -= powerUp.weight;
                return random <= 0;
            });
            
            powerUps.push({
                x: x + (width / 2),
                y: newY - 30,
                type: selectedPowerUp.type
            });
        }
        
        // Spikes spawn separately with 20% chance
        if (Math.random() < 0.2) {
            spikes.push({
                x: x + (width / 2) - 15,
                y: newY
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

function drawDevMenu() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = '40px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('DEV MENU', canvas.width / 2, 100);

    const options = [
        { text: '10x Score: ' + (devOptions.tenXScore ? 'ON' : 'OFF'), key: 'tenXScore' },
        { text: '10x Coin: ' + (devOptions.tenXCoin ? 'ON' : 'OFF'), key: 'tenXCoin' },
        { text: 'Unlock All: ' + (devOptions.unlockAll ? 'ON' : 'OFF'), key: 'unlockAll' },
        { text: '10x Speed: ' + (devOptions.tenXSpeed ? 'ON' : 'OFF'), key: 'tenXSpeed' },
        { text: 'No Gravity: ' + (devOptions.noGravity ? 'ON' : 'OFF'), key: 'noGravity' }
    ];

    ctx.font = '20px "Press Start 2P"';
    options.forEach((option, index) => {
        const y = canvas.height / 2 - 100 + index * 60;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(canvas.width / 2 - 200, y - 25, 400, 50);
        ctx.fillStyle = 'white';
        ctx.fillText(option.text, canvas.width / 2, y + 10);
    });

    ctx.font = '16px "Press Start 2P"';
    ctx.fillText('Press O to return', canvas.width / 2, canvas.height - 50);
}

function drawPauseMenu() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (showHighScores) {
        drawHighScoresScreen();
        return;
    }

    ctx.fillStyle = 'white';
    ctx.font = '40px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2 - 100);

    ctx.font = '20px "Press Start 2P"';
    ctx.fillText('Press ESC to Resume', canvas.width / 2, canvas.height / 2);

    // Draw high scores button
    const highScoresButtonY = canvas.height / 2 + 50;
    const buttonWidth = 300;
    const buttonHeight = 40;
    const buttonX = canvas.width / 2 - buttonWidth / 2;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(buttonX, highScoresButtonY, buttonWidth, buttonHeight);

    ctx.fillStyle = 'white';
    ctx.font = '16px "Press Start 2P"';
    ctx.fillText('HIGH SCORES', canvas.width / 2, highScoresButtonY + 25);

    // Draw mobile controls toggle button
    const mobileButtonY = canvas.height / 2 + 110;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(buttonX, mobileButtonY, buttonWidth, buttonHeight);

    ctx.fillStyle = 'white';
    ctx.font = '16px "Press Start 2P"';
    ctx.fillText('Mobile Controls: ' + (showMobileControls ? 'ON' : 'OFF'), canvas.width / 2, mobileButtonY + 25);
}

// Global variables for sharing
// These are already declared at the top of the file

// Function to generate a share URL with score information
function generateShareURL(score) {
    const baseURL = window.location.href.split('?')[0]; // Remove any existing query params
    const shareText = `I scored ${score.score} points with ${score.character} in Platform Runner! Can you beat my score?`;
    const encodedText = encodeURIComponent(shareText);
    const encodedURL = encodeURIComponent(baseURL);
    
    // Create a URL with score data embedded as query parameters
    const gameURL = `${baseURL}?score=${score.score}&character=${encodeURIComponent(score.character)}`;
    const encodedGameURL = encodeURIComponent(gameURL);
    
    // Generate hash tag for social media
    const hashTags = encodeURIComponent('PlatformRunner,HighScore,Gaming');
    
    return {
        twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedGameURL}&hashtags=${hashTags}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedGameURL}&quote=${encodedText}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedGameURL}&title=${encodeURIComponent('Platform Runner High Score')}`,
        reddit: `https://www.reddit.com/submit?url=${encodedGameURL}&title=${encodedText}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedGameURL}`,
        telegram: `https://t.me/share/url?url=${encodedGameURL}&text=${encodedText}`,
        email: `mailto:?subject=${encodeURIComponent('My Platform Runner Score!')}&body=${encodedText}%0A%0AClick here to try: ${encodedGameURL}`,
        shareText: shareText,
        gameURL: gameURL
    };
}

// Function to copy text to clipboard
function copyToClipboard(text) {
    // Create a temporary textarea element
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    
    // Execute copy command
    try {
        document.execCommand('copy');
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
    
    // Clean up
    document.body.removeChild(textArea);
}

// Function to draw the high scores screen with share buttons
function drawHighScoresScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw share overlay if active
    if (showShareOptions && selectedScoreForSharing) {
        drawShareOverlay(selectedScoreForSharing);
        return;
    }

    ctx.fillStyle = 'white';
    ctx.font = '40px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('HIGH SCORES', canvas.width / 2, 80);

    // Add decorative elements
    const timeNow = Date.now() / 500;
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const radius = 250 + Math.sin(timeNow) * 20;
    ctx.arc(canvas.width / 2, 80, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw table header
    const headerY = 140;
    ctx.font = '18px "Press Start 2P"';
    ctx.fillStyle = '#FFD700'; // Gold color for header
    ctx.textAlign = 'left';
    ctx.fillText('RANK', 50, headerY);
    ctx.fillText('SCORE', 150, headerY);
    ctx.fillText('CHARACTER', 300, headerY);
    ctx.fillText('DATE', canvas.width - 200, headerY);

    // Draw horizontal line below header
    ctx.strokeStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(40, headerY + 10);
    ctx.lineTo(canvas.width - 40, headerY + 10);
    ctx.stroke();

    // Draw high scores
    const startY = headerY + 50;
    const rowHeight = 40;
    
    if (highScoresList.length === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '16px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('No scores yet! Start playing to set records.', canvas.width / 2, startY + 50);
    } else {
        highScoresList.forEach((score, index) => {
            const y = startY + index * rowHeight;
            
            // Skip if row would be off-screen
            if (y > canvas.height - 100) return;
            
            // Highlight current player's scores
            if (score.character === characters[selectedCharacter].name) {
                ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
                ctx.fillRect(40, y - 20, canvas.width - 80, rowHeight);
            }
            
            // Draw rank with medal for top 3
            ctx.textAlign = 'left';
            ctx.fillStyle = index < 3 ? ['#FFD700', '#C0C0C0', '#CD7F32'][index] : 'white';
            ctx.font = index < 3 ? 'bold 18px "Press Start 2P"' : '18px "Press Start 2P"';
            ctx.fillText(`${index + 1}`, 50, y);
            
            // Draw score
            ctx.fillStyle = 'white';
            ctx.font = '18px "Press Start 2P"';
            ctx.fillText(`${score.score}`, 150, y);
            
            // Draw character
            ctx.fillText(`${score.character}`, 300, y);
            
            // Draw date
            ctx.fillText(`${score.date}`, canvas.width - 200, y);
            
            // Draw share button
            const shareButtonX = canvas.width - 70;
            ctx.fillStyle = 'rgba(59, 89, 152, 0.8)'; // Facebook blue
            ctx.fillRect(shareButtonX, y - 18, 30, 30);
            
            // Draw share icon
            ctx.fillStyle = 'white';
            ctx.font = '16px "Arial"'; // Using Arial for the share icon
            ctx.textAlign = 'center';
            ctx.fillText('↗', shareButtonX + 15, y);
        });
    }

    // Back button
    const buttonWidth = 200;
    const buttonHeight = 50;
    const buttonX = canvas.width / 2 - buttonWidth / 2;
    const buttonY = canvas.height - 80;

    // Draw button with pulsing effect
    const pulseAmount = Math.sin(Date.now() / 200) * 3;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(buttonX - pulseAmount, buttonY - pulseAmount, 
                buttonWidth + pulseAmount * 2, buttonHeight + pulseAmount * 2);

    ctx.fillStyle = 'white';
    ctx.font = '18px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('BACK', canvas.width / 2, buttonY + 30);
}

// Function to draw the sharing overlay
function drawShareOverlay(score) {
    // Semi-transparent background with gradients for aesthetic appeal
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add decorative background elements
    const gradient = ctx.createRadialGradient(
        canvas.width/2, canvas.height/2, 50, 
        canvas.width/2, canvas.height/2, 400
    );
    gradient.addColorStop(0, 'rgba(50, 50, 100, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add animated stars in background
    const time = Date.now() / 1000;
    for (let i = 0; i < 20; i++) {
        const x = canvas.width * (0.1 + (i * 0.9) % 0.8);
        const y = canvas.height * ((i * 0.7) % 0.7 + 0.1);
        const size = 1 + Math.sin(time + i) * 2;
        const alpha = 0.2 + Math.sin(time * 2 + i) * 0.1;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Title with glow effect
    ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
    ctx.shadowBlur = 15;
    ctx.fillStyle = 'white';
    ctx.font = '30px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('SHARE YOUR SCORE', canvas.width / 2, 80);
    ctx.shadowBlur = 0;
    
    // Score details with highlight box
    ctx.fillStyle = 'rgba(50, 50, 100, 0.4)';
    ctx.fillRect(canvas.width/2 - 250, 110, 500, 130);
    
    // Outline for score details
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(canvas.width/2 - 250, 110, 500, 130);
    
    ctx.fillStyle = 'white';
    ctx.font = '20px "Press Start 2P"';
    ctx.fillText(`Score: ${score.score}`, canvas.width / 2, 150);
    ctx.fillText(`Character: ${score.character}`, canvas.width / 2, 190);
    ctx.fillText(`Date: ${score.date}`, canvas.width / 2, 230);
    
    const shareLinks = generateShareURL(score);
    
    // Social media icons with grid layout
    const iconsPerRow = 2;
    const buttonSize = 120;
    const buttonMargin = 20;
    const startX = canvas.width/2 - ((buttonSize * iconsPerRow) + buttonMargin * (iconsPerRow - 1))/2;
    const startY = 280;
    const platformData = [
        { name: 'Twitter', color: '#1DA1F2', icon: '🐦' },
        { name: 'Facebook', color: '#4267B2', icon: 'f' },
        { name: 'LinkedIn', color: '#0077B5', icon: 'in' },
        { name: 'Reddit', color: '#FF4500', icon: '🔄' },
        { name: 'WhatsApp', color: '#25D366', icon: '💬' },
        { name: 'Telegram', color: '#0088cc', icon: '📤' }
    ];
    
    // Add QR code for score
    ctx.fillStyle = 'white';
    ctx.fillRect(canvas.width - 150, 20, 120, 120);
    
    // Draw "fake" QR code pattern (simulated)
    ctx.fillStyle = 'black';
    ctx.fillRect(canvas.width - 140, 30, 100, 100);
    
    // Draw QR code elements
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
            if (Math.random() > 0.6 && !(i < 2 && j < 2) && !(i < 2 && j > 4) && !(i > 4 && j < 2)) {
                ctx.fillStyle = 'white';
                ctx.fillRect(canvas.width - 138 + i*14, 32 + j*14, 12, 12);
            }
        }
    }
    
    // QR corner squares
    ctx.fillStyle = 'white';
    ctx.fillRect(canvas.width - 134, 34, 28, 28);
    ctx.fillRect(canvas.width - 134, 98, 28, 28);
    ctx.fillRect(canvas.width - 74, 34, 28, 28);
    
    ctx.fillStyle = 'black';
    ctx.fillRect(canvas.width - 130, 38, 20, 20);
    ctx.fillRect(canvas.width - 130, 102, 20, 20);
    ctx.fillRect(canvas.width - 70, 38, 20, 20);
    
    // QR Label
    ctx.fillStyle = 'black';
    ctx.font = '12px "Press Start 2P"';
    ctx.fillText('SHARE', canvas.width - 90, 150);
    
    // Draw share platforms in a grid
    for (let i = 0; i < platformData.length; i++) {
        const row = Math.floor(i / iconsPerRow);
        const col = i % iconsPerRow;
        
        const platform = platformData[i];
        const x = startX + (buttonSize + buttonMargin) * col;
        const y = startY + (buttonSize + buttonMargin) * row;
        
        // Platform icon
        ctx.fillStyle = platform.color;
        ctx.beginPath();
        ctx.roundRect(x, y, buttonSize, buttonSize, 15);
        ctx.fill();
        
        // Icon text
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.fillText(platform.icon, x + buttonSize/2, y + buttonSize/2 - 5);
        
        // Platform name
        ctx.font = '14px "Press Start 2P"';
        ctx.fillText(platform.name, x + buttonSize/2, y + buttonSize - 15);
    }
    
    // Copy link button
    const copyY = startY + Math.ceil(platformData.length / iconsPerRow) * (buttonSize + buttonMargin) + 20;
    ctx.fillStyle = '#6c757d';
    ctx.beginPath();
    ctx.roundRect(canvas.width/2 - 150, copyY, 300, 50, 10);
    ctx.fill();
    
    ctx.fillStyle = 'white';
    ctx.font = '16px "Press Start 2P"';
    ctx.fillText('Copy Link', canvas.width/2, copyY + 30);
    
    // Cancel button with hover effect
    const cancelY = copyY + 70;
    
    // Button glow effect
    const pulseAmount = Math.sin(Date.now() / 300) * 0.2;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + pulseAmount})`;
    ctx.beginPath();
    ctx.roundRect(canvas.width/2 - 100, cancelY, 200, 50, 10);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(canvas.width/2 - 100, cancelY, 200, 50, 10);
    ctx.stroke();
    
    ctx.fillStyle = 'white';
    ctx.font = '16px "Press Start 2P"';
    ctx.fillText('Close', canvas.width/2, cancelY + 30);
}

// Add state for pagination
let currentShopPage = 0;
let currentHomePage = 0;
const iconsPerPage = 12; // 3x4 grid for shop
const charsPerHomePage = 6; // Number of characters to show per home screen page

function drawShop() {
    // Make sure currentShopPage doesn't exceed the valid range
    const totalPages = Math.ceil(characters.length / iconsPerPage);
    if (currentShopPage >= totalPages) {
        currentShopPage = totalPages - 1;
    }
    if (currentShopPage < 0) {
        currentShopPage = 0;
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = '40px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('SHOP', canvas.width / 2, 100);
    
    ctx.font = '20px "Press Start 2P"';
    ctx.fillText(`Coins: ${coinCount}`, canvas.width / 2, 150);

    // Display page information
    ctx.font = '16px "Press Start 2P"';
    ctx.fillText(`Page ${currentShopPage + 1}/${totalPages}`, canvas.width / 2, 180);

    const gridCols = 4;
    const gridRows = 3;
    const itemWidth = 150;
    const itemHeight = 150;
    const padding = 20;
    const startX = (canvas.width - (gridCols * (itemWidth + padding))) / 2;
    const startY = 220;

    // Calculate which icons to show on the current page
    const startIndex = currentShopPage * iconsPerPage;
    const endIndex = Math.min(startIndex + iconsPerPage, characters.length);
    
    // Draw each character icon for the current page
    for (let i = startIndex; i < endIndex; i++) {
        const char = characters[i];
        const relativeIndex = i - startIndex;
        const row = Math.floor(relativeIndex / gridCols);
        const col = relativeIndex % gridCols;
        const x = startX + col * (itemWidth + padding);
        const y = startY + row * (itemHeight + padding);

        // Draw item background with highlight if selected
        if (i === selectedCharacter) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        }
        ctx.fillRect(x, y, itemWidth, itemHeight);

        // Draw character preview
        if (char.render) {
            // Use custom render function if available
            char.render(ctx, x + 25, y + 25, 100, 100);
        } else if (char.gradient) {
            // Use gradient function if available
            ctx.fillStyle = char.gradient(ctx, x + 25, y + 25, 100, 100);
            ctx.fillRect(x + 25, y + 25, 100, 100);
        } else {
            // Default gradient rendering
            const gradient = ctx.createLinearGradient(x + 25, y + 25, x + 25, y + 125);
            gradient.addColorStop(0, char.color1);
            gradient.addColorStop(1, char.color2);
            ctx.fillStyle = gradient;
            ctx.fillRect(x + 25, y + 25, 100, 100);
        }

        // Draw name and price/status
        ctx.font = '12px "Press Start 2P"';
        ctx.fillStyle = 'white';
        ctx.fillText(char.name, x + itemWidth/2, y + itemHeight - 35);
        
        if (char.unlocked) {
            ctx.fillStyle = '#4CAF50';
            ctx.fillText('UNLOCKED', x + itemWidth/2, y + itemHeight - 10);
        } else {
            ctx.fillStyle = '#FFA500';
            ctx.fillText(char.price + ' COINS', x + itemWidth/2, y + itemHeight - 10);
        }
        
        // Draw selection indicator if this is the currently selected character
        if (i === selectedCharacter) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            ctx.strokeRect(x + 5, y + 5, itemWidth - 10, itemHeight - 10);
        }
    }

    // Back button
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(20, 20, 100, 40);
    ctx.font = '20px "Press Start 2P"';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.fillText('←', 50, 48);
    
    // Draw pagination controls
    const buttonWidth = 150;
    const buttonHeight = 50;
    const buttonY = canvas.height - 80;
    
    // Previous page button
    if (currentShopPage > 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(canvas.width / 4 - buttonWidth / 2, buttonY, buttonWidth, buttonHeight);
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.font = '20px "Press Start 2P"';
        ctx.fillText('←', canvas.width / 4, buttonY + 35);
    }
    
    // Next page button
    if (currentShopPage < totalPages - 1) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(canvas.width * 3/4 - buttonWidth / 2, buttonY, buttonWidth, buttonHeight);
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.font = '20px "Press Start 2P"';
        ctx.fillText('→', canvas.width * 3/4, buttonY + 35);
    }
}

function drawHomeScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (showShop) {
        drawShop();
        return;
    }

    ctx.fillStyle = 'white';
    ctx.font = '40px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('Platform Runner', canvas.width / 2, canvas.height / 2 - 150);

    // Draw character selection text
    ctx.font = '20px "Press Start 2P"';
    ctx.fillText('Choose Your Character', canvas.width / 2, canvas.height / 2 - 50);
    ctx.font = '16px "Press Start 2P"';
    ctx.fillText('Press ENTER to continue', canvas.width / 2, canvas.height / 2 - 20);

    // Get all unlocked characters
    const titleScreenChars = characters.filter(char => !char.inShop || (char.inShop && char.unlocked));
    
    // Calculate pagination
    const totalPages = Math.ceil(titleScreenChars.length / charsPerHomePage);
    
    // Make sure currentHomePage doesn't exceed the valid range
    if (currentHomePage >= totalPages) {
        currentHomePage = totalPages - 1;
    }
    if (currentHomePage < 0) {
        currentHomePage = 0;
    }
    
    // Display page information if multiple pages
    if (totalPages > 1) {
        ctx.font = '14px "Press Start 2P"';
        ctx.fillStyle = 'white';
        ctx.fillText(`Page ${currentHomePage + 1}/${totalPages}`, canvas.width / 2, canvas.height / 2 - 80);
    }
    
    // Calculate start and end indices for the current page
    const startIndex = currentHomePage * charsPerHomePage;
    const endIndex = Math.min(startIndex + charsPerHomePage, titleScreenChars.length);
    
    // Calculate spacing and starting position for the current page's characters
    const characterSpacing = 120;
    const charsOnThisPage = endIndex - startIndex;
    const startX = canvas.width / 2 - (charsOnThisPage * characterSpacing) / 2;
    
    // Draw only the characters for the current page
    for (let i = startIndex; i < endIndex; i++) {
        const char = titleScreenChars[i];
        const relativeIndex = i - startIndex;
        const x = startX + relativeIndex * characterSpacing;
        const y = canvas.height / 2 + 30;
        
        // Find the character's actual index in the characters array
        // This is important for selecting the correct character
        const originalIndex = characters.indexOf(char);

        // Draw character box
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(x - 35, y - 35, 70, 70);

        // Draw selection highlight with animation
        if (originalIndex === selectedCharacter) {
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
        if (char.render) {
            // Use custom render function if available
            char.render(ctx, x - 25, y - 25, 50, 50);
        } else if (char.gradient) {
            // Use gradient function if available
            ctx.fillStyle = char.gradient(ctx, x - 25, y - 25, 50, 50);
            ctx.fillRect(x - 25, y - 25, 50, 50);
        } else {
            // Default gradient rendering
            const gradient = ctx.createLinearGradient(x - 25, y - 25, x - 25, y + 25);
            gradient.addColorStop(0, char.color1);
            gradient.addColorStop(1, char.color2);
            ctx.fillStyle = gradient;
            ctx.fillRect(x - 25, y - 25, 50, 50);
        }

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

        // Draw number hint (for keyboard selection)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '10px "Press Start 2P"';
        ctx.fillText(`${relativeIndex + 1}`, x - 25, y - 25 + 12);

        // Reset shadow
        ctx.shadowBlur = 0;
    }
    
    // Draw pagination controls if needed
    if (totalPages > 1) {
        const paginationButtonWidth = 50;
        const paginationButtonHeight = 50;
        const paginationY = canvas.height / 2 + 30; // Same Y as characters
        
        // Previous page button
        if (currentHomePage > 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            const prevX = startX - characterSpacing;
            ctx.fillRect(prevX - paginationButtonWidth/2, paginationY - paginationButtonHeight/2, 
                        paginationButtonWidth, paginationButtonHeight);
            ctx.fillStyle = 'white';
            ctx.font = '20px "Press Start 2P"';
            ctx.fillText('←', prevX, paginationY + 8);
        }
        
        // Next page button
        if (currentHomePage < totalPages - 1) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            const nextX = startX + charsOnThisPage * characterSpacing;
            ctx.fillRect(nextX - paginationButtonWidth/2, paginationY - paginationButtonHeight/2, 
                        paginationButtonWidth, paginationButtonHeight);
            ctx.fillStyle = 'white';
            ctx.font = '20px "Press Start 2P"';
            ctx.fillText('→', nextX, paginationY + 8);
        }
    }

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

    // Shop button
    const shopButtonY = buttonY - 70;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(buttonX, shopButtonY, buttonWidth, buttonHeight);
    ctx.font = '20px "Press Start 2P"';
    ctx.fillStyle = 'white';
    ctx.fillText('SHOP', canvas.width / 2, shopButtonY + 33);

    if (isMobile) {
        ctx.font = '16px "Press Start 2P"';
        ctx.fillText('Mobile Controls: ' + (showMobileControls ? 'ON' : 'OFF'), canvas.width / 2, canvas.height - 60);
        ctx.fillText('Tap here to toggle', canvas.width / 2, canvas.height - 30);
    }
}

function drawMobileControls() {
    if (!showMobileControls) return;
    
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
    // Draw active power-up indicators with enhanced icons
    if (hasShield || hasSpeedBoost || hasDoubleJump || hasMagnet || 
        hasInvincibility || hasCoinMultiplier || hasGravityReduction || hasBounce) {
        const padding = 10;
        const iconSize = 30;
        let x = canvas.width - padding - iconSize;

        // Draw power-up background circle with pulsing effect
        const pulseSize = Math.sin(Date.now() / 200) * 2;
        
        // Draw magnet power-up (if active)
        if (hasMagnet) {
            // Magnet indicator
            ctx.fillStyle = 'rgba(128, 0, 128, 0.7)'; // Purple for magnet
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, padding + iconSize/2, iconSize/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Magnet icon with glow
            ctx.shadowColor = '#800080';
            ctx.shadowBlur = 10;
            
            // Draw horseshoe magnet
            ctx.beginPath();
            ctx.moveTo(x - 10, padding + iconSize/4);
            ctx.lineTo(x - 10, padding + 3*iconSize/4);
            ctx.lineTo(x - 5, padding + 3*iconSize/4);
            ctx.lineTo(x - 5, padding + iconSize/4 + 5);
            ctx.lineTo(x + 5, padding + iconSize/4 + 5);
            ctx.lineTo(x + 5, padding + 3*iconSize/4);
            ctx.lineTo(x + 10, padding + 3*iconSize/4);
            ctx.lineTo(x + 10, padding + iconSize/4);
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Add magnet attraction lines
            for (let i = 0; i < 2; i++) {
                const yOffset = i * 5;
                ctx.beginPath();
                ctx.moveTo(x - 8, padding + iconSize/4 - 2 - yOffset);
                ctx.lineTo(x - 4, padding + iconSize/4 - 6 - yOffset);
                ctx.strokeStyle = '#FFF';
                ctx.lineWidth = 1;
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(x + 8, padding + iconSize/4 - 2 - yOffset);
                ctx.lineTo(x + 4, padding + iconSize/4 - 6 - yOffset);
                ctx.stroke();
            }
            
            ctx.shadowBlur = 0;
            
            // Timer
            ctx.fillStyle = '#FFF';
            ctx.font = '12px "Press Start 2P"';
            ctx.fillText(Math.ceil(magnetTimer/60), x - 10, padding + iconSize + 15);
            x -= iconSize + padding;
        }
        
        // Draw double jump power-up (if active)
        if (hasDoubleJump) {
            // Double jump indicator
            ctx.fillStyle = 'rgba(50, 205, 50, 0.7)'; // Lime green
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, padding + iconSize/2, iconSize/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Double jump icon with glow
            ctx.shadowColor = '#32CD32';
            ctx.shadowBlur = 10;
            
            // Draw double arrow up
            ctx.beginPath();
            ctx.moveTo(x, padding + iconSize/4 - 2);
            ctx.lineTo(x - 8, padding + iconSize/4 + 6);
            ctx.lineTo(x - 3, padding + iconSize/4 + 6);
            ctx.lineTo(x - 3, padding + iconSize/2 + 2);
            ctx.lineTo(x - 8, padding + iconSize/2 + 2);
            ctx.lineTo(x, padding + 3*iconSize/4);
            ctx.lineTo(x + 8, padding + iconSize/2 + 2);
            ctx.lineTo(x + 3, padding + iconSize/2 + 2);
            ctx.lineTo(x + 3, padding + iconSize/4 + 6);
            ctx.lineTo(x + 8, padding + iconSize/4 + 6);
            ctx.closePath();
            ctx.fillStyle = '#FFF';
            ctx.fill();
            
            // Add jumping sparkles
            for (let i = 0; i < 3; i++) {
                const angle = (Date.now() / 300 + i * Math.PI * 2/3) % (Math.PI * 2);
                const sparkleX = x + Math.cos(angle) * (iconSize/2 - 5);
                const sparkleY = padding + iconSize/2 + Math.sin(angle) * (iconSize/2 - 5);
                ctx.beginPath();
                ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
                ctx.fillStyle = '#FFF';
                ctx.fill();
            }
            
            ctx.shadowBlur = 0;
            
            // Timer
            ctx.fillStyle = '#FFF';
            ctx.font = '12px "Press Start 2P"';
            ctx.fillText(Math.ceil(doubleJumpTimer/60), x - 10, padding + iconSize + 15);
            x -= iconSize + padding;
        }
        
        if (hasShield) {
            // Shield indicator
            ctx.fillStyle = 'rgba(0, 100, 255, 0.7)';
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, padding + iconSize/2, iconSize/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Enhanced shield icon with glow
            ctx.shadowColor = '#0066FF';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(x, padding + iconSize/4);
            ctx.lineTo(x - iconSize/4, padding + iconSize/2);
            ctx.lineTo(x, padding + 3*iconSize/4);
            ctx.lineTo(x + iconSize/4, padding + iconSize/2);
            ctx.closePath();
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Add shield sparkles
            for (let i = 0; i < 3; i++) {
                const angle = (Date.now() / 500 + i * Math.PI * 2/3) % (Math.PI * 2);
                const sparkleX = x + Math.cos(angle) * (iconSize/2 - 5);
                const sparkleY = padding + iconSize/2 + Math.sin(angle) * (iconSize/2 - 5);
                ctx.beginPath();
                ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
                ctx.fillStyle = '#FFF';
                ctx.fill();
            }
            ctx.shadowBlur = 0;
            
            // Timer
            ctx.fillStyle = '#FFF';
            ctx.font = '12px "Press Start 2P"';
            ctx.fillText(Math.ceil(powerUpTimer/60), x - 10, padding + iconSize + 15);
            x -= iconSize + padding;
        }
        
        if (hasSpeedBoost) {
            // Speed boost indicator
            ctx.fillStyle = 'rgba(255, 255, 0, 0.7)';
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, padding + iconSize/2, iconSize/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Enhanced lightning bolt icon with glow
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(x + 5, padding + iconSize/4);
            ctx.lineTo(x - 5, padding + iconSize/2);
            ctx.lineTo(x + 2, padding + iconSize/2);
            ctx.lineTo(x - 5, padding + 3*iconSize/4);
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Add speed lines
            const time = Date.now() / 100;
            for (let i = 0; i < 3; i++) {
                const offset = (time + i * 5) % 15;
                ctx.beginPath();
                ctx.moveTo(x - iconSize/2 + offset, padding + iconSize/4);
                ctx.lineTo(x - iconSize/2 + offset - 5, padding + 3*iconSize/4);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            ctx.shadowBlur = 0;
            
            // Timer
            ctx.fillStyle = '#FFF';
            ctx.font = '12px "Press Start 2P"';
            ctx.fillText(Math.ceil(powerUpTimer/60), x - 10, padding + iconSize + 15);
            x -= iconSize + padding;
        }
        
        // Draw invincibility power-up (if active)
        if (hasInvincibility) {
            // Invincibility indicator
            ctx.fillStyle = 'rgba(255, 215, 0, 0.7)'; // Gold for invincibility
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, padding + iconSize/2, iconSize/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Star icon with glow for invincibility
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            
            // Draw a star
            for (let i = 0; i < 5; i++) {
                const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
                const innerAngle = angle + Math.PI / 5;
                const outerRadius = iconSize/3;
                const innerRadius = iconSize/6;
                
                const outerX = x + Math.cos(angle) * outerRadius;
                const outerY = padding + iconSize/2 + Math.sin(angle) * outerRadius;
                const innerX = x + Math.cos(innerAngle) * innerRadius;
                const innerY = padding + iconSize/2 + Math.sin(innerAngle) * innerRadius;
                
                if (i === 0) {
                    ctx.moveTo(outerX, outerY);
                } else {
                    ctx.lineTo(outerX, outerY);
                }
                ctx.lineTo(innerX, innerY);
            }
            
            ctx.closePath();
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#FFF';
            ctx.fill();
            
            // Add sparkle effect
            const time = Date.now() / 200;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            for (let i = 0; i < 3; i++) {
                const sparkleAngle = time + i * Math.PI * 2/3;
                const sparkleX = x + Math.cos(sparkleAngle) * (iconSize/2 - 4);
                const sparkleY = padding + iconSize/2 + Math.sin(sparkleAngle) * (iconSize/2 - 4);
                const sparkleSize = 1 + Math.sin(time * 2 + i) * 1;
                ctx.beginPath();
                ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.shadowBlur = 0;
            
            // Timer
            ctx.fillStyle = '#FFF';
            ctx.font = '12px "Press Start 2P"';
            ctx.fillText(Math.ceil(invincibilityTimer/60), x - 10, padding + iconSize + 15);
            x -= iconSize + padding;
        }

        // Draw coin multiplier power-up (if active)
        if (hasCoinMultiplier) {
            // Coin multiplier indicator
            ctx.fillStyle = 'rgba(255, 165, 0, 0.7)'; // Orange for coin multiplier
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, padding + iconSize/2, iconSize/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Coin with x3 icon and glow
            ctx.shadowColor = '#FFA500';
            ctx.shadowBlur = 10;
            
            // Draw coin
            ctx.beginPath();
            ctx.arc(x, padding + iconSize/2, iconSize/4, 0, Math.PI * 2);
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#FFD700';
            ctx.fill();
            
            // Draw x3 text
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('x3', x, padding + iconSize/2 + 4);
            
            // Add coin sparkle effect
            const time = Date.now() / 300;
            for (let i = 0; i < 2; i++) {
                const sparkleAngle = time + i * Math.PI;
                const sparkleX = x + Math.cos(sparkleAngle) * (iconSize/4 - 2);
                const sparkleY = padding + iconSize/2 + Math.sin(sparkleAngle) * (iconSize/4 - 2);
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(sparkleX, sparkleY, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.shadowBlur = 0;
            ctx.textAlign = 'left';
            
            // Timer
            ctx.fillStyle = '#FFF';
            ctx.font = '12px "Press Start 2P"';
            ctx.fillText(Math.ceil(coinMultiplierTimer/60), x - 10, padding + iconSize + 15);
            x -= iconSize + padding;
        }
        
        // Draw gravity reduction power-up (if active)
        if (hasGravityReduction) {
            // Gravity reduction indicator
            ctx.fillStyle = 'rgba(0, 191, 255, 0.7)'; // Deep sky blue for gravity
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, padding + iconSize/2, iconSize/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Floating arrows icon with glow
            ctx.shadowColor = '#00BFFF';
            ctx.shadowBlur = 10;
            
            // Draw up arrows
            ctx.beginPath();
            ctx.moveTo(x - iconSize/4, padding + 3*iconSize/5);
            ctx.lineTo(x, padding + 2*iconSize/5);
            ctx.lineTo(x + iconSize/4, padding + 3*iconSize/5);
            
            ctx.moveTo(x - iconSize/6, padding + 2*iconSize/5);
            ctx.lineTo(x, padding + iconSize/5);
            ctx.lineTo(x + iconSize/6, padding + 2*iconSize/5);
            
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Add floating particle effect
            const time = Date.now() / 200;
            for (let i = 0; i < 3; i++) {
                const offset = (time + i * 5) % 20;
                const particleY = padding + 3*iconSize/4 - offset;
                const alpha = 1 - offset/20;
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.beginPath();
                ctx.arc(x, particleY, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.shadowBlur = 0;
            
            // Timer
            ctx.fillStyle = '#FFF';
            ctx.font = '12px "Press Start 2P"';
            ctx.fillText(Math.ceil(gravityReductionTimer/60), x - 10, padding + iconSize + 15);
            x -= iconSize + padding;
        }
        
        // Draw bounce power-up (if active)
        if (hasBounce) {
            // Bounce indicator
            ctx.fillStyle = 'rgba(255, 105, 180, 0.7)'; // Hot pink for bounce
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, padding + iconSize/2, iconSize/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Bounce spring icon with glow
            ctx.shadowColor = '#FF69B4';
            ctx.shadowBlur = 10;
            
            // Draw spring
            ctx.beginPath();
            ctx.moveTo(x - iconSize/4, padding + 3*iconSize/4);
            ctx.lineTo(x - iconSize/4, padding + 2*iconSize/3);
            ctx.lineTo(x, padding + iconSize/2);
            ctx.lineTo(x - iconSize/6, padding + 2*iconSize/5);
            ctx.lineTo(x, padding + iconSize/3);
            ctx.lineTo(x - iconSize/6, padding + iconSize/4);
            ctx.lineTo(x, padding + iconSize/6);
            ctx.lineTo(x + iconSize/4, padding + iconSize/4);
            
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Add bounce effect with animation
            const bounceHeight = Math.sin(Date.now() / 150) * 4;
            ctx.beginPath();
            ctx.arc(x + iconSize/6, padding + 3*iconSize/4 + bounceHeight, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#FFF';
            ctx.fill();
            
            ctx.shadowBlur = 0;
            
            // Timer
            ctx.fillStyle = '#FFF';
            ctx.font = '12px "Press Start 2P"';
            ctx.fillText(Math.ceil(bounceTimer/60), x - 10, padding + iconSize + 15);
        }
    }

    // Draw power-ups in the game world with pulsing effect
    powerUps.forEach((powerUp, index) => {
        const screenX = powerUp.x - cameraX;
        const screenY = powerUp.y - cameraY;
        const pulseSize = Math.sin(Date.now() / 200) * 3;

        ctx.save();
        ctx.translate(screenX, screenY);

        // Set color and glow based on power-up type
        let glowColor, fillColor;
        
        switch(powerUp.type) {
            case 'shield':
                glowColor = '#0066FF';
                fillColor = 'rgba(0, 100, 255, 0.7)';
                break;
            case 'speed':
                glowColor = '#FFFF00';
                fillColor = 'rgba(255, 255, 0, 0.7)';
                break;
            case 'doubleJump':
                glowColor = '#32CD32';
                fillColor = 'rgba(50, 205, 50, 0.7)';
                break;
            case 'magnet':
                glowColor = '#800080';
                fillColor = 'rgba(128, 0, 128, 0.7)';
                break;
            case 'invincibility':
                glowColor = '#FFD700';
                fillColor = 'rgba(255, 215, 0, 0.7)';
                break;
            case 'coinMultiplier':
                glowColor = '#FFA500';
                fillColor = 'rgba(255, 165, 0, 0.7)';
                break;
            case 'gravityReduction':
                glowColor = '#00BFFF';
                fillColor = 'rgba(0, 191, 255, 0.7)';
                break;
            case 'bounce':
                glowColor = '#FF69B4';
                fillColor = 'rgba(255, 105, 180, 0.7)';
                break;
            default:
                glowColor = '#FFFFFF';
                fillColor = 'rgba(255, 255, 255, 0.7)';
        }
        
        // Glow effect
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 15;
        ctx.fillStyle = fillColor;

        // Main power-up circle with pulse
        ctx.beginPath();
        ctx.arc(0, 0, Math.abs(15 + pulseSize), 0, Math.PI * 2);
        ctx.fill();
        
        // Draw a symbol inside based on the power-up type with enhanced visuals
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        
        // Add floating animation
        const floatOffset = Math.sin(Date.now() / 300) * 2;
        ctx.translate(0, floatOffset);
        
        // Add spinning rotation for specific power-ups
        const rotationSpeed = Date.now() / 1000;
        
        ctx.save(); // Save the context state before any transformations
        
        switch(powerUp.type) {
            case 'shield':
                // Shield symbol - filled with gradient
                ctx.beginPath();
                ctx.moveTo(0, -8);
                ctx.lineTo(-8, 0);
                ctx.lineTo(0, 8);
                ctx.lineTo(8, 0);
                ctx.closePath();
                
                // Fill with gradient
                const shieldGradient = ctx.createLinearGradient(0, -8, 0, 8);
                shieldGradient.addColorStop(0, '#0066FF');
                shieldGradient.addColorStop(1, '#00BFFF');
                ctx.fillStyle = shieldGradient;
                ctx.fill();
                ctx.stroke();
                
                // Add inner detail
                ctx.beginPath();
                ctx.moveTo(0, -4);
                ctx.lineTo(-4, 0);
                ctx.lineTo(0, 4);
                ctx.lineTo(4, 0);
                ctx.closePath();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.stroke();
                break;
                
            case 'speed':
                // Lightning bolt with electric effect
                ctx.save();
                
                // Draw lightning bolt with gradient
                const boltGradient = ctx.createLinearGradient(-4, -8, 4, 8);
                boltGradient.addColorStop(0, '#FFFF00');
                boltGradient.addColorStop(1, '#FFA500');
                ctx.fillStyle = boltGradient;
                
                ctx.beginPath();
                ctx.moveTo(4, -8);
                ctx.lineTo(-4, 0);
                ctx.lineTo(2, 0);
                ctx.lineTo(-4, 8);
                ctx.lineTo(0, 3);
                ctx.lineTo(-2, 3);
                ctx.lineTo(4, -8);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                
                // Add electric sparkles
                for (let i = 0; i < 3; i++) {
                    const sparkAngle = ((Date.now() / 100) + i * 120) % 360;
                    const sparkDist = 10 + Math.sin(Date.now() / 200 + i) * 2;
                    const sparkX = Math.cos(sparkAngle * Math.PI / 180) * sparkDist;
                    const sparkY = Math.sin(sparkAngle * Math.PI / 180) * sparkDist;
                    
                    ctx.beginPath();
                    ctx.moveTo(sparkX, sparkY);
                    ctx.lineTo(sparkX - Math.cos(sparkAngle * Math.PI / 180) * 3, 
                              sparkY - Math.sin(sparkAngle * Math.PI / 180) * 3);
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                    ctx.stroke();
                }
                ctx.restore();
                break;
                
            case 'doubleJump':
                // Double arrow up with animated trails
                ctx.save();
                
                // Draw arrows with gradient
                const jumpGradient = ctx.createLinearGradient(0, 8, 0, -8);
                jumpGradient.addColorStop(0, '#32CD32');
                jumpGradient.addColorStop(1, '#7FFF00');
                ctx.fillStyle = jumpGradient;
                
                // First arrow (filled)
                ctx.beginPath();
                ctx.moveTo(0, -8);
                ctx.lineTo(-5, -2);
                ctx.lineTo(-2, -2);
                ctx.lineTo(-2, 1);
                ctx.lineTo(2, 1);
                ctx.lineTo(2, -2);
                ctx.lineTo(5, -2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                
                // Second arrow (filled)
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(-5, 6);
                ctx.lineTo(-2, 6);
                ctx.lineTo(-2, 8);
                ctx.lineTo(2, 8);
                ctx.lineTo(2, 6);
                ctx.lineTo(5, 6);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                
                // Draw animated trail particles
                const time = Date.now() / 100;
                for (let i = 0; i < 2; i++) {
                    const offset = (time + i * 5) % 10;
                    ctx.fillStyle = `rgba(127, 255, 0, ${1 - offset/10})`;
                    ctx.beginPath();
                    ctx.arc(0, 8 - offset, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                ctx.restore();
                break;
                
            case 'magnet':
                // Magnet symbol with animated magnetic field
                ctx.save();
                
                // Rotate the magnet
                ctx.rotate(Math.sin(rotationSpeed) * 0.2);
                
                // Draw magnet body with gradient
                const magnetGradient = ctx.createLinearGradient(-5, -8, 5, 8);
                magnetGradient.addColorStop(0, '#800080');
                magnetGradient.addColorStop(1, '#DA70D6');
                ctx.fillStyle = magnetGradient;
                
                ctx.beginPath();
                ctx.moveTo(-5, -8);
                ctx.lineTo(-5, 3);
                ctx.lineTo(5, 3);
                ctx.lineTo(5, -8);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                
                // Draw poles
                ctx.fillStyle = '#FF0000'; // North pole (red)
                ctx.beginPath();
                ctx.fillRect(-5, -8, 4, 4);
                
                ctx.fillStyle = '#0000FF'; // South pole (blue)
                ctx.beginPath();
                ctx.fillRect(1, -8, 4, 4);
                
                // Draw magnetic field lines
                const fieldTime = Date.now() / 200;
                for (let i = 0; i < 3; i++) {
                    const offset = (fieldTime + i * 5) % 20;
                    const curveFactor = 4 + Math.sin(fieldTime/2) * 2;
                    
                    ctx.beginPath();
                    ctx.moveTo(-3, -8 - offset/2);
                    ctx.quadraticCurveTo(-curveFactor - Math.sin(fieldTime) * 2, -12 - offset/2, 
                                        3, -8 - offset/2);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${1 - offset/20})`;
                    ctx.stroke();
                }
                
                ctx.restore();
                break;
                
            case 'invincibility':
                // Star symbol for invincibility with shine effect
                ctx.save();
                
                // Rotate the star
                ctx.rotate(rotationSpeed);
                
                // Create gradient for star
                const starGradient = ctx.createRadialGradient(0, 0, 2, 0, 0, 10);
                starGradient.addColorStop(0, '#FFD700'); // Gold
                starGradient.addColorStop(1, '#FFA500'); // Orange
                ctx.fillStyle = starGradient;
                
                // Draw the star
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
                    const innerAngle = angle + Math.PI / 5;
                    const outerRadius = 9;
                    const innerRadius = 4;
                    
                    // Draw outer point
                    const outerX = Math.cos(angle) * outerRadius;
                    const outerY = Math.sin(angle) * outerRadius;
                    
                    // Draw inner point
                    const innerX = Math.cos(innerAngle) * innerRadius;
                    const innerY = Math.sin(innerAngle) * innerRadius;
                    
                    if (i === 0) {
                        ctx.moveTo(outerX, outerY);
                    } else {
                        ctx.lineTo(outerX, outerY);
                    }
                    
                    ctx.lineTo(innerX, innerY);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                
                // Add shine effect
                const shineTime = Date.now() / 300;
                const shineAngle = shineTime % (Math.PI * 2);
                const shineX = Math.cos(shineAngle) * 7;
                const shineY = Math.sin(shineAngle) * 7;
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.beginPath();
                ctx.arc(shineX, shineY, 2, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.restore();
                break;
                
            case 'coinMultiplier':
                // Coin with x3 symbol and animated coin spin
                ctx.save();
                
                // Use coin rotation for thickness illusion
                const coinScale = Math.abs(Math.sin(rotationSpeed * 2));
                ctx.scale(1, 0.3 + coinScale * 0.7);
                
                // Create gold gradient
                const coinGradient = ctx.createRadialGradient(0, 0, 1, 0, 0, 8);
                coinGradient.addColorStop(0, '#FFF8DC'); // Light gold
                coinGradient.addColorStop(0.7, '#FFD700'); // Gold
                coinGradient.addColorStop(1, '#B8860B'); // Dark gold
                ctx.fillStyle = coinGradient;
                
                // Draw main coin
                ctx.beginPath();
                ctx.arc(0, 0, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                
                // Add rim detail
                ctx.beginPath();
                ctx.arc(0, 0, 7, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.stroke();
                
                // Add x3 text
                ctx.fillStyle = '#800000'; // Maroon
                ctx.font = 'bold 10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('x3', 0, 3);
                ctx.strokeStyle = '#FFF';
                ctx.lineWidth = 0.5;
                ctx.strokeText('x3', 0, 3);
                
                // Add coin sparkle
                const sparkleAngle1 = (rotationSpeed * 3) % (Math.PI * 2);
                const sparkleX1 = Math.cos(sparkleAngle1) * 5;
                const sparkleY1 = Math.sin(sparkleAngle1) * 5;
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.beginPath();
                ctx.arc(sparkleX1, sparkleY1, 1.5, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.restore();
                break;
                
            case 'gravityReduction':
                // Floating arrows up with gravity distortion effect
                ctx.save();
                
                // Create bluish gradient
                const gravityGradient = ctx.createLinearGradient(0, 8, 0, -8);
                gravityGradient.addColorStop(0, '#00BFFF'); // Deep sky blue
                gravityGradient.addColorStop(1, '#87CEFA'); // Light sky blue
                ctx.fillStyle = gravityGradient;
                
                // Draw main up arrow (filled)
                ctx.beginPath();
                ctx.moveTo(0, -8);
                ctx.lineTo(-6, 0);
                ctx.lineTo(-3, 0);
                ctx.lineTo(-3, 6);
                ctx.lineTo(3, 6);
                ctx.lineTo(3, 0);
                ctx.lineTo(6, 0);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                
                // Add gravity distortion waves
                const waveTime = Date.now() / 200;
                for (let i = 0; i < 3; i++) {
                    const waveY = 8 - (waveTime + i * 6) % 18;
                    const waveWidth = 8 + i * 2;
                    
                    ctx.beginPath();
                    ctx.moveTo(-waveWidth, waveY);
                    ctx.quadraticCurveTo(-waveWidth/2, waveY - 2, 0, waveY);
                    ctx.quadraticCurveTo(waveWidth/2, waveY - 2, waveWidth, waveY);
                    
                    const alpha = 0.7 - i * 0.2;
                    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                    ctx.lineWidth = 1 - i * 0.2;
                    ctx.stroke();
                }
                
                ctx.restore();
                break;
                
            case 'bounce':
                // Bouncy spring with animation
                ctx.save();
                
                // Spring compression animation
                const springCompress = Math.sin(Date.now() / 150) * 2;
                
                // Create spring gradient
                const springGradient = ctx.createLinearGradient(-5, 8, 5, -8);
                springGradient.addColorStop(0, '#FF69B4'); // Hot pink
                springGradient.addColorStop(1, '#FF1493'); // Deep pink
                ctx.strokeStyle = springGradient;
                ctx.lineWidth = 3;
                
                // Draw animated spring
                ctx.beginPath();
                ctx.moveTo(-5, 8);
                ctx.lineTo(-5, 6 - springCompress/2);
                ctx.lineTo(0, 4 - springCompress);
                ctx.lineTo(-4, 2 - springCompress);
                ctx.lineTo(0, 0 - springCompress);
                ctx.lineTo(-4, -2 - springCompress/2);
                ctx.lineTo(0, -4);
                ctx.lineTo(5, -8);
                ctx.stroke();
                
                // Draw spring base
                ctx.fillStyle = '#A0A0A0';
                ctx.fillRect(-7, 6, 4, 3);
                
                // Draw bounce ball
                const ballY = -8 - Math.abs(springCompress) * 3;
                ctx.fillStyle = '#FF69B4';
                ctx.beginPath();
                ctx.arc(5, ballY, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#FFF';
                ctx.lineWidth = 1;
                ctx.stroke();
                
                ctx.restore();
                break;
        }

        // Collection detection
        if (Math.abs(player.x + player.width/2 - powerUp.x) < 30 &&
            Math.abs(player.y + player.height/2 - powerUp.y) < 30) {
            
            switch(powerUp.type) {
                case 'shield':
                    hasShield = true;
                    powerUpTimer = 300;
                    break;
                case 'speed':
                    hasSpeedBoost = true;
                    player.maxSpeed = 12;
                    powerUpTimer = 300;
                    break;
                case 'doubleJump':
                    hasDoubleJump = true;
                    doubleJumpTimer = 300;
                    break;
                case 'magnet':
                    hasMagnet = true;
                    magnetTimer = 300;
                    break;
                case 'invincibility':
                    hasInvincibility = true;
                    invincibilityTimer = 200; // Shorter duration as it's more powerful
                    break;
                case 'coinMultiplier':
                    hasCoinMultiplier = true;
                    coinMultiplierTimer = 300;
                    break;
                case 'gravityReduction':
                    hasGravityReduction = true;
                    gravityReductionTimer = 250;
                    break;
                case 'bounce':
                    hasBounce = true;
                    bounceTimer = 300;
                    break;
            }
            
            powerUps.splice(index, 1);
            playSound(powerUp.type);
        }

        ctx.restore();
    });
    
    // Implement coin magnet functionality
    if (hasMagnet) {
        coins.forEach(coin => {
            const dx = player.x + player.width/2 - coin.x;
            const dy = player.y + player.height/2 - coin.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < MAGNET_RANGE) {
                // Calculate magnetism strength (stronger when closer)
                const strength = 0.1 * (1 - distance / MAGNET_RANGE);
                
                // Move coin toward player
                coin.x += dx * strength;
                coin.y += dy * strength;
                
                // Create magnetic particle effects
                if (Math.random() < 0.1) {
                    const angle = Math.atan2(dy, dx);
                    const distance = Math.random() * 30 + 20;
                    const particleX = coin.x + Math.cos(angle) * distance;
                    const particleY = coin.y + Math.sin(angle) * distance;
                    
                    particles.push({
                        x: particleX,
                        y: particleY,
                        dx: -Math.cos(angle) * 2,
                        dy: -Math.sin(angle) * 2,
                        radius: Math.random() * 2 + 1,
                        color: '#800080', // Purple for magnet effect
                        alpha: 1,
                        life: 0.8,
                        gravity: 0
                    });
                }
            }
        });
    }
}

function playSound(type) {
    const audio = new Audio();
    audio.volume = 0.2;
    
    // Different sound effects for different power-ups and actions
    switch(type) {
        case 'shield':
            audio.src = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...';
            break;
        case 'speed':
            // Higher pitched sound for speed boost
            audio.src = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...';
            audio.playbackRate = 1.5;
            break;
        case 'doubleJump':
            // Unique sound for double jump
            audio.src = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...';
            audio.playbackRate = 1.2;
            break;
        case 'magnet':
            // Lower pitched sound for magnet
            audio.src = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...';
            audio.playbackRate = 0.8;
            break;
        case 'coin':
            // Coin collection sound
            audio.src = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...';
            audio.volume = 0.15;
            break;
        case 'jump':
            // Jump sound
            audio.src = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...';
            audio.volume = 0.1;
            break;
        case 'land':
            // Landing sound
            audio.src = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...';
            audio.volume = 0.1;
            break;
        default:
            audio.src = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...';
    }
    
    // Try to play the sound
    audio.play().catch(error => {
        console.log("Audio playback error:", error);
    });
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

    // Update power-up timers
    if (powerUpTimer > 0) {
        powerUpTimer--;
        if (powerUpTimer === 0) {
            hasShield = false;
            hasSpeedBoost = false;
            player.maxSpeed = 8;
        }
    }
    
    // Update double jump timer
    if (doubleJumpTimer > 0) {
        doubleJumpTimer--;
        if (doubleJumpTimer === 0) {
            hasDoubleJump = false;
        }
    }
    
    // Update magnet timer
    if (magnetTimer > 0) {
        magnetTimer--;
        if (magnetTimer === 0) {
            hasMagnet = false;
        }
    }
    
    // Update invincibility timer
    if (invincibilityTimer > 0) {
        invincibilityTimer--;
        if (invincibilityTimer === 0) {
            hasInvincibility = false;
        }
    }
    
    // Update coin multiplier timer
    if (coinMultiplierTimer > 0) {
        coinMultiplierTimer--;
        if (coinMultiplierTimer === 0) {
            hasCoinMultiplier = false;
        }
    }
    
    // Update gravity reduction timer
    if (gravityReductionTimer > 0) {
        gravityReductionTimer--;
        if (gravityReductionTimer === 0) {
            hasGravityReduction = false;
        }
    }
    
    // Update bounce timer
    if (bounceTimer > 0) {
        bounceTimer--;
        if (bounceTimer === 0) {
            hasBounce = false;
        }
    }

    if (gameState === 'home') {
        drawHomeScreen();
    } else if (gameState === 'paused') {
        drawPauseMenu();
    } else if (gameState === 'dev') {
        drawDevMenu();
    } else if (gameState === 'sharePrompt') {
        drawSharePrompt();
    } else {
        movePlayer();
        detectCollision();
        updatePlatforms();  // Generate new platforms
        drawPlatforms();
        drawSpikes();
        updateParticles();

        // Draw and update coins
        coins.forEach((coin, index) => {
            coin.rotation += 0.1;
            ctx.save();
            ctx.translate(coin.x - cameraX, coin.y - cameraY);
            ctx.rotate(coin.rotation);
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();

            // Collect coins
            if (Math.abs(player.x + player.width/2 - coin.x) < 30 &&
                Math.abs(player.y + player.height/2 - coin.y) < 30) {
                coins.splice(index, 1);
                
                // Apply coin multiplier power-up or dev option
                let coinMultiplier = 1;
                if (devOptions.tenXCoin) coinMultiplier = 10;
                else if (hasCoinMultiplier) coinMultiplier = 3; 
                
                const coinsToAdd = coinMultiplier;
                coinCount += coinsToAdd;
                
                // Trigger happiness when collecting coins (more intensity for multipliers)
                if (coinMultiplier > 1) {
                    triggerEmotion('excited', 0.8, 60);
                } else {
                    triggerEmotion('happy', 0.6, 45);
                }
                
                // Create coin collection effect based on multiplier
                for (let i = 0; i < coinsToAdd; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = Math.random() * 3 + 1;
                    particles.push({
                        x: coin.x,
                        y: coin.y,
                        dx: Math.cos(angle) * speed,
                        dy: Math.sin(angle) * speed * 0.5 - 2, // More upward
                        radius: Math.random() * 3 + 2,
                        color: hasCoinMultiplier ? '#FFA500' : '#FFD700', // Orange for multiplier, gold for normal
                        alpha: 1,
                        life: 0.8,
                        gravity: 0.05
                    });
                }
                
                playSound('coin');
            }
        });

        drawPlayer();
        score = Math.floor(player.x / 100) * (devOptions.tenXScore ? 10 : 1); // Score increases based on distance
        drawScore();
        drawActivePowerUps(); // Display any active power-ups with their timers
        if (isMobile && showMobileControls) {
            drawMobileControls();
        }
    }

    requestAnimationFrame(update);
}

// Event listeners for mobile controls
function unlockCharacter(index) {
    const character = characters[index];
    if (!character.unlocked && coinCount >= character.price) {
        character.unlocked = true;
        coinCount -= character.price;
        // Play unlock sound
        const audio = new Audio();
        audio.volume = 0.2;
        audio.src = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...';
        audio.play();
    }
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Handle high scores screen
    if (gameState === 'paused' && showHighScores) {
        // Handle share overlay if active
        if (showShareOptions && selectedScoreForSharing) {
            const shareLinks = generateShareURL(selectedScoreForSharing);
            
            // Social media grid layout
            const iconsPerRow = 2;
            const buttonSize = 120;
            const buttonMargin = 20;
            const startX = canvas.width/2 - ((buttonSize * iconsPerRow) + buttonMargin * (iconsPerRow - 1))/2;
            const startY = 280;
            const platformData = [
                { name: 'Twitter', color: '#1DA1F2', link: shareLinks.twitter },
                { name: 'Facebook', color: '#4267B2', link: shareLinks.facebook },
                { name: 'LinkedIn', color: '#0077B5', link: shareLinks.linkedin },
                { name: 'Reddit', color: '#FF4500', link: shareLinks.reddit },
                { name: 'WhatsApp', color: '#25D366', link: shareLinks.whatsapp },
                { name: 'Telegram', color: '#0088cc', link: shareLinks.telegram }
            ];
            
            // Check if any of the social platform buttons were clicked
            for (let i = 0; i < platformData.length; i++) {
                const row = Math.floor(i / iconsPerRow);
                const col = i % iconsPerRow;
                
                const x1 = startX + (buttonSize + buttonMargin) * col;
                const y1 = startY + (buttonSize + buttonMargin) * row;
                const x2 = x1 + buttonSize;
                const y2 = y1 + buttonSize;
                
                if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
                    // Share on the selected platform
                    window.open(platformData[i].link, '_blank');
                    
                    // Show success animation
                    const platformName = platformData[i].name;
                    
                    // Create a small temporary animation showing a "Shared!" message
                    let sharedMessageTimer = 90; // 1.5 seconds
                    const originalDraw = window.drawShareOverlay;
                    window.drawShareOverlay = function(score) {
                        originalDraw(score);
                        
                        if (sharedMessageTimer > 0) {
                            // Draw animated success notification
                            const alpha = Math.min(1, sharedMessageTimer > 60 ? (90 - sharedMessageTimer) / 30 : sharedMessageTimer / 60);
                            const yOffset = 20 * (1 - Math.min(1, (90 - sharedMessageTimer) / 30));
                            
                            ctx.save();
                            ctx.fillStyle = `rgba(40, 167, 69, ${alpha * 0.9})`;
                            ctx.beginPath();
                            ctx.roundRect(canvas.width / 2 - 150, 150 - yOffset, 300, 50, 10);
                            ctx.fill();
                            
                            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                            ctx.font = '16px "Press Start 2P"';
                            ctx.fillText(`Shared on ${platformName}!`, canvas.width / 2, 175 - yOffset);
                            ctx.restore();
                            
                            sharedMessageTimer--;
                            
                            if (sharedMessageTimer === 0) {
                                window.drawShareOverlay = originalDraw;
                            }
                        }
                    };
                    
                    return;
                }
            }
            
            // QR Code area click
            if (x >= canvas.width - 150 && x <= canvas.width - 30 && 
                y >= 20 && y <= 140) {
                // Open the game URL directly
                window.open(shareLinks.gameURL, '_blank');
                return;
            }
            
            // Copy link button
            const copyY = startY + Math.ceil(platformData.length / iconsPerRow) * (buttonSize + buttonMargin) + 20;
            if (x >= canvas.width/2 - 150 && x <= canvas.width/2 + 150 && 
                y >= copyY && y <= copyY + 50) {
                
                // Logic for copying text
                copyToClipboard(shareLinks.gameURL);
                
                // Create a small temporary animation showing a "Copied!" message
                let copiedMessageTimer = 90; // 1.5 seconds
                const originalDraw = window.drawShareOverlay;
                window.drawShareOverlay = function(score) {
                    originalDraw(score);
                    
                    if (copiedMessageTimer > 0) {
                        // Draw animated success notification
                        const alpha = Math.min(1, copiedMessageTimer > 60 ? (90 - copiedMessageTimer) / 30 : copiedMessageTimer / 60);
                        const yOffset = 20 * (1 - Math.min(1, (90 - copiedMessageTimer) / 30));
                        
                        ctx.save();
                        ctx.fillStyle = `rgba(40, 167, 69, ${alpha * 0.9})`;
                        ctx.beginPath();
                        ctx.roundRect(canvas.width / 2 - 150, 150 - yOffset, 300, 50, 10);
                        ctx.fill();
                        
                        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                        ctx.font = '16px "Press Start 2P"';
                        ctx.fillText('Game link copied!', canvas.width / 2, 175 - yOffset);
                        ctx.restore();
                        
                        copiedMessageTimer--;
                        
                        if (copiedMessageTimer === 0) {
                            window.drawShareOverlay = originalDraw;
                        }
                    }
                };
                
                return;
            }
            
            // Close button
            const cancelY = copyY + 70;
            if (x >= canvas.width/2 - 100 && x <= canvas.width/2 + 100 && 
                y >= cancelY && y <= cancelY + 50) {
                // Close share overlay
                showShareOptions = false;
                selectedScoreForSharing = null;
                return;
            }
            
            return;
        }
        
        // Check if any share button was clicked in the high scores list
        if (highScoresList.length > 0) {
            const startY = 140 + 50; // headerY + 50
            const rowHeight = 40;
            
            highScoresList.forEach((score, index) => {
                const y = startY + index * rowHeight;
                
                // Skip if row would be off-screen
                if (y > canvas.height - 100) return;
                
                // Check if share button clicked
                const shareButtonX = canvas.width - 70;
                if (x >= shareButtonX && x <= shareButtonX + 30 &&
                    y - 18 <= y && y <= y - 18 + 30) {
                    selectedScoreForSharing = score;
                    showShareOptions = true;
                    return;
                }
            });
        }
        
        // Check if back button was clicked
        const buttonWidth = 200;
        const buttonHeight = 50;
        const buttonX = canvas.width / 2 - buttonWidth / 2;
        const buttonY = canvas.height - 80;
        
        if (x >= buttonX && x <= buttonX + buttonWidth &&
            y >= buttonY && y <= buttonY + buttonHeight) {
            showHighScores = false;
            showShareOptions = false;
            selectedScoreForSharing = null;
        }
        return;
    }
    
    // Handle pause menu clicks
    if (gameState === 'paused' && !showHighScores) {
        // Check if high scores button was clicked
        const buttonWidth = 300;
        const buttonHeight = 40;
        const buttonX = canvas.width / 2 - buttonWidth / 2;
        const highScoresButtonY = canvas.height / 2 + 50;
        const mobileButtonY = canvas.height / 2 + 110;
        
        if (x >= buttonX && x <= buttonX + buttonWidth &&
            y >= highScoresButtonY && y <= highScoresButtonY + buttonHeight) {
            showHighScores = true;
            return;
        }
        
        // Mobile controls toggle
        if (x >= buttonX && x <= buttonX + buttonWidth &&
            y >= mobileButtonY && y <= mobileButtonY + buttonHeight) {
            showMobileControls = !showMobileControls;
            isMobile = showMobileControls;
            return;
        }
        
        return;
    }
    
    // Handle share prompt screen
    if (gameState === 'sharePrompt') {
        // Get share links
        const shareLinks = generateShareURL({
            score: score,
            character: characters[selectedCharacter].name,
            date: new Date().toLocaleDateString()
        });
        
        // Social media sharing grid
        const iconsPerRow = 3;
        const buttonSize = 90;
        const buttonMargin = 20;
        const startX = canvas.width/2 - ((buttonSize * iconsPerRow) + buttonMargin * (iconsPerRow - 1))/2;
        const startY = 350;
        
        const platformData = [
            { name: 'Twitter', color: '#1DA1F2', icon: '🐦', link: shareLinks.twitter },
            { name: 'Facebook', color: '#4267B2', icon: 'f', link: shareLinks.facebook },
            { name: 'LinkedIn', color: '#0077B5', icon: 'in', link: shareLinks.linkedin },
            { name: 'Reddit', color: '#FF4500', icon: '🔄', link: shareLinks.reddit },
            { name: 'WhatsApp', color: '#25D366', icon: '💬', link: shareLinks.whatsapp },
            { name: 'Copy Link', color: '#6c757d', icon: '🔗', link: null }
        ];
        
        // Check for social media button clicks
        for (let i = 0; i < platformData.length; i++) {
            const row = Math.floor(i / iconsPerRow);
            const col = i % iconsPerRow;
            
            const bx = startX + (buttonSize + buttonMargin) * col;
            const by = startY + (buttonSize + buttonMargin) * row;
            
            if (x >= bx && x <= bx + buttonSize &&
                y >= by && y <= by + buttonSize) {
                
                // If it's the copy link button
                if (platformData[i].name === 'Copy Link') {
                    // Copy game URL to clipboard
                    copyToClipboard(shareLinks.gameURL);
                    
                    // Show feedback (temporary animation)
                    let copyFeedbackTimer = 60; // 1 second
                    const originalDrawSharePrompt = window.drawSharePrompt;
                    window.drawSharePrompt = function() {
                        originalDrawSharePrompt();
                        
                        if (copyFeedbackTimer > 0) {
                            const alpha = Math.min(1, copyFeedbackTimer > 40 ? (60 - copyFeedbackTimer) / 20 : copyFeedbackTimer / 40);
                            ctx.save();
                            ctx.fillStyle = `rgba(40, 167, 69, ${alpha * 0.9})`;
                            ctx.beginPath();
                            ctx.roundRect(canvas.width/2 - 150, 280, 300, 50, 10);
                            ctx.fill();
                            
                            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                            ctx.font = '16px "Press Start 2P"';
                            ctx.fillText('Game link copied!', canvas.width/2, 310);
                            ctx.restore();
                            
                            copyFeedbackTimer--;
                            
                            if (copyFeedbackTimer === 0) {
                                window.drawSharePrompt = originalDrawSharePrompt;
                            }
                        }
                    };
                } else {
                    // Open social media share in new window
                    window.open(platformData[i].link, '_blank');
                }
                return;
            }
        }
        
        // Play again button
        const buttonWidth = 250;
        const buttonHeight = 50;
        const buttonX = canvas.width / 2 - buttonWidth / 2;
        const buttonY = startY + Math.ceil(platformData.length / iconsPerRow) * (buttonSize + buttonMargin) + 30;
        
        if (x >= buttonX && x <= buttonX + buttonWidth &&
            y >= buttonY && y <= buttonY + buttonHeight) {
            // Reset game and go back to home screen
            platforms = [];
            generatePlatforms();
            score = 0;
            gameTimer = 0;
            timerStarted = false;
            spikes = [];
            coins = []; // Reset coins
            player.x = platforms[0].x;
            player.y = platforms[0].y - playerHeight;
            player.dx = 0;
            player.dy = 0;
            cameraX = 0;
            cameraY = 0;
            gameOver = false;
            gameState = 'home'; // Return to home screen
            newHighScoreAchieved = false;
            return;
        }
        
        return;
    }
    
    // Handle home screen
    if (gameState === 'home') {
        if (showShop) {
            // Back button
            if (x >= 20 && x <= 120 && y >= 20 && y <= 60) {
                showShop = false;
                currentShopPage = 0; // Reset to first page when leaving shop
                return;
            }
            
            // Pagination controls
            const buttonWidth = 150;
            const buttonHeight = 50;
            const buttonY = canvas.height - 80;
            const totalPages = Math.ceil(characters.length / iconsPerPage);
            
            // Previous page button
            if (currentShopPage > 0) {
                if (x >= canvas.width / 4 - buttonWidth / 2 && 
                    x <= canvas.width / 4 + buttonWidth / 2 && 
                    y >= buttonY && 
                    y <= buttonY + buttonHeight) {
                    currentShopPage--;
                    return;
                }
            }
            
            // Next page button
            if (currentShopPage < totalPages - 1) {
                if (x >= canvas.width * 3/4 - buttonWidth / 2 && 
                    x <= canvas.width * 3/4 + buttonWidth / 2 && 
                    y >= buttonY && 
                    y <= buttonY + buttonHeight) {
                    currentShopPage++;
                    return;
                }
            }

            // Shop grid click handling
            const gridCols = 4;
            const gridRows = 3;
            const itemWidth = 150;
            const itemHeight = 150;
            const padding = 20;
            const startX = (canvas.width - (gridCols * (itemWidth + padding))) / 2;
            const startY = 220;
            
            // Calculate which icons to show on the current page
            const startIndex = currentShopPage * iconsPerPage;
            const endIndex = Math.min(startIndex + iconsPerPage, characters.length);
            
            // Check each character on the current page
            for (let i = startIndex; i < endIndex; i++) {
                const char = characters[i];
                const relativeIndex = i - startIndex;
                const row = Math.floor(relativeIndex / gridCols);
                const col = relativeIndex % gridCols;
                const itemX = startX + col * (itemWidth + padding);
                const itemY = startY + row * (itemHeight + padding);

                if (x >= itemX && x <= itemX + itemWidth &&
                    y >= itemY && y <= itemY + itemHeight) {
                    if (!char.unlocked && coinCount >= char.price) {
                        unlockCharacter(i);
                    } else if (char.unlocked) {
                        selectedCharacter = i;
                        showShop = false;
                        currentShopPage = 0; // Reset to first page when selecting
                    }
                    return;
                }
            }
            return;
        }
        
        // Check if start button was clicked
        const buttonWidth = 200;
        const buttonHeight = 50;
        const buttonX = canvas.width / 2 - buttonWidth / 2;
        const buttonY = canvas.height - 120;

        const shopButtonY = buttonY - 70;
        if (x >= buttonX && x <= buttonX + buttonWidth &&
            y >= buttonY && y <= buttonY + buttonHeight) {
            gameState = 'playing';
            timerStarted = true;
        } else if (x >= buttonX && x <= buttonX + buttonWidth &&
                   y >= shopButtonY && y <= shopButtonY + buttonHeight) {
            showShop = true;
        }

        // Check if character was clicked
        const titleScreenChars = characters.filter(char => !char.inShop || (char.inShop && char.unlocked));
        const totalPages = Math.ceil(titleScreenChars.length / charsPerHomePage);
        
        // Check for pagination buttons first
        if (totalPages > 1) {
            const paginationButtonWidth = 50;
            const paginationButtonHeight = 50;
            const paginationY = canvas.height / 2 + 30;
            
            // Calculate current page's characters
            const startIndex = currentHomePage * charsPerHomePage;
            const endIndex = Math.min(startIndex + charsPerHomePage, titleScreenChars.length);
            const charsOnThisPage = endIndex - startIndex;
            
            // Calculate character spacing and starting position
            const characterSpacing = 120;
            const startX = canvas.width / 2 - (charsOnThisPage * characterSpacing) / 2;
            
            // Previous page button
            if (currentHomePage > 0) {
                const prevX = startX - characterSpacing;
                if (x >= prevX - paginationButtonWidth/2 && 
                    x <= prevX + paginationButtonWidth/2 && 
                    y >= paginationY - paginationButtonHeight/2 && 
                    y <= paginationY + paginationButtonHeight/2) {
                    currentHomePage--;
                    return;
                }
            }
            
            // Next page button
            if (currentHomePage < totalPages - 1) {
                const nextX = startX + charsOnThisPage * characterSpacing;
                if (x >= nextX - paginationButtonWidth/2 && 
                    x <= nextX + paginationButtonWidth/2 && 
                    y >= paginationY - paginationButtonHeight/2 && 
                    y <= paginationY + paginationButtonHeight/2) {
                    currentHomePage++;
                    return;
                }
            }
            
            // Character selection on current page
            for (let i = startIndex; i < endIndex; i++) {
                const char = titleScreenChars[i];
                const relativeIndex = i - startIndex;
                const charX = startX + relativeIndex * characterSpacing;
                const charY = paginationY;
                
                if (x >= charX - 35 && x <= charX + 35 &&
                    y >= charY - 35 && y <= charY + 35) {
                    // Find the character's actual index in the characters array
                    const originalIndex = characters.indexOf(char);
                    selectedCharacter = originalIndex;
                    return;
                }
            }
        } else {
            // Original non-paginated character selection (for backward compatibility)
            const characterSpacing = 120;
            const startX = canvas.width / 2 - (titleScreenChars.length * characterSpacing) / 2;
            
            titleScreenChars.forEach((char, index) => {
                const charX = startX + index * characterSpacing;
                const charY = canvas.height / 2 + 30;
                if (x >= charX - 35 && x <= charX + 35 &&
                    y >= charY - 35 && y <= charY + 35) {
                    const originalIndex = characters.indexOf(char);
                    selectedCharacter = originalIndex;
                }
            });
        }
    }
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    Array.from(e.touches).forEach(touch => {
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // Handle share prompt screen touch events
        if (gameState === 'sharePrompt') {
            // Get share links
            const shareLinks = generateShareURL({
                score: score,
                character: characters[selectedCharacter].name,
                date: new Date().toLocaleDateString()
            });
            
            // Social media sharing grid
            const iconsPerRow = 3;
            const buttonSize = 90;
            const buttonMargin = 20;
            const startX = canvas.width/2 - ((buttonSize * iconsPerRow) + buttonMargin * (iconsPerRow - 1))/2;
            const startY = 350;
            
            const platformData = [
                { name: 'Twitter', color: '#1DA1F2', icon: '🐦', link: shareLinks.twitter },
                { name: 'Facebook', color: '#4267B2', icon: 'f', link: shareLinks.facebook },
                { name: 'LinkedIn', color: '#0077B5', icon: 'in', link: shareLinks.linkedin },
                { name: 'Reddit', color: '#FF4500', icon: '🔄', link: shareLinks.reddit },
                { name: 'WhatsApp', color: '#25D366', icon: '💬', link: shareLinks.whatsapp },
                { name: 'Copy Link', color: '#6c757d', icon: '🔗', link: null }
            ];
            
            // Check for social media button clicks
            for (let i = 0; i < platformData.length; i++) {
                const row = Math.floor(i / iconsPerRow);
                const col = i % iconsPerRow;
                
                const bx = startX + (buttonSize + buttonMargin) * col;
                const by = startY + (buttonSize + buttonMargin) * row;
                
                if (x >= bx && x <= bx + buttonSize &&
                    y >= by && y <= by + buttonSize) {
                    
                    // If it's the copy link button
                    if (platformData[i].name === 'Copy Link') {
                        // Copy game URL to clipboard
                        copyToClipboard(shareLinks.gameURL);
                        
                        // Show feedback (temporary animation)
                        let copyFeedbackTimer = 60; // 1 second
                        const originalDrawSharePrompt = window.drawSharePrompt;
                        window.drawSharePrompt = function() {
                            originalDrawSharePrompt();
                            
                            if (copyFeedbackTimer > 0) {
                                const alpha = Math.min(1, copyFeedbackTimer > 40 ? (60 - copyFeedbackTimer) / 20 : copyFeedbackTimer / 40);
                                ctx.save();
                                ctx.fillStyle = `rgba(40, 167, 69, ${alpha * 0.9})`;
                                ctx.beginPath();
                                ctx.roundRect(canvas.width/2 - 150, 280, 300, 50, 10);
                                ctx.fill();
                                
                                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                                ctx.font = '16px "Press Start 2P"';
                                ctx.fillText('Game link copied!', canvas.width/2, 310);
                                ctx.restore();
                                
                                copyFeedbackTimer--;
                                
                                if (copyFeedbackTimer === 0) {
                                    window.drawSharePrompt = originalDrawSharePrompt;
                                }
                            }
                        };
                    } else {
                        // Open social media share in new window
                        window.open(platformData[i].link, '_blank');
                    }
                    return;
                }
            }
            
            // Play again button
            const buttonWidth = 250;
            const buttonHeight = 50;
            const buttonX = canvas.width / 2 - buttonWidth / 2;
            const buttonY = startY + Math.ceil(platformData.length / iconsPerRow) * (buttonSize + buttonMargin) + 30;
            
            if (x >= buttonX && x <= buttonX + buttonWidth &&
                y >= buttonY && y <= buttonY + buttonHeight) {
                // Reset game and go back to home screen
                platforms = [];
                generatePlatforms();
                score = 0;
                gameTimer = 0;
                timerStarted = false;
                spikes = [];
                coins = []; // Reset coins
                player.x = platforms[0].x;
                player.y = platforms[0].y - playerHeight;
                player.dx = 0;
                player.dy = 0;
                cameraX = 0;
                cameraY = 0;
                gameOver = false;
                gameState = 'home'; // Return to home screen
                newHighScoreAchieved = false;
                return;
            }
            
            return;
        }
        
        // Handle high scores screen touch events
        if (gameState === 'paused' && showHighScores) {
            // Handle share overlay if active
            if (showShareOptions && selectedScoreForSharing) {
                const buttonWidth = 300;
                const buttonHeight = 60;
                const buttonX = canvas.width / 2 - buttonWidth / 2;
                const buttonSpacing = 80;
                
                // Twitter button
                let buttonY = 280;
                if (x >= buttonX && x <= buttonX + buttonWidth &&
                    y >= buttonY && y <= buttonY + buttonHeight) {
                    // Open Twitter share in new window
                    const shareLinks = generateShareURL(selectedScoreForSharing);
                    window.open(shareLinks.twitter, '_blank');
                    return;
                }
                
                // Facebook button
                buttonY += buttonSpacing;
                if (x >= buttonX && x <= buttonX + buttonWidth &&
                    y >= buttonY && y <= buttonY + buttonHeight) {
                    // Open Facebook share in new window
                    const shareLinks = generateShareURL(selectedScoreForSharing);
                    window.open(shareLinks.facebook, '_blank');
                    return;
                }
                
                // Copy text button
                buttonY += buttonSpacing;
                if (x >= buttonX && x <= buttonX + buttonWidth &&
                    y >= buttonY && y <= buttonY + buttonHeight) {
                    // Copy share text to clipboard
                    const shareLinks = generateShareURL(selectedScoreForSharing);
                    copyToClipboard(shareLinks.shareText);
                    return;
                }
                
                // Cancel/back button
                buttonY += buttonSpacing + 20;
                if (x >= buttonX && x <= buttonX + buttonWidth &&
                    y >= buttonY && y <= buttonY + buttonHeight) {
                    showShareOptions = false;
                    selectedScoreForSharing = null;
                    return;
                }
                
                return;
            }
            
            // Check if any share button was clicked in the high scores list
            if (highScoresList.length > 0) {
                const startY = 140 + 50; // headerY + 50
                const rowHeight = 40;
                
                highScoresList.forEach((score, index) => {
                    const y = startY + index * rowHeight;
                    
                    // Skip if row would be off-screen
                    if (y > canvas.height - 100) return;
                    
                    // Check if share button clicked
                    const shareButtonX = canvas.width - 70;
                    if (x >= shareButtonX && x <= shareButtonX + 30 &&
                        y - 18 <= y && y <= y - 18 + 30) {
                        selectedScoreForSharing = score;
                        showShareOptions = true;
                        return;
                    }
                });
            }
            
            // Check if back button was clicked
            const buttonWidth = 200;
            const buttonHeight = 50;
            const buttonX = canvas.width / 2 - buttonWidth / 2;
            const buttonY = canvas.height - 80;
            
            if (x >= buttonX && x <= buttonX + buttonWidth &&
                y >= buttonY && y <= buttonY + buttonHeight) {
                showHighScores = false;
                showShareOptions = false;
                selectedScoreForSharing = null;
            }
            return;
        }
        
        // Handle pause menu touch events
        if (gameState === 'paused' && !showHighScores) {
            const buttonWidth = 300;
            const buttonHeight = 40;
            const buttonX = canvas.width / 2 - buttonWidth / 2;
            const highScoresButtonY = canvas.height / 2 + 50;
            const mobileButtonY = canvas.height / 2 + 110;
            
            if (x >= buttonX && x <= buttonX + buttonWidth &&
                y >= highScoresButtonY && y <= highScoresButtonY + buttonHeight) {
                showHighScores = true;
                return;
            }
            
            if (x >= buttonX && x <= buttonX + buttonWidth &&
                y >= mobileButtonY && y <= mobileButtonY + buttonHeight) {
                showMobileControls = !showMobileControls;
                isMobile = showMobileControls;
                return;
            }
            
            // Resume game on touch elsewhere
            gameState = 'playing';
            return;
        }

        if (gameState === 'home') {
            // Handle home screen touch events
            if (showShop) {
                // Back button
                if (x >= 20 && x <= 120 && y >= 20 && y <= 60) {
                    showShop = false;
                    currentShopPage = 0; // Reset to first page when leaving shop
                    return;
                }
                
                // Pagination controls
                const buttonWidth = 150;
                const buttonHeight = 50;
                const buttonY = canvas.height - 80;
                const totalPages = Math.ceil(characters.length / iconsPerPage);
                
                // Previous page button
                if (currentShopPage > 0) {
                    if (x >= canvas.width / 4 - buttonWidth / 2 && 
                        x <= canvas.width / 4 + buttonWidth / 2 && 
                        y >= buttonY && 
                        y <= buttonY + buttonHeight) {
                        if (currentShopPage > 0) {
                            currentShopPage--;
                        }
                        return;
                    }
                }
                
                // Next page button
                if (currentShopPage < totalPages - 1) {
                    if (x >= canvas.width * 3/4 - buttonWidth / 2 && 
                        x <= canvas.width * 3/4 + buttonWidth / 2 && 
                        y >= buttonY && 
                        y <= buttonY + buttonHeight) {
                        const totalPages = Math.ceil(characters.length / iconsPerPage);
                        if (currentShopPage < totalPages - 1) {
                            currentShopPage++;
                        }
                        return;
                    }
                }
                
                // Shop touch handling
                const gridCols = 4;
                const gridRows = 3;
                const itemWidth = 150;
                const itemHeight = 150;
                const padding = 20;
                const startX = (canvas.width - (gridCols * (itemWidth + padding))) / 2;
                const startY = 220;
                
                // Calculate which icons to show on the current page
                const startIndex = currentShopPage * iconsPerPage;
                const endIndex = Math.min(startIndex + iconsPerPage, characters.length);
                
                // Check each character on the current page
                for (let i = startIndex; i < endIndex; i++) {
                    const char = characters[i];
                    const relativeIndex = i - startIndex;
                    const row = Math.floor(relativeIndex / gridCols);
                    const col = relativeIndex % gridCols;
                    const itemX = startX + col * (itemWidth + padding);
                    const itemY = startY + row * (itemHeight + padding);
                    
                    if (x >= itemX && x <= itemX + itemWidth &&
                        y >= itemY && y <= itemY + itemHeight) {
                        if (!char.unlocked && coinCount >= char.price) {
                            unlockCharacter(i);
                        } else if (char.unlocked) {
                            selectedCharacter = i;
                            showShop = false;
                            currentShopPage = 0; // Reset to first page when selecting
                        }
                        return;
                    }
                }
                return;
            }
            
            // Check if start button was clicked
            const buttonWidth = 200;
            const buttonHeight = 50;
            const buttonX = canvas.width / 2 - buttonWidth / 2;
            const buttonY = canvas.height - 120;
            
            const shopButtonY = buttonY - 70;
            if (x >= buttonX && x <= buttonX + buttonWidth &&
                y >= buttonY && y <= buttonY + buttonHeight) {
                gameState = 'playing';
                timerStarted = true;
                return;
            } else if (x >= buttonX && x <= buttonX + buttonWidth &&
                       y >= shopButtonY && y <= shopButtonY + buttonHeight) {
                showShop = true;
                return;
            }
            
            // Check for character selection on home screen with pagination
            const titleScreenChars = characters.filter(char => !char.inShop || (char.inShop && char.unlocked));
            const totalPages = Math.ceil(titleScreenChars.length / charsPerHomePage);
            
            if (totalPages > 1) {
                const paginationButtonWidth = 50;
                const paginationButtonHeight = 50;
                const paginationY = canvas.height / 2 + 30;
                
                // Calculate current page's characters
                const startIndex = currentHomePage * charsPerHomePage;
                const endIndex = Math.min(startIndex + charsPerHomePage, titleScreenChars.length);
                const charsOnThisPage = endIndex - startIndex;
                
                // Calculate character spacing and starting position
                const characterSpacing = 120;
                const startX = canvas.width / 2 - (charsOnThisPage * characterSpacing) / 2;
                
                // Previous page button
                if (currentHomePage > 0) {
                    const prevX = startX - characterSpacing;
                    if (x >= prevX - paginationButtonWidth/2 && 
                        x <= prevX + paginationButtonWidth/2 && 
                        y >= paginationY - paginationButtonHeight/2 && 
                        y <= paginationY + paginationButtonHeight/2) {
                        if (currentHomePage > 0) {
                            currentHomePage--;
                        }
                        return;
                    }
                }
                
                // Next page button
                if (currentHomePage < totalPages - 1) {
                    const nextX = startX + charsOnThisPage * characterSpacing;
                    if (x >= nextX - paginationButtonWidth/2 && 
                        x <= nextX + paginationButtonWidth/2 && 
                        y >= paginationY - paginationButtonHeight/2 && 
                        y <= paginationY + paginationButtonHeight/2) {
                        const totalHomePages = Math.ceil(titleScreenChars.length / charsPerHomePage);
                        if (currentHomePage < totalHomePages - 1) {
                            currentHomePage++;
                        }
                        return;
                    }
                }
                
                // Character selection on current page
                for (let i = startIndex; i < endIndex; i++) {
                    const char = titleScreenChars[i];
                    const relativeIndex = i - startIndex;
                    const charX = startX + relativeIndex * characterSpacing;
                    const charY = paginationY;
                    
                    if (x >= charX - 35 && x <= charX + 35 &&
                        y >= charY - 35 && y <= charY + 35) {
                        // Find the character's actual index in the characters array
                        const originalIndex = characters.indexOf(char);
                        selectedCharacter = originalIndex;
                        return;
                    }
                }
            } else {
                // Original non-paginated character selection for backward compatibility
                const characterSpacing = 120;
                const startX = canvas.width / 2 - (titleScreenChars.length * characterSpacing) / 2;
                
                for (let i = 0; i < titleScreenChars.length; i++) {
                    const char = titleScreenChars[i];
                    const charX = startX + i * characterSpacing;
                    const charY = canvas.height / 2 + 30;
                    
                    if (x >= charX - 35 && x <= charX + 35 &&
                        y >= charY - 35 && y <= charY + 35) {
                        const originalIndex = characters.indexOf(char);
                        selectedCharacter = originalIndex;
                        return;
                    }
                }
            }
            
            // If no character is selected, start the game
            gameState = 'playing';
            timerStarted = true;
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
    if (e.key.toLowerCase() === 'r') {
        localStorage.clear();
        coinCount = 0;
        highScore = 0;
        characters.forEach(char => {
            if (!char.inShop) {
                char.unlocked = true;
            } else {
                char.unlocked = false;
            }
        });
        return;
    }

    if (e.key.toLowerCase() === 'o' && e.altKey) {
        if (gameState === 'dev') {
            gameState = 'playing';
        } else if (gameState === 'playing') {
            gameState = 'dev';
        }
        return;
    }

    if (gameState === 'dev') {
        const num = parseInt(e.key);
        if (num >= 1 && num <= 5) {
            const options = ['tenXScore', 'tenXCoin', 'unlockAll', 'tenXSpeed', 'noGravity'];
            const option = options[num - 1];
            devOptions[option] = !devOptions[option];
            
            if (option === 'unlockAll') {
                characters.forEach(char => char.unlocked = devOptions.unlockAll);
            }
        }
        return;
    }

    if (gameState === 'home') {
        if (showShop) {
            // Handle shop keyboard controls
            const totalPages = Math.ceil(characters.length / iconsPerPage);
            
            if (e.key === 'Escape' || e.key === 'Backspace') {
                showShop = false;
                currentShopPage = 0; // Reset to first page when leaving shop
                return;
            }
            
            // Navigation between pages
            if (e.key === 'ArrowLeft' || e.key === 'a') {
                if (currentShopPage > 0) {
                    currentShopPage--;
                }
                return;
            }
            
            if (e.key === 'ArrowRight' || e.key === 'd') {
                if (currentShopPage < totalPages - 1) {
                    currentShopPage++;
                }
                return;
            }
            
            // Number keys to select items on the current page
            const num = parseInt(e.key);
            if (!isNaN(num) && num >= 1 && num <= 12) {
                const itemIndex = currentShopPage * iconsPerPage + (num - 1);
                
                if (itemIndex < characters.length) {
                    const char = characters[itemIndex];
                    
                    if (!char.unlocked && coinCount >= char.price) {
                        unlockCharacter(itemIndex);
                    } else if (char.unlocked) {
                        selectedCharacter = itemIndex;
                        showShop = false;
                        currentShopPage = 0; // Reset to first page when selecting
                    }
                }
                return;
            }
            
            return;
        }
        
        // Home screen navigation
        if (e.key === ' ' || e.key === 'Enter') {
            gameState = 'playing';
            timerStarted = true;
            return;
        }
        
        if (e.key === 's' || e.key === 'S') {
            showShop = true;
            return;
        }
        
        // Get all available characters for home screen
        const titleScreenChars = characters.filter(char => !char.inShop || (char.inShop && char.unlocked));
        const totalPages = Math.ceil(titleScreenChars.length / charsPerHomePage);
        
        // Page navigation
        if (totalPages > 1) {
            if (e.key === 'PageUp' || (e.key === 'ArrowUp' && e.ctrlKey)) {
                if (currentHomePage > 0) {
                    currentHomePage--;
                }
                return;
            }
            
            if (e.key === 'PageDown' || (e.key === 'ArrowDown' && e.ctrlKey)) {
                if (currentHomePage < totalPages - 1) {
                    currentHomePage++;
                }
                return;
            }
        }
        
        // Number keys to select characters on current page
        const num = parseInt(e.key);
        if (!isNaN(num) && num >= 1 && num <= charsPerHomePage) {
            const startIndex = currentHomePage * charsPerHomePage;
            const selectedIndex = startIndex + (num - 1);
            
            if (selectedIndex < titleScreenChars.length) {
                const originalIndex = characters.indexOf(titleScreenChars[selectedIndex]);
                selectedCharacter = originalIndex;
                return;
            }
        }
        
        // Left/right arrows to cycle through characters
        if (e.key === 'ArrowLeft' || e.key === 'a') {
            // Get the index of the current character in the unlocked characters array
            const currentIndex = titleScreenChars.indexOf(characters[selectedCharacter]);
            
            if (currentIndex > 0) {
                // If not the first character on the page, select previous character
                const originalIndex = characters.indexOf(titleScreenChars[currentIndex - 1]);
                selectedCharacter = originalIndex;
            } else if (currentHomePage > 0) {
                // If first character on page and not the first page, go to previous page
                currentHomePage--;
                // Select the last character on the previous page
                const startIndex = currentHomePage * charsPerHomePage;
                const endIndex = Math.min(startIndex + charsPerHomePage, titleScreenChars.length);
                const lastCharOnPrevPage = endIndex - 1;
                const originalIndex = characters.indexOf(titleScreenChars[lastCharOnPrevPage]);
                selectedCharacter = originalIndex;
            } else {
                // Wrap around to the last character
                const originalIndex = characters.indexOf(titleScreenChars[titleScreenChars.length - 1]);
                selectedCharacter = originalIndex;
                // Go to the last page
                currentHomePage = totalPages - 1;
            }
            return;
        }
        
        if (e.key === 'ArrowRight' || e.key === 'd') {
            // Get the index of the current character in the unlocked characters array
            const currentIndex = titleScreenChars.indexOf(characters[selectedCharacter]);
            
            // Get the characters on the current page
            const startIndex = currentHomePage * charsPerHomePage;
            const endIndex = Math.min(startIndex + charsPerHomePage, titleScreenChars.length);
            
            if (currentIndex < endIndex - 1) {
                // If not the last character on the page, select next character
                const originalIndex = characters.indexOf(titleScreenChars[currentIndex + 1]);
                selectedCharacter = originalIndex;
            } else if (currentHomePage < totalPages - 1) {
                // If last character on page and not the last page, go to next page
                currentHomePage++;
                // Select the first character on the next page
                const nextPageStartIndex = currentHomePage * charsPerHomePage;
                const originalIndex = characters.indexOf(titleScreenChars[nextPageStartIndex]);
                selectedCharacter = originalIndex;
            } else {
                // Wrap around to the first character
                const originalIndex = characters.indexOf(titleScreenChars[0]);
                selectedCharacter = originalIndex;
                // Go to the first page
                currentHomePage = 0;
            }
            return;
        }
    }

    // Handle share prompt screen with keyboard
    if (gameState === 'sharePrompt') {
        if (e.key === 'Escape' || e.key === 'Backspace') {
            // Reset and go to home screen
            platforms = [];
            generatePlatforms();
            score = 0;
            gameTimer = 0;
            timerStarted = false;
            spikes = [];
            coins = []; // Reset coins
            coinCount = 0; // Reset coin counter
            player.x = platforms[0].x;
            player.y = platforms[0].y - playerHeight;
            player.dx = 0;
            player.dy = 0;
            cameraX = 0;
            cameraY = 0;
            gameOver = false;
            gameState = 'home'; // Return to home screen
            newHighScoreAchieved = false;
            return;
        }
        
        // Number keys for different share options
        if (e.key === '1' || e.key === 't') { // Twitter
            const shareLinks = generateShareURL(selectedScoreForSharing);
            window.open(shareLinks.twitter, '_blank');
            return;
        } else if (e.key === '2' || e.key === 'f') { // Facebook
            const shareLinks = generateShareURL(selectedScoreForSharing);
            window.open(shareLinks.facebook, '_blank');
            return;
        } else if (e.key === '3' || e.key === 'c') { // Copy to clipboard
            const shareLinks = generateShareURL(selectedScoreForSharing);
            copyToClipboard(shareLinks.shareText);
            return;
        } else if (e.key === '4' || e.key === 'p' || e.key === 'Enter') { // Play again
            // Reset and go to home screen
            platforms = [];
            generatePlatforms();
            score = 0;
            gameTimer = 0;
            timerStarted = false;
            spikes = [];
            coins = []; // Reset coins
            coinCount = 0; // Reset coin counter
            player.x = platforms[0].x;
            player.y = platforms[0].y - playerHeight;
            player.dx = 0;
            player.dy = 0;
            cameraX = 0;
            cameraY = 0;
            gameOver = false;
            gameState = 'home'; // Return to home screen
            newHighScoreAchieved = false;
        }
        return;
    }
    
    if (e.key === 'Escape') {
        if (gameState === 'paused' && showHighScores) {
            showHighScores = false; // Exit high scores screen
        } else if (gameState === 'playing') {
            gameState = 'paused';
        } else if (gameState === 'paused') {
            gameState = 'playing';
        }
        return;
    }
    
    // High scores screen navigation
    if (gameState === 'paused' && showHighScores) {
        // Handle share overlay keyboard controls
        if (showShareOptions && selectedScoreForSharing) {
            if (e.key === 'Escape' || e.key === 'Backspace') {
                showShareOptions = false;
                selectedScoreForSharing = null;
                return;
            }
            
            // Number keys for different share options
            if (e.key === '1') {
                // Twitter
                const shareLinks = generateShareURL(selectedScoreForSharing);
                window.open(shareLinks.twitter, '_blank');
                return;
            } else if (e.key === '2') {
                // Facebook
                const shareLinks = generateShareURL(selectedScoreForSharing);
                window.open(shareLinks.facebook, '_blank');
                return;
            } else if (e.key === '3' || e.key === 'c') {
                // Copy to clipboard
                const shareLinks = generateShareURL(selectedScoreForSharing);
                copyToClipboard(shareLinks.shareText);
                return;
            }
            
            return;
        }
        
        // Exit high scores screen
        if (e.key === 'Backspace' || e.key === 'Escape') {
            showHighScores = false;
            showShareOptions = false;
            selectedScoreForSharing = null;
        }
        
        // Allow sharing options with keyboard for selected scores
        if (highScoresList.length > 0 && e.key === 's') {
            // Share the top score by default
            selectedScoreForSharing = highScoresList[0];
            showShareOptions = true;
        }
        
        return;
    }
    
    // Handle key navigation in pause menu
    if (gameState === 'paused' && !showHighScores) {
        if (e.key === 'h' || e.key === 'H') {
            showHighScores = true;
            return;
        }
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