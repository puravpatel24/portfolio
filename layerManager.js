/**
 * Multi-Modal Layer Manager
 * Dynamic z-index assignment: base 1000, nested 1001+, backgrounds 999
 */

// Track active modals and their stack order
const modalStack = {
    active: [],      // Array of {id, zIndex, openedAt}
    baseZ: 1000,     // Starting z-index for modals
    backdropZ: 999   // Backdrop always 999
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    bindTriggers();
    console.log('🎴 Modal system ready');
    console.log('Base z-index: 1000 | Nested: 1001+ | Backdrop: 999');
});

/**
 * Bind click handlers to trigger buttons
 */
function bindTriggers() {
    document.querySelectorAll('.modalTrigger').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.dataset.modal;
            openModal(modalId);
        });
    });
}

/**
 * Open a modal with dynamic z-index
 * @param {string} modalId - ID of modal to open
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`Modal not found: ${modalId}`);
        return;
    }

    // Check if already open
    const existingIndex = modalStack.active.findIndex(m => m.id === modalId);
    if (existingIndex !== -1) {
        // Already open - bring to front by re-opening
        console.log(`🔄 ${modalId} already open, bringing to front`);
        modalStack.active.splice(existingIndex, 1);
    }

    // Calculate new z-index: base + stack position
    const newZIndex = modalStack.baseZ + modalStack.active.length;
    
    // Add to stack
    modalStack.active.push({
        id: modalId,
        zIndex: newZIndex,
        openedAt: Date.now()
    });

    // Apply z-index to wrapper
    modal.style.zIndex = newZIndex.toString();
    
    // Ensure backdrop stays at 999 (relative to its modal)
    const backdrop = modal.querySelector('.modalBackdrop');
    if (backdrop) {
        backdrop.style.zIndex = '999';
    }
    
    // Ensure card content is above backdrop
    const card = modal.querySelector('.modalCard');
    if (card) {
        card.style.zIndex = (newZIndex + 1).toString();
    }

    // Show modal
    modal.classList.add('is-open');
    
    console.log(`📤 Opened ${modalId} at z-index: ${newZIndex} (card: ${newZIndex + 1})`);
    
    updateStackDisplay();
}

/**
 * Close a modal by sending to z-index: -1 with fade
 * @param {string} modalId - ID of modal to close
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Remove from active stack
    const stackIndex = modalStack.active.findIndex(m => m.id === modalId);
    if (stackIndex !== -1) {
        modalStack.active.splice(stackIndex, 1);
    }

    // Animate out: z-index -1, opacity 0
    modal.classList.remove('is-open');
    modal.style.zIndex = '-1';
    
    console.log(`📥 Closed ${modalId} (z-index: -1)`);
    
    // Rebalance remaining modals
    rebalanceStack();
    updateStackDisplay();
}

/**
 * Rebalance z-index values for remaining open modals
 */
function rebalanceStack() {
    modalStack.active.forEach((item, index) => {
        const modal = document.getElementById(item.id);
        const newZ = modalStack.baseZ + index;
        
        item.zIndex = newZ;
        modal.style.zIndex = newZ.toString();
        
        const card = modal.querySelector('.modalCard');
        if (card) {
            card.style.zIndex = (newZ + 1).toString();
        }
        
        console.log(`  ↻ Rebalanced ${item.id}: z-index ${newZ}`);
    });
}

/**
 * Close all modals
 */
function closeAllModals() {
    [...modalStack.active].forEach(item => {
        closeModal(item.id);
    });
}

/**
 * Open all modals simultaneously (demo)
 */
function openAllModals() {
    const allModals = ['loginCard', 'signupCard', 'confirmCard'];
    
    // Small delay between each for visual effect
    allModals.forEach((id, index) => {
        setTimeout(() => openModal(id), index * 150);
    });
}

/**
 * Update visual stack monitor
 */
function updateStackDisplay() {
    const list = document.getElementById('activeLayers');
    
    if (modalStack.active.length === 0) {
        list.innerHTML = '<li class="emptyState">No active modals</li>';
        return;
    }
    
    list.innerHTML = modalStack.active.map(item => `
        <li class="layerItem">
            <span class="layerName">${formatName(item.id)}</span>
            <span class="layerZ">z-index: ${item.zIndex}</span>
        </li>
    `).join('');
}

/**
 * Format modal ID for display
 */
function formatName(id) {
    const names = {
        loginCard: '🔐 Login',
        signupCard: '📝 Signup',
        confirmCard: '✅ Confirmation'
    };
    return names[id] || id;
}

// Expose functions globally
window.openModal = openModal;
window.closeModal = closeModal;
window.closeAllModals = closeAllModals;
window.openAllModals = openAllModals;
