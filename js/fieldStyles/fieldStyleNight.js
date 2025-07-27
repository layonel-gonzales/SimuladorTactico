// fieldStyleNight.js - Estilo nocturno de cancha
export function drawNightField(canvas, ctx) {
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
    // Borde principal con efecto neón
    ctx.strokeRect(width * 0.05, height * 0.1, width * 0.9, height * 0.8);
    
    // Borde exterior sutil
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = ctx.lineWidth * 0.5;
    ctx.strokeRect(width * 0.04, height * 0.09, width * 0.92, height * 0.82);
    ctx.globalAlpha = 1;
    ctx.lineWidth = ctx.lineWidth * 2;
}

function drawIlluminatedCenterLine(ctx, width, height) {
    // Línea central brillante
    ctx.beginPath();
    ctx.moveTo(width * 0.5, height * 0.1);
    ctx.lineTo(width * 0.5, height * 0.9);
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
    const radius = isMobile ? Math.min(width, height) * 0.09 : Math.min(width, height) * 0.11;
    
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
    const areaWidth = isMobile ? width * 0.13 : width * 0.16;
    const areaHeight = isMobile ? height * 0.28 : height * 0.32;
    
    // Áreas de penalty con brillo
    ctx.strokeRect(width * 0.05, height * 0.5 - areaHeight/2, areaWidth, areaHeight);
    ctx.strokeRect(width * 0.95 - areaWidth, height * 0.5 - areaHeight/2, areaWidth, areaHeight);
    
    // Arcos de penalty con efecto neón
    const arcRadius = isMobile ? width * 0.08 : width * 0.1;
    
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 12;
    
    // Arco izquierdo
    ctx.beginPath();
    ctx.arc(width * 0.17, height * 0.5, arcRadius, -Math.PI/3, Math.PI/3);
    ctx.stroke();
    
    // Arco derecho
    ctx.beginPath();
    ctx.arc(width * 0.83, height * 0.5, arcRadius, 2*Math.PI/3, 4*Math.PI/3);
    ctx.stroke();
    
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 8;
}

function drawIlluminatedGoalAreas(ctx, width, height, isMobile) {
    const areaWidth = isMobile ? width * 0.07 : width * 0.09;
    const areaHeight = isMobile ? height * 0.16 : height * 0.19;
    
    // Áreas de gol con brillo azul
    ctx.shadowColor = '#0088ff';
    ctx.shadowBlur = 10;
    
    ctx.strokeRect(width * 0.05, height * 0.5 - areaHeight/2, areaWidth, areaHeight);
    ctx.strokeRect(width * 0.95 - areaWidth, height * 0.5 - areaHeight/2, areaWidth, areaHeight);
    
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 8;
}

function drawIlluminatedCornerArcs(ctx, width, height, isMobile) {
    const radius = isMobile ? 12 : 18;
    
    // Esquinas con efecto de resplandor
    ctx.shadowColor = '#ff8800';
    ctx.shadowBlur = 15;
    
    // Esquina superior izquierda
    ctx.beginPath();
    ctx.arc(width * 0.05, height * 0.1, radius, 0, Math.PI/2);
    ctx.stroke();
    
    // Esquina superior derecha
    ctx.beginPath();
    ctx.arc(width * 0.95, height * 0.1, radius, Math.PI/2, Math.PI);
    ctx.stroke();
    
    // Esquina inferior izquierda
    ctx.beginPath();
    ctx.arc(width * 0.05, height * 0.9, radius, -Math.PI/2, 0);
    ctx.stroke();
    
    // Esquina inferior derecha
    ctx.beginPath();
    ctx.arc(width * 0.95, height * 0.9, radius, Math.PI, 3*Math.PI/2);
    ctx.stroke();
    
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 8;
}

function drawIlluminatedPenaltySpots(ctx, width, height, isMobile) {
    const spotSize = isMobile ? 4 : 6;
    
    // Spots con efecto de brillo pulsante
    const time = Date.now() * 0.004;
    const pulseIntensity = 0.7 + 0.3 * Math.sin(time);
    
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 20;
    ctx.globalAlpha = pulseIntensity;
    
    // Spot izquierdo
    ctx.beginPath();
    ctx.arc(width * 0.17, height * 0.5, spotSize, 0, 2 * Math.PI);
    ctx.fill();
    
    // Spot derecho
    ctx.beginPath();
    ctx.arc(width * 0.83, height * 0.5, spotSize, 0, 2 * Math.PI);
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
