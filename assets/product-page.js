/**
 * Product Page functionality for 3K Ventures theme
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize product page functionality
  initProductPage();
  
  // Initialize image gallery
  initProductGallery();
  
  // Initialize variant selector
  initVariantSelector();
  
  // Initialize quantity selector
  initQuantitySelector();
  
  // Initialize size guide
  initSizeGuide();
});

/**
 * Initialize product page functionality
 */
function initProductPage() {
  // Add to cart form
  const addToCartForm = document.getElementById('product-form');
  if (addToCartForm) {
    addToCartForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      const formData = new FormData(this);
      const submitButton = this.querySelector('button[type="submit"]');
      const originalButtonHtml = submitButton.innerHTML;
      
      // Show loading state
      submitButton.innerHTML = '<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';
      submitButton.disabled = true;
      
      fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(error => {
            throw new Error(error.description || 'Error adding to cart');
          });
        }
        return response.json();
      })
      .then(data => {
        // Reset button
        submitButton.innerHTML = originalButtonHtml;
        submitButton.disabled = false;
        
        // Show success message
        showToast('Product added to cart', 'success');
        
        // Update cart count
        updateCartCount();
      })
      .catch(error => {
        console.error('Error adding to cart:', error);
        
        // Reset button
        submitButton.innerHTML = originalButtonHtml;
        submitButton.disabled = false;
        
        // Show error message
        showToast(error.message || 'Error adding to cart', 'error');
      });
    });
  }
  
  // Add to wishlist button
  const wishlistButton = document.querySelector('[data-product-wishlist]');
  if (wishlistButton) {
    const productHandle = wishlistButton.getAttribute('data-product-handle');
    
    // Check if product is in wishlist
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (wishlist.includes(productHandle)) {
      wishlistButton.classList.add('active');
      wishlistButton.querySelector('svg').classList.add('text-olive-verde', 'fill-current');
    }
    
    wishlistButton.addEventListener('click', function(event) {
      event.preventDefault();
      toggleWishlist(productHandle);
    });
  }
}

/**
 * Initialize product gallery
 */
function initProductGallery() {
  const mainImage = document.getElementById('product-main-image');
  const thumbnails = document.querySelectorAll('.product-thumbnail');
  
  if (mainImage && thumbnails.length > 0) {
    thumbnails.forEach(thumbnail => {
      thumbnail.addEventListener('click', function() {
        // Update main image
        const newSrc = this.getAttribute('data-image-url');
        const newAlt = this.getAttribute('data-image-alt');
        
        // Animate image change
        mainImage.style.opacity = '0';
        setTimeout(() => {
          mainImage.src = newSrc;
          if (newAlt) mainImage.alt = newAlt;
          mainImage.style.opacity = '1';
        }, 300);
        
        // Update active thumbnail
        thumbnails.forEach(t => t.classList.remove('active', 'border-olive-verde'));
        this.classList.add('active', 'border-olive-verde');
      });
    });
    
    // Initialize zoom on main image
    if (window.innerWidth >= 768) { // Only on desktop
      mainImage.addEventListener('mousemove', function(e) {
        // Get the position of the cursor relative to the image
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate the percentage position
        const xPercent = Math.max(0, Math.min(100, (x / rect.width) * 100));
        const yPercent = Math.max(0, Math.min(100, (y / rect.height) * 100));
        
        // Set the transform origin
        this.style.transformOrigin = `${xPercent}% ${yPercent}%`;
      });
      
      mainImage.addEventListener('mouseenter', function() {
        // Add a small delay to make the zoom effect smoother
        setTimeout(() => {
          this.style.transform = 'scale(1.5)';
        }, 50);
      });
      
      mainImage.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
      });
      
      // Add zoom indicator
      const zoomIndicator = document.createElement('div');
      zoomIndicator.className = 'absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded pointer-events-none opacity-0 transition-opacity duration-300';
      zoomIndicator.textContent = 'Hover to zoom';
      
      // Add the indicator to the parent container
      const imageContainer = mainImage.parentElement;
      if (imageContainer) {
        imageContainer.style.position = 'relative';
        imageContainer.appendChild(zoomIndicator);
        
        // Show indicator on hover
        imageContainer.addEventListener('mouseenter', () => {
          zoomIndicator.style.opacity = '1';
          setTimeout(() => {
            zoomIndicator.style.opacity = '0';
          }, 1500);
        });
      }
    }
  }
}

/**
 * Initialize variant selector
 */
