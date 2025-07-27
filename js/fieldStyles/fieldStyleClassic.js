// fieldStyleClassic.js - Estilo clásico de cancha
export function drawClassicField(canvas, ctx) {
    const cssWidth = parseFloat(canvas.style.width) || canvas.width;
    const cssHeight = parseFloat(canvas.style.height) || canvas.height;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     window.innerWidth <= 768 || cssWidth <= 768;

    console.log(`🏟️ Dibujando campo estilo CLÁSICO - ${cssWidth}x${cssHeight}`);
    
    // Limpiar canvas
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    
    // Fondo base verde clásico
    const baseGradient = ctx.createLinearGradient(0, 0, 0, cssHeight);
    baseGradient.addColorStop(0, '#2d8a2d');
    baseGradient.addColorStop(0.5, '#3caa3c');
    baseGradient.addColorStop(1, '#2d8a2d');
    ctx.fillStyle = baseGradient;
    ctx.fillRect(0, 0, cssWidth, cssHeight);
    
    // Rayas del césped tradicionales
    drawClassicGrassStripes(ctx, cssWidth, cssHeight);
    
    // Configuración de líneas
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = Math.max(2, cssWidth * 0.003);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 0.9;
    
    // Elementos del campo
    drawFieldBorder(ctx, cssWidth, cssHeight);
    drawCenterLine(ctx, cssWidth, cssHeight);
    drawCenterCircle(ctx, cssWidth, cssHeight, isMobile);
    drawPenaltyAreas(ctx, cssWidth, cssHeight, isMobile);
    drawGoalAreas(ctx, cssWidth, cssHeight, isMobile);
    drawCornerArcs(ctx, cssWidth, cssHeight, isMobile);
    drawPenaltySpots(ctx, cssWidth, cssHeight, isMobile);
}

function drawClassicGrassStripes(ctx, width, height) {
    const stripeWidth = width / 12;
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < 12; i++) {
        if (i % 2 === 0) {
            ctx.fillStyle = '#1a5a1a';
            ctx.fillRect(i * stripeWidth, 0, stripeWidth, height);
        }
    }
    ctx.globalAlpha = 1;
}

function drawFieldBorder(ctx, width, height) {
    ctx.strokeRect(width * 0.05, height * 0.1, width * 0.9, height * 0.8);
}

function drawCenterLine(ctx, width, height) {
    ctx.beginPath();
    ctx.moveTo(width * 0.5, height * 0.1);
    ctx.lineTo(width * 0.5, height * 0.9);
    ctx.stroke();
}

function drawCenterCircle(ctx, width, height, isMobile) {
    const radius = isMobile ? Math.min(width, height) * 0.08 : Math.min(width, height) * 0.1;
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.5, radius, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Punto central
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.5, 3, 0, 2 * Math.PI);
    ctx.fill();
}

function drawPenaltyAreas(ctx, width, height, isMobile) {
    const areaWidth = isMobile ? width * 0.12 : width * 0.15;
    const areaHeight = isMobile ? height * 0.25 : height * 0.3;
    
    // Área izquierda
    ctx.strokeRect(width * 0.05, height * 0.5 - areaHeight/2, areaWidth, areaHeight);
    
    // Área derecha
    ctx.strokeRect(width * 0.95 - areaWidth, height * 0.5 - areaHeight/2, areaWidth, areaHeight);
}

function drawGoalAreas(ctx, width, height, isMobile) {
    const areaWidth = isMobile ? width * 0.06 : width * 0.08;
    const areaHeight = isMobile ? height * 0.15 : height * 0.18;
    
    // Área izquierda
    ctx.strokeRect(width * 0.05, height * 0.5 - areaHeight/2, areaWidth, areaHeight);
    
    // Área derecha
    ctx.strokeRect(width * 0.95 - areaWidth, height * 0.5 - areaHeight/2, areaWidth, areaHeight);
}

function drawCornerArcs(ctx, width, height, isMobile) {
    const radius = isMobile ? 8 : 12;
    
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
}

function drawPenaltySpots(ctx, width, height, isMobile) {
    const spotSize = isMobile ? 2 : 3;
    
    // Spot izquierdo
    ctx.beginPath();
    ctx.arc(width * 0.17, height * 0.5, spotSize, 0, 2 * Math.PI);
    ctx.fill();
    
    // Spot derecho
    ctx.beginPath();
    ctx.arc(width * 0.83, height * 0.5, spotSize, 0, 2 * Math.PI);
    ctx.fill();
}
