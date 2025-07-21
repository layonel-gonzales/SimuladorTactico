export function drawFootballField(canvas, ctx) {
    // Obtener dimensiones CSS reales para un escalado consistente
    const cssWidth = parseFloat(canvas.style.width) || canvas.width;
    const cssHeight = parseFloat(canvas.style.height) || canvas.height;
    
    // NUEVA: Detectar dispositivo móvil para ajustar proporciones
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     window.innerWidth <= 768 || cssWidth <= 768;
    
    console.log(`fieldDrawer.js: Dibujando campo - CSS: ${cssWidth}x${cssHeight}, Canvas: ${canvas.width}x${canvas.height}, Móvil: ${isMobile}`);
    
    // Limpiar canvas
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    
    // MEJORA: Césped más realista con múltiples capas
    // Fondo base
    const baseGradient = ctx.createLinearGradient(0, 0, 0, cssHeight);
    baseGradient.addColorStop(0, '#2d8a2d');
    baseGradient.addColorStop(0.5, '#3caa3c');
    baseGradient.addColorStop(1, '#2d8a2d');
    ctx.fillStyle = baseGradient;
    ctx.fillRect(0, 0, cssWidth, cssHeight);
    
    // Rayas del césped (efecto realista)
    drawGrassStripes(ctx, cssWidth, cssHeight);
    
    // MEJORA: Configuración de líneas más realista
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    // Líneas más gruesas y con mejor antialiasing - usando CSS width para consistencia
    ctx.lineWidth = Math.max(2, cssWidth * 0.003); // Líneas proporcionales
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 0.9; // Ligeramente más opacas
    
    // Habilitar antialiasing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Bordes del campo con esquinas redondeadas
    drawRoundedField(ctx, cssWidth, cssHeight);

    // Línea central con mejor estilo
    drawCenterLine(ctx, cssWidth, cssHeight);

    // Círculo central con mejor definición
    drawCenterCircle(ctx, cssWidth, cssHeight, isMobile);

    // Áreas mejoradas con tamaños adaptativos para móvil
    drawPenaltyArea(ctx, cssWidth, cssHeight, 0, 'left', isMobile);
    drawPenaltyArea(ctx, cssWidth, cssHeight, cssWidth, 'right', isMobile);

    // Puntos de penalti mejorados
    drawPenaltySpots(ctx, cssWidth, cssHeight, isMobile);
    
    // NUEVO: Dibujar arcos/porterías más realistas
    console.log(`[fieldDrawer] Llamando a drawGoalPosts con dimensiones: ${cssWidth}x${cssHeight}, móvil: ${isMobile}`);
    drawGoalPosts(ctx, cssWidth, cssHeight, isMobile);
    
    // Esquinas del campo
    drawCornerArcs(ctx, cssWidth, cssHeight, isMobile);
    
    // Restaurar opacidad
    ctx.globalAlpha = 1.0;
}

// NUEVA: Función para dibujar rayas del césped
function drawGrassStripes(ctx, width, height) {
    const stripeWidth = width / 20;
    ctx.globalAlpha = 0.1;
    
    for (let i = 0; i < 20; i++) {
        if (i % 2 === 0) {
            ctx.fillStyle = '#1a5f1a';
            ctx.fillRect(i * stripeWidth, 0, stripeWidth, height);
        }
    }
    ctx.globalAlpha = 1.0;
}

// NUEVA: Campo con esquinas redondeadas
function drawRoundedField(ctx, width, height) {
    const cornerRadius = Math.min(width, height) * 0.01;
    ctx.beginPath();
    ctx.roundRect(0, 0, width, height, cornerRadius);
    ctx.stroke();
}

// NUEVA: Línea central mejorada
function drawCenterLine(ctx, width, height) {
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
}

// NUEVA: Círculo central con mejor definición
function drawCenterCircle(ctx, width, height, isMobile = false) {
    const centerX = width / 2;
    const centerY = height / 2;
    // MÓVIL: Círculo central más pequeño para ganar espacio
    const baseRadius = Math.min(width, height) * 0.13;
    const radius = isMobile ? baseRadius * 0.75 : baseRadius; // 25% más pequeño en móvil
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Punto central (también más pequeño en móvil)
    const spotSize = Math.max(2, width * 0.002);
    const centerSpot = isMobile ? spotSize * 0.8 : spotSize;
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerSpot, 0, Math.PI * 2);
    ctx.fill();
}

