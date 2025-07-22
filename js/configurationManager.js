// configurationManager.js
// Sistema de configuración global para el simulador táctico

export default class ConfigurationManager {
    constructor() {
        this.SETTINGS_KEY = 'soccerTactics_settings';
        this.TEAMS_KEY = 'soccerTactics_customTeams';
        
        // Configuraciones por defecto
        this.defaultSettings = {
            // Filtros de jugadores
            showDefaultPlayers: true,
            showCustomPlayers: true,
            defaultPlayerFilter: 'all', // 'default', 'custom', 'all'
            
            // Configuraciones de equipos
            enableTeamManagement: true,
            defaultTeamFilter: 'all', // 'all' o ID específico de equipo
            
            // Configuraciones de interfaz
            showPlayerOveralls: true,
            showPlayerPhotos: true,
            compactPlayerList: false,
            
            // Configuraciones de animación
            defaultAnimationSpeed: 1.0,
            showAnimationTrails: true,
            
            // Configuraciones generales
            language: 'es',
            theme: 'default',
            autoSave: true,
            showTutorialHints: true
        };
        
        this.settings = { ...this.defaultSettings };
        this.customTeams = [];
        this.nextTeamId = 1;
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.loadTeams();
        this.setupEventListeners();
        console.log('[ConfigurationManager] Inicializado correctamente');
    }

    // === GESTIÓN DE CONFIGURACIONES ===

    loadSettings() {
        try {
            const storedSettings = localStorage.getItem(this.SETTINGS_KEY);
            if (storedSettings) {
                const parsed = JSON.parse(storedSettings);
                // Combinar con configuraciones por defecto para agregar nuevas configuraciones
                this.settings = { ...this.defaultSettings, ...parsed };
            }
            console.log('[ConfigurationManager] Configuraciones cargadas:', this.settings);
        } catch (error) {
            console.error('[ConfigurationManager] Error cargando configuraciones:', error);
            this.settings = { ...this.defaultSettings };
        }
    }

