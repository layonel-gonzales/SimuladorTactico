/**
 * ==========================================
 * 🗄️ DATABASE CONNECTION - SQL SERVER
 * ==========================================
 * Configuración y conexión a SQL Server
 * Con Autenticación de Windows (Integrated Security)
 * Soporta múltiples cadenas de conexión por PC
 * ==========================================
 */

const msnodesqlv8 = require('msnodesqlv8');
const util = require('util');

// Cadenas de conexión para diferentes PCs
// Se intenta primero la cadena actual, luego la original
const connectionStrings = [
    // PC actual (localhost)
    'Driver={ODBC Driver 17 for SQL Server};Server=localhost;Database=SimuladorTacticoDB;Trusted_Connection=yes;Encrypt=yes;TrustServerCertificate=yes;',
    // PC original (MSI)
    'Driver={ODBC Driver 17 for SQL Server};Server=MSI;Database=SimuladorTacticoDB;Trusted_Connection=yes;Encrypt=yes;TrustServerCertificate=yes;'
];

// Promisificar funciones de msnodesqlv8
const openAsync = util.promisify(msnodesqlv8.open);

// Conexión global
let connection = null;
let activeConnectionString = null;

/**
 * Promisificar query de una conexión
 */
function queryAsync(conn, sql, params = []) {
    return new Promise((resolve, reject) => {
        conn.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve({ recordset: results, rowsAffected: results ? [results.length] : [0] });
        });
    });
}

/**
 * Obtener conexión a la base de datos con fallback automático
 */
async function getConnection() {
    try {
        if (connection) {
            return connection;
        }
        
        console.log('[Database] Conectando a SQL Server...');
        
        let lastError = null;
        
        // Intentar cada cadena de conexión
        for (let i = 0; i < connectionStrings.length; i++) {
            const connString = connectionStrings[i];
            try {
                console.log(`[Database] Intento ${i + 1}/${connectionStrings.length}...`);
                connection = await openAsync(connString);
                activeConnectionString = connString;
                console.log('[Database] ✅ Conexión establecida a SimuladorTacticoDB');
                
                // Añadir método queryAsync a la conexión
                connection.queryAsync = (sql, params) => queryAsync(connection, sql, params);
                
                return connection;
            } catch (err) {
                lastError = err;
                console.log(`[Database] ❌ Intento ${i + 1} falló: ${err.message}`);
                if (i < connectionStrings.length - 1) {
                    console.log('[Database] Probando siguiente cadena de conexión...');
                }
            }
        }
        
        // Si llegamos aquí, todas las cadenas fallaron
        throw new Error(`No se pudo conectar con ninguna cadena de conexión. Último error: ${lastError.message}`);
    } catch (error) {
        console.error('[Database] ❌ Error de conexión:', error.message || error);
        throw error;
    }
}

/**
 * Cerrar conexión
 */
async function closeConnection() {
    return new Promise((resolve, reject) => {
        try {
            if (connection) {
                connection.close((err) => {
                    if (err) {
                        console.error('[Database] Error cerrando conexión:', err);
                        reject(err);
                    } else {
                        connection = null;
                        console.log('[Database] Conexión cerrada');
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        } catch (error) {
            console.error('[Database] Error cerrando conexión:', error);
            reject(error);
        }
    });
}

/**
 * Ejecutar query con parámetros nombrados
 * Convierte @param a ? para msnodesqlv8
 */
async function query(queryString, params = {}) {
    try {
        const conn = await getConnection();
        
        // Convertir parámetros nombrados a array ordenado
        const paramKeys = Object.keys(params);
        const paramValues = [];
        
        // Reemplazar @nombre con ? y guardar valores en orden
        let processedQuery = queryString;
        paramKeys.forEach(key => {
            const regex = new RegExp(`@${key}\\b`, 'g');
            if (processedQuery.match(regex)) {
                processedQuery = processedQuery.replace(regex, '?');
                paramValues.push(params[key]);
            }
        });
        
        const result = await conn.queryAsync(processedQuery, paramValues);
        return result;
    } catch (error) {
        console.error('[Database] Error en query:', error.message || error);
        throw error;
    }
}

/**
 * Ejecutar stored procedure
 */
async function execute(procedureName, params = {}) {
    try {
        const conn = await getConnection();
        
        // Construir llamada al SP
        const paramKeys = Object.keys(params);
        const paramPlaceholders = paramKeys.map(key => `@${key} = ?`).join(', ');
        const sql = `EXEC ${procedureName} ${paramPlaceholders}`;
        const paramValues = paramKeys.map(key => params[key]);
        
        const result = await conn.queryAsync(sql, paramValues);
        return result;
    } catch (error) {
        console.error('[Database] Error ejecutando SP:', error.message || error);
        throw error;
    }
}

/**
 * Verificar conexión
 */
async function testConnection() {
    try {
        const conn = await getConnection();
        const result = await conn.queryAsync('SELECT 1 as test');
        console.log('[Database] ✅ Test de conexión exitoso');
        return true;
    } catch (error) {
        console.error('[Database] ❌ Test de conexión fallido:', error.message || error);
        return false;
    }
}

/**
 * Helper para crear un request-like object (compatibilidad con código existente)
 */
function createRequest() {
    const params = {};
    return {
        input: (name, value) => {
            params[name] = value;
            return this;
        },
        query: async (sql) => {
            return await query(sql, params);
        }
    };
}

module.exports = {
    getConnection,
    closeConnection,
    query,
    execute,
    testConnection,
    createRequest
};
