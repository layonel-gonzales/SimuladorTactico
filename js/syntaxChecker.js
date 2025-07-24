// 🧪 VERIFICADOR SIMPLE DE ERRORES DE SINTAXIS

console.log('%c🧪 VERIFICANDO ERRORES DE SINTAXIS', 'color: #00cc00; font-weight: bold; font-size: 14px;');

// 1. Verificar que authSystem esté disponible
setTimeout(() => {
    console.log('\n📋 1. VERIFICANDO AUTHSYSTEM:');
    console.log('  ✓ window.authSystem existe:', !!window.authSystem);
    
    if (window.authSystem) {
        console.log('  ✓ authSystem.isAuthenticated:', window.authSystem.isAuthenticated);
        console.log('  ✓ authSystem.accessKey:', window.authSystem.accessKey);
    }
}, 1000);

// 2. Verificar que Bootstrap esté disponible
setTimeout(() => {
    console.log('\n📋 2. VERIFICANDO BOOTSTRAP:');
    console.log('  ✓ window.bootstrap existe:', typeof window.bootstrap !== 'undefined');
    console.log('  ✓ Bootstrap en window:', !!window.bootstrap);
    
    if (window.bootstrap) {
        console.log('  ✓ Bootstrap.Modal disponible:', !!window.bootstrap.Modal);
    }
}, 1500);

// 3. Verificar funciones de depuración
setTimeout(() => {
    console.log('\n📋 3. VERIFICANDO FUNCIONES DE DEPURACIÓN:');
    console.log('  ✓ debugAuthModal disponible:', typeof window.debugAuthModal === 'function');
    console.log('  ✓ forceHideAuthModal disponible:', typeof window.forceHideAuthModal === 'function');
    console.log('  ✓ disableAuth disponible:', typeof window.disableAuth === 'function');
    console.log('  ✓ authDiagnosis disponible:', !!window.authDiagnosis);
}, 2000);

// 4. Verificar elementos DOM
setTimeout(() => {
    console.log('\n📋 4. VERIFICANDO ELEMENTOS DOM:');
    const modal = document.getElementById('auth-modal');
    const overlay = document.getElementById('auth-overlay');
    
    console.log('  ✓ Modal de autenticación:', !!modal);
    console.log('  ✓ Overlay de autenticación:', !!overlay);
    
    if (modal) {
        console.log('  ✓ Modal visible:', modal.offsetWidth > 0 && modal.offsetHeight > 0);
        console.log('  ✓ Modal display:', modal.style.display);
    }
}, 2500);

// 5. Resultado final
setTimeout(() => {
    console.log('\n✅ VERIFICACIÓN COMPLETADA');
    console.log('📝 Si no hay errores rojos arriba, todo está funcionando correctamente');
    console.log('📝 Para diagnóstico completo: authDiagnosis.runFullDiagnosis()');
}, 3000);
