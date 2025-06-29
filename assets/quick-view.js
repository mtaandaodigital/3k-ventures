/**
 * Quick View functionality for 3K Ventures theme
 */

// Cache DOM elements and variables at the global scope to avoid repeated lookups
let quickViewModal;
let quickViewContent;
let quickViewBackdrop;
let quickViewClose;
let quickViewProductHandle;
let quickViewLoading;
let quickViewButtons;

document.addEventListener('DOMContentLoaded', function() {
  // Initialize quick view functionality
  initQuickView();
});

/**
 * Initialize quick view functionality
 */
function initQuickView() {
  // Cache DOM elements
  quickViewModal = document.getElementById('quick-view-modal');
  quickViewContent = document.getElementById('quick-view-product-content');
  quickViewBackdrop = document.getElementById('quick-view-backdrop');
  quickViewClose = document.getElementById('quick-view-close');
  quickViewProductHandle = document.getElementById('quick-view-product-handle');
  quickViewLoading = document.getElementById('quick-view-loading');
  
  // Initialize quick view buttons
  initQuickViewButtons();
  
  // Add event listeners for closing the modal
  if (quickViewBackdrop) {
    quickViewBackdrop.addEventListener('click', closeQuickView);
  }
  
  if (quickViewClose) {
    quickViewClose.addEventListener('click', closeQuickView);
  }
  
  // Close on escape key
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && quickViewModal && !quickViewModal.classList.contains('hidden')) {
      closeQuickView();
    }
  });
  
  // Initialize form handlers
  initQuickViewFormHandlers();
}

/**
 * Initialize form handlers for quick view
 */
function initQuickViewFormHandlers() {
  // Quantity controls
  const quantityMinus = document.getElementById('quick-view-quantity-minus');
  const quantityPlus = document.getElementById('quick-view-quantity-plus');
  const quantityInput = document.getElementById('quick-view-quantity');
  
  if (quantityMinus && quantityInput) {
    quantityMinus.addEventListener('click', function() {
      const currentValue = parseInt(quantityInput.value);
      if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
      }
    });
  }
  
  if (quantityPlus && quantityInput) {
    quantityPlus.addEventListener('click', function() {
      const currentValue = parseInt(quantityInput.value);
      quantityInput.value = currentValue + 1;
    });
  }
  
  // Add to cart form submission
  const quickViewForm = document.getElementById('quick-view-product-form');
  if (quickViewForm) {
    quickViewForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      const variantId = document.getElementById('quick-view-product-id').value;
      const quantity = document.getElementById('quick-view-quantity').value;
      
      if (!variantId) {
        showQuickViewError('Please select a product option');
        return;
      }
      
      addToCartFromQuickView(variantId, quantity);
    });
  }
  
  // Variant selector change
  const variantSelector = document.getElementById('quick-view-variant-selector');
  if (variantSelector) {
    variantSelector.addEventListener('change', function() {
      updateQuickViewVariant(this.value);
    });
  }
  
  // Add to wishlist button
  const wishlistButton = document.getElementById('quick-view-add-to-wishlist');
  if (wishlistButton) {
    wishlistButton.addEventListener('click', function() {
      const productHandle = this.getAttribute('data-product-handle');
      if (productHandle) {
        toggleWishlist(productHandle);
      }
    });
  }
}

/**
 * Initialize quick view buttons
 * This function can be called after DOM updates (e.g., after loading more products via AJAX)
 */
function initQuickViewButtons() {
  quickViewButtons = document.querySelectorAll('[data-quick-view]');
  
  if (quickViewButtons.length > 0) {
    quickViewButtons.forEach(button => {
      // Remove existing event listeners to prevent duplicates
      button.removeEventListener('click', handleQuickViewClick);
      // Add event listener
      button.addEventListener('click', handleQuickViewClick);
    });
  }
}

/**
 * Handle quick view button click
 * @param {Event} event - The click event
 */
function handleQuickViewClick(event) {
  event.preventDefault();
  
  const productHandle = this.getAttribute('data-product-handle');
  if (!productHandle) return;
  
  openQuickView(productHandle);
}

/**
 * Open quick view modal for a product
 * @param {string} productHandle - The product handle
 */
function openQuickView(productHandle) {
  if (!productHandle || !quickViewModal || !quickViewLoading || !quickViewContent) return;
  
  // Show modal and loading state
  quickViewModal.classList.remove('hidden');
  quickViewLoading.classList.remove('hidden');
  quickViewContent.classList.add('hidden');
  
  // Prevent body scrolling
  document.body.style.overflow = 'hidden';
  
  // Fetch product data
  fetch(`/products/${productHandle}.js`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Product not found');
      }
      return response.json();
    })
    .then(product => {
      populateQuickView(product);
      
      // Hide loading, show content
      quickViewLoading.classList.add('hidden');
      quickViewContent.classList.remove('hidden');
    })
    .catch(error => {
      console.error('Error loading product:', error);
      closeQuickView();
      showToast('Error loading product details', 'error');
    });
}