// NUEVA: Puntos de penalti mejorados
function drawPenaltySpots(ctx, width, height, isMobile = false) {
    const spotRadius = Math.max(3, width * 0.003);
    
    // CORRECCIÓN: Los puntos de penal DENTRO del área penal, como en tu imagen de referencia
    // Calcular posición basada en el área penal, no valores fijos
    let areaWidth;
    if (isMobile) {
        areaWidth = width * 0.08;  // Mismo cálculo que en drawPenaltyArea
    } else {
        areaWidth = width * 0.13;  // Mismo cálculo que en drawPenaltyArea
    }
    
    // CORRECCIÓN: Puntos en el MEDIO entre el arco y el área, como en tu imagen
    // El arco está en el borde (0 o width), el área termina en areaWidth
    // El medio sería aproximadamente en la mitad de esa distancia
    const leftSpotX = areaWidth * 0.5;   // 50% del área = mitad entre arco y área
    const rightSpotX = width - (areaWidth * 0.5); // 50% del área desde el otro lado
    
    console.log(`[fieldDrawer] Puntos de penal - Izquierdo: ${leftSpotX}, Derecho: ${rightSpotX}, Área width: ${areaWidth}`);
    
    // Punto penal izquierdo (dentro del área)
    ctx.beginPath();
    ctx.arc(leftSpotX, height / 2, spotRadius, 0, Math.PI * 2);
    ctx.fill();

    // Punto penal derecho (dentro del área)
    ctx.beginPath();
    ctx.arc(rightSpotX, height / 2, spotRadius, 0, Math.PI * 2);
    ctx.fill();
}

// NUEVA: Esquinas del campo
function drawCornerArcs(ctx, width, height, isMobile = false) {
    // MÓVIL: Arcos de esquina más pequeños para ganar espacio
    const baseArcRadius = Math.min(width, height) * 0.02;
    const arcRadius = isMobile ? baseArcRadius * 0.6 : baseArcRadius; // 40% más pequeño en móvil
    
    const positions = [
        [0, 0], [width, 0], 
        [0, height], [width, height]
    ];
    
    positions.forEach(([x, y]) => {
        ctx.beginPath();
        const startAngle = x === 0 ? (y === 0 ? 0 : Math.PI * 1.5) : (y === 0 ? Math.PI * 0.5 : Math.PI);
        ctx.arc(x, y, arcRadius, startAngle, startAngle + Math.PI * 0.5);
        ctx.stroke();
    });
}

function drawPenaltyArea(ctx, width, height, x, side, isMobile = false) {
    const isRight = side === 'right';
    
    // MÓVIL: Áreas penales MUY reducidas para ganar espacio para jugadores
    let areaWidth, areaHeight;
    if (isMobile) {
        areaWidth = width * 0.06;  // REDUCIDA AÚN MÁS: de 0.08 a 0.06 (más compacta)
        areaHeight = height * 0.25; // REDUCIDA AÚN MÁS: de 0.30 a 0.25 (más compacta)
    } else {
        areaWidth = width * 0.10;   // REDUCIDA: de 0.13 a 0.10 (23% más pequeña)
        areaHeight = height * 0.35;  // REDUCIDA: de 0.42 a 0.35 (17% más pequeña)
    }

    // Área grande (área penal)
    const areaX = isRight ? x - areaWidth : x;
    ctx.strokeRect(areaX, (height - areaHeight) / 2, areaWidth, areaHeight);

    // NUEVO: Dibujar arco/portería realista basado en referencia
    let goalWidth, goalHeight;
    if (isMobile) {
        goalWidth = areaWidth * 0.35;   // Más estrecho en móvil
        goalHeight = areaHeight * 0.35; // Más bajo en móvil
    } else {
        goalWidth = areaWidth * 0.4;    // Ancho del arco
        goalHeight = areaHeight * 0.4;  // Alto del arco
    }
    
    // Posición del arco (centrado verticalmente)
    const goalX = isRight ? x - goalWidth : x;
    const goalY = (height - goalHeight) / 2;
    
    // Dibujar línea del arco (solo la línea de gol, no el arco completo)
    ctx.beginPath();
    ctx.moveTo(isRight ? x : x, goalY);
    ctx.lineTo(isRight ? x : x, goalY + goalHeight);
    ctx.stroke();
    
    // Área pequeña (área de portería) - MÁS PEQUEÑA Y COMPACTA
    let smallWidth, smallHeight;
    if (isMobile) {
        smallWidth = areaWidth * 0.20;  // REDUCIDA de 0.25 a 0.20 (más pequeña)
        smallHeight = areaHeight * 0.20; // REDUCIDA de 0.25 a 0.20 (más pequeña)
    } else {
        smallWidth = areaWidth * 0.22;   // REDUCIDA de 0.3 a 0.22 (más compacta)
        smallHeight = areaHeight * 0.22; // REDUCIDA de 0.3 a 0.22 (más compacta)
    }
    
    const smallX = isRight ? x - smallWidth : x;
    ctx.strokeRect(smallX, (height - smallHeight) / 2, smallWidth, smallHeight);

    // Arco semicircular del área penal - CORREGIDO: hacia afuera como en tu imagen
    let arcRadius;
    if (isMobile) {
        arcRadius = Math.min(width, height) * 0.05; // REDUCIDO MÁS: de 0.06 a 0.05 (proporcional al área)
    } else {
        arcRadius = Math.min(width, height) * 0.07; // REDUCIDO: de 0.09 a 0.07 (proporcional al área)
    }
    
    // CORRECCIÓN: El semicírculo debe ir hacia AFUERA del área, no hacia adentro
    const arcX = isRight ? x - areaWidth : x + areaWidth;
    ctx.beginPath();
    ctx.arc(arcX, height / 2, arcRadius, 
            isRight ? Math.PI/2 : -Math.PI/2,     // CAMBIADO: direcciones invertidas
            isRight ? 3*Math.PI/2 : Math.PI/2);   // para que el arco vaya hacia afuera
    ctx.stroke();
}

