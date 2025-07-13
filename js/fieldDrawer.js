export function drawFootballField(canvas, ctx) {
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Césped con degradado
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#2d8a2d');
    gradient.addColorStop(1, '#3caa3c');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Líneas blancas
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.8;
    
    // Bordes del campo (ahora ocupan todo el canvas)
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Línea central
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    // Círculo central
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) * 0.13, 0, Math.PI * 2);
    ctx.stroke();

    // Área izquierda
    drawPenaltyArea(ctx, canvas, 0, 'left');
    // Área derecha
    drawPenaltyArea(ctx, canvas, canvas.width, 'right');

    // Punto penal izquierdo
    ctx.beginPath();
    ctx.arc(canvas.width * 0.15, canvas.height / 2, 5, 0, Math.PI * 2);
    ctx.fill();

    // Punto penal derecho
    ctx.beginPath();
    ctx.arc(canvas.width * 0.85, canvas.height / 2, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Restaurar opacidad
    ctx.globalAlpha = 1.0;
}

function drawPenaltyArea(ctx, canvas, x, side) {
    const isRight = side === 'right';
    const width = canvas.width * 0.13; // área grande más pequeña
    const height = canvas.height * 0.42; // área grande más pequeña

    // Área grande
    const areaX = isRight ? x - width : x;
    ctx.strokeRect(areaX, (canvas.height - height) / 2, width, height);

    // Área pequeña
    const smallWidth = width * 0.45;
    const smallHeight = height * 0.45;
    const smallX = isRight ? x - smallWidth : x;
    ctx.strokeRect(smallX, (canvas.height - smallHeight) / 2, smallWidth, smallHeight);

    // Arco semicircular
    const arcRadius = Math.min(canvas.width, canvas.height) * 0.09;
    const arcX = isRight ? x - width : x + width;
    ctx.beginPath();
    ctx.arc(arcX, canvas.height / 2, arcRadius, 
            isRight ? -Math.PI/2 : Math.PI/2, 
            isRight ? Math.PI/2 : 3*Math.PI/2);
    ctx.stroke();
}