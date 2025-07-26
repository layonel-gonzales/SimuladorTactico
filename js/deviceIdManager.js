// deviceIdManager.js
// Utilidad para generar y gestionar un deviceId único por dispositivo (localStorage)

const DEVICE_ID_KEY = 'simuladorTactico_deviceId';

function generateDeviceId() {
    // Usa crypto si está disponible, si no, fallback a Math.random
    if (window.crypto && window.crypto.getRandomValues) {
        const array = new Uint32Array(4);
        window.crypto.getRandomValues(array);
        return Array.from(array, dec => dec.toString(16)).join('-');
    } else {
        return (
            Date.now().toString(16) +
            '-' + Math.random().toString(16).substr(2, 8) +
            '-' + Math.random().toString(16).substr(2, 8)
        );
    }
}

export function getOrCreateDeviceId() {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
        deviceId = generateDeviceId();
        localStorage.setItem(DEVICE_ID_KEY, deviceId);
        console.log('[DeviceId] Nuevo deviceId generado:', deviceId);
    } else {
        console.log('[DeviceId] deviceId existente:', deviceId);
    }
    return deviceId;
}