// NUEVA: Función para dibujar arcos/porterías realistas basada en imagen de referencia
function drawGoalPosts(ctx, width, height, isMobile = false) {
    console.log(`[fieldDrawer] Dibujando arcos - Móvil: ${isMobile}, Dimensiones: ${width}x${height}`);
    
    // Configurar estilo de líneas para los arcos
    const originalLineWidth = ctx.lineWidth;
    const originalStrokeStyle = ctx.strokeStyle;
    
    ctx.lineWidth = Math.max(2, width * 0.003); // Líneas visibles pero proporcionales
    ctx.strokeStyle = '#ffffff'; // Blanco puro
    
    // Dimensiones del arco basadas EXACTAMENTE en tu imagen de referencia
    let goalWidth, goalHeight;
    if (isMobile) {
        goalWidth = width * 0.022;   // Más estrecho para móvil
        goalHeight = height * 0.18;  // AGRANDADO: de 0.12 a 0.18 (50% más alto)
    } else {
        goalWidth = width * 0.028;   // Más estrecho para ser rectangular
        goalHeight = height * 0.22;  // AGRANDADO: de 0.14 a 0.22 (57% más alto)
    }
    
    console.log(`[fieldDrawer] Dimensiones arco - Ancho: ${goalWidth}, Alto: ${goalHeight}`);
    
    // ARCO IZQUIERDO - Como en tu imagen de referencia
    const leftGoalX = 0;
    const leftGoalY = (height - goalHeight) / 2;
    
    console.log(`[fieldDrawer] Arco izquierdo en posición: ${leftGoalX}, ${leftGoalY}`);
    
    // Dibujar marco completo del arco izquierdo (forma cerrada como en referencia)
    ctx.beginPath();
    // Línea vertical izquierda (fuera del campo)
    ctx.moveTo(leftGoalX - goalWidth, leftGoalY);
    ctx.lineTo(leftGoalX - goalWidth, leftGoalY + goalHeight);
    // Línea horizontal inferior
    ctx.lineTo(leftGoalX, leftGoalY + goalHeight);
    // Línea vertical derecha (línea de gol)
    ctx.lineTo(leftGoalX, leftGoalY);
    // Línea horizontal superior
    ctx.lineTo(leftGoalX - goalWidth, leftGoalY);
    ctx.stroke();
    
    // ARCO DERECHO - Como en tu imagen de referencia
    const rightGoalX = width;
    const rightGoalY = (height - goalHeight) / 2;
    
    console.log(`[fieldDrawer] Arco derecho en posición: ${rightGoalX}, ${rightGoalY}`);
    
    // Dibujar marco completo del arco derecho (forma cerrada como en referencia)
    ctx.beginPath();
    // Línea vertical izquierda (línea de gol)
    ctx.moveTo(rightGoalX, rightGoalY);
    ctx.lineTo(rightGoalX, rightGoalY + goalHeight);
    // Línea horizontal inferior
    ctx.lineTo(rightGoalX + goalWidth, rightGoalY + goalHeight);
    // Línea vertical derecha (fuera del campo)
    ctx.lineTo(rightGoalX + goalWidth, rightGoalY);
    // Línea horizontal superior
    ctx.lineTo(rightGoalX, rightGoalY);
    ctx.stroke();
    
    // Restaurar estilos originales
    ctx.lineWidth = originalLineWidth;
    ctx.strokeStyle = originalStrokeStyle;
    
    console.log(`[fieldDrawer] Arcos dibujados exitosamente con forma cerrada como referencia`);
}