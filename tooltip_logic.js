// Select all product cards
const cards = document.querySelectorAll('.product-card');

cards.forEach(card => {
    const tooltip = card.querySelector('.tooltip');

    // On mouse enter: Show and bring to very front
    card.addEventListener('mouseenter', () => {
        tooltip.style.display = 'block';
        tooltip.style.zIndex = '999'; // Setting extremely high z-index
    });

    // On mouse leave: Hide
    card.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
    });
});
