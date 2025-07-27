// fieldStyleModern.js - Estilo moderno de cancha
export function drawModernField(canvas, ctx) {
    const cssWidth = parseFloat(canvas.style.width) || canvas.width;
    const cssHeight = parseFloat(canvas.style.height) || canvas.height;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     window.innerWidth <= 768 || cssWidth <= 768;

    console.log(`🏟️ Dibujando campo estilo MODERNO - ${cssWidth}x${cssHeight}`);
    
    // Limpiar canvas
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    
    // Fondo moderno con gradiente radial
    const centerX = cssWidth / 2;
    const centerY = cssHeight / 2;
    const radius = Math.max(cssWidth, cssHeight) * 0.7;
    
    const radialGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    radialGradient.addColorStop(0, '#4a934a');
    radialGradient.addColorStop(0.6, '#3a803a');
    radialGradient.addColorStop(1, '#2a6a2a');
    ctx.fillStyle = radialGradient;
    ctx.fillRect(0, 0, cssWidth, cssHeight);
    
    // Patrón geométrico moderno
    drawModernPattern(ctx, cssWidth, cssHeight);
    
    // Configuración de líneas modernas (más gruesas y nítidas)
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = Math.max(3, cssWidth * 0.004);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 0.95;
    ctx.shadowBlur = 2;
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    
    // Elementos del campo modernos
    drawModernFieldBorder(ctx, cssWidth, cssHeight);
    drawModernCenterLine(ctx, cssWidth, cssHeight);
    drawModernCenterCircle(ctx, cssWidth, cssHeight, isMobile);
    drawModernPenaltyAreas(ctx, cssWidth, cssHeight, isMobile);
    drawModernGoalAreas(ctx, cssWidth, cssHeight, isMobile);
    drawModernCornerArcs(ctx, cssWidth, cssHeight, isMobile);
    drawModernPenaltySpots(ctx, cssWidth, cssHeight, isMobile);
    drawTechnicalAreas(ctx, cssWidth, cssHeight, isMobile);
    
    // Quitar sombra
    ctx.shadowBlur = 0;
}

function drawModernPattern(ctx, width, height) {
    // Patrón de diamantes sutil
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = '#ffffff';
    
    const diamondSize = 30;
    for (let x = 0; x < width; x += diamondSize * 2) {
        for (let y = 0; y < height; y += diamondSize * 2) {
            ctx.save();
            ctx.translate(x + diamondSize, y + diamondSize);
            ctx.rotate(Math.PI / 4);
            ctx.fillRect(-diamondSize/4, -diamondSize/4, diamondSize/2, diamondSize/2);
            ctx.restore();
        }
    }
    ctx.globalAlpha = 1;
}

function drawModernFieldBorder(ctx, width, height) {
    const borderRadius = 15;
    const x = width * 0.05;
    const y = height * 0.1;
    const w = width * 0.9;
    const h = height * 0.8;
    
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, borderRadius);
    ctx.stroke();
}

function drawModernCenterLine(ctx, width, height) {
    // Línea central con efectos
    ctx.beginPath();
    ctx.moveTo(width * 0.5, height * 0.1);
    ctx.lineTo(width * 0.5, height * 0.9);
    ctx.stroke();
    
    // Decoración en el centro
    ctx.fillRect(width * 0.498, height * 0.48, width * 0.004, height * 0.04);
}

function drawModernCenterCircle(ctx, width, height, isMobile) {
    const radius = isMobile ? Math.min(width, height) * 0.09 : Math.min(width, height) * 0.11;
    
    // Círculo principal
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.5, radius, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Círculo interior decorativo
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.5, radius * 0.7, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.globalAlpha = 1;
    
    // Punto central moderno (cuadrado)
    const spotSize = 4;
    ctx.fillRect(width * 0.5 - spotSize/2, height * 0.5 - spotSize/2, spotSize, spotSize);
}

