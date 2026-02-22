/**
 * Interactive Gallery Stack Controller
 * Manages z-index layering with querySelectorAll loop
 */

// Store original z-index values
const originalZ = {
    picFirst: 1,
    picSecond: 2,
    picThird: 3
};

// Track current front image
let currentFront = null;

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    attachClickHandlers();
    updateCodeDisplay();
    console.log('🖼️ Gallery initialized with 3 overlapping images');
    console.log('Original z-index: picFirst=1, picSecond=2, picThird=3');
});

/**
 * Attach click listeners to all images using querySelectorAll
 */
function attachClickHandlers() {
    // Get all images with querySelectorAll as requested
    const allImages = document.querySelectorAll('.framePic');
    
    allImages.forEach((img) => {
        img.addEventListener('click', (e) => {
            const clickedId = e.target.id;
            console.log(`🖱️ Clicked: ${clickedId}`);
            bringToFront(clickedId);
        });
    });
}

/**
 * Bring clicked image to front (z-index: 10)
 * Reset all others to original values (1, 2, 3)
 */
function bringToFront(targetId) {
    // Get all images with querySelectorAll loop
    const allImages = document.querySelectorAll('.framePic');
    
    allImages.forEach((img) => {
        const imgId = img.id;
        
        if (imgId === targetId) {
            // Clicked image: bring to front
            img.style.zIndex = '10';
            img.classList.add('at-front');
            currentFront = imgId;
            console.log(`  ⬆️ ${imgId}: z-index set to 10 (FRONT)`);
            
        } else {
            // Other images: reset to original z-index
            const originalValue = originalZ[imgId];
            img.style.zIndex = originalValue.toString();
            img.classList.remove('at-front');
            console.log(`  ⬇️ ${imgId}: z-index reset to ${originalValue}`);
        }
    });
    
    updateBadgeDisplay(targetId);
    updateCodeDisplay();
}

/**
 * Restore all images to original order (1, 2, 3)
 */
function restoreOriginalOrder() {
    const allImages = document.querySelectorAll('.framePic');
    
    allImages.forEach((img) => {
        const imgId = img.id;
        const originalValue = originalZ[imgId];
        
        img.style.zIndex = originalValue.toString();
        img.classList.remove('at-front');
    });
    
    currentFront = null;
    console.log('🔄 Restored original order: 1, 2, 3');
    
    updateBadgeDisplay(null);
    updateCodeDisplay();
}

/**
 * Update visual badge showing current stack order
 */
function updateBadgeDisplay(frontId) {
    const badgeItems = document.querySelectorAll('.zItem');
    
    badgeItems.forEach((item) => {
        const zVal = parseInt(item.dataset.z);
        item.className = 'zItem'; // reset
        
        if (!frontId) {
            // Original order
            if (zVal === 3) item.classList.add('active');
            else if (zVal === 2) item.classList.add('middle');
            else item.classList.add('base');
        } else {
            // Someone at front
            const frontOriginal = originalZ[frontId];
            if (zVal === frontOriginal) item.classList.add('active');
            else if (zVal === 3 && frontOriginal !== 3) item.classList.add('middle');
            else item.classList.add('base');
        }
    });
}

/**
 * Update code preview panel
 */
function updateCodeDisplay() {
    const allImages = document.querySelectorAll('.framePic');
    let output = '// Current z-index values:\n';
    
    allImages.forEach((img) => {
        const computedZ = window.getComputedStyle(img).zIndex;
        const isFront = img.classList.contains('at-front');
        const marker = isFront ? ' ← FRONT' : '';
        output += `${img.id}:  z-index: ${computedZ}${marker}\n`;
    });
    
    document.getElementById('codeOutput').textContent = output;
}

// Expose functions for onclick handlers
window.bringToFront = bringToFront;
window.restoreOriginalOrder = restoreOriginalOrder;
