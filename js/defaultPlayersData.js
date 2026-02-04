/**
 * DefaultPlayersData - 11 Jugadores por Defecto del Sistema
 * 1 Equipo "Default" × 11 Jugadores = 11 Total
 * Se cargan automáticamente al iniciar la aplicación
 */

const DefaultPlayersData = {
    // Plantilla de jugadores por defecto (solo 1 equipo Default)
    defaultTeams: {
        'team-001': {
            // Los Fénix - Estilo FIFA
            teamId: 'team-001',
            players: [
                {
                    id: 'default-gk-001',
                    name: 'Carlos Ramírez',
                    position: 'GK',
                    jersey_number: 1,
                    overall: 82,
                    pace: 60, shooting: 25, passing: 45, dribbling: 30, defending: 85, physical: 75,
                    image_url: 'img/default_player.png',
                    isDefault: true
                },
                {
                    id: 'default-cb-001',
                    name: 'Miguel Sánchez',
                    position: 'CB',
                    jersey_number: 4,
                    overall: 84,
                    pace: 70, shooting: 30, passing: 75, dribbling: 50, defending: 88, physical: 85,
                    image_url: 'img/default_player.png',
                    isDefault: true
                },
                {
                    id: 'default-cb-002',
                    name: 'Diego Rodríguez',
                    position: 'CB',
                    jersey_number: 5,
                    overall: 83,
                    pace: 68, shooting: 28, passing: 72, dribbling: 48, defending: 87, physical: 84,
                    image_url: 'img/default_player.png',
                    isDefault: true
                },
                {
                    id: 'default-lb-001',
                    name: 'Juan López',
                    position: 'LB',
                    jersey_number: 3,
                    overall: 81,
                    pace: 78, shooting: 40, passing: 75, dribbling: 60, defending: 85, physical: 80,
                    image_url: 'img/default_player.png',
                    isDefault: true
                },
                {
                    id: 'default-rb-001',
                    name: 'Fernando Jiménez',
                    position: 'RB',
                    jersey_number: 2,
                    overall: 82,
                    pace: 80, shooting: 38, passing: 73, dribbling: 58, defending: 86, physical: 81,
                    image_url: 'img/default_player.png',
                    isDefault: true
                },
                {
                    id: 'default-cm-001',
                    name: 'Luis Moreno',
                    position: 'CM',
                    jersey_number: 6,
                    overall: 85,
                    pace: 76, shooting: 65, passing: 88, dribbling: 80, defending: 80, physical: 82,
                    image_url: 'img/default_player.png',
                    isDefault: true
                },
                {
                    id: 'default-cm-002',
                    name: 'Pedro Fernández',
                    position: 'CM',
                    jersey_number: 8,
                    overall: 84,
                    pace: 74, shooting: 62, passing: 86, dribbling: 78, defending: 78, physical: 81,
                    image_url: 'img/default_player.png',
                    isDefault: true
                },
                {
                    id: 'default-lw-001',
                    name: 'Jorge Delgado',
                    position: 'LW',
                    jersey_number: 11,
                    overall: 88,
                    pace: 88, shooting: 85, passing: 82, dribbling: 90, defending: 40, physical: 75,
                    image_url: 'img/default_player.png',
                    isDefault: true
                },
                {
                    id: 'default-rw-001',
                    name: 'Rafael Reyes',
                    position: 'RW',
                    jersey_number: 7,
                    overall: 87,
                    pace: 86, shooting: 84, passing: 80, dribbling: 88, defending: 42, physical: 74,
                    image_url: 'img/default_player.png',
                    isDefault: true
                },
                {
                    id: 'default-st-001',
                    name: 'Antonio González',
                    position: 'ST',
                    jersey_number: 9,
                    overall: 89,
                    pace: 85, shooting: 90, passing: 78, dribbling: 87, defending: 35, physical: 80,
                    image_url: 'img/default_player.png',
                    isDefault: true
                },
                {
                    id: 'default-cam-001',
                    name: 'Sergio Herrera',
                    position: 'CAM',
                    jersey_number: 10,
                    overall: 86,
                    pace: 82, shooting: 78, passing: 89, dribbling: 85, defending: 45, physical: 76,
                    image_url: 'img/default_player.png',
                    isDefault: true
                }
            ]
        }
    },

    /**
     * Obtiene todos los jugadores por defecto - SOLO 11 (1 EQUIPO)
     */
    getAllDefaultPlayers() {
        const all = [];
        Object.values(this.defaultTeams).forEach(team => {
            all.push(...team.players);
        });
        return all;
    },

    /**
     * Obtiene jugadores por defecto de un equipo
     */
    getTeamPlayers(teamId) {
        return this.defaultTeams[teamId]?.players || [];
    },

    /**
     * Carga los jugadores por defecto en memoria (NO en localStorage)
     * Los 11 jugadores por defecto SIEMPRE están disponibles
     * Solo se guardan en localStorage los jugadores CREADOS por el usuario
     */
    async loadDefaultPlayers() {
        return { loaded: true, added: 0, total: this.getAllDefaultPlayers().length };
    }
};

// Exportar como disponible globalmente
window.defaultPlayersData = DefaultPlayersData;