function initVariantSelector() {
  const variantSelector = document.getElementById('product-variant-selector');
  const priceElement = document.getElementById('product-price');
  const comparePriceElement = document.getElementById('product-compare-price');
  const addToCartButton = document.querySelector('#product-form button[type="submit"]');
  
  if (variantSelector && priceElement) {
    variantSelector.addEventListener('change', function() {
      const selectedOption = this.options[this.selectedIndex];
      const price = selectedOption.getAttribute('data-price');
      const comparePrice = selectedOption.getAttribute('data-compare-price');
      const available = selectedOption.getAttribute('data-available') === 'true';
      
      // Update price
      if (price) {
        priceElement.textContent = formatMoney(price);
      }
      
      // Update compare at price
      if (comparePriceElement) {
        if (comparePrice && parseInt(comparePrice) > parseInt(price)) {
          comparePriceElement.textContent = formatMoney(comparePrice);
          comparePriceElement.classList.remove('hidden');
        } else {
          comparePriceElement.classList.add('hidden');
        }
      }
      
      // Update availability
      if (addToCartButton) {
        if (!available) {
          addToCartButton.textContent = 'Sold Out';
          addToCartButton.disabled = true;
          addToCartButton.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
          addToCartButton.textContent = 'Add to Cart';
          addToCartButton.disabled = false;
          addToCartButton.classList.remove('opacity-50', 'cursor-not-allowed');
        }
      }
    });
  }
}

/**
 * Initialize quantity selector
 */
function initQuantitySelector() {
  const quantityInput = document.getElementById('product-quantity');
  const quantityMinus = document.getElementById('quantity-minus');
  const quantityPlus = document.getElementById('quantity-plus');
  
  if (quantityInput && quantityMinus && quantityPlus) {
    quantityMinus.addEventListener('click', function() {
      const currentValue = parseInt(quantityInput.value);
      if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
      }
    });
    
    quantityPlus.addEventListener('click', function() {
      const currentValue = parseInt(quantityInput.value);
      quantityInput.value = currentValue + 1;
    });
  }
}

/**
 * Initialize size guide
 */
function initSizeGuide() {
  const sizeGuideButtons = document.querySelectorAll('[data-size-guide-toggle]');
  
  if (sizeGuideButtons.length > 0) {
    sizeGuideButtons.forEach(button => {
      button.addEventListener('click', function(event) {
        event.preventDefault();
        
        const sizeGuideModal = document.getElementById('size-guide-modal');
        if (sizeGuideModal) {
          sizeGuideModal.classList.remove('hidden');
          document.body.style.overflow = 'hidden';
        }
      });
    });
  }
}

/**
 * Update cart count
 */
function updateCartCount() {
  fetch('/cart.js')
    .then(response => response.json())
    .then(cart => {
      const cartCountElements = document.querySelectorAll('.cart-count');
      cartCountElements.forEach(element => {
        element.textContent = cart.item_count;
        if (cart.item_count === 0) {
          element.classList.add('hidden');
        } else {
          element.classList.remove('hidden');
        }
      });
    })
    .catch(error => {
      console.error('Error fetching cart:', error);
    });
}

/**
 * Format money value
 * @param {number} cents - The price in cents
 * @returns {string} - Formatted price
 */
function formatMoney(cents) {
  if (typeof cents === 'string') {
    cents = cents.replace('.', '');
  }
  
  const value = parseInt(cents || 0) / 100;
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  });
  
  return formatter.format(value);
}

/**
 * Show toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast (success, error, info)
 */
function showToast(message, type = 'success') {
  // Check if showToast is defined in wishlist.js
  if (typeof window.showToast === 'function') {
    return window.showToast(message, type);
  }
  
  // Fallback implementation if the global function is not available
  
  // Remove any existing toasts
  const existingToasts = document.querySelectorAll('.toast');
  existingToasts.forEach(toast => {
    toast.remove();
  });
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 ease-out opacity-0`;
  
  // Add type-specific classes
  switch (type) {
    case 'success':
      toast.classList.add('bg-green-500', 'text-white');
      break;
    case 'error':
      toast.classList.add('bg-red-500', 'text-white');
      break;
    case 'info':
      toast.classList.add('bg-blue-500', 'text-white');
      break;
    default:
      toast.classList.add('bg-gray-800', 'text-white');
  }
  
  // Set icon based on type
  let icon = '';
  switch (type) {
    case 'success':
      icon = '<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
      break;
    case 'error':
      icon = '<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
      break;
    case 'info':
      icon = '<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
      break;
  }
  
  toast.innerHTML = `
    <div class="flex items-center">
      ${icon}
      <span>${message}</span>
    </div>
    <button class="absolute top-1 right-1 text-white opacity-70 hover:opacity-100" onclick="this.parentElement.remove()">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
  `;
  
  document.body.appendChild(toast);
  
  // Animate in
  requestAnimationFrame(() => {
    toast.classList.add('opacity-100');
  });
  
  // Animate out after delay
  const hideTimeout = setTimeout(() => {
    toast.classList.remove('opacity-100');
    toast.classList.add('opacity-0');
    
    // Remove from DOM after animation completes
    toast.addEventListener('transitionend', () => {
      if (toast.parentElement) {
        document.body.removeChild(toast);
      }
    }, { once: true });
  }, 3000);
  
  // Store the timeout so it can be cleared if needed
  toast.hideTimeout = hideTimeout;
  
  return toast;
}