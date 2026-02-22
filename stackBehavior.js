/**
 * Z-Index Stacking Context Demonstration
 * Tests fixed header behavior against positioned content divs
 */

const state = {
    redBoxHighZ: false,
    scrollProgress: 0
};

// DOM Elements
const elements = {
    redBox: document.getElementById('redBox'),
    toggleBtn: document.getElementById('toggleHighZ'),
    resetBtn: document.getElementById('resetDemo'),
    zValue: document.getElementById('zValue'),
    redExtra: document.getElementById('redExtra'),
    compareZ: document.getElementById('compareZ'),
    scrollProgress: document.getElementById('scrollProgress'),
    overlayTest: document.getElementById('overlayTest'),
    stateDisplay: document.querySelector('.currentState')
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    updateDisplay();
    console.log('🎯 Z-Index Demo Loaded');
    console.log('Header: position: fixed, z-index: 100');
    console.log('Content boxes: position: relative, z-index: 1-3');
});

function bindEvents() {
    // Toggle high z-index on red box
    elements.toggleBtn.addEventListener('click', toggleRedBoxZIndex);
    
    // Reset demo
    elements.resetBtn.addEventListener('click', resetDemo);
    
    // Scroll progress
    window.addEventListener('scroll', updateScrollProgress);
    
    // Check overlap on scroll
    window.addEventListener('scroll', checkHeaderOverlap);
}

/**
 * Toggle z-index: 50 on the crimson/red box
 * This tests if higher z-index in content can beat fixed header
 */
function toggleRedBoxZIndex() {
    state.redBoxHighZ = !state.redBoxHighZ;
    
    if (state.redBoxHighZ) {
        // Add high z-index to test
        elements.redBox.classList.add('high-stack');
        elements.toggleBtn.classList.add('active');
        elements.toggleBtn.textContent = 'Remove z-index: 50 from Red Box';
        
        console.log('🔴 Red box z-index changed: 1 → 50');
        console.log('✅ Header still visible? YES - different stacking contexts!');
        
    } else {
        // Remove high z-index
        elements.redBox.classList.remove('high-stack');
        elements.toggleBtn.classList.remove('active');
        elements.toggleBtn.textContent = 'Add z-index: 50 to Red Box';
        
        console.log('🔴 Red box z-index restored: 50 → 1');
    }
    
    updateDisplay();
}

/**
 * Update visual state display
 */
function updateDisplay() {
    const zIndex = state.redBoxHighZ ? '50' : 'auto (none)';
    const isModified = state.redBoxHighZ;
    
    // Update state badge
    elements.zValue.textContent = zIndex;
    elements.zValue.classList.toggle('modified', isModified);
    
    // Show/hide extra property
    elements.redExtra.classList.toggle('hidden', !isModified);
    
    // Update comparison table
    elements.compareZ.textContent = isModified ? 'z-index: 50' : 'z-index: auto';
    elements.compareZ.classList.toggle('modified', isModified);
    
    // Visual indicator on state display
    elements.stateDisplay.style.borderLeftColor = isModified ? '#ef4444' : '#f59e0b';
}

/**
 * Reset demo to initial state
 */
function resetDemo() {
    state.redBoxHighZ = false;
    elements.redBox.classList.remove('high-stack');
    elements.toggleBtn.classList.remove('active');
    elements.toggleBtn.textContent = 'Add z-index: 50 to Red Box';
    updateDisplay();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    console.log('🔄 Demo reset');
}

/**
 * Update scroll progress bar
 */
function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    
    elements.scrollProgress.style.width = `${progress}%`;
    state.scrollProgress = progress;
}

/**
 * Check if header is overlapping red box
 * Show educational message when overlap occurs with high z-index
 */
function checkHeaderOverlap() {
    if (!state.redBoxHighZ) return;
    
    const headerBottom = 140; // Header height + padding
    const redBoxTop = elements.redBox.offsetTop;
    const scrollY = window.scrollY;
    
    // Detect when header overlaps red box
    const isOverlapping = scrollY + headerBottom > redBoxTop && 
                          scrollY < redBoxTop + elements.redBox.offsetHeight;
    
    if (isOverlapping && !state.shownOverlapMessage) {
        state.shownOverlapMessage = true;
        // Optional: show subtle indicator that test is working
        console.log('🧪 TEST: Header (z:100) overlapping Red Box (z:50) - Header wins!');
    }
}

/**
 * Close the test result overlay
 */
function closeOverlay() {
    elements.overlayTest.hidden = true;
}

// Expose to global for onclick handlers
window.closeOverlay = closeOverlay;

// Educational console output on load
setTimeout(() => {
    console.log('');
    console.log('📋 STACKING CONTEXT TEST:');
    console.log('1. Scroll down to see header stay above all colored boxes');
    console.log('2. Click "Add z-index: 50 to Red Box"');
    console.log('3. Scroll back up - header STILL stays on top!');
    console.log('4. Why? Both header and red box are in the ROOT stacking context');
    console.log('   (header: fixed, red box: relative), so 100 > 50');
    console.log('');
}, 1000);
