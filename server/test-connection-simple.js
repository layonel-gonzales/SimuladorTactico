/**
 * Test simple de conexión a SQL Server
 * con Autenticación de Windows
 */

const sql = require('mssql/msnodesqlv8');

// Connection string para Windows Authentication
const connectionString = 'Driver={ODBC Driver 17 for SQL Server};Server=MSI;Database=SimuladorTacticoDB;Trusted_Connection=yes;';

async function test() {
    console.log('🔌 Probando conexión a SQL Server...');
    console.log('   Connection String:', connectionString);
    console.log('');
    
    try {
        const pool = await sql.connect(connectionString);
        console.log('✅ ¡Conexión exitosa!');
        
        // Probar una query simple
        const result = await pool.request().query('SELECT @@VERSION as Version');
        console.log('📊 SQL Server Version:');
        console.log('   ', result.recordset[0].Version.split('\n')[0]);
        
        // Contar usuarios
        const usuarios = await pool.request().query('SELECT COUNT(*) as total FROM Usuarios');
        console.log('\n👥 Usuarios en la base de datos:', usuarios.recordset[0].total);
        
        // Mostrar planes
        const planes = await pool.request().query('SELECT Nombre, Precio FROM Planes');
        console.log('\n📋 Planes disponibles:');
        planes.recordset.forEach(p => {
            console.log(`   - ${p.Nombre}: $${p.Precio}`);
        });
        
        await pool.close();
        console.log('\n✅ Test completado exitosamente!');
        
    } catch (error) {
        console.error('❌ Error de conexión:');
        console.error('   Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        console.error('   Stack:', error.stack);
    }
}

test();
