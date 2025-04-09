// Draw active power-ups and their timers
function drawActivePowerUps() {
    // Only show if player has active power-ups
    if (!hasShield && !hasSpeedBoost && !hasDoubleJump && !hasMagnet && 
        !hasInvincibility && !hasCoinMultiplier && !hasGravityReduction && !hasBounce) {
        return;
    }
    
    // Count active power-ups
    const activePowerUpCount = hasShield + hasSpeedBoost + hasDoubleJump + hasMagnet + 
                                hasInvincibility + hasCoinMultiplier + hasGravityReduction + hasBounce;
    
    // Draw animated background for power-ups section
    const panelWidth = 180;
    const panelHeight = 50 + activePowerUpCount * 30;
    const panelX = 10;
    const panelY = 50;
    
    // Create gradient background
    const bgGradient = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelHeight);
    bgGradient.addColorStop(0, 'rgba(20, 20, 50, 0.85)');
    bgGradient.addColorStop(1, 'rgba(10, 10, 30, 0.85)');
    
    // Draw panel with rounded corners
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 10);
    ctx.fillStyle = bgGradient;
    ctx.fill();
    
    // Add border with gradient
    const borderGradient = ctx.createLinearGradient(panelX, panelY, panelX + panelWidth, panelY + panelHeight);
    borderGradient.addColorStop(0, 'rgba(100, 200, 255, 0.7)');
    borderGradient.addColorStop(0.5, 'rgba(200, 100, 255, 0.7)');
    borderGradient.addColorStop(1, 'rgba(255, 200, 100, 0.7)');
    
    ctx.strokeStyle = borderGradient;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Add animated light effect at corners
    const time = Date.now() / 1000;
    const cornerSize = 3 + Math.sin(time * 2) * 1.5;
    
    // Top-left corner
    ctx.fillStyle = `hsl(${(time * 40) % 360}, 100%, 70%)`;
    ctx.beginPath();
    ctx.arc(panelX + 10, panelY + 10, cornerSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Top-right corner
    ctx.fillStyle = `hsl(${((time * 40) + 90) % 360}, 100%, 70%)`;
    ctx.beginPath();
    ctx.arc(panelX + panelWidth - 10, panelY + 10, cornerSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Header text with shadow and gradient
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Active Power-ups', 22, 75);
    
    // Gradient text
    const textGradient = ctx.createLinearGradient(20, 50, 180, 50);
    textGradient.addColorStop(0, '#FFFFFF');
    textGradient.addColorStop(0.5, '#E0FFFF');
    textGradient.addColorStop(1, '#FFFFFF');
    
    ctx.fillStyle = textGradient;
    ctx.fillText('Active Power-ups', 20, 75);
    
    // Draw underline
    ctx.beginPath();
    ctx.moveTo(20, 80);
    ctx.lineTo(170, 80);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    let yPos = 100;
    const iconSize = 20;
    
    // Helper function to draw power-up icons with fancy effects
    function drawPowerUpIcon(type, timerValue, maxTime) {
        ctx.save();
        
        // Calculate timer percentage
        const percentage = timerValue / maxTime;
        
        // Draw progress background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(50, yPos - 15, 100, 20);
        
        // Draw progress bar with different colors based on power-up type
        let colorStart, colorEnd;
        
        switch(type) {
            case 'shield':
                colorStart = '#0066FF';
                colorEnd = '#00BFFF';
                break;
            case 'speed':
                colorStart = '#FFFF00';
                colorEnd = '#FFA500';
                break;
            case 'doubleJump':
                colorStart = '#32CD32';
                colorEnd = '#7FFF00';
                break;
            case 'magnet':
                colorStart = '#800080';
                colorEnd = '#DA70D6';
                break;
            case 'invincibility':
                colorStart = '#FFD700';
                colorEnd = '#FFA500';
                break;
            case 'coinMultiplier':
                colorStart = '#FFD700';
                colorEnd = '#B8860B';
                break;
            case 'gravityReduction':
                colorStart = '#00BFFF';
                colorEnd = '#87CEFA';
                break;
            case 'bounce':
                colorStart = '#FF69B4';
                colorEnd = '#FF1493';
                break;
            default:
                colorStart = '#4CAF50';
                colorEnd = '#8BC34A';
        }
        
        // Draw timer bar with matching color
        const gradient = ctx.createLinearGradient(50, 0, 50 + 100 * percentage, 0);
        gradient.addColorStop(0, colorStart);
        gradient.addColorStop(1, colorEnd);
        ctx.fillStyle = gradient;
        
        // Draw with rounded corners
        ctx.beginPath();
        ctx.roundRect(50, yPos - 15, 100 * percentage, 20, 5);
        ctx.fill();
        
        // Add shine effect
        if (percentage > 0.1) {
            const shineGradient = ctx.createLinearGradient(50, yPos - 15, 50, yPos - 5);
            shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
            shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = shineGradient;
            ctx.beginPath();
            ctx.roundRect(50, yPos - 15, 100 * percentage, 5, [5, 5, 0, 0]);
            ctx.fill();
        }
        
        // Save context for icon drawing
        ctx.save();
        // Translate to icon position
        ctx.translate(30, yPos - 5);
        
        switch(type) {
            case 'shield':
                // Shield gradient
                const shieldGradient = ctx.createLinearGradient(0, -iconSize/2, 0, iconSize/2);
                shieldGradient.addColorStop(0, '#0066FF');
                shieldGradient.addColorStop(1, '#00BFFF');
                
                // Draw shield icon
                ctx.beginPath();
                ctx.moveTo(0, -iconSize/2);
                ctx.lineTo(-iconSize/2, 0);
                ctx.lineTo(0, iconSize/2);
                ctx.lineTo(iconSize/2, 0);
                ctx.closePath();
                ctx.fillStyle = shieldGradient;
                ctx.fill();
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 1;
                ctx.stroke();
                break;
                
            case 'speed':
                // Lightning bolt gradient
                const boltGradient = ctx.createLinearGradient(-iconSize/2, -iconSize/2, iconSize/2, iconSize/2);
                boltGradient.addColorStop(0, '#FFFF00');
                boltGradient.addColorStop(1, '#FFA500');
                ctx.fillStyle = boltGradient;
                
                // Draw lightning bolt
                ctx.beginPath();
                ctx.moveTo(iconSize/2, -iconSize/2);
                ctx.lineTo(-iconSize/2, 0);
                ctx.lineTo(0, 0);
                ctx.lineTo(-iconSize/2, iconSize/2);
                ctx.lineTo(0, iconSize/4);
                ctx.lineTo(-0, iconSize/4);
                ctx.lineTo(iconSize/2, -iconSize/2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
                
            case 'doubleJump':
                // Jump gradient
                const jumpGradient = ctx.createLinearGradient(0, iconSize/2, 0, -iconSize/2);
                jumpGradient.addColorStop(0, '#32CD32');
                jumpGradient.addColorStop(1, '#7FFF00');
                ctx.fillStyle = jumpGradient;
                
                // First arrow
                ctx.beginPath();
                ctx.moveTo(0, -iconSize/2);
                ctx.lineTo(-iconSize/2, -iconSize/8);
                ctx.lineTo(-iconSize/4, -iconSize/8);
                ctx.lineTo(-iconSize/4, iconSize/8);
                ctx.lineTo(iconSize/4, iconSize/8);
                ctx.lineTo(iconSize/4, -iconSize/8);
                ctx.lineTo(iconSize/2, -iconSize/8);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                
                // Second arrow
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(-iconSize/2, iconSize/2 - iconSize/8);
                ctx.lineTo(-iconSize/4, iconSize/2 - iconSize/8);
                ctx.lineTo(-iconSize/4, iconSize/2);
                ctx.lineTo(iconSize/4, iconSize/2);
                ctx.lineTo(iconSize/4, iconSize/2 - iconSize/8);
                ctx.lineTo(iconSize/2, iconSize/2 - iconSize/8);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
                
            case 'magnet':
                // Magnet gradient
                const magnetGradient = ctx.createLinearGradient(-iconSize/2, -iconSize/2, iconSize/2, iconSize/2);
                magnetGradient.addColorStop(0, '#800080');
                magnetGradient.addColorStop(1, '#DA70D6');
                ctx.fillStyle = magnetGradient;
                
                // Magnet body
                ctx.beginPath();
                ctx.moveTo(-iconSize/2, -iconSize/2);
                ctx.lineTo(-iconSize/2, iconSize/4);
                ctx.lineTo(iconSize/2, iconSize/4);
                ctx.lineTo(iconSize/2, -iconSize/2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                
                // Poles
                ctx.fillStyle = '#FF0000'; // North pole
                ctx.fillRect(-iconSize/2, -iconSize/2, iconSize/2, iconSize/4);
                
                ctx.fillStyle = '#0000FF'; // South pole
                ctx.fillRect(0, -iconSize/2, iconSize/2, iconSize/4);
                break;
                
            case 'invincibility':
                // Star gradient
                const starGradient = ctx.createRadialGradient(0, 0, 2, 0, 0, iconSize/2);
                starGradient.addColorStop(0, '#FFD700');
                starGradient.addColorStop(1, '#FFA500');
                ctx.fillStyle = starGradient;
                
                // Draw star
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
                    const innerAngle = angle + Math.PI / 5;
                    const outerRadius = iconSize/2;
                    const innerRadius = iconSize/5;
                    
                    const outerX = Math.cos(angle) * outerRadius;
                    const outerY = Math.sin(angle) * outerRadius;
                    
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
                break;
                
            case 'coinMultiplier':
                // Coin gradient
                const coinGradient = ctx.createRadialGradient(0, 0, 1, 0, 0, iconSize/2);
                coinGradient.addColorStop(0, '#FFF8DC');
                coinGradient.addColorStop(0.7, '#FFD700');
                coinGradient.addColorStop(1, '#B8860B');
                ctx.fillStyle = coinGradient;
                
                // Draw coin
                ctx.beginPath();
                ctx.arc(0, 0, iconSize/2, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                
                // Draw x3 text
                ctx.fillStyle = '#800000';
                ctx.font = 'bold 10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('x3', 0, 3);
                break;
                
            case 'gravityReduction':
                // Gravity gradient
                const gravityGradient = ctx.createLinearGradient(0, iconSize/2, 0, -iconSize/2);
                gravityGradient.addColorStop(0, '#00BFFF');
                gravityGradient.addColorStop(1, '#87CEFA');
                ctx.fillStyle = gravityGradient;
                
                // Draw arrow
                ctx.beginPath();
                ctx.moveTo(0, -iconSize/2);
                ctx.lineTo(-iconSize/2, 0);
                ctx.lineTo(-iconSize/4, 0);
                ctx.lineTo(-iconSize/4, iconSize/2);
                ctx.lineTo(iconSize/4, iconSize/2);
                ctx.lineTo(iconSize/4, 0);
                ctx.lineTo(iconSize/2, 0);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
                
            case 'bounce':
                // Spring gradient
                const springGradient = ctx.createLinearGradient(-iconSize/2, iconSize/2, iconSize/2, -iconSize/2);
                springGradient.addColorStop(0, '#FF69B4');
                springGradient.addColorStop(1, '#FF1493');
                ctx.strokeStyle = springGradient;
                ctx.lineWidth = 3;
                
                // Draw spring
                ctx.beginPath();
                ctx.moveTo(-iconSize/2, iconSize/2);
                ctx.lineTo(-iconSize/2, iconSize/4);
                ctx.lineTo(0, iconSize/8);
                ctx.lineTo(-iconSize/3, 0);
                ctx.lineTo(0, -iconSize/8);
                ctx.lineTo(-iconSize/3, -iconSize/4);
                ctx.lineTo(0, -iconSize/2);
                ctx.lineTo(iconSize/2, -iconSize/2);
                ctx.stroke();
                
                // Base and ball
                ctx.fillStyle = '#A0A0A0';
                ctx.fillRect(-iconSize/2 - 2, iconSize/4, iconSize/4, iconSize/4);
                
                ctx.fillStyle = '#FF69B4';
                ctx.beginPath();
                ctx.arc(iconSize/2, -iconSize/2, iconSize/8, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
        
        ctx.restore();
        
        // Draw timer text with animation for low time remaining
        const secondsLeft = Math.ceil(timerValue / 60);
        const isLowTime = (secondsLeft <= 5);
        
        // Animate text for low time warning
        if (isLowTime) {
            // Pulse size based on time
            const pulseSize = 1 + Math.sin(Date.now() / 200) * 0.2;
            ctx.save();
            ctx.translate(150, yPos);
            ctx.scale(pulseSize, pulseSize);
            
            // Create color gradient for warning effect
            const warningGradient = ctx.createLinearGradient(0, -10, 0, 10);
            warningGradient.addColorStop(0, '#FF5555');
            warningGradient.addColorStop(0.5, '#FFFFFF');
            warningGradient.addColorStop(1, '#FF5555');
            
            ctx.fillStyle = warningGradient;
            ctx.textAlign = 'right';
            ctx.fillText(secondsLeft + "s", 0, 0);
            ctx.restore();
        } else {
            // Normal timer text
            ctx.fillStyle = 'white';
            ctx.textAlign = 'right';
            ctx.fillText(secondsLeft + "s", 150, yPos);
            
            // Add small pulsing dot to show timer is active
            const dotSize = 1.5 + Math.sin(Date.now() / 300) * 0.5;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.arc(155, yPos - 3, dotSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Move to next position
        yPos += 30;
        ctx.restore();
    }
    
    // Draw each active power-up
    if (hasShield)
        drawPowerUpIcon('shield', powerUpTimer, 300);
    
    if (hasSpeedBoost)
        drawPowerUpIcon('speed', powerUpTimer, 300);
    
    if (hasDoubleJump)
        drawPowerUpIcon('doubleJump', doubleJumpTimer, 300);
    
    if (hasMagnet)
        drawPowerUpIcon('magnet', magnetTimer, 300);
    
    if (hasInvincibility)
        drawPowerUpIcon('invincibility', invincibilityTimer, 200);
    
    if (hasCoinMultiplier)
        drawPowerUpIcon('coinMultiplier', coinMultiplierTimer, 300);
    
    if (hasGravityReduction)
        drawPowerUpIcon('gravityReduction', gravityReductionTimer, 250);
    
    if (hasBounce)
        drawPowerUpIcon('bounce', bounceTimer, 300);
}