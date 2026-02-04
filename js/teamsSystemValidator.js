/**
 * Sistema de Validación y Testeo del Sistema de Equipos
 * Útil para verificar que todo esté funcionando correctamente
 */

const TeamsSystemValidator = {
    /**
     * Ejecuta todos los tests
     */
    runAllTests() {
        console.group('🧪 VALIDACIÓN DEL SISTEMA DE EQUIPOS');
        
        const tests = [
            this.testManagersExist(),
            this.testTeamsDataStructure(),
            this.testDefaultPlayersStructure(),
            this.testLocalStorageIntegration(),
            this.testEventListeners(),
            this.testCascadingCSS()
        ];

        const passed = tests.filter(t => t.passed).length;
        const total = tests.length;

        console.groupEnd();
        
        console.log(`\n✅ RESUMEN: ${passed}/${total} pruebas pasadas`);
        
        if (passed === total) {
            console.log('🎉 ¡Sistema de equipos funcionando correctamente!');
            return true;
        } else {
            console.warn('⚠️ Algunas pruebas fallaron. Revisa los logs arriba.');
            return false;
        }
    },

    /**
     * Test 1: Verificar que los managers existan
     */
    testManagersExist() {
        const test = {
            name: 'Managers Disponibles',
            passed: false,
            details: {}
        };

        test.details.teamsManager = !!window.teamsManager;
        test.details.defaultPlayersData = !!window.defaultPlayersData;
        test.details.teamsUI = !!window.teamsUI;
        test.details.customPlayersManager = !!window.customPlayersManager;

        test.passed = Object.values(test.details).every(v => v);

        console.group(`${test.passed ? '✅' : '❌'} ${test.name}`);
        Object.entries(test.details).forEach(([key, value]) => {
            console.log(`  ${value ? '✅' : '❌'} ${key}`);
        });
        console.groupEnd();

        return test;
    },

    /**
     * Test 2: Estructura de datos de equipos
     */
    testTeamsDataStructure() {
        const test = {
            name: 'Estructura de Datos de Equipos',
            passed: false,
            details: {}
        };

        try {
            const teams = window.teamsManager.getAllTeams();
            
            test.details.teamsCount = teams.length;
            test.details.allHaveRequiredFields = teams.every(t => 
                t.id && t.name && t.cardStyle && t.color
            );
            test.details.cardStylesValid = teams.every(t => 
                ['card-style-fifa', 'card-style-modern', 'card-style-retro', 'card-style-premium', 'card-style-classic'].includes(t.cardStyle)
            );
            test.details.storedInLocalStorage = !!localStorage.getItem('simulador_teams');

            test.passed = Object.values(test.details).every(v => 
                typeof v === 'boolean' ? v : v > 0
            );

            console.group(`${test.passed ? '✅' : '❌'} ${test.name}`);
            console.log(`  Equipos encontrados: ${test.details.teamsCount}`);
            console.log(`  ${test.details.allHaveRequiredFields ? '✅' : '❌'} Todos tienen campos requeridos`);
            console.log(`  ${test.details.cardStylesValid ? '✅' : '❌'} Estilos de card válidos`);
            console.log(`  ${test.details.storedInLocalStorage ? '✅' : '❌'} Almacenado en localStorage`);
            console.groupEnd();

        } catch (error) {
            console.error('❌ Error en test de equipos:', error);
        }

        return test;
    },

    /**
     * Test 3: Estructura de jugadores por defecto
     */
    testDefaultPlayersStructure() {
        const test = {
            name: 'Estructura de Jugadores por Defecto',
            passed: false,
            details: {}
        };

        try {
            const allPlayers = window.defaultPlayersData.getAllDefaultPlayers();
            
            test.details.totalPlayers = allPlayers.length;
            test.details.allHaveTeamId = allPlayers.every(p => p.teamId);
            test.details.validPositions = allPlayers.every(p => 
                ['GK', 'CB', 'LB', 'RB', 'CM', 'LW', 'RW', 'CAM', 'ST'].includes(p.position)
            );
            test.details.allHaveOverall = allPlayers.every(p => p.overall >= 1 && p.overall <= 99);
            test.details.statsComplete = allPlayers.every(p => 
                typeof p.pace === 'number' && typeof p.shooting === 'number' && 
                typeof p.passing === 'number' && typeof p.dribbling === 'number' &&
                typeof p.defending === 'number' && typeof p.physical === 'number'
            );

            test.passed = Object.values(test.details).every(v => 
                typeof v === 'boolean' ? v : v > 0
            );

            console.group(`${test.passed ? '✅' : '❌'} ${test.name}`);
            console.log(`  Jugadores totales: ${test.details.totalPlayers}`);
            console.log(`  ${test.details.allHaveTeamId ? '✅' : '❌'} Todos tienen teamId`);
            console.log(`  ${test.details.validPositions ? '✅' : '❌'} Posiciones válidas`);
            console.log(`  ${test.details.allHaveOverall ? '✅' : '❌'} Overall válido (1-99)`);
            console.log(`  ${test.details.statsComplete ? '✅' : '❌'} Stats completas`);
            console.groupEnd();

        } catch (error) {
            console.error('❌ Error en test de jugadores:', error);
        }

        return test;
    },

    /**
     * Test 4: Integración con localStorage
     */
    testLocalStorageIntegration() {
        const test = {
            name: 'Integración con localStorage',
            passed: false,
            details: {}
        };

        try {
            // Intentar cargar jugadores por defecto
            const result = window.defaultPlayersData.loadDefaultPlayers();
            test.details.loadDefaultPlayersWorks = result && result.loaded;

            // Verificar que se almacenó
            const storedPlayers = localStorage.getItem('soccerTactics_customPlayers');
            test.details.playersStored = !!storedPlayers;

            // Verificar que se pueden recuperar
            const players = window.customPlayersManager.getPlayers();
            test.details.playersRetrievable = players.length > 0;

            // Verificar teamId en jugadores
            test.details.playersHaveTeamId = players.every(p => p.teamId);

            test.passed = Object.values(test.details).every(v => v);

            console.group(`${test.passed ? '✅' : '❌'} ${test.name}`);
            console.log(`  ${test.details.loadDefaultPlayersWorks ? '✅' : '❌'} Carga de jugadores`);
            console.log(`  ${test.details.playersStored ? '✅' : '❌'} Almacenamiento en localStorage`);
            console.log(`  ${test.details.playersRetrievable ? '✅' : '❌'} Recuperación de jugadores`);
            console.log(`  ${test.details.playersHaveTeamId ? '✅' : '❌'} TeamId en jugadores`);
            if (test.details.playersRetrievable) {
                console.log(`     (Total: ${players.length} jugadores)`);
            }
            console.groupEnd();

        } catch (error) {
            console.error('❌ Error en test de localStorage:', error);
        }

        return test;
    },

    /**
     * Test 5: Event Listeners
     */
    testEventListeners() {
        const test = {
            name: 'Event Listeners',
            passed: false,
            details: {}
        };

        try {
            test.details.loadDefaultPlayersBtn = !!document.getElementById('load-default-players-btn');
            // teamsManagementBtn removed - functionality consolidated into customPlayersUI
            test.details.storageManagementBtn = !!document.getElementById('storage-management-btn');

            test.passed = Object.values(test.details).every(v => v);

            console.group(`${test.passed ? '✅' : '❌'} ${test.name}`);
            console.log(`  ${test.details.loadDefaultPlayersBtn ? '✅' : '❌'} Botón cargar jugadores`);
            console.log(`  ${test.details.teamsManagementBtn ? '✅' : '❌'} Botón gestión equipos`);
            console.log(`  ${test.details.storageManagementBtn ? '✅' : '❌'} Botón almacenamiento`);
            console.groupEnd();

        } catch (error) {
            console.error('❌ Error en test de event listeners:', error);
        }

        return test;
    },

    /**
     * Test 6: Estilos CSS en cascada
     */
    testCascadingCSS() {
        const test = {
            name: 'Estilos CSS en Cascada',
            passed: false,
            details: {}
        };

        try {
            // Verificar que los estilos están en el documento
            const styles = document.querySelectorAll('style');
            const cssText = Array.from(styles).map(s => s.textContent).join('');
            
            test.details.cardStyleFifaExists = cssText.includes('card-style-fifa');
            test.details.cardStyleModernExists = cssText.includes('card-style-modern');
            test.details.cardStyleRetroExists = cssText.includes('card-style-retro');
            test.details.cardStylePremiumExists = cssText.includes('card-style-premium');

            // O verificar en enlaces CSS
            const links = document.querySelectorAll('link[rel="stylesheet"]');
            const cssFiles = Array.from(links).map(l => l.href);
            test.details.cssFilesLoaded = cssFiles.length > 0;

            test.passed = Object.values(test.details).every(v => v);

            console.group(`${test.passed ? '✅' : '❌'} ${test.name}`);
            if (test.details.cssFilesLoaded) {
                console.log(`  ${test.details.cssFilesLoaded ? '✅' : '❌'} Archivos CSS cargados`);
            }
            console.log(`  ${test.details.cardStyleFifaExists ? '✅' : '❌'} Estilo FIFA`);
            console.log(`  ${test.details.cardStyleModernExists ? '✅' : '❌'} Estilo Moderno`);
            console.log(`  ${test.details.cardStyleRetroExists ? '✅' : '❌'} Estilo Retro`);
            console.log(`  ${test.details.cardStylePremiumExists ? '✅' : '❌'} Estilo Premium`);
            console.groupEnd();

        } catch (error) {
            console.error('❌ Error en test de CSS:', error);
        }

        return test;
    },

    /**
     * Método de utilidad para limpiar datos de prueba
     */
    clearTestData() {
        console.warn('🗑️ Limpiando datos de prueba...');
        localStorage.removeItem('soccerTactics_customPlayers');
        localStorage.removeItem('simulador_teams');
        window.customPlayersManager = null;
        window.teamsManager = null;
        location.reload();
    },

    /**
     * Mostrar resumen de datos
     */
    showDataSummary() {
        console.group('📊 RESUMEN DE DATOS');
        
        const teams = window.teamsManager.getAllTeams();
        console.log('Equipos:', teams.map(t => `${t.icon} ${t.name} (${t.cardStyle})`));
        
        const players = window.customPlayersManager.getPlayers();
        console.log(`Jugadores cargados: ${players.length}`);
        
        if (players.length > 0) {
            const byTeam = {};
            players.forEach(p => {
                byTeam[p.teamId] = (byTeam[p.teamId] || 0) + 1;
            });
            
            console.group('Distribución por equipo:');
            Object.entries(byTeam).forEach(([teamId, count]) => {
                const team = window.teamsManager.getTeamById(teamId);
                console.log(`  ${team?.icon || '⚽'} ${team?.name || 'Desconocido'}: ${count} jugadores`);
            });
            console.groupEnd();
        }
        
        const storageUsed = new Blob([JSON.stringify(players)]).size;
        console.log(`Almacenamiento usado: ${(storageUsed / 1024).toFixed(2)} KB`);
        
        console.groupEnd();
    }
};

// Exportar para acceso global
window.TeamsSystemValidator = TeamsSystemValidator;

// Auto-ejecutar al cargar (opcional)
console.log('🔧 Sistema de validación disponible. Ejecuta: window.TeamsSystemValidator.runAllTests()');
