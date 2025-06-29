export default class TacticsManager {
    constructor() {
        this.tactics = {
            'Libre': { positions: [] },
            '4-3-3': this.generatePositions([4, 3, 3]),
            '4-4-2': this.generatePositions([4, 4, 2]),
            '3-5-2': this.generatePositions([3, 5, 2]),
            '4-2-3-1': this.generatePositions([4, 2, 3, 1])
        };
    }
    
    generatePositions(formation) {
        const positions = [];
        const positionsCount = formation.length;
        
        // Distribución vertical
        const verticalSpacing = 100 / (positionsCount + 1);
        
        for (let i = 0; i < positionsCount; i++) {
            const count = formation[i];
            const y = verticalSpacing * (i + 1);
            
            // Distribución horizontal
            const horizontalSpacing = 100 / (count + 1);
            
            for (let j = 0; j < count; j++) {
                const x = horizontalSpacing * (j + 1);
                positions.push({ x, y });
            }
        }
        
        return positions;
    }
    
    applyTactic(tacticName, players) {
        const tactic = this.tactics[tacticName];
        if (!tactic) return;
        
        // Limpiar jugadores actuales
        
        // Posicionar jugadores
        players.forEach((player, index) => {
            const position = tactic.positions[index];
            if (position) {
                // Asignar posición al jugador
                player.x = position.x;
                player.y = position.y;
            }
        });
    }
}