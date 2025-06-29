// Main theme JavaScript file

document.addEventListener('DOMContentLoaded', function() {
  // Initialize theme components
  initializeTheme();
});

function initializeTheme() {
  // Mobile menu toggle
  const mobileMenuToggle = document.querySelector('[data-mobile-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  
  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', function() {
      mobileMenu.classList.toggle('hidden');
      document.body.classList.toggle('overflow-hidden');
    });
  }
  
  // Quantity selectors
  const quantitySelectors = document.querySelectorAll('[data-quantity-selector]');
  
  quantitySelectors.forEach(selector => {
    const input = selector.querySelector('input');
    const increaseBtn = selector.querySelector('[data-increase]');
    const decreaseBtn = selector.querySelector('[data-decrease]');
    
    if (input && increaseBtn && decreaseBtn) {
      increaseBtn.addEventListener('click', function() {
        const currentValue = parseInt(input.value, 10);
        input.value = currentValue + 1;
        input.dispatchEvent(new Event('change'));
      });
      
      decreaseBtn.addEventListener('click', function() {
        const currentValue = parseInt(input.value, 10);
        if (currentValue > 1) {
          input.value = currentValue - 1;
          input.dispatchEvent(new Event('change'));
        }
      });
    }
  });
  
  // Initialize any other components as needed
}