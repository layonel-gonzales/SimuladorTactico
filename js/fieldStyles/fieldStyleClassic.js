/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🏟️ ESTILO CLÁSICO DE CAMPO - CAPA BASE (z-index: 1)
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * AISLAMIENTO: Este estilo SOLO afecta al Canvas 2D del campo.
 * - No modifica ningún elemento HTML
 * - No afecta a las cards de jugadores (CAPA z-index: 20)
 * - Usa exclusivamente ctx.* (API de Canvas)
 * 
 * INDEPENDENCIA: Cambiar el estilo del campo NO afecta a las cards.
 * Las cards siempre flotan por encima del campo.
 * ═══════════════════════════════════════════════════════════════════════
 */

// fieldStyleClassic.js - Estilo clásico de cancha
function drawClassicField(canvas, ctx) {
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
    // Márgenes mínimos - las líneas ocupan casi todo el espacio
    const margin = Math.max(3, width * 0.005);
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);
}

function drawCenterLine(ctx, width, height) {
    const margin = Math.max(3, width * 0.005);
    ctx.beginPath();
    ctx.moveTo(width * 0.5, margin);
    ctx.lineTo(width * 0.5, height - margin);
    ctx.stroke();
}

function drawCenterCircle(ctx, width, height, isMobile) {
    const radius = Math.min(width, height) * 0.09;
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.5, radius, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Punto central
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.5, 3, 0, 2 * Math.PI);
    ctx.fill();
}

function drawPenaltyAreas(ctx, width, height, isMobile) {
    const margin = Math.max(3, width * 0.005);
    const areaWidth = width * 0.16;
    const areaHeight = height * 0.44;
    
    // Área izquierda (empieza desde el borde)
    ctx.strokeRect(margin, height * 0.5 - areaHeight/2, areaWidth, areaHeight);
    
    // Área derecha (termina en el borde)
    ctx.strokeRect(width - margin - areaWidth, height * 0.5 - areaHeight/2, areaWidth, areaHeight);
}

function drawGoalAreas(ctx, width, height, isMobile) {
    const margin = Math.max(3, width * 0.005);
    const areaWidth = width * 0.055;
    const areaHeight = height * 0.2;
    
    // Área izquierda
    ctx.strokeRect(margin, height * 0.5 - areaHeight/2, areaWidth, areaHeight);
    
    // Área derecha
    ctx.strokeRect(width - margin - areaWidth, height * 0.5 - areaHeight/2, areaWidth, areaHeight);
}

function drawCornerArcs(ctx, width, height, isMobile) {
    const margin = Math.max(3, width * 0.005);
    const radius = Math.min(width, height) * 0.02;
    
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
}

function drawPenaltySpots(ctx, width, height, isMobile) {
    const margin = Math.max(3, width * 0.005);
    const spotSize = 3;
    // Distancia del penalty: 11m desde la línea de gol (en un campo de 105m = ~10.5%)
    const penaltyDist = width * 0.105;
    
    // Spot izquierdo
    ctx.beginPath();
    ctx.arc(margin + penaltyDist, height * 0.5, spotSize, 0, 2 * Math.PI);
    ctx.fill();
    
    // Spot derecho
    ctx.beginPath();
    ctx.arc(width - margin - penaltyDist, height * 0.5, spotSize, 0, 2 * Math.PI);
    ctx.fill();
}

// Registrar estilo en el sistema global
if (window.styleRegistry) {
    window.styleRegistry.registerFieldStyle('classic', {
        name: 'Clásico',
        description: 'Estilo clásico de cancha de fútbol',
        icon: '⚽',
        drawFunction: drawClassicField
    });
    console.log('✅ Estilo de campo clásico registrado');
}
