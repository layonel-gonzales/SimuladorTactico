export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function showInfoMessage(message, isError = false) {
    const panel = document.getElementById('info-panel');
    panel.textContent = message;
    panel.style.display = 'block';
    panel.style.backgroundColor = isError ? 'rgba(255, 0, 0, 0.8)' : 'rgba(0, 255, 128, 0.8)';
    
    setTimeout(() => {
        panel.style.display = 'none';
    }, 5000);
}

export function setupModal(modalId, closeButtonId, openButtonId = null) {
    const modal = document.getElementById(modalId);
    const closeButton = document.getElementById(closeButtonId);
    
    function showModal() {
        modal.classList.add('visible');
    }
    
    function hideModal() {
        modal.classList.remove('visible');
    }
    
    closeButton.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) hideModal();
    });
    
    if (openButtonId) {
        document.getElementById(openButtonId).addEventListener('click', (e) => {
            e.stopPropagation();
            showModal();
        });
    }
    
    return { showModal, hideModal };
}