/**
 * ==========================================
 * 🗄️ DATABASE INITIALIZATION
 * ==========================================
 * Inicializa la base de datos automáticamente:
 * - Si NO existe: la crea y ejecuta scripts
 * - Si EXISTE: la usa sin cambios
 * ==========================================
 */

const msnodesqlv8 = require('msnodesqlv8');
const fs = require('fs');
const path = require('path');
const util = require('util');

const DATABASE_NAME = 'SimuladorTacticoDB';
const openAsync = util.promisify(msnodesqlv8.open);

// Cadenas de conexión al servidor (sin especificar BD)
const masterConnectionStrings = [
    'Driver={ODBC Driver 17 for SQL Server};Server=localhost;Trusted_Connection=yes;Encrypt=yes;TrustServerCertificate=yes;',
    'Driver={ODBC Driver 17 for SQL Server};Server=MSI;Trusted_Connection=yes;Encrypt=yes;TrustServerCertificate=yes;'
];

/**
 * Ejecutar query en una conexión
 */
function queryAsync(conn, sql) {
    return new Promise((resolve, reject) => {
        conn.query(sql, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

/**
 * Conectar al servidor master
 */
async function connectToMaster() {
    let lastError = null;
    
    for (let i = 0; i < masterConnectionStrings.length; i++) {
        try {
            const conn = await openAsync(masterConnectionStrings[i]);
            return conn;
        } catch (err) {
            lastError = err;
        }
    }
    
    throw new Error(`No se pudo conectar al servidor: ${lastError.message}`);
}

/**
 * Verificar si la base de datos existe
 */
async function databaseExists() {
    try {
        console.log('[Init] Verificando si la base de datos existe...');
        const conn = await connectToMaster();
        
        const result = await queryAsync(
            conn,
            `SELECT COUNT(*) as count FROM sys.databases WHERE name = '${DATABASE_NAME}'`
        );
        
        conn.close();
        
        const exists = result && result[0] && result[0].count > 0;
        console.log(`[Init] ${exists ? '✅' : '❌'} Base de datos ${exists ? 'existe' : 'NO existe'}`);
        
        return exists;
    } catch (error) {
        console.error('[Init] Error verificando BD:', error.message);
        return false;
    }
}

/**
 * Crear la base de datos
 */
async function createDatabase() {
    try {
        console.log(`[Init] Creando base de datos ${DATABASE_NAME}...`);
        const conn = await connectToMaster();
        
        await queryAsync(conn, `CREATE DATABASE ${DATABASE_NAME}`);
        console.log('[Init] ✅ Base de datos creada exitosamente');
        
        conn.close();
        return true;
    } catch (error) {
        console.error(`[Init] Error creando BD: ${error.message}`);
        return false;
    }
}

/**
 * Ejecutar scripts SQL
 */
async function runSQLScripts() {
    try {
        const scriptsDir = path.join(__dirname, '..', 'database');
        
        // Archivos en orden de ejecución
        const scriptFiles = [
            'create_database.sql',
            'insert_test_data.sql'
        ];
        
        // Conectar a la BD específica
        let dbConnectionString = null;
        for (let connStr of masterConnectionStrings) {
            try {
                const testConn = await openAsync(
                    connStr.replace('Trusted_Connection=yes', `Trusted_Connection=yes;Database=${DATABASE_NAME}`)
                );
                dbConnectionString = connStr.replace('Trusted_Connection=yes', `Trusted_Connection=yes;Database=${DATABASE_NAME}`);
                testConn.close();
                break;
            } catch (err) {
                continue;
            }
        }
        
        if (!dbConnectionString) {
            throw new Error('No se pudo conectar a la base de datos');
        }
        
        const conn = await openAsync(dbConnectionString);
        
        for (const file of scriptFiles) {
            const scriptPath = path.join(scriptsDir, file);
            
            if (!fs.existsSync(scriptPath)) {
                console.log(`[Init] ⚠️ Script ${file} no encontrado`);
                continue;
            }
            
            console.log(`[Init] Ejecutando ${file}...`);
            const sql = fs.readFileSync(scriptPath, 'utf8');
            
            // Dividir por GO (separador de batches en SQL Server)
            const batches = sql.split(/^\s*GO\s*$/gim);
            
            for (const batch of batches) {
                const trimmedBatch = batch.trim();
                if (trimmedBatch.length > 0) {
                    try {
                        await queryAsync(conn, trimmedBatch);
                    } catch (err) {
                        console.log(`[Init] ⚠️ Aviso en script: ${err.message.substring(0, 100)}`);
                        // Continuar con el siguiente batch incluso si uno falla
                    }
                }
            }
            
            console.log(`[Init] ✅ ${file} ejecutado`);
        }
        
        conn.close();
        return true;
    } catch (error) {
        console.error(`[Init] Error ejecutando scripts: ${error.message}`);
        return false;
    }
}

/**
 * Inicializar la base de datos
 */
async function initializeDatabase() {
    try {
        console.log('\n[Init] 🚀 Iniciando proceso de inicialización de BD...\n');
        
        const exists = await databaseExists();
        
        if (!exists) {
            console.log('[Init] Creando BD y ejecutando scripts...');
            const created = await createDatabase();
            
            if (created) {
                await runSQLScripts();
                console.log('[Init] ✅ Base de datos inicializada completamente\n');
                return true;
            }
        } else {
            console.log('[Init] ℹ️ Base de datos ya existe, usando la existente\n');
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('[Init] ❌ Error en inicialización:', error.message);
        return false;
    }
}

module.exports = {
    initializeDatabase,
    databaseExists,
    createDatabase,
    runSQLScripts
};
