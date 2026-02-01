// fieldStyleModern.js - Estilo moderno de cancha
function drawModernField(canvas, ctx) {
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
    // Márgenes mínimos - las líneas ocupan casi todo el espacio
    const margin = Math.max(3, width * 0.005);
    const x = margin;
    const y = margin;
    const w = width - margin * 2;
    const h = height - margin * 2;
    
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, borderRadius);
    ctx.stroke();
}

function drawModernCenterLine(ctx, width, height) {
    const margin = Math.max(3, width * 0.005);
    // Línea central con efectos
    ctx.beginPath();
    ctx.moveTo(width * 0.5, margin);
    ctx.lineTo(width * 0.5, height - margin);
    ctx.stroke();
    
    // Decoración en el centro
    ctx.fillRect(width * 0.498, height * 0.48, width * 0.004, height * 0.04);
}

function drawModernCenterCircle(ctx, width, height, isMobile) {
    const radius = Math.min(width, height) * 0.1;
    
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
    const margin = Math.max(3, width * 0.005);
    const areaWidth = width * 0.16;
    const areaHeight = height * 0.44;
    const radius = 8;
    
    // Área izquierda (empieza desde el borde)
    ctx.beginPath();
    ctx.roundRect(margin, height * 0.5 - areaHeight/2, areaWidth, areaHeight, [0, radius, radius, 0]);
    ctx.stroke();
    
    // Área derecha (termina en el borde)
    ctx.beginPath();
    ctx.roundRect(width - margin - areaWidth, height * 0.5 - areaHeight/2, areaWidth, areaHeight, [radius, 0, 0, radius]);
    ctx.stroke();
    
    // Arcos de penalty modernos
    const penaltyDist = width * 0.105;
    const arcRadius = width * 0.09;
    
    // Arco izquierdo
    ctx.beginPath();
    ctx.arc(margin + penaltyDist, height * 0.5, arcRadius, -Math.PI/3, Math.PI/3);
    ctx.stroke();
    
    // Arco derecho
    ctx.beginPath();
    ctx.arc(width - margin - penaltyDist, height * 0.5, arcRadius, 2*Math.PI/3, 4*Math.PI/3);
    ctx.stroke();
}

function drawModernGoalAreas(ctx, width, height, isMobile) {
    const margin = Math.max(3, width * 0.005);
    const areaWidth = width * 0.055;
    const areaHeight = height * 0.2;
    const radius = 5;
    
    // Área izquierda
    ctx.beginPath();
    ctx.roundRect(margin, height * 0.5 - areaHeight/2, areaWidth, areaHeight, [0, radius, radius, 0]);
    ctx.stroke();
    
    // Área derecha
    ctx.beginPath();
    ctx.roundRect(width - margin - areaWidth, height * 0.5 - areaHeight/2, areaWidth, areaHeight, [radius, 0, 0, radius]);
    ctx.stroke();
}

function drawModernCornerArcs(ctx, width, height, isMobile) {
    const margin = Math.max(3, width * 0.005);
    const radius = Math.min(width, height) * 0.02;
    const lineWidth = ctx.lineWidth;
    ctx.lineWidth = lineWidth * 1.5;
    
    // Esquinas con arcos - ahora en los bordes reales
    // Superior izquierda
    ctx.beginPath();
    ctx.arc(margin, margin, radius, 0, Math.PI/2);
    ctx.stroke();
    
    // Superior derecha
    ctx.beginPath();
    ctx.arc(width - margin, margin, radius, Math.PI/2, Math.PI);
    ctx.stroke();
    
    // Inferior izquierda
    ctx.beginPath();
    ctx.arc(margin, height - margin, radius, -Math.PI/2, 0);
    ctx.stroke();
    
    // Inferior derecha
    ctx.beginPath();
    ctx.arc(width - margin, height - margin, radius, Math.PI, 3*Math.PI/2);
    ctx.stroke();
    
    ctx.lineWidth = lineWidth;
}

function drawModernPenaltySpots(ctx, width, height, isMobile) {
    const margin = Math.max(3, width * 0.005);
    const spotSize = 4;
    const penaltyDist = width * 0.105;
    
    // Spots con forma moderna (hexagonal)
    drawHexagonalSpot(ctx, margin + penaltyDist, height * 0.5, spotSize);
    drawHexagonalSpot(ctx, width - margin - penaltyDist, height * 0.5, spotSize);
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
    const margin = Math.max(3, width * 0.005);
    const areaLength = width * 0.08;
    const areaDepth = height * 0.03;
    
    ctx.globalAlpha = 0.6;
    
    // Área técnica izquierda (fuera del campo - no se dibuja si llega al borde)
    // Área técnica derecha (fuera del campo - no se dibuja si llega al borde)
    
    ctx.globalAlpha = 1;
}

// Registrar estilo en el sistema global
if (window.styleRegistry) {
    window.styleRegistry.registerFieldStyle('modern', {
        name: 'Moderno',
        description: 'Estilo moderno con efecto 3D',
        icon: '✨',
        drawFunction: drawModernField
    });
    console.log('✅ Estilo de campo moderno registrado');
}
