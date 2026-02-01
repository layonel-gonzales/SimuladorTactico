// fieldStyleRetro.js - Estilo retro/vintage de cancha
function drawRetroField(canvas, ctx) {
    const cssWidth = parseFloat(canvas.style.width) || canvas.width;
    const cssHeight = parseFloat(canvas.style.height) || canvas.height;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     window.innerWidth <= 768 || cssWidth <= 768;
    
    // Limpiar canvas
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    
    // Fondo retro con textura
    const retroGradient = ctx.createLinearGradient(0, 0, cssWidth, cssHeight);
    retroGradient.addColorStop(0, '#8B7355');
    retroGradient.addColorStop(0.3, '#6B5635');
    retroGradient.addColorStop(0.7, '#5B4625');
    retroGradient.addColorStop(1, '#4B3615');
    ctx.fillStyle = retroGradient;
    ctx.fillRect(0, 0, cssWidth, cssHeight);
    
    // Textura de tierra/césped viejo
    drawRetroTexture(ctx, cssWidth, cssHeight);
    
    // Configuración de líneas vintage
    ctx.strokeStyle = '#FFFACD'; // Color crema vintage
    ctx.fillStyle = '#FFFACD';
    ctx.lineWidth = Math.max(2, cssWidth * 0.0025); // Líneas más finas, estilo antiguo
    ctx.lineCap = 'square'; // Líneas cuadradas, no redondeadas
    ctx.lineJoin = 'miter';
    ctx.globalAlpha = 0.8; // Ligeramente desgastadas
    
    // Elementos del campo retro
    drawRetroFieldBorder(ctx, cssWidth, cssHeight);
    drawRetroCenterLine(ctx, cssWidth, cssHeight);
    drawRetroCenterCircle(ctx, cssWidth, cssHeight, isMobile);
    drawRetroPenaltyAreas(ctx, cssWidth, cssHeight, isMobile);
    drawRetroGoalAreas(ctx, cssWidth, cssHeight, isMobile);
    drawRetroCornerFlags(ctx, cssWidth, cssHeight, isMobile);
    drawRetroPenaltySpots(ctx, cssWidth, cssHeight, isMobile);
    drawRetroGoalPosts(ctx, cssWidth, cssHeight, isMobile);
    addVintageEffects(ctx, cssWidth, cssHeight);
}

function drawRetroTexture(ctx, width, height) {
    // Patrón de textura de campo viejo
    ctx.globalAlpha = 0.1;
    
    // Manchas irregulares de césped
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 20 + 5;
        
        ctx.fillStyle = Math.random() > 0.5 ? '#3a5a3a' : '#2a4a2a';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    // Rayas desgastadas
    ctx.fillStyle = '#4a6a4a';
    for (let i = 0; i < width; i += 40) {
        ctx.fillRect(i, 0, 15, height);
    }
    
    ctx.globalAlpha = 1;
}

function drawRetroFieldBorder(ctx, width, height) {
    // Borde simple, estilo años 50-60 - márgenes mínimos
    const margin = Math.max(3, width * 0.005);
    const borderX = margin;
    const borderY = margin;
    const borderW = width - margin * 2;
    const borderH = height - margin * 2;
    
    ctx.strokeRect(borderX, borderY, borderW, borderH);
    
    // Líneas dobles vintage
    ctx.globalAlpha = 0.5;
    ctx.strokeRect(borderX + 2, borderY + 2, borderW - 4, borderH - 4);
    ctx.globalAlpha = 0.8;
}

function drawRetroCenterLine(ctx, width, height) {
    const margin = Math.max(3, width * 0.005);
    // Línea central simple
    ctx.beginPath();
    ctx.moveTo(width * 0.5, margin);
    ctx.lineTo(width * 0.5, height - margin);
    ctx.stroke();
    
    // Marcas cada cierta distancia (estilo antiguo)
    const markSize = 3;
    for (let i = 0.15; i <= 0.85; i += 0.1) {
        ctx.fillRect(width * 0.5 - markSize/2, height * i - markSize/2, markSize, markSize);
    }
}

function drawRetroCenterCircle(ctx, width, height, isMobile) {
    const radius = Math.min(width, height) * 0.08;
    
    // Círculo central simple
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.5, radius, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Punto central cuadrado (estilo vintage)
    const spotSize = 6;
    ctx.fillRect(width * 0.5 - spotSize/2, height * 0.5 - spotSize/2, spotSize, spotSize);
    
    // Decoración retro alrededor del centro
    ctx.globalAlpha = 0.4;
    ctx.strokeRect(width * 0.5 - 15, height * 0.5 - 15, 30, 30);
    ctx.globalAlpha = 0.8;
}

function drawRetroPenaltyAreas(ctx, width, height, isMobile) {
    const margin = Math.max(3, width * 0.005);
    const areaWidth = width * 0.16;
    const areaHeight = height * 0.44;
    
    // Áreas rectangulares simples (empieza desde el borde)
    ctx.strokeRect(margin, height * 0.5 - areaHeight/2, areaWidth, areaHeight);
    ctx.strokeRect(width - margin - areaWidth, height * 0.5 - areaHeight/2, areaWidth, areaHeight);
    
    // Marcas adicionales vintage
    const markLength = width * 0.02;
    
    // Izquierda
    ctx.beginPath();
    ctx.moveTo(margin + areaWidth, height * 0.5 - markLength/2);
    ctx.lineTo(margin + areaWidth + markLength, height * 0.5 - markLength/2);
    ctx.lineTo(margin + areaWidth + markLength, height * 0.5 + markLength/2);
    ctx.lineTo(margin + areaWidth, height * 0.5 + markLength/2);
    ctx.stroke();
    
    // Derecha
    ctx.beginPath();
    ctx.moveTo(width - margin - areaWidth, height * 0.5 - markLength/2);
    ctx.lineTo(width - margin - areaWidth - markLength, height * 0.5 - markLength/2);
    ctx.lineTo(width - margin - areaWidth - markLength, height * 0.5 + markLength/2);
    ctx.lineTo(width - margin - areaWidth, height * 0.5 + markLength/2);
    ctx.stroke();
}

