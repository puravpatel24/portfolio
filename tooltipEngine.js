/**
 * Product Card Tooltip Engine
 * Manages z-index stacking for tooltips above overlapping cards
 */

// Configuration
const config = {
    tooltipZ: 999,      // High z-index to escape stacking context
    defaultZ: 20,       // Default tooltip z-index
    useHighZ: true      // Toggle for demo
};

// State
const state = {
    activeTooltip: null,
    highZEnabled: true
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    bindCards();
    bindControls();
    console.log('🛒 Tooltip engine ready');
    console.log('Card base z-index: 10 | Tooltip default: 20 | Hover escape: 999');
});

/**
 * Bind event listeners to all product cards
 */
function bindCards() {
    const cards = document.querySelectorAll('.productCard');
    
    cards.forEach(card => {
        const product = card.dataset.product;
        const tooltip = document.getElementById(`tip-${product}`);
        
        if (!tooltip) {
            console.warn(`Tooltip not found for: ${product}`);
            return;
        }

        // Mouse enter: show tooltip with high z-index
        card.addEventListener('mouseenter', () => {
            showTooltip(tooltip, card);
        });

        // Mouse leave: hide tooltip
        card.addEventListener('mouseleave', (e) => {
            // Small delay to allow moving to tooltip
            setTimeout(() => {
                if (!tooltip.matches(':hover')) {
                    hideTooltip(tooltip);
                }
            }, 100);
        });

        // Also hide when leaving tooltip itself
        tooltip.addEventListener('mouseleave', () => {
            hideTooltip(tooltip);
        });
    });
}

/**
 * Show tooltip with escape z-index
 */
function showTooltip(tooltip, card) {
    // Hide any existing tooltip
    if (state.activeTooltip && state.activeTooltip !== tooltip) {
        hideTooltip(state.activeTooltip);
    }

    // Apply high z-index if enabled
    if (state.highZEnabled) {
        tooltip.style.zIndex = config.tooltipZ.toString();
        tooltip.classList.add('high-stack');
        console.log(`🔝 ${card.dataset.product}: tooltip z-index → ${config.tooltipZ}`);
    } else {
        tooltip.style.zIndex = config.defaultZ.toString();
        tooltip.classList.remove('high-stack');
        console.log(`➡️ ${card.dataset.product}: tooltip z-index → ${config.defaultZ} (may clip!)`);
    }

    // Display tooltip
    tooltip.classList.add('is-visible');
    state.activeTooltip = tooltip;

    // Visual feedback on card
    card.style.zIndex = '15';
}

/**
 * Hide tooltip and reset
 */
function hideTooltip(tooltip) {
    tooltip.classList.remove('is-visible');
    tooltip.classList.remove('high-stack');
    
    // Reset z-index after transition
    setTimeout(() => {
        if (!tooltip.classList.contains('is-visible')) {
            tooltip.style.zIndex = '';
        }
    }, 200);

    if (state.activeTooltip === tooltip) {
        state.activeTooltip = null;
    }

    // Reset card z-index
    const card = tooltip.closest('.productCard');
    if (card) {
        card.style.zIndex = '';
    }
}

/**
 * Bind control panel
 */
function bindControls() {
    const toggle = document.getElementById('highZToggle');
    const status = document.querySelector('.statusValue');

    toggle.addEventListener('change', (e) => {
        state.highZEnabled = e.target.checked;
        
        if (state.highZEnabled) {
            status.textContent = 'z-index: 999 on hover';
            status.classList.remove('inactive');
            console.log('✅ High z-index mode enabled');
        } else {
            status.textContent = 'z-index: 20 only (tooltip may hide)';
            status.classList.add('inactive');
            console.log('⚠️ High z-index disabled - tooltips may clip!');
        }

        // Hide any active tooltip to apply change
        if (state.activeTooltip) {
            hideTooltip(state.activeTooltip);
        }
    });
}

// Expose for debugging
window.tooltipState = state;
window.tooltipConfig = config;