/**
 * Close quick view modal
 */
function closeQuickView() {
  if (!quickViewModal) return;
  
  quickViewModal.classList.add('hidden');
  
  // Re-enable body scrolling
  document.body.style.overflow = '';
}

/**
 * Populate quick view modal with product data
 * @param {Object} product - The product data
 */
function populateQuickView(product) {
  // Cache DOM elements for better performance
  const elements = {
    image: document.getElementById('quick-view-product-image'),
    title: document.getElementById('quick-view-product-title'),
    price: document.getElementById('quick-view-product-price'),
    comparePrice: document.getElementById('quick-view-product-compare-price'),
    badge: document.getElementById('quick-view-product-badge'),
    description: document.getElementById('quick-view-product-description'),
    variantSelector: document.getElementById('quick-view-variant-selector'),
    variantsContainer: document.getElementById('quick-view-product-variants'),
    productId: document.getElementById('quick-view-product-id'),
    viewDetailsLink: document.getElementById('quick-view-view-details'),
    wishlistButton: document.getElementById('quick-view-add-to-wishlist'),
    addToCartButton: document.getElementById('quick-view-add-to-cart')
  };
  
  // Set product image
  if (elements.image) {
    const imageUrl = product.featured_image || product.images[0];
    elements.image.src = imageUrl;
    elements.image.alt = product.title;
  }
  
  // Set product title
  if (elements.title) {
    elements.title.textContent = product.title;
  }
  
  // Set product price
  if (elements.price) {
    elements.price.textContent = formatMoney(product.price);
  }
  
  // Set compare at price if on sale
  if (elements.comparePrice) {
    const isOnSale = product.compare_at_price && product.compare_at_price > product.price;
    
    if (isOnSale) {
      elements.comparePrice.textContent = formatMoney(product.compare_at_price);
      elements.comparePrice.classList.remove('hidden');
      
      // Show sale badge
      if (elements.badge) {
        elements.badge.innerHTML = '<span class="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/10">Sale</span>';
        elements.badge.classList.remove('hidden');
      }
    } else {
      elements.comparePrice.classList.add('hidden');
      
      // Hide sale badge
      if (elements.badge) {
        elements.badge.classList.add('hidden');
      }
    }
  }
  
  // Set product description
  if (elements.description) {
    // Truncate description if too long
    let description = product.description;
    if (description && description.length > 300) {
      description = description.substring(0, 300) + '...';
    }
    elements.description.innerHTML = description || '';
  }
  
  // Set product variants
  if (elements.variantSelector && elements.variantsContainer) {
    if (product.variants.length > 1) {
      // Use document fragment for better performance
      const fragment = document.createDocumentFragment();
      
      // Add options for each variant
      product.variants.forEach(variant => {
        const option = document.createElement('option');
        option.value = variant.id;
        option.textContent = variant.title;
        option.dataset.price = variant.price;
        option.dataset.compareAtPrice = variant.compare_at_price || '';
        option.dataset.available = variant.available;
        fragment.appendChild(option);
      });
      
      // Clear existing options and append new ones
      elements.variantSelector.innerHTML = '';
      elements.variantSelector.appendChild(fragment);
      
      // Show variants selector
      elements.variantsContainer.classList.remove('hidden');
      
      // Set initial variant
      if (elements.productId) {
        elements.productId.value = product.variants[0].id;
      }
    } else {
      // Hide variants selector for single variant products
      elements.variantsContainer.classList.add('hidden');
      
      // Set product ID to the only variant
      if (elements.productId && product.variants[0]) {
        elements.productId.value = product.variants[0].id;
      }
    }
  }
  
  // Set view details link
  if (elements.viewDetailsLink) {
    elements.viewDetailsLink.href = `/products/${product.handle}`;
  }
  
  // Set wishlist button data
  if (elements.wishlistButton) {
    elements.wishlistButton.setAttribute('data-product-handle', product.handle);
    
    // Check if product is in wishlist
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const svg = elements.wishlistButton.querySelector('svg');
    
    if (wishlist.includes(product.handle)) {
      elements.wishlistButton.classList.add('active');
      if (svg) svg.classList.add('text-olive-verde', 'fill-current');
    } else {
      elements.wishlistButton.classList.remove('active');
      if (svg) svg.classList.remove('text-olive-verde', 'fill-current');
    }
  }
  
  // Check availability
  if (elements.addToCartButton) {
    if (!product.available) {
      elements.addToCartButton.textContent = 'Sold Out';
      elements.addToCartButton.disabled = true;
      elements.addToCartButton.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
      elements.addToCartButton.innerHTML = `
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
        </svg>
        Add to Cart
      `;
      elements.addToCartButton.disabled = false;
      elements.addToCartButton.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }
}

/**
 * Update quick view when variant is changed
 * @param {string} variantId - The selected variant ID
 */
function updateQuickViewVariant(variantId) {
  // Cache DOM elements for better performance
  const elements = {
    variantSelector: document.getElementById('quick-view-variant-selector'),
    productId: document.getElementById('quick-view-product-id'),
    price: document.getElementById('quick-view-product-price'),
    comparePrice: document.getElementById('quick-view-product-compare-price'),
    badge: document.getElementById('quick-view-product-badge'),
    addToCartButton: document.getElementById('quick-view-add-to-cart')
  };
  
  if (!elements.variantSelector) return;
  
  // Find the selected option
  const selectedOption = elements.variantSelector.querySelector(`option[value="${variantId}"]`);
  if (!selectedOption) return;
  
  // Update product ID
  if (elements.productId) {
    elements.productId.value = variantId;
  }
  
  // Get variant data
  const price = selectedOption.dataset.price;
  const compareAtPrice = selectedOption.dataset.compareAtPrice;
  const available = selectedOption.dataset.available === 'true';
  const isOnSale = compareAtPrice && parseInt(compareAtPrice) > parseInt(price);
  
  // Update price
  if (elements.price) {
    elements.price.textContent = formatMoney(price);
  }
  
  // Update compare at price
  if (elements.comparePrice) {
    if (isOnSale) {
      elements.comparePrice.textContent = formatMoney(compareAtPrice);
      elements.comparePrice.classList.remove('hidden');
      
      // Show sale badge
      if (elements.badge) {
        elements.badge.innerHTML = '<span class="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/10">Sale</span>';
        elements.badge.classList.remove('hidden');
      }
    } else {
      elements.comparePrice.classList.add('hidden');
      
      // Hide sale badge
      if (elements.badge) {
        elements.badge.classList.add('hidden');
      }
    }
  }
  
  // Update availability
  if (elements.addToCartButton) {
    if (!available) {
      elements.addToCartButton.textContent = 'Sold Out';
      elements.addToCartButton.disabled = true;
      elements.addToCartButton.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
      elements.addToCartButton.innerHTML = `
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
        </svg>
        Add to Cart
      `;
      elements.addToCartButton.disabled = false;
      elements.addToCartButton.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }
}

/**
 * Add to cart from quick view
 * @param {string} variantId - The variant ID to add
 * @param {number} quantity - The quantity to add
 */
function addToCartFromQuickView(variantId, quantity = 1) {
  const addToCartButton = document.getElementById('quick-view-add-to-cart');
  if (!addToCartButton) return;
  
  const originalButtonHtml = addToCartButton.innerHTML;
  
  // Show loading state
  addToCartButton.innerHTML = '<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';
  addToCartButton.disabled = true;
  
  const data = {
    id: variantId,
    quantity: quantity
  };
  
  // Use a single fetch call with Promise chaining for better performance
  fetch('/cart/add.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
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
    addToCartButton.innerHTML = originalButtonHtml;
    addToCartButton.disabled = false;
    
    // Close quick view
    closeQuickView();
    
    // Show success message
    showToast('Product added to cart', 'success');
    
    // Update cart count
    updateCartCount();
  })
  .catch(error => {
    console.error('Error adding to cart:', error);
    
    // Reset button
    addToCartButton.innerHTML = originalButtonHtml;
    addToCartButton.disabled = false;
    
    // Show error message
    showQuickViewError(error.message || 'Error adding to cart');
  });
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
        element.classList.toggle('hidden', cart.item_count === 0);
      });
    })
    .catch(error => {
      console.error('Error fetching cart:', error);
    });
}

/**
 * Show error message in quick view
 * @param {string} message - The error message
 */
function showQuickViewError(message) {
  const errorElement = document.getElementById('quick-view-error-message');
  if (!errorElement) return;
  
  errorElement.textContent = message;
  errorElement.classList.remove('hidden');
  
  // Use a debounced timeout to hide the error message
  clearTimeout(errorElement.hideTimeout);
  errorElement.hideTimeout = setTimeout(() => {
    errorElement.classList.add('hidden');
  }, 5000);
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
  
  // Use memoization for the formatter to improve performance
  if (!window.moneyFormatter) {
    window.moneyFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    });
  }
  
  return window.moneyFormatter.format(value);
}

// Export functions for global use
window.initQuickViewButtons = initQuickViewButtons;
window.openQuickView = openQuickView;
window.closeQuickView = closeQuickView;
window.updateCartCount = updateCartCount;