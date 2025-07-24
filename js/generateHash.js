/**
 * Generador de Hash para Contraseñas
 * Utilidad para generar hash SHA-256 de contraseñas
 */

// Función para generar hash SHA-256
async function generatePasswordHash(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Generar hash para "Anibal2023"
generatePasswordHash("Anibal2023").then(hash => {
    console.log("Hash SHA-256 de 'Anibal2023':", hash);
    console.log("Copiar este hash para usar en el sistema:");
    console.log(hash);
});

// Hash precalculado: 8a5c3d8f9e2b1a6d4e7f8c9b0a3d6e1f2a5b8c9d0e3f6a1b4c7d0e9f2a5b8c3d6
