/**
 * ==========================================
 * 🧪 TEST DATABASE CONNECTION
 * ==========================================
 * Script para probar la conexión a SQL Server
 * y verificar los datos de prueba
 * ==========================================
 * 
 * Ejecutar: node server/test-db.js
 */

require('dotenv').config();

const { getConnection, query, closeConnection } = require('./database');

async function testDatabase() {
    console.log('');
    console.log('==========================================');
    console.log('🧪 TEST DE CONEXIÓN - SQL SERVER');
    console.log('==========================================');
    console.log('');
    
    try {
        // 1. Test de conexión
        console.log('1️⃣ Probando conexión...');
        const pool = await getConnection();
        console.log('   ✅ Conexión exitosa a SimuladorTacticoDB');
        console.log('');
        
        // 2. Verificar tablas
        console.log('2️⃣ Verificando tablas...');
        const tables = await query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME
        `);
        
        console.log(`   ✅ ${tables.recordset.length} tablas encontradas:`);
        tables.recordset.forEach(t => {
            console.log(`      - ${t.TABLE_NAME}`);
        });
        console.log('');
        
        // 3. Verificar planes
        console.log('3️⃣ Verificando planes...');
        const planes = await query('SELECT PlanId, Nombre, Codigo, Precio FROM Planes');
        console.log('   ✅ Planes disponibles:');
        planes.recordset.forEach(p => {
            console.log(`      - [${p.PlanId}] ${p.Nombre} (${p.Codigo}) - $${p.Precio}`);
        });
        console.log('');
        
        // 4. Verificar usuarios de prueba
        console.log('4️⃣ Verificando usuarios de prueba...');
        const usuarios = await query(`
            SELECT u.UsuarioId, u.Email, u.Nombre, u.Apellido, p.Nombre as NombrePlan
            FROM Usuarios u
            INNER JOIN Planes p ON u.PlanId = p.PlanId
        `);
        
        if (usuarios.recordset.length > 0) {
            console.log(`   ✅ ${usuarios.recordset.length} usuarios encontrados:`);
            usuarios.recordset.forEach(u => {
                console.log(`      - [${u.UsuarioId}] ${u.Email} (${u.Nombre} ${u.Apellido}) - Plan: ${u.NombrePlan}`);
            });
        } else {
            console.log('   ⚠️ No hay usuarios. Ejecuta insert_test_data.sql');
        }
        console.log('');
        
        // 5. Verificar métodos de pago
        console.log('5️⃣ Verificando métodos de pago...');
        const metodos = await query(`
            SELECT mp.MetodoPagoId, u.Email, tmp.Nombre as TipoTarjeta, mp.MarcaTarjeta, mp.UltimosDigitos
            FROM MetodosPago mp
            INNER JOIN Usuarios u ON mp.UsuarioId = u.UsuarioId
            INNER JOIN TiposMetodoPago tmp ON mp.TipoMetodoId = tmp.TipoMetodoId
        `);
        
        if (metodos.recordset.length > 0) {
            console.log(`   ✅ ${metodos.recordset.length} métodos de pago:`);
            metodos.recordset.forEach(m => {
                console.log(`      - ${m.Email}: ${m.TipoTarjeta} ${m.MarcaTarjeta} ****${m.UltimosDigitos}`);
            });
        } else {
            console.log('   ℹ️ No hay métodos de pago registrados');
        }
        console.log('');
        
        // 6. Verificar pagos
        console.log('6️⃣ Verificando historial de pagos...');
        const pagos = await query(`
            SELECT TOP 5 p.PagoId, u.Email, p.MontoTotal, p.Concepto, p.FechaPago, ep.Nombre as Estado
            FROM Pagos p
            INNER JOIN Usuarios u ON p.UsuarioId = u.UsuarioId
            INNER JOIN EstadosPago ep ON p.EstadoPagoId = ep.EstadoPagoId
            ORDER BY p.FechaPago DESC
        `);
        
        if (pagos.recordset.length > 0) {
            console.log(`   ✅ Últimos pagos:`);
            pagos.recordset.forEach(p => {
                const fecha = new Date(p.FechaPago).toLocaleDateString();
                console.log(`      - ${p.Email}: $${p.MontoTotal} - ${p.Concepto} (${p.Estado}) - ${fecha}`);
            });
        } else {
            console.log('   ℹ️ No hay pagos registrados');
        }
        console.log('');
        
        // 7. Verificar suscripciones activas
        console.log('7️⃣ Verificando suscripciones activas...');
        const suscripciones = await query(`
            SELECT s.SuscripcionId, u.Email, p.Nombre as NombrePlan, s.Estado, s.FechaInicio
            FROM Suscripciones s
            INNER JOIN Usuarios u ON s.UsuarioId = u.UsuarioId
            INNER JOIN Planes p ON s.PlanId = p.PlanId
            WHERE s.Estado = 'active'
        `);
        
        console.log(`   ✅ ${suscripciones.recordset.length} suscripciones activas:`);
        suscripciones.recordset.forEach(s => {
            const fecha = new Date(s.FechaInicio).toLocaleDateString();
            console.log(`      - ${s.Email}: ${s.NombrePlan} desde ${fecha}`);
        });
        console.log('');
        
        // Resumen
        console.log('==========================================');
        console.log('✅ TEST COMPLETADO EXITOSAMENTE');
        console.log('==========================================');
        console.log('');
        console.log('📌 Credenciales de prueba:');
        console.log('   1. GRATUITO: usuario_gratis@test.com / Test123456');
        console.log('   2. PREMIUM:  usuario_premium@test.com / Premium123');
        console.log('   3. PRO:      entrenador_pro@test.com / ProCoach2024');
        console.log('');
        console.log('🚀 Para iniciar el servidor: npm start');
        console.log('==========================================');
        
    } catch (error) {
        console.error('');
        console.error('❌ ERROR:', error.message);
        console.error('');
        
        if (error.message.includes('Failed to connect')) {
            console.log('📌 Posibles causas:');
            console.log('   1. SQL Server no está ejecutándose');
            console.log('   2. Credenciales incorrectas en .env');
            console.log('   3. Base de datos no existe (ejecutar create_database.sql)');
            console.log('');
            console.log('📝 Pasos para configurar:');
            console.log('   1. Abre SQL Server Management Studio');
            console.log('   2. Ejecuta: database/create_database.sql');
            console.log('   3. Ejecuta: database/insert_test_data.sql');
            console.log('   4. Configura .env con tu contraseña de SA');
        }
    } finally {
        await closeConnection();
    }
}

// Ejecutar
testDatabase();
