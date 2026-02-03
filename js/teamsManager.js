/**
 * TeamsManager - Sistema de gestión de equipos
 * Los equipos se almacenan en localStorage
 * Cada equipo tiene: id, name, color, icon
 */

class TeamsManager {
    constructor() {
        this.storageKey = 'simulador_teams';
        this.defaultTeam = {
            id: 'default',
            name: 'Default',
            color: '#4CAF50',
            icon: '📌'
        };
        
        this.init();
    }

    init() {
        // Cargar equipos desde localStorage o crear el equipo "Default"
        let teams = this.loadTeamsFromStorage();
        if (teams.length === 0) {
            // Si no hay equipos, crear el equipo Default
            teams = [this.defaultTeam];
            this.saveTeamsToStorage(teams);
        }
    }

    /**
     * Carga equipos desde localStorage
     */
    loadTeamsFromStorage() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error cargando equipos:', e);
            return [];
        }
    }

    /**
     * Guarda equipos en localStorage
     */
    saveTeamsToStorage(teams) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(teams));
        } catch (e) {
            console.error('Error guardando equipos:', e);
        }
    }

    /**
     * Obtiene todos los equipos
     */
    getAllTeams() {
        return this.loadTeamsFromStorage();
    }

    /**
     * Obtiene un equipo por ID
     */
    getTeamById(teamId) {
        const teams = this.loadTeamsFromStorage();
        return teams.find(t => t.id === teamId);
    }

    /**
     * Obtiene el próximo equipo disponible (por defecto, el equipo Default)
     */
    getNextTeam() {
        const teams = this.loadTeamsFromStorage();
        return teams.length > 0 ? teams[0] : this.defaultTeam;
    }

    /**
     * Crea un nuevo equipo
     */
    createTeam(name, color = '#999999', icon = '⚽') {
        if (!name || name.trim() === '') {
            console.error('El nombre del equipo no puede estar vacío');
            return null;
        }

        const teams = this.loadTeamsFromStorage();
        
        // Generar ID único
        const id = 'team-' + Date.now();
        
        const newTeam = {
            id,
            name: name.trim(),
            color,
            icon
        };

        teams.push(newTeam);
        this.saveTeamsToStorage(teams);
        
        console.log(`✅ Equipo creado: ${name} (${id})`);
        return newTeam;
    }

    /**
     * Elimina un equipo
     */
    deleteTeam(teamId) {
        if (teamId === 'default') {
            console.error('No se puede eliminar el equipo Default');
            return false;
        }

        const teams = this.loadTeamsFromStorage();
        const filtered = teams.filter(t => t.id !== teamId);
        
        if (filtered.length < teams.length) {
            this.saveTeamsToStorage(filtered);
            console.log(`✅ Equipo eliminado: ${teamId}`);
            return true;
        }
        
        return false;
    }

    /**
     * Actualiza un equipo
     */
    updateTeam(teamId, updates) {
        const teams = this.loadTeamsFromStorage();
        const team = teams.find(t => t.id === teamId);
        
        if (team) {
            Object.assign(team, updates);
            this.saveTeamsToStorage(teams);
            return team;
        }
        
        return null;
    }
}

// Crear instancia global
window.teamsManager = new TeamsManager();
