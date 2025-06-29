export default class DrawingManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.drawnElements = [];
        this.ballImage = new Image();
        this.ballImage.src = 'img/ball.png';
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));

        // Cambiar cursor al entrar al canvas
        this.canvas.addEventListener('mouseenter', () => {
            if (this.isDrawingMode) {
                this.canvas.style.cursor = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'%3E%3Cpath d=\'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z\' fill=\'%23ffffff\'/%3E%3C/svg%3E") 0 24, auto';
            }
        });
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        this.canvas.addEventListener('touchend', () => {
            const mouseEvent = new MouseEvent('mouseup', {});
            this.canvas.dispatchEvent(mouseEvent);
        });
    }
    
    startDrawing(e) {
        this.isDrawing = true;
        this.lastX = e.offsetX;
        this.lastY = e.offsetY;
    }
    
    draw(e) {
        if (!this.isDrawing) return;
        
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(e.offsetX, e.offsetY);
        this.ctx.stroke();
        
        this.lastX = e.offsetX;
        this.lastY = e.offsetY;
    }
    
    stopDrawing() {
        this.isDrawing = false;
    }
    
    drawBall(x, y) {
        const ballSize = 30;
        this.ctx.drawImage(
            this.ballImage, 
            x - ballSize/2, 
            y - ballSize/2, 
            ballSize, 
            ballSize
        );
    }
    
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawnElements = [];
    }
    
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }
}