function drawRetroGoalAreas(ctx, width, height, isMobile) {
    const margin = Math.max(3, width * 0.005);
    const areaWidth = width * 0.055;
    const areaHeight = height * 0.2;
    
    // Áreas de gol pequeñas y simples
    ctx.strokeRect(margin, height * 0.5 - areaHeight/2, areaWidth, areaHeight);
    ctx.strokeRect(width - margin - areaWidth, height * 0.5 - areaHeight/2, areaWidth, areaHeight);
}

function drawRetroCornerFlags(ctx, width, height, isMobile) {
    const margin = Math.max(3, width * 0.005);
    // En lugar de arcos, dibujar pequeñas banderas de corner
    const flagHeight = 10;
    const flagWidth = 7;
    
    ctx.fillStyle = '#FFFACD';
    
    // Postes de las banderas en las esquinas reales
    ctx.fillRect(margin - 1, margin, 2, flagHeight);
    ctx.fillRect(width - margin - 1, margin, 2, flagHeight);
    ctx.fillRect(margin - 1, height - margin - flagHeight, 2, flagHeight);
    ctx.fillRect(width - margin - 1, height - margin - flagHeight, 2, flagHeight);
    
    // Banderas
    ctx.fillStyle = '#FF6B47'; // Color retro naranja
    ctx.fillRect(margin + 1, margin, flagWidth, flagHeight/2);
    ctx.fillRect(width - margin - flagWidth - 1, margin, flagWidth, flagHeight/2);
    ctx.fillRect(margin + 1, height - margin - flagHeight/2, flagWidth, flagHeight/2);
    ctx.fillRect(width - margin - flagWidth - 1, height - margin - flagHeight/2, flagWidth, flagHeight/2);
    
    ctx.fillStyle = '#FFFACD';
}

function drawRetroPenaltySpots(ctx, width, height, isMobile) {
    const margin = Math.max(3, width * 0.005);
    const spotSize = 5;
    const penaltyDist = width * 0.105;
    
    // Spots cuadrados vintage
    ctx.fillRect(margin + penaltyDist - spotSize/2, height * 0.5 - spotSize/2, spotSize, spotSize);
    ctx.fillRect(width - margin - penaltyDist - spotSize/2, height * 0.5 - spotSize/2, spotSize, spotSize);
    
    // Cruces pequeñas en los spots
    ctx.globalAlpha = 0.6;
    const crossSize = 2;
    ctx.fillRect(margin + penaltyDist - crossSize*2, height * 0.5 - crossSize/2, crossSize*4, crossSize);
    ctx.fillRect(margin + penaltyDist - crossSize/2, height * 0.5 - crossSize*2, crossSize, crossSize*4);
    ctx.fillRect(width - margin - penaltyDist - crossSize*2, height * 0.5 - crossSize/2, crossSize*4, crossSize);
    ctx.fillRect(width - margin - penaltyDist - crossSize/2, height * 0.5 - crossSize*2, crossSize, crossSize*4);
    ctx.globalAlpha = 0.8;
}

function drawRetroGoalPosts(ctx, width, height, isMobile) {
    const margin = Math.max(3, width * 0.005);
    const postWidth = 3;
    const postHeight = height * 0.12;
    
    ctx.fillStyle = '#F5F5DC'; // Color beige para los postes de madera
    
    // Postes izquierda (en el borde)
    ctx.fillRect(margin - postWidth/2, height * 0.5 - postHeight/2, postWidth, postHeight);
    
    // Postes derecha (en el borde)
    ctx.fillRect(width - margin - postWidth/2, height * 0.5 - postHeight/2, postWidth, postHeight);
    
    ctx.fillStyle = '#FFFACD';
}

function addVintageEffects(ctx, width, height) {
    // Efectos de envejecimiento
    ctx.globalAlpha = 0.1;
    
    // Manchas de edad
    const numStains = 20;
    for (let i = 0; i < numStains; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = Math.random() * 30 + 10;
        
        const stainGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        stainGradient.addColorStop(0, 'rgba(139, 69, 19, 0.3)');
        stainGradient.addColorStop(1, 'rgba(139, 69, 19, 0)');
        
        ctx.fillStyle = stainGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    // Efecto de viñeta
    const vignetteGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height) * 0.8);
    vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    
    ctx.fillStyle = vignetteGradient;
    ctx.fillRect(0, 0, width, height);
    
    ctx.globalAlpha = 1;
}

// Registrar estilo en el sistema global
if (window.styleRegistry) {
    window.styleRegistry.registerFieldStyle('retro', {
        name: 'Retro',
        description: 'Estilo vintage de los 80s-90s',
        icon: '📺',
        drawFunction: drawRetroField
    });
}
