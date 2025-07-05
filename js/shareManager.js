// shareManager.js
// Gestiona la captura y el compartir/descargar de la cancha

export default class ShareManager {
    constructor() {
        this.initShareButton();
    }

    initShareButton() {
        // Crear el botón si no existe
        if (!document.getElementById('share-pitch-btn')) {
            const btn = document.createElement('button');
            btn.id = 'share-pitch-btn';
            btn.className = 'share-pitch-btn';
            btn.title = 'Compartir alineación';
            btn.innerHTML = '<i class="fas fa-share-alt"></i>';
            document.body.appendChild(btn);
            btn.addEventListener('click', () => this.handleShare());
        }
    }

    async handleShare() {
        const pitch = document.getElementById('pitch-container');
        if (!pitch) return alert('No se encontró el campo para capturar.');
        // Cargar html2canvas si no está
        if (!window.html2canvas) {
            await this.loadHtml2Canvas();
        }
        window.html2canvas(pitch, {backgroundColor: null}).then(canvas => {
            canvas.toBlob(async (blob) => {
                const file = new File([blob], 'alineacion.png', {type: 'image/png'});
                // Intentar compartir si es posible
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            files: [file],
                            title: 'Alineación',
                            text: '¡Mira mi alineación!'
                        });
                        return;
                    } catch (e) {
                        // Si el usuario cancela, no hacer nada
                    }
                }
                // Si no se puede compartir, descargar
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'alineacion.png';
                a.click();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            }, 'image/png');
        });
    }

    loadHtml2Canvas() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
}
