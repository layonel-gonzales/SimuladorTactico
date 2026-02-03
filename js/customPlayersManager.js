// customPlayersManager.js
// Sistema de gestión de jugadores personalizados usando localStorage

export default class CustomPlayersManager {
    constructor() {
        this.STORAGE_KEY = 'soccerTactics_customPlayers';
        this.TEAMS_KEY = 'soccerTactics_customTeams';
        this.customPlayers = [];
        this.customTeams = [];
        this.nextPlayerId = 1000; // IDs altos para evitar conflictos
        
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
    }

    // === GESTIÓN DE ALMACENAMIENTO ===
    
    loadFromStorage() {
        try {
            // Cargar jugadores personalizados
            const storedPlayers = localStorage.getItem(this.STORAGE_KEY);
            if (storedPlayers) {
                this.customPlayers = JSON.parse(storedPlayers);
                // Actualizar nextPlayerId para evitar conflictos
                if (this.customPlayers.length > 0) {
                    const maxId = Math.max(...this.customPlayers.map(p => p.id));
                    this.nextPlayerId = Math.max(this.nextPlayerId, maxId + 1);
                }
            }

            // Cargar equipos personalizados
            const storedTeams = localStorage.getItem(this.TEAMS_KEY);
            if (storedTeams) {
                this.customTeams = JSON.parse(storedTeams);
            }

        } catch (error) {
            console.error('[CustomPlayersManager] Error cargando desde localStorage:', error);
            this.customPlayers = [];
            this.customTeams = [];
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.customPlayers));
            localStorage.setItem(this.TEAMS_KEY, JSON.stringify(this.customTeams));
        } catch (error) {
            console.error('[CustomPlayersManager] Error guardando en localStorage:', error);
            
            // Verificar si es por falta de espacio
            if (error.name === 'QuotaExceededError') {
                this.showStorageWarning();
            }
        }
    }

    // === GESTIÓN DE JUGADORES PERSONALIZADOS ===

    addCustomPlayer(playerData) {
        // Validar datos obligatorios
        if (!this.validatePlayerData(playerData)) {
            throw new Error('Datos del jugador incompletos o inválidos');
        }

        // Obtener equipo por defecto si no se proporciona
        let teamId = playerData.teamId;
        if (!teamId && window.teamsManager) {
            const lastTeamId = localStorage.getItem('lastUsedTeamId');
            const defaultTeam = lastTeamId 
                ? window.teamsManager.getTeamById(lastTeamId)
                : window.teamsManager.getNextTeam();
            teamId = defaultTeam ? defaultTeam.id : 'team-001';
        }

        const newPlayer = {
            id: this.nextPlayerId++,
            jersey_number: playerData.jersey_number || this.getNextJerseyNumber(),
            name: playerData.name,
            position: playerData.position,
            pace: parseInt(playerData.pace) || 70,
            shooting: parseInt(playerData.shooting) || 70,
            passing: parseInt(playerData.passing) || 70,
            dribbling: parseInt(playerData.dribbling) || 70,
            defending: parseInt(playerData.defending) || 70,
            physical: parseInt(playerData.physical) || 70,
            image_url: playerData.image_url || 'img/default_player.png',
            team: playerData.team || 'custom',
            teamId: teamId,
            overall: playerData.overall || this.calculateOverall(playerData),
            isCustom: true,
            isDefault: playerData.isDefault || false,
            created_at: new Date().toISOString(),
            created_by: 'user'
        };

        this.customPlayers.push(newPlayer);
        this.saveToStorage();

        // Notificar a teamsUI si está disponible
        if (window.teamsUI && window.teamsUI.onPlayerAdded) {
            window.teamsUI.onPlayerAdded(newPlayer);
        }

        return newPlayer;
    }

    /**
     * Alias de addCustomPlayer para mayor compatibilidad
     */
    addPlayer(playerData) {
        return this.addCustomPlayer(playerData);
    }

    editCustomPlayer(playerId, updatedData) {
        const playerIndex = this.customPlayers.findIndex(p => p.id === playerId);
        if (playerIndex === -1) {
            throw new Error('Jugador personalizado no encontrado');
        }

        // Mantener datos originales y actualizar solo los cambios
        const originalPlayer = this.customPlayers[playerIndex];
        const updatedPlayer = {
            ...originalPlayer,
            ...updatedData,
            id: playerId, // Nunca cambiar el ID
            isCustom: true, // Siempre mantener como personalizado
            updated_at: new Date().toISOString()
        };

        this.customPlayers[playerIndex] = updatedPlayer;
        this.saveToStorage();

        return updatedPlayer;
    }

    /**
     * Alias de editCustomPlayer para compatibilidad
     */
    updatePlayer(playerId, updatedData) {
        return this.editCustomPlayer(playerId, updatedData);
    }

    deleteCustomPlayer(playerId) {
        const playerIndex = this.customPlayers.findIndex(p => p.id === playerId);
        if (playerIndex === -1) {
            throw new Error('Jugador personalizado no encontrado');
        }

        const deletedPlayer = this.customPlayers.splice(playerIndex, 1)[0];
        this.saveToStorage();
        return deletedPlayer;
    }

    /**
     * Obtiene un jugador por ID
     */
    getPlayer(playerId) {
        return this.customPlayers.find(p => p.id === playerId);
    }

    /**
     * Obtiene todos los jugadores
     */
    getPlayers() {
        return [...this.customPlayers];
    }

    /**
     * Calcula el overall basado en los atributos
     */
    calculateOverall(playerData) {
        const attributes = [
            playerData.pace || 70,
            playerData.shooting || 70,
            playerData.passing || 70,
            playerData.dribbling || 70,
            playerData.defending || 70,
            playerData.physical || 70
        ];
        return Math.round(attributes.reduce((a, b) => a + b) / attributes.length);
    }

    // === OBTENER JUGADORES COMBINADOS ===

    getAllPlayers(staticPlayers) {
        // Combinar jugadores estáticos con personalizados
        return [...staticPlayers, ...this.customPlayers];
    }

    getCustomPlayers() {
        return [...this.customPlayers]; // Retornar copia para evitar mutaciones
    }

    getPlayerById(playerId, staticPlayers) {
        // Buscar primero en personalizados, luego en estáticos
        const customPlayer = this.customPlayers.find(p => p.id === playerId);
        if (customPlayer) return customPlayer;

        return staticPlayers.find(p => p.id === playerId);
    }

    // === VALIDACIÓN DE DATOS ===

    validatePlayerData(playerData) {
        const required = ['name', 'position'];
        for (const field of required) {
            if (!playerData[field] || playerData[field].trim() === '') {
                console.error('[CustomPlayersManager] Campo requerido faltante:', field);
                return false;
            }
        }

        // Validar posición
        const validPositions = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST'];
        if (!validPositions.includes(playerData.position)) {
            console.error('[CustomPlayersManager] Posición inválida:', playerData.position);
            return false;
        }

        // Validar estadísticas (1-99)
        const stats = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'];
        for (const stat of stats) {
            if (playerData[stat]) {
                const value = parseInt(playerData[stat]);
                if (isNaN(value) || value < 1 || value > 99) {
                    console.error('[CustomPlayersManager] Estadística inválida:', stat, value);
                    return false;
                }
            }
        }

        return true;
    }

    getNextJerseyNumber() {
        const usedNumbers = this.customPlayers.map(p => p.jersey_number);
        for (let i = 1; i <= 99; i++) {
            if (!usedNumbers.includes(i)) {
                return i;
            }
        }
        return 99; // Fallback
    }

    // === GESTIÓN DE FOTOS ===

    async handlePlayerPhotoUpload(file, playerId = null) {
        if (!file || !file.type.startsWith('image/')) {
            throw new Error('Archivo debe ser una imagen');
        }

        // Validar tamaño inicial (máximo 5MB antes de procesar)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new Error('La imagen es demasiado grande (máximo 5MB)');
        }

        try {     
            // Convertir imagen a base64
            const base64 = await this.fileToBase64(file);
            
            // Detectar si la imagen original tiene transparencia
            const hasTransparency = await this.detectTransparency(base64);
            
            // Procesar imagen con configuraciones optimizadas
            const processedBase64 = await this.processPlayerImage(base64, hasTransparency);
            
            // Validar tamaño final para localStorage (máximo 300KB para PNG con transparencia, 200KB para JPEG)
            const maxFinalSize = hasTransparency ? 300 : 200;
            const finalSize = (processedBase64.length * 3/4) / 1024; // Aproximación del tamaño en KB
            if (finalSize > maxFinalSize) {
                console.warn('[CustomPlayersManager] Imagen procesada sigue siendo grande:', finalSize.toFixed(1), 'KB');
            }
            
            return processedBase64;
        } catch (error) {
            console.error('[CustomPlayersManager] Error procesando imagen:', error);
            throw new Error('Error procesando la imagen: ' + error.message);
        }
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });
    }

    // Detectar si una imagen tiene transparencia
    detectTransparency(base64) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = img.width;
                canvas.height = img.height;
                
                ctx.drawImage(img, 0, 0);
                
                try {
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;
                    
                    // Verificar canal alfa (cada 4to valor en el array)
                    for (let i = 3; i < data.length; i += 4) {
                        if (data[i] < 255) { // Si hay algún pixel con transparencia
                            resolve(true);
                            return;
                        }
                    }

                    resolve(false);
                } catch (error) {
                    // Si hay error accediendo a los datos (CORS, etc), asumir que no hay transparencia
                    console.warn('[CustomPlayersManager] No se pudo verificar transparencia, asumiendo imagen opaca');
                    resolve(false);
                }
            };
            img.onerror = () => resolve(false);
            img.src = base64;
        });
    }

    processPlayerImage(base64, hasTransparency = false) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                try {
                    // Configuración optimizada para fotos de jugadores
                    const config = {
                        targetWidth: 120,      // Ancho estándar
                        targetHeight: 140,     // Alto estándar (ratio 6:7 - típico para fotos de jugadores)
                        quality: hasTransparency ? 0.95 : 0.85, // Mayor calidad para PNG
                        format: hasTransparency ? 'image/png' : 'image/jpeg', // PNG para transparencia, JPEG para opacas
                        backgroundColor: hasTransparency ? 'transparent' : '#ffffff' // Transparente o blanco
                    };

                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Establecer dimensiones del canvas
                    canvas.width = config.targetWidth;
                    canvas.height = config.targetHeight;

                    // Configurar antialiasing para mejor calidad
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';

                    // Solo rellenar con fondo si NO tiene transparencia
                    if (!hasTransparency) {
                        ctx.fillStyle = config.backgroundColor;
                        ctx.fillRect(0, 0, config.targetWidth, config.targetHeight);
                    }

                    // Calcular dimensiones para mantener aspect ratio y centrar
                    const sourceRatio = img.width / img.height;
                    const targetRatio = config.targetWidth / config.targetHeight;

                    let drawWidth, drawHeight, offsetX, offsetY;

                    if (sourceRatio > targetRatio) {
                        // Imagen más ancha - ajustar por altura
                        drawHeight = config.targetHeight;
                        drawWidth = drawHeight * sourceRatio;
                        offsetX = (config.targetWidth - drawWidth) / 2;
                        offsetY = 0;
                    } else {
                        // Imagen más alta - ajustar por ancho
                        drawWidth = config.targetWidth;
                        drawHeight = drawWidth / sourceRatio;
                        offsetX = 0;
                        offsetY = (config.targetHeight - drawHeight) / 2;
                    }

                    // Dibujar imagen centrada y escalada
                    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

                    // Solo agregar esquinas redondeadas si NO tiene transparencia (para evitar artefactos)
                    if (!hasTransparency) {
                        this.addRoundedCorners(ctx, config.targetWidth, config.targetHeight, 4);
                    }

                    // Convertir a base64 con el formato y compresión apropiados
                    const result = canvas.toDataURL(config.format, config.quality);
                    
                    resolve(result);
                } catch (error) {
                    console.error('[CustomPlayersManager] Error en processPlayerImage:', error);
                    reject(error);
                }
            };
            img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
            img.src = base64;
        });
    }

    // Método auxiliar para agregar esquinas redondeadas
    addRoundedCorners(ctx, width, height, radius) {
        ctx.globalCompositeOperation = 'destination-in';
        ctx.beginPath();
        ctx.roundRect(0, 0, width, height, radius);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
    }

    // Validar y obtener información de una imagen
    async getImageInfo(file) {
        if (!file || !file.type.startsWith('image/')) {
            throw new Error('Archivo debe ser una imagen');
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            
            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve({
                    width: img.width,
                    height: img.height,
                    ratio: img.width / img.height,
                    size: file.size,
                    type: file.type,
                    name: file.name
                });
            };
            
            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('No se pudo cargar la imagen'));
            };
            
            img.src = url;
        });
    }

    // Configuraciones predefinidas para diferentes usos
    static getImageConfigurations() {
        return {
            player: {
                width: 120,
                height: 140,
                quality: 0.85,
                format: 'auto', // PNG para transparencia, JPEG para opacas
                description: 'Foto de jugador (120x140px, formato automático)'
            },
            playerSmall: {
                width: 60,
                height: 70,
                quality: 0.80,
                format: 'auto',
                description: 'Miniatura de jugador (60x70px, formato automático)'
            },
            playerLarge: {
                width: 200,
                height: 240,
                quality: 0.90,
                format: 'auto',
                description: 'Foto grande de jugador (200x240px, formato automático)'
            }
        };
    }

    // === IMPORTAR/EXPORTAR ===

    exportCustomPlayers() {
        const exportData = {
            players: this.customPlayers,
            teams: this.customTeams,
            exported_at: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `jugadores-personalizados-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async importCustomPlayers(file) {
        if (!file || file.type !== 'application/json') {
            throw new Error('Archivo debe ser JSON');
        }

        try {
            const text = await file.text();
            const importData = JSON.parse(text);

            if (!importData.players || !Array.isArray(importData.players)) {
                throw new Error('Formato de archivo inválido');
            }

            // Validar y procesar jugadores importados
            const validPlayers = [];
            for (const player of importData.players) {
                if (this.validatePlayerData(player)) {
                    // Asignar nuevo ID para evitar conflictos
                    const importedPlayer = {
                        ...player,
                        id: this.nextPlayerId++,
                        isCustom: true,
                        imported_at: new Date().toISOString()
                    };
                    validPlayers.push(importedPlayer);
                }
            }

            // Agregar jugadores válidos
            this.customPlayers.push(...validPlayers);
            
            // Importar equipos si existen
            if (importData.teams && Array.isArray(importData.teams)) {
                this.customTeams.push(...importData.teams);
            }

            this.saveToStorage();

            return {
                imported: validPlayers.length,
                total: importData.players.length
            };
        } catch (error) {
            console.error('[CustomPlayersManager] Error importando:', error);
            throw new Error('Error al importar archivo: ' + error.message);
        }
    }

    // === EVENT LISTENERS ===

    setupEventListeners() {
        // Escuchar cambios en el storage (sincronización entre pestañas)
        window.addEventListener('storage', (e) => {
            if (e.key === this.STORAGE_KEY || e.key === this.TEAMS_KEY) {
                this.loadFromStorage();
            }
        });
    }

    // === UTILIDADES ===

    showStorageWarning() {
        const message = '⚠️ Almacenamiento lleno\n\n' +
                       'El navegador no tiene suficiente espacio para guardar más jugadores.\n' +
                       'Considera:\n' +
                       '• Eliminar jugadores personalizados no usados\n' +
                       '• Exportar y limpiar datos antiguos\n' +
                       '• Usar imágenes más pequeñas';
        
        alert(message);
    }

    getStorageInfo() {
        try {
            const playersSize = new Blob([localStorage.getItem(this.STORAGE_KEY) || '']).size;
            const teamsSize = new Blob([localStorage.getItem(this.TEAMS_KEY) || '']).size;
            const totalSize = playersSize + teamsSize;

            return {
                customPlayers: this.customPlayers.length,
                customTeams: this.customTeams.length,
                storageUsed: Math.round(totalSize / 1024), // KB
                playersSize: Math.round(playersSize / 1024), // KB
                teamsSize: Math.round(teamsSize / 1024) // KB
            };
        } catch (error) {
            console.error('[CustomPlayersManager] Error obteniendo info de storage:', error);
            return null;
        }
    }

    // === LIMPIEZA ===

    clearAllCustomData() {
        if (confirm('⚠️ ¿Estás seguro?\n\nEsto eliminará TODOS tus jugadores personalizados.\nEsta acción no se puede deshacer.')) {
            this.customPlayers = [];
            this.customTeams = [];
            localStorage.removeItem(this.STORAGE_KEY);
            localStorage.removeItem(this.TEAMS_KEY);
            return true;
        }
        return false;
    }
}