    saveSettings() {
        try {
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(this.settings));
            console.log('[ConfigurationManager] Configuraciones guardadas');
        } catch (error) {
            console.error('[ConfigurationManager] Error guardando configuraciones:', error);
        }
    }

    getSetting(key) {
        return this.settings[key];
    }

    setSetting(key, value) {
        if (key in this.defaultSettings) {
            this.settings[key] = value;
            this.saveSettings();
            
            // Emitir evento para que otros módulos se actualicen
            document.dispatchEvent(new CustomEvent('settingsChanged', {
                detail: { key, value, allSettings: this.settings }
            }));
            
            console.log(`[ConfigurationManager] Configuración actualizada: ${key} = ${value}`);
            return true;
        }
        console.warn(`[ConfigurationManager] Configuración no válida: ${key}`);
        return false;
    }

    resetSettings() {
        if (confirm('¿Restablecer todas las configuraciones a los valores por defecto?\n\nEsta acción no se puede deshacer.')) {
            this.settings = { ...this.defaultSettings };
            this.saveSettings();
            
            // Emitir evento de reset
            document.dispatchEvent(new CustomEvent('settingsReset', {
                detail: { settings: this.settings }
            }));
            
            console.log('[ConfigurationManager] Configuraciones restablecidas');
            return true;
        }
        return false;
    }

    // === GESTIÓN DE EQUIPOS PERSONALIZADOS ===

    loadTeams() {
        try {
            const storedTeams = localStorage.getItem(this.TEAMS_KEY);
            if (storedTeams) {
                this.customTeams = JSON.parse(storedTeams);
                if (this.customTeams.length > 0) {
                    const maxId = Math.max(...this.customTeams.map(t => t.id));
                    this.nextTeamId = maxId + 1;
                }
            }
            console.log('[ConfigurationManager] Equipos cargados:', this.customTeams.length);
        } catch (error) {
            console.error('[ConfigurationManager] Error cargando equipos:', error);
            this.customTeams = [];
        }
    }

    saveTeams() {
        try {
            localStorage.setItem(this.TEAMS_KEY, JSON.stringify(this.customTeams));
            console.log('[ConfigurationManager] Equipos guardados');
        } catch (error) {
            console.error('[ConfigurationManager] Error guardando equipos:', error);
        }
    }

    createTeam(teamData) {
        if (!teamData.name || teamData.name.trim() === '') {
            throw new Error('El nombre del equipo es obligatorio');
        }

        // Verificar que no exista otro equipo con el mismo nombre
        if (this.customTeams.find(t => t.name.toLowerCase() === teamData.name.toLowerCase())) {
            throw new Error('Ya existe un equipo con ese nombre');
        }

        const newTeam = {
            id: this.nextTeamId++,
            name: teamData.name.trim(),
            description: teamData.description || '',
            color: teamData.color || '#007bff',
            badge: teamData.badge || '',
            playerCount: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        this.customTeams.push(newTeam);
        this.saveTeams();

        // Emitir evento
        document.dispatchEvent(new CustomEvent('teamCreated', {
            detail: { team: newTeam }
        }));

        console.log('[ConfigurationManager] Equipo creado:', newTeam.name);
        return newTeam;
    }

    updateTeam(teamId, updateData) {
        const teamIndex = this.customTeams.findIndex(t => t.id === teamId);
        if (teamIndex === -1) {
            throw new Error('Equipo no encontrado');
        }

        // Verificar nombre único si se está cambiando
        if (updateData.name && updateData.name !== this.customTeams[teamIndex].name) {
            if (this.customTeams.find(t => t.id !== teamId && t.name.toLowerCase() === updateData.name.toLowerCase())) {
                throw new Error('Ya existe un equipo con ese nombre');
            }
        }

        const updatedTeam = {
            ...this.customTeams[teamIndex],
            ...updateData,
            id: teamId, // Nunca cambiar ID
            updated_at: new Date().toISOString()
        };

        this.customTeams[teamIndex] = updatedTeam;
        this.saveTeams();

        // Emitir evento
        document.dispatchEvent(new CustomEvent('teamUpdated', {
            detail: { team: updatedTeam }
        }));

        console.log('[ConfigurationManager] Equipo actualizado:', updatedTeam.name);
        return updatedTeam;
    }

    deleteTeam(teamId) {
        const teamIndex = this.customTeams.findIndex(t => t.id === teamId);
        if (teamIndex === -1) {
            throw new Error('Equipo no encontrado');
        }

        const deletedTeam = this.customTeams.splice(teamIndex, 1)[0];
        this.saveTeams();

        // Emitir evento
        document.dispatchEvent(new CustomEvent('teamDeleted', {
            detail: { team: deletedTeam }
        }));

        console.log('[ConfigurationManager] Equipo eliminado:', deletedTeam.name);
        return deletedTeam;
    }

    getTeams() {
        return [...this.customTeams];
    }

    getTeamById(teamId) {
        return this.customTeams.find(t => t.id === teamId);
    }

    updateTeamPlayerCount(teamId, count) {
        const team = this.getTeamById(teamId);
        if (team) {
            team.playerCount = count;
            team.updated_at = new Date().toISOString();
            this.saveTeams();
        }
    }

    // === FILTROS DE JUGADORES ===

    getPlayerFilterOptions() {
        return [
            { value: 'all', label: 'Todos los jugadores', icon: 'fas fa-users' },
            { value: 'default', label: 'Solo jugadores base', icon: 'fas fa-user-tie' },
            { value: 'custom', label: 'Solo mis jugadores', icon: 'fas fa-user-plus' }
        ];
    }

    getTeamFilterOptions() {
        const options = [
            { value: 'all', label: 'Todos los equipos', icon: 'fas fa-globe' }
        ];

        // Agregar equipos personalizados
        this.customTeams.forEach(team => {
            options.push({
                value: team.id.toString(),
                label: team.name,
                icon: 'fas fa-shield-alt',
                color: team.color,
                playerCount: team.playerCount
            });
        });

        return options;
    }

    shouldShowPlayer(player) {
        const playerFilter = this.getSetting('defaultPlayerFilter');
        
        // Filtro por tipo de jugador
        if (playerFilter === 'default' && player.isCustom) return false;
        if (playerFilter === 'custom' && !player.isCustom) return false;
        
        // Filtro por equipo
        const teamFilter = this.getSetting('defaultTeamFilter');
        if (teamFilter !== 'all') {
            const teamId = parseInt(teamFilter);
            if (player.teamId !== teamId) return false;
        }
        
        return true;
    }

    // === EXPORTAR/IMPORTAR CONFIGURACIONES ===

    exportConfiguration() {
        const configData = {
            settings: this.settings,
            teams: this.customTeams,
            exported_at: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `configuracion-tactica-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('[ConfigurationManager] Configuración exportada');
    }

    async importConfiguration(file) {
        if (!file || file.type !== 'application/json') {
            throw new Error('Archivo debe ser JSON');
        }

        try {
            const text = await file.text();
            const configData = JSON.parse(text);

            if (!configData.settings && !configData.teams) {
                throw new Error('Formato de archivo inválido');
            }

            let imported = 0;

            // Importar configuraciones
            if (configData.settings) {
                this.settings = { ...this.defaultSettings, ...configData.settings };
                this.saveSettings();
                imported++;
            }

            // Importar equipos
            if (configData.teams && Array.isArray(configData.teams)) {
                configData.teams.forEach(team => {
                    // Asignar nuevo ID para evitar conflictos
                    const importedTeam = {
                        ...team,
                        id: this.nextTeamId++,
                        imported_at: new Date().toISOString()
                    };
                    this.customTeams.push(importedTeam);
                });
                this.saveTeams();
                imported += configData.teams.length;
            }

            // Emitir evento de importación
            document.dispatchEvent(new CustomEvent('configurationImported', {
                detail: { settings: this.settings, teams: this.customTeams }
            }));

            console.log('[ConfigurationManager] Configuración importada');
            return { imported, settings: !!configData.settings, teams: configData.teams?.length || 0 };

        } catch (error) {
            console.error('[ConfigurationManager] Error importando:', error);
            throw new Error('Error al importar configuración: ' + error.message);
        }
    }

    // === EVENT LISTENERS ===

    setupEventListeners() {
        // Sincronización entre pestañas
        window.addEventListener('storage', (e) => {
            if (e.key === this.SETTINGS_KEY) {
                console.log('[ConfigurationManager] Configuraciones actualizadas en otra pestaña');
                this.loadSettings();
            } else if (e.key === this.TEAMS_KEY) {
                console.log('[ConfigurationManager] Equipos actualizados en otra pestaña');
                this.loadTeams();
            }
        });
    }

    // === UTILIDADES ===

    getStorageInfo() {
        try {
            const settingsSize = new Blob([localStorage.getItem(this.SETTINGS_KEY) || '']).size;
            const teamsSize = new Blob([localStorage.getItem(this.TEAMS_KEY) || '']).size;
            const totalSize = settingsSize + teamsSize;

            return {
                settings: Object.keys(this.settings).length,
                teams: this.customTeams.length,
                storageUsed: Math.round(totalSize / 1024), // KB
                settingsSize: Math.round(settingsSize / 1024), // KB
                teamsSize: Math.round(teamsSize / 1024) // KB
            };
        } catch (error) {
            console.error('[ConfigurationManager] Error obteniendo info de storage:', error);
            return null;
        }
    }

    clearAllData() {
        if (confirm('⚠️ ¿Eliminar TODA la configuración y equipos?\n\nEsto incluye:\n• Configuraciones personales\n• Equipos creados\n• Preferencias de filtros\n\nEsta acción no se puede deshacer.')) {
            this.settings = { ...this.defaultSettings };
            this.customTeams = [];
            this.nextTeamId = 1;
            
            localStorage.removeItem(this.SETTINGS_KEY);
            localStorage.removeItem(this.TEAMS_KEY);
            
            // Emitir evento de limpieza
            document.dispatchEvent(new CustomEvent('configurationCleared'));
            
            console.log('[ConfigurationManager] Toda la configuración eliminada');
            return true;
        }
        return false;
    }
}
