// Ejemplo de cómo integrar las verificaciones de pago en funciones existentes

// En shareManager.js - verificar antes de exportar
function exportImage() {
    if (!paymentManager.canExportHD()) {
        // Exportar con marca de agua para usuarios gratuitos
        exportWithWatermark();
        paymentManager.showUpgradeModal('export');
        return;
    }
    
    // Exportar en HD para usuarios premium
    exportHD();
}

// En tacticsManager.js - verificar antes de guardar táctica
function saveTactic() {
    if (!paymentManager.canCreateTactic()) {
        paymentManager.showUpgradeModal('maxTactics');
        return;
    }
    
    // Proceder con guardar táctica
    doSaveTactic();
}

// En animationManager.js - verificar antes de añadir frame
function addAnimationFrame() {
    if (!paymentManager.canAddAnimationFrame()) {
        paymentManager.showUpgradeModal('maxAnimationFrames');
        return;
    }
    
    // Proceder con añadir frame
    doAddFrame();
}

// En formationManager.js - verificar formaciones disponibles
function loadFormation(formationType) {
    const allowedFormations = paymentManager.currentPlan.features.formations;
    
    if (allowedFormations !== 'all' && !allowedFormations.includes(formationType)) {
        paymentManager.showUpgradeModal('formations');
        return;
    }
    
    // Cargar formación
    doLoadFormation(formationType);
}
