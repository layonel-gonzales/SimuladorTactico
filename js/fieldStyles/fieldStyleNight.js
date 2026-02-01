// fieldStyleNight.js - Estilo nocturno de cancha
function drawNightField(canvas, ctx) {
    const cssWidth = parseFloat(canvas.style.width) || canvas.width;
    const cssHeight = parseFloat(canvas.style.height) || canvas.height;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     window.innerWidth <= 768 || cssWidth <= 768;

    console.log(`🏟️ Dibujando campo estilo NOCTURNO - ${cssWidth}x${cssHeight}`);
    
    // Limpiar canvas
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    
    // Fondo nocturno oscuro
    const nightGradient = ctx.createRadialGradient(cssWidth/2, cssHeight/2, 0, cssWidth/2, cssHeight/2, Math.max(cssWidth, cssHeight));
    nightGradient.addColorStop(0, '#1a4a1a');
    nightGradient.addColorStop(0.7, '#0d2d0d');
    nightGradient.addColorStop(1, '#051505');
    ctx.fillStyle = nightGradient;
    ctx.fillRect(0, 0, cssWidth, cssHeight);
    
    // Efectos de iluminación de estadio
    drawStadiumLights(ctx, cssWidth, cssHeight);
    
    // Configuración de líneas brillantes
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = Math.max(3, cssWidth * 0.004);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ffffff';
    
    // Elementos del campo iluminados
    drawIlluminatedFieldBorder(ctx, cssWidth, cssHeight);
    drawIlluminatedCenterLine(ctx, cssWidth, cssHeight);
    drawIlluminatedCenterCircle(ctx, cssWidth, cssHeight, isMobile);
    drawIlluminatedPenaltyAreas(ctx, cssWidth, cssHeight, isMobile);
    drawIlluminatedGoalAreas(ctx, cssWidth, cssHeight, isMobile);
    drawIlluminatedCornerArcs(ctx, cssWidth, cssHeight, isMobile);
    drawIlluminatedPenaltySpots(ctx, cssWidth, cssHeight, isMobile);
    drawFloodlights(ctx, cssWidth, cssHeight);
    
    // Quitar efectos de sombra
    ctx.shadowBlur = 0;
}

function drawStadiumLights(ctx, width, height) {
    // Focos de luz desde las esquinas
    const numLights = 6;
    
    for (let i = 0; i < numLights; i++) {
        const angle = (i / numLights) * 2 * Math.PI;
        const lightX = width * 0.5 + Math.cos(angle) * width * 0.6;
        const lightY = height * 0.5 + Math.sin(angle) * height * 0.6;
        
        const lightGradient = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, Math.min(width, height) * 0.4);
        lightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        lightGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.05)');
        lightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = lightGradient;
        ctx.fillRect(0, 0, width, height);
    }
}

function drawIlluminatedFieldBorder(ctx, width, height) {
    // Márgenes mínimos - las líneas ocupan casi todo el espacio
    const margin = Math.max(3, width * 0.005);
    // Borde principal con efecto neón
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);
    
    // Borde exterior sutil
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = ctx.lineWidth * 0.5;
    ctx.strokeRect(margin - 1, margin - 1, width - margin * 2 + 2, height - margin * 2 + 2);
    ctx.globalAlpha = 1;
    ctx.lineWidth = ctx.lineWidth * 2;
}

function drawIlluminatedCenterLine(ctx, width, height) {
    const margin = Math.max(3, width * 0.005);
    // Línea central brillante
    ctx.beginPath();
    ctx.moveTo(width * 0.5, margin);
    ctx.lineTo(width * 0.5, height - margin);
    ctx.stroke();
    
    // Efecto de brillo adicional
    const oldShadowBlur = ctx.shadowBlur;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00ffff';
    ctx.globalAlpha = 0.5;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = oldShadowBlur;
    ctx.shadowColor = '#ffffff';
}

function drawIlluminatedCenterCircle(ctx, width, height, isMobile) {
    const radius = Math.min(width, height) * 0.1;
    
    // Círculo principal
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.5, radius, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Efecto de pulso en el centro
    const time = Date.now() * 0.003;
    const pulseAlpha = 0.3 + 0.2 * Math.sin(time);
    
    ctx.globalAlpha = pulseAlpha;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00ff88';
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.5, radius * 0.5, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ffffff';
    
    // Punto central brillante
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.5, 4, 0, 2 * Math.PI);
    ctx.fill();
}

