// Character Emotion System
// Enhances the game with reactive character emotions based on gameplay events

// Function to trigger character emotions based on game events
function triggerEmotion(emotion, intensity = 1.0, duration = 120) {
    // Don't change emotions too rapidly (at least 250ms between changes)
    const currentTime = Date.now();
    if (currentTime - lastEmotionTrigger < 250 && emotion !== 'scared') {
        // Always allow 'scared' emotion to interrupt (for spike near-misses)
        return;
    }
    
    lastEmotionTrigger = currentTime;
    
    // If this is a higher intensity emotion than current or same emotion, replace it
    if (intensity >= emotionIntensity || emotion === playerEmotion) {
        playerEmotion = emotion;
        emotionIntensity = intensity;
        emotionTimer = duration;
        
        // Clear any mild emotions from queue when a strong one happens
        if (intensity > 0.7) {
            emotionQueue = [];
        }
    } else {
        // For lower intensity emotions, add to queue
        emotionQueue.push({
            emotion: emotion,
            intensity: intensity,
            duration: duration
        });
    }
    
    // Special animations for some emotions
    if (emotion === 'excited') {
        // Trigger rapid blinking for excitement
        blinkTimer = 5;
        isBlinking = true;
    } else if (emotion === 'scared') {
        // Wide eyes, no blinking for scared
        blinkTimer = 0;
        isBlinking = false;
    }
}

// Update emotion state - called in the main game loop
function updateEmotions() {
    // Update emotion timer
    if (emotionTimer > 0) {
        emotionTimer--;
        
        // When an emotion ends, check if there's another in the queue
        if (emotionTimer === 0 && emotionQueue.length > 0) {
            const nextEmotion = emotionQueue.shift();
            playerEmotion = nextEmotion.emotion;
            emotionIntensity = nextEmotion.intensity;
            emotionTimer = nextEmotion.duration;
        } else if (emotionTimer === 0) {
            // Default back to neutral
            playerEmotion = 'neutral';
            emotionIntensity = 0.5;
        }
    }
    
    // Update facial animation time
    facialAnimationTime += 0.05;
    
    // Random blinking
    if (blinkTimer > 0) {
        blinkTimer--;
        if (blinkTimer === 0) {
            isBlinking = !isBlinking;
            
            // Set next blink timer
            if (!isBlinking) {
                // If eyes just opened, longer time until next blink
                blinkTimer = Math.floor(Math.random() * 120) + 60;
            } else {
                // If eyes just closed, short blink duration
                blinkTimer = Math.floor(Math.random() * 3) + 2;
            }
        }
    } else if (Math.random() < 0.005 && !isBlinking && playerEmotion !== 'scared') {
        // Random blink chance
        isBlinking = true;
        blinkTimer = Math.floor(Math.random() * 3) + 2;
    }
}

