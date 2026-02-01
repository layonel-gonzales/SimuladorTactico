/**
 * Test de conexión usando msnodesqlv8 directamente
 */

const { open } = require('msnodesqlv8');

// Connection string para Windows Authentication  
const connectionString = 'Driver={ODBC Driver 17 for SQL Server};Server=MSI;Database=SimuladorTacticoDB;Trusted_Connection=yes;';

console.log('🔌 Probando conexión directa con msnodesqlv8...');
console.log('   Connection String:', connectionString);
console.log('');

open(connectionString, (err, conn) => {
    if (err) {
        console.error('❌ Error de conexión:');
        console.error('   ', err.message || err);
        return;
    }
    
    console.log('✅ ¡Conexión exitosa!');
    
    // Probar una query simple
    conn.query('SELECT @@VERSION as Version', (err, results) => {
        if (err) {
            console.error('❌ Error en query:', err);
            conn.close();
            return;
        }
        
        console.log('📊 SQL Server Version:');
        console.log('   ', results[0].Version.split('\n')[0]);
        
        // Contar usuarios
        conn.query('SELECT COUNT(*) as total FROM Usuarios', (err, results) => {
            if (err) {
                console.error('❌ Error contando usuarios:', err);
                conn.close();
                return;
            }
            
            console.log('\n👥 Usuarios en la base de datos:', results[0].total);
            
            // Mostrar planes
            conn.query('SELECT Nombre, Precio FROM Planes', (err, results) => {
                if (err) {
                    console.error('❌ Error obteniendo planes:', err);
                    conn.close();
                    return;
                }
                
                console.log('\n📋 Planes disponibles:');
                results.forEach(p => {
                    console.log(`   - ${p.Nombre}: $${p.Precio}`);
                });
                
                console.log('\n✅ Test completado exitosamente!');
                conn.close();
            });
        });
    });
});
