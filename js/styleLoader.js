/**
 * 📚 LOADER DE ESTILOS MODULARES
 * Carga todos los estilos registrados dinámicamente
 * Este archivo asegura que todos los estilos se carguen en el orden correcto
 */

console.log('🚀 Iniciando carga de estilos modulares...');

// 1. Asegurar que StyleRegistry esté cargado
if (!window.styleRegistry) {
    console.error('❌ Error: StyleRegistry no está disponible');
}

// 2. Cargar estilos de campo (fieldStyles)
const fieldStyleModules = [
    'js/fieldStyles/fieldStyleClassic.js',
    'js/fieldStyles/fieldStyleModern.js',
    'js/fieldStyles/fieldStyleNight.js',
    'js/fieldStyles/fieldStyleRetro.js'
];

// 3. Cargar estilos de card (cardStyles)
const cardStyleModules = [
    'js/cardStyles/cardStyleClassic.js',
    'js/cardStyles/cardStyleModern.js',
    'js/cardStyles/cardStyleFifa.js',
    'js/cardStyles/cardStyleRetro.js'
];

// Función para cargar módulos dinámicamente
async function loadStyleModules(modules, type = 'field') {
    let loaded = 0;
    let failed = 0;

    for (const modulePath of modules) {
        try {
            // Usar dynamic import para módulos ES6
            if (modulePath.includes('fieldStyles')) {
                // Para fieldStyles con export
                const module = await import(modulePath);
                if (module.default) {
                    console.log(`✅ Módulo de ${type} cargado: ${modulePath}`);
                    loaded++;
                } else {
                    console.log(`✅ Estilo de ${type} registrado: ${modulePath}`);
                    loaded++;
                }
            } else {
                // Para cardStyles (sin export, se registran automáticamente)
                const script = document.createElement('script');
                script.src = modulePath;
                script.async = false;
                script.onload = () => {
                    console.log(`✅ Estilo de ${type} cargado: ${modulePath}`);
                    loaded++;
                };
                script.onerror = () => {
                    console.warn(`⚠️ Error cargando: ${modulePath}`);
                    failed++;
                };
                document.head.appendChild(script);
            }
        } catch (error) {
            console.warn(`⚠️ Error cargando módulo ${modulePath}:`, error);
            failed++;
        }
    }

    return { loaded, failed };
}

// Ejecutar carga al iniciar
async function initStyleLoading() {
    console.log('📋 Cargando estilos modulares...');
    
    // Esperar a que styleRegistry esté listo
    let attempts = 0;
    while (!window.styleRegistry && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 50));
        attempts++;
    }

    if (!window.styleRegistry) {
        console.error('❌ StyleRegistry no disponible después de esperar');
        return;
    }

    console.log('✅ StyleRegistry disponible, cargando estilos...');

    // Cargar estilos de campo (estos se cargan con script tags porque se registran automáticamente)
    for (const modulePath of fieldStyleModules) {
        const script = document.createElement('script');
        script.src = modulePath;
        script.async = false;
        document.head.appendChild(script);
    }

    // Cargar estilos de card (estos se cargan con script tags porque se registran automáticamente)
    for (const modulePath of cardStyleModules) {
        const script = document.createElement('script');
        script.src = modulePath;
        script.async = false;
        document.head.appendChild(script);
    }

    // Verificar después de un tiempo que todo se cargó
    setTimeout(() => {
        const stats = window.styleRegistry.getStats();
        console.log(`📊 Resumen: ${stats.cardStyles} estilos de card, ${stats.fieldStyles} estilos de campo cargados`);
    }, 1000);
}

// Iniciar si el DOM está listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStyleLoading);
} else {
    initStyleLoading();
}

console.log('✅ Loader de estilos inicializado');