// Draw character facial expressions based on current emotion
function drawCharacterExpression(ctx, bodyX, bodyY, stretchWidth, stretchHeight, player) {
    const character = characters[selectedCharacter];
    const baseEyeSize = 5;
    let eyeSize, mouthStyle, eyeStyle;
    
    // Base positioning
    let eyeY = bodyY + stretchHeight * (player.dy < 0 ? 0.25 : 0.35);
    const leftEyeX = bodyX + stretchWidth * 0.3;
    const rightEyeX = bodyX + stretchWidth * 0.7;
    const mouthY = bodyY + stretchHeight * 0.55;
    
    // Apply emotion-specific attributes
    switch(playerEmotion) {
        case 'happy':
            eyeSize = baseEyeSize * (1 + 0.2 * emotionIntensity);
            eyeY = bodyY + stretchHeight * 0.3; // Eyes move slightly up
            mouthStyle = 'smile';
            break;
            
        case 'excited':
            eyeSize = baseEyeSize * (1 + 0.4 * emotionIntensity);
            eyeY = bodyY + stretchHeight * 0.25; // Eyes move up more
            mouthStyle = 'grin';
            break;
            
        case 'scared':
            eyeSize = baseEyeSize * (1 + 0.5 * emotionIntensity);
            eyeY = bodyY + stretchHeight * 0.3;
            mouthStyle = 'o-mouth';
            break;
            
        case 'sad':
            eyeSize = baseEyeSize * (1 - 0.3 * emotionIntensity);
            eyeY = bodyY + stretchHeight * 0.4; // Eyes move down
            mouthStyle = 'frown';
            break;
            
        case 'proud':
            eyeSize = baseEyeSize;
            eyeY = bodyY + stretchHeight * 0.3;
            mouthStyle = 'smirk';
            break;
            
        case 'neutral':
        default:
            eyeSize = baseEyeSize + Math.abs(player.dx) / 4; // Eyes widen during fast movement
            eyeY = bodyY + stretchHeight * (player.dy < 0 ? 0.25 : 0.35); // Eyes move up when jumping
            mouthStyle = player.dy < -2 ? 'o-mouth' : 
                        player.dy > 2 ? 'worried' : 'smile';
            break;
    }
    
    // Apply blinking if needed
    if (isBlinking && playerEmotion !== 'scared') {
        eyeStyle = 'blink';
    } else {
        eyeStyle = 'normal';
    }
    
    // Direction for pupils to look (based on movement)
    const pupilOffsetX = Math.min(2, Math.max(-2, player.dx / 2));
    const pupilOffsetY = Math.min(2, Math.max(-2, player.dy / 3));
    
    // Draw eyes based on style
    ctx.fillStyle = 'white';
    
    if (eyeStyle === 'normal') {
        // Normal eyes
        ctx.beginPath();
        ctx.arc(leftEyeX, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.arc(rightEyeX, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupils
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(leftEyeX + pupilOffsetX, eyeY + pupilOffsetY, eyeSize * 0.6, 0, Math.PI * 2);
        ctx.arc(rightEyeX + pupilOffsetX, eyeY + pupilOffsetY, eyeSize * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        // Add reflection dots in eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(leftEyeX + pupilOffsetX + 1, eyeY + pupilOffsetY - 1, eyeSize * 0.2, 0, Math.PI * 2);
        ctx.arc(rightEyeX + pupilOffsetX + 1, eyeY + pupilOffsetY - 1, eyeSize * 0.2, 0, Math.PI * 2);
        ctx.fill();
    } else if (eyeStyle === 'blink') {
        // Blinking eyes - just draw lines
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        // Left eye blink
        ctx.moveTo(leftEyeX - eyeSize, eyeY);
        ctx.lineTo(leftEyeX + eyeSize, eyeY);
        
        // Right eye blink
        ctx.moveTo(rightEyeX - eyeSize, eyeY);
        ctx.lineTo(rightEyeX + eyeSize, eyeY);
        
        ctx.stroke();
    }
    
    // Draw mouth based on style
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.lineWidth = 2;
    
    switch(mouthStyle) {
        case 'smile':
            // Normal smile, wider with higher intensity
            const smileWidth = 15 + emotionIntensity * 5;
            ctx.beginPath();
            ctx.arc(bodyX + stretchWidth * 0.5, mouthY, smileWidth, 0, Math.PI);
            ctx.stroke();
            break;
            
        case 'grin':
            // Excited grin with teeth
            ctx.beginPath();
            ctx.arc(bodyX + stretchWidth * 0.5, mouthY, 18, 0, Math.PI);
            ctx.stroke();
            
            // Add teeth
            ctx.fillStyle = 'white';
            ctx.fillRect(
                bodyX + stretchWidth * 0.3,
                mouthY - 3,
                stretchWidth * 0.4,
                6
            );
            
            // Tooth lines
            ctx.beginPath();
            ctx.moveTo(bodyX + stretchWidth * 0.4, mouthY - 3);
            ctx.lineTo(bodyX + stretchWidth * 0.4, mouthY + 3);
            ctx.moveTo(bodyX + stretchWidth * 0.5, mouthY - 3);
            ctx.lineTo(bodyX + stretchWidth * 0.5, mouthY + 3);
            ctx.moveTo(bodyX + stretchWidth * 0.6, mouthY - 3);
            ctx.lineTo(bodyX + stretchWidth * 0.6, mouthY + 3);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();
            break;
            
        case 'o-mouth':
            // Surprised circular mouth
            ctx.beginPath();
            ctx.arc(bodyX + stretchWidth * 0.5, mouthY, 7, 0, Math.PI * 2);
            ctx.stroke();
            
            // Dark mouth interior
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fill();
            break;
            
        case 'frown':
            // Sad frown, inverted smile
            ctx.beginPath();
            ctx.arc(bodyX + stretchWidth * 0.5, mouthY + 10, 15, Math.PI, Math.PI * 2);
            ctx.stroke();
            break;
            
        case 'smirk':
            // Proud asymmetrical smirk
            ctx.beginPath();
            ctx.moveTo(bodyX + stretchWidth * 0.3, mouthY);
            ctx.quadraticCurveTo(
                bodyX + stretchWidth * 0.5,
                mouthY + 8,
                bodyX + stretchWidth * 0.7,
                mouthY - 2
            );
            ctx.stroke();
            break;
            
        case 'worried':
            // Worried expression when falling
            ctx.beginPath();
            ctx.arc(bodyX + stretchWidth * 0.5, mouthY + 8, 10, Math.PI, Math.PI * 2);
            ctx.stroke();
            break;
    }
    
    // Add character-specific emotion enhancements
    switch(character.name) {
        case 'Lava Cube':
            if (playerEmotion === 'excited' || playerEmotion === 'happy') {
                // More energetic flames when happy
                for (let i = 0; i < 5; i++) {
                    const flameX = bodyX + stretchWidth * (0.2 + 0.15 * i);
                    const flameHeight = Math.sin(Date.now() / 150 + i * 2) * 8 + 15;
                    
                    const flameGradient = ctx.createLinearGradient(0, bodyY - flameHeight, 0, bodyY);
                    flameGradient.addColorStop(0, 'rgba(255, 255, 0, 0.9)');
                    flameGradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
                    
                    ctx.fillStyle = flameGradient;
                    ctx.beginPath();
                    ctx.moveTo(flameX - 5, bodyY);
                    ctx.quadraticCurveTo(flameX, bodyY - flameHeight * 2, flameX + 5, bodyY);
                    ctx.fill();
                }
            } else if (playerEmotion === 'sad' || playerEmotion === 'scared') {
                // Dimmer flames when sad
                for (let i = 0; i < 3; i++) {
                    const flameX = bodyX + stretchWidth * (0.25 + 0.25 * i);
                    const flameHeight = Math.sin(Date.now() / 300 + i * 2) * 3 + 6;
                    
                    const flameGradient = ctx.createLinearGradient(0, bodyY - flameHeight, 0, bodyY);
                    flameGradient.addColorStop(0, 'rgba(255, 150, 0, 0.5)');
                    flameGradient.addColorStop(1, 'rgba(200, 50, 0, 0)');
                    
                    ctx.fillStyle = flameGradient;
                    ctx.beginPath();
                    ctx.moveTo(flameX - 4, bodyY);
                    ctx.quadraticCurveTo(flameX, bodyY - flameHeight, flameX + 4, bodyY);
                    ctx.fill();
                }
            }
            break;
            
        case 'Water Cube':
            if (playerEmotion === 'excited' || playerEmotion === 'happy') {
                // More energetic bubbles when happy
                ctx.fillStyle = 'rgba(100, 200, 255, 0.7)';
                for (let i = 0; i < 5; i++) {
                    const bubbleX = bodyX + Math.random() * stretchWidth;
                    const bubbleY = bodyY + Math.random() * stretchHeight/2;
                    const bubbleSize = Math.random() * 4 + 2;
                    
                    ctx.beginPath();
                    ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Add bubble shine
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.beginPath();
                    ctx.arc(bubbleX - bubbleSize/3, bubbleY - bubbleSize/3, bubbleSize/3, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = 'rgba(100, 200, 255, 0.7)';
                }
            } else if (playerEmotion === 'sad') {
                // Dripping water when sad
                ctx.fillStyle = 'rgba(100, 150, 255, 0.5)';
                for (let i = 0; i < 2; i++) {
                    const dropX = bodyX + stretchWidth * (0.3 + 0.4 * i);
                    const dropHeight = Math.sin(Date.now() / 200 + i) * 2 + 10;
                    
                    // Teardrop shape
                    ctx.beginPath();
                    ctx.moveTo(dropX, bodyY + stretchHeight);
                    ctx.quadraticCurveTo(
                        dropX + 4, 
                        bodyY + stretchHeight + dropHeight/2,
                        dropX, 
                        bodyY + stretchHeight + dropHeight
                    );
                    ctx.quadraticCurveTo(
                        dropX - 4, 
                        bodyY + stretchHeight + dropHeight/2,
                        dropX, 
                        bodyY + stretchHeight
                    );
                    ctx.fill();
                }
            }
            break;
            
        case 'Magic Cube':
            if (playerEmotion === 'excited' || playerEmotion === 'happy') {
                // Magic sparkles when excited
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2 + facialAnimationTime;
                    const distance = stretchWidth * 0.6;
                    const sparkleX = bodyX + stretchWidth/2 + Math.cos(angle) * distance;
                    const sparkleY = bodyY + stretchHeight/2 + Math.sin(angle) * distance;
                    
                    const hue = (facialAnimationTime * 30 + i * 45) % 360;
                    ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${0.7 + Math.sin(facialAnimationTime * 2 + i) * 0.3})`;
                    
                    // Star shape
                    ctx.beginPath();
                    for (let j = 0; j < 5; j++) {
                        const starAngle = j * Math.PI * 2 / 5 - Math.PI / 2;
                        const starX = sparkleX + Math.cos(starAngle) * 3;
                        const starY = sparkleY + Math.sin(starAngle) * 3;
                        
                        if (j === 0) {
                            ctx.moveTo(starX, starY);
                        } else {
                            ctx.lineTo(starX, starY);
                        }
                        
                        // Inner points
                        const innerAngle = starAngle + Math.PI / 5;
                        const innerX = sparkleX + Math.cos(innerAngle) * 1.5;
                        const innerY = sparkleY + Math.sin(innerAngle) * 1.5;
                        ctx.lineTo(innerX, innerY);
                    }
                    ctx.closePath();
                    ctx.fill();
                }
            }
            break;
            
        case 'Galaxy Cube':
            if (playerEmotion === 'excited' || playerEmotion === 'happy') {
                // Orbiting star particles
                for (let i = 0; i < 5; i++) {
                    const angle = facialAnimationTime * (i % 2 === 0 ? 1 : -1) + i;
                    const distance = stretchWidth * (0.3 + (i % 3) * 0.1);
                    const particleX = bodyX + stretchWidth/2 + Math.cos(angle) * distance;
                    const particleY = bodyY + stretchHeight/2 + Math.sin(angle) * distance;
                    
                    ctx.fillStyle = '#FFFFFF';
                    ctx.beginPath();
                    ctx.arc(particleX, particleY, 2, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Add glow
                    ctx.fillStyle = 'rgba(150, 150, 255, 0.5)';
                    ctx.beginPath();
                    ctx.arc(particleX, particleY, 4, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            break;
            
        case 'Ice Cube':
            if (playerEmotion === 'scared' || playerEmotion === 'sad') {
                // Cracks appear when scared or sad
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.lineWidth = 1;
                
                for (let i = 0; i < 3; i++) {
                    const startX = bodyX + stretchWidth * (0.3 + 0.2 * i);
                    const startY = bodyY;
                    
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    
                    let currentX = startX;
                    let currentY = startY;
                    
                    for (let j = 0; j < 4; j++) {
                        const angleOffset = (Math.sin(i + j) * 0.5) - 0.8;
                        currentX += Math.cos(angleOffset) * 5;
                        currentY += Math.sin(angleOffset) * 5 + 5;
                        
                        // Don't draw past the bottom of the cube
                        if (currentY > bodyY + stretchHeight) {
                            break;
                        }
                        
                        ctx.lineTo(currentX, currentY);
                    }
                    
                    ctx.stroke();
                }
            }
            break;
    }
}