function drawIlluminatedPenaltyAreas(ctx, width, height, isMobile) {
    const margin = Math.max(3, width * 0.005);
    const areaWidth = width * 0.16;
    const areaHeight = height * 0.44;
    
    // Áreas de penalty con brillo
    ctx.strokeRect(margin, height * 0.5 - areaHeight/2, areaWidth, areaHeight);
    ctx.strokeRect(width - margin - areaWidth, height * 0.5 - areaHeight/2, areaWidth, areaHeight);
    
    // Arcos de penalty con efecto neón
    const penaltyDist = width * 0.105;
    const arcRadius = width * 0.09;
    
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 12;
    
    // Arco izquierdo
    ctx.beginPath();
    ctx.arc(margin + penaltyDist, height * 0.5, arcRadius, -Math.PI/3, Math.PI/3);
    ctx.stroke();
    
    // Arco derecho
    ctx.beginPath();
    ctx.arc(width - margin - penaltyDist, height * 0.5, arcRadius, 2*Math.PI/3, 4*Math.PI/3);
    ctx.stroke();
    
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 8;
}

function drawIlluminatedGoalAreas(ctx, width, height, isMobile) {
    const margin = Math.max(3, width * 0.005);
    const areaWidth = width * 0.055;
    const areaHeight = height * 0.2;
    
    // Áreas de gol con brillo azul
    ctx.shadowColor = '#0088ff';
    ctx.shadowBlur = 10;
    
    ctx.strokeRect(margin, height * 0.5 - areaHeight/2, areaWidth, areaHeight);
    ctx.strokeRect(width - margin - areaWidth, height * 0.5 - areaHeight/2, areaWidth, areaHeight);
    
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 8;
}

function drawIlluminatedCornerArcs(ctx, width, height, isMobile) {
    const margin = Math.max(3, width * 0.005);
    const radius = Math.min(width, height) * 0.02;
    
    // Esquinas con efecto de resplandor
    ctx.shadowColor = '#ff8800';
    ctx.shadowBlur = 15;
    
    // Esquina superior izquierda
    ctx.beginPath();
    ctx.arc(margin, margin, radius, 0, Math.PI/2);
    ctx.stroke();
    
    // Esquina superior derecha
    ctx.beginPath();
    ctx.arc(width - margin, margin, radius, Math.PI/2, Math.PI);
    ctx.stroke();
    
    // Esquina inferior izquierda
    ctx.beginPath();
    ctx.arc(margin, height - margin, radius, -Math.PI/2, 0);
    ctx.stroke();
    
    // Esquina inferior derecha
    ctx.beginPath();
    ctx.arc(width - margin, height - margin, radius, Math.PI, 3*Math.PI/2);
    ctx.stroke();
    
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 8;
}

function drawIlluminatedPenaltySpots(ctx, width, height, isMobile) {
    const margin = Math.max(3, width * 0.005);
    const spotSize = 5;
    const penaltyDist = width * 0.105;
    
    // Spots con efecto de brillo pulsante
    const time = Date.now() * 0.004;
    const pulseIntensity = 0.7 + 0.3 * Math.sin(time);
    
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 20;
    ctx.globalAlpha = pulseIntensity;
    
    // Spot izquierdo
    ctx.beginPath();
    ctx.arc(margin + penaltyDist, height * 0.5, spotSize, 0, 2 * Math.PI);
    ctx.fill();
    
    // Spot derecho
    ctx.beginPath();
    ctx.arc(width - margin - penaltyDist, height * 0.5, spotSize, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.globalAlpha = 1;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 8;
}

function drawFloodlights(ctx, width, height) {
    // Torres de iluminación en las esquinas
    const towerHeight = height * 0.15;
    const towerWidth = 3;
    
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#444444';
    
    // Torres en las esquinas del canvas
    ctx.fillRect(width * 0.02, height * 0.05, towerWidth, towerHeight);
    ctx.fillRect(width * 0.98, height * 0.05, towerWidth, towerHeight);
    ctx.fillRect(width * 0.02, height * 0.9, towerWidth, towerHeight);
    ctx.fillRect(width * 0.98, height * 0.9, towerWidth, towerHeight);
    
    // Luces en las torres
    ctx.fillStyle = '#ffff88';
    const lightSize = 4;
    
    ctx.fillRect(width * 0.02, height * 0.05, lightSize, lightSize);
    ctx.fillRect(width * 0.98, height * 0.05, lightSize, lightSize);
    ctx.fillRect(width * 0.02, height * 0.9, lightSize, lightSize);
    ctx.fillRect(width * 0.98, height * 0.9, lightSize, lightSize);
    
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
}

// Registrar estilo en el sistema global
if (window.styleRegistry) {
    window.styleRegistry.registerFieldStyle('night', {
        name: 'Nocturno',
        description: 'Cancha iluminada por la noche',
        icon: '🌙',
        drawFunction: drawNightField
    });
    console.log('✅ Estilo de campo nocturno registrado');
}