function drawModernPenaltyAreas(ctx, width, height, isMobile) {
    const areaWidth = isMobile ? width * 0.13 : width * 0.16;
    const areaHeight = isMobile ? height * 0.28 : height * 0.32;
    const radius = 8;
    
    // Área izquierda
    ctx.beginPath();
    ctx.roundRect(width * 0.05, height * 0.5 - areaHeight/2, areaWidth, areaHeight, [0, radius, radius, 0]);
    ctx.stroke();
    
    // Área derecha
    ctx.beginPath();
    ctx.roundRect(width * 0.95 - areaWidth, height * 0.5 - areaHeight/2, areaWidth, areaHeight, [radius, 0, 0, radius]);
    ctx.stroke();
    
    // Arcos de penalty modernos
    const arcRadius = isMobile ? width * 0.08 : width * 0.1;
    
    // Arco izquierdo
    ctx.beginPath();
    ctx.arc(width * 0.17, height * 0.5, arcRadius, -Math.PI/3, Math.PI/3);
    ctx.stroke();
    
    // Arco derecho
    ctx.beginPath();
    ctx.arc(width * 0.83, height * 0.5, arcRadius, 2*Math.PI/3, 4*Math.PI/3);
    ctx.stroke();
}

function drawModernGoalAreas(ctx, width, height, isMobile) {
    const areaWidth = isMobile ? width * 0.07 : width * 0.09;
    const areaHeight = isMobile ? height * 0.16 : height * 0.19;
    const radius = 5;
    
    // Área izquierda
    ctx.beginPath();
    ctx.roundRect(width * 0.05, height * 0.5 - areaHeight/2, areaWidth, areaHeight, [0, radius, radius, 0]);
    ctx.stroke();
    
    // Área derecha
    ctx.beginPath();
    ctx.roundRect(width * 0.95 - areaWidth, height * 0.5 - areaHeight/2, areaWidth, areaHeight, [radius, 0, 0, radius]);
    ctx.stroke();
}

function drawModernCornerArcs(ctx, width, height, isMobile) {
    const radius = isMobile ? 10 : 15;
    const lineWidth = ctx.lineWidth;
    ctx.lineWidth = lineWidth * 1.5;
    
    // Esquinas con arcos más amplios
    // Superior izquierda
    ctx.beginPath();
    ctx.arc(width * 0.05, height * 0.1, radius, 0, Math.PI/2);
    ctx.stroke();
    
    // Superior derecha
    ctx.beginPath();
    ctx.arc(width * 0.95, height * 0.1, radius, Math.PI/2, Math.PI);
    ctx.stroke();
    
    // Inferior izquierda
    ctx.beginPath();
    ctx.arc(width * 0.05, height * 0.9, radius, -Math.PI/2, 0);
    ctx.stroke();
    
    // Inferior derecha
    ctx.beginPath();
    ctx.arc(width * 0.95, height * 0.9, radius, Math.PI, 3*Math.PI/2);
    ctx.stroke();
    
    ctx.lineWidth = lineWidth;
}

function drawModernPenaltySpots(ctx, width, height, isMobile) {
    const spotSize = isMobile ? 3 : 4;
    
    // Spots con forma moderna (hexagonal)
    drawHexagonalSpot(ctx, width * 0.17, height * 0.5, spotSize);
    drawHexagonalSpot(ctx, width * 0.83, height * 0.5, spotSize);
}

function drawHexagonalSpot(ctx, x, y, size) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const pointX = x + size * Math.cos(angle);
        const pointY = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(pointX, pointY);
        else ctx.lineTo(pointX, pointY);
    }
    ctx.closePath();
    ctx.fill();
}

function drawTechnicalAreas(ctx, width, height, isMobile) {
    const areaLength = isMobile ? width * 0.08 : width * 0.1;
    const areaDepth = isMobile ? height * 0.03 : height * 0.04;
    
    ctx.globalAlpha = 0.6;
    
    // Área técnica izquierda
    ctx.strokeRect(width * 0.05 - areaDepth, height * 0.5 - areaLength/2, areaDepth, areaLength);
    
    // Área técnica derecha
    ctx.strokeRect(width * 0.95, height * 0.5 - areaLength/2, areaDepth, areaLength);
    
    ctx.globalAlpha = 1;
}
